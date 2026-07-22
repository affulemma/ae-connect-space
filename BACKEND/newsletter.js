import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./firebase-config.js";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function subscriberId(email) {
  const bytes = new TextEncoder().encode(email);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function enhanceNewsletterForm(form, index) {
  if (form.dataset.newsletterReady === "true") return;
  const emailInput = form.querySelector('input[type="email"]');
  const submitButton = form.querySelector('button[type="submit"]');
  if (!emailInput || !submitButton) return;

  form.dataset.newsletterReady = "true";
  emailInput.required = true;
  emailInput.autocomplete = "email";
  emailInput.name ||= "email";

  const consentId = `newsletter-consent-${index}`;
  const consentLabel = document.createElement("label");
  consentLabel.className = "newsletter-consent";
  consentLabel.htmlFor = consentId;
  const consentInput = document.createElement("input");
  consentInput.id = consentId;
  consentInput.name = "newsletterConsent";
  consentInput.type = "checkbox";
  consentInput.required = true;
  const consentText = document.createElement("span");
  consentText.textContent = "I agree to have my email stored for A.E CONNECT roadmap, opportunity, and event updates.";
  consentLabel.append(consentInput, consentText);

  const feedback = document.createElement("p");
  feedback.className = "newsletter-feedback";
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  form.append(consentLabel, feedback);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.removeAttribute("data-state");
    if (!form.reportValidity()) return;

    const email = normalizeEmail(emailInput.value);
    if (!email || !consentInput.checked) return;
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    try {
      const id = await subscriberId(email);
      await setDoc(doc(db, "newsletterSubscribers", id), {
        email,
        consent: true,
        status: "subscribed",
        source: `${location.pathname}${location.search}`.slice(0, 180),
        createdAt: serverTimestamp()
      });
      form.reset();
      feedback.dataset.state = "success";
      feedback.textContent = "Subscribed successfully. Your email has been saved.";
    } catch (error) {
      console.error("Newsletter subscription failed:", error);
      feedback.dataset.state = "error";
      feedback.textContent = "We could not save your subscription. Please try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

document.querySelectorAll(".newsletter form").forEach(enhanceNewsletterForm);
