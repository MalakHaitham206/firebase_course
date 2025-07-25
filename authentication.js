// Authentication service module
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import { auth, db } from "./firebase.js";
import { ui, elements } from "./ui.js";

// Authentication state management
let currentUser = null;
let authStateChangeCallback = null;

// Initialize authentication listeners
export function initializeAuth(onAuthStateChange) {
  authStateChangeCallback = onAuthStateChange;

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (authStateChangeCallback) {
      authStateChangeCallback(user);
    }
  });

  setupAuthEventListeners();
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Setup event listeners for authentication
function setupAuthEventListeners() {
  // Register user
  elements.registerBtn.addEventListener("click", handleRegister);

  // Login user
  elements.loginBtn.addEventListener("click", handleLogin);

  // Google login
  elements.googleLoginBtn.addEventListener("click", handleGoogleLogin);

  // Logout user
  elements.logoutBtn.addEventListener("click", handleLogout);

  // Reset password
  elements.resetPasswordLink.addEventListener("click", handlePasswordReset);
}

// Handle user registration
async function handleRegister() {
  const name = elements.registerName.value.trim();
  const email = elements.registerEmail.value.trim();
  const password = elements.registerPassword.value;

  if (!validateRegistrationInput(name, email, password)) {
    return;
  }

  ui.setButtonLoading(elements.registerBtn, "⏳ Creating account...");

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName: name });
    ui.showMessage(
      "Account created successfully! Welcome to Taskty! 🎉",
      "success"
    );
    ui.clearAuthInputs();
  } catch (error) {
    ui.showMessage(getErrorMessage(error));
  } finally {
    ui.setButtonLoading(elements.registerBtn, "⏳ Creating account...", false);
  }
}

// Handle user login
async function handleLogin() {
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;

  if (!email || !password) {
    ui.showMessage("Please enter email and password");
    return;
  }

  ui.setButtonLoading(elements.loginBtn, "⏳ Signing in...");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    ui.clearAuthInputs();
  } catch (error) {
    ui.showMessage("Invalid email or password. Please try again.");
    ui.clearAuthInputs();
  } finally {
    ui.setButtonLoading(elements.loginBtn, "⏳ Signing in...", false);
  }
}

// Handle Google login
async function handleGoogleLogin() {
  if (currentUser) {
    ui.showMessage("You are already signed in.");
    return;
  }

  ui.setButtonLoading(elements.googleLoginBtn, "⏳ Signing in with Google...");

  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
    ui.showMessage("Welcome to Taskty! Let's get started! 🎉", "success");
  } catch (error) {
    ui.showMessage(getErrorMessage(error));
  } finally {
    ui.setButtonLoading(
      elements.googleLoginBtn,
      "⏳ Signing in with Google...",
      false
    );
  }
}

// Handle user logout
async function handleLogout() {
  try {
    await signOut(auth);
    ui.clearAuthInputs();
  } catch (error) {
    console.error("Error signing out:", error);
    ui.showMessage("Error signing out. Please try again.");
  }
}

// Handle password reset
async function handlePasswordReset() {
  const email = elements.loginEmail.value.trim();

  if (!email) {
    ui.showMessage("Please enter your email to reset password");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    ui.showMessage(
      "Password reset email sent! Please check your inbox.",
      "success"
    );
  } catch (error) {
    ui.showMessage(getErrorMessage(error));
  }
}

// Validation functions
function validateRegistrationInput(name, email, password) {
  if (!name || !email || !password) {
    ui.showMessage("Please fill in all fields");
    return false;
  }

  if (password.length < 6) {
    ui.showMessage("Password must be at least 6 characters");
    return false;
  }

  return true;
}

// Error message mapping
function getErrorMessage(error) {
  const errorMessages = {
    "auth/email-already-in-use":
      "This email is already registered. Please sign in instead.",
    "auth/weak-password":
      "Password is too weak. Please choose a stronger password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests":
      "Too many failed attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
  };

  return (
    errorMessages[error.code] ||
    error.message ||
    "An unexpected error occurred."
  );
}
