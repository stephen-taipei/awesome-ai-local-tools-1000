const spotlight = document.getElementById('focus-spotlight');
const highContrastToggle = document.getElementById('high-contrast-toggle');

// Configuration
let isHighContrast = false;

// Update spotlight position and size
function updateSpotlight() {
    const activeElement = document.activeElement;

    // Don't highlight the body or html or nothing
    if (!activeElement || activeElement === document.body || activeElement === document.documentElement) {
        spotlight.style.opacity = '0';
        return;
    }

    // Get position
    const rect = activeElement.getBoundingClientRect();
    
    // Check if the element is actually visible
    if (rect.width === 0 && rect.height === 0) {
        spotlight.style.opacity = '0';
        return;
    }

    // Account for scrolling
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Apply styles
    spotlight.style.width = `${rect.width + 8}px`; // Add padding
    spotlight.style.height = `${rect.height + 8}px`;
    spotlight.style.transform = `translate(${rect.left + scrollX - 4}px, ${rect.top + scrollY - 4}px)`;
    spotlight.style.opacity = '1';
}

// Event Listeners for Focus
document.addEventListener('focusin', updateSpotlight);
document.addEventListener('focusout', () => {
    // Delay slightly to check if focus moved to another element immediately
    setTimeout(() => {
        if (document.activeElement === document.body) {
            spotlight.style.opacity = '0';
        }
    }, 50);
});

// Update on scroll and resize
window.addEventListener('scroll', updateSpotlight, { passive: true });
window.addEventListener('resize', updateSpotlight, { passive: true });

// Toggle High Contrast Mode
highContrastToggle.addEventListener('change', (e) => {
    isHighContrast = e.target.checked;
    if (isHighContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
    // Force update
    updateSpotlight();
});

// Initial check
updateSpotlight();
