const store = require("../storage/tasksStore");

function readBodyJson(req, cb) {
  let body = "";
  req.on("data", (ch) => (body += ch));
  req.on("end", () => {
    const trimmed = body.trim();
    if (!trimmed) return cb(null, {});
    try {
      cb(null, JSON.parse(trimmed));
    } catch (e) {
      console.error("❌ Chyba parsování JSONu. Přijato:", body);
      cb(e);
    }
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiTasks(req, res) {
  // GET - Seznam všech úkolů
  if (req.url === "/api/tasks" && req.method === "GET") {
    return sendJson(res, 200, store.getAll());
  }

  // POST - Nový úkol
  if (req.url === "/api/tasks" && req.method === "POST") {
    return readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Neplatný JSON" });
      const title = String(data.title || "").trim();
      if (!title) return sendJson(res, 400, { error: "Chybí název" });
      
      const created = store.create({ title, completed: false });
      return sendJson(res, 201, created);
    });
  }

  // PUT - Úprava názvu NEBO změna stavu Hotovo
  if (req.url.startsWith("/api/tasks/") && req.method === "PUT") {
    const id = Number(req.url.split("/")[3]);
    return readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Neplatný JSON" });

      const patch = {};
      if (data.title !== undefined) patch.title = String(data.title).trim();
      if (data.completed !== undefined) patch.completed = Boolean(data.completed);

      const updated = store.update(id, patch);
      if (!updated) return sendJson(res, 404, { error: "Nenalezeno" });
      return sendJson(res, 200, updated);
    });
  }

  // DELETE - Smazání
  if (req.url.startsWith("/api/tasks/") && req.method === "DELETE") {
    const id = Number(req.url.split("/")[3]);
    const removed = store.remove(id);
    if (!removed) return sendJson(res, 404, { error: "Nenalezeno" });
    return sendJson(res, 200, { message: "Smazáno" });
  }

  return false;
}

module.exports = { handleApiTasks };