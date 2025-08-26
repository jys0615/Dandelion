// Express 서버 설정
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8083;

// 미들웨어 설정
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'self'", "'unsafe-inline'"],  // 이 줄 추가
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
        },
    },
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '../pwa')));

// API 라우트
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 템플릿 동기화 API
app.post('/api/sync/templates', (req, res) => {
    // 템플릿 동기화 로직
    console.log('템플릿 동기화 요청:', req.body);
    res.json({ success: true, message: '템플릿이 동기화되었습니다.' });
});

// 사용자 정보 백업 API
app.post('/api/backup/user', (req, res) => {
    // 사용자 정보 백업 로직
    console.log('사용자 정보 백업 요청:', req.body);
    res.json({ success: true, message: '사용자 정보가 백업되었습니다.' });
});

// 이력 저장 API
app.post('/api/history', (req, res) => {
    // 이력 저장 로직
    console.log('이력 저장 요청:', req.body);
    res.json({ success: true, message: '이력이 저장되었습니다.' });
});

// 통계 API
app.get('/api/stats', (req, res) => {
    // 임시 통계 데이터
    const stats = {
        totalComplaints: 42,
        successRate: 95.2,
        avgCompletionTime: '3분 25초',
        mostUsedTemplate: '도로파손 신고'
    };
    res.json(stats);
});

// PWA 매니페스트 제공
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '../pwa/manifest.json'));
});

// Service Worker 제공
app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../pwa/sw.js'));
});

// 모든 라우트를 index.html로 리다이렉트 (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../pwa/index.html'));
});

// 에러 핸들링
app.use((err, req, res, next) => {
    console.error('서버 오류:', err.stack);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║  새올민원창구 PWA 서버 시작됨        ║
║  http://localhost:${PORT}              ║
║  Press Ctrl+C to stop                ║
╚══════════════════════════════════════╝
    `);
});