const store = require("../storage/tasksStore");

function sendJson(res, status, data) {
  if (res.headersSent) return; // Ochrana: už jsme jednou odpověděli? Tak podruhé ne.
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBodyJson(req, cb) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    try { cb(null, JSON.parse(body || "{}")); }
    catch (e) { cb(e); }
  });
}

function handleApiTasks(req, res) {
// SPRÁVNĚ
if (req.url === "/api/tasks" && req.method === "POST") {
    readBodyJson(req, (err, data) => {
        if (err) return sendJson(res, 400, { error: "bad json" });
        sendJson(res, 201, store.create(data));
    });
    return true; // Toto zastaví server.js, aby nezkoušel další věci
}

  // PUT /api/tasks/{id} - Upravit / Hotovo
  if (req.url.startsWith("/api/tasks/") && req.method === "PUT") {
    const id = req.url.split("/").pop();
    readBodyJson(req, (err, data) => {
      if (err) return sendJson(res, 400, { error: "Špatný formát dat" });
      const updated = store.update(id, data);
      if (updated) {
        sendJson(res, 200, updated);
      } else {
        sendJson(res, 404, { error: "Úkol nenalezen" });
      }
    });
    return true;
  }


// DELETE /api/tasks/{id} - Smazat
  if (req.url.startsWith("/api/tasks/") && req.method === "DELETE") {
    // Odstraníme případné prázdné znaky na konci URL, které by mohly zmást ID
    const id = req.url.split("/").filter(Boolean).pop(); 
    const deleted = store.remove(id);
    
    if (deleted) {
      sendJson(res, 200, { ok: true });
    } else {
      sendJson(res, 404, { error: "Úkol nenalezen" });
    }
    return true; // TADY serveru jasně říkáme STOP
  }

  return false; // Pokud to není API cesta, zkusíme stránky
}

module.exports = { handleApiTasks };