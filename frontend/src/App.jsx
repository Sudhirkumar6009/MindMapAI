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
