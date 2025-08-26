// Service Worker for PWA functionality
const CACHE_NAME = 'saeol-pwa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/app.js',
    '/js/services/storage.js',
    '/js/services/bookmarklet.js',
    '/js/utils/validator.js'
];

// 설치 이벤트
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('캐시 열기 성공');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('캐시 추가 실패:', error);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 페치 이벤트
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에서 찾았으면 반환
                if (response) {
                    return response;
                }

                // 네트워크 요청
                return fetch(event.request).then(response => {
                    // 유효한 응답이 아니면 그대로 반환
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 응답 복제
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // 오프라인 폴백 페이지
                return caches.match('/offline.html');
            })
    );
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
    if (event.tag === 'sync-complaints') {
        event.waitUntil(syncComplaints());
    }
});

// 푸시 알림
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('새올민원 알림', options)
    );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

// 동기화 함수
async function syncComplaints() {
    // IndexedDB에서 동기화되지 않은 데이터 가져오기
    // 서버로 전송
    // 성공하면 로컬 데이터 업데이트
    console.log('백그라운드 동기화 실행');
}