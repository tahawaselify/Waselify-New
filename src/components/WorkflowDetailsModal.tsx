import { X, BarChart3, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_setup_cost?: number;
  estimated_monthly_cost?: number;
  complexity_level?: string;
}

interface WorkflowDetailsModalProps {
  workflow: WorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowDetailsModal = ({ workflow, isOpen, onClose }: WorkflowDetailsModalProps) => {
  if (!isOpen || !workflow) return null;

  // Mock data for the sample dashboard
  const mockData = {
    totalExecutions: 1247,
    successRate: 94.2,
    avgExecutionTime: '2.3s',
    activeWorkflows: 3,
    recentExecutions: [
      { id: 1, status: 'success', time: '2.1s', timestamp: '2 minutes ago' },
      { id: 2, status: 'success', time: '1.8s', timestamp: '5 minutes ago' },
      { id: 3, status: 'error', time: '4.2s', timestamp: '8 minutes ago' },
      { id: 4, status: 'success', time: '2.5s', timestamp: '12 minutes ago' },
      { id: 5, status: 'success', time: '1.9s', timestamp: '15 minutes ago' },
    ],
    weeklyStats: [
      { day: 'Mon', executions: 45, success: 42 },
      { day: 'Tue', executions: 52, success: 49 },
      { day: 'Wed', executions: 38, success: 36 },
      { day: 'Thu', executions: 61, success: 58 },
      { day: 'Fri', executions: 48, success: 45 },
      { day: 'Sat', executions: 23, success: 22 },
      { day: 'Sun', executions: 18, success: 17 },
    ],
    integrations: [
      { name: 'Gmail', status: 'connected', icon: '📧' },
      { name: 'Slack', status: 'connected', icon: '💬' },
      { name: 'Google Sheets', status: 'connected', icon: '📊' },
      { name: 'CRM System', status: 'pending', icon: '👥' },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      case 'running': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sample Dashboard</h2>
              <p className="text-gray-600 mt-1">Preview of what you can expect with</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-waselify-100 text-waselify-800">
                  {workflow.category}
                </Badge>
                <span className="font-semibold text-gray-900">{workflow.name}</span>
              </div>
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

          {/* Mock Data Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Sample Data Notice</h3>
                <p className="text-blue-800 text-sm">
                  This dashboard shows mock data for demonstration purposes only. 
                  Your actual dashboard will display real-time data from your workflow executions 
                  once the automation is set up and running.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.totalExecutions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.avgExecutionTime}</div>
                <p className="text-xs text-muted-foreground">
                  -0.3s from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.activeWorkflows}</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Executions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(execution.status)}`}>
                          {getStatusIcon(execution.status)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">Execution #{execution.id}</p>
                          <p className="text-xs text-gray-500">{execution.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{execution.time}</p>
                        <Badge className={`text-xs ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.weeklyStats.map((day) => (
                    <div key={day.day} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{day.day}</span>
                        <span className="text-gray-500">{day.success}/{day.executions} successful</span>
                      </div>
                      <Progress 
                        value={(day.success / day.executions) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connected Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockData.integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center gap-3 p-3 border rounded-lg">
                    <span className="text-2xl">{integration.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{integration.name}</p>
                      <Badge 
                        className={`text-xs ${
                          integration.status === 'connected' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button className="flex-1 bg-waselify-500 hover:bg-waselify-600">
              <Play size={16} className="mr-2" />
              Start Workflow
            </Button>
            <Button variant="outline" className="flex-1">
              <Settings size={16} className="mr-2" />
              Configure
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetailsModal; 