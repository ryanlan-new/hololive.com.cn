import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
    const { t, i18n } = useTranslation("common");
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const menuId = "admin-language-menu";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
    setOpen(false);
  };

  const languages = [
    { code: "zh", label: t("languageNames.zh") },
    { code: "en", label: t("languageNames.en") },
    { code: "ja", label: t("languageNames.ja") },
  ];
  const activeLanguageCode = i18n.language?.split("-")[0] || "en";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)]/30"
      >
        <Languages className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">
          {languages.find((l) => l.code === activeLanguageCode)?.label || t("languageNames.en")}
        </span>
      </button>

      <div
        id={menuId}
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 transition-[opacity,visibility,transform] duration-200 ${open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"}`}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            role="menuitemradio"
            aria-checked={activeLanguageCode === lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${activeLanguageCode === lang.code ? "text-indigo-600 font-medium bg-indigo-50" : "text-slate-600"}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
