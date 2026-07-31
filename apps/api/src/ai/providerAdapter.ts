import { AIProviderName } from '@build-and-learn/shared-types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionParams {
  systemPrompt: string;
  messages: ChatMessage[];
  jsonMode?: boolean;
  maxTokens?: number;
}

export interface ProviderAdapter {
  name: AIProviderName;
  chat(params: ChatCompletionParams): Promise<{ text: string; raw: unknown }>;
}
