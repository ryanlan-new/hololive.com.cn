/// <reference path="../pb_data/types.d.ts" />
/**
 * 修复首页并清理旧集合
 * 
 * 1. 删除 cms_menus 和 cms_footer_info 集合
 * 2. 确保 cms_sections 集合存在
 * 3. 自动上传背景图并填充首页数据
 */
migrate((app) => {
  console.log("开始执行首页修复和清理...");
  
  // ========== 1. 清理旧集合 ==========
  try {
    const menusCollection = app.findCollectionByNameOrId("cms_menus");
    if (menusCollection) {
      console.log("删除 cms_menus 集合...");
      app.delete(menusCollection);
      console.log("✓ cms_menus 集合已删除");
    }
  } catch (err) {
    console.log("cms_menus 集合不存在，跳过删除");
  }
  
  try {
    const footerInfoCollection = app.findCollectionByNameOrId("cms_footer_info");
    if (footerInfoCollection) {
      console.log("删除 cms_footer_info 集合...");
      app.delete(footerInfoCollection);
      console.log("✓ cms_footer_info 集合已删除");
    }
  } catch (err) {
    console.log("cms_footer_info 集合不存在，跳过删除");
  }
  
  // ========== 2. 确保 cms_sections 集合存在 ==========
  let sectionsCollection = app.findCollectionByNameOrId("cms_sections");
  if (!sectionsCollection) {
    console.log("创建 cms_sections 集合...");
    sectionsCollection = new Collection({
      "id": "pbc_cms_sections",
      "name": "cms_sections",
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
          "system": false,
          "type": "json"
        }
      ],
      "indexes": []
    });
    app.save(sectionsCollection);
    console.log("✓ cms_sections 集合已创建");
  } else {
    console.log("✓ cms_sections 集合已存在");
  }
  
  // ========== 3. 自动上传背景图并填充首页数据 ==========
  try {
    const mediaCollection = app.findCollectionByNameOrId("media");
    if (!mediaCollection) {
      console.warn("⚠️  media 集合不存在，无法上传背景图");
    } else {
      // 获取 PocketBase 数据目录，推断项目根目录
      const dataDir = app.dataDir();
      let projectRoot = dataDir;
      if (dataDir.includes("pb_data")) {
        projectRoot = dataDir.replace(/[\\/]pb_data[\\/]?$/, "");
      }
      
      // 背景图配置：section sort_order -> 图片文件名
      const backgroundImages = {
        1: "p01.jpg", // Section 1 (Hero)
        2: "p07.jpg", // Section 2 (Pekoland)
      };
      
      // 检查现有 sections
      const qbSections = app
        .db()
        .select("id")
        .from(sectionsCollection.name)
        .orderBy("sort_order ASC");
      
      const sectionRows = qbSections.all();
      const existingSections = sectionRows.map(row => {
        try {
          return app.findRecordById(sectionsCollection.id, row.id);
        } catch (e) {
          return null;
        }
      }).filter(r => r !== null);
      
      // 为每个 section 处理背景图
      for (const [sortOrderStr, imageFile] of Object.entries(backgroundImages)) {
        const sortOrder = parseInt(sortOrderStr);
        const imagePath = projectRoot + "/public/holocn/" + imageFile;
        
        // 查找或创建对应的 section
        let section = existingSections.find(s => s.sort_order === sortOrder);
        
        // 如果 section 不存在，创建它
        if (!section) {
          console.log(`创建 Section ${sortOrder}...`);
          
          // 默认内容
          const defaultContent = {
            1: {
              title: {
                zh: "HololiveCN MC Server",
                en: "HololiveCN MC Server",
                ja: "HololiveCN MC Server"
              },
              subtitle: {
                zh: "欢迎访问 HololiveCN MC 服务器。请勿泄露您的密码/凭据，也不要向任何人支付费用，谨防诈骗。",
                en: "Welcome to the HololiveCN MC Server. Please do not reveal your password credentials or pay any fees to anyone, and beware of scams.",
                ja: "HololiveCN MC サーバーへようこそ。パスワードや認証情報を漏らしたり、金銭を支払ったりしないようご注意ください。詐欺にご注意ください。"
              },
              buttons: [
                {
                  label: {
                    zh: "服务器信息",
                    en: "Server Info",
                    ja: "サーバー情報"
                  },
                  link: "#",
                  style: "primary"
                }
              ]
            },
            2: {
              title: {
                zh: "Pekoland",
                en: "Pekoland",
                ja: "ペコランド"
              },
              subtitle: {
                zh: "兔田重工所在地，兔组大本营",
                en: "Location of Usada Kensetsu, Base of the Rabbits",
                ja: "兎田建設の所在地、野うさぎの本拠地"
              },
              buttons: [
                {
                  label: {
                    zh: "转到地图",
                    en: "Go to Map",
                    ja: "地図へ移動"
                  },
                  link: "#",
                  style: "primary"
                }
              ]
            }
          };
          
          const content = defaultContent[sortOrder] || defaultContent[1];
          
          // 创建 section 记录（先创建基本记录，背景图稍后处理）
          const sectionData = {
            title: content.title,
            subtitle: content.subtitle,
            sort_order: sortOrder,
            buttons: content.buttons,
          };
          
          const newSection = new Record(sectionsCollection, sectionData);
          app.save(newSection);
          console.log(`✓ Section ${sortOrder} 已创建（基本内容）`);
          
          // 尝试读取并上传背景图
          if (mediaCollection) {
            try {
              // 尝试使用文件系统 API
              let backgroundFile = null;
              try {
                if (typeof $filesystem !== "undefined" && $filesystem.fileFromPath) {
                  backgroundFile = $filesystem.fileFromPath(imagePath);
                  console.log(`✓ 成功读取背景图: ${imagePath}`);
                } else {
                  console.warn(`⚠️  无法使用文件系统 API，跳过背景图: ${imagePath}`);
                  console.warn(`   请手动在后台"资源库"中上传图片，然后在"首页管理"中关联`);
                }
              } catch (fileErr) {
                console.warn(`⚠️  读取背景图失败 (${imagePath}):`, fileErr.message);
                console.warn(`   请手动在后台"资源库"中上传图片，然后在"首页管理"中关联`);
              }
              
              // 如果有背景图，更新 section 并上传到 media
              if (backgroundFile) {
                // 更新 section 的背景图
                const formDataObj = new FormData();
                formDataObj.append("background", backgroundFile);
                const updatedSection = new Record(sectionsCollection, formDataObj);
                updatedSection.id = newSection.id;
                app.save(updatedSection);
                console.log(`✓ Section ${sortOrder} 背景图已关联`);
                
                // 同时上传到 media 集合
                try {
                  const mediaRecord = new Record(mediaCollection, {
                    file: backgroundFile,
                  });
                  app.save(mediaRecord);
                  console.log(`✓ 背景图已上传到 media 集合，ID: ${mediaRecord.id}`);
                } catch (mediaErr) {
                  console.warn(`⚠️  上传到 media 集合失败:`, mediaErr.message);
                }
              }
            } catch (bgErr) {
              console.warn(`⚠️  处理背景图时出错:`, bgErr.message);
            }
          }
        } else {
          // Section 已存在，检查是否需要更新背景图
          if (!section.background) {
            console.log(`Section ${sortOrder} 存在但缺少背景图，尝试添加...`);
            
            try {
              if (typeof $filesystem !== "undefined" && $filesystem.fileFromPath) {
                const backgroundFile = $filesystem.fileFromPath(imagePath);
                
                // 更新 section 的背景图
                const formDataObj = new FormData();
                formDataObj.append("background", backgroundFile);
                const updatedSection = new Record(sectionsCollection, formDataObj);
                updatedSection.id = section.id;
                app.save(updatedSection);
                
                console.log(`✓ Section ${sortOrder} 背景图已更新`);
                
                // 同时上传到 media 集合
                if (mediaCollection) {
                  try {
                    const mediaRecord = new Record(mediaCollection, {
                      file: backgroundFile,
                    });
                    app.save(mediaRecord);
                    console.log(`✓ 背景图已上传到 media 集合，ID: ${mediaRecord.id}`);
                  } catch (mediaErr) {
                    console.warn(`⚠️  上传到 media 集合失败:`, mediaErr.message);
                  }
                }
              } else {
                console.warn(`⚠️  无法使用文件系统 API，跳过背景图更新`);
                console.warn(`   请手动在后台"资源库"中上传图片，然后在"首页管理"中关联`);
              }
            } catch (fileErr) {
              console.warn(`⚠️  更新背景图失败:`, fileErr.message);
              console.warn(`   请手动在后台"资源库"中上传图片，然后在"首页管理"中关联`);
            }
          } else {
            console.log(`✓ Section ${sortOrder} 已有背景图，跳过`);
          }
        }
      }
    }
  } catch (err) {
    console.warn("处理背景图时出错:", err.message);
    // 即使图片处理失败，也确保创建基本的 section 记录
    try {
      const qbSections = app
        .db()
        .select("id")
        .from(sectionsCollection.name)
        .orderBy("sort_order ASC");
      
      const sectionRows = qbSections.all();
      if (sectionRows.length === 0) {
        console.log("创建默认 Section 记录（无背景图）...");
        
        const defaultSections = [
          {
            sort_order: 1,
            title: {
              zh: "HololiveCN MC Server",
              en: "HololiveCN MC Server",
              ja: "HololiveCN MC Server"
            },
            subtitle: {
              zh: "欢迎访问 HololiveCN MC 服务器。请勿泄露您的密码/凭据，也不要向任何人支付费用，谨防诈骗。",
              en: "Welcome to the HololiveCN MC Server. Please do not reveal your password credentials or pay any fees to anyone, and beware of scams.",
              ja: "HololiveCN MC サーバーへようこそ。パスワードや認証情報を漏らしたり、金銭を支払ったりしないようご注意ください。詐欺にご注意ください。"
            },
            buttons: [
              {
                label: {
                  zh: "服务器信息",
                  en: "Server Info",
                  ja: "サーバー情報"
                },
                link: "#",
                style: "primary"
              }
            ]
          },
          {
            sort_order: 2,
            title: {
              zh: "Pekoland",
              en: "Pekoland",
              ja: "ペコランド"
            },
            subtitle: {
              zh: "兔田重工所在地，兔组大本营",
              en: "Location of Usada Kensetsu, Base of the Rabbits",
              ja: "兎田建設の所在地、野うさぎの本拠地"
            },
            buttons: [
              {
                label: {
                  zh: "转到地图",
                  en: "Go to Map",
                  ja: "地図へ移動"
                },
                link: "#",
                style: "primary"
              }
            ]
          }
        ];
        
        for (const sectionData of defaultSections) {
          const newSection = new Record(sectionsCollection, sectionData);
          app.save(newSection);
          console.log(`✓ 默认 Section ${sectionData.sort_order} 已创建`);
        }
      }
    } catch (fallbackErr) {
      console.error("创建默认 Section 也失败:", fallbackErr.message);
    }
  }
  
  console.log("首页修复和清理完成！");
}, (app) => {
  // down 函数：回滚逻辑（可选）
  console.log("回滚首页修复（无操作）");
});

