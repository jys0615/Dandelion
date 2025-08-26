const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 임시 저장소 (실제로는 Redis 사용 권장)
const templates = new Map();

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Node.js 북마클릿 서버가 정상 작동중입니다.',
        timestamp: new Date().toISOString()
    });
});

// 북마클릿 생성 엔드포인트
app.post('/api/generate-bookmarklet', (req, res) => {
    try {
        console.log('북마클릿 생성 요청 받음:', req.body);

        const complaintData = req.body;
        const templateId = uuidv4();

        // 템플릿 데이터 저장
        templates.set(templateId, complaintData);

        // 북마클릿 코드 생성
        const bookmarkletCode = generateBookmarkletCode(complaintData, templateId);

        // 북마클릿 URL 생성
        const bookmarkletUrl = `javascript:${bookmarkletCode}`;

        console.log('북마클릿 생성 완료:', templateId);

        res.json({
            bookmarkletUrl: bookmarkletUrl,
            bookmarkletCode: bookmarkletCode,
            templateId: templateId,
            success: true,
            message: '북마클릿이 성공적으로 생성되었습니다.'
        });

    } catch (error) {
        console.error('Error generating bookmarklet:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 템플릿 조회 엔드포인트
app.get('/api/template/:id', (req, res) => {
    const templateId = req.params.id;
    const template = templates.get(templateId);

    console.log(`템플릿 조회: ${templateId}`, template ? '찾음' : '없음');

    if (template) {
        res.json({
            success: true,
            data: template
        });
    } else {
        res.status(404).json({
            success: false,
            message: '템플릿을 찾을 수 없습니다.'
        });
    }
});

// 템플릿 목록 조회 엔드포인트
app.get('/api/templates', (req, res) => {
    const templateList = Array.from(templates.entries()).map(([id, data]) => ({
        id: id,
        title: data.title,
        createdAt: data.createdAt || new Date().toISOString()
    }));

    res.json({
        success: true,
        count: templateList.length,
        data: templateList
    });
});

// 템플릿 삭제 엔드포인트
app.delete('/api/template/:id', (req, res) => {
    const templateId = req.params.id;
    const deleted = templates.delete(templateId);

    if (deleted) {
        console.log(`템플릿 삭제됨: ${templateId}`);
        res.json({
            success: true,
            message: '템플릿이 삭제되었습니다.'
        });
    } else {
        res.status(404).json({
            success: false,
            message: '템플릿을 찾을 수 없습니다.'
        });
    }
});

// 북마클릿 코드 생성 함수
function generateBookmarkletCode(data, templateId) {
    // 데이터를 JSON 문자열로 변환하되, 특수문자 이스케이프
    const configStr = JSON.stringify(data)
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

    const code = `(function(){
        try {
            var config = JSON.parse('${configStr}');
            var templateId = '${templateId}';
            
            /* 신고유형 선택 */
            var reportType = document.getElementById('ReportTypeSelect') || 
                           document.querySelector('select[name="reportType"]');
            if(reportType) {
                reportType.value = config.reportType || '01';
                reportType.dispatchEvent(new Event('change', {bubbles: true}));
            }
            
            /* 제목 입력 */
            var title = document.getElementById('C_A_TITLE') || 
                       document.querySelector('input[name="C_A_TITLE"]');
            if(title) {
                title.value = config.title || '';
                title.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            /* 내용 입력 */
            var contents = document.getElementById('C_A_CONTENTS') || 
                         document.querySelector('textarea[name="C_A_CONTENTS"]');
            if(contents) {
                contents.value = config.contents || '';
                contents.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            /* 전화번호 입력 */
            var phone = document.getElementById('C_PHONE2') || 
                       document.querySelector('input[name="C_PHONE2"]');
            if(phone) {
                phone.value = config.phone || '';
                phone.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            /* 공유 여부 선택 */
            if(config.shareYn === 'Y') {
                var shareYes = document.getElementById('C_OPEN1') || 
                             document.querySelector('input[name="C_OPEN"][value="1"]');
                if(shareYes) {
                    shareYes.checked = true;
                    shareYes.click();
                }
            } else {
                var shareNo = document.getElementById('C_OPEN0') || 
                            document.querySelector('input[name="C_OPEN"][value="0"]');
                if(shareNo) {
                    shareNo.checked = true;
                    shareNo.click();
                }
            }
            
            /* 구분 선택 */
            var category = document.querySelector('input[name="cType"][value="' + config.category + '"]') ||
                         document.getElementById('cType' + config.category);
            if(category) {
                category.checked = true;
                category.click();
            }
            
            /* 이름 입력 */
            var name = document.getElementById('C_NAME') || 
                      document.querySelector('input[name="C_NAME"]');
            if(name) {
                name.value = config.name || '';
                name.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            /* 이메일 앞자리 입력 */
            var emailId = document.getElementById('C_EMAIL1') || 
                        document.querySelector('input[name="C_EMAIL1"]');
            if(emailId) {
                emailId.value = config.emailId || '';
                emailId.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            /* 이메일 도메인 선택 */
            var emailDomain = document.getElementById('C_EMAIL2') || 
                            document.querySelector('select[name="C_EMAIL2"]');
            if(emailDomain) {
                var options = emailDomain.options;
                for(var i = 0; i < options.length; i++) {
                    if(options[i].value === config.emailDomain || 
                       options[i].text === config.emailDomain) {
                        emailDomain.selectedIndex = i;
                        emailDomain.dispatchEvent(new Event('change', {bubbles: true}));
                        break;
                    }
                }
            }
            
            /* 개인정보 동의 체크 */
            if(config.agreePersonalInfo) {
                var agreeBoxes = [
                    document.getElementById('agreeUseMyInfo1'),
                    document.getElementById('agree1'),
                    document.querySelector('input[name="agreeUseMyInfo"]'),
                    document.querySelector('input[type="checkbox"][name*="agree"]')
                ];
                
                for(var j = 0; j < agreeBoxes.length; j++) {
                    if(agreeBoxes[j] && !agreeBoxes[j].checked) {
                        agreeBoxes[j].checked = true;
                        agreeBoxes[j].click();
                        break;
                    }
                }
            }
            
            /* 위치 정보 (선택사항) */
            if(config.location) {
                var address = document.getElementById('C_ADDRESS') || 
                            document.querySelector('input[name="C_ADDRESS"]');
                if(address) {
                    address.value = config.location;
                    address.dispatchEvent(new Event('input', {bubbles: true}));
                }
            }
            
            /* 완료 메시지 */
            setTimeout(function() {
                alert('✅ 자동 입력이 완료되었습니다!\\n\\n템플릿 ID: ' + templateId + 
                      '\\n\\n남은 작업:\\n1. 위치 확인\\n2. SMS 인증\\n3. 제출');
            }, 500);
            
        } catch(e) {
            console.error('북마클릿 실행 오류:', e);
            alert('⚠️ 오류가 발생했습니다: ' + e.message);
        }
    })()`;

    // 여러 줄을 한 줄로 압축
    return code.replace(/\n\s*/g, '').replace(/\/\*.*?\*\//g, '');
}

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '요청한 경로를 찾을 수 없습니다.',
        path: req.path
    });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('서버 에러:', err);
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Node.js 북마클릿 서버가 시작되었습니다!`);
    console.log(`📍 포트: ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`❤️  헬스체크: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
    console.log('사용 가능한 엔드포인트:');
    console.log('  POST /api/generate-bookmarklet - 북마클릿 생성');
    console.log('  GET  /api/template/:id         - 템플릿 조회');
    console.log('  GET  /api/templates            - 템플릿 목록');
    console.log('  DELETE /api/template/:id       - 템플릿 삭제');
    console.log('='.repeat(50));
});