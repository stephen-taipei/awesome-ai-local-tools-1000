/**
 * Multilingual TTS - Tool #211
 * Uses Web Speech Synthesis API
 */

const translations = {
    en: {
        title: 'Multilingual Text-to-Speech',
        subtitle: 'Convert text to speech in 50+ languages',
        selectLanguage: 'Select Language',
        enterText: 'Enter Text',
        textPlaceholder: 'Type or paste your text here...',
        speak: 'Speak',
        pause: 'Pause',
        resume: 'Resume',
        stop: 'Stop',
        download: 'Download',
        output: 'Audio Output',
        ready: 'Ready to speak',
        speaking: 'Speaking...',
        paused: 'Paused',
        settings: 'Settings',
        rate: 'Speed:',
        pitch: 'Pitch:',
        volume: 'Volume:'
    },
    zh: {
        title: '多語言語音合成',
        subtitle: '將文字轉換為 50+ 種語言的語音',
        selectLanguage: '選擇語言',
        enterText: '輸入文字',
        textPlaceholder: '在此輸入或貼上文字...',
        speak: '朗讀',
        pause: '暫停',
        resume: '繼續',
        stop: '停止',
        download: '下載',
        output: '音訊輸出',
        ready: '準備朗讀',
        speaking: '朗讀中...',
        paused: '已暫停',
        settings: '設定',
        rate: '速度：',
        pitch: '音調：',
        volume: '音量：'
    }
};

let currentLang = 'en';
let selectedVoiceLang = 'en-US';
let synth = window.speechSynthesis;
let utterance = null;
let isPaused = false;

const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('statusText');
const rateSlider = document.getElementById('rateSlider');
const pitchSlider = document.getElementById('pitchSlider');
const volumeSlider = document.getElementById('volumeSlider');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const volumeValue = document.getElementById('volumeValue');

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));

// Language selection
document.getElementById('languageSelect').addEventListener('click', (e) => {
    const option = e.target.closest('.lang-option');
    if (option) {
        document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        selectedVoiceLang = option.dataset.lang;
    }
});

// Character count
textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
});

// Sliders
rateSlider.addEventListener('input', () => {
    rateValue.textContent = rateSlider.value + 'x';
});

pitchSlider.addEventListener('input', () => {
    pitchValue.textContent = pitchSlider.value;
});

volumeSlider.addEventListener('input', () => {
    volumeValue.textContent = Math.round(volumeSlider.value * 100) + '%';
});

// Get voice for language
function getVoice(lang) {
    const voices = synth.getVoices();
    return voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
           voices.find(v => v.lang === lang) ||
           voices[0];
}

// Speak
speakBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) return;

    if (synth.speaking) {
        synth.cancel();
    }

    utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice(selectedVoiceLang);
    utterance.lang = selectedVoiceLang;
    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);
    utterance.volume = parseFloat(volumeSlider.value);

    utterance.onstart = () => {
        statusText.textContent = translations[currentLang].speaking;
        speakBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    };

    utterance.onend = () => {
        statusText.textContent = translations[currentLang].ready;
        speakBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        isPaused = false;
    };

    utterance.onerror = (e) => {
        console.error('Speech error:', e);
        statusText.textContent = 'Error: ' + e.error;
        speakBtn.disabled = false;
    };

    synth.speak(utterance);
});

// Pause/Resume
pauseBtn.addEventListener('click', () => {
    if (isPaused) {
        synth.resume();
        pauseBtn.textContent = translations[currentLang].pause;
        statusText.textContent = translations[currentLang].speaking;
        isPaused = false;
    } else {
        synth.pause();
        pauseBtn.textContent = translations[currentLang].resume;
        statusText.textContent = translations[currentLang].paused;
        isPaused = true;
    }
});

// Stop
stopBtn.addEventListener('click', () => {
    synth.cancel();
    statusText.textContent = translations[currentLang].ready;
    speakBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    isPaused = false;
    pauseBtn.textContent = translations[currentLang].pause;
});

// Download (note: Web Speech API doesn't support direct audio export)
downloadBtn.addEventListener('click', () => {
    alert('Direct download requires server-side TTS. The browser Speech Synthesis API does not support audio file export.');
});

// Load voices
speechSynthesis.onvoiceschanged = () => {
    console.log('Voices loaded:', synth.getVoices().length);
};

setLanguage('en');
