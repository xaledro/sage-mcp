import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getArc42Section } from '../src/tools/arc42.js';
import { getOwaspRequirements } from '../src/tools/owasp.js';
import { getIso42010View } from '../src/tools/iso42010.js';
import { getIso9241Checklist } from '../src/tools/iso9241.js';
import { getIso25010Model } from '../src/tools/iso25010.js';
import { getMaterialTokens } from '../src/tools/material.js';
import { getPrivacyCheck, getPiaTemplate, getDpiaTemplate } from '../src/tools/iso27701.js';
import { getControls, getSoaTemplate, getIsmsFramework } from '../src/tools/iso27001.js';
import { getServiceLevelAgreement, getServiceDefinition, getProcessDocumentation } from '../src/tools/iso20000.js';
import { getEthicalAICriteria, getTransparencyFramework, getAccountabilityMechanisms } from '../src/tools/iso42001.js';

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

describe('iso27701', () => {
  it('should get overview of privacy categories', () => {
    const result = getPrivacyCheck();
    assert.ok(result);
    assert.equal(result.standard, 'ISO/IEC 27701:2019');
    assert.ok(result.categories);
    assert.equal(result.categories.length, 4);
  });

  it('should get PII principles category', () => {
    const result = getPrivacyCheck('pII-principles');
    assert.equal(result.name, 'PII Processing Principles');
    assert.ok(result.criteria);
    assert.equal(result.criteria.length, 7);
  });

  it('should throw for invalid category', () => {
    assert.throws(() => getPrivacyCheck('invalid'), /Invalid category/);
  });

  it('should generate PIA template', () => {
    const result = getPiaTemplate('Employee attendance tracking', ['RUT', 'email', 'name'], 'Track employee presence', 'contract', ['HR System']);
    assert.ok(result);
    assert.equal(result.type, 'Privacy Impact Assessment (PIA)');
    assert.ok(result.sections);
    assert.ok(result.sections.length >= 4);
  });

  it('should generate DPIA template', () => {
    const result = getDpiaTemplate('biometric', 'high', false);
    assert.ok(result);
    assert.equal(result.type, 'Data Protection Impact Assessment (DPIA)');
    assert.ok(result.requiresDPIA);
  });
});

describe('iso27001', () => {
  it('should get overview of control themes', () => {
    const result = getControls();
    assert.ok(result);
    assert.equal(result.standard, 'ISO/IEC 27001:2022');
    assert.equal(result.totalControls, 93);
    assert.ok(result.themes);
    assert.equal(result.themes.length, 4);
  });

  it('should get organizational controls', () => {
    const result = getControls('organizational');
    assert.equal(result.name, 'Organizational Controls');
    assert.ok(result.controls);
    assert.equal(result.controls.length, 20);
  });

  it('should throw for invalid theme', () => {
    assert.throws(() => getControls('invalid'), /Invalid theme/);
  });

  it('should get SOA template', () => {
    const result = getSoaTemplate();
    assert.ok(result);
    assert.equal(result.type, 'Statement of Applicability (SoA)');
  });

  it('should get ISMS framework', () => {
    const result = getIsmsFramework();
    assert.ok(result);
    assert.equal(result.type, 'Information Security Management System (ISMS)');
    assert.ok(result.phases);
    assert.equal(result.phases.length, 6);
  });
});

describe('iso20000', () => {
  it('should get SLA types overview', () => {
    const result = getServiceLevelAgreement();
    assert.ok(result);
    assert.equal(result.standard, 'ISO/IEC 20000-1:2018');
    assert.ok(result.types);
    assert.equal(result.types.length, 3);
  });

  it('should get availability SLA', () => {
    const result = getServiceLevelAgreement('availability');
    assert.equal(result.type, 'Availability SLA');
    assert.ok(result.metrics);
  });

  it('should throw for invalid SLA type', () => {
    assert.throws(() => getServiceLevelAgreement('invalid'), /Invalid SLA type/);
  });

  it('should get service definitions overview', () => {
    const result = getServiceDefinition();
    assert.ok(result);
    assert.ok(result.types);
    assert.equal(result.types.length, 3);
  });

  it('should get software development service', () => {
    const result = getServiceDefinition('software-development');
    assert.equal(result.name, 'Software Development Service');
    assert.ok(result.components);
    assert.ok(result.metrics);
  });

  it('should get process documentation', () => {
    const result = getProcessDocumentation();
    assert.ok(result);
    assert.ok(result.processes);
  });
});

describe('iso42001', () => {
  it('should get ethical AI categories overview', () => {
    const result = getEthicalAICriteria();
    assert.ok(result);
    assert.equal(result.standard, 'ISO/IEC 42001:2023');
    assert.ok(result.categories);
    assert.equal(result.categories.length, 3);
  });

  it('should get fairness criteria', () => {
    const result = getEthicalAICriteria('fairness');
    assert.equal(result.name, 'Fairness and Non-discrimination');
    assert.ok(result.checks);
  });

  it('should throw for invalid category', () => {
    assert.throws(() => getEthicalAICriteria('invalid'), /Invalid category/);
  });

  it('should get transparency framework', () => {
    const result = getTransparencyFramework();
    assert.ok(result);
    assert.equal(result.type, 'AI Transparency Framework');
    assert.ok(result.principles);
    assert.ok(result.maturityLevels);
  });

  it('should get accountability areas overview', () => {
    const result = getAccountabilityMechanisms();
    assert.ok(result);
    assert.ok(result.areas);
    assert.equal(result.areas.length, 4);
  });

  it('should get incident accountability', () => {
    const result = getAccountabilityMechanisms('incident');
    assert.equal(result.area, 'AI Incident Response Accountability');
    assert.ok(result.mechanisms);
    assert.ok(result.requiredDocumentation);
  });

  it('should throw for invalid area', () => {
    assert.throws(() => getAccountabilityMechanisms('invalid'), /Invalid accountability area/);
  });
});