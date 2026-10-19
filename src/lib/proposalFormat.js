// Deterministic money formatting shared by the proposal microsite and studio.
export function fmtMoney(cents, currency = "USD") {
  const value = (Number(cents) || 0) / 100;
  return `${currency === "USD" ? "$" : ""}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(value) {
  if (!value) return "";
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}