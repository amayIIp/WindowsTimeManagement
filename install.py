"""
WellbeingTracker Installer
──────────────────────────
Creates a Windows Task Scheduler task that auto-starts the tracker at logon
for ANY user, with auto-restart on failure.

Must be run as Administrator.
Usage:  python install.py
"""
import subprocess
import sys
import os
import ctypes
import tempfile


def is_admin() -> bool:
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def get_exe_path() -> str | None:
    if getattr(sys, 'frozen', False):
        return sys.executable
    # Dev mode: look for the built exe
    base = os.path.dirname(os.path.abspath(__file__))
    exe = os.path.join(base, 'dist', 'WellbeingTracker.exe')
    if os.path.exists(exe):
        return exe
    return None


TASK_XML_TEMPLATE = """\
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Digital Wellbeing Tracker - tracks screen time and app usage</Description>
  </RegistrationInfo>
  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>
      <Delay>PT30S</Delay>
    </LogonTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <GroupId>S-1-5-32-545</GroupId>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>false</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>true</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <DisallowStartOnRemoteAppSession>false</DisallowStartOnRemoteAppSession>
    <UseUnifiedSchedulingEngine>true</UseUnifiedSchedulingEngine>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <RestartOnFailure>
      <Interval>PT1M</Interval>
      <Count>999</Count>
    </RestartOnFailure>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>{exe_path}</Command>
      <WorkingDirectory>{working_dir}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>"""


def install():
    print("╔══════════════════════════════════════════╗")
    print("║   WellbeingTracker Installer             ║")
    print("╚══════════════════════════════════════════╝")
    print()

    if not is_admin():
        print("❌ ERROR: This script must be run as Administrator.")
        print("   Right-click → Run as administrator")
        input("\nPress Enter to exit...")
        return False

    exe_path = get_exe_path()
    if not exe_path:
        print("❌ ERROR: WellbeingTracker.exe not found.")
        print("   Build it first:  python -m PyInstaller WellbeingTracker.spec --noconfirm")
        input("\nPress Enter to exit...")
        return False

    exe_path = os.path.abspath(exe_path)
    working_dir = os.path.dirname(exe_path)
    task_name = "WellbeingTracker"

    print(f"   EXE path : {exe_path}")
    print(f"   Data dir : {working_dir}")
    print()

    # Remove existing task (if any)
    subprocess.run(
        ['schtasks', '/delete', '/tn', task_name, '/f'],
        capture_output=True,
    )

    # Write task XML to temp file
    xml_content = TASK_XML_TEMPLATE.format(
        exe_path=exe_path,
        working_dir=working_dir,
    )
    xml_path = os.path.join(tempfile.gettempdir(), 'wellbeing_task.xml')
    with open(xml_path, 'w', encoding='utf-16') as f:
        f.write(xml_content)

    # Create the scheduled task
    result = subprocess.run(
        ['schtasks', '/create', '/tn', task_name, '/xml', xml_path, '/f'],
        capture_output=True, text=True,
    )
    os.remove(xml_path)

    if result.returncode != 0:
        print(f"❌ Failed to create scheduled task:")
        print(f"   {result.stderr.strip()}")
        input("\nPress Enter to exit...")
        return False

    print("✅ Scheduled task created!")
    print("   • Triggers at logon for ALL users")
    print("   • Auto-restarts every 1 min on failure (999 retries)")
    print("   • Runs with highest available privileges")
    print("   • Runs on battery, hidden, no time limit")
    print()

    # Start it immediately
    subprocess.run(
        ['schtasks', '/run', '/tn', task_name],
        capture_output=True,
    )
    print("✅ WellbeingTracker started!")
    print()
    print("🎉 Installation complete. The tracker will auto-start on every login.")

    input("\nPress Enter to exit...")
    return True


if __name__ == '__main__':
    install()
