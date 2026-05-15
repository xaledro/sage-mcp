import Ajv from 'ajv';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv({ allErrors: true, strict: false });

const standardRuleSchema = {
  $id: 'StandardRule',
  type: 'object',
  required: ['id', 'standard', 'version', 'category', 'title', 'description', 'severity', 'appliesTo', 'tags', 'implementation', 'validation', 'evidence', 'source'],
  properties: {
    id: { type: 'string', minLength: 3 },
    standard: { type: 'string', minLength: 1 },
    version: { type: 'string', minLength: 1 },
    category: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    appliesTo: {
      type: 'object',
      properties: {
        frontend: { type: 'boolean' },
        backend: { type: 'boolean' },
        mobile: { type: 'boolean' },
        ai: { type: 'boolean' },
        desktop: { type: 'boolean' },
        infrastructure: { type: 'boolean' }
      },
      additionalProperties: false
    },
    severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
    relatedStandards: { type: 'array', items: { type: 'string' }, default: [] },
    tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
    implementation: {
      type: 'object',
      properties: {
        patterns: { type: 'array', items: { type: 'string' }, default: [] },
        antiPatterns: { type: 'array', items: { type: 'string' }, default: [] },
        codeExamples: { type: 'array', items: { type: 'string' }, default: [] },
        tokens: { type: 'array', items: { type: 'string' }, default: [] }
      },
      additionalProperties: false
    },
    validation: {
      type: 'object',
      properties: {
        automated: { type: 'boolean' },
        manual: { type: 'boolean' },
        lint: { type: 'boolean' },
        validatorId: { type: 'string' }
      },
      additionalProperties: false
    },
    evidence: {
      type: 'object',
      properties: {
        requiredArtifacts: { type: 'array', items: { type: 'string' }, default: [] },
        generators: { type: 'array', items: { type: 'string' }, default: [] }
      },
      additionalProperties: false
    },
    context: {
      type: 'object',
      properties: {
        industries: { type: 'array', items: { type: 'string' }, default: [] },
        platforms: { type: 'array', items: { type: 'string' }, default: [] },
        criticality: { type: 'array', items: { type: 'string' }, default: [] }
      },
      additionalProperties: false
    },
    source: { type: 'string', minLength: 1 }
  },
  additionalProperties: false
};

const validateRule = ajv.compile(standardRuleSchema);

function loadRule(filePath) {
  if (!existsSync(filePath)) {
    return { valid: false, error: `File not found: ${filePath}` };
  }
  try {
    const content = readFileSync(filePath, 'utf-8');
    const rule = JSON.parse(content);
    const valid = validateRule(rule);
    if (!valid) {
      return { valid: false, error: ajv.errorsText(validateRule.errors), data: rule };
    }
    return { valid: true, rule };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

function validateRules(rules) {
  const errors = [];
  for (const rule of rules) {
    const valid = validateRule(rule);
    if (!valid) {
      errors.push({ id: rule.id || 'unknown', errors: ajv.errorsText(validateRule.errors) });
    }
  }
  return errors;
}

function createStandardRule(data) {
  const rule = {
    id: data.id,
    standard: data.standard,
    version: data.version || '1.0',
    category: data.category,
    title: data.title,
    description: data.description,
    appliesTo: data.appliesTo || {},
    severity: data.severity || 'warning',
    relatedStandards: data.relatedStandards || [],
    tags: data.tags || [],
    implementation: data.implementation || {},
    validation: data.validation || {},
    evidence: data.evidence || {},
    context: data.context || {},
    source: data.source || ''
  };
  return rule;
}

export { standardRuleSchema, validateRule, loadRule, validateRules, createStandardRule };