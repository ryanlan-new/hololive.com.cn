/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_posts")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select_posts_category",
    "maxSelect": 1,
    "name": "category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "网站公告",
      "其他文档",
      "观光指引"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_posts")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select_posts_category",
    "maxSelect": 1,
    "name": "category",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "网站公告",
      "其他文档"
    ]
  }))

  return app.save(collection)
})
