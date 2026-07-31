import { GateDecision, ConceptStatus } from '@build-and-learn/shared-types';

export const MASTERY_THRESHOLD = 0.75;

export interface ProjectConceptState {
  conceptId: string;
  conceptName: string;
  selectedByLearner: boolean;
  status: ConceptStatus;
  confidenceScore: number;
}

// Concept static pattern signatures (Regex/AST matcher)
const CONCEPT_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  {
    name: "JWT Authentication",
    patterns: [/jwt/i, /bearer/i, /token/i, /jsonwebtoken/i, /auth/i]
  },
  {
    name: "REST API Design",
    patterns: [/router/i, /express/i, /get\(/i, /post\(/i, /put\(/i, /delete\(/i, /res\.json/i, /res\.status/i, /api/i]
  },
  {
    name: "WebSocket Protocol",
    patterns: [/socket/i, /io\./i, /ws\./i, /websocket/i]
  },
  {
    name: "State Management",
    patterns: [/create\(/i, /useStore/i, /useState/i, /useReducer/i, /zustand/i, /redux/i]
  },
  {
    name: "Async/Await Pattern",
    patterns: [/async/i, /await/i, /promise/i]
  },
  {
    name: "Middleware Pattern",
    patterns: [/middleware/i, /next\(/i, /app\.use/i]
  },
  {
    name: "AST Parsing & Code Analysis",
    patterns: [/babel/i, /ast/i, /parser/i, /traverse/i]
  }
];

export function detectConceptsInCode(codeText: string): string[] {
  const detected: string[] = [];
  for (const item of CONCEPT_PATTERNS) {
    if (item.patterns.some(pattern => pattern.test(codeText))) {
      detected.push(item.name);
    }
  }
  return detected;
}

export function checkConceptGate(
  projectConcepts: ProjectConceptState[],
  detectedConceptNames: string[]
): GateDecision {
  for (const conceptName of detectedConceptNames) {
    const pc = projectConcepts.find(p => p.conceptName === conceptName);
    // If concept exists and is selected by learner
    if (pc && pc.selectedByLearner) {
      if (pc.status === 'not_started' || pc.status === 'in_progress') {
        return {
          action: 'PAUSE_AND_TEACH',
          conceptId: pc.conceptId,
          conceptName: pc.conceptName
        };
      }

      if (pc.status === 'learned' && pc.confidenceScore < MASTERY_THRESHOLD) {
        return {
          action: 'PROMPT_LEARNER_WRITE',
          conceptId: pc.conceptId,
          conceptName: pc.conceptName
        };
      }
    }
  }

  return { action: 'CONTINUE' };
}

export function computeNextDifficulty(
  currentScore: number,
  lastResult: 'pass' | 'fail'
): { newScore: number; newStatus: ConceptStatus } {
  const delta = lastResult === 'pass' ? 0.2 : -0.15;
  const newScore = Math.max(0, Math.min(1, currentScore + delta));

  let newStatus: ConceptStatus = 'in_progress';
  if (newScore >= MASTERY_THRESHOLD) {
    newStatus = 'mastered';
  } else if (newScore >= 0.4) {
    newStatus = 'learned';
  }

  return { newScore, newStatus };
}
