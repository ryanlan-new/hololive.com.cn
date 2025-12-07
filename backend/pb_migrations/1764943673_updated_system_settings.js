/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_system_settings")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool_sys_local_login",
    "name": "enable_local_login",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_system_settings")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool_sys_local_login",
    "name": "enable_local_login",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
