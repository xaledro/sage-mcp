import { inspect } from '../lib/project-intelligence.js';

const PRIVACY_CATEGORIES = {
  'pII-principles': {
    id: 'pII-principles',
    name: 'PII Processing Principles',
    description: 'Fundamental principles for processing personally identifiable information',
    criteria: [
      { id: '27701-1', text: 'PII principle: Lawfulness, fairness, transparency', weight: 'high' },
      { id: '27701-2', text: 'PII principle: Purpose limitation', weight: 'high' },
      { id: '27701-3', text: 'PII principle: Data minimization', weight: 'high' },
      { id: '27701-4', text: 'PII principle: Accuracy', weight: 'medium' },
      { id: '27701-5', text: 'PII principle: Storage limitation', weight: 'high' },
      { id: '27701-6', text: 'PII principle: Integrity and confidentiality', weight: 'high' },
      { id: '27701-7', text: 'PII principle: Accountability', weight: 'high' }
    ]
  },
  'PII-owner': {
    id: 'PII-owner',
    name: 'PII Owner Requirements',
    description: 'Requirements for entities that determine the purpose of PII processing',
    criteria: [
      { id: '27701-8', text: 'Determine legal basis for PII processing', weight: 'high' },
      { id: '27701-9', text: 'Document PII processing purpose', weight: 'high' },
      { id: '27701-10', text: 'Implement consent management', weight: 'high' },
      { id: '27701-11', text: 'PII subject rights implementation', weight: 'high' },
      { id: '27701-12', text: 'Privacy notice publication', weight: 'medium' }
    ]
  },
  'PII-processor': {
    id: 'PII-processor',
    name: 'PII Processor Requirements',
    description: 'Requirements for entities that process PII on behalf of controllers',
    criteria: [
      { id: '27701-13', text: 'Process PII only per instructions', weight: 'high' },
      { id: '27701-14', text: 'Contractual obligations for processors', weight: 'high' },
      { id: '27701-15', text: 'Incident notification to controller', weight: 'high' },
      { id: '27701-16', text: 'PII processor registration', weight: 'medium' },
      { id: '27701-17', text: 'Sub-processor management', weight: 'medium' },
      { id: '27701-18', text: 'Records of processing activities', weight: 'high' }
    ]
  },
  controls: {
    id: 'controls',
    name: 'Privacy Controls (Annex A)',
    description: 'ISO 27701 Annex A privacy control requirements',
    criteria: [
      { id: '27701-A1', text: 'Inventory of PII', weight: 'high' },
      { id: '27701-A2', text: 'Privacy impact assessments', weight: 'high' },
      { id: '27701-A3', text: 'PII sharing agreements', weight: 'high' },
      { id: '27701-A4', text: 'Data breach response procedures', weight: 'high' },
      { id: '27701-A5', text: 'Privacy training for staff', weight: 'medium' },
      { id: '27701-A6', text: 'Data retention policies', weight: 'high' },
      { id: '27701-A7', text: 'PII subject access request handling', weight: 'high' },
      { id: '27701-A8', text: 'Right to erasure procedures', weight: 'high' },
      { id: '27701-A9', text: 'Portability mechanisms', weight: 'medium' },
      { id: '27701-A10', text: 'Automated decision-making disclosures', weight: 'medium' },
      { id: '27701-A11', text: 'Privacy by design implementation', weight: 'high' },
      { id: '27701-A12', text: 'Data protection officer appointment', weight: 'medium' },
      { id: '27701-A13', text: 'Records of consent', weight: 'high' },
      { id: '27701-A14', text: 'Privacy performance metrics', weight: 'low' }
    ]
  }
};

function getPrivacyCheck(category, projectPath = null) {
  if (!category || category === 'overview') {
    return {
      standard: 'ISO/IEC 27701:2019',
      description: 'Privacy extension for ISO 27001 - PII processing',
      categories: Object.values(PRIVACY_CATEGORIES).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        criteriaCount: cat.criteria.length
      })),
      totalCriteria: Object.values(PRIVACY_CATEGORIES).reduce((sum, c) => sum + c.criteria.length, 0)
    };
  }

  const catData = Object.values(PRIVACY_CATEGORIES).find(c => c.id.toLowerCase() === category.toLowerCase());
  if (!catData) {
    throw new Error(`Invalid category: ${category}. Available: ${Object.values(PRIVACY_CATEGORIES).map(c => c.id).join(', ')}`);
  }

  let projectInfo = null;
  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      projectInfo = getProjectPrivacyContext(facts);
    } catch {
    }
  }

  return {
    standard: 'ISO/IEC 27701:2019',
    category: catData.id,
    name: catData.name,
    description: catData.description,
    criteria: catData.criteria,
    scoring: {
      high: 'Critical for privacy compliance',
      medium: 'Important for privacy program',
      low: 'Consider for best practices'
    },
    projectInfo
  };
}

function getProjectPrivacyContext(facts) {
  const { pii, stack } = facts;
  const context = {};

  if (pii.available) {
    context.detectedPII = {
      types: pii.types,
      patternsFound: pii.patterns?.length || 0,
      locations: pii.locations?.slice(0, 5) || []
    };
  }

  if (stack.available) {
    context.stack = {
      framework: stack.framework.id,
      runtime: stack.runtime.id
    };
    if (stack.runtime.id === 'supabase') {
      context.note = 'Supabase provides built-in RLS and auth - check privacy configuration';
    }
  }

  return context;
}

function getPiaTemplate(scenario, dataTypes, processingPurpose, legalBasis, recipients = []) {
  const legalBasisLabels = {
    consent: 'Consent - Subject has given explicit consent',
    contract: 'Contract - Necessary for contract performance',
    legal: 'Legal obligation - Required by law',
    vital: 'Vital interest - Necessary to protect life',
    public: 'Public task - Carried out in public interest'
  };

  return {
    standard: 'ISO/IEC 27701:2019',
    type: 'Privacy Impact Assessment (PIA)',
    template: true,
    sections: [
      {
        id: '1',
        title: 'Project Context',
        content: `## Project Context

### Processing Scenario
${scenario || '[Describe the PII processing scenario]'}

### Data Types
${(dataTypes || []).map(t => `- ${t}`).join('\n') || '- [List data types]'}

### Processing Purpose
${processingPurpose || '[Describe the purpose]'}

### Legal Basis
${legalBasisLabels[legalBasis] || legalBasis}

### Recipients
${(recipients || []).map(r => `- ${r}`).join('\n') || '- [List third parties]'}
`
      },
      {
        id: '2',
        title: 'Data Inventory',
        content: `## Data Inventory

| Data Item | Category | Sensitivity | Retention | Access |
|-----------|----------|------------|-----------|--------|
| [Item] | [PII/Non-PII] | [High/Medium/Low] | [Period] | [Who] |

### Data Flow
\`\`\`
[Subject] --> [Collection] --> [Storage] --> [Processing] --> [Disclosure] --> [Deletion]
\`\`\`
`
      },
      {
        id: '3',
        title: 'Purpose Analysis',
        content: `## Purpose Analysis

### Primary Purpose
${processingPurpose || '[Primary purpose]'}

### Secondary Use
- [ ] Data may be used for secondary purposes

### Purpose Compatibility Check
| New Purpose | Compatible? | Justification |
|-------------|-------------|---------------|
| [Purpose] | [Yes/No] | [Rationale] |
`
      },
      {
        id: '4',
        title: 'Risk Assessment',
        content: `## Risk Assessment

| Risk | Likelihood | Impact | Risk Level | Mitigation |
|------|------------|--------|------------|------------|
| Unauthorized access | [H/M/L] | [H/M/L] | [H/M/L] | [Measure] |
| Data breach | [H/M/L] | [H/M/L] | [H/M/L] | [Measure] |
| Non-compliance | [H/M/L] | [H/M/L] | [H/M/L] | [Measure] |

### Overall Risk Score: [H/M/L]
`
      },
      {
        id: '5',
        title: 'Mitigation Measures',
        content: `## Mitigation Measures

| Measure | Type | Implementation | Status |
|---------|------|----------------|--------|
| [Measure] | [Technical/Organizational] | [How] | [Planned/Implemented] |

### Technical Controls
- Encryption at rest
- Access controls (RBAC)
- Audit logging

### Organizational Controls
- Privacy training
- Data handling procedures
- Incident response plan
`
      },
      {
        id: '6',
        title: 'Approval',
        content: `## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Privacy Lead | | | |
| DPO | | | |
| Project Owner | | | |

### Next Review Date: [Date]
`
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

function getDpiaTemplate(processingType, riskLevel, hasExistingAssessment) {
  const processingTypeLabels = {
    systematic: 'Systematic monitoring of publicly accessible areas',
    'large-scale': 'Large-scale processing of personal data',
    'vulnerable-subjects': 'Processing data concerning vulnerable subjects',
    innovation: 'Innovation using new technologies',
    biometric: 'Biometric data processing',
    location: 'Location tracking data processing'
  };

  return {
    standard: 'ISO/IEC 27701:2019',
    type: 'Data Protection Impact Assessment (DPIA)',
    processingType: processingTypeLabels[processingType] || processingType,
    riskLevel: riskLevel || 'high',
    requiresDPIA: true,
    template: true,
    sections: [
      {
        id: '1',
        title: 'DPIA Trigger Analysis',
        content: `## DPIA Trigger Analysis

### Processing Type
${processingTypeLabels[processingType] || processingType}

### Risk Level
${riskLevel === 'very-high' ? 'VERY HIGH - DPIA mandatory, consult supervisory authority' :
  riskLevel === 'high' ? 'HIGH - DPIA mandatory, may need prior consultation' :
  'MEDIUM/LOW - DPIA recommended'}

### Existing Assessment
${hasExistingAssessment ? 'Previous DPIA exists - verify still valid' : 'No existing assessment - full DPIA required'}
`
      },
      {
        id: '2',
        title: 'Necessity and Proportionality',
        content: `## Necessity and Proportionality

### Justification
| Aspect | Assessment |
|--------|------------|
| Necessity | Why is this processing necessary? |
| Proportionality | Is the data proportionate to the purpose? |
| Less intrusive alternative | Could a less intrusive approach achieve the same goal? |

### Minimum Data Principle
- [ ] Only data strictly necessary is collected
- [ ] Data is not retained beyond necessity
- [ ] Access is limited to minimum required
`
      },
      {
        id: '3',
        title: 'Risk Assessment Matrix',
        content: `## Risk Assessment Matrix

| Risk | Probability | Impact | Inherent Risk | Controls | Residual Risk |
|------|------------|--------|--------------|----------|---------------|
| R1: Data breach | [H/M/L] | [H/M/L] | [H/M/L] | [C1, C2] | [H/M/L] |
| R2: Unauthorized access | [H/M/L] | [H/M/L] | [H/M/L] | [C3] | [H/M/L] |
| R3: Rights violation | [H/M/L] | [H/M/L] | [H/M/L] | [C4, C5] | [H/M/L] |
| R4: Profiling harm | [H/M/L] | [H/M/L] | [H/M/L] | [C6] | [H/M/L] |
`
      },
      {
        id: '4',
        title: 'Consultation Process',
        content: `## Consultation Process

### Required Consultations
| Stakeholder | When | Status |
|-------------|------|--------|
| DPO | Before processing | [Pending/Completed] |
| Supervisory Authority | If very high risk | [Required/Not required] |
| Data Subjects | If appropriate | [Planned/Not planned] |

### DPO Opinion
_Opinion of Data Protection Officer_
`
      },
      {
        id: '5',
        title: 'Mitigation Plan',
        content: `## Mitigation Plan

### Technical Measures
| Measure | Implementation | Timeline | Owner |
|---------|----------------|----------|-------|
| Encryption | [Type] | [Date] | [Name] |
| Access Control | RBAC | [Date] | [Name] |
| Monitoring | SIEM | [Date] | [Name] |

### Organizational Measures
| Measure | Implementation | Timeline | Owner |
|---------|----------------|----------|-------|
| Training | Annual | [Date] | [Name] |
| Procedures | Privacy by design | [Date] | [Name] |

### Residual Risk Approval
_If residual risk remains high, prior consultation with supervisory authority is mandatory_
`
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

export { getPrivacyCheck, getPiaTemplate, getDpiaTemplate, PRIVACY_CATEGORIES };