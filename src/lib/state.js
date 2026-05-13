import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

export async function readState(projectPath, file) {
  try {
    const Interface = await import('@base/design-system/management').catch(() => null);
    if (Interface && Interface.configure) {
      Interface.configure({ basePath: projectPath });
      return Interface.loadState(file);
    }
  } catch {
  }

  const fullPath = join(projectPath, 'management', 'state', file);
  if (existsSync(fullPath)) {
    const content = await readFile(fullPath, 'utf-8');
    return JSON.parse(content);
  }

  return null;
}

export async function writeState(projectPath, file, data) {
  try {
    const Interface = await import('@base/design-system/management').catch(() => null);
    if (Interface && Interface.configure) {
      Interface.configure({ basePath: projectPath });
      return Interface.saveState(file, data);
    }
  } catch {
  }

  const dir = join(projectPath, 'management', 'state');
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const fullPath = join(dir, file);
  await writeFile(fullPath, JSON.stringify(data, null, 2));
  return { success: true, path: fullPath };
}

export async function initProjectDir(projectPath) {
  const dirs = [
    join(projectPath, 'ai'),
    join(projectPath, 'ai', 'management'),
    join(projectPath, 'ai', 'management', 'state'),
    join(projectPath, 'ai', 'discovered'),
    join(projectPath, 'ai', 'reports'),
    join(projectPath, 'ai', 'management', 'artefacts')
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  return { success: true, dirs };
}

export async function ensureProjectConfig(projectPath) {
  const configPath = join(projectPath, 'ai', 'project-config.json');

  if (existsSync(configPath)) {
    return { exists: true, path: configPath };
  }

  const defaultConfig = {
    "$schema": "https://base-design-system.io/schemas/project-config.json",
    "project": {
      "name": projectPath.split(/[\\/]/).pop() || "unnamed",
      "version": "1.0.0",
      "description": "",
      "org": ""
    },
    "standards": {
      "arc42": { "enabled": false },
      "owasp": { "enabled": false },
      "iso29110": { "enabled": false },
      "iso42010": { "enabled": false },
      "iso25010": { "enabled": false }
    },
    "design": {
      "theme": "tokyonight",
      "colors": { "primary": "", "secondary": "", "accent": "" }
    },
    "mcp": {
      "standardsServer": "@xaledro/standards-mcp",
      "designSystemServer": "@base/design-system"
    }
  };

  await writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
  return { exists: false, path: configPath };
}