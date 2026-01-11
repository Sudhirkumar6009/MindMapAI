import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import InputPanel from '../components/InputPanel';
import GraphView from '../components/GraphView';
import StatsPanel from '../components/StatsPanel';
import LoadingOverlay from '../components/LoadingOverlay';
import api from '../api';
import { simplifyGraphLabels } from '../utils/labelSimplifier';
import { 
  getDemoUsage, 
  incrementDemoUsage as incrementSecureDemoUsage,
  validateStorage 
} from '../utils/demoStorage';
import { Brain, LogIn } from 'lucide-react';

const DEMO_LIMIT = 3;

function CreatePage() {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [sourceText, setSourceText] = useState('');
  const [sourceType, setSourceType] = useState('text');
  const [demoUsage, setDemoUsage] = useState(() => {
    const { usage } = validateStorage();
    return usage;
  });

  const isDemo = searchParams.get('mode') === 'demo';
  const loadHistoryId = searchParams.get('loadHistory');

  // Load history item if specified
  useEffect(() => {
    if (loadHistoryId && isAuthenticated) {
      loadHistoryItem(loadHistoryId);
    }
  }, [loadHistoryId, isAuthenticated]);

  const loadHistoryItem = async (id) => {
    try {
      setLoading(true);
      setLoadingStatus('Loading graph...');
      const response = await api.getHistoryItem(id);
      if (response.success) {
        const data = response.data;
        const graphData = data.graphData || {};
        setGraphData({
          success: true,
          concepts: graphData.concepts || data.concepts || [],
          relationships: graphData.relationships || data.relationships || [],
          stats: {
            conceptCount: data.conceptCount || graphData.concepts?.length || 0,
            relationshipCount: data.relationshipCount || graphData.relationships?.length || 0,
          }
        });
        setSourceText(data.title || 'Loaded Graph');
        setSourceType(data.sourceType || 'text');
      }
    } catch (err) {
      setError('Failed to load graph');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const incrementDemoUsage = () => {
    if (!isAuthenticated) {
      const newUsage = incrementSecureDemoUsage();
      setDemoUsage(newUsage);
    }
  };

  const handleTextSubmit = async (text, options) => {
    if (!isAuthenticated && demoUsage >= DEMO_LIMIT) {
      setError('Demo limit reached! Please sign in for unlimited access.');
      navigate('/login');
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
        incrementDemoUsage();
        
        if (isAuthenticated) {
          const title = text.substring(0, 50).trim() + (text.length > 50 ? '...' : '');
          api.saveToHistory(title, 'text', text.substring(0, 200), result).catch(console.error);
        }
      } else {
        setError(result.error || 'Failed to process text');
        setErrorDetails({ suggestions: result.suggestions || [], analysis: result.analysis || null });
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.error || err.message || 'An error occurred');
      setErrorDetails({ suggestions: errorData?.suggestions || [], analysis: errorData?.analysis || null });
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handlePDFUpload = async (file, options) => {
    if (!isAuthenticated && demoUsage >= DEMO_LIMIT) {
      setError('Demo limit reached! Please sign in for unlimited access.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setSourceType('pdf');
    
    try {
      setLoadingStatus('Reading PDF...');
      await new Promise(r => setTimeout(r, 500));
      
      setLoadingStatus('Extracting concepts...');
      const result = await api.uploadPDF(file, options);
      
      if (result.success) {
        setLoadingStatus('Building graph...');
        await new Promise(r => setTimeout(r, 300));
        setGraphData(result);
        setSourceText(`[PDF: ${file.name}]`);
        incrementDemoUsage();
        
        if (isAuthenticated) {
          api.saveToHistory(file.name, 'pdf', `PDF Document: ${file.name}`, result).catch(console.error);
        }
      } else {
        setError(result.error || 'Failed to process PDF');
        setErrorDetails({ suggestions: result.suggestions || [], analysis: result.analysis || null });
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.error || err.message || 'An error occurred');
      setErrorDetails({ suggestions: errorData?.suggestions || [], analysis: errorData?.analysis || null });
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleImportMMAI = (data, styling) => {
    const simplifiedData = simplifyGraphLabels(data);
    setGraphData(simplifiedData);
    setSourceText('Imported Mind Map');
    setSourceType('import');
  };

  const handleGitHubAnalyze = async (url) => {
    if (!isAuthenticated && demoUsage >= DEMO_LIMIT) {
      setError('Demo limit reached! Please sign in for unlimited access.');
      navigate('/login');
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
        
        const concepts = result.data.nodes.map(n => ({
          name: n.label,
          category: n.category,
          importance: n.importance,
          section: n.section || 'main',
        }));
        
        const relationships = result.data.edges.map(e => ({
          source: result.data.nodes.find(n => n.id === e.source)?.label,
          target: result.data.nodes.find(n => n.id === e.target)?.label,
          relation: e.label,
        })).filter(r => r.source && r.target);
        
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
        
        const graphResult = {
          success: true,
          concepts,
          relationships,
          nodes,
          edges,
          sections: result.sections || [],
          stats: { ...result.stats, conceptCount: concepts.length, relationshipCount: relationships.length },
          repoInfo: result.repoInfo,
          metadata: result.metadata,
        };
        
        setGraphData(graphResult);
        setSourceText(`GitHub: ${result.repoInfo.fullName}`);
        incrementDemoUsage();
        
        if (isAuthenticated) {
          api.saveToHistory(
            `📦 ${result.repoInfo.name}`,
            'github',
            `GitHub Repository: ${result.repoInfo.fullName}`,
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

  const handleRefine = async () => {
    if (!graphData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      setLoadingStatus('Refining graph...');
      const result = await api.refineGraph(sourceText, graphData.concepts, graphData.relationships);
      
      if (result.success) {
        setGraphData(prev => ({ ...prev, ...result }));
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

  const handleAnalyzeInDepth = async (sectionName) => {
    if (!graphData?.repoInfo) return;
    
    setLoading(true);
    setError(null);
    
    try {
      setLoadingStatus(`Analyzing ${sectionName} in-depth...`);
      const result = await api.analyzeInDepth(sectionName, graphData.concepts, graphData.relationships, graphData.repoInfo);
      
      if (result.success) {
        setLoadingStatus('Building detailed diagram...');
        await new Promise(r => setTimeout(r, 300));
        
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
          stats: { ...result.stats, conceptCount: nodes.length, relationshipCount: edges.length },
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

  // Page content that's shared between authenticated and demo layouts
  const PageContent = () => (
    <>
      {/* Demo Usage Banner for non-authenticated users */}
      {!isAuthenticated && (
        <div className={`mb-6 p-4 rounded-xl border-2 flex items-center justify-between gap-4 flex-wrap
          ${isDark 
            ? 'bg-gradient-to-r from-emerald-900/30 to-purple-900/30 border-emerald-700/50' 
            : 'bg-gradient-to-r from-emerald-50 to-purple-50 border-emerald-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
              ${demoUsage >= DEMO_LIMIT 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-emerald-500/20 text-emerald-400'}`}>
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
          <Link
            to="/login"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Sign In
          </Link>
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
    </>
  );

  // Error Modal Component
  const ErrorModal = () => error && (
    <div className={`fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4
                    ${isDark ? 'bg-dark-950/80' : 'bg-dark-900/40'}`}>
      <div className={`relative w-full max-w-lg rounded-2xl border-2 shadow-2xl overflow-hidden
                      ${isDark ? 'bg-dark-800 border-red-500/30' : 'bg-white border-red-200'}`}>
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
        </div>
        
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
  );

  // Authenticated user layout (sidebar provided by AppLayout)
  if (isAuthenticated) {
    return (
      <div>
        <PageContent />
        {loading && <LoadingOverlay status={loadingStatus} />}
        <ErrorModal />
      </div>
    );
  }

  // Demo user layout with simple header
  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-950' : 'bg-white'}`}>
      {/* Simple Demo Header */}
      <header className={`border-b sticky top-0 z-40 transition-colors duration-300
        ${isDark 
          ? 'border-dark-800 bg-dark-900/80 backdrop-blur-xl' 
          : 'border-gray-200 bg-white/80 backdrop-blur-xl'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg shadow-primary-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">MindMap AI</h1>
                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                  Demo Mode
                </p>
              </div>
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 
                       hover:from-primary-500 hover:to-primary-400 rounded-xl font-semibold text-sm 
                       transition-all shadow-lg shadow-primary-500/25 text-white"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <PageContent />
      </main>
      
      {loading && <LoadingOverlay status={loadingStatus} />}
      <ErrorModal />
    </div>
  );
}

export default CreatePage;
