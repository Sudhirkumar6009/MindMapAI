import { generateWithRetry } from '../config/gemini.js';

// Diagram-specific relationship guidance
const RELATIONSHIP_GUIDANCE = {
  mindmap: {
    context: 'Mind Map - showing how ideas branch out from central concepts',
    relations: ['contains', 'includes', 'relates to', 'has', 'aspect of', 'example of', 'leads to'],
    structure: 'Create hierarchical branching relationships from central to peripheral concepts'
  },
  flowchart: {
    context: 'Flowchart - showing process flows and decision paths',
    relations: ['then', 'if yes', 'if no', 'leads to', 'causes', 'triggers', 'starts', 'ends'],
    structure: 'Create sequential flow relationships, especially for decisions and outcomes'
  },
  network: {
    context: 'Network Diagram - showing interconnections between entities',
    relations: ['connects', 'links', 'interacts', 'communicates', 'depends on', 'shares', 'accesses'],
    structure: 'Create bidirectional or weighted connections between related entities'
  },
  tree: {
    context: 'Tree Diagram - showing parent-child hierarchies',
    relations: ['parent of', 'child of', 'contains', 'belongs to', 'categorized as', 'type of', 'subset'],
    structure: 'Create strict parent-child relationships forming a tree structure'
  },
  orgchart: {
    context: 'Organization Chart - showing reporting structures',
    relations: ['reports to', 'manages', 'leads', 'part of', 'oversees', 'works in', 'member of'],
    structure: 'Create hierarchical reporting relationships (who reports to whom)'
  },
  block: {
    context: 'Block Diagram - showing system component connections',
    relations: ['feeds', 'outputs to', 'inputs from', 'controls', 'interfaces', 'contains', 'uses'],
    structure: 'Create component interface relationships showing data/signal flow'
  }
};

const RELATIONSHIP_EXTRACTION_PROMPT = `You are a relationship mapping agent for {{DIAGRAM_CONTEXT}}.

Your task is to identify relationships between the given concepts optimized for {{DIAGRAM_TYPE}} visualization.

DIAGRAM-SPECIFIC GUIDANCE:
{{STRUCTURE_GUIDANCE}}
Preferred relationship types: {{PREFERRED_RELATIONS}}

RULES:
1. Only create relationships that are explicitly or strongly implied in the text
2. Each relationship must have: source, relation, target
3. Relation should be a SHORT, CLEAN verb or phrase (1-2 words maximum)
4. Use simple, professional words for relations:
   - GOOD: {{PREFERRED_RELATIONS}}
   - AVOID: "is_associated_with", "is_related_to", "describes", "process_id", "utilizes", "encompasses"
5. Never use underscores - use spaces if needed (e.g., "part of" not "part_of")
6. Do not invent relationships not supported by the text
7. IMPORTANT: Only ONE relationship per source-target pair! Do not create multiple edges between same nodes
8. Maximum 40 relationships total
9. Return as JSON array

CONCEPTS:
{{CONCEPTS}}

TEXT:
{{TEXT}}

Return ONLY a valid JSON array. No markdown, no explanation.
Example output: [{"source": "A", "relation": "uses", "target": "B"}, {"source": "C", "relation": "enables", "target": "D"}]`;

export async function extractRelationships(text, concepts, diagramType = 'mindmap', diagramConfig = {}) {
  const guidance = RELATIONSHIP_GUIDANCE[diagramType] || RELATIONSHIP_GUIDANCE.mindmap;
  
  const prompt = RELATIONSHIP_EXTRACTION_PROMPT
    .replace('{{DIAGRAM_CONTEXT}}', guidance.context)
    .replace('{{DIAGRAM_TYPE}}', diagramConfig.name || 'Mind Map')
    .replace('{{STRUCTURE_GUIDANCE}}', guidance.structure)
    .replace(/{{PREFERRED_RELATIONS}}/g, guidance.relations.join(', '))
    .replace('{{TEXT}}', text)
    .replace('{{CONCEPTS}}', JSON.stringify(concepts));
  
  console.log(`🔗 Extracting relationships for ${diagramConfig.name || 'Mind Map'}...`);
  
  const response = await generateWithRetry(prompt);
  
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    let relationships = JSON.parse(cleaned);
    relationships = Array.isArray(relationships) ? relationships : [];
    
    // Deduplicate: Keep only one relationship per source-target pair
    const seen = new Set();
    const deduplicated = [];
    
    for (const rel of relationships) {
      // Create a unique key for each source-target pair (bidirectional check)
      const key1 = `${rel.source?.toLowerCase()}->${rel.target?.toLowerCase()}`;
      const key2 = `${rel.target?.toLowerCase()}->${rel.source?.toLowerCase()}`;
      
      if (!seen.has(key1) && !seen.has(key2)) {
        seen.add(key1);
        deduplicated.push(rel);
      }
    }
    
    console.log(`📊 Relationships: ${relationships.length} found, ${deduplicated.length} after deduplication`);
    return deduplicated;
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      const relationships = JSON.parse(match[0]);
      // Apply same deduplication
      const seen = new Set();
      const deduplicated = [];
      for (const rel of relationships) {
        const key1 = `${rel.source?.toLowerCase()}->${rel.target?.toLowerCase()}`;
        const key2 = `${rel.target?.toLowerCase()}->${rel.source?.toLowerCase()}`;
        if (!seen.has(key1) && !seen.has(key2)) {
          seen.add(key1);
          deduplicated.push(rel);
        }
      }
      return deduplicated;
    }
    return [];
  }
}
