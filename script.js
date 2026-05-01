const rates = {
  INR: 1,
  USD: 0.012,
  AED: 0.044
};

const storageKey = "mayurvan-agent-records";
let currentCurrency = "INR";

function formatCompactPrice(amountInINR, currency = currentCurrency) {
  const value = amountInINR * rates[currency];

  if (currency === "INR") {
    if (value >= 10000000) return `Rs. ${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `Rs. ${(value / 100000).toFixed(1)} L`;
    return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
  }

  if (currency === "USD") {
    return `$${Math.round(value).toLocaleString("en-US")}`;
  }

  return `AED ${Math.round(value).toLocaleString("en-AE")}`;
}

function formatRange(min, max) {
  return `${formatCompactPrice(min)} - ${formatCompactPrice(max)}`;
}

function updateCurrency(currency) {
  currentCurrency = currency;
  document.querySelectorAll(".currency-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.currency === currency);
  });

  document.querySelectorAll("[data-price]").forEach((node) => {
    node.textContent = formatCompactPrice(Number(node.dataset.price), currency);
  });

  document.querySelectorAll("[data-price-range]").forEach((node) => {
    const [min, max] = node.dataset.priceRange.split(",").map(Number);
    node.textContent = formatRange(min, max);
  });

  updateRoi();
}

function updateRoi() {
  const investment = Number(document.getElementById("investmentRange")?.value || 2200000);
  const growth = Number(document.getElementById("growthRange")?.value || 12);
  const years = Number(document.getElementById("yearsRange")?.value || 5);
  const future = Math.round(investment * Math.pow(1 + growth / 100, years));
  const gain = future - investment;
  const totalReturn = Math.round((gain / investment) * 100);

  document.getElementById("investmentValue").textContent = formatCompactPrice(investment);
  document.getElementById("growthValue").textContent = `${growth}%`;
  document.getElementById("yearsValue").textContent = `${years} years`;
  document.getElementById("futureValue").textContent = formatCompactPrice(future);
  document.getElementById("gainValue").textContent = formatCompactPrice(gain);
  document.getElementById("returnValue").textContent = `${totalReturn}%`;
}

function getStoredRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch (error) {
    return [];
  }
}

function setStoredRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function formatRecordDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function recordStatus(intent) {
  if (intent === "Site Visit") return "Visit Planned";
  if (intent === "Brochure Request") return "Deck Pending";
  if (intent === "Callback") return "Call Back";
  return "Warm Lead";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function renderRecords() {
  const records = getStoredRecords().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const body = document.getElementById("agentRecordBody");
  if (!body) return;

  if (!records.length) {
    body.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">No records yet. Submit the enquiry form or use the action buttons to create your first lead.</td>
      </tr>
    `;
  } else {
    body.innerHTML = records.map((record) => `
      <tr>
        <td data-label="Date">${formatRecordDate(record.createdAt)}</td>
        <td data-label="Lead">
          <strong>${escapeHtml(record.name)}</strong><br>
          ${escapeHtml(record.phone)}<br>
          ${escapeHtml(record.email || "No email")}
        </td>
        <td data-label="Interest">${escapeHtml(record.intent)}</td>
        <td data-label="Budget">${escapeHtml(record.budget)}</td>
        <td data-label="Source">${escapeHtml(record.source)}</td>
        <td data-label="Status">${escapeHtml(record.status)}</td>
      </tr>
    `).join("");
  }

  document.getElementById("totalRecords").textContent = String(records.length);
  document.getElementById("visitRecords").textContent = String(records.filter((record) => record.intent === "Site Visit").length);
  document.getElementById("brochureRecords").textContent = String(records.filter((record) => record.intent === "Brochure Request").length);
  document.getElementById("callbackRecords").textContent = String(records.filter((record) => record.intent === "Callback").length);
}

function addRecord(record) {
  const records = getStoredRecords();
  records.push(record);
  setStoredRecords(records);
  renderRecords();
}

function scrollToForm() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function prefillIntent(intent, source) {
  const intentInput = document.getElementById("leadIntent");
  const sourceInput = document.getElementById("leadSource");

  if (intentInput) intentInput.value = intent;
  if (sourceInput) sourceInput.value = source;

  scrollToForm();
}

function handleLeadAction(action) {
  if (action === "site-visit") {
    prefillIntent("Site Visit", "Website CTA");
    showToast("Site visit intent selected. Add buyer details to save the lead.");
    return;
  }

  if (action === "brochure") {
    prefillIntent("Brochure Request", "Website CTA");
    showToast("Brochure request selected. Save the lead to the agent record.");
    return;
  }

  prefillIntent("Callback", "Website CTA");
  showToast("Callback request selected. Save the lead to the agent record.");
}

function handleLeadSubmit(event) {
  event.preventDefault();

  const intent = document.getElementById("leadIntent").value;
  const record = {
    id: crypto?.randomUUID?.() || `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: document.getElementById("leadName").value.trim(),
    phone: document.getElementById("leadPhone").value.trim(),
    email: document.getElementById("leadEmail").value.trim(),
    intent,
    budget: document.getElementById("leadBudget").value,
    source: document.getElementById("leadSource").value,
    notes: document.getElementById("leadNotes").value.trim(),
    status: recordStatus(intent)
  };

  addRecord(record);
  event.target.reset();
  document.getElementById("leadSource").value = "Website Form";
  showToast("Lead saved to the agent record.");
}

function exportRecords() {
  const records = getStoredRecords();
  if (!records.length) {
    showToast("There are no records to export yet.");
    return;
  }

  const header = ["createdAt", "name", "phone", "email", "intent", "budget", "source", "status", "notes"];
  const csv = [
    header.join(","),
    ...records.map((record) => header.map((key) => `"${String(record[key] || "").replaceAll("\"", "\"\"")}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mayurvan-agent-records.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Agent records exported as CSV.");
}

function clearRecords() {
  localStorage.removeItem(storageKey);
  renderRecords();
  showToast("Agent records cleared.");
}

function initReveal() {
  const nodes = document.querySelectorAll(".reveal, .reveal-delay, .reveal-delay-2");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.18 });

  nodes.forEach((node) => observer.observe(node));
}

function initHeaderState() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const apply = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  apply();
  window.addEventListener("scroll", apply, { passive: true });
}

function setMenuState(isOpen) {
  const header = document.getElementById("siteHeader");
  const button = document.getElementById("mobileMenuBtn");
  if (!header || !button) return;

  header.classList.toggle("menu-open", isOpen);
  button.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

function initEvents() {
  document.querySelectorAll(".currency-btn").forEach((button) => {
    button.addEventListener("click", () => updateCurrency(button.dataset.currency));
  });

  document.querySelectorAll("[data-lead-action]").forEach((button) => {
    button.addEventListener("click", () => {
      setMenuState(false);
      handleLeadAction(button.dataset.leadAction);
    });
  });

  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.getElementById("mobileMenuBtn")?.addEventListener("click", () => {
    const header = document.getElementById("siteHeader");
    setMenuState(!header?.classList.contains("menu-open"));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMenuState(false);
  });

  document.getElementById("investmentRange")?.addEventListener("input", updateRoi);
  document.getElementById("growthRange")?.addEventListener("input", updateRoi);
  document.getElementById("yearsRange")?.addEventListener("input", updateRoi);
  document.getElementById("leadForm")?.addEventListener("submit", handleLeadSubmit);
  document.getElementById("exportRecordsBtn")?.addEventListener("click", exportRecords);
  document.getElementById("clearRecordsBtn")?.addEventListener("click", clearRecords);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("currentYear").textContent = new Date().getFullYear();
  updateCurrency("INR");
  renderRecords();
  initReveal();
  initHeaderState();
  initEvents();
  showToast("Site upgraded. Lead recording is live.");
});
