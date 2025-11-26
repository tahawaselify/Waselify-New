import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthProvider';

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return {
      isValid: Object.values(checks).every(Boolean),
      checks
    };
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: t('auth.signup.errors.fillAllFields'),
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('auth.signup.errors.passwordsDontMatch'),
        variant: "destructive"
      });
      return false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: t('auth.signup.errors.passwordRequirements'),
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: t('auth.signup.errors.invalidEmail'),
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: t('auth.signup.errors.signupFailed'),
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Let the database trigger handle user record creation
        console.log('✅ User signed up successfully:', data.user?.email);

        toast({
          title: t('auth.signup.success.title'),
          description: t('auth.signup.success.description'),
          variant: "default"
        });
        
        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: t('auth.signup.errors.somethingWentWrong'),
        description: t('auth.signup.errors.tryAgainLater'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen p-4 pt-24">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-display text-gray-900">
                {t('auth.signup.title')}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {t('auth.signup.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    {t('auth.signup.fullName')}
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t('auth.signup.fullNamePlaceholder')}
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="h-11 border-gray-300 focus:border-waselify-500 focus:ring-waselify-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t('auth.signup.email')}
                  </Label>
                                  <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.signup.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 border-gray-300 focus:border-waselify-500 focus:ring-waselify-500"
                />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t('auth.signup.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth.signup.passwordPlaceholder')}
                      value={formData.password}
                      onChange={handleChange}
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
                  
                  {/* Password Requirements */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t('auth.passwordRequirements.title')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center ${validatePassword(formData.password).checks.length ? 'text-green-600' : 'text-gray-500'}`}>
                        {validatePassword(formData.password).checks.length ? <CheckCircle size={16} className="mr-2 rtl:mr-0 rtl:ml-2" /> : <X size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />}
                        {t('auth.passwordRequirements.length')}
                      </div>
                      <div className={`flex items-center ${validatePassword(formData.password).checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {validatePassword(formData.password).checks.uppercase ? <CheckCircle size={16} className="mr-2 rtl:mr-0 rtl:ml-2" /> : <X size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />}
                        {t('auth.passwordRequirements.uppercase')}
                      </div>
                      <div className={`flex items-center ${validatePassword(formData.password).checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {validatePassword(formData.password).checks.lowercase ? <CheckCircle size={16} className="mr-2 rtl:mr-0 rtl:ml-2" /> : <X size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />}
                        {t('auth.passwordRequirements.lowercase')}
                      </div>
                      <div className={`flex items-center ${validatePassword(formData.password).checks.number ? 'text-green-600' : 'text-gray-500'}`}>
                        {validatePassword(formData.password).checks.number ? <CheckCircle size={16} className="mr-2 rtl:mr-0 rtl:ml-2" /> : <X size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />}
                        {t('auth.passwordRequirements.number')}
                      </div>
                      <div className={`flex items-center ${validatePassword(formData.password).checks.special ? 'text-green-600' : 'text-gray-500'}`}>
                        {validatePassword(formData.password).checks.special ? <CheckCircle size={16} className="mr-2 rtl:mr-0 rtl:ml-2" /> : <X size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />}
                        {t('auth.passwordRequirements.special')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {t('auth.signup.confirmPassword')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                      value={formData.confirmPassword}
                      onChange={handleChange}
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

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-waselify-500 hover:bg-waselify-600 text-white font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2"></div>
                      {t('auth.signup.creatingAccount')}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {t('auth.signup.createAccount')}
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  {t('auth.signup.alreadyHaveAccount')}{' '}
                  <Link to="/login" className="text-waselify-600 hover:text-waselify-700 font-medium">
                    {t('auth.signup.signIn')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup; 