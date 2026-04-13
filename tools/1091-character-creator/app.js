const i18n = {
  'zh-TW': {
    title: '角色創建工具',
    subtitle: '完全在瀏覽器本地執行，資料不外傳',
    privacyBadge: '100% 本地處理 · 零資料上傳',
    inputLabel: '輸入',
    process: '處理',
    outputLabel: '結果',
    placeholder: '在此輸入...',
  },
  'en': {
    title: 'Character Creator',
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
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  return `Analysis complete:\n- Words: ${words.length}\n- Sentences: ${sentences.length}\n- Characters: ${text.length}\n\nProcessed output:\n${text}`;
}

applyI18n();
