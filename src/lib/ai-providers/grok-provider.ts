import { AIProvider, AIConfig, AIResponse } from './index';

export const grokProvider: AIProvider = {
  name: 'Grok',

  async isAvailable(): Promise<boolean> {
    try {
      const apiKey = 'xai-SJU54jojUXwhne5Q9WcLcojdk2wdsNq0tw6bHLID1deRdgpA37QMVelrCX2aSwcq0S4sO82WoaYf0QQj' || '';  // Use env variable
      return !!apiKey;
    } catch (error) {
      console.error('Error checking Grok availability:', error);
      return false;
    }
  },

  async generateText(config: AIConfig): Promise<AIResponse> {
    try {
      const { prompt, type, systemPrompt, maxTokens = 2000, temperature = 0.7 } = config;
      const apiKey = 'xai-SJU54jojUXwhne5Q9WcLcojdk2wdsNq0tw6bHLID1deRdgpA37QMVelrCX2aSwcq0S4sO82WoaYf0QQj' || '';  

      if (!apiKey) {
        throw new Error('Grok API key not configured');
      }

      const requestBody = {
        model: 'grok-1', // Adjust based on Grok's model names
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        max_tokens: maxTokens,
        temperature: temperature,
      };

      const response = await fetch('https://api.grok.com/v1/chat', {  // Replace with actual Grok API URL
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0]?.text.trim() || '',
        provider: 'Grok',
        status: 'success',
      };

    } catch (error) {
      console.error('Grok API error:', error);
      return {
        text: '',
        provider: 'Grok',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
};
