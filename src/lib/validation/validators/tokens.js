#!/usr/bin/env node
/**
 * validators/tokens.js
 * W3C Design Tokens Validator
 * Validates token files against W3C Design Tokens format
 */

export default {
  name: 'tokens',
  
  async validate(rule, projectPath) {
    if (!projectPath) {
      return null;
    }

    const results = [];

    try {
      const { readFileSync, existsSync } = await import('node:fs');
      const { globSync } = await import('glob');
      
      const tokenFiles = [
        ...globSync('**/tokens.json', { cwd: projectPath, ignore: ['**/node_modules/**'] }),
        ...globSync('**/tokens/*.json', { cwd: projectPath, ignore: ['**/node_modules/**'] }),
        ...globSync('**/*tokens*.json', { cwd: projectPath, ignore: ['**/node_modules/**'] })
      ];
      
      for (const file of tokenFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          const violations = validateTokenFormat(content, rule);
          results.push(...violations.map(v => ({ ...v, file })));
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      return null;
    }

    return results.length > 0 
      ? { status: 'fail', message: `${results.length} token violations found`, findings: results }
      : { status: 'pass', message: 'No token violations found' };
  }
};

function validateTokenFormat(content, rule) {
  const violations = [];
  
  try {
    const tokens = JSON.parse(content);
    
    if (rule.id.includes('format')) {
      validateFormat(tokens, violations, rule);
    }
    
    if (rule.id.includes('naming')) {
      validateNaming(tokens, violations, rule);
    }
    
    if (rule.id.includes('references')) {
      validateReferences(tokens, violations, rule);
    }
  } catch (e) {
    violations.push({
      type: 'invalid-json',
      detail: 'Token file is not valid JSON'
    });
  }
  
  return violations;
}

function validateFormat(tokens, violations, rule) {
  if (rule.id.includes('color')) {
    for (const [key, value] of Object.entries(tokens)) {
      if (typeof value === 'object' && value.$type === 'color') {
        if (!value.$value || !value.$value.match(/^#[a-fA-F0-9]{6}$/)) {
          violations.push({
            type: 'color-format',
            token: key,
            detail: 'Color tokens must use $type: "color" and $value: "#RRGGBB" format'
          });
        }
      }
    }
  }
}

function validateNaming(tokens, violations, rule) {
  if (rule.id.includes('kebab-case')) {
    for (const key of Object.keys(tokens)) {
      if (key.includes('_') || key.match(/[A-Z]/)) {
        violations.push({
          type: 'naming-convention',
          token: key,
          detail: 'Token names must use kebab-case (lowercase with hyphens)'
        });
      }
    }
  }
}

function validateReferences(tokens, violations, rule) {
  if (rule.id.includes('circular')) {
    const visited = new Set();
    const recursionStack = new Set();
    
    function hasCircular(obj, path = []) {
      if (typeof obj !== 'object' || obj === null) return false;
      if (recursionStack.has(path.join('.'))) return true;
      
      recursionStack.add(path.join('.'));
      
      if (obj.$value && typeof obj.$value === 'string') {
        const refMatch = obj.$value.match(/\{([^}]+)\}/);
        if (refMatch) {
          const refKey = refMatch[1];
          if (visited.has(refKey)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(path.join('.'));
      return false;
    }
    
    for (const [key, value] of Object.entries(tokens)) {
      visited.add(key);
      if (typeof value === 'object' && hasCircular(value, [key])) {
        violations.push({
          type: 'circular-reference',
          token: key,
          detail: 'Token references must not create circular dependencies'
        });
      }
    }
  }
}