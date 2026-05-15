import { describe, it } from 'node:test';
import assert from 'node:assert';
import { listRules, getRule, queryRules, auditRules } from '../../src/tools/v3/rules.js';

describe('rules tools', () => {
  it('should list rules', async () => {
    const result = await listRules({ standard: 'iso27001', limit: 5 });
    assert.ok(result.rules);
    assert.strictEqual(result.limit, 5);
    assert.ok(result.total > 0);
  });

  it('should get a single rule', async () => {
    const result = await getRule({ id: 'iso27001.a5.1' });
    assert.ok(result.rule);
    assert.strictEqual(result.rule.id, 'iso27001.a5.1');
    assert.strictEqual(result.rule.title, 'A.5.1 - Organizational Controls');
  });

  it('should return error for non-existent rule', async () => {
    const result = await getRule({ id: 'non.existent.rule' });
    assert.ok(result.error);
    assert.ok(result.error.includes('not found'));
  });

  it('should query rules by appliesTo', async () => {
    const result = await queryRules({ appliesTo: ['frontend'] });
    assert.ok(result.rules);
    assert.ok(result.rules.length > 0, 'Should find frontend rules');
    assert.ok(result.rules.every(r => r.appliesTo?.frontend));
  });

  it('should query rules by severity', async () => {
    const result = await queryRules({ severity: 'critical' });
    assert.ok(result.rules);
    assert.ok(result.rules.every(r => r.severity === 'critical'));
  });

  it('should query rules by tags', async () => {
    const result = await queryRules({ tags: ['security'] });
    assert.ok(result.rules);
    assert.ok(result.rules.every(r => r.tags?.includes('security')));
  });

  it('should audit rules by standard', async () => {
    const result = await auditRules({ standard: 'iso27001' });
    assert.ok(result.summary);
    assert.strictEqual(result.standard, 'iso27001');
    assert.ok(result.rulesTotal > 0);
    assert.ok(result.summary.iso27001);
    assert.strictEqual(result.summary.iso27001.total, 48);
  });

  it('should audit all standards', async () => {
    const result = await auditRules();
    assert.ok(result.standardsCovered > 1);
    assert.ok(result.categories.length > 0);
  });

  it('should list all rules and show multiple standards exist', async () => {
    const result = await listRules({ limit: 50 });
    const standards = [...new Set(result.rules.map(r => r.standard))];
    assert.ok(result.total > 0, 'Should have some rules');
    assert.ok(standards.length > 1, 'Should have rules from multiple standards, found: ' + standards.join(', '));
  });
});