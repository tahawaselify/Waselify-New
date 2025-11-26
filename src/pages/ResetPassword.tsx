import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useTranslation } from 'react-i18next';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Get token from URL params
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // TODO: Validate the reset token with Supabase
    // For now, simulate token validation
    setTimeout(() => {
      setIsCheckingToken(false);
      if (token && type === 'recovery') {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    }, 1000);
  }, [token, type]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      toast({
        title: t('auth.resetPassword.errors.passwordRequirements'),
        description: t('auth.resetPassword.errors.passwordRequirementsDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: t('auth.resetPassword.errors.passwordsDontMatch'),
        description: t('auth.resetPassword.errors.passwordsDontMatchDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // TODO: Connect to Supabase Auth password update
    // const { data, error } = await supabase.auth.updateUser({
    //   password: password
    // });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: t('auth.resetPassword.success.title'),
        description: t('auth.resetPassword.success.description'),
        variant: "default",
      });
    }, 2000);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
        <LoginNavbar />
        <div className="flex items-center justify-center min-h-screen p-4 pt-24">
          <div className="w-full max-w-md">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waselify-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Validating reset link...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4 pt-24">
          <div className="w-full max-w-md">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-display text-gray-900">
                  Invalid Reset Link
                </CardTitle>
                <CardDescription className="text-gray-600">
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-waselify-500 hover:bg-waselify-600"
                >
                  Back to Sign In
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4 pt-24">
          <div className="w-full max-w-md">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-display text-gray-900">
                  Password Updated!
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your password has been successfully reset.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-waselify-500 hover:bg-waselify-600"
                >
                  Sign In with New Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen p-4 pt-24">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-display text-gray-900">
                {t('auth.resetPassword.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('auth.resetPassword.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t('auth.resetPassword.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.resetPassword.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10 border-gray-300 focus:border-waselify-500 focus:ring-waselify-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                    {t('auth.resetPassword.confirmPassword')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 pr-10 border-gray-300 focus:border-waselify-500 focus:ring-waselify-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{t('auth.passwordRequirements.title')}</h4>
                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle size={14} className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('auth.passwordRequirements.length')}
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle size={14} className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('auth.passwordRequirements.uppercase')}
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle size={14} className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('auth.passwordRequirements.lowercase')}
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle size={14} className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('auth.passwordRequirements.number')}
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle size={14} className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('auth.passwordRequirements.special')}
                    </div>
                    <div className={`flex items-center ${passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                      <CheckCircle size={14} className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('auth.resetPassword.passwordsMatch')}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
                  className="w-full h-11 bg-waselify-500 hover:bg-waselify-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2"></div>
                      {t('auth.resetPassword.updatingPassword')}
                    </div>
                  ) : (
                    t('auth.resetPassword.updatePassword')
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-waselify-600 transition-colors"
                >
                  {t('auth.resetPassword.backToSignIn')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 