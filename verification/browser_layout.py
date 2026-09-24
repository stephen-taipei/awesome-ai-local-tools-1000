#!/usr/bin/env python3
"""Check child-page toolbar overflow without altering the category homepage."""
import asyncio
import json
import threading
from functools import partial
from http.server import ThreadingHTTPServer
from playwright.async_api import async_playwright
from browser_smoke import ROOT, OUTPUT, PREFIX, Handler

async def run():
    OUTPUT.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    results = []
    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(args=['--no-sandbox'])
            for width in (320, 390):
                page = await browser.new_page(viewport={'width': width, 'height': 844})
                await page.goto(f'http://127.0.0.1:{server.server_port}{PREFIX}tools/991-markdown-preview/index.html')
                await page.locator('#md-input').fill('# Layout\n\n' + 'longword' * 40)
                await page.wait_for_timeout(200)
                await page.locator('[data-view="split"]').click()
                metrics = await page.evaluate('({ viewport: innerWidth, content: document.documentElement.scrollWidth })')
                assert metrics['content'] <= metrics['viewport'], metrics
                for button in await page.locator('.format-btn').all():
                    bounds = await button.bounding_box()
                    assert bounds and bounds['x'] >= 0 and bounds['x'] + bounds['width'] <= width, bounds
                results.append({'width': width, 'status': 'pass', **metrics})
                await page.screenshot(path=str(OUTPUT / f'markdown-{width}.png'), full_page=True)
                await page.close()
            await browser.close()
    except Exception as error:
        results.append({'status': 'fail', 'error': repr(error)})
    finally:
        server.shutdown()
    report = {'results': results}
    (OUTPUT / 'browser-layout.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    return int(any(row['status'] == 'fail' for row in results))
if __name__ == '__main__': raise SystemExit(asyncio.run(run()))
