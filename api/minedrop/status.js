// API endpoint для проверки статуса сессии minedrop
// Для Vercel Serverless Functions

export default function handler(req, res) {
    // Устанавливаем CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Проверяем статус сессии (можно добавить проверку токена из cookies)
    const status = 'active'; // В реальном приложении проверяем сессию
    
    res.status(200).json({
        status: status,
        timestamp: new Date().toISOString()
    });
}

