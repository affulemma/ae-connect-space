import { loginWithEmail, logoutUser, observeAuthState, protectPage, registerWithEmail } from "./auth.js";

const dashboardPath = "dashboard.html";
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

function friendlyFirebaseError(error) {
  const code = error && error.code ? error.code : "";
  if (code.includes("email-already-in-use")) return "This email is already registered. Please login instead.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("weak-password")) return "Please use a stronger password with at least 6 characters.";
  if (code.includes("permission-denied")) return `Firestore write failed: ${error.message}`;
  if (code.includes("unavailable")) return `Firestore is unavailable: ${error.message}`;
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Login failed. Check your email and password.";
  }
  return error && error.message ? error.message : "Something went wrong. Please try again.";
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
    showMessage("Creating your account...");
    authFlowInProgress = true;

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
      showMessage("Account and profile saved successfully. Opening your dashboard...");
      window.location.href = dashboardPath;
    } catch (error) {
      console.error("[Register] Registration flow failed", {
        code: error.code,
        message: error.message,
        error
      });
      showMessage(friendlyFirebaseError(error), "error");
      authFlowInProgress = false;
    }
  });
}

function setupLoginForm() {
  const loginForm = byId("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    showMessage("Logging you in...");
    authFlowInProgress = true;

    try {
      await loginWithEmail(readValue("loginEmail").toLowerCase(), byId("loginPassword").value);
      showMessage("Login successful. Opening your dashboard...");
      window.location.href = dashboardPath;
    } catch (error) {
      console.error("[Login] Login flow failed", {
        code: error.code,
        message: error.message,
        error
      });
      showMessage(friendlyFirebaseError(error), "error");
      authFlowInProgress = false;
    }
  });
}

function setupLogout() {
  const logoutButtons = document.querySelectorAll("[data-firebase-logout], #logoutBtn");
  logoutButtons.forEach(button => {
    button.addEventListener("click", async () => {
      await logoutUser();
      window.location.href = "auth.html#login";
    });
  });
}

function setupAuthRedirect() {
  if (!document.body.classList.contains("auth-page")) return;

  observeAuthState(user => {
    if (user && !authFlowInProgress) {
      window.location.href = dashboardPath;
    }
  });
}

function setupDashboardProtection() {
  if (!document.body.classList.contains("student-dashboard-page")) return;
  protectPage("auth.html#login");
}

setupPasswordToggles();
setupAuthTabs();
setupRegisterForm();
setupLoginForm();
setupLogout();
setupAuthRedirect();
setupDashboardProtection();
