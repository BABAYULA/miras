import { esc, slugP, gname } from "./format.js";
export const linkParsel = (pk) =>
  `<a href="#/parcel/${slugP(pk)}">${esc(pk.replace("-", "/"))}</a>`;
export const linkGrup = (D, gk) => `<a href="#/group/${slugP(gk)}">${esc(gname(D, gk))}</a>`;
export const linkKisi = (ad) => `<a href="#/person/${slugP(ad)}">${esc(ad)}</a>`;
