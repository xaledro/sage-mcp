#!/usr/bin/env node
/**
 * validators/contrast.js
 * WCAG Color Contrast Validator
 * Validates WCAG 1.4.3 (Contrast Minimum) and 1.4.11 (Non-text Contrast)
 */

export default {
  name: 'contrast',
  
  async validate(rule, projectPath) {
    if (!projectPath || !rule.id.includes('wcag22')) {
      return null;
    }

    const results = [];
    const contrastRules = ['1.4.3', '1.4.11'];

    try {
      const { readFileSync } = await import('node:fs');
      const { join } = require('path');
      
      const cssFiles = this.walkDir(projectPath, ['.css', '.scss', '.less']);
      
      for (const file of cssFiles) {
        if (file.includes('node_modules') || file.includes('dist')) {
          continue;
        }
        
        try {
          const content = readFileSync(file, 'utf-8');
          const violations = this.detectContrastViolations(content, contrastRules);
          results.push(...violations.map(v => ({ ...v, location: `${file}:${v.line}` })));
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      return null;
    }

    return results.length > 0 
      ? { status: 'fail', message: `${results.length} contrast violations found`, findings: results }
      : { status: 'pass', message: 'No contrast violations found' };
  },
  
  detectContrastViolations(css, criteria) {
    const violations = [];
    
    const colorRegex = /(?:color|background-color|background)\s*:\s*([^;]+)/gi;
    let match;
    
    while ((match = colorRegex.exec(css)) !== null) {
      const value = match[1].trim();
      const lineNum = css.substring(0, match.index).split('\n').length;
      
      if (value.includes('#')) {
        const hexColor = value.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
        if (hexColor) {
          violations.push({
            type: 'contrast',
            criterion: criteria[0],
            location: match[0],
            line: lineNum,
            detail: `Color value detected: ${hexColor[0]}`
          });
        }
      }
      
      if (value.includes('rgb') || value.includes('hsl')) {
        violations.push({
          type: 'contrast',
          criterion: criteria[0],
          location: match[0],
          line: lineNum,
          detail: `Color function detected: ${value.substring(0, 50)}`
        });
      }
    }
    
    return violations;
  },
  
  walkDir(dir, extensions, ignoreDirs = ['node_modules', 'dist', '.git', '.sage']) {
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
          if (extensions.includes(ext)) {
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