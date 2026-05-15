import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createGraphDb } from '../../src/lib/graph/db.js';
import { indexRules } from '../../src/lib/graph/indexer.js';
import { indexRelations } from '../../src/lib/graph/relations-indexer.js';
import { discoverRuleFiles } from '../../src/lib/registry.js';
import { loadRule } from '../../src/lib/rule-model.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const standardsDir = join(rootDir, 'src', 'standards');
const relationsDir = join(standardsDir, '_relations');

async function populateTestDb(graph) {
  graph.clearAll();

  const files = discoverRuleFiles(standardsDir);
  for (const file of files) {
    const result = loadRule(file);
    if (result.valid) {
      graph.insertRule(result.rule);
    }
  }

  const existingRules = [];
  for (const file of files) {
    const result = loadRule(file);
    if (result.valid) existingRules.push(result.rule);
  }

  await indexRelations(graph, relationsDir, existingRules);
}

describe('graph relations', () => {
  let graph;

  before(async () => {
const home = process.env.HOME || process.env.USERPROFILE || join(rootDir, '.sage');
const testDbPath = join(home, 'graph.db');

    graph = await createGraphDb(testDbPath);
    await populateTestDb(graph);
  });

  it('should have relations indexed', () => {
    const result = graph.db.exec('SELECT COUNT(*) as count FROM relations');
    const count = result[0].values[0][0];
    assert.ok(count > 0, `Should have relations indexed, found ${count}`);
  });

  it('should get related rules for iso42001-a1', () => {
    const related = graph.getRelated('iso42001.42001-a1');
    assert.ok(related.length > 0, 'Should find related rules, got: ' + related.length);
  });

  it('should find path between iso29110.gp-001 and iso27001.a5.1', () => {
    const path = graph.findPath('iso29110.gp-001', 'iso27001.a5.1', 5);
    assert.ok(path.length > 0, 'Should find path');
    assert.ok(path[0].rule, 'Path should have rule');
  });

  it('should return empty path when no connection exists', () => {
    const path = graph.findPath('iso42001.42001-a1', 'iso25010.adaptability', 3);
    assert.strictEqual(path.length, 0, 'No path should exist');
  });

  it('should find cluster by standard', () => {
    const cluster = graph.findCluster({ standard: 'iso27001' });
    assert.ok(cluster.length > 0, 'Should find iso27001 cluster, got: ' + cluster.length);
  });

  it('should export graph as json', () => {
    const export_ = graph.exportGraph({ format: 'json' });
    assert.ok(export_.rules, 'Should have rules');
    assert.ok(export_.relations, 'Should have relations');
  });

  it('should export graph as mermaid', () => {
    const mermaid = graph.exportGraph({ format: 'mermaid' });
    assert.ok(mermaid.includes('graph TD'), 'Should contain graph TD');
    assert.ok(mermaid.includes('-->'), 'Should contain relationships');
  });

  it('should export graph as dot', () => {
    const dot = graph.exportGraph({ format: 'dot' });
    assert.ok(dot.includes('digraph G'), 'Should contain digraph');
    assert.ok(dot.includes('->'), 'Should contain edges');
  });

  it('should find related with depth', () => {
    const related = graph.findRelated('iso42001.42001-a1', { depth: 2 });
    assert.ok(related.length > 0, 'Should find related at depth 2');
  });

  it('should find related with relationType filter', () => {
    const related = graph.findRelated('iso42001.42001-a1', { relationType: 'EXTENDS' });
    assert.ok(related.length > 0, 'Should find EXTENDS relations');
  });
});