import { ProviderAdapter, ChatCompletionParams } from '../providerAdapter';

export class GroqAdapter implements ProviderAdapter {
  name = 'groq' as const;

  async chat(params: ChatCompletionParams): Promise<{ text: string; raw: unknown }> {
    const apiKey = (process.env.GROQ_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const messages = [
      { role: 'system', content: params.systemPrompt },
      ...params.messages
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: params.maxTokens || 2048,
        response_format: params.jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content || '';
    return { text, raw: data };
  }
}
