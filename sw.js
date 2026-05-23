const CACHE = "gtd-v4";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./","./index.html"])).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).catch(()=>caches.match("./index.html")))
  );
});

// プッシュ通知受信
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title||"GTDタスク", {
    body: data.body||"",
    icon: "./icon.png",
    badge: "./icon.png",
    tag: data.tag||"gtd",
    data: data,
  }));
});

// 通知クリックでアプリを開く
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:"window"}).then(cls=>{
    if(cls.length>0) return cls[0].focus();
    return clients.openWindow("./");
  }));
});
