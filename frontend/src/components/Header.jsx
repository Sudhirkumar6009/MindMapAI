import { Brain, Sparkles, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserMenu from './UserMenu';

function Header({ onLogin, onShowHistory, onShowSettings }) {
  const { isAuthenticated, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors duration-300
                       ${isDark 
                         ? 'border-dark-800 bg-dark-900/80 backdrop-blur-xl' 
                         : 'border-dark-200 bg-white/80 backdrop-blur-xl'
                       }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg shadow-primary-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">MindMap AI</h1>
              <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                Transform Text to Knowledge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="hidden sm:inline">Powered by Gemini</span>
            </div>

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
                <UserMenu onShowHistory={onShowHistory} onShowSettings={onShowSettings} />
              ) : (
                <button
                  onClick={onLogin}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 
                           hover:from-primary-500 hover:to-primary-400 rounded-xl font-semibold text-sm 
                           transition-all shadow-lg shadow-primary-500/25 text-white"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default Header;
