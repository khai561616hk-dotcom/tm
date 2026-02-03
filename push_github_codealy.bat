@echo off
chcp 65001 >nul
title CodeAly - Auto Push to GitHub
color 0f
cls

echo ===================================================
echo   COBALT - TOOL DAY CODE LEN GITHUB TU DONG
echo ===================================================
echo.

:: 1. Kiem tra Git
echo [1/5] Dang kiem tra Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo LOI: May tinh cua anh chua cai dat Git!
    echo Vui long tai va cai dat Git tai day: https://git-scm.com/downloads
    echo Sau khi cai xong, hay chay lai file nay nhe.
    echo.
    pause
    exit /b
)
echo OK: Da tim thay Git.
echo.

:: 2. Nhap Link Repo
echo [2/5] Nhap Link Repository GitHub cua anh
echo (Vi du: https://github.com/username/ten-du-an.git)
echo.
set /p REPO_URL=">> Link GitHub: "

if "%REPO_URL%"=="" (
    echo.
    echo Ban chua nhap Link! Huy bo thao tac.
    pause
    exit /b
)

:: 3. Setup Git
echo.
echo [3/5] Dang cau hinh Git...
git init
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

:: 4. Commit Code
echo.
echo [4/5] Dang luu code...
git add .
git commit -m "Update full features: Dashboard, Portal, Staff Bulk Add, Reviews"

:: 5. Push
echo.
echo [5/5] DANG DAY CODE LEN GITHUB...
echo (Vui long dang nhap neu duoc hoi...)
echo.
git push -u origin main

echo.
if %errorlevel% equ 0 (
    color 0a
    echo ===================================================
    echo   THANH CONG! CODE DA DUOC DAY LEN GITHUB.
    echo ===================================================
) else (
    color 0c
    echo ===================================================
    echo   CO LOI XAY RA! Kiem tra lai Link hoac Mang.
    echo ===================================================
)
echo.
pause
