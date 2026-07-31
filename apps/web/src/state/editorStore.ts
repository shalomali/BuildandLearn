import { create } from 'zustand';

export interface FileItem {
  path: string;
  name: string;
  content: string;
}

interface EditorState {
  activeFile: string;
  files: Record<string, string>; // path -> content
  fileExplanations: Record<string, string>; // path -> explanation
  attributionMap: Record<string, { author: 'ai' | 'learner'; line: number }[]>; // path -> line attributions
  activeAuthor: 'ai' | 'learner';
  isStreaming: boolean;

  setActiveFile: (path: string) => void;
  setFileContent: (path: string, content: string, author?: 'ai' | 'learner') => void;
  appendFileContent: (path: string, chunk: string, author?: 'ai' | 'learner') => void;
  setActiveAuthor: (author: 'ai' | 'learner') => void;
  setIsStreaming: (isStreaming: boolean) => void;
  initFilesFromArchitecture: (folderStructure?: string[]) => void;
}

const DEFAULT_EXPLANATIONS: Record<string, string> = {
  'src/index.ts': 'Main entry point for starting the server and initializing database & WebSocket connections.',
  'src/routes/api.ts': 'Defines HTTP API endpoints (GET, POST, PUT, DELETE) and connects them to controllers.',
  'src/controllers/userController.ts': 'Handles incoming HTTP request parameters, invokes services, and sends JSON responses.',
  'src/middleware/auth.ts': 'Middleware function that intercepts requests to verify JWT authorization headers before execution.',
  'src/services/userService.ts': 'Encapsulates core business logic and database queries for user management.',
  'src/models/user.ts': 'Defines data structures, TypeScript interfaces, and database schema mappings.',
  'src/ws/socketHandler.ts': 'Manages real-time WebSockets event listeners and broadcasts state updates to connected clients.'
};

export const useEditorStore = create<EditorState>((set) => ({
  activeFile: 'src/index.ts',
  files: {
    'src/index.ts': '// Application Server Entry Point\n// Click "Stream AI Implementation" to generate executable code for this file\n',
    'src/routes/api.ts': '// REST API Endpoint Router\n',
    'src/controllers/userController.ts': '// User Request Controller\n',
    'src/middleware/auth.ts': '// JWT Authentication Middleware\n',
    'src/services/userService.ts': '// User Service Business Logic\n',
    'src/models/user.ts': '// User Model Schema\n',
    'src/ws/socketHandler.ts': '// WebSockets Event Handler\n'
  },
  fileExplanations: DEFAULT_EXPLANATIONS,
  attributionMap: {},
  activeAuthor: 'ai',
  isStreaming: false,

  setActiveFile: (path) => set({ activeFile: path }),

  setFileContent: (path, content, author = 'learner') => set((state) => ({
    files: { ...state.files, [path]: content }
  })),

  appendFileContent: (path, chunk, author = 'ai') => set((state) => {
    const existing = state.files[path] || '';
    const newContent = existing + chunk;
    return {
      files: { ...state.files, [path]: newContent }
    };
  }),

  setActiveAuthor: (activeAuthor) => set({ activeAuthor }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),

  initFilesFromArchitecture: (folderStructure) => {
    if (!folderStructure || folderStructure.length === 0) return;
    set((state) => {
      const newFiles = { ...state.files };
      const newExplanations = { ...state.fileExplanations };

      for (const item of folderStructure) {
        // Only add items that look like file paths (contain an extension)
        const path = item.startsWith('src/') ? item : `src/${item}`;
        if (!newFiles[path]) {
          newFiles[path] = `// Implementation module for ${path}\n`;
        }
        if (!newExplanations[path]) {
          newExplanations[path] = getExplanationForPath(path);
        }
      }
      return { files: newFiles, fileExplanations: newExplanations };
    });
  }
}));

function getExplanationForPath(path: string): string {
  if (path.includes('controller')) return 'Handles HTTP requests and response logic for endpoint routes.';
  if (path.includes('service')) return 'Contains business logic and database access functions.';
  if (path.includes('middleware')) return 'Intercepts incoming requests for authentication and validation.';
  if (path.includes('model') || path.includes('entity')) return 'Defines data schemas and entity attributes.';
  if (path.includes('route')) return 'Maps API paths to respective controller handlers.';
  if (path.includes('ws') || path.includes('socket')) return 'Manages real-time WebSockets connections and events.';
  return 'Architectural code module.';
}
