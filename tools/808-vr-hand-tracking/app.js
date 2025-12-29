/**
 * VR Hand Tracking - Tool #808
 * Hand tracking simulation for VR
 */

const i18n = {
    en: {
        title: "VR Hand Tracking",
        subtitle: "Natural hand interaction in virtual reality",
        privacy: "100% Local Processing - No Data Upload",
        notice: "WebXR hand tracking requires a VR headset with hand tracking support",
        demo: "Start Demo",
        enterVR: "Enter VR",
        fps: "FPS",
        latency: "Latency (ms)",
        joints: "Joints Tracked",
        accuracy: "Accuracy",
        fullHand: "Full Hand",
        fullHandDesc: "Track all 26 joints per hand",
        lowLatency: "Low Latency",
        lowLatencyDesc: "Sub-10ms tracking latency",
        gestures: "Gesture Recognition",
        gesturesDesc: "Recognize pinch, grab, point, and more"
    },
    zh: {
        title: "VR 手部追蹤",
        subtitle: "虛擬實境中的自然手部互動",
        privacy: "100% 本地處理 - 無數據上傳",
        notice: "WebXR 手部追蹤需要支援手部追蹤的 VR 頭戴裝置",
        demo: "開始演示",
        enterVR: "進入 VR",
        fps: "幀率",
        latency: "延遲 (ms)",
        joints: "追蹤關節數",
        accuracy: "精確度",
        fullHand: "完整手部",
        fullHandDesc: "追蹤每隻手的全部 26 個關節",
        lowLatency: "低延遲",
        lowLatencyDesc: "低於 10ms 的追蹤延遲",
        gestures: "手勢識別",
        gesturesDesc: "識別捏合、抓取、指向等動作"
    }
};

let currentLang = 'en';
let isDemo = false;
let animationId;

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function startDemo() {
    if (isDemo) {
        isDemo = false;
        if (animationId) cancelAnimationFrame(animationId);
        return;
    }

    isDemo = true;
    animateHands();
}

function animateHands() {
    if (!isDemo) return;

    const time = Date.now() / 1000;
    const leftHand = document.getElementById('leftHand');
    const rightHand = document.getElementById('rightHand');

    // Animate left hand
    const leftX = 20 + Math.sin(time * 0.5) * 10;
    const leftY = 50 + Math.cos(time * 0.7) * 15;
    leftHand.style.left = `${leftX}%`;
    leftHand.style.top = `${leftY}%`;

    // Animate right hand
    const rightX = 80 + Math.sin(time * 0.6) * 10;
    const rightY = 50 + Math.cos(time * 0.8) * 15;
    rightHand.style.left = `${rightX}%`;
    rightHand.style.top = `${rightY}%`;

    // Update hand poses
    const poses = ['🖐️', '✊', '👆', '✌️', '🤏', '👍'];
    const poseIndex = Math.floor(time) % poses.length;
    leftHand.textContent = poses[poseIndex];
    rightHand.textContent = poses[(poseIndex + 3) % poses.length];

    // Update stats
    document.getElementById('fps').textContent = 58 + Math.floor(Math.random() * 4);
    document.getElementById('latency').textContent = 6 + Math.floor(Math.random() * 5);
    document.getElementById('accuracy').textContent = (96 + Math.random() * 3).toFixed(1) + '%';

    // Update finger status
    const fingerStates = ['Extended', 'Curled', 'Bent'];
    ['thumb', 'index', 'middle', 'ring', 'pinky'].forEach(finger => {
        document.getElementById(finger).textContent = fingerStates[Math.floor(Math.random() * fingerStates.length)];
    });

    animationId = requestAnimationFrame(animateHands);
}

async function enterVR() {
    if (!navigator.xr) {
        alert('WebXR is not supported in this browser');
        return;
    }

    try {
        const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
        if (!isSupported) {
            alert('Immersive VR is not supported on this device');
            return;
        }

        const session = await navigator.xr.requestSession('immersive-vr', {
            optionalFeatures: ['hand-tracking']
        });

        console.log('VR session started:', session);
    } catch (err) {
        console.error('Failed to start VR session:', err);
        alert('Could not start VR session. Make sure you have a VR headset connected.');
    }
}
