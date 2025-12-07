/// <reference path="../pb_data/types.d.ts" />
/**
 * 统一修复 announcements 集合结构和权限，防止前端读写失败。
 *
 * - 如果已存在同名集合，直接删除重建（当前你没有线上数据，因此可安全重建）。
 * - 使用与前端期望一致的字段：
 *   - content: json
 *   - link: text
 *   - is_active: bool
 *   - start_time: date
 *   - end_time: date
 *   - created / updated: autodate
 * - 权限：
 *   - list/view:  ""                （公开可读）
 *   - create/update/delete:  登录可写（@request.auth.id != ""）
 */
migrate(
  (app) => {
    // 如果已有同名集合，先删除
    try {
      const existing = app.findCollectionByNameOrId("announcements");
      if (existing) {
        app.delete(existing);
      }
    } catch (err) {
      // 不存在则忽略
    }

    const collection = new Collection({
      id: "pbc_announcements_fixed",
      name: "announcements",
      type: "base",
      system: false,
      listRule: "",
      viewRule: "",
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
      indexes: [],
      fields: [
        {
          id: "text_ann_id",
          name: "id",
          type: "text",
          system: true,
          required: true,
          hidden: false,
          presentable: false,
          primaryKey: true,
          autogeneratePattern: "[a-z0-9]{15}",
          min: 15,
          max: 15,
          pattern: "^[a-z0-9]+$",
        },
        {
          id: "autodate_ann_created",
          name: "created",
          type: "autodate",
          system: false,
          required: false,
          hidden: false,
          presentable: false,
          onCreate: true,
          onUpdate: false,
        },
        {
          id: "autodate_ann_updated",
          name: "updated",
          type: "autodate",
          system: false,
          required: false,
          hidden: false,
          presentable: false,
          onCreate: true,
          onUpdate: true,
        },
        {
          id: "json_ann_content",
          name: "content",
          type: "json",
          system: false,
          required: true,
          hidden: false,
          presentable: true,
          maxSize: 0,
        },
        {
          id: "text_ann_link",
          name: "link",
          type: "text",
          system: false,
          required: false,
          hidden: false,
          presentable: false,
          autogeneratePattern: "",
          min: 0,
          max: 512,
          pattern: "",
        },
        {
          id: "bool_ann_active",
          name: "is_active",
          type: "bool",
          system: false,
          required: true,
          hidden: false,
          presentable: false,
        },
        {
          id: "date_ann_start",
          name: "start_time",
          type: "date",
          system: false,
          required: false,
          hidden: false,
          presentable: false,
          min: "",
          max: "",
        },
        {
          id: "date_ann_end",
          name: "end_time",
          type: "date",
          system: false,
          required: false,
          hidden: false,
          presentable: false,
          min: "",
          max: "",
        },
      ],
    });

    return app.save(collection);
  },
  (app) => {
    // 回滚：删除重建的 announcements 集合
    try {
      const col = app.findCollectionByNameOrId("announcements");
      if (col) {
        app.delete(col);
      }
    } catch (err) {
      // 忽略
    }
  },
);


