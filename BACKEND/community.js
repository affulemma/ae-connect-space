import { db } from "./firebase-config.js";
import { requireAuthenticatedUser } from "./auth.js";
import { getUserDocument } from "./firestore.js";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const defaultDiscussions = [
  { id: "excel-economics", name: "Kwame Mensah", initials: "KM", topic: "Economics", time: "2 hours ago", title: "What Excel skills should an Economics student master by Level 300?", body: "I am currently in Level 200 and trying to figure out which Excel functions are absolutely essential before my internship applications.", likes: 56, replies: [{ name: "Ama Boateng", text: "Start with pivot tables, XLOOKUP, IF statements, charts, and cleaning messy datasets. Then learn how to explain insights clearly." }] },
  { id: "gis-remote-sensing", name: "Akosua Darko", initials: "AD", topic: "Geography", time: "5 hours ago", title: "GIS vs Remote Sensing - which one should I prioritize first?", body: "I am a Level 200 Geography student and my department is pushing us toward GIS, but I also hear remote sensing is in high demand.", likes: 42, replies: [{ name: "Kofi Asante", text: "Learn basic GIS first because it helps you understand layers, coordinate systems, and map layouts. Remote sensing becomes easier after that." }] },
  { id: "portfolio-cs", name: "Yaw Boateng", initials: "YB", topic: "Computer Science", time: "1 day ago", title: "How to build a coding portfolio with zero experience", body: "I just started Level 100 Computer Science and want to know the best way to start building projects that employers actually care about.", likes: 73, replies: [{ name: "Kwame Asante", text: "Build tiny but finished projects. A calculator is fine if it is clean, hosted, and documented." }] },
  { id: "clinical-placement", name: "Nana Ama", initials: "NA", topic: "Nursing", time: "1 day ago", title: "Best nursing clinical placements in Accra - reviews and tips", body: "Has anyone done clinical placement at Korle-Bu or 37 Military Hospital? I want honest reviews about which departments give the best hands-on experience.", likes: 38, replies: [{ name: "Grace Owusu", text: "Korle-Bu is intense but you learn fast. Go with a notebook, ask questions respectfully, and volunteer for tasks." }] },
  { id: "cpa-acca", name: "Efua Osei", initials: "EO", topic: "Accounting", time: "2 days ago", title: "CPA vs ACCA - which certification is better for Ghana?", body: "I am in Level 300 Accounting and starting to think about certifications. Is CPA recognized enough here, or should I go for ACCA?", likes: 49, replies: [{ name: "Samuel Adjei", text: "Both are respected. ACCA is more internationally portable, CPA Ghana is strong locally." }] }
];

const defaultGroups = [
  { id: "economics", title: "Economics Students", topic: "Economics", text: "Econometrics, Excel, Stata, policy writing, internships.", features: "Group Chat - Resources - Announcements" },
  { id: "gis", title: "GIS Community", topic: "Geography", text: "QGIS, ArcGIS, remote sensing, GPS, cartography, drone mapping.", features: "Map Reviews - Files - Discussions" },
  { id: "python", title: "Python Learners", topic: "Computer Science", text: "Python basics, automation, data analysis, portfolio projects.", features: "Code Help - Project Rooms" },
  { id: "nursing", title: "Nursing Students", topic: "Nursing", text: "Clinical documentation, public health, research, care practice.", features: "Announcements - Resource Sharing" },
  { id: "law", title: "Law Students", topic: "Law", text: "Legal research, case analysis, advocacy, legal writing.", features: "Discussion Boards - PDFs" },
  { id: "research", title: "Research Methods", topic: "Research", text: "Survey design, literature review, citations, analysis, reporting.", features: "Resource Library - Peer Review" }
];

function savedJoinedGroups() {
  try {
    return JSON.parse(localStorage.getItem("aeConnectJoinedAcademicGroups") || "[]");
  } catch {
    localStorage.removeItem("aeConnectJoinedAcademicGroups");
    return [];
  }
}

const state = {
  user: null,
  profile: null,
  discussions: [],
  groups: [...defaultGroups],
  joinedGroups: new Set(savedJoinedGroups()),
  activeTopic: "all",
  activeGroupId: "economics",
  activeProfileGroupId: "economics",
  activeMessagesUnsubscribe: null,
  profileZoomLevel: 1,
  groupPictureDataUrl: "",
  viewportCleanup: null,
  voiceStart: null,
  voiceTimer: null
};

const elements = {
  discussionList: document.getElementById("discussionList"),
  discussionSearch: document.getElementById("discussionSearch"),
  topicButtons: [...document.querySelectorAll("[data-topic]")],
  academicCommunityGrid: document.getElementById("academicCommunityGrid"),
  discussionModal: document.getElementById("discussionModal"),
  discussionForm: document.getElementById("discussionForm"),
  groupModal: document.getElementById("groupModal"),
  groupForm: document.getElementById("groupForm"),
  groupPicture: document.getElementById("groupPicture"),
  groupPicturePreview: document.getElementById("groupPicturePreview"),
  groupProfileModal: document.getElementById("groupProfileModal"),
  groupProfilePhotoFrame: document.getElementById("groupProfilePhotoFrame"),
  groupProfileZoom: document.getElementById("groupProfileZoom"),
  groupProfileTopic: document.getElementById("groupProfileTopic"),
  groupProfileTitle: document.getElementById("groupProfileTitle"),
  groupProfileDescription: document.getElementById("groupProfileDescription"),
  groupProfileFeatures: document.getElementById("groupProfileFeatures"),
  groupProfileChatButton: document.getElementById("groupProfileChatButton"),
  groupChatModal: document.getElementById("groupChatModal"),
  groupChatList: document.getElementById("groupChatList"),
  groupChatMessages: document.getElementById("groupChatMessages"),
  groupChatTitle: document.getElementById("groupChatTitle"),
  groupChatStatus: document.getElementById("groupChatStatus"),
  groupChatAvatar: document.getElementById("groupChatAvatar"),
  groupChatProfileButton: document.getElementById("groupChatProfileButton"),
  groupChatForm: document.getElementById("groupChatForm"),
  groupMessageInput: document.getElementById("groupMessageInput"),
  groupAttachment: document.getElementById("groupAttachment"),
  groupTyping: document.getElementById("groupTyping"),
  voiceButton: document.getElementById("voiceButton")
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

function initials(value) {
  return String(value || "Group").split(/\s+/).filter(Boolean).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "GP";
}

function currentUserName() {
  return state.profile?.fullName || state.user?.displayName || state.user?.email?.split("@")[0] || "A.E CONNECT Member";
}

function formatTime(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : null;
  if (!date) return "Sending...";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function relativeTime(value) {
  const date = value?.toDate ? value.toDate() : null;
  if (!date) return "Just now";
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function groupAvatarMarkup(group, className = "group-avatar") {
  if (group.picture) {
    return `<span class="${className} image"><img src="${escapeHtml(group.picture)}" alt="${escapeHtml(group.title)} group picture"></span>`;
  }
  return `<span class="${className}">${escapeHtml(initials(group.title))}</span>`;
}

function groupById(groupId) {
  return state.groups.find(group => group.id === groupId) || state.groups[0] || defaultGroups[0];
}

function saveJoinedGroups() {
  localStorage.setItem("aeConnectJoinedAcademicGroups", JSON.stringify([...state.joinedGroups]));
}

function renderDiscussions() {
  const term = elements.discussionSearch.value.trim().toLowerCase();
  const discussions = [...state.discussions, ...defaultDiscussions];
  const filtered = discussions.filter(item => {
    const matchesTopic = state.activeTopic === "all" || item.topic === state.activeTopic;
    const text = `${item.name} ${item.topic} ${item.title} ${item.body}`.toLowerCase();
    return matchesTopic && text.includes(term);
  });

  elements.discussionList.innerHTML = filtered.map(item => `
    <article class="discussion-card" data-id="${escapeHtml(item.id)}">
      <div class="discussion-avatar">${escapeHtml(item.initials)}</div>
      <div class="discussion-main">
        <div class="discussion-meta"><strong>${escapeHtml(item.name)}</strong><span>in</span><b>${escapeHtml(item.topic)}</b><small>${escapeHtml(item.time)}</small></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
        <div class="discussion-actions">
          <button type="button" data-toggle-replies="${escapeHtml(item.id)}">${item.replies.length} replies</button>
          <button type="button">${item.likes} likes</button>
          <button type="button">Connect</button>
        </div>
        <div class="reply-panel" id="replies-${escapeHtml(item.id)}" hidden>
          <div class="reply-list">${item.replies.map(reply => `<div class="reply-item"><strong>${escapeHtml(reply.name)}</strong><p>${escapeHtml(reply.text)}</p></div>`).join("")}</div>
        </div>
      </div>
    </article>
  `).join("") || '<p class="events-empty">No discussion matches your search yet.</p>';
}

function subscribeToDiscussions() {
  onSnapshot(query(collection(db, "community"), orderBy("createdAt", "desc"), limit(25)), snapshot => {
    state.discussions = snapshot.docs.map(discussionDoc => {
      const data = discussionDoc.data();
      const name = data.name || "A.E CONNECT Member";
      return {
        id: discussionDoc.id,
        name,
        initials: initials(name),
        topic: data.topic || "Community",
        time: relativeTime(data.createdAt),
        title: data.title || "Community Discussion",
        body: data.body || "",
        likes: 0,
        replies: []
      };
    });
    renderDiscussions();
  }, error => {
    console.error("[Community] Could not load discussions", {
      code: error.code,
      message: error.message
    });
    renderDiscussions();
  });
}

function renderCreatePicturePreview() {
  if (state.groupPictureDataUrl) {
    elements.groupPicturePreview.innerHTML = `<img src="${escapeHtml(state.groupPictureDataUrl)}" alt="Selected group picture"><p>Group picture selected</p>`;
    return;
  }
  elements.groupPicturePreview.innerHTML = "<span>GP</span><p>No group picture selected</p>";
}

function renderAcademicGroups() {
  elements.academicCommunityGrid.innerHTML = state.groups.map(group => {
    const isJoined = state.joinedGroups.has(group.id);
    return `
      <article class="academic-community-card${isJoined ? " joined" : ""}">
        <button class="group-card-profile" type="button" data-view-group="${escapeHtml(group.id)}">${groupAvatarMarkup(group)}<span><b>${escapeHtml(group.title)}</b><small>View group profile</small></span></button>
        <p>${escapeHtml(group.text)}</p>
        <strong>${escapeHtml(group.features)}</strong>
        <div class="academic-card-actions">
          <button type="button" data-join-group="${escapeHtml(group.id)}">${isJoined ? "Open Chat" : "Join Group"}</button>
          ${isJoined ? `<button class="leave-group-button" type="button" data-leave-group="${escapeHtml(group.id)}">Leave Group</button>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function renderGroupChatList() {
  elements.groupChatList.innerHTML = state.groups.map(group => `
    <div class="group-list-row ${group.id === state.activeGroupId ? "active" : ""}">
      <button type="button" data-open-chat-group="${escapeHtml(group.id)}">${groupAvatarMarkup(group, "group-list-avatar")}<div><strong>${escapeHtml(group.title)}</strong><small>${state.joinedGroups.has(group.id) ? "Joined group" : "Tap to join"}</small></div></button>
      <button class="group-list-profile" type="button" data-view-group="${escapeHtml(group.id)}">Profile</button>
    </div>
  `).join("");
}

function renderMessage(message) {
  const isMine = message.userId === state.user.uid;
  const from = isMine ? "You" : message.userName || "Member";
  const time = formatTime(message.createdAt);

  if (message.type === "system") {
    return `<div class="chat-system-message">${escapeHtml(message.text)} <span>${escapeHtml(time)}</span></div>`;
  }
  if (message.type === "voice") {
    return `<div class="chat-bubble ${isMine ? "mine" : "theirs"}"><small>${escapeHtml(from)}</small><p class="voice-note"><span></span> Voice note ${escapeHtml(message.duration || "0:01")}</p><time>${escapeHtml(time)}</time></div>`;
  }
  if (message.type === "file") {
    return `<div class="chat-bubble ${isMine ? "mine" : "theirs"}"><small>${escapeHtml(from)}</small><p>Attachment: ${escapeHtml(message.attachmentName || message.text)}</p><time>${escapeHtml(time)}</time></div>`;
  }
  return `<div class="chat-bubble ${isMine ? "mine" : "theirs"}"><small>${escapeHtml(from)}</small><p>${escapeHtml(message.text)}</p><time>${escapeHtml(time)}</time></div>`;
}

function renderGroupHeader(groupId) {
  const group = groupById(groupId);
  elements.groupChatTitle.textContent = group.title;
  elements.groupChatStatus.textContent = state.joinedGroups.has(group.id) ? "Online - Group chat open" : "Preview - Join to participate";
  elements.groupChatAvatar.innerHTML = group.picture ? `<img src="${escapeHtml(group.picture)}" alt="${escapeHtml(group.title)} group picture">` : escapeHtml(initials(group.title));
  renderGroupChatList();
}

function showChatMessage(message) {
  elements.groupChatMessages.innerHTML = `<div class="chat-system-message">${escapeHtml(message)}</div>`;
}

function lockChatPageScroll() {
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add("group-chat-active");
  document.body.classList.add("group-chat-active", "community-modal-open");
  document.body.dataset.communityScrollY = String(scrollY);
  document.body.dataset.communityPosition = document.body.style.position || "";
  document.body.dataset.communityTop = document.body.style.top || "";
  document.body.dataset.communityWidth = document.body.style.width || "";
  document.body.dataset.communityOverflow = document.body.style.overflow || "";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
}

function unlockChatPageScroll() {
  const scrollY = Number(document.body.dataset.communityScrollY || 0);
  document.documentElement.classList.remove("group-chat-active");
  document.body.classList.remove("group-chat-active", "community-modal-open");
  document.body.style.position = document.body.dataset.communityPosition || "";
  document.body.style.top = document.body.dataset.communityTop || "";
  document.body.style.width = document.body.dataset.communityWidth || "";
  document.body.style.overflow = document.body.dataset.communityOverflow || "";
  delete document.body.dataset.communityScrollY;
  delete document.body.dataset.communityPosition;
  delete document.body.dataset.communityTop;
  delete document.body.dataset.communityWidth;
  delete document.body.dataset.communityOverflow;
  window.scrollTo(0, scrollY);
}

function isSmallScreen() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function updateChatViewportHeight() {
  if (!window.visualViewport) return;
  const height = Math.floor(window.visualViewport.height);
  document.documentElement.style.setProperty("--community-chat-height", `${height}px`);
}

function watchChatViewport() {
  updateChatViewportHeight();
  if (!window.visualViewport || state.viewportCleanup) return;
  window.visualViewport.addEventListener("resize", updateChatViewportHeight);
  window.visualViewport.addEventListener("scroll", updateChatViewportHeight);
  state.viewportCleanup = () => {
    window.visualViewport.removeEventListener("resize", updateChatViewportHeight);
    window.visualViewport.removeEventListener("scroll", updateChatViewportHeight);
    document.documentElement.style.removeProperty("--community-chat-height");
  };
}

function stopWatchingChatViewport() {
  if (state.viewportCleanup) state.viewportCleanup();
  state.viewportCleanup = null;
}

function friendlyFirestoreError(error, action) {
  if (error?.code === "permission-denied") {
    return `${action} is blocked by Firestore rules. Publish the updated community rules, then refresh this page.`;
  }

  if (error?.code === "failed-precondition") {
    return `${action} needs a Firestore index. Open the Firebase console link in your browser console to create it.`;
  }

  if (error?.code === "unavailable") {
    return `${action} is temporarily unavailable. Please try again in a moment.`;
  }

  return `${action} failed. ${error?.code || "unknown"}: ${error?.message || "Please try again."}`;
}

function subscribeToGroupMessages(groupId) {
  if (state.activeMessagesUnsubscribe) state.activeMessagesUnsubscribe();

  showChatMessage("Loading group messages...");
  const messagesQuery = query(
    collection(db, "communityGroups", groupId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );

  state.activeMessagesUnsubscribe = onSnapshot(messagesQuery, snapshot => {
    if (snapshot.empty) {
      showChatMessage("No messages yet. Start the conversation.");
      return;
    }

    elements.groupChatMessages.innerHTML = snapshot.docs.map(messageDoc => renderMessage(messageDoc.data())).join("");
    elements.groupChatMessages.scrollTop = elements.groupChatMessages.scrollHeight;
  }, error => {
    console.error("[Community] Could not load group messages", {
      groupId,
      code: error.code,
      message: error.message
    });
    showChatMessage(friendlyFirestoreError(error, "Messages"));
  });
}

function openGroupChat(groupId) {
  state.activeGroupId = groupId;
  state.joinedGroups.add(groupId);
  saveJoinedGroups();
  renderAcademicGroups();
  renderGroupHeader(groupId);
  subscribeToGroupMessages(groupId);
  elements.groupChatModal.hidden = false;
  lockChatPageScroll();
  watchChatViewport();
  if (!isSmallScreen()) {
    elements.groupMessageInput.focus();
  }
}

function closeGroupChat() {
  elements.groupChatModal.hidden = true;
  stopWatchingChatViewport();
  unlockChatPageScroll();
  clearInterval(state.voiceTimer);
  state.voiceStart = null;
  elements.voiceButton.textContent = "Mic";
  if (state.activeMessagesUnsubscribe) state.activeMessagesUnsubscribe();
  state.activeMessagesUnsubscribe = null;
}

async function createMessage(data) {
  const groupId = state.activeGroupId;
  const text = data.text?.trim();
  if (!text && data.type !== "voice") return;

  await addDoc(collection(db, "communityGroups", groupId, "messages"), {
    groupId,
    text: text || "",
    type: data.type || "text",
    duration: data.duration || "",
    attachmentName: data.attachmentName || "",
    userId: state.user.uid,
    userName: currentUserName(),
    userEmail: state.user.email || "",
    createdAt: serverTimestamp()
  });
}

function renderProfilePhoto(group) {
  const scale = `scale(${state.profileZoomLevel})`;
  if (group.picture) {
    elements.groupProfilePhotoFrame.innerHTML = `<img src="${escapeHtml(group.picture)}" alt="${escapeHtml(group.title)} group picture" style="transform:${scale}">`;
    return;
  }
  elements.groupProfilePhotoFrame.innerHTML = `<span style="transform:${scale}">${escapeHtml(initials(group.title))}</span>`;
}

function openGroupProfile(groupId) {
  state.activeProfileGroupId = groupId;
  state.profileZoomLevel = 1;
  elements.groupProfileZoom.value = state.profileZoomLevel;
  const group = groupById(groupId);
  elements.groupProfileTopic.textContent = group.topic || "Study Group";
  elements.groupProfileTitle.textContent = group.title;
  elements.groupProfileDescription.textContent = group.text;
  elements.groupProfileFeatures.textContent = group.features;
  renderProfilePhoto(group);
  elements.groupProfileModal.hidden = false;
  document.body.classList.add("community-modal-open");
}

function closeModal(modal) {
  modal.hidden = true;
  if (elements.discussionModal.hidden && elements.groupModal.hidden && elements.groupProfileModal.hidden && elements.groupChatModal.hidden) {
    document.body.classList.remove("community-modal-open");
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizedGroup(raw) {
  return {
    id: raw.id,
    title: raw.title || "Study Group",
    topic: raw.topic || "Study Group",
    text: raw.text || raw.description || "A.E CONNECT study group.",
    features: raw.features || "Group Chat",
    picture: raw.picture || ""
  };
}

function subscribeToGroups() {
  onSnapshot(query(collection(db, "communityGroups"), orderBy("title", "asc")), snapshot => {
    const liveGroups = snapshot.docs.map(groupDoc => normalizedGroup({ id: groupDoc.id, ...groupDoc.data() }));
    const merged = new Map(defaultGroups.map(group => [group.id, group]));
    liveGroups.forEach(group => merged.set(group.id, group));
    state.groups = [...merged.values()];
    renderAcademicGroups();
    if (!elements.groupChatModal.hidden) renderGroupHeader(state.activeGroupId);
  }, error => {
    console.error("[Community] Could not load groups", {
      code: error.code,
      message: error.message
    });
    state.groups = [...defaultGroups];
    renderAcademicGroups();
  });
}

function bindEvents() {
  elements.topicButtons.forEach(button => button.addEventListener("click", () => {
    state.activeTopic = button.dataset.topic;
    elements.topicButtons.forEach(item => item.classList.toggle("active", item === button));
    renderDiscussions();
  }));

  elements.discussionSearch.addEventListener("input", renderDiscussions);

  elements.discussionList.addEventListener("click", event => {
    const replyToggle = event.target.closest("[data-toggle-replies]");
    if (!replyToggle) return;
    const panel = document.getElementById(`replies-${replyToggle.dataset.toggleReplies}`);
    if (panel) panel.hidden = !panel.hidden;
  });

  elements.academicCommunityGrid.addEventListener("click", event => {
    const profileButton = event.target.closest("[data-view-group]");
    if (profileButton) {
      openGroupProfile(profileButton.dataset.viewGroup);
      return;
    }

    const leaveButton = event.target.closest("[data-leave-group]");
    if (leaveButton) {
      state.joinedGroups.delete(leaveButton.dataset.leaveGroup);
      saveJoinedGroups();
      renderAcademicGroups();
      if (state.activeGroupId === leaveButton.dataset.leaveGroup && !elements.groupChatModal.hidden) closeGroupChat();
      return;
    }

    const joinButton = event.target.closest("[data-join-group]");
    if (joinButton) openGroupChat(joinButton.dataset.joinGroup);
  });

  elements.groupChatList.addEventListener("click", event => {
    const profileButton = event.target.closest("[data-view-group]");
    if (profileButton) {
      openGroupProfile(profileButton.dataset.viewGroup);
      return;
    }

    const button = event.target.closest("[data-open-chat-group]");
    if (button) openGroupChat(button.dataset.openChatGroup);
  });

  elements.groupChatProfileButton.addEventListener("click", () => openGroupProfile(state.activeGroupId));
  document.querySelectorAll("[data-close-chat]").forEach(button => button.addEventListener("click", closeGroupChat));
  elements.groupChatModal.addEventListener("touchmove", event => {
    if (!event.target.closest("#groupChatMessages")) {
      event.preventDefault();
    }
  }, { passive: false });

  document.querySelectorAll("[data-audio-call],[data-video-call]").forEach(button => button.addEventListener("click", async () => {
    const callType = button.hasAttribute("data-audio-call") ? "Audio call" : "Video call";
    await createMessage({ type: "system", text: `${callType} requested by ${currentUserName()}.` });
  }));

  elements.groupMessageInput.addEventListener("input", () => {
    elements.groupTyping.textContent = "You are typing...";
    elements.groupTyping.hidden = elements.groupMessageInput.value.trim().length === 0;
  });

  elements.groupChatForm.addEventListener("submit", async event => {
    event.preventDefault();
    const submitButton = elements.groupChatForm.querySelector('button[type="submit"]');
    const text = elements.groupMessageInput.value.trim();
    if (!text) return;

    submitButton.disabled = true;
    try {
      await createMessage({ text });
      elements.groupMessageInput.value = "";
      elements.groupTyping.hidden = true;
    } catch (error) {
      console.error("[Community] Could not send message", {
        code: error.code,
        message: error.message
      });
      showChatMessage(friendlyFirestoreError(error, "Your message"));
    } finally {
      submitButton.disabled = false;
    }
  });

  elements.groupAttachment.addEventListener("change", async () => {
    const file = elements.groupAttachment.files[0];
    if (!file) return;
    await createMessage({ type: "file", text: file.name, attachmentName: file.name });
    elements.groupAttachment.value = "";
  });

  elements.voiceButton.addEventListener("click", async () => {
    if (!state.voiceStart) {
      state.voiceStart = Date.now();
      elements.voiceButton.textContent = "Stop 0:00";
      state.voiceTimer = setInterval(() => {
        const seconds = Math.floor((Date.now() - state.voiceStart) / 1000);
        elements.voiceButton.textContent = `Stop 0:${String(seconds).padStart(2, "0")}`;
      }, 500);
      return;
    }

    const seconds = Math.max(1, Math.floor((Date.now() - state.voiceStart) / 1000));
    clearInterval(state.voiceTimer);
    state.voiceStart = null;
    elements.voiceButton.textContent = "Mic";
    await createMessage({ type: "voice", duration: `0:${String(seconds).padStart(2, "0")}` });
  });

  document.getElementById("startDiscussionButton").addEventListener("click", () => {
    elements.discussionModal.hidden = false;
    document.body.classList.add("community-modal-open");
    document.getElementById("discussionName").value = currentUserName();
    document.getElementById("discussionName").focus();
  });

  document.querySelectorAll("[data-close-discussion]").forEach(button => button.addEventListener("click", () => closeModal(elements.discussionModal)));

  document.getElementById("createGroupButton").addEventListener("click", () => {
    elements.groupModal.hidden = false;
    document.body.classList.add("community-modal-open");
    document.getElementById("groupName").focus();
  });

  document.querySelectorAll("[data-close-group]").forEach(button => button.addEventListener("click", () => closeModal(elements.groupModal)));
  document.querySelectorAll("[data-close-profile]").forEach(button => button.addEventListener("click", () => closeModal(elements.groupProfileModal)));

  elements.groupPicture.addEventListener("change", async () => {
    const file = elements.groupPicture.files[0];
    state.groupPictureDataUrl = file ? await fileToDataUrl(file) : "";
    renderCreatePicturePreview();
  });

  elements.groupProfileZoom.addEventListener("input", () => {
    state.profileZoomLevel = Math.min(2.4, Math.max(1, Number(elements.groupProfileZoom.value) || 1));
    renderProfilePhoto(groupById(state.activeProfileGroupId));
  });

  document.querySelectorAll("[data-profile-zoom]").forEach(button => button.addEventListener("click", () => {
    const direction = button.dataset.profileZoom === "in" ? 0.2 : -0.2;
    state.profileZoomLevel = Math.min(2.4, Math.max(1, state.profileZoomLevel + direction));
    elements.groupProfileZoom.value = state.profileZoomLevel;
    renderProfilePhoto(groupById(state.activeProfileGroupId));
  }));

  elements.groupProfileChatButton.addEventListener("click", () => {
    closeModal(elements.groupProfileModal);
    openGroupChat(state.activeProfileGroupId);
  });

  elements.groupForm.addEventListener("submit", async event => {
    event.preventDefault();
    const submitButton = elements.groupForm.querySelector('button[type="submit"]');
    const title = document.getElementById("groupName").value.trim();
    const topic = document.getElementById("groupTopic").value;
    const text = document.getElementById("groupDescription").value.trim();
    const features = document.getElementById("groupFeatures").value.trim().replace(/\s*,\s*/g, " - ");
    const groupRef = doc(collection(db, "communityGroups"));

    submitButton.disabled = true;
    try {
      const newGroup = {
        id: groupRef.id,
        title,
        topic,
        text,
        features: features || `${topic} - Group Chat`,
        picture: state.groupPictureDataUrl
      };

      await setDoc(groupRef, {
        title: newGroup.title,
        topic: newGroup.topic,
        text: newGroup.text,
        features: newGroup.features,
        picture: newGroup.picture,
        createdBy: state.user.uid,
        createdByName: currentUserName(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      state.groups = [newGroup, ...state.groups];
      elements.groupForm.reset();
      state.groupPictureDataUrl = "";
      renderCreatePicturePreview();
      closeModal(elements.groupModal);
      openGroupChat(groupRef.id);
    } catch (error) {
      console.error("[Community] Could not create group", {
        code: error.code,
        message: error.message
      });
      alert("Group could not be created. Please check your connection and Firestore rules.");
    } finally {
      submitButton.disabled = false;
    }
  });

  elements.discussionForm.addEventListener("submit", async event => {
    event.preventDefault();
    const submitButton = elements.discussionForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      await addDoc(collection(db, "community"), {
        name: document.getElementById("discussionName").value.trim() || currentUserName(),
        topic: document.getElementById("discussionTopic").value,
        title: document.getElementById("discussionTitle").value.trim(),
        body: document.getElementById("discussionBody").value.trim(),
        userId: state.user.uid,
        userEmail: state.user.email || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      elements.discussionForm.reset();
      closeModal(elements.discussionModal);
    } catch (error) {
      console.error("[Community] Could not post discussion", {
        code: error.code,
        message: error.message
      });
      alert("Discussion could not be posted. Please check your connection and try again.");
    } finally {
      submitButton.disabled = false;
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!elements.discussionModal.hidden) closeModal(elements.discussionModal);
    if (!elements.groupModal.hidden) closeModal(elements.groupModal);
    if (!elements.groupProfileModal.hidden) closeModal(elements.groupProfileModal);
    if (!elements.groupChatModal.hidden) closeGroupChat();
  });
}

async function initCommunity() {
  state.user = await requireAuthenticatedUser("auth.html");
  if (!state.user) return;

  bindEvents();
  renderCreatePicturePreview();
  renderDiscussions();
  renderAcademicGroups();

  try {
    state.profile = await getUserDocument(state.user.uid);
  } catch (error) {
    console.error("[Community] Could not load user profile", {
      code: error.code,
      message: error.message
    });
  }

  subscribeToDiscussions();
  subscribeToGroups();
}

initCommunity();
