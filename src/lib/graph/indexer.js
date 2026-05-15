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
    console.log('No rule files found');
    return { indexed: 0, errors: 0 };
  }

  const fileHash = computeFilesHash(files);
  const currentCount = graph.count();

  if (currentCount > 0) {
    console.log(`Cache: ${currentCount} rules already indexed`);
  }

  console.log(`Indexing ${files.length} rule files...`);
  graph.clearAll();

  let errors = 0;
  let indexed = 0;

  for (const file of files) {
    const result = loadRule(file);
    if (result.valid) {
      try {
        graph.insertRule(result.rule);
        indexed++;
      } catch (e) {
        console.error(`Error inserting ${file}: ${e.message}`);
        errors++;
      }
    } else {
      console.error(`Invalid rule ${file}: ${result.error}`);
      errors++;
    }
  }
  graph.close();
  return { indexed, errors };
}

async function rebuildGraph(standardsDir, dbPath) {
  console.log('Forcing full rebuild of knowledge graph...');
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