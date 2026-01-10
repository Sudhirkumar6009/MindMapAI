import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// ============================================
// PROFESSIONAL CUSTOM NODES FOR REACT FLOW
// Optimized for students and researchers
// ============================================

// Common handle styles
const handleStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  border: '2px solid white',
};

// Base node container classes
const getBaseClasses = (isDark, selected) => {
  const base = 'transition-all duration-200 cursor-grab active:cursor-grabbing';
  const shadow = selected 
    ? 'shadow-xl ring-2 ring-blue-500 ring-offset-2' 
    : 'shadow-lg hover:shadow-xl';
  const hover = 'hover:scale-[1.02]';
  return `${base} ${shadow} ${hover}`;
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
  const { label, connections = 1, isDark, colors } = data;
  const { width, height, fontSize } = getSize(connections);
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  let bgColor = colors?.primary || '#3B82F6';
  if (isHub) bgColor = colors?.hub || '#1E40AF';
  else if (isImportant) bgColor = colors?.secondary || '#6366F1';
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-3 rounded-xl border-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
        style={{
          width,
          height,
          backgroundColor: bgColor,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          color: '#fff',
          fontSize,
          fontWeight: isHub ? 700 : 600,
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
  const { label, connections = 1, isDark, colors } = data;
  const { width, height, fontSize } = getSize(connections, 130, 45);
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  let bgColor = colors?.primary || '#FFD166';
  let textColor = '#1e293b';
  
  if (isHub) {
    bgColor = colors?.hub || '#EF476F';
    textColor = '#fff';
  } else if (isImportant) {
    bgColor = colors?.secondary || '#F4A261';
  }
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-3 rounded-2xl border-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
        style={{
          width,
          height,
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
          color: textColor,
          fontSize,
          fontWeight: isHub ? 700 : 600,
          boxShadow: isHub ? `0 8px 24px ${bgColor}40` : undefined,
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
  const { label, connections = 1, isDark, colors } = data;
  
  const isHub = connections >= 5;
  const isDecision = connections === 2;
  const isEnd = connections === 1;
  
  // Decision node - diamond shape
  if (isDecision) {
    const bgColor = colors?.decision || '#F59E0B';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor, top: -4 }}
        />
        <div
          className={`flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
          style={{
            width: 70,
            height: 70,
            backgroundColor: bgColor,
            transform: 'rotate(45deg)',
            borderRadius: 6,
            border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <span
            style={{
              transform: 'rotate(-45deg)',
              fontSize: 11,
              fontWeight: 600,
              color: '#1e293b',
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
    const bgColor = colors?.hub || '#EF476F';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor }}
        />
        <div
          className={`px-4 py-3 rounded-xl border-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
          style={{
            width: 140,
            height: 60,
            backgroundColor: bgColor,
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
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
    const bgColor = colors?.result || '#06B6D4';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor }}
        />
        <div
          className={`px-3 py-2 rounded-lg border-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
          style={{
            width: 110,
            height: 42,
            backgroundColor: bgColor,
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
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
  const bgColor = colors?.action || '#10B981';
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-3 rounded-lg border-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
        style={{
          width: 120,
          height: 48,
          backgroundColor: bgColor,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
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
  const { label, connections = 1, isDark, colors } = data;
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  const size = isHub ? 90 : isImportant ? 75 : 65;
  
  let bgColor = colors?.result || '#06B6D4';
  let textColor = '#1e293b';
  
  if (isHub) {
    bgColor = colors?.hub || '#EF476F';
    textColor = '#fff';
  } else if (isImportant) {
    bgColor = colors?.secondary || '#6366F1';
    textColor = '#fff';
  }
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`rounded-full flex items-center justify-center text-center ${getBaseClasses(isDark, selected)}`}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
          color: textColor,
          fontSize: isHub ? 13 : 11,
          fontWeight: isHub ? 700 : 600,
          padding: 8,
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
  const { label, connections = 1, isDark, colors } = data;
  
  const isHub = connections >= 5;
  const isImportant = connections >= 3;
  
  const width = isHub ? 130 : isImportant ? 115 : 100;
  const height = isHub ? 65 : isImportant ? 55 : 48;
  
  let bgColor = colors?.primary || '#3B82F6';
  let textColor = '#1e293b';
  
  if (isHub) {
    bgColor = colors?.hub || '#1E40AF';
    textColor = '#fff';
  } else if (isImportant) {
    bgColor = colors?.secondary || '#6366F1';
    textColor = '#fff';
  }
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`flex items-center justify-center text-center ${getBaseClasses(isDark, selected)}`}
        style={{
          width,
          height,
          backgroundColor: bgColor,
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)',
          color: textColor,
          fontSize: isHub ? 13 : 11,
          fontWeight: isHub ? 700 : 600,
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
  const { label, connections = 1, isDark, colors } = data;
  
  const isTop = connections >= 5;
  const isMid = connections >= 3;
  
  let bgColor, textColor;
  if (isTop) {
    bgColor = colors?.hub || '#1E40AF';
    textColor = '#fff';
  } else if (isMid) {
    bgColor = colors?.primary || '#3B82F6';
    textColor = '#fff';
  } else {
    bgColor = colors?.action || '#10B981';
    textColor = '#fff';
  }
  
  const width = isTop ? 150 : isMid ? 130 : 110;
  const height = isTop ? 60 : isMid ? 52 : 45;
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-4 py-2 rounded-lg border-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
        style={{
          width,
          height,
          backgroundColor: bgColor,
          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
          color: textColor,
          fontSize: isTop ? 14 : isMid ? 13 : 12,
          fontWeight: isTop ? 700 : 600,
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
  const { label, connections = 1, isDark, colors } = data;
  
  // Start/end states - circular
  if (connections >= 5 || connections === 1) {
    return <CircleNode data={data} selected={selected} />;
  }
  
  // Decision - diamond
  if (connections === 2) {
    const bgColor = colors?.decision || '#F59E0B';
    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ ...handleStyle, background: bgColor }}
        />
        <div
          className={`flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
          style={{
            width: 65,
            height: 65,
            backgroundColor: bgColor,
            transform: 'rotate(45deg)',
            borderRadius: 4,
            border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <span
            style={{
              transform: 'rotate(-45deg)',
              fontSize: 10,
              fontWeight: 600,
              color: '#1e293b',
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
  const bgColor = colors?.action || '#10B981';
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: bgColor }}
      />
      <div
        className={`px-3 py-2 rounded-lg border-2 text-center flex items-center justify-center ${getBaseClasses(isDark, selected)}`}
        style={{
          width: 110,
          height: 44,
          backgroundColor: bgColor,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
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
