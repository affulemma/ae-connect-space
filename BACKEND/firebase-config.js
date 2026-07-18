import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBl17wfPKFbgu49ttQVzIav-ecEoPCtTdw",
  authDomain: "ae-connect-space.firebaseapp.com",
  projectId: "ae-connect-space",
  storageBucket: "ae-connect-space.firebasestorage.app",
  messagingSenderId: "793938767881",
  appId: "1:793938767881:web:6f449d435d6cf9550a48d8",
  measurementId: "G-DD8DBRP584"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = isSupported()
  .then(supported => (supported ? getAnalytics(app) : null))
  .catch(() => null);
export { firebaseConfig };
