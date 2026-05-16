# Sage-MCP v3.0 — Agent Configuration Guide

> **SAGE** = **S**emantic **A**nalysis **G**overnance **E**ngine
>
> MCP server providing 12 canonical tools for governance, compliance, and design system validation. Compatible with Claude Code, Cursor, Zed, OpenCode, Windsurf, and any MCP client.

## Quick Start

```bash
# Via git URL (recommended)
npx -y git+https://github.com/xaledro/sage-mcp.git#v3.0.0

# Start server
node src/index.js
```

## MCP Client Configuration

### Claude Code (`.mcp.json` in project root)

```json
{
  "mcpServers": {
    "sage": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/xaledro/sage-mcp.git#v3.0.0"],
      "env": { "PROJECT_PATH": "${workspaceFolder}" }
    }
  }
}
```

### Cursor (Settings > MCP Servers)

| Field | Value |
|-------|-------|
| Command | `npx -y git+https://github.com/xaledro/sage-mcp.git#v3.0.0` |
| Env: PROJECT_PATH | `/path/to/project` |

### Zed (settings.json)

```json
{
  "context_servers": {
    "sage": {
      "command": { "path": "npx", "args": ["-y", "git+https://github.com/xaledro/sage-mcp.git#v3.0.0"] },
      "env": { "PROJECT_PATH": "." }
    }
  }
}
```

### OpenCode (opencode.json)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sage": {
      "type": "local",
      "command": ["npx", "-y", "git+https://github.com/xaledro/sage-mcp.git#v3.0.0"],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

### Generic MCP client (stdio)

```bash
cd sage-mcp && node src/index.js
# Communicates via stdin/stdout, JSON-RPC 2.0
```

## 12 Canonical Tools

### Rules Tools
| Tool | Description |
|------|-------------|
| `rules.list` | List rules from the knowledge graph. Filter by standard, category, or severity. |
| `rules.get` | Get a single rule by ID with its relationships |
| `rules.query` | Query rules by platform applicability, severity, tags, standard |
| `rules.audit` | Get compliance audit summary for a standard or all standards |

### Graph Tools
| Tool | Description |
|------|-------------|
| `graph.related` | Get rules related to a given rule (with depth and relation type) |
| `graph.path` | Find path between two rules through relationships (BFS) |
| `graph.cluster` | Get connected subgraph by tag or standard |
| `graph.export` | Export knowledge graph (json/mermaid/dot) |

### Validation Tools
| Tool | Description |
|------|-------------|
| `validation.run` | Run validation engine against a project (contrast, aria, tokens, secrets, coverage) |
| `validation.report` | Generate validation report (markdown/json/html) |

### Evidence & Context Tools
| Tool | Description |
|------|-------------|
| `evidence.generate` | Generate auditable evidence for a rule |
| `context.resolve` | Resolve project context (industry, platform, criticality) |
| `ai.model` | Get AI governance model (ISO 42001 criteria as executable rules) |

## Standards Coverage (686 rules, 17 standards)

| Domain | Standards | Rules |
|--------|-----------|-------|
| **governance** | iso27001, iso27701, iso29110 | 101 |
| **quality** | iso25010 | 39 |
| **security** | owasp-asvs | 41 |
| **operations** | iso20000 | 30 |
| **ai** | iso42001 | 29 |
| **architecture** | arc42, iso42010 | 17 |
| **ux** | iso9241, nielsen | 34 |
| **design-system** | material3, w3c-tokens, carbon, gov-uk | 172 |
| **accessibility** | wcag22, wai-aria | 223 |

## Knowledge Graph

- **686 rules** indexed from 17 standards
- **259 relations** across standards
- Relation types: IMPLEMENTS, EXTENDS, MAPS_TO, REQUIRES, CONFLICTS_WITH, RELATED
- Cross-standard relationships: WCAG ↔ Material ↔ Carbon ↔ ISO 25010

## Validation Engine

5 automated validators:
- `contrast` — WCAG color contrast (1.4.3, 1.4.11)
- `aria` — WAI-ARIA roles and properties
- `tokens` — W3C Design Tokens format validation
- `secrets` — Hardcoded credentials detection
- `coverage` — ISO 25010 code coverage thresholds

## Output Directories

SAGE uses a split directory structure:

| Directory | Purpose | Gitignored |
|-----------|---------|------------|
| `.sage/` | Runtime: SQLite graph, cache, discovery output, validation runs | Yes |
| `governance/` | Auditable: evidence, ADRs, reports, state | No |

Add to your `.gitignore`:
```
# Sage-MCP runtime
.sage/
```

## Requirements

- Node.js >= 18
- No external dependencies — fully self-contained (v3.0.0)

## Development

```bash
cd sage-mcp
pnpm install

# Run tests
pnpm test

# Rebuild knowledge graph
node src/lib/graph/rebuild.js --force

# Start production
node src/index.js
```

## Migration from v2.0 / standards-mcp

v3.0 is a **breaking change**. The 41 v2.0 tools are replaced by 12 canonical tools:

| v2.0 | v3.0 |
|------|------|
| `arc42.section`, `arc42.template`, `arc42.checklist` | `rules.list` + `rules.get` |
| `owasp.requirements`, `owasp.verify` | `rules.query` + `validation.run` |
| `iso29110.artefact` | `evidence.generate` |
| `iso25010.qualityModel` | `rules.list({standard: "iso25010"})` |
| `material.tokens` | `rules.list({standard: "material3"})` |
| `discovery.run`, `audit.run` | `validation.run` |

See `MIGRATION.md` for full mapping.