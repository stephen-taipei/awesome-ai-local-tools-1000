/**
 * Tool #096: Gradient Generator
 * Create beautiful CSS gradients
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const gradientType = document.getElementById('gradientType');
    const angle = document.getElementById('angle');
    const angleVal = document.getElementById('angleVal');
    const colorStops = document.getElementById('colorStops');
    const codeBox = document.getElementById('codeBox');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const addColorBtn = document.getElementById('addColorBtn');
    const randomBtn = document.getElementById('randomBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    let colors = [
        { color: '#f5af19', position: 0 },
        { color: '#f12711', position: 100 }
    ];

    // Event listeners
    gradientType.addEventListener('change', generateGradient);
    angle.addEventListener('input', () => { angleVal.textContent = angle.value; generateGradient(); });
    widthInput.addEventListener('change', generateGradient);
    heightInput.addEventListener('change', generateGradient);
    addColorBtn.addEventListener('click', addColor);
    randomBtn.addEventListener('click', randomize);
    downloadBtn.addEventListener('click', download);
    copyBtn.addEventListener('click', copyCSS);

    // Initial render
    renderColorStops();
    generateGradient();

    function renderColorStops() {
        colorStops.innerHTML = '';
        colors.sort((a, b) => a.position - b.position);

        colors.forEach((stop, idx) => {
            const div = document.createElement('div');
            div.className = 'color-stop';

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = stop.color;
            colorInput.addEventListener('input', (e) => {
                colors[idx].color = e.target.value;
                generateGradient();
            });

            const posInput = document.createElement('input');
            posInput.type = 'number';
            posInput.min = 0;
            posInput.max = 100;
            posInput.value = stop.position;
            posInput.addEventListener('input', (e) => {
                colors[idx].position = parseInt(e.target.value) || 0;
                generateGradient();
            });

            const posLabel = document.createElement('span');
            posLabel.textContent = '%';

            div.appendChild(colorInput);
            div.appendChild(posInput);
            div.appendChild(posLabel);

            if (colors.length > 2) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-stop';
                removeBtn.textContent = 'x';
                removeBtn.addEventListener('click', () => {
                    colors.splice(idx, 1);
                    renderColorStops();
                    generateGradient();
                });
                div.appendChild(removeBtn);
            }

            colorStops.appendChild(div);
        });
    }

    function generateGradient() {
        const w = parseInt(widthInput.value);
        const h = parseInt(heightInput.value);
        const type = gradientType.value;
        const deg = parseInt(angle.value);

        canvas.width = w;
        canvas.height = h;

        let gradient;

        if (type === 'linear') {
            const rad = (deg - 90) * Math.PI / 180;
            const x1 = w / 2 - Math.cos(rad) * w;
            const y1 = h / 2 - Math.sin(rad) * h;
            const x2 = w / 2 + Math.cos(rad) * w;
            const y2 = h / 2 + Math.sin(rad) * h;
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        } else if (type === 'radial') {
            gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
        } else if (type === 'conic') {
            gradient = ctx.createConicGradient(deg * Math.PI / 180, w / 2, h / 2);
        }

        colors.forEach(stop => {
            gradient.addColorStop(stop.position / 100, stop.color);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        updateCodeBox();
    }

    function updateCodeBox() {
        const type = gradientType.value;
        const deg = angle.value;

        const colorString = colors.map(s => `${s.color} ${s.position}%`).join(', ');

        let css;
        if (type === 'linear') {
            css = `background: linear-gradient(${deg}deg, ${colorString});`;
        } else if (type === 'radial') {
            css = `background: radial-gradient(circle, ${colorString});`;
        } else {
            css = `background: conic-gradient(from ${deg}deg, ${colorString});`;
        }

        codeBox.innerHTML = `<span>/* CSS Code */</span>\n${css}`;
    }

    function addColor() {
        const lastPos = colors[colors.length - 1].position;
        const newPos = Math.min(100, lastPos + 10);
        colors.push({
            color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
            position: newPos
        });
        renderColorStops();
        generateGradient();
    }

    function randomize() {
        const numColors = Math.floor(Math.random() * 3) + 2;
        colors = [];

        for (let i = 0; i < numColors; i++) {
            colors.push({
                color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                position: Math.round(i / (numColors - 1) * 100)
            });
        }

        angle.value = Math.floor(Math.random() * 360);
        angleVal.textContent = angle.value;

        const types = ['linear', 'radial', 'conic'];
        gradientType.value = types[Math.floor(Math.random() * types.length)];

        renderColorStops();
        generateGradient();
    }

    function download() {
        const link = document.createElement('a');
        link.download = 'gradient.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function copyCSS() {
        const type = gradientType.value;
        const deg = angle.value;
        const colorString = colors.map(s => `${s.color} ${s.position}%`).join(', ');

        let css;
        if (type === 'linear') {
            css = `background: linear-gradient(${deg}deg, ${colorString});`;
        } else if (type === 'radial') {
            css = `background: radial-gradient(circle, ${colorString});`;
        } else {
            css = `background: conic-gradient(from ${deg}deg, ${colorString});`;
        }

        navigator.clipboard.writeText(css).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy CSS | 複製';
            }, 2000);
        });
    }
});
