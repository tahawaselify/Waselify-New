import { useState, useEffect } from 'react';
import { Settings, X, User, Shield, Bell, Palette, Globe, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';

const SettingsPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    workflowAlerts: true,
    systemUpdates: false,
    marketingEmails: false
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '24h',
    passwordChangeRequired: false
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: i18n.language,
    compactMode: false
  });

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "User not found. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          company: profileData.company,
          phone: profileData.phone
        });

      if (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { signOut, user, session } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Settings panel: Starting sign out...');
      console.log('🔄 Current user:', user?.email);
      console.log('🔄 Current session:', session?.user?.email);
      
      await signOut();
      console.log('✅ Settings panel: Sign out completed');
      // AuthContext will handle the redirect
    } catch (error) {
      console.error('❌ Settings panel: Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfileData({
            fullName: profile.full_name || '',
            email: user.email || '',
            company: profile.company || '',
            phone: profile.phone || ''
          });
        }

        // Load user settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('id', user.id)
          .single();

        if (settings) {
          setNotificationSettings({
            emailNotifications: settings.email_notifications,
            workflowAlerts: settings.workflow_alerts,
            systemUpdates: settings.system_updates,
            marketingEmails: settings.marketing_emails
          });

          setSecuritySettings({
            twoFactorAuth: settings.two_factor_auth,
            sessionTimeout: settings.session_timeout,
            passwordChangeRequired: false
          });

          setAppearanceSettings({
            theme: settings.theme,
            language: settings.language,
            compactMode: settings.compact_mode
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const tabs = [
    { id: 'profile', label: t('settings.profileLabel'), icon: User },
    { id: 'notifications', label: t('settings.notificationsLabel'), icon: Bell },
    { id: 'security', label: t('settings.securityLabel'), icon: Shield },
    { id: 'appearance', label: t('settings.appearanceLabel'), icon: Palette }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25" 
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-xl border-l border-gray-200 h-full max-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('settings.title')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-waselify-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingData ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waselify-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">{t('settings.loading')}</p>
                </div>
              </div>
            ) : (
            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                                         <h3 className="text-lg font-semibold text-gray-900 mb-4">
                       {t('settings.profileSettings.title')}
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label htmlFor="fullName">{t('settings.profileSettings.fullName')}</Label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                                             <div>
                         <Label htmlFor="email">{t('settings.profileSettings.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="mt-1 bg-gray-50"
                        />
                      </div>
                                             <div>
                         <Label htmlFor="company">{t('settings.profileSettings.company')}</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                                             <div>
                         <Label htmlFor="phone">{t('settings.profileSettings.phone')}</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button onClick={handleProfileSave} disabled={isLoading}>
                        <Save size={16} className="mr-2" />
                                                 {isLoading ? t('common.saving') : t('settings.profileSettings.save')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                                         <h3 className="text-lg font-semibold text-gray-900 mb-4">
                       {t('settings.notificationSettings.title')}
                     </h3>
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <h4 className="font-medium text-gray-900">{t('settings.notificationSettings.emailNotifications')}</h4>
                           <p className="text-sm text-gray-500">{t('settings.notificationSettings.emailNotificationsDesc')}</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                        />
                      </div>
                      <Separator />
                                             <div className="flex items-center justify-between">
                         <div>
                           <h4 className="font-medium text-gray-900">{t('settings.notificationSettings.workflowAlerts')}</h4>
                           <p className="text-sm text-gray-500">{t('settings.notificationSettings.workflowAlertsDesc')}</p>
                        </div>
                        <Switch
                          checked={notificationSettings.workflowAlerts}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, workflowAlerts: checked }))}
                        />
                      </div>
                      <Separator />
                                             <div className="flex items-center justify-between">
                         <div>
                           <h4 className="font-medium text-gray-900">{t('settings.notificationSettings.systemUpdates')}</h4>
                           <p className="text-sm text-gray-500">{t('settings.notificationSettings.systemUpdatesDesc')}</p>
                        </div>
                        <Switch
                          checked={notificationSettings.systemUpdates}
                          onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                                         <h3 className="text-lg font-semibold text-gray-900 mb-4">
                       {t('settings.securitySettings.title')}
                     </h3>
                     <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div>
                           <h4 className="font-medium text-gray-900">{t('settings.securitySettings.twoFactorAuth')}</h4>
                           <p className="text-sm text-gray-500">{t('settings.securitySettings.twoFactorAuthDesc')}</p>
                        </div>
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                        />
                      </div>
                      <Separator />
                      <div>
                                                 <Label htmlFor="sessionTimeout">{t('settings.securitySettings.sessionTimeout')}</Label>
                        <Select
                          value={securitySettings.sessionTimeout}
                          onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">{t('settings.securitySettings.timeouts.1h')}</SelectItem>
                            <SelectItem value="8h">{t('settings.securitySettings.timeouts.8h')}</SelectItem>
                            <SelectItem value="24h">{t('settings.securitySettings.timeouts.24h')}</SelectItem>
                            <SelectItem value="7d">{t('settings.securitySettings.timeouts.7d')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                                         <h3 className="text-lg font-semibold text-gray-900 mb-4">
                       {t('settings.appearanceSettings.title')}
                     </h3>
                     <div className="space-y-4">
                       <div>
                         <Label htmlFor="language">{t('settings.appearanceSettings.language')}</Label>
                        <Select
                          value={appearanceSettings.language}
                          onValueChange={(value) => {
                            setAppearanceSettings(prev => ({ ...prev, language: value }));
                            i18n.changeLanguage(value);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                                                 <div>
                           <h4 className="font-medium text-gray-900">{t('settings.appearanceSettings.compactMode')}</h4>
                           <p className="text-sm text-gray-500">{t('settings.appearanceSettings.compactModeDesc')}</p>
                        </div>
                        <Switch
                          checked={appearanceSettings.compactMode}
                          onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, compactMode: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
                         <Button 
               variant="outline" 
               onClick={handleSignOut}
               className="flex items-center"
             >
               <LogOut size={16} className="mr-2" />
               <span>{t('settings.signOut')}</span>
             </Button>
            <Button onClick={onClose}>
              {t('settings.close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 