#!/usr/bin/env node
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexRules, rebuildGraph } from './indexer.js';
import { indexRelations, rebuildRelations } from './relations-indexer.js';
import { createGraphDb } from './db.js';
import { discoverRuleFiles } from '../registry.js';
import { loadRule } from '../rule-model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..', '..');
const standardsDir = join(rootDir, 'src', 'standards');
const relationsDir = join(standardsDir, '_relations');
const dbPath = join(rootDir, '.sage', 'graph.db');
const force = process.argv.includes('--force') || process.argv.includes('-f');
const relationsOnly = process.argv.includes('--relations-only');

async function indexAll() {
  if (force) {
    const graph = await createGraphDb(dbPath);
    graph.clearAll();
    graph.close();

    const rulesResult = await rebuildGraph(standardsDir, dbPath);
    console.error(`Rules: ${rulesResult.indexed} indexed, ${rulesResult.errors} errors`);

    const graph2 = await createGraphDb(dbPath);
    const files = discoverRuleFiles(standardsDir);
    const existingRules = [];
    for (const file of files) {
      const result = loadRule(file);
      if (result.valid) existingRules.push(result.rule);
    }

    const relResult = await rebuildRelations(relationsDir, graph2, existingRules);
    console.error(`Relations: ${relResult.indexed} indexed, ${relResult.errors} errors, ${relResult.skipped} skipped`);
    graph2.close();
  } else {
    const rulesResult = await indexRules(standardsDir, dbPath);
    console.error(`Rules: ${rulesResult.indexed} indexed, ${rulesResult.errors} errors`);

    const graph = await createGraphDb(dbPath);
    const files = discoverRuleFiles(standardsDir);
    const existingRules = [];
    for (const file of files) {
      const result = loadRule(file);
      if (result.valid) existingRules.push(result.rule);
    }

    const relResult = await indexRelations(graph, relationsDir, existingRules);
    console.error(`Relations: ${relResult.indexed} indexed, ${relResult.errors} errors, ${relResult.skipped} skipped`);
    graph.close();
  }
}

async function main() {
  if (relationsOnly) {
    const graph = await createGraphDb(dbPath);
    const files = discoverRuleFiles(standardsDir);
    const existingRules = [];
    for (const file of files) {
      const result = loadRule(file);
      if (result.valid) existingRules.push(result.rule);
    }

    if (force) {
      const relResult = await rebuildRelations(relationsDir, graph, existingRules);
      console.error(`Relations rebuilt: ${relResult.indexed} indexed, ${relResult.errors} errors, ${relResult.skipped} skipped`);
    } else {
      const relResult = await indexRelations(graph, relationsDir, existingRules);
      console.error(`Relations: ${relResult.indexed} indexed, ${relResult.errors} errors, ${relResult.skipped} skipped`);
    }
    graph.close();
  } else {
    await indexAll();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});