# Plan de Remediación: ISO 9241-11 - GestaOS

**Estándar:** ISO 9241-11 (Usability)
**Fecha:** 2026-05-15
**Estado actual:** ~20% measured (~5 PASS / 10 PARTIAL / 9 UNKNOWN)
**Meta:** Evaluación completa de 24 criterios + implementación de métricas

---

## Resumen Ejecutivo

| Category | PASS | PARTIAL | UNKNOWN | Total |
|----------|------|---------|---------|-------|
| Effectiveness (E1-E8) | 3 | 4 | 1 | 8 |
| Efficiency (N1-N8) | 1 | 4 | 2 | 8 |
| Satisfaction (S1-S8) | 1 | 6 | 1 | 8 |
| **Total** | **5** | **14** | **4** | **24** |

---

## Critical Gaps

### Gap 1: No Task Completion Metrics
- **Impact:** No se puede medir si el objetivo 85% se cumple
- **Criterios afectados:** E3

### Gap 2: No Response Time Tracking
- **Impact:** No se puede verificar el objetivo de 1 segundo
- **Criterios afectados:** N1, N4

### Gap 3: No NPS / Satisfaction Surveys
- **Impact:** No se puede medir satisfacción de usuarios
- **Criterios afectados:** S2

---

## Effectiveness (E1-E8)

### E1: Users can complete tasks without errors

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Implementar tracking de errores por flujo | HIGH | Tech Lead | 8h |
| ⚠️ PARTIAL | Revisar RUT validation UX | MEDIUM | Tech Lead | 2h |
| ⚠️ PARTIAL | Revisar QR validation UX | MEDIUM | Tech Lead | 2h |

### E2: Users can achieve their intended outcome

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ✅ PASS | Mantener - verificar periódicamente | LOW | Product Owner | 1h/mes |

### E3: Task completion rate >85%

| Estado | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|--------|--------|-----------|--------------|-----------|--------------|
| ❌ UNKNOWN | Implementar analytics para tracking task completion | HIGH | Tech Lead | 12h | - |
| ❌ UNKNOWN | Definir "task completion" por módulo | HIGH | Product Owner | 4h | - |
| ❌ UNKNOWN | Crear dashboard de completion rates | MEDIUM | Tech Lead | 8h | E3.1, E3.2 |

### E4: Users can recover from errors easily

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Revisar sonner toasts - son claras y accionables? | MEDIUM | Tech Lead | 2h |
| ⚠️ PARTIAL | Revisar AlertDialogs para acciones destructivas | MEDIUM | UX | 2h |
| ⚠️ PARTIAL | Implementar error recovery hints | MEDIUM | Tech Lead | 4h |

### E5: Help is available when needed

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Implementar help system o tooltip guide | MEDIUM | Tech Lead | 8h |
| ⚠️ PARTIAL | Enhance CommandMenu con help commands | MEDIUM | Tech Lead | 4h |
| ⚠️ PARTIAL | Add contextual help en forms | LOW | UX | 4h |

### E6: Users understand what actions are available

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ✅ PASS | Mantener - revisar annually | LOW | UX | 1h/año |

### E7: Users can identify how to perform actions

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Add tooltips para acciones complejas | MEDIUM | UX | 4h |
| ⚠️ PARTIAL | Review button labels para claridad | MEDIUM | UX | 2h |
| ⚠️ PARTIAL | Implementar guided flows para acciones críticas | MEDIUM | Tech Lead | 8h |

### E8: Results are presented clearly

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ✅ PASS | Mantener - verificar periódicamente | LOW | UX | 1h/mes |

---

## Efficiency (N1-N8)

### N1: Tasks complete in reasonable time

| Estado | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|--------|--------|-----------|--------------|-----------|--------------|
| ❌ UNKNOWN | Implementar APM (Application Performance Monitoring) | HIGH | DevOps | 16h | - |
| ❌ UNKNOWN | Track response times por endpoint | HIGH | Tech Lead | 8h | N1.1 |
| ❌ UNKNOWN | Crear dashboard de performance | MEDIUM | Tech Lead | 8h | N1.1, N1.2 |

### N2: Minimum steps required to complete tasks

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Analizar RecordEventForm - simplificar si possible | MEDIUM | UX | 4h |
| ⚠️ PARTIAL | Review bulk operations - agregar si hace falta | MEDIUM | Tech Lead | 8h |
| ⚠️ PARTIAL | Implementar shortcuts para power users | MEDIUM | Tech Lead | 8h |

### N3: No unnecessary effort or repetition

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Review React Query caching strategy | MEDIUM | Tech Lead | 4h |
| ⚠️ PARTIAL | Implementar form auto-save | MEDIUM | Tech Lead | 8h |
| ⚠️ PARTIAL | Add bulk operations para attendees/evidences | MEDIUM | Tech Lead | 8h |

### N4: System responds within 1 second

| Estado | Acción | Prioridad | Responsable | Esfuerzo | Dependencias |
|--------|--------|-----------|--------------|-----------|--------------|
| ❌ UNKNOWN | Definir baseline de performance (Vercel Analytics) | HIGH | DevOps | 2h | - |
| ❌ UNKNOWN | Identificar slow endpoints con APM | HIGH | DevOps | 8h | N1.1 |
| ❌ UNKNOWN | Optimizar endpoints slow (>200ms) | HIGH | Tech Lead | 16h | N4.2 |

### N5: Shortcuts for expert users

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Expandir CommandMenu (Cmd+K) | MEDIUM | Tech Lead | 8h |
| ⚠️ PARTIAL | Add keyboard shortcuts para acciones comunes | MEDIUM | Tech Lead | 12h |
| ⚠️ PARTIAL | Documentar shortcuts en UI | LOW | Tech Lead | 2h |

### N6: Information easily accessible

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ✅ PASS | Mantener - review annually | LOW | UX | 1h/año |

### N7: Drag-and-drop work smoothly

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| N/A | No drag-drop significativo en GestaOS | - | - | - |

### N8: Batch operations supported

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Implementar bulk delete para attendees | MEDIUM | Tech Lead | 8h |
| ⚠️ PARTIAL | Implementar bulk operations para evidences | MEDIUM | Tech Lead | 8h |
| ⚠️ PARTIAL | Review admin-users bulk_create - extender? | MEDIUM | Tech Lead | 4h |

---

## Satisfaction (S1-S8)

### S1: Interface pleasant to use

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Conduct periodic UX reviews | MEDIUM | UX | 4h/mes |
| ⚠️ PARTIAL | User testing sessions (2x year) | MEDIUM | UX | 16h/año |

### S2: Users would recommend system

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ❌ UNKNOWN | Implementar NPS survey quarterly | HIGH | Product Owner | 8h |
| ❌ UNKNOWN | Create "recommend" metric tracking | MEDIUM | Tech Lead | 4h |
| ❌ UNKNOWN | Set NPS target and track | MEDIUM | Product Owner | 2h/q |

### S3: Users feel confident using system

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Review error messages - sean más helpful? | MEDIUM | Tech Lead | 8h |
| ⚠️ PARTIAL | Implementar onboarding flow para nuevos usuarios | MEDIUM | UX | 16h |
| ⚠️ PARTIAL | Add progress indicators para procesos largos | MEDIUM | Tech Lead | 8h |

### S4: Visually consistent

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ✅ PASS | Mantener - audit annually | LOW | UX | 1h/año |

### S5: No unnecessary cognitive load

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Simplificar RecordEventForm (revisar campos requeridos) | HIGH | UX + Tech Lead | 8h |
| ⚠️ PARTIAL | Progressive disclosure para forms complejos | MEDIUM | UX | 8h |
| ⚠️ PARTIAL | Review module catalog - sea claro? | MEDIUM | UX | 4h |

### S6: User feedback is helpful and timely

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Implementar in-app feedback mechanism | MEDIUM | Tech Lead | 16h |
| ⚠️ PARTIAL | Implementar "report issue" functionality | MEDIUM | Tech Lead | 8h |

### S7: Error messages are constructive

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Review todas las edge function error messages | HIGH | Tech Lead | 8h |
| ⚠️ PARTIAL | Centralized error handler en edge functions | HIGH | Tech Lead | 8h |
| ⚠️ PARTIAL | User-friendly error messages (no raw error.message) | HIGH | Tech Lead | 8h |

### S8: System feels reliable and stable

| Estado | Acción | Prioridad | Responsable | Esfuerzo |
|--------|--------|-----------|--------------|----------|
| ⚠️ PARTIAL | Implementar SLO tracking dashboard | MEDIUM | DevOps | 8h |
| ⚠️ PARTIAL | Documentar Supabase SLA tracking | MEDIUM | DevOps | 2h |

---

## Priority Matrix

| Priority | Actions |
|----------|---------|
| **CRITICAL** | E3.1, E3.2, E3.3 (task completion), N1.1, N1.2, N4.2 (performance), S2.1 (NPS), S7.1-S7.3 (error messages) |
| **HIGH** | N2.1 (form simplify), N4.1, N4.3 (performance), S5.1 (cognitive load), S3.2 (onboarding), S7.1-S7.3 |
| **MEDIUM** | E4.1, E4.2, E4.3 (error recovery), N5.1, N5.2 (shortcuts), N8.1, N8.2 (batch ops), S3.1, S3.3, S6.1, S6.2, S8.1, S8.2 |
| **LOW** | E1.1 (track), E1.2, E1.3, E5.1, E5.2, E7.1, E7.2, N2.3, N3.1, N3.2, N3.3, S1.1, S1.2 |

---

## Roadmap de Implementación

```
Semana 1 (Critical):
├── E3.1-E3.3: Task completion tracking (24h)
├── S7.1-S7.3: Error message centralized handler (24h)
└── N4.1-N4.3: Performance baseline and tracking (26h)

Semana 2 (High):
├── N1.1: APM setup (16h)
├── S2.1: NPS survey implementation (8h)
├── S5.1: Form simplification (8h)
└── S3.2: Onboarding flow (16h)

Semana 3 (Medium):
├── N5.1, N5.2: Shortcuts (20h)
├── N8.1, N8.2: Batch operations (16h)
├── S6.1, S6.2: In-app feedback (24h)
└── N2.1, N3.2, N3.3: Efficiency improvements (20h)

Semana 4 (Low + Verification):
├── E4.1-E4.3: Error recovery (8h)
├── S8.1, S8.2: Reliability tracking (10h)
├── S1.1, S1.2: UX reviews (ongoing)
└── Full ISO 9241 verification
```

---

## Measurement Methods

| Criterion | How to Measure |
|-----------|---------------|
| E1: Error-free tasks | Track errors in React Query onError callbacks |
| E3: Task completion >85% | Analytics: track start → completion events |
| N1, N4: Response <1s | APM: p95 response times per endpoint |
| N2: Minimum steps | Count clicks per task via analytics |
| S2: NPS | Quarterly survey (1-10 recommend score) |
| S7: Constructive errors | Audit error messages against checklist |

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Task completion rate | >85% | Unknown |
| Response time P95 | <200ms | Unknown |
| NPS Score | >50 | Unknown |
| Error messages friendly | 100% | Partial |
| Shortcuts implemented | 10+ | 1 (Cmd+K) |
| Batch operations | 5+ | 1 |

---

## Files Referenced

- `ai/docs/gap-analysis-iso9241.md` - Full gap analysis
- `ai/docs/usability-test-plan.md` - Usability testing plan (por crear)
- `ai/docs/performance-baseline.md` - Performance baseline (por crear)