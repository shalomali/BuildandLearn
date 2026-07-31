import React from 'react';
import { ProjectConcept } from '@build-and-learn/shared-types';
import { CheckCircle2, BookOpen, Lock, Sparkles } from 'lucide-react';

interface KnowledgeGraphProps {
  concepts: ProjectConcept[];
  activeConceptId?: string | null;
  onSelectConcept?: (conceptId: string) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  concepts,
  activeConceptId,
  onSelectConcept
}) => {
  const getStatusBadge = (status: string, score: number) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Mastered ({Math.round(score * 100)}%)
          </span>
        );
      case 'learned':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <BookOpen className="w-3 h-3" /> Learned ({Math.round(score * 100)}%)
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3 h-3" /> In Progress ({Math.round(score * 100)}%)
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <Lock className="w-3 h-3" /> Not Started
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-accent-purple" /> Concept Knowledge Graph
      </h3>
      <div className="space-y-2">
        {concepts.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No concepts selected yet.</p>
        ) : (
          concepts.map((pc) => {
            const name = pc.concept?.name || 'Concept';
            const category = pc.concept?.category || 'General';
            const isActive = activeConceptId === (pc.conceptId || pc.concept?.id);

            return (
              <div
                key={pc.id}
                onClick={() => onSelectConcept?.(pc.conceptId || pc.concept?.id || '')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800/90 border-accent-blue glow-blue'
                    : 'glass-card border-surface-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">{name}</span>
                  {getStatusBadge(pc.status, pc.confidenceScore)}
                </div>
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>{category}</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    Confidence: {Math.round(pc.confidenceScore * 100)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
