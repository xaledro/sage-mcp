# Migration Guide: v2.0 → v3.0 (sage-mcp)

> **Note:** This project has been renamed from `standards-mcp` to **sage-mcp** (Semantic Analysis Governance Engine).

## What's New in v3.0

### Architecture Changes

1. **Canonical Rule Model** — All standards stored as JSON files in `src/standards/{domain}/{standard}/rules/*.json` with unified `StandardRule` schema
2. **Knowledge Graph** — 692 rules indexed in SQLite at startup with 259 cross-standard relationships
3. **12 Canonical Tools** — Replaces 41 v2.0 tools:
   - `rules.*` — Rule queries and audits
   - `graph.*` — Knowledge graph traversal
   - `validation.*` — Executable rule validation (5 validators)
   - `evidence.*` — Compliance evidence generation
   - `context.*` — Project context resolution
   - `ai.*` — AI governance (ISO 42001)

### Output Directory Restructure

v3.0 introduces a split directory structure:

| Old (v2.0) | New (v3.0) |
|------------|------------|
| `ai/` | `.sage/` (runtime) + `governance/` (auditable) |
| `ai/project-config.json` | `governance/config.json` |
| `ai/management/state/*` | `governance/state/*` |
| `ai/management/artefacts/*` | `governance/evidence/iso29110/*` |
| `ai/discovered/*` | `.sage/discovered/*` |
| `ai/reports/*` | `governance/reports/*` |

**Runtime (`.sage/`) — Gitignored:**
- `graph.db` — SQLite knowledge graph
- `cache/` — Context resolver cache
- `discovered/` — Discovery output
- `runs/` — Validation run logs

**Auditable (`governance/`) — Committed:**
- `config.json` — Project configuration
- `evidence/` — Compliance evidence
- `decisions/` — ADRs
- `reports/` — Audit reports
- `state/` — Workflow state

### Package Rename

**`@xaledro/standards-mcp`** → **`@xaledro/sage-mcp`**

CLI binary: `standards-mcp` → `sage-mcp`

Update your `.mcp.json`:
```json
{
  "mcpServers": {
    "sage": {
      "command": "npx",
      "args": ["-y", "@xaledro/sage-mcp"],
      "env": { "PROJECT_PATH": "${workspaceFolder}" }
    }
  }
}
```

Graph database location: `~/.sage/graph.db` (was `~/.standards-mcp/graph.db`)

### Why This Change?

v2.0 generated documentary templates; v3.0 provides executable rules with audit trails:
- Multi-standard queries (e.g., "what rules apply to a React frontend?")
- Cross-standard relationships (WCAG ↔ Material ↔ ISO 25010 ↔ Nielsen)
- Validatable compliance (automated validators)
- Evidence generation with git commit traceability

---

## Tool Mapping (v2.0 → v3.0)

| v2.0 Tool | v3.0 Equivalent | Notes |
|-----------|-----------------|-------|
| `standards.list` | `rules.list()` | No behavior change |
| `standards.activate` | `context.resolve()` | Project config via context |
| `arc42.section` | `rules.get({id: "arc42.s1"})` | Use rule ID instead of section |
| `arc42.template` | `rules.list({standard: "arc42"})` | Lists all arc42 rules |
| `arc42.checklist` | `rules.audit({standard: "arc42"})` | Returns audit summary |
| `owasp.requirements` | `rules.list({standard: "owasp-asvs"})` | Filter by level in app code |
| `owasp.verify` | `rules.audit({standard: "owasp-asvs"})` | Use audit for compliance |
| `iso29110.artefact` | `rules.get({id: "iso29110.gp-001"})` | Access by artefact ID |
| `iso29110.phases` | `rules.list({standard: "iso29110"})` | List all ISO 29110 rules |
| `iso42010.view` | `rules.get({id: "iso42010.logical"})` | View is a rule |
| `iso42010.diagram` | `graph.export({format: "mermaid"})` | Export graph as diagram |
| `iso9241.usabilityCheck` | `rules.list({standard: "iso9241"})` | All criteria as rules |
| `iso25010.qualityModel` | `rules.list({standard: "iso25010"})` | Full quality model |
| `iso27001.controls` | `rules.list({standard: "iso27001"})` | All 48 controls |
| `iso20000.sla` | `rules.get({id: "iso20000.sla"})` | SLA rule |
| `iso42001.ethicalAI` | `rules.list({standard: "iso42001"})` | AI ethics criteria |
| `material.tokens` | `rules.list({standard: "material3"})` | Material 3 rules |
| `status` | `rules.audit()` | Full audit |
| `audit.run` | `validation.run()` | Run validators |
| `audit.results` | `validation.report()` | Get validation report |
| `report.gap` | `rules.audit()` | Use audit |

---

## Key Concepts in v3.0

### Rule IDs

Rules identified by dot-separated ID based on filename:
- `iso27001.a5.1` → `src/standards/governance/iso27001/rules/iso27001.a5.1.json`
- `wcag22.1.4.3` → `src/standards/accessibility/wcag22/rules/...`
- `arc42.s1` → `src/standards/architecture/arc42/rules/arc42.s1.json`

### Filtering Examples

```javascript
// v2.0: Get arc42 section 5
arc42.section({ section: 5 })

// v3.0: Get rule by ID
rules.get({ id: "arc42.s5" })

// v2.0: List owasp L1 requirements
owasp.requirements({ level: "L1" })

// v3.0: Query rules with tags
rules.query({ standard: "owasp-asvs", tags: ["L1"] })
```

### Query by Platform

```javascript
// Get all rules applicable to React frontend
rules.query({ appliesTo: ["frontend"], severity: "critical" })

// Get all accessibility rules
rules.query({ tags: ["accessibility", "wcag22"] })
```

### Graph Traversal

```javascript
// Find rules related to Material touch targets
graph.related({ ruleId: "material3.accessibility.touch-target", depth: 2 })

// Find path between WCAG and ISO 25010
graph.path({ from: "wcag22.2.4.7", to: "iso25010.usability" })

// Export accessibility cluster
graph.cluster({ standard: "wcag22" })
graph.export({ format: "mermaid" })
```

---

## Validation Engine

Run automated validators against your project:

```javascript
// Validate WCAG compliance
validation.run({ standard: "wcag22", projectPath: "/path/to/project" })

// Check for hardcoded secrets
validation.run({ standard: "iso27001", projectPath: "/path/to/project" })

// Generate validation report
validation.report({ projectPath: "/path/to/project", format: "markdown" })
```

### Validators

| Validator | Standards | Checks |
|-----------|-----------|--------|
| `contrast` | wcag22 | Color contrast (1.4.3, 1.4.11) |
| `aria` | wai-aria | ARIA roles and properties |
| `tokens` | w3c-tokens, material3, carbon, gov-uk | Token format compliance |
| `secrets` | iso27001, owasp-asvs | Hardcoded credentials |
| `coverage` | iso20000 | Code coverage thresholds |

---

## Evidence Generation

```javascript
// Generate evidence for ISO 27001 control
evidence.generate({ ruleId: "iso27001.a5.1", projectPath: "/path/to/project" })

// Response includes:
// - evidenceId
// - artifactPath (governance/evidence/iso27001/iso27001.a5.1/{timestamp}/)
// - commitSha for traceability
```

Evidence stored in `${PROJECT_PATH}/governance/evidence/{standard}/{ruleId}/{timestamp}/`

---

## Context Resolution

```javascript
// Detect project context
context.resolve({ projectPath: "/path/to/project" })

// Returns:
// - industries: ["mining", "healthcare", ...]
// - platforms: ["frontend", "mobile", ...]
// - criticality: "high" | "medium" | "low"
// - technologies: ["react", "typescript", ...]
```

---

## Breaking Changes Summary

1. **Tool names** — 41 tools replaced by 12 canonical tools
2. **Response format** — Rules return full `StandardRule` objects
3. **No discovery** — Design system discovery deprecated
4. **Project config** — File-based in `ai/project-config.json`
5. **Graph init** — Server indexes rules at startup (~2-3 seconds first run)

---

## Standards Coverage (v3.0.0)

| Domain | Standards | Rules |
|--------|-----------|-------|
| governance | iso27001, iso27701, iso29110 | 101 |
| quality | iso25010 | 39 |
| security | owasp-asvs | 41 |
| operations | iso20000 | 30 |
| ai | iso42001 | 29 |
| architecture | arc42, iso42010 | 17 |
| ux | iso9241, nielsen | 34 |
| design-system | material3, w3c-tokens, carbon, gov-uk | 178 |
| accessibility | wcag22, wai-aria | 223 |
| **Total** | **17 standards** | **692 rules** |

---

## Timeline

- **v3.0.0-alpha.1** — Core rules + 12 tools + SQLite graph
- **v3.0.0-alpha.2** — Knowledge graph with relationships
- **v3.0.0-beta.1** — New standards (WCAG 2.2, WAI-ARIA, W3C tokens)
- **v3.0.0-beta.2** — Validation engine (5 validators)
- **v3.0.0** (current) — Evidence engine, context resolver, full coverage