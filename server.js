const http = require("http");
const { handleApiTasks } = require("./routes/apiTasks");
const { handlePages } = require("./routes/pages");

const server = http.createServer((req, res) => {
  // LOGOVÁNÍ: Uvidíš v terminálu, co se děje
  console.log(`Požadavek: ${req.method} ${req.url}`);

  // 1. Pokud URL obsahuje "/api/tasks", pošleme to handleru
  if (req.url.includes("/api/tasks")) {
    const apiResult = handleApiTasks(req, res);
    if (apiResult !== false) return;
  }

  // 2. Pokud to není API, zkusíme HTML stránky
  const pageResult = handlePages(req, res);
  if (pageResult !== false) return;

  // 3. Totální 404 pokud nic nesedí
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Cesta nenalezena na serveru");
});

server.listen(3000, () => console.log("🚀 Server běží na http://localhost:3000"));