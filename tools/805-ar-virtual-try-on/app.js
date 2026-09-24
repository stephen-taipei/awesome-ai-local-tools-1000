/** AR Virtual Try-On - Tool #805. Centered sticker demo, not face tracking. */
const i18n = {
    en: {
        title: "AR Virtual Try-On", subtitle: "Try accessories and items virtually",
        privacy: "100% Local Processing - No Data Upload", start: "Start Camera", stop: "Stop Camera", capture: "Capture",
        catGlasses: "Glasses", catHats: "Hats", catJewelry: "Jewelry", catMakeup: "Makeup",
        accurate: "Sticker Preview", accurateDesc: "Centered sticker preview only; no face tracking is implemented",
        variety: "Wide Variety", varietyDesc: "Multiple categories of virtual items", share: "Share", shareDesc: "Capture and share your virtual looks"
    },
    zh: {
        title: "AR 虛擬試穿", subtitle: "虛擬試戴配件和物品", privacy: "100% 本地處理 - 無數據上傳",
        start: "啟動相機", stop: "停止相機", capture: "截圖", catGlasses: "眼鏡", catHats: "帽子", catJewelry: "珠寶", catMakeup: "化妝",
        accurate: "貼圖預覽", accurateDesc: "置中貼圖示範，尚未實作臉部追蹤", variety: "種類豐富", varietyDesc: "多種類別的虛擬物品", share: "分享", shareDesc: "截取並分享您的虛擬造型"
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
let cameraRequestId = 0, cameraStarting = false;
let currentCategory = 'glasses';
let selectedItem = null;

function setLang(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const value = i18n[lang][element.dataset.i18n];
        if (value) element.textContent = value;
    });
    document.querySelectorAll('.lang-btn').forEach((button, index) => button.classList.toggle('active', ['en', 'zh'][index] === lang));
    document.getElementById('startBtn').textContent = i18n[lang][isRunning ? 'stop' : 'start'];
}
function init() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    showCategory('glasses');
    setLang(currentLang);
}
function showCategory(category) {
    if (!Object.hasOwn(items, category)) return;
    if (category !== currentCategory) selectedItem = null;
    currentCategory = category;
    document.querySelectorAll('.tab-btn').forEach((button, index) => button.classList.toggle('active', Object.keys(items)[index] === category));
    const grid = document.getElementById('itemsGrid');
    grid.replaceChildren();
    items[category].forEach(item => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'item-card';
        button.classList.toggle('active', selectedItem === item.id);
        button.setAttribute('aria-pressed', String(selectedItem === item.id));
        const icon = document.createElement('div'); icon.className = 'icon'; icon.textContent = item.icon;
        const label = document.createElement('div'); label.className = 'name'; label.textContent = item.name;
        button.append(icon, label);
        button.addEventListener('click', () => selectItem(item.id));
        grid.append(button);
    });
}
function selectItem(id) {
    selectedItem = selectedItem === id ? null : id;
    showCategory(currentCategory);
}
async function startCamera() {
    if (isRunning || cameraStarting) { stopCamera(); return; }
    const request = ++cameraRequestId;
    cameraStarting = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 720, height: 960 } });
        if (request !== cameraRequestId) { stream.getTracks().forEach(track => track.stop()); return; }
        video.onloadedmetadata = () => {
            if (request !== cameraRequestId) return;
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            isRunning = true; cameraStarting = false;
            document.getElementById('captureBtn').disabled = false;
            document.getElementById('startBtn').textContent = i18n[currentLang].stop;
            renderLoop();
        };
        video.srcObject = stream;
    } catch (error) {
        if (request === cameraRequestId) { stopCamera(); alert('Camera unavailable: ' + error.message); }
    }
}
function stopCamera() {
    cameraRequestId++;
    cameraStarting = false;
    isRunning = false;
    if (!video) return;
    video.onloadedmetadata = null;
    video.srcObject?.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('startBtn').textContent = i18n[currentLang].start;
    document.getElementById('captureBtn').disabled = true;
}
function renderLoop() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (selectedItem) applyItem();
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
            } else if (item.id === 'necklace') ctx.fillText(item.icon, faceX, faceY + 150);
            else ctx.fillText(item.icon, faceX, faceY - 100);
            break;
        case 'makeup':
            ctx.font = '40px Arial';
            if (item.id === 'sparkle') {
                for (let i = 0; i < 5; i++) ctx.fillText('✨', faceX + (Math.random() - 0.5) * 200, faceY + (Math.random() - 0.5) * 200);
            } else ctx.fillText(item.icon, faceX, faceY + 80);
            break;
    }
}
function capturePhoto() {
    if (!isRunning || !video.videoWidth) return;
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
window.addEventListener('pagehide', stopCamera);
