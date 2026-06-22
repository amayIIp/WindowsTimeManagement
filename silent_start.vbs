Set WshShell = CreateObject("WScript.Shell")
' Run the batch file silently (0 means hidden window)
WshShell.Run chr(34) & "D:\Digital wellbeing\wellbeing-tracker\run.bat" & Chr(34), 0
Set WshShell = Nothing
