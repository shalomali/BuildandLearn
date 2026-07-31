import React from 'react';
import { Milestone } from '@build-and-learn/shared-types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface MilestoneListProps {
  milestones: Milestone[];
  activeMilestoneId?: string | null;
  onSelectMilestone?: (id: string) => void;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  activeMilestoneId,
  onSelectMilestone
}) => {
  return (
    <div className="p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-accent-blue" /> Project Milestones
      </h3>
      <div className="space-y-2">
        {milestones.map((m, idx) => {
          const isCompleted = m.status === 'completed';
          const isActive = m.id === activeMilestoneId || m.status === 'active';

          return (
            <div
              key={m.id}
              onClick={() => onSelectMilestone?.(m.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : isActive
                  ? 'bg-blue-950/30 border-blue-500/40 text-blue-200 glow-blue'
                  : 'glass-card border-surface-border text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-blue' : 'text-slate-600'}`} />
                )}
                <div>
                  <div className="text-xs font-semibold">
                    {idx + 1}. {m.title}
                  </div>
                  {m.description && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {m.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
