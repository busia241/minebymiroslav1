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
        }
        
        if (window.minedrop) {
            if (window.minedrop.balance !== undefined) {
                window.minedrop.balance = parseFloat(window.minedrop.balance) + 1000;
            }
        }
    }, 2000);

    // Останавливаем проверку через 30 секунд
    setTimeout(() => {
        clearInterval(checkAndModify);
    }, 30000);

    console.log('[Minedrop Inject by miroslav] Injection complete');
})();

