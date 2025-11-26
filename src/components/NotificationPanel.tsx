import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationPanel = ({ isOpen, onClose, onNotificationUpdate }: {
  isOpen: boolean;
  onClose: () => void;
  onNotificationUpdate?: (unreadCount: number) => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  // Announce when the notifications panel opens (for Navbar to clear badge)
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsPanelOpened'));
    }
  }, [isOpen]);

  // Load notifications from Supabase
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found for notifications');
          // Show empty state instead of mock data
          setNotifications([]);
          setIsLoading(false);
          return;
        }

        console.log('Loading notifications for user:', user.id);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .filter('user_id', 'eq', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error loading notifications:', error);
          // Show empty state instead of mock data on error
          setNotifications([]);
          setIsLoading(false);
          return;
        }

        console.log('Notifications loaded:', data?.length || 0);
        // Transform data to match our interface
        const transformedNotifications: Notification[] = data?.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: formatTimestamp(notification.created_at),
          read: notification.is_read
        })) || [];

        // If no notifications found, show empty state
        if (transformedNotifications.length === 0) {
          console.log('No notifications found, showing empty state');
          setNotifications([]);
        } else {
          setNotifications(transformedNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Show empty state on error
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [isOpen]);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return t('notifications.time.justNow');
    if (diffInHours < 24) return t('notifications.time.hoursAgo', { count: diffInHours });
    if (diffInHours < 48) return t('notifications.time.dayAgo');
    return t('notifications.time.daysAgo', { count: Math.floor(diffInHours / 24) });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'info':
        return <Info size={16} className="text-blue-600" />;
      default:
        return <Info size={16} className="text-gray-600" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Check if we have sample notifications
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      if (notification.id.startsWith('sample-')) {
        // Just update local state for sample notifications
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update notification in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .filter('user_id', 'eq', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Check if we have sample notifications
      const hasSampleNotifications = notifications.some(n => n.id.startsWith('sample-'));

      if (hasSampleNotifications) {
        // Just update local state for sample notifications
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update all unread notifications in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .filter('user_id', 'eq', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Notify parent component when unread count changes
  useEffect(() => {
    if (onNotificationUpdate) {
      onNotificationUpdate(unreadCount);
    }
  }, [unreadCount, onNotificationUpdate]);

  // Realtime subscription with toast notifications
  useEffect(() => {
    let channel: any;
    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`notif-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}::uuid`
        }, (payload: any) => {
          const n = payload.new;
          const newNotification = {
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: formatTimestamp(n.created_at),
            read: n.is_read
          };

          // Add to notifications list only if panel is open
          if (isOpen) {
            setNotifications(prev => [newNotification, ...prev]);
          }

          // Update notifications list if panel is open
          if (isOpen) {
            setNotifications(prev => [newNotification, ...prev]);
          }
        })
        .subscribe();
    };
    subscribe();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [toast, lastNotificationId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="relative w-full max-w-md bg-white shadow-xl border-l border-gray-200 h-full max-h-[calc(100vh-4rem)] overflow-hidden" data-notifications-panel="open">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('notifications.title')}
            </h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('notifications.markAllRead')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-waselify-500 mx-auto mb-4"></div>
                <p className="text-gray-500">{t('notifications.loading')}</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell size={48} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('notifications.noNotifications')}
              </h3>
              <p className="text-gray-500">
                {t('notifications.noNotificationsDesc')}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <Badge className={`text-xs ${getNotificationBadgeColor(notification.type)}`}>
                            {t(`notifications.type.${notification.type}`)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{notification.timestamp}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;