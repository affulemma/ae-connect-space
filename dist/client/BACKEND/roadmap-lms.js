import { db } from "./firebase-config.js";
import { requireAuthenticatedUser } from "./auth.js";
import { getUserDocument } from "./firestore.js";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const state = { user: null, profile: null, roadmapId: "", roadmap: null, stages: [], lessons: [], skills: [], progress: null };
const $ = id => document.getElementById(id);
const clean = value => String(value || "").trim();
const sorted = rows => [...rows].sort((a, b) => (a.order || 0) - (b.order || 0));
const listValue = value => clean(value).split(/\n|,/).map(item => item.trim()).filter(Boolean);
function feedback(message) { if ($("builderFeedback")) $("builderFeedback").textContent = message; }
async function rowsFor(name, roadmapId) {
  const snapshot = await getDocs(query(collection(db, name), where("roadmapId", "==", roadmapId)));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}
function draggableItem(row, kind, subtitle) {
  return `<article class="builder-item" draggable="true" data-kind="${kind}" data-id="${row.id}"><div class="builder-item-top"><span class="drag-handle">⋮⋮</span><div class="builder-item-copy"><strong>${escapeText(row.title || row.name)}</strong><small>${escapeText(subtitle)}</small></div></div><div class="builder-item-actions"><button type="button" data-edit-${kind}="${row.id}">Edit</button><button type="button" data-delete-${kind}="${row.id}">Delete</button></div></article>`;
}
function escapeText(value) { const node = document.createElement("div"); node.textContent = value || ""; return node.innerHTML; }
function renderBuilder() {
  $("lessonStage").innerHTML = sorted(state.stages).map(stage => `<option value="${stage.id}">${escapeText(stage.title)}</option>`).join("");
  $("stageList").innerHTML = sorted(state.stages).map(stage => draggableItem(stage, "stage", stage.description || "Roadmap stage")).join("") || "<p>No stages yet.</p>";
  $("lessonList").innerHTML = sorted(state.lessons).map(lesson => draggableItem(lesson, "lesson", `${state.stages.find(stage => stage.id === lesson.stageId)?.title || "No stage"} · ${lesson.status} · ${lesson.estimatedTime}`)).join("") || "<p>No learning items yet.</p>";
  $("skillList").innerHTML = sorted(state.skills).map(skill => draggableItem(skill, "skill", `${skill.category} · ${skill.level}`)).join("") || "<p>No skills yet.</p>";
  $("roadmapPublishedLessons").textContent = state.lessons.filter(item => item.status === "Published").length;
  $("roadmapDraftLessons").textContent = state.lessons.filter(item => item.status !== "Published").length;
  bindDragLists();
}
async function loadAnalytics() {
  const progress = await rowsFor("studentProgress", state.roadmapId);
  $("roadmapStudentsEnrolled").textContent = progress.length;
  const rate = progress.length ? Math.round(progress.reduce((sum, row) => sum + Number(row.percentage || 0), 0) / progress.length) : 0;
  $("roadmapCompletionRate").textContent = `${rate}%`;
}
async function openBuilder(id, title) {
  state.roadmapId = id;
  $("roadmapBuilder").hidden = false;
  $("roadmapBuilderSubtitle").textContent = title;
  feedback("Loading learning journey...");
  [state.stages, state.lessons, state.skills] = await Promise.all([rowsFor("roadmapStages", id), rowsFor("roadmapLessons", id), rowsFor("skills", id)]);
  renderBuilder();
  await loadAnalytics();
  feedback("Learning journey ready.");
  $("roadmapBuilder").scrollIntoView({ behavior: "smooth", block: "start" });
}
function clearForm(kind) {
  const form = $(`${kind}Form`); form?.reset();
  const id = $(`${kind}Id`); if (id) id.value = "";
}
async function saveStage(event) {
  event.preventDefault(); const id = clean($("stageId").value);
  const data = { roadmapId: state.roadmapId, title: clean($("stageTitle").value), description: clean($("stageDescription").value), status: "Active", order: id ? state.stages.find(item => item.id === id)?.order || 1 : state.stages.length + 1, updatedAt: serverTimestamp() };
  if (id) await updateDoc(doc(db, "roadmapStages", id), data); else await addDoc(collection(db, "roadmapStages"), { ...data, createdAt: serverTimestamp() });
  clearForm("stage"); await openBuilder(state.roadmapId, $("roadmapBuilderSubtitle").textContent); feedback("Stage saved.");
}
async function saveLesson(event) {
  event.preventDefault(); const id = clean($("lessonId").value);
  const data = { roadmapId: state.roadmapId, stageId: $("lessonStage").value, title: clean($("lessonTitle").value), description: clean($("lessonDescription").value), skillCategory: clean($("lessonCategory").value), resourceType: $("lessonResourceType").value, externalLink: clean($("lessonLink").value), estimatedTime: clean($("lessonTime").value), difficulty: $("lessonDifficulty").value, status: $("lessonStatus").value, order: id ? state.lessons.find(item => item.id === id)?.order || 1 : state.lessons.length + 1, updatedAt: serverTimestamp() };
  if (id) await updateDoc(doc(db, "roadmapLessons", id), data); else await addDoc(collection(db, "roadmapLessons"), { ...data, createdAt: serverTimestamp() });
  clearForm("lesson"); await openBuilder(state.roadmapId, $("roadmapBuilderSubtitle").textContent); feedback("Learning item saved.");
}
async function saveSkill(event) {
  event.preventDefault(); const id = clean($("skillId").value);
  const data = { roadmapId: state.roadmapId, name: clean($("skillName").value), description: clean($("skillDescription").value), level: $("skillLevel").value, category: clean($("skillCategory").value), relatedResources: listValue($("skillResources").value), order: id ? state.skills.find(item => item.id === id)?.order || 1 : state.skills.length + 1, updatedAt: serverTimestamp() };
  if (id) await updateDoc(doc(db, "skills", id), data); else await addDoc(collection(db, "skills"), { ...data, createdAt: serverTimestamp() });
  clearForm("skill"); await openBuilder(state.roadmapId, $("roadmapBuilderSubtitle").textContent); feedback("Skill saved.");
}
function loadEdit(kind, id) {
  const row = state[`${kind}s`].find(item => item.id === id); if (!row) return;
  $(`${kind}Id`).value = id;
  if (kind === "stage") { $("stageTitle").value = row.title || ""; $("stageDescription").value = row.description || ""; }
  if (kind === "lesson") { $("lessonStage").value = row.stageId; $("lessonTitle").value = row.title || ""; $("lessonDescription").value = row.description || ""; $("lessonCategory").value = row.skillCategory || ""; $("lessonResourceType").value = row.resourceType || "PDF"; $("lessonLink").value = row.externalLink || ""; $("lessonTime").value = row.estimatedTime || ""; $("lessonDifficulty").value = row.difficulty || "Beginner"; $("lessonStatus").value = row.status || "Draft"; }
  if (kind === "skill") { $("skillName").value = row.name || ""; $("skillDescription").value = row.description || ""; $("skillLevel").value = row.level || "Beginner"; $("skillCategory").value = row.category || ""; $("skillResources").value = (row.relatedResources || []).join("\n"); }
  $(`${kind}Form`).scrollIntoView({ behavior: "smooth", block: "center" });
}
async function removeItem(kind, id) {
  if (!confirm(`Delete this ${kind}?`)) return;
  if (kind === "stage") {
    const children = state.lessons.filter(item => item.stageId === id);
    if (children.length && !confirm(`This stage contains ${children.length} learning item(s). Delete them too?`)) return;
    await Promise.all(children.map(item => deleteDoc(doc(db, "roadmapLessons", item.id))));
  }
  const collectionName = { stage: "roadmapStages", lesson: "roadmapLessons", skill: "skills" }[kind];
  await deleteDoc(doc(db, collectionName, id));
  await openBuilder(state.roadmapId, $("roadmapBuilderSubtitle").textContent); feedback(`${kind[0].toUpperCase() + kind.slice(1)} deleted.`);
}
function bindDragLists() {
  document.querySelectorAll(".builder-item").forEach(item => {
    item.addEventListener("dragstart", () => item.classList.add("dragging"));
    item.addEventListener("dragend", async () => { item.classList.remove("dragging"); await persistOrder(item.dataset.kind); });
  });
  document.querySelectorAll(".builder-list").forEach(list => list.addEventListener("dragover", event => {
    event.preventDefault(); const dragging = document.querySelector(".builder-item.dragging"); if (!dragging || dragging.parentElement !== list) return;
    const after = [...list.querySelectorAll(".builder-item:not(.dragging)")].find(item => event.clientY <= item.getBoundingClientRect().top + item.offsetHeight / 2);
    list.insertBefore(dragging, after || null);
  }));
}
async function persistOrder(kind) {
  const collectionName = { stage: "roadmapStages", lesson: "roadmapLessons", skill: "skills" }[kind];
  const container = { stage: "stageList", lesson: "lessonList", skill: "skillList" }[kind];
  const batch = writeBatch(db);
  [...$(container).querySelectorAll(`[data-kind="${kind}"]`)].forEach((item, index) => batch.update(doc(db, collectionName, item.dataset.id), { order: index + 1, updatedAt: serverTimestamp() }));
  await batch.commit(); feedback(`${kind[0].toUpperCase() + kind.slice(1)} order saved.`);
}
function setupAdmin() {
  $("roadmaps").append($("roadmapBuilder"));
  document.addEventListener("click", event => {
    const manage = event.target.closest("[data-manage-roadmap]"); if (manage) openBuilder(manage.dataset.manageRoadmap, manage.dataset.roadmapTitle);
    ["stage", "lesson", "skill"].forEach(kind => {
      const edit = event.target.closest(`[data-edit-${kind}]`); if (edit) loadEdit(kind, edit.dataset[`edit${kind[0].toUpperCase() + kind.slice(1)}`]);
      const remove = event.target.closest(`[data-delete-${kind}]`); if (remove) removeItem(kind, remove.dataset[`delete${kind[0].toUpperCase() + kind.slice(1)}`]);
    });
    const cancel = event.target.closest("[data-builder-cancel]"); if (cancel) clearForm(cancel.dataset.builderCancel);
  });
  $("closeRoadmapBuilder").addEventListener("click", () => { $("roadmapBuilder").hidden = true; });
  $("stageForm").addEventListener("submit", saveStage); $("lessonForm").addEventListener("submit", saveLesson); $("skillForm").addEventListener("submit", saveSkill);
}
async function loadStudentJourney() {
  const programme = clean(state.profile?.programme), level = clean(state.profile?.level); if (!programme || !level) return;
  const roadmaps = await getDocs(query(collection(db, "roadmaps"), where("programme", "==", programme), where("level", "==", level), where("status", "==", "Published")));
  if (roadmaps.empty) return;
  state.roadmap = { id: roadmaps.docs[0].id, ...roadmaps.docs[0].data() }; state.roadmapId = state.roadmap.id;
  [state.stages, state.lessons, state.skills] = await Promise.all([rowsFor("roadmapStages", state.roadmapId), rowsFor("roadmapLessons", state.roadmapId), rowsFor("skills", state.roadmapId)]);
  state.lessons = state.lessons.filter(item => item.status === "Published");
  const progressRef = doc(db, "studentProgress", `${state.user.uid}_${state.roadmapId}`); const progressDoc = await getDoc(progressRef);
  state.progress = progressDoc.exists() ? progressDoc.data() : { completedLessonIds: [], recentlyCompleted: [] };
  renderStudentJourney();
}
function renderStudentJourney() {
  const completed = new Set(state.progress.completedLessonIds || []), lessons = sorted(state.lessons), stages = sorted(state.stages);
  const completedSkills = state.skills.filter(skill => { const related = lessons.filter(lesson => lesson.skillCategory === skill.category || lesson.skillCategory === skill.name); return related.length > 0 && related.every(lesson => completed.has(lesson.id)); });
  $("studentJourney").hidden = !stages.length;
  const next = lessons.find(item => !completed.has(item.id)); const currentStage = stages.find(item => item.id === next?.stageId) || stages.at(-1);
  document.querySelector("[data-current-stage]").textContent = currentStage?.title || "Roadmap complete";
  $("journeyStageList").innerHTML = stages.map((stage, stageIndex) => { const items = lessons.filter(item => item.stageId === stage.id); return `<section class="journey-stage"><header><span>STAGE ${stageIndex + 1}</span><h4>${escapeText(stage.title)}</h4></header><div class="journey-lessons">${items.map(item => `<label class="journey-lesson ${completed.has(item.id) ? "completed" : ""}"><input type="checkbox" data-complete-lesson="${item.id}" ${completed.has(item.id) ? "checked" : ""}><span><strong>${escapeText(item.title)}</strong><small>${escapeText(item.skillCategory)} · ${escapeText(item.estimatedTime)} · ${escapeText(item.difficulty)}</small></span>${item.externalLink ? `<a href="${escapeText(item.externalLink)}" target="_blank" rel="noopener">Open ${escapeText(item.resourceType)}</a>` : ""}</label>`).join("") || "<p>No published lessons in this stage.</p>"}</div></section>`; }).join("");
  $("recentLessonsList").innerHTML = (state.progress.recentlyCompleted || []).slice(0, 5).map(item => `<span>${escapeText(item.title)}</span>`).join("") || "<p>No lessons completed yet.</p>";
  const percentage = lessons.length ? Math.round(completed.size / lessons.length * 100) : 0;
  document.querySelector("[data-roadmap-progress-title]").textContent = `${percentage}% complete`;
  document.querySelector("[data-roadmap-progress-bar]").style.width = `${percentage}%`;
  document.querySelector("[data-roadmap-completed-skills]").textContent = String(completedSkills.length);
  document.querySelector("[data-roadmap-remaining-skills]").textContent = String(Math.max(0, state.skills.length - completedSkills.length));
  document.querySelector("[data-roadmap-total-skills]").textContent = String(state.skills.length);
  document.querySelector("[data-roadmap-next-skill-title]").textContent = next?.title || "Roadmap complete";
  document.querySelector("[data-roadmap-next-skill-copy]").textContent = next ? `Continue in ${currentStage?.title || "your roadmap"}.` : "You completed every published learning item.";
}
async function toggleLesson(input) {
  const completed = new Set(state.progress.completedLessonIds || []), lesson = state.lessons.find(item => item.id === input.dataset.completeLesson);
  if (input.checked) completed.add(lesson.id); else completed.delete(lesson.id);
  const lessons = sorted(state.lessons), next = lessons.find(item => !completed.has(item.id));
  const recently = input.checked ? [{ lessonId: lesson.id, title: lesson.title, completedAt: new Date().toISOString() }, ...(state.progress.recentlyCompleted || []).filter(item => item.lessonId !== lesson.id)].slice(0, 10) : (state.progress.recentlyCompleted || []).filter(item => item.lessonId !== lesson.id);
  const completedSkillIds = state.skills.filter(skill => { const related = lessons.filter(item => item.skillCategory === skill.category || item.skillCategory === skill.name); return related.length > 0 && related.every(item => completed.has(item.id)); }).map(skill => skill.id);
  const data = { userId: state.user.uid, roadmapId: state.roadmapId, completedLessonIds: [...completed], completedSkillIds, recentlyCompleted: recently, percentage: lessons.length ? Math.round(completed.size / lessons.length * 100) : 0, currentStageId: next?.stageId || "", nextLessonId: next?.id || "", enrolledAt: state.progress.enrolledAt || serverTimestamp(), updatedAt: serverTimestamp() };
  await setDoc(doc(db, "studentProgress", `${state.user.uid}_${state.roadmapId}`), data, { merge: true }); state.progress = { ...state.progress, ...data }; renderStudentJourney();
}
async function init() {
  state.user = await requireAuthenticatedUser("auth.html"); if (!state.user) return;
  if (document.body.classList.contains("ae-admin-page")) { setupAdmin(); return; }
  if (document.body.classList.contains("student-dashboard-page")) { state.profile = await getUserDocument(state.user.uid); $("journeyStageList").addEventListener("change", event => { if (event.target.matches("[data-complete-lesson]")) toggleLesson(event.target); }); await loadStudentJourney(); }
}
window.addEventListener("ae-connect:dashboard-roadmap-ready", () => {
  if (state.user && document.body.classList.contains("student-dashboard-page")) loadStudentJourney().catch(error => console.error("[Roadmap LMS]", error));
});
init().catch(error => console.error("[Roadmap LMS]", error));
