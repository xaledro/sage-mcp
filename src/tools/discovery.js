import { execCli } from '../lib/exec.js';
import { readState, writeState, initProjectDir } from '../lib/state.js';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

export async function runDiscovery({ projectPath, stacks, confidenceThreshold }) {
  const args = ['discover', projectPath];

  if (stacks && stacks.length > 0) {
    args.push('--stacks', stacks.join(','));
  }
  if (confidenceThreshold) {
    args.push('--confidence-threshold', String(confidenceThreshold));
  }

  const result = await execCli('@base/design-system', args, {
    cwd: projectPath,
    timeout: 5 * 60 * 1000
  });

  return {
    status: result.code === 0 ? 'success' : 'error',
    outputDir: `${projectPath}/ai/discovered`,
    summary: result.stdoutJson?.summary || parseSummaryFromOutput(result.stdout),
    errors: result.stderr ? [{ message: result.stderr }] : []
  };
}

export async function getDiscoveryStatus(projectPath) {
  const statusPath = join(projectPath, 'ai', 'discovered', 'discovery.status.json');

  if (existsSync(statusPath)) {
    const content = await readFile(statusPath, 'utf-8');
    return JSON.parse(content);
  }

  return {
    state: 'not_started',
    message: 'No discovery run found'
  };
}

export async function getDiscoveryResults(projectPath) {
  const results = {
    tokens: null,
    components: null,
    assets: null
  };

  const tokensPath = join(projectPath, 'ai', 'discovered', 'tokens.json');
  if (existsSync(tokensPath)) {
    const content = await readFile(tokensPath, 'utf-8');
    results.tokens = JSON.parse(content);
  }

  const componentsPath = join(projectPath, 'ai', 'discovered', 'components.json');
  if (existsSync(componentsPath)) {
    const content = await readFile(componentsPath, 'utf-8');
    results.components = JSON.parse(content);
  }

  const assetsPath = join(projectPath, 'ai', 'discovered', 'assets.json');
  if (existsSync(assetsPath)) {
    const content = await readFile(assetsPath, 'utf-8');
    results.assets = JSON.parse(content);
  }

  return results;
}

function parseSummaryFromOutput(stdout) {
  const lines = stdout.split('\n');
  const summary = {
    totalTokens: 0,
    totalComponents: 0,
    totalAssets: 0
  };

  for (const line of lines) {
    if (line.includes('Tokens:')) {
      const match = line.match(/Tokens:\s*(\d+)/);
      if (match) summary.totalTokens = parseInt(match[1]);
    }
    if (line.includes('Components:')) {
      const match = line.match(/Components:\s*(\d+)/);
      if (match) summary.totalComponents = parseInt(match[1]);
    }
    if (line.includes('Assets:')) {
      const match = line.match(/Assets:\s*(\d+)/);
      if (match) summary.totalAssets = parseInt(match[1]);
    }
  }

  return summary;
}