#!/bin/bash

# Setup Velocity Proxy on Ubuntu 24.04
# Usage: sudo ./setup_velocity.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[VELOCITY] $1${NC}"
}

# 1. Install Java 21 (Required for modern Minecraft/Velocity)
log "Installing OpenJDK 21..."
apt update
apt install -y openjdk-21-jre-headless curl

# 2. Create User
log "Creating velocity user..."
if ! id "velocity" &>/dev/null; then
    useradd -r -m -d /opt/velocity -s /bin/bash velocity
else
    log "User 'velocity' already exists."
fi

# 3. Setup Directories
IDIR="/opt/velocity"
mkdir -p "$IDIR"
chown velocity:velocity "$IDIR"

# 4. Download Initial Velocity JAR (Latest Stable)
# We download to a temporary location first
log "Downloading Velocity..."
# Get latest stable build URL from PaperMC API
# For simplicity, we hardcode a recent version or fetch dynamically.
# Let's fetch dynamically for 3.3.0 which is stable.
VELOCITY_VERSION="3.3.0-SNAPSHOT"
# Actually, the API path is /v2/projects/velocity/versions/3.3.0-SNAPSHOT/builds/...
# To be safe and simple, let's just download the latest promoted build or a fixed one.
# We will rely on the sync script to update it later if needed, but we need a base.
# GitHub releases are not the primary distribution.
# Let's use a widely compatible one.
# Actually, let's just download from the official download API if possible or use a known one.
# https://api.papermc.io/v2/projects/velocity/versions/3.3.0-SNAPSHOT/builds/396/downloads/velocity-3.3.0-SNAPSHOT-396.jar
DOWNLOAD_URL="https://api.papermc.io/v2/projects/velocity/versions/3.4.0-SNAPSHOT/builds/453/downloads/velocity-3.4.0-SNAPSHOT-453.jar"

if [ ! -f "$IDIR/velocity.jar" ]; then
    curl -o "$IDIR/velocity.jar" "$DOWNLOAD_URL"
    chown velocity:velocity "$IDIR/velocity.jar"
    log "Velocity installed."
fi

# 5. Create Systemd Service
log "Creating systemd service..."
cat > /etc/systemd/system/velocity.service <<EOF
[Unit]
Description=Velocity Proxy Server
After=network.target

[Service]
User=velocity
Group=velocity
WorkingDirectory=/opt/velocity
# Use the jar found in the directory. Sync script might update it.
ExecStart=/usr/bin/java -Xms512M -Xmx512M -jar velocity.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable velocity
# We don't start it yet because config might be missing.
# But it will generate default config if started.
# Let's start it to generate defaults, then stop it?
# Or usually we want the sync script to generate the config first.
log "Velocity service installed but NOT started. Run the sync script to configure and start it."

echo -e "${GREEN}Velocity setup complete!${NC}"
