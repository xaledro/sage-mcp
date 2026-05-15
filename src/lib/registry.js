import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { loadRule } from './rule-model.js';

function discoverRuleFiles(standardsDir) {
  const files = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('_')) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(full);
      } else if (extname(entry.name) === '.json') {
        files.push(full);
      }
    }
  }
  walk(standardsDir);
  return files;
}

function loadAllRules(standardsDir) {
  const files = discoverRuleFiles(standardsDir);
  const rules = [];
  const errors = [];

  for (const file of files) {
    const result = loadRule(file);
    if (result.valid) {
      rules.push(result.rule);
    } else {
      errors.push({ file, error: result.error });
    }
  }

  return { rules, errors, count: rules.length };
}

function createRegistry(standardsDir) {
  const { rules, errors, count } = loadAllRules(standardsDir);

  return {
    rules,
    errors,
    count,
    findByStandard(standard) {
      return rules.filter(r => r.standard === standard);
    },
    findByCategory(category) {
      return rules.filter(r => r.category === category);
    },
    findBySeverity(severity) {
      return rules.filter(r => r.severity === severity);
    },
    findByTag(tag) {
      return rules.filter(r => r.tags.includes(tag));
    },
    findById(id) {
      return rules.find(r => r.id === id);
    },
    query(filters = {}) {
      let result = [...rules];
      if (filters.standard) result = result.filter(r => r.standard === filters.standard);
      if (filters.category) result = result.filter(r => r.category === filters.category);
      if (filters.severity) result = result.filter(r => r.severity === filters.severity);
      if (filters.tag) result = result.filter(r => r.tags.includes(filters.tag));
      if (filters.appliesTo) {
        const { frontend, backend, mobile, ai, desktop, infrastructure } = filters.appliesTo;
        result = result.filter(r => {
          const at = r.appliesTo || {};
          if (frontend !== undefined && at.frontend !== frontend) return false;
          if (backend !== undefined && at.backend !== backend) return false;
          if (mobile !== undefined && at.mobile !== mobile) return false;
          if (ai !== undefined && at.ai !== ai) return false;
          if (desktop !== undefined && at.desktop !== desktop) return false;
          if (infrastructure !== undefined && at.infrastructure !== infrastructure) return false;
          return true;
        });
      }
      return result;
    },
    listStandards() {
      return [...new Set(rules.map(r => r.standard))];
    },
    listCategories() {
      return [...new Set(rules.map(r => r.category))];
    }
  };
}

export { createRegistry, loadAllRules, discoverRuleFiles };