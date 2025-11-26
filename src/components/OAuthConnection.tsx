import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OAuthConnectionProps {
  workflowId: string;
  workflowName: string;
  requiredProviders: string[];
}

interface OAuthStatus {
  provider: string;
  connected: boolean;
  expiresAt?: string;
  scope?: string;
}

export const OAuthConnection: React.FC<OAuthConnectionProps> = ({
  workflowId,
  workflowName,
  requiredProviders
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      loadOAuthStatus();
    }
  }, [user, workflowId]);

  const loadOAuthStatus = async () => {
    try {
      const { data: tokens, error } = await supabase
        .from('user_oauth_tokens')
        .select('provider, token_expires_at, scope')
        .eq('user_id', user?.id)
        .eq('workflow_id', workflowId);

      if (error) throw error;

      const status = requiredProviders.map(provider => {
        const token = tokens?.find(t => t.provider === provider);
        return {
          provider,
          connected: !!token,
          expiresAt: token?.token_expires_at,
          scope: token?.scope
        };
      });

      setOauthStatus(status);
    } catch (error) {
      console.error('Error loading OAuth status:', error);
    }
  };

  const connectProvider = async (provider: string) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, [provider]: true }));

    try {
      // For Gmail OAuth
      if (provider === 'gmail') {
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.modify')}&` +
          `access_type=offline&` +
          `state=${encodeURIComponent(JSON.stringify({ 
            provider, 
            workflowId, 
            userId: user.id 
          }))}`;

        window.location.href = googleAuthUrl;
        return;
      }

      // For WhatsApp Business API
      if (provider === 'whatsapp') {
        // Redirect to WhatsApp setup page or show setup instructions
        navigate(`/setup/whatsapp/${workflowId}`);
        return;
      }

      // For other providers
      toast({
        title: "Provider Connection",
        description: `${provider} connection not yet implemented.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error connecting provider:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const disconnectProvider = async (provider: string) => {
    try {
      const { error } = await supabase
        .from('user_oauth_tokens')
        .delete()
        .eq('user_id', user?.id)
        .eq('workflow_id', workflowId)
        .eq('provider', provider);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: `${provider} account disconnected successfully.`,
        variant: "default"
      });

      loadOAuthStatus();
    } catch (error) {
      console.error('Error disconnecting provider:', error);
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail': return '📧';
      case 'whatsapp': return '💬';
      case 'slack': return '💼';
      case 'discord': return '🎮';
      case 'telegram': return '📱';
      default: return '🔗';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'gmail': return 'Gmail';
      case 'whatsapp': return 'WhatsApp Business';
      case 'slack': return 'Slack';
      case 'discord': return 'Discord';
      case 'telegram': return 'Telegram';
      default: return provider;
    }
  };

  const isAllConnected = oauthStatus.every(status => status.connected);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Account Connections
          {isAllConnected && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              ✓ All Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your accounts to enable {workflowName} automation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {oauthStatus.map((status) => (
          <div key={status.provider} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getProviderIcon(status.provider)}</span>
              <div>
                <h4 className="font-medium">{getProviderName(status.provider)}</h4>
                {status.connected && status.expiresAt && (
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(status.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {status.connected ? (
                <>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✓ Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectProvider(status.provider)}
                    disabled={loading[status.provider]}
                  >
                    {loading[status.provider] ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => connectProvider(status.provider)}
                  disabled={loading[status.provider]}
                >
                  {loading[status.provider] ? 'Connecting...' : `Connect ${getProviderName(status.provider)}`}
                </Button>
              )}
            </div>
          </div>
        ))}

        {isAllConnected && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              🎉 All accounts connected! Your {workflowName} workflow is ready to use.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 