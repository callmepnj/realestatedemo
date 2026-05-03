export const storageKey = "acreages-demo-leads";

export function getStoredRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

export function setStoredRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

export function addRecord(record) {
  const records = getStoredRecords();
  records.push(record);
  setStoredRecords(records);
}

export function clearRecords() {
  localStorage.removeItem(storageKey);
}

export function updateRecordStatus(recordId, status) {
  const records = getStoredRecords().map((record) => (
    record.id === recordId ? { ...record, status } : record
  ));
  setStoredRecords(records);
}

export function exportRecordsCsv(filename = "acreages-demo-leads.csv") {
  const records = getStoredRecords();
  if (!records.length) return false;

  const header = [
    "createdAt",
    "name",
    "phone",
    "email",
    "intent",
    "project",
    "budget",
    "city",
    "visitDate",
    "source",
    "status",
    "notes"
  ];

  const csv = [
    header.join(","),
    ...records.map((record) => header.map((key) => `"${String(record[key] || "").replaceAll("\"", "\"\"")}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

export function formatRecordDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function getMetrics(records) {
  return [
    { label: "Total Leads", value: records.length },
    { label: "Site Visits", value: records.filter((record) => record.intent === "Site Visit").length },
    { label: "Brochure", value: records.filter((record) => record.intent === "Brochure Request").length },
    { label: "Callbacks", value: records.filter((record) => record.intent === "Callback").length },
    { label: "Investor", value: records.filter((record) => record.intent === "Investor Enquiry").length },
    { label: "NRI", value: records.filter((record) => record.intent === "NRI Enquiry").length }
  ];
}
