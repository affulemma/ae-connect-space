import { auth, db } from "./firebase-config.js";
import { observeAuthState } from "./auth.js";
import { getUserDocument } from "./firestore.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Image resolution is intentionally isolated so Storage can be added later
// without changing Firestore CRUD, rendering, or form behavior.
const DEFAULT_EVENT_IMAGE = "../ASSETS/images/beyond-lecture-room.jpg";

const elements = {
  list: document.getElementById("eventsList"),
  featuredGrid: document.getElementById("featuredEventsGrid"),
  featuredSection: document.querySelector(".featured-events-section"),
  layout: document.querySelector(".events-layout"),
  formPanel: document.getElementById("postEvent"),
  form: document.getElementById("eventForm"),
  search: document.getElementById("eventSearch"),
  filters: [...document.querySelectorAll("[data-filter]")],
  title: document.getElementById("eventTitle"),
  category: document.getElementById("eventType"),
  programme: document.getElementById("eventProgram"),
  date: document.getElementById("eventDate"),
  time: document.getElementById("eventTime"),
  location: document.getElementById("eventLocation"),
  organizer: document.getElementById("eventOrganizer"),
  description: document.getElementById("eventDescription"),
  imageURL: document.getElementById("eventImageURL"),
  submit: document.getElementById("eventSubmitButton"),
  cancelEdit: document.getElementById("eventCancelEdit"),
  status: document.getElementById("eventFormStatus")
};

const state = {
  events: [],
  activeFilter: "all",
  isAdmin: false,
  userId: "",
  registered: new Set(),
  editing: null,
  unsubscribe: null
};

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function friendlyError(error, fallback) {
  const code = error?.code || "";
  if (code.includes("permission-denied") || code.includes("unauthorized")) {
    return "You do not have permission to complete this action. Confirm that you are signed in and that the latest Firebase rules are published.";
  }
  if (code.includes("network") || !navigator.onLine) return "Your connection was interrupted. Please reconnect and try again.";
  return error?.message || fallback;
}

function setStatus(message = "", type = "") {
  elements.status.textContent = message;
  elements.status.className = `event-form-status${type ? ` is-${type}` : ""}`;
}

function setBusy(busy, label = "Saving event...") {
  elements.submit.disabled = busy;
  elements.cancelEdit.disabled = busy;
  elements.imageURL.disabled = busy;
  elements.submit.textContent = busy ? label : (state.editing ? "Update Event" : "Post Event");
}

function eventImage(event) {
  return event.imageURL || DEFAULT_EVENT_IMAGE;
}

function formatDateParts(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { month: "TBA", day: "--" };
  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate())
  };
}

function sortByNearestDate(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timestamp = event => new Date(`${event.date}T00:00:00`).getTime();
  return [...events].sort((left, right) => {
    const leftTime = timestamp(left);
    const rightTime = timestamp(right);
    const leftUpcoming = leftTime >= today.getTime();
    const rightUpcoming = rightTime >= today.getTime();
    if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1;
    return leftUpcoming ? leftTime - rightTime : rightTime - leftTime;
  });
}

function loadingMarkup(message = "Loading events...") {
  return `<div class="events-loading" role="status"><span class="events-spinner" aria-hidden="true"></span><strong>${escapeHtml(message)}</strong></div>`;
}

function emptyMarkup(searching = false) {
  if (searching) {
    return `<div class="events-empty-state"><div class="events-empty-illustration" aria-hidden="true">⌕</div><h3>No matching events</h3><p>Try a different search or event category.</p></div>`;
  }
  return `<div class="events-empty-state"><div class="events-empty-illustration" aria-hidden="true"><span>□</span><b>EVENTS</b></div><h3>No events have been published yet.</h3><p>New workshops, webinars, and meetups will appear here as soon as they are announced.</p><button type="button" data-check-events>Check Back Later</button></div>`;
}

function adminActions(event) {
  if (!(state.isAdmin || (state.userId && event.createdBy === state.userId))) return "";
  return `<div class="event-admin-actions"><button type="button" data-edit-event="${escapeHtml(event.id)}">Edit</button><button type="button" class="danger" data-delete-event="${escapeHtml(event.id)}">Delete</button></div>`;
}

function eventCard(event, index) {
  const date = formatDateParts(event.date);
  const registered = state.registered.has(event.id);
  return `<article class="event-row" data-type="${escapeHtml(event.category)}" style="--delay:${index * 35}ms">
    <div class="event-date"><span>${date.month}</span><strong>${date.day}</strong></div>
    <div class="event-main">
      <img class="event-flyer" src="${escapeHtml(eventImage(event))}" alt="${escapeHtml(event.title)} event" loading="lazy">
      <div class="event-tags"><span>${escapeHtml(event.category)}</span><span>${escapeHtml(event.programme)}</span></div>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.description)}</p>
      <small>Organizer: ${escapeHtml(event.organizer)}</small>
      <footer><span>${escapeHtml(event.time)}</span><span>${escapeHtml(event.location)}</span><span>Published event</span></footer>
      ${adminActions(event)}
    </div>
    <button class="event-register${registered ? " is-registered" : ""}" type="button" data-register-event="${escapeHtml(event.id)}" ${registered ? "disabled" : ""}>${registered ? "Registered" : "Register Now"}</button>
  </article>`;
}

async function registerForEvent(eventId, button) {
  const selected = state.events.find(event => event.id === eventId);
  if (!selected) return;
  if (!auth.currentUser) {
    window.location.href = "auth.html?return=events.html%23eventList#login";
    return;
  }

  button.disabled = true;
  button.textContent = "Registering...";
  try {
    const registrationId = `${auth.currentUser.uid}_${eventId}`;
    await setDoc(doc(db, "eventRegistrations", registrationId), {
      eventId,
      eventTitle: selected.title,
      eventDate: selected.date,
      eventTime: selected.time,
      eventLocation: selected.location,
      createdBy: auth.currentUser.uid,
      createdByEmail: auth.currentUser.email || "",
      status: "registered",
      createdAt: serverTimestamp()
    });
    state.registered.add(eventId);
    renderEvents();
  } catch (error) {
    console.error("[Events] Registration failed", error);
    button.disabled = false;
    button.textContent = "Register Now";
    setStatus(friendlyError(error, "Registration could not be completed. Please try again."), "error");
  }
}

async function loadRegistrations(user) {
  state.registered = new Set();
  if (!user) return;
  try {
    const registrations = await getDocs(query(
      collection(db, "eventRegistrations"),
      where("createdBy", "==", user.uid)
    ));
    registrations.forEach(registration => {
      const eventId = registration.data().eventId;
      if (eventId) state.registered.add(eventId);
    });
  } catch (error) {
    console.error("[Events] Could not load registrations", error);
  }
}

function featuredCard(event) {
  return `<article class="featured-event-card">
    <img class="featured-event-flyer" src="${escapeHtml(eventImage(event))}" alt="${escapeHtml(event.title)} event" loading="lazy">
    <div><b>${escapeHtml(event.category)}</b><small>${escapeHtml(event.location)}</small></div>
    <h3>${escapeHtml(event.title)}</h3>
    <p>${escapeHtml(event.description)}</p>
    <footer><span>${escapeHtml(event.date)}</span><span>${escapeHtml(event.time)}</span></footer>
  </article>`;
}

function renderFeatured() {
  const upcoming = sortByNearestDate(state.events).filter(event => new Date(`${event.date}T23:59:59`).getTime() >= Date.now()).slice(0, 3);
  elements.featuredGrid.innerHTML = upcoming.map(featuredCard).join("");
  elements.featuredSection.hidden = upcoming.length === 0;
}

function renderEvents() {
  const term = elements.search.value.trim().toLowerCase();
  const filtered = sortByNearestDate(state.events).filter(event => {
    const matchesCategory = state.activeFilter === "all" || event.category === state.activeFilter;
    const searchable = `${event.title} ${event.category} ${event.programme} ${event.location} ${event.organizer} ${event.description}`.toLowerCase();
    return matchesCategory && searchable.includes(term);
  });
  elements.list.innerHTML = filtered.length ? filtered.map(eventCard).join("") : emptyMarkup(Boolean(term || state.activeFilter !== "all"));
  renderFeatured();
}

function readForm() {
  return {
    title: elements.title.value.trim(),
    category: elements.category.value.trim(),
    programme: elements.programme.value.trim(),
    date: elements.date.value,
    time: elements.time.value.trim(),
    location: elements.location.value.trim(),
    organizer: elements.organizer.value.trim(),
    description: elements.description.value.trim(),
    imageURL: elements.imageURL.value.trim()
  };
}

function validateForm(data) {
  if (!elements.form.reportValidity()) return "Please complete every required field.";
  if (data.title.length > 160) return "The event title must be 160 characters or fewer.";
  if (data.description.length > 2000) return "The description must be 2,000 characters or fewer.";
  return "";
}

function resetForm({ keepMessage = false } = {}) {
  elements.form.reset();
  state.editing = null;
  elements.submit.textContent = "Post Event";
  elements.cancelEdit.hidden = true;
  if (!keepMessage) setStatus();
}

function beginEdit(eventId) {
  const selected = state.events.find(event => event.id === eventId);
  if (!selected || !(state.isAdmin || selected.createdBy === state.userId)) return;
  state.editing = selected;
  elements.title.value = selected.title;
  elements.category.value = selected.category;
  elements.programme.value = selected.programme;
  elements.date.value = selected.date;
  elements.time.value = selected.time;
  elements.location.value = selected.location;
  elements.organizer.value = selected.organizer;
  elements.description.value = selected.description;
  elements.imageURL.value = selected.imageURL || "";
  elements.submit.textContent = "Update Event";
  elements.cancelEdit.hidden = false;
  setStatus("Editing event details.", "info");
  elements.formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.title.focus({ preventScroll: true });
}

async function deleteEvent(eventId) {
  const selected = state.events.find(event => event.id === eventId);
  if (!selected || !(state.isAdmin || selected.createdBy === state.userId) || !window.confirm(`Delete “${selected.title}”? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, "events", eventId));
    if (state.editing?.id === eventId) resetForm();
    setStatus("Event deleted successfully.", "success");
  } catch (error) {
    console.error("[Events] Delete failed", error);
    setStatus(friendlyError(error, "The event could not be deleted."), "error");
  }
}

async function submitEvent(event) {
  event.preventDefault();
  setStatus();
  if (!auth.currentUser) {
    setStatus("Please sign in before publishing an event.", "error");
    return;
  }
  const data = readForm();
  const validationError = validateForm(data);
  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  setBusy(true, "Saving event...");
  setStatus(state.editing ? "Updating event in Firestore..." : "Publishing event to Firestore...", "info");
  try {
    const payload = {
      ...data,
      createdBy: state.editing?.createdBy || auth.currentUser.uid,
      status: "published",
      updatedAt: serverTimestamp()
    };

    if (state.editing) {
      await updateDoc(doc(db, "events", state.editing.id), payload);
      resetForm({ keepMessage: true });
      setStatus("Event updated successfully.", "success");
    } else {
      await addDoc(collection(db, "events"), { ...payload, createdAt: serverTimestamp() });
      resetForm({ keepMessage: true });
      setStatus("Event published successfully.", "success");
    }
    document.getElementById("eventList").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("[Events] Save failed", error);
    setStatus(friendlyError(error, "The event could not be saved."), "error");
  } finally {
    setBusy(false);
  }
}

function subscribeToEvents() {
  elements.list.innerHTML = loadingMarkup();
  elements.featuredGrid.innerHTML = loadingMarkup("Loading featured events...");
  const publishedEvents = query(collection(db, "events"), where("status", "==", "published"));
  state.unsubscribe?.();
  state.unsubscribe = onSnapshot(publishedEvents, snapshot => {
    state.events = snapshot.docs.map(eventDoc => ({ id: eventDoc.id, ...eventDoc.data() }));
    renderEvents();
  }, error => {
    console.error("[Events] Loading failed", error);
    elements.list.innerHTML = `<div class="events-empty-state is-error"><div class="events-empty-illustration" aria-hidden="true">!</div><h3>Events could not be loaded</h3><p>${escapeHtml(friendlyError(error, "Please try again shortly."))}</p><button type="button" data-check-events>Try Again</button></div>`;
    elements.featuredSection.hidden = true;
  });
}

async function updateAdminState(user) {
  state.isAdmin = false;
  state.userId = user?.uid || "";
  elements.formPanel.hidden = false;
  if (!user) {
    elements.layout.classList.add("is-public-view");
    setStatus("Sign in to publish an event.", "info");
    renderEvents();
    return;
  }
  await loadRegistrations(user);
  try {
    const profile = await getUserDocument(user.uid);
    state.isAdmin = String(profile?.role || "").trim().toLowerCase() === "admin";
  } catch (error) {
    console.error("[Events] Admin role check failed", error);
  }
  elements.formPanel.hidden = false;
  elements.layout.classList.remove("is-public-view");
  setStatus("You can publish events with this account.", "info");
  renderEvents();
}

elements.filters.forEach(button => button.addEventListener("click", () => {
  state.activeFilter = button.dataset.filter;
  elements.filters.forEach(item => item.classList.toggle("active", item === button));
  renderEvents();
}));
elements.search.addEventListener("input", renderEvents);
elements.form.addEventListener("submit", submitEvent);
elements.cancelEdit.addEventListener("click", () => resetForm());
elements.list.addEventListener("click", event => {
  const registerButton = event.target.closest("[data-register-event]");
  const editButton = event.target.closest("[data-edit-event]");
  const deleteButton = event.target.closest("[data-delete-event]");
  const retryButton = event.target.closest("[data-check-events]");
  if (registerButton) registerForEvent(registerButton.dataset.registerEvent, registerButton);
  if (editButton) beginEdit(editButton.dataset.editEvent);
  if (deleteButton) deleteEvent(deleteButton.dataset.deleteEvent);
  if (retryButton) subscribeToEvents();
});

observeAuthState(updateAdminState);
subscribeToEvents();

window.addEventListener("beforeunload", () => state.unsubscribe?.());
