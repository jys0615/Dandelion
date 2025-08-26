const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8081;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'pwa')));

// 헬스체크
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'DDM Complaint PWA' });
});

// PWA 제공
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'pwa', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║  구청장에게 바란다 PWA 서버              ║
║  http://localhost:${PORT}                   ║
║  Press Ctrl+C to stop                    ║
╚══════════════════════════════════════════╝
    `);
});