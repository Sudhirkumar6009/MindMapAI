import { generateWithRetry } from "../config/gemini.js";

/**
 * Simplification Agent
 * Condenses verbose concepts and labels into concise, graph-friendly text
 * Target: 1-4 words per label (max 30 chars) for clean, readable visualization
 */

const SIMPLIFICATION_PROMPT = `You are a text simplification expert for graph visualization.

Your task is to condense each concept into a VERY SHORT label for diagram nodes.

**CRITICAL: LABELS MUST BE READABLE WITHOUT ZOOMING**

RULES:
1. **MAXIMUM 30 characters per label** (ideally 15-25 chars)
2. **1-4 words ONLY** - shorter is better!
3. Remove ALL filler words (the, a, an, of, for, with, etc.)
4. Use abbreviations: Database→DB, Application→App, Information→Info
5. Keep essential meaning only
6. Title case (AI Engine, User Input)
7. No sentences, no punctuation
8. Single letters (A, B, C) stay as-is

EXAMPLES:
- "Large Language Model Foundation" → "LLM"
- "Vector Database Storage" → "Vector DB"
- "User Prompts and Queries" → "User Query"
- "Data Processing Pipeline" → "Data Pipeline"
- "Authentication Module" → "Auth Module"
- "Machine Learning Algorithm" → "ML Algorithm"

CONCEPTS TO SIMPLIFY:
{{CONCEPTS}}

Return ONLY a valid JSON object. No markdown.
Format: {"original": "Short Label"}`;

const RELATIONSHIP_SIMPLIFICATION_PROMPT = `Simplify relationship labels for graph edges.

**CRITICAL: EDGE LABELS MUST BE VERY SHORT**

RULES:
1. **MAXIMUM 1 WORD (10 characters)** - single verb only!
2. Use: uses, has, feeds, sends, gets, creates, needs, enables
3. NO phrases like "part of", "leads to" - too long!

EXAMPLES:
- "is responsible for" → "manages"
- "connects to" → "links"
- "leads to" → "causes"
- "is part of" → "in"
- "depends on" → "needs"
- "outputs to" → "feeds"

RELATIONSHIPS TO SIMPLIFY:
{{RELATIONSHIPS}}

Return ONLY a valid JSON object. No markdown.
Format: {"original": "verb"}`;

/**
 * Simplify an array of concepts to graph-friendly labels
 * @param {string[]} concepts - Array of concept strings
 * @returns {Promise<Object>} - Map of original to simplified concepts
 */
export async function simplifyConcepts(concepts) {
  if (!concepts || concepts.length === 0) return {};

  // Filter out already short concepts (≤30 characters)
  const needsSimplification = concepts.filter((c) => c.length > 30);
  const alreadySimple = concepts.filter((c) => c.length <= 30);

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

    // Merge with already simple concepts - enforce 30 char limit
    Object.entries(simplifiedMap).forEach(([original, simplified]) => {
      result[original] = enforceCharLimit(simplified, 30);
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
  // Simplify any relation longer than 10 chars or more than 1 word
  const needsSimplification = uniqueRelations.filter(
    (r) => r.length > 10 || r.split(/\s+/).length > 1,
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
 * Format a concept label (title case, clean, max 30 chars)
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

  return enforceCharLimit(formatted, 30);
}

/**
 * Enforce maximum character limit on a label
 * @param {string} label - Label to limit
 * @param {number} maxChars - Maximum characters allowed (default 30)
 * @returns {string} - Limited label
 */
function enforceCharLimit(label, maxChars = 30) {
  if (!label) return "";
  const trimmed = label.trim();
  if (trimmed.length <= maxChars) return trimmed;
  // Cut at word boundary if possible
  const cut = trimmed.substring(0, maxChars - 2);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.5) {
    return cut.substring(0, lastSpace) + "..";
  }
  return cut + "..";
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
