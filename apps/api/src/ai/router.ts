import { AIRole, AIProviderName } from '@build-and-learn/shared-types';
import { ProviderAdapter, ChatCompletionParams } from './providerAdapter';
import { GeminiAdapter } from './adapters/geminiAdapter';
import { GroqAdapter } from './adapters/groqAdapter';
import { OpenRouterAdapter } from './adapters/openrouterAdapter';
import { DeepSeekAdapter } from './adapters/deepseekAdapter';
import { AnthropicAdapter } from './adapters/anthropicAdapter';
import { MockAdapter } from './adapters/mockAdapter';
import { ROLE_PROVIDER_MAP } from './roleProviderMap';
import { prisma } from '../prismaClient';

const adapters: Record<AIProviderName, ProviderAdapter> = {
  gemini: new GeminiAdapter(),
  groq: new GroqAdapter(),
  openrouter: new OpenRouterAdapter(),
  deepseek: new DeepSeekAdapter(),
  anthropic: new AnthropicAdapter(),
  mock: new MockAdapter()
};

// Quota Guard memory buffer
const providerUsageCounter: Record<string, number> = {};

export async function withQuotaGuard<T>(
  providerName: AIProviderName,
  fn: () => Promise<T>
): Promise<T> {
  const currentCount = providerUsageCounter[providerName] || 0;
  // Free-tier safeguard thresholds
  const limits: Partial<Record<AIProviderName, number>> = {
    groq: 30, // 30 RPM
    gemini: 1500 // 1500 RPD
  };

  if (limits[providerName] && currentCount >= limits[providerName]!) {
    throw new Error(`Preemptive QuotaGuard threshold reached for provider ${providerName}`);
  }

  try {
    const result = await fn();
    providerUsageCounter[providerName] = (providerUsageCounter[providerName] || 0) + 1;
    return result;
  } catch (err) {
    throw err;
  }
}

export async function callRole<T = unknown>(
  role: AIRole,
  params: { systemPrompt: string; userMessage: string; jsonMode?: boolean }
): Promise<{ data: T; providerUsed: AIProviderName; rawText: string }> {
  const config = ROLE_PROVIDER_MAP[role];
  const chain: AIProviderName[] = [config.primary, ...config.fallbackChain];

  let lastError: Error | null = null;
  let fallbackFrom: AIProviderName | undefined;

  for (const providerName of chain) {
    const adapter = adapters[providerName];
    if (!adapter) continue;

    const startTime = Date.now();
    try {
      const completionParams: ChatCompletionParams = {
        systemPrompt: `Role: ${role}\n${params.systemPrompt}`,
        messages: [{ role: 'user', content: params.userMessage }],
        jsonMode: params.jsonMode
      };

      const result = await withQuotaGuard(providerName, () => adapter.chat(completionParams));
      const latencyMs = Date.now() - startTime;

      let parsedData: T;
      if (params.jsonMode) {
        try {
          parsedData = JSON.parse(result.text) as T;
        } catch (jsonErr) {
          // Attempt retry-with-repair once on same provider
          const repairRes = await adapter.chat({
            systemPrompt: 'Your last response was not valid JSON. Return ONLY valid JSON without markdown formatting.',
            messages: [
              { role: 'user', content: params.userMessage },
              { role: 'assistant', content: result.text }
            ],
            jsonMode: true
          });
          parsedData = JSON.parse(repairRes.text) as T;
        }
      } else {
        parsedData = result.text as unknown as T;
      }

      // Log successful call to database
      await prisma.aIProviderCall.create({
        data: {
          role,
          provider: providerName,
          model: providerName === 'mock' ? 'mock-engine' : 'standard',
          success: true,
          latencyMs,
          fallbackFrom
        }
      }).catch(() => {});

      return { data: parsedData, providerUsed: providerName, rawText: result.text };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      lastError = err;
      fallbackFrom = providerName;

      // Log failed attempt to database
      await prisma.aIProviderCall.create({
        data: {
          role,
          provider: providerName,
          model: 'standard',
          success: false,
          latencyMs,
          fallbackFrom
        }
      }).catch(() => {});

      console.warn(`[AI Router] Provider '${providerName}' failed for role '${role}': ${err.message}. Trying next in chain...`);
    }
  }

  throw new Error(`All AI providers exhausted for role '${role}'. Last error: ${lastError?.message}`);
}
