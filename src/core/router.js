import { esc, gname } from "./format.js";
import { D } from "./data.js";
import { acHide, updateBackToTop } from "../ui/search.js";
import {
  viewParcels,
  viewParcelDetail,
  viewGroups,
  viewGroup,
  viewPerson,
} from "../views/pages.js";

export const ROUTES = {
  "#/": viewParcels,
  "#/parcel": viewParcels,
  "#/parcel/:pk": viewParcelDetail,
  "#/groups": viewGroups,
  "#/group/:gk": viewGroup,
  "#/person/:ad": viewPerson,
};

export function parseHash() {
  const h = location.hash || "#/";
  for (const pat of Object.keys(ROUTES).sort((a, b) => b.length - a.length)) {
    const keys = [];
    const re = new RegExp(
      "^" +
        pat.replace(/:[^/]+/g, (m) => {
          keys.push(m.slice(1));
          return "([^/]+)";
        }) +
        "$"
    );
    const m = h.match(re);
    if (m) {
      const args = {};
      keys.forEach((k, i) => (args[k] = decodeURIComponent(m[i + 1])));
      return { fn: ROUTES[pat], args, raw: h };
    }
  }
  return { fn: viewParcels, args: {}, raw: h };
}

export function render() {
  const r = parseHash();
  document.getElementById("view").innerHTML = r.fn(r.args);
  window.scrollTo({ top: 0, behavior: "instant" });
  document.getElementById("breadcrumb").innerHTML = breadcrumb(r.raw);
  const inGroups = /^#\/(groups|group|person)/.test(r.raw);
  document.querySelectorAll(".topnav a").forEach((a, i) => {
    const on = (i === 1) === inGroups;
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  acHide();
  updateBackToTop();
}

export function breadcrumb(hash) {
  const d = D();
  const parts = [{ href: "#/", label: "Ana sayfa · Arsalar" }];
  if (hash.startsWith("#/parcel/")) {
    const pk = decodeURIComponent(hash.slice("#/parcel/".length));
    parts.push({ label: "Parsel " + pk, href: hash });
  } else if (hash.startsWith("#/group/")) {
    const gk = decodeURIComponent(hash.slice("#/group/".length));
    parts.push({ href: "#/groups", label: "Gruplar" });
    parts.push({ label: gname(d, gk), href: hash });
  } else if (hash === "#/groups") {
    parts.push({ label: "Gruplar", href: hash });
  } else if (hash.startsWith("#/person/")) {
    parts.push({ label: decodeURIComponent(hash.slice("#/person/".length)), href: hash });
  }
  return parts
    .map((p, i) =>
      i < parts.length - 1
        ? `<a href="${p.href}">${esc(p.label)}</a><span class="sep">›</span>`
        : `<span class="here">${esc(p.label)}</span>`
    )
    .join("");
}

window.addEventListener("hashchange", render);
