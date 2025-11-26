import React from 'react';
import BackButton from '@/components/BackButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Settings } from 'lucide-react';

export type WorkflowAction = 'start' | 'stop' | 'modify';

export interface SampleHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string; // defaults to /marketplace
  rightSide?: React.ReactNode; // e.g., status badge + action button(s)
  className?: string;
}

// Consistent page header with Back to Dashboard, title, subtitle, and right actions
export const SampleHeader: React.FC<SampleHeaderProps> = ({
  title,
  subtitle,
  backTo = '/marketplace',
  rightSide,
  className
}) => {
  return (
    <div className={['max-w-7xl mx-auto px-4 py-0', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <BackButton to={backTo} />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {rightSide && (
          <div className="flex items-center gap-2">
            {rightSide}
          </div>
        )}
      </div>
    </div>
  );
};

export interface SampleWorkflowControlProps {
  workflowTitle: string; // used in description sentence and for context
  onRequest: (action: WorkflowAction) => void;
}

// Consistent Workflow Control card with 3 actions styled like the screenshot
export const SampleWorkflowControl: React.FC<SampleWorkflowControlProps> = ({ workflowTitle, onRequest }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Workflow Control</CardTitle>
        <CardDescription>
          Request admin to start, stop, or modify your {workflowTitle} workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => onRequest('start')}
              className="h-auto p-4 flex flex-col items-center bg-waselify-500 hover:bg-waselify-600 text-white"
            >
              <CheckCircle className="w-6 h-6 mb-2" />
              <span>Request Start</span>
            </Button>
            <Button
              onClick={() => onRequest('stop')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
            >
              <XCircle className="w-6 h-6 mb-2" />
              <span>Request Stop</span>
            </Button>
            <Button
              onClick={() => onRequest('modify')}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
            >
              <Settings className="w-6 h-6 mb-2" />
              <span>Request Changes</span>
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>• <strong>Start:</strong> Request admin to activate your workflow</p>
            <p>• <strong>Stop:</strong> Request admin to pause your workflow</p>
            <p>• <strong>Changes:</strong> Request modifications to workflow settings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export interface StatusBadgeProps {
  label: string;
  color?: 'green' | 'red' | 'gray' | 'blue' | 'yellow';
}

// Helper: consistent status badge (e.g., Active)
export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color = 'green' }) => {
  const colorMap: Record<string, string> = {
    green: 'text-green-600 border-green-600',
    red: 'text-red-600 border-red-600',
    gray: 'text-gray-600 border-gray-600',
    blue: 'text-blue-600 border-blue-600',
    yellow: 'text-yellow-600 border-yellow-600',
  };
  return (
    <Badge variant="outline" className={colorMap[color] || colorMap.green}>
      {label}
    </Badge>
  );
};
