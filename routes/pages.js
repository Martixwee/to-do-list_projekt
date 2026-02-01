const fs = require("fs");
const path = require("path");
const store = require("../storage/tasksStore");

// Pomocná funkce pro načítání HTML šablon
function loadView(name) {
  return fs.readFileSync(path.join(__dirname, "../views", name), "utf-8");
}

// Pomocná funkce pro nahrazování {{proměnných}} v HTML
function render(tpl, data) {
  let html = tpl;
  for (const key in data) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
  }
  return html;
}

function handlePages(req, res) {
  const tasks = store.getAll();

  // --- HLAVNÍ STRÁNKA (Seznam) ---
  if (req.url === "/" && req.method === "GET") {
const rows = tasks.map(t => `
  <tr>
    <td>${t.id}</td>
    <td>${t.title}</td>
    <td>${t.completed ? '✅ Hotovo' : '⏳ Čeká'}</td>
    <td>
      <button data-done-id="${t.id}" data-current-state="${t.completed}">
        ${t.completed ? 'Zrušit' : 'Hotovo'}
      </button>
      <a href="/edit/${t.id}"><button type="button">Upravit</button></a>
      <button data-delete-id="${t.id}">Smazat</button>
    </td>
  </tr>
`).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, { rows: rows || '<tr><td colspan="4">Žádné úkoly.</td></tr>' });

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(render(loadView("layout.html"), { title: "ToDo List", content }));
  }

  // --- STRÁNKA ÚPRAVY (Edit) ---
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      res.writeHead(404);
      return res.end("Úkol nenalezen");
    }

    const editTpl = loadView("edit.html");
    const content = render(editTpl, {
      id: task.id,
      title: task.title,
      checked: task.completed ? "checked" : ""
    });

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(render(loadView("layout.html"), { title: "Upravit úkol", content }));
  }

  return false;
}

module.exports = { handlePages };