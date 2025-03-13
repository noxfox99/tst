import OpenAI from "openai";

type GrokRequest = {
  prompt: string;
  model?: string;
  maxTokens?: number;
};

type GrokResponse = {
  text: string;
};

const openai = new OpenAI({ apiKey: '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',
                           dangerouslyAllowBrowser: true,});

export async function generateGrokResponse({ prompt, model = "gpt-4", maxTokens = 100 }: GrokRequest): Promise<GrokResponse> {
  try {
    const response = await openai.completions.create({
      model,
      prompt,
      max_tokens: maxTokens,
    });

    return { text: response.choices[0].text.trim() };
  } catch (error) {
    console.error("Error generating Grok response:", error);
    throw new Error("Failed to generate response from OpenAI.");
  }
}
