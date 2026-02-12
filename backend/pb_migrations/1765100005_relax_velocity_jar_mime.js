migrate((app) => {
    const collection = app.findCollectionByNameOrId("velocity_settings");

    // find the velocity_jar field
    const fileField = collection.fields.find((f) => f.name === "velocity_jar");

    // clear mime types to allow any file (client-side validation or trust user)
    if (fileField) {
        fileField.mimeTypes = [];
        app.save(collection);
    }
}, (app) => {
    // revert changes
    const collection = app.findCollectionByNameOrId("velocity_settings");
    const fileField = collection.fields.find((f) => f.name === "velocity_jar");

    if (fileField) {
        fileField.mimeTypes = [
            "application/java-archive",
            "application/octet-stream"
        ];
        app.save(collection);
    }
})
