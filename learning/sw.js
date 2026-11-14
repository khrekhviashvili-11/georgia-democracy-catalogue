const CACHE_NAME="learning-os-cache-v1";
const FILES=["./","./index.html","./style.css","./data.js","./app.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){let clone=response.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,clone)).catch(()=>{})}return response}).catch(()=>caches.match(event.request)))});
