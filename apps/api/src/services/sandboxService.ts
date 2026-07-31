import fs from 'fs';
import path from 'path';

const SANDBOX_BASE = path.join(__dirname, '../../../../sandbox/projects');

export function getSandboxPath(projectId: string, relativePath: string = ''): string {
  const projectDir = path.join(SANDBOX_BASE, projectId);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  return path.join(projectDir, relativePath);
}

export function initProjectSandbox(projectId: string, folderStructure: string[] = []) {
  const projectDir = getSandboxPath(projectId);
  
  // Always create default src layout
  const defaultPaths = [
    'src/index.ts',
    'src/routes/api.ts',
    'src/controllers/userController.ts',
    'src/middleware/auth.ts',
    'src/services/userService.ts',
    'src/models/user.ts',
    'package.json',
    'tsconfig.json'
  ];

  const allPaths = Array.from(new Set([...defaultPaths, ...folderStructure]));

  for (const relPath of allPaths) {
    const fullPath = path.join(projectDir, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, `// Implementation file: ${relPath}\n`, 'utf-8');
    }
  }

  return projectDir;
}

export function readSandboxFile(projectId: string, relativePath: string): string {
  const fullPath = getSandboxPath(projectId, relativePath);
  if (!fs.existsSync(fullPath)) {
    return '';
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

export function writeSandboxFile(projectId: string, relativePath: string, content: string): string {
  const fullPath = getSandboxPath(projectId, relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return fullPath;
}

export function listSandboxTree(projectId: string): { path: string; isFolder: boolean }[] {
  const projectDir = getSandboxPath(projectId);
  const result: { path: string; isFolder: boolean }[] = [];

  function walk(currentDir: string, relBase: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        result.push({ path: relPath, isFolder: true });
        walk(path.join(currentDir, entry.name), relPath);
      } else {
        result.push({ path: relPath, isFolder: false });
      }
    }
  }

  walk(projectDir, '');
  return result;
}

export function verifyCodeSyntax(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic AST / Syntax checks
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Mismatched curly braces: ${openBraces} opening vs ${closeBraces} closing braces.`);
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Mismatched parentheses: ${openParens} opening vs ${closeParens} closing parentheses.`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
