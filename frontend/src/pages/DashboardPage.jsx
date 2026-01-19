import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
  BarChart3,
  Network,
  GitBranch,
  Calendar,
  Plus,
  History,
  Settings,
  TrendingUp,
  FileText,
  Github,
  FileCode,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

// Stat Card Component
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  gradient,
  delay = 0,
}) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        ${
          isDark
            ? "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
        }`}
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${gradient}`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {label}
          </p>
          <p
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </p>
          {subValue && (
            <p
              className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
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
const RecentGraphItem = ({ graph, onClick }) => {
  const { isDark } = useTheme();

  const getSourceIcon = (type) => {
    switch (type) {
      case "pdf":
        return FileCode;
      case "github":
        return Github;
      default:
        return FileText;
    }
  };

  const SourceIcon = getSourceIcon(graph.sourceType);

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border transition-all text-left group
        ${
          isDark
            ? "bg-gray-800/50 border-gray-700/50 hover:border-emerald-500/50 hover:bg-gray-800"
            : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md"
        }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
        >
          <SourceIcon
            className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {graph.title}
          </h3>
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {graph.conceptCount} concepts · {graph.relationshipCount}{" "}
            relationships
          </p>
        </div>
        <ChevronRight
          className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-gray-400" : "text-gray-500"}`}
        />
      </div>
    </button>
  );
};

// Quick Action Button
const QuickAction = ({ icon: Icon, label, description, to, gradient }) => {
  const { isDark } = useTheme();

  return (
    <Link
      to={to}
      className={`block p-4 rounded-xl border transition-all group
        ${
          isDark
            ? "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
            : "bg-white border-gray-200 hover:shadow-lg"
        }`}
    >
      <div
        className={`inline-flex p-3 rounded-xl ${gradient} mb-3 group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3
        className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {label}
      </h3>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {description}
      </p>
    </Link>
  );
};

function DashboardPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboard();
      if (response.success) {
        setDashboardData(response.dashboard);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className={`w-12 h-12 animate-spin mx-auto mb-4 ${isDark ? "text-emerald-500" : "text-emerald-600"}`}
          />
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentGraphs = dashboardData?.recentGraphs || [];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1
          className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
        </h1>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Here's an overview of your mind mapping activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Network}
          label="Total Graphs"
          value={stats.totalGraphs || 0}
          subValue="All time"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          delay={0}
        />
        <StatCard
          icon={Sparkles}
          label="Concepts Generated"
          value={stats.totalConcepts || 0}
          subValue="Across all graphs"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          delay={100}
        />
        <StatCard
          icon={GitBranch}
          label="Relationships"
          value={stats.totalRelationships || 0}
          subValue="Total connections"
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          delay={200}
        />
        <StatCard
          icon={TrendingUp}
          label="This Month"
          value={stats.thisMonth || 0}
          subValue="Graphs created"
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Graphs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Recent Graphs
            </h2>
            <Link
              to="/history"
              className={`text-sm font-medium flex items-center gap-1 ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-500"}`}
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentGraphs.length > 0 ? (
            <div className="space-y-3">
              {recentGraphs.slice(0, 5).map((graph) => (
                <RecentGraphItem
                  key={graph._id}
                  graph={graph}
                  onClick={() => navigate(`/create?loadHistory=${graph._id}`)}
                />
              ))}
            </div>
          ) : (
            <div
              className={`p-8 rounded-2xl border text-center
                ${isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}
            >
              <Network
                className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}
              />
              <p
                className={`font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                No graphs yet
              </p>
              <p
                className={`text-sm mb-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Create your first mind map to get started
              </p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-medium rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Create Graph
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2
            className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Quick Actions
          </h2>
          <div className="space-y-3">
            <QuickAction
              icon={Plus}
              label="New Graph"
              description="Create from text or PDF"
              to="/create"
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <QuickAction
              icon={Network}
              label="Custom Graph"
              description="Build from scratch"
              to="/graphs/new"
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <QuickAction
              icon={History}
              label="History"
              description="View past graphs"
              to="/history"
              gradient="bg-gradient-to-br from-green-500 to-green-600"
            />
            <QuickAction
              icon={Settings}
              label="Settings"
              description="Customize preferences"
              to="/settings"
              gradient="bg-gradient-to-br from-gray-500 to-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
