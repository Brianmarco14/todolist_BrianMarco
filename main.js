document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".tab-button");
  const form = document.querySelector("form");
  const deleteAllButton = document.getElementById("delete-all");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      buttons.forEach((btn) => {
        const tab = this.getAttribute("data-tab");
        loadData(tab);
        btn.classList.remove("bg-blue-800", "text-white");
      });

      this.classList.add("bg-blue-800", "text-white");
    });
  });

  buttons[0].classList.add("bg-blue-800", "text-white");

  loadData("all");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addTask();
});
if (deleteAllButton) {
    deleteAllButton.addEventListener("click", removeAllTask);
}
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "Invalid Date" : date.toLocaleString();
}

const getCurrentDateTime = () => {
    return new Date().toISOString();
}

const saveToLocalStorage = (tasks) => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

const getTasks = () => {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

const generateTaskCode = () => {
    const tasks = getTasks();
    const lastTask = tasks[tasks.length - 1];
    const lastNumber = lastTask ? parseInt(lastTask.code.split("-")[1]) : 0;
    return `TASK-${String(lastNumber + 1).padStart(3, "0")}`;
}

const loadData = (tab) => {
    const taskContainer = document.getElementById("task-container");
    if (!taskContainer) return;

    taskContainer.innerHTML = "";

    const tasks = getTasks();
    let filteredTasks = [];

    const now = new Date();

    if (tab === "done") {
        filteredTasks = tasks.filter(task => task.is_done);
    } else if (tab === "overdue") {
        filteredTasks = tasks.filter(task => new Date(task.created_at).getDate() < now.getDate() && !task.is_done);
    } else {
        filteredTasks = tasks;
    }

    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskContainer.appendChild(taskElement);
    });
};

const createTaskElement = (task) => {
    const taskElement = document.createElement("div");
    taskElement.className =
      "flex-shrink-0 p-3 rounded-lg md:max-w-60 w-full " +
      (task.is_done ? "bg-green-800/10" : "bg-blue-800/10");

    taskElement.innerHTML = `
        <div class="flex items-center gap-3 pb-3">
                <input type="checkbox" ${task.is_done ? "checked" : ""} data-code="${task.code}">
            <div class="w-full">
                <div class="flex justify-between items-center w-full">
                    <p class="font-bold ${task.is_done ? "line-through" : ""}">${task.code}</p>
                    <button class="text-red-400 cursor-pointer delete-btn" data-code="${task.code}">x</button>
                </div>
                <p class="line-clamp-3 text-sm ${task.is_done ? "line-through" : ""}">${task.task}</p>
            </div>
        </div>
        <div class="flex justify-between py-2 border-t ">
            <p class="font-semibold text-sm text-end capitalize ${task.level === "low" ? "text-green-600" : task.level === "medium" ? "text-yellow-400" : "text-red-400"}">${task.level}</p>
            <p class="font-medium text-xs text-end">${formatDate(task.created_at)}</p>
        </div>
    `;

    taskElement.querySelector("input[type='checkbox']").addEventListener("change", function () {
        toggleTaskStatus(this.getAttribute("data-code"));
    });

    taskElement.querySelector(".delete-btn").addEventListener("click", function () {
        deleteTask(this.getAttribute("data-code"));
    });

    return taskElement;
};



const addTask = () => {
    const taskInput = document.getElementById("todo");
    const levelInput = document.getElementById("level");

    if (!taskInput.value.trim()) return alert("Task tidak boleh kosong!");

    const newTask = {
        code: generateTaskCode(),
        task: taskInput.value.trim(),
        level: levelInput.value,
        created_at: getCurrentDateTime(),
        is_done: false
    };

    const tasks = getTasks();
    tasks.push(newTask);
    saveToLocalStorage(tasks);
    loadData();

    taskInput.value = "";
}


const deleteTask = (taskCode) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

    let tasks = getTasks();
    tasks = tasks.filter(task => task.code !== taskCode);

    saveToLocalStorage(tasks);
    loadData();
}


const removeAllTask = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua tugas?")) return;
    localStorage.removeItem("tasks")
    loadData()
}

const toggleTaskStatus = (taskCode) => {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.code === taskCode);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].is_done = !tasks[taskIndex].is_done;
        saveToLocalStorage(tasks);
        loadData();
    }
}
