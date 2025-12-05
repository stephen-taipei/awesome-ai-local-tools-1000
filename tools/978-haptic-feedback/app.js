const shortVibrateBtn = document.getElementById('short-vibrate');
const longVibrateBtn = document.getElementById('long-vibrate');
const pulseVibrateBtn = document.getElementById('pulse-vibrate');
const sosVibrateBtn = document.getElementById('sos-vibrate');
const supportMessage = document.getElementById('support-message');
const disclaimer = document.getElementById('disclaimer');

// Check for Vibration API support
if (!window.navigator || !window.navigator.vibrate) {
    supportMessage.textContent = "Your browser or device does not support the Vibration API.";
    disclaimer.classList.remove('hidden');
    // Disable buttons if not supported
    shortVibrateBtn.disabled = true;
    longVibrateBtn.disabled = true;
    pulseVibrateBtn.disabled = true;
    sosVibrateBtn.disabled = true;
} else {
    supportMessage.textContent = "Tap the buttons below to experience different haptic feedback patterns. (Note: This feature typically works on mobile devices with vibration support.)";
    disclaimer.classList.add('hidden'); // Hide if supported
}


shortVibrateBtn.addEventListener('click', () => {
    if (window.navigator.vibrate) {
        window.navigator.vibrate(100); // Vibrate for 100ms
    }
});

longVibrateBtn.addEventListener('click', () => {
    if (window.navigator.vibrate) {
        window.navigator.vibrate(500); // Vibrate for 500ms
    }
});

pulseVibrateBtn.addEventListener('click', () => {
    if (window.navigator.vibrate) {
        // Vibrate 100ms, pause 50ms, vibrate 100ms
        window.navigator.vibrate([100, 50, 100]); 
    }
});

sosVibrateBtn.addEventListener('click', () => {
    if (window.navigator.vibrate) {
        // SOS pattern: 3 short, 3 long, 3 short
        window.navigator.vibrate([
            100, 100, 100, 100, 100, 100, // S S S (short, pause, short, pause, short, pause)
            300, 100, 300, 100, 300, 100, // O O O (long, pause, long, pause, long, pause)
            100, 100, 100, 100, 100, 100  // S S S
        ]);
    }
});
