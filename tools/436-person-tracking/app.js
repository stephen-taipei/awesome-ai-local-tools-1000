/**
 * Person Tracking - Tool #436
 * Track person movement in video
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('trackCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let tracks = [];
let maxTrailLength = 100;

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('startBtn').addEventListener('click', startTracking);
    document.getElementById('clearBtn').addEventListener('click', clearTrails);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '人物追蹤', subtitle: '即時追蹤人物移動軌跡', privacy: '100% 本地處理 · 零資料上傳', start: '開始追蹤', targets: '追蹤目標', trails: '軌跡點數', clear: '清除軌跡' },
        en: { title: 'Person Tracking', subtitle: 'Track person movement in real-time', privacy: '100% Local Processing · No Data Upload', start: 'Start Tracking', targets: 'Targets', trails: 'Trail Points', clear: 'Clear Trails' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.getElementById('startBtn').textContent = t.start;
    document.getElementById('clearBtn').textContent = t.clear;

    const labels = document.querySelectorAll('.info-label');
    if (labels.length >= 2) {
        labels[0].textContent = t.targets;
        labels[1].textContent = t.trails;
    }
}

async function startTracking() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.querySelector('.webcam-section').style.display = 'none';
        document.getElementById('trackSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            trackPeople();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function trackPeople() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 80;
    tempCanvas.height = 60;

    let prevFrameData = null;

    function analyze() {
        tempCtx.drawImage(video, 0, 0, 80, 60);
        const imageData = tempCtx.getImageData(0, 0, 80, 60);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (prevFrameData) {
            // Detect moving regions
            const movingRegions = detectMovement(data, prevFrameData, 80, 60);

            // Find person positions
            const people = findPeople(data, movingRegions, 80, 60);

            // Update tracks
            updateTracks(people);

            // Draw trails and markers
            drawTracks();
        }

        prevFrameData = new Uint8ClampedArray(data);

        // Update stats
        document.getElementById('targetCount').textContent = tracks.length;
        document.getElementById('trailCount').textContent = tracks.reduce((s, t) => s + t.trail.length, 0);

        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function detectMovement(current, previous, width, height) {
    const moving = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 40) {
                moving.push({ x, y });
            }
        }
    }

    return moving;
}

function findPeople(data, movingRegions, width, height) {
    const people = [];

    // Combine skin detection with movement
    const skinRegions = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];

            if (isSkinColor(r, g, b)) {
                skinRegions.push({ x, y });
            }
        }
    }

    // Cluster skin regions
    if (skinRegions.length > 20) {
        const clusters = clusterPoints(skinRegions);

        clusters.forEach(cluster => {
            if (cluster.length > 10) {
                const cx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
                const cy = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
                people.push({ x: cx, y: cy, size: cluster.length });
            }
        });
    }

    return people;
}

function isSkinColor(r, g, b) {
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15;
}

function clusterPoints(points) {
    const clusters = [];
    const visited = new Set();

    points.forEach((point, idx) => {
        if (visited.has(idx)) return;

        const cluster = [];
        const stack = [idx];

        while (stack.length > 0 && cluster.length < 100) {
            const current = stack.pop();
            if (visited.has(current)) continue;

            visited.add(current);
            cluster.push(points[current]);

            points.forEach((other, oIdx) => {
                if (visited.has(oIdx)) return;
                const dist = Math.sqrt(
                    Math.pow(points[current].x - other.x, 2) +
                    Math.pow(points[current].y - other.y, 2)
                );
                if (dist < 8) {
                    stack.push(oIdx);
                }
            });
        }

        if (cluster.length > 5) {
            clusters.push(cluster);
        }
    });

    return clusters.slice(0, 4);
}

function updateTracks(people) {
    const scaleX = canvas.width / 80;
    const scaleY = canvas.height / 60;

    // Match detected people to existing tracks
    const matched = new Set();

    people.forEach(person => {
        const scaledX = person.x * scaleX;
        const scaledY = person.y * scaleY;

        let minDist = Infinity;
        let matchedTrack = null;

        tracks.forEach((track, idx) => {
            if (matched.has(idx)) return;
            const lastPos = track.trail[track.trail.length - 1];
            const dist = Math.sqrt(Math.pow(lastPos.x - scaledX, 2) + Math.pow(lastPos.y - scaledY, 2));

            if (dist < 80 && dist < minDist) {
                minDist = dist;
                matchedTrack = idx;
            }
        });

        if (matchedTrack !== null) {
            // Update existing track
            tracks[matchedTrack].trail.push({ x: scaledX, y: scaledY });
            if (tracks[matchedTrack].trail.length > maxTrailLength) {
                tracks[matchedTrack].trail.shift();
            }
            tracks[matchedTrack].lastSeen = Date.now();
            matched.add(matchedTrack);
        } else {
            // Create new track
            tracks.push({
                id: Date.now(),
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                trail: [{ x: scaledX, y: scaledY }],
                lastSeen: Date.now()
            });
        }
    });

    // Remove old tracks
    const now = Date.now();
    tracks = tracks.filter(track => now - track.lastSeen < 2000);
}

function drawTracks() {
    tracks.forEach((track, idx) => {
        if (track.trail.length < 2) return;

        // Draw trail
        ctx.beginPath();
        ctx.strokeStyle = track.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        track.trail.forEach((point, i) => {
            ctx.globalAlpha = (i / track.trail.length) * 0.8;
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw current position marker
        const current = track.trail[track.trail.length - 1];
        ctx.beginPath();
        ctx.arc(current.x, current.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = track.color;
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), current.x, current.y);
    });
}

function clearTrails() {
    tracks.forEach(track => {
        track.trail = track.trail.slice(-1);
    });
}

init();
