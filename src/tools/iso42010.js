import { inspect } from '../lib/project-intelligence.js';

const iso42010Views = {
  logical: {
    name: "Logical View",
    viewpoint: "logical",
    description: "Shows the structure of the system - the elements that cooperate to provide the system's functionality",
    concerns: ["Functionality", "Structure", "Layering", "Partitioning", "Dependencies"],
    elements: [
      { type: "system", name: "System", description: "The complete system under design" },
      { type: "subsystem", name: "Subsystem", description: "Major structural division" },
      { type: "component", name: "Component", description: "Principal software elements" },
      { type: "interface", name: "Interface", description: "Public contracts between components" },
      { type: "dependency", name: "Dependency", description: "Relationships between elements" }
    ],
    notation: "Component diagram, Package diagram, Class diagram",
    template: `## Logical View

### Overview
[Describe the logical structure of the system]

### Architecture Style
[Describe the chosen architectural style]

### Key Abstractions
| Element | Responsibility | Public Interface |
|---------|---------------|------------------|
| [Name] | [What it does] | [APIs provided] |

### Decomposition Structure
\`\`\`
[Component hierarchy diagram]
\`\`\`

### Dependencies
| From | To | Type |
|------|----|------|
| [Component A] | [Component B] | [uses/extends/inherits] |

### Interfaces
| Interface | Operations | Used By |
|-----------|-----------|---------|
| [Name] | [Operation list] | [Consumer list] |`
  },
  deployment: {
    name: "Deployment View",
    viewpoint: "deployment",
    description: "Shows the runtime environment and how software is allocated to processing nodes",
    concerns: ["Infrastructure", "Distribution", "Performance", "Scalability", "Availability"],
    elements: [
      { type: "node", name: "Node", description: "Processing element with memory and processing capability" },
      { type: "artifact", name: "Artifact", description: "Physical piece of information" },
      { type: "connection", name: "Connection", description: "Communication path between nodes" },
      { type: "deployment", name: "Deployment", description: "Assignment of artifacts to nodes" }
    ],
    notation: "Deployment diagram, Infrastructure diagram",
    template: `## Deployment View

### Overview
[Describe the deployment topology]

### Infrastructure
| Node | Type | Capabilities | Location |
|------|------|--------------|----------|
| [Name] | [Server/Container/Cloud] | [CPU/Memory] | [Region/AZ] |

### Deployment Topology
\`\`\`
[Deployment diagram showing nodes and connections]
\`\`\`

### Deployment Scenarios
| Scenario | Description | Nodes Involved |
|----------|-------------|----------------|
| Development | Local dev setup | [Nodes] |
| Staging | Pre-production | [Nodes] |
| Production | Live environment | [Nodes] |

### Scaling Strategy
- Horizontal scaling for stateless services
- Database clustering for persistence
- CDN for static assets

### High Availability
- Multi-AZ deployment
- Load balancer configuration
- Failover mechanisms`
  },
  operational: {
    name: "Operational View",
    viewpoint: "operational",
    description: "Shows how the system operates in its environment - the operational characteristics",
    concerns: ["Operational Management", "Support", "Installation", "Configuration", "Monitoring"],
    elements: [
      { type: "process", name: "Process", description: "Execution unit in a node" },
      { type: "thread", name: "Thread", description: "Lightweight process" },
      { type: "event", name: "Event", description: "Signal that triggers behavior" },
      { type: "constraint", name: "Constraint", description: "Operational limitation" }
    ],
    notation: "Process diagram, Activity diagram, State diagram",
    template: `## Operational View

### Overview
[Describe the operational characteristics]

### Operational Scenarios
| Scenario | Trigger | Behavior | Expected Duration |
|----------|---------|----------|-------------------|
| [Name] | [Event] | [Action] | [Time] |

### Process Architecture
\`\`\`
[Process/thread diagram]
\`\`\`

### Event Handling
| Event | Source | Handler | Response |
|-------|--------|---------|----------|
| [Name] | [Who generates] | [Who handles] | [Action] |

### Operational Policies
- Backup frequency: [schedule]
- Recovery procedure: [steps]
- Monitoring intervals: [frequency]

### Support Procedures
| Procedure | Trigger | Steps |
|-----------|---------|-------|
| [Name] | [When] | [How] |`
  },
  data: {
    name: "Data View",
    viewpoint: "data",
    description: "Shows the persistent data architecture and information management",
    concerns: ["Data Integrity", "Data Retention", "Data Exchange", "Data Privacy"],
    elements: [
      { type: "datastore", name: "Data Store", description: "Persistent data repository" },
      { type: "dataflow", name: "Data Flow", description: "Movement of data between stores" },
      { type: "schema", name: "Schema", description: "Structure of stored data" },
      { type: "migration", name: "Migration", description: "Data transformation rules" }
    ],
    notation: "ER diagram, Data flow diagram",
    template: `## Data View

### Overview
[Describe the data architecture]

### Data Stores
| Store | Type | Schema | Retention |
|-------|------|--------|----------|
| [Name] | [SQL/NoSQL/File] | [Schema name] | [Period] |

### Data Flow
\`\`\`
[Data flow diagram]
\`\`\`

### Data Ownership
| Data | Owner | Access | Backup |
|------|-------|--------|--------|
| [Name] | [Role] | [Read/Write] | [Schedule] |

### Data Migration
| From | To | Transformation | Schedule |
|------|----|---------------|----------|
| [Source] | [Target] | [Rules] | [When] |`
  },
  security: {
    name: "Security View",
    viewpoint: "security",
    description: "Shows the security architecture and security-relevant decisions",
    concerns: ["Confidentiality", "Integrity", "Availability", "Accountability", "Non-repudiation"],
    elements: [
      { type: "asset", name: "Asset", description: "Item of value requiring protection" },
      { type: "threat", name: "Threat", description: "Potential security violation" },
      { type: "control", name: "Control", description: "Security mechanism" },
      { type: "vulnerability", name: "Vulnerability", description: "Weakness that can be exploited" }
    ],
    notation: "Threat model diagram, Security architecture diagram",
    template: `## Security View

### Overview
[Describe the security architecture]

### Security Strategy
| Principle | Implementation |
|-----------|----------------|
| Defense in Depth | [Multiple layers] |
| Least Privilege | [Permission model] |
| Zero Trust | [Verification at each step] |

### Assets and Threats
| Asset | Value | Threats | Controls |
|-------|-------|---------|----------|
| [Name] | [Importance] | [Threat list] | [Mitigations] |

### Security Controls
| Control | Type | Implementation | Coverage |
|---------|------|----------------|----------|
| [Name] | [Prevent/Detect/Respond] | [How] | [What it protects] |

### Compliance
- [Standard/Regulation]: [Status]
- Audit date: [When]
- Last review: [Date]`
  }
};

function getIso42010View(viewName, config = {}, projectPath = null) {
  const viewKey = viewName?.toLowerCase();
  const view = iso42010Views[viewKey];

  if (!view) {
    throw new Error(`Unknown view: ${viewName}. Available: ${Object.keys(iso42010Views).join(', ')}`);
  }

  let personalizedView = { ...view };

  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      personalizedView = personalizeView(viewKey, personalizedView, facts);
    } catch {
    }
  }

  return {
    ...personalizedView,
    configuration: config,
    generatedAt: new Date().toISOString()
  };
}

function personalizeView(viewKey, view, facts) {
  const { stack, modules, backend } = facts;
  const personalized = { ...view };

  if (viewKey === 'deployment') {
    personalized.template = personalizeDeploymentViewTemplate(view.template, stack, backend);
  }

  if (viewKey === 'logical') {
    personalized.template = personalizeLogicalViewTemplate(view.template, modules, stack);
  }

  if (viewKey === 'operational') {
    personalized.template = personalizeOperationalViewTemplate(view.template, stack);
  }

  return personalized;
}

function personalizeDeploymentViewTemplate(template, stack, backend) {
  let result = template;

  if (stack.available) {
    const infraNodes = buildInfraNodes(stack, backend);
    result = result.replace(
      /\| \[Name\] \| \[Server\/Container\/Cloud\] \| \[CPU\/Memory\] \| \[Region\/AZ\] \|/g,
      infraNodes
    );

    const scalingStrategy = buildScalingStrategy(stack);
    result = result.replace(
      /- Horizontal scaling for stateless services/g,
      scalingStrategy
    );
  }

  return result;
}

function buildInfraNodes(stack, backend) {
  const nodes = [];

  if (stack.bundler.id === 'vercel' || stack.framework.id !== 'unknown') {
    nodes.push('| Vercel Edge | Cloud CDN | Global distribution | Worldwide |');
  }

  if (stack.runtime.id === 'supabase' || (backend.available && backend.supabase)) {
    nodes.push('| Supabase Cloud | PostgreSQL + Auth | 2 vCPU, 1GB RAM | us-east-1 |');
  }

  if (stack.runtime.id === 'deno' || (backend.available && backend.deno)) {
    nodes.push('| Deno Deploy | Edge Functions | Serverless | Global |');
  }

  if (nodes.length === 0) {
    nodes.push('| Application Server | Container | 1 vCPU, 512MB | Local |');
  }

  return nodes.join('\n');
}

function buildScalingStrategy(stack) {
  const strategies = [];

  if (stack.bundler.id === 'vercel') {
    strategies.push('- Vercel auto-scaling: unlimited based on traffic');
    strategies.push('- CDN caching for static assets');
  }

  if (stack.runtime.id === 'supabase') {
    strategies.push('- Supabase managed: automatic scaling with limits');
    strategies.push('- Read replicas for database scaling');
  }

  if (strategies.length === 0) {
    strategies.push('- Horizontal pod autoscaling based on CPU/memory');
    strategies.push('- Database clustering for persistence');
  }

  return strategies.join('\n');
}

function personalizeLogicalViewTemplate(template, modules, stack) {
  let result = template;

  if (modules.available && modules.modules.length > 0) {
    const abstractions = modules.modules.slice(0, 10).map(m => {
      return `| ${m.name} | ${m.kind} module, ${m.fileCount} files | ${m.path} |`;
    }).join('\n');

    result = result.replace(
      /\| \[Name\] \| \[What it does\] \| \[APIs provided\] \|/g,
      abstractions
    );
  }

  return result;
}

function personalizeOperationalViewTemplate(template, stack) {
  let result = template;

  if (stack.available) {
    const scenarios = [];

    if (stack.runtime.id === 'supabase') {
      scenarios.push('| Supabase Auth | User login | Supabase validates, returns session | <100ms |');
    }

    if (stack.framework.id === 'react') {
      scenarios.push('| React SPA | User navigation | Client routing, lazy loading | <50ms |');
    }

    if (scenarios.length > 0) {
      result = result.replace(
        /\| \[Name\] \| \[Event\] \| \[Action\] \| \[Time\] \|/g,
        scenarios.join('\n')
      );
    }
  }

  return result;
}

function listIso42010Views() {
  return Object.entries(iso42010Views).map(([key, view]) => ({
    id: key,
    name: view.name,
    description: view.description,
    concerns: view.concerns
  }));
}

export { getIso42010View, listIso42010Views, iso42010Views };