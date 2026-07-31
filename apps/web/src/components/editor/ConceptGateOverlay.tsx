import React from 'react';
import { useLearningStore } from '../../state/learningStore';
import { ShieldAlert, BookOpen, PenTool } from 'lucide-react';

export const ConceptGateOverlay: React.FC = () => {
  const { gateActive, gateAction, activeConceptName } = useLearningStore();

  if (!gateActive) return null;

  const isTeach = gateAction === 'PAUSE_AND_TEACH';

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in border-2 border-accent-amber/50 rounded-lg">
      <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 animate-pulse-ring">
        {isTeach ? <BookOpen className="w-8 h-8" /> : <PenTool className="w-8 h-8" />}
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
        <ShieldAlert className="w-3.5 h-3.5" /> Concept Gate Active
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        {isTeach ? `Pause & Learn: ${activeConceptName}` : `Hands-On Challenge: ${activeConceptName}`}
      </h2>

      <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
        {isTeach
          ? `Code streaming paused because this planned file introduces "${activeConceptName}". Review the micro-lesson and clear the quiz in the Learning Workspace panel on your right to unlock streaming!`
          : `You've learned "${activeConceptName}"! Write the missing implementation or clear the mastery check in the Learning Workspace panel to continue.`}
      </p>

      <div className="flex items-center gap-3">
        <span className="text-xs text-amber-400 font-medium animate-pulse">
          👉 Complete the challenge in the right panel to unfreeze the editor
        </span>
      </div>
    </div>
  );
};
