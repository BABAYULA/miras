import { fmtTL, fmtInt, esc, slugP, parcelKey } from "../core/format.js";
import { D } from "../core/data.js";
import { rowGrup, rowUye, rowGrupParsel, rowKisiParsel, cardParsel, cardGrup } from "./rows.js";
export function viewParcels() {
  const data = D();
  return `
    <section class="hero">
      <div class="kicker">${esc(data.il)} · ${esc(data.ilce)} · ${esc(data.mah)} Köyü</div>
      <h1>Mirasçıların <em>Arsa</em> Tahsis Cetveli</h1>
      <p class="sub">Parsellerin gruplara, grupların kişilere, kişilerin arsa başına paylarına ayrıldığı üç katmanlı çizelge. Ada/parsel numarasına, grup veya kişi adına tıklayarak detaya inebilirsiniz.</p>
    </section>
    <section class="stats">
      <div class="stat"><div class="label">Parsel</div><div class="num">${data.parcels.length}<small>ada/parsel</small></div></div>
      <div class="stat"><div class="label">Hissedar grubu</div><div class="num">${Object.keys(data.groups).length}<small>grup</small></div></div>
      <div class="stat"><div class="label">Listede adı geçen mirasçı</div><div class="num">${data.people_count_listed}<small>rapora göre ${data.people_count_excel}</small></div></div>
      <div class="stat"><div class="label">Toplam değer</div><div class="num">${fmtTL(data.total_value)}</div></div>
    </section>
    <div class="sec-title"><h2>Arsalar</h2><span class="line"></span></div>
    <div class="toolbar">
      <div class="search-wrap"><label class="search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>
        <input id="parcel-search" type="search" placeholder="Ada, parsel, grup veya mirasçı ara… (örn. 10/28)" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="ac-list" aria-autocomplete="list" enterkeyhint="search">
      </label><ul class="ac-list" id="ac-list" role="listbox" aria-label="Öneriler" hidden></ul></div>
      <span class="hint">Karttaki ada/parsel veya grup çipine tıklayarak detay sayfasına geçebilirsiniz.</span>
    </div>
    <div class="grid" id="parcel-grid">${data.parcels.map((p) => cardParsel(data, p)).join("")}</div>
    <div class="no-result" id="no-result" style="display:none">Aramanızla eşleşen parsel bulunamadı.</div>
  `;
}

export function viewGroups() {
  const data = D();
  const maxTotal = Math.max(...Object.values(data.group_totals));
  const cards = Object.keys(data.groups)
    .sort((a, b) => (data.group_totals[b] || 0) - (data.group_totals[a] || 0))
    .map((gk) => cardGrup(data, gk, maxTotal))
    .join("");
  return `
    <div class="sec-title"><h2>Hissedar Grupları</h2><span class="line"></span></div>
    <p class="footnote">Grup adına tıklayınca o grubun üyeleri ve pay aldığı parseller açılır. Kartlar toplam pay büyüklüğüne göre sıralanmıştır.</p>
    <div class="grid">${cards}</div>
  `;
}

export function viewParcelDetail({ pk }) {
  const data = D();
  const p = data.parcels.find((x) => parcelKey(x) === pk);
  if (!p) return `<p>Parsel bulunamadı.</p>`;
  const pd = data.parcel_data[pk];
  const rows = Object.keys(pd.gruba_dusen)
    .filter((g) => pd.gruba_dusen[g] > 0)
    .sort((a, b) => pd.gruba_dusen[b] - pd.gruba_dusen[a])
    .map((g) => rowGrup(data, pk, g))
    .join("");
  return `
    <div class="page-head">
      <div>
        <div class="crumb-label">Parsel</div>
        <h2>Ada ${esc(p.ada)} · Parsel ${esc(p.parsel)}</h2>
        <div class="sub-line">${esc(data.il)} · ${esc(data.ilce)} · ${esc(data.mah)}</div>
      </div>
      <dl class="kv">
        <dt>Yüzölçüm</dt><dd>${fmtInt(p.yuzolcum)} m²</dd>
        <dt>Toplam değer</dt><dd>${fmtTL(p.deger)}</dd>
        <dt>Hak sahibi grup</dt><dd>${data.parcel_mirasci[pk]} grup</dd>
      </dl>
    </div>
    <div class="sec-title"><h2>Hissedar grupları</h2><span class="line"></span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Grup</th><th class="num">Kişi</th><th class="num">Gruba düşen oran</th><th class="num">Kişi başı oran</th><th class="num">Gruba düşen tutar</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

export function viewGroup({ gk }) {
  const data = D();
  const g = data.groups[gk];
  if (!g) return `<p>Grup bulunamadı.</p>`;
  const members = data.people.filter((p) => p.grup === gk).sort((a, b) => b.toplam - a.toplam);
  const gt = data.group_totals[gk] || 0;
  const memberRows = members.map(rowUye).join("");
  const parcelRows = data.parcels
    .filter((p) => (data.parcel_data[parcelKey(p)].gruba_dusen[gk] || 0) > 0)
    .map((p) => rowGrupParsel(data, p, gk))
    .join("");

  return `
    <div class="page-head">
      <div>
        <div class="crumb-label">Hissedarlar grubu</div>
        <h2>${esc(g.ad || gk)}</h2>
        <div class="sub-line">Bu gruba bağlı ${members.length} mirasçı listede yer alıyor.</div>
      </div>
      <dl class="kv">
        <dt>Grup kişi sayısı (rapor)</dt><dd>${g.kisi_sayisi}</dd>
        <dt>Listede adı geçen</dt><dd>${members.length}</dd>
        <dt>Toplam payları</dt><dd>${fmtTL(gt)}</dd>
      </dl>
    </div>
    <div class="sec-title"><h2>Grup üyeleri ve payları</h2><span class="line"></span></div>
    <p class="footnote">İsme tıklayınca o kişinin hangi parsellerden ne kadar pay aldığı açılır.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th class="num">#</th><th>Mirasçı</th><th class="num">Arsa sayısı</th><th class="num">Toplam pay</th></tr></thead>
        <tbody>${memberRows}</tbody>
      </table>
    </div>
    <div class="sec-title"><h2>Bu grubun pay aldığı parseller</h2><span class="line"></span></div>
    ${
      parcelRows
        ? `<div class="table-wrap"><table>
          <thead><tr><th>Parsel</th><th class="num">Yüzölçüm</th><th class="num">Değer</th><th class="num">Gruba düşen</th><th class="num">Gruba düşen tutar</th><th class="num">Kişi başı oran</th></tr></thead>
          <tbody>${parcelRows}</tbody>
        </table></div>`
        : `<p class="footnote">Bu grubun pay aldığı parsel yok.</p>`
    }
  `;
}

export function viewPerson({ ad }) {
  const data = D();
  const p = data.people.find((x) => x.ad === ad);
  if (!p) return `<p>Kişi bulunamadı.</p>`;
  const g = data.groups[p.grup];
  const rows = data.parcels.map((par) => rowKisiParsel(data, par, p)).join("");
  return `
    <div class="page-head">
      <div>
        <div class="crumb-label">Mirasçı</div>
        <h2>${esc(p.ad)}</h2>
        <div class="sub-line"><a class="chip" href="#/group/${slugP(p.grup)}">${esc(g.ad || p.grup)}</a></div>
      </div>
      <dl class="kv">
        <dt>Grup kişi sayısı</dt><dd>${g.kisi_sayisi}</dd>
        <dt>Arsa sayısı (pay aldığı)</dt><dd>${p.arsalar}</dd>
        <dt>Toplam payı</dt><dd>${fmtTL(p.toplam)}</dd>
      </dl>
    </div>
    <div class="sec-title"><h2>Parsel bazlı dağılım</h2><span class="line"></span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Parsel</th><th class="num">Yüzölçüm</th><th class="num">Toplam değer</th><th class="num">Kişi başı oran</th><th class="num">Payı</th></tr></thead>
        <tbody>${rows}<tr class="grand"><td colspan="4" class="num">Toplam</td><td class="num total">${fmtTL(p.toplam)}</td></tr></tbody>
      </table>
    </div>
  `;
}
