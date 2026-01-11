import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Network,
  Plus,
  Search,
  Grid,
  List,
  Calendar,
  Trash2,
  Copy,
  Edit,
  Eye,
  ArrowLeft,
  Loader2,
  MoreVertical,
  Lock,
  Globe,
  ChevronDown,
  MousePointer2,
  Move
} from 'lucide-react';

function GraphsPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadGraphs();
    }
  }, [isAuthenticated]);

  const loadGraphs = async () => {
    try {
      setLoading(true);
      const response = await api.getGraphs();
      if (response.success) {
        setGraphs(response.graphs || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load graphs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this graph?')) return;

    try {
      await api.deleteGraph(id);
      setGraphs(prev => prev.filter(g => g._id !== id));
      setActiveMenu(null);
    } catch (err) {
      setError('Failed to delete graph');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const response = await api.duplicateGraph(id);
      if (response.success) {
        setGraphs(prev => [response.graph, ...prev]);
        setActiveMenu(null);
      }
    } catch (err) {
      setError('Failed to duplicate graph');
    }
  };

  const filteredGraphs = graphs.filter(graph =>
    graph.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    graph.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className={`w-12 h-12 animate-spin ${isDark ? 'text-blue-500' : 'text-blue-600'}`} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Graphs
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {graphs.length} custom graph{graphs.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Link
            to="/graphs/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-colors"
          >
            <Move className="w-5 h-5" />
            Create Custom Graph
          </Link>
        </div>

        {/* Search & View Toggle */}
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

          <div className={`flex rounded-xl border p-1 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' 
                ? 'bg-blue-500 text-white' 
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Graphs Grid/List */}
        {filteredGraphs.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGraphs.map((graph) => (
                <div
                  key={graph._id}
                  className={`relative p-5 rounded-2xl border transition-all group
                    ${isDark 
                      ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                >
                  {/* Menu Button */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => setActiveMenu(activeMenu === graph._id ? null : graph._id)}
                      className={`p-1.5 rounded-lg transition-colors
                        ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <MoreVertical className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                    
                    {activeMenu === graph._id && (
                      <div className={`absolute right-0 top-full mt-1 w-40 rounded-xl border shadow-lg z-10
                        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button
                          onClick={() => navigate(`/graphs/${graph._id}`)}
                          className={`w-full px-4 py-2 text-left flex items-center gap-2 rounded-t-xl
                            ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                        <button
                          onClick={() => navigate(`/graphs/${graph._id}/edit`)}
                          className={`w-full px-4 py-2 text-left flex items-center gap-2
                            ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(graph._id)}
                          className={`w-full px-4 py-2 text-left flex items-center gap-2
                            ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          <Copy className="w-4 h-4" /> Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(graph._id)}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 text-red-400 hover:bg-red-500/10 rounded-b-xl"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Graph Preview Icon */}
                  <div className={`w-full h-32 rounded-xl mb-4 flex items-center justify-center
                    ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <Network className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  </div>

                  {/* Title & Description */}
                  <h3 className={`font-semibold mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {graph.title}
                  </h3>
                  <p className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {graph.description || 'No description'}
                  </p>

                  {/* Stats */}
                  <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span>{graph.metadata?.nodeCount || 0} nodes</span>
                    <span>•</span>
                    <span>{graph.metadata?.edgeCount || 0} edges</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {graph.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {graph.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGraphs.map((graph) => (
                <div
                  key={graph._id}
                  className={`p-5 rounded-2xl border transition-all group flex items-center gap-4
                    ${isDark 
                      ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <Network className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {graph.title}
                    </h3>
                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {graph.description || 'No description'}
                    </p>
                    <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>{graph.metadata?.nodeCount || 0} nodes</span>
                      <span>•</span>
                      <span>{formatDate(graph.updatedAt)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {graph.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/graphs/${graph._id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-purple-500"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDelete(graph._id)}
                      className={`p-2 rounded-xl border transition-colors
                        ${isDark 
                          ? 'border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-500' 
                          : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className={`p-12 rounded-2xl border text-center
            ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'}`}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
              ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
              <Move className={`w-10 h-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {searchQuery ? 'No matching graphs' : 'No custom graphs yet'}
            </h3>
            <p className={`mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery 
                ? 'Try a different search term'
                : 'Build your own graph with drag & drop'}
            </p>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {!searchQuery && 'Add nodes, connect them, and customize your visualization manually'}
            </p>
            {!searchQuery && (
              <Link
                to="/graphs/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all"
              >
                <Move className="w-5 h-5" />
                Create Custom Graph
              </Link>
            )}
          </div>
        )}
    </div>
  );
}

export default GraphsPage;
