
import React from "react";
import { useTranslation } from "react-i18next";

const ImageShowcaseSection = () => {
  const { t } = useTranslation();
  return (
    <section className="w-full pt-0 pb-8 sm:pb-12 bg-white" id="showcase">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
            {t('imageShowcase.title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            {t('imageShowcase.subtitle')}
          </p>
        </div>
        
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant mx-auto max-w-4xl animate-on-scroll">
          <div className="w-full bg-gradient-to-br from-waselify-50 to-waselify-100 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-waselify-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('imageShowcase.step1')}</h3>
                <p className="text-sm text-gray-600">
                  {t('imageShowcase.step1Desc')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-waselify-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('imageShowcase.step2')}</h3>
                <p className="text-sm text-gray-600">
                  {t('imageShowcase.step2Desc')}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-waselify-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('imageShowcase.step3')}</h3>
                <p className="text-sm text-gray-600">
                  {t('imageShowcase.step3Desc')}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-display font-semibold mb-3 sm:mb-4">{t('imageShowcase.cta')}</h3>
            <p className="text-gray-700 text-sm sm:text-base">
              {t('imageShowcase.ctaDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcaseSection;
