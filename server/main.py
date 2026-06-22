from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .routers import activity, ws, debug
import os

app = FastAPI(title="Wellbeing Tracker", docs_url="/api/docs")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activity.router, prefix="/api/activity")
app.include_router(ws.router)
app.include_router(debug.router, prefix="/api/debug")

import sys

if getattr(sys, 'frozen', False):
    dist_path = os.path.join(sys._MEIPASS, "dashboard", "dist")
else:
    dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard", "dist")

# Ensure the directory exists so FastAPI doesn't crash on startup if not built yet
os.makedirs(dist_path, exist_ok=True)
if not os.path.exists(os.path.join(dist_path, "index.html")):
    with open(os.path.join(dist_path, "index.html"), "w") as f:
        f.write("<h1>Dashboard not built yet. Run 'npm run build' in dashboard dir.</h1>")

app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")
