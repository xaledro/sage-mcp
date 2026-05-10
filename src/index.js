#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'standards-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = [
  {
    name: 'standards.list',
    description: 'List all available software standards',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'standards.activate',
    description: 'Activate a standard for use in the project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Standard name (e.g., arc42, owasp, iso29110)' },
        config: { type: 'object', description: 'Standard-specific configuration' },
      },
      required: ['name'],
    },
  },
  {
    name: 'arc42.section',
    description: 'Get arc42 documentation template section',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'number', description: 'Section number (1-12)', minimum: 1, maximum: 12 },
        context: { type: 'object', description: 'Project context for the section' },
      },
      required: ['section'],
    },
  },
  {
    name: 'owasp.requirements',
    description: 'Get OWASP ASVS requirements by level',
    inputSchema: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['L1', 'L2', 'L3'], description: 'ASVS level' },
        category: { type: 'string', description: 'Category filter (optional)' },
      },
      required: ['level'],
    },
  },
  {
    name: 'iso29110.artefact',
    description: 'Get ISO 29110 artefact template',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Artefact ID (e.g., GP-001, IS-009)' },
        data: { type: 'object', description: 'Data to populate template' },
      },
      required: ['id'],
    },
  },
  {
    name: 'iso42010.view',
    description: 'Get ISO 42010 architecture view template',
    inputSchema: {
      type: 'object',
      properties: {
        view: { type: 'string', description: 'View name (e.g., logical, deployment)' },
        config: { type: 'object', description: 'View configuration' },
      },
      required: ['view'],
    },
  },
  {
    name: 'iso9241.usabilityCheck',
    description: 'Get ISO 9241 usability checklist',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Checklist category' },
      },
    },
  },
  {
    name: 'iso25010.qualityModel',
    description: 'Get ISO 25010 software quality model',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'material.tokens',
    description: 'Get Material Design 3 tokens',
    inputSchema: {
      type: 'object',
      properties: {
        version: { type: 'string', description: 'MD3 version (default: latest)' },
      },
    },
  },
  {
    name: 'requestInfo',
    description: 'Request missing information for standards compliance',
    inputSchema: {
      type: 'object',
      properties: {
        standard: { type: 'string', description: 'Standard name' },
        missing: { type: 'array', items: { type: 'string' }, description: 'List of missing fields' },
      },
      required: ['standard', 'missing'],
    },
  },
  {
    name: 'defaults.get',
    description: 'Get default values for a standard',
    inputSchema: {
      type: 'object',
      properties: {
        standard: { type: 'string', description: 'Standard name' },
      },
      required: ['standard'],
    },
  },
  {
    name: 'generate',
    description: 'Generate artefacts for multiple standards',
    inputSchema: {
      type: 'object',
      properties: {
        standards: { type: 'array', items: { type: 'string' }, description: 'List of standards to generate' },
        project: { type: 'object', description: 'Project context' },
      },
      required: ['standards'],
    },
  },
  {
    name: 'status',
    description: 'Get project status across all standards',
    inputSchema: {
      type: 'object',
      properties: {
        project: { type: 'string', description: 'Project path (default: current)' },
      },
    },
  },
  {
    name: 'markGenerated',
    description: 'Mark an artefact as generated',
    inputSchema: {
      type: 'object',
      properties: {
        artefactId: { type: 'string', description: 'Artefact ID' },
      },
      required: ['artefactId'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'standards.list':
        return { content: [{ type: 'text', text: JSON.stringify(listStandards(), null, 2) }] };

      case 'standards.activate':
        return { content: [{ type: 'text', text: activateStandard(args.name, args.config) }] };

      case 'arc42.section':
        return { content: [{ type: 'text', text: await getArc42Section(args.section, args.context) }] };

      case 'owasp.requirements':
        return { content: [{ type: 'text', text: await getOwaspRequirements(args.level, args.category) }] };

      case 'iso29110.artefact':
        return { content: [{ type: 'text', text: await getIso29110Artefact(args.id, args.data) }] };

      case 'iso42010.view':
        return { content: [{ type: 'text', text: getIso42010View(args.view, args.config) }] };

      case 'iso9241.usabilityCheck':
        return { content: [{ type: 'text', text: getIso9241Checklist(args.category) }] };

      case 'iso25010.qualityModel':
        return { content: [{ type: 'text', text: getIso25010Model() }] };

      case 'material.tokens':
        return { content: [{ type: 'text', text: getMaterialTokens(args.version) }] };

      case 'requestInfo':
        return { content: [{ type: 'text', text: requestInfo(args.standard, args.missing) }] };

      case 'defaults.get':
        return { content: [{ type: 'text', text: getDefaults(args.standard) }] };

      case 'generate':
        return { content: [{ type: 'text', text: await generateArtefacts(args.standards, args.project) }] };

      case 'status':
        return { content: [{ type: 'text', text: await getStatus(args.project) }] };

      case 'markGenerated':
        return { content: [{ type: 'text', text: markGenerated(args.artefactId) }] };

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

const STANDARDS = ['arc42', 'owasp', 'iso29110', 'iso42010', 'iso9241', 'iso25010', 'material'];

function listStandards() {
  return {
    standards: STANDARDS.map(s => ({ name: s, status: 'available' })),
  };
}

function activateStandard(name, config) {
  if (!STANDARDS.includes(name)) {
    throw new Error(`Unknown standard: ${name}. Available: ${STANDARDS.join(', ')}`);
  }
  return `Activated ${name} with config: ${JSON.stringify(config || {})}`;
}

async function getArc42Section(section, context) {
  return { section, template: `arc42 section ${section}`, context };
}

async function getOwaspRequirements(level, category) {
  return { level, category, requirements: [] };
}

async function getIso29110Artefact(id, data) {
  try {
    const Interface = await import('@base/design-system/management').catch(() => null);
    if (Interface) {
      Interface.configure({ basePath: process.env.PROJECT_PATH || process.cwd() });
      return Interface.getProductState(id);
    }
  } catch {
    // Fallback to template
  }
  return { id, data, status: 'template' };
}

function getIso42010View(view, config) {
  return { view, config: config || {}, template: 'ISO 42010 view template' };
}

function getIso9241Checklist(category) {
  return { category, checklist: [] };
}

function getIso25010Model() {
  return { model: 'ISO 25010 quality model' };
}

function getMaterialTokens(version) {
  return { version: version || 'latest', tokens: {} };
}

function requestInfo(standard, missing) {
  return { standard, missing, message: `Please provide: ${missing.join(', ')}` };
}

function getDefaults(standard) {
  return { standard, defaults: {} };
}

async function generateArtefacts(standards, project) {
  return { standards, project, generated: [] };
}

async function getStatus(project) {
  return { project: project || process.cwd(), status: {} };
}

function markGenerated(artefactId) {
  return { artefactId, marked: true };
}

const transport = new StdioServerTransport();
await server.connect(transport);