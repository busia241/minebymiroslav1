// Injected script для модификации игры Minedrop
// by miroslav
// Fallback скрипт если сервер недоступен

(function() {
    'use strict';
    if (window.minedropInjectLoaded) return;
    window.minedropInjectLoaded = true;
    
    console.log('[Minedrop Inject by miroslav] Fallback script loaded');
    
    // Обходим ошибки авторизации
    function modifyGameData(data) {
        if (!data || typeof data !== 'object') return data;
        
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

