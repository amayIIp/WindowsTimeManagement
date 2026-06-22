import aiosqlite
import os

import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from common import DB_PATH

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        await db.execute("""
            CREATE TABLE IF NOT EXISTS activity_log (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                exe_name         TEXT    NOT NULL,
                window_title     TEXT,
                url_domain       TEXT,
                url_full         TEXT,
                start_time       REAL    NOT NULL,
                end_time         REAL    NOT NULL,
                duration_seconds INTEGER NOT NULL
            )
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_start ON activity_log(start_time)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_exe ON activity_log(exe_name)")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_url ON activity_log(url_domain)")
        
        await db.execute("""
            CREATE TABLE IF NOT EXISTS daily_summaries (
                date             TEXT    PRIMARY KEY,
                total_seconds    INTEGER,
                top_apps_json    TEXT,
                top_sites_json   TEXT,
                last_computed    REAL
            )
        """)
        await db.commit()

class Session:
    def __init__(self, exe: str, title: str, url: str | None, url_full: str | None, start_time: float):
        self.id = None
        self.exe = exe
        self.title = title
        self.url = url
        self.url_full = url_full
        self.start_time = start_time
        self.end_time = start_time
        
    @property
    def key(self):
        return (self.exe, self.url_full if self.url_full else self.title)

import datetime
from common import logger

async def save_or_update_session(session: Session):
    duration = int(session.end_time - session.start_time)
    if duration < 0:
        return
        
    start_dt = datetime.datetime.fromtimestamp(session.start_time)
    end_dt = datetime.datetime.fromtimestamp(session.end_time)
    
    # Handle crossing midnight: finalize old day and start new day
    if start_dt.date() != end_dt.date():
        midnight = end_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        midnight_ts = midnight.timestamp()
        
        # Save part up to midnight
        session.end_time = midnight_ts
        await save_or_update_session(session)
        
        # Modify session in-place for the next day's part
        session.id = None
        session.start_time = midnight_ts
        session.end_time = end_dt.timestamp()
        duration = int(session.end_time - session.start_time)
        logger.info(f"Session for {session.exe} crossed midnight. Splitting session.")

    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        if session.id is None:
            # Insert new row
            cursor = await db.execute(
                """
                INSERT INTO activity_log (exe_name, window_title, url_domain, url_full, start_time, end_time, duration_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (session.exe, session.title, session.url, session.url_full, session.start_time, session.end_time, duration)
            )
            session.id = cursor.lastrowid
            await db.commit()
            logger.info(f"New session started: {session.exe} (ID: {session.id})")
        else:
            # Update existing row
            await db.execute(
                """
                UPDATE activity_log
                SET end_time = ?, duration_seconds = ?
                WHERE id = ?
                """,
                (session.end_time, duration, session.id)
            )
            await db.commit()
