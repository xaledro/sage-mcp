#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getArc42Section, getArc42Metadata } from './tools/arc42.js';
import { getOwaspRequirements } from './tools/owasp.js';
import { getIso42010View, listIso42010Views } from './tools/iso42010.js';
import { getIso9241Checklist, listIso9241Categories } from './tools/iso9241.js';
import { getIso25010Model, getIso25010Characteristic, getIso25010SubCharacteristic } from './tools/iso25010.js';
import { getMaterialTokens } from './tools/material.js';
import { runDiscovery, getDiscoveryStatus, getDiscoveryResults } from './tools/discovery.js';
import { runAudit, getAuditResults } from './tools/audit.js';
import { initProjectDir, ensureProjectConfig } from './lib/state.js';

const server = new Server(
  {
    name: 'standards-mcp',
    version: '1.1.0',
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
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'standards.activate',
    description: 'Activate a standard for use in the project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Standard name (arc42, owasp, iso29110, iso42010, iso9241, iso25010, material)' },
        config: { type: 'object', description: 'Standard-specific configuration' },
      },
      required: ['name'],
    },
  },
  {
    name: 'arc42.section',
    description: 'Get arc42 documentation template section (1-12)',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'number', description: 'Section number (1-12)', minimum: 1, maximum: 12 },
        context: { type: 'object', description: 'Project context to personalize the template' },
      },
      required: ['section'],
    },
  },
  {
    name: 'arc42.template',
    description: 'Get arc42 template metadata (section list)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'owasp.requirements',
    description: 'Get OWASP ASVS requirements by level',
    inputSchema: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['L1', 'L2', 'L3'], description: 'ASVS level (L1, L2, L3)' },
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
        view: { type: 'string', description: 'View name (logical, deployment, operational)' },
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
        category: { type: 'string', description: 'Checklist category (effectiveness, efficiency, satisfaction)' },
      },
    },
  },
  {
    name: 'iso25010.qualityModel',
    description: 'Get ISO 25010 software quality model',
    inputSchema: { type: 'object', properties: {} },
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
    description: 'Mark an artefact as generated in the DS state',
    inputSchema: {
      type: 'object',
      properties: {
        artefactId: { type: 'string', description: 'Artefact ID' },
      },
      required: ['artefactId'],
    },
  },
  {
    name: 'discovery.run',
    description: 'Run design system discovery on a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to project (default: PROJECT_PATH env)' },
        stacks: { type: 'array', items: { type: 'string' }, description: 'Stacks to scan (react, vue, tailwind, scss, etc.)' },
        confidenceThreshold: { type: 'number', description: 'Minimum confidence score (0-1)' },
      },
    },
  },
  {
    name: 'discovery.status',
    description: 'Get status of discovery scan',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to project (default: PROJECT_PATH env)' },
      },
    },
  },
  {
    name: 'discovery.results',
    description: 'Get discovery results (tokens, components, assets)',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to project (default: PROJECT_PATH env)' },
      },
    },
  },
  {
    name: 'audit.run',
    description: 'Run design system audit on a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to project (default: PROJECT_PATH env)' },
        baseTokensPath: { type: 'string', description: 'Path to base design system tokens.json' },
      },
    },
  },
  {
    name: 'audit.results',
    description: 'Get audit results',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to project (default: PROJECT_PATH env)' },
      },
    },
  },
  {
    name: 'project.init',
    description: 'Initialize project structure with ai/ folder',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to project (default: PROJECT_PATH env)' },
      },
    },
  },
  {
    name: 'report.gap',
    description: 'Generate gap analysis report',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string', description: 'Path to project (default: PROJECT_PATH env)' },
      },
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
        return { content: [{ type: 'text', text: JSON.stringify(getArc42Section(args.section, args.context || {}), null, 2) }] };

      case 'arc42.template':
        return { content: [{ type: 'text', text: JSON.stringify(getArc42Metadata(), null, 2) }] };

      case 'owasp.requirements':
        return { content: [{ type: 'text', text: JSON.stringify(getOwaspRequirements(args.level, args.category), null, 2) }] };

      case 'iso29110.artefact':
        return { content: [{ type: 'text', text: JSON.stringify(await getIso29110Artefact(args.id, args.data), null, 2) }] };

      case 'iso42010.view':
        return { content: [{ type: 'text', text: JSON.stringify(getIso42010View(args.view, args.config), null, 2) }] };

      case 'iso9241.usabilityCheck':
        return { content: [{ type: 'text', text: JSON.stringify(getIso9241Checklist(args.category), null, 2) }] };

      case 'iso25010.qualityModel':
        return { content: [{ type: 'text', text: JSON.stringify(getIso25010Model(), null, 2) }] };

      case 'material.tokens':
        return { content: [{ type: 'text', text: JSON.stringify(getMaterialTokens(args.version), null, 2) }] };

      case 'requestInfo':
        return { content: [{ type: 'text', text: JSON.stringify(requestInfo(args.standard, args.missing), null, 2) }] };

      case 'defaults.get':
        return { content: [{ type: 'text', text: JSON.stringify(getDefaults(args.standard), null, 2) }] };

      case 'generate':
        return { content: [{ type: 'text', text: JSON.stringify(await generateArtefacts(args.standards, args.project), null, 2) }] };

      case 'status':
        return { content: [{ type: 'text', text: JSON.stringify(await getStatus(args.project), null, 2) }] };

      case 'markGenerated':
        return { content: [{ type: 'text', text: JSON.stringify(await markGenerated(args.artefactId), null, 2) }] };

      case 'discovery.run':
        return { content: [{ type: 'text', text: JSON.stringify(await handleDiscoveryRun(args), null, 2) }] };

      case 'discovery.status':
        return { content: [{ type: 'text', text: JSON.stringify(await handleDiscoveryStatus(args), null, 2) }] };

      case 'discovery.results':
        return { content: [{ type: 'text', text: JSON.stringify(await handleDiscoveryResults(args), null, 2) }] };

      case 'audit.run':
        return { content: [{ type: 'text', text: JSON.stringify(await handleAuditRun(args), null, 2) }] };

      case 'audit.results':
        return { content: [{ type: 'text', text: JSON.stringify(await handleAuditResults(args), null, 2) }] };

      case 'project.init':
        return { content: [{ type: 'text', text: JSON.stringify(await handleProjectInit(args), null, 2) }] };

      case 'report.gap':
        return { content: [{ type: 'text', text: JSON.stringify(await handleGapReport(args), null, 2) }] };

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
    count: STANDARDS.length
  };
}

function activateStandard(name, config) {
  if (!STANDARDS.includes(name)) {
    throw new Error(`Unknown standard: ${name}. Available: ${STANDARDS.join(', ')}`);
  }
  return `Activated ${name} with config: ${JSON.stringify(config || {})}`;
}

function getOwaspRequirements(level, category) {
  const baseRequirements = {
    L1: ['A01: Broken Access Control', 'A02: Cryptographic Failures', 'A03: Injection', 'A04: Insecure Design', 'A05: Security Misconfiguration'],
    L2: ['A01-A10 all requirements + business logic', 'A06: Vulnerable Components', 'A07: Auth Failures', 'A08: Data Integrity Failures', 'A09: Logging Failures', 'A10: SSRF'],
    L3: ['All L1+L2 + advanced threat modeling', 'AI/LLM security considerations', 'API security hardening']
  };

  return {
    level,
    category: category || 'all',
    requirements: baseRequirements[level] || baseRequirements.L1
  };
}

async function getIso29110Artefact(id, data) {
  try {
    const Interface = await import('@base/design-system/management').catch(() => null);
    if (Interface) {
      Interface.configure({ basePath: process.env.PROJECT_PATH || process.cwd() });
      return Interface.getProductState(id);
    }
  } catch {
  }

  return {
    id,
    data: data || {},
    status: 'template',
    message: 'Template generated. Connect @base/design-system for full functionality.'
  };
}

function getIso42010View(view, config) {
  const views = {
    logical: { name: 'Logical View', description: 'Shows the structural decomposition of the system', elements: ['Components', 'Interfaces', 'Dependencies'] },
    deployment: { name: 'Deployment View', description: 'Shows the runtime environment and infrastructure', elements: ['Nodes', 'Components', 'Connections'] },
    operational: { name: 'Operational View', description: 'Shows how the system operates in its environment', elements: ['Processes', 'Resources', 'Control'] }
  };

  return {
    view,
    config: config || {},
    ...(views[view] || views.logical)
  };
}

function getIso9241Checklist(category) {
  const categories = {
    effectiveness: ['Task completion rate', 'Error frequency', 'User goal achievement'],
    efficiency: ['Time to complete task', 'Steps required', 'Resource consumption'],
    satisfaction: ['User preference rating', 'Ease of use rating', 'Comfort level']
  };

  return {
    category: category || 'all',
    checklist: category ? categories[category] : Object.values(categories).flat()
  };
}

function getIso25010Model() {
  return {
    model: 'ISO 25010',
    qualityCharacteristics: [
      { name: 'Functional Suitability', subCharacteristics: ['Completeness', 'Correctness', 'Appropriateness'] },
      { name: 'Performance Efficiency', subCharacteristics: ['Time behavior', 'Resource utilization', 'Capacity'] },
      { name: 'Compatibility', subCharacteristics: ['Co-existence', 'Interoperability'] },
      { name: 'Usability', subCharacteristics: ['Recognizability', 'Learnability', 'Operability', 'User error protection', 'User interface aesthetics', 'Accessibility'] },
      { name: 'Reliability', subCharacteristics: ['Maturity', 'Fault tolerance', 'Recoverability'] },
      { name: 'Security', subCharacteristics: ['Confidentiality', 'Integrity', 'Non-repudiation', 'Accountability', 'Authenticity'] },
      { name: 'Maintainability', subCharacteristics: ['Modularity', 'Reusability', 'Analysability', 'Modifiability', 'Testability'] },
      { name: 'Portability', subCharacteristics: ['Adaptability', 'Installability', 'Replaceability'] }
    ]
  };
}

function getMaterialTokens(version) {
  return {
    version: version || 'latest',
    tokens: {
      color: {
        primary: '#6750A4',
        secondary: '#625B71',
        tertiary: '#7D5260',
        error: '#B3261E',
        surface: '#FFFBFE',
        onSurface: '#1C1B1F'
      },
      typography: {
        displayLarge: { size: '57px', weight: 400 },
        headlineLarge: { size: '32px', weight: 400 },
        titleLarge: { size: '22px', weight: 400 },
        bodyLarge: { size: '16px', weight: 400 }
      }
    },
    message: 'Material Design 3 tokens. Full token set requires @base/design-system connection.'
  };
}

function requestInfo(standard, missing) {
  return {
    standard,
    missing,
    message: `To complete ${standard} compliance, please provide: ${missing.join(', ')}`,
    action: 'Provide the missing information and call the tool again'
  };
}

function getDefaults(standard) {
  const defaults = {
    arc42: { sectionCount: 12, format: 'markdown' },
    owasp: { level: 'L1', format: 'structured' },
    iso29110: { profile: 'entry', format: 'document' },
    iso42010: { viewpoint: 'logical', format: 'diagram' }
  };

  return {
    standard,
    defaults: defaults[standard] || {}
  };
}

async function generateArtefacts(standards, project) {
  const results = [];

  for (const std of standards) {
    if (std === 'arc42') {
      for (let i = 1; i <= 12; i++) {
        results.push({ standard: 'arc42', section: i, template: getArc42Section(i, project) });
      }
    } else {
      results.push({ standard: std, status: 'pending', message: 'Template generation pending' });
    }
  }

  return { standards, project, generated: results, total: results.length };
}

async function getStatus(project) {
  const projectPath = project || process.env.PROJECT_PATH || process.cwd();

  try {
    const Interface = await import('@base/design-system/management').catch(() => null);
    if (Interface) {
      Interface.configure({ basePath: projectPath });
      return Interface.generateReport();
    }
  } catch {
  }

  return {
    project: projectPath,
    status: 'unknown',
    message: 'Connect @base/design-system for full status'
  };
}

async function markGenerated(artefactId) {
  try {
    const Interface = await import('@base/design-system/management').catch(() => null);
    if (Interface) {
      Interface.configure({ basePath: process.env.PROJECT_PATH || process.cwd() });
      const product = Interface.updateProductStatus(artefactId, 'complete');
      return { artefactId, status: 'marked_complete', product };
    }
  } catch {
  }

  return {
    artefactId,
    status: 'marked',
    message: 'Marked locally. Connect @base/design-system for persistence.'
  };
}

async function handleDiscoveryRun(args) {
  const projectPath = args.projectPath || process.env.PROJECT_PATH || process.cwd();
  return await runDiscovery({
    projectPath,
    stacks: args.stacks,
    confidenceThreshold: args.confidenceThreshold
  });
}

async function handleDiscoveryStatus(args) {
  const projectPath = args.projectPath || process.env.PROJECT_PATH || process.cwd();
  return await getDiscoveryStatus(projectPath);
}

async function handleDiscoveryResults(args) {
  const projectPath = args.projectPath || process.env.PROJECT_PATH || process.cwd();
  return await getDiscoveryResults(projectPath);
}

async function handleAuditRun(args) {
  const projectPath = args.projectPath || process.env.PROJECT_PATH || process.cwd();
  return await runAudit({
    projectPath,
    baseTokensPath: args.baseTokensPath
  });
}

async function handleAuditResults(args) {
  const projectPath = args.projectPath || process.env.PROJECT_PATH || process.cwd();
  return await getAuditResults(projectPath);
}

async function handleProjectInit(args) {
  const projectPath = args.projectPath || process.env.PROJECT_PATH || process.cwd();
  await initProjectDir(projectPath);
  const configResult = await ensureProjectConfig(projectPath);
  return {
    success: true,
    projectPath,
    projectConfig: configResult
  };
}

async function handleGapReport(args) {
  const projectPath = args.projectPath || process.env.PROJECT_PATH || process.cwd();
  const gapPath = `${projectPath}/ai/discovered/gap-analysis.json`;

  try {
    const { readFile } = await import('node:fs/promises');
    const { existsSync } = await import('node:fs');

    if (existsSync(gapPath)) {
      const content = await readFile(gapPath, 'utf-8');
      return JSON.parse(content);
    }

    return {
      project: projectPath,
      status: 'not_found',
      message: 'No gap analysis found. Run discovery.run first.'
    };
  } catch {
    return {
      project: projectPath,
      status: 'error',
      message: 'Error reading gap analysis'
    };
  }
}

const transport = new StdioServerTransport();
await server.connect(transport);