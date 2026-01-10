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

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors duration-300
                       ${isDark 
                         ? 'border-dark-800 bg-dark-900/80 backdrop-blur-xl' 
                         : 'border-dark-200 bg-white/80 backdrop-blur-xl'
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

            {/* Navigation Links for authenticated users */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1 ml-6">
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive('/dashboard')
                      ? 'bg-primary-500/20 text-primary-500'
                      : isDark 
                        ? 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                        : 'text-dark-600 hover:text-dark-800 hover:bg-dark-100'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/create"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive('/create')
                      ? 'bg-primary-500/20 text-primary-500'
                      : isDark 
                        ? 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                        : 'text-dark-600 hover:text-dark-800 hover:bg-dark-100'
                    }`}
                >
                  <Plus className="w-4 h-4" />
                  Create
                </Link>
                <Link
                  to="/graphs"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive('/graphs')
                      ? 'bg-primary-500/20 text-primary-500'
                      : isDark 
                        ? 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                        : 'text-dark-600 hover:text-dark-800 hover:bg-dark-100'
                    }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  Graphs
                </Link>
                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive('/history')
                      ? 'bg-primary-500/20 text-primary-500'
                      : isDark 
                        ? 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                        : 'text-dark-600 hover:text-dark-800 hover:bg-dark-100'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  History
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive('/settings')
                      ? 'bg-primary-500/20 text-primary-500'
                      : isDark 
                        ? 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                        : 'text-dark-600 hover:text-dark-800 hover:bg-dark-100'
                    }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </nav>
            )}
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
  );
}
export default Header;
