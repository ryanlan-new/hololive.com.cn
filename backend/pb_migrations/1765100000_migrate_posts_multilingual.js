/// <reference path="../pb_data/types.d.ts" />
/**
 * 将 posts 集合的 title、summary、content 字段从 Text 迁移到 JSON（多语言支持）
 * 
 * 迁移逻辑：
 * 1. 获取所有现有的 posts 记录
 * 2. 将每个记录的 title、summary、content 从字符串转换为 JSON 对象
 * 3. 格式：{"zh": "原内容", "en": "原内容", "ja": "原内容"}
 */
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_posts");
  
  if (!collection) {
    console.log("posts 集合不存在，跳过迁移");
    return;
  }

  // 使用 db() 查询所有记录
  let records = [];
  try {
    const rows = app
      .db()
      .select("id")
      .from(collection.name)
      .all();
    
    records = rows.map(row => row.id);
    
    if (records.length === 0) {
      console.log("posts 集合中没有记录，跳过数据迁移");
      return;
    }
  } catch (err) {
    console.error("查询 posts 记录失败:", err.message);
    return;
  }

  console.log(`找到 ${records.length} 条记录，开始迁移...`);

  let migratedCount = 0;

  for (const recordId of records) {
    try {
      // 获取完整记录
      const record = app.findRecordById(collection.id, recordId);
      let updated = false;

      // 迁移 title 字段
      const currentTitle = record.get("title");
      if (currentTitle) {
        // 如果已经是对象格式，跳过
        if (typeof currentTitle === "object" && currentTitle !== null && !Array.isArray(currentTitle)) {
          // 已经是 JSON 格式，跳过
        } else if (typeof currentTitle === "string" && currentTitle.trim()) {
          // 转换为 JSON 格式
          record.set("title", {
            zh: currentTitle,
            en: currentTitle,
            ja: currentTitle,
          });
          updated = true;
        }
      }

      // 迁移 summary 字段
      const currentSummary = record.get("summary");
      if (currentSummary) {
        if (typeof currentSummary === "object" && currentSummary !== null && !Array.isArray(currentSummary)) {
          // 已经是 JSON 格式，跳过
        } else if (typeof currentSummary === "string" && currentSummary.trim()) {
          record.set("summary", {
            zh: currentSummary,
            en: currentSummary,
            ja: currentSummary,
          });
          updated = true;
        }
      }

      // 迁移 content 字段
      const currentContent = record.get("content");
      if (currentContent) {
        if (typeof currentContent === "object" && currentContent !== null && !Array.isArray(currentContent)) {
          // 已经是 JSON 格式，跳过
        } else if (typeof currentContent === "string" && currentContent.trim()) {
          record.set("content", {
            zh: currentContent,
            en: currentContent,
            ja: currentContent,
          });
          updated = true;
        }
      }

      // 如果有更新，保存记录
      if (updated) {
        app.save(record);
        migratedCount++;
      }
    } catch (err) {
      console.error(`迁移记录 ${recordId} 失败:`, err.message);
    }
  }

  console.log(`✓ 成功迁移 ${migratedCount} 条记录`);
}, (app) => {
  // down 函数：回滚（将 JSON 转换回字符串，使用 zh 作为默认值）
  const collection = app.findCollectionByNameOrId("pbc_posts");
  
  if (!collection) {
    return;
  }

  // 使用 db() 查询所有记录
  let records = [];
  try {
    const rows = app
      .db()
      .select("id")
      .from(collection.name)
      .all();
    
    records = rows.map(row => row.id);
    
    if (records.length === 0) {
      return;
    }
  } catch (err) {
    console.error("查询 posts 记录失败:", err.message);
    return;
  }

  console.log(`回滚 ${records.length} 条记录...`);

  for (const recordId of records) {
    try {
      const record = app.findRecordById(collection.id, recordId);
      let updated = false;

      // 回滚 title
      const title = record.get("title");
      if (title && typeof title === "object" && title !== null && !Array.isArray(title)) {
        // 如果是对象，取 zh 值
        record.set("title", title.zh || title.en || title.ja || "");
        updated = true;
      }

      // 回滚 summary
      const summary = record.get("summary");
      if (summary && typeof summary === "object" && summary !== null && !Array.isArray(summary)) {
        record.set("summary", summary.zh || summary.en || summary.ja || "");
        updated = true;
      }

      // 回滚 content
      const content = record.get("content");
      if (content && typeof content === "object" && content !== null && !Array.isArray(content)) {
        record.set("content", content.zh || content.en || content.ja || "");
        updated = true;
      }

      if (updated) {
        app.save(record);
      }
    } catch (err) {
      console.error(`回滚记录 ${recordId} 失败:`, err.message);
    }
  }
  
  console.log("✓ 回滚完成");
});
