Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\plate form\workvortex"
WshShell.Run "cmd /c npm run dev > dev-run4.log 2>&1", 0, False
