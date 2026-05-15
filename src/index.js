#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getArc42Section, getArc42Metadata, getArc42Checklist } from './tools/arc42.js';
import { getOwaspRequirements, getOwaspCategories, verifyOwaspRequirements } from './tools/owasp.js';
import { getIso42010View, listIso42010Views } from './tools/iso42010.js';
import { getIso9241Checklist, listIso9241Categories } from './tools/iso9241.js';
import { getIso25010Model, getIso25010Characteristic, getIso25010SubCharacteristic } from './tools/iso25010.js';
import { getMaterialTokens } from './tools/material.js';
import { runDiscovery, getDiscoveryStatus, getDiscoveryResults } from './tools/discovery.js';
import { runAudit, getAuditResults } from './tools/audit.js';
import { getArtefact as getIso29110Artefact, getStatus as getIso29110Status, markGenerated as markIso29110Generated, listPhases, listProducts } from './tools/iso29110.js';
import { getPrivacyCheck, getPiaTemplate, getDpiaTemplate } from './tools/iso27701.js';
import { getControls, getSoaTemplate, getIsmsFramework } from './tools/iso27001.js';
import { getServiceLevelAgreement, getServiceDefinition, getProcessDocumentation } from './tools/iso20000.js';
import { getEthicalAICriteria, getTransparencyFramework, getAccountabilityMechanisms } from './tools/iso42001.js';
import { initProjectDir, ensureProjectConfig } from './lib/state.js';

const server = new Server(
  {
    name: 'standards-mcp',
    version: '2.0.0',
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
        name: { type: 'string', description: 'Standard name (arc42, owasp, iso29110, iso42010, iso9241, iso25010, material, iso27701, iso27001, iso20000, iso42001)' },
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
        projectPath: { type: 'string', description: 'Path to project for project-aware content' }
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
    name: 'arc42.checklist',
    description: 'Get arc42 section completeness checklist',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'number', description: 'Section number (1-12)' },
        projectPath: { type: 'string', description: 'Path to project' }
      },
      required: ['section']
    },
  },
  {
    name: 'owasp.requirements',
    description: 'Get OWASP ASVS requirements by level with project-aware verification',
    inputSchema: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['L1', 'L2', 'L3'], description: 'ASVS level (L1, L2, L3)' },
        category: { type: 'string', description: 'Category filter (optional)' },
        projectPath: { type: 'string', description: 'Path to project for verification' }
      },
      required: ['level'],
    },
  },
  {
    name: 'owasp.verify',
    description: 'Verify OWASP requirements against a project',
    inputSchema: {
      type: 'object',
      properties: {
        level: { type: 'string', enum: ['L1', 'L2', 'L3'] },
        projectPath: { type: 'string', description: 'Path to project' }
      },
      required: ['level']
    },
  },
  {
    name: 'iso29110.artefact',
    description: 'Get ISO 29110 artefact template (autonomous - no @base/design-system required)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Artefact ID (e.g., GP-001, IS-009)' },
        data: { type: 'object', description: 'Data to populate template' },
        projectPath: { type: 'string', description: 'Path to project' }
      },
      required: ['id'],
    },
  },
  {
    name: 'iso29110.phases',
    description: 'List ISO 29110 lifecycle phases',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'iso29110.products',
    description: 'List ISO 29110 products',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'iso42010.view',
    description: 'Get ISO 42010 architecture view template (project-aware)',
    inputSchema: {
      type: 'object',
      properties: {
        view: { type: 'string', description: 'View name (logical, deployment, operational)' },
        config: { type: 'object', description: 'View configuration' },
        projectPath: { type: 'string', description: 'Path to project' }
      },
      required: ['view'],
    },
  },
  {
    name: 'iso42010.views',
    description: 'List available ISO 42010 views',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'iso42010.diagram',
    description: 'Generate Mermaid diagram for a view',
    inputSchema: {
      type: 'object',
      properties: {
        view: { type: 'string' },
        projectPath: { type: 'string' }
      },
      required: ['view']
    },
  },
  {
    name: 'iso9241.usabilityCheck',
    description: 'Get ISO 9241 usability checklist with measurement guidance',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Checklist category (effectiveness, efficiency, satisfaction)' },
        projectPath: { type: 'string', description: 'Path to project for measurements' }
      },
    },
  },
  {
    name: 'iso9241.measure',
    description: 'Get measurement playbook for a criterion',
    inputSchema: {
      type: 'object',
      properties: {
        criterion: { type: 'string', description: 'Criterion ID (e.g., E3, N1, S2)' },
        projectPath: { type: 'string' }
      },
      required: ['criterion']
    },
  },
  {
    name: 'iso9241.categories',
    description: 'List ISO 9241 categories',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'iso25010.qualityModel',
    description: 'Get ISO 25010 software quality model',
    inputSchema: {
      type: 'object',
      properties: {
        characteristic: { type: 'string', description: 'Filter by characteristic ID' },
        projectPath: { type: 'string', description: 'Path to project for quality assessment' }
      },
    },
  },
  {
    name: 'iso25010.characteristic',
    description: 'Get ISO 25010 characteristic details',
    inputSchema: {
      type: 'object',
      properties: {
        characteristicId: { type: 'string', description: 'Characteristic ID (e.g., security, usability)' },
      },
      required: ['characteristicId'],
    },
  },
  {
    name: 'iso25010.subCharacteristic',
    description: 'Get ISO 25010 sub-characteristic details',
    inputSchema: {
      type: 'object',
      properties: {
        characteristicId: { type: 'string' },
        subCharacteristicId: { type: 'string' },
      },
      required: ['characteristicId', 'subCharacteristicId'],
    },
  },
  {
    name: 'iso27701.privacyCheck',
    description: 'Get ISO 27701 privacy checklist (PII processing)',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['overview', 'pII-principles', 'PII-owner', 'PII-processor', 'controls'] },
        projectPath: { type: 'string', description: 'Path to project for PII detection' }
      },
    },
  },
  {
    name: 'iso27701.pia',
    description: 'Generate Privacy Impact Assessment template',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: { type: 'string' },
        dataTypes: { type: 'array', items: { type: 'string' } },
        processingPurpose: { type: 'string' },
        legalBasis: { type: 'string', enum: ['consent', 'contract', 'legal', 'vital', 'public'] },
        projectPath: { type: 'string' }
      },
      required: ['scenario', 'dataTypes', 'processingPurpose', 'legalBasis']
    },
  },
  {
    name: 'iso27701.dpia',
    description: 'Generate Data Protection Impact Assessment for high-risk processing',
    inputSchema: {
      type: 'object',
      properties: {
        processingType: { type: 'string', enum: ['systematic', 'large-scale', 'vulnerable-subjects', 'innovation', 'biometric', 'location'] },
        riskLevel: { type: 'string', enum: ['high', 'very-high'] },
        projectPath: { type: 'string' }
      },
      required: ['processingType', 'riskLevel']
    },
  },
  {
    name: 'iso27001.controls',
    description: 'Get ISO 27001 ISMS controls',
    inputSchema: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['overview', 'organizational', 'people', 'physical', 'technological'] },
        controlId: { type: 'string', description: 'Specific control ID (e.g., A.5.1)' },
        projectPath: { type: 'string' }
      },
    },
  },
  {
    name: 'iso27001.soa',
    description: 'Generate Statement of Applicability',
    inputSchema: {
      type: 'object',
      properties: {
        riskAssessment: { type: 'object' },
        context: { type: 'string' },
        projectPath: { type: 'string' }
      },
    },
  },
  {
    name: 'iso27001.isms',
    description: 'Get ISMS framework section',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'string', enum: ['overview', 'context', 'leadership', 'planning', 'support', 'operation', 'performance', 'improvement'] },
        projectPath: { type: 'string' }
      },
    },
  },
  {
    name: 'iso20000.sla',
    description: 'Generate SLA template',
    inputSchema: {
      type: 'object',
      properties: {
        serviceType: { type: 'string', enum: ['saas', 'paas', 'iaas', 'custom'] },
        availabilityTarget: { type: 'number' },
        responseTimeTarget: { type: 'number' },
        resolutionTimeTarget: { type: 'number' },
        projectPath: { type: 'string' }
      },
    },
  },
  {
    name: 'iso20000.service',
    description: 'Get ISO 20000 service management process',
    inputSchema: {
      type: 'object',
      properties: {
        processArea: { type: 'string', enum: ['overview', 'design-transition', 'delivery', 'resolution', 'improvement'] },
        projectPath: { type: 'string' }
      },
    },
  },
  {
    name: 'iso20000.process',
    description: 'Get ISO 20000 process capability assessment',
    inputSchema: {
      type: 'object',
      properties: {
        processId: { type: 'string' },
        capabilityLevel: { type: 'string', enum: ['1-Initial', '2-Managed', '3-Established', '4-Predictable', '5-Optimizing'] },
        projectPath: { type: 'string' }
      },
    },
  },
  {
    name: 'iso42001.ethicalAI',
    description: 'Get ISO 42001 AI ethics checklist',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['overview', 'ethical-principles', 'transparency', 'accountability', 'fairness', 'privacy'] },
        projectPath: { type: 'string', description: 'Path to project for AI usage detection' }
      },
    },
  },
  {
    name: 'iso42001.transparency',
    description: 'Get AI transparency requirements',
    inputSchema: {
      type: 'object',
      properties: {
        transparencyType: { type: 'string', enum: ['documentation', 'explainability', 'communication', 'audit'] },
        projectPath: { type: 'string' }
      },
    },
  },
  {
    name: 'iso42001.accountability',
    description: 'Get AI accountability mechanisms',
    inputSchema: {
      type: 'object',
      properties: {
        accountabilityArea: { type: 'string', enum: ['governance', 'risk', 'incident', 'audit'] },
        projectPath: { type: 'string' }
      },
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
        projectPath: { type: 'string' }
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
        return { content: [{ type: 'text', text: JSON.stringify(getArc42Section(args.section, args.context || {}, args.projectPath), null, 2) }] };

      case 'arc42.template':
        return { content: [{ type: 'text', text: JSON.stringify(getArc42Metadata(), null, 2) }] };

      case 'arc42.checklist':
        return { content: [{ type: 'text', text: JSON.stringify(getArc42Checklist(args.section, args.projectPath), null, 2) }] };

      case 'owasp.requirements':
        return { content: [{ type: 'text', text: JSON.stringify(getOwaspRequirements(args.level, args.category, args.projectPath), null, 2) }] };

      case 'owasp.verify':
        return { content: [{ type: 'text', text: JSON.stringify(verifyOwaspRequirements(args.level, args.projectPath), null, 2) }] };

      case 'iso29110.artefact':
        return { content: [{ type: 'text', text: JSON.stringify(getIso29110Artefact(args.id, args.data, args.projectPath), null, 2) }] };

      case 'iso29110.phases':
        return { content: [{ type: 'text', text: JSON.stringify({ phases: listPhases() }, null, 2) }] };

      case 'iso29110.products':
        return { content: [{ type: 'text', text: JSON.stringify({ products: listProducts() }, null, 2) }] };

      case 'iso42010.view':
        return { content: [{ type: 'text', text: JSON.stringify(getIso42010View(args.view, args.config, args.projectPath), null, 2) }] };

      case 'iso42010.views':
        return { content: [{ type: 'text', text: JSON.stringify({ views: listIso42010Views() }, null, 2) }] };

      case 'iso42010.diagram':
        return { content: [{ type: 'text', text: JSON.stringify({ view: args.view, diagram: 'To be implemented' }, null, 2) }] };

      case 'iso9241.usabilityCheck':
        return { content: [{ type: 'text', text: JSON.stringify(getIso9241Checklist(args.category, args.projectPath), null, 2) }] };

      case 'iso9241.measure':
        return { content: [{ type: 'text', text: JSON.stringify({ criterion: args.criterion, playbook: 'To be implemented' }, null, 2) }] };

      case 'iso9241.categories':
        return { content: [{ type: 'text', text: JSON.stringify({ categories: listIso9241Categories() }, null, 2) }] };

      case 'iso25010.qualityModel':
        return { content: [{ type: 'text', text: JSON.stringify(getIso25010Model(args.characteristic, args.projectPath), null, 2) }] };

      case 'iso25010.characteristic':
        return { content: [{ type: 'text', text: JSON.stringify(getIso25010Characteristic(args.characteristicId), null, 2) }] };

      case 'iso25010.subCharacteristic':
        return { content: [{ type: 'text', text: JSON.stringify(getIso25010SubCharacteristic(args.characteristicId, args.subCharacteristicId), null, 2) }] };

      case 'iso27701.privacyCheck':
        return { content: [{ type: 'text', text: JSON.stringify(getPrivacyCheck(args.category, args.projectPath), null, 2) }] };

      case 'iso27701.pia':
        return { content: [{ type: 'text', text: JSON.stringify(getPiaTemplate(args.scenario, args.dataTypes, args.processingPurpose, args.legalBasis, args.recipients), null, 2) }] };

      case 'iso27701.dpia':
        return { content: [{ type: 'text', text: JSON.stringify(getDpiaTemplate(args.processingType, args.riskLevel, args.hasExistingAssessment), null, 2) }] };

      case 'iso27001.controls':
        return { content: [{ type: 'text', text: JSON.stringify(getControls(args.theme, args.projectPath), null, 2) }] };

      case 'iso27001.soa':
        return { content: [{ type: 'text', text: JSON.stringify(getSoaTemplate(), null, 2) }] };

      case 'iso27001.isms':
        return { content: [{ type: 'text', text: JSON.stringify(getIsmsFramework(), null, 2) }] };

      case 'iso20000.sla':
        return { content: [{ type: 'text', text: JSON.stringify(getServiceLevelAgreement(args.slaType, args.projectPath), null, 2) }] };

      case 'iso20000.service':
        return { content: [{ type: 'text', text: JSON.stringify(getServiceDefinition(args.serviceType, args.projectPath), null, 2) }] };

      case 'iso20000.process':
        return { content: [{ type: 'text', text: JSON.stringify(getProcessDocumentation(args.processId, args.projectPath), null, 2) }] };

      case 'iso42001.ethicalAI':
        return { content: [{ type: 'text', text: JSON.stringify(getEthicalAICriteria(args.category, args.projectPath), null, 2) }] };

      case 'iso42001.transparency':
        return { content: [{ type: 'text', text: JSON.stringify(getTransparencyFramework(args.projectPath), null, 2) }] };

      case 'iso42001.accountability':
        return { content: [{ type: 'text', text: JSON.stringify(getAccountabilityMechanisms(args.accountabilityArea, args.projectPath), null, 2) }] };

      case 'material.tokens':
        return { content: [{ type: 'text', text: JSON.stringify(getMaterialTokens(args.version), null, 2) }] };

      case 'requestInfo':
        return { content: [{ type: 'text', text: JSON.stringify(requestInfo(args.standard, args.missing), null, 2) }] };

      case 'defaults.get':
        return { content: [{ type: 'text', text: JSON.stringify(getDefaults(args.standard), null, 2) }] };

      case 'generate':
        return { content: [{ type: 'text', text: JSON.stringify(await generateArtefacts(args.standards, args.project), null, 2) }] };

      case 'status':
        return { content: [{ type: 'text', text: JSON.stringify(getIso29110Status(args.project), null, 2) }] };

      case 'markGenerated':
        return { content: [{ type: 'text', text: JSON.stringify(markIso29110Generated(args.artefactId, args.projectPath), null, 2) }] };

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

const STANDARDS = ['arc42', 'owasp', 'iso29110', 'iso42010', 'iso9241', 'iso25010', 'material', 'iso27701', 'iso27001', 'iso20000', 'iso42001'];

function listStandards() {
  return {
    standards: STANDARDS.map(s => ({ name: s, status: 'available' })),
    count: STANDARDS.length,
    version: '2.0.0'
  };
}

function activateStandard(name, config) {
  if (!STANDARDS.includes(name)) {
    throw new Error(`Unknown standard: ${name}. Available: ${STANDARDS.join(', ')}`);
  }
  return `Activated ${name} with config: ${JSON.stringify(config || {})}`;
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
    iso42010: { viewpoint: 'logical', format: 'diagram' },
    iso9241: { categories: ['effectiveness', 'efficiency', 'satisfaction'] },
    iso25010: { characteristics: 8, subCharacteristics: 30 },
    material: { version: 'latest' },
    iso27701: { criteriaCount: 32 },
    iso27001: { controlCount: 93 },
    iso20000: { processCount: 13 },
    iso42001: { criteriaCount: 57 }
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