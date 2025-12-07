import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ASSETS } from "../config/assets";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";

const BUTTON_TEXT = {
  zh: "返回首页",
  ja: "ホームに戻る",
  en: "Back to Home",
};

const FALLBACK_CODE = "E404";

export default function ErrorPage({ code: propCode }) {
  const params = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation("common");

  const requestedCode = propCode || params?.code || FALLBACK_CODE;
  const assetKey = ASSETS.ERRORS?.[requestedCode] ? requestedCode : FALLBACK_CODE;
  const imageSrc = ASSETS.ERRORS?.[assetKey];
  const buttonLabel = BUTTON_TEXT[i18n.language] || BUTTON_TEXT.zh;

  return (
    <div className="fixed inset-0 z-[999] w-screen h-screen overflow-y-auto overflow-x-hidden bg-gray-950 text-white error-page-scroll-container">
      <style>{`
        .error-page-scroll-container::-webkit-scrollbar { display: none; }
        .error-page-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-950 to-black pointer-events-none" />

      <div className="flex flex-col min-h-screen w-full">
        <div className="h-screen w-full flex-shrink-0 flex flex-col items-center justify-center relative">
          <div className="absolute top-0 left-0 w-full z-50">
            <Navbar />
          </div>

          {imageSrc && (
            <img
              src={imageSrc}
              alt={`Error ${assetKey}`}
              className="w-full max-w-2xl object-contain drop-shadow-2xl animate-pulse px-4"
              draggable={false}
            />
          )}

          <Button
            className="mt-12 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] cursor-pointer hover:scale-105 active:scale-95"
            onClick={() => navigate("/")}
          >
            {buttonLabel}
          </Button>
        </div>

        <div className="w-full flex-shrink-0 relative z-20 bg-transparent">
          <Footer />
        </div>
      </div>
    </div>
  );
}

