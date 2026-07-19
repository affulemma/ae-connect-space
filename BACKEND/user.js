import { loginWithEmail, logoutUser, observeAuthState, registerWithEmail, requireAuthenticatedUser } from "./auth.js";
import { getUserDocument } from "./firestore.js";

const dashboardPath = "dashboard.html";
const authPath = "auth.html";
let authFlowInProgress = false;

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

  try {
    const profile = await getUserDocument(user.uid);
    const data = profile || {};
    const fullName = cleanUserValue(data.fullName) || cleanUserValue(user.displayName) || getUserFieldDefault("fullName");
    const email = cleanUserValue(data.email) || cleanUserValue(user.email);
    const university = cleanUserValue(data.university);
    const programme = cleanUserValue(data.programme);
    const level = cleanUserValue(data.level);
    const country = cleanUserValue(data.country);

    setUserField("fullName", fullName);
    setUserField("email", email);
    setUserField("university", university);
    setUserField("programme", programme);
    setUserField("level", level);
    setUserField("country", country);
    setUserField("countryLabel", country ? `Country: ${country}` : getUserFieldDefault("countryLabel"));
    setUserField("programmeLevel", formatProgrammeLevel(programme, level));

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
setupAuthRedirect();
setupDashboardProtection();
