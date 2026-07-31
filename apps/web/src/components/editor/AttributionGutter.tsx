import React from 'react';

interface AttributionGutterProps {
  lineCount: number;
  author: 'ai' | 'learner';
}

export const AttributionGutter: React.FC<AttributionGutterProps> = ({ lineCount, author }) => {
  return (
    <div className="flex items-center gap-2 text-[11px] font-mono px-3 py-1 bg-slate-900/90 border-t border-surface-border">
      <span className="text-slate-400">Current Code Author:</span>
      <span
        className={`px-2 py-0.5 rounded text-xs font-semibold ${
          author === 'ai'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}
      >
        {author === 'ai' ? '🤖 AI Generator' : '🧑‍💻 Learner (You)'}
      </span>
      <span className="text-slate-500 ml-auto">{lineCount} lines tagged</span>
    </div>
  );
};
