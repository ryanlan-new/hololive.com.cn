migrate((app) => {
    const settings = app.findCollectionByNameOrId("velocity_settings");

    // announce_forge
    settings.fields.add(new Field({
        "name": "announce_forge",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // accepts_transfers (1.20.5+)
    settings.fields.add(new Field({
        "name": "accepts_transfers",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // haproxy_protocol
    settings.fields.add(new Field({
        "name": "haproxy_protocol",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // show_ping_requests
    settings.fields.add(new Field({
        "name": "show_ping_requests",
        "type": "bool",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    }));

    // connection_timeout
    settings.fields.add(new Field({
        "name": "connection_timeout",
        "type": "number",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
            "min": 0,
            "max": 600000
        }
    }));

    // read_timeout
    settings.fields.add(new Field({
        "name": "read_timeout",
        "type": "number",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
            "min": 0,
            "max": 600000
        }
    }));

    app.save(settings);
}, (app) => {
    // rollback
    const settings = app.findCollectionByNameOrId("velocity_settings");
    settings.fields.removeByName("announce_forge");
    settings.fields.removeByName("accepts_transfers");
    settings.fields.removeByName("haproxy_protocol");
    settings.fields.removeByName("show_ping_requests");
    settings.fields.removeByName("connection_timeout");
    settings.fields.removeByName("read_timeout");
    app.save(settings);
});
