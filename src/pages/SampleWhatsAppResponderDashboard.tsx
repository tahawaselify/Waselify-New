import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Activity,
  Database,
  XCircle,
  Settings,
  AlertTriangle
} from "lucide-react";
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const SampleWhatsAppResponderDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [processedRequests, setProcessedRequests] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Sample data for demonstration
  const sampleMetrics = {
    totalMessages: 847,
    responseRate: 94.2,
    averageResponseTime: 2.3,
    customerSatisfaction: 89.5
  };

  const loadPendingRequests = async () => {
    // Sample data for preview
    setPendingRequests([
      {
        id: '1',
        action: 'start',
        details: 'Request to start WhatsApp Responder workflow',
        created_at: new Date().toISOString(),
        status: 'pending'
      }
    ]);
  };

  const loadProcessedRequests = async () => {
    // Sample data for preview
    setProcessedRequests([
      {
        id: '2',
        action: 'modify',
        details: 'Request to modify WhatsApp Responder workflow settings',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        status: 'approved'
      }
    ]);
  };

  const handleWorkflowRequest = async (action: 'start' | 'stop' | 'modify') => {
    toast({
      title: "Sample Request",
      description: `This is a sample dashboard. In the actual workflow, your ${action} request would be submitted for admin approval.`,
    });
  };

  const isRunning = true;

  // Load sample data on component mount
  React.useEffect(() => {
    loadPendingRequests();
    loadProcessedRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-40">
        {/* Sample Dashboard Notice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Sample Dashboard Notice</h3>
            <p className="text-yellow-700 text-sm">
              This is a sample dashboard showing how your WhatsApp AI Responder dashboard will look when you purchase this workflow. 
              All data shown is for demonstration purposes only.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" />
            <div>
              <h1 className="text-3xl font-bold">WhatsApp AI Responder Dashboard</h1>
              <p className="text-muted-foreground">Monitor your automated WhatsApp response system</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? "default" : "secondary"}>
              {isRunning ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      

      {/* Workflow Control Request */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Workflow Control</CardTitle>
          <CardDescription>
            Request admin to start, stop, or modify your WhatsApp Responder workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleWorkflowRequest('start')}
                className="h-auto p-4 flex flex-col items-center bg-waselify-500 hover:bg-waselify-600 text-white"
              >
                <CheckCircle className="w-6 h-6 mb-2" />
                <span>Request Start</span>
              </Button>
              <Button
                onClick={() => handleWorkflowRequest('stop')}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center border-waselify-500 text-waselify-500 hover:bg-waselify-50"
              >
                <XCircle className="w-6 h-6 mb-2" />
                <span>Request Stop</span>
              </Button>
              <Button
                onClick={() => handleWorkflowRequest('modify')}
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

      {/* Pending Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pending Requests</span>
          </CardTitle>
          <CardDescription>
            Your workflow control requests awaiting admin approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="capitalize">
                    {request.action}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{request.details}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Processed Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Recent Processed Requests</span>
          </CardTitle>
          <CardDescription>
            Your recently approved or rejected workflow requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {processedRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="capitalize">
                    {request.action}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{request.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.status === 'approved' ? 'Approved' : 'Rejected'} on {new Date(request.updated_at || request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                  {request.status === 'approved' ? 'Approved' : 'Rejected'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Processed</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.responseRate}%</div>
            <p className="text-xs text-muted-foreground">Automated responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleMetrics.customerSatisfaction}%</div>
            <p className="text-xs text-muted-foreground">Based on interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sample Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Performance</CardTitle>
            <CardDescription>How well your AI is responding to customer inquiries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Quick Responses (under 5s)</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Accurate Responses</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Customer Resolution Rate</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest WhatsApp interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order inquiry resolved</p>
                  <p className="text-xs text-gray-600">Customer: "Where is my order?" → AI provided tracking info</p>
                </div>
                <span className="text-xs text-gray-500">2 min ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Product question answered</p>
                  <p className="text-xs text-gray-600">Customer: "Do you have size XL?" → AI confirmed availability</p>
                </div>
                <span className="text-xs text-gray-500">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Return request processed</p>
                  <p className="text-xs text-gray-600">Customer: "I want to return item" → AI initiated return process</p>
                </div>
                <span className="text-xs text-gray-500">8 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            🎉 <strong>Sample Dashboard</strong> - This shows how your WhatsApp AI Responder metrics will appear when you purchase this workflow
          </p>
        </div>
      </div>
    </div>
  );
};

export default SampleWhatsAppResponderDashboard;
