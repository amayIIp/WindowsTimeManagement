from fastapi import APIRouter
from typing import List, Optional
from .. import db
from ..models import DailySummary, AppStats, SiteStats, TimelineEvent, WeeklyStat
import datetime

router = APIRouter()

@router.get("/today", response_model=DailySummary)
async def get_today(date: Optional[str] = None):
    if not date:
        date = datetime.datetime.now().strftime("%Y-%m-%d")
    total = await db.get_today_total_seconds(date)
    apps = await db.get_top_apps(date)
    sites = await db.get_top_sites(date)
    
    return DailySummary(
        date=date,
        total_seconds=total,
        top_apps=apps,
        top_sites=sites
    )

@router.get("/apps", response_model=List[AppStats])
async def get_apps(date: Optional[str] = None):
    return await db.get_top_apps(date)

@router.get("/sites", response_model=List[SiteStats])
async def get_sites(date: Optional[str] = None):
    return await db.get_top_sites(date)

@router.get("/timeline", response_model=List[TimelineEvent])
async def get_timeline(date: Optional[str] = None):
    return await db.get_timeline(date)

@router.get("/weekly", response_model=List[WeeklyStat])
async def get_weekly(date: Optional[str] = None):
    return await db.get_weekly_stats(date)

@router.get("/hourly")
async def get_hourly(date: Optional[str] = None):
    return await db.get_hourly_breakdown(date)

@router.get("/dates", response_model=List[str])
async def get_dates():
    return await db.get_tracked_dates()
