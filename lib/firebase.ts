import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6RcG-49C1QJ5eqn5GRLmjq-Lh_kSjc_o",
  authDomain: "calendar-7224a.firebaseapp.com",
  projectId: "calendar-7224a",
  storageBucket: "calendar-7224a.firebasestorage.app",
  messagingSenderId: "138611194506",
  appId: "1:138611194506:web:9ca944f6833d69c2afcb73",
  measurementId: "G-4TX6M9V5VW"
};

// Initialize Firebase, avoiding multiple allocations in Next.js dev mode
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the named service
export const db = getFirestore(app, "calendar");
