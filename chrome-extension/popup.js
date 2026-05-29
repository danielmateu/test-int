// popup.js - Lógica interactiva de la extensión de Chrome
const API_URL = "http://localhost:3000/api/extension/add-job";

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("user-email");
  const saveBtn = document.getElementById("save-btn");
  const alertBox = document.getElementById("alert-box");

  const titleInput = document.getElementById("job-title");
  const companyInput = document.getElementById("job-company");
  const locationInput = document.getElementById("job-location");
  const salaryInput = document.getElementById("job-salary");
  const urlInput = document.getElementById("job-url");

  // Helper para mostrar alertas
  function showAlert(message, type = "info") {
    alertBox.innerText = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = "block";
  }

  // 1. Cargar el email guardado en el storage local de Chrome
  chrome.storage.local.get(["userEmail"], (res) => {
    if (res.userEmail) {
      emailInput.value = res.userEmail;
    }
  });

  // Guardar email dinámicamente al cambiar
  emailInput.addEventListener("input", (e) => {
    const email = e.target.value.trim();
    if (email) {
      chrome.storage.local.set({ userEmail: email });
    }
  });

  // 2. Extraer datos del DOM de la pestaña de empleo actual
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab) return;

    // Verificar si estamos en un portal soportado
    const isSupported = activeTab.url.includes("linkedin.com") || activeTab.url.includes("infojobs.net");

    if (!isSupported) {
      showAlert("Navega a una oferta en LinkedIn o InfoJobs para capturarla.", "info");
      return;
    }

    showAlert("Extrayendo información de la vacante...", "info");

    chrome.tabs.sendMessage(activeTab.id, { action: "extractJobDetails" }, (response) => {
      // Manejar respuesta
      if (chrome.runtime.lastError) {
        console.error("Dnd Communication Error:", chrome.runtime.lastError);
        showAlert("Por favor, refresca la página de la oferta y vuelve a abrir la extensión.", "error");
        return;
      }

      if (response && response.success) {
        const job = response.data;
        titleInput.value = job.title;
        companyInput.value = job.company;
        locationInput.value = job.location;
        salaryInput.value = job.salary;
        urlInput.value = job.applyUrl;

        alertBox.style.display = "none";
        saveBtn.disabled = false;
      } else {
        showAlert("No se pudieron extraer los selectores de la oferta.", "error");
      }
    });
  });

  // 3. Registrar la oferta en la base de datos de Next.js
  saveBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showAlert("Por favor, ingresa tu email de registro de la web.", "error");
      return;
    }

    const job = {
      title: titleInput.value.trim(),
      company: companyInput.value.trim(),
      location: locationInput.value.trim(),
      salary: salaryInput.value.trim(),
      applyUrl: urlInput.value.trim()
    };

    saveBtn.disabled = true;
    showAlert("Guardando oferta en tu panel...", "info");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, job })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Error en el servidor");
      }

      showAlert("¡Oferta añadida correctamente al Kanban! ✨", "success");
      
      // Auto-cerrar el popup tras 1.5s del guardado exitoso
      setTimeout(() => {
        window.close();
      }, 1500);

    } catch (error) {
      console.error(error);
      showAlert(`Fallo al guardar: ${error.message}`, "error");
      saveBtn.disabled = false;
    }
  });
});
