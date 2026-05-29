// content.js - Scraper inteligente para portales de empleo
console.log("CV AI Builder Extension: Content script inyectado con éxito.");

function extractJobDetails() {
  const url = window.location.href;
  let title = "";
  let company = "";
  let location = "";
  let salary = "Salario no especificado";

  if (url.includes("linkedin.com")) {
    // --- SCRAPER DE LINKEDIN ---
    // Selectores comunes para el título del puesto
    const titleEl = document.querySelector(".job-details-jobs-unified-top-card__job-title") || 
                    document.querySelector(".jobs-unified-top-card__job-title") ||
                    document.querySelector("h1.t-24") ||
                    document.querySelector("h1");
    title = titleEl ? titleEl.innerText.trim() : "";

    // Selectores para la compañía
    const companyEl = document.querySelector(".job-details-jobs-unified-top-card__company-name") || 
                      document.querySelector(".jobs-unified-top-card__company-name") ||
                      document.querySelector(".jobs-unified-top-card__company-name a") ||
                      document.querySelector(".topcard__org-name-link");
    company = companyEl ? companyEl.innerText.trim() : "";

    // Selectores para la ubicación
    const locationEl = document.querySelector(".job-details-jobs-unified-top-card__bullet") || 
                        document.querySelector(".jobs-unified-top-card__bullet") ||
                        document.querySelector(".jobs-unified-top-card__primary-description span") ||
                        document.querySelector(".topcard__flavor--bullet");
    location = locationEl ? locationEl.innerText.trim() : "";

    // Heurística de salarios en LinkedIn (a veces en la descripción o metadatos)
    const salaryEl = document.querySelector(".job-details-jobs-unified-top-card__job-insight--salary") || 
                     document.querySelector(".jobs-unified-top-card__job-insight--salary");
    if (salaryEl) {
      salary = salaryEl.innerText.trim();
    }
  } else if (url.includes("infojobs.net")) {
    // --- SCRAPER DE INFOJOBS ---
    const titleEl = document.querySelector("h1") || document.querySelector(".title-h1");
    title = titleEl ? titleEl.innerText.trim() : "";

    const companyEl = document.querySelector(".company-name") || document.querySelector("a.link-external");
    company = companyEl ? companyEl.innerText.trim() : "";

    const locationEl = document.querySelector(".location-name") || document.querySelector("li.list-inline-item:first-child");
    location = locationEl ? locationEl.innerText.trim() : "";

    const salaryEl = document.querySelector(".salary-range") || document.querySelector("li.salary");
    if (salaryEl) {
      salary = salaryEl.innerText.trim();
    }
  }

  // Fallback si no logramos encontrar selectores
  if (!title) {
    title = document.title.split("|")[0].split("-")[0].trim();
  }
  if (!company) {
    company = "Compañía pendiente de registrar";
  }
  if (!location) {
    location = "España (o Remoto)";
  }

  // Quitar retornos de carro
  title = title.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ");
  company = company.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ");
  location = location.replace(/\r?\n|\r/g, " ").replace(/\s+/g, " ");

  return {
    title,
    company,
    location,
    salary,
    applyUrl: url
  };
}

// Escuchar solicitudes de extracción enviadas desde el Popup de la Extensión
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractJobDetails") {
    try {
      const details = extractJobDetails();
      sendResponse({ success: true, data: details });
    } catch (error) {
      console.error("Error al extraer detalles de empleo:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Mantiene el canal de respuesta abierto asíncronamente
});
