@ECHO OFF

ECHO Auto pulling, adding, committing, and pushing on Github.

ECHO -------- Build --------
npm run build

ECHO -------- Adding --------
git add .
git status

ECHO -------- Commiting --------

REM commit message
set /p commit_message=Enter commit message:
git commit -m "%commit_message%"

ECHO -------- Pushing --------
git push

ECHO Don't Have a Good Day, Have a Great Day
PAUSE
exit
