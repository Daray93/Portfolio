import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { isSupported, getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM5JRyvGrDke4OVKYKUgZLV_UA8KaazCc",
  authDomain: "portfolio-2025-a4c0b.firebaseapp.com",
  projectId: "portfolio-2025-a4c0b",
  storageBucket: "portfolio-2025-a4c0b.firebasestorage.app",
  messagingSenderId: "681527952315",
  appId: "1:681527952315:web:2f029b5bb9bdae17467a9e",
  measurementId: "G-QMFVMC1HTC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);

// Resolves to a real Analytics instance or null -- isSupported() is async
// (it checks things like IndexedDB/cookie availability, which can fail in
// private browsing or with tracking blockers) rather than throwing and
// taking the rest of the app down with it if analytics just isn't
// available for this visitor.
export const analyticsReady = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);
