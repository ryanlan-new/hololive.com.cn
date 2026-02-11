
/**
 * 添加额外的管理员白名单
 * 
 * 新增邮箱：
 * - hardy1035626987@hotmail.com
 */
migrate(
    (app) => {
        const whitelistsCollection = app.findCollectionByNameOrId("whitelists");
        if (!whitelistsCollection) {
            console.warn("whitelists collection not found, skipping migration");
            return;
        }

        const email = "hardy1035626987@hotmail.com";
        const description = "新增管理员（2026-02-11）";

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
                return;
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
        }
    },
    (app) => {
        // 回滚逻辑
        const whitelistsCollection = app.findCollectionByNameOrId("whitelists");
        if (!whitelistsCollection) {
            return;
        }

        const email = "hardy1035626987@hotmail.com";

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
                app.delete(rec);
                console.log(`Deleted whitelist record for ${email}`);
            }
        } catch (err) {
            // 忽略错误
        }
    }
);
