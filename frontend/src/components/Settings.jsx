import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Layout,
  Bell,
  Shield,
  Save,
  RotateCcw,
  ChevronRight,
  Camera,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// Tab Button Component
const TabButton = ({ icon: Icon, label, isActive, onClick }) => {
  const { isDark } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-200
        ${isActive
          ? isDark
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          : isDark
            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
    </button>
  );
};

// Toggle Switch Component
const Toggle = ({ checked, onChange, disabled = false }) => {
  return (
    <button
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
const Select = ({ value, onChange, options, disabled = false }) => {
  const { isDark } = useTheme();
  
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
const SettingRow = ({ label, description, children }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex items-center justify-between py-4">
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

// Main Settings Component
function Settings({ onClose }) {
  const { isDark, setIsDark } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profession: '',
    organization: '',
    avatar: null
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    theme: 'system',
    defaultLayout: 'dagre',
    defaultNodeStyle: 'standard',
    defaultPalette: 'academic',
    autoSaveHistory: true,
    emailNotifications: true,
    showTutorials: true
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Delete account state
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        api.getProfile(),
        api.getSettings()
      ]);
      
      if (profileRes.success) {
        setProfile({
          name: profileRes.profile.name || '',
          email: profileRes.profile.email || '',
          bio: profileRes.profile.bio || '',
          profession: profileRes.profile.profession || '',
          organization: profileRes.profile.organization || '',
          avatar: profileRes.profile.avatar
        });
      }
      
      if (settingsRes.success) {
        setSettings(settingsRes.settings);
      }
    } catch (err) {
      console.error('Load settings error:', err);
      showMessage('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.updateProfile({
        name: profile.name,
        bio: profile.bio,
        profession: profile.profession,
        organization: profile.organization
      });
      
      if (response.success) {
        showMessage('Profile updated successfully');
      }
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await api.updateSettings(settings);
      
      if (response.success) {
        showMessage('Settings saved successfully');
        
        // Apply theme immediately
        if (settings.theme === 'dark') {
          setIsDark(true);
        } else if (settings.theme === 'light') {
          setIsDark(false);
        }
      }
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    setSaving(true);
    try {
      const response = await api.resetSettings();
      
      if (response.success) {
        setSettings(response.settings);
        showMessage('Settings reset to defaults');
      }
    } catch (err) {
      showMessage('Failed to reset settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showMessage('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.new.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const response = await api.updatePassword(passwordData.current, passwordData.new);
      
      if (response.success) {
        showMessage('Password changed successfully');
        setPasswordData({ current: '', new: '', confirm: '' });
      }
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== profile.email) {
      showMessage('Email does not match', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const response = await api.deleteAccount(deleteConfirmEmail);
      
      if (response.success) {
        logout();
        onClose?.();
      }
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to delete account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const response = await api.updateAvatar(event.target.result);
        if (response.success) {
          setProfile(prev => ({ ...prev, avatar: response.avatar || event.target.result }));
          // Sync avatar to global user state so it reflects everywhere
          if (updateUser) {
            updateUser({ avatar: response.avatar || event.target.result });
          }
          showMessage('Avatar updated');
        }
      } catch (err) {
        showMessage('Failed to update avatar', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'preferences', icon: Layout, label: 'Preferences' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' }
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

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2
          ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
          {message.type === 'error' ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Content */}
          <div className={`lg:col-span-3 p-6 rounded-2xl border
            ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Profile Information
                </h2>
                
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden
                      ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full cursor-pointer hover:bg-emerald-600">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{profile.email}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                        ${isDark
                          ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className={`w-full px-4 py-2.5 rounded-xl border resize-none transition-colors
                        ${isDark
                          ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500'}`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Profession
                      </label>
                      <input
                        type="text"
                        value={profile.profession}
                        onChange={(e) => setProfile(prev => ({ ...prev, profession: e.target.value }))}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                          ${isDark
                            ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500'}`}
                        placeholder="e.g., Student, Researcher"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Organization
                      </label>
                      <input
                        type="text"
                        value={profile.organization}
                        onChange={(e) => setProfile(prev => ({ ...prev, organization: e.target.value }))}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                          ${isDark
                            ? 'bg-gray-900 border-gray-700 text-white focus:border-emerald-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500'}`}
                        placeholder="e.g., University, Company"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Appearance
                </h2>
                
                <div className="divide-y divide-gray-700">
                  <SettingRow
                    label="Theme"
                    description="Choose your preferred color scheme"
                  >
                    <Select
                      value={settings.theme}
                      onChange={(v) => setSettings(prev => ({ ...prev, theme: v }))}
                      options={themeOptions}
                    />
                  </SettingRow>

                  <SettingRow
                    label="Default Color Palette"
                    description="Color scheme for new graphs"
                  >
                    <Select
                      value={settings.defaultPalette}
                      onChange={(v) => setSettings(prev => ({ ...prev, defaultPalette: v }))}
                      options={paletteOptions}
                    />
                  </SettingRow>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleResetSettings}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border
                      ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Graph Preferences
                </h2>
                
                <div className="divide-y divide-gray-700">
                  <SettingRow
                    label="Default Layout"
                    description="Layout style for new graphs"
                  >
                    <Select
                      value={settings.defaultLayout}
                      onChange={(v) => setSettings(prev => ({ ...prev, defaultLayout: v }))}
                      options={layoutOptions}
                    />
                  </SettingRow>

                  <SettingRow
                    label="Default Node Style"
                    description="Visual style for nodes"
                  >
                    <Select
                      value={settings.defaultNodeStyle}
                      onChange={(v) => setSettings(prev => ({ ...prev, defaultNodeStyle: v }))}
                      options={nodeStyleOptions}
                    />
                  </SettingRow>

                  <SettingRow
                    label="Auto-save to History"
                    description="Automatically save generated graphs"
                  >
                    <Toggle
                      checked={settings.autoSaveHistory}
                      onChange={(v) => setSettings(prev => ({ ...prev, autoSaveHistory: v }))}
                    />
                  </SettingRow>

                  <SettingRow
                    label="Show Tutorials"
                    description="Display helpful tips and guides"
                  >
                    <Toggle
                      checked={settings.showTutorials}
                      onChange={(v) => setSettings(prev => ({ ...prev, showTutorials: v }))}
                    />
                  </SettingRow>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h2>
                
                <div className="divide-y divide-gray-700">
                  <SettingRow
                    label="Email Notifications"
                    description="Receive updates and tips via email"
                  >
                    <Toggle
                      checked={settings.emailNotifications}
                      onChange={(v) => setSettings(prev => ({ ...prev, emailNotifications: v }))}
                    />
                  </SettingRow>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Security
                </h2>
                
                {/* Change Password */}
                <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Change Password
                  </h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                        placeholder="Current password"
                        className={`w-full px-4 py-2.5 pr-10 rounded-xl border transition-colors
                          ${isDark
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                      placeholder="New password"
                      className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                        ${isDark
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                        ${isDark
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                    className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                  >
                    Update Password
                  </button>
                </div>

                {/* Delete Account */}
                <div className={`p-4 rounded-xl border border-red-500/50 bg-red-500/10`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-500">Delete Account</h3>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        This action is irreversible. All your data will be permanently deleted.
                      </p>
                      
                      {showDeleteConfirm ? (
                        <div className="mt-4 space-y-3">
                          <input
                            type="email"
                            value={deleteConfirmEmail}
                            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                            placeholder={`Type "${profile.email}" to confirm`}
                            className={`w-full px-4 py-2.5 rounded-xl border
                              ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={saving || deleteConfirmEmail !== profile.email}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
                            >
                              Delete My Account
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteConfirmEmail('');
                              }}
                              className={`px-4 py-2 rounded-xl border
                                ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="mt-4 flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
