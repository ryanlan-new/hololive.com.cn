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
              <img src={ASSETS.ICONS.BILIBILI} alt="" aria-hidden="true" className="w-5 h-5 inline mr-2"/>
              {t("footer.personalSpace")}
            </a>
            <a href="mailto:ryan.lan_home@outlook.com" className="flex items-center hover:underline text-white">
              <Mail className="w-5 h-5 inline mr-2" aria-hidden="true" />
              {t('footer.contactAdmin')}
            </a>
          </div>
        </div>
        {/* Column 2: 鸣谢 */}
        <div>
          <h3 className="text-base font-bold mb-6">{t('footer.specialThanks')}</h3>
          <div className="flex flex-col space-y-3">
            <span><MessageSquare className="w-4 h-4 inline mr-2" aria-hidden="true" />{t("footer.oldFansub")}</span>
            <span><FolderHeart className="w-4 h-4 inline mr-2" aria-hidden="true" />{t('footer.holoCNProject')}</span>
            <span><Users className="w-4 h-4 inline mr-2" aria-hidden="true" />{t("footer.oldTalents")}</span>
            <span><img src={ASSETS.ICONS.USADA} alt="" aria-hidden="true" className="w-4 h-4 inline mr-2" />{t('footer.usadaKensetsu')}</span>
            <span><Heart className="w-4 h-4 inline mr-2" aria-hidden="true" />{t('footer.thanksStaff')}</span>
            <div className="mt-6 pt-4 border-t border-white/20">
              <h4 className="font-bold text-base mb-2">{t("footer.brandName")}</h4>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <a
                  href="https://hololivepro.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  {t('footer.officialSite')}
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" aria-hidden="true" />
                </a>
                <a
                  href="https://www.youtube.com/channel/UCJFZiqLMntJufDCHc6bQixg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  {t("footer.social.youtube")}
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" aria-hidden="true" />
                </a>
                <a
                  href="https://twitter.com/hololivetv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  {t("footer.social.x")}
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" aria-hidden="true" />
                </a>
                <a
                  href="https://www.tiktok.com/@hololive_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-200 transition-colors group"
                >
                  {t("footer.social.tiktok")}
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/30 mt-10 mb-4" />
      <div className="text-center text-sm opacity-90 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
        <span>{t("footer.copyrightOwner")}</span>
        <span className="hidden md:inline-block mx-2">|</span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:text-white/80 ml-0 md:ml-2"
        >
          {t("icp")}
        </a>
      </div>
      <p className="text-center text-xs opacity-70 mt-2 px-8 md:px-0">
        {t('footer.coverDisclaimer')}
      </p>
    </footer>
  );
}
