// API endpoint для проверки статуса сессии
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

    // Возвращаем статус (в реальном приложении здесь была бы проверка сессии)
    res.status(200).json({
        status: 'active',
        timestamp: new Date().toISOString()
    });
}

