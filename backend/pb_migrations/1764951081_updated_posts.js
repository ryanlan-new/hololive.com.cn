/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_posts")

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool_posts_public",
    "name": "is_public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_posts")

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool_posts_public",
    "name": "is_public",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
