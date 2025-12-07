/// <reference path="../pb_data/types.d.ts" />
/**
 * 为本地开发环境预置一个管理员账号：
 * email:    admin@local.dev
 * password: password123456
 *
 * 仅在 users 集合中不存在该邮箱时创建。
 */
migrate(
  (app) => {
    try {
      const users = app.findCollectionByNameOrId("_pb_users_auth_");

      // 如果已经存在相同邮箱，则跳过
      try {
        app.findFirstRecordByData(users, "email", "admin@local.dev");
        // 记录已存在，直接返回
        return;
      } catch (err) {
        // 未找到则继续创建
      }

      const record = new Record(users, {
        email: "admin@local.dev",
        password: "password123456",
        passwordConfirm: "password123456",
        emailVisibility: true,
        verified: true,
      });

      app.save(record);
    } catch (err) {
      // 如果集合不存在或其它错误，静默跳过
      console.warn("Failed to seed admin@local.dev user:", err);
    }
  },
  (app) => {
    // 回滚：可选地删除该预置账号
    try {
      const users = app.findCollectionByNameOrId("_pb_users_auth_");
      const rec = app.findFirstRecordByData(users, "email", "admin@local.dev");
      app.delete(rec);
    } catch (err) {
      // 记录或集合不存在时忽略
    }
  },
);


