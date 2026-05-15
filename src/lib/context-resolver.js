#!/usr/bin/env node
/**
 * context-resolver.js
 * Project context resolution (industry, platform, criticality)
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const INDUSTRY_KEYWORDS = {
  'mining': ['mining', 'minerals', 'excavation'],
  'healthcare': ['health', 'medical', 'hospital', 'clinical', 'patient'],
  'finance': ['banking', 'financial', 'fintech', 'payment', 'trading'],
  'government': ['government', 'gov', 'public-sector', 'municipal'],
  'education': ['education', 'school', 'university', 'learning', 'lms'],
  'e-commerce': ['shop', 'store', 'ecommerce', 'retail', 'cart']
};

const PLATFORM_PATTERNS = {
  'frontend': ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt'],
  'mobile': ['react-native', 'flutter', 'swift', 'kotlin', 'android', 'ios'],
  'desktop': ['electron', 'tauri', 'nwjs'],
  'backend': ['node', 'python', 'java', 'go', 'rust', 'csharp', 'php', 'ruby'],
  'infrastructure': ['kubernetes', 'docker', 'terraform', 'ansible']
};

const CRITICALITY_PATTERNS = {
  'high': ['safety-critical', 'medical', 'financial', 'payment', 'ai', 'ml'],
  'low': ['internal', 'tooling', 'utility', 'documentation']
};

export async function resolveContext({ projectPath }) {
  const dir = projectPath || process.cwd();
  
  const context = {
    projectPath: dir,
    industries: [],
    platforms: [],
    criticality: 'medium',
    technologies: [],
    frameworks: []
  };
  
  const packageJson = join(dir, 'package.json');
  const readme = join(dir, 'README.md');
  const dockerCompose = join(dir, 'docker-compose.yml');
  
  if (existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
      
      const deps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
      context.technologies = deps;
      
      for (const [platform, keywords] of Object.entries(PLATFORM_PATTERNS)) {
        if (deps.some(d => keywords.some(k => d.toLowerCase().includes(k)))) {
          if (!context.platforms.includes(platform)) {
            context.platforms.push(platform);
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  
  if (existsSync(readme)) {
    try {
      const readmeContent = readFileSync(readme, 'utf-8').toLowerCase();
      
      for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
        if (keywords.some(k => readmeContent.includes(k))) {
          if (!context.industries.includes(industry)) {
            context.industries.push(industry);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }
  
  if (existsSync(dockerCompose)) {
    if (!context.platforms.includes('infrastructure')) {
      context.platforms.push('infrastructure');
    }
  }
  
  for (const [level, patterns] of Object.entries(CRITICALITY_PATTERNS)) {
    const pkgContent = existsSync(packageJson) ? readFileSync(packageJson, 'utf-8').toLowerCase() : '';
    if (patterns.some(p => pkgContent.includes(p))) {
      context.criticality = level;
      break;
    }
  }
  
  if (context.platforms.length === 0) {
    context.platforms.push('frontend');
  }
  
  if (context.industries.length === 0) {
    context.industries.push('technology');
  }
  
  return context;
}

export async function getApplicableRules({ projectPath }) {
  const ctx = await resolveContext({ projectPath });
  
  return {
    context: ctx,
    applicableRules: {
      frontend: ['wcag22', 'material3', 'nielsen', 'iso25010'],
      mobile: ['wcag22', 'material3', 'iso25010'],
      backend: ['iso27001', 'iso20000', 'owasp-asvs'],
      infrastructure: ['iso27001', 'iso42001']
    }
  };
}