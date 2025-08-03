const CACHE_NAME = 'suzhou-hangzhou-trip-v1';
// 定義要緩存的資源列表
const urlsToCache = [
    './', // 緩存根目錄的 index.html
    './index.html',
    'https://cdn.tailwindcss.com', // Tailwind CSS CDN
    'https://cdn.jsdelivr.net/npm/chart.js', // Chart.js CDN
    'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap', // Google Fonts CSS
    // 注意：字體檔案 (woff2) 的 URL 可能會根據實際加載情況而異，
    // 您可能需要檢查瀏覽器開發者工具的網路選項卡來獲取確切的 URL 並加入到這裡。
    // 例如：'https://fonts.gstatic.com/s/notosanstc/v36/AdNrZZsLwEJoR8ZtVYpGp_RGAhWl_jY.woff2'
];

// 安裝事件：緩存所有核心資源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 抓取事件：攔截網路請求並提供緩存或網路響應
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果緩存中有匹配的響應，則返回緩存的內容
                if (response) {
                    return response;
                }
                // 否則，從網路獲取請求
                return fetch(event.request).then(
                    (response) => {
                        // 檢查是否收到有效的響應
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 重要：複製響應。響應是一個流，只能被消費一次。
                        // 我們必須複製它，以便瀏覽器可以消費原始響應，
                        // 而我們可以消費複製的響應來進行緩存。
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// 啟動事件：清理舊的緩存
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName); // 刪除不在白名單中的舊緩存
                    }
                })
            );
        })
    );
});