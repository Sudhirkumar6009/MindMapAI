import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getDemoUsage, incrementDemoUsage } from '../utils/demoStorage';

const DEMO_LIMIT = 3;

function DemoPage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Check demo limit
    const currentUsage = getDemoUsage();
    if (currentUsage >= DEMO_LIMIT) {
      // Demo limit reached, redirect to login
      navigate('/login', { 
        replace: true,
        state: { message: 'Demo limit reached. Please sign in for unlimited access.' }
      });
      return;
    }

    // Navigate to create page with demo mode
    navigate('/create?mode=demo', { replace: true });
  }, [isAuthenticated, navigate]);

  // Show loading while redirecting
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Starting demo...</p>
      </div>
    </div>
  );
}

export default DemoPage;
