import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function detectModules(cwd, options = {}) {
  const maxFiles = options.maxFiles || 5000;
  const modules = [];

  const candidates = [
    { path: 'src/modules', kind: 'modules' },
    { path: 'src/features', kind: 'features' },
    { path: 'src/components', kind: 'components' },
    { path: 'app', kind: 'app-router' },
    { path: 'src', kind: 'src-root' }
  ];

  for (const candidate of candidates) {
    const fullPath = join(cwd, candidate.path);
    if (!existsSync(fullPath)) continue;

    try {
      const entries = readdirSync(fullPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

        const entryPath = join(fullPath, entry.name);
        let fileCount = 0;

        try {
          fileCount = countFilesRecursive(entryPath, 0, maxFiles);
        } catch {
          fileCount = 0;
        }

        const hasReadme = existsSync(join(entryPath, 'README.md')) ||
                         existsSync(join(entryPath, 'readme.md'));

        modules.push({
          name: entry.name,
          path: candidate.path + '/' + entry.name,
          kind: candidate.kind,
          fileCount,
          hasReadme
        });
      }
    } catch {
      continue;
    }
  }

  if (modules.length === 0) {
    return {
      available: false,
      reason: 'No module directories found (src/modules, src/features, app, etc.)',
      modules: []
    };
  }

  return {
    available: true,
    modules,
    count: modules.length
  };
}

function countFilesRecursive(dir, current, max) {
  if (current >= max) return current;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    let count = current;

    for (const entry of entries) {
      if (count >= max) break;

      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('node_modules')) {
        count = countFilesRecursive(fullPath, count, max);
      } else if (entry.isFile()) {
        count++;
      }
    }

    return count;
  } catch {
    return current;
  }
}