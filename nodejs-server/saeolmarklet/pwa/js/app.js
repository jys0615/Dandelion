// PWA 메인 앱 로직
class SaeolApp {
    constructor() {
        this.currentTab = 'user-info';
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.loadUserInfo();
        this.loadTemplates();
        this.loadHistory();
        this.checkOnlineStatus();
        this.setupInstallPrompt();
    }

    // 서비스 워커 등록
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker 등록 성공:', registration);
            } catch (error) {
                console.error('Service Worker 등록 실패:', error);
            }
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 탭 전환
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // 사용자 정보 폼
        document.getElementById('userInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUserInfo();
        });

        // 템플릿 폼
        document.getElementById('templateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTemplate();
        });

        // 북마클릿 템플릿 선택 시
        document.getElementById('bookmarkletTemplate').addEventListener('change', () => {
            this.updateBookmarkletPreview();
        });

        // 북마클릿 생성 버튼
        document.getElementById('generateBookmarkletBtn').addEventListener('click', () => {
            this.generateBookmarklet();
        });

        // 북마클릿 복사 버튼
        document.getElementById('copyBookmarkletBtn').addEventListener('click', () => {
            this.copyBookmarklet();
        });

        // 자동 북마크 추가 버튼
        document.getElementById('autoAddBookmarkBtn')?.addEventListener('click', () => {
            this.autoAddBookmark();
        });

        // 도우미 활성화 체크박스
        document.getElementById('enableHelper')?.addEventListener('change', (e) => {
            this.toggleHelper(e.target.checked);
        });

        // 이력 관련 버튼
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('exportHistoryBtn').addEventListener('click', () => {
            this.exportHistory();
        });
    }

    // 탭 전환
    switchTab(tabName) {
        // 모든 탭 비활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 선택된 탭 활성화
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // 북마클릿 탭일 경우 템플릿 목록 업데이트
        if (tabName === 'bookmarklet') {
            this.updateBookmarkletTemplateList();
        }
    }

    // 사용자 정보 저장
    saveUserInfo() {
        const formData = new FormData(document.getElementById('userInfoForm'));
        const userInfo = {};

        formData.forEach((value, key) => {
            userInfo[key] = value;
        });

        // LocalStorage에 저장
        localStorage.setItem('saeol_user_info', JSON.stringify(userInfo));

        // IndexedDB에도 저장 (대용량 데이터 대비)
        storageService.saveUserInfo(userInfo);

        this.showToast('사용자 정보가 저장되었습니다.', 'success');
        this.updateLastSync();

        // *** 변경점: 안드로이드 앱으로 데이터 전송 ***
        this.sendDataToAndroid();
    }

    // 사용자 정보 불러오기
    loadUserInfo() {
        const savedInfo = localStorage.getItem('saeol_user_info');
        if (savedInfo) {
            const userInfo = JSON.parse(savedInfo);
            const form = document.getElementById('userInfoForm');

            Object.keys(userInfo).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = userInfo[key];
                }
            });
        }
    }

    // 템플릿 저장
    saveTemplate() {
        const formData = new FormData(document.getElementById('templateForm'));
        const template = {
            id: Date.now().toString(),
            name: formData.get('templateName'),
            title: formData.get('complaintTitle'),
            disclosure: formData.get('disclosure'),
            content: formData.get('complaintContent'),
            emailNotify: formData.get('emailNotify') === 'on',
            smsNotify: formData.get('smsNotify') === 'on',
            createdAt: new Date().toISOString()
        };

        // 템플릿 목록 가져오기
        let templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');
        templates.push(template);

        // 저장
        localStorage.setItem('saeol_templates', JSON.stringify(templates));
        storageService.saveTemplate(template);

        // 폼 초기화
        document.getElementById('templateForm').reset();

        // 목록 업데이트
        this.loadTemplates();

        this.showToast('템플릿이 저장되었습니다.', 'success');

        // *** 변경점: 안드로이드 앱으로 데이터 전송 ***
        this.sendDataToAndroid();
    }

    // *** 신규 추가: 안드로이드 데이터 전송 함수 ***
    sendDataToAndroid() {
        // 안드로이드 앱의 WebAppInterface가 존재하는지 확인
        if (window.AndroidBridge && typeof window.AndroidBridge.postUserData === 'function') {
            try {
                // 저장된 사용자 정보와 최신 템플릿(또는 선택된 템플릿) 정보를 가져옵니다.
                const userInfo = JSON.parse(localStorage.getItem('saeol_user_info') || '{}');
                const templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');

                // Autofill을 위해 가장 최근에 만든 템플릿을 대표로 사용합니다.
                const latestTemplate = templates.length > 0 ? templates[templates.length - 1] : {};

                const combinedData = {
                    userInfo: userInfo,
                    template: latestTemplate
                };

                // 안드로이드 네이티브 코드로 JSON 데이터 전송
                window.AndroidBridge.postUserData(JSON.stringify(combinedData));
                console.log('Data sent to Android app.');

            } catch (e) {
                console.error('Error sending data to Android:', e);
            }
        }
    }

    // 템플릿 목록 불러오기
    loadTemplates() {
        const templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');
        const container = document.getElementById('templatesList');

        if (templates.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#999;">저장된 템플릿이 없습니다.</p>';
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-item" data-id="${template.id}">
                <h4>${template.name}</h4>
                <p>${template.title}</p>
                <p style="font-size:12px; color:#999;">
                    ${new Date(template.createdAt).toLocaleDateString('ko-KR')}
                </p>
                <div class="template-actions">
                    <button class="btn btn-secondary" data-action="edit" data-id="${template.id}">수정</button>
                    <button class="btn btn-secondary" data-action="delete" data-id="${template.id}">삭제</button>
                </div>
            </div>
        `).join('');

        // 이벤트 위임으로 버튼 클릭 처리
        container.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;

                if (action === 'edit') {
                    this.editTemplate(id);
                } else if (action === 'delete') {
                    this.deleteTemplate(id);
                }
            }
        });
    }

    // 북마클릿 생성 메서드
    generateBookmarklet() {
        const templateId = document.getElementById('bookmarkletTemplate').value;
        if (!templateId) {
            this.showToast('템플릿을 선택해주세요.', 'error');
            return;
        }

        const autoFillUser = document.getElementById('autoFillUser').checked;
        const autoFillContent = document.getElementById('autoFillContent').checked;
        const autoCheck = document.getElementById('autoCheck').checked;

        // 북마클릿 코드 생성
        const bookmarkletCode = bookmarkletService.generateCode(
            templateId,
            autoFillUser,
            autoFillContent,
            autoCheck
        );

        // 북마클릿 링크 업데이트
        const link = document.getElementById('bookmarkletLink');
        link.href = bookmarkletCode;

        // 결과 표시
        document.getElementById('bookmarkletResult').style.display = 'block';

        this.showToast('북마클릿이 생성되었습니다!', 'success');
    }

    // 북마클릿 복사 메서드
    copyBookmarklet() {
        const link = document.getElementById('bookmarkletLink');
        navigator.clipboard.writeText(link.href).then(() => {
            this.showToast('북마클릿 링크가 복사되었습니다!', 'success');
        }).catch(() => {
            this.showToast('복사에 실패했습니다.', 'error');
        });
    }

    // 자동 북마크 추가
    autoAddBookmark() {
        const link = document.getElementById('bookmarkletLink');
        const bookmarkletCode = link.href;
        const bookmarkName = '🚀 새올민원 자동입력';

        // Web API를 통한 북마크 추가 시도
        try {
            // 북마크 데이터 저장
            const bookmarkData = {
                name: bookmarkName,
                url: bookmarkletCode,
                createdAt: new Date().toISOString()
            };

            // localStorage에 저장 (브라우저 확장 기능 연동용)
            localStorage.setItem('saeol_pending_bookmark', JSON.stringify(bookmarkData));

            // 북마크 추가 안내
            this.showBookmarkInstructions();

            // 도우미 설정 저장
            const enableHelper = document.getElementById('enableHelper').checked;
            localStorage.setItem('saeol_helper_enabled', enableHelper);

            this.showToast('북마크 설정이 준비되었습니다!', 'success');

        } catch (error) {
            console.error('북마크 추가 오류:', error);
            this.showToast('수동으로 북마크를 추가해주세요.', 'error');
        }
    }

    // 북마크 추가 안내 표시
    showBookmarkInstructions() {
        const modal = document.createElement('div');
        modal.className = 'bookmark-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📌 북마크 추가 방법</h3>
                <div class="modal-steps">
                    <p><strong>방법 1: 자동 추가 (PC Chrome)</strong></p>
                    <ol>
                        <li>Ctrl+D 또는 ⭐ 클릭</li>
                        <li>이름: "🚀 새올민원 자동입력"</li>
                        <li>폴더: "북마크바" 선택</li>
                        <li>완료 클릭</li>
                    </ol>
                    
                    <p><strong>방법 2: 모바일</strong></p>
                    <ol>
                        <li>Chrome 메뉴(⋮) 열기</li>
                        <li>⭐ 별 아이콘 탭</li>
                        <li>저장</li>
                    </ol>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">
                    확인
                </button>
            </div>
        `;

        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .bookmark-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s;
            }
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-content h3 {
                color: #2196F3;
                margin-bottom: 20px;
            }
            .modal-steps {
                margin: 20px 0;
            }
            .modal-steps p {
                font-weight: bold;
                margin-top: 15px;
                color: #333;
            }
            .modal-steps ol {
                margin: 10px 0 10px 20px;
                color: #666;
            }
            .modal-steps li {
                margin: 5px 0;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    // 도우미 토글
    toggleHelper(enabled) {
        localStorage.setItem('saeol_helper_enabled', enabled);
        if (enabled) {
            this.showToast('민원 사이트에서 도우미가 표시됩니다.', 'success');
        } else {
            this.showToast('도우미가 비활성화되었습니다.', 'info');
        }
    }

    // 템플릿 삭제
    deleteTemplate(id) {
        if (!confirm('이 템플릿을 삭제하시겠습니까?')) return;

        let templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');
        templates = templates.filter(t => t.id !== id);

        localStorage.setItem('saeol_templates', JSON.stringify(templates));
        this.loadTemplates();
        this.showToast('템플릿이 삭제되었습니다.', 'success');
    }

    // 템플릿 수정
    editTemplate(id) {
        const templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');
        const template = templates.find(t => t.id === id);

        if (!template) return;

        // 템플릿 탭으로 이동
        this.switchTab('templates');

        // 폼에 데이터 채우기
        const form = document.getElementById('templateForm');
        form.querySelector('[name="templateName"]').value = template.name;
        form.querySelector('[name="complaintTitle"]').value = template.title;
        form.querySelector(`[name="disclosure"][value="${template.disclosure}"]`).checked = true;
        form.querySelector('[name="complaintContent"]').value = template.content;
        form.querySelector('[name="emailNotify"]').checked = template.emailNotify;
        form.querySelector('[name="smsNotify"]').checked = template.smsNotify;

        // 기존 템플릿 삭제 (수정 완료 후 새로 저장)
        this.deleteTemplate(id);
    }

    // 북마클릿 템플릿 목록 업데이트
    updateBookmarkletTemplateList() {
        const templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');
        const select = document.getElementById('bookmarkletTemplate');

        select.innerHTML = '<option value="">템플릿을 선택하세요</option>';

        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            select.appendChild(option);
        });
    }

    // 북마클릿 미리보기 업데이트
    updateBookmarkletPreview() {
        const templateId = document.getElementById('bookmarkletTemplate').value;
        if (!templateId) {
            document.getElementById('bookmarkletResult').style.display = 'none';
            return;
        }
    }

    // 이력 불러오기
    loadHistory() {
        const history = JSON.parse(localStorage.getItem('saeol_history') || '[]');
        const container = document.getElementById('historyList');

        if (history.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#999;">작성 이력이 없습니다.</p>';
            return;
        }

        container.innerHTML = history.slice(0, 50).map(item => `
            <div class="history-item">
                <div class="date">${new Date(item.date).toLocaleString('ko-KR')}</div>
                <div class="title">${item.title}</div>
                <div style="font-size:12px; color:#666; margin-top:5px;">
                    ${item.status === 'success' ? '✅ 성공' : '❌ 실패'}
                </div>
            </div>
        `).join('');
    }

    // 이력 삭제
    clearHistory() {
        if (!confirm('모든 작성 이력을 삭제하시겠습니까?')) return;

        localStorage.removeItem('saeol_history');
        this.loadHistory();
        this.showToast('이력이 삭제되었습니다.', 'success');
    }

    // 이력 내보내기
    exportHistory() {
        const history = JSON.parse(localStorage.getItem('saeol_history') || '[]');

        if (history.length === 0) {
            this.showToast('내보낼 이력이 없습니다.', 'error');
            return;
        }

        const dataStr = JSON.stringify(history, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `saeol_history_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        this.showToast('이력을 내보냈습니다.', 'success');
    }

    // 온라인 상태 체크
    checkOnlineStatus() {
        const updateStatus = () => {
            const status = document.getElementById('connectionStatus');
            if (navigator.onLine) {
                status.textContent = '● 온라인';
                status.className = 'status online';
            } else {
                status.textContent = '● 오프라인';
                status.className = 'status offline';
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    }

    // 마지막 동기화 시간 업데이트
    updateLastSync() {
        const now = new Date().toLocaleTimeString('ko-KR');
        document.getElementById('lastSync').textContent = `마지막 동기화: ${now}`;
    }

    // PWA 설치 프롬프트
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;

            // 설치 프롬프트 표시
            document.getElementById('installPrompt').style.display = 'block';
        });

        document.getElementById('installBtn').addEventListener('click', async () => {
            if (!this.deferredPrompt) return;

            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                this.showToast('앱이 설치되었습니다!', 'success');
            }

            this.deferredPrompt = null;
            document.getElementById('installPrompt').style.display = 'none';
        });

        document.getElementById('dismissBtn').addEventListener('click', () => {
            document.getElementById('installPrompt').style.display = 'none';
        });
    }

    // 토스트 메시지 표시
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

}

// 앱 초기화
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SaeolApp();
});