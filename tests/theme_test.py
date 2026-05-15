import os
import subprocess
import time
import sys
from playwright.sync_api import sync_playwright

def run_test():
    # Start a local server in the background
    proc = subprocess.Popen(["python3", "-m", "http.server", "8001"])
    time.sleep(2)  # Wait for the server to start
    server_url = "http://localhost:8001/Index.html"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width': 1280, 'height': 800})

            # Block font loading
            context.route("https://fonts.googleapis.com/**", lambda route: route.abort())
            context.route("https://fonts.gstatic.com/**", lambda route: route.abort())

            page = context.new_page()

            print(f"Navigating to {server_url}...")
            page.goto(server_url, wait_until="domcontentloaded")

            # 1. Check initial theme
            theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
            print(f"Initial theme: {theme}")
            assert theme == "light", f"Expected 'light', got '{theme}'"

            # 2. Cycle theme to dark
            print("Cycling to dark...")
            page.evaluate("document.getElementById('themeBtn').click()")
            page.wait_for_timeout(500)
            theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
            print(f"Theme after click: {theme}")
            assert theme == "dark", f"Expected 'dark', got '{theme}'"

            # 3. Check localStorage
            ls_theme = page.evaluate("localStorage.getItem('vectisx_theme')")
            print(f"localStorage: {ls_theme}")
            assert ls_theme == "dark", f"Expected localStorage 'dark', got '{ls_theme}'"

            # 4. Reload and check persistence
            print("Reloading...")
            page.reload(wait_until="domcontentloaded")
            page.wait_for_timeout(500)
            theme_after_reload = page.evaluate("document.documentElement.getAttribute('data-theme')")
            print(f"Theme after reload: {theme_after_reload}")
            assert theme_after_reload == "dark", f"Expected 'dark' after reload, got '{theme_after_reload}'"

            # 5. Cycle to blood
            print("Cycling to blood...")
            page.evaluate("document.getElementById('themeBtn').click()")
            page.wait_for_timeout(500)
            theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
            print(f"Theme after click: {theme}")
            assert theme == "blood", f"Expected 'blood', got '{theme}'"

            ls_theme = page.evaluate("localStorage.getItem('vectisx_theme')")
            print(f"localStorage: {ls_theme}")
            assert ls_theme == "blood", f"Expected localStorage 'blood', got '{ls_theme}'"

            print("Test passed successfully!")
            browser.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)
