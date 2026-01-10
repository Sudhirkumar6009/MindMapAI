import { model } from '../config/gemini.js';

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
7. Maximum 50 relationships
8. Return as JSON array

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
  
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const relationships = JSON.parse(cleaned);
    return Array.isArray(relationships) ? relationships : [];
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  }
}
