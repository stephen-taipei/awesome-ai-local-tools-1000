from playwright.sync_api import sync_playwright, expect
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Tools to verify
        tools = [
            '057-face-attribute',
            '058-image-similarity',
            '059-depth-estimation',
            '060-image-captioning',
            '061-format-converter'
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
                screenshot_path = f"verification/{tool}-check.png"
                page.screenshot(path=screenshot_path)
                print(f"Screenshot saved to {screenshot_path}")

            except Exception as e:
                print(f"Error verifying {tool}: {e}")

        browser.close()

if __name__ == "__main__":
    run()
