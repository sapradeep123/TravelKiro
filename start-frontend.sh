#!/bin/bash
cd /root/travel/TravelKiro/frontend/dist
pkill -f "serve.*8082" 2>/dev/null
pkill -f "python3.*serve-spa.py" 2>/dev/null
pkill -f "python3 -m http.server 8082" 2>/dev/null
sleep 1
# Try serve command, fallback to npx serve if not in PATH
if command -v serve &> /dev/null; then
    nohup serve -s . -l 8082 --host 0.0.0.0 > /tmp/frontend-server.log 2>&1 &
elif command -v npx &> /dev/null; then
    nohup npx -y serve -s . -l 8082 --host 0.0.0.0 > /tmp/frontend-server.log 2>&1 &
else
    echo "Error: Neither 'serve' nor 'npx' found. Install serve: npm install -g serve"
    exit 1
fi
echo "Frontend server started on port 8082 (SPA mode with serve)"
sleep 3
ps aux | grep "serve.*8082\|npx.*serve" | grep -v grep
