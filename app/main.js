import { addRecord, clearRecords, exportRecordsCsv } from "./lead-store.js";
import { initChatbot } from "./chatbot.js";
import { renderPage } from "./pages.js";
import { initializeChrome, initReveal, showToast } from "./site.js";

const fallbackImage = "/photos/sky.jpg";

function formatCompactPrice(amount) {
  if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)} L`;
  return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
}

function bindImageFallbacks() {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      if (image.dataset.fallbackApplied === "true") return;
      image.dataset.fallbackApplied = "true";
      image.src = fallbackImage;
    }, { once: true });
  });
}

function updateRoi() {
  const investment = Number(document.getElementById("investmentRange")?.value || 2500000);
  const growth = Number(document.getElementById("growthRange")?.value || 10);
  const years = Number(document.getElementById("yearsRange")?.value || 5);
  const future = Math.round(investment * Math.pow(1 + growth / 100, years));
  const gain = future - investment;
  const totalReturn = Math.round((gain / investment) * 100);

  if (document.getElementById("investmentValue")) document.getElementById("investmentValue").textContent = formatCompactPrice(investment);
  if (document.getElementById("growthValue")) document.getElementById("growthValue").textContent = `${growth}%`;
  if (document.getElementById("yearsValue")) document.getElementById("yearsValue").textContent = `${years} years`;
  if (document.getElementById("futureValue")) document.getElementById("futureValue").textContent = formatCompactPrice(future);
  if (document.getElementById("gainValue")) document.getElementById("gainValue").textContent = formatCompactPrice(gain);
  if (document.getElementById("returnValue")) document.getElementById("returnValue").textContent = `${totalReturn}%`;
}

function readContactQuery() {
  const params = new URLSearchParams(window.location.search);
  const intent = params.get("intent");
  const project = params.get("project");
  const intentField = document.getElementById("leadIntent");
  const projectField = document.getElementById("leadProject");
  const sourceField = document.getElementById("leadSource");
  if (!intentField || !projectField || !sourceField) return;
  if (intent) intentField.value = intent;
  if (project) projectField.value = project;
  if (intent || project) sourceField.value = "Website CTA";
}

function getDefaultStatus(intent) {
  if (intent === "Site Visit") return "Visit Planned";
  if (intent === "Brochure Request") return "Deck Pending";
  if (intent === "Callback") return "Call Back";
  return "Warm Lead";
}

function initLeadForm() {
  const form = document.getElementById("leadForm");
  if (!form) return;

  readContactQuery();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const intent = document.getElementById("leadIntent").value;
    const record = {
      id: crypto?.randomUUID?.() || `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: document.getElementById("leadName").value.trim(),
      phone: document.getElementById("leadPhone").value.trim(),
      email: document.getElementById("leadEmail").value.trim(),
      intent,
      project: document.getElementById("leadProject").value,
      budget: document.getElementById("leadBudget").value,
      city: document.getElementById("leadCity").value.trim(),
      visitDate: document.getElementById("leadVisitDate").value,
      source: document.getElementById("leadSource").value,
      notes: document.getElementById("leadNotes").value.trim(),
      status: getDefaultStatus(intent)
    };

    addRecord(record);
    form.reset();
    document.getElementById("leadSource").value = "Website Demo";
    showToast("Lead saved to the Acreages agent record.");
  });
}

function initDashboardActions() {
  document.getElementById("exportRecordsBtn")?.addEventListener("click", () => {
    const exported = exportRecordsCsv("acreages-agent-records.csv");
    showToast(exported ? "Agent records exported as CSV." : "There are no records to export yet.");
  });

  document.getElementById("clearRecordsBtn")?.addEventListener("click", () => {
    clearRecords();
    window.location.reload();
  });
}

function initRoiControls() {
  ["investmentRange", "growthRange", "yearsRange"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", updateRoi);
  });
  updateRoi();
}

function initFeaturedShowcase() {
  const showcase = document.querySelector("[data-featured-showcase]");
  if (!showcase) return;

  const tabs = Array.from(showcase.querySelectorAll("[data-showcase-tab]"));
  const slides = Array.from(showcase.querySelectorAll("[data-showcase-slide]"));
  const dots = Array.from(showcase.querySelectorAll("[data-showcase-dot]"));
  const progressBar = showcase.querySelector("[data-showcase-progress]");
  const previousButton = showcase.querySelector("[data-showcase-prev]");
  const nextButton = showcase.querySelector("[data-showcase-next]");

  if (!tabs.length || tabs.length !== slides.length) return;

  const autoplayDelay = 5200;
  let activeIndex = 0;
  let autoplayId = null;
  let progressId = null;
  let hoverPaused = false;
  let focusPaused = false;
  let touchStartX = 0;
  let touchDeltaX = 0;

  function setProgress(value) {
    if (progressBar) {
      progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, value))})`;
    }
  }

  function setActive(index) {
    activeIndex = (index + slides.length) % slides.length;

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    setProgress(0);
  }

  function stopProgress() {
    if (progressId) {
      window.cancelAnimationFrame(progressId);
      progressId = null;
    }
  }

  function runProgress() {
    if (!progressBar) return;
    stopProgress();
    const start = performance.now();

    const step = (time) => {
      const elapsed = time - start;
      setProgress(elapsed / autoplayDelay);
      if (elapsed < autoplayDelay) {
        progressId = window.requestAnimationFrame(step);
      } else {
        setProgress(1);
      }
    };

    progressId = window.requestAnimationFrame(step);
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
    stopProgress();
  }

  function startAutoplay() {
    if (hoverPaused || focusPaused) return;
    stopAutoplay();
    runProgress();
    autoplayId = window.setInterval(() => {
      setActive(activeIndex + 1);
      runProgress();
    }, autoplayDelay);
  }

  function jumpTo(index) {
    setActive(index);
    startAutoplay();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => jumpTo(index));
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => jumpTo(index));
  });

  previousButton?.addEventListener("click", () => jumpTo(activeIndex - 1));
  nextButton?.addEventListener("click", () => jumpTo(activeIndex + 1));

  showcase.addEventListener("mouseenter", () => {
    hoverPaused = true;
    stopAutoplay();
  });

  showcase.addEventListener("mouseleave", () => {
    hoverPaused = false;
    startAutoplay();
  });

  showcase.addEventListener("focusin", () => {
    focusPaused = true;
    stopAutoplay();
  });

  showcase.addEventListener("focusout", (event) => {
    if (showcase.contains(event.relatedTarget)) return;
    focusPaused = false;
    startAutoplay();
  });

  showcase.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
    touchDeltaX = 0;
  }, { passive: true });

  showcase.addEventListener("touchmove", (event) => {
    const currentX = event.changedTouches[0]?.clientX || 0;
    touchDeltaX = currentX - touchStartX;
  }, { passive: true });

  showcase.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 50) {
      jumpTo(activeIndex + (touchDeltaX < 0 ? 1 : -1));
    } else {
      startAutoplay();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  setActive(0);
  startAutoplay();
}

function init() {
  const page = document.body.dataset.page || "home";
  initializeChrome(page);
  renderPage(page);
  bindImageFallbacks();
  initReveal();
  initFeaturedShowcase();
  initChatbot();
  initLeadForm();
  initDashboardActions();
  initRoiControls();
}

document.addEventListener("DOMContentLoaded", init);



