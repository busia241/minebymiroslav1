(function() {
    'use strict';
    if (window.isFetchTrapSet) return;
    window.isFetchTrapSet = true;

    const originalFetch = window.fetch;
    let isPatchActivated = false;
    const pendingCalls = [];
    window.fetch = function(...args) {
        if (isPatchActivated) return window.fetch(...args);
        return new Promise((resolve, reject) => {
            pendingCalls.push({ args, resolve, reject });
        });
    };
    window.activateFetchPatch = function(patcher) {
        isPatchActivated = true;
        window.fetch = patcher(originalFetch);
        pendingCalls.forEach(call => window.fetch(...call.args).then(call.resolve).catch(call.reject));
    };
})();

