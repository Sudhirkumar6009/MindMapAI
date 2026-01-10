import { extractConcepts } from './conceptAgent.js';
import { extractRelationships } from './relationshipAgent.js';
import { runRefinementLoop } from './refinementAgent.js';
import { simplifyLabel, simplifyRelationships } from '../utils/labelSimplifier.js';
import { validateContent, getErrorMessage } from '../utils/contentValidator.js';

export async function processDocument(text, options = {}) {
  const { refine = true, maxIterations = 2 } = options;
  
  // Validate content before processing
  console.log('\n========== Content Validation ==========');
  const validation = validateContent(text);
  
  if (!validation.isValid) {
    console.log('❌ Content validation failed:', validation.error);
    console.log('   Analysis:', JSON.stringify(validation.analysis));
    console.log('==========================================\n');
    
    return {
      success: false,
      error: validation.error,
      suggestions: validation.suggestions,
      analysis: validation.analysis,
      concepts: [],
      relationships: []
    };
  }
  
  console.log('✅ Content validated successfully');
  console.log('   Quality Score:', validation.analysis.quality);
  console.log('   Estimated Concepts:', validation.analysis.estimatedConcepts);
  console.log('==========================================\n');
  
  const concepts = await extractConcepts(text);
  
  if (concepts.length === 0) {
    return {
      success: false,
      error: 'AI could not extract meaningful concepts from this content',
      suggestions: [
        'Try rephrasing your content with clearer topics',
        'Add more specific terms related to your subject',
        'Include definitions or explanations of key ideas'
      ],
      concepts: [],
      relationships: []
    };
  }

  if (concepts.length < 3) {
    return {
      success: false,
      error: 'Not enough concepts found to create a meaningful graph',
      suggestions: [
        `Only ${concepts.length} concept(s) found: ${concepts.join(', ')}`,
        'Add more content with additional topics or ideas',
        'Expand on the existing concepts with more detail'
      ],
      concepts,
      relationships: []
    };
  }

  const relationships = await extractRelationships(text, concepts);

  let finalConcepts = concepts;
  let finalRelationships = relationships;
  let refinementInfo = null;

  if (refine && (concepts.length > 15 || relationships.length > 30)) {
    const refined = await runRefinementLoop(text, concepts, relationships, maxIterations);
    finalConcepts = refined.concepts;
    finalRelationships = refined.relationships;
    refinementInfo = {
      originalConceptCount: concepts.length,
      originalRelationshipCount: relationships.length,
      iterations: refined.iterations
    };
  }

  // Simplify relationship labels for professional visualization
  const simplifiedRelationships = simplifyRelationships(finalRelationships);

  const nodes = finalConcepts.map((concept, index) => ({
    id: `node_${index}`,
    label: concept,
    connections: simplifiedRelationships.filter(
      r => r.source === concept || r.target === concept
    ).length
  }));

  const edges = simplifiedRelationships.map((rel, index) => ({
    id: `edge_${index}`,
    source: `node_${finalConcepts.indexOf(rel.source)}`,
    target: `node_${finalConcepts.indexOf(rel.target)}`,
    label: rel.relation,
    originalLabel: rel.originalRelation,
    sourceLabel: rel.source,
    targetLabel: rel.target
  })).filter(e => !e.source.includes('-1') && !e.target.includes('-1'));

  return {
    success: true,
    concepts: finalConcepts,
    relationships: simplifiedRelationships,
    nodes,
    edges,
    refinementInfo,
    stats: {
      conceptCount: finalConcepts.length,
      relationshipCount: simplifiedRelationships.length,
      isolatedConcepts: finalConcepts.filter(c => 
        !simplifiedRelationships.some(r => r.source === c || r.target === c)
      ).length
    }
  };
}
