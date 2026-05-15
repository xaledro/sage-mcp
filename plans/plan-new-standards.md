# Plan: Agregar ISO/IEC 27701, 27001, 20000, 42001 a standards-mcp

**Fecha:** 2026-05-15
**Versión MCP:** v1.1.0 (22 herramientas)
**Meta:** Alcanzar 26 herramientas con 4 nuevos estándares

---

## Resumen de Implementación

| Estándar | Dominio | Herramientas | Complejidad | Tiempo Estimado |
|----------|---------|--------------|-------------|------------------|
| ISO/IEC 27701 | Privacy (PII) | `iso27701.privacyCheck`, `iso27701.pia`, `iso27701.dpia` | MEDIUM | 16h |
| ISO/IEC 27001 | Information Security | `iso27001.controls`, `iso27001.soa`, `iso27001.isms` | HIGH | 24h |
| ISO/IEC 20000 | IT Service Management | `iso20000.sls`, `iso20000.service`, `iso20000.process` | MEDIUM | 16h |
| ISO/IEC 42001 | AI Management | `iso42001.ethicalAI`, `iso42001.transparency`, `iso42001.accountability` | HIGH | 24h |

**Total estimado:** 80h desarrollo + 40h testing = 120h

---

## Architecture Overview

```
src/
├── tools/
│   ├── arc42.js          (existing - 12 sections)
│   ├── owasp.js          (existing - 41 reqs L1, 2024)
│   ├── iso42010.js       (existing - 3 views)
│   ├── iso9241.js        (existing - 24 criteria)
│   ├── iso25010.js       (existing - 8 chars, 30 sub-chars)
│   ├── material.js       (existing - MD3 tokens)
│   ├── discovery.js      (existing - design system)
│   ├── audit.js          (existing - design audit)
│   │
│   ├── iso27701.js       (NEW - Privacy)
│   ├── iso27001.js       (NEW - ISMS)
│   ├── iso20000.js       (NEW - IT Service Mgmt)
│   └── iso42001.js       (NEW - AI Management)
```

---

## 1. ISO/IEC 27701:2019 (Privacy Extension to ISO 27001)

### Descripción
Extensión a ISO/IEC 27001 para procesamiento de PII (Personally Identifiable Information). Relevante para GestaOS por:
- Datos de empleados (RUT, información personal)
- Ley chilena 19.628 (protección de datos personales)
- Operaciones de RRHH y nómina

### Herramientas

#### `iso27701.privacyCheck`

**Propósito:** Checklist de privacidad estructurado.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["overview", "pII-principles", "PII-owner", "PII-processor", "controls"],
      description: "Privacy category to check"
    }
  },
  required: []
}
```

**Output Structure:**
```javascript
{
  standard: "ISO/IEC 27701:2019",
  description: "Privacy extension for ISO 27001 - PII processing",
  categories: [
    {
      id: "pII-principles",
      name: "PII Processing Principles",
      criteriaCount: 7,
      criteria: [
        { id: "27701-1", text: "PII principle: Lawfulness, fairness, transparency", weight: "high" },
        { id: "27701-2", text: "PII principle: Purpose limitation", weight: "high" },
        { id: "27701-3", text: "PII principle: Data minimization", weight: "high" },
        { id: "27701-4", text: "PII principle: Accuracy", weight: "medium" },
        { id: "27701-5", text: "PII principle: Storage limitation", weight: "high" },
        { id: "27701-6", text: "PII principle: Integrity and confidentiality", weight: "high" },
        { id: "27701-7", text: "PII principle: Accountability", weight: "high" }
      ]
    },
    {
      id: "PII-owner",
      name: "PII Owner Requirements",
      criteriaCount: 5,
      criteria: [
        { id: "27701-8", text: "Determine legal basis for PII processing", weight: "high" },
        { id: "27701-9", text: "Document PII processing purpose", weight: "high" },
        { id: "27701-10", text: "Implement consent management", weight: "high" },
        { id: "27701-11", text: "PII subject rights implementation", weight: "high" },
        { id: "27701-12", text: "Privacy notice publication", weight: "medium" }
      ]
    },
    {
      id: "PII-processor",
      name: "PII Processor Requirements",
      criteriaCount: 6,
      criteria: [
        { id: "27701-13", text: "Process PII only per instructions", weight: "high" },
        { id: "27701-14", text: "Contractual obligations for processors", weight: "high" },
        { id: "27701-15", text: "Incident notification to controller", weight: "high" },
        { id: "27701-16", text: "PII processor registration", weight: "medium" },
        { id: "27701-17", text: "Sub-processor management", weight: "medium" },
        { id: "27701-18", text: "Records of processing activities", weight: "high" }
      ]
    },
    {
      id: "controls",
      name: "Privacy Controls (Annex A)",
      criteriaCount: 14,
      criteria: [
        { id: "27701-A1", text: "Inventory of PII", weight: "high" },
        { id: "27701-A2", text: "Privacy impact assessments", weight: "high" },
        { id: "27701-A3", text: "PII sharing agreements", weight: "high" },
        { id: "27701-A4", text: "Data breach response procedures", weight: "high" },
        { id: "27701-A5", text: "Privacy training for staff", weight: "medium" },
        // ... 9 more
      ]
    }
  ],
  totalCriteria: 32
}
```

#### `iso27701.pia` (Privacy Impact Assessment)

**Propósito:** Generar template PIA para nuevos procesamientos.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    scenario: { type: "string", description: "PII processing scenario description" },
    dataTypes: {
      type: "array",
      items: { type: "string" },
      description: "Types of PII processed (e.g., ['RUT', 'email', 'salary'])"
    },
    processingPurpose: { type: "string", description: "Purpose of processing" },
    legalBasis: {
      type: "string",
      enum: ["consent", "contract", "legal", "vital", "public"],
      description: "Legal basis for processing"
    },
    recipients: { type: "array", items: { type: "string" }, description: "Third parties" }
  },
  required: ["scenario", "dataTypes", "processingPurpose", "legalBasis"]
}
```

**Output:** Structured PIA template:
- Project context
- Data inventory
- Purpose analysis
- Legal basis assessment
- Risk identification
- Mitigation measures
- Approval workflow

#### `iso27701.dpia` (Data Protection Impact Assessment)

**Propósito:** DPIA especializada para procesamientos de alto riesgo.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    processingType: {
      type: "string",
      enum: ["systematic", "large-scale", "vulnerable-subjects", "innovation", "biometric", "location"],
      description: "Type of high-risk processing"
    },
    riskLevel: { type: "string", enum: ["high", "very-high"] },
    hasExistingAssessment: { type: "boolean" }
  }
}
```

### Overlap con Estándares Existentes

| Ya Cubierto | ISO 27701 Agrega |
|-------------|------------------|
| OWASP A07 (Auth) | Principios privacy-by-design |
| ISO 25010 Security | PII minimization, consent lifecycle |
| ISO 9241 S7 (Error messages) | Transparency, user rights notifications |
| arc42 Section 9 (Quality) | Privacy quality attributes |

### Dependencias
- OWASP tools (A07 Authentication)
- ISO 25010 Security characteristic

---

## 2. ISO/IEC 27001:2022 (Information Security Management System)

### Descripción
ISMS con 93 controles organizados en 4 temas. Complementa OWASP ASVS con controles organizacionales y físicos.

### Herramientas

#### `iso27001.controls`

**Propósito:** Obtener controles de seguridad por tema.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    theme: {
      type: "string",
      enum: ["overview", "organizational", "people", "physical", "technological"],
      description: "Control theme"
    },
    controlId: { type: "string", description: "Specific control ID (e.g., 'A.5.1')" }
  }
}
```

**Output Structure:**
```javascript
{
  standard: "ISO/IEC 27001:2022",
  version: "2022",
  description: "Information Security Management System - 93 controls",
  themes: [
    {
      id: "organizational",
      name: "Organizational Controls",
      controlCount: 37,
      controls: [
        { id: "A.5.1", text: "Policies for information security", weight: "high", domain: "Policy" },
        { id: "A.5.2", text: "Review of policies for information security", weight: "medium" },
        { id: "A.5.3", text: "Separation of duties", weight: "high" },
        { id: "A.5.4", text: "Management responsibilities", weight: "high" },
        { id: "A.5.5", text: "Contact with authorities", weight: "medium" },
        { id: "A.5.6", text: "Contact with special interest groups", weight: "low" },
        { id: "A.5.7", text: "Threat intelligence", weight: "medium" },
        { id: "A.5.8", text: "Information security in project management", weight: "high" },
        { id: "A.5.9", text: "Inventory of assets", weight: "high" },
        { id: "A.5.10", text: "Acceptable use of assets", weight: "medium" },
        { id: "A.5.11", text: "Return of assets", weight: "medium" },
        { id: "A.5.12", text: "Classification of information", weight: "high" },
        { id: "A.5.13", text: "Labeling of information", weight: "medium" },
        { id: "A.5.14", text: "Information transfer", weight: "high" },
        { id: "A.5.15", text: "Access control policy", weight: "high" },
        { id: "A.5.16", text: "Change management", weight: "high" },
        { id: "A.5.17", text: "Information security awareness", weight: "high" },
        { id: "A.5.18", text: "Competence and education", weight: "medium" },
        { id: "A.5.19", text: "Remote work", weight: "medium" },
        { id: "A.5.20", text: "Information security during employment", weight: "high" },
        // ... more controls
      ]
    },
    {
      id: "people",
      name: "People Controls",
      controlCount: 8,
      controls: [
        { id: "A.6.1", text: "Background verification checks", weight: "high" },
        { id: "A.6.2", text: "Terms and conditions of employment", weight: "medium" },
        { id: "A.6.3", text: "Information security awareness, education and training", weight: "high" },
        { id: "A.6.4", text: "Disciplinary process", weight: "medium" },
        { id: "A.6.5", text: "Termination responsibilities", weight: "high" },
        { id: "A.6.6", text: "Mobile device policy", weight: "high" },
        { id: "A.6.7", text: "Remote work policy", weight: "medium" }
      ]
    },
    {
      id: "physical",
      name: "Physical Controls",
      controlCount: 14,
      controls: [
        { id: "A.7.1", text: "Physical security perimeter", weight: "high" },
        { id: "A.7.2", text: "Physical entry", weight: "high" },
        { id: "A.7.3", text: "Securing offices, rooms and facilities", weight: "high" },
        { id: "A.7.4", text: "Protection against physical and environmental threats", weight: "medium" },
        { id: "A.7.5", text: "Working in secure areas", weight: "medium" },
        { id: "A.7.6", text: "Delivery and removal of assets", weight: "medium" },
        { id: "A.8.1", text: "Equipment maintenance", weight: "medium" },
        { id: "A.8.2", text: "Asset disposal", weight: "high" }
      ]
    },
    {
      id: "technological",
      name: "Technological Controls",
      controlCount: 34,
      controls: [
        { id: "A.8.3", text: "Information deletion", weight: "high" },
        { id: "A.8.4", text: "Protection against malware", weight: "high" },
        { id: "A.8.5", text: "Backup", weight: "high" },
        { id: "A.8.6", text: "Event logging", weight: "high" },
        { id: "A.8.7", text: "Clock synchronization", weight: "medium" },
        { id: "A.8.8", text: "Technical vulnerability management", weight: "high" },
        { id: "A.8.9", text: "Configuration management", weight: "high" },
        { id: "A.8.10", text: "Web filtering", weight: "medium" },
        { id: "A.8.11", text: "Data leakage prevention", weight: "high" }
      ]
    }
  ],
  totalControls: 93
}
```

#### `iso27001.soa` (Statement of Applicability)

**Propósito:** Generar SOA basada en evaluación de riesgos.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    riskAssessment: {
      type: "object",
      description: "Risk assessment results",
      properties: {
        highRisks: { type: "array" },
        mediumRisks: { type: "array" },
        lowRisks: { type: "array" }
      }
    },
    context: { type: "string", description: "Organizational context" },
    complianceNeeds: { type: "array", items: { type: "string" } }
  }
}
```

**Output:** SOA document with:
- Applicable controls checklist
- Justification for exclusions
- Implementation status per control
- Mapping to existing evidence

#### `iso27001.isms`

**Propósito:** Retornar framework ISMS completo.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    section: {
      type: "string",
      enum: ["overview", "context", "leadership", "planning", "support", "operation", "performance", "improvement"],
      description: "ISMS section"
    }
  }
}
```

### Overlap con Estándares Existentes

| Ya Cubierto (OWASP) | ISO 27001 Agrega |
|---------------------|------------------|
| A01-A10 (controles técnicos) | Controles organizacionales (A.5.x) |
| A05 Security Misconfiguration | Políticas y gobernanza |
| A07 Auth Failures | Verificación de antecedentes, verificación de identidad |
| A06 Vulnerable Components | Gestión de vulnerabilidades técnicas (A.8.8) |
| arc42 Section 8 (ADRs) | Control de cambios (A.5.16) |

### Dependencias
- OWASP tools (completo, 47 requisitos L1)
- arc42 (Section 8 - Architecture Decisions)

---

## 3. ISO/IEC 20000-1:2018 (IT Service Management)

### Descripción
Service Quality para IT services. Relevante para GestaOS por:
- Uso de Supabase (BaaS) - managed services
- Integración con Talana, OREX APIs
- SLA management para clientes

### Herramientas

#### `iso20000.sls` (Service Level Agreement)

**Propósito:** Generar template SLA estructurado.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    serviceType: {
      type: "string",
      enum: ["saas", "paas", "iaas", "custom"],
      description: "Service delivery type"
    },
    availabilityTarget: { type: "number", description: "Target availability % (e.g., 99.9)" },
    responseTimeTarget: { type: "number", description: "Target response time in seconds" },
    resolutionTimeTarget: { type: "number", description: "Target resolution time in hours" }
  }
}
```

**Output Structure:**
```javascript
{
  standard: "ISO/IEC 20000-1:2018",
  description: "IT Service Management - SLA Template",
  serviceLevelAgreement: {
    serviceDescription: "Template",
    serviceHours: "24/7 or business hours",
    availability: {
      target: "99.9%",
      measurement: "Monthly",
      calculation: "(Total Available Minutes - Downtime) / Total Available Minutes * 100"
    },
    responseTimes: [
      { priority: "Critical", response: "1 hour", resolution: "4 hours" },
      { priority: "High", response: "4 hours", resolution: "8 hours" },
      { priority: "Medium", response: "8 hours", resolution: "24 hours" },
      { priority: "Low", response: "24 hours", resolution: "72 hours" }
    ],
    serviceCredits: "Template structure",
    reporting: {
      frequency: "Monthly",
      metrics: ["Availability", "Response Time", "Resolution Time", "Incidents"]
    }
  }
}
```

#### `iso20000.service`

**Propósito:** Retornar procesos de gestión de servicios.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    processArea: {
      type: "string",
      enum: ["overview", "design-transition", "delivery", "resolution", "improvement"],
      description: "Service management process area"
    }
  }
}
```

**Output:** 13 service management processes:
- Service strategy
- Service design
- Service transition
- Service operation
- continual improvement

#### `iso20000.process`

**Propósito:** Template de evaluación de procesos.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    processId: { type: "string", description: "Process ID (e.g., 'SVC-DEL-001')" },
    capabilityLevel: { type: "string", enum: ["1-Initial", "2-Managed", "3-Established", "4-Predictable", "5-Optimizing"] }
  }
}
```

### Overlap con Estándares Existentes

| Ya Cubierto | ISO 20000 Agrega |
|-------------|------------------|
| ISO 25010 Reliability | Service availability, incident management |
| ISO 42010 Deployment | Service deployment models |
| OWASP A09 (Logging) | Service monitoring, event management |
| arc42 Section 6 (Deployment) | Service level agreements |

### Dependencias
- ISO 25010 (Reliability characteristic)
- arc42 (Section 6 - Deployment View)

---

## 4. ISO/IEC 42001:2023 (AI Management System)

### Descripción
AIMS para organizaciones que desarrollan/operan sistemas AI. Relevante para:
- Future AI features en GestaOS
- Ethical AI requirements para RRHH
- AI-based recommendations en analytics

### Herramientas

#### `iso42001.ethicalAI`

**Propósito:** Checklist de ética AI.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["overview", "ethical-principles", "transparency", "accountability", "fairness", "privacy"],
      description: "AI ethics category"
    }
  }
}
```

**Output Structure:**
```javascript
{
  standard: "ISO/IEC 42001:2023",
  description: "AI Management System",
  categories: [
    {
      id: "ethical-principles",
      name: "Ethical AI Principles",
      criteriaCount: 8,
      criteria: [
        { id: "42001-1", text: "Human rights and dignity", weight: "high" },
        { id: "42001-2", text: "Fairness and non-discrimination", weight: "high" },
        { id: "42001-3", text: "Transparency and explainability", weight: "high" },
        { id: "42001-4", text: "Robustness and security", weight: "high" },
        { id: "42001-5", text: "Privacy and data governance", weight: "high" },
        { id: "42001-6", text: "Accountability", weight: "high" },
        { id: "42001-7", text: "Human oversight", weight: "medium" },
        { id: "42001-8", text: "Sustainable development", weight: "low" }
      ]
    },
    {
      id: "transparency",
      name: "Transparency & Explainability",
      criteriaCount: 12,
      criteria: [
        { id: "42001-9", text: "AI system documentation", weight: "high" },
        { id: "42001-10", text: "Decision explanation capability", weight: "high" },
        { id: "42001-11", text: "Audit trail for AI decisions", weight: "high" },
        { id: "42001-12", text: "User awareness of AI interaction", weight: "medium" },
        { id: "42001-13", text: "Data lineage tracking", weight: "medium" },
        { id: "42001-14", text: "Model versioning", weight: "medium" },
        { id: "42001-15", text: "Performance monitoring", weight: "high" },
        { id: "42001-16", text: "Bias detection and reporting", weight: "high" },
        { id: "42001-17", text: "Drift monitoring", weight: "medium" },
        { id: "42001-18", text: "Human-in-the-loop capability", weight: "high" },
        { id: "42001-19", text: "Fallback procedures", weight: "high" },
        { id: "42001-20", text: "Communication of limitations", weight: "medium" }
      ]
    },
    {
      id: "accountability",
      name: "Accountability Measures",
      criteriaCount: 10,
      criteria: [
        { id: "42001-21", text: "AI governance framework", weight: "high" },
        { id: "42001-22", text: "Roles and responsibilities for AI", weight: "high" },
        { id: "42001-23", text: "AI risk management process", weight: "high" },
        { id: "42001-24", text: "Impact assessment for AI systems", weight: "high" },
        { id: "42001-25", text: "Incident response for AI", weight: "high" },
        { id: "42001-26", text: "AI system lifecycle management", weight: "medium" },
        { id: "42001-27", text: "Supplier assessment for AI", weight: "medium" },
        { id: "42001-28", text: "Intellectual property for AI", weight: "medium" },
        { id: "42001-29", text: "AI training data governance", weight: "high" },
        { id: "42001-30", text: "AI model integrity", weight: "high" }
      ]
    },
    {
      id: "fairness",
      name: "Fairness & Non-discrimination",
      criteriaCount: 9,
      criteria: [
        { id: "42001-31", text: "Fairness definition documentation", weight: "high" },
        { id: "42001-32", text: "Bias identification process", weight: "high" },
        { id: "42001-33", text: "Fairness metrics", weight: "medium" },
        { id: "42001-34", text: "Mitigation strategies", weight: "high" },
        { id: "42001-35", text: "Representation analysis", weight: "medium" },
        { id: "42001-36", text: "Adverse impact testing", weight: "high" },
        { id: "42001-37", text: "Fairness reporting", weight: "medium" },
        { id: "42001-38", text: "Stakeholder feedback on fairness", weight: "low" },
        { id: "42001-39", text: "Continuous fairness monitoring", weight: "medium" }
      ]
    },
    {
      id: "privacy",
      name: "AI Privacy Protection",
      criteriaCount: 7,
      criteria: [
        { id: "42001-40", text: "Privacy by design for AI", weight: "high" },
        { id: "42001-41", text: "Data minimization in AI", weight: "high" },
        { id: "42001-42", text: "Consent for AI processing", weight: "high" },
        { id: "42001-43", text: "PII handling in ML", weight: "high" },
        { id: "42001-44", text: "Anonymization techniques", weight: "medium" },
        { id: "42001-45", text: "Data retention for AI", weight: "medium" },
        { id: "42001-46", text: "Cross-border data transfer controls", weight: "medium" }
      ]
    },
    {
      id: "governance",
      name: "AI Governance",
      criteriaCount: 11,
      criteria: [
        { id: "42001-47", text: "AI strategy alignment", weight: "high" },
        { id: "42001-48", text: "AI policy documentation", weight: "high" },
        { id: "42001-49", text: "AI competence framework", weight: "medium" },
        { id: "42001-50", text: "AI awareness training", weight: "medium" },
        { id: "42001-51", text: "AI project governance", weight: "high" },
        { id: "42001-52", text: "Change management for AI", weight: "medium" },
        { id: "42001-53", text: "AI procurement process", weight: "medium" },
        { id: "42001-54", text: "Third-party AI assessment", weight: "medium" },
        { id: "42001-55", text: "AI decommissioning", weight: "low" },
        { id: "42001-56", text: "AI records management", weight: "medium" },
        { id: "42001-57", text: "Continuous improvement for AI", weight: "medium" }
      ]
    }
  ],
  totalCriteria: 57
}
```

#### `iso42001.transparency`

**Propósito:** Requisitos específicos de transparencia AI.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    transparencyType: {
      type: "string",
      enum: ["documentation", "explainability", "communication", "audit"],
      description: "Type of transparency requirement"
    }
  }
}
```

#### `iso42001.accountability`

**Propósito:** Mecanismos de accountability para decisiones AI.

**Input Schema:**
```javascript
{
  type: "object",
  properties: {
    accountabilityArea: {
      type: "string",
      enum: ["governance", "risk", "incident", "audit"],
      description: "Accountability area"
    }
  }
}
```

### Overlap con Estándares Existentes

| Ya Cubierto | ISO 42001 Agrega |
|-------------|------------------|
| ISO 25010 Security | AI-specific security controls |
| ISO 9241 Usability | Human-AI interaction principles |
| ISO 27701 (nuevo) | AI privacy impact |
| OWASP A04 Insecure Design | AI threat modeling |

### Dependencias
- ISO 27701 (Privacy)
- ISO 25010 (Security characteristic)
- OWASP (A04 - Insecure Design)

---

## Implementation Roadmap

```
Phase 1: ISO 27701 (16h)
├── Semana 1: src/tools/iso27701.js (8h)
├── Semana 1: Unit tests (4h)
├── Semana 2: Integration + docs (4h)

Phase 2: ISO 20000 (16h)
├── Semana 3: src/tools/iso20000.js (8h)
├── Semana 3: Unit tests (4h)
├── Semana 4: Integration + docs (4h)

Phase 3: ISO 27001 (24h)
├── Semana 5-6: src/tools/iso27001.js (16h)
├── Semana 6: Unit tests (6h)
├── Semana 7: Integration + docs (6h)

Phase 4: ISO 42001 (24h)
├── Semana 8-9: src/tools/iso42001.js (16h)
├── Semana 9: Unit tests (6h)
├── Semana 10: Integration + docs (6h)
```

---

## Files to Create/Modify

| File | Action | Lines |
|------|--------|-------|
| `src/tools/iso27701.js` | CREATE | ~450 |
| `src/tools/iso20000.js` | CREATE | ~400 |
| `src/tools/iso27001.js` | CREATE | ~700 |
| `src/tools/iso42001.js` | CREATE | ~550 |
| `src/index.js` | MODIFY | +60 (tool entries + cases) |
| `package.json` | MODIFY | +4 (version bump) |
| `README.md` | MODIFY | +250 (nuevos estándares) |
| `AGENTS.md` | MODIFY | +120 (nuevos estándares) |
| `plans/plan-new-standards.md` | CREATE | (this file) |

---

## No New Dependencies

Todos los nuevos módulos son JavaScript puro, sin dependencias externas:
- No new npm packages
- No external APIs
- Self-contained implementations

---

## Testing Strategy

| Standard | Unit Tests | Integration Tests |
|----------|-----------|-------------------|
| ISO 27701 | 10 test cases | 5 |
| ISO 20000 | 8 test cases | 4 |
| ISO 27001 | 15 test cases | 8 |
| ISO 42001 | 12 test cases | 6 |

**Total:** 45 test cases + 23 integration tests

---

## Validation Checklist

- [ ] All 4 new tools respond to `standards.list`
- [ ] All `category` parameters work (no broken params like iso25010 had)
- [ ] All 4 tools usable via MCP stdio transport
- [ ] No duplicate requirements with existing standards
- [ ] Gap analysis shows value vs existing tools
- [ ] All tools documented in README.md
- [ ] AGENTS.md updated with new tool descriptions
- [ ] Version bumped to v1.2.0

---

## Success Metrics

| Metric | Target |
|--------|--------|
| New standards added | 4 |
| New tools added | 11 (3 per standard average) |
| Total tools after | 33 (22 existing + 11 new) |
| Test coverage | >80% |
| Documentation | 100% |

---

## Cross-Standard Integration

```
OWASP (existing)
    └── ISO 27001 (new) - Security controls
         └── ISO 27701 (new) - Privacy extension

ISO 25010 (existing)
    ├── ISO 20000 (new) - Service management
    └── ISO 42001 (new) - AI management

ISO 9241 (existing)
    └── ISO 42001 (new) - Human-AI interaction
```