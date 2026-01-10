import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import GraphView from './components/GraphView';
import StatsPanel from './components/StatsPanel';
import LoadingOverlay from './components/LoadingOverlay';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import api from './api';
import { simplifyGraphLabels } from './utils/labelSimplifier';

function AppContent() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState(null);
  const [sourceText, setSourceText] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sourceType, setSourceType] = useState('text');

  const [errorDetails, setErrorDetails] = useState(null);

  const { isAuthenticated } = useAuth();

  const handleTextSubmit = async (text, options) => {
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

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-dark-950' : 'light bg-white'}`}>
      <Header 
        onLogin={() => setShowAuthModal(true)}
        onShowHistory={() => setShowHistoryModal(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {!graphData ? (
          <InputPanel
            onTextSubmit={handleTextSubmit}
            onPDFUpload={handlePDFUpload}
            onImportMMAI={handleImportMMAI}
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
            />
          </div>
        )}
        
        {error && (
          <div className={`mt-6 p-5 rounded-xl border-2 
                         ${isDark 
                           ? 'bg-red-500/10 border-red-500/30' 
                           : 'bg-red-50 border-red-200'
                         }`}>
            <div className={`flex items-start gap-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                
                {errorDetails?.suggestions?.length > 0 && (
                  <div className="mt-3">
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                      💡 Suggestions:
                    </p>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                      {errorDetails.suggestions.map((suggestion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary-500">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {errorDetails?.analysis && (
                  <div className={`mt-3 text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                    {errorDetails.analysis.wordCount !== undefined && (
                      <span>Words: {errorDetails.analysis.wordCount} </span>
                    )}
                    {errorDetails.analysis.uniqueWords !== undefined && (
                      <span>• Unique: {errorDetails.analysis.uniqueWords} </span>
                    )}
                    {errorDetails.analysis.minRequired !== undefined && (
                      <span>• Required: {errorDetails.analysis.minRequired}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {loading && <LoadingOverlay status={loadingStatus} />}
      
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
