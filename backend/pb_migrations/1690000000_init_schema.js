
migrate((app) => {
    const schema = [
        {
            "id": "pbc_media",
            "name": "media",
            "type": "base",
            "system": false,
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
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
            "indexes": []
        },
        {
            "id": "pbc_posts",
            "name": "posts",
            "type": "base",
            "system": false,
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
            "fields": [
                {
                    "autogeneratePattern": "[a-z0-9]{15}",
                    "hidden": false,
                    "id": "text_posts_id",
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
                    "id": "autodate_posts_created",
                    "name": "created",
                    "onCreate": true,
                    "onUpdate": false,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "autodate_posts_updated",
                    "name": "updated",
                    "onCreate": true,
                    "onUpdate": true,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "json_posts_title",
                    "maxSize": 0,
                    "name": "title",
                    "presentable": true,
                    "required": true,
                    "system": false,
                    "type": "json"
                },
                {
                    "autogeneratePattern": "",
                    "hidden": false,
                    "id": "text_posts_slug",
                    "max": 255,
                    "min": 0,
                    "name": "slug",
                    "pattern": "^[a-z0-9-]+$",
                    "presentable": true,
                    "primaryKey": false,
                    "required": false,
                    "system": false,
                    "type": "text"
                },
                {
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
                },
                {
                    "hidden": false,
                    "id": "json_posts_content",
                    "maxSize": 0,
                    "name": "content",
                    "presentable": false,
                    "required": true,
                    "system": false,
                    "type": "json"
                },
                {
                    "hidden": false,
                    "id": "bool_posts_public",
                    "name": "is_public",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "bool"
                },
                {
                    "hidden": false,
                    "id": "json_posts_summary",
                    "maxSize": 0,
                    "name": "summary",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "json"
                },
                {
                    "hidden": false,
                    "id": "relation_posts_cover_ref",
                    "maxSelect": 1,
                    "name": "cover_ref",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "collectionId": "pbc_media",
                    "cascadeDelete": false,
                    "type": "relation"
                },
                {
                    "hidden": false,
                    "id": "bool_posts_pinned",
                    "name": "is_pinned",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "bool"
                }
            ],
            "indexes": []
        },
        {
            "id": "pbc_announcements",
            "name": "announcements",
            "type": "base",
            "system": false,
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
            "fields": [
                {
                    "autogeneratePattern": "[a-z0-9]{15}",
                    "hidden": false,
                    "id": "text_ann_id",
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
                    "id": "autodate_ann_created",
                    "name": "created",
                    "onCreate": true,
                    "onUpdate": false,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "autodate_ann_updated",
                    "name": "updated",
                    "onCreate": true,
                    "onUpdate": true,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "json_ann_content",
                    "maxSize": 0,
                    "name": "content",
                    "presentable": true,
                    "required": true,
                    "system": false,
                    "type": "json"
                },
                {
                    "autogeneratePattern": "",
                    "hidden": false,
                    "id": "text_ann_link",
                    "max": 512,
                    "min": 0,
                    "name": "link",
                    "pattern": "",
                    "presentable": false,
                    "primaryKey": false,
                    "required": false,
                    "system": false,
                    "type": "text"
                },
                {
                    "hidden": false,
                    "id": "bool_ann_active",
                    "name": "is_active",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "bool"
                },
                {
                    "hidden": false,
                    "id": "date_ann_start",
                    "max": "",
                    "min": "",
                    "name": "start_time",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "date"
                },
                {
                    "hidden": false,
                    "id": "date_ann_end",
                    "max": "",
                    "min": "",
                    "name": "end_time",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "date"
                },
                {
                    "hidden": false,
                    "id": "select_ann_type",
                    "maxSelect": 1,
                    "name": "type",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "select",
                    "values": [
                        "info",
                        "urgent"
                    ]
                }
            ],
            "indexes": []
        },
        {
            "id": "pbc_whitelists",
            "name": "whitelists",
            "type": "base",
            "system": false,
            "listRule": "@request.auth.id != ''",
            "viewRule": "@request.auth.id != ''",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
            "fields": [
                {
                    "autogeneratePattern": "[a-z0-9]{15}",
                    "hidden": false,
                    "id": "text_wl_id",
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
                    "id": "autodate_wl_created",
                    "name": "created",
                    "onCreate": true,
                    "onUpdate": false,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "autodate_wl_updated",
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
                    "id": "text_wl_email",
                    "max": 255,
                    "min": 3,
                    "name": "email",
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
                    "id": "text_wl_desc",
                    "max": 255,
                    "min": 0,
                    "name": "description",
                    "pattern": "",
                    "presentable": false,
                    "primaryKey": false,
                    "required": false,
                    "system": false,
                    "type": "text"
                }
            ],
            "indexes": [
                "CREATE UNIQUE INDEX `idx_whitelists_email` ON `whitelists` (`email`) WHERE `email` != ''"
            ]
        },
        {
            "id": "pbc_system_settings",
            "name": "system_settings",
            "type": "base",
            "system": false,
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "id = ''",
            "fields": [
                {
                    "autogeneratePattern": "[a-z0-9]{15}",
                    "hidden": false,
                    "id": "text_sys_id",
                    "max": 15,
                    "min": 1,
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
                    "id": "autodate_sys_created",
                    "name": "created",
                    "onCreate": true,
                    "onUpdate": false,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "autodate_sys_updated",
                    "name": "updated",
                    "onCreate": true,
                    "onUpdate": true,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "json_sys_ms_auth",
                    "maxSize": 0,
                    "name": "microsoft_auth_config",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "json"
                },
                {
                    "hidden": false,
                    "id": "json_sys_analytics",
                    "maxSize": 0,
                    "name": "analytics_config",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "json"
                },
                {
                    "autogeneratePattern": "",
                    "hidden": false,
                    "id": "text_sys_admin_key",
                    "max": 255,
                    "min": 3,
                    "name": "admin_entrance_key",
                    "pattern": "",
                    "presentable": true,
                    "primaryKey": false,
                    "required": true,
                    "system": false,
                    "type": "text"
                },
                {
                    "hidden": false,
                    "id": "bool_sys_local_login",
                    "name": "enable_local_login",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "bool"
                }
            ],
            "indexes": []
        },
        {
            "id": "pbc_cms_sections",
            "name": "cms_sections",
            "type": "base",
            "system": false,
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
            "fields": [
                {
                    "autogeneratePattern": "[a-z0-9]{15}",
                    "hidden": false,
                    "id": "text_cms_sec_id",
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
                    "id": "autodate_cms_sec_created",
                    "name": "created",
                    "onCreate": true,
                    "onUpdate": false,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "autodate_cms_sec_updated",
                    "name": "updated",
                    "onCreate": true,
                    "onUpdate": true,
                    "presentable": false,
                    "system": false,
                    "type": "autodate"
                },
                {
                    "hidden": false,
                    "id": "json_cms_sec_title",
                    "maxSize": 0,
                    "name": "title",
                    "presentable": true,
                    "required": true,
                    "system": false,
                    "type": "json"
                },
                {
                    "hidden": false,
                    "id": "json_cms_sec_subtitle",
                    "maxSize": 0,
                    "name": "subtitle",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "json"
                },
                {
                    "hidden": false,
                    "id": "file_cms_sec_background",
                    "maxSelect": 1,
                    "maxSize": 10485760,
                    "mimeTypes": [
                        "image/jpeg",
                        "image/png",
                        "image/gif",
                        "image/webp"
                    ],
                    "name": "background",
                    "presentable": false,
                    "protected": false,
                    "required": false,
                    "system": false,
                    "type": "file"
                },
                {
                    "hidden": false,
                    "id": "relation_cms_sec_background_ref",
                    "maxSelect": 1,
                    "name": "background_ref",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "collectionId": "pbc_media",
                    "cascadeDelete": false,
                    "type": "relation"
                },
                {
                    "hidden": false,
                    "id": "number_cms_sec_sort",
                    "name": "sort_order",
                    "presentable": false,
                    "required": true,
                    "system": false,
                    "type": "number"
                },
                {
                    "hidden": false,
                    "id": "json_cms_sec_buttons",
                    "maxSize": 0,
                    "name": "buttons",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "json"
                },
                {
                    "hidden": false,
                    "id": "json_cms_sec_content",
                    "maxSize": 0,
                    "name": "content",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "json"
                },
                {
                    "hidden": false,
                    "id": "json_cms_sec_announcement",
                    "maxSize": 0,
                    "name": "announcement",
                    "presentable": false,
                    "required": false,
                    "system": false,
                    "type": "json"
                }
            ],
            "indexes": []
        },
        {
            "id": "pbc_server_maps",
            "name": "server_maps",
            "type": "base",
            "system": false,
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
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
        },
        {
            "id": "pbc_server_info_details",
            "name": "server_info_details",
            "type": "base",
            "system": false,
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.id != ''",
            "updateRule": "@request.auth.id != ''",
            "deleteRule": "@request.auth.id != ''",
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
        },
        {
            "id": "pbc_audit_logs",
            "name": "audit_logs",
            "type": "base",
            "system": false,
            "listRule": "@request.auth.id != ''",
            "viewRule": "@request.auth.id != ''",
            "createRule": "@request.auth.id != ''",
            "updateRule": "id = ''",
            "deleteRule": "id = ''",
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
        }
    ];

    for (const collectionData of schema) {
        try {
            const collection = new Collection(collectionData);
            app.save(collection);
        } catch (err) {
            console.warn("Failed to create collection " + collectionData.name, err);
        }
    }

    // 更新 users 集合规则 (允许 Public Create 以支持 OAuth2)
    try {
        const users = app.findCollectionByNameOrId("users");
        users.listRule = "@request.auth.id != \"\"";
        users.viewRule = "@request.auth.id != \"\"";
        users.createRule = ""; // 允许公开创建（OAuth2 需要）
        users.updateRule = "@request.auth.id != \"\"";
        users.deleteRule = "@request.auth.id != \"\"";
        app.save(users);
    } catch (err) {
        console.warn("Failed to update users collection rules", err);
    }
}, (app) => {
    const ids = [
        "pbc_media",
        "pbc_posts",
        "pbc_announcements",
        "pbc_whitelists",
        "pbc_system_settings",
        "pbc_cms_sections",
        "pbc_server_maps",
        "pbc_server_info_details",
        "pbc_audit_logs"
    ];

    for (const id of ids) {
        try {
            const collection = app.findCollectionByNameOrId(id);
            app.delete(collection);
        } catch (err) {
            // ignore
        }
    }
});
