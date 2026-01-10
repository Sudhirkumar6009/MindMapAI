import express from 'express';
import multer from 'multer';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { processDocument } from '../agents/orchestrator.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('\n========== PDF Upload ==========');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        suggestions: ['Please select a PDF file to upload']
      });
    }

    console.log('File:', req.file.originalname);
    console.log('Size:', (req.file.size / 1024).toFixed(2), 'KB');

    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;

    console.log('Pages:', pdfData.numpages);
    console.log('Text length:', text?.length || 0);

    if (!text || text.trim().length < 50) {
      console.log('❌ Insufficient text in PDF');
      return res.status(400).json({
        success: false,
        error: 'PDF contains insufficient text content',
        suggestions: [
          'The PDF may be image-based or scanned',
          'Try a PDF with selectable text',
          'Consider using OCR to extract text first'
        ],
        analysis: {
          pages: pdfData.numpages,
          charCount: text?.length || 0
        }
      });
    }

    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const result = await processDocument(text.trim(), options);

    if (!result.success) {
      console.log('❌ Processing failed:', result.error);
      return res.status(400).json({
        ...result,
        pdfInfo: {
          pages: pdfData.numpages,
          textLength: text.length
        }
      });
    }

    console.log('✅ PDF processed successfully');
    console.log('   Concepts:', result.concepts?.length);
    console.log('   Relationships:', result.relationships?.length);
    console.log('==================================\n');

    res.json({
      ...result,
      pdfInfo: {
        pages: pdfData.numpages,
        textLength: text.length
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process PDF',
      suggestions: ['Please try again with a different PDF file']
    });
  }
});

export default router;
