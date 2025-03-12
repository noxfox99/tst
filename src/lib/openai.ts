import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variable
export const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true // Enable client-side usage
});
