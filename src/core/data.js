/**
 * Veri erişim katmanı: window.DATA'a tek erişim noktası.
 * Tüm view/router/search kodu D()'yi kullanır; doğrudan window.DATA erişimi yasaktır.
 */
let data = null;

export function loadData(payload) {
  data = payload;
  return data;
}

export function D() {
  if (!data) {
    if (window.DATA) loadData(window.DATA);
    else throw new Error("Veri yüklenmedi: loadData() çağrılmalı");
  }
  return data;
}
