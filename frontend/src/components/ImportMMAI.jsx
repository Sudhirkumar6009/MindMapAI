import { useState, useRef } from 'react';
import { Upload, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { importFromMMAI } from '../utils/exportFormats';
import { useTheme } from '../context/ThemeContext';

function ImportMMAI({ onImport }) {
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const inputRef = useRef(null);
  const { isDark } = useTheme();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    
    // Check file extension
    if (!file.name.endsWith('.mmai')) {
      setError('Only .mmai files can be imported. For other formats, please use their respective applications.');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const content = await file.text();
      const result = importFromMMAI(content);
      
      if (result.success) {
        setSuccess(`Successfully imported "${result.metadata.title || 'Mind Map'}"`);
        
        // Convert to graph format
        const graphData = {
          success: true,
          nodes: result.data.nodes,
          edges: result.data.edges,
          concepts: result.concepts,
          relationships: result.relationships,
          stats: {
            conceptCount: result.concepts?.length || result.data.nodes.length,
            relationshipCount: result.relationships?.length || result.data.edges.length,
            isolatedConcepts: 0
          }
        };
        
        onImport(graphData, result.styling);
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to read file: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all
                   ${dragActive 
                     ? 'border-primary-500 bg-primary-500/10' 
                     : isDark 
                       ? 'border-dark-600 hover:border-dark-500 bg-dark-800/50' 
                       : 'border-dark-300 hover:border-dark-400 bg-dark-50'
                   }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mmai"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${dragActive ? 'bg-primary-500/20' : isDark ? 'bg-dark-700' : 'bg-dark-200'}`}>
            <FileUp className={`w-6 h-6 ${dragActive ? 'text-primary-400' : isDark ? 'text-dark-400' : 'text-dark-500'}`} />
          </div>
          
          <div>
            <p className={`font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>
              {importing ? 'Importing...' : 'Import MindMapAI File'}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
              Drag & drop a <span className="text-primary-400">.mmai</span> file or{' '}
              <button
                onClick={() => inputRef.current?.click()}
                className="text-primary-400 hover:text-primary-300 underline"
              >
                browse
              </button>
            </p>
          </div>
        </div>

        {importing && (
          <div className={`absolute inset-0 rounded-xl flex items-center justify-center
                          ${isDark ? 'bg-dark-900/80' : 'bg-white/80'}`}>
            <div className="w-6 h-6 border-2 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      <p className={`mt-3 text-xs text-center ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
        💡 Only <span className="text-primary-400">.mmai</span> files created by MindMapAI can be imported here.
        Other formats (.drawio, .vsdx, .gliffy) should be opened in their respective applications.
      </p>
    </div>
  );
}

export default ImportMMAI;
