import { logoutUser, requireAuthenticatedUser } from "./auth.js";
import { db, storage } from "./firebase-config.js";
import { getUserDocument } from "./firestore.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getDownloadURL,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const authPath = "auth.html";
const studentDashboardPath = "dashboard.html";
const countCollections = [];
let allUsers = [];
let allRoadmaps = [];
let allOpportunities = [];
let activeAdmin = null;
const contentState = {};

const contentModules = {
  resources: {
    singular: "Resource",
    plural: "Resources",
    tableColumns: ["title", "programme", "level", "category", "resourceType", "status", "createdAt"],
    colspan: 8
  },
  stories: {
    singular: "Story",
    plural: "Stories",
    tableColumns: ["title", "category", "author", "status", "createdAt"],
    colspan: 6
  },
  events: {
    singular: "Event",
    plural: "Events",
    tableColumns: ["title", "eventDate", "venue", "host", "status", "createdAt"],
    colspan: 7
  },
  community: {
    singular: "Community item",
    plural: "Community items",
    tableColumns: ["title", "author", "category", "status", "createdAt"],
    colspan: 6
  },
  marketplace: {
    singular: "Listing",
    plural: "Marketplace listings",
    tableColumns: ["title", "seller", "category", "price", "status", "createdAt"],
    colspan: 7
  },
  announcements: {
    singular: "Announcement",
    plural: "Announcements",
    tableColumns: ["title", "audience", "status", "createdAt"],
    colspan: 5
  }
};

function byId(id) {
  return document.getElementById(id);
}

function text(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function clean(value, fallback = "Not added") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanFilterValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeForCompare(value) {
  return cleanFilterValue(value).toLowerCase();
}

function formatDateJoined(value) {
  if (!value) return "Not available";

  const date = typeof value.toDate === "function"
    ? value.toDate()
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function toDate(value) {
  if (!value) return null;
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatListValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not added";
  }

  return clean(value);
}

function parseListInput(value) {
  if (typeof value !== "string") return [];

  return value
    .split(/[\n,]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function getUserRole(profile) {
  return typeof profile?.role === "string" && profile.role.trim()
    ? profile.role.trim().toLowerCase()
    : "student";
}

function setStatus(message, tone = "info") {
  const status = document.querySelector("[data-admin-status]");
  if (!status) return;
  status.dataset.tone = tone;
  status.innerHTML = `<strong>${message}</strong><span>Only approved admin accounts can use this dashboard.</span>`;
}

async function requireAdminAccess() {
  const user = await requireAuthenticatedUser(authPath);
  if (!user) return null;

  console.info("[Admin] Firebase user authenticated", {
    uid: user.uid,
    email: user.email
  });

  let profile;
  try {
    profile = await getUserDocument(user.uid);
    console.info("[Admin] Admin profile loaded", {
      path: `users/${user.uid}`,
      exists: Boolean(profile),
      role: profile ? profile.role : "missing; treated as student"
    });
  } catch (error) {
    console.error("[Admin] Admin profile read failed", {
      path: `users/${user.uid}`,
      code: error.code,
      message: error.message,
      error
    });
    setStatus("Admin profile could not be verified.", "error");
    window.location.replace(studentDashboardPath);
    return null;
  }

  const role = getUserRole(profile);
  if (role === "admin") {
    text("[data-admin-name]", clean(profile.fullName || user.displayName, "Admin"));
    text("[data-admin-email]", clean(profile.email || user.email, "Admin account"));
    setStatus("Admin access verified.", "success");
    console.info("[Admin] Access granted", {
      uid: user.uid,
      email: user.email,
      role
    });
    return { user, profile };
  }

  if (role === "student") {
    console.warn("[Admin] Access denied", {
      uid: user.uid,
      email: user.email,
      role
    });
    window.location.replace(studentDashboardPath);
    return null;
  }

  console.warn("[Admin] Access denied because role is unsupported", {
    uid: user.uid,
    email: user.email,
    role: profile ? profile.role : "missing"
  });
  window.location.replace(studentDashboardPath);
  return null;
}

function setupSectionNavigation() {
  const links = document.querySelectorAll("[data-admin-section-link]");
  const sections = document.querySelectorAll("[data-admin-section]");

  function activate(sectionName) {
    sections.forEach(section => section.classList.toggle("is-active", section.dataset.adminSection === sectionName));
    links.forEach(link => link.classList.toggle("active", link.dataset.adminSectionLink === sectionName));
  }

  links.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const sectionName = link.dataset.adminSectionLink;
      history.replaceState(null, "", `#${sectionName}`);
      activate(sectionName);
    });
  });

  const initialSection = window.location.hash.replace("#", "") || "dashboard";
  activate(initialSection);
}

async function loadCollectionCount(collectionName) {
  const counter = document.querySelector(`[data-count="${collectionName}"]`);
  if (!counter) return;

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    counter.textContent = String(snapshot.size);
    counter.removeAttribute("title");
  } catch (error) {
    counter.textContent = "0";
    counter.title = "This count could not be loaded yet.";
    console.error("[Admin] Failed to count collection", {
      collection: collectionName,
      code: error.code,
      message: error.message
    });
  }
}

function renderStudents(users) {
  const tableBody = byId("adminStudentsTable");
  if (!tableBody) return;

  if (!users.length) {
    tableBody.innerHTML = '<tr><td colspan="9">No registered users match these filters.</td></tr>';
    return;
  }

  tableBody.replaceChildren();
  users.forEach(user => {
    const row = document.createElement("tr");
    const cells = [
      clean(user.fullName, "Student"),
      clean(user.email, "No email"),
      clean(user.university),
      clean(user.programme),
      clean(user.level),
      clean(user.country),
      clean(user.role, "student"),
      formatDateJoined(user.createdAt)
    ];

    cells.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const actionCell = document.createElement("td");
    const viewButton = document.createElement("button");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    const manageButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.textContent = "View";
    viewButton.addEventListener("click", () => renderStudentProfile(user));
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.disabled = true;
    editButton.title = "Edit user will be enabled in a future update.";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.disabled = true;
    deleteButton.title = "Delete user will be enabled in a future update.";
    actionCell.className = "admin-table-actions";
    actionCell.append(viewButton, editButton, deleteButton);
    row.append(actionCell);
    tableBody.append(row);
  });
}

function renderStudentProfile(user) {
  const panel = byId("adminStudentProfile");
  if (!panel) return;

  const label = document.createElement("span");
  const name = document.createElement("h3");
  const email = document.createElement("p");
  const details = document.createElement("dl");
  const fields = [
    ["University", clean(user.university)],
    ["Programme", clean(user.programme)],
    ["Level", clean(user.level)],
    ["Country", clean(user.country)],
    ["Role", clean(user.role, "student")],
    ["Date Joined", formatDateJoined(user.createdAt)]
  ];

  label.textContent = "Student Profile";
  name.textContent = clean(user.fullName, "Student");
  email.textContent = clean(user.email, "No email");

  fields.forEach(([term, value]) => {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    wrapper.append(dt, dd);
    details.append(wrapper);
  });

  panel.replaceChildren(label, name, email, details);
}

function applyStudentFilters() {
  const search = byId("adminStudentSearch")?.value.trim().toLowerCase() || "";
  const university = byId("adminUniversityFilter")?.value || "all";
  const programme = byId("adminProgrammeFilter")?.value || "all";
  const level = byId("adminLevelFilter")?.value || "all";
  const country = byId("adminCountryFilter")?.value || "all";

  const filtered = allUsers.filter(user => {
    const searchable = [
      user.fullName,
      user.email
    ].join(" ").toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    const matchesUniversity = university === "all" || normalizeForCompare(user.university) === university;
    const matchesProgramme = programme === "all" || normalizeForCompare(user.programme) === programme;
    const matchesLevel = level === "all" || normalizeForCompare(user.level) === level;
    const matchesCountry = country === "all" || normalizeForCompare(user.country) === country;
    return matchesSearch && matchesUniversity && matchesProgramme && matchesLevel && matchesCountry;
  });

  renderStudents(filtered);
}

function populateSelectFilter(selectId, values, allLabel) {
  const select = byId(selectId);
  if (!select) return;

  const currentValue = select.value;
  select.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = allLabel;
  select.append(allOption);

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value.toLowerCase();
    option.textContent = value;
    select.append(option);
  });

  select.value = [...select.options].some(option => option.value === currentValue) ? currentValue : "all";
}

function uniqueUserValues(field) {
  return [...new Set(allUsers.map(user => cleanFilterValue(user[field])).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

function populateStudentFilters() {
  populateSelectFilter("adminUniversityFilter", uniqueUserValues("university"), "All universities");
  populateSelectFilter("adminProgrammeFilter", uniqueUserValues("programme"), "All programmes");
  populateSelectFilter("adminLevelFilter", uniqueUserValues("level"), "All levels");
  populateSelectFilter("adminCountryFilter", uniqueUserValues("country"), "All countries");
}

function updateStudentTotals() {
  const total = String(allUsers.length);
  text("[data-student-total]", total);
  text('[data-count="users"]', total);
}

function setStudentTableMessage(message) {
  const tableBody = byId("adminStudentsTable");
  if (tableBody) tableBody.innerHTML = `<tr><td colspan="9">${message}</td></tr>`;
}

function setStudentProfileMessage(title, message) {
  const panel = byId("adminStudentProfile");
  if (!panel) return;
  const label = document.createElement("span");
  const heading = document.createElement("h3");
  const body = document.createElement("p");
  label.textContent = "Student Profile";
  heading.textContent = title;
  body.textContent = message;
  panel.replaceChildren(label, heading, body);
}

function friendlyStudentLoadError(error) {
  if (error?.code === "permission-denied") {
    return "Users could not be loaded because admin list access is blocked. Publish the Firestore rules that allow role = admin to read registered accounts.";
  }

  if (error?.code === "unavailable" || error?.message?.toLowerCase().includes("network")) {
    return "Users could not be loaded because the network is unavailable. Please check your connection and try again.";
  }

  return "Users could not be loaded right now. Please refresh or try again shortly.";
}

async function loadStudents(adminContext) {
  setStudentTableMessage("Loading registered users...");
  setStudentProfileMessage("Loading users", "Select a student after the registered accounts finish loading.");

  try {
    const adminRole = getUserRole(adminContext?.profile);
    if (adminRole !== "admin") {
      throw Object.assign(new Error("Current account is not approved for user management."), {
        code: "permission-denied"
      });
    }

    console.info("[Admin] Loading registered users", {
      collection: "users",
      adminUid: adminContext.user.uid,
      adminRole
    });

    const usersQuery = query(collection(db, "users"));
    const snapshot = await getDocs(usersQuery);
    allUsers = snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      }))
      .sort((a, b) => clean(a.fullName, "Student").localeCompare(clean(b.fullName, "Student")));

    updateStudentTotals();
    populateStudentFilters();
    renderStudents(allUsers);
    setStudentProfileMessage("Select a student", "Profile details will appear here.");

    console.info("[Admin] Registered users loaded", {
      count: allUsers.length
    });
  } catch (error) {
    allUsers = [];
    updateStudentTotals();
    populateStudentFilters();
    const message = friendlyStudentLoadError(error);
    setStudentTableMessage(message);
    setStudentProfileMessage("Users unavailable", "Once admin access rules are published, registered user profiles will appear here.");
    console.error("[Admin] Failed to load users", {
      code: error.code,
      message: error.message,
      details: error
    });
  }
}

function setupStudentControls() {
  byId("adminStudentSearch")?.addEventListener("input", applyStudentFilters);
  byId("adminUniversityFilter")?.addEventListener("change", applyStudentFilters);
  byId("adminProgrammeFilter")?.addEventListener("change", applyStudentFilters);
  byId("adminLevelFilter")?.addEventListener("change", applyStudentFilters);
  byId("adminCountryFilter")?.addEventListener("change", applyStudentFilters);
}

function setRoadmapFeedback(message, tone = "info") {
  const feedback = document.querySelector("[data-roadmap-feedback]");
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function setRoadmapFormVisible(isVisible) {
  const panel = document.querySelector("[data-roadmap-form-panel]");
  if (!panel) return;
  panel.hidden = !isVisible;
  if (isVisible) panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setRoadmapSubmitState(isSaving) {
  const button = document.querySelector("[data-roadmap-submit]");
  if (!button) return;

  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent.trim();
  }

  button.disabled = isSaving;
  button.textContent = isSaving ? "Saving..." : button.dataset.defaultText;
}

function resetRoadmapForm() {
  const form = byId("adminRoadmapForm");
  if (!form) return;

  form.reset();
  byId("roadmapId").value = "";
  const submitButton = document.querySelector("[data-roadmap-submit]");
  if (submitButton) submitButton.textContent = "Save Roadmap";
}

function readRoadmapForm() {
  const description = byId("roadmapDescription")?.value.trim() || "";
  return {
    programme: byId("roadmapProgramme")?.value.trim() || "",
    level: byId("roadmapLevel")?.value.trim() || "",
    title: byId("roadmapTitle")?.value.trim() || "",
    shortDescription: description,
    description,
    learningObjectives: parseListInput(byId("roadmapObjectives")?.value || ""),
    skills: parseListInput(byId("roadmapSkills")?.value || ""),
    resources: parseListInput(byId("roadmapResources")?.value || ""),
    estimatedDuration: byId("roadmapDuration")?.value.trim() || "",
    difficulty: byId("roadmapDifficulty")?.value || "Beginner",
    status: byId("roadmapStatus")?.value === "Published" ? "Published" : "Draft"
  };
}

function updateRoadmapCount() {
  const publishedCount = allRoadmaps.filter(roadmap => clean(roadmap.status, "Draft") === "Published").length;
  const draftCount = allRoadmaps.filter(roadmap => clean(roadmap.status, "Draft") !== "Published").length;
  text('[data-count="roadmaps"]', String(allRoadmaps.length));
  text('[data-count="roadmaps-published"]', String(publishedCount));
  text('[data-count="roadmaps-draft"]', String(draftCount));
}

function renderRoadmaps(roadmaps) {
  const tableBody = byId("adminRoadmapsTable");
  if (!tableBody) return;

  if (!roadmaps.length) {
    tableBody.innerHTML = '<tr><td colspan="6">No roadmaps have been created yet.</td></tr>';
    return;
  }

  tableBody.replaceChildren();
  roadmaps.forEach(roadmap => {
    const row = document.createElement("tr");
    const cells = [
      clean(roadmap.title, "Untitled roadmap"),
      clean(roadmap.programme),
      clean(roadmap.level),
      clean(roadmap.status, "Draft"),
      formatDateJoined(roadmap.updatedAt || roadmap.createdAt)
    ];

    cells.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const actionCell = document.createElement("td");
    const editButton = document.createElement("button");
    const publishButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => loadRoadmapIntoForm(roadmap));

    publishButton.type = "button";
    publishButton.textContent = clean(roadmap.status, "Draft") === "Published" ? "Published" : "Publish";
    publishButton.disabled = clean(roadmap.status, "Draft") === "Published";
    publishButton.addEventListener("click", () => publishRoadmap(roadmap.id));

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteRoadmap(roadmap));

    manageButton.type = "button";
    manageButton.textContent = "Manage";
    manageButton.dataset.manageRoadmap = roadmap.id;
    manageButton.dataset.roadmapTitle = clean(roadmap.title, "Roadmap");

    actionCell.className = "admin-table-actions";
    actionCell.append(manageButton, editButton, publishButton, deleteButton);
    row.append(actionCell);
    tableBody.append(row);
  });
}

function loadRoadmapIntoForm(roadmap) {
  byId("roadmapId").value = roadmap.id;
  byId("roadmapProgramme").value = clean(roadmap.programme, "");
  byId("roadmapLevel").value = clean(roadmap.level, "");
  byId("roadmapTitle").value = clean(roadmap.title, "");
  byId("roadmapDescription").value = clean(roadmap.shortDescription || roadmap.description, "");
  byId("roadmapObjectives").value = Array.isArray(roadmap.learningObjectives) ? roadmap.learningObjectives.join("\n") : clean(roadmap.learningObjectives, "");
  byId("roadmapSkills").value = Array.isArray(roadmap.skills) ? roadmap.skills.join("\n") : clean(roadmap.skills, "");
  byId("roadmapResources").value = Array.isArray(roadmap.resources) ? roadmap.resources.join("\n") : clean(roadmap.resources, "");
  byId("roadmapDuration").value = clean(roadmap.estimatedDuration, "");
  byId("roadmapDifficulty").value = ["Beginner", "Intermediate", "Advanced"].includes(roadmap.difficulty) ? roadmap.difficulty : "Beginner";
  byId("roadmapStatus").value = clean(roadmap.status, "Draft") === "Published" ? "Published" : "Draft";

  const submitButton = document.querySelector("[data-roadmap-submit]");
  if (submitButton) submitButton.textContent = "Update Roadmap";
  setRoadmapFormVisible(true);
  setRoadmapFeedback(`Editing ${clean(roadmap.title, "selected roadmap")}.`);
}

async function saveRoadmap(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const roadmapId = byId("roadmapId")?.value || "";
  const roadmapData = readRoadmapForm();
  setRoadmapSubmitState(true);
  setRoadmapFeedback(roadmapId ? "Updating roadmap..." : "Creating roadmap...");

  try {
    if (roadmapId) {
      await updateDoc(doc(db, "roadmaps", roadmapId), {
        ...roadmapData,
        updatedAt: serverTimestamp()
      });
      setRoadmapFeedback("Roadmap updated successfully.", "success");
    } else {
      await addDoc(collection(db, "roadmaps"), {
        ...roadmapData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setRoadmapFeedback("Roadmap created successfully.", "success");
    }

    resetRoadmapForm();
    setRoadmapFormVisible(false);
    await loadRoadmaps();
  } catch (error) {
    setRoadmapFeedback("Roadmap could not be saved. Please check admin access.", "error");
    console.error("[Admin] Failed to save roadmap", {
      code: error.code,
      message: error.message,
      error
    });
  } finally {
    setRoadmapSubmitState(false);
  }
}

async function publishRoadmap(roadmapId) {
  if (!roadmapId) return;

  try {
    await updateDoc(doc(db, "roadmaps", roadmapId), {
      status: "Published",
      updatedAt: serverTimestamp()
    });
    setRoadmapFeedback("Roadmap published successfully.", "success");
    await loadRoadmaps();
  } catch (error) {
    setRoadmapFeedback("Roadmap could not be published. Please check admin access.", "error");
    console.error("[Admin] Failed to publish roadmap", {
      roadmapId,
      code: error.code,
      message: error.message,
      error
    });
  }
}

async function deleteRoadmap(roadmap) {
  const title = clean(roadmap.title, "this roadmap");
  const confirmed = window.confirm(`Permanently delete "${title}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    const relatedCollections = ["roadmapStages", "roadmapLessons", "skills", "studentProgress"];
    const relatedSnapshots = await Promise.all(relatedCollections.map(name => getDocs(query(collection(db, name), where("roadmapId", "==", roadmap.id)))));
    const batch = writeBatch(db);
    relatedSnapshots.forEach(snapshot => snapshot.docs.forEach(item => batch.delete(item.ref)));
    await batch.commit();
    await deleteDoc(doc(db, "roadmaps", roadmap.id));
    setRoadmapFeedback("Roadmap deleted successfully.", "success");
    await loadRoadmaps();
  } catch (error) {
    setRoadmapFeedback("Roadmap could not be deleted. Please check admin access.", "error");
    console.error("[Admin] Failed to delete roadmap", {
      roadmapId: roadmap.id,
      code: error.code,
      message: error.message,
      error
    });
  }
}

async function loadRoadmaps() {
  const tableBody = byId("adminRoadmapsTable");
  if (tableBody) tableBody.innerHTML = '<tr><td colspan="6">Loading roadmaps...</td></tr>';

  try {
    const snapshot = await getDocs(collection(db, "roadmaps"));
    allRoadmaps = snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      }))
      .sort((a, b) => {
        const bDate = toDate(b.updatedAt || b.createdAt)?.getTime() || 0;
        const aDate = toDate(a.updatedAt || a.createdAt)?.getTime() || 0;
        return bDate - aDate || clean(a.title).localeCompare(clean(b.title));
      });

    updateRoadmapCount();
    renderRoadmaps(allRoadmaps);
    setRoadmapFeedback(allRoadmaps.length ? "Roadmaps loaded successfully." : "No roadmaps have been created yet.");
  } catch (error) {
    allRoadmaps = [];
    updateRoadmapCount();
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="6">Roadmaps could not be loaded. Please check admin access.</td></tr>';
    setRoadmapFeedback("Roadmaps could not be loaded. Please check admin access.", "error");
    console.error("[Admin] Failed to load roadmaps", {
      code: error.code,
      message: error.message
    });
  }
}

function setupRoadmapControls() {
  byId("adminRoadmapForm")?.addEventListener("submit", saveRoadmap);
  document.querySelector("[data-roadmap-create-button]")?.addEventListener("click", () => {
    resetRoadmapForm();
    setRoadmapFormVisible(true);
    setRoadmapFeedback("Create a new roadmap and save it to your content library.");
  });
  document.querySelector("[data-roadmap-cancel]")?.addEventListener("click", () => {
    resetRoadmapForm();
    setRoadmapFormVisible(false);
    setRoadmapFeedback("Roadmap editing cancelled.");
  });
  document.querySelectorAll("[data-roadmap-table-focus]").forEach(button => {
    button.addEventListener("click", () => {
      byId("adminRoadmapsTable")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setRoadmapFeedback("Use the action buttons beside each roadmap.");
    });
  });
}

function setOpportunityFeedback(message, tone = "info") {
  const feedback = document.querySelector("[data-opportunity-feedback]");
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function setOpportunityFormVisible(isVisible) {
  const panel = document.querySelector("[data-opportunity-form-panel]");
  if (!panel) return;
  panel.hidden = !isVisible;
  if (isVisible) panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setOpportunitySubmitState(isSaving) {
  const button = document.querySelector("[data-opportunity-submit]");
  if (!button) return;

  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent.trim();
  }

  button.disabled = isSaving;
  button.textContent = isSaving ? "Saving..." : button.dataset.defaultText;
}

function resetOpportunityForm() {
  const form = byId("adminOpportunityForm");
  if (!form) return;

  form.reset();
  byId("opportunityId").value = "";
  const submitButton = document.querySelector("[data-opportunity-submit]");
  if (submitButton) submitButton.textContent = "Save Opportunity";
}

function readOpportunityForm() {
  return {
    title: byId("opportunityTitle")?.value.trim() || "",
    type: byId("opportunityType")?.value.trim() || "",
    opportunityType: byId("opportunityType")?.value.trim() || "",
    organization: byId("opportunityOrganization")?.value.trim() || "",
    eligibility: byId("opportunityEligibility")?.value.trim() || "",
    programme: byId("opportunityProgramme")?.value.trim() || "All Programmes",
    level: byId("opportunityLevel")?.value.trim() || "All Levels",
    country: byId("opportunityCountry")?.value.trim() || "",
    location: byId("opportunityLocation")?.value.trim() || "",
    deadline: byId("opportunityDeadline")?.value || "",
    link: byId("opportunityLink")?.value.trim() || "",
    applicationLink: byId("opportunityLink")?.value.trim() || "",
    coverImage: byId("opportunityCoverImage")?.value.trim() || "",
    featured: byId("opportunityFeatured")?.value === "Yes",
    description: byId("opportunityDescription")?.value.trim() || "",
    status: ["Draft", "Published", "Closed"].includes(byId("opportunityStatus")?.value) ? byId("opportunityStatus").value : "Draft"
  };
}

function updateOpportunityCount() {
  text('[data-count="opportunities"]', String(allOpportunities.length));
}

function renderOpportunities(opportunities) {
  const tableBody = byId("adminOpportunitiesTable");
  if (!tableBody) return;

  if (!opportunities.length) {
    tableBody.innerHTML = '<tr><td colspan="8">No opportunities have been created yet.</td></tr>';
    return;
  }

  tableBody.replaceChildren();
  opportunities.forEach(opportunity => {
    const row = document.createElement("tr");
    const cells = [
      clean(opportunity.title, "Untitled opportunity"),
      clean(opportunity.organization),
      clean(opportunity.opportunityType || opportunity.type),
      clean(opportunity.programme, "All Programmes"),
      clean(opportunity.level, "All Levels"),
      clean(opportunity.deadline, "No deadline"),
      clean(opportunity.status, "Draft")
    ];

    cells.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const actionCell = document.createElement("td");
    const editButton = document.createElement("button");
    const publishButton = document.createElement("button");
    const closeButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => loadOpportunityIntoForm(opportunity));

    publishButton.type = "button";
    publishButton.textContent = clean(opportunity.status, "Draft") === "Published" ? "Published" : "Publish";
    publishButton.disabled = clean(opportunity.status, "Draft") === "Published";
    publishButton.addEventListener("click", () => publishOpportunity(opportunity.id));

    closeButton.type = "button";
    closeButton.textContent = clean(opportunity.status, "Draft") === "Closed" ? "Closed" : "Close";
    closeButton.disabled = clean(opportunity.status, "Draft") === "Closed";
    closeButton.addEventListener("click", () => closeOpportunity(opportunity.id));

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteOpportunity(opportunity));

    actionCell.className = "admin-table-actions";
    actionCell.append(editButton, publishButton, closeButton, deleteButton);
    row.append(actionCell);
    tableBody.append(row);
  });
}

function loadOpportunityIntoForm(opportunity) {
  byId("opportunityId").value = opportunity.id;
  byId("opportunityTitle").value = clean(opportunity.title, "");
  byId("opportunityType").value = clean(opportunity.opportunityType || opportunity.type, "Internship");
  byId("opportunityOrganization").value = clean(opportunity.organization, "");
  byId("opportunityEligibility").value = clean(opportunity.eligibility, "");
  byId("opportunityProgramme").value = clean(opportunity.programme, "All Programmes");
  byId("opportunityLevel").value = clean(opportunity.level, "All Levels");
  byId("opportunityCountry").value = clean(opportunity.country, "");
  byId("opportunityLocation").value = clean(opportunity.location, "");
  byId("opportunityDeadline").value = clean(opportunity.deadline, "");
  byId("opportunityLink").value = clean(opportunity.applicationLink || opportunity.link, "");
  byId("opportunityCoverImage").value = clean(opportunity.coverImage, "");
  byId("opportunityFeatured").value = opportunity.featured ? "Yes" : "No";
  byId("opportunityDescription").value = clean(opportunity.description, "");
  byId("opportunityStatus").value = ["Draft", "Published", "Closed"].includes(opportunity.status) ? opportunity.status : "Draft";

  const submitButton = document.querySelector("[data-opportunity-submit]");
  if (submitButton) submitButton.textContent = "Update Opportunity";
  setOpportunityFormVisible(true);
  setOpportunityFeedback(`Editing ${clean(opportunity.title, "selected opportunity")}.`);
}

async function saveOpportunity(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const opportunityId = byId("opportunityId")?.value || "";
  const opportunityData = readOpportunityForm();
  setOpportunitySubmitState(true);
  setOpportunityFeedback(opportunityId ? "Updating opportunity..." : "Creating opportunity...");

  try {
    if (opportunityId) {
      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...opportunityData,
        updatedAt: serverTimestamp()
      });
      setOpportunityFeedback("Opportunity updated successfully.", "success");
    } else {
      await addDoc(collection(db, "opportunities"), {
        ...opportunityData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setOpportunityFeedback("Opportunity created successfully.", "success");
    }

    resetOpportunityForm();
    setOpportunityFormVisible(false);
    await loadOpportunities();
  } catch (error) {
    setOpportunityFeedback("Opportunity could not be saved. Please check admin access.", "error");
    console.error("[Admin] Failed to save opportunity", {
      code: error.code,
      message: error.message,
      error
    });
  } finally {
    setOpportunitySubmitState(false);
  }
}

async function publishOpportunity(opportunityId) {
  if (!opportunityId) return;

  try {
    await updateDoc(doc(db, "opportunities", opportunityId), {
      status: "Published",
      updatedAt: serverTimestamp()
    });
    setOpportunityFeedback("Opportunity published successfully.", "success");
    await loadOpportunities();
  } catch (error) {
    setOpportunityFeedback("Opportunity could not be published. Please check admin access.", "error");
    console.error("[Admin] Failed to publish opportunity", {
      opportunityId,
      code: error.code,
      message: error.message,
      error
    });
  }
}

async function closeOpportunity(opportunityId) {
  if (!opportunityId) return;

  try {
    await updateDoc(doc(db, "opportunities", opportunityId), {
      status: "Closed",
      updatedAt: serverTimestamp()
    });
    setOpportunityFeedback("Opportunity closed successfully.", "success");
    await loadOpportunities();
  } catch (error) {
    setOpportunityFeedback("Opportunity could not be closed. Please check admin access.", "error");
    console.error("[Admin] Failed to close opportunity", {
      opportunityId,
      code: error.code,
      message: error.message,
      error
    });
  }
}

async function deleteOpportunity(opportunity) {
  const title = clean(opportunity.title, "this opportunity");
  const confirmed = window.confirm(`Permanently delete "${title}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "opportunities", opportunity.id));
    setOpportunityFeedback("Opportunity deleted successfully.", "success");
    await loadOpportunities();
  } catch (error) {
    setOpportunityFeedback("Opportunity could not be deleted. Please check admin access.", "error");
    console.error("[Admin] Failed to delete opportunity", {
      opportunityId: opportunity.id,
      code: error.code,
      message: error.message,
      error
    });
  }
}

async function loadOpportunities() {
  const tableBody = byId("adminOpportunitiesTable");
  if (tableBody) tableBody.innerHTML = '<tr><td colspan="8">Loading opportunities...</td></tr>';

  try {
    const snapshot = await getDocs(collection(db, "opportunities"));
    allOpportunities = snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      }))
      .sort((a, b) => clean(a.title).localeCompare(clean(b.title)));

    updateOpportunityCount();
    renderOpportunities(allOpportunities);
    setOpportunityFeedback(allOpportunities.length ? "Opportunities loaded successfully." : "No opportunities have been created yet.");
  } catch (error) {
    allOpportunities = [];
    updateOpportunityCount();
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="8">Opportunities could not be loaded. Please check admin access.</td></tr>';
    setOpportunityFeedback("Opportunities could not be loaded. Please check admin access.", "error");
    console.error("[Admin] Failed to load opportunities", {
      code: error.code,
      message: error.message
    });
  }
}

function setupOpportunityControls() {
  byId("adminOpportunityForm")?.addEventListener("submit", saveOpportunity);
  document.querySelector("[data-opportunity-create-button]")?.addEventListener("click", () => {
    resetOpportunityForm();
    setOpportunityFormVisible(true);
    setOpportunityFeedback("Create a new opportunity and save it to your listings library.");
  });
  document.querySelector("[data-opportunity-cancel]")?.addEventListener("click", () => {
    resetOpportunityForm();
    setOpportunityFormVisible(false);
    setOpportunityFeedback("Opportunity editing cancelled.");
  });
  document.querySelectorAll("[data-opportunity-table-focus]").forEach(button => {
    button.addEventListener("click", () => {
      byId("adminOpportunitiesTable")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpportunityFeedback("Use the action buttons beside each opportunity.");
    });
  });
}

function getContentConfig(collectionName) {
  return contentModules[collectionName];
}

function getContentForm(collectionName) {
  return document.querySelector(`[data-content-form="${collectionName}"]`);
}

function setContentFeedback(collectionName, message, tone = "info") {
  const feedback = document.querySelector(`[data-content-feedback="${collectionName}"]`);
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function setContentFormVisible(collectionName, isVisible) {
  const panel = document.querySelector(`[data-content-form-panel="${collectionName}"]`);
  if (!panel) return;
  panel.hidden = !isVisible;
  if (isVisible) panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getContentField(form, field) {
  return form?.querySelector(`[data-field="${field}"]`);
}

function resetContentForm(collectionName) {
  const form = getContentForm(collectionName);
  if (!form) return;
  form.reset();
  if (collectionName === "resources") {
    byId("resourceFile").value = "";
  }
  const idField = getContentField(form, "id");
  if (idField) idField.value = "";
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton && submitButton.dataset.defaultText) {
    submitButton.textContent = submitButton.dataset.defaultText;
  }
}

function readContentForm(collectionName) {
  const form = getContentForm(collectionName);
  const data = {};
  if (!form) return data;

  form.querySelectorAll("[data-field]").forEach(field => {
    if (field.dataset.field === "id") return;
    data[field.dataset.field] = field.value.trim ? field.value.trim() : field.value;
  });

  if (!data.status) data.status = "Draft";
  return data;
}

function selectedResourceFile() {
  const input = byId("resourceFile");
  return input?.files?.[0] || null;
}

function resourceAccessUrl(item) {
  return clean(item.fileUrl, "") || clean(item.externalUrl, "") || clean(item.link, "");
}

async function uploadResourceFile(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `resources/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return {
    fileUrl: await getDownloadURL(snapshot.ref),
    storagePath: path,
    fileName: file.name,
    fileSize: file.size,
    contentType: file.type || ""
  };
}

async function prepareContentData(collectionName, data, existingId = "") {
  if (collectionName !== "resources") return data;

  const file = selectedResourceFile();
  const existingResource = existingId
    ? (contentState.resources || []).find(item => item.id === existingId)
    : null;
  const uploadData = file ? await uploadResourceFile(file) : {};
  const externalUrl = clean(data.externalUrl, "");
  const fileUrl = uploadData.fileUrl || clean(existingResource?.fileUrl, "");

  return {
    ...data,
    type: data.resourceType || data.type || "Link",
    link: fileUrl || externalUrl,
    fileUrl,
    externalUrl,
    thumbnail: clean(data.thumbnail, ""),
    uploadedBy: activeAdmin?.profile?.fullName || activeAdmin?.user?.email || "Admin",
    ...uploadData
  };
}

function setContentSubmitState(collectionName, isSaving) {
  const form = getContentForm(collectionName);
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;

  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent.trim();
  }

  button.disabled = isSaving;
  button.textContent = isSaving ? "Saving..." : button.dataset.defaultText;
}

function updateContentCount(collectionName) {
  const items = contentState[collectionName] || [];
  text(`[data-count="${collectionName}"]`, String(items.length));
}

function formatContentCell(value, field) {
  if (field === "createdAt") return formatDateJoined(value);
  if (field === "resourceType") return clean(value || "Resource");
  if (field === "link" && value) return value;
  return clean(value);
}

function renderContentTable(collectionName, items) {
  const config = getContentConfig(collectionName);
  const tableBody = document.querySelector(`[data-content-table="${collectionName}"]`);
  if (!config || !tableBody) return;

  if (!items.length) {
    tableBody.innerHTML = `<tr><td colspan="${config.colspan}">No ${config.plural.toLowerCase()} have been created yet.</td></tr>`;
    return;
  }

  tableBody.replaceChildren();
  items.forEach(item => {
    const row = document.createElement("tr");

    config.tableColumns.forEach(field => {
      const cell = document.createElement("td");
      cell.textContent = formatContentCell(field === "resourceType" ? item.resourceType || item.type : item[field], field);
      row.append(cell);
    });

    const actionCell = document.createElement("td");
    const editButton = document.createElement("button");
    const publishButton = document.createElement("button");
    const openButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    const status = clean(item.status, "Draft");

    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => loadContentIntoForm(collectionName, item));

    publishButton.type = "button";
    publishButton.textContent = status === "Published" ? "Unpublish" : "Publish";
    publishButton.addEventListener("click", () => publishContent(collectionName, item.id, status === "Published" ? "Draft" : "Published"));

    openButton.type = "button";
    openButton.textContent = "Open";
    openButton.disabled = collectionName !== "resources" || !resourceAccessUrl(item);
    openButton.addEventListener("click", () => {
      const url = resourceAccessUrl(item);
      if (url) window.open(url, "_blank", "noopener");
    });

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteContent(collectionName, item));

    actionCell.className = "admin-table-actions";
    if (collectionName === "resources") {
      actionCell.append(editButton, openButton, publishButton, deleteButton);
    } else {
      actionCell.append(editButton, publishButton, deleteButton);
    }
    row.append(actionCell);
    tableBody.append(row);
  });
}

function loadContentIntoForm(collectionName, item) {
  const config = getContentConfig(collectionName);
  const form = getContentForm(collectionName);
  if (!config || !form) return;

  form.querySelectorAll("[data-field]").forEach(field => {
    const name = field.dataset.field;
    field.value = name === "id" ? item.id : clean(item[name], "");
  });
  if (collectionName === "resources") {
    const resourceType = getContentField(form, "resourceType");
    const externalUrl = getContentField(form, "externalUrl");
    if (resourceType) resourceType.value = clean(item.resourceType || item.type, "PDF");
    if (externalUrl) externalUrl.value = clean(item.externalUrl, "");
    byId("resourceFile").value = "";
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    if (!submitButton.dataset.defaultText) submitButton.dataset.defaultText = submitButton.textContent.trim();
    submitButton.textContent = `Update ${config.singular}`;
  }

  setContentFormVisible(collectionName, true);
  setContentFeedback(collectionName, `Editing ${clean(item.title, `selected ${config.singular.toLowerCase()}`)}.`);
}

async function saveContent(collectionName, event) {
  event.preventDefault();
  const config = getContentConfig(collectionName);
  const form = event.currentTarget;
  if (!config || !form) return;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = getContentField(form, "id")?.value || "";
  const rawData = readContentForm(collectionName);
  setContentSubmitState(collectionName, true);
  setContentFeedback(collectionName, id ? `Updating ${config.singular.toLowerCase()}...` : `Creating ${config.singular.toLowerCase()}...`);

  try {
    const data = await prepareContentData(collectionName, rawData, id);
    if (id) {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      setContentFeedback(collectionName, `${config.singular} updated successfully.`, "success");
    } else {
      await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp()
      });
      setContentFeedback(collectionName, `${config.singular} created successfully.`, "success");
    }

    resetContentForm(collectionName);
    setContentFormVisible(collectionName, false);
    await loadContentCollection(collectionName);
  } catch (error) {
    setContentFeedback(collectionName, `${config.singular} could not be saved. Please check admin access.`, "error");
    console.error(`[Admin] Failed to save ${collectionName}`, {
      code: error.code,
      message: error.message,
      error
    });
  } finally {
    setContentSubmitState(collectionName, false);
  }
}

async function publishContent(collectionName, id, nextStatus = "Published") {
  const config = getContentConfig(collectionName);
  if (!config || !id) return;

  try {
    await updateDoc(doc(db, collectionName, id), {
      status: nextStatus,
      updatedAt: serverTimestamp()
    });
    setContentFeedback(collectionName, `${config.singular} ${nextStatus === "Published" ? "published" : "unpublished"} successfully.`, "success");
    await loadContentCollection(collectionName);
  } catch (error) {
    setContentFeedback(collectionName, `${config.singular} could not be published. Please check admin access.`, "error");
    console.error(`[Admin] Failed to publish ${collectionName}`, {
      id,
      code: error.code,
      message: error.message,
      error
    });
  }
}

async function deleteContent(collectionName, item) {
  const config = getContentConfig(collectionName);
  if (!config || !item?.id) return;

  const confirmed = window.confirm(`Permanently delete "${clean(item.title, config.singular)}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, collectionName, item.id));
    setContentFeedback(collectionName, `${config.singular} deleted successfully.`, "success");
    await loadContentCollection(collectionName);
  } catch (error) {
    setContentFeedback(collectionName, `${config.singular} could not be deleted. Please check admin access.`, "error");
    console.error(`[Admin] Failed to delete ${collectionName}`, {
      id: item.id,
      code: error.code,
      message: error.message,
      error
    });
  }
}

async function loadContentCollection(collectionName) {
  const config = getContentConfig(collectionName);
  const tableBody = document.querySelector(`[data-content-table="${collectionName}"]`);
  if (!config) return;
  if (tableBody) tableBody.innerHTML = `<tr><td colspan="${config.colspan}">Loading ${config.plural.toLowerCase()}...</td></tr>`;

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const items = snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      }))
      .sort((a, b) => clean(a.title).localeCompare(clean(b.title)));

    contentState[collectionName] = items;
    updateContentCount(collectionName);
    renderContentTable(collectionName, items);
    setContentFeedback(collectionName, items.length ? `${config.plural} loaded successfully.` : `No ${config.plural.toLowerCase()} have been created yet.`);
  } catch (error) {
    contentState[collectionName] = [];
    updateContentCount(collectionName);
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="${config.colspan}">${config.plural} could not be loaded. Please check admin access.</td></tr>`;
    setContentFeedback(collectionName, `${config.plural} could not be loaded. Please check admin access.`, "error");
    console.error(`[Admin] Failed to load ${collectionName}`, {
      code: error.code,
      message: error.message
    });
  }
}

function setupContentModules() {
  Object.keys(contentModules).forEach(collectionName => {
    getContentForm(collectionName)?.addEventListener("submit", event => saveContent(collectionName, event));

    document.querySelector(`[data-content-create="${collectionName}"]`)?.addEventListener("click", () => {
      resetContentForm(collectionName);
      setContentFormVisible(collectionName, true);
      setContentFeedback(collectionName, `Create a new ${contentModules[collectionName].singular.toLowerCase()}.`);
    });

    document.querySelector(`[data-content-cancel="${collectionName}"]`)?.addEventListener("click", () => {
      resetContentForm(collectionName);
      setContentFormVisible(collectionName, false);
      setContentFeedback(collectionName, `${contentModules[collectionName].singular} editing cancelled.`);
    });

    document.querySelectorAll(`[data-content-focus="${collectionName}"]`).forEach(button => {
      button.addEventListener("click", () => {
        document.querySelector(`[data-content-table="${collectionName}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setContentFeedback(collectionName, `Use the action buttons beside each ${contentModules[collectionName].singular.toLowerCase()}.`);
      });
    });
  });
}

function renderAdmins() {
  const tableBody = byId("adminAdminsTable");
  if (!tableBody) return;

  const admins = allUsers.filter(user => getUserRole(user) === "admin");
  if (!admins.length) {
    tableBody.innerHTML = '<tr><td colspan="6">No admin accounts found.</td></tr>';
    return;
  }

  tableBody.replaceChildren();
  admins.forEach(admin => {
    const row = document.createElement("tr");
    [
      clean(admin.fullName, "Admin"),
      clean(admin.email, "No email"),
      clean(admin.university),
      clean(admin.country),
      clean(admin.role, "admin"),
      formatDateJoined(admin.createdAt)
    ].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });
    tableBody.append(row);
  });
}

function setupAdminsModule() {
  document.querySelector("[data-admins-refresh]")?.addEventListener("click", () => {
    renderAdmins();
    const feedback = document.querySelector("[data-admins-feedback]");
    if (feedback) feedback.textContent = "Admins refreshed from registered accounts.";
  });
}

async function loadSettings() {
  const feedback = document.querySelector("[data-settings-feedback]");
  try {
    const snapshot = await getDoc(doc(db, "settings", "site"));
    if (snapshot.exists()) {
      const data = snapshot.data();
      byId("settingWebsiteName").value = clean(data.websiteName, "A.E CONNECT SPACE");
      byId("settingContactEmail").value = clean(data.contactEmail, "");
      byId("settingSocialLinks").value = clean(data.socialLinks, "");
      if (feedback) feedback.textContent = "Settings loaded successfully.";
    }
  } catch (error) {
    if (feedback) feedback.textContent = "Settings could not be loaded. Please check admin access.";
    console.error("[Admin] Failed to load settings", {
      code: error.code,
      message: error.message
    });
  }
}

function setupSettingsModule() {
  byId("adminSettingsForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const feedback = document.querySelector("[data-settings-feedback]");
    try {
      await setDoc(doc(db, "settings", "site"), {
        websiteName: byId("settingWebsiteName")?.value.trim() || "A.E CONNECT SPACE",
        contactEmail: byId("settingContactEmail")?.value.trim() || "",
        socialLinks: byId("settingSocialLinks")?.value.trim() || "",
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (feedback) feedback.textContent = "Settings saved successfully.";
    } catch (error) {
      if (feedback) feedback.textContent = "Settings could not be saved. Please check admin access.";
      console.error("[Admin] Failed to save settings", {
        code: error.code,
        message: error.message,
        error
      });
    }
  });
}

function setupAdminActions() {
  document.querySelectorAll("[data-admin-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.adminAction;
      setStatus(`"${action}" is ready for integration.`, "info");
    });
  });

  document.querySelectorAll(".admin-form:not(#adminRoadmapForm):not(#adminOpportunityForm):not([data-content-form]):not(#adminSettingsForm)").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      setStatus("This admin form is ready for integration.", "info");
    });
  });
}

function setupAdminLogout() {
  document.querySelector("[data-admin-logout]")?.addEventListener("click", async event => {
    event.currentTarget.disabled = true;
    await logoutUser();
    localStorage.removeItem("aeConnectAccount");
    localStorage.removeItem("aeConnectSession");
    window.location.replace(authPath);
  });
}

async function bootAdminDashboard() {
  setupSectionNavigation();
  setupStudentControls();
  setupRoadmapControls();
  setupOpportunityControls();
  setupContentModules();
  setupAdminsModule();
  setupSettingsModule();
  setupAdminActions();
  setupAdminLogout();

  const admin = await requireAdminAccess();
  if (!admin) return;
  activeAdmin = admin;

  await loadStudents(admin);
  await loadRoadmaps();
  await loadOpportunities();
  await Promise.all(Object.keys(contentModules).map(loadContentCollection));
  renderAdmins();
  await loadSettings();
  await Promise.all(countCollections.map(loadCollectionCount));
}

bootAdminDashboard();
