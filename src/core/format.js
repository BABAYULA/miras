export const fmtTL = (v) =>
  v === 0 || v == null
    ? "—"
    : v.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
export const fmtInt = (v) => Number(v).toLocaleString("tr-TR");
export const fmtOran = (o) =>
  o === 0
    ? "—"
    : "%" +
      (o * 100).toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
export const fmtPct = (o) =>
  (o * 100).toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + "%";

export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
export const slugP = encodeURIComponent;
export const gname = (D, gk) => D.groups[gk]?.ad || gk;
export const parcelKey = (p) => `${p.ada}-${p.parsel}`;
export const norm = (s) =>
  String(s ?? "")
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");
