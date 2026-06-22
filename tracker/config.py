import tomllib
import os
from pydantic import BaseModel
from typing import List

class TrackingConfig(BaseModel):
    idle_timeout_seconds: int
    poll_interval_ms: int
    store_full_url: bool

class BrowsersConfig(BaseModel):
    tracked: List[str]

class ServerConfig(BaseModel):
    host: str
    port: int

class AppConfig(BaseModel):
    tracking: TrackingConfig
    browsers: BrowsersConfig
    server: ServerConfig

import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from common import CONFIG_PATH

def load_config():
    paths_to_try = [
        CONFIG_PATH,
        "config.toml",
        "../config.toml",
        r"d:\Digital wellbeing\wellbeing-tracker\config.toml"
    ]
    for p in paths_to_try:
        if os.path.exists(p):
            with open(p, "rb") as f:
                data = tomllib.load(f)
            return AppConfig(**data)
    raise FileNotFoundError("config.toml not found")

cfg = load_config()
