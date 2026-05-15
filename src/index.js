#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { listRules, getRule, queryRules, auditRules } from './tools/v3/rules.js';
import { runValidation, generateReport } from './lib/validation/runner.js';
import { generateEvidence, listEvidence, exportEvidence } from './lib/evidence/generator.js';
import { resolveContext, getApplicableRules } from './lib/context-resolver.js';
import { createGraphDb } from './lib/graph/db.js';
import { indexRules } from './lib/graph/indexer.js';
import { discoverRuleFiles } from './lib/registry.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const standardsDir = join(rootDir, 'src/standards');

const server = new Server(
  {
    name: 'sage-mcp',
    version: '3.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = [
  {
    name: 'rules.list',
    description: 'List rules from the knowledge graph. Filter by standard, category, or severity.',
    inputSchema: {
      type: 'object',
      properties: {
        standard: { type: 'string', description: 'Filter by standard name (e.g., "iso27001", "wcag22")' },
        category: { type: 'string', description: 'Filter by category (e.g., "security", "usability")' },
        severity: { type: 'string', enum: ['info', 'warning', 'critical'], description: 'Filter by severity' },
        limit: { type: 'number', default: 100, description: 'Maximum number of results' },
        offset: { type: 'number', default: 0, description: 'Offset for pagination' }
      }
    }
  },
  {
    name: 'rules.get',
    description: 'Get a single rule by ID with its relationships',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Rule ID (e.g., "iso27001.a5.1", "wcag22.1.4.3")', required: ['id'] }
      },
      required: ['id']
    }
  },
  {
    name: 'rules.query',
    description: 'Query rules by multiple criteria: platform applicability, severity, tags, standard',
    inputSchema: {
      type: 'object',
      properties: {
        appliesTo: { type: 'array', items: { type: 'string' }, description: 'Platforms (frontend, backend, mobile, ai, desktop, infrastructure)' },
        severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
        tags: { type: 'array', items: { type: 'string' } },
        standard: { type: 'string' }
      }
    }
  },
  {
    name: 'rules.audit',
    description: 'Get compliance audit summary for a standard or all standards',
    inputSchema: {
      type: 'object',
      properties: {
        standard: { type: 'string', description: 'Standard name (optional, omit for all)' },
        projectPath: { type: 'string', description: 'Project path for context' }
      }
    }
  },
  {
    name: 'graph.related',
    description: 'Get rules related to a given rule',
    inputSchema: {
      type: 'object',
      properties: {
        ruleId: { type: 'string', description: 'Rule ID', required: ['ruleId'] },
        depth: { type: 'number', default: 1, description: 'Traversal depth' },
        relationType: { type: 'string', enum: ['IMPLEMENTS', 'EXTENDS', 'MAPS_TO', 'REQUIRES', 'CONFLICTS_WITH', 'RELATED'] }
      },
      required: ['ruleId']
    }
  },
  {
    name: 'graph.path',
    description: 'Find path between two rules through relationships',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Source rule ID' },
        to: { type: 'string', description: 'Target rule ID' },
        maxDepth: { type: 'number', default: 5 }
      },
      required: ['from', 'to']
    }
  },
  {
    name: 'graph.cluster',
    description: 'Get connected subgraph by tag or standard',
    inputSchema: {
      type: 'object',
      properties: {
        tag: { type: 'string' },
        standard: { type: 'string' }
      }
    }
  },
  {
    name: 'graph.export',
    description: 'Export knowledge graph in various formats',
    inputSchema: {
      type: 'object',
      properties: {
        format: { type: 'string', enum: ['mermaid', 'json', 'dot'], default: 'json' },
        standard: { type: 'string' }
      }
    }
  },
  {
    name: 'validation.run',
    description: 'Run validation engine against a project',
    inputSchema: {
      type: 'object',
      properties: {
        standard: { type: 'string' },
        ruleId: { type: 'string' },
        projectPath: { type: 'string', description: 'Path to project (default: cwd)' }
      }
    }
  },
  {
    name: 'validation.report',
    description: 'Generate validation report',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' },
        format: { type: 'string', enum: ['markdown', 'json', 'html'], default: 'json' }
      }
    }
  },
  {
    name: 'evidence.generate',
    description: 'Generate auditable evidence for a rule',
    inputSchema: {
      type: 'object',
      properties: {
        ruleId: { type: 'string', required: ['ruleId'] },
        projectPath: { type: 'string' }
      },
      required: ['ruleId']
    }
  },
  {
    name: 'context.resolve',
    description: 'Resolve project context (industry, platform, criticality)',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' }
      }
    }
  },
  {
    name: 'ai.model',
    description: 'Get AI governance model (ISO 42001 criteria as executable rules)',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string' }
      }
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'rules.list':
        return { content: [{ type: 'text', text: JSON.stringify(await listRules(args), null, 2) }] };

      case 'rules.get':
        return { content: [{ type: 'text', text: JSON.stringify(await getRule(args), null, 2) }] };

      case 'rules.query':
        return { content: [{ type: 'text', text: JSON.stringify(await queryRules(args), null, 2) }] };

      case 'rules.audit':
        return { content: [{ type: 'text', text: JSON.stringify(await auditRules(args), null, 2) }] };

      case 'graph.related': {
        const graph = await createGraphDb();
        const opts = {};
        if (args.depth) opts.depth = args.depth;
        if (args.relationType) opts.relationType = args.relationType;
        const related = args.depth || args.relationType
          ? graph.findRelated(args.ruleId, opts)
          : graph.getRelated(args.ruleId);
        graph.close();
        return { content: [{ type: 'text', text: JSON.stringify({ ruleId: args.ruleId, related }, null, 2) }] };
      }

      case 'graph.path': {
        const graph = await createGraphDb();
        const path = graph.findPath(args.from, args.to, args.maxDepth || 5);
        graph.close();
        return { content: [{ type: 'text', text: JSON.stringify({ from: args.from, to: args.to, path }, null, 2) }] };
      }

      case 'graph.cluster': {
        const graph = await createGraphDb();
        const cluster = graph.findCluster({ tag: args.tag, standard: args.standard });
        graph.close();
        return { content: [{ type: 'text', text: JSON.stringify({ tag: args.tag, standard: args.standard, cluster }, null, 2) }] };
      }

      case 'graph.export': {
        const graph = await createGraphDb();
        const export_ = graph.exportGraph({ format: args.format || 'json', standard: args.standard });
        graph.close();
        return { content: [{ type: 'text', text: JSON.stringify({ format: args.format || 'json', export: export_ }, null, 2) }] };
      }

      case 'validation.run': {
        const result = await runValidation({
          standard: args.standard,
          ruleId: args.ruleId,
          projectPath: args.projectPath || process.cwd()
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'validation.report': {
        const result = await generateReport({
          projectPath: args.projectPath || process.cwd(),
          format: args.format || 'json'
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'evidence.generate': {
        const result = await generateEvidence({
          ruleId: args.ruleId,
          projectPath: args.projectPath || process.cwd()
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'context.resolve': {
        const result = await resolveContext({
          projectPath: args.projectPath || process.cwd()
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'ai.model': {
        const graph = await createGraphDb();
        const rules = graph.query('SELECT * FROM rules WHERE standard = ?', ['iso42001']);
        graph.close();
        return { content: [{ type: 'text', text: JSON.stringify({ standard: 'iso42001', rules }, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function initializeGraph() {
  try {
    const files = discoverRuleFiles(standardsDir);
    if (files.length > 0) {
      await indexRules(standardsDir);
    }
  } catch (e) {
    console.error('Warning: Could not initialize graph:', e.message);
  }
}

initializeGraph().catch(console.error);

const transport = new StdioServerTransport();
await server.connect(transport);