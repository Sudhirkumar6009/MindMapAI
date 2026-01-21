import { generateWithRetry } from "../config/gemini.js";

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
Structure: Interconnected blocks representing system architecture.`,
};

const CONCEPT_EXTRACTION_PROMPT = `{{DIAGRAM_CONTEXT}}

Your task is to identify and extract KEY concepts from the provided text optimized for {{DIAGRAM_TYPE}} visualization.

**CRITICAL: CREATE A SMALL, READABLE GRAPH - NOT A COMPLEX ONE**

RULES:
1. Extract only THE MOST IMPORTANT concepts - be very selective!
2. Focus on: {{EXTRACTION_FOCUS}}
3. Do not summarize or explain
4. Return concepts as a flat JSON array of strings
5. **MAXIMUM 8-12 concepts ONLY** - Pick only the essential ones!
6. **Each concept MUST be 1-4 words (under 30 characters)**
7. Use SHORT noun phrases: "AI Engine", "Data Input", "User Query"
8. No duplicates
9. No filler words like "the", "a", "example", "layer"
10. Order by importance (central concept first)
11. For simple patterns like "A shows B", extract entities: A, B
12. Merge similar concepts into one

GOOD (SHORT):
- "LLM Engine" ✓
- "Vector DB" ✓  
- "User Input" ✓
- "AI Response" ✓

BAD (TOO LONG):
- "Large Language Model Foundation" ✗
- "Vector Database Storage System" ✗
- "User Prompts and Queries" ✗

TEXT:
{{TEXT}}

Return ONLY a valid JSON array with 8-12 SHORT concepts. No markdown.
Example: ["AI Engine", "Data Input", "Vector DB", "Response"]`;

export async function extractConcepts(
  text,
  diagramType = "mindmap",
  diagramConfig = {},
) {
  const diagramContext =
    DIAGRAM_PROMPTS[diagramType] || DIAGRAM_PROMPTS.mindmap;
  const extractionFocus =
    diagramConfig.extractionFocus || "hierarchical concepts and sub-topics";

  const prompt = CONCEPT_EXTRACTION_PROMPT.replace(
    "{{DIAGRAM_CONTEXT}}",
    diagramContext,
  )
    .replace(/{{DIAGRAM_TYPE}}/g, diagramConfig.name || "Mind Map")
    .replace("{{EXTRACTION_FOCUS}}", extractionFocus)
    .replace("{{TEXT}}", text);

  console.log(
    `🧠 Extracting concepts for ${diagramConfig.name || "Mind Map"}...`,
  );

  const response = await generateWithRetry(prompt);

  const cleaned = response
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

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
