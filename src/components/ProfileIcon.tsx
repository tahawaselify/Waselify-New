import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Edit, Save, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface ProfileIconProps {
  user: any;
}

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
}

const ProfileIcon = ({ user }: ProfileIconProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
  });
  const [originalData, setOriginalData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const data = {
            full_name: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            company: profile.company || '',
            position: profile.position || '',
          };
          setProfileData(data);
          setOriginalData(data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
          company: profileData.company,
          position: profileData.position,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setOriginalData(profileData);
      setIsEditing(false);
      toast({
        title: t('settings.profileSettings.updatedToastTitle'),
        description: t('settings.profileSettings.updatedToastDesc'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('settings.profileSettings.updateErrorTitle'),
        description: t('settings.profileSettings.updateErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: t('settings.profileSettings.signedOutTitle'),
        description: t('settings.profileSettings.signedOutDesc'),
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  return (
    <div className="relative">
      {/* Profile Icon Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full p-0 bg-waselify-100 hover:bg-waselify-200"
      >
        {profileData.full_name ? (
          <span className="text-sm font-medium text-waselify-800">
            {getInitials(profileData.full_name)}
          </span>
        ) : (
          <User size={16} className="text-waselify-600" />
        )}
      </Button>

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{t('settings.profileLabel')}</CardTitle>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={16} />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                      >
                        <Save size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X size={16} />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="full_name">{t('settings.profileSettings.fullName')}</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('settings.profileSettings.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('settings.profileSettings.phone')}</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">{t('settings.profileSettings.company')}</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">{t('settings.profileSettings.position')}</Label>
                    <Input
                      id="position"
                      value={profileData.position}
                      onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>{t('settings.profileSettings.fullName')}:</strong> {profileData.full_name || t('settings.profileSettings.notSet')}</p>
                  <p><strong>{t('settings.profileSettings.email')}:</strong> {profileData.email || t('settings.profileSettings.notSet')}</p>
                  <p><strong>{t('settings.profileSettings.phone')}:</strong> {profileData.phone || t('settings.profileSettings.notSet')}</p>
                  <p><strong>{t('settings.profileSettings.company')}:</strong> {profileData.company || t('settings.profileSettings.notSet')}</p>
                  <p><strong>{t('settings.profileSettings.position')}:</strong> {profileData.position || t('settings.profileSettings.notSet')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileIcon;

