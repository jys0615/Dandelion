if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('ServiceWorker 등록 성공'))
        .catch(error => console.log('ServiceWorker 등록 실패:', error));
}

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (installBtn) {
        installBtn.style.display = 'block';

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    console.log('PWA 설치 완료');
                }

                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA 설치됨');
    showNotification('앱이 설치되었습니다!', 'success');
});