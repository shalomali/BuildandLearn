import React from 'react';
import { Folder, FileCode, Info, ChevronRight, ChevronDown } from 'lucide-react';

export interface FileTreeNode {
  path: string;
  name: string;
  isFolder: boolean;
  explanation?: string;
  children?: FileTreeNode[];
}

interface FileTreeProps {
  files: string[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  fileExplanations?: Record<string, string>;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFile,
  onSelectFile,
  fileExplanations = {}
}) => {
  // Build nested tree structure
  const buildTree = (paths: string[]): FileTreeNode[] => {
    const root: FileTreeNode[] = [];

    for (const p of paths) {
      const parts = p.split('/');
      let currentLevel = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join('/');

        let existing = currentLevel.find((item) => item.name === part);

        if (!existing) {
          existing = {
            path: currentPath,
            name: part,
            isFolder: !isLast,
            explanation: fileExplanations[currentPath] || getDefaultExplanation(currentPath),
            children: isLast ? undefined : []
          };
          currentLevel.push(existing);
        }

        if (!isLast && existing.children) {
          currentLevel = existing.children;
        }
      }
    }

    return root;
  };

  const treeNodes = buildTree(files);

  return (
    <div className="p-3 space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Folder className="w-3.5 h-3.5 text-accent-blue" /> Project Structure
        </span>
        <span className="text-[10px] text-slate-500">{files.length} items</span>
      </div>

      <div className="space-y-1">
        {treeNodes.map((node) => (
          <FileTreeNodeItem
            key={node.path}
            node={node}
            activeFile={activeFile}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    </div>
  );
};

const FileTreeNodeItem: React.FC<{
  node: FileTreeNode;
  activeFile: string;
  onSelectFile: (path: string) => void;
}> = ({ node, activeFile, onSelectFile }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  if (node.isFolder) {
    return (
      <div className="space-y-1">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-slate-300 hover:bg-slate-800/60 cursor-pointer font-sans"
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-xs text-blue-200">{node.name}</span>
        </div>

        {isOpen && node.children && (
          <div className="pl-4 border-l border-slate-800/80 space-y-1 ml-2">
            {node.children.map((child) => (
              <FileTreeNodeItem
                key={child.path}
                node={child}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = activeFile === node.path;

  return (
    <div
      onClick={() => onSelectFile(node.path)}
      className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-all ${
        isActive
          ? 'bg-blue-950/60 border border-blue-500/40 text-white font-semibold glow-blue'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate">
        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent-blue' : 'text-slate-500'}`} />
        <span className="truncate">{node.name}</span>
      </div>
      {node.explanation && (
        <span
          title={node.explanation}
          className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 hover:text-slate-300 transition-opacity"
        >
          <Info className="w-3 h-3" />
        </span>
      )}
    </div>
  );
};

function getDefaultExplanation(path: string): string {
  if (path.includes('controller')) return 'Handles HTTP request & response logic for endpoints.';
  if (path.includes('service')) return 'Encapsulates core business logic and database operations.';
  if (path.includes('middleware')) return 'Intercepts requests for validation, auth, or logging.';
  if (path.includes('model') || path.includes('schema')) return 'Defines database data structure and entities.';
  if (path.includes('route')) return 'Maps API endpoint URLs to controller functions.';
  if (path.includes('ws') || path.includes('socket')) return 'Manages real-time WebSockets event dispatching.';
  return 'Core application component module.';
}
