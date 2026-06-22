from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import os
from .. import db
from ..models import LiveTick, LiveCurrent

router = APIRouter()

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from common import CURRENT_JSON_PATH

async def read_current() -> dict | None:
    try:
        if not os.path.exists(CURRENT_JSON_PATH):
            return None
        with open(CURRENT_JSON_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return None

@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            current_data = await read_current()
            today_total = await db.get_today_total_seconds()
            
            tick = LiveTick(today_total_seconds=today_total, current=None)
            
            if current_data and current_data.get("active"):
                tick.current = LiveCurrent(
                    exe=current_data.get("exe", "Unknown"),
                    title=current_data.get("title", ""),
                    url=current_data.get("url"),
                    duration_seconds=current_data.get("duration_seconds", 0)
                )
                tick.today_total_seconds += tick.current.duration_seconds
                
            await websocket.send_json(tick.model_dump())
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
