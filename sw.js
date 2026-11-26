/* Service worker de Sirena.
   Con conexión: siempre trae la versión más nueva de GitHub y la guarda.
   Sin conexión: usa la copia guardada. Así la app nunca queda pegada a una versión vieja. */
const CACHE = "sirena-v21";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./maletin.js",
  "./protocolos.js",
  "./protocolos_ampliados.js",
  "./protocolos_pediatricos.js",
  "./protocolos_frecuentes.js",
  "./guias.js",
  "./presuntivos.js",
  "./manejo_general.js",
  "./soporte_vital.js",
  "./fichas.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./logo-sirena.png",
  "./favicon-48.png",
  "./icon-apple-180.png",
  "./fuente-texto-400.woff2",
  "./fuente-texto-600.woff2",
  "./fuente-texto-800.woff2",
  "./fuente-mono-500.woff2",
  "./fuente-mono-700.woff2",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(responder(e.request));
});

/* Red primero, pero con límite: si en 3 s no responde (señal colgada), abre con la copia guardada.
   Si no hay copia, sigue esperando a la red. */
let lentaHasta = 0; // mientras la red está colgada, no volver a esperar en cada archivo
async function responder(req) {
  const desdeCache = () => caches.match(req, { ignoreSearch: true })
    .then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
  const red = fetch(req, { cache: "no-cache" }).then((res) => {
    lentaHasta = 0;
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
    return res;
  });
  const ms = Date.now() < lentaHasta ? 0 : 3000;
  const espera = new Promise((ok) => setTimeout(ok, ms)).then(async () => {
    const hit = await desdeCache();
    if (hit && ms) lentaHasta = Date.now() + 30000;
    return hit;
  });
  try {
    const primero = await Promise.race([red, espera]);
    if (primero) return primero;
    return await red;
  } catch (e) {
    const hit = await desdeCache();
    if (hit) return hit;
    throw e;
  }
}
