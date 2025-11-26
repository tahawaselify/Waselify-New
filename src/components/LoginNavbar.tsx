import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import ContactModal from "./ContactModal";
import { useTranslation } from "react-i18next";

const LoginNavbar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContactPopup(true);
    
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  const closeContactPopup = () => {
    setShowContactPopup(false);
  };



  return (
    <>
             <header 
         key={i18n.language} // Force re-render when language changes
         className={cn(
           "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 bg-white shadow-sm border-b border-gray-200 transition-all duration-300"
         )}>
        <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo - links to home */}
          <a 
            href="/" 
            className="flex items-center"
            aria-label="Waselify"
          >
            <img 
              src="/logo.png" 
              alt="Waselify Logo" 
              className="h-12 sm:h-16 w-auto" 
            />
          </a>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${i18n.language === 'ar' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            <a 
              href="/" 
              className="nav-link"
            >
              {t('nav.home')}
            </a>
            <a 
              href="/#features" 
              className="nav-link"
            >
              {t('nav.services')}
            </a>
            <a 
              href="#" 
              className="nav-link"
              onClick={handleContactClick}
            >
              {t('nav.contact')}
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsMenuOpen(false);
              document.body.style.overflow = '';
            }}
          />
          
          <nav className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl p-6">
            <div className="flex justify-end mb-8">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  document.body.style.overflow = '';
                }}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <a 
                href="/" 
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100 block" 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.body.style.overflow = '';
                }}
              >
                {t('nav.home')}
              </a>
              <a 
                href="/#features" 
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100 block" 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.body.style.overflow = '';
                }}
              >
                {t('nav.services')}
              </a>
              <a 
                href="#" 
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100 block" 
                onClick={(e) => {
                  handleContactClick(e);
                }}
              >
                {t('nav.contact')}
              </a>
            </div>
          </nav>
        </div>
      )}

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactPopup}
        onClose={closeContactPopup}
        title={t('contact.title')}
      />
    </>
  );
};

export default LoginNavbar; 