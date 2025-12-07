/// <reference path="../pb_data/types.d.ts" />
/**
 * 创建 audit_logs 集合
 * 
 * 用于记录管理员和 SSO 用户的敏感操作日志
 * 
 * Fields:
 * - user (Relation, required): 关联到 users 集合，记录操作人
 * - action_type (Select, required): 操作类型（登录、创建、更新、删除、系统设置、其他）
 * - target_module (Text, required): 目标模块（如：文章管理、首页分段、白名单、系统设置）
 * - details (Text): 操作详情（如：删除了文章《xxx》）
 * - ip_address (Text, optional): 操作 IP 地址
 * 
 * Rules:
 * - Admin read/write: "@request.auth.id != \"\""
 */
migrate((app) => {
  console.log("开始创建 audit_logs 集合...");
  
  // 检查集合是否已存在
  let auditLogsCollection = app.findCollectionByNameOrId("audit_logs");
  if (auditLogsCollection) {
    console.log("✓ audit_logs 集合已存在，跳过创建");
  } else {
    // 创建 audit_logs 集合
    auditLogsCollection = new Collection({
      "id": "pbc_audit_logs",
      "name": "audit_logs",
      "type": "base",
      "system": false,
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": "@request.auth.id != \"\"",
      "updateRule": "id = \"\"",
      "deleteRule": "id = \"\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text_audit_id",
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
          "id": "autodate_audit_created",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate_audit_updated",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "relation_audit_user",
          "maxSelect": 1,
          "name": "user",
          "presentable": false,
          "required": true,
          "system": false,
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "select_audit_action_type",
          "maxSelect": 1,
          "name": "action_type",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "登录",
            "创建",
            "更新",
            "删除",
            "系统设置",
            "其他"
          ]
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text_audit_target_module",
          "max": 255,
          "min": 0,
          "name": "target_module",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text_audit_details",
          "max": 2000,
          "min": 0,
          "name": "details",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text_audit_ip_address",
          "max": 45,
          "min": 0,
          "name": "ip_address",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "indexes": []
    });
    
    app.save(auditLogsCollection);
    console.log("✓ audit_logs 集合已创建");
  }
  
  console.log("audit_logs 集合初始化完成！");
}, (app) => {
  // down 函数：回滚逻辑
  console.log("回滚 audit_logs 集合创建...");
  try {
    const auditLogsCollection = app.findCollectionByNameOrId("audit_logs");
    if (auditLogsCollection) {
      app.delete(auditLogsCollection);
      console.log("✓ audit_logs 集合已删除");
    }
  } catch (err) {
    console.log("audit_logs 集合不存在，跳过删除");
  }
});

