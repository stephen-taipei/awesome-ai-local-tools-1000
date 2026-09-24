const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
test('continuous recognition restarts reuse the visualizer until an explicit stop', () => {
    let visualizations = 0;
    const handlers = {};
    class Recognition extends EventTarget {
        constructor() { super(); this.processLocally = false; }
        start() {}
        abort() {}
    }
    const context = vm.createContext({ SpeechRecognition: Recognition,
        document: { getElementById() { return null; } },
        addEventListener(name, callback) { handlers[name] = callback; },
        startVisualization() { visualizations++; }
    });
    vm.runInContext(fs.readFileSync('tools/shared/local-speech.js', 'utf8'), context);
    const Constructor = context.LocalSpeech.getConstructor();
    const recognition = new Constructor();
    recognition.dispatchEvent(new Event('start'));
    recognition.dispatchEvent(new Event('end'));
    recognition.start();
    recognition.dispatchEvent(new Event('start'));
    assert.equal(visualizations, 1);
    context.LocalSpeech.releaseMicrophones();
    recognition.dispatchEvent(new Event('start'));
    assert.equal(visualizations, 2);
    handlers.pagehide();
});
