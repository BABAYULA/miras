import {
  fmtTL,
  fmtInt,
  fmtOran,
  fmtPct,
  esc,
  slugP,
  gname,
  parcelKey,
  norm,
} from "../core/format.js";
import { linkParsel, linkGrup } from "../core/helpers.js";
export function rowGrup(D, pk, gk) {
  const p = D.parcels.find((x) => parcelKey(x) === pk);
  const pd = D.parcel_data[pk];
  const oran = pd.gruba_dusen[gk];
  const ks = pd.grup_kisi[gk];
  return `<tr>
    <td data-title>${linkGrup(D, gk)}</td>
    <td class="num" data-label="Kişi">${ks}</td>
    <td class="num" data-label="Gruba düşen oran">${fmtPct(oran)}</td>
    <td class="num" data-label="Kişi başı oran">${fmtOran(oran / ks)}</td>
    <td class="num total" data-label="Gruba düşen tutar">${fmtTL(p.deger * oran)}</td>
  </tr>`;
}

export function rowUye(m, idx) {
  return `<tr>
    <td class="rank">${idx + 1}</td>
    <td data-title><a class="pname" href="#/person/${slugP(m.ad)}">${esc(m.ad)}</a></td>
    <td class="num" data-label="Arsa sayısı">${m.arsalar}</td>
    <td class="num total" data-label="Toplam pay">${fmtTL(m.toplam)}</td>
  </tr>`;
}

export function rowGrupParsel(D, p, gk) {
  const pk = parcelKey(p);
  const oran = D.parcel_data[pk].gruba_dusen[gk];
  const ks = D.parcel_data[pk].grup_kisi[gk];
  return `<tr>
    <td data-title>${linkParsel(pk)}</td>
    <td class="num" data-label="Yüzölçüm">${fmtInt(p.yuzolcum)} m²</td>
    <td class="num" data-label="Değer">${fmtTL(p.deger)}</td>
    <td class="num" data-label="Gruba düşen">${fmtPct(oran)}</td>
    <td class="num" data-label="Gruba düşen tutar">${fmtTL(p.deger * oran)}</td>
    <td class="num" data-label="Kişi başı oran">${fmtOran(oran / ks)}</td>
  </tr>`;
}

export function rowKisiParsel(D, p, kisi) {
  const pk = parcelKey(p);
  const v = kisi.parseller[pk];
  if (!v)
    return `<tr class="empty">
    <td data-title>${linkParsel(pk)}</td>
    <td colspan="4" class="muted">Bu kişinin bu parselde hissesi yok.</td>
  </tr>`;
  return `<tr>
    <td data-title>${linkParsel(pk)}</td>
    <td class="num" data-label="Yüzölçüm">${fmtInt(p.yuzolcum)} m²</td>
    <td class="num" data-label="Toplam değer">${fmtTL(p.deger)}</td>
    <td class="num" data-label="Kişi başı oran">${fmtOran(v.oran)}</td>
    <td class="num total" data-label="Payı">${fmtTL(v.miktar)}</td>
  </tr>`;
}

export function cardParsel(D, p) {
  const pk = parcelKey(p);
  const mir = D.parcel_mirasci[pk];
  const grps = D.parcel_groups[pk] || [];
  const hissedar = D.people
    .filter((x) => grps.includes(x.grup) && x.parseller[pk])
    .map((x) => norm(x.ad));
  const pks =
    norm(`${p.ada} ${p.parsel} ada ${p.ada} parsel ${p.parsel}`) +
    " " +
    grps.map((g) => norm(gname(D, g))).join(" ") +
    " " +
    hissedar.join(" ");
  const payOran = (p.deger / D.total_value) * 100;
  const payTxt = payOran.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `<article class="card" data-search="${esc(pks)}">
    <div class="card-top">
      <a class="ada" href="#/parcel/${slugP(pk)}">${esc(p.ada)}/${esc(p.parsel)}</a>
      <span class="deger">${fmtTL(p.deger)}</span>
    </div>
    <div class="bar" title="Toplam değer içindeki payı: %${payTxt}"><i style="width:${Math.max(1.5, payOran).toFixed(2)}%"></i></div>
    <div class="meta">Toplam değer içindeki payı: <b>%${payTxt}</b></div>
    <div class="meta">${esc(D.il)} · ${esc(D.ilce)} · ${esc(D.mah)} — ${fmtInt(p.yuzolcum)} m² · ${mir} hissedar grubu</div>
    <div class="chips">${grps.map((g) => `<a class="chip" href="#/group/${slugP(g)}">${esc(gname(D, g))}</a>`).join("")}</div>
  </article>`;
}

export function cardGrup(D, gk, maxTotal) {
  const g = D.groups[gk];
  const total = D.group_totals[gk] || 0;
  const listed = D.people.filter((p) => p.grup === gk).length;
  return `<article class="gcard">
    <div class="gname">${linkGrup(D, gk)}</div>
    <div class="bar"><i class="green" style="width:${Math.max(2, (total / maxTotal) * 100).toFixed(1)}%"></i></div>
    <div class="gmeta">
      <span class="badge">${g.kisi_sayisi} kişi</span>
      <span class="gtotal">${fmtTL(total)}</span>
    </div>
    <div class="gmeta"><span>Listede adı geçen üye: ${listed}</span><span>Toplam pay</span></div>
  </article>`;
}
