import { useState, useRef, useEffect } from "react";
import {
  User,
  LogOut,
  History,
  Settings,
  ChevronDown,
  LayoutDashboard,
  FolderOpen,
  UserCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate("/");
  };

  const menuItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/profile", icon: UserCircle, label: "Profile" },
    { to: "/graphs", icon: FolderOpen, label: "My Graphs" },
    { to: "/history", icon: History, label: "History" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1.5 pr-3 border rounded-full transition-colors
                  ${
                    isDark
                      ? "bg-dark-800 hover:bg-dark-700 border-dark-600"
                      : "bg-white hover:bg-dark-50 border-dark-300"
                  }`}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 
                        flex items-center justify-center text-white text-sm font-medium"
          >
            {getInitials(user.name)}
          </div>
        )}
        <span
          className={`text-sm font-medium hidden sm:block ${isDark ? "text-dark-200" : "text-dark-700"}`}
        >
          {user?.name?.split(" ")[0] || "User"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""} ${isDark ? "text-dark-400" : "text-dark-500"}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-64 border rounded-xl shadow-2xl overflow-hidden z-50
                        ${isDark ? "bg-dark-800 border-dark-600" : "bg-white border-dark-200"}`}
        >
          <div
            className={`p-4 border-b ${isDark ? "border-dark-700" : "border-dark-200"}`}
          >
            <p
              className={`font-semibold ${isDark ? "text-dark-100" : "text-dark-800"}`}
            >
              {user.name}
            </p>
            <p
              className={`text-sm truncate ${isDark ? "text-dark-400" : "text-dark-500"}`}
            >
              {user.email}
            </p>
          </div>

          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors
                          ${isDark ? "hover:bg-dark-700" : "hover:bg-dark-50"}`}
              >
                <item.icon
                  className={`w-4 h-4 ${isDark ? "text-dark-400" : "text-dark-500"}`}
                />
                <span className={isDark ? "text-dark-200" : "text-dark-700"}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div
            className={`border-t py-2 ${isDark ? "border-dark-700" : "border-dark-200"}`}
          >
            <button
              onClick={handleLogout}
              className={`w-full px-4 py-2.5 flex items-center gap-3 text-red-400 transition-colors
                        ${isDark ? "hover:bg-dark-700" : "hover:bg-dark-50"}`}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
