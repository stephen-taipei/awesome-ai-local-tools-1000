#!/usr/bin/env python3
"""Real UI regressions for two additional boot defects; no camera access."""
import asyncio
import json
import struct
import threading
import zlib
from functools import partial
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from browser_smoke import ROOT, OUTPUT, PREFIX, Handler

def fixture():
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    row = bytes([0]) + bytes([0, 255, 0, 255]) * 8 + bytes([255, 0, 0, 255]) * 8
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', 16, 8, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(row * 8)) + chunk(b'IEND', b'')

async def run():
    OUTPUT.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}' + PREFIX
    checks, errors = [], []
    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(args=['--no-sandbox'])
            page = await browser.new_page(viewport={'width': 1280, 'height': 800})
            page.on('pageerror', lambda error: errors.append(str(error)))
            await page.goto(base + 'tools/009-green-screen/index.html')
            await page.locator('#fileInput').set_input_files({'name': 'chroma.png', 'mimeType': 'image/png', 'buffer': fixture()})
            await page.locator('#editorArea').wait_for(state='visible')
            for selector in ['#edgeSlider', '#softnessSlider']:
                await page.locator(selector).fill('0')
                await page.locator(selector).dispatch_event('input')
            await page.locator('#applyBtn').click()
            await page.wait_for_function("document.querySelector('#resultCanvas').width === 16 && document.querySelector('#processingOverlay').style.display === 'none'")
            pixels = await page.locator('#resultCanvas').evaluate("canvas => Array.from(canvas.getContext('2d').getImageData(0, 4, 16, 1).data)")
            assert pixels[3] == 0 and pixels[15 * 4 + 3] == 255, pixels
            checks.append('Real non-square green/red PNG chroma output and zero softness')
            await page.locator('#edgeSlider').fill('2')
            await page.locator('#edgeSlider').dispatch_event('input')
            await page.locator('#applyBtn').click()
            await page.wait_for_function("document.querySelector('#processingOverlay').style.display === 'none'")
            assert await page.locator('#resultCanvas').evaluate("canvas => canvas.getContext('2d').getImageData(15, 4, 1, 1).data[3]") > 0
            await page.locator('.color-preset[data-color="#0000ff"]').click()
            assert await page.locator('#customColor').input_value() == '#0000ff'
            await page.locator('.bg-preset[data-bg="red"]').click()
            assert await page.locator('.checkerboard-bg').evaluate("element => getComputedStyle(element).backgroundColor") == 'rgb(239, 68, 68)'
            await page.locator('#pickerBtn').click()
            assert await page.locator('#pickColorHint').is_visible()
            await page.locator('#resetBtn').click()
            assert not await page.locator('#editorArea').is_visible()
            checks.append('Green-screen presets, background, picker and reset wiring')
            await page.goto(base + 'tools/805-ar-virtual-try-on/index.html')
            assert await page.locator('#itemsGrid button').count() == 4
            assert await page.locator('#captureBtn').is_disabled()
            await page.locator('.tab-btn').nth(1).click()
            await page.locator('#itemsGrid button').first.click()
            assert await page.locator('#itemsGrid button[aria-pressed="true"]').count() == 1
            assert await page.locator('.tab-btn.active').inner_text() == 'Hats'
            await page.locator('.lang-btn').nth(1).click()
            await page.wait_for_timeout(50)
            assert await page.locator('html').get_attribute('lang') == 'zh-TW'
            assert '示範' in await page.locator('#implementation-notice').inner_text()
            assert not errors, errors
            checks.append('AR initial render, category/selection/language and demo disclosure')
            await page.screenshot(path=str(OUTPUT / 'ar-demo.png'), full_page=True)
            await browser.close()
        report = {'status': 'pass', 'checks': checks, 'errors': errors}
    except Exception as error:
        report = {'status': 'fail', 'checks': checks, 'errors': errors + [repr(error)]}
    finally:
        server.shutdown()
    (OUTPUT / 'browser-extras.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return 0 if report['status'] == 'pass' else 1
if __name__ == '__main__': raise SystemExit(asyncio.run(run()))
