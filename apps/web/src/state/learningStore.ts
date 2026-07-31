import { create } from 'zustand';
import { GateAction, QuizQuestion, TeachContent, ProjectConcept } from '@build-and-learn/shared-types';

interface LearningState {
  gateActive: boolean;
  gateAction: GateAction | null;
  activeConceptId: string | null;
  activeConceptName: string | null;
  teachContent: TeachContent | null;
  currentQuiz: QuizQuestion | null;
  projectConcepts: ProjectConcept[];

  triggerGate: (action: GateAction, conceptId: string, conceptName: string) => void;
  clearGate: () => void;
  setTeachContent: (content: TeachContent | null) => void;
  setCurrentQuiz: (quiz: QuizQuestion | null) => void;
  setProjectConcepts: (concepts: ProjectConcept[]) => void;
  updateConceptStatus: (conceptId: string, status: any, score: number) => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  gateActive: false,
  gateAction: null,
  activeConceptId: null,
  activeConceptName: null,
  teachContent: null,
  currentQuiz: null,
  projectConcepts: [],

  triggerGate: (action, conceptId, conceptName) => set({
    gateActive: true,
    gateAction: action,
    activeConceptId: conceptId,
    activeConceptName: conceptName
  }),

  clearGate: () => set({
    gateActive: false,
    gateAction: null,
    activeConceptId: null,
    activeConceptName: null,
    teachContent: null,
    currentQuiz: null
  }),

  setTeachContent: (teachContent) => set({ teachContent }),
  setCurrentQuiz: (currentQuiz) => set({ currentQuiz }),
  setProjectConcepts: (projectConcepts) => set({ projectConcepts }),

  updateConceptStatus: (conceptId, status, score) => set((state) => ({
    projectConcepts: state.projectConcepts.map(c => 
      c.conceptId === conceptId || c.concept?.id === conceptId
        ? { ...c, status, confidenceScore: score }
        : c
    )
  }))
}));
