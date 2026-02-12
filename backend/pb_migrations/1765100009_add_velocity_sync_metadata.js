migrate((app) => {
    const addFieldIfMissing = (collection, fieldDef) => {
        if (!collection.fields.find((f) => f.name === fieldDef.name)) {
            collection.fields.add(new Field(fieldDef));
        }
    };

    const settings = app.findCollectionByNameOrId("velocity_settings");
    const fields = [
        { "name": "last_sync_status", "type": "text", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "last_sync_error", "type": "text", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "last_sync_at", "type": "date", "system": false, "required": false, "presentable": false, "unique": false, "options": {} },
        { "name": "last_applied_hash", "type": "text", "system": false, "required": false, "presentable": false, "unique": false, "options": {} }
    ];

    fields.forEach((field) => addFieldIfMissing(settings, field));
    app.save(settings);
}, (app) => {
    // no-op revert
})
