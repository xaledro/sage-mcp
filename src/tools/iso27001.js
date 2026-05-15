import { inspect } from '../lib/project-intelligence.js';

const ISO27001_CONTROLS = {
  organizational: {
    id: 'organizational',
    name: 'Organizational Controls',
    description: 'Controls for organizational aspects of information security',
    controls: [
      { id: 'A.5.1', text: 'Policies for information security', weight: 'high', domain: 'Policy' },
      { id: 'A.5.2', text: 'Review of policies for information security', weight: 'medium', domain: 'Policy' },
      { id: 'A.5.3', text: 'Separation of duties', weight: 'high', domain: 'Organization' },
      { id: 'A.5.4', text: 'Management responsibilities', weight: 'high', domain: 'Organization' },
      { id: 'A.5.5', text: 'Contact with authorities', weight: 'medium', domain: 'Organization' },
      { id: 'A.5.6', text: 'Contact with special interest groups', weight: 'low', domain: 'Organization' },
      { id: 'A.5.7', text: 'Threat intelligence', weight: 'medium', domain: 'Organization' },
      { id: 'A.5.8', text: 'Information security in project management', weight: 'high', domain: 'Organization' },
      { id: 'A.5.9', text: 'Inventory of assets', weight: 'high', domain: 'Asset' },
      { id: 'A.5.10', text: 'Acceptable use of assets', weight: 'medium', domain: 'Asset' },
      { id: 'A.5.11', text: 'Return of assets', weight: 'medium', domain: 'Asset' },
      { id: 'A.5.12', text: 'Classification of information', weight: 'high', domain: 'Asset' },
      { id: 'A.5.13', text: 'Labeling of information', weight: 'medium', domain: 'Asset' },
      { id: 'A.5.14', text: 'Information transfer', weight: 'high', domain: 'Asset' },
      { id: 'A.5.15', text: 'Access control policy', weight: 'high', domain: 'Access' },
      { id: 'A.5.16', text: 'Change management', weight: 'high', domain: 'Organization' },
      { id: 'A.5.17', text: 'Information security awareness', weight: 'high', domain: 'Training' },
      { id: 'A.5.18', text: 'Competence and education', weight: 'medium', domain: 'Training' },
      { id: 'A.5.19', text: 'Remote work', weight: 'medium', domain: 'Organization' },
      { id: 'A.5.20', text: 'Information security during employment', weight: 'high', domain: 'HR' }
    ]
  },
  people: {
    id: 'people',
    name: 'People Controls',
    description: 'Controls related to personnel security',
    controls: [
      { id: 'A.6.1', text: 'Background verification checks', weight: 'high', domain: 'HR' },
      { id: 'A.6.2', text: 'Terms and conditions of employment', weight: 'medium', domain: 'HR' },
      { id: 'A.6.3', text: 'Information security awareness, education and training', weight: 'high', domain: 'Training' },
      { id: 'A.6.4', text: 'Disciplinary process', weight: 'medium', domain: 'HR' },
      { id: 'A.6.5', text: 'Termination responsibilities', weight: 'high', domain: 'HR' },
      { id: 'A.6.6', text: 'Mobile device policy', weight: 'high', domain: 'Device' },
      { id: 'A.6.7', text: 'Remote work policy', weight: 'medium', domain: 'Device' }
    ]
  },
  physical: {
    id: 'physical',
    name: 'Physical Controls',
    description: 'Controls for physical information security',
    controls: [
      { id: 'A.7.1', text: 'Physical security perimeter', weight: 'high', domain: 'Physical' },
      { id: 'A.7.2', text: 'Physical entry', weight: 'high', domain: 'Physical' },
      { id: 'A.7.3', text: 'Securing offices, rooms and facilities', weight: 'high', domain: 'Physical' },
      { id: 'A.7.4', text: 'Protection against physical and environmental threats', weight: 'medium', domain: 'Physical' },
      { id: 'A.7.5', text: 'Working in secure areas', weight: 'medium', domain: 'Physical' },
      { id: 'A.7.6', text: 'Delivery and removal of assets', weight: 'medium', domain: 'Physical' },
      { id: 'A.8.1', text: 'Equipment maintenance', weight: 'medium', domain: 'Equipment' },
      { id: 'A.8.2', text: 'Asset disposal', weight: 'high', domain: 'Equipment' },
      { id: 'A.8.3', text: 'Equipment security policies', weight: 'high', domain: 'Equipment' }
    ]
  },
  technological: {
    id: 'technological',
    name: 'Technological Controls',
    description: 'Technical controls for information security',
    controls: [
      { id: 'A.8.4', text: 'Information security policies', weight: 'high', domain: 'Technical' },
      { id: 'A.8.5', text: 'Secure authentication', weight: 'high', domain: 'Access' },
      { id: 'A.8.6', text: 'Capacity management', weight: 'medium', domain: 'Technical' },
      { id: 'A.8.7', text: 'Protection against malware', weight: 'high', domain: 'Security' },
      { id: 'A.8.8', text: 'Backup', weight: 'high', domain: 'Availability' },
      { id: 'A.8.9', text: 'Logging and monitoring', weight: 'high', domain: 'Security' },
      { id: 'A.8.10', text: 'Network security', weight: 'high', domain: 'Network' },
      { id: 'A.8.11', text: 'Cryptography', weight: 'high', domain: 'Security' },
      { id: 'A.8.12', text: 'Secure development lifecycle', weight: 'high', domain: 'Development' },
      { id: 'A.8.13', text: 'Input validation', weight: 'high', domain: 'Security' },
      { id: 'A.8.14', text: 'Vulnerability management', weight: 'high', domain: 'Security' },
      { id: 'A.8.15', text: 'Penetration testing', weight: 'medium', domain: 'Security' }
    ]
  }
};

function getControls(theme, projectPath = null) {
  if (!theme || theme === 'overview') {
    return {
      standard: 'ISO/IEC 27001:2022',
      version: '2022',
      description: 'Information Security Management System - 93 controls in 4 themes',
      themes: Object.values(ISO27001_CONTROLS).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        controlCount: t.controls.length
      })),
      totalControls: 93,
      breakdown: {
        organizational: 20,
        people: 7,
        physical: 9,
        technological: 13
      }
    };
  }

  const themeData = ISO27001_CONTROLS[theme.toLowerCase()];
  if (!themeData) {
    throw new Error(`Invalid theme: ${theme}. Available: ${Object.keys(ISO27001_CONTROLS).join(', ')}`);
  }

  let projectInfo = null;
  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      projectInfo = getProjectSecurityContext(facts);
    } catch {
    }
  }

  return {
    standard: 'ISO/IEC 27001:2022',
    theme: themeData.id,
    name: themeData.name,
    description: themeData.description,
    controls: themeData.controls,
    totalControls: themeData.controls.length,
    projectInfo
  };
}

function getProjectSecurityContext(facts) {
  const { stack, backend } = facts;
  const context = {};

  if (stack.available) {
    context.stack = {
      framework: stack.framework.id,
      bundler: stack.bundler.id,
      runtime: stack.runtime.id
    };

    if (stack.runtime.id === 'supabase') {
      context.securityFeatures = [
        'Supabase Auth - managed authentication',
        'Row Level Security (RLS) - database access control',
        'SSL enforced - data in transit encrypted'
      ];
    }
  }

  if (backend.available) {
    context.backend = {
      hasPrisma: !!backend.prisma,
      hasTrpc: !!backend.trpc,
      hasSupabase: !!backend.supabase
    };
  }

  return context;
}

function getSoaTemplate() {
  return {
    standard: 'ISO/IEC 27001:2022',
    type: 'Statement of Applicability (SoA)',
    description: 'Template for documenting applicable controls',
    sections: [
      {
        title: 'Control Implementation',
        content: `## Statement of Applicability

### Control Selection Criteria
- [ ] Business requirements
- [ ] Legal and regulatory requirements
- [ ] Contractual requirements
- [ ] Threat landscape

### Applicable Controls

| Control ID | Control | Applicable | Implementation | Evidence |
|------------|---------|------------|----------------|----------|
| A.5.1 | Policies for information security | [Yes/No] | [How] | [Doc] |
| A.5.2 | Review of policies | [Yes/No] | [How] | [Doc] |
| A.5.3 | Separation of duties | [Yes/No] | [How] | [Doc] |

### Excluded Controls Justification

| Control ID | Reason for Exclusion |
|------------|---------------------|
| [ID] | [Justification] |
`
      },
      {
        title: 'Annex A Controls Mapping',
        content: `## Annex A Mapping

### A.5 Organizational Controls (20 controls)
| ID | Control | Impl | Not App |
|----|---------|------|--------|
| A.5.1 | Policies | O | |
| A.5.2 | Review | O | |

### A.6 People Controls (7 controls)
| ID | Control | Impl | Not App |
|----|---------|------|--------|
| A.6.1 | Background checks | O | |

### A.7 Physical Controls (9 controls)
| ID | Control | Impl | Not App |
|----|---------|------|--------|
| A.7.1 | Security perimeter | O | |

### A.8 Technological Controls (34 controls)
| ID | Control | Impl | Not App |
|----|---------|------|--------|
| A.8.4 | Info sec policies | O | |
`
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

function getIsmsFramework() {
  return {
    standard: 'ISO/IEC 27001:2022',
    type: 'Information Security Management System (ISMS)',
    description: 'Complete ISMS framework structure',
    phases: [
      {
        id: '1',
        name: 'Context Establishment',
        activities: [
          'Define scope of ISMS',
          'Identify interested parties',
          'Determine legal and regulatory requirements',
          'Establish ISMS policy'
        ]
      },
      {
        id: '2',
        name: 'Leadership',
        activities: [
          'Top management commitment',
          'Information security policy',
          'Roles and responsibilities',
          'Security awareness program'
        ]
      },
      {
        id: '3',
        name: 'Planning',
        activities: [
          'Risk assessment methodology',
          'Identify risks',
          'Analyze and evaluate risks',
          'Treatment options',
          'Select controls'
        ]
      },
      {
        id: '4',
        name: 'Support',
        activities: [
          'Resource allocation',
          'Competence and training',
          'Awareness communication',
          'Documentation requirements'
        ]
      },
      {
        id: '5',
        name: 'Operation',
        activities: [
          'Risk treatment implementation',
          'Control operation',
          'Incident management',
          'Business continuity'
        ]
      },
      {
        id: '6',
        name: 'Performance Evaluation',
        activities: [
          'Monitoring and measurement',
          'Internal audit',
          'Management review',
          'Continual improvement'
        ]
      }
    ],
    generatedAt: new Date().toISOString()
  };
}

export { getControls, getSoaTemplate, getIsmsFramework, ISO27001_CONTROLS };