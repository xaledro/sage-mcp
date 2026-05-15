import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RELATION_TYPES = ['IMPLEMENTS', 'EXTENDS', 'MAPS_TO', 'REQUIRES', 'CONFLICTS_WITH', 'RELATED'];

function loadRelationFiles(relationsDir) {
  const files = [];
  if (!existsSync(relationsDir)) return files;
  const entries = readdirSync(relationsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && extname(entry.name) === '.json') {
      files.push(join(relationsDir, entry.name));
    }
  }
  return files;
}

function loadRelationFile(filePath) {
  if (!existsSync(filePath)) {
    return { valid: false, error: `File not found: ${filePath}` };
  }
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return validateRelationsFile(data);
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

function validateRelationsFile(data) {
  if (!data.relations || !Array.isArray(data.relations)) {
    return { valid: false, error: 'Missing or invalid relations array' };
  }

  const errors = [];

  for (const rel of data.relations) {
    if (!rel.source) {
      errors.push('Relation missing source');
    }
    if (!rel.target) {
      errors.push('Relation missing target');
    }
    if (rel.relationType && !RELATION_TYPES.includes(rel.relationType)) {
      errors.push(`Invalid relationType: ${rel.relationType}`);
    }
    if (rel.weight !== undefined && (rel.weight < 0 || rel.weight > 1)) {
      errors.push(`Invalid weight: ${rel.weight} (must be 0-1)`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }

  return { valid: true, data };
}

function discoverRelationFiles(relationsDir) {
  return loadRelationFiles(relationsDir);
}

async function indexRelations(graph, relationsDir, existingRules) {
  const files = discoverRelationFiles(relationsDir);
  if (files.length === 0) {
    return { indexed: 0, errors: 0, skipped: 0 };
  }

  const validRuleIds = new Set(existingRules.map(r => r.id));
  let indexed = 0;
  let errors = 0;
  let skipped = 0;

  for (const file of files) {
    const result = loadRelationFile(file);
    if (!result.valid) {
      console.error(`Invalid relations file ${file}: ${result.error}`);
      errors++;
      continue;
    }

    for (const rel of result.data.relations) {
      if (!validRuleIds.has(rel.source)) {
        console.warn(`Skipping relation: source rule "${rel.source}" not found`);
        skipped++;
        continue;
      }
      if (!validRuleIds.has(rel.target)) {
        console.warn(`Skipping relation: target rule "${rel.target}" not found`);
        skipped++;
        continue;
      }

      try {
        graph.insertRelation(rel.source, rel.target, rel.relationType || 'RELATED', rel.weight || 1.0, rel.note || null);
        indexed++;
      } catch (e) {
        console.error(`Error inserting relation ${rel.source} -> ${rel.target}: ${e.message}`);
        errors++;
      }
    }
  }

  return { indexed, errors, skipped };
}

async function rebuildRelations(relationsDir, graph, existingRules) {
  console.log(`Rebuilding relations from ${relationsDir}...`);
  graph.db.run('DELETE FROM relations');

  return indexRelations(graph, relationsDir, existingRules);
}

export { loadRelationFile, validateRelationsFile, discoverRelationFiles, indexRelations, rebuildRelations };