#!/usr/bin/env node
/**
 * validation/runner.js
 * Core validation runner that executes rules against a project
 */

import { createGraphDb } from '../graph/db.js';
import { discoverRuleFiles } from '../registry.js';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const VALIDATOR_MAP = {
  'wcag22': 'contrast',
  'wai-aria': 'aria',
  'w3c-tokens': 'tokens',
  'material3': 'tokens',
  'carbon': 'tokens',
  'gov-uk': 'tokens',
  'iso27001': 'secrets',
  'owasp-asvs': 'secrets',
  'iso20000': 'coverage'
};

export async function runValidation({ standard, ruleId, projectPath }) {
  const graph = await createGraphDb();
  const findings = [];

  try {
    let rules = [];
    
    if (ruleId) {
      const rule = graph.getRule(ruleId);
      if (rule) rules = [rule];
    } else if (standard) {
      rules = graph.query('SELECT * FROM rules WHERE standard = ?', [standard]);
    } else {
      rules = graph.query('SELECT * FROM rules WHERE validation_automated = 1');
    }

    for (const rule of rules) {
      const validatorType = VALIDATOR_MAP[rule.standard] || 'generic';
      const validator = await loadValidator(validatorType);
      
      if (validator && rule.validation_automated) {
        const result = await validator.validate(rule, projectPath);
        if (result) {
          findings.push({
            ruleId: rule.id,
            standard: rule.standard,
            status: result.status,
            message: result.message,
            location: result.location,
            severity: rule.severity
          });
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      projectPath,
      rulesChecked: rules.length,
      findings
    };
  } finally {
    graph.close();
  }
}

async function loadValidator(type) {
  try {
    const validators = {
      'contrast': () => import('./validators/contrast.js'),
      'aria': () => import('./validators/aria.js'),
      'tokens': () => import('./validators/tokens.js'),
      'secrets': () => import('./validators/secrets.js'),
      'coverage': () => import('./validators/coverage.js')
    };
    
    if (validators[type]) {
      const mod = await validators[type]();
      return mod.default || mod;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function generateReport({ projectPath, format = 'json' }) {
  const graph = await createGraphDb();
  
  try {
    const allRules = graph.query('SELECT * FROM rules WHERE validation_automated = 1');
    const findings = graph.query('SELECT * FROM validation_runs WHERE project_path = ?', [projectPath]);
    
    const summary = {
      totalRules: allRules.length,
      rulesWithFindings: findings.length,
      bySeverity: { critical: 0, warning: 0, info: 0 },
      byStandard: {}
    };

    for (const f of findings) {
      const sev = f.severity || 'warning';
      summary.bySeverity[sev] = (summary.bySeverity[sev] || 0) + 1;
      
      const std = f.standard;
      if (!summary.byStandard[std]) summary.byStandard[std] = 0;
      summary.byStandard[std]++;
    }

    if (format === 'markdown') {
      return generateMarkdownReport(summary, findings);
    }
    
    return { summary, findings };
  } finally {
    graph.close();
  }
}

function generateMarkdownReport(summary, findings) {
  let md = `# Validation Report\n\n`;
  md += `## Summary\n\n`;
  md += `- Total Rules: ${summary.totalRules}\n`;
  md += `- Rules with Findings: ${summary.rulesWithFindings}\n\n`;
  md += `### By Severity\n\n`;
  for (const [sev, count] of Object.entries(summary.bySeverity)) {
    md += `- ${sev}: ${count}\n`;
  }
  md += `\n### By Standard\n\n`;
  for (const [std, count] of Object.entries(summary.byStandard)) {
    md += `- ${std}: ${count}\n`;
  }
  return md;
}