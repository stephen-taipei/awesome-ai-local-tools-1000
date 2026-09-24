/* Disclosure on child pages only. No input, telemetry or network access. */
(() => {
    const status = document.body.dataset.implementation;
    if (!status) return;
    const notice = document.createElement('aside');
    notice.id = 'implementation-notice';
    notice.setAttribute('role', 'note');
    notice.style.cssText = 'padding:12px 16px;margin:12px;border:1px solid currentColor;border-radius:8px;font:14px/1.6 system-ui;overflow-wrap:anywhere';
    const messages = {
        placeholder: ['功能尚未實作：此頁原本僅回傳通用字數統計，不是標題描述的 AI 工具。執行按鈕已停用，請勿把範例輸出當作分析結果。', 'Not implemented: this page previously returned generic word counts rather than the advertised tool. Execution is disabled; no AI analysis is available.'],
        demo: ['示範／模擬：此頁含模擬輸出或視覺效果，尚未驗證為完整 AI 功能。請勿用於實際決策。', 'Demo / simulation: this page contains simulated output or effects, not a verified complete AI implementation. Do not use it for decisions.'],
        speech: ['僅允許裝置端語音辨識。瀏覽器必須支援 processLocally 並已安裝對應語言套件；不支援時停用，不會改用雲端辨識。', 'On-device recognition only. Requires processLocally support and an installed language pack. Unsupported devices are disabled; there is no cloud fallback.'],
        network: ['此工具是網路例外：按下送出會將所填內容與認證傳至指定網址。請勿輸入不必要的密鑰或個人資料。', 'Network exception: sending a request transmits its content and credentials to the selected URL. Avoid unnecessary secrets or personal data.']
    };
    function update() {
        const message = messages[status];
        if (!message) return;
        notice.textContent = message[document.documentElement.lang.startsWith('zh') ? 0 : 1];
        if (status === 'placeholder') {
            const button = document.getElementById('process-btn');
            if (button) { button.disabled = true; button.setAttribute('aria-describedby', notice.id); }
        }
    }
    document.body.prepend(notice);
    update();
    new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    document.addEventListener('click', event => {
        if (event.target.closest('.lang-btn')) queueMicrotask(() => {
            const active = document.querySelector('.lang-btn.active');
            if (active && ['lang-zh', 'lang-en'].includes(active.id)) document.documentElement.lang = active.id.includes('zh') ? 'zh-TW' : 'en';
            update();
        });
    });
})();
