/**
 * Fitness Counter - Tool #432
 * Count fitness reps automatically
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('fitnessCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let currentExercise = null;
let repCount = 0;
let startTime = null;
let phase = 'up';

const exercises = {
    squat: { icon: '🏋️', zh: '深蹲', en: 'Squat', cal: 0.32 },
    pushup: { icon: '💪', zh: '伏地挺身', en: 'Push-up', cal: 0.29 },
    jumpingjack: { icon: '⭐', zh: '開合跳', en: 'Jumping Jack', cal: 0.2 },
    lunge: { icon: '🦵', zh: '弓步', en: 'Lunge', cal: 0.25 }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('resetBtn').addEventListener('click', resetCounter);

    document.querySelectorAll('.exercise-btn').forEach(btn => {
        btn.addEventListener('click', () => startExercise(btn.dataset.exercise));
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '健身計數器', subtitle: '自動計算運動次數', privacy: '100% 本地處理 · 零資料上傳', select: '選擇運動', reps: '次', time: '時間', cal: '卡路里', rate: '速率', reset: '重新選擇' },
        en: { title: 'Fitness Counter', subtitle: 'Count fitness reps automatically', privacy: '100% Local Processing · No Data Upload', select: 'Select Exercise', reps: 'reps', time: 'Time', cal: 'Calories', rate: 'Rate', reset: 'Change Exercise' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.exercise-select h3').textContent = t.select;
    document.querySelector('.counter-label').textContent = t.reps;
    document.getElementById('resetBtn').textContent = t.reset;

    const labels = document.querySelectorAll('.mini-label');
    if (labels.length >= 3) {
        labels[0].textContent = t.time;
        labels[1].textContent = t.cal;
        labels[2].textContent = t.rate;
    }

    // Update exercise buttons
    document.querySelectorAll('.exercise-btn').forEach(btn => {
        const ex = btn.dataset.exercise;
        btn.textContent = `${exercises[ex].icon} ${exercises[ex][lang]}`;
    });

    if (currentExercise) {
        document.getElementById('exerciseName').textContent = exercises[currentExercise][lang];
    }
}

async function startExercise(exercise) {
    currentExercise = exercise;
    repCount = 0;
    startTime = Date.now();
    phase = 'up';

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.getElementById('exerciseSelect').style.display = 'none';
        document.getElementById('counterSection').style.display = 'block';

        document.getElementById('exerciseIcon').textContent = exercises[exercise].icon;
        document.getElementById('exerciseName').textContent = exercises[exercise][currentLang];

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            countReps();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function countReps() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 64;
    tempCanvas.height = 48;

    let prevFrameData = null;
    let motionHistory = [];

    function analyze() {
        tempCtx.drawImage(video, 0, 0, 64, 48);
        const imageData = tempCtx.getImageData(0, 0, 64, 48);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update time
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            document.getElementById('duration').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

            // Calculate rate
            if (elapsed > 0 && repCount > 0) {
                const rate = Math.round((repCount / elapsed) * 60);
                document.getElementById('rate').textContent = `${rate}/min`;
            }
        }

        if (prevFrameData) {
            const motion = analyzeMotion(data, prevFrameData, 64, 48);
            motionHistory.push(motion);
            if (motionHistory.length > 30) motionHistory.shift();

            // Draw motion overlay
            drawMotionOverlay(data, prevFrameData, 64, 48);

            // Detect reps based on exercise type
            const detected = detectRep(motionHistory, currentExercise);
            if (detected) {
                repCount++;
                document.getElementById('repCount').textContent = repCount;

                // Update calories
                const calories = Math.round(repCount * exercises[currentExercise].cal * 10) / 10;
                document.getElementById('calories').textContent = calories;

                // Visual feedback
                flashCounter();
            }
        }

        prevFrameData = new Uint8ClampedArray(data);
        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function analyzeMotion(current, previous, width, height) {
    let totalMotion = 0;
    let upperMotion = 0, lowerMotion = 0;
    let centerY = 0, count = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 30) {
                totalMotion += diff;
                if (y < height / 2) upperMotion += diff;
                else lowerMotion += diff;
                centerY += y * diff;
                count += diff;
            }
        }
    }

    return {
        total: totalMotion,
        upper: upperMotion,
        lower: lowerMotion,
        centerY: count > 0 ? centerY / count : height / 2
    };
}

function drawMotionOverlay(current, previous, width, height) {
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;

    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';

    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            const idx = (y * width + x) * 4;
            const diff = Math.abs(current[idx] - previous[idx]) +
                        Math.abs(current[idx + 1] - previous[idx + 1]) +
                        Math.abs(current[idx + 2] - previous[idx + 2]);

            if (diff > 50) {
                ctx.fillRect(x * scaleX, y * scaleY, scaleX * 2, scaleY * 2);
            }
        }
    }
}

function detectRep(motionHistory, exercise) {
    if (motionHistory.length < 10) return false;

    const recent = motionHistory.slice(-10);
    const avgCenterY = recent.reduce((s, m) => s + m.centerY, 0) / recent.length;
    const avgTotal = recent.reduce((s, m) => s + m.total, 0) / recent.length;

    let threshold = 28;
    let minMotion = 15000;

    switch (exercise) {
        case 'squat':
            threshold = 30;
            minMotion = 20000;
            break;
        case 'pushup':
            threshold = 28;
            minMotion = 15000;
            break;
        case 'jumpingjack':
            threshold = 24;
            minMotion = 30000;
            break;
        case 'lunge':
            threshold = 28;
            minMotion = 18000;
            break;
    }

    if (avgTotal < minMotion) return false;

    // Detect phase transitions
    if (phase === 'up' && avgCenterY > threshold) {
        phase = 'down';
        return false;
    } else if (phase === 'down' && avgCenterY < threshold - 4) {
        phase = 'up';
        return true;
    }

    return false;
}

function flashCounter() {
    const counter = document.querySelector('.big-counter');
    counter.style.background = '#22c55e';
    setTimeout(() => {
        counter.style.background = '';
    }, 200);
}

function resetCounter() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    repCount = 0;
    startTime = null;
    phase = 'up';
    currentExercise = null;

    document.getElementById('repCount').textContent = '0';
    document.getElementById('duration').textContent = '0:00';
    document.getElementById('calories').textContent = '0';
    document.getElementById('rate').textContent = '--/min';

    document.getElementById('counterSection').style.display = 'none';
    document.getElementById('exerciseSelect').style.display = 'block';
}

init();
