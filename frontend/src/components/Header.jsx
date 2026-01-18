import { Brain, Sparkles, LogIn, Sun, Moon, Home, LayoutDashboard, Settings, Plus, FolderOpen, Clock } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserMenu from './UserMenu';

function Header() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/create', icon: Plus, label: 'Create' },
    { path: '/graphs', icon: FolderOpen, label: 'Graphs' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Main Header */}
      <header className={`border-b fixed top-0 left-0 right-0 z-50 transition-colors duration-300
                         ${isDark 
                           ? 'border-dark-800 bg-dark-900/95 backdrop-blur-xl' 
                           : 'border-dark-200 bg-white/95 backdrop-blur-xl'
                         }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Landing/Dashboard Button */}
              <Link
                to={isAuthenticated ? "/dashboard" : "/"}
                className={`p-2 rounded-xl border-2 transition-all duration-300 hover:scale-105
                          ${isDark
                            ? 'bg-dark-800 border-dark-700 hover:border-dark-600 text-dark-300'
                            : 'bg-white border-dark-200 hover:border-dark-300 text-dark-600'
                          }`}
                title={isAuthenticated ? "Back to Dashboard" : "Back to Home"}
              >
                <Home className="w-5 h-5" />
              </Link>
              
              <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg shadow-primary-500/25">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">MindMap AI</h1>
                  <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                    Transform Text to Knowledge
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl border-2 transition-all duration-300 theme-toggle
                          ${isDark
                            ? 'bg-dark-800 border-dark-700 hover:border-dark-600 text-yellow-400'
                            : 'bg-white border-dark-200 hover:border-dark-300 text-dark-600'
                          }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {!loading && (
                isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 
                             hover:from-primary-500 hover:to-primary-400 rounded-xl font-semibold text-sm 
                             transition-all shadow-lg shadow-primary-500/25 text-white"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Tab Navigation for authenticated users */}
      {isAuthenticated && (
        <nav className={`fixed top-[73px] left-0 right-0 z-40 border-b transition-colors duration-300
                        ${isDark 
                          ? 'border-dark-800 bg-dark-900/95 backdrop-blur-xl' 
                          : 'border-dark-200 bg-white/95 backdrop-blur-xl'
                        }`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${isActive(item.path)
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                      : isDark 
                        ? 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                        : 'text-dark-600 hover:text-dark-800 hover:bg-dark-100'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Spacer for fixed headers */}
      <div className={isAuthenticated ? 'h-[121px]' : 'h-[73px]'} />
    </>
  );
}
export default Header;
