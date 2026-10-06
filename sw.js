const V='bibbia-v5'; // cambia versione per riscrivere la cache da zero
const F=['./','index.html','style.css','app.js','books.json','manifest.webmanifest','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim();});
// stale-while-revalidate: risposta subito dalla cache (offline), aggiornamento in background
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r;}).catch(()=>hit);return hit||net;}));});
