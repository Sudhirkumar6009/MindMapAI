import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Brain, 
  LayoutDashboard, 
  Plus, 
  FolderOpen, 
  Clock, 
  Settings, 
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Navigation items configuration
const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/create', icon: Plus, label: 'Create' },
  { path: '/graphs', icon: FolderOpen, label: 'My Graphs' },
  { path: '/history', icon: Clock, label: 'History' },
];

const bottomNavItems = [
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Debug: Log when component renders and user changes
  console.log('🎨 Sidebar RENDER - user.avatar:', user?.avatar ? `exists (${user.avatar.substring(0, 50)}...)` : 'undefined');
  
  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : true; // Default to collapsed
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // The sidebar shows expanded when hovered OR when not set to collapse mode
  const showExpanded = isHovered || !isCollapsed;

  // Handle mouse enter with slight delay for smoother feel
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsHovered(true);
  };

  // Handle mouse leave with delay to prevent flickering
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsHovered(false);
    }, 300); // Small delay before collapsing
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleLogout = () => {
    logout();
  };

  // Nav Item Component
  const NavItem = ({ item, showLabel = true }) => (
    <Link
      to={item.path}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl 
        transition-all duration-300 ease-out
        ${isActive(item.path)
          ? isDark 
            ? 'bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/10' 
            : 'bg-primary-50 text-primary-600 shadow-md shadow-primary-500/10'
          : isDark
            ? 'text-gray-400 hover:text-white hover:bg-gray-800/80'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      title={!showLabel ? item.label : undefined}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ease-out
        ${isActive(item.path) ? 'scale-100' : 'group-hover:scale-110 group-hover:text-primary-500'}`} 
      />
      <span 
        className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ease-out
          ${showLabel ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden'}`}
      >
        {item.label}
      </span>
      {isActive(item.path) && (
        <div className={`w-1.5 h-1.5 rounded-full bg-primary-500 transition-all duration-300 ease-out
          ${showLabel ? 'ml-auto opacity-100' : 'absolute right-2 opacity-100'}`} 
        />
      )}
    </Link>
  );

  // Sidebar Content
  const SidebarContent = ({ mobile = false }) => {
    // For mobile, always show expanded. For desktop, use showExpanded
    const expanded = mobile || showExpanded;
    
    return (
    <div className={`flex flex-col h-full transition-all duration-300 ease-out ${mobile ? 'p-4' : expanded ? 'p-5' : 'p-3'}`}>
      {/* Logo Section */}
      <div className={`flex items-center gap-3 mb-6 transition-all duration-300 ease-out ${!expanded ? 'justify-center' : ''}`}>
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg shadow-primary-500/25 flex-shrink-0 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-primary-500/30">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div 
            className={`transition-all duration-300 ease-out overflow-hidden
              ${expanded ? 'opacity-100 translate-x-0 max-w-[150px]' : 'opacity-0 -translate-x-4 max-w-0'}`}
          >
            <h1 className="text-lg font-bold gradient-text whitespace-nowrap">MindMap AI</h1>
            <p className={`text-xs whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              AI-Powered Graphs
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-hidden">
        <div 
          className={`mb-3 transition-all duration-300 ease-out overflow-hidden
            ${!expanded ? 'opacity-0 max-h-0' : 'opacity-100 max-h-10'}`}
        >
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3
            ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Menu
          </p>
        </div>
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} showLabel={expanded} />
        ))}
      </nav>

      {/* Divider */}
      <div className={`my-4 border-t transition-opacity duration-300 ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />

      {/* Bottom Navigation */}
      <div className="space-y-1.5 overflow-hidden">
        <div 
          className={`transition-all duration-300 ease-out overflow-hidden
            ${expanded ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0'}`}
        >
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 px-3
            ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Account
          </p>
        </div>
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} showLabel={expanded} />
        ))}
      </div>

      {/* Theme Toggle */}
      <div className={`mt-4 transition-all duration-300 ease-out ${!expanded ? 'flex justify-center' : ''}`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-300 ease-out
            ${isDark
              ? 'text-yellow-400 hover:bg-gray-800/80 hover:shadow-lg hover:shadow-yellow-500/10'
              : 'text-gray-600 hover:bg-gray-100 hover:shadow-md'
            }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5 flex-shrink-0 transition-transform duration-300 hover:rotate-12" /> : <Moon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 hover:-rotate-12" />}
          <span 
            className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ease-out
              ${expanded ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-3 w-0 overflow-hidden'}`}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>

      {/* User Section */}
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        {expanded ? (
          <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 
                              flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`mt-3 flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium
                text-red-400 hover:bg-red-500/10 transition-colors`}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 
                            flex items-center justify-center text-white text-sm font-medium">
                {getInitials(user?.name)}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pin/Unpin Button (Desktop Only) */}
      {!mobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl 
            transition-all duration-200 border
            ${isDark
              ? 'border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/80'
              : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          title={isCollapsed ? 'Pin sidebar open' : 'Unpin sidebar (collapse on mouse leave)'}
        >
          {expanded ? (
            <>
              {isCollapsed ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm font-medium">Pin Open</span>
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Auto Collapse</span>
                </>
              )}
            </>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`fixed top-4 left-4 z-50 p-2.5 rounded-xl border-2 lg:hidden transition-all
          ${isDark
            ? 'bg-dark-900 border-dark-700 text-white'
            : 'bg-white border-gray-200 text-gray-900'
          } shadow-lg`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDark ? 'bg-dark-900' : 'bg-white'} shadow-2xl`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors
            ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
        >
          <X className="w-5 h-5" />
        </button>
        
        <SidebarContent mobile />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:flex flex-col h-screen sticky top-0 border-r overflow-hidden
          transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${showExpanded ? 'w-64 shadow-xl' : 'w-[72px] shadow-md'}
          ${isDark ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

export default Sidebar;
