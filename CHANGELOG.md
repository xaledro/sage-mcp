# Changelog

All notable changes to sage-mcp will be documented in this file.

## v3.0.0 — SAGE Rebrand (BREAKING)

### Renamed
- Package: `@xaledro/standards-mcp` → `@xaledro/sage-mcp`
- CLI binary: `standards-mcp` → `sage-mcp`
- MCP server name: `standards-mcp` → `sage-mcp`
- Acronym: **S**emantic **A**nalysis **G**overnance **E**ngine

### Restructured Output Directories
- `ai/` directory no longer used in client projects
- Split into:
  - `.sage/` — runtime (gitignored): SQLite graph, cache, discovery, validation runs
  - `governance/` — auditable (committed): evidence, ADRs, reports, state

### Migration
See `MIGRATION.md`. No automatic migration script — manual move required for existing projects.

---

## v3.0.0-alpha.1 (Previous)

- Semantic governance platform with Canonical Rule Model
- Knowledge Graph with 259 cross-standard relations
- 12 canonical tools replacing 41 v2.0 tools
- 5 automated validators (contrast, aria, tokens, secrets, coverage)
- Evidence generation with git commit traceability
- Context resolver (industry, platform, criticality detection)