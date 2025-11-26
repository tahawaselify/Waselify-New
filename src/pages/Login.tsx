import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ContactModal from '@/components/ContactModal';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import Navbar from '@/components/Navbar';
import { supabase, setRememberMe } from '@/lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthProvider';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // Default to true for better UX
  const [showContactModal, setShowContactModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { toast } = useToast();



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Login: Starting login process...');
  setIsLoading(true);

  try {
    console.log('Login: Attempting sign in...');

    // Call your backend on Render
    const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // only if backend sets cookies
      }
    );

    const result = await response.json();
    console.log('Login: Backend response:', result);

    if (!response.ok) {
      console.error('Login error:', result.error || 'Unknown error');
      toast({
        title: "Login failed",
        description: result.error || 'Something went wrong',
        variant: "destructive",
      });
    } else {
      console.log('Login: Success! User authenticated:', result.user?.email);

      // Example: fetch role from profiles table
      const { data: profileForMessage, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      } else {
        console.log('User role:', profileForMessage?.role);
      }
    }
  } catch (err: any) {
    console.error('Unexpected login error:', err);
    toast({
      title: "Login failed",
      description: err.message || 'Unexpected error',
      variant: "destructive",
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

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-display text-gray-900">
              {t('auth.login.title')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('auth.login.subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('auth.login.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-gray-300 focus:border-waselify-500 focus:ring-waselify-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('auth.login.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.login.passwordPlaceholder')}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-waselify-600 focus:ring-waselify-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    {t('auth.login.rememberMe')}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm text-waselify-600 hover:text-waselify-700 font-medium"
                >
                  {t('auth.login.forgotPassword')}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default button behavior
                  handleSubmit(e);    // Manually call your submit handler
                }}
                className="w-full h-11 bg-waselify-500 hover:bg-waselify-600 text-white font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('common.loading')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn size={16} className="mr-2" />
                    {t('auth.login.signIn')}
                  </div>
                )}
              </Button>
            </form>

                          <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  {t('auth.login.noAccount')}{' '}
                  <Link to="/signup" className="text-waselify-600 hover:text-waselify-700 font-medium">
                    {t('auth.login.signUp')}
                  </Link>
                </p>
              </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {t('common.securityNotice')}
          </p>
        </div>
      </div>
    </div>

          {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Support"
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default Login; 
