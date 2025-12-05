const dropZone = document.getElementById('drop-zone');
const audioInput = document.getElementById('audio-input');
const playerUI = document.getElementById('player-ui');
const fileName = document.getElementById('file-name');
const playBtn = document.getElementById('play-btn');
const speedControl = document.getElementById('speed-control');
const speedVal = document.getElementById('speed-val');
const progressBar = document.getElementById('progress-bar');
const timeDisplay = document.getElementById('time-display');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioCtx;
let audioSource;
let analyzer;
let audioElement;
let isPlaying = false;
let animationId;

// Initialize Audio Context on user gesture
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Handle File Upload
dropZone.addEventListener('click', () => audioInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-pink-500');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-pink-500'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-pink-500');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
        loadAudio(file);
    }
});
audioInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadAudio(file);
});

function loadAudio(file) {
    initAudio();
    
    if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
    }

    fileName.textContent = file.name;
    const url = URL.createObjectURL(file);
    
    audioElement = new Audio(url);
    audioElement.crossOrigin = "anonymous";
    
    // Audio Node Setup
    if (audioSource) audioSource.disconnect();
    audioSource = audioCtx.createMediaElementSource(audioElement);
    analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 256;
    
    audioSource.connect(analyzer);
    analyzer.connect(audioCtx.destination); // Connect to speakers

    // UI Show
    dropZone.classList.add('hidden');
    playerUI.classList.remove('hidden');

    // Events
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('loadedmetadata', () => {
        progressBar.max = audioElement.duration;
        updateTime();
    });
    audioElement.addEventListener('ended', () => {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play ml-1"></i>';
        progressBar.value = 0;
    });
    
    // Set initial speed
    audioElement.playbackRate = parseFloat(speedControl.value);
}

// Play/Pause
playBtn.addEventListener('click', () => {
    if (!audioElement) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (isPlaying) {
        audioElement.pause();
        playBtn.innerHTML = '<i class="fas fa-play ml-1"></i>';
        cancelAnimationFrame(animationId);
    } else {
        audioElement.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        drawVisualizer();
    }
    isPlaying = !isPlaying;
});

// Speed Control
speedControl.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    speedVal.textContent = speed.toFixed(1) + 'x';
    if (audioElement) {
        audioElement.playbackRate = speed;
    }
});

// Progress Bar
progressBar.addEventListener('input', (e) => {
    if (audioElement) {
        audioElement.currentTime = e.target.value;
    }
});

function updateProgress() {
    progressBar.value = audioElement.currentTime;
    updateTime();
}

function updateTime() {
    const current = formatTime(audioElement.currentTime);
    const duration = formatTime(audioElement.duration || 0);
    timeDisplay.textContent = `${current} / ${duration}`;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Visualizer
function drawVisualizer() {
    if (!isPlaying) return;
    
    animationId = requestAnimationFrame(drawVisualizer);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyzer.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#db2777'); // Pink
        gradient.addColorStop(1, '#9333ea'); // Purple
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}
