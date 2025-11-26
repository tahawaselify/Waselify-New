
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

const FounderVision = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-12 bg-white relative" id="founder-vision" ref={sectionRef}>
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="flex items-center gap-4 mb-6">
          <div className="pulse-chip">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-waselify-500 text-white mr-2">04</span>
            <span>{t('testimonials.chip')}</span>
          </div>
        </div>

        <h2 className="text-5xl font-display font-bold mb-12 text-left">{t('testimonials.title')}</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl shadow-elegant hover:shadow-elegant-hover transition-all duration-500">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/background-section1.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <div className="font-playfair italic text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-gray-900 mb-8 whitespace-pre-line">
                {t('testimonials.quote')}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="text-lg sm:text-xl font-display font-semibold text-waselify-500">— {t('testimonials.author')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderVision;
