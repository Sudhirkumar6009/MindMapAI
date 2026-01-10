import express from 'express';
import { analyzeGitHubRepo } from '../agents/githubAgent.js';

const router = express.Router();

/**
 * POST /api/github/analyze
 * Analyze a GitHub repository and extract architecture diagram
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'GitHub URL is required',
        message: 'Please provide a GitHub repository URL (e.g., https://github.com/owner/repo)'
      });
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🐙 GitHub Analysis Request: ${url}`);
    console.log(`${'='.repeat(50)}`);
    
    const startTime = Date.now();
    
    // Analyze the repository
    const result = await analyzeGitHubRepo(url);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ GitHub analysis completed in ${duration}s`);
    console.log(`📊 Concepts: ${result.concepts.length}, Relationships: ${result.relationships.length}`);
    
    // Transform to frontend format
    const graphData = {
      nodes: result.concepts.map((concept, idx) => ({
        id: `node-${idx}`,
        label: concept.name,
        category: concept.category,
        importance: concept.importance,
      })),
      edges: result.relationships.map((rel, idx) => ({
        id: `edge-${idx}`,
        source: result.concepts.findIndex(c => c.name.toLowerCase() === rel.source.toLowerCase()),
        target: result.concepts.findIndex(c => c.name.toLowerCase() === rel.target.toLowerCase()),
        label: rel.relation,
      })).filter(e => e.source !== -1 && e.target !== -1).map(e => ({
        ...e,
        source: `node-${e.source}`,
        target: `node-${e.target}`,
      })),
    };
    
    res.json({
      success: true,
      data: graphData,
      repoInfo: result.repoInfo,
      metadata: result.metadata,
      stats: {
        concepts: result.concepts.length,
        relationships: result.relationships.length,
        duration: `${duration}s`,
      },
    });
    
  } catch (error) {
    console.error('❌ GitHub analysis error:', error.message);
    
    // Provide helpful error messages
    let userMessage = error.message;
    if (error.message.includes('rate limit')) {
      userMessage = 'GitHub API rate limit reached. Please wait a few minutes and try again.';
    } else if (error.message.includes('not found')) {
      userMessage = 'Repository not found. Make sure the URL is correct and the repository is public.';
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze GitHub repository',
      message: userMessage,
    });
  }
});

/**
 * GET /api/github/validate
 * Validate a GitHub URL without full analysis
 */
router.get('/validate', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ valid: false, error: 'URL required' });
    }
    
    // Basic URL validation
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\s#?]+)/,
      /^([^\/]+)\/([^\/\s]+)$/,
    ];
    
    const isValid = patterns.some(p => p.test(url));
    
    res.json({ 
      valid: isValid,
      message: isValid ? 'Valid GitHub URL' : 'Invalid GitHub URL format',
    });
    
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

export default router;
