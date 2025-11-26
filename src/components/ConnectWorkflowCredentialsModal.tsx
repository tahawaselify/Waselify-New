import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConnectWorkflowCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  providerLabel: string;
  onConnect: () => void;
}

const ConnectWorkflowCredentialsModal: React.FC<ConnectWorkflowCredentialsModalProps> = ({
  isOpen,
  onClose,
  workflowName,
  providerLabel,
  onConnect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Workflow Approved – Action Required
            </CardTitle>
            <CardDescription>
              {workflowName} has been approved. Please connect your {providerLabel} account to start the automation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                You will be redirected to a secure authorization page to grant access. Your credentials are stored securely and are not visible to admins.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>Later</Button>
                <Button className="bg-waselify-500 hover:bg-waselify-600" onClick={onConnect}>Connect {providerLabel}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectWorkflowCredentialsModal;


