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

    const settings = findCollection("velocity_settings");
    if (settings) {
        const extraFields = [
            { "name": "sample_players_in_ping", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
            { "name": "enable_player_address_logging", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
            { "name": "failover_on_unexpected_server_disconnect", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
            { "name": "log_command_executions", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
            { "name": "log_player_connections", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
            { "name": "enable_reuse_port", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
            { "name": "command_rate_limit", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": 0, "max": null } },
            { "name": "forward_commands_if_rate_limited", "type": "bool", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
            { "name": "kick_after_rate_limited_commands", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": 0, "max": null } },
            { "name": "tab_complete_rate_limit", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": 0, "max": null } },
            { "name": "kick_after_rate_limited_tab_completes", "type": "number", "system": false, "required": false, "presentable": false, "unique": false, "options": { "min": 0, "max": null } }
        ];

        extraFields.forEach((field) => addFieldIfMissing(settings, field));
        app.save(settings);
    }

    const forcedHosts = findCollection("velocity_forced_hosts");
    if (forcedHosts) {
        const serverField = forcedHosts.fields.find((f) => f.name === "server");
        if (serverField) {
            serverField.maxSelect = null;
            if (serverField.options) {
                serverField.options.maxSelect = null;
            }
            app.save(forcedHosts);
        }
    }
}, (app) => {
    // no-op revert
})
