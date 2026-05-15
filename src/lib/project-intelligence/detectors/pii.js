import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RUT_PATTERN = /\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b/gi;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /\b\+?56\s?[2-9]\s?\d{7,8}\b/g;
const RUN_PATTERN = /\b\d{7,8}-[\dkK]\b/g;

export function detectPii(cwd, options = {}) {
  const maxFiles = options.maxFiles || 200;
  const sampleLimit = options.sampleLimit || 10;

  const piiTypes = [];
  const files = [];
  const samples = [];

  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.sql', '.prisma'];

  const scannedFiles = scanDirectory(cwd, extensions, maxFiles);
  let count = 0;

  for (const filePath of scannedFiles) {
    if (count >= sampleLimit) break;

    try {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = filePath.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, '');

      const rutMatches = content.match(RUT_PATTERN) || [];
      const emailMatches = content.match(EMAIL_PATTERN) || [];
      const phoneMatches = content.match(PHONE_PATTERN) || [];
      const runMatches = content.match(RUN_PATTERN) || [];

      if (rutMatches.length > 0) {
        if (!piiTypes.includes('RUT')) piiTypes.push('RUT');
        files.push({ path: relativePath, type: 'RUT', count: rutMatches.length });
        samples.push({ type: 'RUT', sample: rutMatches[0], path: relativePath });
        count++;
      }

      if (emailMatches.length > 0) {
        if (!piiTypes.includes('email')) piiTypes.push('email');
        if (!files.find(f => f.path === relativePath && f.type === 'email')) {
          files.push({ path: relativePath, type: 'email', count: emailMatches.length });
          samples.push({ type: 'email', sample: emailMatches[0], path: relativePath });
          count++;
        }
      }

      if (phoneMatches.length > 0) {
        if (!piiTypes.includes('phone')) piiTypes.push('phone');
        if (!files.find(f => f.path === relativePath && f.type === 'phone')) {
          files.push({ path: relativePath, type: 'phone', count: phoneMatches.length });
          samples.push({ type: 'phone', sample: phoneMatches[0], path: relativePath });
          count++;
        }
      }

      if (runMatches.length > 0 && !rutMatches.includes(runMatches[0])) {
        if (!piiTypes.includes('RUN')) piiTypes.push('RUN');
        if (!files.find(f => f.path === relativePath && f.type === 'RUN')) {
          files.push({ path: relativePath, type: 'RUN', count: runMatches.length });
          samples.push({ type: 'RUN', sample: runMatches[0], path: relativePath });
          count++;
        }
      }
    } catch {
    }
  }

  if (piiTypes.length === 0) {
    return {
      available: false,
      reason: 'No PII patterns detected in sample scan',
      detected: false,
      types: [],
      files: [],
      samples: []
    };
  }

  return {
    available: true,
    detected: true,
    types: piiTypes,
    files,
    samples: samples.slice(0, sampleLimit),
    totalFilesScanned: scannedFiles.length,
    note: 'Sample scan (max ' + options.maxFiles + ' files). Results are indicative, not exhaustive.'
  };
}

function scanDirectory(dir, extensions, maxFiles) {
  const result = [];

  function scan(dirPath) {
    if (result.length >= maxFiles) return;

    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (result.length >= maxFiles) return;

        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = join(dirPath, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile()) {
          const ext = '.' + entry.name.split('.').pop();
          if (extensions.includes(ext)) {
            result.push(fullPath);
          }
        }
      }
    } catch {
    }
  }

  scan(dir);
  return result;
}