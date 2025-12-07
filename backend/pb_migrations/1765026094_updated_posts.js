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
      "公告",
      "文档"
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
      "公告",
      "文档",
      "更新日志"
    ]
  }))

  return app.save(collection)
})
