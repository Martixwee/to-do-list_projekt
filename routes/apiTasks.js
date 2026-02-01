const store = require("../storage/tasksStore");

function readBodyJson(req, cb) {
  let body = "";
  req.on("data", (ch) => (body += ch));
  req.on("end", () => {
    try { cb(null, JSON.parse(body || "{}")); } catch (e) { cb(e); }
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiTasks(req, res) {
  // GET /api/tasks
  if (req.url === "/api/tasks" && req.method === "GET") {
    return sendJson(res, 200, store.getAll());
  }

  // POST /api/tasks
  if (req.url === "/api/tasks" && req.method === "POST") {
    return readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Neplatný JSON" });
      const title = String(data.title || "").trim();
      if (!title) return sendJson(res, 400, { error: "Název úkolu chybí" });
      const created = store.create({ title });
      return sendJson(res, 201, created);
    });
  }

  // PUT /api/tasks/:id
  if (req.url.startsWith("/api/tasks/") && req.method === "PUT") {
    const id = Number(req.url.split("/")[3]);
    return readBodyJson(req, (err, data) => {
      const updated = store.update(id, data);
      if (!updated) return sendJson(res, 404, { error: "Úkol nenalezen" });
      return sendJson(res, 200, updated);
    });
  }

  // DELETE /api/tasks/:id
  if (req.url.startsWith("/api/tasks/") && req.method === "DELETE") {
    const id = Number(req.url.split("/")[3]);
    const removed = store.remove(id);
    if (!removed) return sendJson(res, 404, { error: "Úkol nenalezen" });
    return sendJson(res, 200, { message: "Smazáno" });
  }

  return false;
}

module.exports = { handleApiTasks };