#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const STANDARDS_DIR = join(rootDir, 'src/standards');

const tools = {
  'arc42': { standard: 'arc42', version: '7.0', domain: 'architecture' },
  'iso42010': { standard: 'iso42010', version: '2011', domain: 'architecture' },
  'iso25010': { standard: 'iso25010', version: '2011', domain: 'quality' },
  'owasp': { standard: 'owasp-asvs', version: '2024', domain: 'security' },
  'iso9241': { standard: 'iso9241', version: '11', domain: 'ux' },
  'material': { standard: 'material3', version: '3.0', domain: 'design-system' },
  'iso29110': { standard: 'iso29110', version: '2011', domain: 'governance' },
  'iso27001': { standard: 'iso27001', version: '2022', domain: 'governance' },
  'iso27701': { standard: 'iso27701', version: '2019', domain: 'governance' },
  'iso20000': { standard: 'iso20000', version: '2018', domain: 'operations' },
  'iso42001': { standard: 'iso42001', version: '2023', domain: 'ai' }
};

function ensureDir(path) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function migrateArc42() {
  const rules = [];
  for (let i = 1; i <= 12; i++) {
    rules.push({
      id: `arc42.s${i}`,
      standard: 'arc42',
      version: '7.0',
      category: 'architecture-documentation',
      title: `Section ${i}`,
      description: `Arc42 documentation template section ${i}`,
      appliesTo: { frontend: true, backend: true },
      severity: 'info',
      relatedStandards: [],
      tags: ['arc42', 'documentation', 'architecture'],
      implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
      validation: { automated: false, manual: true, lint: false },
      evidence: { requiredArtifacts: ['markdown'], generators: [] },
      context: { industries: [], platforms: [], criticality: [] },
      source: 'https://arc42.org/'
    });
  }
  return rules;
}

function migrateIso42010() {
  const views = ['logical', 'deployment', 'operational', 'data', 'security'];
  return views.map(view => ({
    id: `iso42010.${view}`,
    standard: 'iso42010',
    version: '2011',
    category: 'architecture-views',
    title: `${view.charAt(0).toUpperCase() + view.slice(1)} View`,
    description: `ISO 42010 architectural view: ${view}`,
    appliesTo: { frontend: true, backend: true, infrastructure: true },
    severity: 'info',
    relatedStandards: [],
    tags: ['iso42010', 'architecture', 'views'],
    implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
    validation: { automated: false, manual: true, lint: false },
    evidence: { requiredArtifacts: ['diagram'], generators: [] },
    context: { industries: [], platforms: [], criticality: [] },
    source: 'https://www.iso.org/standard/50509.html'
  }));
}

function migrateIso25010() {
  const characteristics = [
    { id: 'functional_suitability', name: 'Functional Suitability', sub: ['functional_completeness', 'functional_correctness', 'functional_appropriateness'] },
    { id: 'performance_efficiency', name: 'Performance Efficiency', sub: ['time_behavior', 'resource_utilization', 'capacity'] },
    { id: 'compatibility', name: 'Compatibility', sub: ['co-existence', 'interoperability'] },
    { id: 'usability', name: 'Usability', sub: ['recognizability', 'learnability', 'operability', 'user_error_protection', 'user_interface_aesthetics', 'accessibility'] },
    { id: 'reliability', name: 'Reliability', sub: ['maturity', 'fault_tolerance', 'recoverability'] },
    { id: 'security', name: 'Security', sub: ['confidentiality', 'integrity', 'non_repudiation', 'accountability', 'authenticity'] },
    { id: 'maintainability', name: 'Maintainability', sub: ['modularity', 'reusability', 'analysability', 'modifiability', 'testability'] },
    { id: 'portability', name: 'Portability', sub: ['adaptability', 'installability', 'replaceability'] }
  ];

  const rules = [];
  for (const char of characteristics) {
    rules.push({
      id: `iso25010.${char.id}`,
      standard: 'iso25010',
      version: '2011',
      category: 'quality-characteristic',
      title: char.name,
      description: `ISO 25010 quality characteristic: ${char.name}`,
      appliesTo: { frontend: true, backend: true },
      severity: 'info',
      relatedStandards: [],
      tags: ['iso25010', 'quality', 'characteristic'],
      implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
      validation: { automated: false, manual: true, lint: false },
      evidence: { requiredArtifacts: ['specification'], generators: [] },
      context: { industries: [], platforms: [], criticality: [] },
      source: 'https://www.iso.org/standard/35733.html'
    });

    for (const sub of char.sub) {
      rules.push({
        id: `iso25010.${sub}`,
        standard: 'iso25010',
        version: '2011',
        category: 'quality-subcharacteristic',
        title: sub.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        description: `ISO 25010 sub-characteristic: ${sub}`,
        appliesTo: { frontend: true, backend: true },
        severity: 'info',
        relatedStandards: [`iso25010.${char.id}`],
        tags: ['iso25010', 'quality', 'subcharacteristic'],
        implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
        validation: { automated: false, manual: true, lint: false },
        evidence: { requiredArtifacts: ['specification'], generators: [] },
        context: { industries: [], platforms: [], criticality: [] },
        source: 'https://www.iso.org/standard/35733.html'
      });
    }
  }
  return rules;
}

function migrateOwasp() {
  const categories = [
    { id: 'A01', name: 'Broken Access Control', requirements: ['1.1.1', '1.1.2', '1.1.3', '1.2.1', '1.2.2', '1.3.1', '1.3.2', '1.4.1', '1.5.1'] },
    { id: 'A02', name: 'Cryptographic Failures', requirements: ['2.1.1', '2.1.2', '2.2.1', '2.2.2', '2.3.1', '2.4.1'] },
    { id: 'A03', name: 'Injection', requirements: ['3.1.1', '3.1.2', '3.2.1', '3.3.1', '3.4.1', '3.5.1'] },
    { id: 'A04', name: 'Insecure Design', requirements: ['4.1.1', '4.2.1', '4.3.1'] },
    { id: 'A05', name: 'Security Misconfiguration', requirements: ['5.1.1', '5.2.1', '5.3.1', '5.4.1'] },
    { id: 'A06', name: 'Vulnerable and Outdated Components', requirements: ['6.1.1', '6.2.1'] },
    { id: 'A07', name: 'Authentication and Identity Failures', requirements: ['7.1.1', '7.2.1', '7.3.1', '7.4.1'] },
    { id: 'A08', name: 'Software and Data Integrity Failures', requirements: ['8.1.1', '8.2.1'] },
    { id: 'A09', name: 'Security Logging and Monitoring Failures', requirements: ['9.1.1', '9.2.1', '9.3.1'] },
    { id: 'A10', name: 'Server-Side Request Forgery (SSRF)', requirements: ['10.1.1', '10.2.1'] }
  ];

  const rules = [];
  for (const cat of categories) {
    for (const req of cat.requirements) {
      const ruleId = `owasp-asvs.${cat.id.toLowerCase()}.${req.replace('.', '-')}`;
      rules.push({
        id: ruleId,
        standard: 'owasp-asvs',
        version: '2024',
        category: 'security-requirement',
        title: `${cat.name} - ${req}`,
        description: `OWASP ASVS requirement ${req} in category ${cat.id} (${cat.name})`,
        appliesTo: { frontend: true, backend: true },
        severity: 'critical',
        relatedStandards: [],
        tags: ['owasp', 'security', 'asvs'],
        implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
        validation: { automated: true, manual: false, lint: false, validatorId: 'secrets' },
        evidence: { requiredArtifacts: ['test', 'audit'], generators: [] },
        context: { industries: [], platforms: [], criticality: [] },
        source: 'https://owasp.org/ASVS'
      });
    }
  }
  return rules;
}

function migrateIso9241() {
  const categories = {
    'effectiveness': { name: 'Effectiveness', criteria: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'] },
    'efficiency': { name: 'Efficiency', criteria: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8'] },
    'satisfaction': { name: 'Satisfaction', criteria: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'] }
  };

  const rules = [];
  for (const [catKey, catData] of Object.entries(categories)) {
    for (const crit of catData.criteria) {
      rules.push({
        id: `iso9241.${crit.toLowerCase()}`,
        standard: 'iso9241',
        version: '11',
        category: 'usability-criteria',
        title: `${catData.name} - Criterion ${crit}`,
        description: `ISO 9241 usability criterion ${crit} (${catData.name})`,
        appliesTo: { frontend: true },
        severity: 'warning',
        relatedStandards: [],
        tags: ['iso9241', 'usability', 'ux'],
        implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
        validation: { automated: false, manual: true, lint: false },
        evidence: { requiredArtifacts: ['evaluation'], generators: [] },
        context: { industries: [], platforms: [], criticality: [] },
        source: 'https://www.iso.org/standard/35800.html'
      });
    }
  }
  return rules;
}

function migrateMaterial() {
  const tokenCategories = ['color', 'typography', 'spacing', 'elevation', 'shape', 'motion'];
  const rules = [];

  rules.push({
    id: 'material3.tokens-overview',
    standard: 'material3',
    version: '3.0',
    category: 'design-tokens',
    title: 'Material Design 3 Token System',
    description: 'Material 3 design tokens for color, typography, spacing, and more',
    appliesTo: { frontend: true },
    severity: 'info',
    relatedStandards: ['w3c-tokens.format'],
    tags: ['material', 'design-system', 'tokens'],
    implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
    validation: { automated: false, manual: true, lint: false },
    evidence: { requiredArtifacts: ['tokens-json'], generators: [] },
    context: { industries: [], platforms: [], criticality: [] },
    source: 'https://m3.material.io/'
  });

  for (const cat of tokenCategories) {
    rules.push({
      id: `material3.tokens.${cat}`,
      standard: 'material3',
      version: '3.0',
      category: 'design-tokens',
      title: `Material 3 ${cat.charAt(0).toUpperCase() + cat.slice(1)} Tokens`,
      description: `Material Design 3 ${cat} token specifications`,
      appliesTo: { frontend: true },
      severity: 'info',
      relatedStandards: [],
      tags: ['material', 'design-system', 'tokens', cat],
      implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
      validation: { automated: true, manual: false, lint: true, validatorId: 'tokens' },
      evidence: { requiredArtifacts: ['tokens-json'], generators: [] },
      context: { industries: [], platforms: [], criticality: [] },
      source: 'https://m3.material.io/'
    });
  }
  return rules;
}

function migrateIso29110() {
  const phases = [
    { id: 'GP.1', name: 'Project Initiation' },
    { id: 'GP.2', name: 'Project Planning' },
    { id: 'GP.3', name: 'Project Execution' },
    { id: 'GP.4', name: 'Project Closure' },
    { id: 'IS.1', name: 'Initialization' },
    { id: 'IS.2', name: 'Requirements' },
    { id: 'IS.3', name: 'Design' },
    { id: 'IS.4', name: 'Implementation' },
    { id: 'IS.5', name: 'Integration Testing' },
    { id: 'IS.6', name: 'Acceptance Testing' }
  ];

  const products = {
    'GP-001': 'Project Charter', 'GP-002': 'Project Plan', 'GP-003': 'Quality Record', 'GP-004': 'Lessons Learned',
    'IS-001': 'Software Requirements', 'IS-002': 'Software Design', 'IS-003': 'Code and Unit Test',
    'IS-004': 'Integration Test Report', 'IS-005': 'User Documentation', 'IS-006': 'Acceptance Test Report', 'IS-007': 'Software Release'
  };

  const rules = [];
  for (const phase of phases) {
    rules.push({
      id: `iso29110.${phase.id.toLowerCase().replace('.', '-')}`,
      standard: 'iso29110',
      version: '2011',
      category: 'lifecycle-phase',
      title: phase.name,
      description: `ISO 29110 lifecycle phase: ${phase.name}`,
      appliesTo: { frontend: true, backend: true },
      severity: 'info',
      relatedStandards: [],
      tags: ['iso29110', 'lifecycle', 'governance'],
      implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
      validation: { automated: false, manual: true, lint: false },
      evidence: { requiredArtifacts: ['document'], generators: [] },
      context: { industries: [], platforms: [], criticality: [] },
      source: 'https://www.iso.org/standard/50691.html'
    });
  }

  for (const [prodId, prodName] of Object.entries(products)) {
    rules.push({
      id: `iso29110.${prodId.toLowerCase()}`,
      standard: 'iso29110',
      version: '2011',
      category: 'entry-profile-product',
      title: prodName,
      description: `ISO 29110 Entry Profile product: ${prodName}`,
      appliesTo: { frontend: true, backend: true },
      severity: 'info',
      relatedStandards: [],
      tags: ['iso29110', 'product', 'governance'],
      implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
      validation: { automated: false, manual: true, lint: false },
      evidence: { requiredArtifacts: ['document'], generators: [] },
      context: { industries: [], platforms: [], criticality: [] },
      source: 'https://www.iso.org/standard/50691.html'
    });
  }
  return rules;
}

function migrateIso27001() {
  const themes = {
    'organizational': { name: 'Organizational Controls', controls: ['A.5.1', 'A.5.2', 'A.5.3', 'A.5.4', 'A.5.5', 'A.5.6', 'A.5.7', 'A.5.8', 'A.5.9', 'A.5.10', 'A.5.11', 'A.5.12', 'A.5.13', 'A.5.14', 'A.5.15', 'A.5.16', 'A.5.17', 'A.5.18', 'A.5.19', 'A.5.20'] },
    'people': { name: 'People Controls', controls: ['A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6', 'A.6.7'] },
    'physical': { name: 'Physical Controls', controls: ['A.7.1', 'A.7.2', 'A.7.3', 'A.7.4', 'A.7.5', 'A.7.6', 'A.8.1', 'A.8.2', 'A.8.3'] },
    'technological': { name: 'Technological Controls', controls: ['A.8.4', 'A.8.5', 'A.8.6', 'A.8.7', 'A.8.8', 'A.8.9', 'A.8.10', 'A.8.11', 'A.8.12', 'A.8.13', 'A.8.14', 'A.8.15'] }
  };

  const rules = [];
  for (const [themeKey, themeData] of Object.entries(themes)) {
    for (const ctrl of themeData.controls) {
      const ctrlSlug = ctrl.toLowerCase().replace('.', '-').replace('-', '');
      rules.push({
        id: `iso27001.${ctrlSlug}`,
        standard: 'iso27001',
        version: '2022',
        category: 'information-security-control',
        title: `${ctrl} - ${themeData.name}`,
        description: `ISO 27001 control ${ctrl} (${themeData.name})`,
        appliesTo: { frontend: true, backend: true, infrastructure: true },
        severity: themeKey === 'technological' ? 'critical' : 'warning',
        relatedStandards: [],
        tags: ['iso27001', 'security', 'isms'],
        implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
        validation: { automated: false, manual: true, lint: false },
        evidence: { requiredArtifacts: ['document', 'audit'], generators: [] },
        context: { industries: [], platforms: [], criticality: [] },
        source: 'https://www.iso.org/standard/27001'
      });
    }
  }
  return rules;
}

function migrateIso27701() {
  const categories = {
    'pII-principles': { name: 'PII Processing Principles', criteria: ['27701-1', '27701-2', '27701-3', '27701-4', '27701-5', '27701-6', '27701-7'] },
    'PII-owner': { name: 'PII Owner Requirements', criteria: ['27701-8', '27701-9', '27701-10', '27701-11', '27701-12'] },
    'PII-processor': { name: 'PII Processor Requirements', criteria: ['27701-13', '27701-14', '27701-15', '27701-16', '27701-17', '27701-18'] },
    'controls': { name: 'Privacy Controls (Annex A)', criteria: ['27701-A1', '27701-A2', '27701-A3', '27701-A4', '27701-A5', '27701-A6', '27701-A7', '27701-A8', '27701-A9', '27701-A10', '27701-A11', '27701-A12', '27701-A13', '27701-A14'] }
  };

  const rules = [];
  for (const [catKey, catData] of Object.entries(categories)) {
    for (const crit of catData.criteria) {
      rules.push({
        id: `iso27701.${crit}`,
        standard: 'iso27701',
        version: '2019',
        category: 'privacy-requirement',
        title: `${crit} - ${catData.name}`,
        description: `ISO 27701 privacy requirement ${crit} (${catData.name})`,
        appliesTo: { frontend: true, backend: true },
        severity: 'critical',
        relatedStandards: ['iso27001.*'],
        tags: ['iso27701', 'privacy', 'pii'],
        implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
        validation: { automated: false, manual: true, lint: false },
        evidence: { requiredArtifacts: ['document', 'audit'], generators: [] },
        context: { industries: [], platforms: [], criticality: [] },
        source: 'https://www.iso.org/standard/71637.html'
      });
    }
  }
  return rules;
}

function migrateIso20000() {
  const processes = [
    { id: 'SS-1', name: 'Strategy management' },
    { id: 'SS-2', name: 'Service portfolio management' },
    { id: 'SS-3', name: 'Demand management' },
    { id: 'SS-4', name: 'Business relationship management' },
    { id: 'SD-1', name: 'Design coordination' },
    { id: 'SD-2', name: 'Service catalogue management' },
    { id: 'SD-3', name: 'Service level management' },
    { id: 'SD-4', name: 'Availability management' },
    { id: 'SD-5', name: 'Capacity management' },
    { id: 'SD-6', name: 'IT service continuity management' },
    { id: 'SD-7', name: 'Information security management' },
    { id: 'SD-8', name: 'Supplier management' },
    { id: 'ST-1', name: 'Transition planning and support' },
    { id: 'ST-2', name: 'Change management' },
    { id: 'ST-3', name: 'Service asset and configuration management' },
    { id: 'ST-4', name: 'Release and deployment management' },
    { id: 'ST-5', name: 'Service validation and testing' },
    { id: 'ST-6', name: 'Change evaluation' },
    { id: 'ST-7', name: 'Knowledge management' },
    { id: 'SO-1', name: 'Event management' },
    { id: 'SO-2', name: 'Incident management' },
    { id: 'SO-3', name: 'Request fulfillment' },
    { id: 'SO-4', name: 'Problem management' },
    { id: 'SO-5', name: 'Access management' },
    { id: 'SO-6', name: 'Service desk' },
    { id: 'SO-7', name: 'Monitoring and reporting' },
    { id: 'CSI-1', name: 'CSI register' },
    { id: 'CSI-2', name: 'Improvement reporting' },
    { id: 'CSI-3', name: 'Service improvement plan' },
    { id: 'CSI-4', name: 'Measurement and metrics' }
  ];

  return processes.map(p => ({
    id: `iso20000.${p.id.toLowerCase()}`,
    standard: 'iso20000',
    version: '2018',
    category: 'service-management-process',
    title: p.name,
    description: `ISO 20000 process: ${p.name}`,
    appliesTo: { frontend: false, backend: true, infrastructure: true },
    severity: 'info',
    relatedStandards: [],
    tags: ['iso20000', 'service-management', 'operations'],
    implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
    validation: { automated: false, manual: true, lint: false },
    evidence: { requiredArtifacts: ['document', 'metrics'], generators: [] },
    context: { industries: [], platforms: [], criticality: [] },
    source: 'https://www.iso.org/standard/50628.html'
  }));
}

function migrateIso42001() {
  const categories = {
    'governance': { name: 'AI Governance', criteria: ['42001-G1', '42001-G2', '42001-G3', '42001-G4', '42001-G5', '42001-G6', '42001-G7'] },
    'risk-management': { name: 'AI Risk Management', criteria: ['42001-R1', '42001-R2', '42001-R3', '42001-R4', '42001-R5', '42001-R6', '42001-R7'] },
    'transparency': { name: 'AI Transparency', criteria: ['42001-T1', '42001-T2', '42001-T3', '42001-T4', '42001-T5', '42001-T6', '42001-T7', '42001-T8'] },
    'accountability': { name: 'AI Accountability', criteria: ['42001-A1', '42001-A2', '42001-A3', '42001-A4', '42001-A5', '42001-A6', '42001-A7'] }
  };

  const rules = [];
  for (const [catKey, catData] of Object.entries(categories)) {
    for (const crit of catData.criteria) {
      rules.push({
        id: `iso42001.${crit.toLowerCase()}`,
        standard: 'iso42001',
        version: '2023',
        category: 'ai-management-criteria',
        title: `${crit} - ${catData.name}`,
        description: `ISO 42001 AI management criterion ${crit} (${catData.name})`,
        appliesTo: { ai: true, frontend: true, backend: true },
        severity: 'warning',
        relatedStandards: [],
        tags: ['iso42001', 'ai', 'governance'],
        implementation: { patterns: [], antiPatterns: [], codeExamples: [], tokens: [] },
        validation: { automated: false, manual: true, lint: false },
        evidence: { requiredArtifacts: ['document', 'audit'], generators: [] },
        context: { industries: [], platforms: [], criticality: [] },
        source: 'https://www.iso.org/standard/81230.html'
      });
    }
  }
  return rules;
}

const migrators = {
  arc42: migrateArc42,
  iso42010: migrateIso42010,
  iso25010: migrateIso25010,
  owasp: migrateOwasp,
  iso9241: migrateIso9241,
  material: migrateMaterial,
  iso29110: migrateIso29110,
  iso27001: migrateIso27001,
  iso27701: migrateIso27701,
  iso20000: migrateIso20000,
  iso42001: migrateIso42001
};

const domainMap = {
  arc42: 'architecture/arc42',
  iso42010: 'architecture/iso42010',
  iso25010: 'quality/iso25010',
  owasp: 'security/owasp-asvs',
  iso9241: 'ux/iso9241',
  material: 'design-system/material3',
  iso29110: 'governance/iso29110',
  iso27001: 'governance/iso27001',
  iso27701: 'governance/iso27701',
  iso20000: 'operations/iso20000',
  iso42001: 'ai/iso42001'
};

let totalRules = 0;
let totalErrors = 0;

for (const [toolKey, migrator] of Object.entries(migrators)) {
  const domain = domainMap[toolKey];
  const rulesDir = join(STANDARDS_DIR, domain, 'rules');
  ensureDir(rulesDir);

  const rules = migrator();
  let fileCount = 0;
  let errors = 0;

  for (const rule of rules) {
    const fileName = `${rule.id.replace(/[^a-z0-9.-]/gi, '_')}.json`;
    const filePath = join(rulesDir, fileName);
    try {
      writeFileSync(filePath, JSON.stringify(rule, null, 2) + '\n', 'utf-8');
      fileCount++;
    } catch (e) {
      console.error(`Error writing ${filePath}: ${e.message}`);
      errors++;
    }
  }

  console.log(`${toolKey}: ${fileCount} rules written, ${errors} errors`);
  totalRules += fileCount;
  totalErrors += errors;
}

console.log(`\nTotal: ${totalRules} rules written, ${totalErrors} errors`);
process.exit(totalErrors > 0 ? 1 : 0);