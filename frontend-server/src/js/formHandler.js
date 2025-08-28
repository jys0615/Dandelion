class FormHandler {
    constructor() {
        this.currentSystem = 'SAFETY';
        this.formData = {};
    }

    initializeForm() {
        const form = document.getElementById('complaintForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.loadSystems();
    }

    async loadSystems() {
        try {
            const systems = await apiService.getSystems();
            const systemSelect = document.getElementById('systemSelect');

            if (!Array.isArray(systems)) {
                console.error('시스템 목록이 배열이 아닙니다:', systems);
                return;
            }

            if (systemSelect && systems.length > 0) {
                systemSelect.innerHTML = systems.map(system =>
                    `<option value="${system.code}">${system.name}</option>`
                ).join('');

                systemSelect.addEventListener('change', (e) => {
                    this.currentSystem = e.target.value;
                    this.updateFormFields();
                });
            }
        } catch (error) {
            console.error('시스템 로드 실패:', error);
            const systemSelect = document.getElementById('systemSelect');
            if (systemSelect) {
                systemSelect.innerHTML = `
                <option value="SAFETY">안전신문고</option>
                <option value="DDM">구청장에게 바란다</option>
                <option value="SAEOL">새올전자민원창구</option>
            `;
            }
        }
    }

    updateFormFields() {
        const additionalFields = document.getElementById('additionalFields');
        if (!additionalFields) return;

        let html = '';

        if (this.currentSystem === 'SAFETY') {
            html = `
                <div class="form-group">
                    <label>신고 유형</label>
                    <select name="reportType">
                        <option value="01">시설물안전</option>
                        <option value="02">교통안전</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>공유 설정</label>
                    <select name="shareContent">
                        <option value="0">비공개</option>
                        <option value="1">공개</option>
                    </select>
                </div>
            `;
        } else if (this.currentSystem === 'DDM') {
            html = `
                <div class="form-group">
                    <label>우편번호</label>
                    <input type="text" name="zip" placeholder="우편번호">
                </div>
                <div class="form-group">
                    <label>주소</label>
                    <input type="text" name="address" placeholder="주소">
                </div>
                <div class="form-group">
                    <label>공개여부</label>
                    <select name="isPublic">
                        <option value="N">비공개</option>
                        <option value="Y">공개</option>
                    </select>
                </div>
            `;
        } else if (this.currentSystem === 'SAEOL') {
            html = `
                <div class="form-group">
                    <label>공개여부</label>
                    <select name="isPublic">
                        <option value="N">비공개</option>
                        <option value="Y">공개</option>
                        <option value="C">내용공개</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>이메일 알림</label>
                    <input type="checkbox" name="emailNotify" value="Y">
                </div>
            `;
        }

        additionalFields.innerHTML = html;
    }

    async handleSubmit() {
        const formData = new FormData(document.getElementById('complaintForm'));
        const complaintData = {
            system: this.currentSystem,
            title: formData.get('title'),
            content: formData.get('content'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            name: formData.get('name')
        };

        // 추가 필드 처리
        for (let [key, value] of formData.entries()) {
            if (!complaintData[key]) {
                complaintData[key] = value;
            }
        }

        try {
            // 플로팅 모드 체크
            if (window.floatingMode) {
                // 플로팅 버튼 북마클릿 생성
                this.createFloatingBookmarklet(complaintData);
            } else {
                // 기존 일반 북마클릿 생성
                await this.createNormalBookmarklet(complaintData);
            }
        } catch (error) {
            showNotification('오류 발생: ' + error.message, 'error');
        }
    }

    createFloatingBookmarklet(complaintData) {
        showNotification('🎯 플로팅 버튼 북마클릿 생성 중...', 'info');

        // 세션 저장 및 플로팅 버튼 코드 생성
        const sessionId = apiService.saveFloatingSession(complaintData);
        const bookmarkletCode = apiService.generateFloatingButton(sessionId, complaintData.system);

        // 시스템 이름 매핑
        const systemNames = {
            'SAFETY': '안전신문고',
            'DDM': '구청장에게 바란다',
            'SAEOL': '새올전자민원창구'
        };

        // 북마클릿 데이터
        const bookmark = bookmarkManager.addBookmark({
            system: complaintData.system,
            systemName: systemNames[complaintData.system],
            title: complaintData.title,
            bookmarkletUrl: bookmarkletCode,
            bookmarkletCode: bookmarkletCode,
            isFloating: true // 플로팅 버튼 타입 표시
        });

        showNotification('🎯 플로팅 버튼 북마클릿이 생성되었습니다!', 'success');
        this.showFloatingBookmarkOptions(bookmark);
    }

    async createNormalBookmarklet(complaintData) {
        showNotification('📌 일반 북마클릿 생성 중...', 'info');

        const response = await apiService.generateBookmarklet(complaintData);

        if (response.success) {
            const bookmark = bookmarkManager.addBookmark({
                system: response.system,
                systemName: response.systemName,
                title: complaintData.title,
                bookmarkletUrl: response.bookmarkletUrl,
                bookmarkletCode: response.bookmarkletCode,
                templateId: response.templateId,
                isFloating: false
            });

            showNotification('📌 일반 북마클릿이 생성되었습니다!', 'success');
            this.showBookmarkOptions(bookmark);
        } else {
            showNotification('북마클릿 생성 실패: ' + response.message, 'error');
        }
    }

    showFloatingBookmarkOptions(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content">
            <h3>🎯 ${bookmark.systemName} 플로팅 버튼 생성 완료</h3>
            <div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <p style="color: #764ba2; font-weight: bold;">플로팅 버튼 북마클릿 특징:</p>
                <ul style="text-align: left; color: #666;">
                    <li>민원 사이트에 고정 버튼(📝)이 생성됩니다</li>
                    <li>페이지 이동 후에도 버튼이 유지됩니다</li>
                    <li>버튼 클릭 한 번으로 자동 입력 완료</li>
                </ul>
            </div>
            <div class="bookmark-actions">
                <button onclick="navigator.clipboard.writeText('${bookmark.bookmarkletUrl.replace(/'/g, "\\'")}').then(() => showNotification('클립보드에 복사됨', 'success'))">
                    📋 코드 복사
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">
                    닫기
                </button>
            </div>
            <div class="bookmark-info">
                <p><strong>사용 방법:</strong></p>
                <ol style="text-align: left; padding-left: 20px;">
                    <li>아래 버튼을 북마크 바로 드래그</li>
                    <li>민원 사이트 접속</li>
                    <li>북마크 클릭 → 플로팅 버튼(📝) 생성</li>
                    <li>플로팅 버튼 클릭 → 자동 입력 완료!</li>
                </ol>
                <a href="${bookmark.bookmarkletUrl}" 
                   class="draggable-link"
                   style="background: linear-gradient(135deg, #667eea, #764ba2);"
                   onclick="alert('이 버튼을 북마크 바로 드래그하세요!'); return false;">
                    🎯 ${bookmark.systemName} 플로팅 버튼
                </a>
            </div>
        </div>
    `;
        document.body.appendChild(modal);
    }

    showBookmarkOptions(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
        <div class="modal-content">
            <h3>📌 ${bookmark.systemName} 북마클릿 생성 완료</h3>
            <div class="bookmark-actions">
                <button onclick="bookmarkManager.executeBookmarklet('${bookmark.bookmarkletUrl}')">
                    바로 실행
                </button>
                <button onclick="navigator.clipboard.writeText('${bookmark.bookmarkletUrl}')">
                    URL 복사
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">
                    닫기
                </button>
            </div>
            <div class="bookmark-info">
                <p><strong>PC에서 북마크 추가 방법:</strong></p>
                <ol style="text-align: left; padding-left: 20px;">
                    <li>아래 버튼을 북마크바로 드래그</li>
                    <li>또는 버튼을 우클릭 → "북마크에 추가"</li>
                    <li>또는 URL 복사 후 북마크 수동 추가</li>
                </ol>
                <a href="${bookmark.bookmarkletUrl}" 
                   class="draggable-link"
                   onclick="alert('드래그하여 북마크바에 놓아주세요'); return false;">
                    📌 ${bookmark.systemName} 자동입력
                </a>
            </div>
        </div>
    `;
        document.body.appendChild(modal);
    }
}

const formHandler = new FormHandler();