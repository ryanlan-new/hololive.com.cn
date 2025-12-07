import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    common: {
      serverInfo: '服务器信息',
      icp: '粤ICP备2023071182号-1',
      navbar: {
        home: '首页',
        docs: '文档',
      },
      languageNames: {
        en: 'English',
        zh: '中文',
        ja: '日本語',
      },
      footer: {
        copyright: 'All rights reserved.',
        powered_by: 'Powered by PocketBase & React',
        contactUs: '联系我们',
        contactAdmin: '联系网站管理员',
        specialThanks: '特别鸣谢&一些有用的信息',
        holoCNProject: '（旧）hololive China Project',
        officialSite: '官方网站',
        coverDisclaimer: 'hololive™/hololive production™是日本COVER株式会社旗下的经纪公司品牌。本网站为个人运营非官方站点，请仔细甄别内容。',
        usadaKensetsu: '兔田重工',
        thanksStaff: 'Usada_kidd 等所有帮助过该网站的原字幕组成员',
      },
    },
    home: {
      hero1: {
        title: 'HololiveCN MC Server',
        subtitle: '欢迎访问 HololiveCN MC 服务器。请勿泄露您的密码/凭据，也不要向任何人支付费用，谨防诈骗。',
      },
      hero2: {
        title: 'Pekoland',
        subtitle: '兔田重工所在地，兔组大本营',
        mapButton: '转到地图',
      },
    },
    docs: {
      title: '文档',
      subtitle: '服务器使用指南与相关信息',
      cards: {
        announcements: {
          title: '网站公告',
          description: '查看最新的网站公告和重要通知',
        },
        serverInfo: {
          title: '服务器信息',
          description: '查看服务器信息和地图',
        },
        documents: {
          title: '其他文档',
          description: '浏览其他相关文档',
        },
      },
      sections: {
        gettingStarted: {
          title: '快速开始',
          content: '欢迎来到 HololiveCN MC 服务器！这里是您开始游戏之旅的起点。',
        },
        rules: {
          title: '服务器规则',
          content: '请遵守服务器规则，共同维护良好的游戏环境。',
        },
        faq: {
          title: '常见问题',
          content: '这里收集了玩家们最常遇到的问题和解答。',
        },
      },
      serverInfo: {
        status: {
          title: '实时状态',
          online: '运行中',
          offline: '离线',
          players: '在线人数',
          latency: '在线/延迟',
          latencyOnline: '在线',
          latencyOffline: '离线/未知状态',
          version: '服务端版本',
          motd: '服务器标语',
        },
      },
    },
  },
  en: {
    common: {
      serverInfo: 'Server Info',
      icp: '粤ICP备2023071182号-1',
      navbar: {
        home: 'Home',
        docs: 'Docs',
      },
      languageNames: {
        en: 'English',
        zh: '中文',
        ja: '日本語',
      },
      footer: {
        copyright: 'All rights reserved.',
        powered_by: 'Powered by PocketBase & React',
        contactUs: 'Contact Us',
        contactAdmin: 'Contact Admin',
        specialThanks: 'Special Thanks & Info',
        holoCNProject: '（旧）hololive China Project',
        officialSite: 'Official Website',
        coverDisclaimer: 'hololive™ & hololive production™ are trademarks of COVER Corporation. This is a personally operated unofficial site; please verify content independently.',
        usadaKensetsu: 'Usada Kensetsu',
        thanksStaff: 'Usada_kidd and all former sub-members who helped',
      },
    },
    home: {
      hero1: {
        title: 'HololiveCN MC Server',
        subtitle: 'Welcome to the HololiveCN MC Server. Please do not reveal your password credentials or pay any fees to anyone, and beware of scams.',
      },
      hero2: {
        title: 'Pekoland',
        subtitle: 'Location of Usada Kensetsu, Base of the Rabbits',
        mapButton: 'Go to Map',
      },
    },
    docs: {
      title: 'Documentation',
      subtitle: 'Server Guide and Related Information',
      cards: {
        announcements: {
          title: 'Website Announcements',
          description: 'Check the latest announcements and important notices',
        },
        serverInfo: {
          title: 'Server Info',
          description: 'View server information and maps',
        },
        documents: {
          title: 'Other Documents',
          description: 'Browse other related documents',
        },
      },
      sections: {
        gettingStarted: {
          title: 'Getting Started',
          content: 'Welcome to HololiveCN MC Server! This is where your journey begins.',
        },
        rules: {
          title: 'Server Rules',
          content: 'Please follow the server rules to maintain a good gaming environment.',
        },
        faq: {
          title: 'FAQ',
          content: 'Here are the most frequently asked questions and answers.',
        },
      },
      serverInfo: {
        status: {
          title: 'Live Status',
          online: 'Online',
          offline: 'Offline',
          players: 'Players',
          latency: 'Online/Latency',
          latencyOnline: 'Online',
          latencyOffline: 'Offline/Unknown',
          version: 'Version',
          motd: 'MOTD',
        },
      },
    },
  },
  ja: {
    common: {
      serverInfo: 'サーバー情報',
      icp: '粤ICP备2023071182号-1',
      navbar: {
        home: 'ホーム',
        docs: 'ドキュメント',
      },
      languageNames: {
        en: 'English',
        zh: '中文',
        ja: '日本語',
      },
      footer: {
        copyright: 'All rights reserved.',
        powered_by: 'Powered by PocketBase & React',
        contactUs: 'お問い合わせ',
        contactAdmin: '管理者に連絡',
        specialThanks: 'スペシャルサンクス & 情報',
        holoCNProject: '（旧）hololive China Project',
        officialSite: '公式サイト',
        coverDisclaimer: 'hololive™/hololive production™はカバー株式会社の商標です。当サイトは個人運営の非公式サイトであり、内容の真偽については各自でご判断ください。',
        usadaKensetsu: '兎田建設',
        thanksStaff: 'Usada_kiddをはじめ、協力してくれた旧字幕組の全メンバー',
      },
    },
    home: {
      hero1: {
        title: 'HololiveCN MC Server',
        subtitle: 'HololiveCN MC サーバーへようこそ。パスワードや認証情報を漏らしたり、金銭を支払ったりしないようご注意ください。詐欺にご注意ください。',
      },
      hero2: {
        title: 'ペコランド',
        subtitle: '兎田建設の所在地、野うさぎの本拠地',
        mapButton: '地図へ移動',
      },
    },
    docs: {
      title: 'ドキュメント',
      subtitle: 'サーバーガイドと関連情報',
      cards: {
        announcements: {
          title: 'ウェブサイトのお知らせ',
          description: '最新のお知らせや重要なお知らせを確認します',
        },
        serverInfo: {
          title: 'サーバー情報',
          description: 'サーバー情報とマップを確認します',
        },
        documents: {
          title: 'その他のドキュメント',
          description: 'その他の関連ドキュメントを閲覧します',
        },
      },
      sections: {
        gettingStarted: {
          title: 'はじめに',
          content: 'HololiveCN MC サーバーへようこそ！ここがあなたの旅の始まりです。',
        },
        rules: {
          title: 'サーバールール',
          content: 'サーバールールを守り、良好なゲーム環境を維持してください。',
        },
        faq: {
          title: 'よくある質問',
          content: 'よくある質問と回答をまとめました。',
        },
      },
      serverInfo: {
        status: {
          title: 'リアルタイムステータス',
          online: 'オンライン',
          offline: 'オフライン',
          players: 'オンライン人数',
          latency: 'オンライン/レイテンシ',
          latencyOnline: 'オンライン',
          latencyOffline: 'オフライン/不明',
          version: 'バージョン',
          motd: 'MOTD',
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh",
  fallbackLng: "zh",
  ns: ["common", "home", "docs"],
  nsSeparator: ".",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
