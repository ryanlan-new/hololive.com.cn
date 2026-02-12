migrate((app) => {
    const addFieldIfMissing = (collection, fieldDef) => {
        if (!collection.fields.find((f) => f.name === fieldDef.name)) {
            collection.fields.add(new Field(fieldDef));
        }
    };

    const settings = app.findCollectionByNameOrId("velocity_settings");
    if (!settings) return;

    addFieldIfMissing(settings, {
        "name": "proxy_status",
        "type": "text",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    });

    addFieldIfMissing(settings, {
        "name": "last_heartbeat",
        "type": "date",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    });

    addFieldIfMissing(settings, {
        "name": "restart_trigger",
        "type": "date",
        "system": false,
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
    });

    app.save(settings);
}, (app) => {
    // no-op revert
})
