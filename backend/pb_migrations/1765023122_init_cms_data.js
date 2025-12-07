/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ========== 创建 cms_sections 集合 ==========
  let cmsSectionsCollection = app.findCollectionByNameOrId("cms_sections");
  if (!cmsSectionsCollection) {
    cmsSectionsCollection = new Collection({
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
    app.save(cmsSectionsCollection);
  }

  // ========== 创建 cms_menus 集合 ==========
  let cmsMenusCollection = app.findCollectionByNameOrId("cms_menus");
  if (!cmsMenusCollection) {
    cmsMenusCollection = new Collection({
      "id": "pbc_cms_menus",
      "name": "cms_menus",
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
          "id": "text_cms_menu_id",
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
          "id": "autodate_cms_menu_created",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate_cms_menu_updated",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "select_cms_menu_location",
          "maxSelect": 1,
          "name": "location",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "navbar",
            "footer"
          ]
        },
        {
          "hidden": false,
          "id": "json_cms_menu_label",
          "maxSize": 0,
          "name": "label",
          "presentable": true,
          "required": true,
          "system": false,
          "type": "json"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text_cms_menu_link",
          "max": 512,
          "min": 0,
          "name": "link",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "number_cms_menu_sort",
          "name": "sort_order",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "bool_cms_menu_open",
          "name": "open_new_tab",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "bool"
        }
      ],
      "indexes": []
    });
    app.save(cmsMenusCollection);
  }

  // ========== 创建 cms_footer_info 集合 ==========
  let cmsFooterInfoCollection = app.findCollectionByNameOrId("cms_footer_info");
  if (!cmsFooterInfoCollection) {
    cmsFooterInfoCollection = new Collection({
      "id": "pbc_cms_footer_info",
      "name": "cms_footer_info",
      "type": "base",
      "system": false,
      "listRule": "",
      "viewRule": "",
      "createRule": "@request.auth.id != \"\"",
      "updateRule": "@request.auth.id != \"\"",
      "deleteRule": "id = \"\"",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text_cms_footer_id",
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
          "id": "autodate_cms_footer_created",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate_cms_footer_updated",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "json_cms_footer_content",
          "maxSize": 0,
          "name": "content",
          "presentable": true,
          "required": true,
          "system": false,
          "type": "json"
        }
      ],
      "indexes": []
    });
    app.save(cmsFooterInfoCollection);
  }

  // ========== 插入默认数据 ==========
  
  // 插入 Section 1: Hero (HololiveCN MC Server)
  try {
    // 检查是否已存在 sort_order = 1 的记录
    const qb1 = app
      .db()
      .select("id")
      .from(cmsSectionsCollection.name)
      .where(app.db().col(cmsSectionsCollection.name + ".sort_order").eq(1))
      .limit(1);
    const row1 = qb1.one();
    if (!row1 || !row1.id) {
      const section1 = new Record(cmsSectionsCollection, {
        "title": {
          "zh": "HololiveCN MC Server",
          "en": "HololiveCN MC Server",
          "ja": "HololiveCN MC Server"
        },
        "subtitle": {
          "zh": "欢迎访问 HololiveCN MC 服务器。请勿泄露您的密码/凭据，也不要向任何人支付费用，谨防诈骗。",
          "en": "Welcome to the HololiveCN MC Server. Please do not reveal your password credentials or pay any fees to anyone, and beware of scams.",
          "ja": "HololiveCN MC サーバーへようこそ。パスワードや認証情報を漏らしたり、金銭を支払ったりしないようご注意ください。詐欺にご注意ください。"
        },
        "sort_order": 1,
        "buttons": [
          {
            "label": {
              "zh": "服务器信息",
              "en": "Server Info",
              "ja": "サーバー情報"
            },
            "link": "#",
            "style": "primary"
          }
        ]
      });
      app.save(section1);
    }
  } catch (err) {
    // 忽略错误，继续执行
  }

  // 插入 Section 2: Pekoland
  try {
    const qb2 = app
      .db()
      .select("id")
      .from(cmsSectionsCollection.name)
      .where(app.db().col(cmsSectionsCollection.name + ".sort_order").eq(2))
      .limit(1);
    const row2 = qb2.one();
    if (!row2 || !row2.id) {
      const section2 = new Record(cmsSectionsCollection, {
        "title": {
          "zh": "Pekoland",
          "en": "Pekoland",
          "ja": "ペコランド"
        },
        "subtitle": {
          "zh": "兔田重工所在地，兔组大本营",
          "en": "Location of Usada Kensetsu, Base of the Rabbits",
          "ja": "兎田建設の所在地、野うさぎの本拠地"
        },
        "sort_order": 2,
        "buttons": [
          {
            "label": {
              "zh": "转到地图",
              "en": "Go to Map",
              "ja": "地図へ移動"
            },
            "link": "#",
            "style": "primary"
          }
        ]
      });
      app.save(section2);
    }
  } catch (err) {
    // 忽略错误，继续执行
  }

  // 插入导航栏菜单
  try {
    const navbarQb = app
      .db()
      .select("id")
      .from(cmsMenusCollection.name)
      .where(app.db().col(cmsMenusCollection.name + ".location").eq("navbar"))
      .limit(1);
    const navbarRow = navbarQb.one();
    if (!navbarRow || !navbarRow.id) {
      const navbarHome = new Record(cmsMenusCollection, {
        "location": "navbar",
        "label": {
          "zh": "首页",
          "en": "Home",
          "ja": "ホーム"
        },
        "link": "/",
        "sort_order": 1,
        "open_new_tab": false
      });
      app.save(navbarHome);

      const navbarDocs = new Record(cmsMenusCollection, {
        "location": "navbar",
        "label": {
          "zh": "文档",
          "en": "Docs",
          "ja": "ドキュメント"
        },
        "link": "/docs",
        "sort_order": 2,
        "open_new_tab": false
      });
      app.save(navbarDocs);
    }
  } catch (err) {
    // 忽略错误，继续执行
  }

  // 插入页脚菜单
  try {
    const footerQb = app
      .db()
      .select("id")
      .from(cmsMenusCollection.name)
      .where(app.db().col(cmsMenusCollection.name + ".location").eq("footer"))
      .limit(1);
    const footerRow = footerQb.one();
    if (!footerRow || !footerRow.id) {
      const footerBilibili = new Record(cmsMenusCollection, {
        "location": "footer",
        "label": {
          "zh": "月球厨师莱恩的个人空间",
          "en": "月球厨师莱恩的个人空间",
          "ja": "月球厨师莱恩的个人空间"
        },
        "link": "https://space.bilibili.com/14539444",
        "sort_order": 1,
        "open_new_tab": true
      });
      app.save(footerBilibili);

      const footerEmail = new Record(cmsMenusCollection, {
        "location": "footer",
        "label": {
          "zh": "联系网站管理员",
          "en": "Contact Admin",
          "ja": "管理者に連絡"
        },
        "link": "mailto:ryan.lan_home@outlook.com",
        "sort_order": 2,
        "open_new_tab": false
      });
      app.save(footerEmail);

      const footerOfficialSite = new Record(cmsMenusCollection, {
        "location": "footer",
        "label": {
          "zh": "官方网站",
          "en": "Official Website",
          "ja": "公式サイト"
        },
        "link": "https://hololivepro.com/",
        "sort_order": 3,
        "open_new_tab": true
      });
      app.save(footerOfficialSite);

      const footerYouTube = new Record(cmsMenusCollection, {
        "location": "footer",
        "label": {
          "zh": "YouTube",
          "en": "YouTube",
          "ja": "YouTube"
        },
        "link": "https://www.youtube.com/channel/UCJFZiqLMntJufDCHc6bQixg",
        "sort_order": 4,
        "open_new_tab": true
      });
      app.save(footerYouTube);

      const footerX = new Record(cmsMenusCollection, {
        "location": "footer",
        "label": {
          "zh": "X",
          "en": "X",
          "ja": "X"
        },
        "link": "https://twitter.com/hololivetv",
        "sort_order": 5,
        "open_new_tab": true
      });
      app.save(footerX);

      const footerTikTok = new Record(cmsMenusCollection, {
        "location": "footer",
        "label": {
          "zh": "TikTok",
          "en": "TikTok",
          "ja": "TikTok"
        },
        "link": "https://www.tiktok.com/@hololive_official",
        "sort_order": 6,
        "open_new_tab": true
      });
      app.save(footerTikTok);

      const footerICP = new Record(cmsMenusCollection, {
        "location": "footer",
        "label": {
          "zh": "粤ICP备2023071182号-1",
          "en": "粤ICP备2023071182号-1",
          "ja": "粤ICP备2023071182号-1"
        },
        "link": "https://beian.miit.gov.cn/",
        "sort_order": 7,
        "open_new_tab": true
      });
      app.save(footerICP);
    }
  } catch (err) {
    // 忽略错误，继续执行
  }

  // 插入页脚版权信息（单例模式，固定 ID 为 "cmsfooterinfo01"）
  try {
    app.findRecordById(cmsFooterInfoCollection.id, "cmsfooterinfo01");
  } catch (err) {
    // 未找到则创建
    const footerInfo = new Record(cmsFooterInfoCollection, {
      id: "cmsfooterinfo01",
      "content": {
        "copyright": {
          "zh": "Copyright © 2025 月球厨师莱恩",
          "en": "Copyright © 2025 月球厨师莱恩",
          "ja": "Copyright © 2025 月球厨师莱恩"
        },
        "disclaimer": {
          "zh": "hololive™/hololive production™是日本COVER株式会社旗下的经纪公司品牌。本网站为个人运营非官方站点，请仔细甄别内容。",
          "en": "hololive™ & hololive production™ are trademarks of COVER Corporation. This is a personally operated unofficial site; please verify content independently.",
          "ja": "hololive™/hololive production™はカバー株式会社の商標です。当サイトは個人運営の非公式サイトであり、内容の真偽については各自でご判断ください。"
        },
        "specialThanks": {
          "zh": {
            "title": "特别鸣谢&一些有用的信息",
            "items": [
              "（旧）幻夜字幕组",
              "（旧）hololive China Project",
              "（旧）hololive China Talents",
              "兔田重工",
              "Usada_kidd 等所有帮助过该网站的原字幕组成员"
            ]
          },
          "en": {
            "title": "Special Thanks & Info",
            "items": [
              "（旧）hololive China Project",
              "Usada Kensetsu",
              "Usada_kidd and all former sub-members who helped"
            ]
          },
          "ja": {
            "title": "スペシャルサンクス & 情報",
            "items": [
              "（旧）hololive China Project",
              "兎田建設",
              "Usada_kiddをはじめ、協力してくれた旧字幕組の全メンバー"
            ]
          }
        }
      }
    });
    app.save(footerInfo);
  }
}, (app) => {
  // down 函数：删除集合
  const cmsSectionsCollection = app.findCollectionByNameOrId("cms_sections");
  if (cmsSectionsCollection) {
    app.delete(cmsSectionsCollection);
  }

  const cmsMenusCollection = app.findCollectionByNameOrId("cms_menus");
  if (cmsMenusCollection) {
    app.delete(cmsMenusCollection);
  }

  const cmsFooterInfoCollection = app.findCollectionByNameOrId("cms_footer_info");
  if (cmsFooterInfoCollection) {
    app.delete(cmsFooterInfoCollection);
  }
})

