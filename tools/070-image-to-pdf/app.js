/**
 * Tool #070: Image to PDF
 * Combine multiple images into a single PDF
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const imagesContainer = document.getElementById('imagesContainer');
    const options = document.getElementById('options');
    const pageSizeSelect = document.getElementById('pageSize');
    const orientationSelect = document.getElementById('orientation');
    const marginSelect = document.getElementById('margin');
    const createPdfBtn = document.getElementById('createPdfBtn');
    const clearBtn = document.getElementById('clearBtn');
    const previewSection = document.getElementById('previewSection');
    const pdfPreview = document.getElementById('pdfPreview');

    let images = [];

    // Page sizes in mm
    const pageSizes = {
        a4: [210, 297],
        letter: [215.9, 279.4],
        a3: [297, 420],
        a5: [148, 210]
    };

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
    imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
    createPdfBtn.addEventListener('click', createPDF);
    clearBtn.addEventListener('click', clearAll);

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    images.push({
                        src: e.target.result,
                        width: img.width,
                        height: img.height,
                        name: file.name
                    });
                    updateDisplay();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function updateDisplay() {
        if (images.length === 0) {
            imagesContainer.innerHTML = '<p class="empty-hint">Drag and drop to reorder pages | 拖放以重新排列頁面</p>';
            options.style.display = 'none';
            createPdfBtn.style.display = 'none';
            clearBtn.style.display = 'none';
            previewSection.style.display = 'none';
            return;
        }

        imagesContainer.innerHTML = '';
        images.forEach((img, index) => {
            const div = document.createElement('div');
            div.className = 'image-item';
            div.draggable = true;
            div.dataset.index = index;
            div.innerHTML = `
                <img src="${img.src}" alt="Page ${index + 1}">
                <span class="page-num">${index + 1}</span>
                <button class="remove-btn" onclick="removeImage(${index})">×</button>
            `;
            imagesContainer.appendChild(div);
        });

        options.style.display = 'flex';
        createPdfBtn.style.display = 'inline-block';
        clearBtn.style.display = 'inline-block';

        enableDragReorder();
    }

    function enableDragReorder() {
        const items = imagesContainer.querySelectorAll('.image-item');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.index);
                item.style.opacity = '0.5';
            });
            item.addEventListener('dragend', () => item.style.opacity = '1');
            item.addEventListener('dragover', (e) => e.preventDefault());
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = parseInt(item.dataset.index);
                if (fromIndex !== toIndex) {
                    const temp = images[fromIndex];
                    images.splice(fromIndex, 1);
                    images.splice(toIndex, 0, temp);
                    updateDisplay();
                }
            });
        });
    }

    window.removeImage = function(index) {
        images.splice(index, 1);
        updateDisplay();
    };

    function clearAll() {
        images = [];
        updateDisplay();
    }

    function createPDF() {
        if (images.length === 0) return;

        const pageSize = pageSizeSelect.value;
        const orientation = orientationSelect.value;
        const margin = parseInt(marginSelect.value);

        // Check if jsPDF is available
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            createPDFManual(pageSize, orientation, margin);
            return;
        }

        const { jsPDF } = window.jspdf || { jsPDF: window.jsPDF };

        let pdf = null;

        images.forEach((img, index) => {
            let pageWidth, pageHeight;

            if (pageSize === 'fit') {
                // Use image dimensions (convert pixels to mm, assuming 96 DPI)
                pageWidth = img.width * 25.4 / 96;
                pageHeight = img.height * 25.4 / 96;
            } else {
                [pageWidth, pageHeight] = pageSizes[pageSize];
            }

            // Determine orientation
            let orient = orientation;
            if (orient === 'auto') {
                orient = img.width > img.height ? 'landscape' : 'portrait';
            }

            if (orient === 'landscape' && pageSize !== 'fit') {
                [pageWidth, pageHeight] = [pageHeight, pageWidth];
            }

            if (index === 0) {
                pdf = new jsPDF({
                    orientation: orient === 'landscape' ? 'l' : 'p',
                    unit: 'mm',
                    format: pageSize === 'fit' ? [pageWidth, pageHeight] : pageSize
                });
            } else {
                pdf.addPage(pageSize === 'fit' ? [pageWidth, pageHeight] : pageSize,
                           orient === 'landscape' ? 'l' : 'p');
            }

            // Calculate image dimensions to fit page with margin
            const availWidth = pageWidth - 2 * margin;
            const availHeight = pageHeight - 2 * margin;
            const scale = Math.min(availWidth / (img.width * 25.4 / 96),
                                   availHeight / (img.height * 25.4 / 96));
            const imgWidth = img.width * 25.4 / 96 * scale;
            const imgHeight = img.height * 25.4 / 96 * scale;
            const x = margin + (availWidth - imgWidth) / 2;
            const y = margin + (availHeight - imgHeight) / 2;

            pdf.addImage(img.src, 'JPEG', x, y, imgWidth, imgHeight);
        });

        // Generate preview and download
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        pdfPreview.src = pdfUrl;
        previewSection.style.display = 'block';

        // Auto download
        const link = document.createElement('a');
        link.download = 'images.pdf';
        link.href = pdfUrl;
        link.click();
    }

    function createPDFManual(pageSize, orientation, margin) {
        // Fallback when jsPDF is not available
        alert('PDF library not loaded. Please try again or check your internet connection. | PDF 庫未加載，請重試或檢查網絡連接。');

        // Create a printable HTML page as fallback
        const printWindow = window.open('', '_blank');
        let html = `<!DOCTYPE html><html><head><title>PDF Preview</title>
            <style>
                @media print { @page { size: ${pageSize === 'letter' ? 'letter' : 'A4'} ${orientation === 'landscape' ? 'landscape' : 'portrait'}; margin: ${margin}mm; } }
                body { margin: 0; padding: 0; }
                .page { page-break-after: always; display: flex; align-items: center; justify-content: center; height: 100vh; }
                .page:last-child { page-break-after: avoid; }
                .page img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
        </head><body>`;

        images.forEach(img => {
            html += `<div class="page"><img src="${img.src}"></div>`;
        });

        html += '</body></html>';
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }
});
