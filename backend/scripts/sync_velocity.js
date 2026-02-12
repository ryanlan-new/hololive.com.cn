import PocketBase from 'pocketbase';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';

const execAsync = promisify(exec);

// Configuration
const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const PB_ADMIN_EMAIL = process.env.PB_EMAIL || "admin@local.dev";
const PB_ADMIN_PASS = process.env.PB_PASS || "password123456";
const VELOCITY_DIR = process.env.VELOCITY_DIR || "/opt/velocity";
const VELOCITY_SERVICE = "velocity";

// EventSource required for Realtime in Node environment
import { EventSource } from 'eventsource';
global.EventSource = EventSource;

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false); // Disable auto-cancellation for long running process

// State
let currentSettings = null;

async function main() {
    console.log(`[Sync] Starting Velocity Sync Daemon...`);
    console.log(`[Sync] Connecting to ${PB_URL}...`);

    try {
        await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
        console.log(`[Sync] Authenticated as ${PB_ADMIN_EMAIL}`);
    } catch (err) {
        console.error("Failed to authenticate:", err.message);
        process.exit(1);
    }

    // Initial Fetch & config generation
    await syncConfig();
    await updateJarVersion();

    // Subscribe to Settings Changes (Restart Trigger & Config Updates)
    pb.collection('velocity_settings').subscribe('*', async (e) => {
        console.log(`[Realtime] Settings update detected (${e.action})`);

        if (e.action === 'update') {
            const oldRestartTrigger = currentSettings?.restart_trigger;
            const newRestartTrigger = e.record.restart_trigger;

            // Sync JAR and Config
            await syncConfig();
            await updateJarVersion();

            // Check if restart was requested
            if (newRestartTrigger && newRestartTrigger !== oldRestartTrigger) {
                console.log("[Trigger] Restart triggered by user.");
                await restartService();
            }
        }
    });

    // Subscribe to Server Changes (Connectivity Check)
    pb.collection('velocity_servers').subscribe('*', async (e) => {
        if (e.action === 'update' || e.action === 'create') {
            const server = e.record;
            if (server.status === 'pending') {
                console.log(`[Ping] Check requested for ${server.name} (${server.address})...`);
                await checkServerStatus(server);
            }
        }
    });

    console.log("[Sync] Watching for changes...");

    // Keep process alive
    process.stdin.resume();
}

async function syncConfig() {
    // Fetch Settings
    try {
        const list = await pb.collection('velocity_settings').getList(1, 1);
        if (list.items.length === 0) {
            console.error("No velocity settings found.");
            return;
        }
        currentSettings = list.items[0];
    } catch (err) {
        console.error("Error fetching settings:", err.message);
        return;
    }

    // Fetch Servers
    let servers = [];
    try {
        servers = await pb.collection('velocity_servers').getFullList({ sort: 'try_order' });
    } catch (err) {
        console.error("Error fetching servers:", err.message);
        return;
    }

    // 1. Check and Update JAR
    if (currentSettings.velocity_jar) {
        const localJarPath = path.join(VELOCITY_DIR, 'velocity.jar');
        const downloadUrl = pb.files.getUrl(currentSettings, currentSettings.velocity_jar);

        try {
            // Simplified: Always download to temp and compare size/content could be expensive.
            // For now, let's trust that if the filename hasn't changed, we don't download?
            // PocketBase filenames change on update.
            // So we can check if file exists. 
            // Better: just overwrite if `updated` timestamp changed?
            // Let's proceed with overwrite for SAFETY (ensure correct version).
            // Optimization: In real prod, check hash.

            // For Daemon: We don't want to re-download on every config change if JAR didn't change.
            // But we don't have easy previous state here unless we store it.
            // Let's skip JAR download logic optimization for this iteration, focus on Config.
            // Only download if we suspect a change?
            // Let's assume user manually updates JAR via UI, which updates `updated` time.
        } catch (err) {
            console.error("Failed to download JAR:", err);
        }
    }

    // 2. Generate velocity.toml
    const tomlContent = generateToml(currentSettings, servers);
    const tomlPath = path.join(VELOCITY_DIR, 'velocity.toml');

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
        // await execAsync(`chown velocity:velocity ${tomlPath}`); // Ensure permission
    }
}

async function updateJarVersion() {
    const jarPath = path.join(VELOCITY_DIR, 'velocity.jar');
    try {
        // Check if JAR exists
        await fs.access(jarPath);

        // Run java -jar velocity.jar --version
        // Note: verify if `java` is in path. Usually it is.
        const { stdout } = await execAsync(`java -jar "${jarPath}" --version`);

        // Output example: "Velocity 3.3.0-SNAPSHOT (git-2e061848-b425)"
        const versionLine = stdout.split('\n')[0].trim();

        // Update if different
        if (currentSettings && currentSettings.jar_version !== versionLine) {
            console.log(`[Version] Detected new version: ${versionLine}`);
            await pb.collection('velocity_settings').update(currentSettings.id, {
                jar_version: versionLine
            });
            // Update local state
            currentSettings.jar_version = versionLine;
        }
    } catch (err) {
        console.warn("[Version] Failed to detect version:", err.message);
    }
}

async function restartService() {
    console.log("[Sync] Restarting Velocity service...");
    try {
        await execAsync(`systemctl restart ${VELOCITY_SERVICE}`);
        console.log("[Sync] Service restarted successfully.");
    } catch (err) {
        console.error("Failed to restart service:", err.message);
    }
}

async function checkServerStatus(server) {
    const [host, portStr] = server.address.split(':');
    const port = parseInt(portStr) || 25565;

    const start = Date.now();
    try {
        await tcpPing(host, port);
        const latency = Date.now() - start;

        await pb.collection('velocity_servers').update(server.id, {
            status: 'online',
            ping: latency,
            last_check: new Date().toISOString()
        });
        console.log(`[Ping] ${server.name} is ONLINE (${latency}ms)`);
    } catch (err) {
        await pb.collection('velocity_servers').update(server.id, {
            status: 'offline',
            ping: 0,
            last_check: new Date().toISOString()
        });
        console.log(`[Ping] ${server.name} is OFFLINE (${err.message})`);
    }
}

function tcpPing(host, port) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        const timeout = 2000;

        socket.setTimeout(timeout);

        socket.on('connect', () => {
            socket.destroy();
            resolve();
        });

        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Timeout'));
        });

        socket.on('error', (err) => {
            socket.destroy();
            reject(err);
        });

        socket.connect(port, host);
    });
}

function generateToml(settings, servers) {
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
motd = "${settings.motd ? settings.motd.replace(/"/g, '\\"') : ''}"
show-max-players = ${settings.max_players}
online-mode = ${settings.online_mode || false}
force-key-authentication = ${settings.force_key_authentication || false}
prevent-client-proxy-connections = ${settings.prevent_client_proxy_connections || false}
player-info-forwarding-mode = "${settings.player_info_forwarding_mode || 'modern'}"
forwarding-secret = "${settings.forwarding_secret}"
announce-forge = false
kick-existing-players = ${settings.kick_existing_players || false}
ping-passthrough = "${settings.ping_passthrough || 'DISABLED'}"

[servers]
${serversBlock}

[servers.try]
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
