#!/bin/bash
cd /vercel/share/v0-project
git fetch origin main
git reset --hard origin/main
git clean -fd
echo "Repository reset to main branch"
