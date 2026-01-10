import { generateWithRetry } from '../config/gemini.js';

const RELATIONSHIP_EXTRACTION_PROMPT = `You are a relationship mapping agent. Your task is to identify relationships between the given concepts based on the source text.

RULES:
1. Only create relationships that are explicitly or strongly implied in the text
2. Each relationship must have: source, relation, target
3. Relation should be a SHORT, CLEAN verb or phrase (1-2 words maximum)
4. Use simple, professional words for relations:
   - GOOD: "uses", "has", "creates", "needs", "enables", "leads", "is", "from", "to", "in", "for"
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

export async function extractRelationships(text, concepts) {
  const prompt = RELATIONSHIP_EXTRACTION_PROMPT
    .replace('{{TEXT}}', text)
    .replace('{{CONCEPTS}}', JSON.stringify(concepts));
  
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
