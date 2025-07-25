// UI utility functions and DOM element references

// DOM Elements
export const elements = {
  authSection: document.getElementById("auth-section"),
  appSection: document.getElementById("app-section"),
  loginForm: document.getElementById("login-form"),
  registerForm: document.getElementById("register-form"),
  authMessage: document.getElementById("auth-message"),
  userNameSpan: document.getElementById("user-name"),
  taskCountSpan: document.getElementById("task-count"),
  taskInput: document.getElementById("task-input"),
  taskList: document.getElementById("task-list"),

  // Auth form elements
  loginEmail: document.getElementById("login-email"),
  loginPassword: document.getElementById("login-password"),
  loginBtn: document.getElementById("login-btn"),
  registerName: document.getElementById("register-name"),
  registerEmail: document.getElementById("register-email"),
  registerPassword: document.getElementById("register-password"),
  registerBtn: document.getElementById("register-btn"),
  googleLoginBtn: document.getElementById("google-login-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  addTaskBtn: document.getElementById("add-task-btn"),
  resetPasswordLink: document.getElementById("reset-password-link"),
  showRegisterLink: document.getElementById("show-register"),
  showLoginLink: document.getElementById("show-login"),

  // Report elements
  reportSection: document.getElementById("report-section"),
  reportContent: document.getElementById("report-content"),
  closeReportBtn: document.getElementById("close-report-btn"),
};

// UI state management
export const ui = {
  showAuth() {
    elements.authSection.classList.remove("hidden");
    elements.appSection.classList.add("hidden");
    this.hideReportSection();
  },

  showApp(user) {
    elements.authSection.classList.add("hidden");
    elements.appSection.classList.remove("hidden");
    elements.userNameSpan.textContent =
      user.displayName || user.email.split("@")[0];
  },

  showMessage(message, type = "error") {
    elements.authMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => (elements.authMessage.innerHTML = ""), 5000);
  },
  showMessage(message, type = "error") {
    // Show message in the task list area
    if (!elements.taskList) return;
    elements.taskList.innerHTML = ""; // Clear previous content
    if (!elements.authMessage) return;
    elements.authMessage.innerHTML = ""; // Clear previous messages
    // Display the message
    elements.taskList.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => (elements.authMessage.innerHTML = ""), 5000);
  },

  toggleAuthForms() {
    // Show register form
    elements.showRegisterLink.addEventListener("click", () => {
      elements.loginForm.classList.add("hidden");
      elements.registerForm.classList.remove("hidden");
    });

    // Show login form
    elements.showLoginLink.addEventListener("click", () => {
      elements.registerForm.classList.add("hidden");
      elements.loginForm.classList.remove("hidden");
    });
  },

  updateTaskCount(taskCount, completedCount) {
    elements.taskCountSpan.textContent = `${taskCount} total • ${completedCount} done`;
  },

  clearTaskInput() {
    elements.taskInput.value = "";
  },

  displayTasks(tasks) {
    const taskCount = tasks.length;
    const completedCount = tasks.filter((doc) => doc.data().completed).length;

    this.updateTaskCount(taskCount, completedCount);

    if (taskCount === 0) {
      elements.taskList.innerHTML = `
        <div class="empty-state">
          <h3>🌟 Ready to be productive?</h3>
          <p>Add your first task above and start achieving your goals!</p>
        </div>
      `;
      return;
    }

    elements.taskList.innerHTML = tasks
      .map((doc) => {
        const task = doc.data();
        return `
          <div class="task-item ${task.completed ? "completed" : ""}">
            <div class="task-text ${task.completed ? "completed" : ""}">${
          task.text
        }</div>
            <div class="task-actions">
              <button class="btn btn-accent btn-small" data-task-id="${
                doc.id
              }" data-completed="${task.completed}" data-action="toggle">
                ${task.completed ? "↶ Undo" : "✅ Complete"}
              </button>
              <button class="btn btn-danger btn-small" data-task-id="${
                doc.id
              }" data-action="delete">
                🗑️ Delete
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  },

  setButtonLoading(button, loadingText, isLoading = true) {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = loadingText;
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
  },

  clearAuthInputs() {
    elements.loginEmail.value = "";
    elements.loginPassword.value = "";
    elements.registerName.value = "";
    elements.registerEmail.value = "";
    elements.registerPassword.value = "";
  },

  // Report UI functions
  showReportSection() {
    let reportSection = elements.reportSection;
    if (!reportSection) {
      // Create report section if it doesn't exist
      reportSection = document.createElement("div");
      reportSection.id = "report-section";
      reportSection.className = "report-modal hidden";
      reportSection.innerHTML = `
        <div class="report-modal-content">
          <div class="report-header">
            <h2>📊 Task Report</h2>
            <button id="close-report-btn" class="btn btn-secondary btn-small">✕ Close</button>
          </div>
          <div id="report-content" class="report-body">
            Loading report...
          </div>
        </div>
      `;
      document.body.appendChild(reportSection);

      // Update elements reference
      elements.reportSection = reportSection;
      elements.reportContent = document.getElementById("report-content");
      elements.closeReportBtn = document.getElementById("close-report-btn");

      // Add close button event listener
      elements.closeReportBtn.addEventListener("click", () => {
        this.hideReportSection();
      });

      // Close on backdrop click
      reportSection.addEventListener("click", (e) => {
        if (e.target === reportSection) {
          this.hideReportSection();
        }
      });
    }

    reportSection.classList.remove("hidden");
  },

  hideReportSection() {
    if (elements.reportSection) {
      elements.reportSection.classList.add("hidden");
    }
  },

  updateReportContent(content) {
    if (elements.reportContent) {
      elements.reportContent.innerHTML = content;
    }
  },
};

// Initialize UI components
export function initializeUI() {
  ui.toggleAuthForms();
}
