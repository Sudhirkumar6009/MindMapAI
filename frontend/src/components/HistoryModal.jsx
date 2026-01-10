import { useState, useEffect } from 'react';
import { X, Clock, Trash2, ExternalLink, Search, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

function HistoryModal({ isOpen, onClose, onLoadGraph }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      fetchStats();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory(1, 20);
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getHistoryStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(id);
      await api.deleteHistoryItem(id);
      setHistory(history.filter(h => h._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleLoad = async (item) => {
    try {
      const data = await api.getHistoryItem(item._id);
      if (data.success && data.data.graphData) {
        onLoadGraph(data.data.graphData);
        onClose();
      }
    } catch (err) {
      console.error('Failed to load graph:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4
                    ${isDark ? 'bg-dark-950/80' : 'bg-dark-900/50'}`}>
      <div className={`rounded-2xl w-full max-w-2xl border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col
                      ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-dark-200'}`}>
        <div className={`p-6 border-b flex items-center justify-between
                        ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>History</h2>
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>Your saved mind maps</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors
                      ${isDark ? 'hover:bg-dark-700' : 'hover:bg-dark-100'}`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          </button>
        </div>

        {stats && (
          <div className={`px-6 py-4 border-b grid grid-cols-3 gap-4
                          ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-400">{stats.totalGraphs}</p>
              <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Total Graphs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.totalConcepts}</p>
              <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Concepts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.totalRelationships}</p>
              <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Relationships</p>
            </div>
          </div>
        )}

        <div className={`px-6 py-3 border-b ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-dark-500' : 'text-dark-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none 
                       focus:ring-2 focus:ring-primary-500/50
                       ${isDark 
                         ? 'bg-dark-700 border-dark-600 text-dark-100 placeholder-dark-500' 
                         : 'bg-dark-50 border-dark-300 text-dark-800 placeholder-dark-400'}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-400">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-dark-600' : 'text-dark-300'}`} />
              <p className={isDark ? 'text-dark-400' : 'text-dark-500'}>
                {searchQuery ? 'No results found' : 'No history yet'}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                {searchQuery ? 'Try a different search' : 'Generate your first mind map!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 border rounded-xl transition-colors group
                            ${isDark 
                              ? 'bg-dark-700/50 border-dark-600 hover:border-dark-500' 
                              : 'bg-dark-50 border-dark-200 hover:border-dark-300'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>{item.title}</h3>
                      <p className={`text-sm mt-1 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>{formatDate(item.createdAt)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded">
                          {item.conceptCount} concepts
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                          {item.relationshipCount} relations
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded uppercase
                                        ${isDark ? 'bg-dark-600 text-dark-400' : 'bg-dark-200 text-dark-500'}`}>
                          {item.sourceType}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleLoad(item)}
                        className={`p-2 rounded-lg transition-colors
                                  ${isDark ? 'hover:bg-dark-600' : 'hover:bg-dark-200'}`}
                        title="Load graph"
                      >
                        <ExternalLink className="w-4 h-4 text-primary-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deleting === item._id}
                        className={`p-2 rounded-lg transition-colors
                                  ${isDark ? 'hover:bg-dark-600' : 'hover:bg-dark-200'}`}
                        title="Delete"
                      >
                        {deleting === item._id ? (
                          <Loader2 className="w-4 h-4 text-dark-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;
