import { Brain } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function LoadingOverlay({ status }) {
  const { isDark } = useTheme();
  
  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center
                    ${isDark ? 'bg-dark-950/90' : 'bg-white/90'}`}>
      <div className="text-center space-y-6">
        <div className="relative">
          <div className={`w-20 h-20 rounded-full border-4 border-t-primary-500 
                        animate-spin mx-auto ${isDark ? 'border-dark-700' : 'border-dark-200'}`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary-400 animate-pulse" />
          </div>
        </div>
        
        <div>
          <p className={`text-lg font-medium ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>
            {status || 'Processing'}
            <span className="loading-dots"></span>
          </p>
          <p className={`text-sm mt-2 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
            AI is analyzing your content
          </p>
        </div>

        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
