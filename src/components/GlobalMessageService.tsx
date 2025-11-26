import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

// Global message service that runs independently
const GlobalMessageService = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // Global real-time subscription for messages
  useEffect(() => {
    let globalChannel: any;
    const subscribeToAllMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log('GlobalMessageService: Setting up subscription for user:', user.id);
      
      globalChannel = supabase
        .channel(`global-messages-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'workflow_request_messages',
          filter: `sender_type=eq.admin`
        }, async (payload: any) => {
          const newMessage = payload.new;
          console.log('GlobalMessageService: New message received:', newMessage);
          
          // Check if this message is for the current user
          const { data: requestData } = await supabase
            .from('workflow_access_requests')
            .select('user_id, workflow_name')
            .eq('id', newMessage.request_id)
            .single();
          
          console.log('GlobalMessageService: Request data:', requestData);
          
          if (requestData?.user_id === user.id && newMessage.id !== lastMessageId) {
            setLastMessageId(newMessage.id);
            
            console.log('GlobalMessageService: Showing toast notification for message');
            
            const preview = newMessage.content.substring(0, 100) + (newMessage.content.length > 100 ? '...' : '');
            toast({
              title: t('messages.toast.newFromAdminTitle'),
              description: t('messages.toast.newFromAdminDesc', { workflow: requestData.workflow_name, preview }),
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

            // Dispatch custom event to update unread count in Navbar
            // Only if the messages panel is not currently open
            const messagesPanelOpen = document.querySelector('[data-messages-panel="open"]');
            if (!messagesPanelOpen) {
              window.dispatchEvent(new CustomEvent('newMessageReceived', {
                detail: { requestId: newMessage.request_id }
              }));
            } else {
              console.log('GlobalMessageService: Messages panel is open, not incrementing unread count');
            }
          }
        })
        .subscribe();
      
      console.log('GlobalMessageService: Subscription established');
    };
    
    subscribeToAllMessages();
    return () => {
      if (globalChannel) {
        console.log('GlobalMessageService: Cleaning up subscription');
        supabase.removeChannel(globalChannel);
      }
    };
  }, [toast, lastMessageId]);

  // This component doesn't render anything
  return null;
};

export default GlobalMessageService;
