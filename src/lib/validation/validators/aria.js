#!/usr/bin/env node
/**
 * validators/aria.js
 * WAI-ARIA Validator
 * Validates ARIA roles, properties, and patterns
 */

export default {
  name: 'aria',
  
  async validate(rule, projectPath) {
    if (!projectPath || !rule.id.includes('wai-aria')) {
      return null;
    }

    const results = [];

    try {
      const { readFileSync } = await import('node:fs');
      const { globSync } = await import('glob');
      
      const jsxFiles = globSync('**/*.jsx', { cwd: projectPath, ignore: ['**/node_modules/**'] });
      const htmlFiles = globSync('**/*.html', { cwd: projectPath, ignore: ['**/node_modules/**'] });
      
      const files = [...jsxFiles, ...htmlFiles];
      
      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf-8');
          const violations = detectAriaViolations(content, rule);
          results.push(...violations);
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      return null;
    }

    return results.length > 0 
      ? { status: 'fail', message: `${results.length} ARIA violations found`, findings: results }
      : { status: 'pass', message: 'No ARIA violations found' };
  }
};

function detectAriaViolations(content, rule) {
  const violations = [];
  
  if (rule.id.includes('role.')) {
    const roleName = rule.id.split('role.')[1];
    const rolePattern = new RegExp(`<[a-z]+(?:\\s+[^>]*)?aria-role=["']${roleName}["'][^>]*>`, 'gi');
    
    let match;
    while ((match = rolePattern.exec(content)) !== null) {
      violations.push({
        type: 'aria-role',
        expected: roleName,
        location: match[0].substring(0, 100)
      });
    }
  }
  
  if (rule.id.includes('aria-')) {
    const propName = rule.id.split('aria-')[1];
    const propPattern = new RegExp(`aria-${propName}=`, 'gi');
    
    let match;
    while ((match = propPattern.exec(content)) !== null) {
      violations.push({
        type: 'aria-property',
        property: `aria-${propName}`,
        location: content.substring(Math.max(0, match.index - 20), match.index + 50)
      });
    }
  }
  
  return violations;
}