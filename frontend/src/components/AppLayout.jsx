import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';

/**
 * AppLayout - Wraps authenticated pages with sidebar navigation
 */
function AppLayout({ children }) {
  const { isDark } = useTheme();

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {/* Mobile header spacer */}
        <div className="h-16 lg:hidden" />
        
        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
