// src/lib/ai-providers/grok-provider.ts
import { AIProvider, AIConfig, AIResponse } from './index';

export const grokProvider: AIProvider = {
  name: 'Grok',
  
  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GROK_API_KEY;
      return !!apiKey;
    } catch (error) {
      console.error('Error checking Grok availability:', error);
      return false;
    }
  },
  
  async generateText(config: AIConfig): Promise<AIResponse> {
    try {
      const { prompt, type, systemPrompt, maxTokens = 2000, temperature = 0.7 } = config;
      const apiKey = process.env.NEXT_PUBLIC_GROK_API_KEY;
      
      if (!apiKey) {
        throw new Error('Grok API key not configured');
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
      
      // Hier würde normalerweise ein API-Call zu Grok erfolgen
      // Da die API noch nicht verfügbar ist, simulieren wir die Antwort
      console.log(`Grok API call would be made with: ${prompt}`);
      
      // Simulierte Antwort mit SVG-Assets
      return {
        text: `{
          "type": "marioKart",
          "assets": {
            "track": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNjAwIj48cGF0aCBmaWxsPSIjODg4IiBkPSJNMCAwaDgwMHY2MDBIMHoiLz48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMjAiIHN0cm9rZS1kYXNoYXJyYXk9IjIwLDIwIiBkPSJNMTAwIDMwMGMwIDAgMTUwLTIwMCA2MDAgMCIvPjwvc3ZnPg==",
            "player": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGNpcmNsZSBmaWxsPSJyZWQiIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIvPjxjaXJjbGUgZmlsbD0iI2ZmZiIgY3g9IjIwIiBjeT0iMjAiIHI9IjgiLz48Y2lyY2xlIGZpbGw9IiNmZmYiIGN4PSI0NCIgY3k9IjIwIiByPSI4Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTI0IDQwYzAgMCA4IDE0IDE2IDAiLz48L3N2Zz4=",
            "obstacles": ["data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3QgZmlsbD0iIzY2NiIgeD0iOCIgeT0iOCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4Ii8+PC9zdmc+"]
          },
          "dimensions": {
            "width": 800,
            "height": 600
          },
          "rules": {
            "speed": 10,
            "difficulty": "medium"
          }
        }`,
        provider: 'Grok',
        status: 'success'
      };
    } catch (error) {
      console.error('Grok generation error:', error);
      return {
        text: '',
        provider: 'Grok',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};