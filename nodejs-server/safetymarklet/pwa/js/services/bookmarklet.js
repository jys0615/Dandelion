// 안전신문고 북마클릿 생성 서비스
class BookmarkletService {
    generateCode(template, userInfo, autoLocation) {
        // 북마클릿 실행 코드
        const bookmarkletCode = `
javascript:(function(){
    try {
        /* 현재 페이지 확인 */
        const hostname = window.location.hostname;
        const hash = window.location.hash;
        
        /* 안전신문고 사이트인지 확인 */
        if (!hostname.includes('safetyreport.go.kr')) {
            alert('안전신문고 사이트에서만 사용 가능합니다.\\n현재: ' + hostname);
            return;
        }

        /* 데이터 설정 */
        const data = {
            template: ${JSON.stringify(template)},
            userInfo: ${JSON.stringify(userInfo)},
            autoLocation: ${autoLocation}
        };

        /* 신고 페이지인지 확인 */
        if (hash.includes('safereport')) {
            fillReportForm();
        } else {
            alert('신고 작성 페이지로 이동 후 다시 실행해주세요.');
            window.location.href = 'https://www.safetyreport.go.kr/#safereport/safereport';
        }

        /* 신고 폼 자동 입력 함수 */
        function fillReportForm() {
            /* 신고 유형 선택 */
            const reportTypeSelect = document.querySelector('select[name="REPORT_TYPE"], #reportType');
            if (reportTypeSelect) {
                reportTypeSelect.value = data.template.reportType;
                reportTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            /* 제목 입력 */
            setTimeout(() => {
                const titleInput = document.querySelector('input[name="REPORT_TITLE"], input[id*="title"], input[placeholder*="제목"]');
                if (titleInput) {
                    titleInput.value = data.template.title;
                    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, 500);

            /* 내용 입력 */
            setTimeout(() => {
                const contentTextarea = document.querySelector('textarea[name="REPORT_CONTENT"], textarea[id*="content"], textarea[placeholder*="내용"]');
                if (contentTextarea) {
                    contentTextarea.value = data.template.content;
                    contentTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    /* 글자수 카운터 업데이트 */
                    const counter = document.querySelector('#contentLength, .char-count span');
                    if (counter) {
                        counter.textContent = data.template.content.length;
                    }
                }
            }, 700);

            /* 위치 정보 입력 */
            if (data.autoLocation && data.template.latitude && data.template.longitude) {
                setTimeout(() => {
                    /* 주소 입력 */
                    const addressInput = document.querySelector('input[name="address"], input[id*="address"]');
                    if (addressInput && data.template.location) {
                        addressInput.value = data.template.location;
                    }

                    /* 위도 입력 */
                    const latInput = document.querySelector('input[name="latitude"], input[id*="latitude"]');
                    if (latInput) {
                        latInput.value = data.template.latitude;
                    }

                    /* 경도 입력 */
                    const lngInput = document.querySelector('input[name="longitude"], input[id*="longitude"]');
                    if (lngInput) {
                        lngInput.value = data.template.longitude;
                    }

                    /* 지도 마커 설정 시도 */
                    if (window.kakao && window.kakao.maps) {
                        try {
                            const mapContainer = document.querySelector('#map, .map-container');
                            if (mapContainer && mapContainer.__map) {
                                const map = mapContainer.__map;
                                const coords = new kakao.maps.LatLng(
                                    parseFloat(data.template.latitude),
                                    parseFloat(data.template.longitude)
                                );
                                
                                const marker = new kakao.maps.Marker({
                                    position: coords,
                                    map: map
                                });
                                
                                map.setCenter(coords);
                            }
                        } catch (e) {
                            console.log('지도 마커 설정 실패:', e);
                        }
                    }
                }, 1000);
            }

            /* 신고자 정보 입력 */
            if (data.userInfo) {
                setTimeout(() => {
                    /* 이름 입력 */
                    const nameInput = document.querySelector('input[name="C_NAME"], input[id*="name"]');
                    if (nameInput && data.userInfo.C_NAME) {
                        nameInput.value = data.userInfo.C_NAME;
                    }

                    /* 휴대폰 입력 */
                    const phoneInput = document.querySelector('input[name="C_PHONE2"], input[id*="phone"]');
                    if (phoneInput && data.userInfo.C_PHONE2) {
                        phoneInput.value = data.userInfo.C_PHONE2;
                    }

                    /* 이메일 입력 */
                    const emailInput = document.querySelector('input[name="C_EMAIL"], input[id*="email"]');
                    if (emailInput && data.userInfo.C_EMAIL) {
                        emailInput.value = data.userInfo.C_EMAIL;
                    }
                }, 1200);
            }

            /* 개인정보 동의 체크 */
            setTimeout(() => {
                const agreeCheckboxes = document.querySelectorAll('input[type="checkbox"][name*="agree"], input[type="checkbox"][id*="agree"]');
                agreeCheckboxes.forEach(checkbox => {
                    if (!checkbox.checked) {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            }, 1500);

            showMessage('✅ 신고 양식이 자동으로 입력되었습니다.\\n⚠️ SMS 인증은 직접 진행해주세요.', 'success');
            
            /* 이력 저장 */
            saveHistory({
                title: data.template.title,
                type: data.template.reportType,
                status: 'filled',
                date: new Date().toISOString()
            });
        }

        /* 메시지 표시 함수 */
        function showMessage(message, type) {
            const div = document.createElement('div');
            div.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: \${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#dc3545'};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                max-width: 350px;
                animation: slideIn 0.3s ease;
                white-space: pre-line;
            \`;
            div.textContent = message;
            document.body.appendChild(div);

            setTimeout(() => {
                div.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => div.remove(), 300);
            }, 5000);

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
                const history = JSON.parse(localStorage.getItem('safety_history') || '[]');
                history.unshift(item);
                localStorage.setItem('safety_history', JSON.stringify(history.slice(0, 100)));
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