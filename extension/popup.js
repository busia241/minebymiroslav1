// Popup script для расширения

document.addEventListener('DOMContentLoaded', () => {
    // Проверяем статус расширения
    chrome.storage.local.get(['authToken', 'username'], (result) => {
        if (result.authToken) {
            document.getElementById('status').textContent = 'Активно';
            document.getElementById('status').style.color = '#4CAF50';
        } else {
            document.getElementById('status').textContent = 'Ожидание...';
            document.getElementById('status').style.color = '#ff9800';
        }
    });
});

