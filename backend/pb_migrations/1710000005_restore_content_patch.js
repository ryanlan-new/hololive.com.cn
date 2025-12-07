/// <reference path="../pb_data/types.d.ts" />
/**
 * 内容回填修复脚本
 * 
 * 修复两个问题：
 * 1. 首页背景图丢失 - 从静态资源上传到 media 集合并关联到 cms_sections
 * 2. 页脚内容丢失 - 确保 cms_footer_info 和 cms_menus 包含正确的数据
 */
migrate((app) => {
  console.log("开始执行内容回填修复...");
  
  // ========== 1. 修复首页背景图 ==========
  // 注意：在 PocketBase 迁移脚本中，直接访问项目文件系统可能受限
  // 这里我们尝试使用 $filesystem API，如果失败则记录警告
  try {
    const mediaCollection = app.findCollectionByNameOrId("media");
    const sectionsCollection = app.findCollectionByNameOrId("cms_sections");
    
    // 获取 PocketBase 数据目录，尝试推断项目根目录
    const dataDir = app.dataDir();
    // 尝试从数据目录推断项目根目录（假设 pb_data 在项目根目录下）
    let projectRoot = dataDir;
    if (dataDir.includes("pb_data")) {
      projectRoot = dataDir.replace(/[\\/]pb_data[\\/]?$/, "");
    }
    
    // 背景图路径映射：section sort_order -> 图片路径（相对于项目根目录）
    const backgroundImages = {
      1: "public/holocn/p01.jpg", // Section 1 (Hero) 使用 p01.jpg
      2: "public/holocn/p07.jpg", // Section 2 (Pekoland) 使用 p07.jpg
    };
    
    // 获取所有 sections
    // 使用数据库查询
    const qbSections = app
      .db()
      .select("id")
      .from(sectionsCollection.name)
      .orderBy("sort_order ASC");
    
    const sectionRows = qbSections.all();
    const sections = sectionRows.map(row => {
      try {
        return app.findRecordById(sectionsCollection.id, row.id);
      } catch (e) {
        return null;
      }
    }).filter(r => r !== null);
    
    for (const section of sections) {
      const sortOrder = section.sort_order;
      const imagePath = backgroundImages[sortOrder];
      
      // 如果已经有背景图，跳过
      if (section.background) {
        console.log(`Section ${sortOrder} 已有背景图，跳过`);
        continue;
      }
      
      if (!imagePath) {
        console.log(`Section ${sortOrder} 没有对应的背景图配置，跳过`);
        continue;
      }
      
      // 尝试读取文件
      try {
        // 构建完整路径
        const fullPath = projectRoot + "/" + imagePath.replace(/^\/+/, "");
        console.log(`尝试读取背景图: ${fullPath}`);
        
        // 尝试使用 $filesystem API（如果可用）
        let file = null;
        try {
          if (typeof $filesystem !== "undefined" && $filesystem.fileFromPath) {
            file = $filesystem.fileFromPath(fullPath);
          }
        } catch (fsErr) {
          console.warn(`无法使用 $filesystem API: ${fsErr.message}`);
        }
        
        if (!file) {
          // 如果文件系统 API 不可用，记录警告并跳过
          console.warn(`⚠️  无法自动读取背景图文件: ${fullPath}`);
          console.warn(`   请手动在后台"资源库"中上传图片，然后在"首页管理"中关联到 Section ${sortOrder}`);
          continue;
        }
        
        // 创建 media 记录
        const mediaRecord = new Record(mediaCollection, {
          file: file,
        });
        app.save(mediaRecord);
        
        console.log(`✓ 成功上传背景图到 media 集合，ID: ${mediaRecord.id}`);
        
        // 更新 section 的 background 字段
        // 注意：PocketBase 的文件字段需要使用文件名
        const updatedSection = new Record(sectionsCollection, {
          id: section.id,
          background: mediaRecord.file, // 文件字段会自动关联
        });
        app.save(updatedSection);
        
        console.log(`✓ 成功关联背景图到 Section ${sortOrder} (ID: ${section.id})`);
      } catch (fileErr) {
        console.warn(`处理背景图失败 (Section ${sortOrder}):`, fileErr.message);
        console.warn(`   请手动在后台"资源库"中上传图片，然后在"首页管理"中关联`);
        // 继续处理下一个，不中断整个迁移
      }
    }
  } catch (err) {
    console.warn("修复首页背景图时出错:", err.message);
    console.warn("   背景图需要手动在后台上传和关联");
    // 不中断迁移，继续执行页脚修复
  }
  
  // ========== 2. 修复页脚内容 ==========
  
  // 2.1 确保 cms_footer_info 存在并包含正确内容
  try {
    const footerInfoCollection = app.findCollectionByNameOrId("cms_footer_info");
    let footerInfo;
    
    try {
      footerInfo = app.findRecordById(footerInfoCollection.id, "cmsfooterinfo01");
      console.log("cms_footer_info 记录已存在，检查内容...");
      
      // 检查内容是否为空或缺失
      const content = footerInfo.content || {};
      if (!content.copyright || !content.disclaimer) {
        console.log("页脚内容不完整，更新中...");
        // 更新现有记录：直接修改记录对象并保存
        footerInfo.content = {
          copyright: {
            zh: "Copyright © 2025 月球厨师莱恩",
            en: "Copyright © 2025 月球厨师莱恩",
            ja: "Copyright © 2025 月球厨师莱恩"
          },
          disclaimer: {
            zh: "hololive™/hololive production™是日本COVER株式会社旗下的经纪公司品牌。本网站为个人运营非官方站点，请仔细甄别内容。",
            en: "hololive™ & hololive production™ are trademarks of COVER Corporation. This is a personally operated unofficial site; please verify content independently.",
            ja: "hololive™/hololive production™はカバー株式会社の商標です。当サイトは個人運営の非公式サイトであり、内容の真偽については各自でご判断ください。"
          },
          specialThanks: {
            zh: {
              title: "特别鸣谢&一些有用的信息",
              items: [
                "（旧）幻夜字幕组",
                "（旧）hololive China Project",
                "（旧）hololive China Talents",
                "兔田重工",
                "Usada_kidd 等所有帮助过该网站的原字幕组成员"
              ]
            },
            en: {
              title: "Special Thanks & Info",
              items: [
                "（旧）hololive China Project",
                "Usada Kensetsu",
                "Usada_kidd and all former sub-members who helped"
              ]
            },
            ja: {
              title: "スペシャルサンクス & 情報",
              items: [
                "（旧）hololive China Project",
                "兎田建設",
                "Usada_kiddをはじめ、協力してくれた旧字幕組の全メンバー"
              ]
            }
          }
        };
        app.save(footerInfo);
        console.log("✓ 页脚信息已更新");
      } else {
        console.log("✓ 页脚信息已完整，无需更新");
      }
    } catch (notFoundErr) {
      // 记录不存在，创建新记录
      console.log("cms_footer_info 记录不存在，创建中...");
      footerInfo = new Record(footerInfoCollection, {
        id: "cmsfooterinfo01",
        content: {
          copyright: {
            zh: "Copyright © 2025 月球厨师莱恩",
            en: "Copyright © 2025 月球厨师莱恩",
            ja: "Copyright © 2025 月球厨师莱恩"
          },
          disclaimer: {
            zh: "hololive™/hololive production™是日本COVER株式会社旗下的经纪公司品牌。本网站为个人运营非官方站点，请仔细甄别内容。",
            en: "hololive™ & hololive production™ are trademarks of COVER Corporation. This is a personally operated unofficial site; please verify content independently.",
            ja: "hololive™/hololive production™はカバー株式会社の商標です。当サイトは個人運営の非公式サイトであり、内容の真偽については各自でご判断ください。"
          },
          specialThanks: {
            zh: {
              title: "特别鸣谢&一些有用的信息",
              items: [
                "（旧）幻夜字幕组",
                "（旧）hololive China Project",
                "（旧）hololive China Talents",
                "兔田重工",
                "Usada_kidd 等所有帮助过该网站的原字幕组成员"
              ]
            },
            en: {
              title: "Special Thanks & Info",
              items: [
                "（旧）hololive China Project",
                "Usada Kensetsu",
                "Usada_kidd and all former sub-members who helped"
              ]
            },
            ja: {
              title: "スペシャルサンクス & 情報",
              items: [
                "（旧）hololive China Project",
                "兎田建設",
                "Usada_kiddをはじめ、協力してくれた旧字幕組の全メンバー"
              ]
            }
          }
        }
      });
      app.save(footerInfo);
      console.log("页脚信息已创建");
    }
  } catch (err) {
    console.warn("修复页脚信息时出错:", err.message);
    // 使用默认兜底数据
    try {
      const footerInfoCollection = app.findCollectionByNameOrId("cms_footer_info");
      const fallbackFooterInfo = new Record(footerInfoCollection, {
        id: "cmsfooterinfo01",
        content: {
          copyright: {
            zh: "© 2024 HololiveCN MC Server. All rights reserved.",
            en: "© 2024 HololiveCN MC Server. All rights reserved.",
            ja: "© 2024 HololiveCN MC Server. All rights reserved."
          },
          disclaimer: {
            zh: "hololive™/hololive production™是日本COVER株式会社旗下的经纪公司品牌。本网站为个人运营非官方站点，请仔细甄别内容。",
            en: "hololive™ & hololive production™ are trademarks of COVER Corporation. This is a personally operated unofficial site; please verify content independently.",
            ja: "hololive™/hololive production™はカバー株式会社の商標です。当サイトは個人運営の非公式サイトであり、内容の真偽については各自でご判断ください。"
          }
        }
      });
      app.save(fallbackFooterInfo);
      console.log("已使用默认兜底数据创建页脚信息");
    } catch (fallbackErr) {
      console.error("使用兜底数据也失败:", fallbackErr.message);
    }
  }
  
  // 2.2 确保页脚菜单项存在
  try {
    const menusCollection = app.findCollectionByNameOrId("cms_menus");
    
    // 检查页脚菜单项数量
    // 使用数据库查询
    const qb = app.db()
      .select("id")
      .from(menusCollection.name)
      .where(app.db().col(menusCollection.name + ".location").eq("footer"));
    
    const footerMenuRows = qb.all();
    const footerMenus = footerMenuRows.map(row => {
      try {
        return app.findRecordById(menusCollection.id, row.id);
      } catch (e) {
        return null;
      }
    }).filter(r => r !== null);
    
    if (footerMenus.length === 0) {
      console.log("页脚菜单项为空，重新创建...");
      
      // 从之前的迁移脚本中提取的页脚菜单数据
      const footerMenuItems = [
        {
          location: "footer",
          label: { zh: "月球厨师莱恩的个人空间", en: "月球厨师莱恩的个人空间", ja: "月球厨师莱恩的个人空间" },
          link: "https://space.bilibili.com/14539444",
          sort_order: 1,
          open_new_tab: true
        },
        {
          location: "footer",
          label: { zh: "联系网站管理员", en: "Contact Admin", ja: "管理者に連絡" },
          link: "mailto:ryan.lan_home@outlook.com",
          sort_order: 2,
          open_new_tab: false
        },
        {
          location: "footer",
          label: { zh: "官方网站", en: "Official Website", ja: "公式サイト" },
          link: "https://hololivepro.com/",
          sort_order: 3,
          open_new_tab: true
        },
        {
          location: "footer",
          label: { zh: "YouTube", en: "YouTube", ja: "YouTube" },
          link: "https://www.youtube.com/channel/UCJFZiqLMntJufDCHc6bQixg",
          sort_order: 4,
          open_new_tab: true
        },
        {
          location: "footer",
          label: { zh: "X", en: "X", ja: "X" },
          link: "https://twitter.com/hololivetv",
          sort_order: 5,
          open_new_tab: true
        },
        {
          location: "footer",
          label: { zh: "TikTok", en: "TikTok", ja: "TikTok" },
          link: "https://www.tiktok.com/@hololive_official",
          sort_order: 6,
          open_new_tab: true
        },
        {
          location: "footer",
          label: { zh: "粤ICP备2023071182号-1", en: "粤ICP备2023071182号-1", ja: "粤ICP备2023071182号-1" },
          link: "https://beian.miit.gov.cn/",
          sort_order: 7,
          open_new_tab: true
        }
      ];
      
      for (const menuData of footerMenuItems) {
        const menuRecord = new Record(menusCollection, menuData);
        app.save(menuRecord);
      }
      
      console.log(`已创建 ${footerMenuItems.length} 个页脚菜单项`);
    } else {
      console.log(`页脚菜单项已存在 (${footerMenus.length} 个)`);
    }
  } catch (err) {
    console.warn("修复页脚菜单时出错:", err.message);
  }
  
  console.log("内容回填修复完成！");
}, (app) => {
  // down 函数：回滚逻辑（可选）
  // 注意：此脚本主要是修复数据，回滚时不需要删除数据
  console.log("回滚内容回填修复（无操作）");
});

