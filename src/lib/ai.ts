// src/lib/ai.ts
import { generateWithFallback, AIConfig } from './ai-providers';
import { openai } from './openai';

export async function getChatbotResponse(message: string): Promise<string> {
  try {
    // First try with our hybrid approach
    const config: AIConfig = {
      prompt: message,
      systemPrompt: 'You are the Micro SaaS AI Chatbot, a helpful assistant for the Micro SaaS AI Builder platform. Keep responses brief, friendly, and focused on helping users build apps without coding.',
      maxTokens: 300,
      temperature: 0.7
    };
    
    const response = await generateWithFallback(config);
    
    if (response.status === 'success') {
      return response.text;
    }
    
    // Fallback to direct OpenAI if hybrid approach failed
    const openaiResponse = await openai.chat.completions.create({
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

    return openaiResponse.choices[0]?.message?.content?.trim() || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('Chatbot error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

export async function generateCode(prompt: string, type: 'game' | 'app' | 'website' = 'game'): Promise<string> {
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

    // Try with our hybrid approach
    const config: AIConfig = {
      prompt,
      type,
      systemPrompt,
      maxTokens: 2000,
      temperature: 0.7
    };
    
    const response = await generateWithFallback(config);
    
    if (response.status === 'success') {
      return response.text;
    }
    
    // Fallback to direct OpenAI if hybrid approach failed
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return openaiResponse.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI generation error:', error);
    return 'Error: Failed to generate code';
  }
}