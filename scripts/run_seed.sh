#!/bin/bash

echo "Installing dependencies..."
pip install httpx

echo ""
echo "Running seed script..."
python scripts/seed_data.py

