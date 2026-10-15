// Service Worker（アプリを裏で支える小さなプログラム）
// 役割: ファイルを保存しておいて、電波が悪くてもアプリを開けるようにする
// ※ アプリを直したら CACHE_NAME の番号を上げること。上げないとスマホが古い版を出し続ける
const CACHE_NAME = "eigo-asobi-v3";
const IMAGES = ["fire","police","ambulance","dump","excavator","crane","tanker","tractor","panel","bus",
                "train","shinkansen","airplane","ship","sailboat","rocket","motorcycle"].map(n => `./img/${n}.jpg`);
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./img/garbage.svg", ...IMAGES];

// インストール時: ファイルを保存
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// 更新時: 古い保存データを掃除
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ページを開く時: まずネットから取得、ダメなら保存データを使う
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
