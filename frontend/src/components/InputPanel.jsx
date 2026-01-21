import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  Upload,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  FileUp,
  Github,
  Loader2,
  Network,
  GitBranch,
  FolderTree,
  Box,
  Users,
  Workflow,
} from "lucide-react";
import ImportMMAI from "./ImportMMAI";
import { useTheme } from "../context/ThemeContext";

// Diagram type configurations
const DIAGRAM_TYPES = [
  {
    id: "mindmap",
    name: "Mind Map",
    icon: Network,
    color: "emerald",
    description: "Brainstorm and organize ideas hierarchically",
    features: [
      "Central topic expansion",
      "Auto-layout",
      "Color-coded branches",
    ],
  },
  {
    id: "flowchart",
    name: "Flowchart",
    icon: Workflow,
    color: "purple",
    description: "Map processes and decision flows",
    features: ["Process mapping", "Decision nodes", "Labeled connectors"],
  },
  {
    id: "network",
    name: "Network Diagram",
    icon: GitBranch,
    color: "cyan",
    description: "Visualize complex relationships",
    features: ["Node connections", "Weighted edges", "Cluster analysis"],
  },
  {
    id: "tree",
    name: "Tree Diagram",
    icon: FolderTree,
    color: "orange",
    description: "Structure data hierarchically",
    features: ["Nested relationships", "Collapsible nodes", "Level indicators"],
  },
  {
    id: "orgchart",
    name: "Org Chart",
    icon: Users,
    color: "pink",
    description: "Create organizational structures",
    features: ["Role definitions", "Reporting lines", "Department grouping"],
  },
  {
    id: "block",
    name: "Block Diagram",
    icon: Box,
    color: "blue",
    description: "Design system architectures",
    features: ["Component blocks", "Port connections", "Nested containers"],
  },
];

function InputPanel({
  onTextSubmit,
  onPDFUpload,
  onImportMMAI,
  onGitHubAnalyze,
  disabled,
}) {
  const { isDark } = useTheme();
  const [text, setText] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [activeTab, setActiveTab] = useState("text"); // 'text', 'pdf', 'github'
  const [showOptions, setShowOptions] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedDiagramType, setSelectedDiagramType] = useState("mindmap");
  const [options, setOptions] = useState({
    refine: true,
    maxIterations: 2,
  });

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onPDFUpload(acceptedFiles[0], {
          ...options,
          diagramType: selectedDiagramType,
        });
      }
    },
    [onPDFUpload, options, selectedDiagramType],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length >= 50) {
      onTextSubmit(text, { ...options, diagramType: selectedDiagramType });
    }
  };

  const handleGitHubSubmit = (e) => {
    e.preventDefault();
    if (githubUrl.trim() && isValidGitHubUrl(githubUrl)) {
      onGitHubAnalyze(githubUrl, { diagramType: selectedDiagramType });
    }
  };

  const isValidGitHubUrl = (url) => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\s#?]+)/,
      /^([^\/\s]+)\/([^\/\s]+)$/,
    ];
    return patterns.some((p) => p.test(url.trim()));
  };

  const tabs = [
    { id: "text", label: "Text", icon: FileText },
    { id: "pdf", label: "PDF", icon: Upload },
    { id: "github", label: "GitHub", icon: Github },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold mt-10">
          <span className="gradient-text">Transform Text</span>
          <br />
          <span className={isDark ? "text-dark-100" : "text-dark-900"}>
            into Knowledge Graphs
          </span>
        </h2>
        <p
          className={`max-w-2xl mx-auto ${isDark ? "text-dark-400" : "text-dark-500"}`}
        >
          Paste your text, upload a PDF, or analyze a GitHub repository. Our AI
          will extract key concepts and map relationships to create an
          interactive knowledge graph.
        </p>
      </div>

      {/* Tab Selector */}
      <div
        className={`flex rounded-xl p-1 mx-auto max-w-md ${isDark ? "bg-dark-800" : "bg-dark-100"}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all
              ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-green-600 to-green-600 text-white shadow-lg"
                  : isDark
                    ? "text-dark-400 hover:text-dark-200"
                    : "text-dark-500 hover:text-dark-700"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      {/* Text Input */}
      {activeTab === "text" && (
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
                       ${
                         isDark
                           ? "bg-dark-800 border-dark-700 text-dark-100 placeholder-dark-500"
                           : "bg-white border-dark-200 text-dark-900 placeholder-dark-400"
                       }`}
            />
            <div
              className={`absolute bottom-3 right-3 text-xs ${isDark ? "text-dark-500" : "text-dark-400"}`}
            >
              {text.length} characters
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled || text.trim().length < 50}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-green-600 to-green-600 
                     hover:from-green-500 hover:to-green-500 rounded-xl font-bold text-white
                     flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/25
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5" />
            Generate{" "}
            {DIAGRAM_TYPES.find((d) => d.id === selectedDiagramType)?.name ||
              "Diagram"}
          </button>
        </form>
      )}

      {/* PDF Upload */}
      {activeTab === "pdf" && (
        <div
          {...getRootProps()}
          className={`h-64 border-2 border-dashed rounded-xl flex flex-col items-center 
                    justify-center gap-4 transition-all cursor-pointer
                    ${
                      isDragActive
                        ? "border-primary-500 bg-primary-500/10"
                        : isDark
                          ? "border-dark-600 hover:border-dark-500 bg-dark-800/50"
                          : "border-dark-300 hover:border-dark-400 bg-dark-50"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div
            className={`p-4 rounded-full ${isDragActive ? "bg-primary-500/20" : isDark ? "bg-dark-700" : "bg-dark-100"}`}
          >
            <Upload
              className={`w-8 h-8 ${isDragActive ? "text-primary-400" : isDark ? "text-dark-400" : "text-dark-500"}`}
            />
          </div>
          <div className="text-center">
            <p
              className={`font-medium ${isDark ? "text-dark-200" : "text-dark-700"}`}
            >
              {isDragActive ? "Drop your PDF here" : "Upload PDF Document"}
            </p>
            <p
              className={`text-sm mt-1 ${isDark ? "text-dark-500" : "text-dark-400"}`}
            >
              Drag & drop or click to browse
            </p>
          </div>
          <div
            className={`flex items-center gap-2 text-xs ${isDark ? "text-dark-500" : "text-dark-400"}`}
          >
            <FileText className="w-4 h-4" />
            PDF files up to 10MB
          </div>
        </div>
      )}

      {/* GitHub Input */}
      {activeTab === "github" && (
        <form onSubmit={handleGitHubSubmit} className="space-y-4">
          <div
            className={`p-6 rounded-xl border-2 ${isDark ? "bg-dark-800 border-dark-700" : "bg-white border-dark-200"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-xl ${isDark ? "bg-dark-700" : "bg-dark-100"}`}
              >
                <Github
                  className={`w-6 h-6 ${isDark ? "text-dark-300" : "text-dark-600"}`}
                />
              </div>
              <div>
                <h3
                  className={`font-bold ${isDark ? "text-dark-100" : "text-dark-800"}`}
                >
                  GitHub Repository Analyzer
                </h3>
                <p
                  className={`text-sm ${isDark ? "text-dark-400" : "text-dark-500"}`}
                >
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
                         ${
                           isDark
                             ? "bg-dark-900 border-dark-600 text-dark-100 placeholder-dark-500"
                             : "bg-dark-50 border-dark-200 text-dark-900 placeholder-dark-400"
                         }`}
              />
              {githubUrl && (
                <div
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium
                  ${isValidGitHubUrl(githubUrl) ? "text-green-500" : "text-red-400"}`}
                >
                  {isValidGitHubUrl(githubUrl) ? "✓ Valid" : "✗ Invalid"}
                </div>
              )}
            </div>

            <div
              className={`mt-4 p-3 rounded-lg ${isDark ? "bg-dark-900/50" : "bg-dark-50"}`}
            >
              <p
                className={`text-xs ${isDark ? "text-dark-400" : "text-dark-500"}`}
              >
                <strong>What we analyze:</strong> README, package files, source
                structure, key modules, and dependencies to create an
                architecture diagram.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              disabled || !githubUrl.trim() || !isValidGitHubUrl(githubUrl)
            }
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
      {/* Diagram Type Selector */}
      <div className="space-y-4">
        <div className="text-center">
          <h3
            className={`text-lg font-semibold ${isDark ? "text-dark-200" : "text-dark-700"}`}
          >
            Select Diagram Type
          </h3>
          <p
            className={`text-sm ${isDark ? "text-dark-500" : "text-dark-400"}`}
          >
            Choose the visualization style for your content
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {DIAGRAM_TYPES.map((diagram) => {
            const Icon = diagram.icon;
            const isSelected = selectedDiagramType === diagram.id;
            const colorClasses = {
              emerald: {
                selected: "border-emerald-500 bg-emerald-500/10",
                icon: isDark ? "text-emerald-400" : "text-emerald-600",
                badge: "bg-emerald-500",
              },
              purple: {
                selected: "border-purple-500 bg-purple-500/10",
                icon: isDark ? "text-purple-400" : "text-purple-600",
                badge: "bg-purple-500",
              },
              cyan: {
                selected: "border-cyan-500 bg-cyan-500/10",
                icon: isDark ? "text-cyan-400" : "text-cyan-600",
                badge: "bg-cyan-500",
              },
              orange: {
                selected: "border-orange-500 bg-orange-500/10",
                icon: isDark ? "text-orange-400" : "text-orange-600",
                badge: "bg-orange-500",
              },
              pink: {
                selected: "border-pink-500 bg-pink-500/10",
                icon: isDark ? "text-pink-400" : "text-pink-600",
                badge: "bg-pink-500",
              },
              blue: {
                selected: "border-blue-500 bg-blue-500/10",
                icon: isDark ? "text-blue-400" : "text-blue-600",
                badge: "bg-blue-500",
              },
            };
            const colors = colorClasses[diagram.color];

            return (
              <button
                key={diagram.id}
                onClick={() => setSelectedDiagramType(diagram.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center group
                  ${
                    isSelected
                      ? colors.selected
                      : isDark
                        ? "border-dark-700 hover:border-dark-600 bg-dark-800/50"
                        : "border-dark-200 hover:border-dark-300 bg-white"
                  }
                  ${isSelected ? "scale-[1.02] shadow-lg" : "hover:scale-[1.02]"}
                `}
              >
                {isSelected && (
                  <div
                    className={`absolute -top-2 -right-2 w-5 h-5 ${colors.badge} rounded-full flex items-center justify-center`}
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 transition-transform group-hover:scale-110 ${isSelected ? colors.icon : isDark ? "text-dark-400" : "text-dark-500"}`}
                />
                <p
                  className={`text-sm font-semibold ${isDark ? "text-dark-200" : "text-dark-700"}`}
                >
                  {diagram.name}
                </p>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-dark-500" : "text-dark-400"}`}
                >
                  {diagram.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Diagram Features */}
        {selectedDiagramType && (
          <div
            className={`p-4 rounded-xl border ${isDark ? "bg-dark-800/50 border-dark-700" : "bg-dark-50 border-dark-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-sm font-medium ${isDark ? "text-dark-300" : "text-dark-600"}`}
              >
                ✨{" "}
                {DIAGRAM_TYPES.find((d) => d.id === selectedDiagramType)?.name}{" "}
                Features:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DIAGRAM_TYPES.find(
                (d) => d.id === selectedDiagramType,
              )?.features.map((feature, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-xs font-medium
                    ${isDark ? "bg-dark-700 text-dark-300" : "bg-white text-dark-600 border border-dark-200"}`}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={`rounded-xl overflow-hidden border-2 ${isDark ? "bg-dark-800/50 border-dark-700" : "bg-white border-dark-200"}`}
      >
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors
                    ${isDark ? "hover:bg-dark-700/50" : "hover:bg-dark-50"}`}
        >
          <div className="flex items-center gap-2">
            <Settings
              className={`w-4 h-4 ${isDark ? "text-dark-400" : "text-dark-500"}`}
            />
            <span
              className={`text-sm font-medium ${isDark ? "text-dark-200" : "text-dark-700"}`}
            >
              Advanced Options
            </span>
          </div>
          {showOptions ? (
            <ChevronUp
              className={`w-4 h-4 ${isDark ? "text-dark-400" : "text-dark-500"}`}
            />
          ) : (
            <ChevronDown
              className={`w-4 h-4 ${isDark ? "text-dark-400" : "text-dark-500"}`}
            />
          )}
        </button>

        {showOptions && (
          <div
            className={`px-4 py-4 border-t space-y-4 ${isDark ? "border-dark-700" : "border-dark-200"}`}
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={options.refine}
                onChange={(e) =>
                  setOptions((o) => ({ ...o, refine: e.target.checked }))
                }
                className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 
                         focus:ring-primary-500/50"
              />
              <div>
                <p
                  className={`text-sm font-medium ${isDark ? "text-dark-200" : "text-dark-700"}`}
                >
                  Auto-refine graph
                </p>
                <p
                  className={`text-xs ${isDark ? "text-dark-500" : "text-dark-400"}`}
                >
                  Merge similar concepts and find hidden relationships
                </p>
              </div>
            </label>

            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${isDark ? "text-dark-200" : "text-dark-700"}`}
              >
                Refinement iterations
              </label>
              <input
                type="range"
                min="1"
                max="3"
                value={options.maxIterations}
                onChange={(e) =>
                  setOptions((o) => ({
                    ...o,
                    maxIterations: parseInt(e.target.value),
                  }))
                }
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isDark ? "bg-dark-700" : "bg-dark-200"}`}
              />
              <div
                className={`flex justify-between text-xs ${isDark ? "text-dark-500" : "text-dark-400"}`}
              >
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
          {
            icon: "🧠",
            title: "Concept Extraction",
            desc: "AI identifies key ideas and entities",
          },
          {
            icon: "🔗",
            title: "Relationship Mapping",
            desc: "Discovers connections between concepts",
          },
          {
            icon: "🐙",
            title: "GitHub Analysis",
            desc: "Extract architecture from repos",
          },
          {
            icon: "✨",
            title: "Smart Refinement",
            desc: "Agentic loop optimizes the graph",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border-2 transition-all hover:scale-105
                                 ${
                                   isDark
                                     ? "bg-dark-800/50 border-dark-700 hover:border-dark-600"
                                     : "bg-white border-dark-200 hover:border-dark-300"
                                 }`}
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3
              className={`font-bold ${isDark ? "text-dark-100" : "text-dark-800"}`}
            >
              {feature.title}
            </h3>
            <p
              className={`text-xs mt-1 ${isDark ? "text-dark-500" : "text-dark-400"}`}
            >
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Import MMAI Section */}
      <div
        className={`rounded-xl overflow-hidden border-2 ${isDark ? "bg-dark-800/50 border-dark-700" : "bg-white border-dark-200"}`}
      >
        <button
          onClick={() => setShowImport(!showImport)}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors
                    ${isDark ? "hover:bg-dark-700/50" : "hover:bg-dark-50"}`}
        >
          <div className="flex items-center gap-2">
            <FileUp className="w-4 h-4 text-primary-400" />
            <span
              className={`text-sm font-medium ${isDark ? "text-dark-200" : "text-dark-700"}`}
            >
              Import Saved Mind Map
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-500/20 text-primary-400 rounded">
              .mmai
            </span>
          </div>
          {showImport ? (
            <ChevronUp
              className={`w-4 h-4 ${isDark ? "text-dark-400" : "text-dark-500"}`}
            />
          ) : (
            <ChevronDown
              className={`w-4 h-4 ${isDark ? "text-dark-400" : "text-dark-500"}`}
            />
          )}
        </button>

        {showImport && (
          <div
            className={`px-4 py-4 border-t ${isDark ? "border-dark-700" : "border-dark-200"}`}
          >
            <ImportMMAI onImport={onImportMMAI} />
          </div>
        )}
      </div>
    </div>
  );
}

export default InputPanel;
