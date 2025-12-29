/**
 * AR Spatial Audio - Tool #806
 * 3D positional audio experience
 */

const i18n = {
    en: {
        title: "AR Spatial Audio",
        subtitle: "Experience 3D positional audio in augmented reality",
        privacy: "100% Local Processing - No Data Upload",
        playAll: "Play All",
        stopAll: "Stop All",
        guitar: "Guitar",
        drums: "Drums",
        piano: "Piano",
        nature: "Nature",
        rain: "Rain",
        birds: "Birds",
        spatial: "3D Spatial",
        spatialDesc: "Audio that moves in 3D space around you",
        position: "Positional",
        positionDesc: "Sounds have real-world positions",
        immersive: "Immersive",
        immersiveDesc: "Full 360-degree audio experience"
    },
    zh: {
        title: "AR 空間音效",
        subtitle: "在擴增實境中體驗 3D 定位音效",
        privacy: "100% 本地處理 - 無數據上傳",
        playAll: "全部播放",
        stopAll: "全部停止",
        guitar: "吉他",
        drums: "鼓",
        piano: "鋼琴",
        nature: "自然",
        rain: "雨聲",
        birds: "鳥叫",
        spatial: "3D 空間",
        spatialDesc: "音效在您周圍的 3D 空間中移動",
        position: "定位",
        positionDesc: "聲音具有真實世界的位置",
        immersive: "沉浸式",
        immersiveDesc: "完整 360 度音效體驗"
    }
};

let currentLang = 'en';
let audioContext;
let sounds = {};
let isPlaying = false;

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function createOscillator(frequency, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const panner = audioContext.createPanner();

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;

    gainNode.gain.value = 0.3;

    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(audioContext.destination);

    return { oscillator, gainNode, panner };
}

function toggleSound(soundType) {
    if (!audioContext) initAudio();

    const item = event.target.closest('.sound-item');

    if (sounds[soundType]) {
        sounds[soundType].oscillator.stop();
        delete sounds[soundType];
        item.classList.remove('active');
    } else {
        const frequencies = {
            guitar: 220,
            drums: 100,
            piano: 440,
            nature: 180,
            rain: 300,
            birds: 800
        };

        const types = {
            guitar: 'sawtooth',
            drums: 'square',
            piano: 'sine',
            nature: 'sine',
            rain: 'triangle',
            birds: 'sine'
        };

        const sound = createOscillator(frequencies[soundType], types[soundType]);

        // Random position
        const angle = Math.random() * Math.PI * 2;
        const distance = 2 + Math.random() * 3;
        sound.panner.setPosition(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );

        sound.oscillator.start();
        sounds[soundType] = sound;
        item.classList.add('active');

        // Animate position
        animateSound(soundType);
    }
}

function animateSound(soundType) {
    if (!sounds[soundType]) return;

    const time = Date.now() / 1000;
    const angle = time * 0.5;
    const distance = 3;

    sounds[soundType].panner.setPosition(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
    );

    requestAnimationFrame(() => animateSound(soundType));
}

function toggleAllSounds() {
    if (!audioContext) initAudio();

    const soundTypes = ['guitar', 'drums', 'piano'];

    if (isPlaying) {
        stopAllSounds();
    } else {
        soundTypes.forEach((type, index) => {
            setTimeout(() => {
                const items = document.querySelectorAll('.sound-item');
                items[index].click();
            }, index * 200);
        });
        isPlaying = true;
    }
}

function stopAllSounds() {
    Object.keys(sounds).forEach(key => {
        sounds[key].oscillator.stop();
        delete sounds[key];
    });
    document.querySelectorAll('.sound-item').forEach(item => item.classList.remove('active'));
    isPlaying = false;
}

// Make sound sources draggable
document.querySelectorAll('.sound-source').forEach(source => {
    source.addEventListener('click', function() {
        this.classList.toggle('playing');
    });
});
