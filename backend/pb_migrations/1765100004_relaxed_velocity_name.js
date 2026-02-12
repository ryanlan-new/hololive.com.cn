migrate((app) => {
    const collection = app.findCollectionByNameOrId("velocity_servers");

    // find the name field
    const nameField = collection.fields.find((f) => f.name === "name");

    // remove pattern constraint to allow any characters
    if (nameField) {
        nameField.pattern = "";
        app.save(collection);
    }
}, (app) => {
    // revert changes
    const collection = app.findCollectionByNameOrId("velocity_servers");
    const nameField = collection.fields.find((f) => f.name === "name");

    if (nameField) {
        nameField.pattern = "^[a-z0-9-]+$";
        app.save(collection);
    }
})
