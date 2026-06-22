import win32api
import ctypes

class LASTINPUTINFO(ctypes.Structure):
    _fields_ = [
        ("cbSize", ctypes.c_uint),
        ("dwTime", ctypes.c_uint)
    ]

def get_idle_seconds() -> float:
    info = LASTINPUTINFO()
    info.cbSize = ctypes.sizeof(LASTINPUTINFO)
    
    # Get last input time
    if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(info)):
        # Get current tick count
        current_tick = win32api.GetTickCount()
        
        # Handle tick count wraparound (every 49.7 days)
        if current_tick < info.dwTime:
            elapsed_ms = (0xFFFFFFFF - info.dwTime) + current_tick
        else:
            elapsed_ms = current_tick - info.dwTime
            
        return elapsed_ms / 1000.0
    return 0.0
