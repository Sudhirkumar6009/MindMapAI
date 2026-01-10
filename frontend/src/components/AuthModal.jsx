import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Brain, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const result = await register(formData.name, formData.email, formData.password);
        if (!result.success) {
          setError(result.error || 'Registration failed');
        } else {
          onClose();
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          setError(result.error || 'Login failed');
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4
                    ${isDark ? 'bg-dark-950/80' : 'bg-dark-900/50'}`}>
      <div className={`rounded-2xl w-full max-w-md border shadow-2xl overflow-hidden
                      ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-dark-200'}`}>
        <div className={`relative p-6 bg-gradient-to-br from-primary-600/20 to-purple-600/20 border-b
                        ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors
                      ${isDark ? 'hover:bg-dark-700' : 'hover:bg-dark-100'}`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                {mode === 'login' 
                  ? 'Sign in to access your mind maps' 
                  : 'Start creating knowledge graphs'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1">
              <label className={`text-sm font-medium ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>Name</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-dark-400'}`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all
                           ${isDark 
                             ? 'bg-dark-700 border-dark-600 text-dark-100 placeholder-dark-500' 
                             : 'bg-dark-50 border-dark-300 text-dark-800 placeholder-dark-400'}`}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className={`text-sm font-medium ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>Email</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-dark-400'}`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className={`w-full pl-11 pr-4 py-2.5 border rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all
                         ${isDark 
                           ? 'bg-dark-700 border-dark-600 text-dark-100 placeholder-dark-500' 
                           : 'bg-dark-50 border-dark-300 text-dark-800 placeholder-dark-400'}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-sm font-medium ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-dark-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`w-full pl-11 pr-11 py-2.5 border rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all
                         ${isDark 
                           ? 'bg-dark-700 border-dark-600 text-dark-100 placeholder-dark-500' 
                           : 'bg-dark-50 border-dark-300 text-dark-800 placeholder-dark-400'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-dark-500 hover:text-dark-300' : 'text-dark-400 hover:text-dark-600'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className={`text-sm font-medium ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>Confirm Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-dark-500' : 'text-dark-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all
                           ${isDark 
                             ? 'bg-dark-700 border-dark-600 text-dark-100 placeholder-dark-500' 
                             : 'bg-dark-50 border-dark-300 text-dark-800 placeholder-dark-400'}`}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 
                     hover:from-primary-500 hover:to-purple-500 rounded-lg font-semibold text-white
                     flex items-center justify-center gap-2 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="px-6 pb-6">
          <p className={`text-center text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
