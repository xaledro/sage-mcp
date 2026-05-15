import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function detectTests(cwd) {
  const result = {
    available: false,
    framework: null,
    coverage: null,
    e2eFramework: null,
    errors: []
  };

  if (existsSync(join(cwd, 'vitest.config'))) {
    result.framework = { id: 'vitest', confidence: 'high' };
    result.available = true;
  } else if (existsSync(join(cwd, 'jest.config'))) {
    result.framework = { id: 'jest', confidence: 'high' };
    result.available = true;
  } else if (existsSync(join(cwd, 'jest.config.js')) || existsSync(join(cwd, 'jest.config.ts'))) {
    result.framework = { id: 'jest', confidence: 'medium' };
    result.available = true;
  }

  const coveragePath = join(cwd, 'coverage', 'coverage-summary.json');
  if (existsSync(coveragePath)) {
    try {
      const content = readFileSync(coveragePath, 'utf-8');
      const data = JSON.parse(content);
      result.coverage = {
        lines: data.total?.lines?.pct || 0,
        branches: data.total?.branches?.pct || 0,
        functions: data.total?.functions?.pct || 0,
        statements: data.total?.statements?.pct || 0
      };
    } catch {
      result.errors.push('Failed to parse coverage-summary.json');
    }
  }

  if (existsSync(join(cwd, 'playwright.config'))) {
    result.e2eFramework = { id: 'playwright', confidence: 'high' };
  } else if (existsSync(join(cwd, 'cypress.config'))) {
    result.e2eFramework = { id: 'cypress', confidence: 'high' };
  } else if (existsSync(join(cwd, 'cypress.json'))) {
    result.e2eFramework = { id: 'cypress', confidence: 'medium' };
  }

  if (!result.available && !result.coverage && !result.e2eFramework) {
    return {
      available: false,
      reason: 'No test framework detected (Vitest, Jest, Playwright, Cypress)',
      framework: null,
      coverage: null,
      e2eFramework: null
    };
  }

  return result;
}