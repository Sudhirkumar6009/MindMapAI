import { Circle, GitBranch, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function StatsPanel({ stats, refinementInfo }) {
  const { isDark } = useTheme();
  
  if (!stats) return null;

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary-500/20 rounded-lg">
          <Circle className="w-4 h-4 text-primary-400" />
        </div>
        <div>
          <p className={`text-2xl font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>{stats.conceptCount}</p>
          <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Concepts</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <GitBranch className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <p className={`text-2xl font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>{stats.relationshipCount}</p>
          <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Relationships</p>
        </div>
      </div>

      {stats.isolatedConcepts > 0 && (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>{stats.isolatedConcepts}</p>
            <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Isolated</p>
          </div>
        </div>
      )}

      {refinementInfo && (
        <div className={`ml-4 pl-4 border-l ${isDark ? 'border-dark-700' : 'border-dark-300'}`}>
          <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
            Refined from {refinementInfo.originalConceptCount} concepts
          </p>
          <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
            {refinementInfo.iterations} iteration{refinementInfo.iterations !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

export default StatsPanel;
