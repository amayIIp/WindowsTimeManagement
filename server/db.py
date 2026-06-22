import aiosqlite
import os
import datetime
from .models import AppStats, SiteStats, TimelineEvent

import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from common import DB_PATH

def get_day_bounds(date_str: str = None) -> tuple[float, float]:
    if not date_str:
        dt = datetime.datetime.now()
    else:
        dt = datetime.datetime.strptime(date_str, "%Y-%m-%d")
    
    start_dt = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    end_dt = start_dt + datetime.timedelta(days=1)
    
    return start_dt.timestamp(), end_dt.timestamp()

async def get_today_total_seconds(date_str: str = None) -> int:
    start_ts, end_ts = get_day_bounds(date_str)
    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        async with db.execute(
            "SELECT SUM(duration_seconds) FROM activity_log WHERE start_time >= ? AND start_time < ?",
            (start_ts, end_ts)
        ) as cursor:
            row = await cursor.fetchone()
            return row[0] if row and row[0] else 0

async def get_top_apps(date_str: str = None) -> list[AppStats]:
    start_ts, end_ts = get_day_bounds(date_str)
    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        async with db.execute(
            """
            SELECT exe_name, SUM(duration_seconds) as total
            FROM activity_log 
            WHERE start_time >= ? AND start_time < ?
            GROUP BY exe_name
            ORDER BY total DESC
            LIMIT 10
            """,
            (start_ts, end_ts)
        ) as cursor:
            rows = await cursor.fetchall()
            return [AppStats(name=row[0], duration_seconds=row[1]) for row in rows]

async def get_top_sites(date_str: str = None) -> list[SiteStats]:
    start_ts, end_ts = get_day_bounds(date_str)
    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        async with db.execute(
            """
            SELECT url_domain, SUM(duration_seconds) as total
            FROM activity_log 
            WHERE start_time >= ? AND start_time < ? AND url_domain IS NOT NULL
            GROUP BY url_domain
            ORDER BY total DESC
            LIMIT 10
            """,
            (start_ts, end_ts)
        ) as cursor:
            rows = await cursor.fetchall()
            return [SiteStats(domain=row[0], duration_seconds=row[1]) for row in rows]

async def get_timeline(date_str: str = None) -> list[TimelineEvent]:
    start_ts, end_ts = get_day_bounds(date_str)
    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        async with db.execute(
            """
            SELECT exe_name, window_title, url_domain, start_time, end_time, duration_seconds
            FROM activity_log 
            WHERE start_time >= ? AND start_time < ?
            ORDER BY start_time ASC
            """,
            (start_ts, end_ts)
        ) as cursor:
            rows = await cursor.fetchall()
            return [
                TimelineEvent(
                    exe=row[0], title=row[1], url=row[2],
                    start_time=row[3], end_time=row[4], duration_seconds=row[5]
                ) for row in rows
            ]

async def get_weekly_stats(date_str: str = None) -> list[dict]:
    if not date_str:
        dt = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        try:
            dt = datetime.datetime.strptime(date_str, "%Y-%m-%d").replace(hour=0, minute=0, second=0, microsecond=0)
        except Exception:
            dt = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
    days = []
    for i in range(6, -1, -1):
        day = dt - datetime.timedelta(days=i)
        days.append(day)
    
    start_ts = days[0].timestamp()
    end_ts = (dt + datetime.timedelta(days=1)).timestamp()
    
    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        async with db.execute(
            """
            SELECT start_time, duration_seconds
            FROM activity_log 
            WHERE start_time >= ? AND start_time < ?
            """,
            (start_ts, end_ts)
        ) as cursor:
            rows = await cursor.fetchall()
            
    totals = {d.strftime("%Y-%m-%d"): 0 for d in days}
    
    for start_time, duration in rows:
        d_str = datetime.datetime.fromtimestamp(start_time).strftime("%Y-%m-%d")
        if d_str in totals:
            totals[d_str] += duration
            
    return [{"date": k, "total_seconds": v} for k, v in totals.items()]

async def get_hourly_breakdown(date_str: str = None) -> list[dict]:
    start_ts, end_ts = get_day_bounds(date_str)
    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        async with db.execute(
            "SELECT start_time, duration_seconds FROM activity_log WHERE start_time >= ? AND start_time < ?",
            (start_ts, end_ts)
        ) as cursor:
            rows = await cursor.fetchall()
    
    hourly = {h: 0 for h in range(24)}
    for start_time, duration in rows:
        hour = datetime.datetime.fromtimestamp(start_time).hour
        hourly[hour] += duration
    
    return [{"hour": h, "total_seconds": s} for h, s in hourly.items()]

async def get_tracked_dates() -> list[str]:
    async with aiosqlite.connect(DB_PATH, timeout=10.0) as db:
        async with db.execute(
            "SELECT DISTINCT date(start_time, 'unixepoch', 'localtime') as day FROM activity_log ORDER BY day DESC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [row[0] for row in rows if row[0]]
