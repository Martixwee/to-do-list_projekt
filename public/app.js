/**
 * Pomocná funkce pro volání API. 
 * Zjednodušuje psaní fetch požadavků.
 */
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

// --- 1. VYTVOŘENÍ ÚKOLU (POST /api/tasks) ---
const createForm = document.getElementById("createForm");
if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(createForm);
    
    // Posíláme objekt s názvem úkolu (title)
    const payload = { 
      title: fd.get("title") 
    };

    const msg = document.getElementById("createMsg");
    try {
      await api("/api/tasks", { 
        method: "POST", 
        body: JSON.stringify(payload) 
      });
      // Po úspěšném přidání stránku obnovíme, aby se úkol zobrazil v seznamu
      window.location.reload();
    } catch (err) {
      msg.textContent = "Chyba při přidávání: " + (err.data?.error || "Neznámá chyba");
    }
  });
}

// --- 2. EDITACE ÚKOLU (PUT /api/tasks/:id) ---
// Používá se pro přejmenování úkolu nebo změnu stavu (splněno/nesplněno)
const editForm = document.getElementById("editForm");
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editForm.dataset.id;
    const fd = new FormData(editForm);
    
    const payload = { 
      title: fd.get("title"),
      completed: fd.get("completed") === "on" // Checkbox vrací "on" pokud je zaškrtnutý
    };

    const msg = document.getElementById("editMsg");
    try {
      await api(`/api/tasks/${id}`, { 
        method: "PUT", 
        body: JSON.stringify(payload) 
      });
      // Po editaci se vrátíme na domovskou stránku nebo detail
      window.location.href = "/";
    } catch (err) {
      msg.textContent = "Chyba při úpravě: " + (err.data?.error || "Neznámá chyba");
    }
  });
}

// --- 3. SMAZÁNÍ ÚKOLU (DELETE /api/tasks/:id) ---
// Delegování události na kliknutí pro všechna smazávací tlačítka
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-delete-id]");
  if (!btn) return;

  const id = btn.dataset.deleteId;
  if (!confirm("Opravdu chceš tento úkol smazat?")) return;

  try {
    await api(`/api/tasks/${id}`, { method: "DELETE" });
    // Po smazání buď obnovíme stránku, nebo nás to hodí na hlavní seznam
    window.location.href = "/";
  } catch (err) {
    alert("Chyba při mazání: " + (err.data?.error || "Neznámá chyba"));
  }
});

/**
 * BONUS: Rychlé přepnutí stavu splněno/nesplněno přímo ze seznamu
 */
document.addEventListener("change", async (e) => {
  const checkbox = e.target.closest("[data-task-id]");
  if (!checkbox) return;

  const id = checkbox.dataset.taskId;
  try {
    await api(`/api/tasks/${id}`, { 
      method: "PUT", 
      body: JSON.stringify({ completed: checkbox.checked }) 
    });
  } catch (err) {
    console.error("Chyba při změně stavu:", err);
    checkbox.checked = !checkbox.checked; // Vrátíme zpět při chybě
  }
});