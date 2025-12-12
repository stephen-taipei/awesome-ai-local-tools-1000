/**
 * EXIF Info Reader
 * Tool #056 - Awesome AI Local Tools
 *
 * Read EXIF metadata using exifr
 */

const translations = {
    'zh-TW': {
        title: 'EXIF 資訊讀取',
        subtitle: '讀取並顯示圖片 EXIF 後設資料，包含相機參數、GPS 等',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        uploadText: '點擊或拖放圖片到這裡',
        uploadHint: '支援 JPG, TIFF, WebP, HEIC',
        cameraInfo: '相機資訊',
        shootInfo: '拍攝參數',
        gpsInfo: 'GPS 位置',
        otherInfo: '其他資訊',
        viewMap: '在地圖上查看',
        downloadJson: '下載 JSON',
        newImage: '選擇新圖片',
        backToHome: '返回首頁',
        toolNumber: '工具 #056',
        copyright: 'Awesome AI Local Tools © 2024',
        noData: '無資料',
        make: '製造商',
        model: '型號',
        lens: '鏡頭',
        software: '軟體',
        focalLength: '焦距',
        fNumber: '光圈',
        exposureTime: '曝光時間',
        iso: 'ISO',
        flash: '閃光燈',
        date: '拍攝日期',
        latitude: '緯度',
        longitude: '經度',
        altitude: '高度',
        width: '寬度',
        height: '高度',
        fileSize: '檔案大小'
    },
    'en': {
        title: 'EXIF Info Reader',
        subtitle: 'Read and display image EXIF metadata locally',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        uploadText: 'Click or drag image here',
        uploadHint: 'Supports JPG, TIFF, WebP, HEIC',
        cameraInfo: 'Camera Info',
        shootInfo: 'Shooting Params',
        gpsInfo: 'GPS Location',
        otherInfo: 'Other Info',
        viewMap: 'View on Map',
        downloadJson: 'Download JSON',
        newImage: 'New Image',
        backToHome: 'Back to Home',
        toolNumber: 'Tool #056',
        copyright: 'Awesome AI Local Tools © 2024',
        noData: 'No Data',
        make: 'Make',
        model: 'Model',
        lens: 'Lens',
        software: 'Software',
        focalLength: 'Focal Length',
        fNumber: 'F-Number',
        exposureTime: 'Exposure Time',
        iso: 'ISO',
        flash: 'Flash',
        date: 'Date Taken',
        latitude: 'Latitude',
        longitude: 'Longitude',
        altitude: 'Altitude',
        width: 'Width',
        height: 'Height',
        fileSize: 'File Size'
    }
};

let currentLang = 'zh-TW';
let exifData = null;

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initEventListeners();
});

function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');

    if (currentLang === 'zh-TW') {
        langZhBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langZhBtn.classList.remove('active');
    }
    localStorage.setItem('preferredLanguage', currentLang);
}

function initEventListeners() {
    document.getElementById('lang-zh').addEventListener('click', () => { currentLang = 'zh-TW'; updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; updateLanguage(); });

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length) processFile(e.target.files[0]); });

    document.getElementById('downloadJsonBtn').addEventListener('click', downloadJson);
    document.getElementById('newImageBtn').addEventListener('click', () => location.reload());
}

async function processFile(file) {
    if (!file.type.startsWith('image/')) return;

    // Load Preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById('previewImage');
        img.src = e.target.result;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('resultArea').style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Read EXIF
    try {
        const { default: exifr } = await import('../../assets/js/exifr.full.esm.mjs');
        exifData = await exifr.parse(file, { tiff: true, xmp: true, icc: true, iptc: true, jfif: true, ihdr: true });

        displayData(exifData, file);
    } catch (e) {
        console.error(e);
        alert('Failed to read EXIF data or no EXIF data found.');
    }
}

function displayData(data, file) {
    const t = translations[currentLang];

    // Helper
    const val = (key) => data && data[key] !== undefined ? data[key] : '-';
    const row = (labelKey, value) => `<tr><td>${t[labelKey] || labelKey}</td><td>${value}</td></tr>`;

    // Basic Meta
    document.getElementById('basicMeta').innerHTML = `
        <p>${t.fileSize}: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        <p>${file.type}</p>
        <p>${val('ImageWidth')} x ${val('ImageHeight')}</p>
    `;

    // Camera Info
    document.getElementById('cameraTable').innerHTML = `
        ${row('make', val('Make'))}
        ${row('model', val('Model'))}
        ${row('lens', val('LensModel') !== '-' ? val('LensModel') : val('LensInfo') || '-')}
        ${row('software', val('Software'))}
    `;

    // Shoot Info
    const fNumber = val('FNumber');
    const expTime = val('ExposureTime');
    const iso = val('ISO');
    const focal = val('FocalLength');
    const date = val('DateTimeOriginal') !== '-' ? new Date(val('DateTimeOriginal')).toLocaleString() : '-';

    document.getElementById('shootTable').innerHTML = `
        ${row('fNumber', fNumber !== '-' ? `f/${fNumber}` : '-')}
        ${row('exposureTime', expTime !== '-' ? (expTime < 1 ? `1/${Math.round(1/expTime)}` : expTime) + 's' : '-')}
        ${row('iso', iso)}
        ${row('focalLength', focal !== '-' ? `${focal}mm` : '-')}
        ${row('date', date)}
        ${row('flash', val('Flash') !== '-' ? val('Flash') : '-')}
    `;

    // GPS
    const lat = val('latitude');
    const lon = val('longitude');
    const alt = val('altitude');

    document.getElementById('gpsTable').innerHTML = `
        ${row('latitude', lat !== '-' ? lat.toFixed(6) : '-')}
        ${row('longitude', lon !== '-' ? lon.toFixed(6) : '-')}
        ${row('altitude', alt !== '-' ? `${alt.toFixed(1)}m` : '-')}
    `;

    if (lat !== '-' && lon !== '-') {
        const mapLink = document.getElementById('mapLink');
        mapLink.style.display = 'block';
        mapLink.querySelector('a').href = `https://www.google.com/maps?q=${lat},${lon}`;
    }

    // Other Info (Filtered)
    // List some random common tags that are not above
    const ignored = ['Make','Model','LensModel','Software','FNumber','ExposureTime','ISO','FocalLength','DateTimeOriginal','Flash','latitude','longitude','altitude','ImageWidth','ImageHeight'];
    let otherHtml = '';
    for (const key in data) {
        if (!ignored.includes(key) && typeof data[key] !== 'object' && data[key] !== undefined) {
             // Limit length
             let v = data[key].toString();
             if (v.length > 50) v = v.substring(0, 50) + '...';
             otherHtml += `<tr><td>${key}</td><td>${v}</td></tr>`;
        }
    }
    document.getElementById('otherTable').innerHTML = otherHtml || `<tr><td colspan="2">${t.noData}</td></tr>`;
}

function downloadJson() {
    if (!exifData) return;
    const blob = new Blob([JSON.stringify(exifData, null, 2)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exif-data-${Date.now()}.json`;
    link.click();
}
