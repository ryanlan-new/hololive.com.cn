/// <reference path="../pb_data/types.d.ts" />
/**
 * 创建 server_info_details 集合并初始化默认数据
 * 
 * 用于动态管理服务器信息字段（IP、版本、运行模式等）
 * 
 * Fields:
 * - icon (Text, required): Lucide 图标名称
 * - label (JSON, required): 多语言标签 (zh/en/ja)
 * - value (JSON, required): 多语言显示值 (zh/en/ja)
 * - sort_order (Number, required): 排序顺序
 * 
 * Rules:
 * - Public read: ""
 * - Admin write: "@request.auth.id != \"\""
 */
migrate((app) => {
  console.log("开始创建 server_info_details 集合...");
  
  // 检查集合是否已存在
  let serverInfoDetailsCollection = app.findCollectionByNameOrId("server_info_details");
  if (serverInfoDetailsCollection) {
    console.log("✓ server_info_details 集合已存在，跳过创建");
  } else {
    // 创建 server_info_details 集合
    serverInfoDetailsCollection = new Collection({
      "id": "pbc_server_info_details",
      "name": "server_info_details",
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
          "id": "text_sid_id",
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
          "id": "autodate_sid_created",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate_sid_updated",
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
          "id": "text_sid_icon",
          "max": 255,
          "min": 1,
          "name": "icon",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "json_sid_label",
          "maxSize": 0,
          "name": "label",
          "presentable": true,
          "required": true,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "json_sid_value",
          "maxSize": 0,
          "name": "value",
          "presentable": true,
          "required": true,
          "system": false,
          "type": "json"
        },
        {
          "hidden": false,
          "id": "number_sid_sort",
          "name": "sort_order",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "number"
        }
      ],
      "indexes": []
    });
    
    app.save(serverInfoDetailsCollection);
    console.log("✓ server_info_details 集合已创建");
  }
  
  // 检查是否已有数据
  let hasData = false;
  try {
    const records = app.dao().findRecordsByFilter(serverInfoDetailsCollection.id, "");
    hasData = records && records.length > 0;
    if (hasData) {
      console.log(`✓ server_info_details 已有 ${records.length} 条数据，跳过初始化`);
    }
  } catch (err) {
    // 如果没有数据或查询失败，继续初始化
    console.log("未找到现有数据，将创建默认数据");
  }
  
  // 如果没有数据，创建默认数据
  if (!hasData) {
    try {
      const defaultData = [
        {
          icon: "Server",
          label: { zh: "服务器地址", en: "Server Address", ja: "サーバーアドレス" },
          value: { zh: "play.hololive.com.cn", en: "play.hololive.com.cn", ja: "play.hololive.com.cn" },
          sort_order: 1,
        },
        {
          icon: "Gamepad2",
          label: { zh: "游戏版本", en: "Game Version", ja: "バージョン" },
          value: { zh: "1.20.4", en: "1.20.4", ja: "1.20.4" },
          sort_order: 2,
        },
        {
          icon: "ShieldCheck",
          label: { zh: "运行模式", en: "Mode", ja: "モード" },
          value: { zh: "正版验证 (Online Mode)", en: "Online Mode", ja: "オンラインモード" },
          sort_order: 3,
        },
      ];
      
      for (const data of defaultData) {
        const record = new Record(serverInfoDetailsCollection, data);
        app.dao().saveRecord(record);
      }
      console.log("✓ 默认服务器信息字段已创建（3条记录）");
    } catch (err) {
      console.warn("⚠️  创建默认服务器信息字段失败:", err.message);
    }
  }
  
  console.log("server_info_details 集合初始化完成！");
}, (app) => {
  // down 函数：回滚逻辑
  console.log("回滚 server_info_details 集合创建...");
  try {
    const serverInfoDetailsCollection = app.findCollectionByNameOrId("server_info_details");
    if (serverInfoDetailsCollection) {
      app.delete(serverInfoDetailsCollection);
      console.log("✓ server_info_details 集合已删除");
    }
  } catch (err) {
    console.log("server_info_details 集合不存在，跳过删除");
  }
});

