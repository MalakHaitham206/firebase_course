// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkj8aBOxFjC3opy1q0y-HUR3Ex890_Jr0",
  authDomain: "tasktyapp-bdbf3.firebaseapp.com",
  projectId: "tasktyapp-bdbf3",
  storageBucket: "tasktyapp-bdbf3.firebasestorage.app",
  messagingSenderId: "413403670570",
  appId: "1:413403670570:web:cc78b9c866ebba2f36bb53",
  measurementId: "G-HGF4MLS2QH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app instance if needed elsewhere
export default app;
