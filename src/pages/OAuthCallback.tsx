import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state');
      }

      // Parse state to get workflow and user info
      const stateData = JSON.parse(decodeURIComponent(state));
      const { provider, workflowId, userId } = stateData;

      if (!user || user.id !== userId) {
        throw new Error('User authentication mismatch');
      }

      // Exchange code for access token
      const tokenResponse = await exchangeCodeForToken(code, provider);

      // Store token in database
      await storeOAuthToken(userId, workflowId, provider, tokenResponse);

      setStatus('success');
      toast({
        title: "Connection Successful",
        description: `${provider} account connected successfully!`,
        variant: "default"
      });

      // Redirect back to workflow dashboard
      setTimeout(() => {
        navigate(`/dashboard/${workflowId}`);
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Connection Failed",
        description: "Failed to connect account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exchangeCodeForToken = async (code: string, provider: string) => {
    if (provider === 'gmail') {
      const response = await fetch('/api/oauth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      return await response.json();
    }

    throw new Error(`Unsupported provider: ${provider}`);
  };

  const storeOAuthToken = async (
    userId: string, 
    workflowId: string, 
    provider: string, 
    tokenData: any
  ) => {
    const { error } = await supabase
      .from('user_oauth_tokens')
      .upsert({
        user_id: userId,
        workflow_id: workflowId,
        provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_at ? new Date(tokenData.expires_at).toISOString() : null,
        scope: tokenData.scope
      });

    if (error) {
      throw new Error(`Failed to store token: ${error.message}`);
    }
  };

  const handleRetry = () => {
    setStatus('processing');
    setErrorMessage('');
    handleOAuthCallback();
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting Account...
              </CardTitle>
              <CardDescription>
                Please wait while we connect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">❌ Connection Failed</CardTitle>
              <CardDescription>
                We couldn't connect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleGoBack} variant="outline" className="flex-1">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Connection Successful</CardTitle>
            <CardDescription>
              Your account has been connected successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-green-800">
                Redirecting you back to your dashboard...
              </p>
            </div>
            <Button onClick={handleGoBack} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 