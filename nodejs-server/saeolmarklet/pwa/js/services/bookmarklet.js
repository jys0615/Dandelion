// 북마클릿 코드 생성 서비스
class BookmarkletService {
    constructor() {
        this.baseUrl = window.location.origin;
    }

    // 북마클릿 코드 생성
    generateCode(templateId, autoFillUser, autoFillContent, autoCheck) {
        // 템플릿 데이터 가져오기
        const templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');
        const template = templates.find(t => t.id === templateId);

        if (!template) {
            console.error('템플릿을 찾을 수 없습니다:', templateId);
            return '';
        }

        // 사용자 정보 가져오기
        const userInfo = JSON.parse(localStorage.getItem('saeol_user_info') || '{}');

        // 북마클릿 실행 코드
        const bookmarkletCode = `
javascript:(function(){
    try {
        /* 현재 페이지가 새올민원창구인지 확인 */
        if (!window.location.hostname.includes('eminwon') && !window.location.hostname.includes('emwp')) {
            alert('새올전자민원창구 페이지에서만 사용 가능합니다.');
            return;
        }

        /* 데이터 설정 */
        const data = {
            template: ${JSON.stringify(template)},
            userInfo: ${autoFillUser ? JSON.stringify(userInfo) : '{}'},
            autoFillContent: ${autoFillContent},
            autoCheck: ${autoCheck}
        };

        /* 민원 작성 페이지 확인 및 자동 입력 */
        function fillComplaintForm() {
            try {
                /* 제목 입력 */
                const titleInput = document.querySelector('input[name="mw_cnsl_sj"], #mw_cnsl_sj');
                if (titleInput && data.autoFillContent) {
                    titleInput.value = data.template.title;
                    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                }

                /* 공개여부 선택 */
                const disclosureRadio = document.querySelector('input[name="qna_open_yn"][value="' + data.template.disclosure + '"]');
                if (disclosureRadio && data.autoFillContent) {
                    disclosureRadio.checked = true;
                    disclosureRadio.dispatchEvent(new Event('change', { bubbles: true }));
                }

                /* 전자우편주소 입력 */
                const emailInput = document.querySelector('input[name="email"], #email');
                if (emailInput && data.userInfo.email) {
                    emailInput.value = data.userInfo.email;
                    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                }

                /* 휴대폰번호 입력 */
                const phoneInput = document.querySelector('input[name="hpno"], #hpno');
                if (phoneInput && data.userInfo.phoneNumber) {
                    phoneInput.value = data.userInfo.phoneNumber;
                    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
                }

                /* 전화번호 입력 */
                const telInput = document.querySelector('input[name="telno"], #telno');
                if (telInput && data.userInfo.telNumber) {
                    telInput.value = data.userInfo.telNumber;
                    telInput.dispatchEvent(new Event('input', { bubbles: true }));
                }

                /* 내용 입력 */
                const contentTextarea = document.querySelector('textarea[name="mw_appl_cn"], #mw_appl_cn');
                if (contentTextarea && data.autoFillContent) {
                    contentTextarea.value = data.template.content;
                    contentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                }

                /* 결과통지 체크박스 */
                if (data.autoFillContent) {
                    const emailCheckbox = document.querySelector('input[name="email_rprt_yn"], #email_rprt_yn');
                    if (emailCheckbox) {
                        emailCheckbox.checked = data.template.emailNotify;
                    }

                    const smsCheckbox = document.querySelector('input[name="sms_rprt_yn"], #sms_rprt_yn');
                    if (smsCheckbox) {
                        smsCheckbox.checked = data.template.smsNotify;
                    }
                }

                /* 개인정보 동의 체크 */
                if (data.autoCheck) {
                    const agreeCheckbox = document.querySelector('input[name="agreeCheck"], #agreeCheck');
                    if (agreeCheckbox) {
                        agreeCheckbox.checked = true;
                        agreeCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }

                /* 성공 메시지 표시 */
                showMessage('✅ 민원 양식이 자동으로 입력되었습니다.\\n주소는 수동으로 입력해주세요.', 'success');
                
                /* 이력 저장 */
                saveHistory({
                    title: data.template.title,
                    status: 'success',
                    date: new Date().toISOString()
                });

            } catch (error) {
                console.error('폼 입력 중 오류:', error);
                showMessage('❌ 자동 입력 중 오류가 발생했습니다.', 'error');
            }
        }

        /* PASS 인증 페이지 자동 입력 */
        function fillPassAuth() {
            try {
                /* 통신사 선택 페이지 */
                if (window.location.href.includes('pcc_V3_j10')) {
                    const telecom = data.userInfo.telecom || 'SKT';
                    const button = document.querySelector('button[onclick*="' + telecom + '"]');
                    if (button) {
                        button.click();
                        showMessage('통신사가 선택되었습니다.', 'info');
                    }
                }

                /* 개인정보 입력 페이지 */
                if (window.location.href.includes('pcc_V3_j30_certHpTi01')) {
                    /* 이름 입력 */
                    const nameInput = document.querySelector('.userName, input[name="userName"]');
                    if (nameInput && data.userInfo.userName) {
                        nameInput.value = data.userInfo.userName;
                    }

                    /* 생년월일 입력 */
                    const birthInput = document.querySelector('.myNum1, input[name="myNum1"]');
                    if (birthInput && data.userInfo.birthDate) {
                        birthInput.value = data.userInfo.birthDate;
                    }

                    /* 성별 입력 */
                    const genderInput = document.querySelector('.myNum2, input[name="myNum2"]');
                    if (genderInput && data.userInfo.genderDigit) {
                        genderInput.value = data.userInfo.genderDigit;
                    }

                    /* 휴대폰번호 입력 */
                    const phoneInput = document.querySelector('.mobileNo, input[name="mobileNo"]');
                    if (phoneInput && data.userInfo.phoneNumber) {
                        phoneInput.value = data.userInfo.phoneNumber;
                    }

                    showMessage('⚠️ CAPTCHA는 직접 입력해주세요.', 'warning');
                }

                /* 인증번호 입력 페이지 */
                if (window.location.href.includes('pcc_V3_j30_certHpTi03')) {
                    showMessage('⚠️ SMS 인증번호를 입력해주세요.', 'warning');
                }
            } catch (error) {
                console.error('PASS 인증 입력 중 오류:', error);
            }
        }

        /* 메시지 표시 함수 */
        function showMessage(message, type) {
            const div = document.createElement('div');
            div.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: \${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                animation: slideIn 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
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
                const history = JSON.parse(localStorage.getItem('saeol_history') || '[]');
                history.unshift(item);
                localStorage.setItem('saeol_history', JSON.stringify(history.slice(0, 100)));
            } catch (e) {
                console.error('이력 저장 실패:', e);
            }
        }

        /* 페이지 유형 확인 및 실행 */
        if (window.location.href.includes('pass.kbstar.com') || 
            window.location.href.includes('pcc_V3')) {
            /* PASS 인증 페이지 */
            fillPassAuth();
        } else {
            /* 민원 작성 페이지 */
            fillComplaintForm();
            
            /* 도우미 표시 체크 */
            if (localStorage.getItem('saeol_helper_enabled') === 'true') {
                showHelper();
            }
        }

        /* 도우미 표시 함수 */
        function showHelper() {
            const helper = document.createElement('div');
            helper.id = 'saeol-helper';
            helper.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                background: white;
                border: 2px solid #2196F3;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                animation: slideIn 0.5s ease;
            \`;
            
            helper.innerHTML = \`
                <div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 15px; border-radius: 10px 10px 0 0;">
                    <h3 style="margin: 0; font-size: 16px;">✨ 새올민원 도우미</h3>
                    <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
                </div>
                <div style="padding: 20px;">
                    <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0; color: #1565C0; font-size: 14px;">
                            📝 민원이 자동으로 입력되었습니다!
                        </p>
                    </div>
                    <div style="border-left: 4px solid #4CAF50; padding-left: 12px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 5px 0; color: #333; font-size: 14px;">✅ 완료된 항목</h4>
                        <ul style="margin: 5px 0; padding-left: 20px; color: #666; font-size: 13px;">
                            <li>제목 입력</li>
                            <li>내용 입력</li>
                            <li>연락처 입력</li>
                            <li>공개여부 선택</li>
                        </ul>
                    </div>
                    <div style="border-left: 4px solid #FF9800; padding-left: 12px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 5px 0; color: #333; font-size: 14px;">⚠️ 수동 입력 필요</h4>
                        <ul style="margin: 5px 0; padding-left: 20px; color: #666; font-size: 13px;">
                            <li><strong>주소:</strong> 주소검색 버튼 클릭</li>
                            <li><strong>파일:</strong> 필요시 첨부</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="location.href='${window.location.origin}'" style="
                            background: linear-gradient(135deg, #4CAF50, #45a049);
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: bold;
                            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                        ">
                            다른 템플릿 사용
                        </button>
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; text-align: center;">
                        <label style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #666; font-size: 13px; cursor: pointer;">
                            <input type="checkbox" checked onchange="localStorage.setItem('saeol_helper_enabled', this.checked)">
                            다음에도 도우미 표시
                        </label>
                    </div>
                </div>
            \`;
            
            document.body.appendChild(helper);
            
            /* 5초 후 자동 최소화 */
            setTimeout(() => {
                if (document.getElementById('saeol-helper')) {
                    minimizeHelper();
                }
            }, 5000);
        }
        
        /* 도우미 최소화 */
        function minimizeHelper() {
            const helper = document.getElementById('saeol-helper');
            if (helper) {
                helper.style.width = '60px';
                helper.style.height = '60px';
                helper.style.overflow = 'hidden';
                helper.innerHTML = \`
                    <div style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, #2196F3, #1976D2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        box-shadow: 0 4px 20px rgba(33, 150, 243, 0.4);
                    " onclick="showHelper()">
                        <span style="color: white; font-size: 24px;">📋</span>
                    </div>
                \`;
                helper.style.borderRadius = '50%';
                helper.style.border = 'none';
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

    // 북마클릿 코드를 클립보드에 복사
    copyToClipboard(code) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(code);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = code;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return Promise.resolve();
        }
    }

    // 모바일 브라우저 감지
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // QR 코드 생성 (외부 API 사용)
    async generateQRCode(code) {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}`;
        return qrApiUrl;
    }
}

// 전역 북마클릿 서비스 인스턴스
const bookmarkletService = new BookmarkletService();