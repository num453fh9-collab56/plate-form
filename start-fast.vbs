' Production mode: builds once, then serves optimized pages (much faster than dev).
' Close the dev server (start-dev.vbs) first — both use port 3000.
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\plate form\workvortex"
WshShell.Run "cmd /c npm run build > fast-run.log 2>&1 && npm run start >> fast-run.log 2>&1", 0, False
