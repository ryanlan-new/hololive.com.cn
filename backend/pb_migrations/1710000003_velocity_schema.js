migrate((app) => {
    const settingsCollection = new Collection({
        "id": "pbc_velocity_settings",
        "name": "velocity_settings",
        "type": "base",
        "system": false,
        "listRule": "@request.auth.id != ''",
        "viewRule": "@request.auth.id != ''",
        "createRule": null,
        "updateRule": "@request.auth.id != ''",
        "deleteRule": null,
        "options": {},
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text_vel_set_id",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "autodate_vel_set_created",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate_vel_set_updated",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text_vel_port",
                "max": 5,
                "min": 0,
                "name": "bind_port",
                "pattern": "",
                "presentable": true,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text_vel_motd",
                "max": 255,
                "min": 0,
                "name": "motd",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "number_vel_max_players",
                "max": null,
                "min": 0,
                "name": "max_players",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "number"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text_vel_secret",
                "max": 255,
                "min": 5,
                "name": "forwarding_secret",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "file_vel_jar",
                "maxSelect": 1,
                "maxSize": 104857600,
                "mimeTypes": [
                    "application/java-archive",
                    "application/octet-stream"
                ],
                "name": "velocity_jar",
                "presentable": false,
                "protected": false,
                "required": false,
                "system": false,
                "type": "file"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text_vel_version",
                "max": 50,
                "min": 0,
                "name": "jar_version",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            }
        ],
        "indexes": []
    });

    app.save(settingsCollection);

    // Initialize default settings record
    // We need to fetch the collection again or use the object, but for record creation we need the collection object.
    // Actually migration context usually allows finding it.

    try {
        const collection = app.findCollectionByNameOrId("velocity_settings");
        const settingsRecord = new Record(collection, {
            "bind_port": "25577",
            "motd": "Start with Velocity",
            "max_players": 500,
            "forwarding_secret": "my-secret-key-change-it",
            "jar_version": "Initial"
        });
        app.save(settingsRecord);
    } catch (err) {
        app.logger().warn("Failed to create default settings", err);
    }


    const serversCollection = new Collection({
        "id": "pbc_velocity_servers",
        "name": "velocity_servers",
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
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text_vel_srv_id",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "autodate_vel_srv_created",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate_vel_srv_updated",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text_vel_srv_name",
                "max": 255,
                "min": 1,
                "name": "name",
                "pattern": "^[a-z0-9-]+$",
                "presentable": true,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text_vel_srv_addr",
                "max": 255,
                "min": 1,
                "name": "address",
                "pattern": "",
                "presentable": true,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "bool_vel_srv_try",
                "name": "is_try_server",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "number_vel_srv_order",
                "max": null,
                "min": 0,
                "name": "try_order",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "number"
            }
        ],
        "indexes": [
            "CREATE UNIQUE INDEX `idx_vel_srv_name` ON `velocity_servers` (`name`)"
        ]
    });

    app.save(serversCollection);

}, (app) => {
    try {
        const settings = app.findCollectionByNameOrId("velocity_settings");
        if (settings) {
            app.delete(settings);
        }
    } catch (e) { }

    try {
        const servers = app.findCollectionByNameOrId("velocity_servers");
        if (servers) {
            app.delete(servers);
        }
    } catch (e) { }
});
