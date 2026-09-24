#!/usr/bin/env python3
"""Idempotent repair of known patterns in the audited 2026-09-24 snapshot.
Generated changes are committed as ordinary source, not applied in visitors' browsers.
"""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / 'tools'

def write(path, content):
    if path.read_text() != content:
        path.write_text(content)

def replace_function(source, name, replacement):
    pattern = rf'(?:async )?function {re.escape(name)}\([^\n]*\) \{{.*?\n\}}'
    result, count = re.subn(pattern, lambda _: replacement.rstrip(), source, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f'Cannot find function {name}')
    return result

def inject_script(source, name):
    tag = f'<script src="../shared/{name}"></script>'
    if tag in source:
        return source
    pattern = r'<script\b[^>]*\bsrc=[\'\"](?:\./)?app\.js[\'\"][^>]*>'
    if not re.search(pattern, source):
        raise RuntimeError('Missing app.js script slot')
    return re.sub(pattern, lambda match: tag + '\n    ' + match[0], source, count=1)

placeholder_slugs, speech_slugs, model_slugs = [], [], []
manual_demos = {'202-audio-file-transcription', '047-age-transformation', '048-portrait-anime', '049-expression-editing', '492-image-tagging'}
for directory in sorted(TOOLS.iterdir()):
    app, page = directory / 'app.js', directory / 'index.html'
    if not app.is_file() or not page.is_file():
        continue
    js, markup = app.read_text(), page.read_text()
    markup = markup.replace('"/vendor/', '"../../vendor/').replace("'/vendor/", "'../../vendor/")
    js = js.replace("'/vendor/", "'../../vendor/").replace('"/vendor/', '"../../vendor/')
    markup = re.sub(r'(href=[\'\"])(?:\.\./index\.html|\.\./)([\'\"])', r'\1../../index.html\2', markup)
    status = None
    if 'Analysis complete:' in js or 'IMPLEMENTATION_PENDING' in js:
        placeholder_slugs.append(directory.name)
        status = 'placeholder'
        js = replace_function(js, 'processText', '''function processText(text) {
    // IMPLEMENTATION_PENDING: no task-specific model or algorithm is implemented.
    return lang === 'en'
        ? 'Not implemented. This page does not perform the advertised analysis.'
        : '功能尚未實作；此頁無法執行標題描述的分析。';
}''')
    native = 'window.SpeechRecognition || window.webkitSpeechRecognition'
    if native in js or 'LocalSpeech.getConstructor()' in js:
        speech_slugs.append(directory.name)
        js = js.replace(native, 'window.LocalSpeech.getConstructor()')
        js = js.replace('navigator.mediaDevices.getUserMedia({ audio: true })', 'window.LocalSpeech.captureMicrophone()')
        if 'function stopVisualization() {\n    window.LocalSpeech' not in js:
            js = js.replace('function stopVisualization() {', 'function stopVisualization() {\n    window.LocalSpeech.releaseMicrophones();')
        js = js.replace('if (audioContext) audioContext.close();', "if (audioContext && audioContext.state !== 'closed') void audioContext.close().catch(() => {});")
        js = js.replace('        audioContext.close();', "        if (audioContext.state !== 'closed') void audioContext.close().catch(() => {});")
        js = re.sub(r'^\s*startVisualization\(\);\s*$', '', js, flags=re.M)
        markup = inject_script(markup, 'local-speech.js')
        status = 'speech'
    if 'from_pretrained' in js or re.search(r'pipeline\([\'\"]', js):
        model_slugs.append(directory.name)
    if directory.name in manual_demos:
        status = 'demo'
    if directory.name == '202-audio-file-transcription':
        if not re.search(r'id="transcribeBtn"[^>]*disabled', markup):
            markup = re.sub(r'(<button\b[^>]*\bid="transcribeBtn")', r'\1 disabled', markup)
        js = re.sub(r'(transcribeBtn\.disabled\s*=\s*)false', r'\1true', js)
    if directory.name == '993-api-tester':
        status = 'network'
    if status:
        if 'data-implementation=' in markup:
            markup = re.sub(r'data-implementation="[^"]*"', f'data-implementation="{status}"', markup)
        else:
            markup = markup.replace('<body', f'<body data-implementation="{status}"', 1)
        markup = inject_script(markup, 'tool-status.js')
    write(app, js)
    write(page, markup)

# Homepage head reference only; protected body and CSS remain untouched.
p = ROOT / 'index.html'
write(p, p.read_text().replace('href="/llms.txt"', 'href="./llms.txt"'))

# #999: syntax, safe output and correct independent function accounting.
p = TOOLS / '999-code-complexity-analysis/app.js'
s = replace_function(p.read_text(), 'analyzeCode', '''function analyzeCode() {
    const code = codeInput.value;
    if (!code.trim()) return;
    try {
        const ast = esprima.parseScript(code, { loc: true });
        const result = ComplexityCore.analyze(ast);
        metricLoc.textContent = code.split('\\n').length;
        metricFunctions.textContent = result.functionCount;
        metricNesting.textContent = result.maxNesting;
        metricCyclo.textContent = result.maxComplexity;
        updateScoreCircle(result.maxComplexity);
        updateDetailsList(result.details);
    } catch (error) {
        alert('Error parsing code: ' + error.message);
    }
}''')
s = replace_function(s, 'updateDetailsList', '''function updateDetailsList(details) {
    detailsList.replaceChildren();
    if (!details.length) {
        const empty = document.createElement('li');
        empty.className = 'px-4 py-3 text-gray-500 text-center italic';
        empty.textContent = 'No functions found.';
        detailsList.appendChild(empty);
        return;
    }
    [...details].sort((a, b) => b.complexity - a.complexity).forEach(func => {
        const li = document.createElement('li');
        li.className = 'px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors';
        const name = document.createElement('span');
        name.className = 'font-medium text-gray-700';
        name.textContent = `${func.name} — Line ${func.line}`;
        const badge = document.createElement('span');
        const color = func.complexity > 10 ? 'bg-red-100 text-red-800' : func.complexity > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
        badge.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`;
        badge.textContent = `CC: ${func.complexity}`;
        li.append(name, badge);
        detailsList.appendChild(li);
    });
}''')
write(p, s)
p = TOOLS / '999-code-complexity-analysis/index.html'
write(p, inject_script(p.read_text(), 'complexity-core.js'))

# #991: sanitize both preview and exported HTML; no passive remote images.
p = TOOLS / '991-markdown-preview/app.js'
s = p.read_text()
if 'function safeMarkdown' not in s:
    s = re.sub(r'    marked\.setOptions\(\{.*?\n    \}\);', '''    marked.setOptions({ breaks: true, gfm: true });
    function safeMarkdown(value) {
        return DOMPurify.sanitize(marked.parse(value), {
            ALLOWED_TAGS: ['p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'del', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'span'],
            ALLOWED_ATTR: ['href', 'title', 'class'],
            ALLOW_DATA_ATTR: false,
            FORBID_TAGS: ['style', 'script', 'svg', 'math', 'img', 'iframe', 'object', 'embed', 'form'],
            FORBID_ATTR: ['style', 'src', 'srcset', 'id', 'name']
        });
    }''', s, count=1, flags=re.S)
s = s.replace('const html = marked.parse(markdown);', 'const html = safeMarkdown(markdown);')
s = s.replace('const html = marked.parse(mdInput.value);', 'const html = safeMarkdown(mdInput.value);')
s = s.replace("editorContainer.style.gridTemplateColumns = '1fr 1fr';", "editorContainer.style.gridTemplateColumns = '';")
a = s.index('            } else if (format.line) {') + len('            } else if (format.line) {\n')
b = s.index('            } else if (format.block)', a)
s = s[:a] + '''                const lineStart = start === 0 ? 0 : text.lastIndexOf('\\n', start - 1) + 1;
                const lineEnd = text.indexOf('\\n', Math.max(start, end - 1));
                const stop = lineEnd < 0 ? text.length : lineEnd;
                const lines = text.slice(lineStart, stop).split('\\n');
                const formatted = lines.map(line => format.prefix + (line || format.placeholder)).join('\\n');
                newText = text.slice(0, lineStart) + formatted + text.slice(stop);
                newCursorPos = start + format.prefix.length;
''' + s[b:]
write(p, s)
p = TOOLS / '991-markdown-preview/index.html'
s = p.read_text()
if 'dompurify/purify.min.js' not in s:
    s = s.replace('<script src="app.js"', '<script src="../../vendor/dompurify/purify.min.js"></script>\n    <script src="app.js"')
if 'id="markdown-privacy-note"' not in s:
    s = s.replace('<main', '<p id="markdown-privacy-note" class="mx-auto max-w-7xl px-4 pt-4 text-sm">Preview and exported HTML omit images and embedded documents to prevent passive external requests.</p>\n    <main', 1)
write(p, s)

# Speech recognition output is text, not HTML.
p = TOOLS / '201-real-time-transcription/app.js'
s = replace_function(p.read_text(), 'updateTranscript', '''function updateTranscript() {
    window.LocalSpeech.renderText(transcriptContent, finalTranscript || translations[currentLang].placeholder, interimTranscript);
    updateWordCount();
}''')
write(p, s)
for slug in ['203-multilingual-stt', '210-accent-adapted-recognition']:
    p = TOOLS / slug / 'app.js'
    s = p.read_text().replace("transcriptContent.innerHTML = transcript + '<span style=\"color:#999\">' + interim + '</span>';", 'window.LocalSpeech.renderText(transcriptContent, transcript, interim);')
    write(p, s)
p = TOOLS / '204-meeting-transcription/app.js'
s = replace_function(p.read_text(), 'renderParticipants', '''function renderParticipants() {
    const list = document.getElementById('participantList');
    list.replaceChildren();
    participants.forEach((participant, index) => {
        const row = document.createElement('div'); row.className = 'participant';
        const label = document.createElement('span'); label.textContent = participant;
        const remove = document.createElement('button');
        remove.type = 'button'; remove.className = 'remove'; remove.textContent = 'x';
        remove.setAttribute('aria-label', `Remove ${participant}`);
        remove.addEventListener('click', () => window.removeParticipant(index));
        row.append(label, remove); list.append(row);
    });
}''')
s = replace_function(s, 'renderTranscript', '''function renderTranscript() {
    const list = document.getElementById('transcriptList');
    list.replaceChildren();
    if (!transcriptEntries.length) {
        const placeholder = document.createElement('p');
        placeholder.className = 'placeholder';
        placeholder.textContent = translations[currentLang].placeholder;
        list.append(placeholder);
    }
    transcriptEntries.forEach(entry => {
        const row = document.createElement('div'); row.className = 'transcript-entry';
        for (const [className, value] of [['transcript-time', `[${entry.time}]`], ['transcript-speaker', entry.speaker], ['transcript-text', entry.text]]) {
            const field = document.createElement('div'); field.className = className;
            field.textContent = value; row.append(field);
        }
        list.append(row);
    });
    list.scrollTop = list.scrollHeight;
}''')
write(p, s)
p = TOOLS / '208-keyword-spotting/app.js'
s = replace_function(p.read_text(), 'renderKeywords', '''function renderKeywords() {
    keywordTags.replaceChildren();
    keywords.forEach(word => {
        const tag = document.createElement('div'); tag.className = 'keyword-tag'; tag.dataset.word = word;
        const label = document.createElement('span'); label.textContent = word;
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = 'x';
        remove.setAttribute('aria-label', `Remove ${word}`);
        remove.addEventListener('click', () => window.removeKeyword(word));
        tag.append(label, remove); keywordTags.append(tag);
    });
}''')
s = s.replace('document.querySelector(`.keyword-tag[data-word="${word}"]`)', "Array.from(keywordTags.children).find(element => element.dataset.word === word)")
s = replace_function(s, 'renderLog', '''function renderLog() {
    logList.replaceChildren();
    if (!detections.length) {
        const placeholder = document.createElement('p'); placeholder.className = 'placeholder';
        placeholder.textContent = translations[currentLang].noDetections; logList.append(placeholder);
    }
    detections.forEach(detection => {
        const row = document.createElement('div'); row.className = 'log-entry';
        const word = document.createElement('span'); word.className = 'keyword'; word.textContent = detection.word;
        const time = document.createElement('span'); time.className = 'time'; time.textContent = detection.time;
        row.append(word, time); logList.append(row);
    });
}''')
write(p, s)

# #001: correct channels, awaited PNG export, stale jobs and object-URL ownership.
p = TOOLS / '001-background-remover/app.js'
s = p.read_text()
if 'jobId: 0' not in s:
    s = s.replace('resultBlob: null', 'resultBlob: null,\n    inputUrl: null,\n    outputUrl: null,\n    jobId: 0,\n    isModelLoading: false')
s = s.replace("performanceDesc: '支援 WebGPU 加速，處理速度可達 2-5 秒/張'", "performanceDesc: '可用時使用 WebGPU，否則使用 WASM；速度依裝置及圖片而異'")
s = s.replace("performanceDesc: 'Supports WebGPU acceleration, processing in 2-5 seconds per image'", "performanceDesc: 'Uses WebGPU when available, otherwise WASM; speed depends on the device and image'")
s = replace_function(s, 'detectAcceleration', '''async function detectAcceleration() {
    if (navigator.gpu) {
        try {
            if (await navigator.gpu.requestAdapter()) {
                elements.accelerationMethod.textContent = t('webgpu');
                return 'webgpu';
            }
        } catch { /* Fall back to the runtime actually used. */ }
    }
    elements.accelerationMethod.textContent = t('wasm');
    return 'wasm';
}''')
s = replace_function(s, 'loadModel', '''async function loadModel() {
    if (state.isModelLoaded || state.isModelLoading) return;
    state.isModelLoading = true;
    setModelStatus('loading');
    elements.progressContainer.style.display = 'block';
    elements.uploadArea.classList.add('disabled');
    try {
        const { AutoModel, AutoProcessor, env, RawImage } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2');
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        if (!globalThis.crossOriginIsolated) env.backends.onnx.wasm.numThreads = 1;
        window.RawImage = RawImage;
        const modelId = 'briaai/RMBG-1.4';
        state.processor = await AutoProcessor.from_pretrained(modelId);
        let device = await detectAcceleration();
        const options = {
            dtype: 'fp32',
            progress_callback: progress => {
                if (progress.status === 'progress' && Number.isFinite(progress.progress)) updateProgress(Math.max(0, Math.min(1, progress.progress / 100)));
            }
        };
        try { state.model = await AutoModel.from_pretrained(modelId, { ...options, device }); }
        catch (error) {
            if (device !== 'webgpu') throw error;
            device = 'wasm';
            state.model = await AutoModel.from_pretrained(modelId, { ...options, device });
        }
        elements.accelerationMethod.textContent = t(device);
        state.isModelLoaded = true;
        setModelStatus('ready');
    } catch (error) {
        state.processor = null;
        state.isModelLoaded = false;
        setModelStatus('error');
        alert(t('modelError') + '\\n\\n' + error.message);
    } finally {
        state.isModelLoading = false;
        elements.progressContainer.style.display = 'none';
    }
}''')
s = replace_function(s, 'processImage', '''async function processImage(imageFile) {
    if (!state.isModelLoaded || state.isProcessing) return;
    const job = ++state.jobId;
    state.isProcessing = true;
    state.resultBlob = null;
    for (const key of ['inputUrl', 'outputUrl']) {
        if (state[key]) URL.revokeObjectURL(state[key]);
        state[key] = null;
    }
    elements.processingOverlay.style.display = 'flex';
    elements.resultImage.style.display = 'none';
    elements.downloadBtn.disabled = true;
    elements.previewArea.setAttribute('aria-busy', 'true');
    try {
        if (imageFile.size > 20 * 1024 * 1024) throw new Error('Maximum file size: 20 MiB.');
        state.inputUrl = URL.createObjectURL(imageFile);
        elements.originalImage.src = state.inputUrl;
        elements.uploadArea.style.display = 'none';
        elements.previewArea.style.display = 'block';
        const image = await window.RawImage.fromURL(state.inputUrl);
        if (job !== state.jobId) return;
        if (image.width > 4096 || image.height > 4096) throw new Error(t('errorFileSize'));
        const rgba = ImageCore.toRGBA(image.data, image.width, image.height, image.channels);
        const inputs = await state.processor(image);
        if (job !== state.jobId) return;
        const { output } = await state.model(inputs);
        if (job !== state.jobId) return;
        const mask = output[0][0];
        const maskHeight = mask.dims[0], maskWidth = mask.dims[1];
        if (!Number.isInteger(maskWidth) || !Number.isInteger(maskHeight) || maskWidth < 1 || maskHeight < 1 || maskWidth * maskHeight > 4096 * 4096 || mask.data.length !== maskWidth * maskHeight) throw new Error('Unexpected model mask shape.');
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = maskWidth; maskCanvas.height = maskHeight;
        const maskContext = maskCanvas.getContext('2d');
        const maskPixels = maskContext.createImageData(maskWidth, maskHeight);
        for (let i = 0; i < mask.data.length; i++) {
            const value = mask.data[i];
            if (!Number.isFinite(value)) throw new Error('Invalid model mask value.');
            maskPixels.data[i * 4] = Math.round(Math.max(0, Math.min(1, value)) * 255);
            maskPixels.data[i * 4 + 3] = 255;
        }
        maskContext.putImageData(maskPixels, 0, 0);
        const canvas = document.createElement('canvas');
        canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(maskCanvas, 0, 0, image.width, image.height);
        const resizedMask = context.getImageData(0, 0, image.width, image.height);
        context.putImageData(new ImageData(ImageCore.applyMask(rgba, resizedMask.data), image.width, image.height), 0, 0);
        const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG export failed.')), 'image/png'));
        if (job !== state.jobId) return;
        state.resultBlob = blob;
        state.outputUrl = URL.createObjectURL(blob);
        elements.resultImage.src = state.outputUrl;
        elements.resultImage.style.display = 'block';
        elements.downloadBtn.disabled = false;
    } catch (error) {
        if (job === state.jobId) {
            alert(t('errorProcessing') + '\\n\\n' + error.message);
            resetUI();
        }
    } finally {
        state.isProcessing = false;
        elements.processingOverlay.style.display = 'none';
        elements.previewArea.setAttribute('aria-busy', 'false');
    }
}''')
s = replace_function(s, 'downloadResult', '''function downloadResult() {
    if (!state.resultBlob || state.isProcessing) return;
    const link = document.createElement('a');
    const url = URL.createObjectURL(state.resultBlob);
    link.href = url;
    link.download = 'background-removed.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}''')
s = replace_function(s, 'resetUI', '''function resetUI() {
    state.jobId++;
    for (const key of ['inputUrl', 'outputUrl']) {
        if (state[key]) URL.revokeObjectURL(state[key]);
        state[key] = null;
    }
    elements.originalImage.removeAttribute('src');
    elements.resultImage.removeAttribute('src');
    elements.uploadArea.style.display = 'block';
    elements.previewArea.style.display = 'none';
    elements.resultImage.style.display = 'none';
    elements.processingOverlay.style.display = 'none';
    elements.downloadBtn.disabled = true;
    elements.fileInput.value = '';
    state.resultBlob = null;
}''')
if "window.addEventListener('pagehide', resetUI)" not in s:
    s += "\nwindow.addEventListener('pagehide', resetUI);\n"
write(p, s)
p = TOOLS / '001-background-remover/index.html'
write(p, inject_script(p.read_text(), 'image-core.js'))

# #993: explicit network utility with bounded requests and no ambient credentials.
p = TOOLS / '993-api-tester/app.js'
s = p.read_text()
if 'const controller = new AbortController();' not in s:
    s = s.replace('        const url = urlInput.value.trim();', '''        if (sendBtn.disabled) return;
        const url = urlInput.value.trim();
        try {
            const parsed = new URL(url);
            if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Use an HTTP(S) URL without embedded credentials.');
        } catch (error) { showNotification(error.message, 'warning'); return; }''')
    s = s.replace("mode: 'cors'", "mode: 'cors',\n            credentials: 'omit',\n            redirect: 'error'")
    s = s.replace("method !== 'GET' && method !== 'DELETE'", "method !== 'GET' && method !== 'HEAD'")
    s = s.replace('        const startTime = performance.now();', '''        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        options.signal = controller.signal;
        sendBtn.disabled = true;
        lastResponse = '';
        const startTime = performance.now();''')
    s = s.replace('const text = await response.text();', '''const reader = response.body?.getReader();
            const parts = [];
            let bytes = 0;
            if (reader) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        bytes += value.byteLength;
                        if (bytes > 2 * 1024 * 1024) { await reader.cancel(); throw new Error('Response exceeds 2 MiB limit.'); }
                        parts.push(value);
                    }
                } finally { reader.releaseLock(); }
            }
            const text = await new Blob(parts).text();''')
    s = s.replace("        } finally {\n            loading.classList.add('hidden');", "        } finally {\n            clearTimeout(timeout);\n            sendBtn.disabled = false;\n            loading.classList.add('hidden');")
    s = s.replace('return div.innerHTML;', '''return div.innerHTML.replaceAll('"', '&quot;').replaceAll("'", '&#39;');''')
write(p, s)

# Status is evidence of implementation, not a quality certificate.
entries = []
for directory in sorted(TOOLS.iterdir()):
    page = directory / 'index.html'
    if not page.is_file():
        continue
    title = re.search(r'<title>(.*?)</title>', page.read_text(), re.S)
    status = 'unverified-implementation'
    if directory.name in placeholder_slugs: status = 'not-implemented'
    elif directory.name in manual_demos: status = 'demo'
    elif directory.name in speech_slugs: status = 'device-speech-experimental'
    elif directory.name in model_slugs: status = 'model-integration-unverified'
    entries.append({'path': f'tools/{directory.name}/index.html', 'title': html.unescape(title[1].strip()) if title else directory.name, 'status': status})
(ROOT / 'docs').mkdir(exist_ok=True)
(ROOT / 'docs/tool-inventory.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'tool_pages': len(entries), 'not_implemented': len(placeholder_slugs), 'native_speech_pages': len(speech_slugs), 'model_integration_signals': len(model_slugs)}))
