// src/lib/ai-providers/openai-provider.ts
import { AIProvider, AIConfig, AIResponse } from './index';
import OpenAI from 'openai';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiProvider: AIProvider = {
  name: 'OpenAI',
  
  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      return !!apiKey;
    } catch (error) {
      console.error('Error checking OpenAI availability:', error);
      return false;
    }
  },
  
  async generateText(config: AIConfig): Promise<AIResponse> {
    try {
      const { prompt, type, systemPrompt, maxTokens = 2000, temperature = 0.7 } = config;
      
      // Create default system prompt based on type if not provided
      let finalSystemPrompt = systemPrompt || '';
      if (!finalSystemPrompt && type) {
        if (type === 'game') {
          finalSystemPrompt = `You are an expert Phaser.js game developer. Generate a game config for the Micro SaaS AI Builder platform.
            The config should include game type (e.g., marioKart, platformer), dimensions, and asset information.
            Respond with valid JSON that matches the GameConfig interface:
            {
              "type": "marioKart" | "platformer" | "custom",
              "assets": {
                "track": string (optional),
                "player": string (optional),
                "obstacles": string[] (optional)
              },
              "dimensions": {
                "width": number,
                "height": number
              },
              "rules": Record<string, any> (optional)
            }`;
        } else if (type === 'app' || type === 'website') {
          finalSystemPrompt = `You are an expert web developer. Generate code for a ${type} based on the user's description.
            Your code should be valid and include HTML, CSS, and JavaScript as needed. Focus on creating a functional prototype.`;
        }
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      });
      
      return {
        text: response.choices[0]?.message?.content?.trim() || '',
        provider: 'OpenAI',
        status: 'success'
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      return {
        text: '',
        provider: 'OpenAI',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};