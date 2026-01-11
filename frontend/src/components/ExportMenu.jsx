import { useState, useRef, useEffect } from 'react';
import { Download, FileDown, ChevronDown, FileJson, FileCode, FileSpreadsheet, Sparkles } from 'lucide-react';
import { 
  exportToMMAI, 
  exportToDrawio, 
  exportToVsdx, 
  exportToGliffy, 
  downloadFile,
  downloadVsdx 
} from '../utils/exportFormats';
import { useTheme } from '../context/ThemeContext';

const EXPORT_FORMATS = [
  {
    id: 'mmai',
    name: 'MindMapAI',
    extension: '.mmai',
    description: 'Native format (this site only)',
    icon: Sparkles,
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
    exclusive: true
  },
  {
    id: 'png',
    name: 'PNG Image',
    extension: '.png',
    description: 'High-quality image export',
    icon: FileDown,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    exclusive: false
  },
  {
    id: 'drawio',
    name: 'Draw.io',
    extension: '.drawio',
    description: 'diagrams.net / draw.io format',
    icon: FileCode,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    exclusive: false
  },
  {
    id: 'vsdx',
    name: 'Visio',
    extension: '.vsdx',
    description: 'Microsoft Visio format',
    icon: FileSpreadsheet,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    exclusive: false
  },
  {
    id: 'gliffy',
    name: 'Gliffy',
    extension: '.gliffy',
    description: 'Gliffy diagram format',
    icon: FileJson,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    exclusive: false
  }
];

function ExportMenu({ data, cyRef, metadata = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const menuRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilename = (extension) => {
    const title = metadata.title || 'mindmap';
    const sanitized = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${sanitized}_${timestamp}${extension}`;
  };

  const handleExport = async (format) => {
    if (!data) return;
    
    setExporting(format.id);
    
    try {
      const graphData = {
        nodes: data.nodes || [],
        edges: data.edges || [],
        concepts: data.concepts || [],
        relationships: data.relationships || []
      };

      switch (format.id) {
        case 'mmai': {
          const content = exportToMMAI(graphData, metadata);
          downloadFile(content, getFilename('.mmai'), 'application/json');
          break;
        }
        
        case 'png': {
          if (cyRef?.current) {
            const png = cyRef.current.png({ 
              output: 'blob', 
              bg: '#0f172a',
              scale: 2,
              full: true
            });
            const url = URL.createObjectURL(png);
            const link = document.createElement('a');
            link.href = url;
            link.download = getFilename('.png');
            link.click();
            URL.revokeObjectURL(url);
          }
          break;
        }
        
        case 'drawio': {
          const content = exportToDrawio(graphData, metadata);
          downloadFile(content, getFilename('.drawio'), 'application/xml');
          break;
        }
        
        case 'vsdx': {
          const content = await exportToVsdx(graphData, metadata);
          await downloadVsdx(content, getFilename('.vsdx'));
          break;
        }
        
        case 'gliffy': {
          const content = exportToGliffy(graphData, metadata);
          downloadFile(content, getFilename('.gliffy'), 'application/json');
          break;
        }
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 
                   rounded-lg border border-dark-600 transition-colors group"
        title="Export Options"
      >
        <Download className="w-4 h-4 text-dark-400 group-hover:text-dark-100" />
        <span className="text-sm text-dark-300 group-hover:text-dark-100">Export</span>
        <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-dark-800/95 backdrop-blur-sm 
                        rounded-xl border border-dark-600 shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-dark-700">
            <h3 className="font-semibold text-dark-100 text-sm">Export Format</h3>
            <p className="text-xs text-dark-500 mt-0.5">Choose a format to download</p>
          </div>
          
          <div className="p-2 space-y-1">
            {EXPORT_FORMATS.map((format) => {
              const Icon = format.icon;
              const isLoading = exporting === format.id;
              
              return (
                <button
                  key={format.id}
                  onClick={() => handleExport(format)}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-dark-700 
                           transition-colors text-left group disabled:opacity-50"
                >
                  <div className={`p-2 rounded-lg ${format.bgColor}`}>
                    <Icon className={`w-4 h-4 ${format.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dark-100">
                        {format.name}
                      </span>
                      <span className="text-xs text-dark-500">{format.extension}</span>
                      {format.exclusive && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-500/20 
                                       text-primary-400 rounded">EXCLUSIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-dark-500 truncate">{format.description}</p>
                  </div>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-dark-600 border-t-primary-500 
                                  rounded-full animate-spin" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="p-3 border-t border-dark-700 bg-dark-900/50">
            <p className="text-[10px] text-dark-500 text-center">
              💡 <span className="text-primary-400">.mmai</span> files can only be opened on MindMapAI
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
