from fastapi import APIRouter, HTTPException
import os
import sys
import psutil
import datetime
import random
import json
import aiosqlite
from pydantic import BaseModel
from typing import List, Dict, Any

from tracker.config import cfg
from common import DB_PATH, LOG_PATH, CURRENT_JSON_PATH, logger

router = APIRouter()

class DebugStatus(BaseModel):
    pid: int
    os: str
    python_version: str
    frozen: bool
    db_path: str
    db_size_bytes: int
    db_total_rows: int
    log_path: str
    log_size_bytes: int
    cpu_percent: float
    memory_rss_bytes: int
    current_activity: Dict[str, Any]
    config: Dict[str, Any]

@router.get("/status", response_model=DebugStatus)
async def get_status():
    proc = psutil.Process()
    
    # DB Stats
    db_size = 0
    if os.path.exists(DB_PATH):
        db_size = os.path.getsize(DB_PATH)
        
    db_rows = 0
    try:
        async with aiosqlite.connect(DB_PATH, timeout=5.0) as db:
            async with db.execute("SELECT COUNT(*) FROM activity_log") as cursor:
                row = await cursor.fetchone()
                db_rows = row[0] if row else 0
    except Exception as e:
        logger.error(f"Error querying DB row count: {e}")
        
    # Log stats
    log_size = 0
    if os.path.exists(LOG_PATH):
        log_size = os.path.getsize(LOG_PATH)
        
    # Current activity
    current_act = {"active": False}
    if os.path.exists(CURRENT_JSON_PATH):
        try:
            with open(CURRENT_JSON_PATH, "r") as f:
                current_act = json.load(f)
        except Exception:
            pass
            
    # Config serialization
    config_dict = {
        "idle_timeout_seconds": cfg.tracking.idle_timeout_seconds,
        "poll_interval_ms": cfg.tracking.poll_interval_ms,
        "store_full_url": cfg.tracking.store_full_url,
        "tracked_browsers": cfg.browsers.tracked,
        "server_host": cfg.server.host,
        "server_port": cfg.server.port
    }
    
    return DebugStatus(
        pid=os.getpid(),
        os=sys.platform,
        python_version=sys.version,
        frozen=getattr(sys, 'frozen', False),
        db_path=DB_PATH,
        db_size_bytes=db_size,
        db_total_rows=db_rows,
        log_path=LOG_PATH,
        log_size_bytes=log_size,
        cpu_percent=proc.cpu_percent(interval=None),
        memory_rss_bytes=proc.memory_info().rss,
        current_activity=current_act,
        config=config_dict
    )

@router.get("/logs")
async def get_logs(lines: int = 150):
    if not os.path.exists(LOG_PATH):
        return {"logs": ["Log file does not exist yet."]}
        
    try:
        # Read the last N lines of the log file
        with open(LOG_PATH, "r", encoding="utf-8", errors="ignore") as f:
            all_lines = f.readlines()
            last_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines
            # Strip trailing newlines
            return {"logs": [line.rstrip() for line in last_lines]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read log file: {str(e)}")

@router.post("/simulate")
async def run_simulation():
    logger.info("Simulation requested. Generating 7 days of mock tracking data...")
    
    apps = [
        ("code.exe", "index.tsx - wellbeing-tracker - Visual Studio Code", None, None),
        ("msedge.exe", "Python Developer Jobs - Google Search", "google.com", "https://www.google.com/search?q=python+developer"),
        ("msedge.exe", "Advanced Agentic Coding with Gemini - YouTube", "youtube.com", "https://www.youtube.com/watch?v=gemini-agentic"),
        ("chrome.exe", "GitHub - googlemind/wellbeing-tracker: digital wellbeing app", "github.com", "https://github.com/googlemind/wellbeing-tracker"),
        ("Discord.exe", "Discord | #general | AI Engineers", None, None),
        ("Spotify.exe", "Chill Lofi Beats to Code/Relax To", None, None),
        ("Slack.exe", "Slack | Google DeepMind Workspace", None, None),
        ("Notion.exe", "Digital Wellbeing App Roadmap - Notion Workspace", None, None),
    ]
    
    now = datetime.datetime.now()
    sessions = []
    
    # Generate mock logs going back 7 days
    for d in range(7, 0, -1):
        day = now - datetime.timedelta(days=d)
        
        # 15 to 35 sessions per day
        num_sessions = random.randint(15, 35)
        
        # Workday starts between 8 AM and 10 AM
        current_time = day.replace(hour=random.randint(8, 10), minute=random.randint(0, 59), second=0, microsecond=0)
        
        for _ in range(num_sessions):
            exe, title, url_domain, url_full = random.choice(apps)
            
            # Duration: between 1 minute (60s) and 1 hour (3600s)
            duration = random.randint(60, 3600)
            
            start_ts = current_time.timestamp()
            end_ts = start_ts + duration
            
            sessions.append((exe, title, url_domain, url_full, start_ts, end_ts, duration))
            
            # Gap of idle / other time (5 minutes to 45 minutes)
            current_time += datetime.timedelta(seconds=duration + random.randint(300, 2700))
            
            # Stop generating if it goes past 11 PM
            if current_time.hour >= 23:
                break
                
    try:
        async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
            await db.executemany(
                """
                INSERT INTO activity_log (exe_name, window_title, url_domain, url_full, start_time, end_time, duration_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                sessions
            )
            await db.commit()
            
        logger.info(f"Successfully generated and inserted {len(sessions)} mock tracking rows.")
        return {"status": "success", "rows_inserted": len(sessions)}
    except Exception as e:
        logger.error(f"Failed to insert mock data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate mock data: {str(e)}")
