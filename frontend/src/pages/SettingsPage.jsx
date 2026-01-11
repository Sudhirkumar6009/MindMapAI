import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  Palette,
  Bell,
  Shield,
  Save,
  Loader2,
  ArrowLeft,
  RotateCcw,
  Check,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// Toggle Switch Component
const Toggle = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200
        ${checked ? 'bg-emerald-500' : 'bg-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );
};

// Select Component
const Select = ({ value, onChange, options, disabled = false, isDark }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors
        ${isDark
          ? 'bg-gray-800 border-gray-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-500'}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

// Setting Row Component
const SettingRow = ({ label, description, children, isDark }) => {
  return (
    <div className={`flex items-center justify-between py-4 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
      <div className="flex-1 mr-4">
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
        {description && (
          <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};

function SettingsPage() {
  const { isDark, setIsDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    theme: 'system',
    defaultLayout: 'dagre',
    defaultNodeStyle: 'standard',
    defaultPalette: 'academic',
    autoSaveHistory: true,
    emailNotifications: true,
    showTutorials: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.getSettings();
      if (response.success) {
        setSettings(prev => ({ ...prev, ...response.settings }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.updateSettings(settings);
      if (response.success) {
        setSuccess('Settings saved successfully');
        
        // Apply theme
        if (settings.theme === 'dark') {
          setIsDark(true);
        } else if (settings.theme === 'light') {
          setIsDark(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await api.resetSettings();
      if (response.success) {
        setSettings(response.settings);
        setSuccess('Settings reset to defaults');
      }
    } catch (err) {
      setError('Failed to reset settings');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user?.email) {
      setError('Email does not match');
      return;
    }

    try {
      await api.deleteAccount(deleteEmail);
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    }
  };

  const themeOptions = [
    { value: 'system', label: 'System Default' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  const layoutOptions = [
    { value: 'dagre', label: 'Auto Layout' },
    { value: 'radial', label: 'Radial' },
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' }
  ];

  const nodeStyleOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'mindmap', label: 'Mind Map' },
    { value: 'flowchart', label: 'Flowchart' },
    { value: 'circle', label: 'Circle' },
    { value: 'hexagon', label: 'Hexagon' }
  ];

  const paletteOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'research', label: 'Research' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'nature', label: 'Nature' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className={`w-12 h-12 animate-spin ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className={`inline-flex items-center gap-2 text-sm mb-6 transition-colors
            ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Customize your MindMap AI experience
            </p>
          </div>
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors
              ${isDark 
                ? 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600' 
                : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'}`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Appearance Section */}
        <div className={`p-6 rounded-2xl border mb-6 ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Appearance
            </h2>
          </div>

          <SettingRow label="Theme" description="Choose your preferred color scheme" isDark={isDark}>
            <div className="flex items-center gap-2">
              {settings.theme === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
              {settings.theme === 'dark' && <Moon className="w-4 h-4 text-emerald-400" />}
              {settings.theme === 'system' && <Monitor className="w-4 h-4 text-gray-400" />}
              <Select
                value={settings.theme}
                onChange={(value) => setSettings({ ...settings, theme: value })}
                options={themeOptions}
                isDark={isDark}
              />
            </div>
          </SettingRow>

          <SettingRow label="Default Layout" description="Auto-select layout for new graphs" isDark={isDark}>
            <Select
              value={settings.defaultLayout}
              onChange={(value) => setSettings({ ...settings, defaultLayout: value })}
              options={layoutOptions}
              isDark={isDark}
            />
          </SettingRow>

          <SettingRow label="Default Node Style" description="Choose default node appearance" isDark={isDark}>
            <Select
              value={settings.defaultNodeStyle}
              onChange={(value) => setSettings({ ...settings, defaultNodeStyle: value })}
              options={nodeStyleOptions}
              isDark={isDark}
            />
          </SettingRow>

          <SettingRow label="Color Palette" description="Default color scheme for graphs" isDark={isDark}>
            <Select
              value={settings.defaultPalette}
              onChange={(value) => setSettings({ ...settings, defaultPalette: value })}
              options={paletteOptions}
              isDark={isDark}
            />
          </SettingRow>
        </div>

        {/* Preferences Section */}
        <div className={`p-6 rounded-2xl border mb-6 ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Preferences
            </h2>
          </div>

          <SettingRow label="Auto-save to History" description="Automatically save generated graphs" isDark={isDark}>
            <Toggle
              checked={settings.autoSaveHistory}
              onChange={(value) => setSettings({ ...settings, autoSaveHistory: value })}
            />
          </SettingRow>

          <SettingRow label="Show Tutorials" description="Display helpful tips and tutorials" isDark={isDark}>
            <Toggle
              checked={settings.showTutorials}
              onChange={(value) => setSettings({ ...settings, showTutorials: value })}
            />
          </SettingRow>
        </div>

        {/* Notifications Section */}
        <div className={`p-6 rounded-2xl border mb-6 ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h2>
          </div>

          <SettingRow label="Email Notifications" description="Receive updates and tips via email" isDark={isDark}>
            <Toggle
              checked={settings.emailNotifications}
              onChange={(value) => setSettings({ ...settings, emailNotifications: value })}
            />
          </SettingRow>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500
                   text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>

        {/* Danger Zone */}
        <div className={`p-6 rounded-2xl border border-red-500/30 ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
          </div>

          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          ) : (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-4 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">This action cannot be undone</span>
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Type <strong>{user?.email}</strong> to confirm:
              </p>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 py-2 rounded-xl border mb-4 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteEmail(''); }}
                  className={`flex-1 py-2 rounded-xl border transition-colors
                    ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteEmail !== user?.email}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

export default SettingsPage;
