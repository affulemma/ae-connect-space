import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./firebase-config.js";

export async function createUserDocument(user, profile) {
  const userRef = doc(db, "users", user.uid);
  const userData = {
    uid: user.uid,
    fullName: profile.fullName,
    email: user.email,
    university: profile.university,
    programme: profile.programme,
    level: profile.level,
    country: profile.country,
    role: profile.role || "student",
    createdAt: serverTimestamp()
  };

  console.info("[Firestore] Preparing user document write", {
    collection: "users",
    path: `users/${user.uid}`,
    uid: user.uid,
    email: user.email
  });

  try {
    await setDoc(userRef, userData, { merge: true });
    console.info("[Firestore] User document write successful", {
      path: `users/${user.uid}`
    });
  } catch (error) {
    console.error("[Firestore] User document write failed", {
      path: `users/${user.uid}`,
      code: error.code,
      message: error.message,
      error
    });
    throw error;
  }

  return userData;
}

export async function getUserDocument(uid) {
  console.info("[Firestore] Reading user document", {
    collection: "users",
    path: `users/${uid}`,
    uid
  });

  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}
