import { execCli } from '../lib/exec.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { paths } from '../lib/paths.js';

export async function runAudit({ projectPath, baseTokensPath }) {
  const args = ['audit', '--source', projectPath];

  const result = await execCli('@base/design-system', args, {
    cwd: projectPath,
    timeout: 2 * 60 * 1000
  });

  return {
    status: result.code === 0 ? 'success' : 'error',
    report: result.stdout || result.stderr,
    violations: parseViolations(result.stdout)
  };
}

export async function getAuditResults(projectPath) {
  const p = paths(projectPath);
  const auditReportPath = join(p.reportsDir, 'audit-report.md');
  const auditJsonPath = join(p.discoveredDir, 'audit-report.json');

  let report = null;
  let json = null;

  if (existsSync(auditReportPath)) {
    report = await readFile(auditReportPath, 'utf-8');
  }

  if (existsSync(auditJsonPath)) {
    json = JSON.parse(await readFile(auditJsonPath, 'utf-8'));
  }

  return { report, json };
}

function parseViolations(output) {
  const violations = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(/-\s*⚠️\s*\*\*([^\*]+)\*\*:\s*([^\=]+)\s*=\s*`([^`]+)`/);
    if (match) {
      violations.push({
        file: match[1].trim(),
        type: match[2].trim(),
        values: match[3].split(',').map(v => v.trim())
      });
    }
  }

  return violations;
}