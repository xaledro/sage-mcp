import initSqlJs from 'sql.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let SQL;

async function initSql() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

function getDefaultDbPath() {
  const home = process.env.HOME || process.env.USERPROFILE || '/tmp';
  return join(home, '.standards-mcp', 'graph.db');
}

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function initDb(dbPath) {
  const path = dbPath || getDefaultDbPath();
  ensureDir(path);

  const sql = await initSql();
  let db;

  if (existsSync(path)) {
    const buffer = readFileSync(path);
    db = new sql.Database(buffer);
  } else {
    db = new sql.Database();
  }

  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.run(schema);

  return { db, path, sql };
}

function hydrateRule(row) {
  return {
    id: row.id,
    standard: row.standard,
    version: row.version,
    category: row.category,
    title: row.title,
    description: row.description,
    severity: row.severity,
    appliesTo: JSON.parse(row.applies_to || '{}'),
    relatedStandards: JSON.parse(row.related_standards || '[]'),
    tags: JSON.parse(row.tags || '[]'),
    implementation: JSON.parse(row.implementation || '{}'),
    validation: JSON.parse(row.validation || '{}'),
    evidence: JSON.parse(row.evidence || '{}'),
    context: JSON.parse(row.context || '{}'),
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function createGraphDb(dbPath) {
  const { db, path } = await initDb(dbPath);

  function saveDb() {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(path, buffer);
  }

  return {
    db,
    path,

    insertRule(rule) {
      db.run(`
        INSERT OR REPLACE INTO rules (id, standard, version, category, title, description, severity, applies_to, related_standards, tags, implementation, validation, evidence, context, source, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        rule.id,
        rule.standard,
        rule.version || '',
        rule.category || '',
        rule.title,
        rule.description,
        rule.severity || 'warning',
        JSON.stringify(rule.appliesTo || {}),
        JSON.stringify(rule.relatedStandards || []),
        JSON.stringify(rule.tags || []),
        JSON.stringify(rule.implementation || {}),
        JSON.stringify(rule.validation || {}),
        JSON.stringify(rule.evidence || {}),
        JSON.stringify(rule.context || {}),
        rule.source || ''
      ]);
      saveDb();
    },

    insertRelation(sourceRule, targetRule, relationType, weight = 1.0, note = null) {
      db.run(`
        INSERT INTO relations (source_rule, target_rule, relation_type, weight, note)
        VALUES (?, ?, ?, ?, ?)
      `, [sourceRule, targetRule, relationType, weight, note]);
      saveDb();
    },

    getRule(id) {
      const results = db.exec('SELECT * FROM rules WHERE id = ?', [id]);
      if (results.length === 0 || results[0].values.length === 0) return null;
      const row = results[0];
      const columns = row.columns;
      const values = row.values[0];
      const obj = {};
      columns.forEach((col, i) => obj[col] = values[i]);
      return hydrateRule(obj);
    },

    findByStandard(standard) {
      const results = db.exec('SELECT * FROM rules WHERE standard = ?', [standard]);
      if (results.length === 0) return [];
      const row = results[0];
      const columns = row.columns;
      return row.values.map(values => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = values[i]);
        return hydrateRule(obj);
      });
    },

    findByCategory(category) {
      const results = db.exec('SELECT * FROM rules WHERE category = ?', [category]);
      if (results.length === 0) return [];
      const row = results[0];
      const columns = row.columns;
      return row.values.map(values => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = values[i]);
        return hydrateRule(obj);
      });
    },

    findBySeverity(severity) {
      const results = db.exec('SELECT * FROM rules WHERE severity = ?', [severity]);
      if (results.length === 0) return [];
      const row = results[0];
      const columns = row.columns;
      return row.values.map(values => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = values[i]);
        return hydrateRule(obj);
      });
    },

    getRelated(id) {
      const results = db.exec(`
        SELECT r.*, rel.relation_type, rel.weight, rel.note FROM rules r
        JOIN relations rel ON r.id = rel.target_rule
        WHERE rel.source_rule = ?
        UNION ALL
        SELECT r.*, rel.relation_type, rel.weight, rel.note FROM rules r
        JOIN relations rel ON r.id = rel.source_rule
        WHERE rel.target_rule = ?
      `, [id, id]);
      if (results.length === 0) return [];
      const row = results[0];
      const columns = row.columns;
      return row.values.map(values => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = values[i]);
        return {
          ...hydrateRule(obj),
          relationType: obj.relation_type,
          weight: obj.weight,
          note: obj.note
        };
      });
    },

    findRelated(ruleId, { depth = 1, relationType = null } = {}) {
      const visited = new Set();
      const results = [];
      const queue = [{ ruleId, currentDepth: 0, path: [] }];

      while (queue.length > 0) {
        const { ruleId: currentId, currentDepth, path } = queue.shift();

        if (visited.has(currentId)) continue;
        visited.add(currentId);

        if (currentDepth > 0) {
          const rule = this.getRule(currentId);
          if (rule) {
            results.push({ rule, depth: currentDepth, path });
          }
        }

        if (currentDepth >= depth) continue;

        const relations = db.exec(`
          SELECT target_rule as tid, relation_type, weight, note FROM relations
          WHERE source_rule = ?
          ${relationType ? 'AND relation_type = ?' : ''}
          UNION ALL
          SELECT source_rule as tid, relation_type, weight, note FROM relations
          WHERE target_rule = ?
          ${relationType ? 'AND relation_type = ?' : ''}
        `, relationType ? [currentId, relationType, currentId, relationType] : [currentId, currentId]);

        if (relations.length > 0) {
          for (const rel of relations[0].values) {
            const [tid, type, weight, note] = rel;
            if (!visited.has(tid)) {
              queue.push({
                ruleId: tid,
                currentDepth: currentDepth + 1,
                path: [...path, { relationType: type, weight, note }]
              });
            }
          }
        }
      }

      return results;
    },

    findPath(from, to, maxDepth = 5) {
      if (from === to) return [{ rule: this.getRule(from), path: [] }];

      const visited = new Set();
      const queue = [{ ruleId: from, depth: 0, path: [] }];

      while (queue.length > 0) {
        const { ruleId: currentId, depth, path } = queue.shift();

        if (visited.has(currentId)) continue;
        visited.add(currentId);

        if (depth >= maxDepth) continue;

        const relations = db.exec(`
          SELECT target_rule, relation_type, weight, note FROM relations WHERE source_rule = ?
          UNION ALL
          SELECT source_rule, relation_type, weight, note FROM relations WHERE target_rule = ?
        `, [currentId, currentId]);

        if (relations.length > 0) {
          for (const rel of relations[0].values) {
            const [tid, type, weight, note] = rel;
            const newPath = [...path, { relationType: type, weight, note }];

            if (tid === to) {
              const targetRule = this.getRule(to);
              return [{ rule: targetRule, path: newPath }];
            }

            if (!visited.has(tid)) {
              queue.push({ ruleId: tid, depth: depth + 1, path: newPath });
            }
          }
        }
      }

      return [];
    },

    findCluster({ tag = null, standard = null } = {}) {
      let query = 'SELECT DISTINCT id FROM rules WHERE 1=1';
      const params = [];

      if (standard) {
        query += ' AND standard = ?';
        params.push(standard);
      }

      if (tag) {
        query += ' AND tags LIKE ?';
        params.push(`%${tag}%`);
      }

      const results = db.exec(query, params);
      if (results.length === 0) return [];

      const ruleIds = results[0].values.map(r => r[0]);

      const relationsQuery = `
        SELECT DISTINCT source_rule, target_rule FROM relations
        WHERE source_rule IN (${ruleIds.map(() => '?').join(',')})
        OR target_rule IN (${ruleIds.map(() => '?').join(',')})
      `;
      const relResults = db.exec(relationsQuery, [...ruleIds, ...ruleIds]);

      if (relResults.length === 0) {
        return ruleIds.map(id => ({ rule: this.getRule(id), connections: [] }));
      }

      const connectedIds = new Set();
      for (const rel of relResults[0].values) {
        connectedIds.add(rel[0]);
        connectedIds.add(rel[1]);
      }

      return [...connectedIds].map(id => {
        const rule = this.getRule(id);
        const connections = relResults[0].values
          .filter(r => r[0] === id || r[1] === id)
          .map(r => ({ relatedId: r[0] === id ? r[1] : r[0] }));
        return { rule, connections };
      });
    },

    exportGraph({ format = 'json', standard = null } = {}) {
      let rules = [];
      for (const std of this.listStandards()) {
        if (standard && std !== standard) continue;
        rules.push(...this.findByStandard(std));
      }

      const relations = db.exec('SELECT * FROM relations');
      const rels = relations.length > 0 ? relations[0].values.map(row => {
        const cols = relations[0].columns;
        const obj = {};
        cols.forEach((c, i) => obj[c] = row[i]);
        return obj;
      }) : [];

      if (format === 'mermaid') {
        let mermaid = 'graph TD\n';
        for (const rule of rules) {
          mermaid += `  ${rule.id.replace(/[^a-zA-Z0-9]/g, '_')}["${rule.title}"]\n`;
        }
        for (const rel of rels) {
          const source = rel.source_rule.replace(/[^a-zA-Z0-9]/g, '_');
          const target = rel.target_rule.replace(/[^a-zA-Z0-9]/g, '_');
          mermaid += `  ${source} -->|"${rel.relation_type}"| ${target}\n`;
        }
        return mermaid;
      }

      if (format === 'dot') {
        let dot = 'digraph G {\n  rankdir=LR;\n';
        for (const rule of rules) {
          dot += `  "${rule.id}" [label="${rule.title}" shape=box];\n`;
        }
        for (const rel of rels) {
          dot += `  "${rel.source_rule}" -> "${rel.target_rule}" [label="${rel.relation_type}"];\n`;
        }
        dot += '}\n';
        return dot;
      }

      return { rules, relations: rels };
    },

    count() {
      const result = db.exec('SELECT COUNT(*) as count FROM rules');
      return result.length > 0 ? result[0].values[0][0] : 0;
    },

    listStandards() {
      const result = db.exec('SELECT DISTINCT standard FROM rules ORDER BY standard');
      if (result.length === 0) return [];
      return result[0].values.map(r => r[0]);
    },

    listCategories() {
      const result = db.exec('SELECT DISTINCT category FROM rules ORDER BY category');
      if (result.length === 0) return [];
      return result[0].values.map(r => r[0]);
    },

    clearAll() {
      db.run('DELETE FROM relations');
      db.run('DELETE FROM evidence_records');
      db.run('DELETE FROM validation_runs');
      db.run('DELETE FROM rules');
      saveDb();
    },

    close() {
      saveDb();
      db.close();
    }
  };
}

export { createGraphDb, getDefaultDbPath };