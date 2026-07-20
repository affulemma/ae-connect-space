import { requireAuthenticatedUser } from "./auth.js";
import { db } from "./firebase-config.js";
import { getUserDocument } from "./firestore.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const authPath = "auth.html";
let allResources = [];

function byId(id) {
  return document.getElementById(id);
}

function clean(value, fallback = "Not added") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalize(value) {
  return clean(value, "").toLowerCase();
}

function resourceUrl(resource) {
  return clean(resource.fileUrl, "") || clean(resource.externalUrl, "") || clean(resource.link, "");
}

function resourceMatchesProfile(resource, profile) {
  const programme = normalize(profile.programme);
  const level = normalize(profile.level);
  const resourceProgramme = normalize(resource.programme);
  const resourceLevel = normalize(resource.level);
  const matchesProgramme = resourceProgramme === "all programmes" || resourceProgramme === programme;
  const matchesLevel = resourceLevel === "all levels" || resourceLevel === level;
  return matchesProgramme && matchesLevel;
}

function setStatus(message) {
  const status = document.querySelector("[data-resource-live-status]");
  if (status) status.textContent = message;
}

function populateFilter(id, values, allLabel) {
  const select = byId(id);
  if (!select) return;
  const currentValue = select.value;
  select.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = allLabel;
  select.append(allOption);

  values.forEach(value => {
    const option = document.createElement("option");
    option.value = normalize(value);
    option.textContent = value;
    select.append(option);
  });

  select.value = [...select.options].some(option => option.value === currentValue) ? currentValue : "all";
}

function populateFilters() {
  const categories = [...new Set(allResources.map(resource => clean(resource.category, "")).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const types = [...new Set(allResources.map(resource => clean(resource.resourceType || resource.type, "")).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  populateFilter("resourceCategoryFilter", categories, "All categories");
  populateFilter("resourceTypeFilter", types, "All types");
}

function showResourceDetails(resource) {
  const panel = byId("resourceDetailPanel");
  if (!panel) return;
  const url = resourceUrl(resource);

  panel.replaceChildren();
  const label = document.createElement("span");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const meta = document.createElement("p");
  const action = document.createElement("a");

  label.textContent = clean(resource.resourceType || resource.type, "Resource");
  title.textContent = clean(resource.title, "Learning resource");
  description.textContent = clean(resource.description, "No description added.");
  meta.textContent = `${clean(resource.programme, "All Programmes")} - ${clean(resource.level, "All Levels")} - ${clean(resource.category, "General")}`;
  action.href = url || "#";
  action.textContent = url ? "Open Resource" : "No link available";
  action.target = "_blank";
  action.rel = "noopener";
  if (!url) action.setAttribute("aria-disabled", "true");

  panel.append(label, title, description, meta, action);
}

function createResourceCard(resource) {
  const card = document.createElement("article");
  const type = document.createElement("span");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  const button = document.createElement("button");

  card.className = "resource-live-card";
  type.textContent = clean(resource.resourceType || resource.type, "Resource");
  title.textContent = clean(resource.title, "Learning resource");
  description.textContent = clean(resource.description, "No description added.");
  button.type = "button";
  button.textContent = "View Details";
  button.addEventListener("click", () => showResourceDetails(resource));

  card.append(type, title, description, button);
  return card;
}

function applyResourceFilters() {
  const grid = byId("resourceLiveGrid");
  if (!grid) return;

  const search = normalize(byId("resourceSearchInput")?.value || "");
  const category = byId("resourceCategoryFilter")?.value || "all";
  const type = byId("resourceTypeFilter")?.value || "all";

  const filtered = allResources.filter(resource => {
    const searchable = [
      resource.title,
      resource.description,
      resource.category,
      resource.resourceType,
      resource.type
    ].join(" ").toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesCategory = category === "all" || normalize(resource.category) === category;
    const matchesType = type === "all" || normalize(resource.resourceType || resource.type) === type;
    return matchesSearch && matchesCategory && matchesType;
  });

  grid.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement("article");
    empty.className = "resource-live-card";
    empty.innerHTML = "<span>Empty</span><h3>No resources found</h3><p>No learning resources have been published for your programme yet.</p>";
    grid.append(empty);
    setStatus("No matching resources found.");
    return;
  }

  filtered.forEach(resource => grid.append(createResourceCard(resource)));
  setStatus(`${filtered.length} resources available.`);
}

function setupResourceControls() {
  byId("resourceSearchInput")?.addEventListener("input", applyResourceFilters);
  byId("resourceCategoryFilter")?.addEventListener("change", applyResourceFilters);
  byId("resourceTypeFilter")?.addEventListener("change", applyResourceFilters);
}

async function loadResourcesPage() {
  if (!document.body.classList.contains("resources-page")) return;

  setupResourceControls();
  setStatus("Loading learning resources...");

  const user = await requireAuthenticatedUser(authPath);
  if (!user) return;

  try {
    const profile = await getUserDocument(user.uid);
    const snapshot = await getDocs(query(collection(db, "resources"), where("status", "==", "Published")));
    allResources = snapshot.docs
      .map(documentSnapshot => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data()
      }))
      .filter(resource => resourceMatchesProfile(resource, profile || {}));

    populateFilters();
    applyResourceFilters();
  } catch (error) {
    allResources = [];
    const grid = byId("resourceLiveGrid");
    if (grid) {
      grid.innerHTML = '<article class="resource-live-card"><span>Error</span><h3>Resources unavailable</h3><p>We could not load learning resources right now. Please refresh or try again later.</p></article>';
    }
    setStatus("Resources could not be loaded.");
    console.error("[Resources] Failed to load resources", {
      code: error.code,
      message: error.message,
      error
    });
  }
}

loadResourcesPage();
