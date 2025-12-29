/**
 * Sports Analysis - Tool #427
 * Analyze sports movements and form
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('analysisCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let currentSport = null;
let repCount = 0;
let startTime = null;
let prevPhase = 'up';

const sportLabels = {
    squat: { zh: '深蹲', en: 'Squat' },
    pushup: { zh: '伏地挺身', en: 'Push-up' },
    jumping: { zh: '跳躍', en: 'Jumping' },
    boxing: { zh: '拳擊', en: 'Boxing' }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('resetBtn').addEventListener('click', resetAnalysis);

    document.querySelectorAll('.sport-btn').forEach(btn => {
        btn.addEventListener('click', () => startSport(btn.dataset.sport));
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '運動分析', subtitle: '分析運動姿勢與動作', privacy: '100% 本地處理 · 零資料上傳', select: '選擇運動類型', reps: '次數', form: '姿勢分數', time: '時間', reset: '重新開始' },
        en: { title: 'Sports Analysis', subtitle: 'Analyze sports movements', privacy: '100% Local Processing · No Data Upload', select: 'Select Sport Type', reps: 'Reps', form: 'Form Score', time: 'Duration', reset: 'Reset' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.sport-select h3').textContent = t.select;
    document.getElementById('resetBtn').textContent = t.reset;

    const labels = document.querySelectorAll('.stat-label');
    if (labels.length >= 3) {
        labels[0].textContent = t.reps;
        labels[1].textContent = t.form;
        labels[2].textContent = t.time;
    }

    // Update sport buttons
    document.querySelectorAll('.sport-btn').forEach(btn => {
        const sport = btn.dataset.sport;
        const icon = btn.textContent.split(' ')[0];
        btn.textContent = `${icon} ${sportLabels[sport][lang]}`;
    });
}

async function startSport(sport) {
    currentSport = sport;
    repCount = 0;
    startTime = Date.now();

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.getElementById('sportSelect').style.display = 'none';
        document.getElementById('analysisSection').style.display = 'block';

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            analyzeMovement();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function analyzeMovement() {
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

        // Calculate motion
        if (prevFrameData) {
            const motion = analyzeMotion(data, prevFrameData, 64, 48);
            motionHistory.push(motion);
            if (motionHistory.length > 60) motionHistory.shift();

            // Draw pose overlay
            drawPoseOverlay(motion);

            // Analyze sport-specific movement
            const result = analyzeSportMovement(motionHistory, currentSport);
            updateStats(result);
        }

        prevFrameData = new Uint8ClampedArray(data);

        // Update duration
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            document.getElementById('duration').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function analyzeMotion(current, previous, width, height) {
    let totalMotion = 0;
    let upperMotion = 0, lowerMotion = 0;
    let leftMotion = 0, rightMotion = 0;
    let centerY = 0, motionCount = 0;

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
                if (x < width / 2) leftMotion += diff;
                else rightMotion += diff;
                centerY += y * diff;
                motionCount += diff;
            }
        }
    }

    return {
        total: totalMotion,
        upper: upperMotion,
        lower: lowerMotion,
        left: leftMotion,
        right: rightMotion,
        centerY: motionCount > 0 ? centerY / motionCount : height / 2
    };
}

function drawPoseOverlay(motion) {
    // Draw motion indicators
    const scaleX = canvas.width / 64;
    const scaleY = canvas.height / 48;

    // Center line
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Motion center indicator
    const centerY = motion.centerY * scaleY;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, centerY, 10, 0, Math.PI * 2);
    ctx.fill();
}

function analyzeSportMovement(history, sport) {
    if (history.length < 20) {
        return { phase: 'preparing', score: 0, feedback: [] };
    }

    const recentMotion = history.slice(-20);
    const avgCenterY = recentMotion.reduce((s, m) => s + m.centerY, 0) / recentMotion.length;
    const avgTotal = recentMotion.reduce((s, m) => s + m.total, 0) / recentMotion.length;

    let phase = 'neutral';
    let score = 75;
    let feedback = [];

    switch (sport) {
        case 'squat':
            // Detect squat phases based on vertical position
            if (avgCenterY > 30) {
                phase = 'down';
                if (prevPhase === 'up') {
                    repCount++;
                    document.getElementById('repCount').textContent = repCount;
                }
            } else if (avgCenterY < 24) {
                phase = 'up';
            }

            // Form feedback
            const leftRight = Math.abs(recentMotion[recentMotion.length - 1].left - recentMotion[recentMotion.length - 1].right);
            if (leftRight < 5000) {
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '左右對稱良好' : 'Good symmetry' });
                score += 10;
            } else {
                feedback.push({ type: 'warning', text: currentLang === 'zh' ? '注意左右平衡' : 'Watch left-right balance' });
            }
            break;

        case 'pushup':
            if (avgCenterY > 28) {
                phase = 'down';
                if (prevPhase === 'up') {
                    repCount++;
                    document.getElementById('repCount').textContent = repCount;
                }
            } else {
                phase = 'up';
            }

            if (avgTotal > 10000) {
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '動作幅度足夠' : 'Good range of motion' });
            }
            break;

        case 'jumping':
            if (avgCenterY < 20 && avgTotal > 30000) {
                phase = 'up';
                if (prevPhase === 'down') {
                    repCount++;
                    document.getElementById('repCount').textContent = repCount;
                }
            } else {
                phase = 'down';
            }

            if (avgTotal > 40000) {
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '跳躍力道強' : 'Strong jump power' });
                score += 15;
            }
            break;

        case 'boxing':
            const leftPunch = recentMotion[recentMotion.length - 1].left;
            const rightPunch = recentMotion[recentMotion.length - 1].right;

            if (leftPunch > 15000 || rightPunch > 15000) {
                repCount++;
                document.getElementById('repCount').textContent = repCount;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '出拳有力' : 'Strong punch' });
            }
            break;
    }

    prevPhase = phase;

    if (feedback.length === 0) {
        feedback.push({ type: 'good', text: currentLang === 'zh' ? '繼續保持' : 'Keep going' });
    }

    return { phase, score: Math.min(100, score), feedback };
}

function updateStats(result) {
    document.getElementById('formScore').textContent = result.score;

    const feedbackEl = document.getElementById('feedback');
    feedbackEl.innerHTML = result.feedback.map(f => `
        <div class="feedback-item ${f.type}">
            ${f.type === 'good' ? '✓' : '⚠'} ${f.text}
        </div>
    `).join('');
}

function resetAnalysis() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    repCount = 0;
    startTime = null;
    prevPhase = 'up';

    document.getElementById('repCount').textContent = '0';
    document.getElementById('formScore').textContent = '--';
    document.getElementById('duration').textContent = '0:00';
    document.getElementById('feedback').innerHTML = '';

    document.getElementById('analysisSection').style.display = 'none';
    document.getElementById('sportSelect').style.display = 'block';
}

init();
