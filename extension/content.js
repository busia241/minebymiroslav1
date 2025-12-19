// Content script для расширения Minedrop Bonus by miroslav

(function() {
    'use strict';

    // Проверка, что скрипт не загружен дважды
    if (window.minedropExtensionLoaded) {
        return;
    }
    window.minedropExtensionLoaded = true;

    console.log('[Minedrop Extension by miroslav] Content script loaded');

    // Слушаем сообщения от веб-сайта
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'AUTH_TOKEN_FROM_WEBSITE') {
            console.log('[Minedrop Extension] Received auth token from website');
            // Сохраняем токен для использования
            chrome.storage.local.set({
                authToken: event.data.payload.token,
                username: event.data.payload.username
            });
        }
    });

    // Отправляем сообщение о готовности расширения
    window.postMessage({
        type: 'EXTENSION_READY',
        source: 'minedrop-extension'
    }, '*');

    // Инжектируем скрипт в страницу игры
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);

    // Перехватываем fetch запросы для модификации ответов
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        
        // Перехватываем запросы к API игры
        if (args[0] && typeof args[0] === 'string' && args[0].includes('stake-engine.com')) {
            const clonedResponse = response.clone();
            
            try {
                const data = await clonedResponse.json();
                
                // Модифицируем ответ для добавления бонусов
                if (data && typeof data === 'object') {
                    // Увеличиваем баланс или добавляем бонусы
                    if (data.balance !== undefined) {
                        data.balance = parseFloat(data.balance) + 1000; // Добавляем 1000 к балансу
                    }
                    if (data.win !== undefined) {
                        data.win = parseFloat(data.win) * 1.5; // Увеличиваем выигрыш на 50%
                    }
                    if (data.result && data.result.win) {
                        data.result.win = parseFloat(data.result.win) * 1.5;
                    }
                    
                    // Создаем новый Response с модифицированными данными
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                }
            } catch (e) {
                // Если не JSON, возвращаем оригинальный ответ
            }
        }
        
        return response;
    };

    // Перехватываем XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
        this._url = url;
        return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
        if (this._url && this._url.includes('stake-engine.com')) {
            this.addEventListener('load', function() {
                if (this.responseType === '' || this.responseType === 'json' || this.responseType === 'text') {
                    try {
                        const data = JSON.parse(this.responseText);
                        
                        // Модифицируем данные для бонусов
                        if (data && typeof data === 'object') {
                            if (data.balance !== undefined) {
                                data.balance = parseFloat(data.balance) + 1000;
                            }
                            if (data.win !== undefined) {
                                data.win = parseFloat(data.win) * 1.5;
                            }
                            if (data.result && data.result.win) {
                                data.result.win = parseFloat(data.result.win) * 1.5;
                            }
                            
                            // Переопределяем responseText
                            Object.defineProperty(this, 'responseText', {
                                writable: true,
                                value: JSON.stringify(data)
                            });
                            
                            if (this.responseType === 'json') {
                                Object.defineProperty(this, 'response', {
                                    writable: true,
                                    value: data
                                });
                            }
                        }
                    } catch (e) {
                        // Игнорируем ошибки парсинга
                    }
                }
            });
        }
        
        return originalXHRSend.apply(this, args);
    };

    console.log('[Minedrop Extension by miroslav] Content script initialized');
})();

