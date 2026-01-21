import { generateWithRetry } from "../config/gemini.js";

// Diagram-specific relationship guidance
const RELATIONSHIP_GUIDANCE = {
  mindmap: {
    context: "Mind Map - showing how ideas branch out from central concepts",
    relations: [
      "contains",
      "includes",
      "relates to",
      "has",
      "aspect of",
      "example of",
      "leads to",
    ],
    structure:
      "Create hierarchical branching relationships from central to peripheral concepts",
  },
  flowchart: {
    context: "Flowchart - showing process flows and decision paths",
    relations: [
      "then",
      "if yes",
      "if no",
      "leads to",
      "causes",
      "triggers",
      "starts",
      "ends",
    ],
    structure:
      "Create sequential flow relationships, especially for decisions and outcomes",
  },
  network: {
    context: "Network Diagram - showing interconnections between entities",
    relations: [
      "connects",
      "links",
      "interacts",
      "communicates",
      "depends on",
      "shares",
      "accesses",
    ],
    structure:
      "Create bidirectional or weighted connections between related entities",
  },
  tree: {
    context: "Tree Diagram - showing parent-child hierarchies",
    relations: [
      "parent of",
      "child of",
      "contains",
      "belongs to",
      "categorized as",
      "type of",
      "subset",
    ],
    structure:
      "Create strict parent-child relationships forming a tree structure",
  },
  orgchart: {
    context: "Organization Chart - showing reporting structures",
    relations: [
      "reports to",
      "manages",
      "leads",
      "part of",
      "oversees",
      "works in",
      "member of",
    ],
    structure:
      "Create hierarchical reporting relationships (who reports to whom)",
  },
  block: {
    context: "Block Diagram - showing system component connections",
    relations: [
      "feeds",
      "outputs to",
      "inputs from",
      "controls",
      "interfaces",
      "contains",
      "uses",
    ],
    structure:
      "Create component interface relationships showing data/signal flow",
  },
};

const RELATIONSHIP_EXTRACTION_PROMPT = `You are a relationship mapping agent for {{DIAGRAM_CONTEXT}}.

Your task is to identify relationships between the given concepts optimized for {{DIAGRAM_TYPE}} visualization.

**CRITICAL: CREATE SIMPLE, READABLE CONNECTIONS - NOT COMPLEX ONES**

DIAGRAM-SPECIFIC GUIDANCE:
{{STRUCTURE_GUIDANCE}}
Preferred relations: {{PREFERRED_RELATIONS}}

RULES:
1. Only create relationships EXPLICITLY stated or strongly implied
2. Each relationship: source, relation, target
3. **RELATION MUST BE 1 WORD ONLY** (max 10 chars): "uses", "has", "feeds", "creates"
4. Simple verbs ONLY:
   - GOOD: uses, has, feeds, creates, enables, needs, sends, gets
   - BAD: "connects to", "is part of", "leads to" (too long!)
5. NO underscores, NO long phrases
6. **MAXIMUM 10-15 relationships** - only essential connections!
7. ONE-WAY direction - no circular loops back to start
8. One relationship per node pair
9. Skip weak/implied relationships - keep only strong ones

CONCEPTS:
{{CONCEPTS}}

TEXT:
{{TEXT}}

Return ONLY a valid JSON array with 10-15 relationships. No markdown.
Example: [{"source": "User", "relation": "sends", "target": "Query"}, {"source": "LLM", "relation": "creates", "target": "Response"}]`;

export async function extractRelationships(
  text,
  concepts,
  diagramType = "mindmap",
  diagramConfig = {},
) {
  const guidance =
    RELATIONSHIP_GUIDANCE[diagramType] || RELATIONSHIP_GUIDANCE.mindmap;

  const prompt = RELATIONSHIP_EXTRACTION_PROMPT.replace(
    "{{DIAGRAM_CONTEXT}}",
    guidance.context,
  )
    .replace("{{DIAGRAM_TYPE}}", diagramConfig.name || "Mind Map")
    .replace("{{STRUCTURE_GUIDANCE}}", guidance.structure)
    .replace(/{{PREFERRED_RELATIONS}}/g, guidance.relations.join(", "))
    .replace("{{TEXT}}", text)
    .replace("{{CONCEPTS}}", JSON.stringify(concepts));

  console.log(
    `🔗 Extracting relationships for ${diagramConfig.name || "Mind Map"}...`,
  );

  const response = await generateWithRetry(prompt);

  const cleaned = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    let relationships = JSON.parse(cleaned);
    relationships = Array.isArray(relationships) ? relationships : [];

    // Deduplicate: Keep only one relationship per source-target pair
    // Also prevent cycles that go back to earlier nodes
    const seen = new Set();
    const deduplicated = [];
    const nodeOrder = []; // Track order nodes appear as sources

    for (const rel of relationships) {
      const source = rel.source?.toLowerCase();
      const target = rel.target?.toLowerCase();

      // Skip if source equals target (self-loop)
      if (source === target) continue;

      // Track node order
      if (!nodeOrder.includes(source)) nodeOrder.push(source);

      // Check if this creates a backward cycle (target appears before source in order)
      const sourceIndex = nodeOrder.indexOf(source);
      const targetIndex = nodeOrder.indexOf(target);

      // Allow forward edges or edges to new nodes, but prevent backward cycles to much earlier nodes
      // Exception: allow edges to the immediate previous node (targetIndex === sourceIndex - 1)
      const isBackwardCycle =
        targetIndex !== -1 && targetIndex < sourceIndex - 1;

      // Create a unique key for each source-target pair
      const key1 = `${source}->${target}`;
      const key2 = `${target}->${source}`;

      if (!seen.has(key1) && !seen.has(key2) && !isBackwardCycle) {
        seen.add(key1);
        deduplicated.push(rel);
      }
    }

    console.log(
      `📊 Relationships: ${relationships.length} found, ${deduplicated.length} after deduplication`,
    );
    return deduplicated;
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      const relationships = JSON.parse(match[0]);
      // Apply same deduplication with cycle detection
      const seen = new Set();
      const deduplicated = [];
      const nodeOrder = [];

      for (const rel of relationships) {
        const source = rel.source?.toLowerCase();
        const target = rel.target?.toLowerCase();

        if (source === target) continue;
        if (!nodeOrder.includes(source)) nodeOrder.push(source);

        const sourceIndex = nodeOrder.indexOf(source);
        const targetIndex = nodeOrder.indexOf(target);
        const isBackwardCycle =
          targetIndex !== -1 && targetIndex < sourceIndex - 1;

        const key1 = `${source}->${target}`;
        const key2 = `${target}->${source}`;

        if (!seen.has(key1) && !seen.has(key2) && !isBackwardCycle) {
          seen.add(key1);
          deduplicated.push(rel);
        }
      }
      return deduplicated;
    }
    return [];
  }
}
