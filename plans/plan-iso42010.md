# Plan de Remediación: ISO 42010 - GestaOS

**Estándar:** ANSI/IEEE 42010 (Architecture Description Languages)
**Fecha:** 2026-05-15
**Estado actual:** Template genérico - 3 vistas (logical/deployment/operational) existentes pero incorrectas
**Meta:** Documentación ISO 42010 específica para GestaOS

---

## Resumen Ejecutivo

| View | Template | GestaOS Reality | Status |
|------|----------|-----------------|--------|
| **logical** | Genérico (Users/Orders/Products) | React SPA + Supabase BaaS + 14 módulos | ❌ |
| **deployment** | AWS EKS + RDS + CloudFront | Vercel + Supabase Cloud (no containers) | ❌ |
| **operational** | Genérico e-commerce | QR attendance, SSO Hub, LMS enrollment | ❌ |

**Total estimado:** 32h

---

## 1. Logical View

### Estado Actual
- Componentes: genéricos (Users/Orders/Products)
- Interfases: no documentadas
- Dependencies: no mapeadas

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| L1.1 | Documentar arquitectura SPA: React + Zustand + React Query | HIGH | Tech Lead | 2h | - |
| L1.2 | Documentar Supabase BaaS: PostgreSQL + Auth + Storage + Edge Functions | HIGH | Tech Lead | 2h | L1.1 |
| L1.3 | Inventariar 14 módulos y sus responsabilidades | HIGH | Tech Lead | 3h | - |
| L1.4 | Documentar interfaces: Supabase client API, Edge function HTTP, MSAL Graph | HIGH | Tech Lead | 2h | L1.1 |
| L1.5 | Crear dependency map: React → Supabase → Edge → External APIs | HIGH | Tech Lead | 3h | L1.2, L1.3 |
| L1.6 | Definir arquitectura style: SPA + BaaS (no monolithic) | MEDIUM | Tech Lead | 1h | - |

### Logical View Propuesto

```markdown
## System Decomposition

```
GestaOS
├── React SPA (Frontend)
│   ├── Components: Records, LMS, Admin, etc.
│   ├── State: Zustand (useHubStore)
│   └── Data: React Query + Supabase Client
│
├── Supabase BaaS (Backend-as-a-Service)
│   ├── PostgreSQL (managed)
│   ├── Auth (email/password + Azure AD optional)
│   ├── Storage (record-evidences, lms buckets)
│   └── RLS Policies
│
├── Edge Functions (Deno - 30+)
│   ├── auth-service
│   ├── records-service
│   ├── lms-service
│   ├── audit-service
│   ├── sso-service
│   ├── proxy-orex-gateway
│   ├── proxy-talana
│   └── ... (22 more)
│
└── External APIs
    ├── Azure AD (MSAL Graph)
    ├── Talana API
    └── OREX API
```

## Key Abstractions

| Element | Responsibility | Public Interface |
|---------|---------------|------------------|
| React SPA | UI + routing + state management | React components, Zustand store |
| Supabase Client | DB queries, auth, storage | `@supabase/supabase-js` methods |
| Edge Functions | Server-side logic, API proxies | HTTP POST/GET endpoints |
| records-service | CRUD for records, attendees, evidences | getRecords(), createRecord(), etc. |
| lms-service | Course/enrollment management | getCourses(), enrollEmployee() |
| sso-service | SSO token issuance | issueToken(), consumeToken() |
```

---

## 2. Deployment View

### Estado Actual
- Template asume: AWS EKS + RDS + CloudFront
- GestaOS: Vercel + Supabase Cloud (no containers)

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| D1.1 | Documentar topología real: Vercel Edge → React SPA → Supabase | HIGH | DevOps | 1h | - |
| D1.2 | Documentar Supabase Cloud: PostgreSQL multi-AZ, Auth, Storage | HIGH | DevOps | 1h | - |
| D1.3 | Documentar Edge Functions runtime (Deno) | HIGH | DevOps | 1h | - |
| D1.4 | Crear diagrama de deployment | HIGH | Tech Lead | 2h | D1.1, D1.2, D1.3 |
| D1.5 | Documentar scaling strategy: Vercel auto-scale, Supabase managed | MEDIUM | DevOps | 1h | - |
| D1.6 | Documentar CDN: Vercel Edge Network (no CloudFront) | MEDIUM | DevOps | 1h | - |

### Deployment View Propuesto

```markdown
## Deployment Topology

```
Internet
   │
   ▼
┌──────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   CDN       │  │   SPA       │  │   Edge Functions     │  │
│  │   (cache)   │──│  (React)    │──│   (Deno runtime)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼ HTTPS
┌──────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │PostgreSQL│  │   Auth   │  │  Storage │  │    Edge      │ │
│  │ (multi-AZ)│  │(email+AD)│  │  (S3-compat)│  │  Functions   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           │
                    Direct REST APIs
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ Azure AD │     │ Talana   │     │   OREX    │
   └──────────┘     └──────────┘     └──────────┘
```

## Infrastructure Configuration

| Component | Technology | Scaling |
|-----------|------------|---------|
| Frontend | Vercel | Auto-scale (serverless) |
| CDN | Vercel Edge | Auto-scale |
| Database | Supabase PostgreSQL | Managed multi-AZ |
| Auth | Supabase Auth + Azure AD | Managed |
| Storage | Supabase Storage | Managed (S3-compatible) |
| Edge Functions | Supabase Edge (Deno) | Auto-scale |
| External APIs | Azure AD, Talana, OREX | N/A |
```

---

## 3. Operational View

### Estado Actual
- Flujos genéricos: User Authentication, Order Creation (no aplica)
- Missing: QR Attendance, SSO Launch, LMS Enrollment

### Acciones Requeridas

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| O1.1 | Documentar flujo QR Attendance completo | HIGH | Tech Lead | 3h | - |
| O1.2 | Documentar flujo SSO Hub Launch completo | HIGH | Tech Lead | 3h | - |
| O1.3 | Documentar flujo LMS QR Auto-enrollment | MEDIUM | Tech Lead | 2h | - |
| O1.4 | Documentar control mechanisms: RUT validation, duplicate check, token expiry | HIGH | Tech Lead | 2h | O1.1, O1.2 |
| O1.5 | Crear sequence diagrams para cada flujo | MEDIUM | Tech Lead | 4h | O1.1, O1.2, O1.3 |

### QR Attendance Flow

```markdown
## QR Attendance Sequence

```
Actor          React SPA         Edge Function        Supabase
   │                │                   │                  │
   │  1. Scan QR    │                   │                  │
   │───────────────>│                   │                  │
   │                │  2. POST /records-qr-validate        │
   │                │──────────────────>│                  │
   │                │                   │  3. Normalize RUT │
   │                │                   │───────────────>  │
   │                │                   │<───────────────  │
   │                │                   │  (módulo 11)     │
   │                │                   │                  │
   │                │                   │  4. Validate     │
   │                │                   │      event window│
   │                │                   │───────────────>  │
   │                │                   │<───────────────  │
   │                │                   │  (ok or expired) │
   │                │                   │                  │
   │                │                   │  5. Check        │
   │                │                   │      duplicate   │
   │                │                   │───────────────>  │
   │                │                   │<───────────────  │
   │                │                   │  (ok or exists)  │
   │                │                   │                  │
   │                │                   │  6. Insert       │
   │                │                   │   attendee      │
   │                │                   │───────────────>  │
   │                │                   │                  │
   │                │<─── success ──────│                  │
   │<─ confirmation │                   │                  │
   │                │                   │                  │
```

## Controls

| Control | Trigger | Response |
|---------|---------|----------|
| RUT Validation | Invalid RUT format | Reject with message |
| RUT Mod 11 | Invalid check digit | Reject with message |
| Event Window | Outside attendance_window_start/end | Reject "event closed" |
| Duplicate Check | Same RUT + event already exists | Reject "already registered" |
| Geo/IP Logging | Valid attendance | Store for audit |
```

### SSO Hub Launch Flow

```markdown
## SSO Launch Sequence

```
Actor      React SPA    Edge Function    Supabase    External App
   │           │              │              │            │
   │  1. Click │              │              │            │
   │──────────>│              │              │            │
   │           │  2. POST /sso-issue-token   │            │
   │           │────────────────────────────>│            │
   │           │<───────────────────────────│            │
   │           │  (JWT EdDSA token)         │            │
   │           │              │              │            │
   │<─ redirect with token + appUrl ────────│            │
   │           │              │              │            │
   │  3. Validate token at external app     │            │
   │────────────────────────────────────────>│            │
   │           │              │              │<─ /sso-jwks │
   │           │              │<─────────────│            │
   │<───────────────────────── session established ────────│
```

## SSO Token Controls

| Control | Trigger | Response |
|---------|---------|----------|
| Session Validation | Invalid/expired session | Reject token issue |
| Role Sync | Token issued | Sync roles from Supabase |
| Token Expiry | Token > 1 hour old | Auto-expire |
| Revocation | User logout | Mark token hash as revoked |
```

---

## 4. Cross-Cutting Concerns

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| X1.1 | Definir notation standard: C4 + UML para diagrams | MEDIUM | Tech Lead | 2h |
| X1.2 | Crear architecture decision record para architectural style | HIGH | Tech Lead | 1h |
| X1.3 | Documentar assumptions: SPA + BaaS (no Node.js server, no K8s) | HIGH | Tech Lead | 1h |

---

## Gap Analysis Summary

| View | Current State | Target State | Gap |
|------|---------------|--------------|-----|
| Logical | Generic components | 14 modules + services | 8h |
| Deployment | AWS EKS (wrong) | Vercel + Supabase | 4h |
| Operational | Generic e-commerce | QR + SSO + LMS flows | 12h |
| Cross-cutting | No diagrams | C4 + UML | 8h |

---

## Roadmap de Implementación

```
Semana 1:
├── L1.1-L1.6: Logical View (13h)
└── D1.1-D1.3: Deployment Infrastructure (3h)

Semana 2:
├── D1.4-D1.6: Deployment View completion (4h)
├── O1.1: QR Attendance flow (3h)
└── O1.2: SSO Launch flow (3h)

Semana 3:
├── O1.3: LMS Enrollment flow (2h)
├── O1.4: Control mechanisms (2h)
├── O1.5: Sequence diagrams (4h)
└── X1.1-X1.3: Cross-cutting (4h)
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Views documented | 3/3 |
| Module inventory | 14/14 |
| User flows documented | 4/4 |
| Sequence diagrams | 4+ |
| Control mechanisms | 8+ |