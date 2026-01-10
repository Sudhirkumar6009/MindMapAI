import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Palette, Sparkles, Layers, Grid3X3, LayoutGrid, Network, GitBranch, Target, Workflow, Box, Diamond, Hexagon, Circle, Square, Triangle, ChevronDown, Filter, Microscope, Loader2 } from 'lucide-react';
import ExportMenu from './ExportMenu';
import { useTheme } from '../context/ThemeContext';

cytoscape.use(coseBilkent);

// Professional Diagram Types (like Miro, Lucidchart, Draw.io)
const DIAGRAM_TYPES = [
  {
    id: 'mindmap',
    name: 'Mind Map',
    icon: Network,
    description: 'Classic mind map with central topic',
    nodeStyle: 'uniform', // all nodes same shape
    colorMode: 'gradient', // gradient based on connections
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    icon: Workflow,
    description: 'Process flow with decisions',
    nodeStyle: 'smart', // auto-assign shapes based on role
    colorMode: 'categorical', // colors by type
  },
  {
    id: 'hierarchy',
    name: 'Org Chart',
    icon: GitBranch,
    description: 'Tree-like hierarchical structure',
    nodeStyle: 'rounded',
    colorMode: 'level', // colors by hierarchy level
  },
  {
    id: 'uml',
    name: 'UML Activity',
    icon: Diamond,
    description: 'UML-style activity diagram',
    nodeStyle: 'uml',
    colorMode: 'uml',
  },
  {
    id: 'concept',
    name: 'Concept Map',
    icon: Hexagon,
    description: 'Academic concept mapping',
    nodeStyle: 'shapes',
    colorMode: 'pastel',
  },
];

// Professional Color Palettes (inspired by Miro, Figma, etc.)
const PRO_PALETTES = [
  {
    id: 'miro',
    name: 'Miro Style',
    colors: {
      primary: '#FFD166',    // Yellow - main topics
      secondary: '#F4A261',  // Orange - subtopics
      action: '#70C1B3',     // Teal - actions
      decision: '#B8B8FF',   // Purple - decisions
      result: '#7BDFF2',     // Light blue - results
      hub: '#EF476F',        // Pink/red - central hub
    }
  },
  {
    id: 'notion',
    name: 'Notion Style',
    colors: {
      primary: '#FDECC8',
      secondary: '#F5E0E9',
      action: '#DBEDDB',
      decision: '#E8DEEE',
      result: '#D3E5EF',
      hub: '#FFE2DD',
    }
  },
  {
    id: 'figma',
    name: 'Figma Style',
    colors: {
      primary: '#FF7262',
      secondary: '#A259FF',
      action: '#1ABCFE',
      decision: '#0ACF83',
      result: '#F24E1E',
      hub: '#FF7262',
    }
  },
  {
    id: 'corporate',
    name: 'Corporate',
    colors: {
      primary: '#3B82F6',    // Blue
      secondary: '#F59E0B',  // Amber
      action: '#10B981',     // Green
      decision: '#8B5CF6',   // Purple
      result: '#EC4899',     // Pink
      hub: '#1E40AF',        // Dark blue
    }
  },
  {
    id: 'pastel',
    name: 'Soft Pastel',
    colors: {
      primary: '#AED9E0',
      secondary: '#F6BD60',
      action: '#84A59D',
      decision: '#F5CAC3',
      result: '#B8C0FF',
      hub: '#E07A5F',
    }
  },
];

// Chart Types for different visualization needs
const CHART_TYPES = [
  { 
    id: 'normal', 
    name: 'Normal Chart', 
    icon: Network,
    description: 'Standard mind map layout',
    layout: {
      name: 'cose-bilkent',
      quality: 'proof',
      nodeDimensionsIncludeLabels: true,
      fit: true,
      padding: 2000,
      randomize: true,
      nodeRepulsion: 6000,
      idealEdgeLength: 8,
      edgeElasticity: 0.6,
      gravity: 0.4,
      numIter: 2500,
      animate: 'end',
      animationDuration: 600
    }
  },
  { 
    id: 'topic-optimized', 
    name: 'Best for Topics', 
    icon: LayoutGrid,
    description: 'Optimized layout per topic cluster',
    layout: {
      name: 'cose-bilkent',
      quality: 'proof',
      nodeDimensionsIncludeLabels: true,
      fit: true,
      padding: 1,
      randomize: false,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
      edgeElasticity: 0.5,
      gravity: 0.35,
      numIter: 350,
      tile: true,
      tilingPaddingVertical: 3,
      tilingPaddingHorizontal: 30,
      animate: 'end',
      animationDuration: 800
    }
  },
  { 
    id: 'essential', 
    name: 'Essential Points', 
    icon: Target,
    description: 'Focus on key concepts only',
    layout: {
      name: 'concentric',
      fit: true,
      padding: 40,
      startAngle: 3 / 2 * Math.PI,
      sweep: undefined,
      clockwise: true,
      equidistant: false,
      minNodeSpacing: 40,
      height: undefined,
      width: undefined,
      concentric: function(node) {
        return node.data('connections') || 1;
      },
      levelWidth: function() {
        return 2;
      },
      animate: true,
      animationDuration: 600
    }
  },
  { 
    id: 'hierarchical', 
    name: 'Hierarchy View', 
    icon: GitBranch,
    description: 'Tree-like structure',
    layout: {
      name: 'breadthfirst',
      fit: true,
      directed: true,
      padding: 40,
      circle: false,
      grid: false,
      spacingFactor: 1.0,
      avoidOverlap: true,
      nodeDimensionsIncludeLabels: true,
      roots: undefined,
      maximal: false,
      animate: true,
      animationDuration: 600
    }
  },
  { 
    id: 'radial', 
    name: 'Radial Spread', 
    icon: Workflow,
    description: 'Circular topic arrangement',
    layout: {
      name: 'concentric',
      fit: true,
      padding: 35,
      startAngle: 0,
      sweep: 2 * Math.PI,
      clockwise: true,
      equidistant: true,
      minNodeSpacing: 30,
      concentric: function(node) {
        return node.degree();
      },
      levelWidth: function(nodes) {
        return Math.max(1, Math.floor(nodes.length / 4));
      },
      animate: true,
      animationDuration: 600
    }
  }
];

const LAYOUT_OPTIONS = {
  name: 'cose-bilkent',
  quality: 'proof',
  nodeDimensionsIncludeLabels: true,
  refresh: 30,
  fit: true,
  padding: 50,
  randomize: true,
  nodeRepulsion: 6000,
  idealEdgeLength: 80,
  edgeElasticity: 0.6,
  nestingFactor: 0.1,
  gravity: 0.4,
  numIter: 2500,
  tile: true,
  animate: 'end',
  animationDuration: 600,
  tilingPaddingVertical: 20,
  tilingPaddingHorizontal: 20
};

const NODE_SHAPES = [
  { id: 'ellipse', name: 'Circle', icon: '●' },
  { id: 'round-rectangle', name: 'Rounded', icon: '▢' },
  { id: 'diamond', name: 'Diamond', icon: '◆' },
  { id: 'hexagon', name: 'Hexagon', icon: '⬡' },
  { id: 'octagon', name: 'Octagon', icon: '⯃' },
  { id: 'star', name: 'Star', icon: '★' },
  { id: 'triangle', name: 'Triangle', icon: '▲' },
  { id: 'barrel', name: 'Barrel', icon: '▭' },
];

const COLOR_THEMES = [
  { 
    id: 'ocean', 
    name: 'Ocean', 
    primary: '#0ea5e9', 
    secondary: '#38bdf8', 
    accent: '#06b6d4',
    bg: { dark: '#0c4a6e', light: '#e0f2fe' }
  },
  { 
    id: 'purple', 
    name: 'Cosmic', 
    primary: '#8b5cf6', 
    secondary: '#a78bfa', 
    accent: '#7c3aed',
    bg: { dark: '#4c1d95', light: '#ede9fe' }
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    primary: '#f97316', 
    secondary: '#fb923c', 
    accent: '#ea580c',
    bg: { dark: '#7c2d12', light: '#ffedd5' }
  },
  { 
    id: 'emerald', 
    name: 'Forest', 
    primary: '#10b981', 
    secondary: '#34d399', 
    accent: '#059669',
    bg: { dark: '#064e3b', light: '#d1fae5' }
  },
  { 
    id: 'rose', 
    name: 'Rose', 
    primary: '#f43f5e', 
    secondary: '#fb7185', 
    accent: '#e11d48',
    bg: { dark: '#881337', light: '#ffe4e6' }
  },
  { 
    id: 'gold', 
    name: 'Gold', 
    primary: '#eab308', 
    secondary: '#facc15', 
    accent: '#ca8a04',
    bg: { dark: '#713f12', light: '#fef9c3' }
  },
];

const EDGE_STYLES = [
  { id: 'bezier', name: 'Curved', curveStyle: 'bezier' },
  { id: 'straight', name: 'Straight', curveStyle: 'straight' },
  { id: 'taxi', name: 'Orthogonal', curveStyle: 'taxi' },
  { id: 'unbundled-bezier', name: 'Smooth', curveStyle: 'unbundled-bezier' },
];

const VISUAL_MODES = [
  { id: 'modern', name: 'Modern', desc: 'Clean with shadows' },
  { id: 'neon', name: 'Neon', desc: 'Glowing effects' },
  { id: 'gradient', name: 'Gradient', desc: 'Color transitions' },
  { id: 'minimal', name: 'Minimal', desc: 'Simple & clean' },
];

const createStyle = (shape, theme, edgeStyle, visualMode, isDark) => {
  const bgColor = isDark ? '#0a0f1a' : '#f8fafc';
  const textColor = isDark ? '#ffffff' : '#1e293b';
  const edgeColor = isDark ? '#64748b' : '#cbd5e1';
  const textBgColor = isDark ? 'rgba(10, 15, 26, 0.9)' : 'rgba(248, 250, 252, 0.9)';
  
  const baseNodeStyle = {
    'label': 'data(label)',
    'color': textColor,
    'text-valign': 'center',
    'text-halign': 'center',
    'font-size': '13px',
    'font-weight': '600',
    'font-family': 'Inter, system-ui, sans-serif',
    'text-wrap': 'wrap',
    'text-max-width': '90px',
    'width': 'mapData(connections, 1, 10, 80, 130)',
    'height': 'mapData(connections, 1, 10, 45, 70)',
    'shape': 'rectangle',
    'background-color': theme.primary,
    'background-opacity': 1,
    'border-width': 2,
    'border-color': theme.secondary,
    'text-outline-color': bgColor,
    'text-outline-width': 1,
    'transition-property': 'background-color, border-color, width, height, box-shadow',
    'transition-duration': '0.3s',
    'z-index': 10
  };

  // Apply visual mode specific styles
  if (visualMode === 'neon') {
    baseNodeStyle['shadow-blur'] = 25;
    baseNodeStyle['shadow-color'] = theme.primary;
    baseNodeStyle['shadow-opacity'] = 0.8;
    baseNodeStyle['shadow-offset-x'] = 0;
    baseNodeStyle['shadow-offset-y'] = 0;
    baseNodeStyle['border-width'] = 2;
    baseNodeStyle['background-opacity'] = 0.9;
  }

  if (visualMode === 'gradient') {
    baseNodeStyle['background-fill'] = 'linear-gradient';
    baseNodeStyle['background-gradient-stop-colors'] = `${theme.primary} ${theme.accent}`;
    baseNodeStyle['background-gradient-direction'] = 'to-bottom-right';
  }

  if (visualMode === 'minimal') {
    baseNodeStyle['background-opacity'] = isDark ? 0.2 : 0.3;
    baseNodeStyle['border-width'] = 2;
    baseNodeStyle['border-opacity'] = 0.5;
    baseNodeStyle['text-outline-width'] = 0;
  }

  if (visualMode === 'modern') {
    baseNodeStyle['shadow-blur'] = 15;
    baseNodeStyle['shadow-color'] = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';
    baseNodeStyle['shadow-opacity'] = 1;
    baseNodeStyle['shadow-offset-x'] = 4;
    baseNodeStyle['shadow-offset-y'] = 4;
  }

  return [
    {
      selector: 'node',
      style: baseNodeStyle
    },
    {
      selector: 'node[connections >= 5]',
      style: {
        'background-color': theme.accent,
        'border-width': 3,
        'font-size': '15px',
        'font-weight': '700',
        'width': '140px',
        'height': '75px',
        'z-index': 20
      }
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': '#8b5cf6',
        'border-color': '#a78bfa',
        'border-width': 5,
        'shadow-blur': 30,
        'shadow-color': '#8b5cf6',
        'shadow-opacity': 0.9,
        'z-index': 100
      }
    },
    {
      selector: 'edge',
      style: {
        'width': visualMode === 'minimal' ? 1 : 1.5,
        'line-color': edgeColor,
        'target-arrow-color': edgeColor,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        'control-point-step-size': 40,
        'label': 'data(label)',
        'font-size': '12px',
        'font-weight': '600',
        'color': isDark ? '#94a3b8' : '#475569',
        'text-rotation': 'autorotate',
        'text-margin-y': -12,
        'text-background-color': textBgColor,
        'text-background-opacity': 0.95,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'transition-property': 'line-color, width',
        'transition-duration': '0.3s',
        'opacity': 0.7
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': theme.primary,
        'target-arrow-color': theme.primary,
        'width': 2.5,
        'opacity': 1
      }
    },
    {
      selector: '.highlighted',
      style: {
        'background-color': '#ec4899',
        'border-color': '#f472b6',
        'line-color': '#ec4899',
        'target-arrow-color': '#ec4899',
        'shadow-blur': 30,
        'shadow-color': '#ec4899',
        'shadow-opacity': 0.8,
        'opacity': 1,
        'z-index': 50
      }
    },
    {
      selector: '.hub-node',
      style: {
        'background-color': theme.accent,
        'border-width': 3,
        'width': '150px',
        'height': '80px',
        'font-size': '16px',
        'font-weight': '700',
        'shadow-blur': visualMode === 'neon' ? 35 : 20,
        'shadow-color': theme.accent,
        'shadow-opacity': 0.6
      }
    },
    {
      selector: '.faded',
      style: {
        'opacity': 0.25
      }
    }
  ];
};

// Create professional diagram styles (Miro/Lucidchart style)
const createProStyle = (diagramType, palette, isDark) => {
  const bgColor = isDark ? '#0a0f1a' : '#f8fafc';
  const textColor = isDark ? '#1e293b' : '#1e293b'; // Dark text for visibility on colored backgrounds
  const edgeColor = isDark ? '#64748b' : '#cbd5e1';
  const colors = palette.colors;

  // Base style - smaller square boxes with readable text
  const baseNode = {
    'label': 'data(label)',
    'text-valign': 'center',
    'text-halign': 'center',
    'font-size': '12px',
    'font-weight': '600',
    'font-family': 'Inter, system-ui, sans-serif',
    'text-wrap': 'wrap',
    'text-max-width': '85px',
    'color': textColor,
    'text-outline-width': 0,
    'border-width': 2,
    'border-color': 'rgba(0,0,0,0.15)',
    'shadow-blur': 6,
    'shadow-color': 'rgba(0,0,0,0.1)',
    'shadow-opacity': 1,
    'shadow-offset-x': 1,
    'shadow-offset-y': 2,
    'transition-property': 'background-color, border-color, width, height',
    'transition-duration': '0.3s',
  };

  let styles = [];

  if (diagramType.id === 'flowchart') {
    // Flowchart: Square boxes - smaller sizes
    styles = [
      {
        selector: 'node',
        style: {
          ...baseNode,
          'shape': 'rectangle',
          'width': '100px',
          'height': '50px',
          'background-color': colors.primary,
        }
      },
      {
        selector: 'node[connections >= 4]', // Hub/Start nodes
        style: {
          'shape': 'rectangle',
          'background-color': colors.hub,
          'width': '120px',
          'height': '60px',
          'font-size': '14px',
          'font-weight': '700',
          'border-width': 2,
        }
      },
      {
        selector: 'node[connections = 2]', // Decision-like nodes
        style: {
          'shape': 'diamond',
          'background-color': colors.decision,
          'width': '75px',
          'height': '75px',
          'text-max-width': '60px',
          'font-size': '11px',
        }
      },
      {
        selector: 'node[connections = 1]', // End/leaf nodes
        style: {
          'shape': 'rectangle',
          'background-color': colors.result,
          'width': '95px',
          'height': '45px',
        }
      },
      {
        selector: 'node[connections = 3]', // Action nodes
        style: {
          'shape': 'rectangle',
          'background-color': colors.action,
          'width': '105px',
          'height': '50px',
        }
      },
    ];
  } else if (diagramType.id === 'hierarchy') {
    // Org chart style - smaller square boxes
    styles = [
      {
        selector: 'node',
        style: {
          ...baseNode,
          'shape': 'rectangle',
          'width': '105px',
          'height': '50px',
          'background-color': colors.secondary,
        }
      },
      {
        selector: 'node[connections >= 5]', // Top level
        style: {
          'background-color': colors.hub,
          'width': '130px',
          'height': '60px',
          'font-size': '14px',
          'font-weight': '700',
          'border-width': 2,
          'color': '#ffffff',
        }
      },
      {
        selector: 'node[connections >= 3][connections < 5]', // Mid level
        style: {
          'background-color': colors.primary,
          'width': '115px',
          'height': '55px',
          'font-size': '13px',
        }
      },
      {
        selector: 'node[connections < 3]', // Lower level
        style: {
          'background-color': colors.action,
          'width': '100px',
          'height': '45px',
        }
      },
    ];
  } else if (diagramType.id === 'uml') {
    // UML Activity diagram style - smaller boxes
    styles = [
      {
        selector: 'node',
        style: {
          ...baseNode,
          'shape': 'rectangle',
          'width': '100px',
          'height': '45px',
          'background-color': colors.action,
        }
      },
      {
        selector: 'node[connections >= 4]', // Start/major nodes
        style: {
          'shape': 'ellipse',
          'background-color': colors.hub,
          'width': '110px',
          'height': '55px',
          'font-size': '13px',
          'font-weight': '700',
          'color': '#ffffff',
        }
      },
      {
        selector: 'node[connections = 2]', // Decision points
        style: {
          'shape': 'diamond',
          'background-color': colors.decision,
          'width': '70px',
          'height': '70px',
          'font-size': '10px',
          'text-max-width': '55px',
        }
      },
      {
        selector: 'node[connections = 1]', // End states
        style: {
          'shape': 'ellipse',
          'background-color': colors.result,
          'width': '90px',
          'height': '40px',
        }
      },
    ];
  } else if (diagramType.id === 'concept') {
    // Concept map - smaller boxes
    styles = [
      {
        selector: 'node',
        style: {
          ...baseNode,
          'shape': 'rectangle',
          'width': 'mapData(connections, 1, 8, 80, 120)',
          'height': 'mapData(connections, 1, 8, 45, 65)',
          'background-color': colors.primary,
        }
      },
      {
        selector: 'node[connections >= 4]',
        style: {
          'shape': 'rectangle',
          'background-color': colors.hub,
          'width': '130px',
          'height': '70px',
          'font-size': '14px',
          'font-weight': '700',
        }
      },
      {
        selector: 'node[connections = 3]',
        style: {
          'shape': 'rectangle',
          'background-color': colors.secondary,
          'width': '110px',
          'height': '55px',
          'font-size': '12px',
        }
      },
      {
        selector: 'node[connections <= 2]',
        style: {
          'shape': 'rectangle',
          'background-color': colors.action,
          'width': '95px',
          'height': '45px',
        }
      },
    ];
  } else {
    // Default mind map style - smaller square boxes
    styles = [
      {
        selector: 'node',
        style: {
          ...baseNode,
          'shape': 'rectangle',
          'width': 'mapData(connections, 1, 10, 85, 130)',
          'height': 'mapData(connections, 1, 10, 45, 70)',
          'background-color': colors.primary,
        }
      },
      {
        selector: 'node[connections >= 5]',
        style: {
          'background-color': colors.hub,
          'width': '145px',
          'height': '80px',
          'font-size': '15px',
          'font-weight': '700',
          'border-width': 2,
        }
      },
      {
        selector: 'node[connections >= 3][connections < 5]',
        style: {
          'background-color': colors.secondary,
          'width': '115px',
          'height': '60px',
          'font-size': '13px',
        }
      },
    ];
  }

  // Common edge and interaction styles - bigger edge label fonts
  styles.push(
    {
      selector: 'node:selected',
      style: {
        'border-color': '#3B82F6',
        'border-width': 3,
        'shadow-blur': 15,
        'shadow-color': '#3B82F6',
        'shadow-opacity': 0.6,
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 1.5,
        'line-color': edgeColor,
        'target-arrow-color': edgeColor,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        'control-point-step-size': 40,
        'label': 'data(label)',
        'font-size': '12px',
        'font-weight': '600',
        'color': isDark ? '#94a3b8' : '#475569',
        'text-rotation': 'autorotate',
        'text-margin-y': -12,
        'text-background-color': bgColor,
        'text-background-opacity': 0.95,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'opacity': 0.7,
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#3B82F6',
        'target-arrow-color': '#3B82F6',
        'width': 2,
        'opacity': 1,
      }
    },
    {
      selector: '.highlighted',
      style: {
        'border-color': '#3B82F6',
        'border-width': 4,
        'line-color': '#3B82F6',
        'target-arrow-color': '#3B82F6',
        'shadow-blur': 20,
        'shadow-color': '#3B82F6',
        'shadow-opacity': 0.7,
        'opacity': 1,
      }
    },
    {
      selector: '.faded',
      style: {
        'opacity': 0.2,
      }
    }
  );

  return styles;
};

function GraphView({ data, metadata = {}, onAnalyzeInDepth }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const { isDark } = useTheme();
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showChartPanel, setShowChartPanel] = useState(false);
  const [showDiagramPanel, setShowDiagramPanel] = useState(false);
  const [nodeShape, setNodeShape] = useState('round-rectangle');
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0]);
  const [edgeStyle, setEdgeStyle] = useState('bezier');
  const [visualMode, setVisualMode] = useState('modern');
  const [chartType, setChartType] = useState(CHART_TYPES[0]);
  const [diagramType, setDiagramType] = useState(DIAGRAM_TYPES[0]);
  const [proPalette, setProPalette] = useState(PRO_PALETTES[0]);
  const [useProStyle, setUseProStyle] = useState(false);
  
  // Topic filter state
  const [selectedSection, setSelectedSection] = useState('main');
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Get sections from data
  const sections = data?.sections || [{ id: 'main', name: 'All Components', description: 'Complete overview' }];

  const applyStyle = () => {
    if (cyRef.current) {
      if (useProStyle) {
        const newStyle = createProStyle(diagramType, proPalette, isDark);
        cyRef.current.style(newStyle);
      } else {
        const newStyle = createStyle(nodeShape, colorTheme, edgeStyle, visualMode, isDark);
        cyRef.current.style(newStyle);
      }
    }
  };

  const applyDiagramType = (type) => {
    setDiagramType(type);
    setUseProStyle(true);
    if (cyRef.current) {
      const newStyle = createProStyle(type, proPalette, isDark);
      cyRef.current.style(newStyle);
      
      // Apply appropriate layout for the diagram type
      let layout;
      if (type.id === 'hierarchy') {
        layout = CHART_TYPES.find(c => c.id === 'hierarchical')?.layout || CHART_TYPES[0].layout;
      } else if (type.id === 'flowchart' || type.id === 'uml') {
        layout = CHART_TYPES.find(c => c.id === 'topic-optimized')?.layout || CHART_TYPES[0].layout;
      } else {
        layout = CHART_TYPES[0].layout;
      }
      cyRef.current.layout(layout).run();
    }
  };

  const applyProPalette = (palette) => {
    setProPalette(palette);
    if (cyRef.current && useProStyle) {
      const newStyle = createProStyle(diagramType, palette, isDark);
      cyRef.current.style(newStyle);
    }
  };

  const applyChartLayout = (type) => {
    if (cyRef.current && type) {
      setChartType(type);
      
      // For essential points, filter to show only high-connection nodes
      if (type.id === 'essential') {
        const allNodes = cyRef.current.nodes();
        const avgConnections = allNodes.reduce((sum, n) => sum + (n.data('connections') || 1), 0) / allNodes.length;
        
        allNodes.forEach(node => {
          const connections = node.data('connections') || 1;
          if (connections < avgConnections * 0.5) {
            node.addClass('faded');
          } else {
            node.removeClass('faded');
          }
        });
      } else {
        cyRef.current.nodes().removeClass('faded');
      }
      
      cyRef.current.layout(type.layout).run();
    }
  };

  useEffect(() => {
    applyStyle();
  }, [nodeShape, colorTheme, edgeStyle, visualMode, isDark, useProStyle, diagramType, proPalette]);

  // Filter nodes based on selected section
  const getFilteredElements = () => {
    if (!data?.nodes || !data?.edges) return [];
    
    let filteredNodes = data.nodes;
    let filteredEdges = data.edges;
    
    // If a specific section is selected (not 'main'), filter by section
    if (selectedSection !== 'main') {
      filteredNodes = data.nodes.filter(node => 
        node.section === selectedSection || 
        node.section === 'shared' ||
        !node.section // Include nodes without section (backwards compat)
      );
      
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = data.edges.filter(edge => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
    }
    
    return [
      ...filteredNodes.map(node => ({
        data: { 
          id: node.id, 
          label: node.label,
          connections: Math.max(node.connections || 1, 1),
          section: node.section || 'main',
          category: node.category || 'component',
          importance: node.importance || 3
        }
      })),
      ...filteredEdges.map(edge => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label || '',
          originalLabel: edge.originalLabel || edge.label || '',
          sourceLabel: edge.sourceLabel || '',
          targetLabel: edge.targetLabel || ''
        }
      }))
    ];
  };

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const elements = getFilteredElements();

    const initialStyle = createStyle(nodeShape, colorTheme, edgeStyle, visualMode, isDark);

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: initialStyle,
      layout: LAYOUT_OPTIONS,
      minZoom: 0.1,
      maxZoom: 4,
      wheelSensitivity: 0.2
    });

    cyRef.current.nodes().forEach(node => {
      if (node.connectedEdges().length >= 5) {
        node.addClass('hub-node');
      }
    });

    cyRef.current.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode({
        id: node.id(),
        label: node.data('label'),
        connections: node.connectedEdges().length,
        neighbors: node.neighborhood('node').map(n => n.data('label'))
      });
      setSelectedEdge(null);

      // Highlight connected elements and fade others
      cyRef.current.elements().removeClass('highlighted faded');
      const connectedElements = node.closedNeighborhood();
      cyRef.current.elements().not(connectedElements).addClass('faded');
      node.addClass('highlighted');
      node.connectedEdges().addClass('highlighted');
      node.neighborhood('node').addClass('highlighted');
    });

    // Edge click handler
    cyRef.current.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdge({
        id: edge.id(),
        label: edge.data('label'),
        originalLabel: edge.data('originalLabel'),
        source: edge.data('sourceLabel') || edge.source().data('label'),
        target: edge.data('targetLabel') || edge.target().data('label')
      });
      setSelectedNode(null);

      // Highlight the edge and connected nodes
      cyRef.current.elements().removeClass('highlighted faded');
      cyRef.current.elements().not(edge.connectedNodes().union(edge)).addClass('faded');
      edge.addClass('highlighted');
      edge.connectedNodes().addClass('highlighted');
    });

    cyRef.current.on('tap', (evt) => {
      if (evt.target === cyRef.current) {
        setSelectedNode(null);
        setSelectedEdge(null);
        cyRef.current.elements().removeClass('highlighted faded');
      }
    });

    // Double click to zoom to node
    cyRef.current.on('dbltap', 'node', (evt) => {
      cyRef.current.animate({
        center: { eles: evt.target },
        zoom: 2
      }, { duration: 500 });
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data, selectedSection]);

  const handleZoomIn = () => cyRef.current?.animate({ zoom: cyRef.current.zoom() * 1.3 }, { duration: 200 });
  const handleZoomOut = () => cyRef.current?.animate({ zoom: cyRef.current.zoom() * 0.7 }, { duration: 200 });
  const handleFit = () => cyRef.current?.animate({ fit: { padding: 60 } }, { duration: 400 });
  const handleReset = () => {
    cyRef.current?.nodes().removeClass('faded');
    cyRef.current?.layout(chartType.layout || LAYOUT_OPTIONS).run();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      {/* Graph Container with themed background */}
      <div 
        ref={containerRef} 
        className={`graph-container w-full rounded-2xl border-2 transition-all duration-300
                   ${isDark 
                     ? 'border-dark-700/50 shadow-[inset_0_0_100px_rgba(14,165,233,0.03)]' 
                     : 'border-dark-200 shadow-[inset_0_0_100px_rgba(14,165,233,0.05)]'
                   }`}
        style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}
      />
      
      {/* Style Panel Toggle */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Professional Diagrams Button */}
        <button
          onClick={() => { setShowDiagramPanel(!showDiagramPanel); setShowStylePanel(false); setShowChartPanel(false); }}
          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 shadow-lg
                    ${showDiagramPanel 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-white shadow-amber-500/30' 
                      : isDark
                        ? 'bg-dark-800/90 hover:bg-dark-700 border-dark-600 text-dark-300 hover:text-white backdrop-blur-sm'
                        : 'bg-white/90 hover:bg-white border-dark-200 text-dark-600 hover:text-dark-900 backdrop-blur-sm'
                    }`}
          title="Professional Diagrams"
        >
          <Workflow className="w-5 h-5" />
          <span className="text-sm font-semibold">Pro Diagrams</span>
        </button>

        <button
          onClick={() => { setShowStylePanel(!showStylePanel); setShowChartPanel(false); setShowDiagramPanel(false); }}
          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 shadow-lg
                    ${showStylePanel 
                      ? 'bg-primary-600 border-primary-400 text-white shadow-primary-500/30' 
                      : isDark
                        ? 'bg-dark-800/90 hover:bg-dark-700 border-dark-600 text-dark-300 hover:text-white backdrop-blur-sm'
                        : 'bg-white/90 hover:bg-white border-dark-200 text-dark-600 hover:text-dark-900 backdrop-blur-sm'
                    }`}
          title="Style Options"
        >
          <Palette className="w-5 h-5" />
          <span className="text-sm font-semibold">Customize</span>
        </button>
        
        <button
          onClick={() => { setShowChartPanel(!showChartPanel); setShowStylePanel(false); setShowDiagramPanel(false); }}
          className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 shadow-lg
                    ${showChartPanel 
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30' 
                      : isDark
                        ? 'bg-dark-800/90 hover:bg-dark-700 border-dark-600 text-dark-300 hover:text-white backdrop-blur-sm'
                        : 'bg-white/90 hover:bg-white border-dark-200 text-dark-600 hover:text-dark-900 backdrop-blur-sm'
                    }`}
          title="Chart Types"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-sm font-semibold">Layout</span>
        </button>
      </div>

      {/* Professional Diagram Panel */}
      {showDiagramPanel && (
        <div className={`absolute top-4 left-48 w-96 rounded-2xl border-2 shadow-2xl overflow-hidden z-20 max-h-[80vh] overflow-y-auto
                       ${isDark 
                         ? 'bg-dark-800/95 border-dark-600 backdrop-blur-xl' 
                         : 'bg-white/95 border-dark-200 backdrop-blur-xl'
                       }`}>
          <div className={`p-4 border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10 ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>
              <Workflow className="w-5 h-5 text-amber-500" />
              Professional Diagrams
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
              Miro, Lucidchart & UML styles
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Diagram Types */}
            <div>
              <label className={`text-xs font-semibold uppercase tracking-wide mb-2 block ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                Diagram Type
              </label>
              <div className="grid grid-cols-1 gap-2">
                {DIAGRAM_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => applyDiagramType(type)}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left
                                ${diagramType.id === type.id && useProStyle
                                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50' 
                                  : isDark
                                    ? 'border-dark-600 hover:border-amber-500/50 hover:bg-dark-700/50'
                                    : 'border-dark-200 hover:border-amber-400 hover:bg-amber-50'
                                }`}
                    >
                      <div className={`p-2 rounded-lg ${diagramType.id === type.id && useProStyle ? 'bg-amber-500 text-white' : isDark ? 'bg-dark-700 text-dark-300' : 'bg-dark-100 text-dark-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`font-semibold block ${isDark ? 'text-dark-100' : 'text-dark-800'}`}>{type.name}</span>
                        <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>{type.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Color Palettes */}
            <div>
              <label className={`text-xs font-semibold uppercase tracking-wide mb-2 block ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                Color Palette
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRO_PALETTES.map(palette => (
                  <button
                    key={palette.id}
                    onClick={() => applyProPalette(palette)}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3
                              ${proPalette.id === palette.id && useProStyle
                                ? 'border-amber-500/50 bg-amber-500/10' 
                                : isDark
                                  ? 'border-dark-600 hover:border-dark-500'
                                  : 'border-dark-200 hover:border-dark-300'
                              }`}
                  >
                    <div className="flex gap-1">
                      {Object.values(palette.colors).slice(0, 5).map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className={`font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Switch to Custom */}
            <button
              onClick={() => { setUseProStyle(false); applyStyle(); }}
              className={`w-full p-3 rounded-xl border-2 transition-all text-center
                        ${!useProStyle
                          ? 'bg-primary-500/10 border-primary-500/50' 
                          : isDark
                            ? 'border-dark-600 hover:border-dark-500'
                            : 'border-dark-200 hover:border-dark-300'
                        }`}
            >
              <span className={`font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>
                ← Back to Custom Styling
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Chart Type Panel */}
      {showChartPanel && (
        <div className={`absolute top-4 left-48 w-80 rounded-2xl border-2 shadow-2xl overflow-hidden z-20
                       ${isDark 
                         ? 'bg-dark-800/95 border-dark-600 backdrop-blur-xl' 
                         : 'bg-white/95 border-dark-200 backdrop-blur-xl'
                       }`}>
          <div className={`p-4 border-b ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>
              <LayoutGrid className="w-5 h-5 text-emerald-400" />
              Chart Type Selection
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
              Choose the best visualization for your data
            </p>
          </div>

          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
            {CHART_TYPES.map((type) => {
              const Icon = type.icon;
              const isActive = chartType.id === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => { applyChartLayout(type); setShowChartPanel(false); }}
                  className={`w-full p-1 rounded-xl border-2 text-left transition-all flex items-start gap-3
                            ${isActive 
                              ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20' 
                              : isDark
                                ? 'bg-dark-700/50 border-dark-600 hover:border-dark-500 hover:bg-dark-700'
                                : 'bg-dark-50 border-dark-200 hover:border-dark-300 hover:bg-dark-100'
                            }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500/30' : isDark ? 'bg-dark-600' : 'bg-dark-200'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : isDark ? 'text-dark-300' : 'text-dark-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isActive ? 'text-emerald-400' : isDark ? 'text-dark-100' : 'text-dark-800'}`}>
                        {type.name}
                      </span>
                      {isActive && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`p-3 border-t ${isDark ? 'border-dark-700 bg-dark-900/50' : 'border-dark-200 bg-dark-50'}`}>
            <div className="flex items-center gap-2 text-xs">
              <span className={isDark ? 'text-dark-500' : 'text-dark-400'}>💡 Tip:</span>
              <span className={isDark ? 'text-dark-400' : 'text-dark-500'}>
                Use <strong>Essential Points</strong> for presentations
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Style Panel */}
      {showStylePanel && (
        <div className={`absolute top-4 left-48 w-80 rounded-2xl border-2 shadow-2xl overflow-hidden z-20
                       ${isDark 
                         ? 'bg-dark-800/95 border-dark-600 backdrop-blur-xl' 
                         : 'bg-white/95 border-dark-200 backdrop-blur-xl'
                       }`}>
          <div className={`p-4 border-b ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
            <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>
              <Sparkles className="w-5 h-5 text-primary-400" />
              Graph Styling
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
              Customize the appearance of your mind map
            </p>
          </div>

          <div className="p-4 space-y-5 max-h-[450px] overflow-y-auto">
            {/* Visual Mode */}
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2
                              ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                <Layers className="w-3.5 h-3.5" />
                Visual Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VISUAL_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setVisualMode(mode.id)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all
                              ${visualMode === mode.id 
                                ? 'bg-primary-500/20 border-primary-400 shadow-lg shadow-primary-500/20' 
                                : isDark
                                  ? 'bg-dark-700/50 border-dark-600 hover:border-dark-500'
                                  : 'bg-dark-50 border-dark-200 hover:border-dark-300'
                              }`}
                  >
                    <span className={`text-sm font-semibold block ${visualMode === mode.id ? 'text-primary-400' : isDark ? 'text-dark-200' : 'text-dark-700'}`}>
                      {mode.name}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Node Shape */}
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-3 block
                              ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                Node Shape
              </label>
              <div className="grid grid-cols-4 gap-2">
                {NODE_SHAPES.map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => setNodeShape(shape.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all text-xl
                              ${nodeShape === shape.id 
                                ? 'bg-primary-500/20 border-primary-400 shadow-lg' 
                                : isDark
                                  ? 'bg-dark-700/50 border-dark-600 hover:border-dark-500 text-dark-300'
                                  : 'bg-dark-50 border-dark-200 hover:border-dark-300 text-dark-600'
                              }`}
                    title={shape.name}
                  >
                    {shape.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme */}
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-3 block
                              ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                Color Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme)}
                    className={`p-2.5 rounded-xl border-2 transition-all flex items-center gap-2
                              ${colorTheme.id === theme.id 
                                ? 'border-white/50 ring-2 ring-white/30 shadow-lg' 
                                : isDark
                                  ? 'border-dark-600 hover:border-dark-500'
                                  : 'border-dark-200 hover:border-dark-300'
                              }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full shadow-inner"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` 
                      }}
                    />
                    <span className={`text-xs font-medium ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>
                      {theme.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Edge Style */}
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2
                              ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                <Grid3X3 className="w-3.5 h-3.5" />
                Edge Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EDGE_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setEdgeStyle(style.curveStyle)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                              ${edgeStyle === style.curveStyle 
                                ? 'bg-primary-500/20 border-primary-400' 
                                : isDark
                                  ? 'bg-dark-700/50 border-dark-600 hover:border-dark-500 text-dark-300'
                                  : 'bg-dark-50 border-dark-200 hover:border-dark-300 text-dark-600'
                              }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-3 border-t ${isDark ? 'border-dark-700 bg-dark-900/50' : 'border-dark-200 bg-dark-50'}`}>
            <button
              onClick={() => {
                setNodeShape('round-rectangle');
                setColorTheme(COLOR_THEMES[0]);
                setEdgeStyle('bezier');
                setVisualMode('modern');
              }}
              className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors
                        ${isDark 
                          ? 'text-dark-400 hover:text-white hover:bg-dark-700' 
                          : 'text-dark-500 hover:text-dark-900 hover:bg-dark-100'
                        }`}
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
      
      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <ExportMenu data={data} cyRef={cyRef} metadata={metadata} />
        {[
          { icon: ZoomIn, action: handleZoomIn, label: 'Zoom In' },
          { icon: ZoomOut, action: handleZoomOut, label: 'Zoom Out' },
          { icon: Maximize2, action: handleFit, label: 'Fit View' },
          { icon: RotateCcw, action: handleReset, label: 'Reset Layout' }
        ].map(({ icon: Icon, action, label }) => (
          <button
            key={label}
            onClick={action}
            className={`p-2.5 rounded-xl border-2 transition-all group shadow-lg
                      ${isDark
                        ? 'bg-dark-800/90 hover:bg-dark-700 border-dark-600 backdrop-blur-sm'
                        : 'bg-white/90 hover:bg-white border-dark-200 backdrop-blur-sm'
                      }`}
            title={label}
          >
            <Icon className={`w-5 h-5 transition-colors
                           ${isDark ? 'text-dark-400 group-hover:text-white' : 'text-dark-500 group-hover:text-dark-900'}`} />
          </button>
        ))}
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className={`absolute bottom-20 left-4 p-5 rounded-2xl border-2 max-w-sm shadow-2xl z-20
                       ${isDark 
                         ? 'bg-dark-800/95 border-dark-600 backdrop-blur-xl' 
                         : 'bg-white/95 border-dark-200 backdrop-blur-xl'
                       }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-dark-900'}`}>
                {selectedNode.label}
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                {selectedNode.connections} connection{selectedNode.connections !== 1 ? 's' : ''}
              </p>
              {selectedNode.neighbors?.length > 0 && (
                <div className="mt-3">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 
                              ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                    Connected to:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.neighbors.slice(0, 5).map((n, i) => (
                      <span 
                        key={i}
                        className={`px-2 py-1 rounded-lg text-xs font-medium
                                  ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-dark-100 text-dark-600'}`}
                      >
                        {n}
                      </span>
                    ))}
                    {selectedNode.neighbors.length > 5 && (
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium
                                      ${isDark ? 'bg-dark-700 text-dark-400' : 'bg-dark-100 text-dark-500'}`}>
                        +{selectedNode.neighbors.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Edge Info */}
      {selectedEdge && (
        <div className={`absolute bottom-20 left-4 p-5 rounded-2xl border-2 max-w-sm shadow-2xl z-20
                       ${isDark 
                         ? 'bg-dark-800/95 border-dark-600 backdrop-blur-xl' 
                         : 'bg-white/95 border-dark-200 backdrop-blur-xl'
                       }`}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-dark-900'}`}>
                Relationship
              </h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-medium
                                  ${isDark ? 'bg-primary-500/20 text-primary-300' : 'bg-primary-100 text-primary-700'}`}>
                    {selectedEdge.source}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                  ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedEdge.label || '→'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-medium
                                  ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                    {selectedEdge.target}
                  </span>
                </div>
                {selectedEdge.originalLabel && selectedEdge.originalLabel !== selectedEdge.label && (
                  <p className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                    Original: <span className="italic">{selectedEdge.originalLabel}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className={`absolute bottom-4 right-4 px-4 py-2 rounded-xl text-xs font-medium z-10
                     ${isDark 
                       ? 'bg-dark-800/80 text-dark-400 backdrop-blur-sm' 
                       : 'bg-white/80 text-dark-500 backdrop-blur-sm'
                     }`}>
        <span className="opacity-75">Click nodes to explore</span>
        <span className="mx-2 opacity-50">•</span>
        <span className="opacity-75">Double-click to zoom</span>
        <span className="mx-2 opacity-50">•</span>
        <span className="opacity-75">Scroll to zoom</span>
      </div>

      {/* Current Chart Type Indicator */}
      <div className={`absolute bottom-4 left-4 z-20 flex flex-col gap-2`}>
        {/* Topic/Section Filter - Only show if sections exist */}
        {sections.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowSectionDropdown(!showSectionDropdown)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all shadow-lg border-2
                        ${isDark 
                          ? 'bg-dark-800/95 backdrop-blur-sm border-dark-600 hover:border-primary-500' 
                          : 'bg-white/95 backdrop-blur-sm border-dark-200 hover:border-primary-500'
                        }`}
            >
              <Filter className={`w-4 h-4 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
              <div className="text-left">
                <span className={`text-xs font-semibold ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                  {sections.find(s => s.id === selectedSection)?.name || 'All Components'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSectionDropdown ? 'rotate-180' : ''} ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
            </button>
            
            {/* Dropdown */}
            {showSectionDropdown && (
              <div className={`absolute bottom-full left-0 mb-2 w-64 rounded-xl border-2 shadow-2xl overflow-hidden
                            ${isDark 
                              ? 'bg-dark-800/98 border-dark-600 backdrop-blur-xl' 
                              : 'bg-white/98 border-dark-200 backdrop-blur-xl'
                            }`}>
                <div className={`px-3 py-2 border-b ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                    Filter by Section
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
                                  ? isDark
                                    ? 'bg-primary-500/20 text-primary-300'
                                    : 'bg-primary-50 text-primary-700'
                                  : isDark
                                    ? 'hover:bg-dark-700 text-dark-300'
                                    : 'hover:bg-dark-50 text-dark-600'
                                }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${selectedSection === section.id ? 'bg-primary-500' : isDark ? 'bg-dark-600' : 'bg-dark-300'}`} />
                      <div>
                        <div className="text-sm font-medium">{section.name}</div>
                        {section.description && (
                          <div className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                            {section.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Analyze In-Depth Button */}
                {selectedSection !== 'main' && onAnalyzeInDepth && (
                  <div className={`border-t px-3 py-2 ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
                    <button
                      onClick={() => {
                        setIsAnalyzing(true);
                        setShowSectionDropdown(false);
                        onAnalyzeInDepth(selectedSection);
                        setTimeout(() => setIsAnalyzing(false), 500);
                      }}
                      disabled={isAnalyzing}
                      className={`w-full px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all
                                bg-gradient-to-r from-purple-600 to-primary-600 hover:from-purple-500 hover:to-primary-500
                                text-white shadow-lg disabled:opacity-50`}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Microscope className="w-4 h-4" />
                      )}
                      Analyze In-Depth
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Layout Indicator */}
        <div className={`px-4 py-2.5 rounded-xl flex items-center gap-3
                       ${isDark 
                         ? 'bg-dark-800/80 backdrop-blur-sm border border-dark-700' 
                         : 'bg-white/80 backdrop-blur-sm border border-dark-200'
                       }`}>
          {(() => {
            const Icon = chartType.icon;
            return <Icon className="w-4 h-4 text-emerald-400" />;
          })()}
          <div>
            <span className={`text-xs font-semibold ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
              {chartType.name}
            </span>
            <span className={`text-xs ml-2 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
              Layout
            </span>
          </div>
          
          {/* Show Pro Diagram Type if active */}
          {useProStyle && (
            <>
              <div className={`w-px h-6 ${isDark ? 'bg-dark-600' : 'bg-dark-300'}`} />
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Object.values(proPalette.colors).slice(0, 3).map((color, i) => (
                    <div 
                      key={i}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div>
                  <span className={`text-xs font-semibold ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                    {diagramType.name}
                  </span>
                  <span className={`text-xs ml-1 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                    • {proPalette.name}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* In-Depth Insights */}
        {data?.insights && data.insights.length > 0 && (
          <div className={`px-4 py-3 rounded-xl max-w-xs
                         ${isDark 
                           ? 'bg-purple-500/10 border border-purple-500/30' 
                           : 'bg-purple-50 border border-purple-200'
                         }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className={`text-xs font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                AI Insights
              </span>
            </div>
            <ul className="space-y-1">
              {data.insights.slice(0, 3).map((insight, i) => (
                <li key={i} className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphView;
