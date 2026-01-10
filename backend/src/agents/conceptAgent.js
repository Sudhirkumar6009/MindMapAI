import { generateWithRetry } from '../config/gemini.js';

const CONCEPT_EXTRACTION_PROMPT = `You are a concept extraction agent. Your task is to identify and extract key concepts from the provided text.

RULES:
1. Extract only meaningful concepts (nouns, technical terms, entities, ideas)
2. Do not summarize or explain
3. Return concepts as a flat JSON array of strings
4. Maximum 30 concepts
5. Concepts should be 1-4 words each
6. No duplicates
7. No generic words like "the", "example", "thing"

TEXT:
{{TEXT}}

Return ONLY a valid JSON array. No markdown, no explanation.
Example output: ["Concept A", "Concept B", "Concept C"]`;

export async function extractConcepts(text) {
  const prompt = CONCEPT_EXTRACTION_PROMPT.replace('{{TEXT}}', text);
  
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
