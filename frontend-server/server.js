const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 8085;

// 플로팅 버튼용 세션 저장소
const floatingSessions = new Map();

app.use(compression());
app.use(express.json()); // JSON 파싱 미들웨어 추가
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// CORS 헤더 추가 (플로팅 버튼이 다른 도메인에서 접근할 때 필요)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

// 플로팅 버튼 세션 저장 API
app.post('/api/floating-session', (req, res) => {
    const sessionId = 'float_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    floatingSessions.set(sessionId, req.body);

    // 10분 후 자동 삭제
    setTimeout(() => floatingSessions.delete(sessionId), 10 * 60 * 1000);

    res.json({ sessionId });
});

// 플로팅 버튼 세션 조회 API
app.get('/api/floating-session/:id', (req, res) => {
    const session = floatingSessions.get(req.params.id);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`PWA Server running on http://0.0.0.0:${PORT}`);
    console.log(`Access from mobile: http://localhost:${PORT}`);
});