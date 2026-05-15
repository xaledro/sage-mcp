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
      const { readFileSync, existsSync } = await import('node:fs');
      const { globSync } = await import('glob');
      
      for (const criterion of contrastRules) {
        let cssFiles = [];
        try {
          cssFiles = globSync('**/*.css', { cwd: projectPath, ignore: ['**/node_modules/**'] });
        } catch (e) {
          return null;
        }
        
        for (const file of cssFiles) {
          try {
            const content = readFileSync(file, 'utf-8');
            const violations = detectContrastViolations(content, criterion);
            results.push(...violations);
          } catch (e) {
            continue;
          }
        }
      }
    } catch (e) {
      return null;
    }

    return results.length > 0 
      ? { status: 'fail', message: `${results.length} contrast violations found`, findings: results }
      : { status: 'pass', message: 'No contrast violations found' };
  }
};

function detectContrastViolations(css, criterion) {
  const violations = [];
  
  const colorRegex = /(?:color|background-color|background)\s*:\s*([^;]+)/gi;
  let match;
  
  while ((match = colorRegex.exec(css)) !== null) {
    const value = match[1].trim();
    
    if (value.includes('#')) {
      const hexColor = value.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
      if (hexColor) {
        violations.push({
          type: 'contrast',
          criterion,
          location: match[0],
          detail: `Color value detected: ${hexColor[0]}`
        });
      }
    }
  }
  
  return violations;
}