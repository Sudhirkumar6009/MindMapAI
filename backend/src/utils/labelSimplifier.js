/**
 * Label Simplifier Utility
 * Cleans up and professionalizes connection/relationship labels for visualization
 */

// Words to remove entirely (noise words)
const REMOVE_WORDS = [
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
  "who",
  "whom",
  "this",
  "these",
  "those",
  "it",
  "its",
  "process",
  "id",
  "process_id",
  "data",
  "information",
  "thing",
  "stuff",
  "basically",
  "actually",
  "really",
  "very",
  "just",
  "simply",
  "essentially",
];

// Common relationship mappings for cleaner display
const RELATIONSHIP_MAPPINGS = {
  // Verbose to concise
  is_a: "is",
  is_an: "is",
  is_the: "is",
  are_the: "are",
  has_a: "has",
  has_an: "has",
  has_the: "has",
  is_part_of: "part of",
  is_type_of: "type of",
  is_kind_of: "kind of",
  is_related_to: "relates",
  is_associated_with: "links",
  is_connected_to: "connects",
  is_linked_to: "links",
  belongs_to: "belongs",
  depends_on: "needs",
  relies_on: "needs",
  leads_to: "leads",
  results_in: "causes",
  consists_of: "contains",
  is_composed_of: "contains",
  is_made_of: "made of",
  is_created_by: "by",
  is_used_by: "used by",
  is_defined_by: "defined by",
  is_described_by: "described by",
  is_based_on: "based on",
  is_derived_from: "from",
  is_influenced_by: "influenced by",
  is_affected_by: "affected by",
  is_required_by: "required by",
  is_needed_by: "needed by",
  is_provided_by: "by",
  is_supported_by: "supported by",
  is_enabled_by: "enabled by",
  is_managed_by: "managed by",
  is_controlled_by: "controlled by",
  is_owned_by: "owned by",
  can_be: "can be",
  may_be: "may be",
  must_be: "must be",
  should_be: "should be",
  will_be: "will be",
  would_be: "would be",
  could_be: "could be",
  might_be: "might be",

  // Technical terms simplification
  utilizes: "uses",
  implements: "uses",
  employs: "uses",
  leverages: "uses",
  incorporates: "includes",
  encompasses: "includes",
  comprises: "includes",
  facilitates: "enables",
  enables: "enables",
  allows: "enables",
  permits: "allows",
  provides: "gives",
  supplies: "gives",
  delivers: "gives",
  generates: "creates",
  produces: "creates",
  constructs: "builds",
  establishes: "creates",
  initiates: "starts",
  commences: "starts",
  terminates: "ends",
  concludes: "ends",
  completes: "ends",
  modifies: "changes",
  alters: "changes",
  transforms: "changes",
  converts: "changes",
  requires: "needs",
  necessitates: "needs",
  demands: "needs",
  contains: "has",
  includes: "has",
  possesses: "has",
  exhibits: "shows",
  demonstrates: "shows",
  displays: "shows",
  indicates: "shows",
  represents: "is",
  denotes: "means",
  signifies: "means",
  determines: "sets",
  specifies: "defines",
  describes: "about",
  explains: "about",
  illustrates: "shows",
  interacts_with: "with",
  communicates_with: "with",
  connects_to: "to",
  links_to: "to",
  refers_to: "to",
  points_to: "to",
  maps_to: "to",
  corresponds_to: "matches",
  correlates_with: "matches",
  relates_to: "relates",
  pertains_to: "about",
  applies_to: "for",
  extends: "extends",
  inherits: "from",
  derives: "from",
  originates: "from",
  stems_from: "from",
  arises_from: "from",
  follows: "after",
  precedes: "before",
  triggers: "causes",
  invokes: "calls",
  calls: "calls",
  executes: "runs",
  performs: "does",
  handles: "manages",
  processes: "handles",
  manages: "manages",
  controls: "controls",
  regulates: "controls",
  governs: "controls",
  oversees: "manages",
  supervises: "manages",
  monitors: "watches",
  tracks: "tracks",
  observes: "watches",
  analyzes: "analyzes",
  evaluates: "checks",
  assesses: "checks",
  validates: "checks",
  verifies: "checks",
  confirms: "confirms",
  ensures: "ensures",
  guarantees: "ensures",
  maintains: "keeps",
  preserves: "keeps",
  retains: "keeps",
  stores: "stores",
  saves: "saves",
  retrieves: "gets",
  fetches: "gets",
  obtains: "gets",
  acquires: "gets",
  accesses: "uses",
  references: "refs",
  influences: "affects",
  impacts: "affects",
  affects: "affects",
  supports: "helps",
  assists: "helps",
  aids: "helps",
  enhances: "boosts",
  improves: "boosts",
  optimizes: "boosts",
  increases: "grows",
  decreases: "cuts",
  reduces: "cuts",
  minimizes: "cuts",
  maximizes: "grows",
  expands: "grows",
  limits: "caps",
  restricts: "caps",
  constrains: "caps",
  "leads to": "causes",
  "part of": "in",
  "belongs to": "in",
  "connects to": "links",
  "outputs to": "feeds",
  "inputs from": "gets",
  "depends on": "needs",
};

// Maximum label length for display - keep VERY short for readability
const MAX_LABEL_LENGTH = 10;

/**
 * Simplify a relationship label for professional visualization
 * @param {string} label - The original relationship label
 * @returns {string} - Simplified, professional label
 */
export function simplifyLabel(label) {
  if (!label || typeof label !== "string") return "";

  let simplified = label.toLowerCase().trim();

  // Replace underscores and multiple spaces with single space
  simplified = simplified.replace(/_/g, " ").replace(/\s+/g, " ");

  // Check for direct mapping first
  const directMapping = RELATIONSHIP_MAPPINGS[simplified.replace(/ /g, "_")];
  if (directMapping) {
    return formatLabel(directMapping);
  }

  // Check for partial matches in mappings
  for (const [key, value] of Object.entries(RELATIONSHIP_MAPPINGS)) {
    const keyWords = key.replace(/_/g, " ");
    if (simplified === keyWords || simplified.includes(keyWords)) {
      simplified = simplified.replace(keyWords, value);
      break;
    }
  }

  // Remove noise words
  const words = simplified.split(" ");
  const filteredWords = words.filter((word) => !REMOVE_WORDS.includes(word));
  simplified = filteredWords.join(" ");

  // If empty after filtering, use first word of original
  if (!simplified.trim()) {
    simplified = words[0] || label;
  }

  return formatLabel(simplified);
}

/**
 * Format label for display (capitalize, truncate if needed)
 * @param {string} label - Label to format
 * @returns {string} - Formatted label
 */
function formatLabel(label) {
  if (!label) return "";

  // Trim whitespace
  let formatted = label.trim();

  // Truncate if too long
  if (formatted.length > MAX_LABEL_LENGTH) {
    formatted = formatted.substring(0, MAX_LABEL_LENGTH - 2) + "..";
  }

  // Capitalize first letter only for cleaner look
  // formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  return formatted;
}

/**
 * Process all relationships and simplify their labels
 * @param {Array} relationships - Array of relationship objects
 * @returns {Array} - Relationships with simplified labels
 */
export function simplifyRelationships(relationships) {
  if (!Array.isArray(relationships)) return [];

  return relationships.map((rel) => ({
    ...rel,
    relation: simplifyLabel(rel.relation),
    originalRelation: rel.relation, // Keep original for reference
  }));
}

/**
 * Simplify edges for graph display
 * @param {Array} edges - Array of edge objects
 * @returns {Array} - Edges with simplified labels
 */
export function simplifyEdges(edges) {
  if (!Array.isArray(edges)) return [];

  return edges.map((edge) => ({
    ...edge,
    label: simplifyLabel(edge.label),
    originalLabel: edge.label, // Keep original for tooltips
  }));
}

export default {
  simplifyLabel,
  simplifyRelationships,
  simplifyEdges,
};
