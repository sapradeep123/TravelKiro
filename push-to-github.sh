#!/bin/bash

# Script to push DocFlow to GitHub
# Run this script to push the code to your repository

echo "================================================"
echo "DocFlow - Push to GitHub"
echo "================================================"
echo ""

# Check if git is configured
if ! git config user.name > /dev/null 2>&1; then
    echo "Git user not configured. Please configure:"
    echo "  git config --global user.name \"Your Name\""
    echo "  git config --global user.email \"your.email@example.com\""
    exit 1
fi

# Show current remote
echo "Current remote repository:"
git remote -v
echo ""

# Confirm push
read -p "Do you want to push to this repository? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Push cancelled."
    exit 0
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
echo "You may be prompted for your GitHub credentials."
echo ""

git push -u origin master --force

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "✓ Successfully pushed to GitHub!"
    echo "================================================"
    echo ""
    echo "Your team can now clone the repository:"
    echo "  git clone https://github.com/srdaspradeep-gif/DMsDoc.git"
    echo ""
    echo "Then follow the SETUP.md instructions to run the application."
else
    echo ""
    echo "================================================"
    echo "✗ Push failed!"
    echo "================================================"
    echo ""
    echo "Common issues:"
    echo "1. Authentication failed - You may need to use a Personal Access Token"
    echo "   Generate one at: https://github.com/settings/tokens"
    echo "   Use it as your password when prompted"
    echo ""
    echo "2. Permission denied - Make sure you have write access to the repository"
    echo ""
    echo "3. Repository doesn't exist - Create it first at:"
    echo "   https://github.com/new"
fi
