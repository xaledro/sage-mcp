#!/usr/bin/env node
/**
 * validators/secrets.js
 * Hardcoded Secrets Validator
 * Validates OWASP A02 (Cryptographic Failures) and general secrets detection
 */

export default {
  name: 'secrets',
  
  async validate(rule, projectPath) {
    if (!projectPath) {
      return null;
    }

    const results = [];

    try {
      const { readFileSync } = await import('node:fs');
      const { globSync } = await import('glob');
      
      const codeFiles = [
        ...globSync('**/*.js', { cwd: projectPath, ignore: ['**/node_modules/**', '**/dist/**'] }),
        ...globSync('**/*.ts', { cwd: projectPath, ignore: ['**/node_modules/**', '**/dist/**'] }),
        ...globSync('**/*.jsx', { cwd: projectPath, ignore: ['**/node_modules/**', '**/dist/**'] }),
        ...globSync('**/*.tsx', { cwd: projectPath, ignore: ['**/node_modules/**', '**/dist/**'] }),
        ...globSync('**/*.py', { cwd: projectPath, ignore: ['**/node_modules/**', '**/dist/**'] }),
        ...globSync('**/*.env*', { cwd: projectPath })
      ];
      
      const secretPatterns = [
        { pattern: /api[_-]?key\s*=\s*['"][a-zA-Z0-9]{20,}['"]/gi, type: 'api-key' },
        { pattern: /password\s*=\s*['"][^'"]+['"]/gi, type: 'hardcoded-password' },
        { pattern: /secret\s*=\s*['"][^'"]+['"]/gi, type: 'hardcoded-secret' },
        { pattern: /token\s*=\s*['"][a-zA-Z0-9]{20,}['"]/gi, type: 'token' },
        { pattern: /sk-[a-zA-Z0-9]{20,}/gi, type: 'openai-key' },
        { pattern: /ghp_[a-zA-Z0-9]{20,}/gi, type: 'github-token' },
        { pattern: /xox[baprs]-[a-zA-Z0-9]{10,}/gi, type: 'slack-token' }
      ];
      
      for (const file of codeFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          
          for (const { pattern, type } of secretPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
              results.push({
                type,
                location: `${file}:${content.substring(0, match.index).split('\n').length}`,
                detail: `Potential ${type} detected`
              });
            }
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      return null;
    }

    return results.length > 0 
      ? { status: 'fail', message: `${results.length} potential secrets found`, findings: results }
      : { status: 'pass', message: 'No hardcoded secrets found' };
  }
};