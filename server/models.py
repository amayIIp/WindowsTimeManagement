from pydantic import BaseModel
from typing import List, Optional

class AppStats(BaseModel):
    name: str
    duration_seconds: int

class SiteStats(BaseModel):
    domain: str
    duration_seconds: int

class TimelineEvent(BaseModel):
    exe: str
    title: Optional[str]
    url: Optional[str]
    start_time: float
    end_time: float
    duration_seconds: int

class DailySummary(BaseModel):
    date: str
    total_seconds: int
    top_apps: List[AppStats]
    top_sites: List[SiteStats]

class LiveCurrent(BaseModel):
    exe: str
    title: str
    url: Optional[str]
    duration_seconds: int

class LiveTick(BaseModel):
    type: str = "tick"
    current: Optional[LiveCurrent]
    today_total_seconds: int

class WeeklyStat(BaseModel):
    date: str
    total_seconds: int
