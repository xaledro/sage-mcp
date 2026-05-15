# Plan de Remediación: OWASP ASVS L1 - GestaOS

**Estándar:** OWASP ASVS L1 (2024)
**Fecha:** 2026-05-15
**Estado actual:** ~65% compliance (15 PASS / 15 PARTIAL / 11 FAIL)
**Meta:** 100% OWASP ASVS L1 compliance

---

## Resumen Ejecutivo

| Category | PASS | PARTIAL | FAIL | Total |
|----------|------|---------|------|-------|
| A01: Broken Access Control | 3 | 5 | 2 | 10 |
| A02: Cryptographic Failures | 4 | 2 | 0 | 6 |
| A03: Injection | 6 | 0 | 0 | 6 |
| A04: Insecure Design | 1 | 2 | 0 | 3 |
| A05: Security Misconfiguration | 1 | 2 | 2 | 5 |
| A06: Vulnerable Components | 0 | 0 | 2 | 2 |
| A07: Authentication Failures | 3 | 2 | 0 | 5 |
| A08: Data Integrity | 0 | 0 | 2 | 2 |
| A09: Logging | 1 | 2 | 1 | 4 |
| A10: SSRF | 0 | 2 | 0 | 2 |
| **Total** | **19** | **17** | **11** | **47** |

---

## Hallazgos Críticos (CRITICAL/HIGH)

### C1: CORS wildcard `*` en todas las edge functions

**Severity:** CRITICAL
**Impact:** Cualquier origen puede llamar las APIs de GestaOS
**Location:** Todas las edge functions en `supabase/functions/`

**Acciones:**

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| C1.1 | Identificar orígenes permitidos: Vercel domains + posibles partners | HIGH | DevOps | 1h | - |
| C1.2 | Actualizar CORS headers en todas las edge functions | HIGH | DevOps | 4h | C1.1 |
| C1.3 | Implementar allowlist validation en edge functions | HIGH | DevOps | 4h | C1.2 |
| C1.4 | Documentar policy CORS en security runbook | MEDIUM | Tech Lead | 1h | C1.2 |

### C2: Sin RLS en tablas de Supabase destino

**Severity:** HIGH
**Impact:** Acceso directo a tablas via service role key
**Location:** Database `lptafzrhpiypffrewdix`

**Acciones:**

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| C2.1 | Audit de tablas destino: identificar cuáles requieren RLS | HIGH | DevOps | 3h | - |
| C2.2 | Implementar RLS policies para tablas críticas | HIGH | DevOps | 8h | C2.1 |
| C2.3 | Testing de RLS: verificar policies funcionan correctamente | HIGH | DevOps | 4h | C2.2 |
| C2.4 | Documentar RLS policies en security runbook | MEDIUM | Tech Lead | 1h | C2.2 |

### C3: Raw error messages en admin-users/index.ts

**Severity:** HIGH
**Impact:** Information disclosure
**Location:** `supabase/functions/admin-users/index.ts` line 898-901

**Acciones:**

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| C3.1 | Revisar todos los endpoint de edge functions para errores raw | HIGH | DevOps | 2h | - |
| C3.2 | Implementar centralized error handler para edge functions | HIGH | DevOps | 4h | - |
| C3.3 | Reemplazar `error.message` con mensajes genéricos | HIGH | DevOps | 2h | C3.2 |

### C4: Sin dependency vulnerability scanning

**Severity:** HIGH
**Impact:** Vulnerabilidades en dependencias no detectadas
**Location:** CI/CD pipeline

**Acciones:**

| ID | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|----|--------|-----------|--------------|-----------|--------------|
| C4.1 | Integrar `pnpm audit` en Vercel CI/CD pipeline | HIGH | DevOps | 2h | - |
| C4.2 | Configurar fail-on-vulnerability en CI/CD | HIGH | DevOps | 1h | C4.1 |
| C4.3 | Establecer proceso de dependency update regular (mensual) | MEDIUM | DevOps | 2h | - |
| C4.4 | Revisar vulnerabilidad de `@supabase/supabase-js@2.99.2` | MEDIUM | DevOps | 1h | - |

---

## Hallazgos Medios (MEDIUM)

### M1: Missing security headers

**Items:** HSTS, CSP, Permissions-Policy, X-XSS-Protection
**Location:** `vercel.json`

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| M1.1 | Agregar HSTS header en `vercel.json` | MEDIUM | DevOps | 1h |
| M1.2 | Agregar Content-Security-Policy header | MEDIUM | DevOps | 2h |
| M1.3 | Agregar Permissions-Policy header | MEDIUM | DevOps | 1h |
| M1.4 | Testing de headers en staging | MEDIUM | DevOps | 1h |

### M2: No software integrity verification

**Severity:** MEDIUM
**Impact:** Supply chain risk

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| M2.1 | Implementar SBOM generation en CI/CD | MEDIUM | DevOps | 4h |
| M2.2 | Configurar dependency pinning (package.json) | MEDIUM | DevOps | 2h |
| M2.3 | Implementar Vercel build verification | MEDIUM | DevOps | 2h |

### M3: No real-time alerting

**Severity:** MEDIUM
**Impact:** Incidentes no detectados al momento

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| M3.1 | Configurar alerts en Supabase para errores | MEDIUM | DevOps | 3h |
| M3.2 | Definir qué constituye un "incidente" de seguridad | MEDIUM | Security Lead | 2h |
| M3.3 | Implementar alert channel (email/Slack/PagerDuty) | MEDIUM | DevOps | 2h |

---

## Hallazgos Bajos (LOW)

### L1: MFA no enforced

**Severity:** LOW
**Impact:** Azure AD disponible pero opcional

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| L1.1 | Decidir nivel de MFA requerido (admins only o todos) | LOW | Management | 1h |
| L1.2 | Implementar MFA enforcement si es requerido | LOW | DevOps | 4h |

### L2: No tamper-proofing en logs

**Severity:** LOW
**Impact:** Audit logs podrían ser modificados

| ID | Acción | Prioridad | Responsable | Esfuerzo |
|----|--------|-----------|--------------|-----------|
| L2.1 | Evaluar necesidad de tamper-proof logs (compliance) | LOW | Security Lead | 1h |
| L2.2 | Implementar log integrity verification si es requerido | LOW | DevOps | 4h |

---

## Checking por Requirement

### A01: Broken Access Control (10 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 1.1.1 | ⚠️ | Verificar auth check en API level |
| 1.1.2 | ❌ | Implementar ownership checks |
| 1.1.3 | ⚠️ | Verificar role validation en Edge |
| 1.2.1 | ⚠️ | Verificar admin checks en API |
| 1.2.2 | ✅ | - |
| 1.3.1 | ❌ | Implementar ownership verification |
| 1.3.2 | ✅ | - |
| 1.4.1 | ⚠️ | Implementar centralized deny |
| 1.5.1 | ✅ | - |

### A02: Cryptographic Failures (6 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 2.1.1 | ⚠️ | Documentar Supabase encryption config |
| 2.1.2 | ✅ | - |
| 2.2.1 | ✅ | - |
| 2.2.2 | ✅ | - |
| 2.3.1 | ✅ | - |
| 2.4.1 | ⚠️ | Documentar allowed algorithms |

### A03: Injection (6 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 3.1.1 | ✅ | - |
| 3.1.2 | ✅ | - |
| 3.2.1 | ✅ | - |
| 3.3.1 | ✅ | - |
| 3.4.1 | ✅ | - |
| 3.5.1 | ✅ | - |

### A04: Insecure Design (3 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 4.1.1 | ✅ | - |
| 4.2.1 | ❌ | Implementar horizontal access control en QR validate |
| 4.3.1 | ✅ | - |

### A05: Security Misconfiguration (5 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 5.1.1 | ❌ | Implementar centralized error handler |
| 5.2.1 | ✅ | - |
| 5.3.1 | ⚠️ | Agregar missing security headers |
| 5.4.1 | ⚠️ | Verificar RLS en LMS |

### A06: Vulnerable Components (2 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 6.1.1 | ❌ | Implementar dependency update process |
| 6.2.1 | ❌ | Integrar pnpm audit en CI/CD |

### A07: Authentication Failures (5 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 7.1.1 | ✅ | - |
| 7.2.1 | ✅ | - |
| 7.3.1 | ✅ | - |
| 7.4.1 | ⚠️ | Evaluar Azure AD MFA enforcement |

### A08: Data Integrity Failures (2 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 8.1.1 | ❌ | Implementar update verification |
| 8.2.1 | ❌ | Implementar CI/CD security |

### A09: Security Logging (4 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 9.1.1 | ✅ | - |
| 9.2.1 | ⚠️ | Evaluar tamper-proof requirement |
| 9.3.1 | ❌ | Implementar real-time alerting |

### A10: SSRF (2 reqs)

| Req | Estado | Acción |
|-----|--------|--------|
| 10.1.1 | ⚠️ | Revisar URL validation en proxy functions |
| 10.2.1 | ⚠️ | Documentar allowed endpoints |

---

## Roadmap de Implementación

```
Semana 1 (Critical):
├── C1.1-C1.4: CORS fix (10h)
├── C3.1-C3.3: Error handler (8h)
└── C4.1-C4.2: pnpm audit CI/CD (3h)

Semana 2 (High):
├── C2.1-C2.4: RLS implementation (16h)
├── C4.3-C4.4: Dependency process (3h)
└── M1.1-M1.4: Security headers (5h)

Semana 3 (Medium):
├── M2.1-M2.3: Software integrity (8h)
├── M3.1-M3.3: Alerting (7h)
└── L1.1-L1.2: MFA enforcement (5h)

Semana 4 (Low + Verification):
├── L2.1-L2.2: Log integrity (5h)
├── Full OWASP ASVS L1 verification
└── Documentation
```

---

## Dependencias

```
C1.1 → C1.2 → C1.3 → C1.4
C2.1 → C2.2 → C2.3 → C2.4
C3.1 → C3.2 → C3.3
M1.1 → M1.2 → M1.3 → M1.4
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| OWASP ASVS L1 Compliance | 100% (47/47) |
| Critical findings resolved | 3/3 |
| High findings resolved | 6/6 |
| Medium findings resolved | 6/6 |
| Low findings resolved | 4/4 |

---

## Archivos de Referencia

- `ai/docs/gap-analysis-owasp-l1.md` - Gap analysis completo
- `ai/docs/security-runbook.md` - Security runbook (por crear)
- `ai/docs/incident-response.md` - Incident response (por crear)