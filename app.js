// Main application initialization
import { initializeAuth } from "./authentication.js";
import { taskService } from "./task_services.js";
import { initializeUI, ui } from "./ui.js";

// Initialize the application
function initApp() {
  // Initialize UI components
  initializeUI();

  // Initialize authentication with state change handler
  initializeAuth(handleAuthStateChange);
}

// Handle authentication state changes
function handleAuthStateChange(user) {
  
  if (user) {
    // User is signed in
    console.log("User signed in:", user.email);
    ui.showApp(user);
    taskService.setUser(user);
  } else {
    // User is signed out
    console.log("User signed out");
    ui.showAuth();
    taskService.setUser(null);
  }
}

// Start the application when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
