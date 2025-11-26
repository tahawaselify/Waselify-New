import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, X, Send, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

type AccessRequest = {
  id: string;
  workflow_name: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requested_at: string;
  request_message?: any;
  additional_requirements?: string;
  workflow_id?: string;
};

type RequestMessage = {
  id: string;
  request_id: string;
  sender_id: string | null;
  sender_type: 'admin' | 'client';
  content: string;
  created_at: string;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString();
};

const MessagesPanel = ({ isOpen, onClose, onUnreadCountChange }: { 
  isOpen: boolean; 
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Clear unread status when panel opens
  useEffect(() => {
    if (isOpen && onUnreadCountChange) {
      console.log('MessagesPanel: Clearing unread count when panel opens');
      onUnreadCountChange(0);
      
      // Also clear the unread status in the parent component
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('messagesPanelOpened'));
      }
    }
  }, [isOpen, onUnreadCountChange]);

  useEffect(() => {
    const load = async () => {
      if (!isOpen) return;
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get requests that have messages from admin
        const { data: requestsWithMessages } = await supabase
          .from('workflow_request_messages')
          .select('request_id')
          .eq('sender_type', 'admin');

        const requestIdsWithMessages = requestsWithMessages?.map(r => r.request_id) || [];

        // Get the actual requests that have messages or are pending
        let reqs;
        if (requestIdsWithMessages.length > 0) {
          const { data } = await supabase
            .from('workflow_access_requests')
            .select('id, workflow_name, status, requested_at, request_message, additional_requirements, workflow_id')
            .filter('user_id', 'eq', user.id)
            .or(`id.in.(${requestIdsWithMessages.join(',')}),status.eq.pending`)
            .order('requested_at', { ascending: false });
          reqs = data;
        } else {
          // If no messages exist, only show pending requests
          const { data } = await supabase
            .from('workflow_access_requests')
            .select('id, workflow_name, status, requested_at, request_message, additional_requirements, workflow_id')
            .filter('user_id', 'eq', user.id)
            .eq('status', 'pending')
            .order('requested_at', { ascending: false });
          reqs = data;
        }
        setRequests((reqs as AccessRequest[]) || []);
        const defaultId = (reqs?.[0]?.id as string) || null;
        setSelectedRequestId(defaultId);

        if (defaultId) {
          await loadMessages(defaultId);
        } else {
          setMessages([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen]);

  const selectedRequest = useMemo(
    () => requests.find(r => r.id === selectedRequestId) || null,
    [requests, selectedRequestId]
  );

  const loadMessages = async (requestId: string) => {
    const { data, error } = await supabase
      .from('workflow_request_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Load messages error', error);
      setMessages([]);
    } else {
      setMessages((data as RequestMessage[]) || []);
    }
  };

  const handleSelect = async (id: string) => {
    setSelectedRequestId(id);
    await loadMessages(id);
    
    // Clear unread status when user selects a conversation
    if (onUnreadCountChange) {
      console.log('MessagesPanel: User selected conversation, clearing unread count');
      onUnreadCountChange(0);
    }
  };

  const [channel, setChannel] = useState<any>(null);

  const sendMessage = async () => {
    if (!selectedRequestId || !newMessage.trim()) return;
    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('workflow_request_messages')
        .insert({
          request_id: selectedRequestId,
          sender_id: user?.id || null,
          sender_type: 'client',
          content: newMessage.trim(),
        })
        .select('*')
        .single();
      if (!error && data) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg.id === data.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, data as RequestMessage];
        });
        setNewMessage('');
        
        // Clear unread status when user sends a message (they're actively engaging)
        if (onUnreadCountChange) {
          console.log('MessagesPanel: User sent message, clearing unread count');
          onUnreadCountChange(0);
          // Also dispatch event to clear in parent
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('messagesPanelOpened'));
          }
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  // Subscribe for real-time updates to the selected thread with toast notifications
  useEffect(() => {
    const subscribe = async () => {
      if (!selectedRequestId) return;
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
      }
      const c = supabase
        .channel(`client-wrm-${selectedRequestId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_request_messages',
          filter: `request_id=eq.${selectedRequestId}`
        }, (payload: any) => {
          const newMessage = payload.new as RequestMessage;
          
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, newMessage];
          });
          
          // Show toast notification for new admin messages
          if (newMessage.sender_type === 'admin' && newMessage.id !== lastMessageId) {
            setLastMessageId(newMessage.id);
            
            // Find the workflow name for the notification
            const workflowName = selectedRequest?.workflow_name || 'Workflow';
            
            const preview = newMessage.content.substring(0, 100) + (newMessage.content.length > 100 ? '...' : '');
            toast({
              title: t('messages.toast.newFromAdminTitle'),
              description: t('messages.toast.newFromAdminDesc', { workflow: workflowName, preview }),
              variant: 'default',
              duration: 5000,
            });
            
            // Play notification sound (optional)
            try {
              const audio = new Audio('/message-sound.mp3');
              audio.volume = 0.3;
              audio.play().catch(() => {
                // Ignore errors if sound can't play
              });
            } catch (error) {
              // Ignore sound errors
            }
          }
        })
        .subscribe();
      setChannel(c);
    };
    subscribe();
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
      }
    };
  }, [selectedRequestId, toast, lastMessageId, selectedRequest]);

  // Update unread count when messages arrive (for badge display)
  useEffect(() => {
    if (unreadCount > 0 && onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

      <div 
        className="relative w-full max-w-3xl bg-white shadow-xl border-l border-gray-200 h-full max-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-3"
        data-messages-panel={isOpen ? 'open' : 'closed'}
      >
        {/* Threads */}
        <div className="border-r border-gray-200 md:col-span-1">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold">{t('messages.title')}</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </Button>
          </div>
          <div className="overflow-y-auto h-full">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">{t('messages.loading')}</div>
            ) : requests.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">{t('messages.noRequests')}</div>
            ) : (
              <div className="p-2 space-y-2">
                {requests.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      r.id === selectedRequestId ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{r.workflow_name}</div>
                        {r.workflow_id === 'custom' && (
                          <div className="text-xs text-blue-600 mt-1">{t('messages.customRequest')}</div>
                        )}
                        {r.status === 'pending' && (
                          <div className="text-xs text-yellow-600 mt-1">{t('messages.awaitingResponse')}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status === 'pending' && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                        <Badge className={`text-xs capitalize ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {t(`messages.status.${r.status}`)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(r.requested_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="md:col-span-2 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            {selectedRequest ? (
              <div>
                <div className="text-sm text-gray-500">{t('messages.workflow')}</div>
                <div className="font-semibold">{selectedRequest.workflow_name}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">{t('messages.selectConversation')}</div>
            )}
            {selectedRequest && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onUnreadCountChange) {
                      console.log('MessagesPanel: User clicked mark as read');
                      onUnreadCountChange(0);
                      // Also dispatch event to clear in parent
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('messagesPanelOpened'));
                      }
                    }
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  {t('messages.markAsRead')}
                </button>

              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-500">{t('messages.noMessagesYet')}</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender_type === 'client' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div className={`text-[10px] mt-1 ${m.sender_type === 'client' ? 'text-blue-100' : 'text-gray-500'}`}>{formatTime(m.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t flex items-center gap-2">
            <Input
              placeholder={t('messages.inputPlaceholder')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()} className="flex items-center gap-2">
              <Send size={16} />
              {t('common.send')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;


