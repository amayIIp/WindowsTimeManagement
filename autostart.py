"""
Auto-start registration for WellbeingTracker.
Uses the Windows Registry (HKCU\\Run) to start the tracker at login.
No admin privileges required.
"""
import winreg
import sys
import ctypes


def _get_exe_path() -> str | None:
    """Return the path to the running exe (only works when frozen by PyInstaller)."""
    if getattr(sys, 'frozen', False):
        return sys.executable
    return None


def is_registered() -> bool:
    """Check if WellbeingTracker is set to auto-start."""
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
            0, winreg.KEY_READ,
        )
        try:
            winreg.QueryValueEx(key, "WellbeingTracker")
            return True
        except FileNotFoundError:
            return False
        finally:
            winreg.CloseKey(key)
    except Exception:
        return False


def register_autostart() -> bool:
    """Add WellbeingTracker to Windows startup (current user, no admin)."""
    exe = _get_exe_path()
    if not exe:
        return False
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
            0, winreg.KEY_SET_VALUE,
        )
        winreg.SetValueEx(key, "WellbeingTracker", 0, winreg.REG_SZ, f'"{exe}"')
        winreg.CloseKey(key)
        return True
    except Exception:
        return False


def unregister_autostart() -> bool:
    """Remove WellbeingTracker from Windows startup."""
    try:
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
            0, winreg.KEY_SET_VALUE,
        )
        try:
            winreg.DeleteValue(key, "WellbeingTracker")
        except FileNotFoundError:
            pass
        winreg.CloseKey(key)
        return True
    except Exception:
        return False


def show_welcome_popup():
    """Show a native Windows message box on first run."""
    MB_ICONINFORMATION = 0x00000040
    MB_TOPMOST = 0x00040000
    ctypes.windll.user32.MessageBoxW(
        0,
        "WellbeingTracker is now running!\n\n"
        "✓  Auto-start on login — enabled\n"
        "✓  Tracking your screen time\n"
        "✓  Double-click tray icon to open dashboard\n\n"
        "Right-click the tray icon for more options.",
        "WellbeingTracker — Installed",
        MB_ICONINFORMATION | MB_TOPMOST,
    )


def show_uninstall_popup():
    """Show confirmation after uninstalling."""
    MB_ICONINFORMATION = 0x00000040
    MB_TOPMOST = 0x00040000
    ctypes.windll.user32.MessageBoxW(
        0,
        "WellbeingTracker has been uninstalled.\n\n"
        "•  Auto-start removed\n"
        "•  Your data (wellbeing.db) is preserved\n\n"
        "The tracker will now exit.",
        "WellbeingTracker — Uninstalled",
        MB_ICONINFORMATION | MB_TOPMOST,
    )
