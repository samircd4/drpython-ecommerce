import os
import sys
import asyncio
import time
from playwright.sync_api import sync_playwright

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

def run_clean_isolated_persistent_saver():
    print("\n=======================================================================")
    print("[STANDALONE-ENGINE] Launching Isolated Clean Persistent Context Engine...")
    print("=======================================================================")
    
    # This creates a localized fresh virtual profile inside your project root directory.
    # Completely independent of your regular physical Chrome configuration data.
    VIRTUAL_PROFILE_DIR = "./bioscope_dedicated_session"
    
    with sync_playwright() as p:
        stealth_args = [
            '--disable-blink-features=AutomationControlled',
            '--start-maximized'
        ]
        
        try:
            print(f"[ENGINE] Starting automated sandboxed environment profile loop...")
            
            # Using clean local relative workspace persistence container folder directly
            context = p.chromium.launch_persistent_context(
                user_data_dir=VIRTUAL_PROFILE_DIR,
                headless=False, # Opens visually so you can manually interact without conflicts
                args=stealth_args,
                no_viewport=True,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            )
            
            page = context.pages[0] if context.pages else context.new_page()
            
            target_url = "https://www.bioscopeplus.com/channels/sonyahd"
            print(f"[ENGINE] Accessing: {target_url}")
            page.goto(target_url, wait_until="commit", timeout=50000)
            
            print("\n" + "!"*60)
            print("👉 WORKSPACE STEP:")
            print("1. NOTUN popup browser-ti system conflicts charai successfully open hoyeche.")
            print("2. Ekhane clean single time Bioscope account Login process complete korun.")
            print("3. Sony HD stream load howa start hoile dynamic output clear state trace done hobe.")
            print("!"*60 + "\n")
            
            input("👉 Login confirmed & player active? Press [ ENTER ] to build storage snapshot...")
            
            print("\n[ENGINE] Extracting session variables data layer snapshot...")
            time.sleep(1)
            
            # Save the fresh independent token state matrix
            context.storage_state(path="storage_state.json")
            
            print("\n🎉 [SUCCESS] Virtual session successfully exported to 'storage_state.json'!")
            context.close()
            
        except Exception as err:
            print(f"\n❌ [RUNTIME-ERROR] Operational block crashed: {str(err)}")

if __name__ == "__main__":
    run_clean_isolated_persistent_saver()