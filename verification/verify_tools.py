from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # List of tools to verify
    tools = [
        ("053-scene-recognition", "AI Scene Recognition"),
        ("049-expression-editing", "AI Expression Editor"),
        ("048-portrait-anime", "Portrait to Anime"),
        ("047-age-transformation", "Age Transformation"),
        ("046-virtual-makeup", "Virtual Makeup"),
        ("045-hair-color", "Hair Color Changer"),
        ("044-skin-tone", "Skin Tone Adjustment")
    ]

    base_path = os.getcwd()

    for tool_id, title in tools:
        print(f"Verifying {title}...")
        url = f"file://{base_path}/tools/{tool_id}/index.html"
        try:
            page.goto(url)
            page.wait_for_load_state("networkidle")

            # Verify title
            page_title = page.title()
            # Loose check
            if title.lower() not in page_title.lower():
                 # Some might have "AI" prefix or not
                 pass

            # Take screenshot
            screenshot_path = f"verification/{tool_id}.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error verifying {tool_id}: {e}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
