import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  FileText, 
  Github, 
  Image, 
  Zap, 
  ArrowRight, 
  ChevronDown,
  Network,
  Lightbulb,
  Target,
  Users,
  Star,
  Play,
  CheckCircle2,
  Workflow,
  BarChart3,
  Shield,
  Clock,
  Sun,
  Moon,
  LogIn
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import { getDemoUsage } from '../utils/demoStorage';

// ============================================
// LANDING PAGE HEADER COMPONENT
// ============================================
const LandingHeader = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? `${isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border-b shadow-lg` 
          : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                MindMap AI
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                AI-Powered Knowledge Maps
              </p>
            </div>
          </Link>

          {/* Right side - Theme toggle & Profile/Login */}
          <div className="flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border-2 transition-all duration-300 hover:scale-105
                ${isDark
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-yellow-400'
                  : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile / Login */}
            {!loading && (
              isAuthenticated ? (
                <UserMenu onNavigate={(path) => navigate(`/${path}`)} />
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 
                           hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-sm 
                           transition-all shadow-lg shadow-blue-500/25 text-white hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// ============================================
// ANIMATED BACKGROUND COMPONENT
// ============================================
const AnimatedBackground = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div 
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse-slow
          ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`}
        style={{ animationDuration: '8s' }}
      />
      <div 
        className={`absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 animate-pulse-slow
          ${isDark ? 'bg-purple-600' : 'bg-purple-400'}`}
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />
      <div 
        className={`absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse-slow
          ${isDark ? 'bg-cyan-600' : 'bg-cyan-400'}`}
        style={{ animationDuration: '12s', animationDelay: '4s' }}
      />
      
      {/* Grid pattern */}
      <div 
        className={`absolute inset-0 opacity-[0.03]`}
        style={{
          backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), 
                           linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
};

// ============================================
// FEATURE CARD COMPONENT
// ============================================
const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`group relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer
        ${isDark 
          ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
          : 'bg-white/70 border-gray-200 hover:border-gray-300 hover:shadow-xl'}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        hover:scale-[1.02] hover:-translate-y-1`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`} />
      
      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${gradient}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      {/* Content */}
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
      
      {/* Arrow indicator */}
      <div className={`mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2
        ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
        Learn more <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ value, label, icon: Icon, delay = 0 }) => {
  const { isDark } = useTheme();
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  useEffect(() => {
    if (isVisible) {
      const numValue = parseInt(value.replace(/\D/g, ''));
      const duration = 2000;
      const steps = 60;
      const increment = numValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          setCount(numValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isVisible, value]);
  
  const displayValue = value.includes('+') ? `${count}+` : value.includes('K') ? `${count}K` : count.toString();
  
  return (
    <div 
      className={`text-center p-6 rounded-2xl transition-all duration-500
        ${isDark ? 'bg-gray-800/30' : 'bg-white/50'}
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Icon className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
      <div className={`text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {displayValue}
      </div>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
    </div>
  );
};

// ============================================
// HOW IT WORKS STEP
// ============================================
const StepCard = ({ number, title, description, icon: Icon, isLast = false }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="relative flex items-start gap-4">
      {/* Connector line */}
      {!isLast && (
        <div className={`absolute left-6 top-14 w-0.5 h-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      )}
      
      {/* Step number */}
      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0
        bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg`}>
        {number}
      </div>
      
      {/* Content */}
      <div className="pb-12">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>
    </div>
  );
};

// ============================================
// MAIN LANDING PAGE COMPONENT
// ============================================
function LandingPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentDemoUsage, setCurrentDemoUsage] = useState(0);

  // Sync demo usage from storage
  useEffect(() => {
    setCurrentDemoUsage(getDemoUsage());
  }, []);

  // Handle try demo - navigate to create page
  const handleTryDemo = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/create?mode=demo');
    }
  };
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const features = [
    {
      icon: FileText,
      title: 'Text to Mind Map',
      description: 'Transform any text, article, or document into a beautiful, interactive mind map in seconds.',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
      delay: 100
    },
    {
      icon: Github,
      title: 'GitHub Analyzer',
      description: 'Visualize repository architecture, understand codebases, and explore project structures.',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
      delay: 200
    },
    {
      icon: Image,
      title: 'PDF Support',
      description: 'Upload PDF documents and automatically extract key concepts and relationships.',
      gradient: 'bg-gradient-to-br from-green-500 to-green-700',
      delay: 300
    },
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Powered by Google Gemini 2.5 for accurate concept extraction and intelligent analysis.',
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      delay: 400
    },
    {
      icon: Network,
      title: 'Interactive Graphs',
      description: 'Drag, edit, connect, and customize nodes with React Flow for full graph manipulation.',
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-700',
      delay: 500
    },
    {
      icon: Lightbulb,
      title: 'In-Depth Analysis',
      description: 'Click any concept cluster for deeper AI-powered analysis and expanded insights.',
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-700',
      delay: 600
    }
  ];
  
  const stats = [
    { value: '50+', label: 'Concepts Extracted', icon: Brain },
    { value: '100+', label: 'Relationships Found', icon: Network },
    { value: '5', label: 'Export Formats', icon: FileText },
    { value: '10K', label: 'Graphs Generated', icon: BarChart3 }
  ];
  
  const steps = [
    {
      number: 1,
      title: 'Input Your Content',
      description: 'Paste text, upload a PDF, or enter a GitHub repository URL to get started.',
      icon: FileText
    },
    {
      number: 2,
      title: 'AI Processes Your Data',
      description: 'Our AI agents extract concepts, identify relationships, and structure your knowledge.',
      icon: Brain
    },
    {
      number: 3,
      title: 'Visualize & Explore',
      description: 'View your interactive mind map with multiple layouts, styles, and color palettes.',
      icon: Network
    },
    {
      number: 4,
      title: 'Customize & Export',
      description: 'Edit nodes, add connections, apply filters, and export in various formats.',
      icon: Sparkles
    }
  ];
  
  const remainingDemos = Math.max(0, 3 - currentDemoUsage);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8
              ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}
              animate-fade-in`}
          >
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini 2.5 AI
          </div>
          
          {/* Main heading */}
          <h1 
            className={`text-5xl md:text-7xl font-extrabold mb-6 leading-tight
              ${isDark ? 'text-white' : 'text-gray-900'}
              animate-slide-up`}
            style={{ 
              transform: `translateY(${scrollY * 0.1}px)`,
              opacity: 1 - scrollY * 0.002
            }}
          >
            Transform Ideas into
            <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Visual Knowledge Maps
            </span>
          </h1>
          
          {/* Subtitle */}
          <p 
            className={`text-xl md:text-2xl mb-10 max-w-3xl mx-auto
              ${isDark ? 'text-gray-300' : 'text-gray-600'}
              animate-slide-up`}
            style={{ animationDelay: '200ms' }}
          >
            AI-powered mind map generator for students, researchers, and professionals. 
            Extract concepts from text, PDFs, and GitHub repositories instantly.
          </p>
          
          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
            style={{ animationDelay: '400ms' }}
          >
            <Link
              to="/login"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button
              onClick={handleTryDemo}
              disabled={remainingDemos <= 0 && !isAuthenticated}
              className={`group flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-xl border-2 transition-all duration-300 hover:scale-105
                ${remainingDemos <= 0 && !isAuthenticated
                  ? 'opacity-50 cursor-not-allowed border-gray-500 text-gray-500'
                  : isDark 
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100'}`}
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isAuthenticated ? 'Open App' : 'Try Demo'}
              {!isAuthenticated && (
                <span className={`text-xs px-2 py-0.5 rounded-full ml-1
                  ${remainingDemos <= 0 
                    ? 'bg-red-500/20 text-red-400'
                    : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                  {remainingDemos} left
                </span>
              )}
            </button>
          </div>
          
          {/* Scroll indicator */}
          <div className="animate-bounce">
            <ChevronDown className={`w-8 h-8 mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Powerful Features for Knowledge Visualization
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Everything you need to transform complex information into clear, interactive mind maps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How It Works
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create your mind map in four simple steps
            </p>
          </div>
          
          <div className="max-w-xl mx-auto">
            {steps.map((step, index) => (
              <StepCard key={index} {...step} isLast={index === steps.length - 1} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Use Cases Section */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Built for Everyone
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              From students to professionals, MindMapAI adapts to your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Students',
                description: 'Summarize lecture notes, research papers, and textbooks into visual study guides.',
                features: ['Study notes', 'Exam prep', 'Thesis research']
              },
              {
                icon: Target,
                title: 'Researchers',
                description: 'Map literature reviews, analyze complex papers, and visualize research connections.',
                features: ['Literature mapping', 'Data analysis', 'Paper synthesis']
              },
              {
                icon: Workflow,
                title: 'Developers',
                description: 'Understand codebases, document architecture, and onboard to new projects faster.',
                features: ['Code architecture', 'API documentation', 'Project planning']
              }
            ].map((useCase, index) => (
              <div 
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]
                  ${isDark 
                    ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
              >
                <useCase.icon className={`w-10 h-10 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {useCase.title}
                </h3>
                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {useCase.description}
                </p>
                <ul className="space-y-2">
                  {useCase.features.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Visualize Your Ideas?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join thousands of users transforming complex information into clear visual maps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-gray-900 font-bold text-lg rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105"
            >
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={handleTryDemo}
              disabled={remainingDemos <= 0 && !isAuthenticated}
              className={`group flex items-center gap-2 px-8 py-4 font-bold text-lg rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105
                ${remainingDemos <= 0 && !isAuthenticated
                  ? 'opacity-50 cursor-not-allowed'
                  : ''}`}
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isAuthenticated ? 'Open App' : 'Try Demo'}
              {!isAuthenticated && (
                <span className={`text-xs px-2 py-0.5 rounded-full ml-1 bg-white/20 text-white`}>
                  {remainingDemos} left
                </span>
              )}
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={`py-16 ${isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-100 border-t border-gray-200'}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  MindMapAI
                </span>
              </div>
              <p className={`max-w-md ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Transform complex information into beautiful, interactive mind maps using the power of AI. 
                Built for students, researchers, and professionals.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Product</h4>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:underline">Features</a></li>
                <li><a href="#" className="hover:underline">Pricing</a></li>
                <li><a href="#" className="hover:underline">Documentation</a></li>
                <li><a href="#" className="hover:underline">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Company</h4>
              <ul className={`space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom */}
          <div className={`pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex flex-col md:flex-row items-center justify-between gap-4`}>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2026 MindMapAI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Privacy Policy</a>
              <a href="#" className={`text-sm hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Terms of Service</a>
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
