import PocketBase from 'pocketbase';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const PB_ADMIN_EMAIL = process.env.PB_EMAIL || "admin@local.dev";
const PB_ADMIN_PASS = process.env.PB_PASS || "password123456";
const VELOCITY_DIR = process.env.VELOCITY_DIR || "/opt/velocity";
const VELOCITY_SERVICE = "velocity";

const pb = new PocketBase(PB_URL);

async function main() {
    console.log(`[Sync] Connecting to ${PB_URL}...`);

    try {
        await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
    } catch (err) {
        // Try acting as the predefined app user if admin fails (though we need admin for some things? No, users collection is fine)
        // But we need to read 'velocity_settings' which might be restricted.
        // Assuming default admin exists.
        console.error("Failed to authenticate:", err.message);
        process.exit(1);
    }

    // Fetch Data
    let settings;
    try {
        const list = await pb.collection('velocity_settings').getList(1, 1);
        if (list.items.length === 0) {
            console.error("No velocity settings found.");
            return;
        }
        settings = list.items[0];
    } catch (err) {
        console.error("Error fetching settings:", err.message);
        return;
    }

    let servers = [];
    try {
        servers = await pb.collection('velocity_servers').getFullList({ sort: 'try_order' });
    } catch (err) {
        console.error("Error fetching servers:", err.message);
        return;
    }

    // 1. Check and Update JAR
    if (settings.velocity_jar) {
        const jarName = settings.velocity_jar;
        const localJarPath = path.join(VELOCITY_DIR, 'velocity.jar');
        // We use a simple logic: If the file on disk doesn't match the one in PB (by lazy check or just always download if we track it?)
        // Better: We rely on a version file or metadata.
        // For now, let's just check if we can get the file.
        // Actually, to avoid re-downloading every time, we should check file size or hash.
        // But PB doesn't give hash in the default response easily (requires expanding).
        // Let's assume if the 'jar_version' field changes, we download.
        // OR: We interpret 'velocity_jar' filename.
        // Let's just download it to a temp file, compare size, or just overwrite. Overwriting is safer for "Config as State".

        console.log(`[Sync] Checking JAR: ${jarName}`);
        const downloadUrl = pb.files.getUrl(settings, settings.velocity_jar);

        // We will enable download only if a flag is passed or blindly?
        // Let's blindly download to ensure consistency.
        // Optimization: Check content-length head request?
        // For simplicity in this script: Download to temp, diff, move.

        try {
            const resp = await fetch(downloadUrl);
            if (resp.ok) {
                const buffer = await resp.arrayBuffer();
                const newContent = Buffer.from(buffer);

                let needsUpdate = true;
                try {
                    const currentContent = await fs.readFile(localJarPath);
                    if (currentContent.equals(newContent)) {
                        needsUpdate = false;
                    }
                } catch (e) {
                    // File doesn't exist
                }

                if (needsUpdate) {
                    console.log("[Sync] Update detected. Writing new velocity.jar...");
                    await fs.writeFile(localJarPath, newContent);
                    await fs.chown(localJarPath, 999, 999); // 999 is typical uid? No, we should use 'velocity' user.
                    // Node running as root can chown.
                    // We'll fix permissions later using chown command.
                    await execAsync(`chown velocity:velocity ${localJarPath}`);
                } else {
                    console.log("[Sync] velocity.jar is up to date.");
                }
            }
        } catch (err) {
            console.error("Failed to download JAR:", err);
        }
    }

    // 2. Generate velocity.toml
    const tomlContent = generateToml(settings, servers);
    const tomlPath = path.join(VELOCITY_DIR, 'velocity.toml');
    const forwardingPath = path.join(VELOCITY_DIR, 'forwarding.secret');

    let configChanged = false;

    // Check config difference
    try {
        const currentToml = await fs.readFile(tomlPath, 'utf8');
        if (currentToml.trim() !== tomlContent.trim()) {
            configChanged = true;
        }
    } catch (e) {
        configChanged = true;
    }

    if (configChanged) {
        console.log("[Sync] Configuration changed. Updating velocity.toml...");
        await fs.writeFile(tomlPath, tomlContent);
        await execAsync(`chown velocity:velocity ${tomlPath}`);
    } else {
        console.log("[Sync] Configuration is up to date.");
    }

    // Also write forwarding.secret if needed (though usually in toml or separate file depending on setup)
    // Modern velocity puts it in forwarding.secret file usually? No, strictly in toml for 'modern' forwarding?
    // Actually, modern forwarding uses a secret in the toml.
    // Let's stick to toml.

    // 3. Restart Service if needed
    if (configChanged) {
        console.log("[Sync] Restarting Velocity service...");
        try {
            await execAsync(`systemctl restart ${VELOCITY_SERVICE}`);
            console.log("[Sync] Service restarted.");
        } catch (err) {
            console.error("Failed to restart service:", err.message);
        }
    }
}

function generateToml(settings, servers) {
    // Basic Velocity Configuration Template
    // We construct the servers map manually.

    let serversBlock = "";
    servers.forEach(srv => {
        serversBlock += `"${srv.name}" = "${srv.address}"\n`;
    });

    let tryServers = servers
        .filter(s => s.is_try_server)
        .sort((a, b) => a.try_order - b.try_order)
        .map(s => `"${s.name}"`)
        .join(", ");

    if (!tryServers) {
        // Fallback to first server or empty
        if (servers.length > 0) tryServers = `"${servers[0].name}"`;
        else tryServers = "";
    }

    return `
# Velocity Configuration - Managed by PocketBase
# DO NOT EDIT MANUALLY

[config]
version = "2.5"

[server]
bind = "0.0.0.0:${settings.bind_port}"
motd = "${settings.motd.replace(/"/g, '\\"')}"
show-max-players = ${settings.max_players}
online-mode = false # Usually false for backend networks in CN, or true if BungeeGuard
force-key-authentication = false
prevent-client-proxy-connections = false
player-info-forwarding-mode = "modern"
forwarding-secret = "${settings.forwarding_secret}"
announce-forge = false
kick-existing-players = false
ping-passthrough = "DISABLED"

[servers]
${serversBlock}

[servers.try]
# Order of servers to try when connecting
try = [${tryServers}]

[advanced]
compression-threshold = 256
compression-level = -1
login-ratelimit = 3000
connection-timeout = 5000
read-timeout = 30000
haproxy-protocol = false
tcp-fast-open = false
bungee-plugin-message-channel = true
show-ping-requests = false

[query]
enabled = false
port = ${settings.bind_port}
map = "Velocity"
show-plugins = false
`;
}

main().catch(console.error);
