import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
