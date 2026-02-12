#!/bin/bash

# Local Deployment Script
# Executed by webhook_server.js

set -e

PROJECT_DIR="/var/www/hololive.com.cn"
LOG_FILE="$PROJECT_DIR/deploy.log"

echo "==========================================" >> "$LOG_FILE"
echo "Deployment started at $(date)" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# 1. Reset and Pull
echo "[Deploy] Pulling latest code..." >> "$LOG_FILE"
git fetch --all >> "$LOG_FILE" 2>&1
git reset --hard origin/main >> "$LOG_FILE" 2>&1

# 2. Install Dependencies (Backend)
# echo "[Deploy] Installing backend dependencies..." >> "$LOG_FILE"
# cd backend
# npm install --production >> "$LOG_FILE" 2>&1
# cd ..

# 3. Install Dependencies & Build (Frontend)
echo "[Deploy] Installing frontend dependencies..." >> "$LOG_FILE"
npm install >> "$LOG_FILE" 2>&1

echo "[Deploy] Building frontend..." >> "$LOG_FILE"
# Ensure URL is set (can be sourced from .env)
export VITE_POCKETBASE_URL="https://hololive.com.cn"
npm run build >> "$LOG_FILE" 2>&1

# 4. Restart Services
echo "[Deploy] Restarting PocketBase service..." >> "$LOG_FILE"
systemctl restart pocketbase

echo "Deployment finished at $(date)" >> "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"
