import React from 'react';
import { ArchitectureDoc } from '@build-and-learn/shared-types';
import { FolderTree, Database, Network, Layout } from 'lucide-react';

interface ArchitecturePreviewProps {
  architecture: ArchitectureDoc | null;
}

export const ArchitecturePreview: React.FC<ArchitecturePreviewProps> = ({ architecture }) => {
  if (!architecture) {
    return (
      <div className="h-full glass-panel rounded-lg border border-surface-border p-6 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
        <Layout className="w-10 h-10 opacity-30 text-slate-400" />
        <p className="text-xs">System Architecture Live Preview will render here during your design session.</p>
      </div>
    );
  }

  return (
    <div className="h-full glass-panel rounded-lg border border-surface-border p-4 overflow-y-auto space-y-4 text-slate-200">
      <h2 className="text-sm font-bold text-white border-b border-surface-border pb-2 flex items-center gap-2">
        <Layout className="w-4 h-4 text-accent-blue" /> Synthesized System Architecture
      </h2>

      {/* Folder Structure */}
      {architecture.folderStructure && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase text-accent-blue tracking-wider flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" /> Proposed Folder Tree
          </div>
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
            {architecture.folderStructure.map((path, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-600">├──</span>
                <span className="text-blue-300">{path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DB Design ERD */}
      {architecture.dbDesign && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase text-accent-purple tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> Database Entities (ERD)
          </div>
          <div className="grid grid-cols-1 gap-2">
            {architecture.dbDesign.map((tableObj, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-surface-border space-y-1">
                <div className="text-xs font-bold font-mono text-purple-300">Table: {tableObj.table}</div>
                <div className="flex flex-wrap gap-1 text-[10px] font-mono text-slate-400">
                  {tableObj.fields.map((f, fIdx) => (
                    <span key={fIdx} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Plan */}
      {architecture.apiPlan && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold uppercase text-accent-emerald tracking-wider flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5" /> REST API Endpoints
          </div>
          <div className="space-y-1.5">
            {architecture.apiPlan.map((ep, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-surface-border text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-slate-200">{ep.endpoint}</span>
                </div>
                <span className="text-[11px] text-slate-400">{ep.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
