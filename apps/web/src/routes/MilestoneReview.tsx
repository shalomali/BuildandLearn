import React, { useState } from 'react';
import { request } from '../api/client';
import { useProjectStore } from '../state/projectStore';
import { Award, ArrowRight, CheckCircle2 } from 'lucide-react';

export const MilestoneReview: React.FC = () => {
  const { currentProject, milestones, setPhase } = useProjectStore();
  const activeMilestone = milestones.find((m) => m.status === 'active') || milestones[0];
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateChallenge = async () => {
    if (!currentProject || !activeMilestone) return;
    setLoading(true);
    try {
      const res = await request<any>(`/projects/${currentProject.id}/milestones/${activeMilestone.id}/complete`, {
        method: 'POST'
      });
      setExercise(res.exercise);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-accent-amber text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" /> Phase 5: Milestone Reinforcement
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Reinforce Milestone: {activeMilestone?.title || 'Milestone Review'}
        </h1>
        <p className="text-sm text-slate-400">
          Synthesize concepts from this milestone through an interactive coding challenge before advancing.
        </p>
      </div>

      {!exercise ? (
        <div className="glass-panel p-8 rounded-2xl border border-surface-border text-center space-y-4">
          <Award className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Ready for Milestone Synthesis?</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            The AI MilestoneExerciseGenerator will construct a targeted exercise based on the code written in this milestone.
          </p>
          <button
            onClick={handleGenerateChallenge}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-amber to-accent-purple text-white font-bold text-xs hover:opacity-90 transition-all glow-amber"
          >
            {loading ? 'Generating Challenge...' : 'Generate Milestone Challenge'}
          </button>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
          <h2 className="text-base font-bold text-white">{exercise.title || 'Synthesis Challenge'}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{exercise.instructions}</p>

          {exercise.startingCode && (
            <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-200 border border-slate-800">
              <code>{exercise.startingCode}</code>
            </pre>
          )}

          <button
            onClick={() => setPhase('reflection')}
            className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all glow-emerald"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Milestone & Proceed to Phase 6 Self-Reflection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
