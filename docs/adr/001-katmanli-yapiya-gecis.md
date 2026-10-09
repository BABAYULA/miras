# ADR 001 — Tek dosyalık uygulamadan katmanlı ES modül yapısına geçiş

- **Durum:** Kabul edildi
- **Tarih:** 2026-10-09
- **Bağlam:** Miras projesi, tek HTML dosyası içinde CSS + JS + veri barındıran
  75 KB'lık minified bir uygulama olarak yaşıyordu. Okunabilir kaynak yalnızca
  yerel yedek dosyalarda bulunuyordu; sürüm takibi git yerine "yedek-N" adlı
  dosya kopyalarıyla yapılıyordu.

## Karar

1. Okunabilir kaynak (`Arsa_Mirascilari-SON - Kopya.html`, yayındaki
   minified sürümle birebir aynı veri + özellik seti) referans alındı.
2. Tek dosya şunlara bölündü:
   - **Veri:** `src/data/miras.json` — `fetch` ile yüklenir, `window.DATA`
     çevrimdışı yedek olarak korunur.
   - **Çekirdek:** `core/format.js` (biçimlendirme + `esc` + `norm`),
     `core/helpers.js` (bağlantı üreticileri), `core/data.js` (tek veri
     erişim noktası), `core/router.js` (hash router).
   - **Görünüm:** `views/pages.js` (sayfa düzeyi), `views/rows.js`
     (satır/kart üreticileri).
   - **UI:** `ui/search.js` (arama, otomatik tamamlama, başa dön).
3. Yerel (native) ES modülleri kullanıldı; bundler yok. Proje boyutu
   (tek sayfa, ~14 KB kod) için Vite/webpack gibi araçlar gereksiz
   karmaşıklık (YAGNI).
4. Karakterizasyon testleri, refaktör öncesi veri değişmezlerini
   (toplamların üç yoldan da eşitliği, pay hesapları) kilitleyerek
   davranış değişikliği riskini sıfıra indirdi.

## Sonuçlar

- **Pozitif:** sürüm takibi git'te; diff'ler anlamlı; linter/test çalışır;
  veri güncelleme (yeni bilirkişi raporu) tek JSON dosyasıyla yapılabilir.
- **Pozitif:** `http-server` dışında araç bağımlılığı yok; deploy hâlâ
  statik dosya kopyası.
- **Negatif:** ES modülleri file:// altında çalışmaz; yerel geliştirme için
  http sunucusu gerekir (dokümante edildi).
- **Nötr:** GitHub Pages kök `index.html`'i sunar; eski "yedek-N" dosyaları
  repodan çıkarıldı, yerel kopyalar korunuyor.

## Reddedilen alternatifler

- **Bundler'lı yapı (Vite):** 14 KB kod için derleme adımı gereksiz.
- **Framework (React/Vue):** uygulama zaten render fonksiyonlarıyla
  şablon dizgisi üretiyor; framework geçişi davranış riski ekler, değer
  üretmez.
- **Büyük baştan yazım:** karakterizasyon testleri olmadan yeniden yazım
  dağıtım cetvelindeki hesap hatalarını kaçınılmaz kılar (Strangler Fig
  yerine mevcut davranış korundu).
