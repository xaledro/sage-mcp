import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadRule, validateRules, createStandardRule } from '../../src/lib/rule-model.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const standardsDir = join(rootDir, 'src', 'standards');

describe('rule-model', () => {
  const validRule = {
    id: 'test.rule-1',
    standard: 'test',
    version: '1.0',
    category: 'testing',
    title: 'Test Rule',
    description: 'A test rule for validation',
    appliesTo: { frontend: true },
    severity: 'warning',
    relatedStandards: [],
    tags: ['test'],
    implementation: {},
    validation: { automated: false },
    evidence: { requiredArtifacts: [] },
    context: {},
    source: 'test://localhost'
  };

  it('should create a valid standard rule', () => {
    const rule = createStandardRule(validRule);
    assert.strictEqual(rule.id, 'test.rule-1');
    assert.strictEqual(rule.standard, 'test');
    assert.strictEqual(rule.title, 'Test Rule');
    assert.strictEqual(rule.severity, 'warning');
  });

  it('should validate a correct rule', () => {
    const result = loadRule(join(standardsDir, 'governance', 'iso27001', 'rules', 'iso27001.a5.1.json'));
    assert.strictEqual(result.valid, true);
    assert.ok(result.rule);
    assert.strictEqual(result.rule.id, 'iso27001.a5.1');
  });

  it('should reject a rule with missing required fields', () => {
    const rule = { ...validRule };
    delete rule.id;
    const errors = validateRules([rule]);
    assert.ok(errors.length > 0);
  });

  it('should report error for non-existent file', () => {
    const result = loadRule('/non/existent/path.json');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('not found'));
  });
});