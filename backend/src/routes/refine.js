import express from 'express';
import { runRefinementLoop, mergeSimilarConcepts, findIsolatedRelationships } from '../agents/refinementAgent.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, concepts, relationships, maxIterations = 2 } = req.body;

    if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Concepts array is required'
      });
    }

    if (!relationships || !Array.isArray(relationships)) {
      return res.status(400).json({
        success: false,
        error: 'Relationships array is required'
      });
    }

    const result = await runRefinementLoop(
      text || '',
      concepts,
      relationships,
      maxIterations
    );

    const nodes = result.concepts.map((concept, index) => ({
      id: `node_${index}`,
      label: concept,
      connections: result.relationships.filter(
        r => r.source === concept || r.target === concept
      ).length
    }));

    const edges = result.relationships.map((rel, index) => ({
      id: `edge_${index}`,
      source: `node_${result.concepts.indexOf(rel.source)}`,
      target: `node_${result.concepts.indexOf(rel.target)}`,
      label: rel.relation,
      sourceLabel: rel.source,
      targetLabel: rel.target
    })).filter(e => !e.source.includes('-1') && !e.target.includes('-1'));

    res.json({
      success: true,
      concepts: result.concepts,
      relationships: result.relationships,
      nodes,
      edges,
      iterations: result.iterations
    });
  } catch (error) {
    console.error('Refinement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refine graph'
    });
  }
});

router.post('/merge', async (req, res) => {
  try {
    const { concepts } = req.body;
    const result = await mergeSimilarConcepts(concepts);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/isolate', async (req, res) => {
  try {
    const { text, concepts, relationships } = req.body;
    const newRelationships = await findIsolatedRelationships(text, concepts, relationships);
    res.json({ success: true, relationships: newRelationships });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
