#!/usr/bin/env node
/**
 * validation/runner.js
 * Core validation runner that executes rules against a project
 */

import { createGraphDb } from '../graph/db.js';
import { join } from 'node:path';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';

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

function getRuleValidation(rule) {
  if (!rule.validation) return {};
  if (typeof rule.validation === 'string') {
    try {
      return JSON.parse(rule.validation);
    } catch {
      return {};
    }
  }
  return rule.validation;
}

function isRuleAutomated(rule) {
  const validation = getRuleValidation(rule);
  return validation.automated === true;
}

function getAllAutomatedRules(graph) {
  const results = graph.db.exec('SELECT * FROM rules');
  if (results.length === 0) return [];
  
  const columns = results[0].columns;
  const rules = [];
  
  for (const values of results[0].values) {
    const obj = {};
    columns.forEach((col, i) => obj[col] = values[i]);
    rules.push(obj);
  }
  
  return rules.filter(rule => isRuleAutomated(rule));
}

function getRulesByStandard(graph, standard) {
  const results = graph.db.exec('SELECT * FROM rules WHERE standard = ?', [standard]);
  if (results.length === 0) return [];
  
  const columns = results[0].columns;
  const rules = [];
  
  for (const values of results[0].values) {
    const obj = {};
    columns.forEach((col, i) => obj[col] = values[i]);
    rules.push(obj);
  }
  
  return rules;
}

function hydrateRule(obj) {
  return {
    id: obj.id,
    standard: obj.standard,
    version: obj.version,
    category: obj.category,
    title: obj.title,
    description: obj.description,
    severity: obj.severity,
    appliesTo: obj.applies_to ? JSON.parse(obj.applies_to) : {},
    relatedStandards: obj.related_standards ? JSON.parse(obj.related_standards) : [],
    tags: obj.tags ? JSON.parse(obj.tags) : [],
    implementation: obj.implementation ? JSON.parse(obj.implementation) : {},
    validation: getRuleValidation(obj),
    evidence: obj.evidence ? JSON.parse(obj.evidence) : {},
    context: obj.context ? JSON.parse(obj.context) : {},
    source: obj.source
  };
}

export async function runValidation({ standard, ruleId, projectPath }) {
  const graph = await createGraphDb();
  const findings = [];

  try {
    let rules = [];
    
    if (ruleId) {
      const result = graph.db.exec('SELECT * FROM rules WHERE id = ?', [ruleId]);
      if (result.length > 0 && result[0].values.length > 0) {
        const columns = result[0].columns;
        const obj = {};
        columns.forEach((col, i) => obj[col] = result[0].values[0][i]);
        rules = [hydrateRule(obj)];
      }
    } else if (standard) {
      const rawRules = getRulesByStandard(graph, standard);
      rules = rawRules.map(hydrateRule);
    } else {
      const rawRules = getAllAutomatedRules(graph);
      rules = rawRules.map(hydrateRule);
    }

    for (const rule of rules) {
      const validatorType = VALIDATOR_MAP[rule.standard] || 'generic';
      const validator = await loadValidator(validatorType);
      
      if (validator && isRuleAutomated(rule)) {
        try {
          const result = await validator.validate(rule, projectPath);
          if (result && result.status === 'fail') {
            findings.push({
              ruleId: rule.id,
              standard: rule.standard,
              status: result.status,
              message: result.message,
              location: result.location || null,
              severity: rule.severity,
              findings: result.findings || []
            });
            
            recordValidationRun(graph, rule, projectPath, 'fail', result.findings);
          } else if (result && result.status === 'pass') {
            recordValidationRun(graph, rule, projectPath, 'pass', []);
          }
        } catch (e) {
          recordValidationRun(graph, rule, projectPath, 'error', [{ message: e.message }]);
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      projectPath: projectPath || process.cwd(),
      rulesChecked: rules.length,
      automatedRules: rules.filter(r => isRuleAutomated(r)).length,
      validatorsRan: new Set(rules.map(r => VALIDATOR_MAP[r.standard] || 'generic')).size,
      findings
    };
  } finally {
    graph.close();
  }
}

function recordValidationRun(graph, rule, projectPath, status, findings) {
  try {
    const findingsJson = JSON.stringify(findings || []);
    graph.db.run(
      `INSERT INTO validation_runs (rule_id, project_path, status, findings, executed_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [rule.id, projectPath, status, findingsJson]
    );
  } catch (e) {
    // ignore if table doesn't exist
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
    console.error(`Failed to load validator ${type}:`, e.message);
    return null;
  }
}

export async function generateReport({ projectPath, format = 'json', standard }) {
  const graph = await createGraphDb();
  
  try {
    let query = 'SELECT * FROM rules';
    const params = [];
    
    if (standard) {
      query += ' WHERE standard = ?';
      params.push(standard);
    }
    
    const results = graph.db.exec(query, params);
    if (results.length === 0) {
      return { summary: { totalRules: 0, byStandard: {} }, findings: [] };
    }
    
    const columns = results[0].columns;
    const allRules = results[0].values.map(values => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = values[i]);
      return hydrateRule(obj);
    });
    
    const automatedRules = allRules.filter(r => isRuleAutomated(r));
    
    const runResults = graph.db.exec(
      'SELECT * FROM validation_runs WHERE project_path = ? ORDER BY executed_at DESC',
      [projectPath]
    );
    
    const findings = [];
    const ruleFindingsMap = {};
    
    if (runResults.length > 0) {
      const runColumns = runResults[0].columns;
      for (const values of runResults[0].values) {
        const run = {};
        runColumns.forEach((col, i) => run[col] = values[i]);
        if (run.findings) {
          try {
            const parsed = JSON.parse(run.findings);
            if (parsed.length > 0) {
              ruleFindingsMap[run.rule_id] = parsed;
              findings.push({
                ruleId: run.rule_id,
                status: run.status,
                executedAt: run.executed_at,
                findings: parsed
              });
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }
    
    const summary = {
      totalRules: allRules.length,
      automatedRules: automatedRules.length,
      rulesWithFindings: Object.keys(ruleFindingsMap).length,
      byStandard: {},
      bySeverity: { critical: 0, warning: 0, info: 0 },
      byValidator: {}
    };
    
    for (const rule of allRules) {
      const std = rule.standard;
      if (!summary.byStandard[std]) {
        summary.byStandard[std] = { total: 0, automated: 0, findings: 0 };
      }
      summary.byStandard[std].total++;
      if (isRuleAutomated(rule)) {
        summary.byStandard[std].automated++;
      }
      if (ruleFindingsMap[rule.id]) {
        summary.byStandard[std].findings++;
      }
      
      const sev = rule.severity || 'info';
      summary.bySeverity[sev] = (summary.bySeverity[sev] || 0) + 1;
      
      const validatorType = VALIDATOR_MAP[std] || 'generic';
      if (!summary.byValidator[validatorType]) {
        summary.byValidator[validatorType] = 0;
      }
      if (isRuleAutomated(rule)) {
        summary.byValidator[validatorType]++;
      }
    }

    if (format === 'markdown') {
      return generateMarkdownReport(summary, findings, projectPath);
    }
    
    return { summary, findings, projectPath };
  } finally {
    graph.close();
  }
}

function generateMarkdownReport(summary, findings, projectPath) {
  let md = `# Validation Report\n\n`;
  md += `**Project:** ${projectPath}\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  md += `## Summary\n\n`;
  md += `- Total Rules: ${summary.totalRules}\n`;
  md += `- Automated Rules: ${summary.automatedRules}\n`;
  md += `- Rules with Findings: ${summary.rulesWithFindings}\n\n`;
  
  md += `### By Validator Type\n\n`;
  for (const [validator, count] of Object.entries(summary.byValidator)) {
    md += `- ${validator}: ${count} rules\n`;
  }
  
  md += `\n### By Standard\n\n`;
  for (const [std, data] of Object.entries(summary.byStandard)) {
    md += `- ${std}: ${data.total} rules (${data.automated} automated, ${data.findings} with findings)\n`;
  }
  
  md += `\n### By Severity\n\n`;
  for (const [sev, count] of Object.entries(summary.bySeverity)) {
    md += `- ${sev}: ${count}\n`;
  }
  
  if (findings.length > 0) {
    md += `\n## Findings\n\n`;
    for (const f of findings) {
      md += `### ${f.ruleId}\n\n`;
      md += `**Status:** ${f.status}\n`;
      md += `**Executed:** ${f.executedAt}\n\n`;
      for (const finding of f.findings) {
        md += `- ${finding.type || 'issue'}: ${finding.detail || finding.message || 'No details'}\n`;
        if (finding.location) {
          md += `  - Location: ${finding.location}\n`;
        }
      }
      md += '\n';
    }
  }
  
  return { content: md };
}