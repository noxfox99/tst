import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variable
export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable client-side usage
});