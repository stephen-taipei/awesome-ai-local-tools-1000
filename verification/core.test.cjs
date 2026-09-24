const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { toRGBA, applyMask } = require('../tools/shared/image-core.js');
const { analyze } = require('../tools/shared/complexity-core.js');
test('RGB expands to RGBA without corrupting pixels', () => {
    assert.deepEqual([...toRGBA([255, 0, 10, 0, 200, 20], 2, 1, 3)], [255, 0, 10, 255, 0, 200, 20, 255]);
});
test('RGBA and grayscale alpha preserve source transparency', () => {
    assert.deepEqual([...toRGBA([50, 80], 1, 1, 2)], [50, 50, 50, 80]);
    assert.deepEqual([...applyMask(toRGBA([255, 0, 10, 128], 1, 1, 4), [128, 0, 0, 255])], [255, 0, 10, 64]);
});
test('invalid image dimensions, length and masks fail closed', () => {
    assert.throws(() => toRGBA([], 1, 1, 3));
    assert.throws(() => toRGBA([], 100000, 100000, 4));
    assert.throws(() => applyMask([1, 2, 3], [1, 2, 3]));
});
const block = body => ({ type: 'BlockStatement', body });
const fn = (name, body) => ({ type: 'FunctionDeclaration', id: { type: 'Identifier', name }, body: block(body), loc: { start: { line: 1 } } });
const decision = () => ({ type: 'IfStatement', test: { type: 'Identifier', name: 'x' }, consequent: block([]) });
test('nested functions are analyzed independently', () => {
    const result = analyze({ type: 'Program', body: [fn('outer', [decision(), fn('inner', [decision(), decision()])])] });
    assert.deepEqual(result.details.map(x => [x.name, x.complexity]), [['outer', 2], ['inner', 3]]);
    assert.equal(result.functionCount, 2);
});
test('switch cases count decisions but default does not', () => {
    const cases = [1, 2, null].map(value => ({ type: 'SwitchCase', test: value === null ? null : { type: 'Literal', value }, consequent: [] }));
    assert.equal(analyze({ type: 'Program', body: [fn('switcher', [{ type: 'SwitchStatement', cases }])] }).maxComplexity, 3);
});
function speechHarness({ native = true, local = true } = {}) {
    const calls = [], handlers = {};
    let resolveMedia;
    const tracks = [{ stop() { calls.push('track.stop'); } }];
    class Recognition extends EventTarget {
        constructor() { super(); if (local) this.processLocally = false; }
        start() { calls.push(['recognition.start', this.processLocally]); }
        abort() { calls.push('recognition.abort'); }
    }
    const context = vm.createContext({ Event, EventTarget, console, SpeechRecognition: native ? Recognition : undefined,
        document: { getElementById() { return null; } },
        addEventListener(event, callback) { handlers[event] = callback; },
        navigator: { mediaDevices: { getUserMedia() { return new Promise(resolve => { resolveMedia = resolve; }); } } }
    });
    vm.runInContext(fs.readFileSync('tools/shared/local-speech.js', 'utf8'), context);
    return { api: context.LocalSpeech, calls, handlers, resolveMedia() { resolveMedia({ getTracks: () => tracks }); } };
}
test('unsupported browsers cannot start cloud recognition', () => {
    for (const options of [{ native: false }, { local: false }]) {
        const h = speechHarness(options);
        assert.equal(h.api.getConstructor(), null);
        assert.equal(h.calls.length, 0);
    }
});
test('every speech start reasserts device-only mode', () => {
    const h = speechHarness(), Constructor = h.api.getConstructor(), recognition = new Constructor();
    recognition.processLocally = false; recognition.start();
    recognition.processLocally = false; recognition.start();
    assert.deepEqual(h.calls, [['recognition.start', true], ['recognition.start', true]]);
});
test('streams stop even when permission resolves after stop', async () => {
    const h = speechHarness();
    const first = h.api.captureMicrophone(); h.resolveMedia(); await first;
    h.api.releaseMicrophones();
    assert.equal(h.calls.filter(x => x === 'track.stop').length, 1);
    const late = h.api.captureMicrophone(); h.api.releaseMicrophones(); h.resolveMedia();
    await assert.rejects(late, /Recording stopped/);
    assert.equal(h.calls.filter(x => x === 'track.stop').length, 2);
});
test('page exit aborts recognition and removes restart callbacks', () => {
    const h = speechHarness(), Constructor = h.api.getConstructor(), recognition = new Constructor();
    recognition.onend = () => recognition.start();
    h.handlers.pagehide();
    assert.equal(recognition.onend, null);
    assert.ok(h.calls.includes('recognition.abort'));
});
