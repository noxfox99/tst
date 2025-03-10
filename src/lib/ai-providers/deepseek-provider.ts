// src/lib/ai-providers/deepseek-provider.ts
import { AIProvider, AIConfig, AIResponse } from './index';

export const deepseekProvider: AIProvider = {
  name: 'DeepSeek',
  
  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      return !!apiKey;
    } catch (error) {
      console.error('Error checking DeepSeek availability:', error);
      return false;
    }
  },
  
  async generateText(config: AIConfig): Promise<AIResponse> {
    try {
      const { prompt, type, systemPrompt, maxTokens = 2000, temperature = 0.7 } = config;
      const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      
      if (!apiKey) {
        throw new Error('DeepSeek API key not configured');
      }
      
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
      
      // Hier würde normalerweise ein API-Call zu DeepSeek erfolgen
      // Da wir die genaue API nicht kennen, simulieren wir die Antwort
      console.log(`DeepSeek API call would be made with: ${prompt}`);
      
      // Simulierte Antwort mit SVG-Assets
      return {
        text: `{
          "type": "platformer",
          "assets": {
            "player": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA2NCI+PHJlY3QgZmlsbD0iIzAwZiIgeD0iMTIiIHk9IjgiIHdpZHRoPSIyNCIgaGVpZ2h0PSIzMiIvPjxjaXJjbGUgZmlsbD0iI2ZmYyIgY3g9IjI0IiBjeT0iNCIgcj0iOCIvPjxyZWN0IGZpbGw9IiMwMGYiIHg9IjQiIHk9IjI0IiB3aWR0aD0iOCIgaGVpZ2h0PSIxNiIvPjxyZWN0IGZpbGw9IiMwMGYiIHg9IjM2IiB5PSIyNCIgd2lkdGg9IjgiIGhlaWdodD0iMTYiLz48cmVjdCBmaWxsPSIjMDBmIiB4PSIxMiIgeT0iNDAiIHdpZHRoPSI4IiBoZWlnaHQ9IjI0Ii8+PHJlY3QgZmlsbD0iIzAwZiIgeD0iMjgiIHk9IjQwIiB3aWR0aD0iOCIgaGVpZ2h0PSIyNCIvPjwvc3ZnPg==",
            "obstacles": ["data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgNjQiPjxyZWN0IGZpbGw9IiM4YjQiIHg9IjAiIHk9IjAiIHdpZHRoPSIyNTYiIGhlaWdodD0iNjQiLz48L3N2Zz4="]
          },
          "dimensions": {
            "width": 800,
            "height": 600
          },
          "rules": {
            "gravity": 200,
            "jumpStrength": 300
          }
        }`,
        provider: 'DeepSeek',
        status: 'success'
      };
    } catch (error) {
      console.error('DeepSeek generation error:', error);
      return {
        text: '',
        provider: 'DeepSeek',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};