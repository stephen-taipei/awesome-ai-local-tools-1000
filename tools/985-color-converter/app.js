// Color Code Converter - Tool #985
// Convert colors between different formats locally

(function() {
    'use strict';

    // DOM Elements
    const colorPicker = document.getElementById('color-picker');
    const colorPreview = document.getElementById('color-preview');
    const hexQuickInput = document.getElementById('hex-quick-input');
    const hexValue = document.getElementById('hex-value');
    const rgbValue = document.getElementById('rgb-value');
    const rgbaValue = document.getElementById('rgba-value');
    const alphaValue = document.getElementById('alpha-value');
    const hslValue = document.getElementById('hsl-value');
    const hsvValue = document.getElementById('hsv-value');
    const cmykValue = document.getElementById('cmyk-value');
    const cssVar = document.getElementById('css-var');
    const rSlider = document.getElementById('r-slider');
    const gSlider = document.getElementById('g-slider');
    const bSlider = document.getElementById('b-slider');
    const rValue = document.getElementById('r-value');
    const gValue = document.getElementById('g-value');
    const bValue = document.getElementById('b-value');
    const colorPalette = document.getElementById('color-palette');
    const shadesTints = document.getElementById('shades-tints');
    const copyBtns = document.querySelectorAll('.copy-btn');

    // Color harmony elements
    const complementary = document.getElementById('complementary');
    const triadic1 = document.getElementById('triadic1');
    const triadic2 = document.getElementById('triadic2');
    const splitComp = document.getElementById('split-comp');

    let currentColor = { r: 79, g: 70, b: 229, a: 1 };

    // ========== Color Conversion Functions ==========

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return { r, g, b };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

    function rgbToCmyk(r, g, b) {
        if (r === 0 && g === 0 && b === 0) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }
        r /= 255; g /= 255; b /= 255;
        const k = 1 - Math.max(r, g, b);
        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }

    // ========== Update Functions ==========

    function updateAllFormats() {
        const { r, g, b, a } = currentColor;

        // Update preview
        colorPreview.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        colorPicker.value = rgbToHex(r, g, b);

        // Update HEX
        const hex = rgbToHex(r, g, b);
        hexValue.value = hex;
        hexQuickInput.value = hex;

        // Update RGB
        rgbValue.value = `rgb(${r}, ${g}, ${b})`;
        rgbaValue.value = `rgba(${r}, ${g}, ${b}, ${a})`;

        // Update sliders
        rSlider.value = r;
        gSlider.value = g;
        bSlider.value = b;
        rValue.textContent = r;
        gValue.textContent = g;
        bValue.textContent = b;

        // Update HSL
        const hsl = rgbToHsl(r, g, b);
        hslValue.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        // Update HSV
        const hsv = rgbToHsv(r, g, b);
        hsvValue.value = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;

        // Update CMYK
        const cmyk = rgbToCmyk(r, g, b);
        cmykValue.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

        // Update CSS variable
        cssVar.value = `--color-primary: ${hex};`;

        // Update harmonies
        updateHarmonies(hsl.h, hsl.s, hsl.l);

        // Update shades and tints
        updateShadesTints(hsl.h, hsl.s, hsl.l);
    }

    function updateHarmonies(h, s, l) {
        // Complementary
        const compH = (h + 180) % 360;
        const compRgb = hslToRgb(compH, s, l);
        complementary.style.backgroundColor = rgbToHex(compRgb.r, compRgb.g, compRgb.b);
        complementary.dataset.hex = rgbToHex(compRgb.r, compRgb.g, compRgb.b);

        // Triadic
        const tri1H = (h + 120) % 360;
        const tri2H = (h + 240) % 360;
        const tri1Rgb = hslToRgb(tri1H, s, l);
        const tri2Rgb = hslToRgb(tri2H, s, l);
        triadic1.style.backgroundColor = rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b);
        triadic2.style.backgroundColor = rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b);
        triadic1.dataset.hex = rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b);
        triadic2.dataset.hex = rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b);

        // Split complementary
        const splitH = (h + 150) % 360;
        const splitRgb = hslToRgb(splitH, s, l);
        splitComp.style.backgroundColor = rgbToHex(splitRgb.r, splitRgb.g, splitRgb.b);
        splitComp.dataset.hex = rgbToHex(splitRgb.r, splitRgb.g, splitRgb.b);
    }

    function updateShadesTints(h, s, l) {
        shadesTints.innerHTML = '';
        const steps = 9;

        for (let i = 0; i < steps; i++) {
            const newL = Math.round((i / (steps - 1)) * 100);
            const rgb = hslToRgb(h, s, newL);
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

            const div = document.createElement('div');
            div.className = 'flex-1 h-12 rounded cursor-pointer transition-transform hover:scale-110';
            div.style.backgroundColor = hex;
            div.dataset.hex = hex;
            div.title = hex;
            div.addEventListener('click', () => setColorFromHex(hex));
            shadesTints.appendChild(div);
        }
    }

    function setColorFromHex(hex) {
        const rgb = hexToRgb(hex);
        currentColor.r = rgb.r;
        currentColor.g = rgb.g;
        currentColor.b = rgb.b;
        updateAllFormats();
    }

    function setColorFromRgb(r, g, b) {
        currentColor.r = r;
        currentColor.g = g;
        currentColor.b = b;
        updateAllFormats();
    }

    // ========== Event Listeners ==========

    // Color picker
    colorPicker.addEventListener('input', (e) => {
        setColorFromHex(e.target.value);
    });

    // HEX inputs
    hexQuickInput.addEventListener('input', (e) => {
        const hex = e.target.value;
        if (/^#?[0-9A-Fa-f]{6}$/.test(hex.replace('#', ''))) {
            setColorFromHex(hex);
        }
    });

    hexValue.addEventListener('input', (e) => {
        const hex = e.target.value;
        if (/^#?[0-9A-Fa-f]{6}$/.test(hex.replace('#', ''))) {
            setColorFromHex(hex);
        }
    });

    // RGB sliders
    [rSlider, gSlider, bSlider].forEach(slider => {
        slider.addEventListener('input', () => {
            setColorFromRgb(
                parseInt(rSlider.value),
                parseInt(gSlider.value),
                parseInt(bSlider.value)
            );
        });
    });

    // Alpha
    alphaValue.addEventListener('input', (e) => {
        currentColor.a = parseFloat(e.target.value) || 1;
        updateAllFormats();
    });

    // RGB input parsing
    rgbValue.addEventListener('input', (e) => {
        const match = e.target.value.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (match) {
            setColorFromRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        }
    });

    // HSL input parsing
    hslValue.addEventListener('input', (e) => {
        const match = e.target.value.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
        if (match) {
            const rgb = hslToRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
            setColorFromRgb(rgb.r, rgb.g, rgb.b);
        }
    });

    // Harmony color clicks
    [complementary, triadic1, triadic2, splitComp].forEach(el => {
        el.addEventListener('click', () => {
            if (el.dataset.hex) {
                setColorFromHex(el.dataset.hex);
                showNotification('Color applied', 'success');
            }
        });
    });

    // Copy buttons
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const format = btn.dataset.format;
            let value = '';

            switch (format) {
                case 'hex': value = hexValue.value; break;
                case 'rgb': value = rgbValue.value; break;
                case 'rgba': value = rgbaValue.value; break;
                case 'hsl': value = hslValue.value; break;
                case 'hsv': value = hsvValue.value; break;
                case 'cmyk': value = cmykValue.value; break;
                case 'css-var': value = cssVar.value; break;
            }

            try {
                await navigator.clipboard.writeText(value);
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 1000);
                showNotification('Copied: ' + value, 'success');
            } catch (e) {
                showNotification('Failed to copy', 'error');
            }
        });
    });

    // ========== Initialize Palette ==========

    const presetColors = [
        '#EF4444', '#F97316', '#F59E0B', '#EAB308',
        '#84CC16', '#22C55E', '#10B981', '#14B8A6',
        '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
        '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
        '#F43F5E', '#78716C', '#71717A', '#64748B',
        '#000000', '#FFFFFF', '#1F2937', '#F3F4F6'
    ];

    presetColors.forEach(color => {
        const div = document.createElement('div');
        div.className = 'w-6 h-6 rounded cursor-pointer transition-transform hover:scale-125 border border-gray-200';
        div.style.backgroundColor = color;
        div.title = color;
        div.addEventListener('click', () => {
            setColorFromHex(color);
            showNotification('Color selected', 'success');
        });
        colorPalette.appendChild(div);
    });

    // ========== Utility Functions ==========

    function showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Initialize
    updateAllFormats();

})();
