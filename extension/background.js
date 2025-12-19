// Background service worker для расширения Minedrop Bonus by miroslav

chrome.runtime.onInstalled.addListener(() => {
    console.log('[Minedrop Extension by miroslav] Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'MODIFY_GAME_DATA') {
        // Обработка запросов на модификацию данных игры
        sendResponse({ success: true });
    }
    return true;
});

// Слушаем обновления вкладок
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('stake-engine.com') || tab.url.includes('minedrop')) {
            console.log('[Minedrop Extension] Game page loaded');
        }
    }
});

