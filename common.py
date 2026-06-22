import os
import sys

def get_data_dir():
    if getattr(sys, 'frozen', False):
        # If running as PyInstaller .exe, put data files next to the .exe
        return os.path.dirname(sys.executable)
    else:
        # Otherwise, put them in the project root
        return os.path.dirname(__file__)

DATA_DIR = get_data_dir()
DB_PATH = os.path.join(DATA_DIR, "wellbeing.db")
CURRENT_JSON_PATH = os.path.join(DATA_DIR, "current.json")
CONFIG_PATH = os.path.join(DATA_DIR, "config.toml")

import shutil
if not os.path.exists(CONFIG_PATH):
    # Try to find default config.toml to copy
    base_dir = getattr(sys, '_MEIPASS', os.path.dirname(__file__))
    default_config = os.path.join(base_dir, "config.toml")
    if os.path.exists(default_config):
        shutil.copy2(default_config, CONFIG_PATH)

# ── Shared tracking state ──
_tracking_paused = False

def is_tracking_paused() -> bool:
    return _tracking_paused

def set_tracking_paused(paused: bool):
    global _tracking_paused
    _tracking_paused = paused

# ── Logging Configuration ──
import logging

LOG_PATH = os.path.join(DATA_DIR, "debug.log")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, encoding="utf-8"),
        logging.StreamHandler(sys.stdout) if sys.stdout else logging.NullHandler()
    ]
)

logger = logging.getLogger("wellbeing")
logger.info("Logging initialized. Data directory: %s", DATA_DIR)

