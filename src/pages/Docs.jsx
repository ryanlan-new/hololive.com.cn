import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Megaphone, Server, FileText } from "lucide-react";

export default function Docs() {
  const { t } = useTranslation("docs");

  const sections = [
    {
      key: "announcements",
      title: t("cards.announcements.title"),
      icon: Megaphone,
      color: "text-blue-500",
      link: "/docs/announcements",
      description: t("cards.announcements.description"),
    },
    {
      key: "serverInfo",
      title: t("cards.serverInfo.title"),
      icon: Server,
      color: "text-green-500",
      link: "/docs/server-info",
      description: t("cards.serverInfo.description"),
    },
    {
      key: "documents",
      title: t("cards.documents.title"),
      icon: FileText,
      color: "text-yellow-500",
      link: "/docs/documents",
      description: t("cards.documents.description"),
    },
  ];

  return (
    <div className="min-h-screen w-full pt-20 pb-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl w-full px-4 md:px-8 text-center flex flex-col items-center justify-center py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4"
          >
            {t("title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg md:text-xl text-slate-600"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl px-4 w-full items-stretch">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="flex h-full"
              >
                <Link
                  to={section.link}
                  className="group flex flex-col justify-center items-start gap-2 w-full h-full bg-white p-6 md:p-8 rounded-2xl shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100 text-left"
                >
                  {/* Icon and Title Section */}
                  <div className="flex items-center gap-3">
                    <Icon size={32} className={`${section.color} flex-shrink-0`} />
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                        {section.title}
                      </h3>
                  </div>
                  {/* Description Section - left-aligned */}
                  <p className="text-slate-600 text-left">
                    {section.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
