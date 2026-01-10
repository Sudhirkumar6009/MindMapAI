import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in .env file!');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-2.5-flash - Latest model
export const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
  }
});

// Helper function with retry logic for network errors and rate limits
export async function generateWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Gemini API call attempt ${attempt}/${maxRetries}...`);
      const result = await model.generateContent(prompt);
      console.log('✅ Gemini API call successful');
      return result.response.text();
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      // Check for rate limit errors
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Rate limited. Waiting ${waitTime/1000}s before retry...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      
      // Check for network/fetch errors - retry with backoff
      if (error.message?.includes('fetch failed') || error.message?.includes('network') || error.message?.includes('ECONNRESET')) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`🌐 Network error. Waiting ${waitTime/1000}s before retry...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  throw new Error('Failed to connect to Gemini API after multiple attempts. Please check your internet connection and try again.');
}

export default genAI;
