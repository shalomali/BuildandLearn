import { ProviderAdapter, ChatCompletionParams } from '../providerAdapter';

export class AnthropicAdapter implements ProviderAdapter {
  name = 'anthropic' as const;

  async chat(params: ChatCompletionParams): Promise<{ text: string; raw: unknown }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const messages = params.messages.map(m => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        system: params.systemPrompt,
        messages,
        max_tokens: params.maxTokens || 2048
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API Error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      content?: { text?: string }[];
    };
    const text = data.content?.[0]?.text || '';
    return { text, raw: data };
  }
}
