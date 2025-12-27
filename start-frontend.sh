#!/bin/bash
cd /root/travel/TravelKiro/frontend
pkill -f "python3.*serve-spa.py" 2>/dev/null
pkill -f "python3 -m http.server 8082" 2>/dev/null
pkill -f "python3.*server.py" 2>/dev/null
sleep 1
chmod +x serve-spa.py
nohup python3 serve-spa.py 8082 > /tmp/frontend-server.log 2>&1 &
echo "Frontend server started on port 8082 (SPA mode)"
sleep 2
ps aux | grep "python3.*serve-spa.py" | grep -v grep
