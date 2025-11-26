
import React from "react";
import { useTranslation } from "react-i18next";
const MadeByHumans = () => {
  const { t } = useTranslation();
  return <section id="made-by-humans" className="w-full bg-white py-0 mb-8">
      <div className="section-container opacity-0 animate-on-scroll pb-2">
        {/* Removed the pulse-chip button/element that was here */}
        
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative mt-6 sm:mt-8">
          <div className="bg-no-repeat bg-cover bg-center p-4 sm:p-5 min-h-[250px] sm:min-h-[350px] flex flex-col justify-between" style={{
          backgroundImage: "url('/specs-background.jpg')"
        }}>
            <div className="flex items-center text-black">
              <span className="text-black text-xl font-medium">
            </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair text-black italic font-thin text-center leading-tight">
                {t('madeByHumans.title')}
              </h2>
            </div>
            
            {/* Removed white box to prevent footer overlap */}
          </div>
        </div>
      </div>
    </section>;
};
export default MadeByHumans;
