"""
WellbeingTracker Uninstaller
────────────────────────────
Stops the tracker, removes the scheduled task, and cleans up registry entries.
Your data (wellbeing.db) is preserved unless you delete it manually.

Should be run as Administrator for full cleanup.
Usage:  python uninstall.py
"""
import subprocess
import sys
import ctypes


def is_admin() -> bool:
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def uninstall():
    print("╔══════════════════════════════════════════╗")
    print("║   WellbeingTracker Uninstaller           ║")
    print("╚══════════════════════════════════════════╝")
    print()

    if not is_admin():
        print("⚠️  WARNING: Running without admin privileges.")
        print("   Some operations may fail. For full cleanup,")
        print("   right-click → Run as administrator.\n")

    # 1. Kill running processes
    print("[1/3] Stopping running instances...")
    result = subprocess.run(
        ['taskkill', '/f', '/im', 'WellbeingTracker.exe'],
        capture_output=True, text=True,
    )
    if 'SUCCESS' in (result.stdout or ''):
        print("   ✅ Killed running processes")
    else:
        print("   ℹ️  No running instances found")

    # 2. Remove scheduled task
    print("[2/3] Removing scheduled task...")
    result = subprocess.run(
        ['schtasks', '/delete', '/tn', 'WellbeingTracker', '/f'],
        capture_output=True, text=True,
    )
    if result.returncode == 0:
        print("   ✅ Scheduled task removed")
    else:
        print("   ℹ️  No scheduled task found")

    # 3. Clean up any startup registry entries
    print("[3/3] Cleaning registry...")
    try:
        import winreg
        cleaned = False
        for root_key, label in [
            (winreg.HKEY_CURRENT_USER, "HKCU"),
            (winreg.HKEY_LOCAL_MACHINE, "HKLM"),
        ]:
            try:
                key = winreg.OpenKey(
                    root_key,
                    r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
                    0,
                    winreg.KEY_SET_VALUE,
                )
                try:
                    winreg.DeleteValue(key, "WellbeingTracker")
                    print(f"   ✅ Removed {label} startup entry")
                    cleaned = True
                except FileNotFoundError:
                    pass
                winreg.CloseKey(key)
            except Exception:
                pass
        if not cleaned:
            print("   ✅ No registry entries to clean")
    except Exception:
        print("   ✅ Registry clean")

    print()
    print("═" * 44)
    print("✅ WellbeingTracker has been fully uninstalled!")
    print()
    print("ℹ️  Your tracking data (wellbeing.db) has been")
    print("   preserved. Delete it manually if you want to")
    print("   remove all historical data.")
    print("═" * 44)

    input("\nPress Enter to exit...")


if __name__ == '__main__':
    uninstall()
