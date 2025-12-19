(function() {
    const currentHost = window.location.hostname;
    if (currentHost.includes('cv749818.tw1.ru')) {
        window.addEventListener('message', function (event) {
            if (event.data.type === "AUTH_TOKEN_FROM_WEBSITE") {
                chrome.runtime.sendMessage({ type: "SAVE_AUTH_TOKEN", payload: event.data.payload });
            }
        });
        const observer = new MutationObserver(() => {
            const frame = document.querySelector("iframe[data-game-id]");
            if (frame) {
                chrome.runtime.sendMessage({ 
                    type: "LISTEN_FOR_IFRAME_LOAD", 
                    payload: { gameId: frame.dataset.gameId } 
                });
                observer.disconnect();
            }
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
    if (currentHost.includes('stake-engine.com')) {
        window.addEventListener('message', function(event) {
            if (event.source !== window || !event.data.type || event.data.type !== 'PROXY_REQUEST_FROM_PAGE') return;
            
            const { requestId, payload } = event.data;
            chrome.runtime.sendMessage({ type: 'PROXY_FETCH_REQUEST', payload: payload }, (response) => {
                window.postMessage({ type: 'PROXY_RESPONSE_FROM_EXTENSION', requestId, response }, '*');
            });
        });
        chrome.runtime.sendMessage({ type: "INJECT_PAYLOAD_REQUEST" });
    }
})();