/* Device-only speech: no cloud fallback, capability gate, microphone cleanup. */
(function (root) {
    'use strict';
    const Native = root.SpeechRecognition || root.webkitSpeechRecognition;
    const instances = new Set();
    const streams = new Set();
    let generation = 0;
    let visualizationActive = false;
    function releaseMicrophones() {
        generation++;
        visualizationActive = false;
        streams.forEach(stream => stream.getTracks().forEach(track => track.stop()));
        streams.clear();
    }
    async function captureMicrophone() {
        const requested = generation;
        const stream = await root.navigator.mediaDevices.getUserMedia({ audio: true });
        if (requested !== generation) {
            stream.getTracks().forEach(track => track.stop());
            throw new Error('Recording stopped before microphone permission was granted.');
        }
        streams.add(stream);
        return stream;
    }
    function stopUI() {
        releaseMicrophones();
        const button = root.document?.getElementById('stopBtn');
        if (button && !button.disabled) button.click();
    }
    function supported() {
        if (!Native) return false;
        try { return 'processLocally' in new Native(); } catch { return false; }
    }
    function getConstructor() {
        if (!supported()) return null;
        return class DeviceRecognition extends Native {
            constructor() {
                super();
                this.processLocally = true;
                this.addEventListener('start', () => {
                    instances.add(this);
                    if (!visualizationActive && typeof root.startVisualization === 'function') {
                        visualizationActive = true;
                        void root.startVisualization();
                    }
                });
                this.addEventListener('end', () => instances.delete(this));
                this.addEventListener('error', () => { stopUI(); }, { capture: true });
                instances.add(this);
            }
            start() {
                instances.add(this);
                this.processLocally = true;
                if (this.processLocally !== true) throw new Error('On-device recognition is unavailable.');
                try { return super.start(); }
                catch (error) { stopUI(); throw error; }
            }
        };
    }
    function renderText(element, finalText, interimText = '') {
        const span = root.document.createElement('span');
        span.className = 'interim';
        span.textContent = interimText;
        element.replaceChildren(root.document.createTextNode(finalText), span);
    }
    root.LocalSpeech = Object.freeze({ getConstructor, captureMicrophone, releaseMicrophones, renderText, supported });
    root.addEventListener('pagehide', () => {
        stopUI();
        instances.forEach(instance => {
            instance.onend = null;
            try { instance.abort(); } catch { /* Already stopped. */ }
        });
        instances.clear();
    });
    root.document?.getElementById('stopBtn')?.addEventListener('click', releaseMicrophones, { capture: true });
})(globalThis);
