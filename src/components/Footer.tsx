
import React from "react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-gray-50">
      {/* Color-matching strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))]" />

      <div className="section-container py-8">
        {/* Small color chips to reinforce palette */}
        <div className="flex items-center justify-center gap-2 mb-4" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent))]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--secondary))]" />
        </div>

        <div className="text-center space-y-4">
          {/* Main footer content */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 text-gray-700 text-sm">
            <span>{t('footer.copyright')}</span>
            <span className="hidden sm:inline opacity-40" aria-hidden>•</span>
            <span>{t('footer.description')}</span>
            <span className="hidden sm:inline opacity-40" aria-hidden>•</span>
            <span>{t('footer.location')}</span>
          </div>

          {/* Contact info */}
          <div className="text-gray-500 text-xs">
            <p>{t('footer.contact')}: support@waselify.com</p>
          </div>

          {/* Subtle legal notice */}
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-400 text-xs leading-relaxed">
              {t('footer.legal')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
