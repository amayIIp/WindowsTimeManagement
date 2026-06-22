"""
System tray icon manager for WellbeingTracker.
Creates a tray icon with controls to open the dashboard, pause tracking, and exit.
"""
import pystray
import threading
from pystray import MenuItem as item
from PIL import Image, ImageDraw
from common import set_tracking_paused, logger
from autostart import unregister_autostart, show_uninstall_popup


def create_icon_image() -> Image.Image:
    """Generate a 64x64 teal ring icon programmatically (no file needed)."""
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Outer teal circle
    draw.ellipse([2, 2, size - 2, size - 2], fill=(20, 184, 166, 255))
    # Inner dark cutout
    r = 16
    draw.ellipse([r, r, size - r, size - r], fill=(11, 13, 15, 255))
    # Center bright dot
    c = size // 2
    draw.ellipse([c - 5, c - 5, c + 5, c + 5], fill=(20, 184, 166, 255))
    return img


class TrayManager:
    """Manages the system‑tray icon and its context menu."""

    def __init__(self, on_open_dashboard, on_exit):
        self._on_open = on_open_dashboard
        self._on_exit = on_exit
        self._icon: pystray.Icon | None = None
        self.paused = False

    # ── Menu handlers ──

    def _handle_open(self, icon, menu_item):
        self._on_open()

    def _handle_pause(self, icon, menu_item):
        self.paused = not self.paused
        set_tracking_paused(self.paused)
        if self._icon:
            self._icon.title = (
                "Wellbeing Tracker — Paused" if self.paused
                else "Wellbeing Tracker — Running"
            )
        logger.info("Tracking %s", "paused" if self.paused else "resumed")

    def _handle_uninstall(self, icon, menu_item):
        """Remove auto-start, show confirmation, and exit."""
        def run_uninstall():
            logger.info("Uninstall requested. Stopping tray icon...")
            if self._icon:
                self._icon.stop()
            logger.info("Unregistering auto-start registry key...")
            unregister_autostart()
            logger.info("Showing uninstall confirmation popup...")
            show_uninstall_popup()
            logger.info("Uninstall popup closed. Exiting process.")
            self._on_exit()
            
        threading.Thread(target=run_uninstall, daemon=True).start()

    def _handle_exit(self, icon, menu_item):
        logger.info("Exit requested from tray menu.")
        if self._icon:
            self._icon.stop()
        self._on_exit()

    # ── Public API ──

    def run(self):
        """Start the tray icon (blocks the calling thread)."""
        self._icon = pystray.Icon(
            "wellbeing_tracker",
            create_icon_image(),
            "Wellbeing Tracker — Running",
            menu=pystray.Menu(
                item('Open Dashboard', self._handle_open, default=True),
                item(
                    lambda _mi: 'Resume Tracking' if self.paused else 'Pause Tracking',
                    self._handle_pause,
                ),
                pystray.Menu.SEPARATOR,
                item('Uninstall', self._handle_uninstall),
                item('Exit', self._handle_exit),
            ),
        )
        self._icon.run()

    def update_tooltip(self, text: str):
        if self._icon:
            self._icon.title = text
