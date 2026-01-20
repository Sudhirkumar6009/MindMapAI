import {
  Brain,
  Sparkles,
  LogIn,
  Sun,
  Moon,
  Home,
  LayoutDashboard,
  Settings,
  Plus,
  FolderOpen,
  Clock,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import UserMenu from "./UserMenu";

function Header() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/create", icon: Plus, label: "Create" },
    { path: "/graphs", icon: FolderOpen, label: "Graphs" },
    { path: "/history", icon: Clock, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Main Header */}
      <header
        className={`border-b fixed top-0 left-0 right-0 z-50 transition-colors duration-300
                         ${
                           isDark
                             ? "border-emerald-900/30 bg-gray-900/95 backdrop-blur-xl"
                             : "border-emerald-200 bg-white/95 backdrop-blur-xl"
                         }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Landing/Dashboard Button */}
              <Link
                to={isAuthenticated ? "/dashboard" : "/"}
                className={`p-2 rounded-xl border-2 transition-all duration-300 hover:scale-105
                          ${
                            isDark
                              ? "bg-emerald-950/50 border-emerald-800/50 hover:border-emerald-600 text-emerald-400 hover:text-emerald-300"
                              : "bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-600 hover:text-emerald-700"
                          }`}
                title={isAuthenticated ? "Back to Dashboard" : "Back to Home"}
              >
                <Home className="w-5 h-5" />
              </Link>

              <Link
                to={isAuthenticated ? "/dashboard" : "/"}
                className="flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/25">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                    MindMap AI
                  </h1>
                  <p
                    className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-600/70"}`}
                  >
                    Transform Text to Knowledge
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl border-2 transition-all duration-300 hover:scale-105
                          ${
                            isDark
                              ? "bg-gray-800 border-emerald-800/50 hover:border-emerald-500 text-amber-400 hover:bg-gray-700"
                              : "bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-700 hover:bg-emerald-100"
                          }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {!loading &&
                (isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 
                             hover:from-emerald-500 hover:to-emerald-400 rounded-xl font-semibold text-sm 
                             transition-all shadow-lg shadow-emerald-500/25 text-white hover:scale-105"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Tab Navigation for authenticated users */}
      {isAuthenticated && (
        <nav
          className={`fixed top-[73px] left-0 right-0 z-40 border-b transition-colors duration-300
                        ${
                          isDark
                            ? "border-emerald-900 bg-gray-900/95 backdrop-blur-xl"
                            : "border-emerald-200 bg-white/95 backdrop-blur-xl"
                        }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${
                      isActive(item.path)
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                        : isDark
                          ? "text-gray-400 hover:text-emerald-400 hover:bg-emerald-950/50"
                          : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Spacer for fixed headers */}
      <div className={isAuthenticated ? "h-[121px]" : "h-[73px]"} />
    </>
  );
}
export default Header;
