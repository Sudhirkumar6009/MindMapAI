import { model } from '../config/gemini.js';

const MERGE_PROMPT = `You are a concept refinement agent. Analyze these concepts and merge similar or redundant ones.

RULES:
1. Merge concepts that are synonyms or very closely related
2. Keep the most specific/descriptive version
3. Return the refined list as JSON array
4. Preserve important distinctions

CONCEPTS:
{{CONCEPTS}}

Return ONLY a valid JSON array of refined concepts. No markdown, no explanation.`;

const ISOLATE_CHECK_PROMPT = `You are a relationship validator agent. Given these isolated concepts (no connections) and the source text, suggest relationships they might have.

ISOLATED CONCEPTS:
{{ISOLATED}}

ALL CONCEPTS:
{{CONCEPTS}}

TEXT:
{{TEXT}}

Return ONLY a valid JSON array of new relationships. No markdown, no explanation.
Format: [{"source": "A", "relation": "verb", "target": "B"}]`;

export async function mergeSimilarConcepts(concepts) {
  if (concepts.length <= 15) {
    return { concepts, merged: [] };
  }

  const prompt = MERGE_PROMPT.replace('{{CONCEPTS}}', JSON.stringify(concepts));
  
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const refined = JSON.parse(cleaned);
    const merged = concepts.filter(c => !refined.includes(c));
    return { concepts: refined, merged };
  } catch {
    return { concepts, merged: [] };
  }
}

export async function findIsolatedRelationships(text, concepts, relationships) {
  const connected = new Set();
  relationships.forEach(r => {
    connected.add(r.source);
    connected.add(r.target);
  });
  
  const isolated = concepts.filter(c => !connected.has(c));
  
  if (isolated.length === 0) {
    return [];
  }

  const prompt = ISOLATE_CHECK_PROMPT
    .replace('{{ISOLATED}}', JSON.stringify(isolated))
    .replace('{{CONCEPTS}}', JSON.stringify(concepts))
    .replace('{{TEXT}}', text.substring(0, 3000));
  
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  try {
    const newRelationships = JSON.parse(cleaned);
    return Array.isArray(newRelationships) ? newRelationships : [];
  } catch {
    return [];
  }
}

export async function runRefinementLoop(text, concepts, relationships, maxIterations = 2) {
  let currentConcepts = [...concepts];
  let currentRelationships = [...relationships];
  let iterations = 0;

  while (iterations < maxIterations) {
    const { concepts: mergedConcepts } = await mergeSimilarConcepts(currentConcepts);
    
    if (mergedConcepts.length < currentConcepts.length) {
      const conceptMap = {};
      currentConcepts.forEach((c, i) => {
        const closest = mergedConcepts.find(mc => 
          mc.toLowerCase().includes(c.toLowerCase()) || 
          c.toLowerCase().includes(mc.toLowerCase())
        ) || mergedConcepts[i % mergedConcepts.length];
        conceptMap[c] = closest;
      });
      
      currentRelationships = currentRelationships.map(r => ({
        source: conceptMap[r.source] || r.source,
        relation: r.relation,
        target: conceptMap[r.target] || r.target
      })).filter(r => 
        mergedConcepts.includes(r.source) && 
        mergedConcepts.includes(r.target) &&
        r.source !== r.target
      );
      
      currentConcepts = mergedConcepts;
    }

    const newRelationships = await findIsolatedRelationships(
      text, 
      currentConcepts, 
      currentRelationships
    );
    
    if (newRelationships.length > 0) {
      currentRelationships = [...currentRelationships, ...newRelationships];
    }

    iterations++;
  }

  const uniqueRelationships = currentRelationships.filter((r, i, arr) => 
    arr.findIndex(x => 
      x.source === r.source && 
      x.target === r.target && 
      x.relation === r.relation
    ) === i
  );

  return {
    concepts: currentConcepts,
    relationships: uniqueRelationships,
    iterations
  };
}
