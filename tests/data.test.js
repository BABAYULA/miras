/**
 * Karakterizasyon testleri — mevcut davranışı kilitlemek için.
 * Legacy veri seti (bilirkişi raporu) dağıtım mantığına göre üç yoldan da
 * aynı toplamı vermek zorunda: parsel değerleri = grup toplamları = kişi toplamları.
 * Bu değişmezler bozulursa dağıtım cetveli yanlış demektir.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "src/data/miras.json"), "utf8"));

const round2 = (n) => Math.round(n * 100) / 100;

test("veri seti temel boyutları — 13 parsel, 8 grup, 41 mirasçı", () => {
  assert.equal(data.parcels.length, 13);
  assert.equal(Object.keys(data.groups).length, 8);
  assert.equal(data.people.length, 41);
});

test("değimez: parsel değerleri toplamı = tüm mirasçı toplamı", () => {
  const parcels = data.parcels.reduce((s, p) => s + p.deger, 0);
  const people = data.people.reduce((s, p) => s + p.toplam, 0);
  assert.equal(round2(parcels), round2(people));
});

test("değimez: grup toplamları toplamı = tüm mirasçı toplamı", () => {
  const groups = Object.values(data.group_totals).reduce((s, v) => s + v, 0);
  const people = data.people.reduce((s, p) => s + p.toplam, 0);
  assert.equal(round2(groups), round2(people));
});

test("değimez: her parselde kisi_basi = gruba_dusen / grup_kisi", () => {
  for (const [pk, pd] of Object.entries(data.parcel_data)) {
    for (const gk of Object.keys(pd.gruba_dusen)) {
      const expected = pd.gruba_dusen[gk] / pd.grup_kisi[gk];
      assert.ok(
        Math.abs(pd.kisi_basi[gk] - expected) < 1e-12,
        `parsel ${pk} grup ${gk}: kisi_basi ${pd.kisi_basi[gk]} ≠ ${expected}`
      );
    }
  }
});

test("değimez: her parselde gruba_dusen payları toplamı ~1", () => {
  for (const [pk, pd] of Object.entries(data.parcel_data)) {
    const sum = Object.values(pd.gruba_dusen).reduce((s, v) => s + v, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `parsel ${pk} gruba_dusen toplamı 1 değil: ${sum}`);
  }
});

test("değimez: kişi parselleri toplamı = kişinin toplamı", () => {
  for (const p of data.people) {
    const sum = Object.values(p.parseller).reduce((s, x) => s + x.miktar, 0);
    assert.ok(Math.abs(sum - p.toplam) < 0.01, `${p.ad}: parseller ${sum} ≠ toplam ${p.toplam}`);
  }
});

test("grup üye sayıları people listesiyle tutarlı", () => {
  const counts = {};
  for (const p of data.people) counts[p.grup] = (counts[p.grup] || 0) + 1;
  for (const [gk, g] of Object.entries(data.groups)) {
    assert.equal(counts[gk] || 0, g.uyeler.length, `${gk} üye sayısı uyuşmuyor`);
    assert.equal(g.uyeler.length, g.kisi_sayisi, `${gk} kisi_sayisi uyuşmuyor`);
  }
});

test("kişiler yalnızca içinde bulunduğu grubun parsellerinde pay alır", () => {
  for (const p of data.people) {
    for (const pk of Object.keys(p.parseller)) {
      const grps = data.parcel_groups[pk] || [];
      assert.ok(
        grps.includes(p.grup),
        `${p.ad} (${p.grup}) ${pk} parseline pay almış ama grup listede yok`
      );
    }
  }
});

test("bilinen tutarlar — değişiklik olursa kasıtlı olmalı", () => {
  // Savaş Teke: 10-28'de %40, 0-36'da %20, 0-119'da %25
  const savas = data.people.find((p) => p.ad === "Savaş Teke" && p.grup === "SavaşTeke");
  assert.equal(savas.parseller["10-28"].oran, 0.4);
  assert.equal(savas.toplam, 6360958200);

  // Toplam emlak değeri (2026 eylül raporu)
  assert.equal(round2(data.total_value), 26444270402.43);
});
