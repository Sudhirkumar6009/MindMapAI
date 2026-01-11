import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';
import { 
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Palette, Sparkles, 
  LayoutGrid, Network, GitBranch, Target, Workflow, 
  ChevronDown, Filter, Microscope, Loader2,
  Trash2, Edit3, Save, X
} from 'lucide-react';
import ExportMenu from './ExportMenu';
import { useTheme } from '../context/ThemeContext';
import { nodeTypes } from './flow/CustomNodes';

// ============================================
// CONFIGURATION - Professional Color Palettes
// ============================================

const COLOR_PALETTES = {
  academic: {
    name: 'Academic',
    description: 'Clean scholarly style',
    primary: '#10B981',
    secondary: '#6366F1', 
    accent: '#8B5CF6',
    hub: '#1E40AF',
    action: '#10B981',
    result: '#06B6D4',
    decision: '#F59E0B',
    background: { light: '#F8FAFC', dark: '#0F172A' },
    edge: { light: '#94A3B8', dark: '#475569' }
  },
  research: {
    name: 'Research',
    description: 'Scientific paper style',
    primary: '#10B981',
    secondary: '#14B8A6',
    accent: '#6366F1',
    hub: '#0369A1',
    action: '#059669',
    result: '#7C3AED',
    decision: '#D97706',
    background: { light: '#F0F9FF', dark: '#0C4A6E' },
    edge: { light: '#64748B', dark: '#38BDF8' }
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary design',
    primary: '#EC4899',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    hub: '#DB2777',
    action: '#22C55E',
    result: '#10B981',
    decision: '#F97316',
    background: { light: '#FDF2F8', dark: '#1E1B4B' },
    edge: { light: '#A855F7', dark: '#C084FC' }
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean & simple',
    primary: '#374151',
    secondary: '#6B7280',
    accent: '#111827',
    hub: '#1F2937',
    action: '#4B5563',
    result: '#9CA3AF',
    decision: '#6B7280',
    background: { light: '#FFFFFF', dark: '#111827' },
    edge: { light: '#D1D5DB', dark: '#4B5563' }
  },
  nature: {
    name: 'Nature',
    description: 'Organic earthy tones',
    primary: '#059669',
    secondary: '#0D9488',
    accent: '#65A30D',
    hub: '#047857',
    action: '#16A34A',
    result: '#0891B2',
    decision: '#CA8A04',
    background: { light: '#F0FDF4', dark: '#064E3B' },
    edge: { light: '#6EE7B7', dark: '#34D399' }
  }
};

const LAYOUT_TYPES = {
  dagre: { 
    name: 'Auto Layout', 
    icon: LayoutGrid, 
    description: 'Automatic hierarchical layout' 
  },
  radial: { 
    name: 'Radial', 
    icon: Target, 
    description: 'Circular arrangement' 
  },
  horizontal: { 
    name: 'Horizontal', 
    icon: Workflow, 
    description: 'Left to right flow' 
  },
  vertical: { 
    name: 'Vertical', 
    icon: GitBranch, 
    description: 'Top to bottom flow' 
  }
};

const NODE_STYLES = {
  standard: { name: 'Standard', icon: '▢' },
  mindmap: { name: 'Mind Map', icon: '◎' },
  flowchart: { name: 'Flowchart', icon: '◇' },
  circle: { name: 'Circle', icon: '●' },
  hexagon: { name: 'Hexagon', icon: '⬡' }
};

// ============================================
// DAGRE LAYOUT ALGORITHM
// ============================================

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 172;
  const nodeHeight = 60;
  
  const isHorizontal = direction === 'LR' || direction === 'RL';
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 80,
    ranksep: 100,
    edgesep: 50
  });
  
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: node.measured?.width || nodeWidth, 
      height: node.measured?.height || nodeHeight 
    });
  });
  
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  dagre.layout(dagreGraph);
  
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.measured?.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.measured?.height || nodeHeight) / 2,
      },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    };
  });
  
  return { nodes: layoutedNodes, edges };
};

// Radial layout
const getRadialLayout = (nodes, edges, centerX = 400, centerY = 300) => {
  const hubNodes = nodes.filter(n => n.data.connections >= 5);
  const otherNodes = nodes.filter(n => n.data.connections < 5);
  
  const layoutedNodes = [];
  
  // Place hub nodes in center
  hubNodes.forEach((node, i) => {
    layoutedNodes.push({
      ...node,
      position: {
        x: centerX - 80 + (i * 50),
        y: centerY - 30
      }
    });
  });
  
  // Place other nodes in circles around hub
  const radius = 250;
  otherNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / otherNodes.length;
    layoutedNodes.push({
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle) - 80,
        y: centerY + radius * Math.sin(angle) - 30
      }
    });
  });
  
  return { nodes: layoutedNodes, edges };
};

// ============================================
// MAIN GRAPH COMPONENT
// ============================================

function GraphViewInner({ data, metadata = {}, onAnalyzeInDepth }) {
  const { isDark } = useTheme();
  const reactFlowInstance = useReactFlow();
  const containerRef = useRef(null);
  
  // Get diagram type from data
  const diagramType = data?.diagramType || 'mindmap';
  const diagramConfig = data?.diagramConfig || {};
  
  // Map diagram types to default layouts and styles
  const getDefaultSettings = (type) => {
    const settings = {
      mindmap: { layout: 'radial', direction: 'TB', nodeStyle: 'mindmap', palette: 'nature' },
      flowchart: { layout: 'vertical', direction: 'TB', nodeStyle: 'flowchart', palette: 'modern' },
      network: { layout: 'dagre', direction: 'TB', nodeStyle: 'circle', palette: 'academic' },
      tree: { layout: 'vertical', direction: 'TB', nodeStyle: 'standard', palette: 'research' },
      orgchart: { layout: 'vertical', direction: 'TB', nodeStyle: 'standard', palette: 'minimal' },
      block: { layout: 'horizontal', direction: 'LR', nodeStyle: 'standard', palette: 'modern' }
    };
    return settings[type] || settings.mindmap;
  };
  
  const defaultSettings = getDefaultSettings(diagramType);
  
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedPalette, setSelectedPalette] = useState(defaultSettings.palette);
  const [nodeStyle, setNodeStyle] = useState(defaultSettings.nodeStyle);
  const [layoutType, setLayoutType] = useState(defaultSettings.layout);
  const [layoutDirection, setLayoutDirection] = useState(defaultSettings.direction);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  
  // Section filter state
  const [selectedSection, setSelectedSection] = useState('main');
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const sections = data?.sections || [{ id: 'main', name: 'All Topics', description: 'Complete overview' }];
  const palette = COLOR_PALETTES[selectedPalette];
  
  // ============================================
  // DATA TRANSFORMATION
  // ============================================
  
  const transformData = useCallback(() => {
    if (!data?.nodes || !data?.edges) return { nodes: [], edges: [] };
    
    let filteredNodes = data.nodes;
    let filteredEdges = data.edges;
    
    // Filter by section
    if (selectedSection !== 'main') {
      filteredNodes = data.nodes.filter(node => 
        node.section === selectedSection || 
        node.section === 'shared' ||
        !node.section
      );
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = data.edges.filter(edge => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
    }
    
    // Create connection count map
    const connectionCount = {};
    filteredEdges.forEach(edge => {
      connectionCount[edge.source] = (connectionCount[edge.source] || 0) + 1;
      connectionCount[edge.target] = (connectionCount[edge.target] || 0) + 1;
    });
    
    // Transform nodes
    const transformedNodes = filteredNodes.map((node, index) => {
      const connections = connectionCount[node.id] || node.connections || 1;
      
      // Determine node type based on style
      let type = 'standard';
      if (nodeStyle === 'mindmap') type = 'mindmap';
      else if (nodeStyle === 'flowchart') type = 'flowchart';
      else if (nodeStyle === 'circle') type = 'circle';
      else if (nodeStyle === 'hexagon') type = 'hexagon';
      
      return {
        id: node.id,
        type,
        position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 120 },
        data: {
          label: node.label,
          connections,
          category: node.category || 'concept',
          section: node.section || 'main',
          importance: node.importance || 3,
          isDark,
          colors: {
            primary: palette.primary,
            secondary: palette.secondary,
            hub: palette.hub,
            action: palette.action,
            result: palette.result,
            decision: palette.decision
          }
        },
        draggable: true,
        selectable: true
      };
    });
    
    // Transform edges
    const transformedEdges = filteredEdges.map((edge, index) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || '',
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: isDark ? palette.edge.dark : palette.edge.light
      },
      style: {
        stroke: isDark ? palette.edge.dark : palette.edge.light,
        strokeWidth: 2
      },
      labelStyle: {
        fill: isDark ? '#E2E8F0' : '#334155',
        fontWeight: 600,
        fontSize: 11
      },
      labelBgStyle: {
        fill: isDark ? '#1E293B' : '#FFFFFF',
        fillOpacity: 0.9
      },
      labelBgPadding: [6, 4],
      labelBgBorderRadius: 4
    }));
    
    return { nodes: transformedNodes, edges: transformedEdges };
  }, [data, selectedSection, isDark, palette, nodeStyle]);
  
  // ============================================
  // LAYOUT APPLICATION
  // ============================================
  
  const applyLayout = useCallback(() => {
    if (nodes.length === 0) return;
    
    let layouted;
    
    switch (layoutType) {
      case 'radial':
        layouted = getRadialLayout(nodes, edges);
        break;
      case 'horizontal':
        layouted = getLayoutedElements(nodes, edges, 'LR');
        break;
      case 'vertical':
        layouted = getLayoutedElements(nodes, edges, 'TB');
        break;
      case 'dagre':
      default:
        layouted = getLayoutedElements(nodes, edges, layoutDirection);
        break;
    }
    
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    
    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.2, duration: 500 });
    }, 100);
  }, [nodes, edges, layoutType, layoutDirection, setNodes, setEdges, reactFlowInstance]);
  
  // ============================================
  // EFFECTS
  // ============================================
  
  // Update settings when diagram type changes
  useEffect(() => {
    if (diagramType) {
      const settings = getDefaultSettings(diagramType);
      setSelectedPalette(settings.palette);
      setNodeStyle(settings.nodeStyle);
      setLayoutType(settings.layout);
      setLayoutDirection(settings.direction);
    }
  }, [diagramType]);
  
  // Transform data on changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = transformData();
    if (newNodes.length > 0) {
      const layouted = getLayoutedElements(newNodes, newEdges, layoutDirection);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      
      setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2, duration: 500 });
      }, 200);
    }
  }, [data, selectedSection, selectedPalette, nodeStyle, transformData, layoutDirection]);
  
  // Update edge styles when theme changes
  useEffect(() => {
    setEdges(eds => eds.map(edge => ({
      ...edge,
      markerEnd: {
        ...edge.markerEnd,
        color: isDark ? palette.edge.dark : palette.edge.light
      },
      style: {
        ...edge.style,
        stroke: isDark ? palette.edge.dark : palette.edge.light
      },
      labelStyle: {
        ...edge.labelStyle,
        fill: isDark ? '#E2E8F0' : '#334155'
      },
      labelBgStyle: {
        ...edge.labelBgStyle,
        fill: isDark ? '#1E293B' : '#FFFFFF'
      }
    })));
  }, [isDark, palette, setEdges]);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      label: 'relates to',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: isDark ? palette.edge.dark : palette.edge.light
      },
      style: {
        stroke: isDark ? palette.edge.dark : palette.edge.light,
        strokeWidth: 2
      }
    }, eds));
  }, [setEdges, isDark, palette]);
  
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode({
      id: node.id,
      label: node.data.label,
      connections: node.data.connections,
      category: node.data.category,
      section: node.data.section
    });
    setSelectedEdge(null);
    setIsEditing(false);
  }, []);
  
  const onEdgeClick = useCallback((_, edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    setSelectedEdge({
      id: edge.id,
      label: edge.label,
      source: sourceNode?.data.label || edge.source,
      target: targetNode?.data.label || edge.target
    });
    setSelectedNode(null);
    setIsEditing(false);
  }, [nodes]);
  
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsEditing(false);
  }, []);
  
  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
      setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);
  
  const handleDeleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges(eds => eds.filter(e => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges]);
  
  const handleEditLabel = useCallback(() => {
    if (selectedNode) {
      setEditLabel(selectedNode.label);
      setIsEditing(true);
    } else if (selectedEdge) {
      setEditLabel(selectedEdge.label || '');
      setIsEditing(true);
    }
  }, [selectedNode, selectedEdge]);
  
  const handleSaveLabel = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.map(n => 
        n.id === selectedNode.id 
          ? { ...n, data: { ...n.data, label: editLabel } }
          : n
      ));
      setSelectedNode({ ...selectedNode, label: editLabel });
    } else if (selectedEdge) {
      setEdges(eds => eds.map(e => 
        e.id === selectedEdge.id 
          ? { ...e, label: editLabel }
          : e
      ));
      setSelectedEdge({ ...selectedEdge, label: editLabel });
    }
    setIsEditing(false);
  }, [selectedNode, selectedEdge, editLabel, setNodes, setEdges]);
  
  const handleZoomIn = () => reactFlowInstance?.zoomIn({ duration: 300 });
  const handleZoomOut = () => reactFlowInstance?.zoomOut({ duration: 300 });
  const handleFitView = () => reactFlowInstance?.fitView({ padding: 0.2, duration: 500 });
  
  // ============================================
  // RENDER
  // ============================================
  
  const bgColor = isDark ? palette.background.dark : palette.background.light;
  
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl" ref={containerRef}>
      <div 
        className={`w-full rounded-2xl border-2 transition-all duration-300
                   ${isDark 
                     ? 'border-slate-700/50' 
                     : 'border-slate-200'
                   }`}
        style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false
          }}
          connectionLineStyle={{ stroke: palette.primary, strokeWidth: 2 }}
          connectionLineType="smoothstep"
          snapToGrid
          snapGrid={[15, 15]}
          minZoom={0.1}
          maxZoom={4}
          proOptions={{ hideAttribution: true }}
          style={{ background: bgColor }}
        >
          {/* Background Pattern */}
          <Background 
            color={isDark ? '#334155' : '#CBD5E1'} 
            gap={20} 
            size={1}
            variant="dots"
          />
          
          {/* MiniMap */}
          <MiniMap 
            nodeColor={(node) => {
              if (node.data.connections >= 5) return palette.hub;
              if (node.data.connections >= 3) return palette.secondary;
              return palette.primary;
            }}
            maskColor={isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)'}
            className="!bg-white/80 dark:!bg-slate-800/80 rounded-xl border-2 border-slate-200 dark:border-slate-700"
            style={{ width: 150, height: 100 }}
          />
          
          {/* Default Controls */}
          <Controls 
            className="!bg-white/90 dark:!bg-slate-800/90 !border-2 !border-slate-200 dark:!border-slate-700 !rounded-xl !shadow-lg"
            showInteractive={false}
          />
          
          {/* Diagram Type Badge - Top Center */}
          {diagramType && (
            <Panel position="top-center">
              <div className={`px-4 py-2 rounded-xl border-2 shadow-lg flex items-center gap-2
                             ${isDark 
                               ? 'bg-slate-800/95 border-slate-600 backdrop-blur-xl' 
                               : 'bg-white/95 border-slate-200 backdrop-blur-xl'
                             }`}>
                <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {diagramConfig.name || diagramType.charAt(0).toUpperCase() + diagramType.slice(1)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                  AI Generated
                </span>
              </div>
            </Panel>
          )}
          
          {/* Top Left Panel - Style & Layout Controls */}
          <Panel position="top-left" className="flex flex-col gap-2">
            {/* Style Button */}
            <button
              onClick={() => { setShowStylePanel(!showStylePanel); setShowLayoutPanel(false); }}
              className={`px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 shadow-lg
                        ${showStylePanel 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white' 
                          : isDark
                            ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300 backdrop-blur-sm'
                            : 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 backdrop-blur-sm'
                        }`}
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm font-semibold">Style</span>
            </button>
            
            {/* Layout Button */}
            <button
              onClick={() => { setShowLayoutPanel(!showLayoutPanel); setShowStylePanel(false); }}
              className={`px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 shadow-lg
                        ${showLayoutPanel 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400 text-white' 
                          : isDark
                            ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300 backdrop-blur-sm'
                            : 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 backdrop-blur-sm'
                        }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-semibold">Layout</span>
            </button>
          </Panel>
          
          {/* Style Panel */}
          {showStylePanel && (
            <Panel position="top-left" className="ml-28">
              <div className={`w-72 rounded-2xl border-2 shadow-2xl overflow-hidden
                             ${isDark 
                               ? 'bg-slate-800/95 border-slate-600 backdrop-blur-xl' 
                               : 'bg-white/95 border-slate-200 backdrop-blur-xl'
                             }`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Style Options
                  </h3>
                </div>
                
                <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                  {/* Color Palette */}
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Color Palette
                    </label>
                    <div className="space-y-2">
                      {Object.entries(COLOR_PALETTES).map(([key, pal]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedPalette(key)}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3
                                    ${selectedPalette === key
                                      ? 'border-purple-500 bg-purple-500/10'
                                      : isDark
                                        ? 'border-slate-600 hover:border-slate-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                        >
                          <div className="flex gap-1">
                            {[pal.primary, pal.secondary, pal.hub, pal.action].map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <div>
                            <div className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                              {pal.name}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {pal.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Node Style */}
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Node Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(NODE_STYLES).map(([key, style]) => (
                        <button
                          key={key}
                          onClick={() => setNodeStyle(key)}
                          className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                                    ${nodeStyle === key
                                      ? 'border-purple-500 bg-purple-500/10'
                                      : isDark
                                        ? 'border-slate-600 hover:border-slate-500'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                        >
                          <span className={`text-lg ${nodeStyle === key ? 'text-purple-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {style.icon}
                          </span>
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {style.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          )}
          
          {/* Layout Panel */}
          {showLayoutPanel && (
            <Panel position="top-left" className="ml-28">
              <div className={`w-64 rounded-2xl border-2 shadow-2xl overflow-hidden
                             ${isDark 
                               ? 'bg-slate-800/95 border-slate-600 backdrop-blur-xl' 
                               : 'bg-white/95 border-slate-200 backdrop-blur-xl'
                             }`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <LayoutGrid className="w-4 h-4 text-emerald-500" />
                    Layout Options
                  </h3>
                </div>
                
                <div className="p-4 space-y-3">
                  {Object.entries(LAYOUT_TYPES).map(([key, layout]) => {
                    const Icon = layout.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setLayoutType(key);
                          setTimeout(applyLayout, 100);
                        }}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3
                                  ${layoutType === key
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : isDark
                                      ? 'border-slate-600 hover:border-slate-500'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                      >
                        <div className={`p-2 rounded-lg ${layoutType === key ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                            {layout.name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {layout.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* Re-apply Layout Button */}
                  <button
                    onClick={applyLayout}
                    className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-semibold
                              ${isDark 
                                ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10' 
                                : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                              }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Re-apply Layout
                  </button>
                </div>
              </div>
            </Panel>
          )}
          
          {/* Top Right Panel - Export & Zoom */}
          <Panel position="top-right" className="flex flex-col gap-2">
            <ExportMenu data={data} containerRef={containerRef} metadata={metadata} />
            
            <button
              onClick={handleZoomIn}
              className={`p-2.5 rounded-xl border-2 transition-all shadow-lg
                        ${isDark
                          ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300 backdrop-blur-sm'
                          : 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 backdrop-blur-sm'
                        }`}
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleZoomOut}
              className={`p-2.5 rounded-xl border-2 transition-all shadow-lg
                        ${isDark
                          ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300 backdrop-blur-sm'
                          : 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 backdrop-blur-sm'
                        }`}
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleFitView}
              className={`p-2.5 rounded-xl border-2 transition-all shadow-lg
                        ${isDark
                          ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300 backdrop-blur-sm'
                          : 'bg-white/90 hover:bg-white border-slate-200 text-slate-600 backdrop-blur-sm'
                        }`}
              title="Fit View"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </Panel>
          
          {/* Bottom Left Panel - Section Filter & Info */}
          <Panel position="bottom-left" className="flex flex-col gap-2">
            {/* Section Filter */}
            {sections.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all shadow-lg border-2
                            ${isDark 
                              ? 'bg-slate-800/95 backdrop-blur-sm border-slate-600 hover:border-emerald-500' 
                              : 'bg-white/95 backdrop-blur-sm border-slate-200 hover:border-emerald-500'
                            }`}
                >
                  <Filter className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {sections.find(s => s.id === selectedSection)?.name || 'All Topics'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSectionDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showSectionDropdown && (
                  <div className={`absolute bottom-full left-0 mb-2 w-64 rounded-xl border-2 shadow-2xl overflow-hidden
                                ${isDark 
                                  ? 'bg-slate-800/50 border-slate-600 backdrop-blur-xl' 
                                  : 'bg-white border-slate-200 backdrop-blur-xl'
                                }`}>
                    <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Filter by Topic
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {sections.map(section => (
                        <button
                          key={section.id}
                          onClick={() => {
                            setSelectedSection(section.id);
                            setShowSectionDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all
                                    ${selectedSection === section.id
                                      ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                                      : isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedSection === section.id ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                          <div>
                            <div className="text-sm font-medium">{section.name}</div>
                            {section.description && (
                              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {section.description}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {selectedSection !== 'main' && onAnalyzeInDepth && (
                      <div className={`border-t px-3 py-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <button
                          onClick={() => {
                            setIsAnalyzing(true);
                            setShowSectionDropdown(false);
                            onAnalyzeInDepth(selectedSection);
                            setTimeout(() => setIsAnalyzing(false), 500);
                          }}
                          disabled={isAnalyzing}
                          className="w-full px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold
                                    bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500
                                    text-white shadow-lg disabled:opacity-50"
                        >
                          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
                          Analyze In-Depth
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Graph Stats */}
            <div className={`px-4 py-2.5 rounded-xl flex items-center gap-4
                           ${isDark 
                             ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-700' 
                             : 'bg-white/80 backdrop-blur-sm border border-slate-200'
                           }`}>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-500" />
                <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {nodes.length} nodes
                </span>
              </div>
              <div className={`w-px h-4 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {edges.length} connections
              </span>
            </div>
            
            {/* AI Insights */}
            {data?.insights && data.insights.length > 0 && (
              <div className={`px-4 py-3 rounded-xl max-w-xs
                             ${isDark 
                               ? 'bg-purple-500/10 border border-purple-500/30' 
                               : 'bg-purple-50 border border-purple-200'
                             }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className={`text-xs font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                    AI Insights
                  </span>
                </div>
                <ul className="space-y-1">
                  {data.insights.slice(0, 3).map((insight, i) => (
                    <li key={i} className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
          
          {/* Bottom Right - Selection Info & Actions */}
          {(selectedNode || selectedEdge) && (
            <Panel position="bottom-right">
              <div className={`p-4 rounded-2xl border-2 w-72 shadow-2xl
                             ${isDark 
                               ? 'bg-slate-800/95 border-slate-600 backdrop-blur-xl' 
                               : 'bg-white/95 border-slate-200 backdrop-blur-xl'
                             }`}>
                {selectedNode && (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-500">
                          <Network className="w-4 h-4 text-white" />
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className={`px-2 py-1 rounded-lg border text-sm font-bold w-36
                                      ${isDark 
                                        ? 'bg-slate-700 border-slate-600 text-white' 
                                        : 'bg-white border-slate-300 text-slate-900'
                                      }`}
                            autoFocus
                          />
                        ) : (
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {selectedNode.label}
                          </h3>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedNode.connections} connection{selectedNode.connections !== 1 ? 's' : ''} • {selectedNode.category}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveLabel}
                            className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold
                                      ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEditLabel}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1
                                      ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            <Edit3 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={handleDeleteNode}
                            className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-semibold flex items-center justify-center gap-1 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedEdge && (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                          <Workflow className="w-4 h-4 text-white" />
                        </div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Relationship
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedEdge(null)}
                        className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium
                                      ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                        {selectedEdge.source}
                      </span>
                      <span className="text-slate-400">→</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-xs font-bold w-20
                                    ${isDark 
                                      ? 'bg-slate-700 border-slate-600 text-white' 
                                      : 'bg-white border-slate-300 text-slate-900'
                                    }`}
                          autoFocus
                        />
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                          {selectedEdge.label || '→'}
                        </span>
                      )}
                      <span className="text-slate-400">→</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium
                                      ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                        {selectedEdge.target}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveLabel}
                            className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold
                                      ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEditLabel}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1
                                      ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            <Edit3 className="w-4 h-4" /> Edit Label
                          </button>
                          <button
                            onClick={handleDeleteEdge}
                            className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-semibold flex items-center justify-center gap-1 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
      
      {/* Help Text */}
      <div className={`absolute bottom-4 right-4 px-4 py-2 rounded-xl text-xs font-medium z-10 pointer-events-none
                     ${isDark 
                       ? 'bg-slate-800/80 text-slate-400 backdrop-blur-sm' 
                       : 'bg-white/80 text-slate-500 backdrop-blur-sm'
                     }`}>
        <span>Drag nodes to move</span>
        <span className="mx-2 opacity-50">•</span>
        <span>Click to select</span>
        <span className="mx-2 opacity-50">•</span>
        <span>Drag handles to connect</span>
      </div>
    </div>
  );
}

// ============================================
// WRAPPER WITH PROVIDER
// ============================================

function GraphView(props) {
  // Transform concepts/relationships to nodes/edges format if needed
  const normalizedData = React.useMemo(() => {
    if (!props.data) return null;
    
    // If data already has nodes/edges format with labels, use it directly
    if (props.data.nodes?.length && props.data.nodes[0]?.label) {
      return props.data;
    }
    
    // Transform concepts/relationships to nodes/edges
    if (props.data.concepts?.length) {
      // Handle concepts that might be strings or objects
      const nodes = props.data.concepts.map((concept, index) => {
        const label = typeof concept === 'string' ? concept : (concept.label || concept.name || `Concept ${index}`);
        return {
          id: concept.id || `node_${index}`,
          label,
          connections: concept.connections || 1,
          category: concept.category || 'concept',
          section: concept.section || 'main',
          importance: concept.importance || 3,
        };
      });
      
      // Create a map for quick lookup of concept index by label
      const conceptIndexMap = {};
      props.data.concepts.forEach((concept, index) => {
        const label = typeof concept === 'string' ? concept : (concept.label || concept.name);
        conceptIndexMap[label] = index;
      });
      
      // Handle relationships that reference concept labels or indices
      const edges = (props.data.relationships || []).map((rel, index) => {
        let sourceId, targetId;
        
        // Check if relationship uses source/target as labels or node ids
        if (typeof rel.source === 'string' && rel.source.startsWith('node_')) {
          sourceId = rel.source;
        } else {
          const sourceLabel = rel.source || rel.from;
          const sourceIndex = conceptIndexMap[sourceLabel];
          sourceId = sourceIndex !== undefined ? `node_${sourceIndex}` : null;
        }
        
        if (typeof rel.target === 'string' && rel.target.startsWith('node_')) {
          targetId = rel.target;
        } else {
          const targetLabel = rel.target || rel.to;
          const targetIndex = conceptIndexMap[targetLabel];
          targetId = targetIndex !== undefined ? `node_${targetIndex}` : null;
        }
        
        if (!sourceId || !targetId) return null;
        
        return {
          id: rel.id || `edge_${index}`,
          source: sourceId,
          target: targetId,
          label: rel.label || rel.relation || rel.relationship || '',
        };
      }).filter(Boolean);
      
      // Update connection counts based on edges
      const connectionCount = {};
      edges.forEach(edge => {
        connectionCount[edge.source] = (connectionCount[edge.source] || 0) + 1;
        connectionCount[edge.target] = (connectionCount[edge.target] || 0) + 1;
      });
      
      nodes.forEach(node => {
        node.connections = connectionCount[node.id] || 1;
      });
      
      return {
        ...props.data,
        nodes,
        edges,
        sections: props.data.sections || [{ id: 'main', name: 'All Topics', description: 'Complete overview' }],
      };
    }
    
    return null;
  }, [props.data]);

  if (!normalizedData?.nodes?.length) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
        <div className="text-center">
          <Network className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No data to display</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Generate a mind map to see the visualization</p>
        </div>
      </div>
    );
  }
  
  return (
    <ReactFlowProvider>
      <GraphViewInner {...props} data={normalizedData} />
    </ReactFlowProvider>
  );
}

export default GraphView;
