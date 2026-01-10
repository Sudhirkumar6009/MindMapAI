import express from 'express';
import { processDocument } from '../agents/orchestrator.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text, options } = req.body;
    
    console.log('\n========== Extract Request ==========');
    console.log('Text length:', text?.length || 0, 'characters');
    
    if (!text || typeof text !== 'string') {
      console.log('❌ No text provided');
      return res.status(400).json({
        success: false,
        error: 'No content provided',
        suggestions: ['Please enter some text or upload a document']
      });
    }

    const result = await processDocument(text.trim(), options);
    
    if (!result.success) {
      console.log('❌ Processing failed:', result.error);
      return res.status(400).json(result);
    }
    
    console.log('✅ Graph generated successfully');
    console.log('   Concepts:', result.concepts?.length);
    console.log('   Relationships:', result.relationships?.length);
    console.log('======================================\n');
    
    res.json(result);
  } catch (error) {
    console.error('❌ Extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract concepts',
      suggestions: ['Please try again with different content']
    });
  }
});

export default router;
