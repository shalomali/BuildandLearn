import { ProviderAdapter, ChatCompletionParams } from '../providerAdapter';

export class GeminiAdapter implements ProviderAdapter {
  name = 'gemini' as const;

  async chat(params: ChatCompletionParams): Promise<{ text: string; raw: unknown }> {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const contents = params.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Use state-of-the-art Gemini 3.6 Flash model
    const model = 'gemini-3.6-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: params.systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: params.maxTokens || 4096,
            responseMimeType: params.jsonMode ? 'application/json' : 'text/plain'
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text, raw: data };
  }
}
