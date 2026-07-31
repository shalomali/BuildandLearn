import React, { useEffect, useState } from 'react';
import { request } from '../api/client';
import { useProjectStore } from '../state/projectStore';
import { BookOpen, CheckSquare, Square, ArrowRight, Sparkles } from 'lucide-react';

export const LearningPlan: React.FC = () => {
  const { currentProject, setPhase } = useProjectStore();
  const [suggested, setSuggested] = useState<any[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentProject) return;
    const fetchSuggested = async () => {
      try {
        const res = await request<any>(`/projects/${currentProject.id}/concepts/suggested`);
        const raw = res.suggested;
        const items: any[] = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object'
          ? raw.concepts || raw.items || raw.suggested || Object.values(raw).find((v) => Array.isArray(v)) || []
          : [];
        setSuggested(items);
        setSelectedNames(items.map((i: any) => i?.name || i?.title || String(i))); // Default check all
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, [currentProject]);

  const toggleSelect = (name: string) => {
    if (selectedNames.includes(name)) {
      setSelectedNames(selectedNames.filter((n) => n !== name));
    } else {
      setSelectedNames([...selectedNames, name]);
    }
  };

  const handleConfirm = async () => {
    if (!currentProject || selectedNames.length === 0) {
      alert('Please select at least 1 concept to target for learning.');
      return;
    }
    setSubmitting(true);
    try {
      await request<any>(`/projects/${currentProject.id}/concepts`, {
        method: 'POST',
        body: JSON.stringify({ conceptIds: selectedNames })
      });
      setPhase('system_design');
    } catch (err: any) {
      alert(`Error saving concepts: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-accent-purple text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" /> Phase 2: Learning Plan & Concept Checklist
        </div>
        <h1 className="text-2xl font-extrabold text-white">Select Concepts You Want to Master</h1>
        <p className="text-sm text-slate-400">
          The AI Code Generator will pause and teach whenever selected concepts are introduced into your project code.
        </p>
      </div>

      {loading ? (
        <div className="text-center p-12 text-slate-400">
          <Sparkles className="w-8 h-8 animate-spin mx-auto text-accent-purple mb-2" />
          <p className="text-xs">Analyzing project stack and generating recommended concept checklist...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(suggested) && suggested.length > 0 ? (
              suggested.map((item, idx) => {
                const name = item?.name || item?.title || `Concept ${idx + 1}`;
                const isSelected = selectedNames.includes(name);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSelect(name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/20 border-accent-purple glow-purple'
                        : 'glass-card border-surface-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-accent-purple shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <h3 className="text-sm font-bold text-white">{name}</h3>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item?.category || 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-6">{item?.description || 'Core software engineering concept.'}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 col-span-2 text-center py-4">No suggested concepts available for this stack.</p>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={submitting || selectedNames.length === 0}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all glow-purple"
          >
            {submitting ? (
              <span>Saving Plan & Advancing...</span>
            ) : (
              <>
                <span>Confirm Selected Concepts ({selectedNames.length}) & Proceed to System Design</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
