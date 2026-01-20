import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Network,
  FileText,
  FolderTree,
  GitBranch,
  Download,
  Share2,
  Layers,
  Settings,
  Plus,
  ArrowRight,
  MousePointer,
  Grid,
  Hexagon,
  Box,
  Maximize2,
  Minimize2,
  RotateCw,
  Sun,
  Moon,
  LogIn,
  Github,
  Twitter,
  Linkedin,
  Users,
  Zap,
  Shield,
  Globe,
  Sparkles,
  PenTool,
  Upload,
  FileDown,
  Eye,
  Star,
  CheckCircle,
  TrendingUp,
  ExternalLink,
  Icon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import UserMenu from "./UserMenu";
import { ClickSpark } from "./animations/ClickSpark";
import GridMotion from "./animations/GridMotion";
import LightRays from "./animations/LightRays";

// Import assets
import image1 from "../assets/image1.png";

const LandingHeader = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignIn = () => {
    navigate("/login", { replace: false, state: { fromLanding: true } });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${
          scrolled
            ? `${isDark ? "bg-gray-900/95 border-emerald-900/30" : "bg-white/95 border-emerald-200"} backdrop-blur-xl border-b`
            : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center`}
            >
              <Network className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                MindMap
              </h1>
              <p
                className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-600/70"}`}
              >
                Visual Knowledge Mapper
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {!loading &&
              (isAuthenticated ? (
                <UserMenu onNavigate={(path) => navigate(`/${path}`)} />
              ) : (
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 
                           hover:from-emerald-500 hover:to-emerald-400 rounded-full font-semibold text-sm 
                           transition-all shadow-lg shadow-emerald-700/25 text-white hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              ))}

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full border-none transition-all duration-300 hover:scale-110
                ${
                  isDark
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-emerald-700 hover:bg-emerald-400"
                }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5" color="white" />
              ) : (
                <Moon className="w-5 h-5" color="white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  items = [],
  onClick,
  delay = 0,
}) => {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
        ${
          isDark
            ? "bg-gray-800/50 border-gray-700 hover:border-emerald-500"
            : "bg-white border-gray-200 hover:border-emerald-500"
        }
        ${isHovered ? "scale-[1.02] shadow-lg" : ""}`}
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors
        ${isDark ? "bg-gray-700 group-hover:bg-emerald-500/20" : "bg-gray-100 group-hover:bg-emerald-50"}`}
      >
        <Icon
          className={`w-6 h-6 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        />
      </div>

      <h3
        className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </h3>
      <p
        className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        {description}
      </p>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-emerald-500" : "bg-emerald-600"}`}
              />
              {item}
            </li>
          ))}
        </ul>
      )}

      <div
        className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        <ArrowRight
          className={`w-5 h-5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        />
      </div>
    </motion.div>
  );
};

const DiagramNode = ({
  icon: Icon,
  color,
  position,
  label,
  isDark,
  isCenter,
  delay = 0,
}) => {
  const colorClasses = {
    emerald: {
      bg: isDark ? "bg-emerald-500/20" : "bg-emerald-50",
      border: "border-emerald-500",
      text: isDark ? "text-emerald-400" : "text-emerald-600",
      shadow: isDark ? "shadow-emerald-500/30" : "shadow-emerald-500/20",
    },
    purple: {
      bg: isDark ? "bg-purple-500/20" : "bg-purple-50",
      border: "border-purple-500",
      text: isDark ? "text-purple-400" : "text-purple-600",
      shadow: isDark ? "shadow-purple-500/30" : "shadow-purple-500/20",
    },
    green: {
      bg: isDark ? "bg-green-500/20" : "bg-green-50",
      border: "border-green-500",
      text: isDark ? "text-green-400" : "text-green-600",
      shadow: isDark ? "shadow-green-500/30" : "shadow-green-500/20",
    },
    orange: {
      bg: isDark ? "bg-orange-500/20" : "bg-orange-50",
      border: "border-orange-500",
      text: isDark ? "text-orange-400" : "text-orange-600",
      shadow: isDark ? "shadow-orange-500/30" : "shadow-orange-500/20",
    },
    cyan: {
      bg: isDark ? "bg-cyan-500/20" : "bg-cyan-50",
      border: "border-cyan-500",
      text: isDark ? "text-cyan-400" : "text-cyan-600",
      shadow: isDark ? "shadow-cyan-500/30" : "shadow-cyan-500/20",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`absolute ${position} transform -translate-x-1/2 -translate-y-1/2 
        flex flex-col items-center gap-2 transition-all duration-500 hover:scale-110 
        animate-in fade-in zoom-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`${isCenter ? "w-28 h-28" : "w-20 h-20"} rounded-2xl flex items-center justify-center 
          border-2 ${classes.bg} ${classes.border} ${classes.shadow} shadow-lg
          backdrop-blur-sm transition-all duration-300 hover:shadow-2xl group`}
      >
        <Icon
          className={`w-8 h-8 ${isCenter ? "w-12 h-12" : ""} ${classes.text} transition-transform duration-300 group-hover:scale-110`}
        />
      </div>
      {label && (
        <span
          className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"} 
          px-2 py-1 rounded-md ${isDark ? "bg-gray-700/50" : "bg-gray-100"} 
          transition-all duration-300 hover:scale-105`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

const DiagramPreview = () => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative w-full aspect-square max-w-md mx-auto rounded-3xl overflow-hidden
        ${isDark ? "bg-gray-800/80 border-2 border-gray-700" : "bg-white/80 border-2 border-gray-200"} 
        backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-emerald-500/10 hover:scale-[1.02] 
        animate-gentle-float`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)",
      }}
    >
      <div className="absolute inset-0 p-10">
        <div className="relative w-full h-full">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.7 }}
          >
            <defs>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={isDark ? "#34d399" : "#10B981"}
                  stopOpacity="0.9"
                />
                <stop
                  offset="100%"
                  stopColor={isDark ? "#a78bfa" : "#8b5cf6"}
                  stopOpacity="0.9"
                />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line
              x1="50%"
              y1="28%"
              x2="50%"
              y2="50%"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-700"
            />
            <line
              x1="50%"
              y1="50%"
              x2="50%"
              y2="72%"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-700"
            />
            <line
              x1="22%"
              y1="50%"
              x2="50%"
              y2="50%"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-700"
            />
            <line
              x1="50%"
              y1="50%"
              x2="78%"
              y2="50%"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-700"
            />
          </svg>

          <DiagramNode
            icon={Network}
            color="emerald"
            position="top-1/2 left-1/2"
            label="Mind Map"
            isDark={isDark}
            isCenter={true}
            delay={100}
          />

          <DiagramNode
            icon={Hexagon}
            color="purple"
            position="top-8 left-1/2"
            label="Flowchart"
            isDark={isDark}
            isCenter={false}
            delay={300}
          />

          <DiagramNode
            icon={Box}
            color="green"
            position="bottom-8 left-1/2"
            label="Structure"
            isDark={isDark}
            isCenter={false}
            delay={400}
          />

          <DiagramNode
            icon={FolderTree}
            color="orange"
            position="top-1/2 left-8"
            label="Tree"
            isDark={isDark}
            isCenter={false}
            delay={500}
          />

          <DiagramNode
            icon={GitBranch}
            color="cyan"
            position="top-1/2 right-8"
            label="Network"
            isDark={isDark}
            isCenter={false}
            delay={600}
          />

          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              w-36 h-36 rounded-full border-2 border-dashed animate-spin-slow"
            style={{
              borderColor: isDark
                ? "rgba(59, 130, 246, 0.3)"
                : "rgba(59, 130, 246, 0.3)",
            }}
          />

          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              w-44 h-44 rounded-full border border-dotted animate-pulse-ring"
            style={{
              borderColor: isDark
                ? "rgba(139, 92, 246, 0.2)"
                : "rgba(139, 92, 246, 0.2)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const Footer = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path, { replace: false, state: { fromLanding: true } });
    window.scrollTo(0, 0);
  };

  const handleExternalLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer
      className={`py-16 px-6 ${isDark ? "bg-gray-900 border-t border-gray-800" : "bg-gray-100 border-t border-gray-200"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3 mb-4 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl border-2 flex items-center justify-center">
                <Network
                  className={`w-6 h-6 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                />
              </div>
              <span
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                MindMap
              </span>
            </button>
            <p
              className={`max-w-md mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Transform complex information into beautiful, interactive mind
              maps. Built for students, researchers, and professionals.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleExternalLink("https://github.com")}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer
                  ${isDark ? "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700" : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-200"}`}
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleExternalLink("https://twitter.com")}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer
                  ${isDark ? "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700" : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-200"}`}
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleExternalLink("https://linkedin.com")}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer
                  ${isDark ? "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700" : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-200"}`}
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4
              className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation("/create")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/history")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Diagram Types
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Use Cases
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/settings")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Settings
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4
              className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation("/about")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/blog")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleExternalLink("https://github.com/jobs")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/contact")}
                  className={`text-left transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  Contact
                </button>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <div
          className={`pt-8 border-t ${isDark ? "border-gray-800" : "border-gray-200"} flex flex-col md:flex-row items-center justify-between gap-4`}
        >
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            © 2026 MindMap. Professional Diagramming Tool.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavigation("/privacy")}
              className={`text-sm transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNavigation("/terms")}
              className={`text-sm transition-colors cursor-pointer ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

function LandingPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Grid motion items for background
  const gridItems = [
    "Mind Maps",
    <div key="jsx-1" className="flex items-center justify-center">
      <Network className="w-8 h-8" />
    </div>,
    image1,
    "Flowcharts",
    <div key="jsx-2" className="flex items-center justify-center">
      <GitBranch className="w-8 h-8" />
    </div>,
    "Diagrams",
    <div key="jsx-3" className="flex items-center justify-center">
      <FolderTree className="w-8 h-8" />
    </div>,
    image1,
    "Knowledge",
    <div key="jsx-4" className="flex items-center justify-center">
      <Layers className="w-8 h-8" />
    </div>,
    "Visualize",
    <div key="jsx-5" className="flex items-center justify-center">
      <Hexagon className="w-8 h-8" />
    </div>,
    image1,
    "Organize",
    <div key="jsx-6" className="flex items-center justify-center">
      <Box className="w-8 h-8" />
    </div>,
    "Connect",
    <div key="jsx-7" className="flex items-center justify-center">
      <Share2 className="w-8 h-8" />
    </div>,
    image1,
    "Create",
    <div key="jsx-8" className="flex items-center justify-center">
      <Plus className="w-8 h-8" />
    </div>,
    "Ideas",
    <div key="jsx-9" className="flex items-center justify-center">
      <Grid className="w-8 h-8" />
    </div>,
    image1,
    "Structure",
    <div key="jsx-10" className="flex items-center justify-center">
      <Settings className="w-8 h-8" />
    </div>,
    "Export",
    <div key="jsx-11" className="flex items-center justify-center">
      <Download className="w-8 h-8" />
    </div>,
  ];

  const handleDashboard = () => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: false, state: { fromLanding: true } });
    } else {
      navigate("/register", { replace: false, state: { fromLanding: true } });
    }
  };

  const handleCreateDiagram = () => {
    navigate("/create", { replace: false, state: { fromLanding: true } });
  };
  const handleTryDemo = () => {
    navigate("/create", {
      replace: false,
      state: { fromLanding: true, mode: "demo" },
    });
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden
      ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
    >
      {/* LightRays effect (lower intensity) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor={isDark ? "#10b981" : "#059669"}
          raysSpeed={0.7}
          lightSpread={1.5}
          rayLength={0.7}
          followMouse={true}
          mouseInfluence={0.05}
          noiseAmount={0.04}
          distortion={0.01}
          fadeDistance={0.7}
          saturation={0.7}
        />
      </div>

      {/* Overlay to ensure content readability */}
      <div
        className={`fixed inset-0 z-[1] pointer-events-none transition-colors duration-300
        ${isDark ? "bg-gray-950/60" : "bg-gray-50/70"}`}
      />

      <LandingHeader />

      <main className="relative z-10">
        <section className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              className="space-y-8 relative"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium relative z-10
                ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}
              >
                <Layers className="w-4 h-4" />
                Visual Knowledge Mapping
              </div>

              <h1
                className={`text-5xl md:text-6xl font-thin imageleading-tight
                ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Organize Ideas into <br />
                <span className="text-emerald-600 mt-4 block leading-tight font-bold">
                  Structured Diagrams
                </span>
              </h1>

              <p
                className={`text-lg max-w-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Create professional mind maps, flowcharts, and knowledge graphs.
                Transform complex information into clear, visual structures.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={handleDashboard}
                      className="flex items-center justify-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 
                           text-white font-bold rounded-full transition-all hover:scale-105"
                    >
                      Dashboard
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCreateDiagram}
                      className="relative h-15 w-16 rounded-full font-semibold bg-emerald-600 border-2 border-emerald-600 text-white-600
                           hover:w-60 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 group
                           transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden"
                    >
                      <Plus
                        className="w-5 h-5 flex-shrink-0 transition-all duration-300 ease-in-out"
                        color="white"
                      />
                      <span className="max-w-0 opacity-0 group-hover:max-w-40 group-hover:opacity-100 group-hover:ml-2 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out">
                        Create Diagram
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleDashboard}
                      className="flex items-center justify-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 
                           text-white font-bold rounded-full transition-all hover:scale-105 tracking-wider"
                    >
                      Create Diagram
                    </button>
                    <button
                      onClick={handleTryDemo}
                      className="relative h-15 w-16 rounded-full font-semibold bg-emerald-600 border-2 border-emerald-600 text-white-600
                           hover:w-40 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 group
                           transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden"
                    >
                      <MousePointer
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ease-in-out`}
                        color="white"
                      />
                      <span className="max-w-0 opacity-0 group-hover:max-w-40 group-hover:opacity-100 group-hover:ml-2 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out">
                        Try Demo
                      </span>
                    </button>
                  </>
                )}
              </div>

              <div
                className={`flex items-center gap-6 pt-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                <div className="flex items-center gap-2">
                  <Grid className="w-5 h-5" />
                  <span className="text-sm">Grid Layouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hexagon className="w-5 h-5" />
                  <span className="text-sm">Custom Shapes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">Export Options</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              {/* Decorative elements behind the image */}
              <div
                className={`absolute -inset-4 rounded-3xl blur-3xl opacity-30
                ${isDark ? "bg-gradient-to-br from-emerald-500 via-cyan-500 to-purple-500" : "bg-gradient-to-br from-emerald-300 via-cyan-300 to-purple-300"}`}
              />

              {/* Floating accent shapes */}
              <div
                className={`absolute -top-6 -right-6 w-20 h-20 rounded-2xl rotate-12 
                ${isDark ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-emerald-100 border border-emerald-200"}
                animate-pulse`}
              />
              <div
                className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-xl -rotate-12 
                ${isDark ? "bg-purple-500/20 border border-purple-500/30" : "bg-purple-100 border border-purple-200"}
                animate-pulse`}
                style={{ animationDelay: "1s" }}
              />
              <div
                className={`absolute top-1/2 -right-8 w-12 h-12 rounded-full 
                ${isDark ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-cyan-100 border border-cyan-200"}
                animate-bounce`}
                style={{ animationDuration: "3s" }}
              />

              {/* Image Preview */}
              <div className="relative group z-10">
                <div className={`relative max-w-xl mx-auto overflow-hidden `}>
                  <img
                    src={image1}
                    alt="MindMap AI Preview"
                    className="w-full h-auto object-contain transition-transform duration-500"
                  />
                </div>

                {/* Shadow underneath */}
                <div
                  className={`absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl
                  ${isDark ? "bg-black/40" : "bg-gray-400/30"}`}
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section
          className={`py-10 px-6 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}
        >
          {/* Add floating animation keyframes */}
          <style>{`
            @keyframes float-gentle {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            .animate-float-gentle {
              animation: float-gentle 4s ease-in-out infinite;
            }
            @keyframes count-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-count-up {
              animation: count-up 0.8s ease-out forwards;
            }
          `}</style>
          <div className="w-32 h-7 m-10 border-2 rounded-full border-emerald-600 bg-emerald-600 mb-20 mx-auto" />

          {/* Stats Section */}
          <div className="max-w-7xl mx-auto mb-32">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Trusted by Thousands Worldwide
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Join our growing community of visual thinkers and professionals
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  number: "10K+",
                  label: "Active Users",
                  icon: Users,
                  color: "emerald",
                },
                {
                  number: "50K+",
                  label: "Diagrams Created",
                  icon: Network,
                  color: "emerald",
                },
                {
                  number: "99.9%",
                  label: "Uptime",
                  icon: Shield,
                  color: "emerald",
                },
                {
                  number: "4.9",
                  label: "User Rating",
                  icon: Star,
                  color: "emerald",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className={`text-center p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105
                    ${
                      isDark
                        ? "bg-gray-800/50 border-gray-700 hover:border-emerald-500"
                        : "bg-white border-gray-200 hover:border-emerald-500"
                    }`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <stat.icon
                    className={`w-8 h-8 mx-auto mb-4 ${isDark ? `text-${stat.color}-400` : `text-${stat.color}-600`}`}
                  />
                  <div
                    className={`text-4xl font-bold mb-2 bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 bg-clip-text text-transparent`}
                  >
                    {stat.number}
                  </div>
                  <div
                    className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div
            className={`w-full mx-auto my-20 p-2 md:p-16 lg:p-20 rounded-3xl shadow-xl transition-colors duration-300 ${
              isDark
                ? "bg-gray-800/50 border border-emerald-500/30"
                : "bg-white border border-emerald-200"
            }`}
          >
            <motion.div
              className="text-center mb-24"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className={`text-5xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Powerful Features
              </h2>
              <p
                className={`text-xl max-w-2xl mx-auto ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Everything you need to visualize ideas and create stunning
                diagrams
              </p>
            </motion.div>

            <div className="space-y-32 max-w-7xl mx-auto">
              {/* Feature 1: Multiple Diagram Types */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, x: -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div className="relative mx-auto w-full max-w-xl animate-float-gentle transition-all duration-500">
                    <div className="overflow-hidden rounded-2xl transition-transform duration-500 hover:scale-105">
                      <img
                        src={image1}
                        alt="Multiple Diagram Types"
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="group/card cursor-pointer flex flex-col justify-center"
                  onClick={() => navigate("/create")}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h3
                      className={`text-3xl font-bold inline-block relative ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      5+ Diagram Types
                      <span
                        className={`absolute mt-5 bottom-0 left-0 w-0 h-1 transition-all duration-500 group-hover/card:w-full rounded ${
                          isDark ? "bg-emerald-400" : "bg-emerald-600"
                        }`}
                      />
                    </h3>
                  </div>

                  <p
                    className={`text-lg mb-8 leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Choose from Mind Maps, Flowcharts, Network Diagrams, Tree
                    Structures, Org Charts, and Block Diagrams. Each type is
                    optimized for different visualization needs.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Mind Maps for brainstorming",
                      "Flowcharts for processes",
                      "Network diagrams for relationships",
                      "Tree & Org charts for hierarchies",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-base text-gray-700"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 group/btn w-fit">
                    Explore Diagram Types
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </motion.div>
              </div>

              {/* Feature 2: Custom Diagram Builder */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="group/card cursor-pointer flex flex-col justify-center order-2 lg:order-1"
                  onClick={() => navigate("/graphs/new")}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h3
                      className={`text-3xl font-bold inline-block relative ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Custom Diagram Builder
                      <span
                        className={`absolute bottom-0 left-0 w-0 h-1 transition-all duration-500 group-hover/card:w-full rounded-full ${
                          isDark ? "bg-purple-400" : "bg-purple-600"
                        }`}
                      />
                    </h3>
                  </div>

                  <p
                    className={`text-lg mb-8 leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Build your own diagrams from scratch with our intuitive
                    drag-and-drop editor. No AI needed—just your creativity and
                    our powerful tools.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Drag & drop interface",
                      "Custom node shapes & colors",
                      "Flexible connections",
                      "Real-time collaboration",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-base text-gray-700"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-violet-400 to-purple-600 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 group/btn w-fit">
                    Open Graph Builder
                    <PenTool className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </motion.div>

                <motion.div
                  className="relative group order-1 lg:order-2"
                  initial={{ opacity: 0, x: 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div
                    className="relative mx-auto w-full max-w-xl animate-float-gentle transition-all duration-500"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <div className="overflow-hidden rounded-2xl transition-transform duration-500 hover:scale-105">
                      <img
                        src={image1}
                        alt="Custom Diagram Builder"
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Feature 3: AI-Powered Generation */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, x: -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div
                    className="relative mx-auto w-full max-w-xl animate-float-gentle transition-all duration-500"
                    style={{ animationDelay: "1s" }}
                  >
                    <div className="overflow-hidden rounded-2xl transition-transform duration-500 hover:scale-105">
                      <img
                        src={image1}
                        alt="AI-Powered Generation"
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="group/card cursor-pointer flex flex-col justify-center"
                  onClick={() => navigate("/create")}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h3
                      className={`text-3xl font-bold inline-block relative ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      AI-Powered Generation
                      <span
                        className={`absolute bottom-0 left-0 w-0 h-1 transition-all duration-500 group-hover/card:w-full rounded-full ${
                          isDark ? "bg-cyan-400" : "bg-cyan-600"
                        }`}
                      />
                    </h3>
                  </div>

                  <p
                    className={`text-lg mb-8 leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Leverage Google Gemini AI to automatically extract concepts
                    from text, PDFs, or GitHub repositories and generate
                    beautiful diagrams instantly.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Text to diagram in seconds",
                      "PDF document analysis",
                      "GitHub repo visualization",
                      "Smart concept extraction",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-base text-gray-700"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 group/btn w-fit">
                    Try AI Generation
                    <Sparkles className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </motion.div>
              </div>

              {/* Feature 4: Multiple Export Formats */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="group/card cursor-pointer flex flex-col justify-center order-2 lg:order-1"
                  onClick={() => navigate("/create")}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h3
                      className={`text-3xl font-bold inline-block relative ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Export Anywhere
                      <span
                        className={`absolute bottom-0 left-0 w-0 h-1 transition-all duration-500 group-hover/card:w-full rounded-full ${
                          isDark ? "bg-amber-400" : "bg-amber-600"
                        }`}
                      />
                    </h3>
                  </div>

                  <p
                    className={`text-lg mb-8 leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Export your diagrams in 6+ formats including PNG, SVG,
                    Draw.io, Visio, Gliffy, and our native .mmai format with
                    integrity checksums.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "PNG & SVG images",
                      "Draw.io compatible",
                      "Microsoft Visio (.vsdx)",
                      "Native .mmai format",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-base text-gray-700"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-orange-400 to-amber-600 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 flex items-center gap-2 group/btn w-fit">
                    See Export Options
                    <FileDown className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </motion.div>

                <motion.div
                  className="relative group order-1 lg:order-2"
                  initial={{ opacity: 0, x: 80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div
                    className="relative mx-auto w-full max-w-xl animate-float-gentle transition-all duration-500"
                    style={{ animationDelay: "1.5s" }}
                  >
                    <div className="overflow-hidden rounded-2xl transition-transform duration-500 hover:scale-105">
                      <img
                        src={image1}
                        alt="Export Options"
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Feature 5: History & Dashboard */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, x: -80 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div
                    className="relative mx-auto w-full max-w-xl animate-float-gentle transition-all duration-500"
                    style={{ animationDelay: "2s" }}
                  >
                    <div className="overflow-hidden rounded-2xl transition-transform duration-500 hover:scale-105">
                      <img
                        src={image1}
                        alt="Dashboard & History"
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="group/card cursor-pointer flex flex-col justify-center"
                  onClick={() => navigate("/dashboard")}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h3
                      className={`text-3xl font-bold inline-block relative ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Dashboard & History
                      <span
                        className={`absolute bottom-0 left-0 w-0 h-1 transition-all duration-500 group-hover/card:w-full rounded-full ${
                          isDark ? "bg-rose-400" : "bg-rose-600"
                        }`}
                      />
                    </h3>
                  </div>

                  <p
                    className={`text-lg mb-8 leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Track your progress with a personalized dashboard. Auto-save
                    ensures you never lose work, and history lets you revisit
                    any diagram.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Auto-save functionality",
                      "Version history",
                      "Usage analytics",
                      "Quick access to recent work",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 text-base text-gray-700"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-pink-400 to-rose-600 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25 flex items-center gap-2 group/btn w-fit">
                    View Dashboard
                    <TrendingUp className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials / Trust Section */}
        <section
          className={`py-24 px-6 ${isDark ? "bg-gray-900/50" : "bg-white"}`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Loved by Professionals
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                See what our users are saying about MindMap AI
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "MindMap AI transformed how I organize my research. The AI extraction from PDFs is incredible!",
                  author: "Dr. Sarah Chen",
                  role: "Research Scientist",
                  rating: 5,
                },
                {
                  quote:
                    "Finally, a tool that lets me visualize complex system architectures in minutes, not hours.",
                  author: "Marcus Johnson",
                  role: "Software Architect",
                  rating: 5,
                },
                {
                  quote:
                    "The export to Visio feature alone saved our team countless hours. Highly recommended!",
                  author: "Emily Rodriguez",
                  role: "Project Manager",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  className={`p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105
                    ${
                      isDark
                        ? "bg-gray-800/50 border-gray-700 hover:border-emerald-500"
                        : "bg-gray-50 border-gray-200 hover:border-emerald-500"
                    }`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-5 h-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p
                    className={`text-lg mb-6 italic ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <div
                      className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {testimonial.author}
                    </div>
                    <div
                      className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {testimonial.role}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="absolute py-10 w-full left-0">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-32 h-1 border-t-2 bg-emerald-600" />
        </div>

        {/* Editor Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Built for Everyone
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                From students to enterprise teams, MindMap AI adapts to your
                needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "Students & Educators",
                  description:
                    "Organize lecture notes, create study guides, and visualize complex topics for better understanding.",
                },
                {
                  icon: Zap,
                  title: "Developers",
                  description:
                    "Map system architectures, analyze GitHub repos, and document codebases visually.",
                },
                {
                  icon: Users,
                  title: "Product Teams",
                  description:
                    "Plan features, map user journeys, and create product roadmaps collaboratively.",
                },
                {
                  icon: TrendingUp,
                  title: "Researchers",
                  description:
                    "Extract concepts from papers, organize literature reviews, and map research domains.",
                },
                {
                  icon: Shield,
                  title: "Business Analysts",
                  description:
                    "Document processes, create org charts, and visualize business workflows.",
                },
                {
                  icon: Sparkles,
                  title: "Content Creators",
                  description:
                    "Plan content strategies, brainstorm ideas, and structure creative projects.",
                },
              ].map((useCase, i) => (
                <motion.div
                  key={i}
                  className={`p-8 rounded-2xl border-2 transition-all duration-300
                    ${
                      isDark
                        ? "bg-gray-800/50 border-gray-700 hover:border-emerald-500"
                        : "bg-white border-gray-200 hover:border-emerald-500"
                    }`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6
                    ${isDark ? "bg-emerald-500/20" : "bg-emerald-100"}`}
                  >
                    <useCase.icon
                      className={`w-7 h-7 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                    />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {useCase.title}
                  </h3>
                  <p
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {useCase.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`py-24 px-4 ${isDark ? "bg-gray-900/50" : "bg-white"}`}
        >
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2
              className={`text-4xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Start Diagramming Today
            </h2>
            <p
              className={`text-lg mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Create professional diagrams in minutes. No learning curve
              required.
            </p>

            <button
              onClick={handleCreateDiagram}
              className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 hover:bg-emerald-700 
                       text-white font-bold text-lg rounded-xl transition-all hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              Create Your First Diagram
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

export default LandingPage;
