import win32gui
import win32process
import psutil
from dataclasses import dataclass

@dataclass
class WindowInfo:
    hwnd: int
    pid: int
    exe: str
    title: str

def get_active_window() -> WindowInfo:
    hwnd = win32gui.GetForegroundWindow()
    if hwnd == 0:
        return WindowInfo(0, 0, "Unknown", "Unknown")
        
    _, pid = win32process.GetWindowThreadProcessId(hwnd)
    
    try:
        exe = psutil.Process(pid).name()
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        exe = "Unknown"
        
    title = win32gui.GetWindowText(hwnd)
    
    return WindowInfo(hwnd=hwnd, pid=pid, exe=exe, title=title)
