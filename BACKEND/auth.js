import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "./firebase-config.js";
import { createUserDocument } from "./firestore.js";

export async function registerWithEmail(profile) {
  console.info("[Auth] Creating Firebase Authentication user", {
    email: profile.email
  });

  const credential = await createUserWithEmailAndPassword(auth, profile.email, profile.password);
  console.info("[Auth] Firebase Authentication user created", {
    uid: credential.user.uid,
    email: credential.user.email
  });

  await updateProfile(credential.user, {
    displayName: profile.fullName
  });
  console.info("[Auth] User profile updated", {
    uid: credential.user.uid,
    displayName: profile.fullName
  });

  await createUserDocument(credential.user, profile);
  return credential.user;
}

export async function loginWithEmail(email, password) {
  console.info("[Auth] Signing in Firebase user", {
    email
  });

  const credential = await signInWithEmailAndPassword(auth, email, password);
  console.info("[Auth] Firebase user signed in", {
    uid: credential.user.uid,
    email: credential.user.email
  });
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export function protectPage(redirectTo = "auth.html") {
  return observeAuthState(user => {
    if (!user) {
      window.location.href = redirectTo;
    }
  });
}
