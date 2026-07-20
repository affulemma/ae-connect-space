import { loginWithEmail, logoutUser, observeAuthState, registerWithEmail, requireAuthenticatedUser } from "./auth.js";
import { auth, db } from "./firebase-config.js";
import { getUserDocument } from "./firestore.js";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const dashboardPath = "dashboard.html";
const authPath = "auth.html";
let authFlowInProgress = false;
let dashboardUser = null;
let dashboardProfile = {};

function byId(id) {
  return document.getElementById(id);
}

function showMessage(message, type = "success") {
  const authMessage = byId("authMessage");
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.dataset.type = type;
}

function setActiveTab(tabName) {
  const tabs = document.querySelectorAll("[data-auth-tab]");
  const signupForm = byId("signupForm");
  const loginForm = byId("loginForm");
  const memberPanel = byId("memberPanel");

  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.authTab === tabName));
  if (signupForm) signupForm.hidden = tabName !== "signup";
  if (loginForm) loginForm.hidden = tabName !== "login";
  if (memberPanel) memberPanel.hidden = true;
  showMessage("");
}

function readValue(id, fallback = "") {
  const input = byId(id);
  return input ? input.value.trim() : fallback;
}

function setUserField(field, value) {
  document.querySelectorAll(`[data-user-field="${field}"]`).forEach(element => {
    element.textContent = value || getUserFieldDefault(field);
  });
}

function getUserFieldDefault(field) {
  const defaults = {
    fullName: "Student",
    email: "Email not added",
    university: "University not added",
    programme: "Programme not added",
    level: "Level not added",
    country: "Country not added",
    countryLabel: "Country not added",
    programmeLevel: "Programme and level not added"
  };

  return defaults[field] || "Not added";
}

function cleanUserValue(value) {
  if (typeof value !== "string") return "";
  const cleanValue = value.trim();
  return cleanValue.toLowerCase() === "not provided" ? "" : cleanValue;
}

function formatProgrammeLevel(programme, level) {
  const parts = [cleanUserValue(programme), cleanUserValue(level)].filter(Boolean);
  return parts.length ? parts.join(" - ") : getUserFieldDefault("programmeLevel");
}

function normalizeDashboardValue(value) {
  return cleanUserValue(value).toLowerCase();
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setAllText(selector, value) {
  document.querySelectorAll(selector).forEach(element => {
    element.textContent = value;
  });
}

function asList(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return cleanUserValue(item.title) || cleanUserValue(item.name) || cleanUserValue(item.label) || cleanUserValue(item.link);
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

function roadmapDescription(roadmap) {
  return cleanUserValue(roadmap.shortDescription) || cleanUserValue(roadmap.description) || "This roadmap is ready for your learning journey.";
}

function setDashboardRoadmapDefaults() {
  document.querySelectorAll("[data-dashboard-roadmap-link]").forEach(link => {
    link.href = "program-roadmaps.html";
    link.textContent = "Explore";
  });

  const title = document.querySelector("[data-dashboard-roadmap-title]");
  const description = document.querySelector("[data-dashboard-roadmap-description]");
  const programme = document.querySelector("[data-dashboard-roadmap-programme]");
  const status = document.querySelector("[data-dashboard-roadmap-status]");
  const sideText = document.querySelector("[data-dashboard-roadmap-side-text]");
  const card = document.querySelector("[data-dashboard-roadmap-card]");

  if (title) title.textContent = "Loading your roadmap...";
  if (description) description.textContent = "Checking your programme and level for a published roadmap.";
  if (programme) programme.textContent = "Your programme Roadmap";
  if (status) status.textContent = "Loading";
  if (sideText) sideText.textContent = "Your roadmap is loading.";
  if (card) {
    card.querySelector("b").textContent = "Loading roadmap...";
    card.querySelector("span").textContent = "Finding the roadmap assigned to your programme.";
  }

  setText("[data-roadmap-progress-title]", "Loading...");
  setText("[data-roadmap-progress-note]", "Checking your roadmap...");
  setText("[data-roadmap-progress-copy]", "Your roadmap progress will appear here.");
  setText("[data-roadmap-completed-skills]", "--");
  setText("[data-roadmap-remaining-skills]", "--");
  setText("[data-roadmap-total-skills]", "--");
  const progressBar = document.querySelector("[data-roadmap-progress-bar]");
  if (progressBar) progressBar.style.width = "0%";
  setText("[data-roadmap-next-skill-title]", "Loading...");
  setText("[data-roadmap-next-skill-copy]", "Finding your next roadmap activity.");
  renderNextSkillCard("Loading...", "Finding your next recommended skill.", "Next Skill");
  renderResourceCards(["Loading resources...", "Loading resources...", "Loading resources..."]);
}

function renderNextSkillCard(title, description, label = "Next Skill") {
  const card = document.querySelector("[data-dashboard-next-skill-card]");
  if (!card) return;
  const titleElement = card.querySelector("b");
  const descriptionElement = card.querySelector("span");
  const labelElement = card.querySelector("small");
  if (titleElement) titleElement.textContent = title;
  if (descriptionElement) descriptionElement.textContent = description;
  if (labelElement) labelElement.textContent = label;
}

function renderResourceCards(resources) {
  const cards = document.querySelectorAll("[data-dashboard-resource-card]");
  cards.forEach((card, index) => {
    const resource = resources[index];
    card.replaceChildren();
    const label = document.createElement("span");
    const title = document.createElement("b");
    label.textContent = "Resource";
    title.textContent = resource || "No resource added";
    card.append(label, title);
  });
}

function resourceMatchesProfile(resource, profile = {}) {
  const programme = normalizeDashboardValue(profile.programme);
  const level = normalizeDashboardValue(profile.level);
  const resourceProgramme = normalizeDashboardValue(resource.programme);
  const resourceLevel = normalizeDashboardValue(resource.level);
  const matchesProgramme = resourceProgramme === "all programmes" || resourceProgramme === programme;
  const matchesLevel = resourceLevel === "all levels" || resourceLevel === level;
  return matchesProgramme && matchesLevel;
}

function resourceUrl(resource) {
  return cleanUserValue(resource.fileUrl) || cleanUserValue(resource.externalUrl) || cleanUserValue(resource.link);
}

function daysUntil(deadline) {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date - today) / 86400000);
}

function deadlineLabel(deadline, status = "Published") {
  if (status === "Closed") return "Closed";
  const days = daysUntil(deadline);
  if (days === null) return "No deadline";
  if (days < 0) return "Closed";
  if (days === 0) return "Closing Today";
  return `${days} days remaining`;
}

function opportunityMatchesProfile(opportunity, profile = {}) {
  const programme = normalizeDashboardValue(profile.programme);
  const level = normalizeDashboardValue(profile.level);
  const opportunityProgramme = normalizeDashboardValue(opportunity.programme);
  const opportunityLevel = normalizeDashboardValue(opportunity.level);
  const matchesProgramme = opportunityProgramme === "all programmes" || opportunityProgramme === programme;
  const matchesLevel = opportunityLevel === "all levels" || opportunityLevel === level;
  return matchesProgramme && matchesLevel;
}

async function loadDashboardResources(profile = {}) {
  if (!document.body.classList.contains("student-dashboard-page")) return;

  try {
    const snapshot = await getDocs(query(collection(db, "resources"), where("status", "==", "Published")));
    const resources = snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      }))
      .filter(resource => resourceMatchesProfile(resource, profile));

    if (!resources.length) {
      renderResourceCards(["No learning resources have been published for your programme yet.", "Resources will appear here", "Check back later"]);
      return;
    }

    const resourceLabels = [
      `${resources.length} resources available`,
      `Recent: ${cleanUserValue(resources[0].title) || "Learning resource"}`,
      `Recommended: ${cleanUserValue(resources[0].category) || cleanUserValue(resources[0].resourceType) || "Resource"}`
    ];
    renderResourceCards(resourceLabels);
  } catch (error) {
    renderResourceCards(["Resources unavailable", "Please refresh", "Try again later"]);
    console.error("[Dashboard] Failed to load resources", {
      code: error.code,
      message: error.message,
      error
    });
  }
}

function renderDashboardOpportunities(opportunities) {
  const list = document.querySelector(".opportunity-list");
  const deadlines = document.querySelector(".deadline-list");
  if (!list || !deadlines) return;

  list.replaceChildren();
  deadlines.replaceChildren();

  if (!opportunities.length) {
    list.innerHTML = '<article><b>No opportunities currently match your profile.</b><p>Check back soon for new updates.</p><span>Opportunities</span></article>';
    deadlines.innerHTML = '<li><b>--</b><span>No matching opportunity deadlines yet.</span></li>';
    return;
  }

  opportunities.slice(0, 2).forEach(opportunity => {
    const item = document.createElement("article");
    const title = document.createElement("b");
    const description = document.createElement("p");
    const meta = document.createElement("span");
    title.textContent = cleanUserValue(opportunity.title) || "Opportunity";
    description.textContent = cleanUserValue(opportunity.organization) || cleanUserValue(opportunity.description) || "Published opportunity";
    meta.textContent = deadlineLabel(opportunity.deadline, opportunity.status);
    item.append(title, description, meta);
    list.append(item);
  });

  opportunities
    .slice()
    .sort((a, b) => (daysUntil(a.deadline) ?? 9999) - (daysUntil(b.deadline) ?? 9999))
    .slice(0, 3)
    .forEach(opportunity => {
      const li = document.createElement("li");
      const date = document.createElement("b");
      const text = document.createElement("span");
      date.textContent = deadlineLabel(opportunity.deadline, opportunity.status);
      text.textContent = cleanUserValue(opportunity.title) || "Opportunity deadline";
      li.append(date, text);
      deadlines.append(li);
    });
}

async function loadDashboardOpportunities(profile = {}) {
  if (!document.body.classList.contains("student-dashboard-page")) return;

  try {
    const snapshot = await getDocs(query(collection(db, "opportunities"), where("status", "==", "Published")));
    const opportunities = snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      }))
      .filter(opportunity => opportunityMatchesProfile(opportunity, profile));
    renderDashboardOpportunities(opportunities);
  } catch (error) {
    renderDashboardOpportunities([]);
    console.error("[Dashboard] Failed to load opportunities", {
      code: error.code,
      message: error.message,
      error
    });
  }
}

function renderDashboardRoadmap(roadmap) {
  const title = document.querySelector("[data-dashboard-roadmap-title]");
  const description = document.querySelector("[data-dashboard-roadmap-description]");
  const programme = document.querySelector("[data-dashboard-roadmap-programme]");
  const status = document.querySelector("[data-dashboard-roadmap-status]");
  const sideText = document.querySelector("[data-dashboard-roadmap-side-text]");
  const card = document.querySelector("[data-dashboard-roadmap-card]");

  const roadmapTitle = cleanUserValue(roadmap.title) || "Published Roadmap";
  const roadmapProgramme = cleanUserValue(roadmap.programme) || "Programme";
  const roadmapLevel = cleanUserValue(roadmap.level);
  const descriptionText = roadmapDescription(roadmap);
  const skills = asList(roadmap.skills);
  const resources = asList(roadmap.resources);
  const totalSkills = skills.length;
  const completedSkills = 0;
  const remainingSkills = totalSkills;
  const nextSkill = skills[0] || "No skill added yet";
  const duration = cleanUserValue(roadmap.estimatedDuration) || "Duration not added";
  const difficulty = cleanUserValue(roadmap.difficulty) || "Difficulty not added";

  if (title) title.textContent = roadmapTitle;
  if (description) description.textContent = `${descriptionText} Duration: ${duration}. Difficulty: ${difficulty}.`;
  if (programme) programme.textContent = `${roadmapProgramme}${roadmapLevel ? ` - ${roadmapLevel}` : ""}`;
  if (status) status.textContent = "Published";
  if (sideText) sideText.textContent = `${roadmapProgramme}${roadmapLevel ? ` Level ${roadmapLevel}` : ""} roadmap is ready.`;

  document.querySelectorAll("[data-dashboard-roadmap-link]").forEach(link => {
    link.href = "program-roadmaps.html";
    link.textContent = "Continue";
  });

  if (card) {
    card.querySelector("b").textContent = roadmapTitle;
    card.querySelector("span").textContent = skills.length ? `Skills preview: ${skills.slice(0, 3).join(", ")}` : descriptionText;
    card.querySelector("small").textContent = `${difficulty} - ${duration}`;
  }

  setText("[data-roadmap-progress-title]", "0% complete");
  setText("[data-roadmap-progress-note]", totalSkills ? `${totalSkills} skills in this roadmap.` : "No skills have been added yet.");
  setText("[data-roadmap-progress-copy]", totalSkills ? "Progress starts at 0% and will update as roadmap tracking becomes available." : "Skills will appear here after this roadmap is updated.");
  setText("[data-roadmap-completed-skills]", String(completedSkills));
  setText("[data-roadmap-remaining-skills]", String(remainingSkills));
  setText("[data-roadmap-total-skills]", String(totalSkills));
  const progressBar = document.querySelector("[data-roadmap-progress-bar]");
  if (progressBar) progressBar.style.width = "0%";

  setText("[data-roadmap-next-skill-title]", nextSkill);
  setText("[data-roadmap-next-skill-copy]", totalSkills ? "Start here to begin your roadmap." : "Your next skill will appear once skills are added to this roadmap.");
  renderNextSkillCard(nextSkill, totalSkills ? `${roadmapTitle} - ${difficulty}` : "No skill has been added to this roadmap yet.", "Continue");
  renderResourceCards(resources.length ? resources.slice(0, 3) : ["No resource added yet", "Resources will appear here", "Check back later"]);
}

function renderDashboardRoadmapEmpty() {
  document.querySelectorAll("[data-dashboard-roadmap-link]").forEach(link => {
    link.href = "program-roadmaps.html";
    link.textContent = "Explore";
  });

  setText("[data-dashboard-roadmap-title]", "No roadmap assigned yet");
  setText("[data-dashboard-roadmap-description]", "No roadmap has been assigned to your programme yet. Please check back later.");
  setText("[data-dashboard-roadmap-programme]", "Roadmap unavailable");
  setText("[data-dashboard-roadmap-status]", "Not assigned");
  setText("[data-dashboard-roadmap-side-text]", "No roadmap has been assigned yet.");
  const card = document.querySelector("[data-dashboard-roadmap-card]");
  if (card) {
    card.querySelector("b").textContent = "No roadmap assigned yet";
    card.querySelector("span").textContent = "No roadmap has been assigned to your programme yet. Please check back later.";
    card.querySelector("small").textContent = "Roadmaps";
  }
  setText("[data-roadmap-progress-title]", "0% complete");
  setText("[data-roadmap-progress-note]", "No roadmap progress yet.");
  setText("[data-roadmap-progress-copy]", "Your progress will appear once a roadmap is assigned to your programme and level.");
  setText("[data-roadmap-completed-skills]", "0");
  setText("[data-roadmap-remaining-skills]", "0");
  setText("[data-roadmap-total-skills]", "0");
  const progressBar = document.querySelector("[data-roadmap-progress-bar]");
  if (progressBar) progressBar.style.width = "0%";
  setText("[data-roadmap-next-skill-title]", "No skill assigned yet");
  setText("[data-roadmap-next-skill-copy]", "Your next skill will appear when your roadmap is published.");
  renderNextSkillCard("No skill assigned yet", "Please check back later.", "Roadmaps");
  renderResourceCards(["No resource assigned yet", "Resources will appear here", "Check back later"]);
}

function renderDashboardRoadmapError() {
  setText("[data-dashboard-roadmap-title]", "Roadmap unavailable");
  setText("[data-dashboard-roadmap-description]", "We could not load your roadmap right now. Please refresh or try again later.");
  setText("[data-dashboard-roadmap-status]", "Connection issue");
  setText("[data-roadmap-progress-title]", "0% complete");
  setText("[data-roadmap-progress-note]", "Roadmap could not be loaded.");
  setText("[data-roadmap-progress-copy]", "Please check your connection and try again.");
  setText("[data-roadmap-completed-skills]", "0");
  setText("[data-roadmap-remaining-skills]", "0");
  setText("[data-roadmap-total-skills]", "0");
  setText("[data-roadmap-next-skill-title]", "Roadmap unavailable");
  setText("[data-roadmap-next-skill-copy]", "We could not load your next skill right now.");
  renderNextSkillCard("Roadmap unavailable", "Please refresh or try again later.", "Retry");
  renderResourceCards(["Resources unavailable", "Please refresh", "Try again later"]);
}

async function loadPublishedDashboardRoadmaps(profile = {}) {
  if (!document.body.classList.contains("student-dashboard-page")) return;

  setDashboardRoadmapDefaults();

  try {
    const programme = cleanUserValue(profile.programme);
    const level = cleanUserValue(profile.level);
    if (!programme || !level) {
      renderDashboardRoadmapEmpty();
      return;
    }

    const snapshot = await getDocs(query(
      collection(db, "roadmaps"),
      where("programme", "==", programme),
      where("level", "==", level),
      where("status", "==", "Published")
    ));
    const roadmaps = snapshot.docs.map(documentSnapshot => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }));

    if (!roadmaps.length) {
      renderDashboardRoadmapEmpty();
      return;
    }

    renderDashboardRoadmap(roadmaps[0]);
  } catch (error) {
    renderDashboardRoadmapError();
    console.error("[Dashboard] Failed to load published roadmaps", {
      collection: "roadmaps",
      status: "Published",
      code: error.code,
      message: error.message,
      error
    });
  }
}

function setFormProcessing(form, isProcessing, loadingText = "Please wait...") {
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  if (!submitButton) return;

  if (!submitButton.dataset.defaultText) {
    submitButton.dataset.defaultText = submitButton.textContent.trim();
  }

  submitButton.disabled = isProcessing;
  submitButton.setAttribute("aria-busy", isProcessing ? "true" : "false");
  submitButton.textContent = isProcessing ? `... ${loadingText}` : submitButton.dataset.defaultText;
}

function clearLocalSessionData() {
  localStorage.removeItem("aeConnectAccount");
  localStorage.removeItem("aeConnectSession");
}

function friendlyFirebaseError(error) {
  const code = error && error.code ? error.code : "";
  const message = error && error.message ? error.message.toLowerCase() : "";
  if (code.includes("email-already-in-use")) return "This email is already registered. Please login instead.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("weak-password")) return "Please use a stronger password with at least 6 characters.";
  if (code.includes("wrong-password")) return "Incorrect password. Please try again.";
  if (code.includes("user-not-found")) return "No account was found with this email address.";
  if (code.includes("invalid-credential")) return "Incorrect email or password. Please try again.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (code.includes("network-request-failed") || code.includes("unavailable") || message.includes("network")) {
    return "Network error. Please try again.";
  }
  if (code.includes("permission-denied")) return "We could not save your profile. Please try again.";
  return "Something went wrong. Please try again.";
}

function setupPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach(button => {
    button.addEventListener("click", () => {
      const input = byId(button.dataset.togglePassword);
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.textContent = isHidden ? "Hide" : "Show";
      button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  });
}

function setupAuthTabs() {
  document.querySelectorAll("[data-auth-tab]").forEach(tab => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.authTab));
  });

  const hash = window.location.hash.replace("#", "").toLowerCase();
  setActiveTab(hash === "login" ? "login" : "signup");
}

function setupRegisterForm() {
  const signupForm = byId("signupForm");
  if (!signupForm) return;

  signupForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (authFlowInProgress) return;

    showMessage("Creating your account...");
    authFlowInProgress = true;
    setFormProcessing(signupForm, true, "Creating account...");

    const profile = {
      fullName: readValue("signupName"),
      email: readValue("signupEmail").toLowerCase(),
      university: readValue("signupSchool"),
      programme: readValue("signupProgram"),
      level: readValue("signupLevel", "Not provided"),
      country: readValue("signupCountry", "Not provided"),
      password: byId("signupPassword").value
    };

    try {
      await registerWithEmail(profile);
      showMessage("Account created successfully. Redirecting to your dashboard...");
      window.location.replace(dashboardPath);
    } catch (error) {
      console.error("[Register] Registration flow failed", {
        code: error.code,
        message: error.message,
        error
      });
      showMessage(friendlyFirebaseError(error), "error");
      authFlowInProgress = false;
      setFormProcessing(signupForm, false);
    }
  });
}

function setupLoginForm() {
  const loginForm = byId("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (authFlowInProgress) return;

    showMessage("Logging you in...");
    authFlowInProgress = true;
    setFormProcessing(loginForm, true, "Logging in...");

    try {
      await loginWithEmail(readValue("loginEmail").toLowerCase(), byId("loginPassword").value);
      showMessage("Welcome back! Redirecting...");
      window.location.replace(dashboardPath);
    } catch (error) {
      console.error("[Login] Login flow failed", {
        code: error.code,
        message: error.message,
        error
      });
      showMessage(friendlyFirebaseError(error), "error");
      authFlowInProgress = false;
      setFormProcessing(loginForm, false);
    }
  });
}

function setupLogout() {
  const logoutButtons = document.querySelectorAll("[data-firebase-logout], #logoutBtn");
  logoutButtons.forEach(button => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      await logoutUser();
      clearLocalSessionData();
      window.location.replace(authPath);
    });
  });
}

function setupDashboardSearch() {
  const searchToggle = document.querySelector("[data-dashboard-search-toggle]");
  const searchPanel = byId("dashboardSearchPanel");
  const searchInput = byId("dashboardSearchInput");
  const searchResults = byId("dashboardSearchResults");

  if (!searchToggle || !searchPanel || !searchInput || !searchResults) return;

  const searchItems = [
    { label: "Home", description: "Return to the A.E CONNECT SPACE homepage", href: "index.html" },
    { label: "Programs", description: "Browse available student programs", href: "programs.html" },
    { label: "Program Roadmaps", description: "Explore student roadmaps", href: "program-roadmaps.html" },
    { label: "Skills Hub", description: "Browse practical skills", href: "skills.html" },
    { label: "Opportunities", description: "Find internships, roles, and openings", href: "opportunities.html" },
    { label: "Scholarships", description: "Explore scholarship opportunities", href: "scholarships.html" },
    { label: "Entrepreneurship", description: "Build and sell student ideas", href: "entrepreneurship.html" },
    { label: "Community", description: "Connect with students and peers", href: "networking.html" },
    { label: "Events", description: "View upcoming A.E CONNECT events", href: "events.html" },
    { label: "Stories", description: "Read student success stories", href: "stories.html" },
    { label: "Resources", description: "Open resources and guides", href: "resources.html" },
    { label: "Saved", description: "Jump to saved dashboard items", href: "#saved" },
    { label: "Profile", description: "Manage your account profile", href: "#profile" }
  ];

  function closeSearch() {
    searchPanel.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
  }

  function openSearch() {
    searchPanel.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    renderSearchResults(searchInput.value);
    searchInput.focus();
  }

  function navigateToResult(href) {
    if (href === "#profile") {
      closeSearch();
      openDashboardProfileEditor();
      return;
    }

    if (href.startsWith("#")) {
      closeSearch();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
      return;
    }

    window.location.href = href;
  }

  function createSearchResult(item) {
    const button = document.createElement("button");
    const title = document.createElement("strong");
    const description = document.createElement("span");

    button.type = "button";
    title.textContent = item.label;
    description.textContent = item.description;
    button.append(title, description);
    button.addEventListener("click", () => navigateToResult(item.href));

    return button;
  }

  function renderSearchResults(query = "") {
    const cleanQuery = query.trim().toLowerCase();
    const matches = searchItems.filter(item => {
      const text = `${item.label} ${item.description}`.toLowerCase();
      return !cleanQuery || text.includes(cleanQuery);
    });

    searchResults.replaceChildren();
    const visibleResults = matches.length ? matches : [{ label: "No results found", description: "Try searching for roadmaps, skills, opportunities, or resources.", href: "" }];

    visibleResults.slice(0, 6).forEach(item => {
      if (!item.href) {
        const emptyState = document.createElement("p");
        emptyState.textContent = item.description;
        searchResults.append(emptyState);
        return;
      }

      searchResults.append(createSearchResult(item));
    });
  }

  searchToggle.addEventListener("click", event => {
    event.stopPropagation();
    if (searchPanel.hidden) {
      openSearch();
    } else {
      closeSearch();
    }
  });

  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchInput.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeSearch();
      searchToggle.focus();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const firstResult = searchResults.querySelector("button");
      firstResult?.click();
    }
  });

  document.addEventListener("click", event => {
    if (!searchPanel.hidden && !searchPanel.contains(event.target) && event.target !== searchToggle) {
      closeSearch();
    }
  });

  renderSearchResults();
}

function setProfileMessage(message, type = "success") {
  const messageElement = byId("dashboardProfileMessage");
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function setProfileInput(id, value) {
  const input = byId(id);
  if (input) input.value = value || "";
}

function fillDashboardProfileForm() {
  const data = dashboardProfile || {};
  setProfileInput("profileFullName", cleanUserValue(data.fullName) || cleanUserValue(dashboardUser?.displayName));
  setProfileInput("profileEmail", cleanUserValue(data.email) || cleanUserValue(dashboardUser?.email));
  setProfileInput("profileUniversity", cleanUserValue(data.university));
  setProfileInput("profileProgramme", cleanUserValue(data.programme));
  setProfileInput("profileLevel", cleanUserValue(data.level));
  setProfileInput("profileCountry", cleanUserValue(data.country));
}

function openDashboardProfileEditor() {
  const modal = byId("dashboardProfileModal");
  if (!modal || !dashboardUser) return;
  fillDashboardProfileForm();
  setProfileMessage("");
  modal.hidden = false;
  document.body.classList.add("dashboard-profile-open");
  byId("profileFullName")?.focus();
}

function closeDashboardProfileEditor() {
  const modal = byId("dashboardProfileModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("dashboard-profile-open");
}

function applyProfileToDashboard(profile = {}) {
  const fullName = cleanUserValue(profile.fullName) || cleanUserValue(dashboardUser?.displayName) || getUserFieldDefault("fullName");
  const email = cleanUserValue(profile.email) || cleanUserValue(dashboardUser?.email);
  const university = cleanUserValue(profile.university);
  const programme = cleanUserValue(profile.programme);
  const level = cleanUserValue(profile.level);
  const country = cleanUserValue(profile.country);

  setUserField("fullName", fullName);
  setUserField("email", email);
  setUserField("university", university);
  setUserField("programme", programme);
  setUserField("level", level);
  setUserField("country", country);
  setUserField("countryLabel", country ? `Country: ${country}` : getUserFieldDefault("countryLabel"));
  setUserField("programmeLevel", formatProgrammeLevel(programme, level));
}

function setupDashboardProfileEditor() {
  const modal = byId("dashboardProfileModal");
  const form = byId("dashboardProfileForm");
  if (!modal || !form) return;

  document.querySelectorAll("[data-profile-edit-toggle]").forEach(button => {
    button.addEventListener("click", openDashboardProfileEditor);
  });

  document.querySelectorAll("[data-profile-edit-close]").forEach(button => {
    button.addEventListener("click", closeDashboardProfileEditor);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) closeDashboardProfileEditor();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!dashboardUser) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setProfileMessage("Saving your profile...");

    const updatedProfile = {
      fullName: readValue("profileFullName"),
      email: cleanUserValue(dashboardUser.email),
      university: readValue("profileUniversity"),
      programme: readValue("profileProgramme"),
      level: readValue("profileLevel"),
      country: readValue("profileCountry"),
      updatedAt: serverTimestamp()
    };

    try {
      await updateDoc(doc(db, "users", dashboardUser.uid), updatedProfile);
      if (updatedProfile.fullName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: updatedProfile.fullName });
      }

      dashboardProfile = {
        ...dashboardProfile,
        ...updatedProfile,
        updatedAt: new Date()
      };
      applyProfileToDashboard(dashboardProfile);
      setProfileMessage("Profile updated successfully.");
      await loadPublishedDashboardRoadmaps(dashboardProfile);
      await loadDashboardResources(dashboardProfile);
      await loadDashboardOpportunities(dashboardProfile);
      setTimeout(closeDashboardProfileEditor, 700);
    } catch (error) {
      console.error("[Dashboard] Failed to update profile", {
        uid: dashboardUser.uid,
        code: error.code,
        message: error.message,
        error
      });
      setProfileMessage("Profile could not be saved. Please check your connection and try again.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function setupAuthRedirect() {
  if (!document.body.classList.contains("auth-page")) return;

  observeAuthState(user => {
    if (user && !authFlowInProgress) {
      window.location.replace(dashboardPath);
    }
  });
}

function setupDashboardProtection() {
  if (!document.body.classList.contains("student-dashboard-page")) return;

  loadDashboardProfile();
}

async function loadDashboardProfile() {
  const user = await requireAuthenticatedUser(authPath);
  if (!user) return;
  dashboardUser = user;

  try {
    const profile = await getUserDocument(user.uid);
    const data = profile || {};
    dashboardProfile = data;
    applyProfileToDashboard(data);
    await loadPublishedDashboardRoadmaps(data);
    await loadDashboardResources(data);
    await loadDashboardOpportunities(data);
    if (window.location.hash === "#profile") {
      openDashboardProfileEditor();
    }

    console.info("[Dashboard] User profile loaded", {
      uid: user.uid,
      path: `users/${user.uid}`,
      hasProfile: Boolean(profile)
    });
  } catch (error) {
    console.error("[Dashboard] Failed to load user profile", {
      uid: user.uid,
      path: `users/${user.uid}`,
      code: error.code,
      message: error.message,
      error
    });
  }
}

setupPasswordToggles();
setupAuthTabs();
setupRegisterForm();
setupLoginForm();
setupLogout();
setupDashboardSearch();
setupDashboardProfileEditor();
setupAuthRedirect();
setupDashboardProtection();
