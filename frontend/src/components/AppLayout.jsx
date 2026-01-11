import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import api from '../api';
import { 
  Sun, 
  Moon, 
  Bell, 
  LayoutDashboard, 
  Wand2, 
  Move, 
  Clock, 
  User, 
  Settings,
  Check,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Network
} from 'lucide-react';

/**
 * AppLayout - Wraps authenticated pages with sidebar navigation
 */
function AppLayout({ children }) {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingNotifications(true);
      const response = await api.getNotifications(1, 20);
      if (response.success) {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Route to page info mapping
  const getPageInfo = () => {
    const path = location.pathname;
    
    const pageMap = {
      '/dashboard': { label: 'Dashboard', icon: LayoutDashboard, description: 'Overview of your activity' },
      '/create': { label: 'AI Generate', icon: Wand2, description: 'Create graphs from text or docs' },
      '/graphs': { label: 'Custom Build', icon: Move, description: 'Your custom graphs' },
      '/graphs/new': { label: 'Graph Builder', icon: Move, description: 'Drag & drop graph builder' },
      '/graphs/builder': { label: 'Graph Builder', icon: Move, description: 'Drag & drop graph builder' },
      '/history': { label: 'History', icon: Clock, description: 'Your generation history' },
      '/profile': { label: 'Profile', icon: User, description: 'Your profile settings' },
      '/settings': { label: 'Settings', icon: Settings, description: 'Application settings' },
    };

    // Check for dynamic routes like /graphs/:id
    if (path.startsWith('/graphs/') && path !== '/graphs/new' && path !== '/graphs/builder') {
      return { label: 'Edit Graph', icon: Move, description: 'Edit your graph' };
    }

    return pageMap[path] || { label: 'MindMap AI', icon: LayoutDashboard, description: '' };
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'graph':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'welcome':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Network className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-emerald-500" />;
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const removeNotification = async (id) => {
    try {
      await api.deleteNotification(id);
      const notification = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    if (notification.link) {
      navigate(notification.link);
      setShowNotifications(false);
    }
  };

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden flex flex-col">
        {/* Mobile header spacer */}
        <div className="h-16 lg:hidden" />
        
        {/* Top Header Bar */}
        <header className={`sticky top-0 z-30 px-4 lg:px-6 py-3 border-b backdrop-blur-xl
          ${isDark 
            ? 'bg-dark-900/80 border-dark-800' 
            : 'bg-white/80 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Left: Current Tab Name */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors
                ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}
              >
                <PageIcon className={`w-5 h-5 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
              </div>
              <div>
                <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {pageInfo.label}
                </h1>
                {pageInfo.description && (
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {pageInfo.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Notifications & Theme Toggle */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-xl border-2 transition-all duration-300
                    ${isDark
                      ? 'bg-dark-800 border-dark-700 hover:border-dark-600 text-gray-400 hover:text-white'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                    }
                    ${showNotifications 
                      ? isDark ? 'border-primary-500 text-primary-400' : 'border-primary-500 text-primary-600'
                      : ''
                    }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs 
                      font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-xl border-2 shadow-2xl overflow-hidden z-50
                    ${isDark 
                      ? 'bg-dark-900 border-dark-700' 
                      : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b
                      ${isDark ? 'border-dark-700' : 'border-gray-200'}`}
                    >
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className={`text-xs px-2 py-1 rounded-md transition-colors
                              ${isDark 
                                ? 'text-primary-400 hover:bg-dark-700' 
                                : 'text-primary-600 hover:bg-gray-100'
                              }`}
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className={`text-xs px-2 py-1 rounded-md transition-colors
                              ${isDark 
                                ? 'text-red-400 hover:bg-dark-700' 
                                : 'text-red-600 hover:bg-gray-100'
                              }`}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className={`px-4 py-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                          <p className="text-sm">Loading...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className={`px-4 py-8 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`group px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer
                              ${isDark 
                                ? `border-dark-700 ${notification.read ? 'bg-dark-900' : 'bg-dark-800/50'}` 
                                : `border-gray-100 ${notification.read ? 'bg-white' : 'bg-primary-50/30'}`
                              }
                              hover:${isDark ? 'bg-dark-800' : 'bg-gray-50'}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0
                                ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className={`text-sm font-medium truncate
                                    ${isDark ? 'text-white' : 'text-gray-900'}`}
                                  >
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className={`text-xs mt-0.5 line-clamp-2
                                  ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                >
                                  {notification.message}
                                </p>
                                <span className={`text-[10px] mt-1 block
                                  ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                                >
                                  {notification.timeAgo || new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification._id);
                                }}
                                className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0
                                  ${isDark 
                                    ? 'hover:bg-dark-700 text-gray-500 hover:text-red-400' 
                                    : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'
                                  }`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl border-2 transition-all duration-300
                  ${isDark
                    ? 'bg-dark-800 border-dark-700 hover:border-dark-600 text-yellow-400'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
