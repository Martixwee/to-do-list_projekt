async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// Obsluha formulářů a kliknutí
document.addEventListener("submit", async (e) => {
  // CREATE
  if (e.target.id === "createForm") {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api("/api/tasks", { method: "POST", body: JSON.stringify({ title: fd.get("title") }) });
      window.location.reload();
    } catch (err) { alert("Chyba při přidání"); }
  }

  // EDIT
  if (e.target.id === "editForm") {
    e.preventDefault();
    const id = e.target.dataset.id;
    const fd = new FormData(e.target);
    try {
      await api(`/api/tasks/${id}`, { 
        method: "PUT", 
        body: JSON.stringify({ title: fd.get("title"), completed: fd.get("completed") === "on" }) 
      });
      window.location.href = "/";
    } catch (err) { alert("Chyba při úpravě"); }
  }
});

document.addEventListener("click", async (e) => {
  // DELETE
  const delBtn = e.target.closest("[data-delete-id]");
  if (delBtn) {
    if (!confirm("Smazat?")) return;
    await api(`/api/tasks/${delBtn.dataset.deleteId}`, { method: "DELETE" });
    window.location.reload();
  }

  // HOTOVO
  const doneBtn = e.target.closest("[data-done-id]");
  if (doneBtn) {
    const id = doneBtn.dataset.doneId;
    const currentState = doneBtn.dataset.currentState === "true";
    try {
      await api(`/api/tasks/${id}`, { 
        method: "PUT", 
        body: JSON.stringify({ completed: !currentState }) 
      });
      window.location.reload();
    } catch (err) { alert("Chyba JSON: " + JSON.stringify(err.data)); }
  }
});