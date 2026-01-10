/**
 * MindMapAI Export Formats
 * 
 * .mmai - Proprietary format (only works with MindMapAI)
 * .drawio - diagrams.net / draw.io format
 * .vsdx - Microsoft Visio format (Open XML)
 * .gliffy - Gliffy diagram format
 */

// ============================================
// PROPRIETARY FORMAT (.mmai)
// ============================================
export function exportToMMAI(data, metadata = {}) {
  const mmai = {
    format: 'MindMapAI',
    version: '1.0.0',
    signature: 'MMAI_PROPRIETARY_' + generateSignature(),
    exportedAt: new Date().toISOString(),
    metadata: {
      title: metadata.title || 'Untitled Mind Map',
      author: metadata.author || 'Unknown',
      description: metadata.description || '',
      ...metadata
    },
    graph: {
      nodes: data.nodes.map(node => ({
        id: node.id,
        label: node.label,
        connections: node.connections || 1,
        metadata: node.metadata || {}
      })),
      edges: data.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || '',
        metadata: edge.metadata || {}
      }))
    },
    concepts: data.concepts || [],
    relationships: data.relationships || [],
    styling: {
      theme: metadata.theme || 'ocean',
      nodeShape: metadata.nodeShape || 'ellipse',
      edgeStyle: metadata.edgeStyle || 'bezier'
    },
    checksum: null
  };
  
  // Generate checksum for integrity
  mmai.checksum = generateChecksum(JSON.stringify(mmai.graph));
  
  return JSON.stringify(mmai, null, 2);
}

export function importFromMMAI(content) {
  try {
    const mmai = JSON.parse(content);
    
    // Validate format
    if (mmai.format !== 'MindMapAI' || !mmai.signature?.startsWith('MMAI_PROPRIETARY_')) {
      throw new Error('Invalid MindMapAI format');
    }
    
    // Validate checksum
    const expectedChecksum = generateChecksum(JSON.stringify(mmai.graph));
    if (mmai.checksum !== expectedChecksum) {
      throw new Error('File integrity check failed');
    }
    
    return {
      success: true,
      data: mmai.graph,
      concepts: mmai.concepts,
      relationships: mmai.relationships,
      metadata: mmai.metadata,
      styling: mmai.styling
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// DRAW.IO FORMAT (.drawio)
// ============================================
export function exportToDrawio(data, metadata = {}) {
  const nodePositions = calculateNodePositions(data.nodes, data.edges);
  
  let cellId = 2;
  const nodeIdMap = {};
  
  // Create node cells
  const nodeCells = data.nodes.map((node, index) => {
    const pos = nodePositions[node.id] || { x: 100 + (index % 5) * 200, y: 100 + Math.floor(index / 5) * 150 };
    const width = Math.max(120, node.label.length * 8);
    const height = 60;
    nodeIdMap[node.id] = cellId;
    
    const cell = `      <mxCell id="${cellId}" value="${escapeXml(node.label)}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#1e3a5f;strokeColor=#4a90d9;fontColor=#ffffff;fontSize=12;" vertex="1" parent="1">
        <mxGeometry x="${pos.x}" y="${pos.y}" width="${width}" height="${height}" as="geometry" />
      </mxCell>`;
    cellId++;
    return cell;
  });
  
  // Create edge cells
  const edgeCells = data.edges.map(edge => {
    const sourceId = nodeIdMap[edge.source];
    const targetId = nodeIdMap[edge.target];
    
    const cell = `      <mxCell id="${cellId}" value="${escapeXml(edge.label || '')}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#4a90d9;fontColor=#94a3b8;fontSize=10;endArrow=classic;" edge="1" parent="1" source="${sourceId}" target="${targetId}">
        <mxGeometry relative="1" as="geometry" />
      </mxCell>`;
    cellId++;
    return cell;
  });
  
  const drawioXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="MindMapAI" modified="${new Date().toISOString()}" agent="MindMapAI Export" version="1.0">
  <diagram id="mindmap" name="${escapeXml(metadata.title || 'Mind Map')}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${nodeCells.join('\n')}
${edgeCells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  return drawioXml;
}

// ============================================
// VISIO FORMAT (.vsdx) - Open XML
// ============================================
export async function exportToVsdx(data, metadata = {}) {
  // VSDX is a ZIP file containing XML files
  // We'll create a simplified Open XML structure
  
  const nodePositions = calculateNodePositions(data.nodes, data.edges);
  
  // Document.xml content
  const shapes = data.nodes.map((node, index) => {
    const pos = nodePositions[node.id] || { x: 2 + (index % 5) * 3, y: 2 + Math.floor(index / 5) * 2 };
    return `
      <Shape ID="${index + 1}" Type="Shape" LineStyle="1" FillStyle="1" TextStyle="1">
        <Cell N="PinX" V="${pos.x}" />
        <Cell N="PinY" V="${pos.y}" />
        <Cell N="Width" V="2" />
        <Cell N="Height" V="1" />
        <Cell N="FillForegnd" V="#1e3a5f" />
        <Cell N="LineColor" V="#4a90d9" />
        <Text>${escapeXml(node.label)}</Text>
      </Shape>`;
  }).join('\n');
  
  const connects = data.edges.map((edge, index) => {
    const sourceIndex = data.nodes.findIndex(n => n.id === edge.source) + 1;
    const targetIndex = data.nodes.findIndex(n => n.id === edge.target) + 1;
    return `
      <Connect ID="${data.nodes.length + index + 1}" FromSheet="${sourceIndex}" ToSheet="${targetIndex}">
        <Cell N="BeginX" V="0" />
        <Cell N="BeginY" V="0" />
        <Cell N="EndX" V="0" />
        <Cell N="EndY" V="0" />
      </Connect>`;
  }).join('\n');
  
  const vsdxContent = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/>
  <Override PartName="/visio/pages/pages.xml" ContentType="application/vnd.ms-visio.pages+xml"/>
  <Override PartName="/visio/pages/page1.xml" ContentType="application/vnd.ms-visio.page+xml"/>
</Types>`,
    
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/document" Target="visio/document.xml"/>
</Relationships>`,
    
    'visio/document.xml': `<?xml version="1.0" encoding="UTF-8"?>
<VisioDocument xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <DocumentProperties>
    <Title>${escapeXml(metadata.title || 'Mind Map')}</Title>
    <Creator>MindMapAI</Creator>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
</VisioDocument>`,
    
    'visio/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/pages" Target="pages/pages.xml"/>
</Relationships>`,
    
    'visio/pages/pages.xml': `<?xml version="1.0" encoding="UTF-8"?>
<Pages xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <Page ID="0" Name="Page-1">
    <Rel xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/>
  </Page>
</Pages>`,
    
    'visio/pages/_rels/pages.xml.rels': `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/page" Target="page1.xml"/>
</Relationships>`,
    
    'visio/pages/page1.xml': `<?xml version="1.0" encoding="UTF-8"?>
<PageContents xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <Shapes>
    ${shapes}
  </Shapes>
  <Connects>
    ${connects}
  </Connects>
</PageContents>`
  };
  
  return vsdxContent;
}

// ============================================
// GLIFFY FORMAT (.gliffy)
// ============================================
export function exportToGliffy(data, metadata = {}) {
  const nodePositions = calculateNodePositions(data.nodes, data.edges);
  
  let uid = 1;
  const nodeUidMap = {};
  
  const nodeObjects = data.nodes.map((node, index) => {
    const pos = nodePositions[node.id] || { x: 100 + (index % 5) * 200, y: 100 + Math.floor(index / 5) * 150 };
    const width = Math.max(120, node.label.length * 8);
    const height = 60;
    const currentUid = uid++;
    nodeUidMap[node.id] = currentUid;
    
    return {
      x: pos.x,
      y: pos.y,
      rotation: 0,
      id: currentUid,
      uid: `com.gliffy.shape.basic.basic_v1.default.rounded_rectangle_${currentUid}`,
      width: width,
      height: height,
      lockAspectRatio: false,
      lockShape: false,
      order: currentUid,
      graphic: {
        type: 'Shape',
        Shape: {
          tid: 'com.gliffy.stencil.rectangle.basic_v1',
          strokeWidth: 2,
          strokeColor: '#4a90d9',
          fillColor: '#1e3a5f',
          gradient: false,
          dropShadow: false,
          state: 0,
          opacity: 1,
          shadowX: 0,
          shadowY: 0
        }
      },
      children: [
        {
          x: 0,
          y: height / 2 - 10,
          rotation: 0,
          id: uid++,
          uid: `text_${currentUid}`,
          width: width,
          height: 20,
          lockAspectRatio: false,
          lockShape: false,
          graphic: {
            type: 'Text',
            Text: {
              tid: null,
              valign: 'middle',
              overflow: 'none',
              vposition: 'none',
              hposition: 'none',
              html: `<p style="text-align:center;"><span style="font-size:12px;color:#ffffff;">${escapeHtml(node.label)}</span></p>`,
              paddingLeft: 2,
              paddingRight: 2,
              paddingBottom: 2,
              paddingTop: 2
            }
          }
        }
      ],
      linkMap: []
    };
  });
  
  const edgeObjects = data.edges.map((edge) => {
    const sourceUid = nodeUidMap[edge.source];
    const targetUid = nodeUidMap[edge.target];
    const currentUid = uid++;
    
    return {
      x: 0,
      y: 0,
      rotation: 0,
      id: currentUid,
      uid: `com.gliffy.shape.basic.basic_v1.default.line_${currentUid}`,
      width: 100,
      height: 100,
      lockAspectRatio: false,
      lockShape: false,
      order: currentUid,
      graphic: {
        type: 'Line',
        Line: {
          strokeWidth: 2,
          strokeColor: '#4a90d9',
          fillColor: 'none',
          dashStyle: null,
          startArrow: 0,
          endArrow: 1,
          startArrowRotation: 'auto',
          endArrowRotation: 'auto',
          interpolationType: 'linear',
          cornerRadius: 10,
          controlPath: [[0, 0], [100, 100]],
          lockSegments: {}
        }
      },
      constraints: {
        startConstraint: {
          type: 'StartPositionConstraint',
          StartPositionConstraint: {
            nodeId: sourceUid,
            px: 1,
            py: 0.5
          }
        },
        endConstraint: {
          type: 'EndPositionConstraint',
          EndPositionConstraint: {
            nodeId: targetUid,
            px: 0,
            py: 0.5
          }
        }
      },
      children: edge.label ? [
        {
          x: 50,
          y: 50,
          rotation: 0,
          id: uid++,
          uid: `edge_text_${currentUid}`,
          width: 80,
          height: 20,
          graphic: {
            type: 'Text',
            Text: {
              html: `<p style="text-align:center;"><span style="font-size:10px;color:#94a3b8;">${escapeHtml(edge.label)}</span></p>`
            }
          }
        }
      ] : [],
      linkMap: []
    };
  });
  
  const gliffyDocument = {
    contentType: 'application/gliffy+json',
    version: '1.3',
    metadata: {
      title: metadata.title || 'Mind Map',
      revision: 1,
      exportBorder: false,
      loadPosition: 'default',
      libraries: ['com.gliffy.libraries.basic.basic_v1.default'],
      autosaveDisabled: false
    },
    embeddedResources: {
      index: 0,
      resources: []
    },
    stage: {
      background: '#0f172a',
      width: 1600,
      height: 1200,
      nodeIndex: uid,
      autoFit: true,
      exportBorder: false,
      gridOn: true,
      snapToGrid: true,
      drawingGuidesOn: true,
      pageBreaksOn: false,
      printGridOn: false,
      printPaper: 'LETTER',
      printShrinkToFit: false,
      printPortrait: true,
      maxWidth: 5000,
      maxHeight: 5000,
      themeData: null,
      viewportType: 'default',
      fitBB: { min: { x: 0, y: 0 }, max: { x: 1600, y: 1200 } },
      printModel: {
        pageSize: 'Letter',
        portrait: true,
        fitToOnePage: false,
        displayPageBreaks: false
      },
      objects: [...nodeObjects, ...edgeObjects],
      layers: [
        {
          guid: 'layer-1',
          order: 0,
          name: 'Layer 1',
          active: true,
          locked: false,
          visible: true,
          nodeRefs: nodeObjects.map(n => n.id).concat(edgeObjects.map(e => e.id))
        }
      ],
      shapeStyles: {},
      lineStyles: {}
    }
  };
  
  return JSON.stringify(gliffyDocument, null, 2);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function generateSignature() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateChecksum(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'MMAI_' + Math.abs(hash).toString(16).toUpperCase();
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function calculateNodePositions(nodes, edges) {
  const positions = {};
  const adjacency = {};
  
  // Build adjacency list
  nodes.forEach(node => {
    adjacency[node.id] = [];
  });
  
  edges.forEach(edge => {
    if (adjacency[edge.source]) adjacency[edge.source].push(edge.target);
    if (adjacency[edge.target]) adjacency[edge.target].push(edge.source);
  });
  
  // Find root nodes (most connections)
  const sortedNodes = [...nodes].sort((a, b) => 
    (adjacency[b.id]?.length || 0) - (adjacency[a.id]?.length || 0)
  );
  
  // Simple force-directed-like layout
  const centerX = 600;
  const centerY = 400;
  const radius = 250;
  
  sortedNodes.forEach((node, index) => {
    if (index === 0) {
      positions[node.id] = { x: centerX, y: centerY };
    } else {
      const angle = (2 * Math.PI * index) / sortedNodes.length;
      const r = radius + (index % 3) * 100;
      positions[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    }
  });
  
  return positions;
}

// ============================================
// DOWNLOAD HELPERS
// ============================================
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadVsdx(vsdxContent, filename) {
  // For VSDX, we need to use JSZip or similar
  // This creates a simple ZIP structure
  const { default: JSZip } = await import('jszip');
  
  const zip = new JSZip();
  
  for (const [path, content] of Object.entries(vsdxContent)) {
    zip.file(path, content);
  }
  
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default {
  exportToMMAI,
  importFromMMAI,
  exportToDrawio,
  exportToVsdx,
  exportToGliffy,
  downloadFile,
  downloadVsdx
};
