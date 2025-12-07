/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "listRule": "is_public = true",
    "viewRule": "is_public = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "listRule": "is_public = true || @request.auth.id != \"\"",
    "viewRule": "is_public = true || @request.auth.id != \"\""
  }, collection)

  return app.save(collection)
})
