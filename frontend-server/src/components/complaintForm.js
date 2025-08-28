function renderComplaintForm() {
    const formContainer = document.getElementById('complaint-form');
    if (!formContainer) return;

    formContainer.innerHTML = `
        <form id="complaintForm">
            <!-- 플로팅 버튼 모드 토글 추가 -->
            <div class="form-group" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <label style="color: white; display: flex; align-items: center; justify-content: space-between;">
                    <span>📝 플로팅 버튼 모드</span>
                    <button type="button" id="floating-mode-toggle" onclick="toggleFloatingMode()" 
                            style="background: white; color: #764ba2; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                        플로팅 버튼 모드로 전환
                    </button>
                </label>
                <p style="color: rgba(255,255,255,0.9); font-size: 0.875rem; margin-top: 0.5rem;">
                    활성화하면 민원 사이트에 고정 버튼이 표시되는 북마클릿을 생성합니다.
                </p>
            </div>

            <div class="form-group">
                <label for="systemSelect">민원 시스템</label>
                <select id="systemSelect" name="system" required>
                    <option value="SAFETY">안전신문고</option>
                    <option value="DDM">구청장에게 바란다</option>
                    <option value="SAEOL">새올전자민원창구</option>
                </select>
            </div>

            <div class="form-group">
                <label for="title">제목</label>
                <input type="text" id="title" name="title" required placeholder="민원 제목을 입력하세요">
            </div>

            <div class="form-group">
                <label for="content">내용</label>
                <textarea id="content" name="content" rows="5" required placeholder="민원 내용을 입력하세요"></textarea>
            </div>

            <div class="form-group">
                <label for="phone">전화번호</label>
                <input type="tel" id="phone" name="phone" placeholder="010-1234-5678">
            </div>

            <div class="form-group">
                <label for="email">이메일</label>
                <input type="email" id="email" name="email" placeholder="example@email.com">
            </div>

            <div class="form-group">
                <label for="name">이름</label>
                <input type="text" id="name" name="name" placeholder="홍길동">
            </div>

            <div id="additionalFields"></div>

            <button type="submit" class="submit-btn" id="submit-button">북마클릿 생성</button>
        </form>
    `;

    formHandler.initializeForm();

    // 플로팅 모드 상태 표시 업데이트
    updateFloatingModeDisplay();
}

// 플로팅 모드 표시 업데이트 함수 추가
function updateFloatingModeDisplay() {
    const toggleBtn = document.getElementById('floating-mode-toggle');
    const submitBtn = document.getElementById('submit-button');

    if (toggleBtn && submitBtn) {
        if (window.floatingMode) {
            toggleBtn.textContent = '일반 북마클릿 모드로 전환';
            toggleBtn.style.background = '#2196F3';
            toggleBtn.style.color = 'white';
            submitBtn.textContent = '🎯 플로팅 버튼 북마클릿 생성';
            submitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else {
            toggleBtn.textContent = '플로팅 버튼 모드로 전환';
            toggleBtn.style.background = 'white';
            toggleBtn.style.color = '#764ba2';
            submitBtn.textContent = '📌 일반 북마클릿 생성';
            submitBtn.style.background = '#2196F3';
        }
    }
}