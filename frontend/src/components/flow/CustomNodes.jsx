import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// ============================================
// PROFESSIONAL CUSTOM NODES FOR REACT FLOW
// Optimized for students and researchers
// With enhanced custom styling support
// ============================================

// Common handle styles
const handleStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  border: '2px solid white',
};

// Shadow classes mapping
const shadowClasses = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

// Get shadow style from shadow class name
const getShadowStyle = (shadowSize, color) => {
  const shadows = {
    none: 'none',
    sm: `0 1px 2px 0 ${color}20`,
    md: `0 4px 6px -1px ${color}25`,
    lg: `0 10px 15px -3px ${color}30`,
    xl: `0 20px 25px -5px ${color}35`,
    '2xl': `0 25px 50px -12px ${color}40`,
  };
  return shadows[shadowSize] || shadows.lg;
};

// Base node container classes
const getBaseClasses = (isDark, selected, customShadow = 'lg') => {
  const base = 'transition-all duration-200 cursor-grab active:cursor-grabbing';
  const shadow = selected 
    ? 'ring-2 ring-emerald-500 ring-offset-2' 
    : '';
  const shadowClass = shadowClasses[customShadow] || 'shadow-lg';
  const hover = 'hover:scale-[1.02]';
  return `${base} ${shadow} ${shadowClass} hover:shadow-xl ${hover}`;
};

// Dynamic size calculator based on connections
const getSize = (connections, baseWidth = 140, baseHeight = 50) => {
  const scale = Math.min(1 + (connections - 1) * 0.1, 1.5);
  return {
    width: Math.round(baseWidth * scale),
    height: Math.round(baseHeight * scale),
    fontSize: connections >= 5 ? 14 : connections >= 3 ? 13 : 12
  };
};

// ============================================
// STANDARD NODE - Clean rectangle style
// ============================================
export const StandardNode = memo(({ data, selected }) => {
  const { label, connections = 1, isDark, colors, style: customStyle } = data;
  const { width, height, fontSize: defaultFontSize } = getSize(connections);
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  let bgColor = colors?.primary || '#10B981';
  if (isHub) bgColor = colors?.hub || '#1E40AF';
  else if (isImportant) bgColor = colors?.secondary || '#6366F1';
  
  // Apply custom styles
  const nodeStyle = customStyle || {};
  const borderRadius = nodeStyle.borderRadius ?? 12;
  const borderWidth = nodeStyle.borderWidth ?? 2;
  const borderColor = nodeStyle.borderColor ?? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');
  const opacity = (nodeStyle.opacity ?? 100) / 100;
  const fontSize = nodeStyle.fontSize ?? defaultFontSize;
  const fontWeight = nodeStyle.fontWeight ?? (isHub ? 700 : 600);
  const textColor = nodeStyle.textColor ?? '#fff';
  const shadowSize = nodeStyle.shadow ?? 'lg';
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-3 text-center flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
        style={{
          width,
          height,
          backgroundColor: bgColor,
          borderRadius,
          borderWidth,
          borderStyle: 'solid',
          borderColor,
          color: textColor,
          fontSize,
          fontWeight,
          opacity,
          boxShadow: getShadowStyle(shadowSize, bgColor),
        }}
      >
        <span className="line-clamp-2 leading-tight">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: bgColor }}
      />
    </>
  );
});

StandardNode.displayName = 'StandardNode';

// ============================================
// MIND MAP NODE - Colorful gradient style
// ============================================
export const MindMapNode = memo(({ data, selected }) => {
  const { label, connections = 1, isDark, colors, style: customStyle } = data;
  const { width, height, fontSize: defaultFontSize } = getSize(connections, 130, 45);
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  let bgColor = colors?.primary || '#FFD166';
  let defaultTextColor = '#1e293b';
  
  if (isHub) {
    bgColor = colors?.hub || '#EF476F';
    defaultTextColor = '#fff';
  } else if (isImportant) {
    bgColor = colors?.secondary || '#F4A261';
  }
  
  // Apply custom styles
  const nodeStyle = customStyle || {};
  const borderRadius = nodeStyle.borderRadius ?? 20;
  const borderWidth = nodeStyle.borderWidth ?? 2;
  const borderColor = nodeStyle.borderColor ?? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)');
  const opacity = (nodeStyle.opacity ?? 100) / 100;
  const fontSize = nodeStyle.fontSize ?? defaultFontSize;
  const fontWeight = nodeStyle.fontWeight ?? (isHub ? 700 : 600);
  const textColor = nodeStyle.textColor ?? defaultTextColor;
  const shadowSize = nodeStyle.shadow ?? 'xl';
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-3 text-center flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
        style={{
          width,
          height,
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
          borderRadius,
          borderWidth,
          borderStyle: 'solid',
          borderColor,
          color: textColor,
          fontSize,
          fontWeight,
          opacity,
          boxShadow: isHub ? `0 8px 24px ${bgColor}40` : getShadowStyle(shadowSize, bgColor),
        }}
      >
        <span className="line-clamp-2 leading-tight">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: bgColor }}
      />
    </>
  );
});

MindMapNode.displayName = 'MindMapNode';

// ============================================
// FLOWCHART NODE - Smart shape based on role
// ============================================
export const FlowchartNode = memo(({ data, selected }) => {
  const { label, connections = 1, isDark, colors, style: customStyle } = data;
  
  const isHub = connections >= 5;
  const isDecision = connections === 2;
  const isEnd = connections === 1;
  
  // Apply custom styles
  const nodeStyle = customStyle || {};
  const opacity = (nodeStyle.opacity ?? 100) / 100;
  const fontSize = nodeStyle.fontSize ?? 12;
  const fontWeight = nodeStyle.fontWeight ?? 600;
  const textColor = nodeStyle.textColor ?? '#fff';
  const shadowSize = nodeStyle.shadow ?? 'md';
  const borderWidth = nodeStyle.borderWidth ?? 2;
  const borderColor = nodeStyle.borderColor ?? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');
  
  // Decision node - diamond shape
  if (isDecision) {
    const bgColor = colors?.decision || colors?.primary || '#F59E0B';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor, top: -4 }}
        />
        <div
          className={`flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
          style={{
            width: 70,
            height: 70,
            backgroundColor: bgColor,
            transform: 'rotate(45deg)',
            borderRadius: nodeStyle.borderRadius ?? 6,
            borderWidth,
            borderStyle: 'solid',
            borderColor,
            opacity,
            boxShadow: getShadowStyle(shadowSize, bgColor),
          }}
        >
          <span
            style={{
              transform: 'rotate(-45deg)',
              fontSize: nodeStyle.fontSize ?? 11,
              fontWeight,
              color: nodeStyle.textColor ?? '#1e293b',
              textAlign: 'center',
              padding: 4,
              maxWidth: 55,
              wordBreak: 'break-word',
            }}
          >
            {label}
          </span>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ ...handleStyle, background: bgColor, bottom: -4 }}
        />
      </>
    );
  }
  
  // Hub/start node - rounded rectangle
  if (isHub) {
    const bgColor = colors?.hub || colors?.primary || '#EF476F';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor }}
        />
        <div
          className={`px-4 py-3 text-center flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
          style={{
            width: 140,
            height: 60,
            backgroundColor: bgColor,
            borderRadius: nodeStyle.borderRadius ?? 12,
            borderWidth,
            borderStyle: 'solid',
            borderColor,
            color: textColor,
            fontSize: nodeStyle.fontSize ?? 14,
            fontWeight: nodeStyle.fontWeight ?? 700,
            opacity,
            boxShadow: getShadowStyle(shadowSize, bgColor),
          }}
        >
          <span className="line-clamp-2 leading-tight">{label}</span>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ ...handleStyle, background: bgColor }}
        />
      </>
    );
  }
  
  // End/result node
  if (isEnd) {
    const bgColor = colors?.result || colors?.primary || '#06B6D4';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor }}
        />
        <div
          className={`px-3 py-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
          style={{
            width: 110,
            height: 42,
            backgroundColor: bgColor,
            borderRadius: nodeStyle.borderRadius ?? 8,
            borderWidth,
            borderStyle: 'solid',
            borderColor,
            color: textColor,
            fontSize,
            fontWeight,
            opacity,
            boxShadow: getShadowStyle(shadowSize, bgColor),
          }}
        >
          <span className="line-clamp-2 leading-tight">{label}</span>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ ...handleStyle, background: bgColor }}
        />
      </>
    );
  }
  
  // Action/process node - default
  const bgColor = colors?.action || colors?.primary || '#10B981';
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-3 text-center flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
        style={{
          width: 120,
          height: 48,
          backgroundColor: bgColor,
          borderRadius: nodeStyle.borderRadius ?? 8,
          borderWidth,
          borderStyle: 'solid',
          borderColor,
          color: textColor,
          fontSize,
          fontWeight,
          opacity,
          boxShadow: getShadowStyle(shadowSize, bgColor),
        }}
      >
        <span className="line-clamp-2 leading-tight">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: bgColor }}
      />
    </>
  );
});

FlowchartNode.displayName = 'FlowchartNode';

// ============================================
// CIRCLE NODE - For radial layouts
// ============================================
export const CircleNode = memo(({ data, selected }) => {
  const { label, connections = 1, isDark, colors, style: customStyle } = data;
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  const size = isHub ? 90 : isImportant ? 75 : 65;
  
  let bgColor = colors?.result || colors?.primary || '#06B6D4';
  let defaultTextColor = '#1e293b';
  
  if (isHub) {
    bgColor = colors?.hub || colors?.primary || '#EF476F';
    defaultTextColor = '#fff';
  } else if (isImportant) {
    bgColor = colors?.secondary || colors?.primary || '#6366F1';
    defaultTextColor = '#fff';
  }
  
  // Apply custom styles
  const nodeStyle = customStyle || {};
  const borderWidth = nodeStyle.borderWidth ?? 2;
  const borderColor = nodeStyle.borderColor ?? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)');
  const opacity = (nodeStyle.opacity ?? 100) / 100;
  const fontSize = nodeStyle.fontSize ?? (isHub ? 13 : 11);
  const fontWeight = nodeStyle.fontWeight ?? (isHub ? 700 : 600);
  const textColor = nodeStyle.textColor ?? defaultTextColor;
  const shadowSize = nodeStyle.shadow ?? 'lg';
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`rounded-full flex items-center justify-center text-center ${getBaseClasses(isDark, selected, shadowSize)}`}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          borderWidth,
          borderStyle: 'solid',
          borderColor,
          color: textColor,
          fontSize,
          fontWeight,
          padding: 8,
          opacity,
          boxShadow: getShadowStyle(shadowSize, bgColor),
        }}
      >
        <span className="line-clamp-2 leading-tight">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: bgColor }}
      />
    </>
  );
});

CircleNode.displayName = 'CircleNode';

// ============================================
// HEXAGON NODE - For concept maps
// ============================================
export const HexagonNode = memo(({ data, selected }) => {
  const { label, connections = 1, isDark, colors, style: customStyle } = data;
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  const width = isHub ? 130 : isImportant ? 115 : 100;
  const height = isHub ? 65 : isImportant ? 55 : 48;
  
  let bgColor = colors?.primary || '#10B981';
  let defaultTextColor = '#1e293b';
  
  if (isHub) {
    bgColor = colors?.hub || '#1E40AF';
    defaultTextColor = '#fff';
  } else if (isImportant) {
    bgColor = colors?.secondary || '#6366F1';
    defaultTextColor = '#fff';
  }
  
  // Apply custom styles
  const nodeStyle = customStyle || {};
  const opacity = (nodeStyle.opacity ?? 100) / 100;
  const fontSize = nodeStyle.fontSize ?? (isHub ? 13 : 11);
  const fontWeight = nodeStyle.fontWeight ?? (isHub ? 700 : 600);
  const textColor = nodeStyle.textColor ?? defaultTextColor;
  const shadowSize = nodeStyle.shadow ?? 'lg';
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`flex items-center justify-center text-center ${getBaseClasses(isDark, selected, shadowSize)}`}
        style={{
          width,
          height,
          backgroundColor: bgColor,
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)',
          color: textColor,
          fontSize,
          fontWeight,
          opacity,
          boxShadow: getShadowStyle(shadowSize, bgColor),
          padding: '4px 12px',
        }}
      >
        <span className="line-clamp-2 leading-tight">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: bgColor }}
      />
    </>
  );
});

HexagonNode.displayName = 'HexagonNode';

// ============================================
// ORG NODE - For hierarchical structures
// ============================================
export const OrgNode = memo(({ data, selected }) => {
  const { label, connections = 1, isDark, colors, style: customStyle } = data;
  
  const isTop = connections >= 5;
  const isMid = connections >= 3;
  
  let bgColor, defaultTextColor = '#fff';
  if (isTop) {
    bgColor = colors?.hub || colors?.primary || '#1E40AF';
  } else if (isMid) {
    bgColor = colors?.primary || '#10B981';
  } else {
    bgColor = colors?.action || colors?.primary || '#10B981';
  }
  
  const width = isTop ? 150 : isMid ? 130 : 110;
  const height = isTop ? 60 : isMid ? 52 : 45;
  
  // Apply custom styles
  const nodeStyle = customStyle || {};
  const borderRadius = nodeStyle.borderRadius ?? 8;
  const borderWidth = nodeStyle.borderWidth ?? 2;
  const borderColor = nodeStyle.borderColor ?? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)');
  const opacity = (nodeStyle.opacity ?? 100) / 100;
  const fontSize = nodeStyle.fontSize ?? (isTop ? 14 : isMid ? 13 : 12);
  const fontWeight = nodeStyle.fontWeight ?? (isTop ? 700 : 600);
  const textColor = nodeStyle.textColor ?? defaultTextColor;
  const shadowSize = nodeStyle.shadow ?? 'lg';
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
        style={{
          width,
          height,
          backgroundColor: bgColor,
          borderRadius,
          borderWidth,
          borderStyle: 'solid',
          borderColor,
          color: textColor,
          fontSize,
          fontWeight,
          opacity,
          boxShadow: getShadowStyle(shadowSize, bgColor),
        }}
      >
        <span className="line-clamp-2 leading-tight">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: bgColor }}
      />
    </>
  );
});

OrgNode.displayName = 'OrgNode';

// ============================================
// UML NODE - For UML activity diagrams
// ============================================
export const UMLNode = memo(({ data, selected }) => {
  const { label, connections = 1, isDark, colors, style: customStyle } = data;
  
  // Start/end states - circular
  if (connections >= 5 || connections === 1) {
    return <CircleNode data={data} selected={selected} />;
  }
  
  // Apply custom styles
  const nodeStyle = customStyle || {};
  const opacity = (nodeStyle.opacity ?? 100) / 100;
  const fontWeight = nodeStyle.fontWeight ?? 600;
  const shadowSize = nodeStyle.shadow ?? 'md';
  const borderWidth = nodeStyle.borderWidth ?? 2;
  const borderColor = nodeStyle.borderColor ?? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');
  
  // Decision - diamond
  if (connections === 2) {
    const bgColor = colors?.decision || colors?.primary || '#F59E0B';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor }}
        />
        <div
          className={`flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
          style={{
            width: 65,
            height: 65,
            backgroundColor: bgColor,
            transform: 'rotate(45deg)',
            borderRadius: nodeStyle.borderRadius ?? 4,
            borderWidth,
            borderStyle: 'solid',
            borderColor,
            opacity,
            boxShadow: getShadowStyle(shadowSize, bgColor),
          }}
        >
          <span
            style={{
              transform: 'rotate(-45deg)',
              fontSize: nodeStyle.fontSize ?? 10,
              fontWeight,
              color: nodeStyle.textColor ?? '#1e293b',
              textAlign: 'center',
              maxWidth: 50,
            }}
          >
            {label}
          </span>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ ...handleStyle, background: bgColor }}
        />
      </>
    );
  }
  
  // Action node - rounded rectangle
  const bgColor = colors?.action || colors?.primary || '#10B981';
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-3 py-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected, shadowSize)}`}
        style={{
          width: 110,
          height: 44,
          backgroundColor: bgColor,
          borderRadius: nodeStyle.borderRadius ?? 8,
          borderWidth,
          borderStyle: 'solid',
          borderColor,
          color: nodeStyle.textColor ?? '#fff',
          fontSize: nodeStyle.fontSize ?? 11,
          fontWeight,
          opacity,
          boxShadow: getShadowStyle(shadowSize, bgColor),
        }}
      >
        <span className="line-clamp-2 leading-tight">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: bgColor }}
      />
    </>
  );
});

UMLNode.displayName = 'UMLNode';

// ============================================
// EXPORT NODE TYPES MAP
// ============================================
export const nodeTypes = {
  standard: StandardNode,
  mindmap: MindMapNode,
  flowchart: FlowchartNode,
  circle: CircleNode,
  hexagon: HexagonNode,
  org: OrgNode,
  uml: UMLNode,
};

export default nodeTypes;
