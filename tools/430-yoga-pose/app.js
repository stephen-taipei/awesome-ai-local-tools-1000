/**
 * Yoga Pose - Tool #430
 * Guide and evaluate yoga poses
 */

const video = document.getElementById('webcam');
const canvas = document.getElementById('yogaCanvas');
const ctx = canvas.getContext('2d');
let stream = null;
let animationId = null;
let currentLang = 'zh';
let currentPose = null;

const poses = {
    mountain: {
        icon: '🧘',
        zh: '山式',
        en: 'Mountain Pose',
        description: {
            zh: '雙腳併攏站立，手臂放鬆垂放身側',
            en: 'Stand with feet together, arms relaxed at sides'
        },
        tips: {
            zh: ['保持脊椎挺直', '放鬆肩膀', '均勻分配體重'],
            en: ['Keep spine straight', 'Relax shoulders', 'Distribute weight evenly']
        }
    },
    tree: {
        icon: '🌳',
        zh: '樹式',
        en: 'Tree Pose',
        description: {
            zh: '單腳站立，另一腳放在大腿內側',
            en: 'Stand on one leg, other foot on inner thigh'
        },
        tips: {
            zh: ['專注於一點', '收緊核心肌群', '保持呼吸平穩'],
            en: ['Focus on a point', 'Engage core muscles', 'Breathe steadily']
        }
    },
    warrior: {
        icon: '⚔️',
        zh: '戰士式',
        en: 'Warrior Pose',
        description: {
            zh: '前腿彎曲，後腿伸直，雙臂張開',
            en: 'Front leg bent, back leg straight, arms extended'
        },
        tips: {
            zh: ['前膝不超過腳踝', '後腳外轉45度', '雙臂保持水平'],
            en: ['Front knee over ankle', 'Back foot turned 45°', 'Arms level']
        }
    },
    triangle: {
        icon: '📐',
        zh: '三角式',
        en: 'Triangle Pose',
        description: {
            zh: '雙腿分開，上身側彎，手臂垂直',
            en: 'Legs apart, torso bent sideways, arms vertical'
        },
        tips: {
            zh: ['雙腿保持伸直', '胸口朝向側面', '視線看向上方手指'],
            en: ['Keep legs straight', 'Chest faces side', 'Look at upper hand']
        }
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));
    document.getElementById('changePoseBtn').addEventListener('click', changePose);

    document.querySelectorAll('.pose-btn').forEach(btn => {
        btn.addEventListener('click', () => startPose(btn.dataset.pose));
    });
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const texts = {
        zh: { title: '瑜伽姿勢', subtitle: '瑜伽姿勢指導與評估', privacy: '100% 本地處理 · 零資料上傳', select: '選擇瑜伽姿勢', change: '更換姿勢', preparing: '準備中...' },
        en: { title: 'Yoga Pose', subtitle: 'Yoga pose guidance and evaluation', privacy: '100% Local Processing · No Data Upload', select: 'Select Yoga Pose', change: 'Change Pose', preparing: 'Preparing...' }
    };

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;
    document.querySelector('.pose-select h3').textContent = t.select;
    document.getElementById('changePoseBtn').textContent = t.change;

    // Update pose buttons
    document.querySelectorAll('.pose-btn').forEach(btn => {
        const pose = btn.dataset.pose;
        btn.textContent = `${poses[pose].icon} ${poses[pose][lang]}`;
    });

    if (currentPose) {
        document.getElementById('currentPoseName').textContent = poses[currentPose][lang];
    }
}

async function startPose(pose) {
    currentPose = pose;

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = stream;

        document.getElementById('poseSelect').style.display = 'none';
        document.getElementById('practiceSection').style.display = 'block';

        document.getElementById('currentPoseIcon').textContent = poses[pose].icon;
        document.getElementById('currentPoseName').textContent = poses[pose][currentLang];

        video.onloadedmetadata = () => {
            video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            evaluatePose();
        };
    } catch (err) {
        alert(currentLang === 'zh' ? '無法存取攝影機' : 'Cannot access camera');
    }
}

function evaluatePose() {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 64;
    tempCanvas.height = 48;

    let frameCount = 0;

    function analyze() {
        frameCount++;

        tempCtx.drawImage(video, 0, 0, 64, 48);
        const imageData = tempCtx.getImageData(0, 0, 64, 48);
        const data = imageData.data;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Analyze pose
        const poseData = analyzePoseData(data, 64, 48);
        drawPoseGuide();

        // Update feedback every 15 frames
        if (frameCount % 15 === 0) {
            const evaluation = evaluatePoseAccuracy(poseData, currentPose);
            updateDisplay(evaluation);
        }

        animationId = requestAnimationFrame(analyze);
    }

    analyze();
}

function analyzePoseData(data, width, height) {
    // Find body silhouette
    const bodyPixels = [];
    let leftMost = width, rightMost = 0, topMost = height, bottomMost = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const brightness = (r + g + b) / 3;

            if (brightness > 40 && brightness < 220) {
                bodyPixels.push({ x, y });
                if (x < leftMost) leftMost = x;
                if (x > rightMost) rightMost = x;
                if (y < topMost) topMost = y;
                if (y > bottomMost) bottomMost = y;
            }
        }
    }

    const bodyWidth = rightMost - leftMost;
    const bodyHeight = bottomMost - topMost;
    const aspectRatio = bodyWidth / (bodyHeight || 1);

    // Analyze symmetry
    const centerX = (leftMost + rightMost) / 2;
    let leftCount = 0, rightCount = 0;
    bodyPixels.forEach(p => {
        if (p.x < centerX) leftCount++;
        else rightCount++;
    });
    const symmetry = 1 - Math.abs(leftCount - rightCount) / (leftCount + rightCount || 1);

    // Analyze stance width
    const bottomPixels = bodyPixels.filter(p => p.y > bottomMost - 5);
    const stanceWidth = bottomPixels.length > 0
        ? Math.max(...bottomPixels.map(p => p.x)) - Math.min(...bottomPixels.map(p => p.x))
        : 0;

    return {
        aspectRatio,
        symmetry,
        stanceWidth: stanceWidth / width,
        bodyWidth: bodyWidth / width,
        centerX: centerX / width
    };
}

function drawPoseGuide() {
    // Draw reference guides based on pose
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);

    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Horizontal guide
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.4);
    ctx.lineTo(canvas.width, canvas.height * 0.4);
    ctx.stroke();

    ctx.setLineDash([]);
}

function evaluatePoseAccuracy(poseData, pose) {
    let accuracy = 50;
    const feedback = [];

    switch (pose) {
        case 'mountain':
            // Check for narrow stance and centered position
            if (poseData.stanceWidth < 0.3) {
                accuracy += 20;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '雙腳位置正確' : 'Feet position correct' });
            } else {
                feedback.push({ type: 'improve', text: currentLang === 'zh' ? '雙腳併攏一些' : 'Bring feet closer' });
            }

            if (poseData.symmetry > 0.8) {
                accuracy += 20;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '身體對稱良好' : 'Good body symmetry' });
            }

            if (Math.abs(poseData.centerX - 0.5) < 0.1) {
                accuracy += 10;
            }
            break;

        case 'tree':
            // Check for asymmetric stance (one leg lifted)
            if (poseData.symmetry < 0.7) {
                accuracy += 25;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '單腳站立姿勢正確' : 'One-leg stance correct' });
            } else {
                feedback.push({ type: 'improve', text: currentLang === 'zh' ? '抬起一腳放在大腿內側' : 'Lift one foot to inner thigh' });
            }

            if (Math.abs(poseData.centerX - 0.5) < 0.15) {
                accuracy += 15;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '平衡保持良好' : 'Good balance' });
            }
            break;

        case 'warrior':
            // Check for wide stance
            if (poseData.stanceWidth > 0.4) {
                accuracy += 25;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '雙腳距離正確' : 'Leg distance correct' });
            } else {
                feedback.push({ type: 'improve', text: currentLang === 'zh' ? '雙腳張開更寬' : 'Widen your stance' });
            }

            if (poseData.bodyWidth > 0.5) {
                accuracy += 15;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '手臂延展良好' : 'Arms extended well' });
            }
            break;

        case 'triangle':
            // Check for wide stance and lateral bend
            if (poseData.stanceWidth > 0.35) {
                accuracy += 20;
            }

            if (poseData.symmetry < 0.6) {
                accuracy += 20;
                feedback.push({ type: 'good', text: currentLang === 'zh' ? '側彎角度正確' : 'Side bend angle correct' });
            } else {
                feedback.push({ type: 'improve', text: currentLang === 'zh' ? '上身更往側邊彎曲' : 'Bend more to the side' });
            }
            break;
    }

    // Add pose-specific tips if needed
    if (feedback.length < 2) {
        feedback.push({
            type: 'good',
            text: poses[pose].tips[currentLang][Math.floor(Math.random() * 3)]
        });
    }

    return { accuracy: Math.min(100, accuracy), feedback };
}

function updateDisplay(evaluation) {
    // Update accuracy circle
    document.getElementById('accuracyValue').textContent = evaluation.accuracy;
    const circumference = 283;
    const offset = circumference - (evaluation.accuracy / 100) * circumference;
    document.getElementById('accuracyFill').style.strokeDashoffset = offset;

    // Update status
    let status;
    if (evaluation.accuracy >= 80) {
        status = currentLang === 'zh' ? '非常好！' : 'Excellent!';
    } else if (evaluation.accuracy >= 60) {
        status = currentLang === 'zh' ? '做得好！' : 'Good job!';
    } else {
        status = currentLang === 'zh' ? '繼續調整' : 'Keep adjusting';
    }
    document.getElementById('accuracyStatus').textContent = status;

    // Update feedback
    document.getElementById('feedbackBox').innerHTML = evaluation.feedback.map(f => `
        <div class="feedback-item ${f.type}">
            ${f.type === 'good' ? '✓' : '→'} ${f.text}
        </div>
    `).join('');
}

function changePose() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    currentPose = null;
    document.getElementById('practiceSection').style.display = 'none';
    document.getElementById('poseSelect').style.display = 'block';
}

init();
