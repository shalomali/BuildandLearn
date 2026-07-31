import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useLearningStore } from '../../state/learningStore';
import { useEditorStore } from '../../state/editorStore';

interface CodeEditorProps {
  filePath: string;
  value: string;
  onChange: (val: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, value, onChange }) => {
  const gateActive = useLearningStore((s) => s.gateActive);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-surface rounded-lg overflow-hidden border border-surface-border">
      {/* Top File Bar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-surface-border flex items-center justify-between">
        <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-blue inline-block"></span>
          {filePath}
        </span>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          TypeScript / React
        </span>
      </div>

      {/* Editor Surface */}
      <div className="w-full h-[calc(100%-37px)] relative">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={value}
          onChange={(v) => {
            if (!gateActive && v !== undefined) {
              onChange(v);
            }
          }}
          onMount={handleEditorDidMount}
          options={{
            readOnly: gateActive, // Hard freeze editing & streaming when gate active
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
};
