const fs = require("fs");
const path = require("path");
const store = require("../storage/tasksStore");

function loadView(name) {
  return fs.readFileSync(path.join(__dirname, "../views", name), "utf-8");
}

function render(tpl, data) {
  let html = tpl;
  for (const key in data) {
    const placeholder = `{{${key}}}`;
    const value = data[key] !== undefined ? data[key] : "";
    html = html.split(placeholder).join(value);
  }
  return html;
}

function handlePages(req, res) {
  // --- A: STATICKÉ SOUBORY (Správné odeslání app.js) ---
  if (req.url === "/js/app.js") {
    try {
      const jsPath = path.join(__dirname, "../public/app.js");
      const jsContent = fs.readFileSync(jsPath, "utf-8");
      res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
      return res.end(jsContent);
    } catch (e) {
      res.writeHead(404);
      return res.end("Soubor app.js nenalezen");
    }
  }

  // --- B: HLAVNÍ STRÁNKA ---
  if (req.url === "/" && req.method === "GET") {
const tasks = store.getAll();
const rows = tasks.map((t, index) => {
  const isDone = t.completed;
  // Třída pro přeškrtnutí a zelené pozadí celého řádku
  const rowClass = isDone ? 'row-completed' : '';
  const textClass = isDone ? 'text-completed' : '';

  return `
    <tr class="${rowClass}" data-status="${isDone ? 'completed' : 'pending'}">
      <td style="text-align:center">${index + 1}</td>
      <td class="${textClass}">
        <strong>${t.title}</strong>
      </td>
      <td style="text-align:center">
        <span class="badge ${isDone ? 'badge-done' : 'badge-wait'}">
          ${isDone ? '✅ Splněno' : '⏳ Nesplněno'}
        </span>
      </td>
      <td class="actions">
        <button data-done-id="${t.id}" data-current-state="${isDone}" class="btn-status">
          ${isDone ? '↩️ Zrušit' : '✔️ Hotovo'}
        </button>
        <a href="/edit/${t.id}"><button type="button">✏️ Upravit</button></a>
        <button data-delete-id="${t.id}" class="btn-del">🗑️ Smazat</button>
      </td>
    </tr>
  `;
}).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, { rows: rows || '<tr><td colspan="4">Seznam je prázdný.</td></tr>' });
    
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    const layout = loadView("layout.html");
    return res.end(render(layout, { 
      title: "ToDo List", 
      heading: "Můj seznam úkolů", 
      content: content 
    }));
  }

  // --- C: STRÁNKA ÚPRAVY ---
  if (req.url.startsWith("/edit/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const task = store.getAll().find(t => t.id === id);

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
    const layout = loadView("layout.html");
    return res.end(render(layout, { 
      title: "Upravit úkol", 
      heading: "Upravit úkol",
      content: content 
    }));
  }

  return false;
}

module.exports = { handlePages };