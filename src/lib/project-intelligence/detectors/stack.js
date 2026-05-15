import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function detectStack(cwd) {
  const pkgPath = join(cwd, 'package.json');

  if (!existsSync(pkgPath)) {
    return { available: false, reason: 'No package.json found' };
  }

  let pkg;
  try {
    const content = readFileSync(pkgPath, 'utf-8');
    pkg = JSON.parse(content);
  } catch {
    return { available: false, reason: 'Invalid package.json' };
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const pkgNames = Object.keys(deps);

  const framework = detectFramework(pkgNames);
  const bundler = detectBundler(pkg, pkgNames);
  const css = detectCss(pkgNames);
  const state = detectState(pkgNames);
  const runtime = detectRuntime(pkg, pkgNames);
  const packages = {
    count: pkgNames.length,
    list: pkgNames.slice(0, 20)
  };

  return {
    available: true,
    framework,
    version: pkg.version || 'unknown',
    language: detectLanguage(pkg),
    bundler,
    css,
    state,
    runtime,
    packages
  };
}

function detectFramework(pkgNames) {
  const frameworks = [
    { id: 'react', names: ['react', 'react-dom', 'next'] },
    { id: 'vue', names: ['vue', '@vue/runtime-core', 'nuxt'] },
    { id: 'svelte', names: ['svelte', '@sveltejs/kit'] },
    { id: 'angular', names: ['@angular/core', '@angular/common'] },
    { id: 'astro', names: ['astro'] },
    { id: 'solid', names: ['solid-js', 'solid-js/web'] },
    { id: 'qwik', names: ['@builder.io/qwik'] },
    { id: 'remix', names: ['@remix-run/react'] }
  ];

  for (const fw of frameworks) {
    if (fw.names.some(n => pkgNames.includes(n))) {
      return { id: fw.id, confidence: 'high' };
    }
  }

  return { id: 'unknown', confidence: 'low' };
}

function detectBundler(pkg, pkgNames) {
  if (pkgNames.includes('vite')) {
    return { id: 'vite', confidence: 'high' };
  }
  if (pkgNames.includes('webpack')) {
    return { id: 'webpack', confidence: 'high' };
  }
  if (pkgNames.includes('@vercel/edge') || pkgNames.includes('vercel')) {
    return { id: 'vercel', confidence: 'high' };
  }
  if (pkgNames.includes('rollup')) {
    return { id: 'rollup', confidence: 'medium' };
  }
  if (pkgNames.includes('esbuild')) {
    return { id: 'esbuild', confidence: 'medium' };
  }
  return { id: 'unknown', confidence: 'low' };
}

function detectCss(pkgNames) {
  if (pkgNames.includes('tailwindcss')) {
    return { id: 'tailwind', confidence: 'high' };
  }
  if (pkgNames.includes('sass') || pkgNames.includes('node-sass')) {
    return { id: 'sass', confidence: 'high' };
  }
  if (pkgNames.includes('less')) {
    return { id: 'less', confidence: 'medium' };
  }
  if (pkgNames.includes('styled-components')) {
    return { id: 'styled-components', confidence: 'high' };
  }
  if (pkgNames.includes('@emotion/react')) {
    return { id: 'emotion', confidence: 'high' };
  }
  if (pkgNames.includes('css-modules')) {
    return { id: 'css-modules', confidence: 'medium' };
  }
  return { id: 'vanilla', confidence: 'low' };
}

function detectState(pkgNames) {
  if (pkgNames.includes('zustand')) {
    return { id: 'zustand', confidence: 'high' };
  }
  if (pkgNames.includes('@reduxjs/toolkit') || pkgNames.includes('redux')) {
    return { id: 'redux', confidence: 'high' };
  }
  if (pkgNames.includes('pinia')) {
    return { id: 'pinia', confidence: 'high' };
  }
  if (pkgNames.includes('jotai')) {
    return { id: 'jotai', confidence: 'high' };
  }
  if (pkgNames.includes('@tanstack/react-query') || pkgNames.includes('react-query')) {
    return { id: 'react-query', confidence: 'high' };
  }
  if (pkgNames.includes('recoil')) {
    return { id: 'recoil', confidence: 'medium' };
  }
  return { id: 'none', confidence: 'low' };
}

function detectRuntime(pkg, pkgNames) {
  if (pkgNames.includes('@supabase/supabase-js') || pkgNames.includes('supabase-js')) {
    return { id: 'supabase', confidence: 'high' };
  }
  if (pkgNames.includes('next')) {
    return { id: 'next', confidence: 'high' };
  }
  if (pkgNames.includes('nuxt')) {
    return { id: 'nuxt', confidence: 'high' };
  }
  if (pkgNames.includes('@vercel/ai') || pkgNames.includes('ai') || pkgNames.includes('openai')) {
    return { id: 'ai', confidence: 'high' };
  }
  if (pkgNames.includes('deno')) {
    return { id: 'deno', confidence: 'high' };
  }
  if (pkgNames.includes('@anthropic-ai/sdk') || pkgNames.includes('anthropic')) {
    return { id: 'anthropic', confidence: 'high' };
  }
  return { id: 'node', confidence: 'medium' };
}

function detectLanguage(pkg) {
  if (pkg.engines && pkg.engines.node) {
    return { id: 'javascript', version: pkg.engines.node };
  }
  if (pkg.devDependencies && (pkg.devDependencies.typescript || pkg.devDependencies['@types/react'])) {
    return { id: 'typescript', version: 'detected' };
  }
  return { id: 'javascript', version: 'unknown' };
}