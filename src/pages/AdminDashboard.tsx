import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, Clock, CheckCircle, XCircle, Mail, Building2, DollarSign,
  Calendar, Search, Filter, MessageSquare, FileText, AlertCircle,
  LogOut, Settings, Bell, BarChart3, Shield, X, Play, Pause, Phone, User
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import Navbar from '@/components/Navbar';
import DirectMessageModal from '@/components/DirectMessageModal';

import { api } from '@/lib/config';

interface AccessRequest {
  id: string;
  user_id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  phone_number?: string;
  position_title?: string;
  industry?: string;
  use_case?: string;
  budget_range?: string;
  timeline?: string;
  additional_requirements?: string;
  requested_at: string;
  user_email?: string;
}

interface WorkflowExecution {
  id: string;
  workflow_name: string;
  execution_time: number;
  status: 'success' | 'failed' | 'running';
  user_id: string;
  metrics: any;
  created_at: string;
}

interface WorkflowStats {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  activeWorkflows: number;
  totalUsers: number;
  recentExecutions: WorkflowExecution[];
}

interface ActiveWorkflow {
  id: string;
  workflow_name: string;
  user_id: string;
  user_email: string;
  status: 'active' | 'inactive' | 'running' | 'stopped';
  last_execution?: string;
  execution_count: number;
  is_controlled: boolean;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [showActivationForm, setShowActivationForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [activationData, setActivationData] = useState({
    apiKey: '',
    webhookUrl: '',
    emailAddress: '',
    phoneNumber: '',
    customSettings: '',
    // Additional workflow-specific fields
    databaseUrl: '',
    apiEndpoint: '',
    credentials: '',
    configuration: '',
    notes: ''
  });

  // Workflow control state
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [controllingWorkflows, setControllingWorkflows] = useState<Set<string>>(new Set());
  const [n8nServerUrl, setN8nServerUrl] = useState('http://localhost:5678'); // Default n8n URL
  const [n8nApiKey, setN8nApiKey] = useState(''); // n8n API key for admin control

  // User Management state
  const [activeTab, setActiveTab] = useState<'requests' | 'workflows' | 'users' | 'control-requests'>('requests');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [workflowControlRequests, setWorkflowControlRequests] = useState<any[]>([]);
  const [processingControlRequests, setProcessingControlRequests] = useState<Set<string>>(new Set());
  const [userRequests, setUserRequests] = useState<AccessRequest[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);

  // Messaging state
  interface RequestMessage {
    id: string;
    request_id: string;
    sender_id: string | null;
    sender_type: 'admin' | 'client';
    content: string;
    created_at: string;
  }
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRequest, setMessageRequest] = useState<AccessRequest | null>(null);
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [messageChannelToken, setMessageChannelToken] = useState<any>(null);

  const [bannerInputs, setBannerInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAccessRequests();
    loadActiveWorkflows();
    loadAllUsers();
    loadWorkflowControlRequests();
  }, []);

  // Messaging handlers
  const openMessageModal = async (request: AccessRequest) => {
    setMessageRequest(request);
    setShowMessageModal(true);
    // Load existing messages for this request
    try {
      const { data } = await supabase
        .from('workflow_request_messages')
        .select('*')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });
      setMessages((data as RequestMessage[]) || []);
    } catch (e) {
      console.error('Error loading messages', e);
      setMessages([]);
    }
    // Setup realtime subscription for new messages on this thread
    try {
      if (messageChannelToken) {
        supabase.removeChannel(messageChannelToken);
        setMessageChannelToken(null);
      }
      const channel = supabase
        .channel(`admin-wrm-${request.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_request_messages',
          filter: `request_id=eq.${request.id}`
        }, (payload: any) => {
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const newMessage = payload.new as RequestMessage;
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              return prev;
            }
            return [...prev, newMessage];
          });
        })
        .subscribe();
      setMessageChannelToken(channel);
    } catch (e) {
      console.warn('Could not subscribe to messages', e);
    }
  };

  const sendMessage = async () => {
    if (!messageRequest || !newMessage.trim()) return;
    setIsSending(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('workflow_request_messages')
        .insert({
          request_id: messageRequest.id,
          sender_id: currentUser?.user?.id || null,
          sender_type: 'admin',
          content: newMessage.trim()
        })
        .select('*')
        .single();
      if (!error && data) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const newMessage = data as RequestMessage;
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, newMessage];
        });
        setNewMessage('');
      }
    } catch (e) {
      console.error('Error sending message', e);
    } finally {
      setIsSending(false);
    }
  };

  const loadActiveWorkflows = async () => {
    try {
      // Get all approved workflow configurations
      const { data: configs, error: configError } = await supabase
        .from('workflow_configs')
        .select('*')
        .eq('status', 'active');

      if (configError) {
        console.error('Error loading workflow configs:', configError);
        return;
      }

      // Get user emails for each workflow
      const workflowsWithUsers = await Promise.all(
        (configs || []).map(async (config) => {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', config.user_id)
              .maybeSingle();

            // Get workflow name from mapping if not available
            let workflowName = config.workflow_name;
            if (!workflowName && config.workflow_id) {
              const { data: mappingData } = await supabase
                .from('workflow_name_mapping')
                .select('workflow_name')
                .eq('workflow_id', config.workflow_id)
                .maybeSingle();
              workflowName = mappingData?.workflow_name || config.workflow_id;
            }

            // Get execution count for this workflow
            const { count: executionCount } = await supabase
              .from('workflow_executions')
              .select('*', { count: 'exact', head: true })
              .eq('workflow_name', workflowName)
              .filter('user_id', 'eq', config.user_id);

            // Get last execution
            const { data: lastExecution } = await supabase
              .from('workflow_executions')
              .select('created_at')
              .eq('workflow_name', workflowName)
              .filter('user_id', 'eq', config.user_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              id: config.id || `${config.user_id}-${workflowName}`,
              workflow_name: workflowName,
              user_id: config.user_id,
              user_email: profileData?.email || `User ${config.user_id.slice(0, 8)}...`,
              status: 'active' as const,
              last_execution: lastExecution?.created_at,
              execution_count: executionCount || 0,
              is_controlled: true
            };
          } catch (error) {
            console.error('Error processing workflow config:', error);
            return null;
          }
        })
      );

      // Filter out duplicates and null values
      const uniqueWorkflows = workflowsWithUsers
        .filter(Boolean)
        .filter((workflow, index, self) =>
          index === self.findIndex(w => w?.id === workflow?.id)
        ) as ActiveWorkflow[];

      setActiveWorkflows(uniqueWorkflows);
    } catch (error) {
      console.error('Error loading active workflows:', error);
    }
  };

  // Load all users for user management
  const loadAllUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setAllUsers(profiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadWorkflowControlRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('workflow_control_requests')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            company
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading workflow control requests:', error);
        return;
      }

      setWorkflowControlRequests(requests || []);
    } catch (error) {
      console.error('Error loading workflow control requests:', error);
    }
  };

  const handleWorkflowControlRequest = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setProcessingControlRequests(prev => new Set(prev).add(requestId));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('workflow_control_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          admin_notes: notes,
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating workflow control request:', error);
        toast({
          title: "Error",
          description: "Failed to process request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Request Processed",
        description: `Workflow control request has been ${action}d successfully. The user will see this update in real-time.`,
        variant: "default",
      });

      // Refresh the requests list
      loadWorkflowControlRequests();

    } catch (error) {
      console.error('Error handling workflow control request:', error);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setProcessingControlRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Load detailed user data when a user is selected
  const loadUserDetails = async (userId: string) => {
    try {
      // Load user's requests
      const { data: requests } = await supabase
        .from('workflow_access_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });

      // Load user's subscriptions
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId);

      // Load user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setUserRequests(requests || []);
      setUserSubscriptions(subscriptions || []);
      setUserProfiles([profile].filter(Boolean));
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  // Remove workflow from user's approved list
  const removeUserWorkflow = async (userId: string, workflowSlug: string) => {
    try {
      const { data: currentSubscription } = await supabase
        .from('user_subscriptions')
        .select('approved_workflows')
        .eq('user_id', userId)
        .maybeSingle();

      if (!currentSubscription) {
        toast({
          title: "Error",
          description: "User subscription not found",
          variant: "destructive",
        });
        return;
      }

      const updatedWorkflows = currentSubscription.approved_workflows.filter(
        (workflow: string) => workflow !== workflowSlug
      );

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          approved_workflows: updatedWorkflows,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing workflow:', error);
        toast({
          title: "Error",
          description: "Failed to remove workflow",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Workflow removed from user's dashboard",
        });
        // Reload user details
        loadUserDetails(userId);
      }
    } catch (error) {
      console.error('Error removing workflow:', error);
      toast({
        title: "Error",
        description: "Failed to remove workflow",
        variant: "destructive",
      });
    }
  };

  const loadAccessRequests = async () => {
    try {
      // First, try to get workflow access requests without join
      const { data, error } = await supabase
        .from('workflow_access_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error loading access requests:', error);
        toast({
          title: "Error",
          description: "Failed to load access requests",
          variant: "destructive"
        });
        return;
      }

      // Get user emails separately for each request
      const requestsWithEmail = await Promise.all(
        (data || []).map(async (request) => {
          try {
            // First try to get from profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', request.user_id)
              .maybeSingle();

            if (profileData?.email) {
              return {
                ...request,
                user_email: profileData.email
              };
            }

            // If profile doesn't exist, show user ID instead
            if (profileError && profileError.code === 'PGRST116') {
              console.warn(`Profile not found for user ${request.user_id}, showing user ID instead`);
              return {
                ...request,
                user_email: `User ${request.user_id.slice(0, 8)}...`
              };
            } else if (profileError) {
              console.warn(`Could not fetch email for user ${request.user_id}:`, profileError);
            }

            return {
              ...request,
              user_email: 'Unknown'
            };
          } catch (error) {
            console.warn(`Error fetching profile for user ${request.user_id}:`, error);
            return {
              ...request,
              user_email: 'Unknown'
            };
          }
        })
      );

      // Filter out duplicates based on request ID
      const uniqueRequests = requestsWithEmail.filter((request, index, self) =>
        index === self.findIndex(r => r.id === request.id)
      );

      setRequests(uniqueRequests);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load workflow data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (requestId: string) => {
    // Get the request details
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Show activation form instead of immediately approving
    setSelectedRequest(request);
    setShowActivationForm(true);
  };

  const handleActivationSubmit = async () => {
    if (!selectedRequest) return;

    setProcessingRequests(prev => new Set(prev).add(selectedRequest.id));

    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('workflow_access_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // Add workflow to user's approved workflows
      const { data: currentSubscription } = await supabase
        .from('user_subscriptions')
        .select('approved_workflows')
        .filter('user_id', 'eq', selectedRequest.user_id)
        .maybeSingle();

      const currentWorkflows = currentSubscription?.approved_workflows || [];
      // Convert workflow name to slug format (e.g., "Email Summary Agent" -> "email-summary-agent")
      const workflowSlug = selectedRequest.workflow_name.toLowerCase().replace(/\s+/g, '-');

      // Prevent duplicate entries
      const updatedWorkflows = currentWorkflows.includes(workflowSlug)
        ? currentWorkflows
        : [...currentWorkflows, workflowSlug];

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: selectedRequest.user_id,
          approved_workflows: updatedWorkflows,
          updated_at: new Date().toISOString()
        });

      if (subscriptionError) {
        console.warn('Could not update user subscription:', subscriptionError);
      } else if (currentWorkflows.includes(workflowSlug)) {
        toast({
          title: "Already Approved",
          description: `User already has access to "${selectedRequest.workflow_name}". No changes made.`,
          variant: "default",
        });
      }

      // Store activation data in database
      const { error: configError } = await supabase
        .from('workflow_configs')
        .insert({
          user_id: selectedRequest.user_id,
          workflow_id: selectedRequest.workflow_id,
          workflow_name: selectedRequest.workflow_name,
          request_id: selectedRequest.id,
          api_key: activationData.apiKey,
          webhook_url: activationData.webhookUrl,
          email_address: activationData.emailAddress,
          phone_number: activationData.phoneNumber,
          custom_settings: activationData.customSettings,
          database_url: activationData.databaseUrl,
          api_endpoint: activationData.apiEndpoint,
          credentials: activationData.credentials,
          configuration: activationData.configuration,
          notes: activationData.notes,
          status: 'active'
        });

      if (configError) {
        console.warn('Could not save workflow configuration:', configError);
        // Don't fail the approval if config save fails
      } else {
        console.log('Workflow configuration saved successfully');
      }

      // Update workflow request history with approval date and duration
      const { error: historyError } = await supabase
        .from('workflow_request_history')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString(),
          duration_days: Math.ceil((new Date().getTime() - new Date(selectedRequest.requested_at).getTime()) / (1000 * 60 * 60 * 24)),
          admin_notes: 'Request approved by admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedRequest.user_id)
        .eq('workflow_id', selectedRequest.workflow_id)
        .eq('status', 'pending');

      if (historyError) {
        console.warn('Could not update request history:', historyError);
      }

      // Create notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.user_id,
          title: 'Workflow Access Approved',
          message: `Your request for "${selectedRequest.workflow_name}" has been approved! You now have access to this workflow.`,
          type: 'success',
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.warn('Could not create notification:', notificationError);
      }

      // Optimistically update UI
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'approved' } : r));

      // Optimistically update UI
      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'approved' } : r));

      toast({
        title: "Request Approved",
        description: "User now has access to this workflow and has been notified",
      });

      // Close form and refresh
      setShowActivationForm(false);
      setSelectedRequest(null);
      setActivationData({
        apiKey: '',
        webhookUrl: '',
        emailAddress: '',
        phoneNumber: '',
        customSettings: '',
        databaseUrl: '',
        apiEndpoint: '',
        credentials: '',
        configuration: '',
        notes: ''
      });
      loadAccessRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
    }
  };

  const handleDeny = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId));

    try {
      // Get the request details first
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      const { error } = await supabase
        .from('workflow_access_requests')
        .update({
          status: 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      // Create notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          title: 'Workflow Access Denied',
          message: `Your request for "${request.workflow_name}" has been denied. Please contact support for more information.`,
          type: 'error',
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.warn('Could not create notification:', notificationError);
      }

      // Optimistically update UI
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'denied' } : r));

      toast({
        title: "Request Denied",
        description: "Access request has been denied and user has been notified",
      });

      loadAccessRequests();
    } catch (error) {
      console.error("Error denying request:", error);
      toast({
        title: "Error",
        description: "Failed to deny request",
        variant: "destructive"
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleQuickApprove = async () => {
    if (!selectedRequest) return;

    setProcessingRequests(prev => new Set(prev).add(selectedRequest.id));

    try {
      // Update request status
      const { error: updateError } = await supabase
        .from('workflow_access_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // Add workflow to user's approved workflows
      const { data: currentSubscription } = await supabase
        .from('user_subscriptions')
        .select('approved_workflows')
        .filter('user_id', 'eq', selectedRequest.user_id)
        .maybeSingle();

      const currentWorkflows = currentSubscription?.approved_workflows || [];
      // Convert workflow name to slug format (e.g., "Email Summary Agent" -> "email-summary-agent")
      const workflowSlug = selectedRequest.workflow_name.toLowerCase().replace(/\s+/g, '-');

      // Prevent duplicate entries
      const updatedWorkflows = currentWorkflows.includes(workflowSlug)
        ? currentWorkflows
        : [...currentWorkflows, workflowSlug];

      console.log('AdminDashboard: Approving workflow (simple):', {
        originalName: selectedRequest.workflow_name,
        workflowSlug: workflowSlug,
        currentWorkflows: currentWorkflows,
        updatedWorkflows: updatedWorkflows,
        isDuplicate: currentWorkflows.includes(workflowSlug)
      });

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: selectedRequest.user_id,
          approved_workflows: updatedWorkflows,
          updated_at: new Date().toISOString()
        });

      if (subscriptionError) {
        console.warn('Could not update user subscription:', subscriptionError);
      } else if (currentWorkflows.includes(workflowSlug)) {
        toast({
          title: "Already Approved",
          description: `User already has access to "${selectedRequest.workflow_name}". No changes made.`,
          variant: "default",
        });
      }

      // Create basic workflow config
      const { error: configError } = await supabase
        .from('workflow_configs')
        .insert({
          user_id: selectedRequest.user_id,
          workflow_id: selectedRequest.workflow_id,
          workflow_name: selectedRequest.workflow_name,
          request_id: selectedRequest.id,
          status: 'active'
        });

      if (configError) {
        console.warn('Could not save workflow configuration:', configError);
      }

      // Create notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.user_id,
          title: 'Workflow Access Approved',
          message: `Your request for "${selectedRequest.workflow_name}" has been approved! You now have access to this workflow.`,
          type: 'success',
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.warn('Could not create notification:', notificationError);
      }

      toast({
        title: "Request Approved",
        description: "User now has access to this workflow and has been notified",
      });

      // Close form and refresh
      setShowActivationForm(false);
      setSelectedRequest(null);
      loadAccessRequests();
      loadActiveWorkflows();

    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!selectedRequest) return;

    setProcessingRequests(prev => new Set(prev).add(selectedRequest.id));

    try {
      // Create notification for the user requesting more information
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.user_id,
          title: 'Additional Information Required',
          message: `We need more information to configure your "${selectedRequest.workflow_name}" workflow. Please check your dashboard for details.`,
          type: 'warning',
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.warn('Could not create notification:', notificationError);
      }

      // Update request with info request
      const { error: updateError } = await supabase
        .from('workflow_access_requests')
        .update({
          status: 'pending',
          additional_requirements: activationData.notes || 'Additional information requested by admin',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast({
        title: "Information Requested",
        description: "User has been notified to provide additional information",
      });

      // Close form and refresh
      setShowActivationForm(false);
      setSelectedRequest(null);
      loadAccessRequests();

    } catch (error) {
      console.error('Error requesting information:', error);
      toast({
        title: "Error",
        description: "Failed to request information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.workflow_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-700 border-green-300';
      case 'denied': return 'bg-red-100 text-red-700 border-red-300';
      case 'expired': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'denied': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isCustomWorkflowRequest = (request: AccessRequest) => {
    return request.workflow_id === 'custom' || request.workflow_name.startsWith('Custom:');
  };

  const getRequestTypeBadge = (request: AccessRequest) => {
    if (isCustomWorkflowRequest(request)) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-300">
          Custom Workflow
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-300">
        Standard Workflow
      </Badge>
    );
  };

  // Helpers to render custom workflow additional requirements when provided as JSON
  const parseAdditionalRequirements = (raw?: string) => {
    if (!raw) return null;
    try {
      const maybe = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (maybe && typeof maybe === 'object') return maybe as Record<string, unknown>;
    } catch (_) {
      // Not JSON; fall through
    }
    return null;
  };

  const requirementLabels: Record<string, string> = {
    businessProblem: 'Business Problem',
    expectedOutcome: 'Expected Outcome',
    targetUsers: 'Target Users',
    urgency: 'Urgency',
    technicalRequirements: 'Technical Requirements',
    integrations: 'Integrations',
    additionalNotes: 'Additional Notes',
  };

  const RenderAdditionalRequirements = ({ raw }: { raw?: string }) => {
    const obj = parseAdditionalRequirements(raw);
    if (!obj) return null;
    const entries = Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '');
    if (entries.length === 0) return null;
    return (
      <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <div key={key} className="text-sm">
              <div className="text-slate-500 text-xs">{requirementLabels[key] || key}</div>
              <div className="text-slate-700 break-words">{String(value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Send a broadcast notification to all non-admin users
  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast({ title: 'Missing fields', description: 'Please provide a title and message', variant: 'destructive' });
      return;
    }
    setIsBroadcasting(true);
    try {
      // Fetch all non-admin users
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role');
      if (profilesError) throw profilesError;

      const targets = (allProfiles || []).filter((p: any) => p.role !== 'admin');
      if (targets.length === 0) {
        toast({ title: 'No recipients', description: 'No users found to receive the message' });
        return;
      }

      const rows = targets.map((p: any) => ({
        user_id: p.id,
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      console.log('AdminDashboard: Sending broadcast to users:', targets.map(t => t.id));
      console.log('AdminDashboard: Notification rows:', rows);

      const { error: insertError } = await supabase.from('notifications').insert(rows);
      if (insertError) throw insertError;

      toast({ title: 'Broadcast sent', description: `Sent to ${rows.length} users` });
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (error) {
      console.error('Broadcast error:', error);
      toast({ title: 'Failed to send', description: 'Could not send broadcast message', variant: 'destructive' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Test function to send a notification to a specific user
  const handleTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Send a test notification to the current user
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast({ title: 'Test notification sent', description: 'Check if you receive the notification' });
    } catch (error) {
      console.error('Test notification error:', error);
      toast({ title: 'Failed to send test', description: 'Could not send test notification', variant: 'destructive' });
    }
  };

  // Workflow control functions
  const startWorkflow = async (workflowId: string, workflowName: string, userId?: string) => {
    setControllingWorkflows(prev => new Set(prev).add(workflowId));
    try {
      await postAdmin('workflows/start', { user_id: userId || null, workflow_name: workflowName });
      toast({ title: 'Workflow Started', description: `${workflowName} has been started successfully` });
      setActiveWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, status: 'running' as const } : w));
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast({ title: 'Error', description: `Failed to start workflow: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setControllingWorkflows(prev => { const s = new Set(prev); s.delete(workflowId); return s; });
    }
  };

  const stopWorkflow = async (workflowId: string, workflowName: string, userId?: string) => {
    setControllingWorkflows(prev => new Set(prev).add(workflowId));
    try {
      await postAdmin('workflows/stop', { user_id: userId || null, workflow_name: workflowName });
      toast({ title: 'Workflow Stopped', description: `${workflowName} has been stopped successfully` });
      setActiveWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, status: 'stopped' as const } : w));
    } catch (error) {
      console.error('Error stopping workflow:', error);
      toast({ title: 'Error', description: `Failed to stop workflow: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setControllingWorkflows(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflowId);
        return newSet;
      });
    }
  };

  // Admin boss: helper to call backend admin endpoints
  const postAdmin = async (path: string, body: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    const res = await fetch(`${api.baseUrl}/admin/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || '',
        'x-user-role': 'admin'
      },
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false || json?.error) {
      throw new Error(json?.error || `Admin API ${path} failed`);
    }
    return json;
  };

  const publishAdminCommand = async (targetUserId: string, workflowName: string, command: 'maintenanceOn'|'maintenanceOff'|'showBanner'|'forceReload', message?: string) => {
    await postAdmin('commands', { user_id: targetUserId, workflow_name: workflowName, command, message });
  };

  const upsertBannerOverride = async (targetUserId: string, workflowName: string, message: string | null) => {
    await postAdmin('overrides', {
      user_id: targetUserId,
      workflow_name: workflowName,
      banner: message ? { title: 'Notice', message, level: 'info' } : null
    });
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    denied: requests.filter(r => r.status === 'denied').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Manage workflow access requests and user permissions</p>
        </div>



        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Requests</p>
                  <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Denied</p>
                  <p className="text-3xl font-bold text-red-600">{stats.denied}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Access Requests
              </button>
              <button
                onClick={() => setActiveTab('workflows')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'workflows'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active Workflows
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('control-requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'control-requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Workflow Control Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Filters */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by workflow, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={statusFilter === 'denied' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('denied')}
                >
                  Denied
                </Button>
                <div className="ml-auto" />
                <Button size="sm" onClick={() => setShowDirectMessage(true)}>
                  Open Direct Messages
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Broadcast Message */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle>Broadcast Message to Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <Label htmlFor="broadcastTitle">Title</Label>
                <Input id="broadcastTitle" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="broadcastMessage">Message</Label>
                <Textarea id="broadcastMessage" value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} rows={3} className="mt-1" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleTestNotification} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                Test Notification
              </Button>
              <Button onClick={handleSendBroadcast} disabled={isBroadcasting} className="bg-blue-600 hover:bg-blue-700">
                {isBroadcasting ? 'Sending...' : 'Send Broadcast'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Access Requests List */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle>Workflow Access Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-slate-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No access requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-slate-800">{request.workflow_name}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                          {getRequestTypeBadge(request)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{request.user_email || request.contact_email || 'No email'}</span>
                          </div>

                          {request.company_name && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{request.company_name}</span>
                            </div>
                          )}

                          {request.contact_name && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{request.contact_name}</span>
                            </div>
                          )}

                          {request.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{request.phone_number}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {format(new Date(request.requested_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>

                        {request.use_case && (
                          <div className="mt-3">
                            <p className="text-sm text-slate-600">
                              <strong>Use Case:</strong> {request.use_case}
                            </p>
                          </div>
                        )}

                        {request.additional_requirements && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-slate-700 mb-2">Additional Requirements</p>
                            <RenderAdditionalRequirements raw={request.additional_requirements} />
                            {!parseAdditionalRequirements(request.additional_requirements) && (
                              <p className="text-sm text-slate-600 break-words">{request.additional_requirements}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processingRequests.has(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingRequests.has(request.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            {processingRequests.has(request.id) ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeny(request.id)}
                            disabled={processingRequests.has(request.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            {processingRequests.has(request.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-1"></div>
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            {processingRequests.has(request.id) ? 'Processing...' : 'Deny'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openMessageModal(request)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow Approval Modal */}
        {showActivationForm && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Approve Workflow Access</h2>
                    <p className="text-gray-600 mt-1">Review and approve access for</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-gray-900">{selectedRequest.workflow_name}</span>
                      {isCustomWorkflowRequest(selectedRequest) && (
                        <Badge className="bg-purple-100 text-purple-800">Custom Request</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowActivationForm(false);
                      setSelectedRequest(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </Button>
                </div>

                {/* Request Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Request Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>User:</strong> {selectedRequest.user_email || selectedRequest.contact_email}</div>
                    {selectedRequest.contact_name && <div><strong>Contact Name:</strong> {selectedRequest.contact_name}</div>}
                    {selectedRequest.company_name && <div><strong>Company:</strong> {selectedRequest.company_name}</div>}
                    {selectedRequest.phone_number && <div><strong>Phone:</strong> {selectedRequest.phone_number}</div>}
                    {selectedRequest.position_title && <div><strong>Position:</strong> {selectedRequest.position_title}</div>}
                    {selectedRequest.use_case && <div><strong>Use Case:</strong> {selectedRequest.use_case}</div>}
                    {selectedRequest.budget_range && <div><strong>Budget:</strong> {selectedRequest.budget_range}</div>}
                    {selectedRequest.timeline && <div><strong>Timeline:</strong> {selectedRequest.timeline}</div>}
                    {selectedRequest.additional_requirements && (
                      <div>
                        <div className="font-medium mb-1">Requirements</div>
                        <RenderAdditionalRequirements raw={selectedRequest.additional_requirements} />
                        {!parseAdditionalRequirements(selectedRequest.additional_requirements) && (
                          <div className="text-sm text-gray-700 break-words">{selectedRequest.additional_requirements}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Options */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Options</h3>

                    {/* Quick Approve */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 mb-1">Quick Approve</h4>
                          <p className="text-green-800 text-sm mb-3">
                            Approve immediately and grant access. User will be notified and can start using the workflow.
                          </p>
                          <Button
                            onClick={handleQuickApprove}
                            disabled={processingRequests.has(selectedRequest.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingRequests.has(selectedRequest.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Request More Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-1">Request More Information</h4>
                          <p className="text-blue-800 text-sm mb-3">
                            Ask the user for additional details needed for n8n configuration (API keys, credentials, etc.)
                          </p>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="infoRequest">What information do you need?</Label>
                              <Textarea
                                id="infoRequest"
                                value={activationData.notes}
                                onChange={(e) => setActivationData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="e.g., Please provide your Gmail API credentials, WhatsApp Business API token, or any other required configuration details..."
                                rows={3}
                              />
                            </div>
                            <Button
                              onClick={handleRequestMoreInfo}
                              disabled={processingRequests.has(selectedRequest.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {processingRequests.has(selectedRequest.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Request Information
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Manual Configuration */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Settings className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-900 mb-1">Manual Configuration</h4>
                          <p className="text-orange-800 text-sm mb-3">
                            Add configuration details manually (for advanced users)
                          </p>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="manualConfig">Configuration Notes</Label>
                              <Textarea
                                id="manualConfig"
                                value={activationData.configuration}
                                onChange={(e) => setActivationData(prev => ({ ...prev, configuration: e.target.value }))}
                                placeholder="Add any configuration notes, API keys, or setup instructions..."
                                rows={3}
                              />
                            </div>
                            <Button
                              onClick={handleActivationSubmit}
                              disabled={processingRequests.has(selectedRequest.id)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              {processingRequests.has(selectedRequest.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Configuring...
                                </>
                              ) : (
                                <>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Approve with Configuration
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowActivationForm(false);
                        setSelectedRequest(null);
                      }}
                      disabled={processingRequests.has(selectedRequest.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "workflows" && (
          <div className="space-y-6">
            {/* Active Workflows Control */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Active Workflows Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* n8n Configuration */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">n8n Server Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="n8nServerUrl">n8n Server URL</Label>
                  <Input
                    id="n8nServerUrl"
                    value={n8nServerUrl}
                    onChange={(e) => setN8nServerUrl(e.target.value)}
                    placeholder="http://localhost:5678"
                  />
                </div>
                <div>
                  <Label htmlFor="n8nApiKey">n8n API Key</Label>
                  <Input
                    id="n8nApiKey"
                    type="password"
                    value={n8nApiKey}
                    onChange={(e) => setN8nApiKey(e.target.value)}
                    placeholder="Enter your n8n API key"
                  />
                </div>
              </div>
            </div>

            {/* Active Workflows List */}
            {activeWorkflows.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No active workflows found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeWorkflows.map((workflow) => (
                  <div key={workflow.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-slate-800">{workflow.workflow_name}</h3>
                          <Badge
                            variant={
                              workflow.status === 'running' ? 'default' :
                              workflow.status === 'stopped' ? 'secondary' : 'outline'
                            }
                          >
                            {workflow.status === 'running' ? '🟢 Running' :
                             workflow.status === 'stopped' ? '🔴 Stopped' : '⚪ Inactive'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{workflow.user_email}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{workflow.execution_count} executions</span>
                          </div>

                          {workflow.last_execution && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">
                                Last: {format(new Date(workflow.last_execution), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => startWorkflow(workflow.id, workflow.workflow_name, workflow.user_id)}
                          disabled={controllingWorkflows.has(workflow.id) || workflow.status === 'running'}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {controllingWorkflows.has(workflow.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => stopWorkflow(workflow.id, workflow.workflow_name, workflow.user_id)}
                          disabled={controllingWorkflows.has(workflow.id) || workflow.status === 'stopped'}
                          size="sm"
                          variant="destructive"
                        >
                          {controllingWorkflows.has(workflow.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Pause className="w-4 h-4 mr-1" />
                              Stop
                            </>
                          )}
                        </Button>
                      </div>

	                    {/* Admin Controls */}
	                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
	                      <div className="lg:col-span-2 flex gap-2">
	                        <Input
	                          placeholder="Banner message..."
	                          value={bannerInputs[workflow.id] || ''}
	                          onChange={(e) => setBannerInputs(prev => ({ ...prev, [workflow.id]: e.target.value }))}
	                        />
	                        <Button
	                          size="sm"
	                          onClick={async () => {
	                            try {
	                              await publishAdminCommand(workflow.user_id, workflow.workflow_name, 'showBanner', bannerInputs[workflow.id] || '');
	                              await upsertBannerOverride(workflow.user_id, workflow.workflow_name, bannerInputs[workflow.id] || '');
	                              toast({ title: 'Banner shown', description: 'Users will see the banner instantly.' });
	                            } catch (e) {
	                              toast({ title: 'Failed', description: 'Could not show banner', variant: 'destructive' });
	                            }
	                          }}
	                        >Show Banner</Button>
	                        <Button
	                          size="sm"
	                          variant="secondary"
	                          onClick={async () => {
	                            try {
	                              await upsertBannerOverride(workflow.user_id, workflow.workflow_name, null);
	                              setBannerInputs(prev => ({ ...prev, [workflow.id]: '' }));
	                              toast({ title: 'Banner cleared' });
	                            } catch (e) {
	                              toast({ title: 'Failed', description: 'Could not clear banner', variant: 'destructive' });
	                            }
	                          }}
	                        >Clear</Button>
	                      </div>
	                      <div className="flex gap-2 justify-end">
	                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={async () => {
	                          try { await publishAdminCommand(workflow.user_id, workflow.workflow_name, 'maintenanceOn'); toast({ title: 'Maintenance ON' }); } catch { toast({ title: 'Failed', description: 'Could not enable maintenance', variant: 'destructive' }); }
	                        }}>Maintenance On</Button>
	                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={async () => {
	                          try { await publishAdminCommand(workflow.user_id, workflow.workflow_name, 'maintenanceOff'); toast({ title: 'Maintenance OFF' }); } catch { toast({ title: 'Failed', description: 'Could not disable maintenance', variant: 'destructive' }); }
	                        }}>Maintenance Off</Button>
	                        <Button size="sm" variant="outline" onClick={async () => {
	                          try { await publishAdminCommand(workflow.user_id, workflow.workflow_name, 'forceReload'); toast({ title: 'Reload triggered' }); } catch { toast({ title: 'Failed', description: 'Could not force reload', variant: 'destructive' }); }
	                        }}>Force Reload</Button>
	                      </div>
	                    </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User List */}
              <div className="lg:col-span-1">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      All Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {allUsers.length === 0 ? (
                        <p className="text-slate-600 text-center py-4">No users found</p>
                      ) : (
                        allUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              loadUserDetails(user.id);
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedUser?.id === user.id
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {user.full_name || 'Unknown User'}
                                </p>
                                <p className="text-sm text-slate-600 truncate">
                                  {user.email || user.id}
                                </p>
                                {user.role === 'admin' && (
                                  <Badge className="mt-1" variant="secondary">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Details */}
              <div className="lg:col-span-2">
                {selectedUser ? (
                  <div className="space-y-6">
                    {/* User Profile */}
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          User Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                            <p className="text-slate-900">{selectedUser.full_name || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Email</Label>
                            <p className="text-slate-900">{selectedUser.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Phone</Label>
                            <p className="text-slate-900">{selectedUser.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Company</Label>
                            <p className="text-slate-900">{selectedUser.company || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Position</Label>
                            <p className="text-slate-900">{selectedUser.position || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Role</Label>
                            <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                              {selectedUser.role || 'user'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* User's Workflow Requests */}
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Workflow Requests
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userRequests.length === 0 ? (
                          <p className="text-slate-600 text-center py-4">No workflow requests found</p>
                        ) : (
                          <div className="space-y-3">
                            {userRequests.map((request) => (
                              <div key={request.id} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-slate-900">{request.workflow_name}</h4>
                                  <Badge
                                    variant={
                                      request.status === 'approved' ? 'default' :
                                      request.status === 'denied' ? 'destructive' :
                                      'secondary'
                                    }
                                  >
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">
                                  Requested: {format(new Date(request.requested_at), 'MMM dd, yyyy')}
                                </p>
                                {request.company_name && (
                                  <p className="text-sm text-slate-600">Company: {request.company_name}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* User's Approved Workflows */}
                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Approved Workflows
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userSubscriptions.length === 0 || !userSubscriptions[0]?.approved_workflows?.length ? (
                          <p className="text-slate-600 text-center py-4">No approved workflows</p>
                        ) : (
                          <div className="space-y-3">
                            {userSubscriptions[0].approved_workflows.map((workflowSlug: string, index: number) => (
                              <div key={index} className="flex items-center justify-between border border-slate-200 rounded-lg p-4">
                                <div>
                                  <h4 className="font-medium text-slate-900">
                                    {workflowSlug.split('-').map(word =>
                                      word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                  </h4>
                                  <p className="text-sm text-slate-600">Slug: {workflowSlug}</p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeUserWorkflow(selectedUser.id, workflowSlug)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                    <CardContent className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Select a user to view their details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'control-requests' && (
          <div className="space-y-6">
              {/* Workflow Control Requests */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Workflow Control Requests
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Manage user requests to start, stop, or modify their workflows
                  </p>
                </CardHeader>
                <CardContent>
                  {workflowControlRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No workflow control requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workflowControlRequests.map((request) => (
                        <div key={request.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge
                                  variant={
                                    request.request_type === 'start' ? 'default' :
                                    request.request_type === 'stop' ? 'destructive' : 'secondary'
                                  }
                                  className={
                                    request.request_type === 'start' ? 'bg-green-500 hover:bg-green-600' :
                                    request.request_type === 'stop' ? 'bg-red-500 hover:bg-red-600' : ''
                                  }
                                >
                                  {request.request_type.toUpperCase()}
                                </Badge>
                                <Badge
                                  variant={
                                    request.status === 'pending' ? 'outline' :
                                    request.status === 'approved' ? 'default' :
                                    request.status === 'rejected' ? 'destructive' : 'secondary'
                                  }
                                  className={
                                    request.status === 'pending' ? 'text-yellow-600 border-yellow-600' :
                                    request.status === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                                    request.status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''
                                  }
                                >
                                  {request.status.toUpperCase()}
                                </Badge>
                              </div>

                              <h4 className="font-medium text-slate-900 mb-1">
                                {request.workflow_name}
                              </h4>

                              <div className="text-sm text-slate-600 space-y-1">
                                <p><strong>User:</strong> {request.profiles?.full_name || request.profiles?.email || 'Unknown'}</p>
                                <p><strong>Company:</strong> {request.profiles?.company || 'Not specified'}</p>
                                <p><strong>Requested:</strong> {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}</p>
                                <p><strong>Details:</strong> {request.request_details}</p>
                                {request.admin_notes && (
                                  <p><strong>Admin Notes:</strong> {request.admin_notes}</p>
                                )}
                                {request.processed_at && (
                                  <p><strong>Processed:</strong> {format(new Date(request.processed_at), 'MMM dd, yyyy HH:mm')}</p>
                                )}
                              </div>
                            </div>

                            {request.status === 'pending' && (
                              <div className="flex flex-col gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleWorkflowControlRequest(request.id, 'approve')}
                                  disabled={processingControlRequests.has(request.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  {processingControlRequests.has(request.id) ? 'Processing...' : 'Approve'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleWorkflowControlRequest(request.id, 'reject')}
                                  disabled={processingControlRequests.has(request.id)}
                                >
                                  {processingControlRequests.has(request.id) ? 'Processing...' : 'Reject'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}


        {showDirectMessage && (
          <DirectMessageModal isOpen={showDirectMessage} onClose={() => setShowDirectMessage(false)} />
        )}

        {/* Messaging Modal */}
        {showMessageModal && messageRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Message Requester</h3>
                    <p className="text-sm text-gray-600 mt-1">{messageRequest.user_email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setShowMessageModal(false); if (messageChannelToken) { supabase.removeChannel(messageChannelToken); setMessageChannelToken(null); } }}>
                    <X size={18} />
                  </Button>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 mb-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-gray-600">No messages yet. Start the conversation.</p>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                          <div className={`text-[10px] mt-1 ${m.sender_type === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>{format(new Date(m.created_at), 'MMM dd, HH:mm')}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                    {isSending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
