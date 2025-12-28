/**
 * Tool #056: EXIF Reader
 */
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const ctx = preview.getContext('2d');
    const results = document.getElementById('results');
    const exportBtn = document.getElementById('exportBtn');

    let exifData = {};

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Display preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const maxW = 300;
                let w = img.width, h = img.height;
                if (w > maxW) { h = (maxW / w) * h; w = maxW; }
                preview.width = w; preview.height = h;
                ctx.drawImage(img, 0, 0, w, h);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);

        // Read EXIF
        exifData = await readExif(file);
        displayExif(exifData);
        results.style.display = 'block';
    });

    exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(exifData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `exif-data-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    });

    async function readExif(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = parseExif(new Uint8Array(e.target.result));
                resolve(data);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function parseExif(buffer) {
        const data = {
            basic: { filename: imageInput.files[0].name, size: (imageInput.files[0].size / 1024).toFixed(1) + ' KB' },
            camera: {},
            photo: {},
            gps: {}
        };

        // Simple EXIF parser - check for JPEG
        if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
            data.basic.format = 'Not a valid JPEG';
            return data;
        }

        data.basic.format = 'JPEG';

        // Find EXIF marker
        let offset = 2;
        while (offset < buffer.length - 4) {
            if (buffer[offset] === 0xFF && buffer[offset + 1] === 0xE1) {
                // Found APP1 (EXIF)
                const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
                // Check for "Exif\0\0"
                if (buffer[offset + 4] === 0x45 && buffer[offset + 5] === 0x78) {
                    data.basic.hasExif = true;
                    // Parse TIFF header
                    const tiffStart = offset + 10;
                    const isLittleEndian = buffer[tiffStart] === 0x49;

                    // Read IFD0
                    const ifdOffset = readUint32(buffer, tiffStart + 4, isLittleEndian);
                    parseIFD(buffer, tiffStart + ifdOffset, tiffStart, isLittleEndian, data);
                }
                break;
            }
            offset++;
        }

        if (!data.basic.hasExif) {
            data.basic.hasExif = false;
            data.basic.note = 'No EXIF data found';
        }

        return data;
    }

    function readUint16(buffer, offset, littleEndian) {
        return littleEndian ? buffer[offset] | (buffer[offset + 1] << 8) : (buffer[offset] << 8) | buffer[offset + 1];
    }

    function readUint32(buffer, offset, littleEndian) {
        return littleEndian ?
            buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24) :
            (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
    }

    function parseIFD(buffer, offset, tiffStart, littleEndian, data) {
        const numEntries = readUint16(buffer, offset, littleEndian);

        for (let i = 0; i < numEntries; i++) {
            const entryOffset = offset + 2 + i * 12;
            const tag = readUint16(buffer, entryOffset, littleEndian);
            const type = readUint16(buffer, entryOffset + 2, littleEndian);
            const count = readUint32(buffer, entryOffset + 4, littleEndian);
            let value = readUint32(buffer, entryOffset + 8, littleEndian);

            // Common tags
            switch (tag) {
                case 0x010F: data.camera.Make = readString(buffer, tiffStart + value, count); break;
                case 0x0110: data.camera.Model = readString(buffer, tiffStart + value, count); break;
                case 0x0112: data.photo.Orientation = value; break;
                case 0x011A: data.photo.XResolution = value; break;
                case 0x011B: data.photo.YResolution = value; break;
                case 0x0132: data.photo.DateTime = readString(buffer, tiffStart + value, count); break;
                case 0x8769: parseIFD(buffer, tiffStart + value, tiffStart, littleEndian, data); break; // ExifIFD
                case 0x829A: data.photo.ExposureTime = readRational(buffer, tiffStart + value, littleEndian); break;
                case 0x829D: data.photo.FNumber = 'f/' + readRational(buffer, tiffStart + value, littleEndian); break;
                case 0x8827: data.photo.ISO = value; break;
                case 0x9003: data.photo.DateTimeOriginal = readString(buffer, tiffStart + value, count); break;
                case 0x920A: data.photo.FocalLength = readRational(buffer, tiffStart + value, littleEndian) + 'mm'; break;
                case 0xA002: data.photo.ImageWidth = value; break;
                case 0xA003: data.photo.ImageHeight = value; break;
            }
        }
    }

    function readString(buffer, offset, length) {
        let str = '';
        for (let i = 0; i < length - 1 && buffer[offset + i]; i++) {
            str += String.fromCharCode(buffer[offset + i]);
        }
        return str;
    }

    function readRational(buffer, offset, littleEndian) {
        const num = readUint32(buffer, offset, littleEndian);
        const den = readUint32(buffer, offset + 4, littleEndian);
        return den ? (num / den).toFixed(2) : num;
    }

    function displayExif(data) {
        // Basic info
        document.getElementById('basicInfo').innerHTML = `
            <h3>📄 Basic Info</h3>
            <p><strong>File:</strong> ${data.basic.filename}</p>
            <p><strong>Size:</strong> ${data.basic.size}</p>
            <p><strong>Format:</strong> ${data.basic.format}</p>
            <p><strong>Has EXIF:</strong> ${data.basic.hasExif ? 'Yes' : 'No'}</p>
        `;

        // Camera
        if (Object.keys(data.camera).length > 0) {
            document.getElementById('cameraSection').style.display = 'block';
            document.getElementById('cameraTable').innerHTML = Object.entries(data.camera)
                .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
        }

        // Photo
        if (Object.keys(data.photo).length > 0) {
            document.getElementById('photoSection').style.display = 'block';
            document.getElementById('photoTable').innerHTML = Object.entries(data.photo)
                .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
        }
    }
});
