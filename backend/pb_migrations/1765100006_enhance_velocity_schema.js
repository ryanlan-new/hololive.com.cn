migrate((app) => {
    // 1. Enhance velocity_settings
    const settings = app.findCollectionByNameOrId("velocity_settings");

    // restart_trigger: Update this timestamp to trigger a restart
    settings.fields.add(new Field({
        "name": "restart_trigger",
        "type": "date",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // online_mode
    settings.fields.add(new Field({
        "name": "online_mode",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // force_key_authentication
    settings.fields.add(new Field({
        "name": "force_key_authentication",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // prevent_client_proxy_connections
    settings.fields.add(new Field({
        "name": "prevent_client_proxy_connections",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // player_info_forwarding_mode: modern, legacy, bungeeguard, none
    const forwardingMode = new Field({
        "name": "player_info_forwarding_mode",
        "type": "select",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false
    });
    forwardingMode.options = {
        "maxSelect": 1,
        "values": ["modern", "legacy", "bungeeguard", "none"]
    };
    settings.fields.add(forwardingMode);

    // kick_existing_players
    settings.fields.add(new Field({
        "name": "kick_existing_players",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // ping_passthrough
    const pingPassthrough = new Field({
        "name": "ping_passthrough",
        "type": "select",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false
    });
    pingPassthrough.options = {
        "maxSelect": 1,
        "values": ["DISABLED", "ENABLED", "DESCRIPTION"]
    };
    settings.fields.add(pingPassthrough);

    app.save(settings);

    // 2. Enhance velocity_servers
    const servers = app.findCollectionByNameOrId("velocity_servers");

    // status: pending, online, offline, error
    const statusField = new Field({
        "name": "status",
        "type": "select",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false
    });
    statusField.options = {
        "maxSelect": 1,
        "values": ["pending", "online", "offline", "error"]
    };
    servers.fields.add(statusField);

    // ping (latency in ms)
    servers.fields.add(new Field({
        "name": "ping",
        "type": "number",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // last_check
    servers.fields.add(new Field({
        "name": "last_check",
        "type": "date",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    app.save(servers);

}, (app) => {
    // Revert changes
    const settings = app.findCollectionByNameOrId("velocity_settings");
    settings.fields.removeByName("restart_trigger");
    settings.fields.removeByName("online_mode");
    settings.fields.removeByName("force_key_authentication");
    settings.fields.removeByName("prevent_client_proxy_connections");
    settings.fields.removeByName("player_info_forwarding_mode");
    settings.fields.removeByName("kick_existing_players");
    settings.fields.removeByName("ping_passthrough");
    app.save(settings);

    const servers = app.findCollectionByNameOrId("velocity_servers");
    servers.fields.removeByName("status");
    servers.fields.removeByName("ping");
    servers.fields.removeByName("last_check");
    app.save(servers);
})
