import { AIRole, AIProviderName } from '@build-and-learn/shared-types';

export interface ProviderChainConfig {
  primary: AIProviderName;
  fallbackChain: AIProviderName[];
  rationale: string;
}

export const ROLE_PROVIDER_MAP: Record<AIRole, ProviderChainConfig> = {
  RoadmapGenerator: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Gemini 3.6 Flash deep reasoning over brief'
  },
  ConceptRecommender: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Structured concept mapping'
  },
  DesignFacilitator: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Multi-turn educator & system architect'
  },
  ArchitectureSynthesizer: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Highest-stakes architecture synthesis'
  },
  CodeGenerator: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Gemini 3.6 Flash state-of-the-art code generation'
  },
  ConceptClassifier: {
    primary: 'groq',
    fallbackChain: ['gemini', 'mock'],
    rationale: 'Ultra-fast Llama 3.3 70B concept classification'
  },
  Teacher: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Deep pedagogical micro-lessons & analogies'
  },
  QuizGenerator: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Structured code quiz generation'
  },
  QuizGrader: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Lightweight quiz grading'
  },
  MistakeAnalyzer: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Nuanced code flaw diagnosis'
  },
  MilestoneExerciseGenerator: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Milestone synthesis coding challenges'
  },
  ReflectionAnalyzer: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Learner reflection sentiment analysis'
  },
  ReportGenerator: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Final independence & completion report'
  },
  NextProjectRecommender: {
    primary: 'gemini',
    fallbackChain: ['groq', 'mock'],
    rationale: 'Next-step project recommendation'
  }
};
