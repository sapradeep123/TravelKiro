#!/usr/bin/env python3
"""
SPA-compatible HTTP server for serving the frontend build.
Serves index.html for all routes that don't match actual files.
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
DIST_DIR = SCRIPT_DIR / 'dist'

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    
    def end_headers(self):
        # Add headers for SPA
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        # Parse the path
        parsed_path = self.path.split('?', 1)[0].split('#', 1)[0]
        
        # Check if it's a static asset (starts with /_expo/ or /assets/)
        if parsed_path.startswith('/_expo/') or parsed_path.startswith('/assets/'):
            # Try to serve the actual file
            file_path = DIST_DIR / parsed_path.lstrip('/')
            if file_path.exists() and file_path.is_file():
                self.path = parsed_path
                super().do_GET()
            else:
                self.send_error(404, "File not found")
            return
        
        # Check if it's an actual file
        file_path = DIST_DIR / parsed_path.lstrip('/')
        if parsed_path != '/' and file_path.exists() and file_path.is_file():
            # Serve the actual file
            self.path = parsed_path
            super().do_GET()
        else:
            # For SPA routing, serve index.html for all other routes
            self.path = '/index.html'
            super().do_GET()

def run(port=8082):
    os.chdir(DIST_DIR)
    Handler = SPAHandler
    with socketserver.TCPServer(("0.0.0.0", port), Handler) as httpd:
        print(f"🌐 SPA Server running at http://0.0.0.0:{port}")
        print(f"📁 Serving from: {DIST_DIR}")
        print(f"✨ SPA mode: All routes serve index.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⏹️  Server stopped.")
            sys.exit(0)

if __name__ == "__main__":
    PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8082
    run(PORT)

