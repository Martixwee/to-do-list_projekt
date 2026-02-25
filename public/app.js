async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  
  let data;
  try { data = await res.json(); } catch (e) { data = await res.text(); }
  if (!res.ok) throw { status: res.status, data };
  return data;
}

document.addEventListener("click", async (e) => {
  const doneBtn = e.target.closest("[data-done-id]");
  if (doneBtn) {
    try {
      const id = doneBtn.dataset.doneId;
      const currentState = doneBtn.dataset.currentState === "true";
      await api(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !currentState })
      });
      window.location.reload();
    } catch (err) {
      alert("Chyba při změně stavu: " + JSON.stringify(err.data));
    }
  }

  const delBtn = e.target.closest("[data-delete-id]");
  if (delBtn) {
    // Oprava kvůli detail.html (kde už není <tr> tag)
    const trElement = delBtn.closest("tr");
    const taskName = trElement ? trElement.querySelector("strong").innerText : "tento úkol";
    
    if (confirm(`Opravdu chcete smazat ${taskName}?`)) {
      try {
        await api(`/api/tasks/${delBtn.dataset.deleteId}`, { method: "DELETE" });
        window.location.href = "/"; // Vrátíme uživatele domů, aby nezůstal na smazaném detailu
      } catch (err) {
        alert("Nepodařilo se smazat úkol. Zkuste to znovu.");
      }
    }
  }
});

document.addEventListener("submit", async (e) => {
  e.preventDefault(); 

  if (e.target.id === "createForm") {
    const fd = new FormData(e.target);
    try {
      await api("/api/tasks", { 
        method: "POST", 
        body: JSON.stringify({ title: fd.get("title") }) 
      });
      window.location.reload();
    } catch (err) {
      alert("Chyba při ukládání: " + JSON.stringify(err.data));
    }
  }

  if (e.target.id === "editForm") {
    const id = e.target.dataset.id;
    const fd = new FormData(e.target);
    const isCompleted = fd.get("completed") === "on";

    try {
      await api(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"), // Odeslání nového detailu!
          completed: isCompleted
        })
      });
      window.location.href = "/";
    } catch (err) {
      alert("Chyba při úpravě: " + JSON.stringify(err.data));
    }
  }
});

function filterTasks(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const rows = document.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const rowStatus = row.getAttribute('data-status');
    if (status === 'all' || rowStatus === status) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}