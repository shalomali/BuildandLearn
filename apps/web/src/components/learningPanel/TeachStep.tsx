import React from 'react';
import { TeachContent } from '@build-and-learn/shared-types';
import { BookOpen, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';

interface TeachStepProps {
  content: TeachContent;
  onContinueToQuiz: () => void;
}

export const TeachStep: React.FC<TeachStepProps> = ({ content, onContinueToQuiz }) => {
  return (
    <div className="p-5 space-y-4 text-slate-200">
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        <BookOpen className="w-5 h-5 text-accent-blue" />
        <h2 className="text-base font-bold text-white">{content.conceptName}</h2>
      </div>

      {/* Summary */}
      <div className="glass-card p-3.5 rounded-lg border border-surface-border space-y-1.5">
        <div className="text-xs font-semibold uppercase text-accent-blue tracking-wider">Concept Summary</div>
        <p className="text-xs text-slate-300 leading-relaxed">{content.summary}</p>
      </div>

      {/* Analogy */}
      <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-purple-400" /> Real-World Analogy
        </div>
        <p className="text-xs text-purple-200 leading-relaxed italic">{content.analogy}</p>
      </div>

      {/* Key Takeaways */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Key Takeaways</div>
        <ul className="space-y-1.5">
          {content.keyTakeaways.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Code Example */}
      {content.codeExample && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Code Example</div>
          <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
            <code>{content.codeExample}</code>
          </pre>
        </div>
      )}

      {/* Unlock Button */}
      <button
        onClick={onContinueToQuiz}
        className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all glow-blue"
      >
        <span>Take Micro-Quiz to Unlock Streaming</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
