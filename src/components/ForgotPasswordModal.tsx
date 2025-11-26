import { useState } from 'react';
import { X, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Connect to Supabase Auth password reset
    // For now, simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast({
        title: t('auth.forgotPassword.success.title'),
        description: t('auth.forgotPassword.success.description'),
        variant: "default",
      });
    }, 2000);
  };

  const handleBackToLogin = () => {
    setIsSubmitted(false);
    setEmail('');
    onBackToLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        
        {!isSubmitted ? (
          <>
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-display text-gray-900">
                {t('auth.forgotPassword.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('auth.forgotPassword.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                    {t('auth.forgotPassword.email')}
                  </Label>
                                  <Input
                  id="reset-email"
                  type="email"
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-gray-300 focus:border-waselify-500 focus:ring-waselify-500"
                />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-waselify-500 hover:bg-waselify-600 text-white font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2"></div>
                      {t('auth.forgotPassword.sendingLink')}
                    </div>
                  ) : (
                    t('auth.forgotPassword.sendResetLink')
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-waselify-600 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                  {t('auth.forgotPassword.backToLogin')}
                </button>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-display text-gray-900">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Click the link in your email to reset your password. The link will expire in 1 hour.
                </p>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                  
                  <button
                    onClick={handleBackToLogin}
                    className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-waselify-600 transition-colors"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Sign In
                  </button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal; 