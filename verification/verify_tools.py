from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Tools to verify
        tools = [
            '036-retro-filter',
            '041-portrait-beauty',
            '043-smart-smoothing',
            '050-portrait-id-photo',
            '054-color-analysis',
            '055-image-quality',
            '056-exif-reader'
        ]

        cwd = os.getcwd()

        for tool in tools:
            try:
                url = f"file://{cwd}/tools/{tool}/index.html"
                print(f"Verifying {tool} at {url}")
                page.goto(url)

                # Wait for title to ensure load
                expect(page).not_to_have_title("")

                # Take screenshot
                screenshot_path = f"verification/{tool}.png"
                page.screenshot(path=screenshot_path)
                print(f"Screenshot saved to {screenshot_path}")

            except Exception as e:
                print(f"Error verifying {tool}: {e}")

        browser.close()

if __name__ == "__main__":
    run()
