const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "tasks.json");

// Pomocná funkce pro načtení (ošetřuje chybu parsování)
function loadTasks() {
  try {
    const content = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(content || "[]");
  } catch (e) {
    return []; // Pokud soubor neexistuje nebo je rozbitý, vrátíme prázdné pole
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2));
}

module.exports = {
  getAll: () => loadTasks(),
  
  create: (data) => {
    const tasks = loadTasks();
    const newTask = {
      id: Date.now(),
      title: data.title,
      completed: !!data.completed
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
  },

  update: (id, patch) => {
    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    if (patch.title !== undefined) tasks[idx].title = patch.title;
    if (patch.completed !== undefined) tasks[idx].completed = patch.completed;

    saveTasks(tasks);
    return tasks[idx];
  },

  remove: (id) => {
    const tasks = loadTasks();
    const filtered = tasks.filter(t => t.id !== id);
    if (tasks.length === filtered.length) return false;
    saveTasks(filtered);
    return true;
  }
};