import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function detectBackend(cwd) {
  const result = {
    available: true,
    type: null,
    edgeFunctions: [],
    schemas: [],
    endpoints: [],
    config: {}
  };

  if (existsSync(join(cwd, 'supabase'))) {
    result.type = 'supabase';
    result.edgeFunctions = detectEdgeFunctions(join(cwd, 'supabase', 'functions'));
    result.config.supabase = { detected: true };
  }

  if (existsSync(join(cwd, 'prisma'))) {
    result.schemas = detectPrismaSchemas(join(cwd, 'prisma'));
    result.config.prisma = { detected: true, count: result.schemas.length };
  }

  if (existsSync(join(cwd, 'src', 'pages', 'api'))) {
    result.type = result.type || 'nextjs';
    result.endpoints = detectNextApiRoutes(join(cwd, 'src', 'pages', 'api'));
  }

  if (existsSync(join(cwd, 'api'))) {
    result.type = result.type || 'rest';
    result.endpoints = detectRestEndpoints(join(cwd, 'api'));
  }

  if (existsSync(join(cwd, 'src', 'server', 'routers'))) {
    result.type = 'tRPC';
    result.endpoints = detectTRpcRoutes(join(cwd, 'src', 'server', 'routers'));
  }

  if (!result.type) {
    return {
      available: false,
      reason: 'No recognized backend detected (Supabase, Prisma, Next.js API, tRPC)',
      edgeFunctions: [],
      schemas: [],
      endpoints: []
    };
  }

  return result;
}

function detectEdgeFunctions(functionsPath) {
  if (!existsSync(functionsPath)) return [];

  const functions = [];
  try {
    const entries = readdirSync(functionsPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue;

      const indexPath = join(functionsPath, entry.name, 'index.ts');
      const indexJsPath = join(functionsPath, entry.name, 'index.js');

      let description = entry.name;
      let filePath = null;

      if (existsSync(indexPath)) {
        filePath = indexPath;
      } else if (existsSync(indexJsPath)) {
        filePath = indexJsPath;
      }

      if (filePath) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          const firstLine = content.split('\n')[0];
          if (firstLine.startsWith('//')) {
            description = firstLine.replace(/^\/\*/, '').replace(/\*\/$/, '').trim() ||
                        firstLine.replace(/^\/\//, '').trim();
          }
        } catch {
        }
      }

      functions.push({
        name: entry.name,
        path: functionsPath.replace(process.cwd(), '') + '/' + entry.name,
        description
      });
    }
  } catch {
  }

  return functions;
}

function detectPrismaSchemas(prismaPath) {
  if (!existsSync(prismaPath)) return [];

  const schemas = [];
  try {
    const entries = readdirSync(prismaPath);
    for (const entry of entries) {
      if (!entry.endsWith('.prisma')) continue;
      const schemaPath = join(prismaPath, entry);
      const content = readFileSync(schemaPath, 'utf-8');
      const models = content.match(/model\s+(\w+)/g) || [];
      schemas.push({
        file: entry,
        models: models.map(m => m.replace('model ', '')),
        count: models.length
      });
    }
  } catch {
  }

  return schemas;
}

function detectNextApiRoutes(apiPath) {
  if (!existsSync(apiPath)) return [];

  const endpoints = [];
  detectRoutesRecursive(apiPath, '', endpoints);
  return endpoints;
}

function detectRoutesRecursive(dir, base, results) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        detectRoutesRecursive(fullPath, base + '/' + entry.name, results);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        results.push({
          path: base + '/' + entry.name.replace('/route', '').replace('route.ts', '').replace('route.js', ''),
          method: 'GET'
        });
      }
    }
  } catch {
  }
}

function detectRestEndpoints(apiPath) {
  if (!existsSync(apiPath)) return [];

  const endpoints = [];
  detectRoutesRecursive(apiPath, '', endpoints);
  return endpoints;
}

function detectTRpcRoutes(routersPath) {
  if (!existsSync(routersPath)) return [];

  const routers = [];
  try {
    const entries = readdirSync(routersPath);
    for (const entry of entries) {
      if (entry.endsWith('.ts') || entry.endsWith('.js')) {
        routers.push({ name: entry.replace(/\.(ts|js)$/, ''), path: routersPath });
      }
    }
  } catch {
  }

  return routers;
}