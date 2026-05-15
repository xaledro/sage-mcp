import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function detectAdrs(cwd) {
  const adrs = [];

  const candidates = [
    { path: 'docs/adr', pattern: /\.md$/ },
    { path: 'docs/decisions', pattern: /\.md$/ },
    { path: 'ai/decisions', pattern: /\.md$/ },
    { path: 'decisions', pattern: /\.md$/ },
    { path: '.adr', pattern: /\.md$/ }
  ];

  for (const candidate of candidates) {
    const fullPath = join(cwd, candidate.path);
    if (!existsSync(fullPath)) continue;

    try {
      const entries = readdirSync(fullPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !candidate.pattern.test(entry.name)) continue;

        const filePath = join(fullPath, entry.name);
        try {
          const content = readFileSync(filePath, 'utf-8');
          const parsed = parseAdr(content, entry.name);

          if (parsed) {
            adrs.push(parsed);
          }
        } catch {
        }
      }
    } catch {
    }
  }

  if (adrs.length === 0) {
    return {
      available: false,
      reason: 'No ADR files found (docs/adr, docs/decisions, ai/decisions)',
      adrs: []
    };
  }

  return {
    available: true,
    adrs,
    count: adrs.length
  };
}

function parseAdr(content, filename) {
  const lines = content.split('\n');
  let title = null;
  let status = 'proposed';
  let decision = '';
  let date = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# ') && !title) {
      title = line.replace(/^#\s*/, '').trim();
    }

    if (line.toLowerCase().startsWith('status:')) {
      status = line.split(':')[1].trim().toLowerCase().replace(/[\[\]]/g, '');
    }

    if (line.toLowerCase().startsWith('date:')) {
      date = line.split(':').slice(1).join(':').trim();
    }

    if (line.toLowerCase().startsWith('## decision') || line.toLowerCase().startsWith('## resolution')) {
      decision = lines.slice(i + 1, Math.min(i + 5, lines.length))
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'))
        .join(' ')
        .substring(0, 300);
    }
  }

  if (!title && !decision) {
    return null;
  }

  const idMatch = filename.match(/(\d+)/);
  const id = idMatch ? parseInt(idMatch[1]) : adrs.length + 1;

  return {
    id: String(id).padStart(4, '0'),
    title: title || filename.replace(/\.(md|MD)$/, ''),
    status,
    date,
    decision: decision.substring(0, 200),
    file: filename
  };
}