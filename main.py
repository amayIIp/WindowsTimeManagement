import asyncio
import os
import sys
import time
import threading
import ctypes

# ──────────────────────────────────────────────────────────
# CRITICAL for PyInstaller --noconsole mode:
# stdout/stderr may be None, which crashes print() and logging.
# ──────────────────────────────────────────────────────────
if sys.stdout is None:
    sys.stdout = open(os.devnull, 'w')
if sys.stderr is None:
    sys.stderr = open(os.devnull, 'w')

import uvicorn
from tracker.tracker import run as tracker_run
from server.main import app
from tray import TrayManager
from autostart import is_registered, register_autostart, show_welcome_popup

# Try to import webview for native window; fall back to browser
try:
    import webview
    HAS_WEBVIEW = True
except ImportError:
    HAS_WEBVIEW = False


# ── Single Instance Mutex ─────────────────────────────────

def ensure_single_instance():
    """Prevent duplicate instances using a named Windows kernel mutex."""
    mutex_name = "Global\\WellbeingTrackerMutex_7331"
    kernel32 = ctypes.windll.kernel32
    mutex = kernel32.CreateMutexW(None, False, mutex_name)
    if ctypes.GetLastError() == 183:          # ERROR_ALREADY_EXISTS
        sys.exit(0)
    return mutex                               # prevent GC releasing the mutex


# ── Auto-install on first run ─────────────────────────────

def auto_install():
    """Silently registers auto-start and shows a welcome popup on first run."""
    if getattr(sys, 'frozen', False) and not is_registered():
        if register_autostart():
            # Show welcome in a thread so it doesn't block startup
            threading.Thread(target=show_welcome_popup, daemon=True).start()


# ── Background threads ────────────────────────────────────

def start_server():
    uvicorn.run(app, host="127.0.0.1", port=7331, log_level="warning")


def start_tracker():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(tracker_run())
    except Exception:
        pass


# ── Dashboard window ──────────────────────────────────────

_dashboard_window = None
_force_exit = False


def open_dashboard():
    """Show the native dashboard window, or fall back to a browser tab."""
    global _dashboard_window
    if HAS_WEBVIEW and _dashboard_window is not None:
        try:
            _dashboard_window.show()
            return
        except Exception:
            pass
    # Fallback: open in default browser
    import webbrowser
    webbrowser.open("http://127.0.0.1:7331")


def on_exit():
    """Called when user clicks Exit in the tray menu."""
    os._exit(0)


def _on_window_closing():
    """Hide the webview window instead of destroying it."""
    if _force_exit:
        return True   # allow the actual destroy during exit
    if _dashboard_window:
        _dashboard_window.hide()
    return False       # cancel the close — just hides


# ── Entry point ───────────────────────────────────────────

if __name__ == "__main__":
    try:
        mutex = ensure_single_instance()

        # Auto-install on first run (no admin needed)
        auto_install()

        # 1. FastAPI server
        threading.Thread(target=start_server, daemon=True, name="server").start()

        # Small delay so the server is ready before webview tries to connect
        time.sleep(1)

        # 2. Activity tracker
        threading.Thread(target=start_tracker, daemon=True, name="tracker").start()

        # 3. System tray icon
        tray = TrayManager(on_open_dashboard=open_dashboard, on_exit=on_exit)
        threading.Thread(target=tray.run, daemon=True, name="tray").start()

        # 4. Native webview window (hidden until user clicks "Open Dashboard")
        if HAS_WEBVIEW:
            _dashboard_window = webview.create_window(
                'Wellbeing Tracker',
                'http://127.0.0.1:7331',
                width=1280,
                height=800,
                hidden=True,
                min_size=(800, 600),
            )
            _dashboard_window.events.closing += _on_window_closing
            # This blocks the main thread (runs the GUI event loop)
            webview.start()
        else:
            # No webview — keep the main thread alive
            while True:
                time.sleep(60)

    except KeyboardInterrupt:
        pass
