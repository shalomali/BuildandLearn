import React, { useState } from 'react';
import { request } from '../api/client';
import { useProjectStore } from '../state/projectStore';
import { Sparkles, Send, ArrowRight } from 'lucide-react';

export const Reflection: React.FC = () => {
  const { currentProject, setPhase } = useProjectStore();
  const [reflectionText, setReflectionText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentProject || !reflectionText.trim()) return;
    setLoading(true);
    try {
      const res = await request<any>(`/projects/${currentProject.id}/reflection`, {
        method: 'POST',
        body: JSON.stringify({ learnerReflection: reflectionText })
      });
      setAnalysis(res.reflectionAnalysis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-accent-blue text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Phase 6: Learner Self-Reflection
        </div>
        <h1 className="text-2xl font-extrabold text-white">How do you feel about what you built?</h1>
        <p className="text-sm text-slate-400">
          Reflect on what concepts felt natural vs what areas need further practice.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
        <textarea
          rows={5}
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="I felt confident building the REST endpoints, but the WebSocket state sync took a bit longer to grasp..."
          className="w-full p-4 rounded-xl bg-slate-950 border border-surface-border text-xs text-slate-200 focus:outline-none focus:border-accent-blue"
        />

        {!analysis ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !reflectionText.trim()}
            className="w-full py-3 px-6 rounded-xl bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all glow-blue"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Analyzing Reflection...' : 'Submit Self-Reflection & Update Profile'}</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
            <div className="text-sm font-bold text-emerald-300">Reflection Analysis Recorded</div>
            <p className="text-xs text-slate-300 leading-relaxed">{analysis.feedback}</p>
            <button
              onClick={() => setPhase('completed')}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all glow-emerald"
            >
              <span>View Final Completion & Independence Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
