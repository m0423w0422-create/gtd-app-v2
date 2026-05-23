const CACHE = "gtd-v5";

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

// アプリからのpostMessageで通知表示
self.addEventListener("message", e => {
  if(e.data && e.data.type==="SHOW_NOTIFICATION") {
    self.registration.showNotification(e.data.title||"🔔 リマインダー", {
      body: e.data.body||"",
      icon: "./icon.png",
      badge: "./icon.png",
      tag: e.data.tag||"gtd-reminder",
      requireInteraction: true,
    });
  }
});

// プッシュ通知
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title||"GTDタスク", {
    body: data.body||"",
    icon: "./icon.png",
    badge: "./icon.png",
    tag: data.tag||"gtd",
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
