migrate((app) => {
    const findCollection = (name) => {
        try {
            return app.findCollectionByNameOrId(name);
        } catch (e) {
            return null;
        }
    };

    const addFieldIfMissing = (collection, fieldDef) => {
        if (!collection.fields.find((f) => f.name === fieldDef.name)) {
            collection.fields.add(new Field(fieldDef));
        }
    };

    const settings = app.findCollectionByNameOrId("velocity_settings");
    const settingsFields = [
        { "name": "restart_trigger", "type": "date", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "proxy_status", "type": "text", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "last_heartbeat", "type": "date", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "online_mode", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "force_key_authentication", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "prevent_client_proxy_connections", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "player_info_forwarding_mode", "type": "select", "system": false, "required": false, "presentable": false, "unique": false, "options": { "maxSelect": 1, "values": ["modern", "legacy", "bungeeguard", "none"] } },
        { "name": "kick_existing_players", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "ping_passthrough", "type": "select", "system": false, "required": false, "presentable": false, "unique": false, "options": { "maxSelect": 1, "values": ["DISABLED", "MODS", "DESCRIPTION", "ALL"] } },
        { "name": "announce_forge", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "accepts_transfers", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "haproxy_protocol", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "show_ping_requests", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "expose_proxy_commands", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "compression_threshold", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": -1, "max": 65535 } },
        { "name": "compression_level", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": -1, "max": 9 } },
        { "name": "login_ratelimit", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": 0, "max": 600000 } },
        { "name": "connection_timeout", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": 0, "max": 600000 } },
        { "name": "read_timeout", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": 0, "max": 600000 } },
        { "name": "bungee_plugin_message_channel", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "tcp_fast_open", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "query_enabled", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "query_port", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "query_map", "type": "text", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "query_show_plugins", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} }
    ];
    settingsFields.forEach((field) => addFieldIfMissing(settings, field));
    app.save(settings);

    const servers = app.findCollectionByNameOrId("velocity_servers");
    const serverCollectionId = servers?.id || "pbc_velocity_servers";
    const serverFields = [
        { "name": "status", "type": "text", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "ping", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "last_check", "type": "date", "system": false, "required": false, "presentable": false, "unique": false, "options": {} }
    ];
    serverFields.forEach((field) => addFieldIfMissing(servers, field));
    app.save(servers);

    let forcedHosts = findCollection("velocity_forced_hosts");
    if (!forcedHosts) {
        forcedHosts = new Collection({
            "name": "velocity_forced_hosts",
            "type": "base",
            "system": false,
            "listRule": "@request.auth.id != ''",
            "viewRule": "@request.auth.id != ''",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
            "options": {},
            "fields": [
                {
                    "name": "hostname",
                    "type": "text",
                    "system": false,
                    "required": true,
                    "presentable": true,
                    "unique": true,
                    "options": {
                        "min": null,
                        "max": null,
                        "pattern": ""
                    }
                },
                {
                    "name": "server",
                    "type": "relation",
                    "system": false,
                    "required": true,
                    "presentable": false,
                    "unique": false,
                    "collectionId": serverCollectionId,
                    "cascadeDelete": false,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": [],
                    "options": {
                        "collectionId": serverCollectionId,
                        "cascadeDelete": false,
                        "minSelect": null,
                        "maxSelect": 1,
                        "displayFields": []
                    }
                }
            ],
            "indexes": []
        });
    } else {
        addFieldIfMissing(forcedHosts, {
            "name": "hostname",
            "type": "text",
            "system": false,
            "required": true,
            "presentable": true,
            "unique": true,
            "options": {
                "min": null,
                "max": null,
                "pattern": ""
            }
        });
        addFieldIfMissing(forcedHosts, {
            "name": "server",
            "type": "relation",
            "system": false,
            "required": true,
            "presentable": false,
            "unique": false,
            "collectionId": serverCollectionId,
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": [],
            "options": {
                "collectionId": serverCollectionId,
                "cascadeDelete": false,
                "minSelect": null,
                "maxSelect": 1,
                "displayFields": []
            }
        });
    }
    app.save(forcedHosts);

}, (app) => {
    // Revert changes (Basic cleanup, not strictly comprehensive for dev environment)
    const settings = app.findCollectionByNameOrId("velocity_settings");
    // Removing all added fields... (omitted for brevity in revert, but good practice to include)
    // For now assuming if we revert we want to go back to pre-Velocity state or similar.
    // In dev, usually better to just delete db.
})
