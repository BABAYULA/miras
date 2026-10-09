# Miras — Dönertaş Köyü Mirasçı Tahsis Cetveli

Muş, Varto, Dönertaş köyü ada/parsel bazlı bilirkişi raporu görselleştirmesi.
Tamamen çevrimdışı çalışan, sıfır bağımlılıklı statik web uygulaması.

**Yayın adresi:** https://babayula.github.io/miras/

## Mimari

Katmanlı yapı; bağımlılık yönü yalnızca `views → core` (yukarıdan aşağıya):

```
src/
├── main.js            # giriş: veri yükleme + router başlatma
├── core/              # iş mantığı ve altyapı
│   ├── data.js        #   veri erişim katmanı (tek erişim noktası)
│   ├── format.js      #   biçimlendirme (₺, %, sayı) + esc() + norm()
│   ├── helpers.js     #   bağlantı üreticileri
│   └── router.js      #   hash router (#/, #/parcel/:pk, #/group/:gk, #/person/:ad)
├── views/
│   ├── pages.js       # sayfa düzeyi görünümler
│   └── rows.js        # satır/kart üreticileri
├── ui/
│   └── search.js      # arama + otomatik tamamlama + başa dön
├── data/
│   └── miras.json     # bilirkişi raporu verisi (13 parsel, 8 grup, 41 mirasçı)
└── styles/
    └── main.css       # tüm stil (responsive, mobil alt gezinme)
```

## Geliştirme

```bash
npm install
npm run lint      # ESLint
npm test          # karakterizasyon testleri (9 test)
npm run format    # Prettier
npm run check     # lint + test

# yerel sunucu (ES modülleri için gerekli)
npx http-server -p 8137 -c-1
# → http://127.0.0.1:8137
```

## Veri değişmezleri

`tests/data.test.js` dağıtım cetvelinin doğruluğunu kilitleyen değişmezleri
test eder; bunlardan biri bozulursa dağıtım yanlış demektir:

- parsel değerleri toplamı = grup toplamları toplamı = kişi toplamları toplamı
- her parselde `gruba_dusen` paylarının toplamı 1
- her parselde `kisi_basi = gruba_dusen / grup_kisi`
- her kişi yalnızca kendi grubunun pay aldığı parsellerde bulunur

## CI/CD

GitHub Actions: her push'ta lint + test çalışır; `main`'de başarılıysa
`index.html` + `src/` GitHub Pages'e deploy edilir.

## Rapor kaynağı

Bilirkişi raporu PDF: https://files.catbox.moe/bev29e.pdf
