/**
 * Label Simplifier Utility (Frontend)
 * Cleans up and professionalizes connection/relationship labels for visualization
 */

// Common relationship mappings for cleaner display
const RELATIONSHIP_MAPPINGS = {
  'is_a': 'is',
  'is_an': 'is',
  'has_a': 'has',
  'has_an': 'has',
  'is_part_of': 'part of',
  'is_type_of': 'type of',
  'is_related_to': 'relates',
  'is_associated_with': 'links',
  'is_connected_to': 'connects',
  'is_linked_to': 'links',
  'belongs_to': 'belongs',
  'depends_on': 'needs',
  'relies_on': 'needs',
  'leads_to': 'leads',
  'results_in': 'causes',
  'consists_of': 'has',
  'is_composed_of': 'has',
  'is_made_of': 'made of',
  'is_created_by': 'by',
  'is_used_by': 'used by',
  'is_based_on': 'based on',
  'is_derived_from': 'from',
  'utilizes': 'uses',
  'implements': 'uses',
  'employs': 'uses',
  'leverages': 'uses',
  'incorporates': 'has',
  'encompasses': 'has',
  'comprises': 'has',
  'facilitates': 'enables',
  'generates': 'creates',
  'produces': 'creates',
  'requires': 'needs',
  'necessitates': 'needs',
  'contains': 'has',
  'includes': 'has',
  'describes': 'about',
  'explains': 'about',
  'represents': 'is',
  'interacts_with': 'with',
  'communicates_with': 'with',
  'connects_to': 'to',
  'links_to': 'to',
  'refers_to': 'to',
  'relates_to': 'relates',
  'pertains_to': 'about',
  'applies_to': 'for',
  'process_id': '',
  'data': '',
  'information': ''
};

// Words to remove
const REMOVE_WORDS = ['the', 'a', 'an', 'of', 'process', 'id', 'process_id', 'data', 'information'];

// Maximum label length
const MAX_LABEL_LENGTH = 12;

/**
 * Simplify a relationship label for professional visualization
 * @param {string} label - The original relationship label
 * @returns {string} - Simplified, professional label
 */
export function simplifyLabel(label) {
  if (!label || typeof label !== 'string') return '';
  
  let simplified = label.toLowerCase().trim();
  
  // Replace underscores with spaces
  simplified = simplified.replace(/_/g, ' ').replace(/\s+/g, ' ');
  
  // Check for direct mapping
  const mappingKey = simplified.replace(/ /g, '_');
  if (RELATIONSHIP_MAPPINGS[mappingKey] !== undefined) {
    return RELATIONSHIP_MAPPINGS[mappingKey];
  }
  
  // Check original with underscores
  if (RELATIONSHIP_MAPPINGS[label.toLowerCase()]) {
    return RELATIONSHIP_MAPPINGS[label.toLowerCase()];
  }
  
  // Remove noise words
  const words = simplified.split(' ').filter(w => !REMOVE_WORDS.includes(w));
  simplified = words.join(' ');
  
  // Truncate if too long
  if (simplified.length > MAX_LABEL_LENGTH) {
    simplified = simplified.substring(0, MAX_LABEL_LENGTH - 2) + '..';
  }
  
  return simplified || label.substring(0, MAX_LABEL_LENGTH);
}

/**
 * Simplify all edge labels in a graph data object
 * @param {Object} data - Graph data with edges array
 * @returns {Object} - Graph data with simplified edge labels
 */
export function simplifyGraphLabels(data) {
  if (!data || !data.edges) return data;
  
  return {
    ...data,
    edges: data.edges.map(edge => ({
      ...edge,
      label: simplifyLabel(edge.label),
      originalLabel: edge.originalLabel || edge.label
    }))
  };
}

export default {
  simplifyLabel,
  simplifyGraphLabels
};
