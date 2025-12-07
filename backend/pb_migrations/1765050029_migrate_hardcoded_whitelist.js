/// <reference path="../pb_data/types.d.ts" />
/**
 * 迁移硬编码白名单到数据库
 * 
 * 将 src/config/auth_whitelist.js 中的硬编码管理员邮箱迁移到 whitelists 集合
 * 这些邮箱原本用于本地登录验证，现在统一使用数据库白名单管理
 * 
 * 迁移的邮箱：
 * - ryan.lan_home@outlook.com (Microsoft Outlook 账号)
 * - admin@local.dev (本地开发账号)
 */
migrate(
  (app) => {
    const whitelistsCollection = app.findCollectionByNameOrId("whitelists");
    if (!whitelistsCollection) {
      console.warn("whitelists collection not found, skipping migration");
      return;
    }

    // 硬编码的白名单邮箱列表（从 src/config/auth_whitelist.js 迁移）
    const hardcodedEmails = [
      {
        email: "ryan.lan_home@outlook.com",
        description: "Microsoft Outlook 账号（从硬编码白名单迁移）",
      },
      {
        email: "admin@local.dev",
        description: "本地开发账号（从硬编码白名单迁移）",
      },
    ];

    // 为每个邮箱创建白名单记录（如果不存在）
    for (const { email, description } of hardcodedEmails) {
      try {
        // 检查是否已存在该邮箱的记录
        const qb = app
          .db()
          .select("id")
          .from(whitelistsCollection.name)
          .where(app.db().col(whitelistsCollection.name + ".email").eq(email))
          .limit(1);

        const existingRow = qb.one();
        if (existingRow && existingRow.id) {
          // 记录已存在，跳过
          console.log(`Whitelist record for ${email} already exists, skipping`);
          continue;
        }
      } catch (err) {
        // 未找到记录，继续创建
      }

      // 创建新的白名单记录
      try {
        const whitelistRecord = new Record(whitelistsCollection, {
          email: email,
          description: description,
        });
        app.save(whitelistRecord);
        console.log(`Created whitelist record for ${email}`);
      } catch (err) {
        console.error(`Failed to create whitelist record for ${email}:`, err);
        // 继续处理下一个邮箱，不中断迁移
      }
    }
  },
  (app) => {
    // 回滚逻辑：删除本迁移创建的白名单记录
    const whitelistsCollection = app.findCollectionByNameOrId("whitelists");
    if (!whitelistsCollection) {
      return;
    }

    const migratedEmails = [
      "ryan.lan_home@outlook.com",
      "admin@local.dev",
    ];

    for (const email of migratedEmails) {
      try {
        const qb = app
          .db()
          .select("id")
          .from(whitelistsCollection.name)
          .where(app.db().col(whitelistsCollection.name + ".email").eq(email))
          .limit(1);

        const row = qb.one();
        if (row && row.id) {
          const rec = app.findRecordById(whitelistsCollection.id, row.id);
          // 只删除描述中包含"从硬编码白名单迁移"的记录
          if (rec.description && rec.description.includes("从硬编码白名单迁移")) {
            app.delete(rec);
            console.log(`Deleted whitelist record for ${email}`);
          }
        }
      } catch (err) {
        // 忽略错误
      }
    }
  },
);

