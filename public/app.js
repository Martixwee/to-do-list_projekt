// Pomocná funkce pro volání API
async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }

  if (!res.ok) throw { status: res.status, data };
  return data;
}

// 1. OBSLUHA KLIKNUTÍ (Mazání a rychlá změna stavu)
document.addEventListener("click", async (e) => {
  // --- SEKCE MAZÁNÍ ---
  const delBtn = e.target.closest("[data-delete-id]");
  if (delBtn) {
    // Zabráníme tomu, aby se akce spustila vícekrát najednou
    e.preventDefault();
    e.stopImmediatePropagation();

    // Pokusíme se najít jméno úkolu pro lepší zobrazení v confirm
    const trElement = delBtn.closest("tr");
    const taskName = trElement ? trElement.querySelector("strong")?.innerText : "tento úkol";

    if (confirm(`Opravdu chcete smazat ${taskName || "tento úkol"}?`)) {
      try {
        await api(`/api/tasks/${delBtn.dataset.deleteId}`, { method: "DELETE" });
        window.location.href = "/"; // Návrat na seznam (důležité pro detail)
      } catch (err) {
        alert("Chyba při mazání úkolu.");
      }
    }
    return; // Ukončíme funkci, aby nepokračovala dál
  }

  // --- SEKCE RYCHLÁ ZMĚNA STAVU (z tabulky) ---
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
      alert("Chyba při změně stavu.");
    }
  }
});

// 2. OBSLUHA FORMULÁŘŮ (Vytvoření a Editace)
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const title = fd.get("title")?.trim();

  // Společná validace názvu
  if (title && title.length < 3) {
    alert("Název úkolu musí mít alespoň 3 znaky!");
    return;
  }

  // A: Vytvoření nového úkolu
  if (form.id === "createForm") {
    try {
      await api("/api/tasks", { 
        method: "POST", 
        body: JSON.stringify({ title }) 
      });
      window.location.reload();
    } catch (err) {
      alert("Chyba při ukládání: " + JSON.stringify(err.data));
    }
  }

  // B: Úprava existujícího úkolu
  if (form.id === "editForm") {
    const id = form.dataset.id;
    // Checkbox vrací "on" pokud je zaškrtnutý, jinak null
    const isCompleted = fd.get("completed") === "on" || fd.get("completed") === "true";

    try {
      await api(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          description: fd.get("description"),
          completed: isCompleted
        })
      });
      window.location.href = "/";
    } catch (err) {
      alert("Chyba při úpravě: " + JSON.stringify(err.data));
    }
  }
});

// 3. FILTROVÁNÍ (pro index.html)
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