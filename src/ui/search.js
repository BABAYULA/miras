import { esc, slugP, parcelKey, gname, norm, fmtInt } from "../core/format.js";
import { D } from "../core/data.js";

const AC_LABEL = { parsel: "Parsel", grup: "Grup", kisi: "Mirasçı" };
const AC_ORDER = { parsel: 0, grup: 1, kisi: 2 };
let acIndex = null,
  acActive = -1;

function buildIndex() {
  const d = D(),
    out = [];
  d.parcels.forEach((p) => {
    const pk = parcelKey(p),
      label = `${p.ada}/${p.parsel}`;
    out.push({
      t: "parsel",
      label,
      nl: norm(label),
      sub: `${fmtInt(p.yuzolcum)} m²`,
      href: `#/parcel/${slugP(pk)}`,
      key: norm(`${label} ada ${p.ada} parsel ${p.parsel}`),
    });
  });
  Object.keys(d.groups).forEach((gk) => {
    const n = gname(d, gk);
    out.push({
      t: "grup",
      label: n,
      nl: norm(n),
      sub: `${d.groups[gk].kisi_sayisi} kişi`,
      href: `#/group/${slugP(gk)}`,
      key: norm(n),
    });
  });
  d.people.forEach((x) => {
    out.push({
      t: "kisi",
      label: x.ad,
      nl: norm(x.ad),
      sub: gname(d, x.grup),
      href: `#/person/${slugP(x.ad)}`,
      key: norm(x.ad),
    });
  });
  return out;
}

function acHighlight(e, nq) {
  const i = e.nl.indexOf(nq);
  if (i < 0 || e.nl.length !== e.label.length) return esc(e.label);
  return (
    esc(e.label.slice(0, i)) +
    "<mark>" +
    esc(e.label.slice(i, i + nq.length)) +
    "</mark>" +
    esc(e.label.slice(i + nq.length))
  );
}

export function acHide() {
  const box = document.getElementById("ac-list"),
    inp = document.getElementById("parcel-search");
  if (box) {
    box.hidden = true;
    box.innerHTML = "";
  }
  if (inp) {
    inp.setAttribute("aria-expanded", "false");
    inp.removeAttribute("aria-activedescendant");
  }
  acActive = -1;
}

function acPick(href) {
  acHide();
  location.hash = href;
}

function filterGrid(q) {
  const nq = norm(q.trim());
  let visible = 0;
  document.querySelectorAll("#parcel-grid .card").forEach((card) => {
    const hit = !nq || card.dataset.search.includes(nq);
    card.style.display = hit ? "" : "none";
    if (hit) visible++;
  });
  const nr = document.getElementById("no-result");
  if (nr) nr.style.display = visible ? "none" : "";
}

function onSearchInput(value) {
  const box = document.getElementById("ac-list"),
    inp = document.getElementById("parcel-search");
  if (!box || !inp) return;
  const nq = norm(value.trim());
  filterGrid(value);
  if (!nq) return acHide();
  acIndex = acIndex || buildIndex();
  const hits = [];
  for (const e of acIndex) {
    let s = -1;
    if (e.nl.startsWith(nq)) s = 0;
    else if (e.nl.includes(" " + nq) || e.nl.includes("/" + nq)) s = 1;
    else if (e.key.includes(nq)) s = 2;
    if (s >= 0) hits.push({ e, s });
  }
  hits.sort(
    (a, b) =>
      a.s - b.s || AC_ORDER[a.e.t] - AC_ORDER[b.e.t] || a.e.label.localeCompare(b.e.label, "tr")
  );
  const top = hits.slice(0, 8);
  acActive = -1;
  box.innerHTML = top.length
    ? top
        .map(
          ({ e }, i) => `<li class="ac-item" role="option" id="ac-${i}" data-href="${esc(e.href)}">
        <span class="ac-type ${e.t}">${AC_LABEL[e.t]}</span>
        <span class="ac-main">${acHighlight(e, nq)}</span>
        <span class="ac-sub">${esc(e.sub)}</span></li>`
        )
        .join("")
    : `<li class="ac-empty">Eşleşen öneri yok</li>`;
  box.hidden = false;
  inp.setAttribute("aria-expanded", "true");
}

function acMove(dir) {
  const items = [...document.querySelectorAll("#ac-list .ac-item")];
  if (!items.length) return;
  acActive = (acActive + dir + items.length) % items.length;
  items.forEach((el, i) => {
    el.classList.toggle("active", i === acActive);
    el.setAttribute("aria-selected", i === acActive ? "true" : "false");
  });
  items[acActive].scrollIntoView({ block: "nearest" });
  document
    .getElementById("parcel-search")
    .setAttribute("aria-activedescendant", items[acActive].id);
}

document.addEventListener("input", (e) => {
  if (e.target.id === "parcel-search") onSearchInput(e.target.value);
});
document.addEventListener("focusin", (e) => {
  if (e.target.id === "parcel-search" && e.target.value.trim()) onSearchInput(e.target.value);
});
document.addEventListener("keydown", (e) => {
  if (e.target.id !== "parcel-search") return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    acMove(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    acMove(-1);
  } else if (e.key === "Escape") acHide();
  else if (e.key === "Enter") {
    const el = document.querySelector("#ac-list .ac-item.active");
    if (el) {
      e.preventDefault();
      acPick(el.dataset.href);
    } else {
      acHide();
      e.target.blur();
    }
  }
});
document.addEventListener("mousedown", (e) => {
  if (e.target.closest(".ac-item")) e.preventDefault();
});
document.addEventListener("click", (e) => {
  const it = e.target.closest(".ac-item");
  if (it) return acPick(it.dataset.href);
  if (!e.target.closest(".search-wrap")) acHide();
});

/* ── BAŞA DÖN BUTONU ───────────────────────── */
export function updateBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  btn.classList.toggle("show", window.scrollY > 400);
}
window.addEventListener("scroll", updateBackToTop, { passive: true });
document.addEventListener("click", (e) => {
  if (e.target.closest("#back-to-top")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
