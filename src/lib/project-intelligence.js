import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { cache } from './project-intelligence/cache.js';
import { detectStack } from './project-intelligence/detectors/stack.js';
import { detectModules } from './project-intelligence/detectors/modules.js';
import { detectBackend } from './project-intelligence/detectors/backend.js';
import { detectAdrs } from './project-intelligence/detectors/adrs.js';
import { detectPii } from './project-intelligence/detectors/pii.js';
import { detectTests } from './project-intelligence/detectors/tests.js';
import { detectAiUsage } from './project-intelligence/detectors/ai-usage.js';

export async function inspect(projectPath, options = {}) {
  const cwd = projectPath || process.cwd();
  const maxFiles = options.maxFiles || 5000;

  const cached = cache.get(cwd);
  if (cached && !options.force) {
    return cached;
  }

  const errors = [];

  let stack = { available: false, reason: 'not run' };
  let modules = { available: false, reason: 'not run' };
  let backend = { available: false, reason: 'not run' };
  let adrs = { available: false, reason: 'not run' };
  let pii = { available: false, reason: 'not run' };
  let tests = { available: false, reason: 'not run' };
  let aiUsage = { available: false, reason: 'not run' };

  try {
    stack = detectStack(cwd);
  } catch (e) {
    errors.push({ detector: 'stack', error: e.message });
    stack = { available: false, reason: e.message };
  }

  try {
    modules = detectModules(cwd, { maxFiles });
  } catch (e) {
    errors.push({ detector: 'modules', error: e.message });
    modules = { available: false, reason: e.message };
  }

  try {
    backend = detectBackend(cwd);
  } catch (e) {
    errors.push({ detector: 'backend', error: e.message });
    backend = { available: false, reason: e.message };
  }

  try {
    adrs = detectAdrs(cwd);
  } catch (e) {
    errors.push({ detector: 'adrs', error: e.message });
    adrs = { available: false, reason: e.message };
  }

  try {
    pii = detectPii(cwd, { maxFiles });
  } catch (e) {
    errors.push({ detector: 'pii', error: e.message });
    pii = { available: false, reason: e.message };
  }

  try {
    tests = detectTests(cwd);
  } catch (e) {
    errors.push({ detector: 'tests', error: e.message });
    tests = { available: false, reason: e.message };
  }

  try {
    aiUsage = detectAiUsage(cwd, { maxFiles });
  } catch (e) {
    errors.push({ detector: 'aiUsage', error: e.message });
    aiUsage = { available: false, reason: e.message };
  }

  const facts = {
    projectPath: cwd,
    scannedAt: new Date().toISOString(),
    stack,
    modules,
    backend,
    adrs,
    pii,
    tests,
    aiUsage,
    errors
  };

  cache.set(cwd, facts);
  return facts;
}

export function inspectSync(projectPath, options = {}) {
  const cwd = projectPath || process.cwd();
  const cached = cache.get(cwd);
  if (cached && !options.force) {
    return cached;
  }
  return {
    projectPath: cwd,
    scannedAt: new Date().toISOString(),
    stack: { available: false, reason: 'sync not supported' },
    modules: { available: false, reason: 'sync not supported' },
    backend: { available: false, reason: 'sync not supported' },
    adrs: { available: false, reason: 'sync not supported' },
    pii: { available: false, reason: 'sync not supported' },
    tests: { available: false, reason: 'sync not supported' },
    aiUsage: { available: false, reason: 'sync not supported' },
    errors: [{ detector: 'all', error: 'sync mode not supported, use await inspect()' }]
  };
}

export function getCached(projectPath) {
  return cache.get(projectPath || process.cwd());
}

export function clearCache(projectPath) {
  if (projectPath) {
    cache.delete(projectPath);
  } else {
    cache.clear();
  }
}