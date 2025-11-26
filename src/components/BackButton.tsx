import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
  to?: string;
  className?: string;
}

const BackButton = ({ to = '/dashboard', className = '' }: BackButtonProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  return (
    <Link to={to}>
      <Button variant="outline" size="sm" className={`flex items-center gap-2 ${className}`}>
        {/* Keep ArrowLeft for now; optional: flip in RTL if desired */}
        <ArrowLeft className="w-4 h-4" />
        {t('common.backToDashboard', { defaultValue: t('marketplace.backToDashboard') })}
      </Button>
    </Link>
  );
};

export default BackButton;