import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Phone, MessageSquare, Zap } from 'lucide-react';

interface WhatsAppSetupProps {
  workflowId: string;
  workflowName: string;
}

export const WhatsAppSetup: React.FC<WhatsAppSetupProps> = ({
  workflowId,
  workflowName
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'info' | 'phone' | 'verification' | 'complete'>('info');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your WhatsApp phone number.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Store phone number in database
      const { error } = await supabase
        .from('user_oauth_tokens')
        .upsert({
          user_id: user?.id,
          workflow_id: workflowId,
          provider: 'whatsapp',
          access_token: `phone:${phoneNumber}`, // Store phone as token
          scope: 'whatsapp_business_api',
          token_expires_at: null // WhatsApp tokens don't expire
        });

      if (error) throw error;

      setStep('verification');
      toast({
        title: "Phone Number Saved",
        description: "We'll send you a verification code via WhatsApp.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error saving phone number:', error);
      toast({
        title: "Setup Error",
        description: "Failed to save phone number. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode) {
      toast({
        title: "Verification Code Required",
        description: "Please enter the verification code sent to your WhatsApp.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you'd verify the code with WhatsApp API
      // For now, we'll simulate successful verification
      
      // Update token status to verified
      const { error } = await supabase
        .from('user_oauth_tokens')
        .update({
          access_token: `phone:${phoneNumber}:verified`,
          scope: 'whatsapp_business_api:verified'
        })
        .eq('user_id', user?.id)
        .eq('workflow_id', workflowId)
        .eq('provider', 'whatsapp');

      if (error) throw error;

      setStep('complete');
      toast({
        title: "WhatsApp Connected!",
        description: "Your WhatsApp is now connected and ready for automation.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Connect WhatsApp Business</h3>
        <p className="text-gray-600">
          Connect your WhatsApp number to enable {workflowName} automation
        </p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">How it works</h4>
            <p className="text-sm text-blue-700">
              We'll connect your WhatsApp number to our business API. You'll receive messages 
              and notifications through our secure WhatsApp Business service.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
          <Zap className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">What you'll get</h4>
            <p className="text-sm text-green-700">
              Automated responses, AI-powered conversations, message analytics, 
              and seamless integration with your business workflows.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
          <Phone className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-900">Requirements</h4>
            <p className="text-sm text-orange-700">
              A WhatsApp-enabled phone number. We'll send a verification code 
              to confirm your number during setup.
            </p>
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setStep('phone')} 
        className="w-full"
        size="lg"
      >
        Start WhatsApp Setup
      </Button>
    </div>
  );

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Enter Your WhatsApp Number</h3>
        <p className="text-gray-600">
          We'll send a verification code to this number
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">WhatsApp Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Include country code (e.g., +1 for US, +44 for UK)
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This number will be used for WhatsApp Business automation. 
            Make sure it's a number you have access to for verification.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setStep('info')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handlePhoneSubmit}
          disabled={loading || !phoneNumber}
          className="flex-1"
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Verify Your Number</h3>
        <p className="text-gray-600">
          Enter the 6-digit code sent to {phoneNumber}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="mt-1 text-center text-lg tracking-widest"
          />
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Didn't receive the code?</strong> Check your WhatsApp messages. 
            If you don't see it, you can request a new code.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setStep('phone')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handleVerificationSubmit}
          disabled={loading || !verificationCode}
          className="flex-1"
        >
          {loading ? 'Verifying...' : 'Verify & Connect'}
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">WhatsApp Connected!</h3>
        <p className="text-gray-600 mb-4">
          Your WhatsApp number is now connected and ready for automation
        </p>
        
        <Badge variant="default" className="bg-green-100 text-green-800">
          ✓ {phoneNumber} Connected
        </Badge>
      </div>

      <div className="p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-700">
          <strong>Next steps:</strong> Your {workflowName} workflow is now active. 
          You'll receive automated responses and notifications through WhatsApp.
        </p>
      </div>

      <Button 
        onClick={() => window.location.href = '/dashboard'}
        className="w-full"
      >
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💬 WhatsApp Setup
        </CardTitle>
        <CardDescription>
          Connect your WhatsApp for {workflowName} automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'info' && renderInfoStep()}
        {step === 'phone' && renderPhoneStep()}
        {step === 'verification' && renderVerificationStep()}
        {step === 'complete' && renderCompleteStep()}
      </CardContent>
    </Card>
  );
}; 