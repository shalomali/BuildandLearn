export type ProjectPhase = 
  | 'definition' 
  | 'learning_plan' 
  | 'system_design' 
  | 'development' 
  | 'milestone_reinforcement' 
  | 'reflection' 
  | 'completed';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Priority = 'learning' | 'balanced' | 'fast';
export type DesignMode = 'beginner' | 'guided' | 'independent';

export type ConceptStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'learned' 
  | 'mastered' 
  | 'needs_review';

export type MilestoneStatus = 'pending' | 'active' | 'completed';

export type GateAction = 'PAUSE_AND_TEACH' | 'PROMPT_LEARNER_WRITE' | 'CONTINUE';

export interface GateDecision {
  action: GateAction;
  conceptId?: string;
  conceptName?: string;
  conceptCategory?: string;
  conceptDescription?: string;
  prerequisites?: string[];
}

export type QuizFormat = 
  | 'fill_missing_code'
  | 'predict_output'
  | 'explain_why'
  | 'identify_bug'
  | 'refactor'
  | 'compare_implementations'
  | 'complete_function'
  | 'explain_line';

export type AIRole = 
  | 'RoadmapGenerator'
  | 'ConceptRecommender'
  | 'DesignFacilitator'
  | 'ArchitectureSynthesizer'
  | 'CodeGenerator'
  | 'ConceptClassifier'
  | 'Teacher'
  | 'QuizGenerator'
  | 'QuizGrader'
  | 'MistakeAnalyzer'
  | 'MilestoneExerciseGenerator'
  | 'ReflectionAnalyzer'
  | 'ReportGenerator'
  | 'NextProjectRecommender';

export type AIProviderName = 'gemini' | 'groq' | 'openrouter' | 'deepseek' | 'anthropic' | 'mock';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}


export interface ArchitectureDoc {
  folderStructure?: string[];
  dbDesign?: { table: string; fields: string[] }[];
  apiPlan?: { endpoint: string; method: string; description: string }[];
  uiFlow?: string[];
}

export interface RoadmapData {
  summary: string;
  milestones: { title: string; description: string; conceptsIntroduced: string[] }[];
  suggestedStack: string[];
}

export interface Project {
  id: string;
  userId?: string;
  title: string;
  description: string;
  stack: string[];
  experienceLevel: ExperienceLevel;
  familiarWithStack: boolean;
  priority: Priority;
  designMode: DesignMode;
  phase: ProjectPhase;
  roadmap: RoadmapData | null;
  architecture: ArchitectureDoc | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Concept {
  id: string;
  name: string;
  category: string;
  prerequisites: string[];
  description: string;
}

export interface ProjectConcept {
  id: string;
  projectId: string;
  conceptId: string;
  concept?: Concept;
  selectedByLearner: boolean;
  status: ConceptStatus;
  confidenceScore: number; // 0.0 to 1.0
  firstEncounteredAt: string | null;
  learnedAt: string | null;
}

export interface ConceptHistoryEntry {
  status: ConceptStatus;
  confidence: number;
  lastSeen: string;
  timesReviewed: number;
}

export interface LearningProfile {
  userId: string;
  conceptHistory: Record<string, ConceptHistoryEntry>;
  learningPreferences: Record<string, unknown>;
  independenceTrend: { date: string; aiPct: number; learnerPct: number }[];
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  orderIndex: number;
  status: MilestoneStatus;
  completedAt: string | null;
}

export type LearningEventType = 
  | 'concept_taught'
  | 'quiz_attempted'
  | 'quiz_passed'
  | 'quiz_failed'
  | 'code_written_by_learner'
  | 'code_written_by_ai'
  | 'mistake_logged'
  | 'reflection_submitted'
  | 'milestone_completed';

export interface LearningEvent {
  id: string;
  projectId: string;
  userId?: string;
  conceptId?: string;
  eventType: LearningEventType;
  payload: Record<string, unknown>;
  providerUsed?: string;
  createdAt: string;
}

export interface CodeAttribution {
  id: string;
  projectId: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  author: 'ai' | 'learner';
  conceptId?: string;
  createdAt: string;
}

export interface AIProviderCall {
  id: string;
  role: AIRole;
  provider: AIProviderName;
  model: string;
  success: boolean;
  latencyMs: number;
  fallbackFrom?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  conceptId: string;
  format: QuizFormat;
  prompt: string;
  codeContext: string | null;
  options?: string[];
  expectedAnswerPattern?: string;
  difficulty: 'trivial' | 'basic' | 'applied' | 'mastery-check';
}

export interface QuizSubmission {
  quizId: string;
  conceptId: string;
  learnerAnswer: string;
}

export interface QuizResult {
  passed: boolean;
  result: 'pass' | 'fail';
  scoreDelta: number;
  newConfidenceScore: number;
  newStatus: ConceptStatus;
  feedback: string;
  explanation: string;
}

export interface TeachContent {
  conceptId: string;
  conceptName: string;
  summary: string;
  analogy: string;
  keyTakeaways: string[];
  codeExample: string;
  documentationUrl?: string;
}

export interface DesignChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedArchitecture?: Partial<ArchitectureDoc>;
}

// WebSocket Event Contracts
export interface WsCodeStreamChunk {
  fileId: string;
  filePath: string;
  chunk: string;
}

export interface WsConceptGateEvent {
  action: GateAction;
  conceptId: string;
  conceptName: string;
}

export interface WsQuizReadyEvent {
  quizId: string;
  question: QuizQuestion;
}

export interface WsMilestoneCompletedEvent {
  milestoneId: string;
  title: string;
}

export interface WsGateClearedEvent {
  conceptId: string;
}

export interface WsProviderFallbackEvent {
  role: AIRole;
  from: AIProviderName;
  to: AIProviderName;
  reason: string;
}
