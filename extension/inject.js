// Injected script для модификации игры Minedrop
// by miroslav

(function() {
    'use strict';

    if (window.minedropInjectLoaded) {
        return;
    }
    window.minedropInjectLoaded = true;

    console.log('[Minedrop Inject by miroslav] Script injected');

    // Функция для модификации игровых данных
    function modifyGameData(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }

        // Обходим ошибки авторизации
        if (data.error && (data.error.includes('запрещен') || data.error.includes('authorization') || data.error.includes('access denied'))) {
            console.log('[Minedrop Inject] Bypassing authorization error');
            data.error = null;
            data.authorized = true;
            data.status = 'authorized';
        }
        
        // Если есть сообщение об ошибке доступа
        if (data.message && (data.message.includes('Доступ запрещен') || data.message.includes('Access denied'))) {
            console.log('[Minedrop Inject] Removing access denied message');
            data.message = null;
            data.authorized = true;
            data.status = 'authorized';
        }

        // Увеличиваем баланс
        if (data.balance !== undefined) {
            const currentBalance = parseFloat(data.balance) || 0;
            data.balance = currentBalance + 1000;
            console.log('[Minedrop Inject] Balance modified:', data.balance);
        }

        // Увеличиваем выигрыш
        if (data.win !== undefined) {
            const currentWin = parseFloat(data.win) || 0;
            data.win = currentWin * 1.5;
            console.log('[Minedrop Inject] Win modified:', data.win);
        }

        // Модифицируем результат игры
        if (data.result) {
            if (data.result.win !== undefined) {
                data.result.win = parseFloat(data.result.win) * 1.5;
            }
            if (data.result.balance !== undefined) {
                data.result.balance = parseFloat(data.result.balance) + 1000;
            }
        }

        // Модифицируем данные спина
        if (data.spin) {
            if (data.spin.win !== undefined) {
                data.spin.win = parseFloat(data.spin.win) * 1.5;
            }
        }

        return data;
    }
    
    // Функция для агрессивного скрытия сообщений об ошибках на странице
    function hideErrorMessages() {
        const errorTexts = ['ERROR', 'Доступ запрещен', 'Access denied', 'авторизации', 'authorization', 'запрещен'];
        
        // Прячем элементы с ошибками
        const hideErrors = () => {
            document.querySelectorAll('*').forEach(el => {
                const text = (el.textContent || '').toUpperCase();
                const hasError = errorTexts.some(errorText => text.includes(errorText.toUpperCase()));
                
                if (hasError && el.offsetHeight > 0) {
                    // Полностью скрываем элемент
                    el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; overflow: hidden !important; pointer-events: none !important; position: absolute !important; z-index: -9999 !important;';
                    
                    // Блокируем все события
                    el.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    };
                    
                    el.onmousedown = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    };
                    
                    el.ontouchstart = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    };
                    
                    // Удаляем элемент из DOM если возможно
                    try {
                        if (el.parentNode && el.textContent && el.textContent.toUpperCase().includes('ERROR')) {
                            el.remove();
                        }
                    } catch (e) {
                        // Игнорируем ошибки удаления
                    }
                }
            });
        };
        
        // Запускаем сразу и периодически (чаще)
        hideErrors();
        setInterval(hideErrors, 100);
        
        // Используем MutationObserver для отслеживания новых элементов
        const observer = new MutationObserver(hideErrors);
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'id']
            });
        }
    }
    
    // Запускаем скрытие ошибок после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideErrorMessages);
    } else {
        hideErrorMessages();
    }
    
    // Также перехватываем создание новых элементов
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName, options) {
        const el = originalCreateElement.call(this, tagName, options);
        
        // Проверяем через небольшую задержку
        setTimeout(() => {
            const text = (el.textContent || '').toUpperCase();
            if (text.includes('ERROR') || text.includes('ДОСТУП ЗАПРЕЩЕН')) {
                el.style.cssText = 'display: none !important; visibility: hidden !important;';
            }
        }, 10);
        
        return el;
    };

    // Перехватываем все возможные способы получения данных
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

    // Перехватываем WebSocket сообщения
    if (window.WebSocket) {
        const OriginalWebSocket = window.WebSocket;
        window.WebSocket = function(url, protocols) {
            const ws = new OriginalWebSocket(url, protocols);
            
            const originalSend = ws.send;
            ws.send = function(data) {
                return originalSend.call(this, data);
            };

            const originalAddEventListener = ws.addEventListener;
            ws.addEventListener = function(type, listener, options) {
                if (type === 'message') {
                    const wrappedListener = function(event) {
                        try {
                            const data = JSON.parse(event.data);
                            const modified = modifyGameData(data);
                            event.data = JSON.stringify(modified);
                            
                            // Создаем новое событие с модифицированными данными
                            const newEvent = new MessageEvent('message', {
                                data: JSON.stringify(modified),
                                origin: event.origin,
                                lastEventId: event.lastEventId,
                                source: event.source,
                                ports: event.ports
                            });
                            
                            listener.call(this, newEvent);
                        } catch (e) {
                            listener.call(this, event);
                        }
                    };
                    return originalAddEventListener.call(this, type, wrappedListener, options);
                }
                return originalAddEventListener.call(this, type, listener, options);
            };

            return ws;
        };
    }

    // Модифицируем глобальные объекты игры, если они существуют
    const checkAndModify = setInterval(() => {
        // Ищем объекты игры и модифицируем их
        if (window.game) {
            if (window.game.balance !== undefined) {
                window.game.balance = parseFloat(window.game.balance) + 1000;
            }
            // Убираем ошибки авторизации
            if (window.game.error) {
                window.game.error = null;
                window.game.authorized = true;
            }
        }
        
        if (window.minedrop) {
            if (window.minedrop.balance !== undefined) {
                window.minedrop.balance = parseFloat(window.minedrop.balance) + 1000;
            }
            // Убираем ошибки авторизации
            if (window.minedrop.error) {
                window.minedrop.error = null;
                window.minedrop.authorized = true;
            }
        }
        
        // Скрываем элементы с ошибками
        document.querySelectorAll('*').forEach(el => {
            const text = el.textContent || '';
            if (text.includes('Доступ запрещен') || 
                text.includes('Access denied') || 
                (text.includes('ERROR') && text.includes('авторизации'))) {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
            }
        });
    }, 1000);

    // Останавливаем проверку через 60 секунд
    setTimeout(() => {
        clearInterval(checkAndModify);
    }, 60000);

    console.log('[Minedrop Inject by miroslav] Injection complete');
})();

