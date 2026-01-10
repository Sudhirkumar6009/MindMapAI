import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Zap, Settings, ChevronDown, ChevronUp, FileUp, Github, Loader2 } from 'lucide-react';
import ImportMMAI from './ImportMMAI';
import { useTheme } from '../context/ThemeContext';

function InputPanel({ onTextSubmit, onPDFUpload, onImportMMAI, onGitHubAnalyze, disabled }) {
  const { isDark } = useTheme();
  const [text, setText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'pdf', 'github'
  const [showOptions, setShowOptions] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [options, setOptions] = useState({
    refine: true,
    maxIterations: 2
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onPDFUpload(acceptedFiles[0], options);
    }
  }, [onPDFUpload, options]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length >= 50) {
      onTextSubmit(text, options);
    }
  };

  const handleGitHubSubmit = (e) => {
    e.preventDefault();
    if (githubUrl.trim() && isValidGitHubUrl(githubUrl)) {
      onGitHubAnalyze(githubUrl);
    }
  };

  const isValidGitHubUrl = (url) => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\s#?]+)/,
      /^([^\/\s]+)\/([^\/\s]+)$/,
    ];
    return patterns.some(p => p.test(url.trim()));
  };

  const tabs = [
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'pdf', label: 'PDF', icon: Upload },
    { id: 'github', label: 'GitHub', icon: Github },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          <span className="gradient-text">Transform Text</span>
          <br />
          <span className={isDark ? 'text-dark-100' : 'text-dark-900'}>into Knowledge Graphs</span>
        </h2>
        <p className={`max-w-2xl mx-auto ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
          Paste your text, upload a PDF, or analyze a GitHub repository. Our AI will extract 
          key concepts and map relationships to create an interactive knowledge graph.
        </p>
      </div>

      {/* Tab Selector */}
      <div className={`flex rounded-xl p-1 mx-auto max-w-md ${isDark ? 'bg-dark-800' : 'bg-dark-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                : isDark
                  ? 'text-dark-400 hover:text-dark-200'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Text Input */}
      {activeTab === 'text' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here (minimum 50 characters)..."
              disabled={disabled}
              className={`w-full h-64 p-4 border-2 rounded-xl resize-none focus:outline-none 
                       focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                       disabled:opacity-50 transition-all
                       ${isDark 
                         ? 'bg-dark-800 border-dark-700 text-dark-100 placeholder-dark-500' 
                         : 'bg-white border-dark-200 text-dark-900 placeholder-dark-400'
                       }`}
            />
            <div className={`absolute bottom-3 right-3 text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
              {text.length} characters
            </div>
          </div>
          
          <button
            type="submit"
            disabled={disabled || text.trim().length < 50}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-purple-600 
                     hover:from-primary-500 hover:to-purple-500 rounded-xl font-bold text-white
                     flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/25
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5" />
            Generate Mind Map
          </button>
        </form>
      )}

      {/* PDF Upload */}
      {activeTab === 'pdf' && (
        <div
          {...getRootProps()}
          className={`h-64 border-2 border-dashed rounded-xl flex flex-col items-center 
                    justify-center gap-4 transition-all cursor-pointer
                    ${isDragActive 
                      ? 'border-primary-500 bg-primary-500/10' 
                      : isDark
                        ? 'border-dark-600 hover:border-dark-500 bg-dark-800/50'
                        : 'border-dark-300 hover:border-dark-400 bg-dark-50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary-500/20' : isDark ? 'bg-dark-700' : 'bg-dark-100'}`}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary-400' : isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          </div>
          <div className="text-center">
            <p className={`font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>
              {isDragActive ? 'Drop your PDF here' : 'Upload PDF Document'}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
              Drag & drop or click to browse
            </p>
          </div>
          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
            <FileText className="w-4 h-4" />
            PDF files up to 10MB
          </div>
        </div>
      )}

      {/* GitHub Input */}
      {activeTab === 'github' && (
        <form onSubmit={handleGitHubSubmit} className="space-y-4">
          <div className={`p-6 rounded-xl border-2 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-dark-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-dark-100'}`}>
                <Github className={`w-6 h-6 ${isDark ? 'text-dark-300' : 'text-dark-600'}`} />
              </div>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>GitHub Repository Analyzer</h3>
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                  Extract architecture diagram from any public repository
                </p>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/owner/repo or owner/repo"
                disabled={disabled}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none 
                         focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                         disabled:opacity-50 transition-all
                         ${isDark 
                           ? 'bg-dark-900 border-dark-600 text-dark-100 placeholder-dark-500' 
                           : 'bg-dark-50 border-dark-200 text-dark-900 placeholder-dark-400'
                         }`}
              />
              {githubUrl && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium
                  ${isValidGitHubUrl(githubUrl) ? 'text-green-500' : 'text-red-400'}`}>
                  {isValidGitHubUrl(githubUrl) ? '✓ Valid' : '✗ Invalid'}
                </div>
              )}
            </div>

            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-dark-900/50' : 'bg-dark-50'}`}>
              <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                <strong>What we analyze:</strong> README, package files, source structure, key modules, and dependencies to create an architecture diagram.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled || !githubUrl.trim() || !isValidGitHubUrl(githubUrl)}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-gray-700 to-gray-900 
                     hover:from-gray-600 hover:to-gray-800 rounded-xl font-bold text-white
                     flex items-center justify-center gap-2 transition-all shadow-lg 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            Analyze Repository
          </button>
        </form>
      )}

      <div className={`rounded-xl overflow-hidden border-2 ${isDark ? 'bg-dark-800/50 border-dark-700' : 'bg-white border-dark-200'}`}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors
                    ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-dark-50'}`}
        >
          <div className="flex items-center gap-2">
            <Settings className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>Advanced Options</span>
          </div>
          {showOptions ? (
            <ChevronUp className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          )}
        </button>
        
        {showOptions && (
          <div className={`px-4 py-4 border-t space-y-4 ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={options.refine}
                onChange={(e) => setOptions(o => ({ ...o, refine: e.target.checked }))}
                className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 
                         focus:ring-primary-500/50"
              />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>Auto-refine graph</p>
                <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>Merge similar concepts and find hidden relationships</p>
              </div>
            </label>
            
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>Refinement iterations</label>
              <input
                type="range"
                min="1"
                max="3"
                value={options.maxIterations}
                onChange={(e) => setOptions(o => ({ ...o, maxIterations: parseInt(e.target.value) }))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isDark ? 'bg-dark-700' : 'bg-dark-200'}`}
              />
              <div className={`flex justify-between text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                <span>Fast (1)</span>
                <span>Balanced (2)</span>
                <span>Deep (3)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4 text-center">
        {[
          { icon: '🧠', title: 'Concept Extraction', desc: 'AI identifies key ideas and entities' },
          { icon: '🔗', title: 'Relationship Mapping', desc: 'Discovers connections between concepts' },
          { icon: '🐙', title: 'GitHub Analysis', desc: 'Extract architecture from repos' },
          { icon: '✨', title: 'Smart Refinement', desc: 'Agentic loop optimizes the graph' }
        ].map((feature, i) => (
          <div key={i} className={`p-5 rounded-xl border-2 transition-all hover:scale-105
                                 ${isDark 
                                   ? 'bg-dark-800/50 border-dark-700 hover:border-dark-600' 
                                   : 'bg-white border-dark-200 hover:border-dark-300'
                                 }`}>
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className={`font-bold ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>{feature.title}</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Import MMAI Section */}
      <div className={`rounded-xl overflow-hidden border-2 ${isDark ? 'bg-dark-800/50 border-dark-700' : 'bg-white border-dark-200'}`}>
        <button
          onClick={() => setShowImport(!showImport)}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors
                    ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-dark-50'}`}
        >
          <div className="flex items-center gap-2">
            <FileUp className="w-4 h-4 text-primary-400" />
            <span className={`text-sm font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>Import Saved Mind Map</span>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-500/20 text-primary-400 rounded">
              .mmai
            </span>
          </div>
          {showImport ? (
            <ChevronUp className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          )}
        </button>
        
        {showImport && (
          <div className={`px-4 py-4 border-t ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
            <ImportMMAI onImport={onImportMMAI} />
          </div>
        )}
      </div>
    </div>
  );
}

export default InputPanel;
