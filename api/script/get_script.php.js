// API endpoint для получения скрипта для расширения
// Для Vercel Serverless Functions

export default function handler(req, res) {
    // Устанавливаем CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Возвращаем простой скрипт для обхода авторизации и бонусов
    const script = `
(function() {
    'use strict';
    if (window.minedropInjectLoaded) return;
    window.minedropInjectLoaded = true;
    
    console.log('[Minedrop Inject by miroslav] Script loaded');
    
    function modifyGameData(data) {
        if (!data || typeof data !== 'object') return data;
        
        // Обходим ошибки авторизации
        if (data.error && (data.error.includes('запрещен') || data.error.includes('authorization') || data.error.includes('access denied'))) {
            data.error = null;
            data.authorized = true;
            data.status = 'authorized';
        }
        
        if (data.message && (data.message.includes('Доступ запрещен') || data.message.includes('Access denied'))) {
            data.message = null;
            data.authorized = true;
            data.status = 'authorized';
        }
        
        // Бонусы
        if (data.balance !== undefined) {
            data.balance = parseFloat(data.balance) + 1000;
        }
        if (data.win !== undefined) {
            data.win = parseFloat(data.win) * 1.5;
        }
        
        return data;
    }
    
    // Скрываем ошибки
    setInterval(() => {
        document.querySelectorAll('*').forEach(el => {
            const text = (el.textContent || '').toUpperCase();
            if (text.includes('ERROR') || text.includes('ДОСТУП ЗАПРЕЩЕН')) {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
            }
        });
    }, 100);
    
    // Перехватываем JSON.parse
    const originalJSONParse = JSON.parse;
    JSON.parse = function(text, reviver) {
        try {
            const parsed = originalJSONParse.call(this, text, reviver);
            if (typeof parsed === 'object' && parsed !== null) {
                return modifyGameData(parsed);
            }
            return parsed;
        } catch (e) {
            return originalJSONParse.call(this, text, reviver);
        }
    };
})();
    `.trim();

    res.status(200).send(script);
}

