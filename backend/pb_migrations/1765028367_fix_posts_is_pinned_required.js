/// <reference path="../pb_data/types.d.ts" />
/**
 * 修复 posts 集合中 is_pinned 字段的 required 属性
 * 
 * 布尔字段不应设置为 required: true，因为 false 会被视为"空值"，
 * 导致用户无法取消选中（设置为 false）
 * 
 * 将 required 从 true 改为 false
 */
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_posts");

  // update field - is_pinned 是第 11 个字段（索引 10）
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "bool_posts_pinned",
    "name": "is_pinned",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  // down 函数：回滚（将 required 改回 true）
  const collection = app.findCollectionByNameOrId("pbc_posts");

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "bool_posts_pinned",
    "name": "is_pinned",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})

