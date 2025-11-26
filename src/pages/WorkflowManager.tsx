import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText, Upload, Database, Search, Filter, 
  CheckCircle, XCircle, AlertCircle, Settings,
  Play, Pause, RefreshCw, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import workflowService, { Workflow, WorkflowStats } from '@/services/workflowService';
import BackButton from '@/components/BackButton';
import Navbar from '@/components/Navbar';

const WorkflowManager: React.FC = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [workflowsData, statsData, n8nData] = await Promise.all([
        workflowService.getWorkflows(),
        workflowService.getWorkflowStats(),
        workflowService.testN8nConnection()
      ]);
      
      setWorkflows(workflowsData);
      setStats(statsData);
      setN8nStatus(n8nData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportAll = async () => {
    setIsImporting(true);
    try {
      const result = await workflowService.importAllWorkflows();
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.summary.successful} out of ${result.summary.total} workflows`,
      });
      
      // Show detailed results
      const failed = result.data.filter(r => !r.success);
      if (failed.length > 0) {
        toast({
          title: "Some imports failed",
          description: `${failed.length} workflows failed to import. Check the console for details.`,
          variant: "destructive"
        });
        console.log('Failed imports:', failed);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import workflows. Check n8n configuration.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportSingle = async (filename: string) => {
    try {
      const result = await workflowService.importWorkflow(filename);
      if (result.success) {
        toast({
          title: "Success",
          description: `Workflow "${result.name}" imported successfully`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import workflow",
        variant: "destructive"
      });
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (stats?.categories[selectedCategory]?.some(w => w.filename === workflow.filename));
    return matchesSearch && matchesCategory;
  });

  const categories = stats ? Object.keys(stats.categories) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20">
      <Navbar />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Workflow Manager</h1>
            <p className="text-slate-600 text-lg">Manage and import n8n workflows</p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Workflows</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalWorkflows}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Play className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.activeWorkflows}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Avg Nodes</p>
                    <p className="text-2xl font-bold text-slate-800">{Math.round(stats.averageNodeCount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Settings className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Categories</p>
                    <p className="text-2xl font-bold text-slate-800">{categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* n8n Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${n8nStatus?.success ? 'bg-green-100' : 'bg-red-100'}`}>
                  {n8nStatus?.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">n8n Connection</h3>
                  <p className="text-slate-600">{n8nStatus?.message}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={handleImportAll}
            disabled={isImporting || !n8nStatus?.success}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isImporting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isImporting ? 'Importing...' : 'Import All'}
          </Button>
        </div>

        {/* Workflows List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.filename} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-800 mb-2">
                      {workflow.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {workflow.description}
                    </p>
                  </div>
                  <Badge variant={workflow.active ? "default" : "secondary"}>
                    {workflow.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <span>{workflow.nodeCount} nodes</span>
                  <span>{(workflow.size / 1024).toFixed(1)} KB</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {workflow.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {workflow.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{workflow.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImportSingle(workflow.filename)}
                    disabled={!n8nStatus?.success}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Import
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // TODO: Implement workflow preview
                      toast({
                        title: "Preview",
                        description: "Workflow preview feature coming soon",
                      });
                    }}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No workflows found</h3>
              <p className="text-slate-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No workflows available in the specified directory'
                }
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager; 