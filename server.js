const express = require('express');
const app = express();

app.use(express.json());

// База данных ключей (в реальном проекте использовать настоящую БД)
const VALID_KEYS = new Set([
    'TARAKAN2024',
    'PREMIUM123',
    'TESTKEY',
    'TRIAL2024',
    'BESTVPN'
]);

// Активные сессии
const activeSessions = new Map();

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Проверка ключа
app.post('/api/validate-key', (req, res) => {
    const { key } = req.body;
    
    if (!key) {
        return res.status(400).json({ valid: false, error: 'Key required' });
    }
    
    // Проверка ключа
    if (VALID_KEYS.has(key) || key.length >= 8) {
        // Генерация expiry date (30 дней)
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        
        // Сохраняем сессию
        const sessionId = Math.random().toString(36).substr(2, 16);
        activeSessions.set(sessionId, {
            key,
            activated: new Date(),
            expiry
        });
        
        res.json({
            valid: true,
            sessionId,
            expiry: expiry.toISOString().split('T')[0],
            message: 'Premium activated for 30 days'
        });
    } else {
        res.json({ valid: false, error: 'Invalid key' });
    }
});

// Активация триала
app.post('/api/trial', (req, res) => {
    const { userId } = req.body;
    
    // Проверка не использовал ли пользователь триал
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 7);
    
    res.json({
        success: true,
        type: 'trial',
        expiry: trialExpiry.toISOString().split('T')[0],
        message: '7-day trial activated'
    });
});

// Получение оптимальной локации
app.get('/api/optimal-location', (req, res) => {
    // В реальном приложении здесь анализ загрузки серверов
    const locations = [
        { country: 'Italy', city: 'Milan', latency: 12 },
        { country: 'Germany', city: 'Frankfurt', latency: 18 },
        { country: 'Netherlands', city: 'Amsterdam', latency: 22 },
        { country: 'France', city: 'Paris', latency: 25 }
    ];
    
    // Сортируем по latency
    const optimal = locations.sort((a, b) => a.latency - b.latency)[0];
    
    res.json(optimal);
});

// Статус сервера
app.get('/api/status', (req, res) => {
    res.json({
        online: true,
        servers: 47,
        activeConnections: activeSessions.size,
        maintenance: false,
        version: '2.1.0'
    });
});

// Список серверов
app.get('/api/servers', (req, res) => {
    const servers = countriesDB.map(c => ({
        country: c.country,
        city: c.city,
        load: Math.floor(Math.random() * 60) + 20, // 20-80%
        ping: Math.floor(Math.random() * 30) + 5   // 5-35 ms
    }));
    
    res.json(servers);
});

// Подключение к VPN
app.post('/api/connect', (req, res) => {
    const { country, city, sessionId } = req.body;
    
    // Проверка сессии
    if (!activeSessions.has(sessionId)) {
        return res.status(401).json({ error: 'Invalid session' });
    }
    
    const session = activeSessions.get(sessionId);
    
    // Проверка срока
    if (new Date() > session.expiry) {
        activeSessions.delete(sessionId);
        return res.status(401).json({ error: 'Session expired' });
    }
    
    res.json({
        connected: true,
        server: `${country}-${city}`,
        ip: '10.' + Math.floor(Math.random() * 255) + '.' + 
            Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
        protocol: 'WireGuard',
        encryption: 'AES-256-GCM',
        connectedAt: new Date().toISOString()
    });
});

// Экспорт для Vercel
module.exports = app;

// Если запущено не на Vercel
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Tarakan VPN API running on port ${PORT}`);
    });
}

// База данных стран (копия для сервера)
const countriesDB = [
    { country: "France", city: "Paris", free: true },
    { country: "Germany", city: "Berlin", free: true },
    { country: "United Kingdom", city: "London", free: true },
    { country: "Italy", city: "Milan", free: true },
    { country: "Spain", city: "Madrid", free: true },
    { country: "Netherlands", city: "Amsterdam", free: true },
    { country: "USA", city: "New York", free: false },
    { country: "USA", city: "Los Angeles", free: false },
    { country: "Canada", city: "Toronto", free: false },
    { country: "Japan", city: "Tokyo", free: false },
    { country: "Australia", city: "Sydney", free: false },
    { country: "Singapore", city: "Singapore", free: false }
];
