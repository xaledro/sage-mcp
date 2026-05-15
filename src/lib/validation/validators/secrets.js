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
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.env', '.json'];
    
    try {
      const { readFileSync, existsSync } = await import('node:fs');
      const { join } = await import('node:path');
      
      const codeFiles = this.walkDir(projectPath, extensions);
      
      const secretPatterns = [
        { pattern: /api[_-]?key\s*=\s*['"][a-zA-Z0-9]{20,}['"]/gi, type: 'api-key' },
        { pattern: /password\s*=\s*['"][^'"]+['"]/gi, type: 'hardcoded-password' },
        { pattern: /secret\s*=\s*['"][^'"]+['"]/gi, type: 'hardcoded-secret' },
        { pattern: /token\s*=\s*['"][a-zA-Z0-9]{20,}['"]/gi, type: 'token' },
        { pattern: /sk-[a-zA-Z0-9]{20,}/gi, type: 'openai-key' },
        { pattern: /ghp_[a-zA-Z0-9]{20,}/gi, type: 'github-token' },
        { pattern: /xox[baprs]-[a-zA-Z0-9]{10,}/gi, type: 'slack-token' },
        { pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/gi, type: 'private-key' },
        { pattern: /['"][0-9a-f]{32}['"]/gi, type: 'hex-secret' }
      ];
      
      for (const file of codeFiles) {
        if (file.includes('node_modules') || file.includes('dist') || file.includes('.sage')) {
          continue;
        }
        
        try {
          const content = readFileSync(file, 'utf-8');
          
          for (const { pattern, type } of secretPatterns) {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(content)) !== null) {
              const lineNum = content.substring(0, match.index).split('\n').length;
              results.push({
                type,
                location: `${file}:${lineNum}`,
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
  },
  
  walkDir(dir, extensions, ignoreDirs = ['node_modules', 'dist', '.git', '.sage', 'coverage']) {
    const files = [];
    
    try {
      const { readdirSync, statSync } = require('fs');
      const { join } = require('path');
      
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!ignoreDirs.includes(entry.name)) {
            files.push(...this.walkDir(fullPath, extensions, ignoreDirs));
          }
        } else if (entry.isFile()) {
          const ext = entry.name.substring(entry.name.lastIndexOf('.'));
          if (extensions.includes(ext) || extensions.some(e => entry.name.endsWith(e))) {
            files.push(fullPath);
          }
        }
      }
    } catch (e) {
      // ignore permission errors
    }
    
    return files;
  }
};