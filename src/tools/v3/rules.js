import { createGraphDb } from '../../lib/graph/db.js';

export async function listRules({ standard, category, severity, limit = 100, offset = 0 } = {}) {
  const graph = await createGraphDb();

  let results;
  if (standard) {
    results = graph.findByStandard(standard);
  } else if (category) {
    results = graph.findByCategory(category);
  } else if (severity) {
    results = graph.findBySeverity(severity);
  } else {
    results = [];
    for (const std of graph.listStandards()) {
      results.push(...graph.findByStandard(std));
    }
  }

  graph.close();

  const total = results.length;
  const paginated = results.slice(Number(offset), Number(offset) + Number(limit));

  return {
    rules: paginated.map(rule => ({
      id: rule.id,
      standard: rule.standard,
      version: rule.version,
      category: rule.category,
      title: rule.title,
      severity: rule.severity,
      tags: rule.tags
    })),
    total,
    limit: Number(limit),
    offset: Number(offset)
  };
}

export async function getRule({ id }) {
  const graph = await createGraphDb();
  const rule = graph.getRule(id);
  const related = rule ? graph.getRelated(id) : [];
  graph.close();

  if (!rule) {
    return { error: `Rule not found: ${id}` };
  }

  return {
    rule,
    related: related.map(r => ({
      id: r.id,
      title: r.title,
      standard: r.standard,
      relationType: r.relationType,
      weight: r.weight
    }))
  };
}

export async function queryRules({ appliesTo, severity, tags, standard } = {}) {
  const graph = await createGraphDb();

  let results = [];
  for (const std of graph.listStandards()) {
    results.push(...graph.findByStandard(std));
  }

  graph.close();

  if (severity) {
    results = results.filter(r => r.severity === severity);
  }

  if (standard) {
    results = results.filter(r => r.standard === standard);
  }

  if (appliesTo && appliesTo.length > 0) {
    results = results.filter(r => {
      for (const target of appliesTo) {
        if (r.appliesTo && r.appliesTo[target]) return true;
      }
      return false;
    });
  }

  if (tags && tags.length > 0) {
    results = results.filter(r => {
      for (const tag of tags) {
        if (r.tags && r.tags.includes(tag)) return true;
      }
      return false;
    });
  }

  return {
    rules: results.map(rule => ({
      id: rule.id,
      standard: rule.standard,
      version: rule.version,
      category: rule.category,
      title: rule.title,
      severity: rule.severity,
      tags: rule.tags,
      appliesTo: rule.appliesTo
    })),
    total: results.length
  };
}

export async function auditRules({ standard, projectPath } = {}) {
  const graph = await createGraphDb();

  let rules = [];
  if (standard) {
    rules = graph.findByStandard(standard);
  } else {
    for (const std of graph.listStandards()) {
      rules.push(...graph.findByStandard(std));
    }
  }

  const standards = [...new Set(rules.map(r => r.standard))];

  graph.close();

  const summary = {};
  for (const std of standards) {
    const stdRules = rules.filter(r => r.standard === std);
    summary[std] = {
      total: stdRules.length,
      bySeverity: {
        critical: stdRules.filter(r => r.severity === 'critical').length,
        warning: stdRules.filter(r => r.severity === 'warning').length,
        info: stdRules.filter(r => r.severity === 'info').length
      }
    };
  }

  return {
    standard: standard || 'all',
    projectPath: projectPath || process.cwd(),
    rulesTotal: rules.length,
    standardsCovered: standards.length,
    summary,
    categories: [...new Set(rules.map(r => r.category))]
  };
}