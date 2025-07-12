// Global List
let tasks = [];
let deleteAllTasksButton; // Declare globally or get it inside DOMContentLoaded
let currentFilter = 'open'; // Keep track of the currently active filter

// Variables for delete confirmation modal
let currentDeleteTarget = null; // To store id of task or 'all' for all tasks
let currentDeleteAction = null; // To store the function to execute (deleteTask or deleteAllTasks)


// --- Date Formatting Function ---
function getFormattedDate() {
  const date = new Date(); // Gets the current date and time

  const options = {
    weekday: 'long', // Full weekday name (e.g., "Saturday")
    day: 'numeric',  // Day of the month (e.g., "12")
    month: 'long',    // Full month name (e.g., "July")
    year: 'numeric'    // Full month name (e.g., "July")
  };

  // Uses toLocaleDateString to format the date according to the specified options
  // and the user's locale (or a specified locale like 'en-US' for consistency).
  return date.toLocaleDateString('id-ID', options);
}
// --- End Date Formatting Function ---


// Function to add a task
function addTask() {
  const taskInput = document.getElementById('task-input');
  const dueDateInput = document.getElementById('due-date-input');

  // Validate inputs
  if (taskInput.value.trim() === '' || dueDateInput.value.trim() === '') {
    alert('Please fill in both task and due date.');
    return; // Stop the function if validation fails
  }

  // Create a new task object
  const newTask = {
    id: Date.now(), // Unique ID based on current timestamp
    task: taskInput.value.trim(),
    dueDate: dueDateInput.value,
    completed: false,
    category: 'open' // Default category
  };

  // Add the new task to the tasks array
  tasks.push(newTask);

  // Clear the input fields and hide the modal
  taskInput.value = '';
  dueDateInput.value = '';
  document.getElementById('new-task-modal').classList.add('hidden');

  // Refresh the displayed task list with the current filter
  displayTasks(currentFilter);
  updateTaskCounts(); // Update counts after adding
  toggleDeleteAllButtonVisibility(); // Check visibility after adding a task
}

// Function to display tasks based on current filter
function displayTasks(filter = 'all') { // Default to 'all' if no filter is provided
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = ''; // Clear the current list

  let filteredTasks = [];
  if (filter === 'all') {
    filteredTasks = tasks;
  } else if (filter === 'open') {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (filter === 'closed') {
    filteredTasks = tasks.filter(task => task.completed);
  }

  if (filteredTasks.length === 0 && filter === 'all') {
    taskList.innerHTML = '<p class="text-center text-gray-500 mt-8">No tasks found. Click "New Task" to add one!</p>';
  } else if (filteredTasks.length === 0) {
    taskList.innerHTML = `<p class="text-center text-gray-500 mt-8">No ${filter} tasks found.</p>`;
  }


  filteredTasks.forEach(element => {
    const checkedIcon = element.completed ? 'fas fa-check-circle text-blue-500' : 'far fa-circle text-gray-300';
    // Apply strikethrough class if completed
    const completedClass = element.completed ? 'strikethrough' : '';

    const taskItem = `
  <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start space-x-4 task-item" data-task-id="${element.id}">
    <div class="flex-grow">
      <h3 class="font-semibold text-gray-800 ${completedClass}">${element.task}</h3>
      <div class="flex items-center text-gray-400 text-xs mt-2 ${completedClass}">
        <i class="far fa-clock mr-1"></i>
        <span>${new Date(element.dueDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
    </div>
    <div class="flex-shrink-0 flex flex-col items-end space-y-2">
      <button class="check-button" onclick="toggleTaskCompletion(${element.id})">
        <i class="${checkedIcon} text-2xl"></i>
      </button>
      <button class="delete-button text-red-500 hover:text-red-600" onclick="showDeleteConfirmation(${element.id}, 'single')">
        <i class="fas fa-trash-alt text-lg"></i>
      </button>
    </div>
  </div>
  `;
    taskList.innerHTML += taskItem;
  });
  // Always call this after rendering tasks
  toggleDeleteAllButtonVisibility();
}

// Functions to show/hide delete confirmation modal
function showDeleteConfirmation(targetId, type) {
  currentDeleteTarget = targetId; // Store ID of task or 'all'
  currentDeleteAction = type; // Store 'single' or 'all'

  const messageElement = document.getElementById('confirmation-message');
  if (type === 'all') {
    messageElement.textContent = 'Are you sure you want to delete ALL tasks? This action cannot be undone.';
  } else {
    const task = tasks.find(t => t.id === targetId);
    if (task) {
      messageElement.textContent = `Are you sure you want to delete "${task.task}"?`;
    } else {
      messageElement.textContent = 'Are you sure you want to delete this task?';
    }
  }
  document.getElementById('delete-confirmation-modal').classList.remove('hidden');
}

function hideDeleteConfirmation() {
  document.getElementById('delete-confirmation-modal').classList.add('hidden');
  currentDeleteTarget = null;
  currentDeleteAction = null;
}

// Handler for Confirm Delete button
function confirmDeletion() {
  if (currentDeleteAction === 'single') {
    actualDeleteTask(currentDeleteTarget);
  } else if (currentDeleteAction === 'all') {
    actualDeleteAllTasks();
  }
  hideDeleteConfirmation();
}

// Actual function to delete a specific task (formerly deleteTask)
function actualDeleteTask(id) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    displayTasks(currentFilter); // Refresh the displayed task list with the current filter
    updateTaskCounts(); // Update counts after deleting
    toggleDeleteAllButtonVisibility(); // Check visibility after deleting a task
  }
}

// Actual function to delete all tasks (formerly deleteAllTasks)
function actualDeleteAllTasks() {
  tasks = []; // Clear the tasks array
  displayTasks(currentFilter); // Refresh the displayed task list with the current filter
  updateTaskCounts(); // Update counts after deleting all
  toggleDeleteAllButtonVisibility(); // Check visibility after deleting all tasks
}

// Function to toggle task completion
function toggleTaskCompletion(id) {
  const task = tasks.find(task => task.id === id);
  if (task) {
    task.completed = !task.completed;
    displayTasks(currentFilter); // Refresh the displayed task list with the current filter
    updateTaskCounts(); // Update counts after toggling
  }
}

// Function to update task counts for filters
function updateTaskCounts() {
  document.getElementById('all-tasks-count').textContent = tasks.length;
  document.getElementById('open-tasks-count').textContent = tasks.filter(task => !task.completed).length;
  document.getElementById('closed-tasks-count').textContent = tasks.filter(task => task.completed).length;
}

// Toggles the visibility of the "Delete All Tasks" button
function toggleDeleteAllButtonVisibility() {
  if (deleteAllTasksButton) { // Ensure the button element is loaded
    if (tasks.length > 0) {
      deleteAllTasksButton.classList.remove('hidden');
    } else {
      deleteAllTasksButton.classList.add('hidden');
    }
  }
}

// Function to filter tasks
function filterTasks(filterType) {
  currentFilter = filterType; // Update the global currentFilter
  displayTasks(currentFilter); // Re-render tasks based on the current filter

  // Update active filter button styling
  document.querySelectorAll('.filter-button').forEach(button => {
    button.classList.remove('bg-blue-50', 'text-blue-600', 'font-semibold');
    button.classList.add('text-gray-600', 'font-medium', 'hover:bg-gray-100');
    // Also update the text color for the count span
    button.querySelector('span:last-child').classList.remove('bg-blue-600', 'text-white');
    button.querySelector('span:last-child').classList.add('text-gray-400');
  });

  const activeFilterButton = document.querySelector(`.filter-button[data-filter="${filterType}"]`);
  if (activeFilterButton) {
    activeFilterButton.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold');
    activeFilterButton.classList.remove('text-gray-600', 'font-medium', 'hover:bg-gray-100');
    // Set the background and text color for the count span of the active button
    activeFilterButton.querySelector('span:last-child').classList.add('bg-blue-600', 'text-white');
    activeFilterButton.querySelector('span:last-child').classList.remove('text-gray-400');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const newTastButton = document.getElementById('new-task-button');
  const newTaskModal = document.getElementById('new-task-modal');
  const addTaskButton = document.getElementById('add-task-button');
  const cancelTaskButton = document.getElementById('cancel-task-button');

  deleteAllTasksButton = document.getElementById('delete-all-tasks-button');

  const filterButtons = document.querySelectorAll('.filter-button');

  const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
  const confirmDeleteButton = document.getElementById('confirm-delete-button');
  const cancelDeleteButton = document.getElementById('cancel-delete-button');

  // --- Start of Date Display Integration ---
  const dateParagraph = document.querySelector('.date-display');
  if (dateParagraph) {
    dateParagraph.textContent = getFormattedDate();
  }
  // --- End of Date Display Integration ---

  // Function to handle tab switching
  const switchTab = (tabId) => {
    tabContents.forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(tabId).classList.remove('hidden');

    tabButtons.forEach(button => {
      button.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-gray-50');
      button.classList.add('text-gray-600', 'hover:bg-gray-50');
    });
    const activeTabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    activeTabButton.classList.add('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-gray-50');
    activeTabButton.classList.remove('text-gray-600', 'hover:bg-gray-50');
  };

  // Event listeners for tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
    });
  });

  // Initial active tab
  switchTab('today-task');
  updateTaskCounts(); // Initial update of counts
  toggleDeleteAllButtonVisibility(); // Set initial visibility on load

  // Event listeners for New Task modal
  newTastButton.addEventListener('click', () => {
    newTaskModal.classList.remove('hidden');
  });

  cancelTaskButton.addEventListener('click', () => {
    newTaskModal.classList.add('hidden');
  });

  addTaskButton.addEventListener('click', addTask);
  deleteAllTasksButton.addEventListener('click', () => showDeleteConfirmation('all', 'all'));

  // Event listeners for delete confirmation modal
  confirmDeleteButton.addEventListener('click', confirmDeletion);
  cancelDeleteButton.addEventListener('click', hideDeleteConfirmation);

  // Event listeners for filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterType = button.dataset.filter;
      filterTasks(filterType);
    });
  });

  // --- IMPORTANT CHANGE HERE ---
  // Initial display of tasks and set default filter to 'open'
  displayTasks('open');
  filterTasks('open'); // Ensure 'Open' filter button is active on load
});