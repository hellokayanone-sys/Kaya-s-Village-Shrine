import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- FIREBASE CONFIGURATION ---
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project.
// 3. Enable "Realtime Database" in the build menu and choose "Start in Test Mode" (read/write: true).
// 4. In Project Settings, register a web app and copy the "firebaseConfig" object below.

const firebaseConfig = {
  apiKey: "AIzaSyC9TAtU0T7VvBUdN4auPLoW3lEo6rBLytE",
  authDomain: "kaya-s-village-shrine.firebaseapp.com",
  projectId: "kaya-s-village-shrine",
  storageBucket: "kaya-s-village-shrine.firebasestorage.app",
  messagingSenderId: "347503970974",
  appId: "1:347503970974:web:a07f2b2ac4b1680e10c98f",
  measurementId: "G-WYGG01E9NH"
};

// Logic to check if the user has updated the placeholder values
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);