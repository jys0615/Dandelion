const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8082;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'pwa')));

// 헬스체크
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Safety Report PWA' });
});

// PWA 제공
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'pwa', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║  🚨 안전신문고 자동신고 PWA              ║
║  http://localhost:${PORT}                   ║
║  Press Ctrl+C to stop                    ║
╚══════════════════════════════════════════╝
    `);
});