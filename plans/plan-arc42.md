# Plan de Remediación: arc42 - GestaOS

**Estándar:** arc42 (https://arc42.org/)
**Fecha:** 2026-05-15
**Estado actual:** Template genérico, 0% populated
**Meta:** Documentación arc42 completa para GestaOS

---

## Resumen Ejecutivo

| Sección | Estado | Prioridad | Esfuerzo |
|---------|--------|-----------|----------|
| 1. Introduction and Goals | ❌ Empty | HIGH | 4h |
| 2. Architecture Constraints | ⚠️ Partial | HIGH | 3h |
| 3. Solution Strategy | ⚠️ Partial | MEDIUM | 4h |
| 4. Building Block View | ⚠️ Partial | HIGH | 8h |
| 5. Runtime View | ⚠️ Partial | HIGH | 6h |
| 6. Deployment View | ✅ Correct | LOW | 1h |
| 7. Concepts and Patterns | ⚠️ Partial | MEDIUM | 4h |
| 8. Architecture Decisions | ❌ Empty | HIGH | 6h |
| 9. Quality Requirements | ❌ Empty | HIGH | 4h |
| 10. Risks and Technical Debt | ⚠️ Partial | MEDIUM | 3h |
| 11. Glossary | ⚠️ Partial | MEDIUM | 2h |
| 12. Appendices | ❌ Empty | LOW | 4h |

**Total estimado:** 49h

---

## 1. Introduction and Goals

### Estado Actual
- Purpose: genérico
- Stakeholders: tabla vacía
- Quality Goals: genéricos sin números
- Acceptance Criteria: no definidos

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| A1.1 | Documentar propósito de GestaOS: plataforma multi-módulo para gestión minera/recurso en Chile | HIGH | Product Owner | 1h | - |
| A1.2 | Llenar tabla de stakeholders con 6 roles existentes (Admin, RRHH, Capacitación, Operaciones, Empleado, Externo) | HIGH | Product Owner | 1h | A1.1 |
| A1.3 | Definir Quality Goals con métricas reales: Disponibilidad 99.9%, Performance <200ms | HIGH | Product Owner + Tech Lead | 2h | - |

### Quality Goals Propuestos

```markdown
## Quality Goals

| Goal | Metric | Current | Target |
|------|--------|---------|--------|
| Availability | Supabase SLA | 99.9% | Mantener |
| Performance | Response time P95 | Unknown | <200ms |
| Security | OWASP ASVS L1 | 65% | 100% |
| Maintainability | Test coverage | 0% | >60% |
| Scalability | Module count | 14 | Soportar 2x growth |
```

---

## 2. Architecture Constraints

### Estado Actual
- Technical: TypeScript 5.x, Node.js 20 LTS (incorrecto - es Supabase BaaS, no Node.js server)
- Organizational: sin team size ni budget
- External: GDPR/SOC2 no aplica - ley chilena 19.628

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A2.1 | Corregir constraints técnicos: React 18 SPA + Vite, Supabase (no Node.js server) | HIGH | Tech Lead | 1h |
| A2.2 | Documentar team size, budget, ciclo de desarrollo | MEDIUM | Management | 1h |
| A2.3 | Documentar compliance requirements: Ley 19.628 chilena | MEDIUM | Product Owner | 1h |

### Constraints Corregidos

```markdown
## Technical Constraints

| Constraint | Value |
|------------|-------|
| Frontend | React 18 SPA + Vite |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Edge Runtime | Deno (30+ edge functions) |
| State Management | Zustand + React Query |
| UI Components | shadcn/ui + Tailwind CSS |
| Hosting | Vercel (frontend) + Supabase Cloud (backend) |
| Project ID | lptafzrhpiypffrewdix |

## Organizational Constraints

| Constraint | Value |
|------------|-------|
| Team Size | TBD |
| Budget | TBD |
| Deployment | Continuous (Vercel auto-deploy) |

## External Constraints

| Constraint | Value |
|------------|-------|
| Chilean Law | Ley 19.628 protección de datos personales |
| Supabase SLA | 99.9% availability |
```

---

## 3. Solution Strategy

### Estado Actual
- Key Decisions: vacío
- Technical Approach: describe Node.js + Express + K8s que no existen
- Quality Strategy: sin CI/CD, sin monitoring

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A3.1 | Documentar approach real: SPA + BaaS, no Express/Deno para backend principal | HIGH | Tech Lead | 1h |
| A3.2 | Identificar ADRs existentes (QR attendance, SSO Hub, dual Prisma) | HIGH | Tech Lead | 2h |
| A3.3 | Definir estrategia de testing: Vitest + React Testing Library | MEDIUM | Tech Lead | 1h |

---

## 4. Building Block View

### Estado Actual
- Level 1 diagram: genérico (Client → API Gateway → Services)
- Core modules: no listados
- Components: no inventariados

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| A4.1 | Crear diagrama de arquitectura C4: Context → Container → Component | HIGH | Tech Lead | 4h | - |
| A4.2 | Inventariar 14 módulos: OREX, Gesta Digital, GestaWork, Docnomina, SpotPass, Analytics Hub, Admin Panel, Data Warehouse, Gestión Temprana, Cuadrillas, LMS, Flight Program, Records, GestaWork | HIGH | Tech Lead | 2h | - |
| A4.3 | Documentar servicios: auth, records, lms, audit, reports, early-management, cuadrillas, flight-program, talana-service, sso-service, etc. | HIGH | Tech Lead | 2h | A4.2 |

### Building Block View Propuesto

```markdown
## Level 1: System Context

```
┌─────────────────────────────────────────────────────────────┐
│                        GestaOS                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────────┐ │
│  │ React   │  │Supabase │  │  Edge   │  │ External APIs │ │
│  │   SPA   │──│  BaaS   │──│Functions│──│ Talana/OREX   │ │
│  └─────────┘  └─────────┘  └─────────┘  │   Azure AD    │ │
│       │                              │               └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules (14)

| Module | Purpose | Status |
|--------|---------|--------|
| Records | QR attendance, event management | Production |
| LMS | Course management, enrollment | Production |
| GestaWork | HR management | Production |
| Docnomina | Payroll documentation | Production |
| SpotPass | External employee access | Production |
| Analytics Hub | Reporting | Production |
| Admin Panel | User/role management | Production |
| OREX | Mining operations | Integration |
| ... | ... | ... |
```

---

## 5. Runtime View

### Estado Actual
- Auth Flow: genérico (no menciona Supabase Auth + Azure AD)
- QR Attendance: NO DOCUMENTADO (critical gap)
- SSO Launch: NO DOCUMENTADO (critical gap)
- LMS Enrollment: NO DOCUMENTADO (critical gap)

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A5.1 | Documentar flujo Supabase Auth + MSAL Azure AD | HIGH | Tech Lead | 1h |
| A5.2 | Documentar flujo QR Attendance: scan → validate RUT → event window → duplicate check → store | HIGH | Tech Lead | 2h |
| A5.3 | Documentar flujo SSO Hub: issue token → redirect → validate → establish session | HIGH | Tech Lead | 2h |
| A5.4 | Documentar flujo LMS QR auto-enrollment | MEDIUM | Tech Lead | 1h |

### Runtime Flows Documentados

```markdown
## QR Attendance Flow

```
External User       React SPA        Edge Function       Supabase
     │                  │                  │                 │
     │──Scan QR────────>│                  │                 │
     │                  │──POST /records-qr-validate       │
     │                  │                  │                 │
     │                  │                  │──validate RUT──>│
     │                  │                  │<──módulo 11──────│
     │                  │                  │                 │
     │                  │                  │──check event───>│
     │                  │                  │<──window ok─────│
     │                  │                  │                 │
     │                  │                  │──check dup─────>│
     │                  │                  │<──no dup────────│
     │                  │                  │                 │
     │                  │<────────success with geo/IP log───│
     │<──confirmation──│                  │                 │
```

## SSO Hub Launch Flow

```
User    React SPA    Edge Function    Supabase    External App
 │          │              │              │            │
 │──click──>│              │              │            │
 │          │──POST /sso-issue-token──────>│            │
 │          │<─────────JWT EdDSA token─────│            │
 │<──redirect to appUrl + token───────────│            │
 │          │                              │            │
 │─────────────────────────validate────────────────────>│
 │          │<───────────session established─────────────│
```
```

---

## 6. Deployment View

### Estado Actual
- ✅ Correcto: Vercel + Supabase Cloud
- No EKS, no Kubernetes

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A6.1 | Verificar que diagramas reflejan realidad (Vercel + Supabase, no EKS) | LOW | Tech Lead | 1h |

---

## 7. Concepts and Patterns

### Estado Actual
- Domain concepts: genéricos (User, Organization)
- Missing: RUT, Módulo 11, Faena, Cuadrillas, SpotPass

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A7.1 | Documentar dominio específico: RUT, Módulo 11, Faena, Cuadrillas, Cost Center, SpotPass | HIGH | Product Owner + Domain Expert | 3h |
| A7.2 | Documentar patrones: Service Layer, Edge Function Proxy, SSO Hub | MEDIUM | Tech Lead | 1h |

---

## 8. Architecture Decisions (ADRs)

### Estado Actual
- Solo 3 ADRs genéricos
- Missing: QR attendance, dual Prisma, SSO Hub

### Acciones Requeridas

| ID | ADR | Decisión | Status |
|----|-----|----------|--------|
| ADR-001 | PostgreSQL vs MongoDB | Supabase (PostgreSQL managed) | Accepted |
| ADR-002 | REST vs GraphQL | REST via Supabase client | Accepted |
| ADR-003 | JWT rotation | Supabase sessions + optional Azure AD | Accepted |
| ADR-004 | QR-based attendance | RUT validation, geo-location, IP logging | Proposed |
| ADR-005 | Dual Prisma Schema | origen/destino sync for migrations | Proposed |
| ADR-006 | SSO Hub | JWT EdDSA for third-party launches | Proposed |

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A8.1 | Documentar ADR-004: QR Attendance con RUT validación | HIGH | Tech Lead | 1h |
| A8.2 | Documentar ADR-005: Dual Prisma Schema | HIGH | Tech Lead | 1h |
| A8.3 | Documentar ADR-006: SSO Hub con JWT EdDSA | HIGH | Tech Lead | 1h |

---

## 9. Quality Requirements

### Estado Actual
- Sin SLOs definidos
- Sin métricas de performance
- Sin security requirements documentados

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A9.1 | Definir SLOs: Availability 99.9%, Performance P95 <200ms | HIGH | Product Owner | 2h |
| A9.2 | Definir security requirements: OWASP ASVS L1 compliance | HIGH | Security Lead | 1h |
| A9.3 | Definir test coverage target: >60% | MEDIUM | Tech Lead | 1h |

### Quality Requirements Propuestos

```markdown
## Quality Requirements

### Availability
- SLO: 99.9% monthly (Supabase managed)
- Measurement: Supabase dashboard uptime

### Performance
- SLO: P95 response time <200ms
- Measurement: Vercel Analytics

### Security
- SLO: OWASP ASVS L1 100%
- Measurement: Quarterly audit

### Maintainability
- SLO: Test coverage >60%
- Measurement: Vitest coverage report
```

---

## 10. Risks and Technical Debt

### Estado Actual
- Risk register: genérico
- Tech debt: no identificado formalmente

### Acciones Requeridas

| ID | Riesgo | Impacto | Mitigación |
|----|--------|---------|------------|
| R1 | CORS wildcard en edge functions | CRITICAL | Implementar origins específicos |
| R2 | Sin RLS en destino | HIGH | Implementar RLS policies |
| R3 | Sin dependency scanning | HIGH | Integrar pnpm audit en CI/CD |
| R4 | No E2E tests | MEDIUM | Implementar Playwright/Cypress |
| R5 | No API documentation | MEDIUM | Generar OpenAPI spec |

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A10.1 | Priorizar risk register con equipo | HIGH | Product Owner | 2h |
| A10.2 | Documentar tech debt: no E2E, no API docs, dual Prisma sync | MEDIUM | Tech Lead | 1h |

---

## 11. Glossary

### Estado Actual
- Genérico (ACID, ADR, API, etc.)
- Missing: RUT, Módulo 11, Faena, Cuadrillas

### Acciones Requeridas

| ID | Término | Definición |
|----|---------|------------|
| RUT | Rol Único Tributario | Chilean tax ID number |
| Módulo 11 | Algorithm | RUT validation algorithm |
| Faena | | Mining site/operation |
| Cuadrillas | | Work crew/team |
| SpotPass | | External employee access system |
| SSO | Single Sign-On | Centralized authentication |
| EdDSA | Edwards-curve DSA | Digital signature algorithm |

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A11.1 | Validar glossary con domain expert | HIGH | Product Owner | 2h |

---

## 12. Appendices

### Estado Actual
- Sin diagrams
- Sin API spec
- Sin DB schema documentado

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| A12.1 | Generar diagrams C4 (Context, Container, Component) | LOW | Tech Lead | 3h |
| A12.2 | Generar OpenAPI spec para edge functions | LOW | Tech Lead | 3h |
| A12.3 | Documentar Prisma schemas | LOW | Tech Lead | 2h |

---

## Roadmap de Implementación

```
Semana 1:
├── A1.1-A1.3: Introduction and Goals (4h)
├── A2.1-A2.3: Architecture Constraints (3h)
└── A5.2-A5.4: Critical Runtime Flows (5h)

Semana 2:
├── A4.1-A4.3: Building Block View (8h)
├── A8.1-A8.3: ADRs (3h)
└── A7.1: Domain Concepts (3h)

Semana 3:
├── A3.1-A3.3: Solution Strategy (4h)
├── A9.1-A9.3: Quality Requirements (4h)
└── A10.1-A10.2: Risks and Tech Debt (3h)

Semana 4:
├── A11.1: Glossary validation (2h)
├── A6.1: Deployment verification (1h)
└── A12.1-A12.3: Appendices (8h)
```

---

## Dependencias

```
A1.1 → A1.2
A4.2 → A4.3
A5.2 → A5.3 → A5.4
A8.1-A8.3 (independent)
A9.1 → A9.2 → A9.3
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Sections complete | 12/12 |
| ADRs documented | 6 |
| User flows documented | 4 |
| Diagrams created | 5+ |
| Glossary terms | 15+ |