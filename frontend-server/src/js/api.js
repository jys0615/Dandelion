const API_CONFIG = {
    SPRING_BASE_URL: 'http://localhost:8084/api',
    endpoints: {
        generateBookmarklet: '/bookmarklet/generate',
        getSystems: '/bookmarklet/systems',
        testConnection: '/bookmarklet/test'
    }
};

class ApiService {
    constructor() {
        this.sessions = new Map(); // 플로팅 버튼용 세션 저장소
    }

    async generateBookmarklet(complaintData) {
        try {
            const response = await fetch(`${API_CONFIG.SPRING_BASE_URL}${API_CONFIG.endpoints.generateBookmarklet}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(complaintData)
            });

            if (!response.ok) {
                throw new Error('북마클릿 생성 실패');
            }

            return await response.json();
        } catch (error) {
            console.error('API 호출 오류:', error);
            throw error;
        }
    }

    // 플로팅 버튼용 세션 저장
    saveFloatingSession(data) {
        const sessionId = 'float_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.sessions.set(sessionId, {
            ...data,
            createdAt: Date.now()
        });

        // 10분 후 자동 삭제
        setTimeout(() => this.sessions.delete(sessionId), 10 * 60 * 1000);

        return sessionId;
    }

    // 플로팅 버튼용 세션 조회
    getFloatingSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    // 플로팅 버튼 코드 생성 - 수정된 버전
    generateFloatingButton(sessionId, system) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            console.error('세션을 찾을 수 없습니다:', sessionId);
            return '';
        }

        // 데이터를 안전하게 이스케이프
        const safeData = {
            title: (sessionData.title || '').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n'),
            content: (sessionData.content || '').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n'),
            phone: (sessionData.phone || '').replace(/'/g, "\\'").replace(/"/g, '\\"'),
            name: (sessionData.name || '').replace(/'/g, "\\'").replace(/"/g, '\\"'),
            email: (sessionData.email || '').replace(/'/g, "\\'").replace(/"/g, '\\"')
        };

        const fieldMapping = {
            'SAFETY': {
                title: `var titleEl = document.getElementById('C_A_TITLE'); if(titleEl) titleEl.value = '${safeData.title}';`,
                content: `var contentEl = document.getElementById('C_A_CONTENTS'); if(contentEl) contentEl.value = '${safeData.content}';`,
                phone: `var phoneEl = document.getElementById('C_PHONE2'); if(phoneEl) phoneEl.value = '${safeData.phone}';`,
                name: `var nameEl = document.getElementById('C_NAME'); if(nameEl) nameEl.value = '${safeData.name}';`,
                email: `var emailEl = document.getElementById('C_EMAIL'); if(emailEl) emailEl.value = '${safeData.email}';`,
                extra: `
                    var open1 = document.getElementById('C_OPEN1'); 
                    if(open1) open1.checked = true;
                    var agree1 = document.getElementById('agreeUseMyInfo1'); 
                    if(agree1) agree1.checked = true;
                `
            },
            'SAEOL': {
                title: `var titleEl = document.querySelector('[name="title"]'); if(titleEl) titleEl.value = '${safeData.title}';`,
                content: `var contentEl = document.querySelector('[name="content"]'); if(contentEl) contentEl.value = '${safeData.content}';`,
                phone: `var phoneEl = document.querySelector('[name="phone"]'); if(phoneEl) phoneEl.value = '${safeData.phone}';`,
                name: `var nameEl = document.querySelector('[name="name"]'); if(nameEl) nameEl.value = '${safeData.name}';`,
                email: `var emailEl = document.querySelector('[name="email"]'); if(emailEl) emailEl.value = '${safeData.email}';`,
                extra: ``
            },
            'DDM': {
                title: `var titleEl = document.getElementById('title'); if(titleEl) titleEl.value = '${safeData.title}';`,
                content: `var contentEl = document.getElementById('contents'); if(contentEl) contentEl.value = '${safeData.content}';`,
                phone: `var phoneEl = document.getElementById('tel'); if(phoneEl) phoneEl.value = '${safeData.phone}';`,
                name: `var nameEl = document.getElementById('name'); if(nameEl) nameEl.value = '${safeData.name}';`,
                email: `var emailEl = document.getElementById('email'); if(emailEl) emailEl.value = '${safeData.email}';`,
                extra: ``
            }
        };

        const fields = fieldMapping[system] || fieldMapping['SAFETY'];
        const btnId = 'floatBtn_' + sessionId;

        // 북마클릿 코드 생성 (더 안전한 방식)
        const bookmarkletCode = `javascript:(function(){
            try {
                var btnId = '${btnId}';
                
                if(document.getElementById(btnId)) {
                    console.log('버튼이 이미 존재합니다');
                    return;
                }
                
                var styleEl = document.createElement('style');
                styleEl.innerHTML = '#' + btnId + '{' +
                    'position:fixed !important;' +
                    'bottom:80px !important;' +
                    'right:20px !important;' +
                    'width:60px !important;' +
                    'height:60px !important;' +
                    'background:linear-gradient(135deg,#667eea,#764ba2) !important;' +
                    'border:none !important;' +
                    'border-radius:50% !important;' +
                    'color:white !important;' +
                    'font-size:24px !important;' +
                    'box-shadow:0 4px 15px rgba(0,0,0,0.3) !important;' +
                    'cursor:pointer !important;' +
                    'z-index:999999 !important;' +
                    'transition:all 0.3s !important;' +
                '}' +
                '#' + btnId + ':hover{' +
                    'transform:scale(1.1) !important;' +
                '}';
                
                document.head.appendChild(styleEl);
                
                var btn = document.createElement('button');
                btn.id = btnId;
                btn.innerHTML = '📝';
                btn.title = '자동입력';
                
                btn.onclick = function() {
                    try {
                        ${fields.title}
                        ${fields.content}
                        ${fields.phone}
                        ${fields.name}
                        ${fields.email}
                        ${fields.extra}
                        
                        alert('✅ 자동입력이 완료되었습니다!');
                    } catch(e) {
                        alert('❌ 자동입력 중 오류가 발생했습니다: ' + e.message);
                        console.error('자동입력 오류:', e);
                    }
                };
                
                document.body.appendChild(btn);
                
                var observer = new MutationObserver(function() {
                    if(!document.getElementById(btnId) && document.body) {
                        document.body.appendChild(btn);
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                console.log('플로팅 버튼이 생성되었습니다');
                
            } catch(e) {
                alert('플로팅 버튼 생성 중 오류: ' + e.message);
                console.error('플로팅 버튼 오류:', e);
            }
        })();`;

        // 공백을 최소화하되, 문법 오류가 발생하지 않도록 유지
        return bookmarkletCode.replace(/\s+/g, ' ').replace(/\s*([{}();,:])\s*/g, '$1');
    }

    async getSystems() {
        try {
            const response = await fetch(`${API_CONFIG.SPRING_BASE_URL}${API_CONFIG.endpoints.getSystems}`);
            return await response.json();
        } catch (error) {
            console.error('시스템 목록 조회 실패:', error);
            return [];
        }
    }

    async testConnection() {
        try {
            const response = await fetch(`${API_CONFIG.SPRING_BASE_URL}${API_CONFIG.endpoints.testConnection}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

const apiService = new ApiService();