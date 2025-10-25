@echo off
echo Starting JSON Server for Podcast Platform...
echo.
echo Server will run on: http://localhost:3001
echo API endpoint: http://localhost:3001/api/episodes
echo.
echo Press Ctrl+C to stop the server
echo.
json-server --watch db.json --port 3001 --routes routes.json --middlewares cors.js
pause
