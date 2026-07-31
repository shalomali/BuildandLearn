import { ProviderAdapter, ChatCompletionParams } from '../providerAdapter';

export class DeepSeekAdapter implements ProviderAdapter {
  name = 'deepseek' as const;

  async chat(params: ChatCompletionParams): Promise<{ text: string; raw: unknown }> {
    const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const messages = [
      { role: 'system', content: params.systemPrompt },
      ...params.messages
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: params.maxTokens || 2048,
        response_format: params.jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API Error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content || '';
    return { text, raw: data };
  }
}
