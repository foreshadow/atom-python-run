@echo off
setlocal ENABLEDELAYEDEXPANSION
REM spawn the child
REM it's tricky because shift doesn't affect %*, so hack it out
REM https://en.wikibooks.org/wiki/Windows_Batch_Scripting#Command-line_arguments
set file_python=%1
set args=%2

set on_p=_-:ON PAUSE:-_
set b_pause=true
echo %args% | findstr /R /C:"\<*%on_p%\>" 1> nul
if %ERRORLEVEL% == 1 (
  set b_pause=false
)

set args=%args::@:=" "%
if !b_pause! == true (
  set args=%args: "_-:ON PAUSE:-_"=%
) else (
  set args=%args: "_-:OFF PAUSE:-_"=%
)

if !args! == "" (
  python %file_python%
) else (
  set args=%args:"_-:ON PAUSE:-_"=%
  set args=%args:"_-:OFF PAUSE:-_"=%
  python %file_python% %args%
)
echo:
echo:
if %ERRORLEVEL%==0 (
  echo:[96m=================================[0m
  echo:[96m^(The programa exited with code: %ERRORLEVEL%^)[0m
) else (
  echo:[91m=================================[0m
  echo:[91m^(The programa exited with code: %ERRORLEVEL%^)[0m
)

if %b_pause% == true (
  pause
)
exit %ERRORLEVEL%
