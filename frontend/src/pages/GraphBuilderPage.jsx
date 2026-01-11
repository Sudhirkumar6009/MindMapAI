import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useTheme } from '../context/ThemeContext';
import { nodeTypes } from '../components/flow/CustomNodes';
import ExportMenu from '../components/ExportMenu';
import {
  // Shape Icons
  Square,
  Circle,
  Triangle,
  Diamond,
  Hexagon,
  Octagon,
  Star,
  Heart,
  // UI Icons
  Plus,
  Minus,
  Trash2,
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  Copy,
  Clipboard,
  Grid,
  Layers,
  Move,
  MousePointer2,
  Type,
  Image,
  Link2,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Loader2,
  Check,
  X,
  Settings,
  Palette,
  PanelLeft,
  PanelRight,
  // Category Icons
  Workflow,
  GitBranch,
  Database,
  Server,
  Cloud,
  Code,
  FileText,
  Users,
  User,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Lightbulb,
  Target,
  Flag,
  Bookmark,
  Tag,
  Zap,
  Activity,
  BarChart,
  PieChart,
  TrendingUp,
  Globe,
  Map,
  Home,
  Building,
  Lock,
  Unlock,
  Shield,
  Key,
  Eye,
  EyeOff,
  Search,
  Filter,
  Settings2,
  Cog,
} from 'lucide-react';

// ============================================
// COMPONENT LIBRARY CONFIGURATION
// ============================================

const COMPONENT_CATEGORIES = {
  shapes: {
    name: 'Shapes',
    icon: Square,
    items: [
      { id: 'rectangle', name: 'Rectangle', icon: Square, color: '#10B981', nodeType: 'standard' },
      { id: 'rounded', name: 'Rounded', icon: Square, color: '#8B5CF6', nodeType: 'mindmap' },
      { id: 'circle', name: 'Circle', icon: Circle, color: '#10B981', nodeType: 'circle' },
      { id: 'diamond', name: 'Diamond', icon: Diamond, color: '#F59E0B', nodeType: 'flowchart' },
      { id: 'hexagon', name: 'Hexagon', icon: Hexagon, color: '#EF4444', nodeType: 'hexagon' },
    ]
  },
  flowchart: {
    name: 'Flowchart',
    icon: Workflow,
    items: [
      { id: 'start', name: 'Start', icon: Circle, color: '#22C55E', nodeType: 'circle', label: 'Start' },
      { id: 'end', name: 'End', icon: Circle, color: '#EF4444', nodeType: 'circle', label: 'End' },
      { id: 'process', name: 'Process', icon: Square, color: '#10B981', nodeType: 'standard', label: 'Process' },
      { id: 'decision', name: 'Decision', icon: Diamond, color: '#F59E0B', nodeType: 'flowchart', label: 'Decision?' },
      { id: 'data', name: 'Data', icon: Database, color: '#8B5CF6', nodeType: 'standard', label: 'Data' },
    ]
  },
  icons: {
    name: 'Icons',
    icon: Star,
    items: [
      { id: 'user', name: 'User', icon: User, color: '#10B981', nodeType: 'circle' },
      { id: 'users', name: 'Team', icon: Users, color: '#8B5CF6', nodeType: 'circle' },
      { id: 'database', name: 'Database', icon: Database, color: '#10B981', nodeType: 'hexagon' },
      { id: 'server', name: 'Server', icon: Server, color: '#F59E0B', nodeType: 'standard' },
      { id: 'cloud', name: 'Cloud', icon: Cloud, color: '#06B6D4', nodeType: 'standard' },
      { id: 'code', name: 'Code', icon: Code, color: '#EC4899', nodeType: 'standard' },
    ]
  },
  status: {
    name: 'Status',
    icon: CheckCircle,
    items: [
      { id: 'success', name: 'Success', icon: CheckCircle, color: '#22C55E', nodeType: 'circle' },
      { id: 'error', name: 'Error', icon: XCircle, color: '#EF4444', nodeType: 'circle' },
      { id: 'warning', name: 'Warning', icon: AlertCircle, color: '#F59E0B', nodeType: 'circle' },
      { id: 'info', name: 'Info', icon: Info, color: '#10B981', nodeType: 'circle' },
      { id: 'loading', name: 'Loading', icon: Loader2, color: '#8B5CF6', nodeType: 'circle' },
    ]
  },
  business: {
    name: 'Business',
    icon: Building,
    items: [
      { id: 'target', name: 'Goal', icon: Target, color: '#EF4444', nodeType: 'circle' },
      { id: 'chart', name: 'Analytics', icon: BarChart, color: '#10B981', nodeType: 'standard' },
      { id: 'growth', name: 'Growth', icon: TrendingUp, color: '#22C55E', nodeType: 'standard' },
      { id: 'idea', name: 'Idea', icon: Lightbulb, color: '#F59E0B', nodeType: 'mindmap' },
      { id: 'task', name: 'Task', icon: CheckCircle, color: '#8B5CF6', nodeType: 'standard' },
    ]
  },
  connectors: {
    name: 'Connectors',
    icon: Link2,
    items: [
      { id: 'arrow-right', name: 'Arrow →', icon: ArrowRight, color: '#6B7280', isEdge: true, edgeType: 'default' },
      { id: 'arrow-both', name: 'Arrow ↔', icon: Move, color: '#6B7280', isEdge: true, edgeType: 'bidirectional' },
      { id: 'dashed', name: 'Dashed', icon: Link2, color: '#6B7280', isEdge: true, edgeType: 'dashed' },
      { id: 'dotted', name: 'Dotted', icon: Link2, color: '#9CA3AF', isEdge: true, edgeType: 'dotted' },
    ]
  },
};

const COLOR_PALETTE = [
  '#10B981', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#22C55E', '#10B981', '#06B6D4', '#6366F1', '#84CC16',
  '#F97316', '#14B8A6', '#A855F7', '#34D399', '#64748B',
];

// Default styling presets for each shape type
const SHAPE_STYLE_PRESETS = {
  standard: {
    borderRadius: 12,
    borderWidth: 2,
    shadow: 'lg',
    opacity: 100,
  },
  mindmap: {
    borderRadius: 20,
    borderWidth: 2,
    shadow: 'xl',
    opacity: 100,
  },
  circle: {
    borderRadius: 50,
    borderWidth: 2,
    shadow: 'lg',
    opacity: 100,
  },
  flowchart: {
    borderRadius: 0,
    borderWidth: 2,
    shadow: 'md',
    opacity: 100,
  },
  hexagon: {
    borderRadius: 8,
    borderWidth: 3,
    shadow: 'lg',
    opacity: 100,
  },
};

// Helper to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

// Helper to convert RGB to hex
const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// ============================================
// DRAGGABLE COMPONENT ITEM
// ============================================
const DraggableItem = ({ item, isDark, onDragStart }) => {
  const Icon = item.icon;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:scale-105 group
        ${isDark 
          ? 'bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500/50' 
          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-primary-500/50'
        }`}
      title={`Drag to add ${item.name}`}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ backgroundColor: item.color + '20' }}
      >
        <Icon className="w-5 h-5" style={{ color: item.color }} />
      </div>
      <span className={`text-[10px] font-medium truncate w-full text-center
        ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {item.name}
      </span>
    </div>
  );
};

// ============================================
// NODE PROPERTIES PANEL - Enhanced Styling
// ============================================
const NodePropertiesPanel = ({ selectedNode, onUpdateNode, onDeleteNode, isDark }) => {
  const [label, setLabel] = useState(selectedNode?.data?.label || '');
  const [color, setColor] = useState(selectedNode?.data?.colors?.primary || '#10B981');
  const [colorMode, setColorMode] = useState('palette'); // 'palette', 'hex', 'rgb'
  const [rgb, setRgb] = useState(() => hexToRgb(selectedNode?.data?.colors?.primary || '#10B981'));
  const [hexInput, setHexInput] = useState(selectedNode?.data?.colors?.primary || '#10B981');
  
  // Style properties
  const [style, setStyle] = useState({
    borderRadius: selectedNode?.data?.style?.borderRadius ?? SHAPE_STYLE_PRESETS[selectedNode?.type]?.borderRadius ?? 12,
    borderWidth: selectedNode?.data?.style?.borderWidth ?? SHAPE_STYLE_PRESETS[selectedNode?.type]?.borderWidth ?? 2,
    borderColor: selectedNode?.data?.style?.borderColor ?? '#FFFFFF',
    opacity: selectedNode?.data?.style?.opacity ?? 100,
    fontSize: selectedNode?.data?.style?.fontSize ?? 14,
    fontWeight: selectedNode?.data?.style?.fontWeight ?? 600,
    shadow: selectedNode?.data?.style?.shadow ?? 'lg',
    textColor: selectedNode?.data?.style?.textColor ?? '#FFFFFF',
  });

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'colors', 'style'

  // Update local state when selected node changes
  React.useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      const nodeColor = selectedNode.data?.colors?.primary || '#10B981';
      setColor(nodeColor);
      setHexInput(nodeColor);
      setRgb(hexToRgb(nodeColor));
      
      const nodeType = selectedNode.type || 'standard';
      setStyle({
        borderRadius: selectedNode.data?.style?.borderRadius ?? SHAPE_STYLE_PRESETS[nodeType]?.borderRadius ?? 12,
        borderWidth: selectedNode.data?.style?.borderWidth ?? SHAPE_STYLE_PRESETS[nodeType]?.borderWidth ?? 2,
        borderColor: selectedNode.data?.style?.borderColor ?? '#FFFFFF',
        opacity: selectedNode.data?.style?.opacity ?? 100,
        fontSize: selectedNode.data?.style?.fontSize ?? 14,
        fontWeight: selectedNode.data?.style?.fontWeight ?? 600,
        shadow: selectedNode.data?.style?.shadow ?? 'lg',
        textColor: selectedNode.data?.style?.textColor ?? '#FFFFFF',
      });
    }
  }, [selectedNode?.id]);

  const handleLabelChange = (newLabel) => {
    setLabel(newLabel);
    onUpdateNode(selectedNode.id, { label: newLabel });
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setHexInput(newColor);
    setRgb(hexToRgb(newColor));
    onUpdateNode(selectedNode.id, { 
      colors: { 
        ...selectedNode.data.colors, 
        primary: newColor,
        hub: newColor,
        secondary: newColor,
        action: newColor,
      } 
    });
  };

  const handleHexInputChange = (value) => {
    setHexInput(value);
    // Validate hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      handleColorChange(value.toUpperCase());
    }
  };

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: parseInt(value) || 0 };
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    handleColorChange(newHex);
  };

  const handleStyleChange = (property, value) => {
    const newStyle = { ...style, [property]: value };
    setStyle(newStyle);
    onUpdateNode(selectedNode.id, { style: newStyle });
  };

  if (!selectedNode) {
    return (
      <div className={`p-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        <MousePointer2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select a node to edit its properties</p>
      </div>
    );
  }

  const nodeType = selectedNode.type || 'standard';
  const nodeTypeName = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className={`flex border-b ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
        {[
          { id: 'general', label: 'General', icon: Type },
          { id: 'colors', label: 'Colors', icon: Palette },
          { id: 'style', label: 'Style', icon: Settings2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors
              ${activeTab === tab.id
                ? isDark
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-primary-600 border-b-2 border-primary-600'
                : isDark
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Type Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          ${isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
          <Square className="w-3 h-3" />
          {nodeTypeName} Node
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            {/* Label */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors
                  ${isDark
                    ? 'bg-dark-800 border-dark-600 text-white focus:border-primary-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                placeholder="Enter label..."
              />
            </div>

            {/* Font Size */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Font Size: {style.fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={style.fontSize}
                onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            {/* Font Weight */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Font Weight
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 400, label: 'Normal' },
                  { value: 600, label: 'Semi' },
                  { value: 700, label: 'Bold' },
                ].map((weight) => (
                  <button
                    key={weight.value}
                    onClick={() => handleStyleChange('fontWeight', weight.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${style.fontWeight === weight.value
                        ? isDark
                          ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500'
                          : 'bg-primary-50 text-primary-600 ring-1 ring-primary-500'
                        : isDark
                          ? 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {weight.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            {/* Color Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'palette', label: 'Palette' },
                { id: 'hex', label: 'Hex' },
                { id: 'rgb', label: 'RGB' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setColorMode(mode.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${colorMode === mode.id
                      ? isDark
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-primary-50 text-primary-600'
                      : isDark
                        ? 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Color Preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border-2 shadow-lg transition-all"
                style={{ 
                  backgroundColor: color,
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                }}
              />
              <div className="flex-1">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Current Color
                </p>
                <p className={`text-sm font-mono font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {color}
                </p>
              </div>
            </div>

            {/* Palette Mode */}
            {colorMode === 'palette' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5
                  ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Background Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColorChange(c)}
                      className={`w-8 h-8 rounded-lg transition-all hover:scale-110
                        ${color === c ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
                        ${isDark ? 'ring-offset-dark-900' : 'ring-offset-white'}`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hex Mode */}
            {colorMode === 'hex' && (
              <div>
                <label className={`block text-xs font-medium mb-1.5
                  ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hex Color Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-mono uppercase
                      ${isDark
                        ? 'bg-dark-800 border-dark-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(e.target.value.toUpperCase())}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                </div>
                <p className={`mt-1 text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Format: #RRGGBB (e.g., #FF5733)
                </p>
              </div>
            )}

            {/* RGB Mode */}
            {colorMode === 'rgb' && (
              <div className="space-y-3">
                <label className={`block text-xs font-medium
                  ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  RGB Values
                </label>
                {[
                  { channel: 'r', label: 'Red', color: '#EF4444' },
                  { channel: 'g', label: 'Green', color: '#22C55E' },
                  { channel: 'b', label: 'Blue', color: '#10B981' },
                ].map(({ channel, label, color: channelColor }) => (
                  <div key={channel} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {label}
                      </span>
                      <span className={`text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {rgb[channel]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${channel === 'r' ? '#000' : channel === 'g' ? '#000' : '#000'}, ${channelColor})`,
                      }}
                    />
                  </div>
                ))}
                <div className={`p-2 rounded-lg text-xs font-mono text-center
                  ${isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  rgb({rgb.r}, {rgb.g}, {rgb.b})
                </div>
              </div>
            )}

            {/* Text Color */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Text Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['#FFFFFF', '#000000', '#1F2937', '#F3F4F6', '#FEF3C7'].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleStyleChange('textColor', c)}
                    className={`w-8 h-8 rounded-lg transition-all hover:scale-110 border
                      ${style.textColor === c ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
                      ${isDark ? 'ring-offset-dark-900 border-dark-600' : 'ring-offset-white border-gray-300'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Border Radius */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Border Radius: {style.borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={style.borderRadius}
                onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            {/* Border Width */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Border Width: {style.borderWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={style.borderWidth}
                onChange={(e) => handleStyleChange('borderWidth', parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            {/* Border Color */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Border Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['#FFFFFF', '#000000', '#10B981', '#EF4444', '#22C55E'].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleStyleChange('borderColor', c)}
                    className={`w-8 h-8 rounded-lg transition-all hover:scale-110 border
                      ${style.borderColor === c ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
                      ${isDark ? 'ring-offset-dark-900 border-dark-600' : 'ring-offset-white border-gray-300'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Opacity: {style.opacity}%
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={style.opacity}
                onChange={(e) => handleStyleChange('opacity', parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            {/* Shadow */}
            <div>
              <label className={`block text-xs font-medium mb-1.5
                ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Shadow
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: 'none', label: 'None' },
                  { value: 'sm', label: 'S' },
                  { value: 'md', label: 'M' },
                  { value: 'lg', label: 'L' },
                  { value: 'xl', label: 'XL' },
                  { value: '2xl', label: '2XL' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleStyleChange('shadow', s.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${style.shadow === s.value
                        ? isDark
                          ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500'
                          : 'bg-primary-50 text-primary-600 ring-1 ring-primary-500'
                        : isDark
                          ? 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset to Preset */}
            <button
              onClick={() => {
                const preset = SHAPE_STYLE_PRESETS[nodeType] || SHAPE_STYLE_PRESETS.standard;
                const newStyle = { ...style, ...preset };
                setStyle(newStyle);
                onUpdateNode(selectedNode.id, { style: newStyle });
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                transition-colors text-xs font-medium
                ${isDark
                  ? 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Undo className="w-3.5 h-3.5" />
              Reset to {nodeTypeName} Default
            </button>
          </div>
        )}
      </div>

      {/* Delete Button - Always visible at bottom */}
      <div className={`p-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
            transition-colors text-sm font-medium
            ${isDark
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>
    </div>
  );
};

// ============================================
// GRAPH BUILDER FLOW COMPONENT
// ============================================
const GraphBuilderFlow = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeCategory, setActiveCategory] = useState('shapes');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [graphName, setGraphName] = useState('Untitled Graph');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Edge styles based on type
  const getEdgeStyle = (edgeType) => {
    const baseStyle = {
      strokeWidth: 2,
      stroke: isDark ? '#64748B' : '#94A3B8',
    };

    switch (edgeType) {
      case 'dashed':
        return { ...baseStyle, strokeDasharray: '5,5' };
      case 'dotted':
        return { ...baseStyle, strokeDasharray: '2,2' };
      default:
        return baseStyle;
    }
  };

  // Handle edge connection
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        style: getEdgeStyle('default'),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isDark ? '#64748B' : '#94A3B8',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      saveToHistory();
    },
    [setEdges, isDark]
  );

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Drag and drop handlers
  const onDragStart = (event, item) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const dataStr = event.dataTransfer.getData('application/reactflow');
      if (!dataStr) return;

      const item = JSON.parse(dataStr);
      
      // Don't add edge items as nodes
      if (item.isEdge) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeType = item.nodeType || 'standard';
      const stylePreset = SHAPE_STYLE_PRESETS[nodeType] || SHAPE_STYLE_PRESETS.standard;

      const newNode = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          label: item.label || item.name,
          connections: 1,
          isDark,
          colors: {
            primary: item.color,
            secondary: item.color,
            hub: item.color,
            action: item.color,
            result: item.color,
          },
          icon: item.id,
          style: {
            ...stylePreset,
            fontSize: 14,
            fontWeight: 600,
            textColor: '#FFFFFF',
            borderColor: '#FFFFFF',
          },
        },
      };

      setNodes((nds) => [...nds, newNode]);
      saveToHistory();
    },
    [screenToFlowPosition, setNodes, isDark]
  );

  // Update node data
  const onUpdateNode = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
    saveToHistory();
  }, [setNodes]);

  // Delete node
  const onDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
    saveToHistory();
  }, [setNodes, setEdges]);

  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    const state = { nodes, edges };
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), state]);
    setHistoryIndex((prev) => prev + 1);
  }, [nodes, edges, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      saveToHistory();
    }
  }, [setNodes, setEdges]);

  // Save graph
  const handleSave = async () => {
    setSaving(true);
    try {
      // For now, save to localStorage
      const graphData = {
        id: Date.now(),
        name: graphName,
        nodes,
        edges,
        createdAt: new Date().toISOString(),
        type: 'custom',
      };
      
      const existingGraphs = JSON.parse(localStorage.getItem('customGraphs') || '[]');
      existingGraphs.push(graphData);
      localStorage.setItem('customGraphs', JSON.stringify(existingGraphs));
      
      // Show success
      setTimeout(() => {
        setSaving(false);
        alert('Graph saved successfully!');
      }, 500);
    } catch (error) {
      console.error('Error saving graph:', error);
      setSaving(false);
    }
  };

  // Prepare data for export
  const getExportData = useMemo(() => {
    return {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        connections: n.data.connections || 1,
        metadata: { type: n.type, color: n.data.colors?.primary },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.data?.label || '',
      })),
    };
  }, [nodes, edges]);

  return (
    <div className="h-[calc(100vh-120px)] flex">
      {/* Left Panel - Component Library */}
      <div 
        className={`h-full border-r transition-all duration-300 flex flex-col
          ${showLeftPanel ? 'w-64' : 'w-0 overflow-hidden'}
          ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'}`}
      >
        {/* Category Tabs */}
        <div className={`flex flex-wrap gap-1 p-2 border-b
          ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
          {Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => {
            const CategoryIcon = category.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${activeCategory === key
                    ? isDark
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-primary-50 text-primary-600'
                    : isDark
                      ? 'text-gray-400 hover:bg-dark-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title={category.name}
              >
                <CategoryIcon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Component Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {COMPONENT_CATEGORIES[activeCategory]?.items.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                isDark={isDark}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-3 border-t text-xs
          ${isDark ? 'border-dark-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
          <p className="flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5" />
            Drag components to canvas
          </p>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className={`flex items-center justify-between px-4 py-2 border-b
          ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className={`p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title={showLeftPanel ? 'Hide Components' : 'Show Components'}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            
            <div className={`h-6 w-px ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
            
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50
                ${isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50
                ${isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            
            <div className={`h-6 w-px ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />
            
            <button
              onClick={clearCanvas}
              className={`p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Graph Name */}
          <input
            type="text"
            value={graphName}
            onChange={(e) => setGraphName(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium text-center min-w-[200px]
              ${isDark
                ? 'bg-dark-800 border-dark-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/20`}
            placeholder="Graph name..."
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || nodes.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-colors disabled:opacity-50
                ${isDark
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>

            <ExportMenu 
              data={getExportData}
              metadata={{ title: graphName, type: 'custom' }}
              disabled={nodes.length === 0}
            />

            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              title={showRightPanel ? 'Hide Properties' : 'Show Properties'}
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            className={isDark ? 'bg-dark-950' : 'bg-gray-50'}
            connectionLineStyle={{ stroke: isDark ? '#64748B' : '#94A3B8', strokeWidth: 2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
          >
            <Controls 
              className={`${isDark ? '!bg-dark-800 !border-dark-700' : '!bg-white !border-gray-200'} !rounded-xl !shadow-lg`}
            />
            <MiniMap
              nodeStrokeWidth={3}
              nodeColor={(node) => node.data?.colors?.primary || '#10B981'}
              className={`${isDark ? '!bg-dark-800' : '!bg-gray-100'} !rounded-xl`}
            />
            <Background 
              color={isDark ? '#374151' : '#D1D5DB'} 
              gap={20} 
              size={1}
            />

            {/* Empty State */}
            {nodes.length === 0 && (
              <Panel position="center">
                <div className={`text-center p-8 rounded-2xl border-2 border-dashed
                  ${isDark 
                    ? 'bg-dark-900/80 border-dark-700 text-gray-400' 
                    : 'bg-white/80 border-gray-300 text-gray-500'
                  }`}>
                  <Move className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Start Building Your Graph
                  </h3>
                  <p className="text-sm max-w-xs">
                    Drag components from the left panel and drop them here to create your custom graph
                  </p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div 
        className={`h-full border-l transition-all duration-300 overflow-hidden flex flex-col
          ${showRightPanel ? 'w-72' : 'w-0'}
          ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-gray-200'}`}
      >
        <div className={`p-3 border-b shrink-0 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Properties
          </h3>
        </div>
        <div className="flex-1 overflow-hidden">
          <NodePropertiesPanel
            selectedNode={selectedNode}
            onUpdateNode={onUpdateNode}
            onDeleteNode={onDeleteNode}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
function GraphBuilderPage() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-full ${isDark ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <ReactFlowProvider>
        <GraphBuilderFlow />
      </ReactFlowProvider>
    </div>
  );
}

export default GraphBuilderPage;
