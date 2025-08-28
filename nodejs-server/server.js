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

// 민원 시스템별 설정
const COMPLAINT_SYSTEMS = {
    SAFETY: {
        name: '안전신문고',
        port: 8082,
        url: 'http://localhost:8082',
        siteUrl: 'https://www.safetyreport.go.kr',
        generator: generateSafetyBookmarklet
    },
    DDM: {
        name: '구청장에게 바란다',
        port: 8081,
        url: 'http://localhost:8081',
        siteUrl: 'https://www.ddm.go.kr/www/contents.do?key=735',
        generator: generateDDMBookmarklet
    },
    SAEOL: {
        name: '새올전자민원창구',
        port: 8083,
        url: 'http://localhost:8083',
        siteUrl: 'https://eminwon.ddm.go.kr',
        generator: generateSaeolBookmarklet
    }
};

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '통합 민원 북마클릿 서버가 정상 작동중입니다.',
        systems: Object.keys(COMPLAINT_SYSTEMS),
        timestamp: new Date().toISOString()
    });
});

// 민원 시스템 목록 조회
app.get('/api/systems', (req, res) => {
    const systems = Object.entries(COMPLAINT_SYSTEMS).map(([key, value]) => ({
        code: key,
        name: value.name,
        port: value.port,
        url: value.url,
        siteUrl: value.siteUrl
    }));

    res.json({
        success: true,
        systems: systems
    });
});

// 통합 북마클릿 생성 엔드포인트 (응답 포맷팅 개선)
app.post('/api/generate-bookmarklet', (req, res) => {
    try {
        console.log('북마클릿 생성 요청 받음:', req.body);

        const { system = 'SAFETY', ...complaintData } = req.body;

        // 시스템 유효성 검사
        if (!COMPLAINT_SYSTEMS[system]) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 민원 시스템입니다.',
                availableSystems: Object.keys(COMPLAINT_SYSTEMS)
            });
        }

        const selectedSystem = COMPLAINT_SYSTEMS[system];
        const templateId = uuidv4();

        // 템플릿 데이터 저장 (시스템 정보 포함)
        const templateData = {
            ...complaintData,
            system: system,
            systemName: selectedSystem.name,
            createdAt: new Date().toISOString()
        };
        templates.set(templateId, templateData);

        // 시스템별 북마클릿 코드 생성
        const bookmarkletCode = selectedSystem.generator(complaintData, templateId);

        // 북마클릿 URL 생성
        const bookmarkletUrl = `javascript:${encodeURIComponent(bookmarkletCode)}`;

        console.log(`${selectedSystem.name} 북마클릿 생성 완료:`, templateId);

        // Pretty JSON 응답 설정
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            success: true,
            message: `${selectedSystem.name} 북마클릿이 성공적으로 생성되었습니다.`,
            templateId: templateId,
            system: system,
            systemName: selectedSystem.name,
            siteUrl: selectedSystem.siteUrl,
            bookmarkletUrl: bookmarkletUrl,
            bookmarkletCode: bookmarkletCode,
            createdAt: templateData.createdAt,
            requestData: complaintData
        }, null, 2)); // null, 2를 추가하여 2칸 들여쓰기로 포맷팅

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
        system: data.system,
        systemName: data.systemName,
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

// 안전신문고 북마클릿 생성 함수 (기존 코드 그대로 유지)
function generateSafetyBookmarklet(data, templateId) {
    // 이메일 처리 - 통합 또는 분리된 형식 모두 지원
    if (!data.email && data.emailId && data.emailDomain) {
        data.email = data.emailId + '@' + data.emailDomain;
    }

    // 데이터를 JSON 문자열로 변환하고 Base64 인코딩
    const jsonStr = JSON.stringify(data);
    const base64Data = Buffer.from(jsonStr, 'utf-8').toString('base64');

    const code = `(function(){
        try {
            function b64DecodeUnicode(str) {
                return decodeURIComponent(atob(str).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            }
            
            var base64Data = '${base64Data}';
            var config = JSON.parse(b64DecodeUnicode(base64Data));
            var templateId = '${templateId}';
            
            var reportType = document.getElementById('ReportTypeSelect');
            if(reportType) {
                reportType.value = config.reportType || '01';
                reportType.dispatchEvent(new Event('change', {bubbles: true}));
            }
            
            var title = document.getElementById('C_A_TITLE');
            if(title) {
                title.value = config.title || '';
                title.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            var contents = document.getElementById('C_A_CONTENTS');
            if(contents) {
                contents.value = config.contents || '';
                contents.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            var phone = document.getElementById('C_PHONE2');
            if(phone) {
                phone.value = config.phone || '';
                phone.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            var name = document.getElementById('C_NAME');
            if(name) {
                name.value = config.name || '';
                name.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            if(config.email && config.email.indexOf('@') > -1) {
                var parts = config.email.split('@');
                var emailId = document.getElementById('email1');
                if(emailId) {
                    emailId.value = parts[0];
                    emailId.dispatchEvent(new Event('input', {bubbles: true}));
                }
                
                var emailSelect = document.querySelector('.emailSelect');
                if(!emailSelect) emailSelect = document.querySelector('select[name="emailSelect"]');
                
                if(emailSelect) {
                    var found = false;
                    for(var i = 0; i < emailSelect.options.length; i++) {
                        if(emailSelect.options[i].value === parts[1]) {
                            emailSelect.selectedIndex = i;
                            found = true;
                            break;
                        }
                    }
                    
                    if(!found) {
                        for(var j = 0; j < emailSelect.options.length; j++) {
                            if(emailSelect.options[j].value === '') {
                                emailSelect.selectedIndex = j;
                                break;
                            }
                        }
                        
                        var email2 = document.getElementById('email2');
                        if(email2) {
                            email2.disabled = false;
                            email2.value = parts[1];
                        }
                    }
                    
                    emailSelect.dispatchEvent(new Event('change', {bubbles: true}));
                }
                
                var hiddenEmail = document.getElementById('C_EMAIL');
                if(hiddenEmail) {
                    hiddenEmail.value = config.email;
                }
            }
            
            if(config.shareContent !== undefined) {
                var shareRadio = document.getElementById(config.shareContent === '0' ? 'C_OPEN1' : 'C_OPEN2');
                if(shareRadio) {
                    shareRadio.checked = true;
                    shareRadio.click();
                }
            }
            
            if(config.personType !== undefined) {
                var typeMap = {'0': 'cType1', '3': 'cType3', '1': 'cType2'};
                var typeRadio = document.getElementById(typeMap[config.personType]);
                if(typeRadio) {
                    typeRadio.checked = true;
                    typeRadio.click();
                }
            }
            
            if(config.privacyAgree) {
                var agree1 = document.getElementById('agreeUseMyInfo1');
                if(agree1 && !agree1.checked) {
                    agree1.checked = true;
                    agree1.click();
                }
            }
            
            alert('안전신문고 자동 입력 완료! 템플릿 ID: ' + templateId);
            
        } catch(e) {
            console.error('북마클릿 오류:', e);
            alert('오류: ' + e.message);
        }
    })()`;

    // 한 줄로 압축
    return code.replace(/\s+/g, ' ').trim();
}

// 구청장에게 바란다 북마클릿 생성 함수 (수정본)
function generateDDMBookmarklet(data, templateId) {
    const jsonStr = JSON.stringify(data);
    const base64Data = Buffer.from(jsonStr, 'utf-8').toString('base64');

    const code = `(function(){
        try {
            function b64DecodeUnicode(str) {
                return decodeURIComponent(atob(str).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            }
            
            var base64Data = '${base64Data}';
            var config = JSON.parse(b64DecodeUnicode(base64Data));
            var templateId = '${templateId}';
            
            var atentAgree = document.getElementById('atentAgree');
            if(atentAgree && !atentAgree.checked) {
                atentAgree.checked = true;
                atentAgree.dispatchEvent(new Event('change', {bubbles: true}));
            }
            
            var indvdlinfoAgree = document.getElementById('indvdlinfoAgree');
            if(indvdlinfoAgree && !indvdlinfoAgree.checked) {
                indvdlinfoAgree.checked = true;
                indvdlinfoAgree.dispatchEvent(new Event('change', {bubbles: true}));
            }
            
            if(config.zip) {
                var zip = document.getElementById('zip');
                if(zip) {
                    zip.value = config.zip;
                    zip.dispatchEvent(new Event('input', {bubbles: true}));
                }
            }
            
            if(config.address) {
                var adres = document.getElementById('adres');
                if(adres) {
                    adres.value = config.address;
                    adres.dispatchEvent(new Event('input', {bubbles: true}));
                }
            }
            
            if(config.addressDetail) {
                var detailAdres = document.getElementById('detailAdres');
                if(detailAdres) {
                    detailAdres.value = config.addressDetail;
                    detailAdres.dispatchEvent(new Event('input', {bubbles: true}));
                }
            }
            
            var moblphon = document.getElementById('moblphon');
            if(moblphon && config.phone) {
                moblphon.value = config.phone;
                moblphon.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            var email = document.getElementById('email');
            if(email && config.email) {
                email.value = config.email;
                email.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            var cvplSj = document.getElementById('cvplSj');
            if(cvplSj && config.title) {
                cvplSj.value = config.title;
                cvplSj.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            var cvplCn = document.getElementById('cvplCn');
            if(cvplCn && (config.content || config.contents)) {
                cvplCn.value = config.content || config.contents;
                cvplCn.dispatchEvent(new Event('input', {bubbles: true}));
            }
            
            if(config.smsNotification !== undefined) {
                var smsRadio;
                if(config.smsNotification === true || config.smsNotification === 'Y') {
                    smsRadio = document.getElementById('smsAt1');
                } else {
                    smsRadio = document.getElementById('smsAt2');
                }
                if(smsRadio) {
                    smsRadio.checked = true;
                    smsRadio.click();
                    smsRadio.dispatchEvent(new Event('change', {bubbles: true}));
                }
            }
            
            if(config.isPublic !== undefined) {
                var othbcRadio;
                if(config.isPublic === true || config.isPublic === 'Y') {
                    othbcRadio = document.getElementById('othbcAt1');
                } else {
                    othbcRadio = document.getElementById('othbcAt2');
                }
                if(othbcRadio) {
                    othbcRadio.checked = true;
                    othbcRadio.click();
                    othbcRadio.dispatchEvent(new Event('change', {bubbles: true}));
                }
            }
            
            alert('구청장에게 바란다 - 자동 입력 완료! 템플릿 ID: ' + templateId);
            
        } catch(e) {
            console.error('북마클릿 오류:', e);
            alert('오류: ' + e.message);
        }
    })()`;

    // 한 줄로 압축하면서 안전하게 처리
    return code.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

// 새올전자민원창구 북마클릿 생성 함수 (수정본)
function generateSaeolBookmarklet(data, templateId) {
    // 데이터 검증
    if (!data.title) data.title = '';
    if (!data.content && !data.contents) data.content = '';

    const jsonStr = JSON.stringify(data);
    const base64Data = Buffer.from(jsonStr, 'utf-8').toString('base64');

    const code = `(function(){
        try {
            function b64DecodeUnicode(str) {
                try {
                    return decodeURIComponent(atob(str).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                } catch(e) {
                    return atob(str);
                }
            }
            
            var base64Data = '${base64Data}';
            var config = JSON.parse(b64DecodeUnicode(base64Data));
            var templateId = '${templateId}';
            
            setTimeout(function() {
                var title = document.getElementById('minwon_title');
                if(title) {
                    title.value = config.title || '';
                }
                
                var contents = document.getElementById('minwon_contents');
                if(contents) {
                    contents.value = config.content || config.contents || '';
                }
                
                var email = document.getElementById('minwon_email');
                if(email && config.email) {
                    email.value = config.email;
                }
                
                var hpno = document.getElementById('minwon_hp');
                if(hpno && config.phone) {
                    hpno.value = config.phone.replace(/-/g, '');
                }
                
                var telno = document.getElementById('minwon_tel');
                if(telno && config.tel) {
                    telno.value = config.tel.replace(/-/g, '');
                }
                
                if(config.zip1) {
                    var postNo1 = document.getElementById('PostNo1');
                    if(postNo1) postNo1.value = config.zip1;
                }
                
                if(config.zip2) {
                    var postNo2 = document.getElementById('PostNo2');
                    if(postNo2) postNo2.value = config.zip2;
                }
                
                if(config.address) {
                    var address = document.getElementById('minwon_address');
                    if(address) address.value = config.address;
                }
                
                if(config.isPublic !== undefined) {
                    var hiddenField = document.getElementById('minwon_open_value');
                    if(config.isPublic === 'Y' || config.isPublic === true) {
                        var openYes = document.getElementById('minwon_open_yes');
                        if(openYes) {
                            openYes.checked = true;
                            if(hiddenField) hiddenField.value = 'Y';
                        }
                    } else if(config.isPublic === 'C') {
                        var openCn = document.getElementById('minwon_open_cn');
                        if(openCn) {
                            openCn.checked = true;
                            if(hiddenField) hiddenField.value = 'C';
                        }
                    } else {
                        var openNo = document.getElementById('minwon_open_no');
                        if(openNo) {
                            openNo.checked = true;
                            if(hiddenField) hiddenField.value = 'N';
                        }
                    }
                }
                
                if(config.emailNotify === true || config.emailNotify === 'Y') {
                    var emailNotify = document.getElementById('email_rprt_yn');
                    if(emailNotify) emailNotify.checked = true;
                }
                
                if(config.smsNotify === true || config.smsNotify === 'Y') {
                    var smsNotify = document.getElementById('sms_rprt_yn');
                    if(smsNotify) smsNotify.checked = true;
                }
                
                var agreeCheck = document.getElementById('agreeCheck');
                if(agreeCheck) {
                    agreeCheck.checked = true;
                    var agreeYn = document.getElementsByName('agree_yn')[0];
                    if(agreeYn) agreeYn.value = 'Y';
                }
                
                alert('새올전자민원창구 - 자동 입력 완료!');
            }, 500);
            
        } catch(e) {
            console.error('북마클릿 오류:', e);
            alert('오류 발생: ' + e.message);
        }
    })()`;

    // 더 안전한 압축 방법
    return code
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s*([{}();,:])\s*/g, '$1')
        .trim();
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
    console.log(`🚀 통합 민원 북마클릿 서버가 시작되었습니다!`);
    console.log(`📍 포트: ${PORT}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`❤️ 헬스체크: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
    console.log('지원 시스템:');
    Object.entries(COMPLAINT_SYSTEMS).forEach(([key, value]) => {
        console.log(` - ${key}: ${value.name} (${value.siteUrl})`);
    });
    console.log('='.repeat(50));
    console.log('사용 가능한 엔드포인트:');
    console.log(' GET /api/systems - 민원 시스템 목록 조회');
    console.log(' POST /api/generate-bookmarklet - 북마클릿 생성');
    console.log(' GET /api/template/:id - 템플릿 조회');
    console.log(' GET /api/templates - 템플릿 목록');
    console.log(' DELETE /api/template/:id - 템플릿 삭제');
    console.log('='.repeat(50));
    console.log('');
    console.log('📝 요청 예시 (POST /api/generate-bookmarklet):');
    console.log(JSON.stringify({
        system: "SAFETY",  // SAFETY, DDM, SAEOL 중 선택
        reportType: "01",
        title: "도로 파손 신고",
        contents: "도로에 큰 구멍이 있습니다",
        phone: "010-1234-5678",
        name: "홍길동",
        email: "test@gmail.com",
        shareContent: "0",
        personType: "0",
        privacyAgree: true,
        autoRecommend: true
    }, null, 2));
    console.log('='.repeat(50));
});