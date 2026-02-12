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

    const servers = app.findCollectionByNameOrId("velocity_servers");
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
            "fields": [],
            "indexes": []
        });
    }

    forcedHosts.listRule = "@request.auth.id != ''";
    forcedHosts.viewRule = "@request.auth.id != ''";
    forcedHosts.createRule = "@request.auth.id != ''";
    forcedHosts.updateRule = "@request.auth.id != ''";
    forcedHosts.deleteRule = "@request.auth.id != ''";

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
        "options": {
            "collectionId": servers.id,
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": []
        }
    });

    app.save(forcedHosts);
}, (app) => {
    // no-op revert
})
