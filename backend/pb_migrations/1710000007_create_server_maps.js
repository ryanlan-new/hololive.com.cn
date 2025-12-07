/// <reference path="../pb_data/types.d.ts" />
/**
 * 创建 server_maps 集合
 * 
 * 用于管理服务器地图的外部链接（Dynmap/BlueMap）
 * 
 * Fields:
 * - name (Text, required): 地图名称
 * - url (URL, required): 地图链接
 * - sort_order (Number): 排序顺序
 * 
 * Rules:
 * - Public read: ""
 * - Admin write: "@request.auth.id != \"\""
 */
migrate((app) => {
  console.log("开始创建 server_maps 集合...");
  
  // 检查集合是否已存在
  let serverMapsCollection = app.findCollectionByNameOrId("server_maps");
  if (serverMapsCollection) {
    console.log("✓ server_maps 集合已存在，跳过创建");
    return;
  }
  
  // 创建 server_maps 集合
  serverMapsCollection = new Collection({
    "id": "pbc_server_maps",
    "name": "server_maps",
    "type": "base",
    "system": false,
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text_sm_id",
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
        "id": "autodate_sm_created",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate_sm_updated",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_sm_name",
        "max": 255,
        "min": 1,
        "name": "name",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "url_sm_url",
        "max": 2048,
        "min": 1,
        "name": "url",
        "pattern": "^https?://.+",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "url"
      },
      {
        "hidden": false,
        "id": "number_sm_sort",
        "name": "sort_order",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ],
    "indexes": []
  });
  
  app.save(serverMapsCollection);
  console.log("✓ server_maps 集合已创建");
  
  // 创建默认条目
  try {
    const defaultMap = new Record(serverMapsCollection, {
      name: "主世界地图",
      url: "https://google.com",
      sort_order: 1,
    });
    app.save(defaultMap);
    console.log("✓ 默认地图条目已创建");
  } catch (err) {
    console.warn("⚠️  创建默认地图条目失败:", err.message);
  }
  
  console.log("server_maps 集合创建完成！");
}, (app) => {
  // down 函数：回滚逻辑
  console.log("回滚 server_maps 集合创建...");
  try {
    const serverMapsCollection = app.findCollectionByNameOrId("server_maps");
    if (serverMapsCollection) {
      app.delete(serverMapsCollection);
      console.log("✓ server_maps 集合已删除");
    }
  } catch (err) {
    console.log("server_maps 集合不存在，跳过删除");
  }
});

