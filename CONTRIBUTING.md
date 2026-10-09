# Katkı Rehberi

## Kurallar

1. **Değişmezleri koru:** `tests/data.test.js` 9 değişmezi kilitler. Veri
   güncellemesi yaparken (`src/data/miras.json`) tüm testler geçmelidir.
   Toplamlar birbirini tutmuyorsa dağıtım cetveli hatalıdır — önce kaynağı
   (bilirkişi raporu) doğrula.
2. **Katman yönü:** bağımlılıklar yalnızca `views → core` yönünde akabilir.
   `core/` içinden `views/` içine import yazmak katman ihlalidir.
3. **`window.DATA`'ya doğrudan erişme:** her zaman `core/data.js` içindeki
   `D()` fonksiyonunu kullan.
4. **HTML çıktısı kaçışlı olmalı:** kullanıcı kaynaklı her metin `esc()`
   içinden geçer.
5. **Commit mesajları:** Conventional Commits
   (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:` …).

## Akış

```bash
git checkout -b feature/kisa-aciklama
npm run check     # lint + test
git commit -m "feat: ..."
git push
```

## Yeni veri sürümü ekleme

1. Yeni raporu `src/data/miras.json` formatına dönüştür.
2. `tests/data.test.js` içindeki "bilinen tutarlar" testini yeni toplamlarla
   güncelle (değişiklik kasıtlıysa).
3. `npm test` → yeşil.
4. PR aç; CI lint+test+deploy zincirini çalıştırır.
