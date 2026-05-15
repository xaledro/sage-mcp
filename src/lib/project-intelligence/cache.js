import { statSync } from 'node:fs';

const cacheMap = new Map();

function getMtime(projectPath) {
  try {
    return statSync(projectPath).mtimeMs;
  } catch {
    return null;
  }
}

function getCacheKey(projectPath) {
  return projectPath;
}

export const cache = {
  get(projectPath) {
    const key = getCacheKey(projectPath);
    const entry = cacheMap.get(key);
    if (!entry) return null;

    const mtime = getMtime(projectPath);
    if (mtime && entry.mtime !== mtime) {
      cacheMap.delete(key);
      return null;
    }

    return entry.facts;
  },

  set(projectPath, facts) {
    const key = getCacheKey(projectPath);
    const mtime = getMtime(projectPath);
    cacheMap.set(key, { facts, mtime });
  },

  delete(projectPath) {
    const key = getCacheKey(projectPath);
    cacheMap.delete(key);
  },

  clear() {
    cacheMap.clear();
  }
};

export function getCacheSize() {
  return cacheMap.size;
}