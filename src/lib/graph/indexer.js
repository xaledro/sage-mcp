import { createHash } from 'node:crypto';
import { createGraphDb } from './db.js';
import { discoverRuleFiles } from '../registry.js';
import { loadRule } from '../rule-model.js';
import { readFileSync, statSync } from 'node:fs';

function computeFilesHash(files) {
  const hash = createHash('sha256');
  for (const file of files.sort()) {
    const mtime = statSync(file).mtimeMs;
    hash.update(`${file}:${mtime}`);
  }
  return hash.digest('hex').slice(0, 16);
}

async function indexRules(standardsDir, dbPath) {
  const graph = await createGraphDb(dbPath);

  const files = discoverRuleFiles(standardsDir);
  if (files.length === 0) {
    graph.close();
    return { indexed: 0, errors: 0 };
  }

  const currentCount = graph.count();
  if (currentCount >= files.length) {
    graph.close();
    return { indexed: currentCount, errors: 0 };
  }

  let errors = 0;
  let indexed = 0;

  for (const file of files) {
    const result = loadRule(file);
    if (result.valid) {
      try {
        graph.insertRule(result.rule);
        indexed++;
      } catch (e) {
        errors++;
      }
    } else {
      errors++;
    }
  }
  graph.close();
  return { indexed, errors };
}

async function rebuildGraph(standardsDir, dbPath) {
  const graph = await createGraphDb(dbPath);
  graph.clearAll();

  const files = discoverRuleFiles(standardsDir);
  let indexed = 0;
  let errors = 0;

  for (const file of files) {
    const result = loadRule(file);
    if (result.valid) {
      try {
        graph.insertRule(result.rule);
        indexed++;
      } catch (e) {
        errors++;
      }
    }
  }

  graph.close();
  return { indexed, errors };
}

export { indexRules, rebuildGraph, computeFilesHash };