import { useState, useRef, useEffect } from "react";
import {
  Download,
  FileDown,
  ChevronDown,
  FileJson,
  FileCode,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { toPng } from "html-to-image";
import {
  exportToMMAI,
  exportToDrawio,
  exportToVsdx,
  exportToGliffy,
  downloadFile,
  downloadVsdx,
} from "../utils/exportFormats";
import { useTheme } from "../context/ThemeContext";

const EXPORT_FORMATS = [
  {
    id: "mmai",
    name: "MindMapAI",
    extension: ".mmai",
    description: "Native format (this site only)",
    icon: Sparkles,
    color: "text-primary-400",
    bgColor: "bg-primary-500/20",
    exclusive: true,
  },
  {
    id: "png",
    name: "PNG Image",
    extension: ".png",
    description: "High-quality image export",
    icon: FileDown,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    exclusive: false,
  },
  {
    id: "drawio",
    name: "Draw.io",
    extension: ".drawio",
    description: "diagrams.net / draw.io format",
    icon: FileCode,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    exclusive: false,
  },
  {
    id: "vsdx",
    name: "Visio",
    extension: ".vsdx",
    description: "Microsoft Visio format",
    icon: FileSpreadsheet,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    exclusive: false,
  },
  {
    id: "gliffy",
    name: "Gliffy",
    extension: ".gliffy",
    description: "Gliffy diagram format",
    icon: FileJson,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    exclusive: false,
  },
];

function ExportMenu({ data, containerRef, metadata = {} }) {
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilename = (extension) => {
    const title = metadata.title || "mindmap";
    const sanitized = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
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
        relationships: data.relationships || [],
      };

      switch (format.id) {
        case "mmai": {
          const content = exportToMMAI(graphData, metadata);
          downloadFile(content, getFilename(".mmai"), "application/json");
          break;
        }

        case "png": {
          if (containerRef?.current) {
            // Find the React Flow viewport element for cleaner export
            const reactFlowElement =
              containerRef.current.querySelector(".react-flow");
            const elementToExport = reactFlowElement || containerRef.current;

            const dataUrl = await toPng(elementToExport, {
              backgroundColor: "transparent",
              pixelRatio: 2,
              filter: (node) => {
                // Exclude UI elements and background patterns from the export
                const excludeClasses = [
                  "react-flow__minimap",
                  "react-flow__controls",
                  "react-flow__panel",
                  "react-flow__background", // Exclude the dots/grid background
                ];
                return !excludeClasses.some((className) =>
                  node.classList?.contains(className),
                );
              },
            });

            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = getFilename(".png");
            link.click();
          } else {
            throw new Error("Graph container not available for export");
          }
          break;
        }

        case "drawio": {
          const content = exportToDrawio(graphData, metadata);
          downloadFile(content, getFilename(".drawio"), "application/xml");
          break;
        }

        case "vsdx": {
          const content = await exportToVsdx(graphData, metadata);
          await downloadVsdx(content, getFilename(".vsdx"));
          break;
        }

        case "gliffy": {
          const content = exportToGliffy(graphData, metadata);
          downloadFile(content, getFilename(".gliffy"), "application/json");
          break;
        }
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed: " + error.message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors group
                   ${
                     isDark
                       ? "bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300 backdrop-blur-sm"
                       : "bg-white hover:bg-emerald-50 border-gray-300 text-gray-700 shadow-sm"
                   }`}
        title="Export Options"
      >
        <Download
          className={`w-4 h-4 ${isDark ? "text-slate-400 group-hover:text-white" : "text-emerald-600 group-hover:text-emerald-700"}`}
        />
        <span
          className={`text-sm ${isDark ? "text-slate-300 group-hover:text-white" : "text-gray-700 group-hover:text-emerald-700"}`}
        >
          Export
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""} ${isDark ? "text-slate-400" : "text-gray-500"}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-72 backdrop-blur-sm 
                        rounded-xl shadow-2xl z-50 overflow-hidden border
                        ${isDark ? "border-slate-700 bg-slate-900/95" : "border-gray-200 bg-white"}`}
        >
          <div
            className={`p-3 border-b mx-2 ${isDark ? "border-slate-700" : "border-gray-200"}`}
          >
            <h3
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Export Format
            </h3>
            <p
              className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}
            >
              Choose a format to download
            </p>
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
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg 
                           transition-colors text-left disabled:opacity-50 group
                           ${isDark ? "hover:bg-emerald-600" : "hover:bg-emerald-50"}`}
                >
                  <div className={`p-2 rounded-lg ${format.bgColor}`}>
                    <Icon className={`w-4 h-4 ${format.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900 group-hover:text-emerald-700"}`}
                      >
                        {format.name}
                      </span>
                      <span
                        className={`text-xs ${isDark ? "text-slate-400 group-hover:text-white" : "text-gray-500 group-hover:text-emerald-600"}`}
                      >
                        {format.extension}
                      </span>
                      {format.exclusive && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded
                                       ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}
                        >
                          EXCLUSIVE
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate ${isDark ? "text-slate-400 group-hover:text-slate-200" : "text-gray-500 group-hover:text-emerald-600"}`}
                    >
                      {format.description}
                    </p>
                  </div>
                  {isLoading && (
                    <div
                      className={`w-4 h-4 border-2 rounded-full animate-spin
                                  ${isDark ? "border-slate-600 border-t-emerald-500" : "border-gray-300 border-t-emerald-600"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className={`p-3 mx-2 mb-2 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-gray-50 border-t border-gray-200"}`}
          >
            <p
              className={`text-[10px] text-center ${isDark ? "text-slate-500" : "text-gray-500"}`}
            >
              💡{" "}
              <span
                className={isDark ? "text-emerald-400" : "text-emerald-600"}
              >
                .mmai
              </span>{" "}
              files can only be opened on MindMapAI
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExportMenu;
