import { requireAuthenticatedUser } from "./auth.js";
import { db } from "./firebase-config.js";
import { getUserDocument } from "./firestore.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const authPath = "auth.html";
let currentUser = null;
let currentProfile = {};
let allOpportunities = [];
let savedIds = new Set();
let activeTypeFilter = "all";

function byId(id) {
  return document.getElementById(id);
}

function clean(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalize(value) {
  return clean(value).toLowerCase();
}

function daysUntil(deadline) {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date - today) / 86400000);
}

function deadlineLabel(opportunity) {
  if (opportunity.status === "Closed") return "Closed";
  const days = daysUntil(opportunity.deadline);
  if (days === null) return "No deadline";
  if (days < 0) return "Closed";
  if (days === 0) return "Closing Today";
  return `${days} days remaining`;
}

function opportunityMatchesProfile(opportunity) {
  const programme = normalize(currentProfile.programme);
  const level = normalize(currentProfile.level);
  const opportunityProgramme = normalize(opportunity.programme);
  const opportunityLevel = normalize(opportunity.level);
  return (opportunityProgramme === "all programmes" || opportunityProgramme === programme)
    && (opportunityLevel === "all levels" || opportunityLevel === level);
}

function opportunityUrl(opportunity) {
  return clean(opportunity.applicationLink) || clean(opportunity.link) || "#";
}

function savedDocId(opportunityId) {
  return `${currentUser.uid}_${opportunityId}`;
}

async function toggleSaved(opportunity) {
  const id = savedDocId(opportunity.id);
  if (savedIds.has(opportunity.id)) {
    await deleteDoc(doc(db, "savedOpportunities", id));
    savedIds.delete(opportunity.id);
  } else {
    await setDoc(doc(db, "savedOpportunities", id), {
      userId: currentUser.uid,
      opportunityId: opportunity.id,
      title: clean(opportunity.title),
      organization: clean(opportunity.organization),
      deadline: clean(opportunity.deadline),
      createdAt: serverTimestamp()
    });
    savedIds.add(opportunity.id);
  }
  renderOpportunities();
}

async function shareOpportunity(opportunity) {
  const url = opportunityUrl(opportunity);
  const text = `${clean(opportunity.title, "Opportunity")} - ${clean(opportunity.organization, "A.E CONNECT")}`;
  if (navigator.share) {
    await navigator.share({ title: clean(opportunity.title), text, url });
    return;
  }
  await navigator.clipboard?.writeText(url);
  alert("Opportunity link copied.");
}

function createOpportunityRow(opportunity) {
  const row = document.createElement("article");
  const icon = document.createElement("div");
  const info = document.createElement("div");
  const meta = document.createElement("div");
  const type = document.createElement("span");
  const location = document.createElement("small");
  const title = document.createElement("h3");
  const org = document.createElement("p");
  const description = document.createElement("p");
  const tags = document.createElement("div");
  const programmes = document.createElement("div");
  const action = document.createElement("div");
  const deadline = document.createElement("small");
  const apply = document.createElement("a");
  const save = document.createElement("a");
  const share = document.createElement("a");

  row.className = "opportunity-row";
  icon.className = "opportunity-icon";
  icon.textContent = "OP";
  info.className = "opportunity-info";
  meta.className = "opportunity-meta";
  type.textContent = clean(opportunity.opportunityType || opportunity.type, "Opportunity");
  location.textContent = clean(opportunity.location || opportunity.country, "Location not added");
  meta.append(type, location);
  title.textContent = clean(opportunity.title, "Opportunity");
  org.className = "opportunity-org";
  org.textContent = clean(opportunity.organization, "Organization not added");
  description.textContent = clean(opportunity.description, "No description added.");
  tags.className = "opportunity-tags";
  [deadlineLabel(opportunity), clean(opportunity.country), opportunity.featured ? "Featured" : ""].filter(Boolean).forEach(item => {
    const span = document.createElement("span");
    span.textContent = item;
    tags.append(span);
  });
  programmes.className = "opportunity-programs";
  [clean(opportunity.programme, "All Programmes"), clean(opportunity.level, "All Levels")].forEach(item => {
    const span = document.createElement("span");
    span.textContent = item;
    programmes.append(span);
  });
  info.append(meta, title, org, description, tags, programmes);
  action.className = "opportunity-action";
  deadline.textContent = `Deadline: ${clean(opportunity.deadline, "Not added")}`;
  apply.href = opportunityUrl(opportunity);
  apply.target = "_blank";
  apply.rel = "noopener";
  apply.textContent = "Apply Now";
  save.href = "#";
  save.textContent = savedIds.has(opportunity.id) ? "Remove Saved" : "Save";
  save.addEventListener("click", event => {
    event.preventDefault();
    toggleSaved(opportunity).catch(console.error);
  });
  share.href = "#";
  share.textContent = "Share";
  share.addEventListener("click", event => {
    event.preventDefault();
    shareOpportunity(opportunity).catch(console.error);
  });
  action.append(deadline, apply, save, share);
  row.append(icon, info, action);
  return row;
}

function filterByDeadline(opportunity, filter) {
  const days = daysUntil(opportunity.deadline);
  if (filter === "closed") return opportunity.status === "Closed" || (days !== null && days < 0);
  if (filter === "today") return days === 0;
  if (filter === "week") return days !== null && days >= 0 && days <= 7;
  if (filter === "month") return days !== null && days >= 0 && days <= 30;
  return true;
}

function renderOpportunities() {
  const list = byId("opportunityList");
  if (!list) return;
  const term = normalize(byId("opportunitySearch")?.value || "");
  const country = byId("opportunityCountryFilter")?.value || "all";
  const programme = byId("opportunityProgrammeFilter")?.value || "all";
  const deadline = byId("opportunityDeadlineFilter")?.value || "all";

  const filtered = allOpportunities.filter(opportunity => {
    const text = [
      opportunity.title,
      opportunity.organization,
      opportunity.description,
      opportunity.eligibility,
      opportunity.opportunityType,
      opportunity.country,
      opportunity.programme
    ].join(" ").toLowerCase();
    return (!term || text.includes(term))
      && (activeTypeFilter === "all" || clean(opportunity.opportunityType || opportunity.type) === activeTypeFilter)
      && (country === "all" || normalize(opportunity.country) === country)
      && (programme === "all" || normalize(opportunity.programme) === programme)
      && filterByDeadline(opportunity, deadline);
  });

  list.replaceChildren();
  if (!filtered.length) {
    list.innerHTML = '<p class="events-empty">No opportunities currently match your profile. Check back soon for new updates.</p>';
    return;
  }
  filtered.forEach(opportunity => list.append(createOpportunityRow(opportunity)));
}

function populateSelect(id, values, label) {
  const select = byId(id);
  if (!select) return;
  select.replaceChildren();
  const all = document.createElement("option");
  all.value = "all";
  all.textContent = label;
  select.append(all);
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = normalize(value);
    option.textContent = value;
    select.append(option);
  });
}

function setupFilters() {
  document.querySelectorAll("[data-opportunity-filter]").forEach(button => {
    button.addEventListener("click", () => {
      activeTypeFilter = button.dataset.opportunityFilter;
      document.querySelectorAll("[data-opportunity-filter]").forEach(item => item.classList.toggle("active", item === button));
      renderOpportunities();
    });
  });
  byId("opportunitySearch")?.addEventListener("input", renderOpportunities);
  byId("opportunityCountryFilter")?.addEventListener("change", renderOpportunities);
  byId("opportunityProgrammeFilter")?.addEventListener("change", renderOpportunities);
  byId("opportunityDeadlineFilter")?.addEventListener("change", renderOpportunities);
}

async function loadOpportunitiesPage() {
  if (!document.body.classList.contains("opportunities-page")) return;
  setupFilters();
  currentUser = await requireAuthenticatedUser(authPath);
  if (!currentUser) return;
  currentProfile = await getUserDocument(currentUser.uid) || {};

  const [opportunitySnapshot, savedSnapshot] = await Promise.all([
    getDocs(query(collection(db, "opportunities"), where("status", "==", "Published"))),
    getDocs(query(collection(db, "savedOpportunities"), where("userId", "==", currentUser.uid)))
  ]);
  savedIds = new Set(savedSnapshot.docs.map(item => item.data().opportunityId));
  allOpportunities = opportunitySnapshot.docs
    .map(documentSnapshot => ({ id: documentSnapshot.id, ...documentSnapshot.data() }))
    .filter(opportunityMatchesProfile);

  populateSelect("opportunityCountryFilter", [...new Set(allOpportunities.map(item => clean(item.country)).filter(Boolean))], "All countries");
  populateSelect("opportunityProgrammeFilter", [...new Set(allOpportunities.map(item => clean(item.programme)).filter(Boolean))], "All programmes");
  renderOpportunities();
}

loadOpportunitiesPage().catch(error => {
  const list = byId("opportunityList");
  if (list) list.innerHTML = '<p class="events-empty">Opportunities could not be loaded. Please refresh or try again later.</p>';
  console.error("[Opportunities] Failed to load opportunities", error);
});
