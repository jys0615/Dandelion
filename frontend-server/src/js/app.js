document.addEventListener('DOMContentLoaded', async () => {
    const isConnected = await apiService.testConnection();

    if (!isConnected) {
        showNotification('서버 연결 실패. 오프라인 모드로 작동합니다.', 'warning');
    }

    // 플로팅 버튼 모드 초기화
    window.floatingMode = false;

    renderComplaintForm();
    renderBookmarkList();

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            if (targetTab === 'bookmarks') {
                renderBookmarkList();
            }
        });
    });

    // 플로팅 버튼 토글 함수 개선
    window.toggleFloatingMode = function () {
        window.floatingMode = !window.floatingMode;

        // UI 업데이트
        updateFloatingModeDisplay();

        // 알림 표시
        if (window.floatingMode) {
            showNotification('🎯 플로팅 버튼 모드 활성화 - 민원 사이트에 고정 버튼이 생성됩니다', 'info');
        } else {
            showNotification('📌 일반 북마클릿 모드 - 북마크 바에 저장하여 사용합니다', 'info');
        }
    };

    if ('storage' in navigator && 'persist' in navigator.storage) {
        const isPersisted = await navigator.storage.persist();
        console.log(`영구 저장소: ${isPersisted ? '허용' : '미허용'}`);
    }
});

window.addEventListener('online', () => {
    showNotification('인터넷 연결 복구됨', 'success');
});

window.addEventListener('offline', () => {
    showNotification('오프라인 상태입니다', 'warning');
});