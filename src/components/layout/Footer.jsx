import { ASSETS } from '../../config/assets';
import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, FolderHeart, Users, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation("common");
  return (
    <footer className="w-full bg-gradient-to-b from-[#2cdaf5] to-[#199af0] relative z-50 pt-10 pb-4 text-white text-sm">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 px-8 md:px-32 gap-8 md:gap-32">
        {/* Column 1: 联系方式 */}
        <div>
          <h3 className="text-base font-bold mb-6">{t('footer.contactUs')}</h3>
          <div className="flex flex-col gap-3">
            <a href="https://space.bilibili.com/14539444" target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline text-white">
              <img src={ASSETS.ICONS.BILIBILI} alt="bilibili" className="w-5 h-5 inline mr-2"/>
              月球厨师莱恩的个人空间
            </a>
            <a href="mailto:ryan.lan_home@outlook.com" className="flex items-center hover:underline text-white">
              <Mail className="w-5 h-5 inline mr-2" />
              {t('footer.contactAdmin')}
            </a>
          </div>
        </div>
        {/* Column 2: 鸣谢 */}
        <div>
          <h3 className="text-base font-bold mb-6">{t('footer.specialThanks')}</h3>
          <div className="flex flex-col space-y-3">
            <span><MessageSquare className="w-4 h-4 inline mr-2" />（旧）幻夜字幕组</span>
            <span><FolderHeart className="w-4 h-4 inline mr-2" />{t('footer.holoCNProject')}</span>
            <span><Users className="w-4 h-4 inline mr-2" />（旧）hololive China Talents</span>
            <span><img src={ASSETS.ICONS.USADA} alt="usada" className="w-4 h-4 inline mr-2" />{t('footer.usadaKensetsu')}</span>
            <span><Heart className="w-4 h-4 inline mr-2" />{t('footer.thanksStaff')}</span>
            <div className="mt-6 pt-4 border-t border-white/20">
              <h4 className="font-bold text-base mb-2">hololive</h4>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <a
                  href="https://hololivepro.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  {t('footer.officialSite')}
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" />
                </a>
                <a
                  href="https://www.youtube.com/channel/UCJFZiqLMntJufDCHc6bQixg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  YouTube
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" />
                </a>
                <a
                  href="https://twitter.com/hololivetv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  X
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" />
                </a>
                <a
                  href="https://www.tiktok.com/@hololive_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  TikTok
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/30 mt-10 mb-4" />
      <div className="text-center text-sm opacity-90 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
        <span>Copyright © 2025 月球厨师莱恩</span>
        <span className="hidden md:inline-block mx-2">|</span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:text-white/80 ml-0 md:ml-2"
        >
          粤ICP备2023071182号-1
        </a>
      </div>
      <p className="text-center text-xs opacity-70 mt-2 px-8 md:px-0">
        {t('footer.coverDisclaimer')}
      </p>
    </footer>
  );
}
