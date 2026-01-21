import { generateWithRetry } from "../config/gemini.js";

/**
 * Simplification Agent
 * Condenses verbose concepts and labels into concise, graph-friendly text
 * Target: 3-8 words per label for clean visualization
 */

const SIMPLIFICATION_PROMPT = `You are a text simplification expert for graph visualization.

Your task is to condense each concept into a SHORT, CLEAR label suitable for display in a diagram node.

RULES:
1. Each label MUST be 3-8 words maximum (ideally 3-5 words)
2. Keep the core meaning - don't lose important context
3. Remove filler words (the, a, an, very, basically, actually, etc.)
4. Use simple, common words over complex ones
5. Keep technical terms if they're essential to the meaning
6. Use title case (capitalize main words)
7. No sentences - just key phrases
8. No punctuation except hyphens for compound terms

EXAMPLES of good simplification:
- "The process of machine learning algorithms" → "Machine Learning Process"
- "How users interact with the system interface" → "User System Interaction"
- "Implementation details of the authentication module" → "Auth Module Implementation"
- "Data flows from the server to the client" → "Server-Client Data Flow"
- "Managing user permissions and access control" → "User Access Control"
- "The relationship between AI and human decision making" → "AI-Human Decision Making"

CONCEPTS TO SIMPLIFY:
{{CONCEPTS}}

Return ONLY a valid JSON object mapping original concepts to simplified versions.
Format: {"original concept 1": "Simplified Label 1", "original concept 2": "Simplified Label 2"}
No markdown, no explanation.`;

const RELATIONSHIP_SIMPLIFICATION_PROMPT = `You are simplifying relationship labels for a graph visualization.

Simplify each relationship label to 1-3 words maximum.

RULES:
1. Maximum 3 words, ideally 1-2
2. Use simple verbs: uses, has, needs, creates, enables, controls, contains, triggers, etc.
3. Remove filler words entirely
4. Keep it professional and clear

EXAMPLES:
- "is responsible for managing" → "manages"
- "has the capability to" → "can"
- "is directly connected to" → "connects"
- "is a fundamental part of" → "part of"
- "depends heavily upon" → "needs"
- "is used to implement" → "implements"

RELATIONSHIPS TO SIMPLIFY:
{{RELATIONSHIPS}}

Return ONLY a valid JSON object mapping original to simplified.
Format: {"original relation": "simplified"}
No markdown, no explanation.`;

/**
 * Simplify an array of concepts to graph-friendly labels
 * @param {string[]} concepts - Array of concept strings
 * @returns {Promise<Object>} - Map of original to simplified concepts
 */
export async function simplifyConcepts(concepts) {
  if (!concepts || concepts.length === 0) return {};

  // Filter out already short concepts (≤5 words)
  const needsSimplification = concepts.filter((c) => c.split(/\s+/).length > 5);
  const alreadySimple = concepts.filter((c) => c.split(/\s+/).length <= 5);

  // Create identity mapping for already simple concepts
  const result = {};
  alreadySimple.forEach((c) => {
    result[c] = formatConceptLabel(c);
  });

  if (needsSimplification.length === 0) {
    return result;
  }

  console.log(
    `✂️ Simplifying ${needsSimplification.length} verbose concepts...`,
  );

  const prompt = SIMPLIFICATION_PROMPT.replace(
    "{{CONCEPTS}}",
    JSON.stringify(needsSimplification, null, 2),
  );

  try {
    const response = await generateWithRetry(prompt);
    const cleaned = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const simplifiedMap = JSON.parse(cleaned);

    // Merge with already simple concepts
    Object.entries(simplifiedMap).forEach(([original, simplified]) => {
      result[original] = enforceWordLimit(simplified, 8);
    });

    console.log(`✅ Simplified ${Object.keys(simplifiedMap).length} concepts`);
    return result;
  } catch (error) {
    console.error("⚠️ Simplification failed, using fallback:", error.message);
    // Fallback: truncate long concepts
    needsSimplification.forEach((c) => {
      result[c] = fallbackSimplify(c);
    });
    return result;
  }
}

/**
 * Simplify relationship labels in bulk
 * @param {Array} relationships - Array of relationship objects with 'relation' field
 * @returns {Promise<Object>} - Map of original to simplified relations
 */
export async function simplifyRelationLabels(relationships) {
  if (!relationships || relationships.length === 0) return {};

  const uniqueRelations = [...new Set(relationships.map((r) => r.relation))];
  const needsSimplification = uniqueRelations.filter(
    (r) => r.split(/\s+/).length > 3,
  );

  const result = {};
  uniqueRelations
    .filter((r) => r.split(/\s+/).length <= 3)
    .forEach((r) => {
      result[r] = r.toLowerCase();
    });

  if (needsSimplification.length === 0) {
    return result;
  }

  console.log(
    `✂️ Simplifying ${needsSimplification.length} verbose relations...`,
  );

  const prompt = RELATIONSHIP_SIMPLIFICATION_PROMPT.replace(
    "{{RELATIONSHIPS}}",
    JSON.stringify(needsSimplification, null, 2),
  );

  try {
    const response = await generateWithRetry(prompt);
    const cleaned = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const simplifiedMap = JSON.parse(cleaned);

    Object.entries(simplifiedMap).forEach(([original, simplified]) => {
      result[original] = enforceWordLimit(simplified, 3).toLowerCase();
    });

    return result;
  } catch (error) {
    console.error("⚠️ Relation simplification failed:", error.message);
    needsSimplification.forEach((r) => {
      result[r] = r.split(/\s+/).slice(0, 2).join(" ").toLowerCase();
    });
    return result;
  }
}

/**
 * Apply simplification map to concepts array
 * @param {string[]} concepts - Original concepts
 * @param {Object} simplificationMap - Map of original to simplified
 * @returns {string[]} - Simplified concepts
 */
export function applyConceptSimplification(concepts, simplificationMap) {
  return concepts.map((c) => simplificationMap[c] || formatConceptLabel(c));
}

/**
 * Apply simplification map to relationships
 * @param {Array} relationships - Original relationships
 * @param {Object} conceptMap - Concept simplification map
 * @param {Object} relationMap - Relation simplification map
 * @returns {Array} - Simplified relationships
 */
export function applyRelationshipSimplification(
  relationships,
  conceptMap,
  relationMap,
) {
  return relationships.map((rel) => ({
    ...rel,
    source: conceptMap[rel.source] || formatConceptLabel(rel.source),
    target: conceptMap[rel.target] || formatConceptLabel(rel.target),
    relation: relationMap[rel.relation] || rel.relation,
    originalSource: rel.source,
    originalTarget: rel.target,
    originalRelation: rel.relation,
  }));
}

/**
 * Format a concept label (title case, clean)
 * @param {string} label - Raw label
 * @returns {string} - Formatted label
 */
function formatConceptLabel(label) {
  if (!label) return "";

  // Remove extra whitespace
  let formatted = label.trim().replace(/\s+/g, " ");

  // Title case
  formatted = formatted
    .split(" ")
    .map((word) => {
      // Keep acronyms uppercase
      if (word === word.toUpperCase() && word.length <= 4) return word;
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  return enforceWordLimit(formatted, 8);
}

/**
 * Enforce maximum word limit on a label
 * @param {string} label - Label to limit
 * @param {number} maxWords - Maximum words allowed
 * @returns {string} - Limited label
 */
function enforceWordLimit(label, maxWords) {
  if (!label) return "";
  const words = label.trim().split(/\s+/);
  if (words.length <= maxWords) return label.trim();
  return words.slice(0, maxWords).join(" ") + "...";
}

/**
 * Fallback simplification when AI fails
 * @param {string} concept - Original concept
 * @returns {string} - Simplified concept
 */
function fallbackSimplify(concept) {
  const stopWords = [
    "the",
    "a",
    "an",
    "of",
    "to",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "that",
    "which",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
  ];

  const words = concept
    .split(/\s+/)
    .filter((w) => !stopWords.includes(w.toLowerCase()));
  const limited = words.slice(0, 5).join(" ");

  return formatConceptLabel(
    limited || concept.split(/\s+/).slice(0, 5).join(" "),
  );
}

/**
 * Main simplification function - simplifies both concepts and relationships
 * @param {string[]} concepts - Array of concepts
 * @param {Array} relationships - Array of relationship objects
 * @returns {Promise<Object>} - Simplified concepts and relationships
 */
export async function simplifyGraph(concepts, relationships) {
  console.log("\n✂️ ========== Graph Simplification ==========");
  console.log(
    `   Input: ${concepts.length} concepts, ${relationships.length} relationships`,
  );

  // Simplify concepts
  const conceptMap = await simplifyConcepts(concepts);
  const simplifiedConcepts = applyConceptSimplification(concepts, conceptMap);

  // Simplify relationships
  const relationMap = await simplifyRelationLabels(relationships);
  const simplifiedRelationships = applyRelationshipSimplification(
    relationships,
    conceptMap,
    relationMap,
  );

  // Remove duplicates that may have emerged from simplification
  const uniqueConcepts = [...new Set(simplifiedConcepts)];

  console.log(
    `   Output: ${uniqueConcepts.length} concepts, ${simplifiedRelationships.length} relationships`,
  );
  console.log("============================================\n");

  return {
    concepts: uniqueConcepts,
    relationships: simplifiedRelationships,
    maps: {
      concepts: conceptMap,
      relations: relationMap,
    },
  };
}

export default {
  simplifyConcepts,
  simplifyRelationLabels,
  simplifyGraph,
  applyConceptSimplification,
  applyRelationshipSimplification,
};
