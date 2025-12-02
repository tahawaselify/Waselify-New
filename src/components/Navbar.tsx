
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, LogIn, LogOut, Bell, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import ContactModal from "./ContactModal";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";
import { useAuth } from "@/contexts/AuthProvider";
import NotificationPanel from "@/components/NotificationPanel";
import { useMobileOptimization } from "@/hooks/use-mobile";
import { useAccessibilityContext } from "@/lib/accessibility";
import { usePerformance } from "@/lib/performance";
import { ariaLabels } from "@/lib/accessibility";
import MessagesPanel from "@/components/MessagesPanel";
import ProfileIcon from "@/components/ProfileIcon";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { isMobile, isTouchDevice } = useMobileOptimization();
  const { announce } = useAccessibilityContext();
  const { trackInteraction } = usePerformance();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Check if we're on the homepage
  const isHomepage = location.pathname === '/';
  const isMarketplace = location.pathname === '/marketplace';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent background scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';

    // Track interaction and announce to screen readers
    trackInteraction('click', 'mobile-menu-toggle');
    announce(isMenuOpen ? 'Navigation menu closed' : 'Navigation menu opened');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContactPopup(true);

    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  const closeContactPopup = () => {
    setShowContactPopup(false);
  };

  // Check if global services are loaded
  useEffect(() => {
    const checkServices = () => {
      console.log('Navbar: Checking if global services are loaded...');
      setServicesLoaded(true);
    };

    // Check after a short delay to ensure services are initialized
    const timer = setTimeout(checkServices, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check for unread messages on component mount and when messages panel opens
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!user) return;

      try {
        // Get user's requests that have admin messages
        const { data: userRequests } = await supabase
          .from('workflow_access_requests')
          .select('id, workflow_name, status')
          .filter('user_id', 'eq', user.id)
          .eq('status', 'pending');

        if (!userRequests || userRequests.length === 0) {
          setHasUnreadMessages(false);
          setUnreadMessages(0);
          return;
        }

        const requestIds = userRequests.map(r => r.id);

        // Get the latest admin message for each request
        const { data: latestAdminMessages } = await supabase
          .from('workflow_request_messages')
          .select('request_id, created_at')
          .in('request_id', requestIds)
          .eq('sender_type', 'admin')
          .order('created_at', { ascending: false });

        if (!latestAdminMessages || latestAdminMessages.length === 0) {
          setHasUnreadMessages(false);
          setUnreadMessages(0);
          return;
        }

        // Check if user has any pending requests with admin messages after last read
        const lastReadAt = localStorage.getItem('lastMessagesReadAt');
        const hasUnread = userRequests.some(request =>
          latestAdminMessages.some(msg =>
            msg.request_id === request.id &&
            (!lastReadAt || new Date(msg.created_at) > new Date(lastReadAt))
          )
        );

        setHasUnreadMessages(hasUnread);
        setUnreadMessages(hasUnread ? userRequests.length : 0);

        console.log('Navbar: Unread messages check completed', {
          userRequests: userRequests.length,
          adminMessages: latestAdminMessages.length,
          hasUnread
        });
      } catch (error) {
        console.error('Error checking unread messages:', error);
        setHasUnreadMessages(false);
        setUnreadMessages(0);
      }
    };

    checkUnreadMessages();
  }, [user]);

  // Initial unread notifications count
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .filter('user_id', 'eq', user.id)
          .eq('is_read', false);
        if (!error) {
          setUnreadNotifications(count || 0);
        }
      } catch {
        setUnreadNotifications(0);
      }
    };
    fetchUnreadNotifications();
  }, [user]);

  // Listen for new message events from GlobalMessageService
  useEffect(() => {
    const handleNewMessage = async (event: CustomEvent) => {
      if (!user) return;

      console.log('Navbar: New message received, updating unread count');

      // Increment unread count
      setUnreadMessages(prev => prev + 1);
      setHasUnreadMessages(true);
    };

    const handleMessagesPanelOpened = () => {
      console.log('Navbar: Messages panel opened, clearing unread status');
      setUnreadMessages(0);
      setHasUnreadMessages(false);

      // Store the timestamp when user opened messages panel
      localStorage.setItem('lastMessagesReadAt', new Date().toISOString());
    };

    window.addEventListener('newMessageReceived', handleNewMessage as EventListener);
    window.addEventListener('messagesPanelOpened', handleMessagesPanelOpened);

    return () => {
      window.removeEventListener('newMessageReceived', handleNewMessage as EventListener);
      window.removeEventListener('messagesPanelOpened', handleMessagesPanelOpened);
    };
  }, [user]);
  // Listen for notification events from GlobalNotificationService and panel
  useEffect(() => {
    const handleNewNotification = () => {
      setUnreadNotifications(prev => prev + 1);
    };
    const handleNotificationsPanelOpened = () => {
      setUnreadNotifications(0);
      try {
        localStorage.setItem('lastNotificationsReadAt', new Date().toISOString());
      } catch {}
    };
    window.addEventListener('newNotificationReceived', handleNewNotification as EventListener);
    window.addEventListener('notificationsPanelOpened', handleNotificationsPanelOpened);
    return () => {
      window.removeEventListener('newNotificationReceived', handleNewNotification as EventListener);
      window.removeEventListener('notificationsPanelOpened', handleNotificationsPanelOpened);
    };
  }, []);


  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUnreadCountChange = (count: number) => {
    console.log('Navbar: handleUnreadCountChange called with count:', count);
    setUnreadMessages(count);
    setHasUnreadMessages(count > 0);
  };



  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        {t('nav.skip')}
      </a>

      <header
        key={i18n.language} // Force re-render when language changes
        className={cn(
          "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 bg-white shadow-sm border-b border-gray-200 transition-all duration-300"
        )}
        role="banner"
        aria-label={ariaLabels.nav.main}
        dir="ltr"
        style={{ direction: 'ltr', unicodeBidi: 'isolate' as any }}
      >
        <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center"
            aria-label="Waselify"
          >
            <img
              src="/logo.png"
              alt="Waselify Logo"
              className="h-12 sm:h-16 w-auto"
            />
          </button>

          {/* Desktop Navigation */}
          <nav className={"hidden md:flex items-center gap-8"}>
            <a
              href="/"
              className="nav-link"
            >
              {t('nav.home')}
            </a>
            {/* Show Services and Contact on homepage OR when user is not logged in */}
            {(isHomepage || !user) && (
              <>
                <a href="/marketplace" className="nav-link">{t('nav.marketplace', 'Marketplace')}</a>
                <a
                  href="#"
                  className="nav-link"
                  onClick={handleContactClick}
                >
                  {t('nav.contact')}
                </a>
              </>
            )}

            {/* Messages - show when logged in, hide on homepage and login */}
            {user && !isHomepage && location.pathname !== '/login' && (
              <div className="flex items-center gap-2">
                <button
                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                  onClick={() => setShowMessages(true)}
                  aria-label="Messages"
                >
                  <MessageSquare size={18} className="text-gray-700" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] leading-4 rounded-full px-1.5 min-w-[16px] text-center">
                      {unreadMessages}
                    </span>
                  )}
                  {hasUnreadMessages && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </button>

              </div>
            )}

            {/* Notifications - show when logged in, hide on homepage and login */}
            {user && !isHomepage && location.pathname !== '/login' && (
              <button
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                onClick={() => { setShowNotifications(true); setUnreadNotifications(0); try { localStorage.setItem('lastNotificationsReadAt', new Date().toISOString()); } catch (e) {} }}
                aria-label="Notifications"
              >
                <Bell size={18} className="text-gray-700" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-4 rounded-full px-1.5 min-w-[16px] text-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            )}

            {/* Currency Switcher - Only show on marketplace page */}
            {isMarketplace && <CurrencySwitcher />}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Login Button - Show on homepage OR when user is not logged in */}
            {(isHomepage || !user) && (
              <a
                href="/login"
                className={`flex items-center space-x-2 bg-waselify-500 text-white px-4 py-2 rounded-lg hover:bg-waselify-600 transition-colors duration-200`}
              >
                <LogIn size={16} />
                <span>{t('nav.clientLogin')}</span>
              </a>
            )}

            {/* Profile Icon - Show when logged in, hide on homepage and login */}
            {user && !isHomepage && location.pathname !== '/login' && (
              <ProfileIcon user={user} />
            )}
          </nav>

          {/* Mobile menu button - increased touch target */}
          <button
            className="md:hidden text-gray-700 p-3 focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation - improved for better touch experience */}
        <div className={cn(
          "fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
          isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )} dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate' as any }}>
          <nav className={`flex flex-col space-y-6 items-center mt-8`} dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate' as any }}>
            <a
              href="/"
              className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
              onClick={() => {
                setIsMenuOpen(false);
                document.body.style.overflow = '';
              }}
            >
              {t('nav.home')}
            </a>
            {/* Show Marketplace, Services, Get Started, and Contact on homepage OR when user is not logged in */}
            {(isHomepage || !user) && (
              <>
                <a
                  href="/marketplace"
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                >
                  {t('nav.marketplace', 'Marketplace')}
                </a>
                <a
                  href={isHomepage ? "#features" : "/#features"}
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                >
                  {t('nav.services')}
                </a>
                <a
                  href="#details"
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                >
                  {t('nav.getStarted')}
                </a>
                <a
                  href="#"
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
                  onClick={(e) => {
                    handleContactClick(e);
                  }}
                >
                  {t('nav.contact')}
                </a>
              </>
            )}

            {/* Currency Switcher for Mobile - Only show on marketplace page */}
            {isMarketplace && (
              <div className="w-full flex justify-center mb-4">
                <CurrencySwitcher />
              </div>
            )}

            {/* Language Switcher for Mobile */}
            <div className="w-full flex justify-center">
              <LanguageSwitcher />
            </div>

            {/* Mobile Login Button - Show on homepage OR when user is not logged in */}
            {(isHomepage || !user) && (
              <a
                href="/login"
                className={`flex items-center justify-center space-x-2 bg-waselify-500 text-white px-6 py-3 rounded-lg hover:bg-waselify-600 transition-colors duration-200 w-full`}
              >
                <LogIn size={18} />
                <span>{t('nav.clientLogin')}</span>
              </a>
            )}

            {/* Mobile Profile Icon - Show when logged in, hide on homepage and login */}
            {user && !isHomepage && location.pathname !== '/login' && (
              <div className="w-full flex justify-center">
                <ProfileIcon user={user} />
              </div>
            )}
          </nav>
        </div>
      </header>

            <ContactModal isOpen={showContactPopup} onClose={closeContactPopup} title={t('contact.title')} />
            <NotificationPanel
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNotificationUpdate={(count) => setUnreadNotifications(count)}
            />
            <MessagesPanel
              isOpen={showMessages}
              onClose={() => setShowMessages(false)}
              onUnreadCountChange={handleUnreadCountChange}
            />
    </>
  );
};

export default Navbar;
