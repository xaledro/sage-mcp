import { inspect } from '../lib/project-intelligence.js';

const arc42Templates = {
  1: {
    title: "Introduction and Goals",
    section: "1",
    content: `## 1. Introduction and Goals

### Purpose
This document describes the architecture of the system from a technical perspective, providing stakeholders with a comprehensive view of the system's structure, key decisions, and quality attributes.

### Stakeholders
| Role | Name | Concern |
|------|------|---------|
| Product Owner | | Business requirements |
| Development Team | | Technical implementation |
| Operations | | Deployment and maintenance |
| Security | | Data protection and compliance |

### Quality Goals
1. **Scalability**: System must handle 10x current load
2. **Maintainability**: Code must be self-documenting with <10% comment ratio
3. **Security**: All data encrypted at rest and in transit
4. **Availability**: 99.9% uptime target

### Acceptance Criteria
- [ ] All quality scenarios have measurable criteria
- [ ] Stakeholder concerns addressed in architecture
- [ ] Trade-offs documented with rationale`
  },
  2: {
    title: "Architecture Constraints",
    section: "2",
    content: `## 2. Architecture Constraints

### Technical Constraints
| Constraint | Description | Impact |
|-------------|-------------|--------|
| Language | TypeScript 5.x | Full-stack TypeScript |
| Framework | Node.js 20 LTS | Server-side consistency |
| Platform | Cloud-native | Container-ready |

### Organizational Constraints
- Team size: 5-8 developers
- Release cycle: 2-week sprints
- Communication: Async-first

### Budget Constraints
- Infrastructure: $5K/month max
- Third-party services: Pre-approved list only

### External Constraints
- GDPR compliance required
- SOC2 audit in Q3`
  },
  3: {
    title: "Solution Strategy",
    section: "3",
    content: `## 3. Solution Strategy

### Key Decisions
1. **Monolithic first, modular** - Start simple, extract if needed
2. **API-first design** - All features exposed via REST/GraphQL
3. **Database per service** - Avoid distributed transactions

### Technical Approach
- Backend: Node.js + Express + Prisma
- Frontend: React 18 + TailwindCSS
- Infrastructure: Kubernetes on AWS EKS

### Quality Strategy
- Automated testing: Unit 80%, Integration 60%
- CI/CD: GitHub Actions with quality gates
- Monitoring: Prometheus + Grafana`
  },
  4: {
    title: "Building Block View",
    section: "4",
    content: `## 4. Building Block View

### Level 1: System Overview
\`\`\`
┌─────────────────────────────────────────────┐
│              Client Applications              │
│  (Web, Mobile, CLI)                         │
└──────────┬──────────────────────────────────┘
           │ HTTPS/REST
┌──────────▼──────────────────────────────────┐
│              API Gateway                     │
│  (Auth, Rate Limiting, Routing)              │
└──────────┬──────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────┐
│           Core Services                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Users   │ │ Orders  │ │ Products│       │
│  └─────────┘ └─────────┘ └─────────┘       │
└──────────┬──────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────┐
│         Data Layer                           │
│  (PostgreSQL, Redis, S3)                    │
└─────────────────────────────────────────────┘
\`\`\`

### Black Box: API Gateway
- **Responsibility**: Authentication, routing, rate limiting
- **Interface**: REST API / WebSocket
- **Tech**: Kong or AWS API Gateway`
  },
  5: {
    title: "Runtime View",
    section: "5",
    content: `## 5. Runtime View

### Scenario: User Authentication Flow
\`\`\`
Sequence: User Authentication
User->Client: Enter credentials
Client->API: POST /auth/login {email, password}
API->AuthService: Validate credentials
AuthService->Database: Check user record
Database->AuthService: User record
AuthService->TokenService: Generate JWT
TokenService->API: Return JWT
API->Client: { token, user }
Client->Client: Store token, redirect
\`\`\`

### Scenario: Order Creation Flow
1. Client sends POST /orders with items
2. API validates token and permissions
3. OrderService creates order record
4. PaymentService processes payment
5. InventoryService reserves stock
6. Confirmation sent to client`
  },
  6: {
    title: "Deployment View",
    section: "6",
    content: `## 6. Deployment View

### Infrastructure
- **Cloud**: AWS us-east-1
- **Region**: Multi-AZ for HA
- **CDN**: CloudFront for static assets

### Deployment Topology
\`\`\`
Internet
    │
CloudFront (CDN)
    │
Route 53 (DNS)
    │
ALB (Load Balancer)
    │
EKS Cluster
├── api-gateway (3 pods)
├── auth-service (3 pods)
├── order-service (3 pods)
└── product-service (3 pods)
    │
RDS PostgreSQL (Multi-AZ)
ElastiCache Redis
S3 Bucket (assets)
\`\`\`

### Scaling Strategy
- Horizontal pod autoscaling based on CPU/memory
- Database read replicas for read-heavy workloads
- Redis cluster for session/caching`
  },
  7: {
    title: "Concepts and Patterns",
    section: "7",
    content: `## 7. Concepts and Patterns

### Domain Concepts
- **User**: Authenticated system actor
- **Organization**: Tenant container
- **Resource**: Any entity with permissions

### Architectural Patterns
1. **Repository Pattern** - Data access abstraction
2. **Service Layer** - Business logic encapsulation
3. **Event-Driven** - Async communication via events

### Cross-Cutting Concerns
- **Logging**: Structured JSON, correlation IDs
- **Error Handling**: Centralized error middleware
- **Validation**: Schema-first with Zod

### Coding Standards
- TypeScript strict mode
- ESLint + Prettier enforced
- Conventional commits`
  },
  8: {
    title: "Architecture Decisions",
    section: "8",
    content: `## 8. Architecture Decisions

### ADR-001: Use PostgreSQL over MongoDB
**Context**: Need ACID compliance and complex queries
**Decision**: PostgreSQL as primary database
**Consequences**:
- (+) Strong consistency
- (+) Complex queries support
- (-) Schema migration complexity

### ADR-002: REST over GraphQL
**Context**: Team familiarity, simpler tooling
**Decision**: REST API with OpenAPI spec
**Consequences**:
- (+) Easier to cache
- (+) Better tooling
- (-) Multiple endpoints

### ADR-003: JWT for Authentication
**Context**: Stateless auth needed
**Decision**: JWT with refresh token rotation
**Consequences**:
- (+) Scalable
- (+) Cross-service
- (-) Token size, revocation complexity`
  },
  9: {
    title: "Quality Requirements",
    section: "9",
    content: `## 9. Quality Requirements

### Quality Tree
\`\`\`
Performance
├── Response Time < 200ms p95
├── Throughput > 1000 req/s
└── Error Rate < 0.1%

Reliability
├── Availability > 99.9%
├── MTTR < 15 minutes
└── Backup RPO < 1 hour

Security
├── No critical vulnerabilities
├── Penetration test annually
└── Zero data breaches

Maintainability
├── Code coverage > 80%
├── Technical debt < 5% of codebase
└── Documentation up-to-date
\`\`\`

### Quality Scenarios
| Scenario | Trigger | Response |
|----------|---------|----------|
| Load spike | 10x normal traffic | Auto-scale within 2 min |
| Security breach | Unauthorized access attempt | Alert in < 1 min |
| Data loss | Accidental deletion | Restore within 1 hour |`
  },
  10: {
    title: "Risks and Technical Debt",
    section: "10",
    content: `## 10. Risks and Technical Debt

### Risk Register
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database bottleneck | Medium | High | Add read replicas |
| Team knowledge gap | Low | Medium | Documentation + pair programming |
| Third-party API failure | Medium | Medium | Circuit breaker pattern |
| Security vulnerability | Low | Critical | Regular audits + dependency scanning |

### Technical Debt
| Debt | Effort | Impact | Priority |
|------|--------|--------|----------|
| Legacy auth module | 3 weeks | High | P1 |
| Test infrastructure | 1 week | Medium | P2 |
| API documentation | 2 weeks | Medium | P2 |

### Monitoring Strategy
- SLO dashboards updated daily
- Weekly risk review meetings
- Quarterly architecture reviews`
  },
  11: {
    title: "Glossary",
    section: "11",
    content: `## 11. Glossary

### Terms
| Term | Definition |
|------|------------|
| ACID | Atomicity, Consistency, Isolation, Durability |
| ADR | Architecture Decision Record |
| API | Application Programming Interface |
| CD/CI | Continuous Delivery/Integration |
| HA | High Availability |
| MTTR | Mean Time To Recovery |
| RPO | Recovery Point Objective |
| SLA | Service Level Agreement |
| SLO | Service Level Objective |

### Abbreviations
- AWS: Amazon Web Services
- DNS: Domain Name System
- JWT: JSON Web Token
- REST: Representational State Transfer
- SQL: Structured Query Language`
  },
  12: {
    title: "Appendices",
    section: "12",
    content: `## 12. Appendices

### Figures
- Figure 1: System Architecture Overview
- Figure 2: Deployment Topology
- Figure 3: Sequence Diagrams

### Supporting Materials
- API Specification (OpenAPI 3.0)
- Database Schema Diagram
- Security Architecture

### References
1. arc42 by Gernot Starke
2. Clean Architecture by Robert Martin
3. Domain-Driven Design by Eric Evans`
  }
};

function getArc42Section(sectionNumber, context = {}, projectPath = null) {
  const section = arc42Templates[sectionNumber];
  if (!section) {
    throw new Error(`Invalid arc42 section: ${sectionNumber}. Valid range: 1-12`);
  }

  let content = section.content;

  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      content = personalizeSection(sectionNumber, content, facts);
    } catch {
    }
  }

  if (context.projectName) {
    content = content.replace(/\$\{projectName\}/g, context.projectName);
    content = content.replace(/\$projectName\$/g, context.projectName);
  }

  return {
    number: sectionNumber,
    title: section.title,
    content: content,
    template: `Section ${sectionNumber} of arc42 template`
  };
}

function personalizeSection(sectionNumber, content, facts) {
  const { stack, modules, backend, adrs } = facts;

  if (sectionNumber === 2 && stack.available) {
    const techConstraints = buildTechConstraints(stack);
    content = content.replace(
      /\| Language.*?\|.*?\n/,
      techConstraints + '\n'
    );
  }

  if (sectionNumber === 4 && modules.available && modules.modules.length > 0) {
    content = personalizeBuildingBlockView(content, modules, stack);
  }

  if (sectionNumber === 6 && stack.available) {
    content = personalizeDeploymentView(content, stack);
  }

  if (sectionNumber === 8 && adrs.available && adrs.records.length > 0) {
    content = personalizeADRs(content, adrs);
  }

  return content;
}

function buildTechConstraints(stack) {
  const lines = [];
  if (stack.framework.id !== 'unknown') {
    lines.push(`| Framework | ${stack.framework.id} | Full-stack ${stack.language?.id || 'JS'} |`);
  }
  if (stack.bundler.id !== 'unknown') {
    lines.push(`| Bundler | ${stack.bundler.id} | Build tooling |`);
  }
  if (stack.css.id !== 'unknown') {
    lines.push(`| CSS | ${stack.css.id} | Styling solution |`);
  }
  if (stack.state.id !== 'none') {
    lines.push(`| State | ${stack.state.id} | Client state management |`);
  }
  if (stack.runtime.id !== 'unknown') {
    lines.push(`| Runtime | ${stack.runtime.id} | Backend/Edge |`);
  }
  if (lines.length === 0) {
    return '';
  }
  return lines.join('\n');
}

function personalizeBuildingBlockView(content, modules, stack) {
  const moduleList = modules.modules.map(m => {
    return `| ${m.name} | ${m.kind} | ${m.fileCount} files |`;
  }).join('\n');

  const level1Diagram = buildLevel1Diagram(modules, stack);

  content = content.replace(
    /### Level 1: System Overview[\s\S]*?(?=### Black Box)/,
    `### Level 1: System Overview\n\n${level1Diagram}\n\n### Core Modules (${modules.count})\n\n| Module | Type | Size |\n|--------|------|------|\n${moduleList}\n\n`
  );

  return content;
}

function buildLevel1Diagram(modules, stack) {
  const clientPart = stack.framework.id === 'react' ? 'React SPA' :
                     stack.framework.id === 'vue' ? 'Vue SPA' :
                     stack.framework.id === 'next' ? 'Next.js' : 'Web App';

  const backendPart = stack.runtime.id === 'supabase' ? 'Supabase BaaS' :
                      stack.runtime.id === 'deno' ? 'Deno Edge' :
                      stack.runtime.id === 'node' ? 'Node.js' : 'API';

  return `\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        System                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ ${clientPart.padEnd(12)} │  │ ${backendPart.padEnd(12)} │  │ Edge Functions        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
\`\`\``;
}

function personalizeDeploymentView(content, stack) {
  const infra = stack.bundler.id === 'vercel' ? 'Vercel (frontend)' : 'Cloud Platform';

  content = content.replace(
    /- \*\*Cloud\*\*:.*?\n/,
    `- **Cloud**: ${infra}\n`
  );

  content = content.replace(
    /EKS Cluster[\s\S]*?S3 Bucket \(assets\)/,
    stack.runtime.id === 'supabase' ?
    `Supabase Cloud (PostgreSQL + Auth + Storage)\nElastiCache Redis\nVercel (frontend)` :
    `Kubernetes Cluster\nPostgreSQL + Redis\nS3 Bucket (assets)`
  );

  return content;
}

function personalizeADRs(content, adrs) {
  let adrSection = '\n### Detected ADRs\n\n';

  for (const adr of adrs.records.slice(0, 5)) {
    const title = adr.title || adr.file || 'ADR';
    adrSection += `### ${title}\n\n`;
    if (adr.decision) {
      adrSection += `**Decision**: ${adr.decision}\n\n`;
    }
    if (adr.status) {
      adrSection += `**Status**: ${adr.status}\n\n`;
    }
  }

  content = content.replace(
    /### ADR-003: JWT[\s\S]*?(?=\#\#\# Quality Requirements)/,
    adrSection + '\n'
  );

  return content;
}

function getArc42Checklist(sectionNumber, projectPath = null) {
  const section = arc42Templates[sectionNumber];
  if (!section) {
    throw new Error(`Invalid arc42 section: ${sectionNumber}. Valid range: 1-12`);
  }

  const checklistItems = getChecklistForSection(sectionNumber);

  let status = {};
  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      status = evaluateChecklist(sectionNumber, facts);
    } catch {
    }
  }

  return {
    section: sectionNumber,
    title: section.title,
    items: checklistItems,
    status
  };
}

function getChecklistForSection(sectionNumber) {
  const checklists = {
    1: [
      { id: '1.1', text: 'Purpose documented', required: true },
      { id: '1.2', text: 'Stakeholders table populated', required: true },
      { id: '1.3', text: 'Quality goals with metrics', required: true },
      { id: '1.4', text: 'Acceptance criteria defined', required: false }
    ],
    2: [
      { id: '2.1', text: 'Technical constraints listed', required: true },
      { id: '2.2', text: 'Organizational constraints documented', required: true },
      { id: '2.3', text: 'External constraints identified', required: false }
    ],
    3: [
      { id: '3.1', text: 'Key architectural decisions documented', required: true },
      { id: '3.2', text: 'Technical approach defined', required: true },
      { id: '3.3', text: 'Quality strategy outlined', required: false }
    ],
    4: [
      { id: '4.1', text: 'Level 1 context diagram present', required: true },
      { id: '4.2', text: 'Core modules identified', required: true },
      { id: '4.3', text: 'Component interfaces documented', required: false }
    ],
    5: [
      { id: '5.1', text: 'Key runtime scenarios documented', required: true },
      { id: '5.2', text: 'Sequence diagrams for critical flows', required: false }
    ],
    6: [
      { id: '6.1', text: 'Deployment topology diagram', required: true },
      { id: '6.2', text: 'Infrastructure components listed', required: true },
      { id: '6.3', text: 'Scaling strategy defined', required: false }
    ],
    7: [
      { id: '7.1', text: 'Domain concepts documented', required: true },
      { id: '7.2', text: 'Architectural patterns identified', required: false },
      { id: '7.3', text: 'Cross-cutting concerns addressed', required: false }
    ],
    8: [
      { id: '8.1', text: 'ADRs recorded with context/decision/consequences', required: true },
      { id: '8.2', text: 'Decision status documented', required: false }
    ],
    9: [
      { id: '9.1', text: 'Quality tree defined', required: true },
      { id: '9.2', text: 'Quality scenarios with triggers/responses', required: true },
      { id: '9.3', text: 'SLOs defined', required: false }
    ],
    10: [
      { id: '10.1', text: 'Risk register with mitigations', required: true },
      { id: '10.2', text: 'Technical debt documented', required: false }
    ],
    11: [
      { id: '11.1', text: 'Key terms defined', required: true },
      { id: '11.2', text: 'Abbreviations listed', required: false }
    ],
    12: [
      { id: '12.1', text: 'Supporting diagrams included', required: false },
      { id: '12.2', text: 'References documented', required: false }
    ]
  };

  return checklists[sectionNumber] || [];
}

function evaluateChecklist(sectionNumber, facts) {
  const { stack, modules, backend, adrs } = facts;
  const result = { complete: 0, total: 0, gaps: [] };

  if (sectionNumber === 4) {
    if (modules.available) {
      result.complete++;
    } else {
      result.gaps.push('No module directory detected');
    }
    result.total++;
    if (stack.available) {
      result.complete++;
    } else {
      result.gaps.push('No package.json found');
    }
    result.total++;
  }

  if (sectionNumber === 8) {
    if (adrs.available && adrs.records.length > 0) {
      result.complete++;
      result.details = `Detected ${adrs.records.length} ADRs`;
    } else {
      result.gaps.push('No ADR directory found');
    }
    result.total++;
  }

  if (sectionNumber === 2) {
    if (stack.available) {
      result.complete++;
      result.details = `Stack: ${stack.framework.id}, ${stack.runtime.id}`;
    } else {
      result.gaps.push('No package.json found');
    }
    result.total++;
  }

  return result;
}

function getArc42Metadata() {
  return {
    version: "7.0",
    sections: Object.keys(arc42Templates).map(num => ({
      number: parseInt(num),
      title: arc42Templates[num].title
    }))
  };
}

export { getArc42Section, getArc42Metadata, getArc42Checklist, arc42Templates };