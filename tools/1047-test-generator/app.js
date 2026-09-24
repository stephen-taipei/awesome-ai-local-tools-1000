const i18n = {
  'zh-TW': {
    title: '測試生成工具',
    subtitle: '完全在瀏覽器本地執行，資料不外傳',
    privacyBadge: '100% 本地處理 · 零資料上傳',
    inputLabel: '輸入',
    process: '處理',
    outputLabel: '結果',
    placeholder: '在此輸入...',
  },
  'en': {
    title: 'Test Generator',
    subtitle: 'Runs entirely in your browser, no data uploaded',
    privacyBadge: '100% Local · Zero Upload',
    inputLabel: 'Input',
    process: 'Process',
    outputLabel: 'Result',
    placeholder: 'Enter text here...',
  }
};

let lang = 'zh-TW';

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) el.textContent = i18n[lang][key];
  });
}

document.getElementById('lang-zh').addEventListener('click', () => {
  lang = 'zh-TW';
  document.getElementById('lang-zh').classList.add('active');
  document.getElementById('lang-en').classList.remove('active');
  applyI18n();
});

document.getElementById('lang-en').addEventListener('click', () => {
  lang = 'en';
  document.getElementById('lang-en').classList.add('active');
  document.getElementById('lang-zh').classList.remove('active');
  applyI18n();
});

document.getElementById('process-btn').addEventListener('click', () => {
  const input = document.getElementById('input').value.trim();
  if (!input) return;

  const output = document.getElementById('output');
  const outputSection = document.getElementById('output-section');

  const result = processText(input);
  output.textContent = result;
  outputSection.style.display = 'block';
});

function processText(text) {
    // IMPLEMENTATION_PENDING: no task-specific model or algorithm is implemented.
    return lang === 'en'
        ? 'Not implemented. This page does not perform the advertised analysis.'
        : '功能尚未實作；此頁無法執行標題描述的分析。';
}

applyI18n();
