import { generateWithRetry } from '../config/gemini.js';

// Diagram-specific extraction prompts
const DIAGRAM_PROMPTS = {
  mindmap: `You are a mind map concept extraction agent. Extract key concepts that can be organized hierarchically from the center outward.
Focus on: main topics, subtopics, related ideas, and supporting details.
Structure: One central concept with branching related concepts.`,

  flowchart: `You are a flowchart extraction agent. Extract steps, processes, decisions, and outcomes from the text.
Focus on: sequential steps, decision points (yes/no choices), start/end states, and process flows.
Structure: Linear or branching processes with clear start and end points.`,

  network: `You are a network diagram extraction agent. Extract entities and their interconnections.
Focus on: key entities, relationships between them, hubs (highly connected nodes), and clusters.
Structure: Interconnected nodes showing complex relationships.`,

  tree: `You are a tree diagram extraction agent. Extract hierarchical parent-child relationships.
Focus on: categories, subcategories, classifications, and nested structures.
Structure: Root node with descending levels of child nodes.`,

  orgchart: `You are an organization chart extraction agent. Extract roles, positions, and reporting structures.
Focus on: job titles, departments, teams, reporting relationships, and organizational hierarchy.
Structure: Top-down hierarchy showing who reports to whom.`,

  block: `You are a block diagram extraction agent. Extract system components, modules, and their interfaces.
Focus on: systems, subsystems, components, modules, interfaces, and connections.
Structure: Interconnected blocks representing system architecture.`
};

const CONCEPT_EXTRACTION_PROMPT = `{{DIAGRAM_CONTEXT}}

Your task is to identify and extract key concepts from the provided text optimized for {{DIAGRAM_TYPE}} visualization.

RULES:
1. Extract only meaningful concepts appropriate for {{DIAGRAM_TYPE}} diagrams
2. Focus on: {{EXTRACTION_FOCUS}}
3. Do not summarize or explain
4. Return concepts as a flat JSON array of strings
5. Maximum 30 concepts
6. Concepts should be 1-4 words each
7. No duplicates
8. No generic words like "the", "example", "thing"
9. Order concepts by importance (most central/important first)

TEXT:
{{TEXT}}

Return ONLY a valid JSON array. No markdown, no explanation.
Example output: ["Concept A", "Concept B", "Concept C"]`;

export async function extractConcepts(text, diagramType = 'mindmap', diagramConfig = {}) {
  const diagramContext = DIAGRAM_PROMPTS[diagramType] || DIAGRAM_PROMPTS.mindmap;
  const extractionFocus = diagramConfig.extractionFocus || 'hierarchical concepts and sub-topics';
  
  const prompt = CONCEPT_EXTRACTION_PROMPT
    .replace('{{DIAGRAM_CONTEXT}}', diagramContext)
    .replace(/{{DIAGRAM_TYPE}}/g, diagramConfig.name || 'Mind Map')
    .replace('{{EXTRACTION_FOCUS}}', extractionFocus)
    .replace('{{TEXT}}', text);
  
  console.log(`🧠 Extracting concepts for ${diagramConfig.name || 'Mind Map'}...`);
  
  const response = await generateWithRetry(prompt);
  
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const concepts = JSON.parse(cleaned);
    return Array.isArray(concepts) ? concepts : [];
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  }
}
