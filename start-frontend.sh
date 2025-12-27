#!/bin/bash
cd /root/travel/TravelKiro/frontend/dist
pkill -f "serve.*8082" 2>/dev/null
pkill -f "python3.*serve-spa.py" 2>/dev/null
pkill -f "python3 -m http.server 8082" 2>/dev/null
sleep 1
nohup serve -s . -l 8082 --host 0.0.0.0 > /tmp/frontend-server.log 2>&1 &
echo "Frontend server started on port 8082 (SPA mode with serve)"
sleep 2
ps aux | grep "serve.*8082" | grep -v grep
