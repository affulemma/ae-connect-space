import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./firebase-config.js";

const storyHost = document.getElementById("homePublishedStories");

function timestampValue(value) {
  if (value && typeof value.toMillis === "function") return value.toMillis();
  const parsed = Date.parse(value || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function initials(name) {
  const letters = String(name || "A.E CONNECT")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join("");
  return letters.toUpperCase() || "AE";
}

function emptyState(title, message) {
  const state = document.createElement("div");
  state.className = "home-story-empty";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const copy = document.createElement("p");
  copy.textContent = message;
  state.append(heading, copy);
  return state;
}

function storyCard(story) {
  const card = document.createElement("blockquote");
  const label = document.createElement("small");
  label.className = "sample-label";
  label.textContent = story.category || "Student story";

  const body = document.createElement("p");
  const description = String(story.description || story.title || "").trim();
  body.textContent = description;

  const footer = document.createElement("footer");
  const avatar = document.createElement("span");
  avatar.textContent = initials(story.author);
  const identity = document.createElement("div");
  const author = document.createElement("b");
  author.textContent = story.author || "A.E CONNECT editorial team";
  const meta = document.createElement("small");
  meta.textContent = story.title || story.category || "Published story";
  identity.append(author, meta);
  footer.append(avatar, identity);
  card.append(label, body, footer);
  return card;
}

async function loadPublishedStories() {
  if (!storyHost) return;

  try {
    const snapshot = await getDocs(collection(db, "stories"));
    const stories = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(story => String(story.status || "").toLowerCase() === "published")
      .filter(story => String(story.description || story.title || "").trim())
      .sort((a, b) => timestampValue(b.updatedAt || b.createdAt) - timestampValue(a.updatedAt || a.createdAt))
      .slice(0, 2);

    storyHost.replaceChildren();
    if (!stories.length) {
      storyHost.append(emptyState(
        "No verified student stories yet",
        "Stories will appear here after they are reviewed and published by an administrator."
      ));
      return;
    }

    stories.forEach(story => storyHost.append(storyCard(story)));
  } catch (error) {
    console.error("Unable to load published homepage stories:", error);
    storyHost.replaceChildren(emptyState(
      "Stories are unavailable right now",
      "We could not connect to the published stories collection. Please try again later."
    ));
  } finally {
    storyHost.setAttribute("aria-busy", "false");
  }
}

loadPublishedStories();
