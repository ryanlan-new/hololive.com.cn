import PocketBase from 'pocketbase';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';
import { createHash } from 'crypto';

const execAsync = promisify(exec);

// Configuration
const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const PB_ADMIN_EMAIL = process.env.PB_EMAIL?.trim();
const PB_ADMIN_PASS = process.env.PB_PASS?.trim();
const VELOCITY_DIR = process.env.VELOCITY_DIR || "/opt/velocity";
const VELOCITY_SERVICE = "velocity";
const VELOCITY_OWNER = process.env.VELOCITY_OWNER || "ubuntu:ubuntu";
const FORWARDING_SECRET_FILENAME = "forwarding.secret";
const JAR_REF_MARKER = ".velocity_jar_ref";

// EventSource required for Realtime in Node environment
import { EventSource } from 'eventsource';
global.EventSource = EventSource;

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false); // Disable auto-cancellation for long running process

// State
let currentSettings = null;
let syncQueue = Promise.resolve({ configChanged: false, jarChanged: false, appliedHash: "" });
let lastReportedProxyStatus = null;

async function main() {
    console.log(`[Sync] Starting Velocity Sync Daemon...`);
    console.log(`[Sync] Connecting to ${PB_URL}...`);

    if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASS) {
        console.error("[Sync] Missing required env: PB_EMAIL and PB_PASS must be provided.");
        process.exit(1);
    }

    try {
        await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
        console.log(`[Sync] Authenticated as ${PB_ADMIN_EMAIL}`);
    } catch (err) {
        console.error("Failed to authenticate:", err.message);
        process.exit(1);
    }

    // Initial fetch + sync + optional restart
    await queueSync({ reason: "initial startup", restartIfChanged: true });

    // Subscribe to Settings Changes (Restart Trigger & Config Updates)
    pb.collection('velocity_settings').subscribe('*', async (e) => {
        // console.log(`[Realtime] Settings update detected (${e.action})`);

        if (e.action === 'update') {
            const oldSettings = currentSettings || {};
            const newSettings = e.record;

            // Fields that affect configuration or require action
            const configFields = [
                'bind_port', 'motd', 'max_players', 'online_mode',
                'force_key_authentication', 'prevent_client_proxy_connections',
                'player_info_forwarding_mode', 'forwarding_secret', 'sample_players_in_ping',
                'enable_player_address_logging',
                'kick_existing_players', 'ping_passthrough', 'velocity_jar',
                'announce_forge', 'accepts_transfers', 'haproxy_protocol',
                'show_ping_requests', 'connection_timeout', 'read_timeout',
                'compression_threshold', 'compression_level', 'login_ratelimit',
                'bungee_plugin_message_channel', 'tcp_fast_open', 'expose_proxy_commands',
                'query_enabled', 'query_port', 'query_map', 'query_show_plugins',
                'failover_on_unexpected_server_disconnect', 'log_command_executions',
                'log_player_connections', 'enable_reuse_port', 'command_rate_limit',
                'forward_commands_if_rate_limited', 'kick_after_rate_limited_commands',
                'tab_complete_rate_limit', 'kick_after_rate_limited_tab_completes'
            ];

            const hasConfigChanged = configFields.some(field => oldSettings[field] !== newSettings[field]);
            const restartTriggered = newSettings.restart_trigger && newSettings.restart_trigger !== oldSettings.restart_trigger;

            // Only sync if config actually changed or restart requested
            // This prevents infinite loop caused by monitorProxyStatus updating 'proxy_status'
            if (hasConfigChanged || restartTriggered) {
                console.log(`[Realtime] Config change detected. Syncing...`);
                await queueSync({
                    reason: "settings update",
                    restartIfChanged: true,
                    forceRestart: Boolean(restartTriggered)
                });
            } else {
                // Just update local state silently if it was just a status update
                currentSettings = newSettings;
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
        if (e.action === 'update' || e.action === 'create' || e.action === 'delete') {
            await queueSync({ reason: `server ${e.action}`, restartIfChanged: true });
        }
    });

    // Subscribe to Forced Hosts Changes
    pb.collection('velocity_forced_hosts').subscribe('*', async (e) => {
        if (e.action === 'create' || e.action === 'update' || e.action === 'delete') {
            console.log(`[Realtime] Forced Host change detected (${e.action}). Syncing...`);
            await queueSync({ reason: `forced-host ${e.action}`, restartIfChanged: true });
        }
    });

    // Start Monitoring
    monitorProxyStatus();

    console.log("[Sync] Watching for changes...");

    // Keep process alive
    process.stdin.resume();
}

async function queueSync({ reason = "manual", restartIfChanged = false, forceRestart = false } = {}) {
    syncQueue = syncQueue
        .catch(() => ({ configChanged: false, jarChanged: false, appliedHash: "" }))
        .then(async () => {
            try {
                const result = await syncConfig();
                await updateJarVersion();

                if (forceRestart) {
                    console.log(`[Sync] Restart requested (${reason}).`);
                    await restartService();
                } else if (restartIfChanged && (result.configChanged || result.jarChanged)) {
                    console.log(`[Sync] Restart required because config changed (${reason}).`);
                    await restartService();
                }

                await updateSyncMeta("ok", "", result.appliedHash);
                return result;
            } catch (err) {
                console.error(`[Sync] queueSync failed (${reason}):`, err.message);
                await updateSyncMeta("error", err.message || String(err), "");
                return { configChanged: false, jarChanged: false, appliedHash: "" };
            }
        });

    return syncQueue;
}

async function monitorProxyStatus() {
    console.log("[Monitor] Starting proxy status monitoring...");
    await updateProxyStatusOnce();

    // Check status every 15 seconds
    setInterval(async () => {
        await updateProxyStatusOnce();
    }, 15000);
}

async function updateProxyStatusOnce() {
    if (!currentSettings) {
        console.log("[Monitor] Waiting for settings to be loaded...");
        return;
    }

    let status;
    try {
        const { stdout } = await execAsync(`systemctl is-active ${VELOCITY_SERVICE}`);
        status = stdout.trim();
    } catch (err) {
        if (err.stdout) status = err.stdout.trim();
        else status = "error";
    }

    try {
        const payload = {
            proxy_status: status,
            last_heartbeat: new Date().toISOString()
        };
        await pb.collection('velocity_settings').update(currentSettings.id, payload);
        currentSettings = { ...currentSettings, ...payload };
        if (status !== lastReportedProxyStatus) {
            console.log(`[Monitor] Proxy status => ${status}`);
            lastReportedProxyStatus = status;
        }
    } catch (e) {
        console.error("[Monitor] Failed to update status:", e.message);
    }
}

async function syncConfig() {
    const noChange = { configChanged: false, jarChanged: false, appliedHash: "" };

    // Fetch Settings
    try {
        const list = await pb.collection('velocity_settings').getList(1, 1);
        if (list.items.length === 0) {
            console.error("No velocity settings found.");
            return noChange;
        }
        currentSettings = list.items[0];
    } catch (err) {
        console.error("Error fetching settings:", err.message);
        return noChange;
    }

    // Fetch Servers
    let servers;
    try {
        servers = await pb.collection('velocity_servers').getFullList({ sort: 'try_order' });
    } catch (err) {
        console.error("Error fetching servers:", err.message);
        return noChange;
    }

    // Fetch Forced Hosts
    let forcedHosts = [];
    try {
        forcedHosts = await pb.collection('velocity_forced_hosts').getFullList();
    } catch (err) {
        // Is okay, maybe collection not ready
    }

    let jarChanged = false;
    try {
        jarChanged = await syncJarIfNeeded(currentSettings);
    } catch (err) {
        console.error("[Sync] Failed to sync velocity.jar:", err.message);
    }

    try {
        await ensureForwardingSecretFile(currentSettings.forwarding_secret);
    } catch (err) {
        console.error("[Sync] Failed to sync forwarding secret file:", err.message);
    }

    // Generate velocity.toml
    const tomlContent = generateToml(currentSettings, servers, forcedHosts);
    const appliedHash = createHash("sha256").update(tomlContent).digest("hex");
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
        await ensureOwnership(tomlPath);
    }

    return { configChanged, jarChanged, appliedHash };
}

async function updateJarVersion() {
    const jarPath = path.join(VELOCITY_DIR, 'velocity.jar');
    try {
        // Check if JAR exists
        await fs.access(jarPath);

        // Velocity doesn't support --version CLI flag.
        // We use unzip to read META-INF/MANIFEST.MF
        // Implementation-Version: 3.3.0-SNAPSHOT
        const { stdout } = await execAsync(`unzip -p "${jarPath}" META-INF/MANIFEST.MF | grep "Implementation-Version"`);

        // Output example: "Implementation-Version: 3.3.0-SNAPSHOT"
        const versionLine = stdout.split(':')[1]?.trim();

        if (versionLine && currentSettings && currentSettings.jar_version !== versionLine) {
            console.log(`[Version] Detected new version: ${versionLine}`);
            await pb.collection('velocity_settings').update(currentSettings.id, {
                jar_version: versionLine
            });
            // Update local state
            currentSettings.jar_version = versionLine;
        }
    } catch (err) {
        // Suppress error if just unzip check fails, but log if needed
        // console.warn("[Version] Failed to detect version:", err.message);
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

async function syncJarIfNeeded(settings) {
    const jarField = Array.isArray(settings.velocity_jar) ? settings.velocity_jar[0] : settings.velocity_jar;
    if (!jarField) return false;

    const jarPath = path.join(VELOCITY_DIR, 'velocity.jar');
    const markerPath = path.join(VELOCITY_DIR, JAR_REF_MARKER);
    const jarRef = `${settings.id}:${jarField}:${settings.updated || ""}`;

    let markerRef;
    try {
        markerRef = (await fs.readFile(markerPath, "utf8")).trim();
    } catch (e) {
        markerRef = "";
    }

    if (markerRef === jarRef && await pathExists(jarPath)) {
        return false;
    }

    const jarUrl = pb.files.getURL(settings, jarField);
    const headers = pb.authStore.token ? { Authorization: `Bearer ${pb.authStore.token}` } : {};
    const res = await fetch(jarUrl, { headers });
    if (!res.ok) {
        throw new Error(`download failed with status ${res.status}`);
    }

    const fileBuffer = Buffer.from(await res.arrayBuffer());
    if (fileBuffer.length < 4 || fileBuffer[0] !== 0x50 || fileBuffer[1] !== 0x4b) {
        throw new Error("downloaded file is not a valid JAR/ZIP payload");
    }

    const tmpPath = `${jarPath}.tmp`;
    const backupPath = `${jarPath}.bak`;

    await fs.writeFile(tmpPath, fileBuffer);
    await ensureOwnership(tmpPath);

    const hadOldJar = await pathExists(jarPath);
    if (await pathExists(backupPath)) {
        await fs.unlink(backupPath);
    }

    try {
        if (hadOldJar) {
            await fs.rename(jarPath, backupPath);
        }
        await fs.rename(tmpPath, jarPath);
    } catch (err) {
        if (await pathExists(tmpPath)) {
            await fs.unlink(tmpPath);
        }
        if (hadOldJar && await pathExists(backupPath)) {
            await fs.rename(backupPath, jarPath);
        }
        throw err;
    }

    if (await pathExists(backupPath)) {
        await fs.unlink(backupPath);
    }
    await ensureOwnership(jarPath);
    await fs.writeFile(markerPath, `${jarRef}\n`);
    await ensureOwnership(markerPath);

    console.log("[Sync] velocity.jar updated from PocketBase file.");
    return true;
}

async function ensureForwardingSecretFile(secretValue) {
    const secret = `${secretValue || ""}`.trim();
    if (!secret) {
        throw new Error("forwarding_secret is empty");
    }

    const secretPath = path.join(VELOCITY_DIR, FORWARDING_SECRET_FILENAME);
    let existingSecret;
    try {
        existingSecret = (await fs.readFile(secretPath, "utf8")).trim();
    } catch (e) {
        existingSecret = "";
    }

    if (existingSecret === secret) return;

    await fs.writeFile(secretPath, `${secret}\n`, { mode: 0o600 });
    await ensureOwnership(secretPath);
}

async function ensureOwnership(filePath) {
    try {
        await execAsync(`chown ${VELOCITY_OWNER} "${filePath}"`);
    } catch (e) {
        console.warn(`[Sync] Failed to chown ${filePath}:`, e.message);
    }
}

async function updateSyncMeta(status, errorMessage = "", appliedHash = "") {
    if (!currentSettings?.id) return;

    const payload = {
        last_sync_status: status,
        last_sync_error: (errorMessage || "").slice(0, 1000),
        last_sync_at: new Date().toISOString(),
        last_applied_hash: appliedHash || "",
    };

    try {
        await pb.collection('velocity_settings').update(currentSettings.id, payload);
        currentSettings = { ...currentSettings, ...payload };
    } catch (e) {
        console.warn("[Sync] Failed to update sync metadata:", e.message);
    }
}

async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (e) {
        return false;
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

function generateToml(settings, servers, forcedHosts = []) {
    const toTomlString = (value) => `${value ?? ""}`.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const asNumber = (value, fallback) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const asBool = (value, fallback) => (typeof value === "boolean" ? value : fallback);

    let serversBlock = "";
    servers.forEach(srv => {
        serversBlock += `"${toTomlString(srv.name)}" = "${toTomlString(srv.address)}"\n`;
    });

    let tryServers = servers
        .filter(s => s.is_try_server)
        .sort((a, b) => a.try_order - b.try_order)
        .map(s => `"${toTomlString(s.name)}"`)
        .join(", ");

    if (!tryServers) {
        if (servers.length > 0) tryServers = `"${toTomlString(servers[0].name)}"`;
        else tryServers = "";
    }

    let forcedHostsBlock = "";
    forcedHosts.forEach(host => {
        const hostServers = Array.isArray(host.server)
            ? host.server
            : (host.server ? [host.server] : []);
        const targetServerNames = hostServers
            .map((id) => servers.find((s) => s.id === id))
            .filter(Boolean)
            .map((s) => `"${toTomlString(s.name)}"`);

        if (targetServerNames.length > 0) {
            forcedHostsBlock += `"${toTomlString(host.hostname)}" = [${targetServerNames.join(", ")}]\n`;
        }
    });

    // Modern Velocity 3.x TOML Structure (Flat)
    return `
# Velocity Configuration - Managed by PocketBase
# DO NOT EDIT MANUALLY
config-version = "2.7"
bind = "0.0.0.0:${toTomlString(settings.bind_port || 25577)}"
motd = "${toTomlString(settings.motd)}"
show-max-players = ${asNumber(settings.max_players, 500)}
online-mode = ${asBool(settings.online_mode, false)}
sample-players-in-ping = ${asBool(settings.sample_players_in_ping, true)}
enable-player-address-logging = ${asBool(settings.enable_player_address_logging, true)}
force-key-authentication = ${asBool(settings.force_key_authentication, false)}
prevent-client-proxy-connections = ${asBool(settings.prevent_client_proxy_connections, false)}
player-info-forwarding-mode = "${toTomlString(settings.player_info_forwarding_mode || 'modern')}"
forwarding-secret-file = "${FORWARDING_SECRET_FILENAME}"
announce-forge = ${asBool(settings.announce_forge, false)}
kick-existing-players = ${asBool(settings.kick_existing_players, false)}
ping-passthrough = "${toTomlString(settings.ping_passthrough || 'DISABLED')}"
accepts-transfers = ${asBool(settings.accepts_transfers, false)}

[servers]
${serversBlock}
try = [${tryServers}]

[forced-hosts]
${forcedHostsBlock}

[advanced]
compression-threshold = ${asNumber(settings.compression_threshold, 256)}
compression-level = ${asNumber(settings.compression_level, -1)}
login-ratelimit = ${asNumber(settings.login_ratelimit, 3000)}
connection-timeout = ${asNumber(settings.connection_timeout, 5000)}
read-timeout = ${asNumber(settings.read_timeout, 30000)}
failover-on-unexpected-server-disconnect = ${asBool(settings.failover_on_unexpected_server_disconnect, true)}
haproxy-protocol = ${asBool(settings.haproxy_protocol, false)}
tcp-fast-open = ${asBool(settings.tcp_fast_open, false)}
bungee-plugin-message-channel = ${asBool(settings.bungee_plugin_message_channel, true)}
show-ping-requests = ${asBool(settings.show_ping_requests, false)}
log-command-executions = ${asBool(settings.log_command_executions, false)}
log-player-connections = ${asBool(settings.log_player_connections, true)}
enable-reuse-port = ${asBool(settings.enable_reuse_port, false)}
announce-proxy-commands = ${asBool(settings.expose_proxy_commands, false)}
command-rate-limit = ${asNumber(settings.command_rate_limit, 0)}
forward-commands-if-rate-limited = ${asBool(settings.forward_commands_if_rate_limited, true)}
kick-after-rate-limited-commands = ${asNumber(settings.kick_after_rate_limited_commands, 5)}
tab-complete-rate-limit = ${asNumber(settings.tab_complete_rate_limit, 0)}
kick-after-rate-limited-tab-completes = ${asNumber(settings.kick_after_rate_limited_tab_completes, 5)}

[query]
enabled = ${asBool(settings.query_enabled, false)}
port = ${asNumber(settings.query_port, 25577)}
map = "${toTomlString(settings.query_map || 'Velocity')}"
show-plugins = ${asBool(settings.query_show_plugins, false)}
`;
}


main().catch(console.error);
