import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("i18nextLng", lng);
    };

    const languages = [
        { code: "zh", label: "中文" },
        { code: "en", label: "English" },
        { code: "ja", label: "日本語" },
    ];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">{languages.find((l) => l.code === i18n.language)?.label || "Language"}</span>
            </button>

            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${i18n.language === lang.code ? "text-indigo-600 font-medium bg-indigo-50" : "text-slate-600"
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
