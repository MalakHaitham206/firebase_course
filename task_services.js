// Firestore task management service
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  limit,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { db } from "./firebase.js";
import { ui, elements } from "./ui.js";

// Task service class
export class TaskService {
  constructor() {
    this.unsubscribeFromTasks = null;
    this.unsubscribeFromReport = null;
    this.currentUser = null;
    this.initializeEventListeners();
  }

  // Generic error handler
  handleError(error, userMessage = "An error occurred. Please try again.") {
    console.error(error);
    ui.showMessage(
      "An error occurred. Please try again." || userMessage,
      "error"
    );
  }

  // Initialize event listeners for task operations
  initializeEventListeners() {
    // Add task button
    elements.addTaskBtn.addEventListener("click", () => {
      try {
        this.addTask();
      } catch (error) {
        this.handleError(error, "Failed to add task.");
      }
    });

    // Enter key in task input
    elements.taskInput.addEventListener("keypress", (e) => {
      try {
        if (e.key === "Enter") this.addTask();
      } catch (error) {
        this.handleError(error, "Failed to add task.");
      }
    });

    // Task action buttons (using event delegation)
    elements.taskList.addEventListener("click", (e) => {
      try {
        const button = e.target.closest("button[data-action]");
        if (!button) return;

        const taskId = button.dataset.taskId;
        const action = button.dataset.action;

        if (action === "toggle") {
          const completed = button.dataset.completed === "true";
          this.toggleTask(taskId, completed);
        } else if (action === "delete") {
          this.deleteTask(taskId);
        }
      } catch (error) {
        this.handleError(error, "Task action failed.");
      }
    });

    // Report button event listener
    document.addEventListener("click", (e) => {
      try {
        if (e.target.id === "report-btn") {
          this.generateReport();
        }
      } catch (error) {
        this.handleError(error, "Failed to generate report.");
      }
    });
  }

  // Set current user and start listening to tasks
  setUser(user) {
    try {
      this.currentUser = user;
      if (user) {
        try {
          this.loadTasks();
        } catch (error) {
          this.handleError(error, error.message || "Failed to load tasks.");
        }

        this.addReportButton(); // Add report button when user is set
      } else {
        this.stopListening();
        this.removeReportButton(); // Remove report button when user logs out
      }
    } catch (error) {
      this.handleError(error, "Failed to set user.");
    }
  }

  // Add a new task
  async addTask() {
    const taskText = elements.taskInput.value.trim();
    if (!taskText || !this.currentUser) return;

    ui.setButtonLoading(elements.addTaskBtn, "⏳ Adding...");

    try {
      await addDoc(collection(db, "tasks"), {
        text: taskText,
        completed: false,
        userId: this.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      ui.clearTaskInput();
    } catch (error) {
      this.handleError(error, "Failed to add task. Please try again.");
    } finally {
      ui.setButtonLoading(elements.addTaskBtn, "⏳ Adding...", false);
    }
  }

  // Toggle task completion status
  async toggleTask(taskId, currentCompleted) {
    if (!this.currentUser) return;

    try {
      await updateDoc(doc(db, "tasks", taskId), {
        completed: !currentCompleted,
      });
    } catch (error) {
      this.handleError(error, "Failed to update task. Please try again.");
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    if (!this.currentUser) return;

    // Optional: Add confirmation dialog
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      this.handleError(error, "Failed to delete task. Please try again.");
    }
  }

  // Load tasks with real-time listener
  loadTasks() {
    if (!this.currentUser) return;
    try {
      const tasksQuery = query(
        collection(db, "tasks"),
        where("userId", "==", this.currentUser.uid),
        limit(100),
        orderBy("createdAt", "desc")
      );

      this.unsubscribeFromTasks = onSnapshot(
        tasksQuery,
        (querySnapshot) => {
          try {
            ui.displayTasks(querySnapshot.docs);
          } catch (error) {
            this.handleError(error, "Failed to display tasks.");
          }
        },
        (error) => {
          this.handleError(
            error,
            "Failed to load tasks. Please refresh the page."
          );
        }
      );
    } catch (error) {
      this.handleError(error, "Failed to load tasks.");
    }
  }

  // Stop listening to tasks
  stopListening() {
    try {
      if (this.unsubscribeFromTasks) {
        this.unsubscribeFromTasks();
        this.unsubscribeFromTasks = null;
      }
      if (this.unsubscribeFromReport) {
        this.unsubscribeFromReport();
        this.unsubscribeFromReport = null;
      }
    } catch (error) {
      this.handleError(error, "Failed to stop listeners.");
    }
  }

  // Batch operations (for future enhancements)
  async batchDeleteCompleted() {
    if (!this.currentUser) return;
    try {
      // This would require fetching completed tasks and batch deleting them
      // Implementation depends on specific requirements
      console.log("Batch delete completed tasks - to be implemented");
    } catch (error) {
      this.handleError(error, "Failed to batch delete completed tasks.");
    }
  }

  async batchToggleAll(completed = true) {
    if (!this.currentUser) return;
    try {
      // This would require fetching all tasks and batch updating them
      // Implementation depends on specific requirements
      console.log("Batch toggle all tasks - to be implemented");
    } catch (error) {
      this.handleError(error, "Failed to batch toggle tasks.");
    }
  }

  // Task statistics
  getTaskStats(tasks) {
    try {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((doc) => doc.data().completed).length;
      const pendingTasks = totalTasks - completedTasks;

      return {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      };
    } catch (error) {
      this.handleError(error, "Failed to calculate task statistics.");
      return {
        total: 0,
        completed: 0,
        pending: 0,
        completionRate: 0,
      };
    }
  }

  // Generate a report of tasks
  async generateReport() {
    if (!this.currentUser) {
      ui.showMessage("Please sign in to view your report.");
      return;
    }

    // Show report section
    ui.showReportSection();
    ui.updateReportContent("📊 Loading report...");

    // Stop any existing report listener
    if (this.unsubscribeFromReport) {
      this.unsubscribeFromReport();
    }

    try {
      // Listen for task changes and display report
      const tasksQuery = query(
        collection(db, "tasks"),
        where("userId", "==", this.currentUser.uid)
      );

      this.unsubscribeFromReport = onSnapshot(
        tasksQuery,
        (querySnapshot) => {
          try {
            const tasks = querySnapshot.docs;

            const stats = this.getTaskStats(tasks);

            let reportContent = `
            <div class="report-stats">
              <h3>📈 Task Statistics</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-number">${stats.total}</span>
                  <span class="stat-label">Total Tasks</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">${stats.completed}</span>
                  <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">${stats.pending}</span>
                  <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">${Math.round(
                    stats.completionRate
                  )}%</span>
                  <span class="stat-label">Completion Rate</span>
                </div>
              </div>
            </div>
          `;

            if (tasks.length > 0) {
              reportContent += `
              <div class="report-tasks">
                <h4>📝 All Tasks</h4>
                <div class="report-task-list">
                  ${tasks
                    .map((doc) => {
                      const task = doc.data();
                      const createdAt = task.createdAt
                        ? new Date(task.createdAt.toDate()).toLocaleDateString()
                        : "Unknown date";
                      return `
                      <div class="report-task-item ${
                        task.completed ? "completed" : "pending"
                      }">
                        <span class="task-status">${
                          task.completed ? "✅" : "⏳"
                        }</span>
                        <span class="task-text">${task.text}</span>
                        <span class="task-date">${createdAt}</span>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              </div>
            `;
            } else {
              reportContent += `
              <div class="report-empty">
                <p>No tasks found. Start adding some tasks to see your report!</p>
              </div>
            `;
            }

            ui.updateReportContent(reportContent);
          } catch (error) {
            this.handleError(error, "Failed to generate report.");
          }
        },
        (error) => {
          this.handleError(error, "Failed to listen for report updates.");
        }
      );
    } catch (error) {
      this.handleError(error, "Failed to generate report.");
    }
  }

  // Add a "Report" button to the UI
  addReportButton() {
    try {
      // Remove existing report button if any
      this.removeReportButton();

      const reportBtn = document.createElement("button");
      reportBtn.textContent = "📊 View Report";
      reportBtn.id = "report-btn";
      reportBtn.className = "btn btn-secondary btn-small";
      reportBtn.style.margin = "10px";
      reportBtn.style.top = "10px";
      reportBtn.style.right = "10px";
      reportBtn.style.alignSelf = "flex-end";

      // Add the button next to the logout button
      const appContainer = document.querySelector(".app-container");
      if (appContainer) {
        appContainer.style.position = "relative"; // Ensure relative positioning
        appContainer.insertBefore(reportBtn, appContainer.firstChild);
      }
    } catch (error) {
      this.handleError(error, "Failed to add report button.");
    }
  }

  // Remove report button
  removeReportButton() {
    try {
      const existingBtn = document.getElementById("report-btn");
      if (existingBtn) {
        existingBtn.remove();
      }
    } catch (error) {
      this.handleError(error, "Failed to remove report button.");
    }
  }
}

export const taskService = new TaskService();
