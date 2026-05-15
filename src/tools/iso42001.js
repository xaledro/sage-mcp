import { inspect } from '../lib/project-intelligence.js';

const AI_MANAGEMENT_CATEGORIES = {
  governance: {
    id: 'governance',
    name: 'AI Governance',
    description: 'Framework for AI system oversight and accountability',
    criteria: [
      { id: '42001-G1', text: 'AI strategy aligned with organizational objectives', weight: 'high' },
      { id: '42001-G2', text: 'AI governance framework documented and approved', weight: 'high' },
      { id: '42001-G3', text: 'Board-level AI oversight established', weight: 'high' },
      { id: '42001-G4', text: 'AI ethics committee or equivalent in place', weight: 'medium' },
      { id: '42001-G5', text: 'AI policies and standards defined', weight: 'high' },
      { id: '42001-G6', text: 'AI risk management process established', weight: 'high' },
      { id: '42001-G7', text: 'AI governance training provided to stakeholders', weight: 'medium' }
    ]
  },
  'risk-management': {
    id: 'risk-management',
    name: 'AI Risk Management',
    description: 'Systematic approach to identifying and managing AI risks',
    criteria: [
      { id: '42001-R1', text: 'AI risk assessment methodology defined', weight: 'high' },
      { id: '42001-R2', text: 'AI system risk categorization implemented', weight: 'high' },
      { id: '42001-R3', text: 'Bias detection and mitigation procedures in place', weight: 'high' },
      { id: '42001-R4', text: 'Adversarial attack prevention measures defined', weight: 'medium' },
      { id: '42001-R5', text: 'AI system failure modes identified and documented', weight: 'high' },
      { id: '42001-R6', text: 'Risk mitigation plans for identified AI risks', weight: 'high' },
      { id: '42001-R7', text: 'Continuous monitoring of AI risks', weight: 'medium' }
    ]
  },
  'transparency': {
    id: 'transparency',
    name: 'AI Transparency',
    description: 'Ensuring AI decisions and operations are explainable',
    criteria: [
      { id: '42001-T1', text: 'AI decision explanation capability implemented', weight: 'high' },
      { id: '42001-T2', text: 'Model documentation maintained (MLOps)', weight: 'high' },
      { id: '42001-T3', text: 'Training data provenance tracked', weight: 'medium' },
      { id: '42001-T4', text: 'AI system limitations documented', weight: 'high' },
      { id: '42001-T5', text: 'Confidence scores provided with AI outputs', weight: 'medium' },
      { id: '42001-T6', text: 'User disclosure about AI interaction', weight: 'high' },
      { id: '42001-T7', text: 'Audit trail for AI decisions maintained', weight: 'high' },
      { id: '42001-T8', text: 'Explainability tools available for stakeholders', weight: 'medium' }
    ]
  },
  'accountability': {
    id: 'accountability',
    name: 'AI Accountability',
    description: 'Clear responsibility assignment for AI systems',
    criteria: [
      { id: '42001-A1', text: 'AI system owners assigned and documented', weight: 'high' },
      { id: '42001-A2', text: 'AI incident response procedures defined', weight: 'high' },
      { id: '42001-A3', text: 'AI-related incidents reported and tracked', weight: 'high' },
      { id: '42001-A4', text: 'Human oversight of AI decisions ensured', weight: 'high' },
      { id: '42001-A5', text: 'AI system lifecycle responsibilities defined', weight: 'high' },
      { id: '42001-A6', text: 'AI procurement criteria defined', weight: 'medium' },
      { id: '42001-A7', text: 'Third-party AI service agreements reviewed', weight: 'medium' }
    ]
  }
};

const AI_ETHICAL_CRITERIA = {
  fairness: {
    id: 'fairness',
    name: 'Fairness and Non-discrimination',
    description: 'Ensuring AI systems do not perpetuate bias or discrimination',
    checks: [
      { id: 'F1', text: 'Training data bias assessment conducted', weight: 'high' },
      { id: 'F2', text: 'Fairness metrics defined and monitored', weight: 'high' },
      { id: 'F3', text: 'Adverse impact testing performed regularly', weight: 'high' },
      { id: 'F4', text: 'Rejection rate disparity across groups analyzed', weight: 'medium' },
      { id: 'F5', text: 'Algorithmic audit conducted annually', weight: 'high' }
    ]
  },
  privacy: {
    id: 'privacy',
    name: 'Privacy and Data Protection',
    description: 'Protecting personal data in AI systems',
    checks: [
      { id: 'P1', text: 'Data minimization principle applied to AI training', weight: 'high' },
      { id: 'P2', text: 'Consent obtained for data used in AI training', weight: 'high' },
      { id: 'P3', text: 'Personal data anonymization in AI systems', weight: 'high' },
      { id: 'P4', text: 'Data retention limits enforced for AI data', weight: 'medium' },
      { id: 'P5', text: 'Data subject rights respected in AI contexts', weight: 'high' }
    ]
  },
  safety: {
    id: 'safety',
    name: 'AI Safety and Security',
    description: 'Preventing harm from AI systems',
    checks: [
      { id: 'S1', text: 'AI system safety validation performed', weight: 'high' },
      { id: 'S2', text: 'Redundant safeguards implemented for critical AI', weight: 'high' },
      { id: 'S3', text: 'AI system attack surface reduced', weight: 'medium' },
      { id: 'S4', text: 'Fail-safe modes defined for AI systems', weight: 'high' },
      { id: 'S5', text: 'Continuous AI monitoring and logging active', weight: 'high' }
    ]
  }
};

function getEthicalAICriteria(category, projectPath = null) {
  if (!category || category === 'overview') {
    return {
      standard: 'ISO/IEC 42001:2023',
      description: 'AI Management System - Ethical AI criteria',
      categories: Object.entries(AI_ETHICAL_CRITERIA).map(([key, val]) => ({
        id: key,
        name: val.name,
        description: val.description,
        checkCount: val.checks.length
      })),
      totalCriteria: Object.values(AI_ETHICAL_CRITERIA).reduce((sum, c) => sum + c.checks.length, 0)
    };
  }

  const catData = AI_ETHICAL_CRITERIA[category.toLowerCase()];
  if (!catData) {
    throw new Error(`Invalid category: ${category}. Available: ${Object.keys(AI_ETHICAL_CRITERIA).join(', ')}`);
  }

  let projectInfo = null;
  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      projectInfo = getProjectAIContext(facts);
    } catch {
    }
  }

  return {
    standard: 'ISO/IEC 42001:2023',
    category: catData.id,
    name: catData.name,
    description: catData.description,
    checks: catData.checks,
    projectInfo
  };
}

function getProjectAIContext(facts) {
  const { aiUsage, stack } = facts;
  const context = {};

  if (aiUsage.available) {
    context.aiProviders = aiUsage.providers?.map(p => p.name) || [];
    context.aiUseCases = aiUsage.useCases || [];
  }

  if (stack.available) {
    context.stack = {
      framework: stack.framework.id,
      runtime: stack.runtime.id
    };
  }

  return context;
}

function getTransparencyFramework(projectPath = null) {
  const framework = {
    standard: 'ISO/IEC 42001:2023',
    type: 'AI Transparency Framework',
    description: 'Guidelines for achieving AI transparency',
    principles: [
      {
        principle: 'Explainability',
        description: 'AI systems should provide understandable explanations for their decisions',
        implementation: [
          'Document model architecture and training approach',
          'Implement feature importance analysis',
          'Provide decision rationale in accessible format',
          'Maintain model versioning and lineage'
        ]
      },
      {
        principle: 'Traceability',
        description: 'Maintain complete audit trail of AI system lifecycle',
        implementation: [
          'Log all AI model training runs',
          'Track dataset versions and sources',
          'Record inference requests and outcomes',
          'Document system modifications and updates'
        ]
      },
      {
        principle: 'Communication',
        description: 'Clearly communicate AI capabilities and limitations to users',
        implementation: [
          'Disclose when users interact with AI systems',
          'Provide confidence intervals with predictions',
          'Explain uncertainty in AI outputs',
          'Document known limitations and failure modes'
        ]
      }
    ],
    maturityLevels: [
      { level: 1, name: 'Documented', description: 'Basic documentation exists' },
      { level: 2, name: 'Tracked', description: 'Audit trail maintained' },
      { level: 3, name: 'Explained', description: 'Explanations available' },
      { level: 4, name: 'Verified', description: 'Third-party validated' },
      { level: 5, name: 'Optimized', description: 'Continuous improvement' }
    ]
  };

  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      if (facts.stack.available && (facts.stack.packages?.list)) {
        const pkgs = facts.stack.packages.list;
        if (pkgs.includes('openai') || pkgs.includes('langchain')) {
          framework.aiProviders = ['OpenAI API', 'LangChain'];
        }
        if (pkgs.includes('@anthropic-ai/sdk')) {
          framework.aiProviders = framework.aiProviders || [];
          framework.aiProviders.push('Anthropic');
        }
      }
    } catch {
    }
  }

  return framework;
}

function getAccountabilityMechanisms(accountabilityArea, projectPath = null) {
  const areas = {
    governance: {
      name: 'AI Governance Accountability',
      mechanisms: [
        { id: 'GOV-1', mechanism: 'AI steering committee', frequency: 'Monthly' },
        { id: 'GOV-2', mechanism: 'AI policy compliance reporting', frequency: 'Quarterly' },
        { id: 'GOV-3', mechanism: 'AI governance audit', frequency: 'Annual' },
        { id: 'GOV-4', mechanism: 'Board AI oversight review', frequency: 'Annual' }
      ],
      documentation: [
        'AI governance charter',
        'Committee meeting minutes',
        'Policy exception approvals',
        'Annual AI governance report'
      ]
    },
    risk: {
      name: 'AI Risk Management Accountability',
      mechanisms: [
        { id: 'RISK-1', mechanism: 'AI risk register maintenance', frequency: 'Continuous' },
        { id: 'RISK-2', mechanism: 'Quarterly AI risk assessment', frequency: 'Quarterly' },
        { id: 'RISK-3', mechanism: 'AI incident post-mortem', frequency: 'Per incident' },
        { id: 'RISK-4', mechanism: 'Risk mitigation tracking', frequency: 'Monthly' }
      ],
      documentation: [
        'AI risk register',
        'Risk assessment reports',
        'Incident investigation reports',
        'Mitigation action logs'
      ]
    },
    incident: {
      name: 'AI Incident Response Accountability',
      mechanisms: [
        { id: 'INC-1', mechanism: 'AI incident detection and logging', frequency: 'Continuous' },
        { id: 'INC-2', mechanism: 'Incident classification and severity', frequency: 'Per incident' },
        { id: 'INC-3', mechanism: 'Stakeholder notification process', frequency: 'Per incident' },
        { id: 'INC-4', mechanism: 'Post-incident review and lessons learned', frequency: 'Per incident' }
      ],
      documentation: [
        'AI incident log',
        'Classification criteria',
        'Notification procedures',
        'Post-mortem reports'
      ]
    },
    audit: {
      name: 'AI Audit Accountability',
      mechanisms: [
        { id: 'AUD-1', mechanism: 'Internal AI audit', frequency: 'Quarterly' },
        { id: 'AUD-2', mechanism: 'External AI audit', frequency: 'Annual' },
        { id: 'AUD-3', mechanism: 'AI system penetration testing', frequency: 'Annual' },
        { id: 'AUD-4', mechanism: 'Compliance verification', frequency: 'Ongoing' }
      ],
      documentation: [
        'Audit reports',
        'Finding tracker',
        'Remediation plans',
        'Compliance certificates'
      ]
    }
  };

  if (!accountabilityArea) {
    return {
      standard: 'ISO/IEC 42001:2023',
      description: 'AI accountability mechanisms across domains',
      areas: Object.entries(areas).map(([key, val]) => ({
        id: key,
        name: val.name,
        mechanismCount: val.mechanisms.length
      }))
    };
  }

  const areaData = areas[accountabilityArea.toLowerCase()];
  if (!areaData) {
    throw new Error(`Invalid accountability area: ${accountabilityArea}. Available: ${Object.keys(areas).join(', ')}`);
  }

  return {
    standard: 'ISO/IEC 42001:2023',
    area: areaData.name,
    mechanisms: areaData.mechanisms,
    requiredDocumentation: areaData.documentation
  };
}

export { getEthicalAICriteria, getTransparencyFramework, getAccountabilityMechanisms, AI_MANAGEMENT_CATEGORIES, AI_ETHICAL_CRITERIA };