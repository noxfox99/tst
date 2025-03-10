import { openai } from '@/lib/openai';

export interface GenerationRequest {
  prompt: string;
  type?: 'game' | 'app' | 'website';
}

export interface GenerationResponse {
  code?: string;
  gameConfig?: any;
  error?: string;
}

export class AIService {
  async generateCode({ prompt, type = 'game' }: GenerationRequest): Promise<GenerationResponse> {
    try {
      // Create a system prompt based on the generation type
      let systemPrompt = '';
      
      if (type === 'game') {
        systemPrompt = `You are an expert Phaser.js game developer. Generate a game config for the Micro SaaS AI Builder platform.
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
        systemPrompt = `You are an expert web developer. Generate code for a ${type} based on the user's description.
          Your code should be valid and include HTML, CSS, and JavaScript as needed. Focus on creating a functional prototype.`;
      }
      
      // Make API request to OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });
      
      // Extract and parse the response
      const content = response.choices[0]?.message?.content?.trim() || '';
      
      // For games, extract JSON config
      if (type === 'game') {
        try {
          const jsonContent = this.extractJsonFromString(content);
          const gameConfig = JSON.parse(jsonContent);
          return { gameConfig };
        } catch (error) {
          console.error('Error parsing game config:', error);
          return { error: 'Failed to parse game configuration' };
        }
      }
      
      // For apps/websites, return the generated code
      return { code: content };
    } catch (error) {
      console.error('AI generation error:', error);
      return { error: 'Failed to generate code' };
    }
  }
  
  async getChatbotResponse(message: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are the Micro SaaS AI Chatbot, a helpful assistant for the Micro SaaS AI Builder platform. Keep responses brief, friendly, and focused on helping users build apps without coding.' 
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      });
      
      return response.choices[0]?.message?.content?.trim() || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Chatbot error:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  }
  
  private extractJsonFromString(text: string): string {
    // Find JSON content between backticks or brackets
    const jsonMatch = text.match(/```json\s*(\{.*?\})\s*```/s) || 
                      text.match(/\{.*\}/s);
    
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1];
    } else if (jsonMatch) {
      return jsonMatch[0];
    }
    
    throw new Error('No valid JSON found in the response');
  }
}