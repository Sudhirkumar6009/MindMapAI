import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Network,
  Brain,
  GitFork,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Calendar,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, gradient, delay = 0 }) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isDark
          ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${gradient}`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {label}
          </p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {subValue && (
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {subValue}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Recent Graph Item
const RecentGraphItem = ({ graph, onLoad }) => {
  const { isDark } = useTheme();
  
  const getSourceIcon = (type) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'github': return GitFork;
      default: return Brain;
    }
  };
  
  const SourceIcon = getSourceIcon(graph.sourceType);
  
  return (
    <div
      onClick={() => onLoad(graph)}
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group
        ${isDark
          ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
          : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md'}`}
    >
      <div className={`p-2.5 rounded-lg ${
        graph.sourceType === 'pdf' ? 'bg-green-500/20 text-green-500' :
        graph.sourceType === 'github' ? 'bg-purple-500/20 text-purple-500' :
        'bg-emerald-500/20 text-emerald-500'
      }`}>
        <SourceIcon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {graph.title}
        </h4>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {graph.conceptCount} concepts • {new Date(graph.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1
        ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
    </div>
  );
};

// Quick Action Button
const QuickAction = ({ icon: Icon, label, description, onClick, gradient }) => {
  const { isDark } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 w-full group
        ${isDark
          ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
    >
      <div className={`p-3 rounded-xl ${gradient}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </h4>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
      <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1
        ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
    </button>
  );
};

// Main Dashboard Component
function Dashboard({ onNavigate, onLoadGraph }) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboard();
      if (response.success) {
        setDashboardData(response.dashboard);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGraph = async (graph) => {
    try {
      const response = await api.getHistoryItem(graph._id);
      if (response.success && onLoadGraph) {
        onLoadGraph(response.data);
      }
    } catch (err) {
      console.error('Load graph error:', err);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentGraphs, quickStats } = dashboardData || {};

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
          </div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Here's an overview of your knowledge mapping activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Network}
            label="Total Graphs"
            value={stats?.totalGraphs || 0}
            subValue={`${quickStats?.thisWeek || 0} this week`}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            delay={0}
          />
          <StatCard
            icon={Brain}
            label="Total Concepts"
            value={stats?.totalConcepts || 0}
            subValue={`~${stats?.avgConceptsPerGraph || 0} per graph`}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
            delay={100}
          />
          <StatCard
            icon={GitFork}
            label="Relationships"
            value={stats?.totalRelationships || 0}
            subValue={`~${stats?.avgRelationshipsPerGraph || 0} per graph`}
            gradient="bg-gradient-to-br from-green-500 to-green-700"
            delay={200}
          />
          <StatCard
            icon={Activity}
            label="This Month"
            value={quickStats?.thisMonth || 0}
            subValue="graphs created"
            gradient="bg-gradient-to-br from-orange-500 to-orange-700"
            delay={300}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Graphs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Graphs
              </h2>
              <button
                onClick={() => onNavigate?.('history')}
                className={`text-sm font-medium flex items-center gap-1 hover:underline
                  ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentGraphs && recentGraphs.length > 0 ? (
                recentGraphs.slice(0, 5).map((graph) => (
                  <RecentGraphItem
                    key={graph._id}
                    graph={graph}
                    onLoad={handleLoadGraph}
                  />
                ))
              ) : (
                <div className={`text-center py-12 rounded-xl border
                  ${isDark ? 'bg-gray-800/30 border-gray-700/50' : 'bg-gray-100 border-gray-200'}`}>
                  <Network className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    No graphs yet. Create your first one!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <QuickAction
                icon={Plus}
                label="New Graph"
                description="Create from text, PDF, or GitHub"
                onClick={() => onNavigate?.('create')}
                gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
              />
              <QuickAction
                icon={Sparkles}
                label="Create Custom Graph"
                description="Build your own from scratch"
                onClick={() => onNavigate?.('custom')}
                gradient="bg-gradient-to-br from-purple-500 to-purple-700"
              />
              <QuickAction
                icon={Clock}
                label="View History"
                description="Browse all your past graphs"
                onClick={() => onNavigate?.('history')}
                gradient="bg-gradient-to-br from-green-500 to-green-700"
              />
            </div>

            {/* Activity Overview */}
            <div className={`mt-6 p-4 rounded-xl border
              ${isDark ? 'bg-gray-800/30 border-gray-700/50' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Source Types
                </h3>
              </div>
              
              <div className="space-y-2">
                {stats?.graphsByType && Object.entries(stats.graphsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className={`text-sm capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {type}
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {count}
                    </span>
                  </div>
                ))}
                {(!stats?.graphsByType || Object.keys(stats.graphsByType).length === 0) && (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    No data yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
