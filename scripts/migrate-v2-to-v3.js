#!/usr/bin/env node
/**
 * migrate-v2-to-v3.js
 *
 * Migrates client code from standards-mcp v2.0 to v3.0.
 * Performs best-effort transformations on JavaScript/TypeScript files.
 *
 * Usage:
 *   node scripts/migrate-v2-to-v3.js <path-to-files>
 *   node scripts/migrate-v2-to-v3.js ./src --dry-run
 *
 * Options:
 *   --dry-run    Show changes without modifying files
 *   --verbose    Show detailed transformation info
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const TOOL_MAPPINGS = {
  'standards.list': 'rules.list',
  'standards.activate': null,
  'arc42.section': (args) => `rules.get({ id: "arc42.s${args.section}" })`,
  'arc42.template': 'rules.list',
  'arc42.checklist': 'rules.audit',
  'owasp.requirements': 'rules.list',
  'owasp.verify': 'rules.audit',
  'iso29110.artefact': (args) => `rules.get({ id: "${args.id}" })`,
  'iso29110.phases': 'rules.list',
  'iso29110.products': 'rules.list',
  'iso42010.view': (args) => `rules.get({ id: "iso42010.${args.view}" })`,
  'iso42010.views': 'rules.list',
  'iso42010.diagram': 'graph.export',
  'iso9241.usabilityCheck': 'rules.list',
  'iso9241.measure': 'rules.query',
  'iso9241.categories': 'rules.list',
  'iso25010.qualityModel': 'rules.list',
  'iso25010.characteristic': (args) => `rules.get({ id: "iso25010.${args.characteristicId}" })`,
  'iso25010.subCharacteristic': 'rules.list',
  'iso27701.privacyCheck': 'rules.list',
  'iso27701.pia': 'rules.get',
  'iso27701.dpia': 'rules.get',
  'iso27001.controls': 'rules.list',
  'iso27001.soa': 'rules.audit',
  'iso27001.isms': 'rules.list',
  'iso20000.sla': 'rules.get',
  'iso20000.service': 'rules.list',
  'iso20000.process': 'rules.query',
  'iso42001.ethicalAI': 'rules.list',
  'iso42001.transparency': 'rules.query',
  'iso42001.accountability': 'rules.query',
  'material.tokens': 'rules.list',
  'requestInfo': null,
  'defaults.get': null,
  'generate': null,
  'status': 'rules.audit',
  'markGenerated': null,
  'discovery.run': null,
  'discovery.status': null,
  'discovery.results': null,
  'audit.run': 'validation.run',
  'audit.results': 'validation.report',
  'project.init': null,
  'report.gap': 'rules.audit'
};

const REPLACEMENTS = [
  { pattern: /callTool\s*\(\s*['"](standards\.list)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](arc42\.section)['"]/g, replacement: "rules.get" },
  { pattern: /callTool\s*\(\s*['"](arc42\.template)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](arc42\.checklist)['"]/g, replacement: "callTool('rules.audit')" },
  { pattern: /callTool\s*\(\s*['"](owasp\.requirements)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](owasp\.verify)['"]/g, replacement: "callTool('rules.audit')" },
  { pattern: /callTool\s*\(\s*['"](iso29110\.artefact)['"]/g, replacement: "callTool('rules.get')" },
  { pattern: /callTool\s*\(\s*['"](iso29110\.phases)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso29110\.products)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso42010\.view)['"]/g, replacement: "callTool('rules.get')" },
  { pattern: /callTool\s*\(\s*['"](iso42010\.views)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso9241\.usabilityCheck)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso25010\.qualityModel)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso25010\.characteristic)['"]/g, replacement: "callTool('rules.get')" },
  { pattern: /callTool\s*\(\s*['"](iso27701\.privacyCheck)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso27701\.pia)['"]/g, replacement: "callTool('rules.get')" },
  { pattern: /callTool\s*\(\s*['"](iso27701\.dpia)['"]/g, replacement: "callTool('rules.get')" },
  { pattern: /callTool\s*\(\s*['"](iso27001\.controls)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso27001\.soa)['"]/g, replacement: "callTool('rules.audit')" },
  { pattern: /callTool\s*\(\s*['"](iso20000\.sla)['"]/g, replacement: "callTool('rules.get')" },
  { pattern: /callTool\s*\(\s*['"](iso20000\.service)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](iso42001\.ethicalAI)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](material\.tokens)['"]/g, replacement: "callTool('rules.list')" },
  { pattern: /callTool\s*\(\s*['"](status)['"]/g, replacement: "callTool('rules.audit')" },
  { pattern: /callTool\s*\(\s*['"](report\.gap)['"]/g, replacement: "callTool('rules.audit')" },
  { pattern: /callTool\s*\(\s*['"](audit\.run)['"]/g, replacement: "callTool('validation.run')" },
  { pattern: /callTool\s*\(\s*['"](audit\.results)['"]/g, replacement: "callTool('validation.report')" },
  { pattern: /callTool\s*\(\s*['"]arc42\.section['"]\s*,\s*\{[^}]*section:\s*(\d+)/g, replacement: "{ id: 'arc42.s$1'" },
  { pattern: /callTool\s*\(\s*['"]iso42010\.view['"]\s*,\s*\{[^}]*view:\s*['"]([^'"]+)['"]/g, replacement: "{ id: 'iso42010.$1'" },
  { pattern: /callTool\s*\(\s*['"]iso25010\.characteristic['"]\s*,\s*\{[^}]*characteristicId:\s*['"]([^'"]+)['"]/g, replacement: "{ id: 'iso25010.$1'" },
];

function findFiles(dir, extensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs']) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.includes(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function migrateFile(filePath, dryRun = false, verbose = false) {
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return { changed: false, errors: [`Could not read file: ${filePath}`] };
  }

  let newContent = content;
  let changes = 0;

  for (const { pattern, replacement } of REPLACEMENTS) {
    if (pattern.test(newContent)) {
      changes++;
      newContent = newContent.replace(pattern, replacement);
    }
  }

  if (changes > 0) {
    if (verbose) console.log(`${filePath}: ${changes} change(s)`);
    if (!dryRun) {
      writeFileSync(filePath, newContent);
    }
    return { changed: true, changes };
  }

  return { changed: false, changes: 0 };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  const targetPath = args.find(a => !a.startsWith('--'));

  if (!targetPath) {
    console.log(`
Usage: node migrate-v2-to-v3.js <path> [options]

Options:
  --dry-run    Show changes without modifying files
  --verbose    Show detailed transformation info

Example:
  node scripts/migrate-v2-to-v3.js ./src --dry-run
  node scripts/migrate-v2-to-v3.js ./clients --verbose
`);
    process.exit(1);
  }

  console.log(`\nStandards-MCP v2.0 → v3.0 Migration Tool`);
  console.log(`Target: ${targetPath}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be written)' : 'LIVE (files will be modified)'}\n`);

  let files;
  try {
    const stat = statSync(targetPath);
    files = stat.isDirectory() ? findFiles(targetPath) : [targetPath];
  } catch (e) {
    console.error(`Error: ${targetPath} not found`);
    process.exit(1);
  }

  console.log(`Found ${files.length} file(s) to process\n`);

  let totalChanges = 0;
  let filesChanged = 0;
  let errors = [];

  for (const file of files) {
    const result = migrateFile(file, dryRun, verbose);
    if (result.errors.length > 0) {
      errors.push(...result.errors.map(e => `${file}: ${e}`));
    }
    if (result.changed) {
      filesChanged++;
      totalChanges += result.changes;
    }
  }

  console.log(`\nResults:`);
  console.log(`  Files processed: ${files.length}`);
  console.log(`  Files modified: ${filesChanged}`);
  console.log(`  Total transformations: ${totalChanges}`);

  if (errors.length > 0) {
    console.log(`\nErrors:`);
    errors.forEach(e => console.log(`  ${e}`));
  }

  if (dryRun) {
    console.log(`\nThis was a dry run. Run without --dry-run to apply changes.`);
  } else {
    console.log(`\nMigration complete. Please review changes and test thoroughly.`);
  }
}

main();