const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "tasks.json");

function loadTasks() {
  try {
    // Pokud soubor neexistuje, vytvoříme ho, aby to nespadlo
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, "[]", "utf-8");
      return [];
    }
    const content = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(content || "[]");
  } catch (e) {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), "utf-8");
}

module.exports = {
  getAll: () => loadTasks(),
  
  create: (data) => {
    const tasks = loadTasks();
    const newTask = {
      id: Date.now(),
      // Ošetření, aby název nebyl prázdný
      title: data.title || "Bez názvu",
      completed: !!data.completed
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
  },

 // ... (začátek loadTasks a saveTasks zůstává stejný)
  update: (id, patch) => {
    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === Number(id)); // Převod na Number!
    if (idx === -1) return null;

    if (patch.title !== undefined) tasks[idx].title = patch.title;
    if (patch.completed !== undefined) tasks[idx].completed = patch.completed;

    saveTasks(tasks);
    return tasks[idx];
  },

  remove: (id) => {
    const tasks = loadTasks();
    const filtered = tasks.filter(t => t.id !== Number(id)); // Převod na Number!
    if (tasks.length === filtered.length) return false;
    saveTasks(filtered);
    return true;
  }
};