#!/usr/bin/env node
/**
 * validators/coverage.js
 * Code Coverage Validator
 * Validates ISO 25010 maintainability requirements
 */

export default {
  name: 'coverage',
  
  async validate(rule, projectPath) {
    if (!projectPath) {
      return null;
    }

    const results = [];

    try {
      const { existsSync, readFileSync } = await import('node:fs');
      const { globSync } = await import('glob');
      
      const coverageFiles = [
        'coverage/coverage-summary.json',
        'coverage/lcov.info',
        'test/coverage/coverage-summary.json',
        '.nyc_output/coverage-summary.json'
      ];
      
      let coverageData = null;
      
      for (const cf of coverageFiles) {
        const fullPath = `${projectPath}/${cf}`;
        if (existsSync(fullPath)) {
          try {
            const content = readFileSync(fullPath, 'utf-8');
            coverageData = JSON.parse(content);
            break;
          } catch (e) {
            continue;
          }
        }
      }
      
      if (coverageData) {
        const statementPct = coverageData.statement?.pct || 0;
        const branchPct = coverageData.branch?.pct || 0;
        const functionPct = coverageData.function?.pct || 0;
        
        const thresholds = {
          statement: 80,
          branch: 70,
          function: 80
        };
        
        if (statementPct < thresholds.statement) {
          results.push({
            type: 'coverage-statement',
            current: statementPct,
            threshold: thresholds.statement,
            detail: `Statement coverage ${statementPct}% is below ${thresholds.statement}% threshold`
          });
        }
        
        if (branchPct < thresholds.branch) {
          results.push({
            type: 'coverage-branch',
            current: branchPct,
            threshold: thresholds.branch,
            detail: `Branch coverage ${branchPct}% is below ${thresholds.branch}% threshold`
          });
        }
        
        if (functionPct < thresholds.function) {
          results.push({
            type: 'coverage-function',
            current: functionPct,
            threshold: thresholds.function,
            detail: `Function coverage ${functionPct}% is below ${thresholds.function}% threshold`
          });
        }
      } else {
        const testFiles = globSync('**/*.test.js', { cwd: projectPath, ignore: ['**/node_modules/**'] });
        
        if (testFiles.length === 0) {
          results.push({
            type: 'no-tests',
            detail: 'No test files or coverage reports found'
          });
        }
      }
    } catch (e) {
      return null;
    }

    return results.length > 0 
      ? { status: 'fail', message: `${results.length} coverage issues found`, findings: results }
      : { status: 'pass', message: 'Coverage requirements met' };
  }
};