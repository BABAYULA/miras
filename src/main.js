import { render } from "./core/router.js";
import "./ui/search.js";
import { loadData } from "./core/data.js";

/**
 * Uygulama giriş noktası:
 * 1. Veriyi yükle (src/data/miras.json → window.DATA fallback)
 * 2. Router'ı başlat
 */
async function boot() {
  try {
    const res = await fetch("./src/data/miras.json");
    if (!res.ok) throw new Error(`Veri yüklenemedi: HTTP ${res.status}`);
    loadData(await res.json());
  } catch (err) {
    if (!window.DATA) {
      document.getElementById("view").innerHTML =
        `<div class="no-result">Veri yüklenemedi: ${err.message}</div>`;
      return;
    }
    loadData(window.DATA); // çevrimdışı yedek
  }
  render();
}

boot();
