/**
 * Content Validator - Checks if text is suitable for mind map generation
 */

// Minimum requirements for graph generation
const MIN_WORD_COUNT = 15;
const MIN_CHAR_COUNT = 100;
const MIN_UNIQUE_WORDS = 10;

// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'we', 'they', 'what', 'which', 'who', 'whom', 'when', 'where', 'why',
  'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once', 'if',
  'as', 'into', 'about', 'up', 'down', 'out', 'off', 'over', 'under'
]);

// Patterns that indicate nonsensical content
const NONSENSE_PATTERNS = [
  /^[^a-zA-Z]*$/, // No letters at all
  /(.)\1{5,}/,    // Same character repeated 5+ times
  /^[a-z\s]{0,50}$/i, // Very short with only letters
  /asdf|qwerty|zxcv|lorem ipsum/i, // Keyboard mashing or placeholder
];

// Patterns for content that needs different handling
const SPECIAL_CONTENT = {
  CODE_ONLY: /^[\s\S]*?(function|const|let|var|class|import|export|if|for|while|return)[\s\S]*$/,
  NUMBERS_ONLY: /^[\d\s\.,\-\+\*\/\=\%]+$/,
  URLs_ONLY: /^(https?:\/\/[^\s]+\s*)+$/i,
};

/**
 * Validate text content for mind map generation
 * @param {string} text - Input text to validate
 * @returns {object} - Validation result with success, error, and suggestions
 */
export function validateContent(text) {
  const result = {
    isValid: true,
    error: null,
    suggestions: [],
    analysis: {}
  };

  // Null/undefined check
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      error: 'No content provided',
      suggestions: ['Please enter some text or upload a document'],
      analysis: { wordCount: 0, charCount: 0 }
    };
  }

  const trimmedText = text.trim();
  
  // Basic length checks
  if (trimmedText.length < MIN_CHAR_COUNT) {
    return {
      isValid: false,
      error: 'Content is too short to generate a meaningful mind map',
      suggestions: [
        `Please provide at least ${MIN_CHAR_COUNT} characters of content`,
        'Try adding more details, context, or explanations',
        'Consider expanding on the main topic with examples'
      ],
      analysis: { charCount: trimmedText.length, minRequired: MIN_CHAR_COUNT }
    };
  }

  // Word analysis
  const words = trimmedText.toLowerCase().match(/[a-z]+/gi) || [];
  const wordCount = words.length;
  
  if (wordCount < MIN_WORD_COUNT) {
    return {
      isValid: false,
      error: 'Not enough words to extract meaningful concepts',
      suggestions: [
        `Please provide at least ${MIN_WORD_COUNT} words`,
        'Add more descriptive content about your topic',
        'Include related concepts or subtopics'
      ],
      analysis: { wordCount, minRequired: MIN_WORD_COUNT }
    };
  }

  // Unique meaningful words (excluding stop words)
  const meaningfulWords = words.filter(w => !STOP_WORDS.has(w) && w.length > 2);
  const uniqueMeaningfulWords = new Set(meaningfulWords);
  
  if (uniqueMeaningfulWords.size < MIN_UNIQUE_WORDS) {
    return {
      isValid: false,
      error: 'Content lacks variety - too few unique concepts',
      suggestions: [
        'Add more diverse topics or concepts',
        'Include different aspects of your subject',
        'Avoid repeating the same words too often'
      ],
      analysis: { 
        uniqueWords: uniqueMeaningfulWords.size, 
        minRequired: MIN_UNIQUE_WORDS,
        totalWords: wordCount
      }
    };
  }

  // Check for nonsensical patterns
  for (const pattern of NONSENSE_PATTERNS) {
    if (pattern.test(trimmedText)) {
      return {
        isValid: false,
        error: 'Content appears to be placeholder or random text',
        suggestions: [
          'Please provide meaningful content about a topic',
          'Paste an article, notes, or write about a subject',
          'Avoid placeholder text like "lorem ipsum"'
        ],
        analysis: { pattern: 'nonsense_detected' }
      };
    }
  }

  // Check for special content types
  if (SPECIAL_CONTENT.NUMBERS_ONLY.test(trimmedText)) {
    return {
      isValid: false,
      error: 'Content contains only numbers',
      suggestions: [
        'Add text descriptions to explain the numbers',
        'Include context about what the data represents',
        'Provide labels or categories for the values'
      ],
      analysis: { type: 'numbers_only' }
    };
  }

  if (SPECIAL_CONTENT.URLs_ONLY.test(trimmedText)) {
    return {
      isValid: false,
      error: 'Content contains only URLs',
      suggestions: [
        'Copy the actual content from those web pages',
        'Add descriptions of what each link contains',
        'Provide context about the linked resources'
      ],
      analysis: { type: 'urls_only' }
    };
  }

  // Content is valid - return analysis
  result.analysis = {
    charCount: trimmedText.length,
    wordCount,
    uniqueMeaningfulWords: uniqueMeaningfulWords.size,
    estimatedConcepts: Math.min(30, Math.floor(uniqueMeaningfulWords.size / 2)),
    quality: calculateQualityScore(trimmedText, wordCount, uniqueMeaningfulWords.size)
  };

  // Add quality-based suggestions
  if (result.analysis.quality < 50) {
    result.suggestions.push('Consider adding more detailed explanations for better results');
  }
  if (result.analysis.estimatedConcepts < 5) {
    result.suggestions.push('Adding more content may produce a richer mind map');
  }

  return result;
}

/**
 * Calculate content quality score (0-100)
 */
function calculateQualityScore(text, wordCount, uniqueWords) {
  let score = 0;
  
  // Length score (max 30 points)
  score += Math.min(30, Math.floor(wordCount / 10));
  
  // Vocabulary diversity (max 30 points)
  const diversityRatio = uniqueWords / wordCount;
  score += Math.min(30, Math.floor(diversityRatio * 100));
  
  // Sentence structure (max 20 points)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  score += Math.min(20, sentences.length * 2);
  
  // Has paragraphs (max 20 points)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  score += Math.min(20, paragraphs.length * 5);
  
  return Math.min(100, score);
}

/**
 * Get user-friendly error message for display
 */
export function getErrorMessage(validation) {
  if (validation.isValid) return null;
  
  let message = `❌ ${validation.error}\n\n`;
  
  if (validation.suggestions.length > 0) {
    message += '💡 Suggestions:\n';
    validation.suggestions.forEach(s => {
      message += `• ${s}\n`;
    });
  }
  
  return message.trim();
}
