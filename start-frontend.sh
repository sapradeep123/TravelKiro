#!/bin/bash
cd /root/travel/TravelKiro/frontend/dist
pkill -f "python3 -m http.server 8082" 2>/dev/null
sleep 1
nohup python3 -m http.server 8082 > /tmp/frontend-server.log 2>&1 &
echo "Frontend server started on port 8082"
sleep 2
ps aux | grep "python3 -m http.server 8082" | grep -v grep
