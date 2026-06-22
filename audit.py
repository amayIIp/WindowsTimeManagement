import os
import sys
import unittest
import datetime
import json
import asyncio
import threading
import time
import urllib.request
import urllib.parse
import uvicorn

# Ensure root folder is in python path
sys.path.append(os.path.dirname(__file__))

from common import DB_PATH, LOG_PATH, CURRENT_JSON_PATH
from tracker.url import _extract_site_from_title
from tracker.db import init_db, Session, save_or_update_session
from server.main import app

class TestWellbeingTracker(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print("\n[AUDIT] Initializing database for tests...")
        asyncio.run(init_db())
        
        print("[AUDIT] Starting background server on port 7332...")
        cls.config = uvicorn.Config(app, host="127.0.0.1", port=7332, log_level="warning")
        cls.server = uvicorn.Server(cls.config)
        cls.thread = threading.Thread(target=cls.server.run, daemon=True)
        cls.thread.start()
        time.sleep(1.5) # Wait for server to boot

    @classmethod
    def tearDownClass(cls):
        print("\n[AUDIT] Shutting down background server...")
        cls.server.should_exit = True
        cls.thread.join(timeout=2.0)

    def test_01_url_extraction(self):
        print("\n[AUDIT] Testing browser window title extraction fallbacks...")
        test_cases = [
            ("Advanced Agentic Coding - YouTube - Microsoft Edge", "youtube.com"),
            ("Python Developer Jobs - Google Search - Google Chrome", "google.com"),
            ("GitHub - google/wellbeing-tracker - Brave", "github.com"),
            ("replit.com/join/workspace - Opera", "replit.com"),
            ("New Tab", None),
            ("Settings - Firefox", None),
        ]
        for title, expected in test_cases:
            domain, _ = _extract_site_from_title(title)
            print(f"  Title: '{title}' -> Extracted: {domain} (Expected: {expected})")
            self.assertEqual(domain, expected)
        print("[PASS] Title extraction rules verified.")

    def test_02_database_initialization(self):
        print("\n[AUDIT] Testing database file existence...")
        self.assertTrue(os.path.exists(DB_PATH))
        print(f"[PASS] Database file created/verified at: {DB_PATH}")

    def test_03_realtime_db_updates(self):
        print("\n[AUDIT] Testing real-time database session updates...")
        # Start a dummy session
        sess = Session("test_app.exe", "Test Window Title", None, None, datetime.datetime.now().timestamp() - 10)
        
        # Test Insert
        asyncio.run(save_or_update_session(sess))
        self.assertIsNotNone(sess.id)
        first_id = sess.id
        print(f"  Session inserted. Assigned ID: {sess.id}")
        
        # Test Update
        sess.end_time = datetime.datetime.now().timestamp()
        asyncio.run(save_or_update_session(sess))
        self.assertEqual(sess.id, first_id)
        print(f"  Session updated. Verified ID remained: {sess.id}")
        print("[PASS] Real-time session save/update loop verified.")

    def test_04_api_endpoints(self):
        print("\n[AUDIT] Testing FastAPI endpoints...")
        
        # Test Today Summary
        with urllib.request.urlopen("http://127.0.0.1:7332/api/activity/today") as res:
            self.assertEqual(res.status, 200)
            data = json.loads(res.read().decode('utf-8'))
            self.assertIn("date", data)
            self.assertIn("total_seconds", data)
            print("  /api/activity/today -> OK")

        # Test Weekly Stat
        with urllib.request.urlopen("http://127.0.0.1:7332/api/activity/weekly") as res:
            self.assertEqual(res.status, 200)
            print("  /api/activity/weekly -> OK")

        # Test Dates list
        with urllib.request.urlopen("http://127.0.0.1:7332/api/activity/dates") as res:
            self.assertEqual(res.status, 200)
            data = json.loads(res.read().decode('utf-8'))
            self.assertIsInstance(data, list)
            print("  /api/activity/dates -> OK")

        # Test Diagnostics Status
        with urllib.request.urlopen("http://127.0.0.1:7332/api/debug/status") as res:
            self.assertEqual(res.status, 200)
            data = json.loads(res.read().decode('utf-8'))
            self.assertIn("db_total_rows", data)
            self.assertIn("cpu_percent", data)
            print("  /api/debug/status -> OK")
        
        # Test Logs
        with urllib.request.urlopen("http://127.0.0.1:7332/api/debug/logs") as res:
            self.assertEqual(res.status, 200)
            data = json.loads(res.read().decode('utf-8'))
            self.assertIn("logs", data)
            print("  /api/debug/logs -> OK")
        
        print("[PASS] API Router verification complete.")


if __name__ == "__main__":
    unittest.main()
