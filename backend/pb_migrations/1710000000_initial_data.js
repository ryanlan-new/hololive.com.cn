/// <reference path="../pb_data/types.d.ts" />
/**
 * 初始数据迁移：
 * - 为 system_settings 插入单例配置记录（ID 固定为 "1"）
 * - 为 announcements 插入一条示例公告
 * - 为 whitelists 可选插入一条示例记录
 *
 * 使用 PocketBase 提供的 CoreApp API（migrate((app) => { ... })）。
 */
migrate(
  (app) => {
    const generatedAdminKey = `init-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    // === 1. system_settings 单例记录（ID = "1"） ===
    try {
      // 如果已经存在 ID 为 "1" 的记录，则跳过创建
      app.findRecordById("system_settings", "1");
    } catch (err) {
      // 未找到则创建
      const settingsCollection = app.findCollectionByNameOrId("system_settings");
      const settingsRecord = new Record(settingsCollection, {
        id: "1",
        microsoft_auth_config: {},
        analytics_config: {},
        admin_entrance_key: generatedAdminKey,
        enable_local_login: true,
      });
      app.save(settingsRecord);
    }

    // === 2. announcements 示例公告 ===
    try {
      const announcementsCollection = app.findCollectionByNameOrId("announcements");
      const annRecord = new Record(announcementsCollection, {
        content: {
          zh: "欢迎来到后台管理系统",
          en: "Welcome to Admin Panel",
        },
        link: "",
        is_active: false,
        start_time: null,
        end_time: null,
      });
      app.save(annRecord);
    } catch (err) {
      // 如果集合不存在或其他错误，静默跳过，不影响迁移执行
    }

    // === 3. whitelists 示例记录 ===
    try {
      const whitelistsCollection = app.findCollectionByNameOrId("whitelists");
      const wlRecord = new Record(whitelistsCollection, {
        email: "admin@example.com",
        description: "示例白名单账号，用于后台访问测试",
      });
      app.save(wlRecord);
    } catch (err) {
      // 同样静默跳过（例如集合尚未创建时）
    }
  },
  (app) => {
    // 回滚逻辑：仅清理本迁移创建的示例数据，不删除集合

    // 删除 system_settings 中 ID 为 "1" 的记录（如果存在）
    try {
      const rec = app.findRecordById("system_settings", "1");
      app.delete(rec);
    } catch (err) {
      // 记录不存在时忽略
    }

    // 删除示例公告（按 content.zh 文本匹配）
    try {
      const announcementsCollection = app.findCollectionByNameOrId("announcements");
      const qb = app
        .db()
        .select("id")
        .from(announcementsCollection.name)
        .where(
          app
            .db()
            .jsonExtract(announcementsCollection.name + ".content", "$.zh")
            .eq("欢迎来到后台管理系统"),
        )
        .limit(1);

      const row = qb.one();
      if (row && row.id) {
        const rec = app.findRecordById(announcementsCollection.id, row.id);
        app.delete(rec);
      }
    } catch (err) {
      // 忽略
    }

    // 删除示例白名单记录（根据 email 匹配）
    try {
      const whitelistsCollection = app.findCollectionByNameOrId("whitelists");
      const qb = app
        .db()
        .select("id")
        .from(whitelistsCollection.name)
        .where(app.db().col(whitelistsCollection.name + ".email").eq("admin@example.com"))
        .limit(1);

      const row = qb.one();
      if (row && row.id) {
        const rec = app.findRecordById(whitelistsCollection.id, row.id);
        app.delete(rec);
      }
    } catch (err) {
      // 忽略
    }
  },
);
