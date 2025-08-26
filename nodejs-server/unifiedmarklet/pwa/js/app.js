// 통합 북마클렛 자동 입력 JS

document.addEventListener('DOMContentLoaded', function () {
    const channelSelect = document.getElementById('channelSelect');
    const complaintForm = document.getElementById('complaintForm');
    const bookmarkletCode = document.getElementById('bookmarkletCode');
    const copyBtn = document.getElementById('copyBtn');

    // 채널별 북마클렛 코드 생성 로직
    function generateBookmarklet(channel, title, content, extra) {
        let code = '';
        if (channel === 'ddm') {
            // 동대문구청 북마클렛 코드 예시
            code = `javascript:(function(){
                document.querySelector('#title').value = ${JSON.stringify(title)};
                document.querySelector('#content').value = ${JSON.stringify(content)};
                document.querySelector('#extra').value = ${JSON.stringify(extra)};
            })();`;
        } else if (channel === 'saeol') {
            // 새올전자민원창구 북마클렛 코드 예시
            code = `javascript:(function(){
                document.querySelector('[name="subject"]').value = ${JSON.stringify(title)};
                document.querySelector('[name="body"]').value = ${JSON.stringify(content)};
                document.querySelector('[name="extra"]').value = ${JSON.stringify(extra)};
            })();`;
        } else if (channel === 'safety') {
            // 안전신문고 북마클렛 코드 예시
            code = `javascript:(function(){
                document.querySelector('#reportTitle').value = ${JSON.stringify(title)};
                document.querySelector('#reportContent').value = ${JSON.stringify(content)};
                document.querySelector('#reportExtra').value = ${JSON.stringify(extra)};
            })();`;
        }
        return code.replace(/\n\s+/g, ' ');
    }

    complaintForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const channel = channelSelect.value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const extra = document.getElementById('extra').value;
        const code = generateBookmarklet(channel, title, content, extra);
        bookmarkletCode.value = code;
    });

    copyBtn.addEventListener('click', function () {
        bookmarkletCode.select();
        document.execCommand('copy');
        copyBtn.textContent = '복사됨!';
        setTimeout(() => { copyBtn.textContent = '코드 복사'; }, 1200);
    });
});
