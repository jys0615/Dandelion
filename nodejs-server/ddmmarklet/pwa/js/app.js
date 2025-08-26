// 구청장에게 바란다 PWA 메인 앱
class DDMApp {
    constructor() {
        this.currentTab = 'user';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserInfo();
        this.loadTemplates();
        this.registerServiceWorker();
    }

    // Service Worker 등록
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker 등록 성공');
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
        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUserInfo();
        });

        // 템플릿 폼
        document.getElementById('templateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTemplate();
        });

        // 북마클릿 생성
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateBookmarklet();
        });

        // 북마클릿 복사
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyBookmarklet();
        });

        // 템플릿 선택 변경
        document.getElementById('bookmarkletTemplate').addEventListener('change', () => {
            document.getElementById('bookmarkletResult').style.display = 'none';
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

        // 북마클릿 탭인 경우 템플릿 목록 업데이트
        if (tabName === 'bookmarklet') {
            this.updateBookmarkletTemplateList();
        }
    }

    // 사용자 정보 저장
    saveUserInfo() {
        const formData = new FormData(document.getElementById('userForm'));
        const userInfo = {};

        formData.forEach((value, key) => {
            userInfo[key] = value;
        });

        localStorage.setItem('ddm_user_info', JSON.stringify(userInfo));
        this.showToast('사용자 정보가 저장되었습니다.', 'success');
    }

    // 사용자 정보 불러오기
    loadUserInfo() {
        const savedInfo = localStorage.getItem('ddm_user_info');
        if (savedInfo) {
            const userInfo = JSON.parse(savedInfo);
            const form = document.getElementById('userForm');

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
            cvplSj: formData.get('cvplSj'),
            cvplCn: formData.get('cvplCn'),
            othbcAt: formData.get('othbcAt'),
            smsAt: formData.get('smsAt'),
            createdAt: new Date().toISOString()
        };

        let templates = JSON.parse(localStorage.getItem('ddm_templates') || '[]');
        templates.push(template);

        localStorage.setItem('ddm_templates', JSON.stringify(templates));

        // 폼 초기화
        document.getElementById('templateForm').reset();

        // 목록 업데이트
        this.loadTemplates();

        this.showToast('템플릿이 저장되었습니다.', 'success');
    }

    // 템플릿 목록 불러오기
    loadTemplates() {
        const templates = JSON.parse(localStorage.getItem('ddm_templates') || '[]');
        const container = document.getElementById('templatesList');

        if (templates.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#999;">저장된 템플릿이 없습니다.</p>';
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-item">
                <h4>${template.name}</h4>
                <p style="color:#666; font-size:14px;">${template.cvplSj}</p>
                <p style="font-size:12px; color:#999;">
                    ${new Date(template.createdAt).toLocaleDateString('ko-KR')}
                </p>
                <div class="template-actions">
                    <button class="btn btn-secondary" data-action="use" data-id="${template.id}">사용</button>
                    <button class="btn btn-secondary" data-action="delete" data-id="${template.id}">삭제</button>
                </div>
            </div>
        `).join('');

        // 이벤트 위임
        container.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;

                if (action === 'delete') {
                    this.deleteTemplate(id);
                } else if (action === 'use') {
                    this.useTemplate(id);
                }
            }
        });
    }

    // 템플릿 삭제
    deleteTemplate(id) {
        if (!confirm('이 템플릿을 삭제하시겠습니까?')) return;

        let templates = JSON.parse(localStorage.getItem('ddm_templates') || '[]');
        templates = templates.filter(t => t.id !== id);

        localStorage.setItem('ddm_templates', JSON.stringify(templates));
        this.loadTemplates();
        this.showToast('템플릿이 삭제되었습니다.', 'success');
    }

    // 템플릿 사용
    useTemplate(id) {
        const templates = JSON.parse(localStorage.getItem('ddm_templates') || '[]');
        const template = templates.find(t => t.id === id);

        if (!template) return;

        // 템플릿 탭으로 이동
        this.switchTab('templates');

        // 폼에 데이터 채우기
        const form = document.getElementById('templateForm');
        form.querySelector('[name="templateName"]').value = template.name;
        form.querySelector('[name="cvplSj"]').value = template.cvplSj;
        form.querySelector('[name="cvplCn"]').value = template.cvplCn;
        form.querySelector(`[name="othbcAt"][value="${template.othbcAt}"]`).checked = true;
        form.querySelector(`[name="smsAt"][value="${template.smsAt}"]`).checked = true;
    }

    // 북마클릿 템플릿 목록 업데이트
    updateBookmarkletTemplateList() {
        const templates = JSON.parse(localStorage.getItem('ddm_templates') || '[]');
        const select = document.getElementById('bookmarkletTemplate');

        select.innerHTML = '<option value="">템플릿을 선택하세요</option>';

        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            select.appendChild(option);
        });
    }

    // 북마클릿 생성
    generateBookmarklet() {
        const templateId = document.getElementById('bookmarkletTemplate').value;
        if (!templateId) {
            this.showToast('템플릿을 선택해주세요.', 'error');
            return;
        }

        const templates = JSON.parse(localStorage.getItem('ddm_templates') || '[]');
        const template = templates.find(t => t.id === templateId);
        const userInfo = JSON.parse(localStorage.getItem('ddm_user_info') || '{}');

        if (!template) {
            this.showToast('템플릿을 찾을 수 없습니다.', 'error');
            return;
        }

        // 북마클릿 코드 생성
        const bookmarkletCode = bookmarkletService.generateCode(template, userInfo);

        // 링크 업데이트
        const link = document.getElementById('bookmarkletLink');
        link.href = bookmarkletCode;

        // 결과 표시
        document.getElementById('bookmarkletResult').style.display = 'block';

        this.showToast('북마클릿이 생성되었습니다!', 'success');
    }

    // 북마클릿 복사
    copyBookmarklet() {
        const link = document.getElementById('bookmarkletLink');
        navigator.clipboard.writeText(link.href).then(() => {
            this.showToast('북마클릿 링크가 복사되었습니다!', 'success');
        }).catch(() => {
            this.showToast('복사에 실패했습니다.', 'error');
        });
    }

    // 토스트 메시지
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
    app = new DDMApp();
});