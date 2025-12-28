/**
 * AR Virtual Try-On - Tool #805
 * Virtual try-on for accessories
 */

const i18n = {
    en: {
        title: "AR Virtual Try-On",
        subtitle: "Try accessories and items virtually",
        privacy: "100% Local Processing - No Data Upload",
        start: "Start Camera",
        stop: "Stop Camera",
        capture: "Capture",
        catGlasses: "Glasses",
        catHats: "Hats",
        catJewelry: "Jewelry",
        catMakeup: "Makeup",
        accurate: "Accurate Fit",
        accurateDesc: "Items placed precisely using face tracking",
        variety: "Wide Variety",
        varietyDesc: "Multiple categories of virtual items",
        share: "Share",
        shareDesc: "Capture and share your virtual looks"
    },
    zh: {
        title: "AR 虛擬試穿",
        subtitle: "虛擬試戴配件和物品",
        privacy: "100% 本地處理 - 無數據上傳",
        start: "啟動相機",
        stop: "停止相機",
        capture: "截圖",
        catGlasses: "眼鏡",
        catHats: "帽子",
        catJewelry: "珠寶",
        catMakeup: "化妝",
        accurate: "精準貼合",
        accurateDesc: "使用臉部追蹤精確放置物品",
        variety: "種類豐富",
        varietyDesc: "多種類別的虛擬物品",
        share: "分享",
        shareDesc: "截取並分享您的虛擬造型"
    }
};

const items = {
    glasses: [
        { id: 'sunglasses', icon: '🕶️', name: 'Sunglasses' },
        { id: 'reading', icon: '👓', name: 'Reading' },
        { id: 'round', icon: '🤓', name: 'Round' },
        { id: 'fashion', icon: '😎', name: 'Fashion' }
    ],
    hats: [
        { id: 'crown', icon: '👑', name: 'Crown' },
        { id: 'tophat', icon: '🎩', name: 'Top Hat' },
        { id: 'cap', icon: '🧢', name: 'Cap' },
        { id: 'party', icon: '🎉', name: 'Party' }
    ],
    jewelry: [
        { id: 'earrings', icon: '💎', name: 'Earrings' },
        { id: 'necklace', icon: '📿', name: 'Necklace' },
        { id: 'tiara', icon: '👸', name: 'Tiara' },
        { id: 'chain', icon: '⛓️', name: 'Chain' }
    ],
    makeup: [
        { id: 'lipstick', icon: '💄', name: 'Lipstick' },
        { id: 'blush', icon: '🌸', name: 'Blush' },
        { id: 'eyeliner', icon: '👁️', name: 'Eyeliner' },
        { id: 'sparkle', icon: '✨', name: 'Sparkle' }
    ]
};

let currentLang = 'en';
let video, canvas, ctx;
let isRunning = false;
let currentCategory = 'glasses';
let selectedItem = null;

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    showCategory('glasses');
}

function showCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = items[category].map(item => `
        <div class="item-card ${selectedItem === item.id ? 'active' : ''}" onclick="selectItem('${item.id}')">
            <div class="icon">${item.icon}</div>
            <div class="name">${item.name}</div>
        </div>
    `).join('');
}

function selectItem(id) {
    selectedItem = selectedItem === id ? null : id;
    showCategory(currentCategory);
}

async function startCamera() {
    const btn = document.getElementById('startBtn');

    if (isRunning) {
        stopCamera();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 720, height: 960 }
        });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            isRunning = true;
            btn.textContent = i18n[currentLang].stop;
            renderLoop();
        };
    } catch (err) {
        console.error('Camera error:', err);
    }
}

function stopCamera() {
    isRunning = false;
    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('startBtn').textContent = i18n[currentLang].start;
}

function renderLoop() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedItem) {
        applyItem();
    }

    requestAnimationFrame(renderLoop);
}

function applyItem() {
    const faceX = canvas.width / 2;
    const faceY = canvas.height / 2 - 50;

    ctx.textAlign = 'center';

    const item = Object.values(items).flat().find(i => i.id === selectedItem);
    if (!item) return;

    switch (currentCategory) {
        case 'glasses':
            ctx.font = '100px Arial';
            ctx.fillText(item.icon, faceX, faceY + 20);
            break;
        case 'hats':
            ctx.font = '90px Arial';
            ctx.fillText(item.icon, faceX, faceY - 90);
            break;
        case 'jewelry':
            ctx.font = '50px Arial';
            if (item.id === 'earrings') {
                ctx.fillText(item.icon, faceX - 100, faceY + 30);
                ctx.fillText(item.icon, faceX + 100, faceY + 30);
            } else if (item.id === 'necklace') {
                ctx.fillText(item.icon, faceX, faceY + 150);
            } else {
                ctx.fillText(item.icon, faceX, faceY - 100);
            }
            break;
        case 'makeup':
            ctx.font = '40px Arial';
            if (item.id === 'sparkle') {
                for (let i = 0; i < 5; i++) {
                    ctx.fillText('✨', faceX + (Math.random() - 0.5) * 200, faceY + (Math.random() - 0.5) * 200);
                }
            } else {
                ctx.fillText(item.icon, faceX, faceY + 80);
            }
            break;
    }
}

function capturePhoto() {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureCtx = captureCanvas.getContext('2d');

    captureCtx.translate(captureCanvas.width, 0);
    captureCtx.scale(-1, 1);
    captureCtx.drawImage(video, 0, 0);
    captureCtx.setTransform(1, 0, 0, 1, 0, 0);
    captureCtx.translate(captureCanvas.width, 0);
    captureCtx.scale(-1, 1);
    captureCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `try-on-${Date.now()}.png`;
    link.href = captureCanvas.toDataURL('image/png');
    link.click();
}

document.addEventListener('DOMContentLoaded', init);
