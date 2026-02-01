const fs = require("fs");
const path = require("path");

// Cesta k novému souboru tasks.json
const TASKS_FILE = path.join(__dirname, "..", "data", "tasks.json");

function loadTasks() {
  try {
    if (!fs.existsSync(TASKS_FILE)) return [];
    const raw = fs.readFileSync(TASKS_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.log("❌ Chyba při čtení tasks.json:", e.message);
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

function getAll() { return loadTasks(); }

function getById(id) {
  return loadTasks().find((t) => t.id === id) || null;
}

function create({ title }) {
  const tasks = loadTasks();
  const newId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const task = { id: newId, title, completed: false }; // Nový úkol je vždy nesplněný
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

function update(id, patch) {
  const tasks = loadTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  if (patch.title !== undefined) tasks[idx].title = patch.title;
  if (patch.completed !== undefined) tasks[idx].completed = patch.completed;

  saveTasks(tasks);
  return tasks[idx];
}

function remove(id) {
  const tasks = loadTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const removed = tasks.splice(idx, 1)[0];
  saveTasks(tasks);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };