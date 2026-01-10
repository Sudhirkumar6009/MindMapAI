import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import GraphView from './components/GraphView';
import StatsPanel from './components/StatsPanel';
import LoadingOverlay from './components/LoadingOverlay';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import api from './api';
import { simplifyGraphLabels } from './utils/labelSimplifier';
import { 
  getDemoUsage, 
  setDemoUsage as setSecureDemoUsage, 
  incrementDemoUsage as incrementSecureDemoUsage,
  validateStorage 
} from './utils/demoStorage';

// Demo usage limit
const DEMO_LIMIT = 3;

// App views/screens
const VIEWS = {
  LANDING: 'landing',
  DASHBOARD: 'dashboard',
  CREATE: 'create',
  SETTINGS: 'settings'
};

function AppContent() {
  // Current view state - replaces simple showApp boolean
  const [currentView, setCurrentView] = useState(VIEWS.LANDING);
  
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState(null);
  const [sourceText, setSourceText] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sourceType, setSourceType] = useState('text');
  
  // Initialize demo usage from secure storage
  const [demoUsage, setDemoUsage] = useState(() => {
    const { usage } = validateStorage();
    return usage;
  });

  const [errorDetails, setErrorDetails] = useState(null);

  const { isAuthenticated, user } = useAuth();

  // Validate and sync storage on mount
  useEffect(() => {
    const { usage } = validateStorage();
    setDemoUsage(usage);
  }, []);

  // Redirect authenticated users to dashboard when they log in
  useEffect(() => {
    if (isAuthenticated && currentView === VIEWS.LANDING) {
      setCurrentView(VIEWS.DASHBOARD);
    }
  }, [isAuthenticated]);

  // Check if demo limit reached (only for non-authenticated users)
  const isDemoLimitReached = !isAuthenticated && demoUsage >= DEMO_LIMIT;

  // Increment demo usage (only for non-authenticated users)
  const incrementDemoUsage = () => {
    // IMPORTANT: Only increment for non-authenticated users
    if (!isAuthenticated) {
      const newUsage = incrementSecureDemoUsage();
      setDemoUsage(newUsage);
    }
    // For authenticated users, we don't track or increment demo usage
  };

  const handleTextSubmit = async (text, options) => {
    // Check demo limit ONLY for non-authenticated users
    if (!isAuthenticated && demoUsage >= DEMO_LIMIT) {
      setError('Demo limit reached! Please sign in for unlimited access.');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setSourceText(text);
    setSourceType('text');
    
    try {
      setLoadingStatus('Validating content...');
      await new Promise(r => setTimeout(r, 300));
      
      setLoadingStatus('Extracting concepts...');
      await new Promise(r => setTimeout(r, 500));
      
      setLoadingStatus('Mapping relationships...');
      const result = await api.extractFromText(text, options);
      
      if (result.success) {
        setLoadingStatus('Building graph...');
        await new Promise(r => setTimeout(r, 300));
        setGraphData(result);
        
        // Increment demo usage for non-authenticated users
        incrementDemoUsage();
        
        if (isAuthenticated) {
          const title = text.substring(0, 50).trim() + (text.length > 50 ? '...' : '');
          api.saveToHistory(title, 'text', text.substring(0, 200), result)
            .then(res => console.log('History saved:', res))
            .catch(err => console.error('Failed to save history:', err.response?.data || err.message));
        }
      } else {
        setError(result.error || 'Failed to process text');
        setErrorDetails({
          suggestions: result.suggestions || [],
          analysis: result.analysis || null
        });
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.error || err.message || 'An error occurred');
      setErrorDetails({
        suggestions: errorData?.suggestions || [],
        analysis: errorData?.analysis || null
      });
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handlePDFUpload = async (file, options) => {
    // Check demo limit for non-authenticated users
    if (!isAuthenticated && demoUsage >= DEMO_LIMIT) {
      setError('Demo limit reached! Please sign in for unlimited access.');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setSourceType('pdf');
    
    try {
      setLoadingStatus('Reading PDF...');
      await new Promise(r => setTimeout(r, 500));
      
      setLoadingStatus('Validating content...');
      await new Promise(r => setTimeout(r, 300));
      
      setLoadingStatus('Extracting concepts...');
      const result = await api.uploadPDF(file, options);
      
      if (result.success) {
        setLoadingStatus('Building graph...');
        await new Promise(r => setTimeout(r, 300));
        setGraphData(result);
        setSourceText(`[PDF: ${file.name}]`);
        
        // Increment demo usage for non-authenticated users
        incrementDemoUsage();
        
        if (isAuthenticated) {
          api.saveToHistory(file.name, 'pdf', `PDF Document: ${file.name}`, result).catch(console.error);
        }
      } else {
        setError(result.error || 'Failed to process PDF');
        setErrorDetails({
          suggestions: result.suggestions || [],
          analysis: result.analysis || null
        });
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.error || err.message || 'An error occurred');
      setErrorDetails({
        suggestions: errorData?.suggestions || [],
        analysis: errorData?.analysis || null
      });
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleRefine = async () => {
    if (!graphData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      setLoadingStatus('Refining graph...');
      const result = await api.refineGraph(
        sourceText,
        graphData.concepts,
        graphData.relationships
      );
      
      if (result.success) {
        setGraphData(prev => ({
          ...prev,
          ...result
        }));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleClear = () => {
    setGraphData(null);
    setError(null);
    setSourceText('');
  };

  const handleLoadGraph = (data) => {
    // Simplify edge labels for cleaner visualization
    const simplifiedData = simplifyGraphLabels(data);
    setGraphData({
      success: true,
      ...simplifiedData,
      stats: {
        conceptCount: data.concepts?.length || 0,
        relationshipCount: data.relationships?.length || 0,
        isolatedConcepts: 0
      }
    });
  };

  const handleImportMMAI = (data, styling) => {
    // Simplify edge labels for imported data
    const simplifiedData = simplifyGraphLabels(data);
    setGraphData(simplifiedData);
    setSourceText('Imported Mind Map');
    setSourceType('import');
  };

  const handleGitHubAnalyze = async (url) => {
    // Check demo limit for non-authenticated users
    if (!isAuthenticated && demoUsage >= DEMO_LIMIT) {
      setError('Demo limit reached! Please sign in for unlimited access.');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setSourceType('github');
    
    try {
      setLoadingStatus('Connecting to GitHub...');
      await new Promise(r => setTimeout(r, 300));
      
      setLoadingStatus('Fetching repository structure...');
      await new Promise(r => setTimeout(r, 500));
      
      setLoadingStatus('Analyzing codebase...');
      const result = await api.analyzeGitHub(url);
      
      if (result.success) {
        setLoadingStatus('Building architecture diagram...');
        await new Promise(r => setTimeout(r, 300));
        
        // Build concepts from nodes (include section)
        const concepts = result.data.nodes.map(n => ({
          name: n.label,
          category: n.category,
          importance: n.importance,
          section: n.section || 'main',
        }));
        
        // Build relationships from edges
        const relationships = result.data.edges.map(e => ({
          source: result.data.nodes.find(n => n.id === e.source)?.label,
          target: result.data.nodes.find(n => n.id === e.target)?.label,
          relation: e.label,
        })).filter(r => r.source && r.target);
        
        // Build nodes array for GraphView (with connection counts)
        const connectionCounts = {};
        relationships.forEach(rel => {
          connectionCounts[rel.source] = (connectionCounts[rel.source] || 0) + 1;
          connectionCounts[rel.target] = (connectionCounts[rel.target] || 0) + 1;
        });
        
        const nodes = concepts.map((concept, idx) => ({
          id: `node-${idx}`,
          label: concept.name,
          category: concept.category,
          importance: concept.importance,
          section: concept.section,
          connections: connectionCounts[concept.name] || 0,
        }));
        
        // Build edges array for GraphView
        const edges = relationships.map((rel, idx) => {
          const sourceNode = nodes.find(n => n.label === rel.source);
          const targetNode = nodes.find(n => n.label === rel.target);
          return {
            id: `edge-${idx}`,
            source: sourceNode?.id,
            target: targetNode?.id,
            label: rel.relation,
          };
        }).filter(e => e.source && e.target);
        
        // Transform to standard graph format with both formats
        const graphResult = {
          success: true,
          concepts,
          relationships,
          nodes,
          edges,
          sections: result.sections || [],
          stats: {
            ...result.stats,
            conceptCount: concepts.length,
            relationshipCount: relationships.length,
          },
          repoInfo: result.repoInfo,
          metadata: result.metadata,
        };
        
        setGraphData(graphResult);
        setSourceText(`GitHub: ${result.repoInfo.fullName}`);
        
        // Increment demo usage for non-authenticated users
        incrementDemoUsage();
        
        if (isAuthenticated) {
          api.saveToHistory(
            `📦 ${result.repoInfo.name}`,
            'github',
            `GitHub Repository: ${result.repoInfo.fullName} - ${result.repoInfo.description || 'No description'}`,
            graphResult
          ).catch(console.error);
        }
      } else {
        setError(result.error || 'Failed to analyze repository');
        setErrorDetails({ suggestions: ['Make sure the repository is public', 'Check if the URL is correct'] });
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.message || errorData?.error || err.message || 'Failed to analyze repository');
      setErrorDetails({
        suggestions: [
          'Make sure the repository is public',
          'Check if the URL format is correct (e.g., owner/repo)',
          'Try again in a few minutes if rate limited'
        ]
      });
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleAnalyzeInDepth = async (sectionName) => {
    if (!graphData || !graphData.repoInfo) return;
    
    setLoading(true);
    setError(null);
    
    try {
      setLoadingStatus(`Analyzing ${sectionName} in-depth...`);
      
      const result = await api.analyzeInDepth(
        sectionName,
        graphData.concepts,
        graphData.relationships,
        graphData.repoInfo
      );
      
      if (result.success) {
        setLoadingStatus('Building detailed diagram...');
        await new Promise(r => setTimeout(r, 300));
        
        // Build nodes with connection counts
        const nodes = result.data.nodes;
        const edges = result.data.edges;
        
        const connectionCounts = {};
        edges.forEach(e => {
          const sourceNode = nodes.find(n => n.id === e.source);
          const targetNode = nodes.find(n => n.id === e.target);
          if (sourceNode) connectionCounts[sourceNode.label] = (connectionCounts[sourceNode.label] || 0) + 1;
          if (targetNode) connectionCounts[targetNode.label] = (connectionCounts[targetNode.label] || 0) + 1;
        });
        
        const nodesWithConnections = nodes.map(n => ({
          ...n,
          connections: connectionCounts[n.label] || 0,
        }));
        
        // Create in-depth graph result
        const depthResult = {
          success: true,
          concepts: nodes.map(n => ({ name: n.label, category: n.category, importance: n.importance, section: n.section })),
          relationships: edges.map(e => ({
            source: nodes.find(n => n.id === e.source)?.label,
            target: nodes.find(n => n.id === e.target)?.label,
            relation: e.label,
          })),
          nodes: nodesWithConnections,
          edges,
          insights: result.insights,
          sections: [{ id: sectionName, name: sectionName, description: `In-depth analysis of ${sectionName}` }],
          stats: {
            ...result.stats,
            conceptCount: nodes.length,
            relationshipCount: edges.length,
          },
          repoInfo: graphData.repoInfo,
          isInDepth: true,
          parentSection: sectionName,
        };
        
        setGraphData(depthResult);
        setSourceText(`${sectionName} (In-Depth)`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze in-depth');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const { isDark } = useTheme();

  // Handle try demo click - just navigate, increment happens in LandingPage
  const handleTryDemo = () => {
    if (!isAuthenticated && demoUsage >= DEMO_LIMIT) {
      setShowAuthModal(true);
    } else {
      setCurrentView(VIEWS.CREATE);
    }
  };

  // Navigation handler
  const handleNavigate = (view) => {
    if (Object.values(VIEWS).includes(view)) {
      setCurrentView(view);
      // Clear graph data when navigating away from create view
      if (view !== VIEWS.CREATE) {
        setGraphData(null);
      }
    }
  };

  // Show landing page for non-authenticated users
  if (currentView === VIEWS.LANDING && !isAuthenticated) {
    return (
      <div className={`${isDark ? 'dark' : 'light'}`}>
        <LandingPage 
          onGetStarted={() => setCurrentView(VIEWS.CREATE)} 
          onLogin={() => setShowAuthModal(true)}
          onTryDemo={handleTryDemo}
          demoUsage={demoUsage}
          setDemoUsage={setDemoUsage}
          onShowHistory={() => setShowHistoryModal(true)}
        />
        {/* Auth Modal for landing page */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        {/* History Modal for landing page */}
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          onLoadGraph={(data) => {
            setGraphData(data);
            setShowHistoryModal(false);
            setCurrentView(VIEWS.CREATE);
          }}
        />
      </div>
    );
  }

  // Show Dashboard for authenticated users
  if (currentView === VIEWS.DASHBOARD && isAuthenticated) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-dark-950' : 'light bg-white'}`}>
        <Header 
          onLogin={() => setShowAuthModal(true)}
          onShowHistory={() => setShowHistoryModal(true)}
          onBackToLanding={() => { setCurrentView(VIEWS.LANDING); setGraphData(null); }}
          onNavigate={handleNavigate}
          currentView={currentView}
        />
        <main className="container mx-auto px-4 py-8">
          <Dashboard 
            onNavigate={handleNavigate}
            onLoadGraph={(data) => {
              handleLoadGraph(data);
              setCurrentView(VIEWS.CREATE);
            }}
          />
        </main>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <HistoryModal 
          isOpen={showHistoryModal} 
          onClose={() => setShowHistoryModal(false)}
          onLoadGraph={(data) => {
            handleLoadGraph(data);
            setShowHistoryModal(false);
            setCurrentView(VIEWS.CREATE);
          }}
        />
      </div>
    );
  }

  // Show Settings page
  if (currentView === VIEWS.SETTINGS && isAuthenticated) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-dark-950' : 'light bg-white'}`}>
        <Header 
          onLogin={() => setShowAuthModal(true)}
          onShowHistory={() => setShowHistoryModal(true)}
          onBackToLanding={() => { setCurrentView(VIEWS.DASHBOARD); }}
          onNavigate={handleNavigate}
          currentView={currentView}
        />
        <main className="container mx-auto px-4 py-8">
          <Settings onNavigate={handleNavigate} />
        </main>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  // Default: Show graph creation view (CREATE view)
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-dark-950' : 'light bg-white'}`}>
      <Header 
        onLogin={() => setShowAuthModal(true)}
        onShowHistory={() => setShowHistoryModal(true)}
        onBackToLanding={() => { 
          setCurrentView(isAuthenticated ? VIEWS.DASHBOARD : VIEWS.LANDING); 
          setGraphData(null); 
        }}
        onNavigate={handleNavigate}
        currentView={currentView}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Demo Usage Banner for non-authenticated users */}
        {!isAuthenticated && (
          <div className={`mb-6 p-4 rounded-xl border-2 flex items-center justify-between gap-4 flex-wrap
            ${isDark 
              ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                ${demoUsage >= DEMO_LIMIT 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-blue-500/20 text-blue-400'}`}>
                {DEMO_LIMIT - demoUsage}
              </div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {demoUsage >= DEMO_LIMIT 
                    ? 'Demo limit reached!' 
                    : `${DEMO_LIMIT - demoUsage} free graph${DEMO_LIMIT - demoUsage !== 1 ? 's' : ''} remaining`}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sign in for unlimited access
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
            >
              Sign In
            </button>
          </div>
        )}

        {!graphData ? (
          <InputPanel
            onTextSubmit={handleTextSubmit}
            onPDFUpload={handlePDFUpload}
            onImportMMAI={handleImportMMAI}
            onGitHubAnalyze={handleGitHubAnalyze}
            disabled={loading}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <StatsPanel stats={graphData.stats} refinementInfo={graphData.refinementInfo} />
              <div className="flex gap-3">
                <button
                  onClick={handleRefine}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 
                           rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 text-white"
                >
                  Refine Graph
                </button>
                <button
                  onClick={handleClear}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all border-2
                            ${isDark 
                              ? 'bg-dark-800 hover:bg-dark-700 border-dark-600 text-dark-200' 
                              : 'bg-white hover:bg-dark-50 border-dark-200 text-dark-700'
                            }`}
                >
                  New Graph
                </button>
              </div>
            </div>
            
            <GraphView 
              data={graphData} 
              metadata={{
                title: sourceText.substring(0, 50) || 'Mind Map',
                sourceType: sourceType
              }}
              onAnalyzeInDepth={handleAnalyzeInDepth}
            />
          </div>
        )}
      </main>
      
      {loading && <LoadingOverlay status={loadingStatus} />}
      
      {/* Error Modal - Full Screen with Blur */}
      {error && (
        <div className={`fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4
                        ${isDark ? 'bg-dark-950/80' : 'bg-dark-900/40'}`}>
          <div className={`relative w-full max-w-lg rounded-2xl border-2 shadow-2xl overflow-hidden
                          ${isDark 
                            ? 'bg-dark-800 border-red-500/30' 
                            : 'bg-white border-red-200'
                          }`}>
            {/* Header with gradient */}
            <div className={`p-6 border-b bg-gradient-to-br from-red-500/10 to-orange-500/10
                            ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>
                    Unable to Generate Graph
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                    The content couldn't be processed
                  </p>
                </div>
              </div>
            </div>
            
            {/* Error Content */}
            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                <p className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {error}
                </p>
              </div>
              
              {errorDetails?.suggestions?.length > 0 && (
                <div className="space-y-3">
                  <p className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>
                    <span className="text-lg">💡</span> How to fix this:
                  </p>
                  <ul className="space-y-2">
                    {errorDetails.suggestions.map((suggestion, i) => (
                      <li key={i} className={`flex items-start gap-3 text-sm p-3 rounded-lg
                                             ${isDark ? 'bg-dark-700/50 text-dark-300' : 'bg-dark-50 text-dark-600'}`}>
                        <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {errorDetails?.analysis && (
                <div className={`flex flex-wrap gap-3 pt-2 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                  {errorDetails.analysis.wordCount !== undefined && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${isDark ? 'bg-dark-700' : 'bg-dark-100'}`}>
                      📝 Words: {errorDetails.analysis.wordCount}
                    </span>
                  )}
                  {errorDetails.analysis.uniqueWords !== undefined && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${isDark ? 'bg-dark-700' : 'bg-dark-100'}`}>
                      🔤 Unique: {errorDetails.analysis.uniqueWords}
                    </span>
                  )}
                  {errorDetails.analysis.minRequired !== undefined && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${isDark ? 'bg-dark-700' : 'bg-dark-100'}`}>
                      ✓ Required: {errorDetails.analysis.minRequired}
                    </span>
                  )}
                  {errorDetails.analysis.charCount !== undefined && (
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium
                                    ${isDark ? 'bg-dark-700' : 'bg-dark-100'}`}>
                      📄 Characters: {errorDetails.analysis.charCount}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer with button */}
            <div className={`p-4 border-t ${isDark ? 'border-dark-700 bg-dark-900/50' : 'border-dark-200 bg-dark-50'}`}>
              <button
                onClick={() => { setError(null); setErrorDetails(null); }}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 
                         text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <HistoryModal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)}
        onLoadGraph={handleLoadGraph}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
