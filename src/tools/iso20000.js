import { inspect } from '../lib/project-intelligence.js';

const SERVICE_MANAGEMENT_PROCESSES = {
  'service-strategy': {
    id: 'service-strategy',
    name: 'Service Strategy',
    description: 'Defining strategy for service management',
    processes: [
      { id: 'SS-1', text: 'Strategy management', weight: 'high' },
      { id: 'SS-2', text: 'Service portfolio management', weight: 'high' },
      { id: 'SS-3', text: 'Demand management', weight: 'medium' },
      { id: 'SS-4', text: 'Business relationship management', weight: 'high' }
    ]
  },
  'service-design': {
    id: 'service-design',
    name: 'Service Design',
    description: 'Designing new or changed services',
    processes: [
      { id: 'SD-1', text: 'Design coordination', weight: 'high' },
      { id: 'SD-2', text: 'Service catalogue management', weight: 'high' },
      { id: 'SD-3', text: 'Service level management', weight: 'high' },
      { id: 'SD-4', text: 'Availability management', weight: 'high' },
      { id: 'SD-5', text: 'Capacity management', weight: 'medium' },
      { id: 'SD-6', text: 'IT service continuity management', weight: 'high' },
      { id: 'SD-7', text: 'Information security management', weight: 'high' },
      { id: 'SD-8', text: 'Supplier management', weight: 'medium' }
    ]
  },
  'service-transition': {
    id: 'service-transition',
    name: 'Service Transition',
    description: 'Transitioning services to operation',
    processes: [
      { id: 'ST-1', text: 'Transition planning and support', weight: 'high' },
      { id: 'ST-2', text: 'Change management', weight: 'high' },
      { id: 'ST-3', text: 'Service asset and configuration management', weight: 'high' },
      { id: 'ST-4', text: 'Release and deployment management', weight: 'high' },
      { id: 'ST-5', text: 'Service validation and testing', weight: 'medium' },
      { id: 'ST-6', text: 'Change evaluation', weight: 'medium' },
      { id: 'ST-7', text: 'Knowledge management', weight: 'medium' }
    ]
  },
  'service-operation': {
    id: 'service-operation',
    name: 'Service Operation',
    description: 'Managing day-to-day operations',
    processes: [
      { id: 'SO-1', text: 'Event management', weight: 'high' },
      { id: 'SO-2', text: 'Incident management', weight: 'high' },
      { id: 'SO-3', text: 'Request fulfillment', weight: 'high' },
      { id: 'SO-4', text: 'Problem management', weight: 'high' },
      { id: 'SO-5', text: 'Access management', weight: 'high' },
      { id: 'SO-6', text: 'Service desk', weight: 'high' },
      { id: 'SO-7', text: 'Monitoring and reporting', weight: 'medium' }
    ]
  },
  'continual-service-improvement': {
    id: 'continual-service-improvement',
    name: 'Continual Service Improvement',
    description: 'Continual improvement of services',
    processes: [
      { id: 'CSI-1', text: 'CSI register', weight: 'medium' },
      { id: 'CSI-2', text: 'Improvement reporting', weight: 'medium' },
      { id: 'CSI-3', text: 'Service improvement plan', weight: 'high' },
      { id: 'CSI-4', text: 'Measurement and metrics', weight: 'high' }
    ]
  }
};

function getServiceLevelAgreement(slaType, projectPath = null) {
  const slaTypes = {
    'response-time': {
      name: 'Response Time SLA',
      description: 'Service response time commitments',
      metrics: [
        { metric: 'Critical incidents', target: '15 minutes', measurement: 'First response' },
        { metric: 'High priority', target: '1 hour', measurement: 'First response' },
        { metric: 'Medium priority', target: '4 hours', measurement: 'First response' },
        { metric: 'Low priority', target: '8 hours', measurement: 'First response' }
      ]
    },
    'availability': {
      name: 'Availability SLA',
      description: 'Service availability commitments',
      metrics: [
        { metric: 'Core services', target: '99.9%', measurement: 'Monthly uptime' },
        { metric: 'Non-core services', target: '99.5%', measurement: 'Monthly uptime' },
        { metric: 'Planned maintenance', target: '<4h/month', measurement: 'Scheduled downtime' }
      ]
    },
    'resolution': {
      name: 'Resolution Time SLA',
      description: 'Incident resolution time commitments',
      metrics: [
        { metric: 'Critical (P1)', target: '4 hours', measurement: 'Mean time to resolve' },
        { metric: 'High (P2)', target: '8 hours', measurement: 'Mean time to resolve' },
        { metric: 'Medium (P3)', target: '24 hours', measurement: 'Mean time to resolve' },
        { metric: 'Low (P4)', target: '72 hours', measurement: 'Mean time to resolve' }
      ]
    }
  };

  if (!slaType) {
    return {
      standard: 'ISO/IEC 20000-1:2018',
      description: 'IT Service Management SLA templates',
      types: Object.entries(slaTypes).map(([key, val]) => ({
        id: key,
        name: val.name,
        description: val.description,
        metricCount: val.metrics.length
      }))
    };
  }

  const sla = slaTypes[slaType.toLowerCase()];
  if (!sla) {
    throw new Error(`Invalid SLA type: ${slaType}. Available: ${Object.keys(slaTypes).join(', ')}`);
  }

  let projectInfo = null;
  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      if (facts.stack.available) {
        projectInfo = {
          stack: facts.stack.framework.id,
          runtime: facts.stack.runtime.id
        };
      }
    } catch {
    }
  }

  return {
    standard: 'ISO/IEC 20000-1:2018',
    type: sla.name,
    description: sla.description,
    metrics: sla.metrics,
    projectInfo
  };
}

function getServiceDefinition(serviceType, projectPath = null) {
  const serviceTypes = {
    'software-development': {
      id: 'software-development',
      name: 'Software Development Service',
      description: 'Custom software development and maintenance',
      components: [
        { name: 'Requirements analysis', deliverable: 'SRS document' },
        { name: 'Design', deliverable: 'Architecture documents' },
        { name: 'Implementation', deliverable: 'Source code' },
        { name: 'Testing', deliverable: 'Test reports' },
        { name: 'Deployment', deliverable: 'Deployed service' },
        { name: 'Maintenance', deliverable: 'Bug fixes, updates' }
      ],
      metrics: [
        { metric: 'Defect density', target: '<5 per KLOC' },
        { metric: 'Code review coverage', target: '>80%' },
        { metric: 'Test coverage', target: '>70%' },
        { metric: 'On-time delivery', target: '>90%' }
      ]
    },
    'infrastructure': {
      id: 'infrastructure',
      name: 'Infrastructure Service',
      description: 'IT infrastructure management',
      components: [
        { name: 'Server management', deliverable: 'Uptime report' },
        { name: 'Network management', deliverable: 'Network status' },
        { name: 'Security management', deliverable: 'Security reports' },
        { name: 'Backup management', deliverable: 'Backup verification' },
        { name: 'Monitoring', deliverable: 'Alert reports' }
      ],
      metrics: [
        { metric: 'Availability', target: '99.9%' },
        { metric: 'Mean time between failures', target: '>720h' },
        { metric: 'Recovery time objective', target: '<4h' }
      ]
    },
    'support': {
      id: 'support',
      name: 'IT Support Service',
      description: 'Technical support and helpdesk',
      components: [
        { name: 'First-line support', deliverable: 'Ticket resolution' },
        { name: 'Second-line support', deliverable: 'Technical fixes' },
        { name: 'Third-line support', deliverable: 'Expert resolution' },
        { name: 'Knowledge management', deliverable: 'KB articles' }
      ],
      metrics: [
        { metric: 'First call resolution', target: '>70%' },
        { metric: 'Ticket response time', target: '<30min' },
        { metric: 'Customer satisfaction', target: '>4.5/5' }
      ]
    }
  };

  if (!serviceType) {
    return {
      standard: 'ISO/IEC 20000-1:2018',
      description: 'Service definitions for IT service management',
      types: Object.entries(serviceTypes).map(([key, val]) => ({
        id: key,
        name: val.name,
        description: val.description,
        componentCount: val.components.length
      }))
    };
  }

  const service = serviceTypes[serviceType.toLowerCase()];
  if (!service) {
    throw new Error(`Invalid service type: ${serviceType}. Available: ${Object.keys(serviceTypes).join(', ')}`);
  }

  return {
    standard: 'ISO/IEC 20000-1:2018',
    name: service.name,
    description: service.description,
    components: service.components,
    metrics: service.metrics
  };
}

function getProcessDocumentation(processId, projectPath = null) {
  const processes = SERVICE_MANAGEMENT_PROCESSES;

  if (!processId) {
    return {
      standard: 'ISO/IEC 20000-1:2018',
      description: 'IT Service Management processes',
      processes: Object.values(processes).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        processCount: p.processes.length
      })),
      totalProcesses: Object.values(processes).reduce((sum, p) => sum + p.processes.length, 0)
    };
  }

  const processKey = processId.toLowerCase().replace(/-/g, '');
  const processData = Object.values(processes).find(p =>
    p.id.toLowerCase().replace(/-/g, '') === processKey
  );

  if (!processData) {
    return {
      standard: 'ISO/IEC 20000-1:2018',
      error: true,
      message: `Process not found: ${processId}`,
      availableProcesses: Object.values(processes).map(p => p.id)
    };
  }

  return {
    standard: 'ISO/IEC 20000-1:2018',
    process: processData,
    documentation: {
      purpose: `Provide guidance for implementing ${processData.name}`,
      inputs: ['Service strategy decisions', 'Customer requirements', 'Performance data'],
      outputs: ['Process reports', 'Improvement recommendations', 'Compliance evidence'],
      activities: processData.processes.map(p => ({
        id: p.id,
        activity: p.text,
        weight: p.weight,
        templates: getProcessTemplates(p.id)
      }))
    }
  };
}

function getProcessTemplates(processId) {
  const templates = {
    'SO-2': {
      name: 'Incident Management Process',
      steps: [
        'Detect and record incident',
        'Categorize and prioritize',
        'Investigate and diagnose',
        'Resolve and close',
        'Escalate if needed'
      ],
      roles: ['Service Desk', 'Technical Support', 'Problem Manager']
    },
    'SO-3': {
      name: 'Request Fulfillment Process',
      steps: [
        'Receive request',
        'Authorize request',
        'Fulfill request',
        'Verify fulfillment',
        'Close request'
      ],
      roles: ['Service Desk', 'Request Fulfillment Team']
    },
    'ST-2': {
      name: 'Change Management Process',
      steps: [
        'Submit change request',
        'Assess impact',
        'Authorize change',
        'Plan and schedule',
        'Implement change',
        'Review and close'
      ],
      roles: ['Change Manager', 'Change Advisory Board', 'Implementer']
    }
  };

  return templates[processId] || null;
}

export { getServiceLevelAgreement, getServiceDefinition, getProcessDocumentation, SERVICE_MANAGEMENT_PROCESSES };