import { extractConcepts } from "./conceptAgent.js";
import { extractRelationships } from "./relationshipAgent.js";
import { runRefinementLoop } from "./refinementAgent.js";
import { simplifyGraph } from "./simplificationAgent.js";
import {
  simplifyLabel,
  simplifyRelationships,
} from "../utils/labelSimplifier.js";
import { validateContent, getErrorMessage } from "../utils/contentValidator.js";

// Diagram type configurations for different visualization styles
const DIAGRAM_CONFIGS = {
  mindmap: {
    name: "Mind Map",
    nodeTypes: ["central", "branch", "leaf"],
    edgeStyle: "curved",
    layout: "radial",
    extractionFocus: "hierarchical concepts and sub-topics",
  },
  flowchart: {
    name: "Flowchart",
    nodeTypes: ["start", "process", "decision", "end"],
    edgeStyle: "orthogonal",
    layout: "vertical",
    extractionFocus: "processes, steps, decisions, and outcomes",
  },
  network: {
    name: "Network Diagram",
    nodeTypes: ["hub", "node", "endpoint"],
    edgeStyle: "straight",
    layout: "force-directed",
    extractionFocus: "entities and their interconnections",
  },
  tree: {
    name: "Tree Diagram",
    nodeTypes: ["root", "parent", "child", "leaf"],
    edgeStyle: "straight",
    layout: "hierarchical",
    extractionFocus: "parent-child relationships and categories",
  },
  orgchart: {
    name: "Organization Chart",
    nodeTypes: ["executive", "manager", "team", "member"],
    edgeStyle: "orthogonal",
    layout: "vertical",
    extractionFocus: "roles, positions, and reporting structures",
  },
  block: {
    name: "Block Diagram",
    nodeTypes: ["system", "component", "module", "interface"],
    edgeStyle: "straight",
    layout: "grid",
    extractionFocus: "components, modules, and their interfaces",
  },
};

export async function processDocument(text, options = {}) {
  const { refine = true, maxIterations = 2, diagramType = "mindmap" } = options;

  // Get diagram configuration
  const diagramConfig = DIAGRAM_CONFIGS[diagramType] || DIAGRAM_CONFIGS.mindmap;
  console.log(`\n📊 Generating ${diagramConfig.name} diagram...`);

  // Validate content before processing
  console.log("\n========== Content Validation ==========");
  const validation = validateContent(text);

  if (!validation.isValid) {
    console.log("❌ Content validation failed:", validation.error);
    console.log("   Analysis:", JSON.stringify(validation.analysis));
    console.log("==========================================\n");

    return {
      success: false,
      error: validation.error,
      suggestions: validation.suggestions,
      analysis: validation.analysis,
      concepts: [],
      relationships: [],
      diagramType,
    };
  }

  console.log("✅ Content validated successfully");
  console.log("   Quality Score:", validation.analysis.quality);
  console.log("   Estimated Concepts:", validation.analysis.estimatedConcepts);
  console.log("==========================================\n");

  // Pass diagram type to concept extraction for context-aware extraction
  const concepts = await extractConcepts(text, diagramType, diagramConfig);

  if (concepts.length === 0) {
    return {
      success: false,
      error: "AI could not extract meaningful concepts from this content",
      suggestions: [
        "Try rephrasing your content with clearer topics",
        "Add more specific terms related to your subject",
        "Include definitions or explanations of key ideas",
      ],
      concepts: [],
      relationships: [],
      diagramType,
    };
  }

  if (concepts.length < 3) {
    return {
      success: false,
      error: "Not enough concepts found to create a meaningful graph",
      suggestions: [
        `Only ${concepts.length} concept(s) found: ${concepts.join(", ")}`,
        "Add more content with additional topics or ideas",
        "Expand on the existing concepts with more detail",
      ],
      concepts,
      relationships: [],
      diagramType,
    };
  }

  // Pass diagram type to relationship extraction
  const relationships = await extractRelationships(
    text,
    concepts,
    diagramType,
    diagramConfig,
  );

  let finalConcepts = concepts;
  let finalRelationships = relationships;
  let refinementInfo = null;

  if (refine && (concepts.length > 15 || relationships.length > 30)) {
    const refined = await runRefinementLoop(
      text,
      concepts,
      relationships,
      maxIterations,
    );
    finalConcepts = refined.concepts;
    finalRelationships = refined.relationships;
    refinementInfo = {
      originalConceptCount: concepts.length,
      originalRelationshipCount: relationships.length,
      iterations: refined.iterations,
    };
  }

  // NEW: Run AI-powered simplification to condense verbose labels (3-8 words max)
  const simplified = await simplifyGraph(finalConcepts, finalRelationships);
  finalConcepts = simplified.concepts;
  finalRelationships = simplified.relationships;

  // Apply additional label cleanup for edge labels
  const simplifiedRelationships = simplifyRelationships(finalRelationships);

  // Assign node types based on diagram configuration
  const nodes = finalConcepts.map((concept, index) => {
    const connectionCount = simplifiedRelationships.filter(
      (r) => r.source === concept || r.target === concept,
    ).length;

    // Determine node type based on diagram type and connections
    let nodeType = diagramConfig.nodeTypes[diagramConfig.nodeTypes.length - 1]; // default to last type
    if (diagramType === "mindmap") {
      if (index === 0 || connectionCount >= 5) nodeType = "central";
      else if (connectionCount >= 3) nodeType = "branch";
      else nodeType = "leaf";
    } else if (diagramType === "flowchart") {
      if (connectionCount === 0 || index === 0) nodeType = "start";
      else if (connectionCount === 1) nodeType = "end";
      else if (connectionCount >= 3) nodeType = "decision";
      else nodeType = "process";
    } else if (diagramType === "network") {
      if (connectionCount >= 5) nodeType = "hub";
      else if (connectionCount >= 2) nodeType = "node";
      else nodeType = "endpoint";
    } else if (diagramType === "tree") {
      if (index === 0) nodeType = "root";
      else if (connectionCount >= 3) nodeType = "parent";
      else if (connectionCount >= 1) nodeType = "child";
      else nodeType = "leaf";
    } else if (diagramType === "orgchart") {
      if (connectionCount >= 5) nodeType = "executive";
      else if (connectionCount >= 3) nodeType = "manager";
      else if (connectionCount >= 2) nodeType = "team";
      else nodeType = "member";
    } else if (diagramType === "block") {
      if (connectionCount >= 5) nodeType = "system";
      else if (connectionCount >= 3) nodeType = "component";
      else if (connectionCount >= 1) nodeType = "module";
      else nodeType = "interface";
    }

    return {
      id: `node_${index}`,
      label: concept,
      connections: connectionCount,
      nodeType,
      diagramType,
    };
  });

  const edges = simplifiedRelationships
    .map((rel, index) => ({
      id: `edge_${index}`,
      source: `node_${finalConcepts.indexOf(rel.source)}`,
      target: `node_${finalConcepts.indexOf(rel.target)}`,
      label: rel.relation,
      originalLabel: rel.originalRelation,
      sourceLabel: rel.source,
      targetLabel: rel.target,
      edgeStyle: diagramConfig.edgeStyle,
    }))
    .filter((e) => !e.source.includes("-1") && !e.target.includes("-1"));

  return {
    success: true,
    concepts: finalConcepts,
    relationships: simplifiedRelationships,
    nodes,
    edges,
    refinementInfo,
    diagramType,
    diagramConfig: {
      name: diagramConfig.name,
      layout: diagramConfig.layout,
      edgeStyle: diagramConfig.edgeStyle,
    },
    stats: {
      conceptCount: finalConcepts.length,
      relationshipCount: simplifiedRelationships.length,
      isolatedConcepts: finalConcepts.filter(
        (c) =>
          !simplifiedRelationships.some(
            (r) => r.source === c || r.target === c,
          ),
      ).length,
    },
  };
}
