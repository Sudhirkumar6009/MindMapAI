import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  User,
  Mail,
  Camera,
  Briefcase,
  Building,
  FileText,
  Save,
  Loader2,
  ArrowLeft,
  Calendar,
  Network,
  Sparkles,
  GitBranch,
  Crown
} from 'lucide-react';

function ProfilePage() {
  const { isDark } = useTheme();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profession: '',
    organization: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getProfile();
      if (response.success) {
        setProfile(response.profile);
        setFormData({
          name: response.profile.name || '',
          bio: response.profile.bio || '',
          profession: response.profile.profession || '',
          organization: response.profile.organization || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.updateProfile(formData);
      if (response.success) {
        setSuccess('Profile updated successfully');
        if (updateUser) {
          updateUser({ ...user, name: formData.name });
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await api.updateAvatar(reader.result);
        if (response.success) {
          setProfile(prev => ({ ...prev, avatar: reader.result }));
          // Sync avatar to global user state so it reflects everywhere
          if (updateUser) {
            updateUser({ avatar: reader.result });
          }
          setSuccess('Avatar updated successfully');
        }
      } catch (err) {
        setError('Failed to update avatar');
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className={`w-12 h-12 animate-spin ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className={`inline-flex items-center gap-2 text-sm mb-6 transition-colors
            ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className={`lg:col-span-1 p-6 rounded-2xl border h-fit
            ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
            
            {/* Avatar */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials(profile?.name)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-500 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className={`text-xl font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {profile?.name}
            </h2>
            <p className={`text-center text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {profile?.email}
            </p>

            {/* Plan Badge */}
            <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl mb-6
              ${profile?.plan === 'pro' 
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500'
                : profile?.plan === 'enterprise'
                  ? 'bg-gradient-to-r from-green-500/20 to-pink-500/20 text-green-500'
                  : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
              <Crown className="w-4 h-4" />
              <span className="font-medium capitalize">{profile?.plan || 'Free'} Plan</span>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Network className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Graphs</span>
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.stats?.totalGraphs || 0}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Concepts</span>
                </div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.stats?.totalConcepts || 0}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Member Since</span>
                </div>
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className={`lg:col-span-2 p-6 rounded-2xl border
            ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
            
            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Edit Profile
            </h2>

            {/* Messages */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all
                      ${isDark 
                        ? 'bg-dark-800 border-dark-600 text-white focus:border-emerald-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bio
                </label>
                <div className="relative">
                  <FileText className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all resize-none
                      ${isDark 
                        ? 'bg-dark-800 border-dark-600 text-white placeholder-gray-500 focus:border-emerald-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Profession
                  </label>
                  <div className="relative">
                    <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      placeholder="e.g., Student, Researcher"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all
                        ${isDark 
                          ? 'bg-dark-800 border-dark-600 text-white placeholder-gray-500 focus:border-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Organization
                  </label>
                  <div className="relative">
                    <Building className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g., University, Company"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all
                        ${isDark 
                          ? 'bg-dark-800 border-dark-600 text-white placeholder-gray-500 focus:border-emerald-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500'}`}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500
                         text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
    </div>
  );
}

export default ProfilePage;
