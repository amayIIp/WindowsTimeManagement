import asyncio
import time
import json
import os
from .window import get_active_window
from .url import get_browser_url
from .idle import get_idle_seconds
from .db import save_or_update_session, Session, init_db
from .config import cfg

import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from common import CURRENT_JSON_PATH, is_tracking_paused, logger

async def write_current(session: Session | None):
    if session is None:
        data = {"active": False}
    else:
        duration = int(time.time() - session.start_time)
        data = {
            "active": True,
            "exe": session.exe,
            "title": session.title,
            "url": session.url_full if cfg.tracking.store_full_url else session.url,
            "duration_seconds": duration,
            "start_time": session.start_time
        }
    try:
        with open(CURRENT_JSON_PATH, "w") as f:
            json.dump(data, f)
    except Exception:
        pass # Ignore file write errors if read concurrently

async def run():
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized. Starting wellbeing tracker loop.")
    session = None
    
    while True:
        await asyncio.sleep(cfg.tracking.poll_interval_ms / 1000.0)
        
        # Check if tracking is paused (from tray icon)
        if is_tracking_paused():
            if session:
                logger.info("Tracking paused. Saving current session: %s", session.exe)
                session.end_time = time.time()
                await save_or_update_session(session)
                session = None
                await write_current(None)
            await asyncio.sleep(1)
            continue
        
        idle_time = get_idle_seconds()
        if idle_time > cfg.tracking.idle_timeout_seconds:
            if session:
                backtracked_end = max(session.start_time, time.time() - idle_time)
                logger.info("Idle timeout reached (%ds idle). Finalizing session for %s at %s", 
                            int(idle_time), session.exe, 
                            time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(backtracked_end)))
                session.end_time = backtracked_end
                await save_or_update_session(session)
                session = None
                await write_current(None)
            continue
            
        win = get_active_window()
        url_domain, url_full = get_browser_url(win.exe, win.hwnd, win.title)
        
        now = time.time()
        
        # Group by executable and window title to prevent splits due to intermittent URL tracking failures
        if session and session.exe == win.exe and session.title == win.title:
            session.end_time = now
            # If we acquire a URL during the session that wasn't present before, update it!
            if not session.url and url_domain:
                session.url = url_domain
                session.url_full = url_full
                logger.info("Acquired URL domain mid-session for %s -> %s", session.exe, url_domain)
        else:
            if session:
                session.end_time = now
                await save_or_update_session(session)
                logger.info("Session ended: %s (%s). Duration: %ds", 
                            session.exe, session.url or session.title, int(session.end_time - session.start_time))
            
            session = Session(win.exe, win.title, url_domain, url_full, now)
            logger.info("Session started: %s (%s)", win.exe, url_domain or win.title)
            
        await save_or_update_session(session)
        await write_current(session)

