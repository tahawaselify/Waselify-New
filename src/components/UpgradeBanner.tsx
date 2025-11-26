import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';

interface UpgradeBannerProps {
  workflowName: string;
  className?: string;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ workflowName, className = '' }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestAccess = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request workflow access.",
        variant: "destructive"
      });
      return;
    }

    setIsRequesting(true);

    try {
      // Create workflow access request in database
      const { error } = await supabase
        .from('workflow_access_requests')
        .insert({
          user_id: user.id,
          workflow_id: workflowName.toLowerCase().replace(/\s+/g, '-'),
          workflow_name: workflowName,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating request:', error);
        throw error;
      }

      toast({
        title: "Request Submitted",
        description: "Your workflow access request has been submitted. We'll review it and get back to you within 24 hours.",
      });

    } catch (error) {
      console.error('Error requesting access:', error);
      toast({
        title: "Request Failed",
        description: "Failed to submit request. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-blue-900">Request Access</h3>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  <Lock className="w-3 h-3 mr-1" />
                  Contact Support
                </Badge>
              </div>
              <p className="text-blue-800 text-sm">
                This {workflowName} workflow requires approval. Contact our support team to get started.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRequestAccess}
              disabled={isRequesting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isRequesting ? 'Submitting...' : 'Request Access'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradeBanner; 