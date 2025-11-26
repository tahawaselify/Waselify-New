import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Navbar from '@/components/Navbar';

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t('notFound.title')}</h1>
          <p className="text-xl text-gray-600 mb-4">{t('notFound.subtitle')}</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            {t('notFound.returnHome')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
