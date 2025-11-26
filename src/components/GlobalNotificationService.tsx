import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

// Global notification service that runs independently
const GlobalNotificationService = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  // Test toast on component mount (only show once per session)
  useEffect(() => {
    const hasShownToast = sessionStorage.getItem('globalNotificationServiceShown');
    if (!hasShownToast) {
      console.log('GlobalNotificationService: Component mounted, testing toast...');
      // Test toast after a short delay
      setTimeout(() => {
        toast({
          title: t('services.globalNotificationService.title'),
          description: t('services.globalNotificationService.description'),
          variant: 'default',
          duration: 3000,
        });
        sessionStorage.setItem('globalNotificationServiceShown', 'true');
      }, 2000);
    }
  }, [toast]);

  // Global real-time subscription for notifications
  useEffect(() => {
    let channel: any;
    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log('GlobalNotificationService: Setting up subscription for user:', user.id);
      
      channel = supabase
        .channel(`global-notif-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}::uuid`
        }, (payload: any) => {
          const n = payload.new;
          console.log('GlobalNotificationService: New notification received:', n);
          
          // Show toast notification for new notifications (always)
          if (n.id !== lastNotificationId) {
            setLastNotificationId(n.id);
            
            console.log('GlobalNotificationService: Showing toast notification');
            
            // Show toast notification
            toast({
              title: n.title,
              description: n.message,
              variant: n.type === 'error' ? 'destructive' : 'default',
              duration: 5000, // Show for 5 seconds
            });

            // Play notification sound (optional)
            try {
              const audio = new Audio('/notification-sound.mp3');
              audio.volume = 0.3;
              audio.play().catch(() => {
                // Ignore errors if sound can't play
              });
            } catch (error) {
              // Ignore sound errors
            }

            // If the notifications panel is not open, notify Navbar to increment the badge
            const notifPanelOpen = document.querySelector('[data-notifications-panel="open"]');
            if (!notifPanelOpen) {
              window.dispatchEvent(new CustomEvent('newNotificationReceived', { detail: { id: n.id } }));
            } else {
              console.log('GlobalNotificationService: Notification panel is open, not incrementing unread badge');
            }
          }
        })
        .subscribe();
      
      console.log('GlobalNotificationService: Subscription established');
    };
    
    subscribe();
    return () => {
      if (channel) {
        console.log('GlobalNotificationService: Cleaning up subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [toast, lastNotificationId]);

  // This component doesn't render anything
  return null;
};

export default GlobalNotificationService;
