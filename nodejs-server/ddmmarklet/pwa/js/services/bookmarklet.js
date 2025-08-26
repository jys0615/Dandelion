// 구청장에게 바란다 북마클릿 생성 서비스
class BookmarkletService {
    generateCode(template, userInfo) {
        // 북마클릿 실행 코드
        const bookmarkletCode = `
javascript:(function(){
    try {
        /* 현재 페이지 확인 */
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        /* 동대문구청 사이트인지 확인 */
        if (!hostname.includes('ddm.go.kr')) {
            alert('동대문구청 사이트에서만 사용 가능합니다.');
            return;
        }

        /* 데이터 설정 */
        const data = {
            template: ${JSON.stringify(template)},
            userInfo: ${JSON.stringify(userInfo)}
        };

        /* 로그인 페이지 처리 */
        if (pathname.includes('loginView.do')) {
            if (data.userInfo.userId && data.userInfo.userPw) {
                const userIdInput = document.getElementById('userId');
                const userPwInput = document.getElementById('userPasswd');
                const loginBtn = document.querySelector('input.login_submit');
                
                if (userIdInput && userPwInput) {
                    userIdInput.value = data.userInfo.userId;
                    userPwInput.value = data.userInfo.userPw;
                    
                    showMessage('로그인 정보가 입력되었습니다.', 'success');
                    
                    /* 자동 로그인 (선택사항) */
                    /* loginBtn.click(); */
                }
            } else {
                showMessage('저장된 로그인 정보가 없습니다.', 'warning');
            }
            return;
        }

        /* 민원 작성 페이지 처리 */
        if (pathname.includes('addCvplRceptWebView.do') || pathname.includes('chief')) {
            /* 제목 입력 */
            const titleInput = document.querySelector('input[name="cvplSj"]');
            if (titleInput) {
                titleInput.value = data.template.cvplSj;
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            /* 내용 입력 */
            const contentTextarea = document.querySelector('textarea[name="cvplCn"]');
            if (contentTextarea) {
                contentTextarea.value = data.template.cvplCn;
                contentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            }

            /* 공개여부 선택 */
            const othbcRadio = document.querySelector('input[name="othbcAt"][value="' + data.template.othbcAt + '"]');
            if (othbcRadio) {
                othbcRadio.checked = true;
                othbcRadio.dispatchEvent(new Event('change', { bubbles: true }));
            }

            /* SMS 수신여부 선택 */
            const smsRadio = document.querySelector('input[name="smsAt"][value="' + data.template.smsAt + '"]');
            if (smsRadio) {
                smsRadio.checked = true;
                smsRadio.dispatchEvent(new Event('change', { bubbles: true }));
            }

            /* 추가 정보 입력 (있는 경우) */
            if (data.userInfo.phoneNumber) {
                const phoneInput = document.querySelector('input[name="mbtlnum"], input[name="phone"]');
                if (phoneInput) {
                    phoneInput.value = data.userInfo.phoneNumber;
                }
            }

            if (data.userInfo.email) {
                const emailInput = document.querySelector('input[name="email"]');
                if (emailInput) {
                    emailInput.value = data.userInfo.email;
                }
            }

            /* 개인정보 동의 체크 (있는 경우) */
            const agreeCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="agree"], input[type="checkbox"][id*="agree"]');
            agreeCheckboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            showMessage('✅ 민원 양식이 자동으로 입력되었습니다.', 'success');
            
            /* 이력 저장 */
            saveHistory({
                title: data.template.cvplSj,
                status: 'success',
                date: new Date().toISOString()
            });

        } else {
            showMessage('민원 작성 페이지에서 실행해주세요.', 'info');
        }

        /* 메시지 표시 함수 */
        function showMessage(message, type) {
            const div = document.createElement('div');
            div.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: \${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#2196F3'};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            \`;
            div.textContent = message;
            document.body.appendChild(div);

            setTimeout(() => {
                div.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => div.remove(), 300);
            }, 4000);

            /* 애니메이션 스타일 추가 */
            if (!document.querySelector('#bookmarklet-animations')) {
                const style = document.createElement('style');
                style.id = 'bookmarklet-animations';
                style.textContent = \`
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                \`;
                document.head.appendChild(style);
            }
        }

        /* 이력 저장 함수 */
        function saveHistory(item) {
            try {
                const history = JSON.parse(localStorage.getItem('ddm_history') || '[]');
                history.unshift(item);
                localStorage.setItem('ddm_history', JSON.stringify(history.slice(0, 100)));
            } catch (e) {
                console.error('이력 저장 실패:', e);
            }
        }

    } catch (error) {
        console.error('북마클릿 실행 오류:', error);
        alert('오류가 발생했습니다: ' + error.message);
    }
})();
        `.replace(/\n\s*/g, '');

        return bookmarkletCode;
    }
}

// 전역 북마클릿 서비스 인스턴스
const bookmarkletService = new BookmarkletService();