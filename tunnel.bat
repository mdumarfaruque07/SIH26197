@echo off
title Cloudflare Tunnel - Sanskriti Khoj Backend
echo ========================================================
echo Starting Cloudflare Tunnel for Sanskriti Khoj (Port 5000)
echo ========================================================
echo.
echo Make sure your backend server is running in another terminal:
echo (cd server ^&^& npm run dev)
echo.
echo Generating public HTTPS link...
.\cloudflared.exe tunnel --url http://localhost:5000
pause
