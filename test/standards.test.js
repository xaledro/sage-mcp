import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getArc42Section } from '../src/tools/arc42.js';
import { getOwaspRequirements } from '../src/tools/owasp.js';
import { getIso42010View } from '../src/tools/iso42010.js';
import { getIso9241Checklist } from '../src/tools/iso9241.js';
import { getIso25010Model } from '../src/tools/iso25010.js';
import { getMaterialTokens } from '../src/tools/material.js';

describe('arc42', () => {
  it('should get section 1 template', () => {
    const result = getArc42Section(1);
    assert.ok(result);
    assert.equal(result.number, 1);
    assert.ok(result.content.includes('Introduction'));
  });

  it('should throw for invalid section', () => {
    assert.throws(() => getArc42Section(13), /Invalid arc42 section/);
  });
});

describe('owasp', () => {
  it('should get L1 requirements', () => {
    const result = getOwaspRequirements('L1');
    assert.ok(result);
    assert.equal(result.level, 'L1');
    assert.ok(result.categories.length > 0);
  });

  it('should throw for invalid level', () => {
    assert.throws(() => getOwaspRequirements('L4'), /Invalid ASVS level/);
  });
});

describe('iso42010', () => {
  it('should get logical view', () => {
    const result = getIso42010View('logical');
    assert.ok(result);
    assert.equal(result.name, 'Logical View');
  });

  it('should throw for invalid view', () => {
    assert.throws(() => getIso42010View('invalid'), /Unknown view/);
  });
});

describe('iso9241', () => {
  it('should get all categories when no category specified', () => {
    const result = getIso9241Checklist();
    assert.ok(result);
    assert.ok(result.categories);
    assert.equal(result.categories.length, 3);
  });

  it('should get effectiveness checklist', () => {
    const result = getIso9241Checklist('effectiveness');
    assert.equal(result.name, 'Effectiveness');
    assert.ok(result.criteria.length > 0);
  });
});

describe('iso25010', () => {
  it('should get quality model', () => {
    const result = getIso25010Model();
    assert.ok(result);
    assert.equal(result.totalCharacteristics, 8);
  });
});

describe('material', () => {
  it('should get MD3 tokens', () => {
    const result = getMaterialTokens();
    assert.ok(result);
    assert.ok(result.tokens.color);
    assert.ok(result.tokens.typography);
  });
});