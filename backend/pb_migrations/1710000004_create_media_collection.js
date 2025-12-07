/// <reference path="../pb_data/types.d.ts" />
/**
 * 创建 media 集合用于存储富文本编辑器上传的图片
 * - 如果已存在同名集合，跳过创建（避免冲突）
 * - 字段：file (支持 jpeg, png, gif, webp，最大 5MB)
 * - 权限：
 *   - list/view: "" (公开可读，以便文章能显示图片)
 *   - create/update/delete: "@request.auth.id != ''" (仅登录用户可管理)
 */
migrate((app) => {
  // 检查集合是否已存在
  try {
    const existing = app.findCollectionByNameOrId("media");
    if (existing) {
      // 集合已存在，跳过创建
      console.log("Collection 'media' already exists, skipping creation.");
      return;
    }
  } catch (err) {
    // 不存在则继续创建
  }

  const collection = new Collection({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_media_id",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate_media_created",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_media_updated",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "file_media_file",
        "maxSelect": 1,
        "maxSize": 5242880,
        "mimeTypes": [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp"
        ],
        "name": "file",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "type": "file"
      }
    ],
    "indexes": [],
    "listRule": "",
    "name": "media",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  // 回滚：删除 media 集合
  try {
    const collection = app.findCollectionByNameOrId("media");
    if (collection) {
      return app.delete(collection);
    }
  } catch (err) {
    // 不存在则忽略
  }
})

