@echo off
setlocal
title mcVoiceHeads - instalator

echo ===============================
echo   mcVoiceHeads - instalator
echo ===============================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [BLAD] Nie znaleziono Node.js w PATH.
  echo Zainstaluj Node.js 18+ ^(https://nodejs.org/^) i uruchom ten plik ponownie.
  echo.
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo [BLAD] Nie znaleziono git w PATH.
  echo Zainstaluj git ^(https://git-scm.com/downloads^) i uruchom ten plik ponownie.
  echo.
  pause
  exit /b 1
)

set "URL=https://raw.githubusercontent.com/PiotrKajor/mcVoiceHeads/master/install.mjs"
set "SCRIPT=%TEMP%\mcvoiceheads-install.mjs"

echo Pobieram instalator:
echo   %URL%
if exist "%SCRIPT%" del "%SCRIPT%" >nul 2>nul
curl -fsSL -o "%SCRIPT%" "%URL%" 2>nul
if not exist "%SCRIPT%" (
  echo curl niedostepny lub blad pobierania - probuje PowerShell...
  powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing '%URL%' -OutFile '%SCRIPT%' } catch { exit 1 }"
)
if not exist "%SCRIPT%" (
  echo [BLAD] Nie udalo sie pobrac install.mjs. Sprawdz polaczenie z internetem.
  echo.
  pause
  exit /b 1
)

echo.
echo Uruchamiam instalator...
echo.
node "%SCRIPT%" %*
set "RC=%ERRORLEVEL%"

echo.
if "%RC%"=="0" (
  echo === Zakonczono. Sprawdz log powyzej i zrestartuj Discorda calkowicie. ===
) else (
  echo === Instalator zwrocil blad ^(kod %RC%^) - sprawdz log powyzej. ===
)
echo.
pause
endlocal
