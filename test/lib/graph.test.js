import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createGraphDb } from '../../src/lib/graph/db.js';
import { discoverRuleFiles } from '../../src/lib/registry.js';
import { loadRule } from '../../src/lib/rule-model.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const standardsDir = join(rootDir, 'src', 'standards');

describe('registry', () => {
  it('should discover rule files', () => {
    const files = discoverRuleFiles(standardsDir);
    assert.ok(files.length > 0, 'Should find rule files');
    assert.ok(files.every(f => f.endsWith('.json')), 'All files should be JSON');
  });

  it('should find iso27001 rules', () => {
    const files = discoverRuleFiles(standardsDir);
    const iso27001 = files.filter(f => f.includes('iso27001'));
    assert.ok(iso27001.length > 0, 'Should find iso27001 rules');
  });
});

describe('graph', () => {
  const testDbPath = join(__dirname, 'test-graph.db');

  it('should create and close a graph database', async () => {
    const graph = await createGraphDb(testDbPath);
    assert.ok(graph);
    assert.ok(graph.insertRule);
    assert.ok(graph.getRule);
    assert.ok(graph.findByStandard);
    graph.close();
  });

  it('should index rules from standards directory', async () => {
    const files = discoverRuleFiles(standardsDir);
    if (files.length === 0) {
      console.log('Skipping index test: no rule files found');
      return;
    }

    const graph = await createGraphDb(testDbPath);
    graph.clearAll();

    let indexed = 0;
    let errors = 0;

    for (const file of files.slice(0, 10)) {
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

    assert.strictEqual(errors, 0, 'Should have no indexing errors');
    assert.ok(indexed > 0, 'Should have indexed some rules');
    graph.close();
  });

  it('should query rules by standard', async () => {
    const graph = await createGraphDb(testDbPath);
    const iso27001 = graph.findByStandard('iso27001');

    if (iso27001.length === 0) {
      console.log('Skipping query test: no iso27001 rules found');
      graph.close();
      return;
    }

    assert.ok(iso27001.length > 0);
    assert.ok(iso27001.every(r => r.standard === 'iso27001'));
    graph.close();
  });

  it('should count rules', async () => {
    const graph = await createGraphDb(testDbPath);
    const count = graph.count();
    assert.strictEqual(typeof count, 'number');
    assert.ok(count >= 0);
    graph.close();
  });
});