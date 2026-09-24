#!/usr/bin/env python3
"""HTTP project-base boot matrix and targeted regressions.
External dependencies are blocked and classified separately. No real microphone,
user data or downloaded model inference is used by these tests.
"""
import asyncio
from collections import Counter
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading
import traceback
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
PREFIX = '/awesome-ai-local-tools-1000/'
OUTPUT = ROOT / 'audit-output'
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if not self.path.startswith(PREFIX):
            self.send_error(404); return
        self.path = '/' + self.path[len(PREFIX):]
        super().do_GET()
    def log_message(self, *_): pass

async def run():
    OUTPUT.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    base = origin + PREFIX
    results, regressions = [], []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(args=['--no-sandbox'])
        semaphore = asyncio.Semaphore(6)
        async def smoke(relative):
            async with semaphore:
                context = await browser.new_context(viewport={'width': 1280, 'height': 800})
                page = await context.new_page()
                errors, missing, external = [], [], []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.on('dialog', lambda dialog: asyncio.create_task(dialog.dismiss()))
                page.on('response', lambda response: missing.append(response.url) if response.url.startswith(origin) and response.status >= 400 else None)
                async def route(request):
                    if request.request.url.startswith(('http://', 'https://')) and not request.request.url.startswith(origin + '/'):
                        external.append(request.request.url); await request.abort(); return
                    await request.continue_()
                await context.route('**/*', route)
                status = 'pass'
                try:
                    response = await page.goto(base + relative, wait_until='domcontentloaded', timeout=15000)
                    assert response and response.ok, 'HTML navigation failed'
                    await page.wait_for_timeout(150)
                    assert await page.title(), 'Empty title'
                    assert await page.locator('body').count() == 1, 'Missing body'
                    if external: status = 'external-dependency-unverified'
                    elif errors: status = 'fail'
                    if missing: status = 'fail'
                    if await page.locator('body[data-implementation="placeholder"]').count():
                        assert await page.locator('#process-btn').is_disabled(), 'Placeholder run button enabled'
                        assert await page.locator('#implementation-notice').is_visible(), 'Missing warning'
                except Exception as error:
                    status = 'fail'; errors.append(str(error))
                results.append({'path': relative, 'status': status, 'errors': errors, 'missing': missing, 'blocked_external': sorted(set(external))})
                await context.close()
        rows = [{}] + json.loads((ROOT / 'docs/tool-inventory.json').read_text())
        await asyncio.gather(*(smoke('index.html' if index == 0 else row['path']) for index, row in enumerate(rows)))
        context = await browser.new_context(viewport={'width': 1280, 'height': 800}, permissions=['clipboard-read', 'clipboard-write'])
        async def local_only(route):
            if route.request.url.startswith(('http://', 'https://')) and not route.request.url.startswith(origin + '/'):
                await route.abort()
            else: await route.continue_()
        await context.route('**/*', local_only)
        page = await context.new_page()
        page.on('dialog', lambda dialog: asyncio.create_task(dialog.dismiss()))
        async def regression(name, function):
            try:
                await asyncio.wait_for(function(), timeout=45); regressions.append({'name': name, 'status': 'pass'})
            except Exception as error:
                regressions.append({'name': name, 'status': 'fail', 'error': str(error), 'traceback': traceback.format_exc()})
        async def markdown():
            await page.goto(base + 'tools/991-markdown-preview/index.html')
            await page.locator('#md-input').fill('# Safe\n\n[link](javascript:alert(1))\n\n<img src="https://example.invalid/track" onerror="window.pwned=1">\n<script>window.pwned=1</script>')
            await page.wait_for_timeout(250)
            assert await page.locator('#md-preview h1').inner_text() == 'Safe'
            assert await page.locator('#md-preview img, #md-preview script, #md-preview [onerror], #md-preview a[href^="javascript:"]').count() == 0
            assert await page.evaluate('window.pwned === undefined')
            await page.locator('#copy-html-btn').click()
            copied = await page.evaluate('navigator.clipboard.readText()')
            assert '<script' not in copied and '<img' not in copied and 'javascript:' not in copied
            await page.locator('#md-input').fill('hello world')
            await page.locator('#md-input').evaluate('(element) => element.setSelectionRange(6, 11)')
            await page.locator('[data-format="h1"]').click()
            assert await page.locator('#md-input').input_value() == '# hello world'
            await page.set_viewport_size({'width': 390, 'height': 844})
            await page.locator('[data-view="split"]').click()
            columns = await page.locator('#editor-container').evaluate('(element) => getComputedStyle(element).gridTemplateColumns.split(" ").length')
            assert columns == 1, 'Mobile split must respect single-column CSS'
            await page.screenshot(path=str(OUTPUT / 'markdown-mobile.png'), full_page=True)
            await page.set_viewport_size({'width': 1280, 'height': 800})
        await regression('Markdown XSS, sanitized export, formatting and mobile layout', markdown)
        async def complexity():
            await page.goto(base + 'tools/999-code-complexity-analysis/index.html')
            await page.locator('#code-input').fill('function outer(x) { if (x) {} function inner(x) { if (x) {} if (x) {} } }')
            await page.locator('#analyze-btn').click()
            assert await page.locator('#metric-functions').inner_text() == '2'
            assert await page.locator('#metric-cyclo').inner_text() == '3'
            await page.locator('#code-input').fill('function choose(x) { switch(x) { case 1: break; case 2: break; default: break; } }')
            await page.locator('#analyze-btn').click()
            assert await page.locator('#metric-cyclo').inner_text() == '3'
            await page.screenshot(path=str(OUTPUT / 'complexity-desktop.png'), full_page=True)
        await regression('Actual parser, nested functions and switch complexity', complexity)
        async def injection():
            await page.goto(base + 'tools/204-meeting-transcription/index.html')
            payload = '<img src=x onerror="window.pwned=1">'
            await page.locator('#newParticipant').fill(payload)
            await page.locator('#addParticipantBtn').click()
            assert await page.locator('#participantList img').count() == 0
            assert payload in await page.locator('#participantList').inner_text()
            await page.locator('#participantList button').last.click()
            assert payload not in await page.locator('#participantList').inner_text()
            await page.goto(base + 'tools/208-keyword-spotting/index.html')
            await page.locator('#keywordInput').fill(payload)
            await page.locator('#addKeywordBtn').click()
            assert await page.locator('.keyword-tag img').count() == 0
            await page.locator('.keyword-tag button').last.click()
            assert await page.evaluate('window.pwned === undefined')
        await regression('Participant and keyword text injection', injection)
        async def image():
            async def instrument_module(route):
                # Test-only lexical access. Never export app state in shipped source.
                source = (ROOT / 'tools/001-background-remover/app.js').read_text()
                source += '\nObject.assign(globalThis, { state, elements, processImage, resetUI });\n'
                await route.fulfill(status=200, content_type='text/javascript', body=source)
            await page.route('**/001-background-remover/app.js', instrument_module)
            await page.goto(base + 'tools/001-background-remover/index.html')
            pixels = await page.evaluate('''async () => {
                window.RawImage = { fromURL: async () => ({ data: [255, 10, 20], channels: 3, width: 1, height: 1 }) };
                state.isModelLoaded = true;
                state.processor = async () => ({});
                state.model = async () => ({ output: [[{ data: [1], dims: [1, 1] }]] });
                const source = document.createElement('canvas'); source.width = source.height = 1;
                const blob = await new Promise(resolve => source.toBlob(resolve));
                await processImage(new File([blob], 'test.png', { type: 'image/png' }));
                await elements.resultImage.decode();
                const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
                const context = canvas.getContext('2d'); context.drawImage(elements.resultImage, 0, 0);
                return [...context.getImageData(0, 0, 1, 1).data];
            }''')
            assert pixels == [255, 10, 20, 255], pixels
            assert not await page.locator('#downloadBtn').is_disabled()
            stale = await page.evaluate('''async () => {
                let release;
                state.model = () => new Promise(resolve => { release = resolve; });
                const work = processImage(new File(['x'], 'test.png', { type: 'image/png' }));
                while (!release) await new Promise(resolve => setTimeout(resolve, 0));
                resetUI();
                release({ output: [[{ data: [1], dims: [1, 1] }]] });
                await work;
                return state.resultBlob === null && state.outputUrl === null && !state.isProcessing && elements.downloadBtn.disabled;
            }''')
            assert stale, 'Reset did not invalidate pending inference'
        await regression('Background removal synthetic RGB and reset race (mock model)', image)
        async def home():
            await page.goto(base)
            await page.screenshot(path=str(OUTPUT / 'homepage-preserved.png'), full_page=True)
        await regression('Homepage at project base', home)
        await context.close(); await browser.close()
    server.shutdown()
    report = {'coverage': 'Page boot only; external dependencies blocked; image inference uses a synthetic mock.', 'counts': dict(Counter(row['status'] for row in results)), 'regressions': regressions, 'pages': sorted(results, key=lambda row: row['path'])}
    (OUTPUT / 'browser.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'counts': report['counts'], 'regressions': regressions, 'failures': [row for row in results if row['status'] == 'fail']}, indent=2))
    return 1 if any(row['status'] == 'fail' for row in results + regressions) else 0
if __name__ == '__main__': raise SystemExit(asyncio.run(run()))
