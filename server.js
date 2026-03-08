const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleApiTasks } = require("./routes/apiTasks");
const { handlePages } = require("./routes/pages");

const server = http.createServer((req, res) => {
  console.log(`Požadavek: ${req.method} ${req.url}`);

  if (req.url.startsWith("/api/tasks")) {
    if (handleApiTasks(req, res)) return;
  }

  if (handlePages(req, res)) return;

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Cesta nenalezena");
});

server.listen(3000, () => console.log("🚀 Server běží na http://localhost:3000"));