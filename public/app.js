async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  
  // Zkusíme načíst JSON, pokud to nejde, vezmeme text
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }

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
  // Najdeme název úkolu v tom samém řádku pro lepší UX
  const taskName = delBtn.closest("tr").querySelector("strong").innerText;
  if (confirm(`Opravdu chcete smazat úkol: "${taskName}"?`)) {
    try {
      await api(`/api/tasks/${delBtn.dataset.deleteId}`, { method: "DELETE" });
      window.location.reload();
    } catch (err) {
      alert("Nepodařilo se smazat úkol. Zkuste to znovu.");
    }
  }
}
});

document.addEventListener("submit", async (e) => {
  e.preventDefault(); // Zastaví to /?title=...

  // --- PŘIDÁNÍ NOVÉHO ÚKOLU ---
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

  // --- ÚPRAVA EXISTUJÍCÍHO ÚKOLU (Tohle ti tam chybělo) ---
  if (e.target.id === "editForm") {
    const id = e.target.dataset.id; // Vezme ID z data-id="{{id}}"
    const fd = new FormData(e.target);
    
    // Získání stavu checkboxu (vrací true/false)
    const isCompleted = fd.get("completed") === "on";

    try {
      await api(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: fd.get("title"),
          completed: isCompleted
        })
      });
      // Po uložení nás to vrátí na hlavní seznam
      window.location.href = "/";
    } catch (err) {
      alert("Chyba při úpravě: " + JSON.stringify(err.data));
    }
  }
});

function filterTasks(status, btn) {
  // 1. Změna aktivního tlačítka
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // 2. Filtrování řádků v tabulce
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