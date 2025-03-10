// src/lib/ai-providers/index.ts
export interface AIResponse {
    text: string;
    provider: string;
    status: 'success' | 'error';
    error?: string;
  }
  
  export interface AIConfig {
    prompt: string;
    type?: 'game' | 'app' | 'website';
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }
  
  export interface AIProvider {
    name: string;
    isAvailable: () => Promise<boolean>;
    generateText: (config: AIConfig) => Promise<AIResponse>;
  }
  
  // Individual providers will be imported here
  import { openaiProvider } from './openai-provider';
  import { grokProvider } from './grok-provider';
  import { deepseekProvider } from './deepseek-provider';
  
  // Liste der Provider in Reihenfolge der Präferenz
  const providers: AIProvider[] = [
    grokProvider,
    deepseekProvider,
    openaiProvider
  ];
  
  export async function getAvailableProviders(): Promise<AIProvider[]> {
    const availableProviders: AIProvider[] = [];
    
    for (const provider of providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          availableProviders.push(provider);
        }
      } catch (error) {
        console.error(`Error checking availability of ${provider.name}:`, error);
      }
    }
    
    return availableProviders;
  }
  
  export async function generateWithFallback(config: AIConfig): Promise<AIResponse> {
    const availableProviders = await getAvailableProviders();
    
    if (availableProviders.length === 0) {
      return {
        text: "Unable to connect to any AI provider. Please try again later.",
        provider: "none",
        status: "error",
        error: "No AI providers available"
      };
    }
    
    // Try each provider in order until one succeeds
    for (const provider of availableProviders) {
      try {
        const response = await provider.generateText(config);
        if (response.status === 'success') {
          return response;
        }
      } catch (error) {
        console.error(`Error with provider ${provider.name}:`, error);
        // Continue to the next provider
      }
    }
    
    // If all providers failed
    return {
      text: "All AI providers failed to generate a response. Please try again later.",
      provider: availableProviders[0].name,
      status: "error",
      error: "All providers failed"
    };
  }