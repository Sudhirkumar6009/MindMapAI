import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  History,
  Search,
  FileText,
  FileCode,
  Github,
  Calendar,
  Network,
  GitBranch,
  Trash2,
  Eye,
  ArrowLeft,
  Loader2,
  Filter,
  ChevronDown
} from 'lucide-react';

function HistoryPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.getHistory();
      if (response.success) {
        setHistory(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this graph?')) return;

    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError('Failed to delete graph');
    }
  };

  const handleLoadGraph = (item) => {
    navigate(`/create?loadHistory=${item._id}`);
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case 'pdf': return FileCode;
      case 'github': return Github;
      default: return FileText;
    }
  };

  const getSourceColor = (type) => {
    switch (type) {
      case 'pdf': return 'from-red-500 to-orange-500';
      case 'github': return 'from-gray-600 to-gray-800';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.preview?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.sourceType === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${isDark ? 'text-blue-500' : 'text-blue-600'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className={`inline-flex items-center gap-2 text-sm mb-6 transition-colors
            ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              History
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {history.length} graph{history.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graphs..."
              className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all
                ${isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors
                ${isDark 
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filter: {filterType === 'all' ? 'All' : filterType}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-lg z-10
                ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {['all', 'text', 'pdf', 'github'].map((type) => (
                  <button
                    key={type}
                    onClick={() => { setFilterType(type); setShowFilters(false); }}
                    className={`w-full px-4 py-2 text-left first:rounded-t-xl last:rounded-b-xl transition-colors
                      ${filterType === type 
                        ? 'bg-blue-500/20 text-blue-500' 
                        : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* History List */}
        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const SourceIcon = getSourceIcon(item.sourceType);
              const sourceColor = getSourceColor(item.sourceType);

              return (
                <div
                  key={item._id}
                  className={`p-5 rounded-2xl border transition-all group
                    ${isDark 
                      ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${sourceColor} flex-shrink-0`}>
                      <SourceIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-lg mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <p className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.preview || 'No preview available'}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Network className="w-4 h-4" />
                          <span>{item.conceptCount || 0} concepts</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <GitBranch className="w-4 h-4" />
                          <span>{item.relationshipCount || 0} relationships</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleLoadGraph(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-purple-500 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Open
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className={`p-2 rounded-xl border transition-colors
                          ${isDark 
                            ? 'border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-500' 
                            : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`p-12 rounded-2xl border text-center
            ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
            <History className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {searchQuery || filterType !== 'all' ? 'No matching graphs' : 'No history yet'}
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first mind map to get started'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
              >
                Create Your First Graph
              </Link>
            )}
          </div>
        )}
    </div>
  );
}

export default HistoryPage;
