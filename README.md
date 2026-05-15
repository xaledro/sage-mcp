# Standards MCP v3.0.0

[![version](https://img.shields.io/badge/version-v3.0.0-blue)](https://github.com/xaledro/standards-mcp)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Semantic governance platform for software lifecycle standards.

## What is this?

MCP server (stdio transport) providing **12 canonical tools** for governance,
compliance, and design system validation. v3.0 introduces a knowledge graph
with cross-standard relationships, automated validation engine, and evidence
generation.

## Core Concepts

### Canonical Rule Model
Every rule follows a unified schema (`StandardRule`):
- `id`, `standard`, `version`, `category`
- `title`, `description`
- `appliesTo` (frontend/backend/mobile/ai/desktop/infrastructure)
- `severity` (info/warning/critical)
- `tags`, `relatedStandards`
- `implementation`, `validation`, `evidence`, `context`

Rules stored as versionable JSON in `src/standards/**/rules/*.json`.

### Knowledge Graph
- **692 rules** indexed from 15 standards
- **259 cross-standard relations**
- Graph traversal: find related rules, paths, clusters
- Export to JSON, Mermaid, or DOT format

### Validation Engine
Automated validators for:
- Color contrast (WCAG 1.4.3, 1.4.11)
- WAI-ARIA patterns
- W3C Design Tokens format
- Hardcoded secrets detection
- Code coverage thresholds (ISO 25010)

### Evidence Generation
- Auditable evidence dossiers per rule
- Git commit traceability
- Persisted to `${PROJECT_PATH}/governance/evidence/`

## 12 Canonical Tools

| Tool | Description |
|------|-------------|
| `rules.list` | List rules (filter by standard/category/severity) |
| `rules.get` | Get rule by ID with relationships |
| `rules.query` | Query by platform/severity/tags/standard |
| `rules.audit` | Compliance audit summary |
| `graph.related` | Find related rules |
| `graph.path` | Find path between two rules |
| `graph.cluster` | Get connected subgraph |
| `graph.export` | Export graph (json/mermaid/dot) |
| `validation.run` | Run validators against project |
| `validation.report` | Generate validation report |
| `evidence.generate` | Generate auditable evidence |
| `context.resolve` | Detect project industry/platform/criticality |

## Standards Coverage

| Domain | Standards | Rules |
|--------|-----------|-------|
| **governance** | iso27001, iso27701, iso29110 | 101 |
| **quality** | iso25010 | 39 |
| **security** | owasp-asvs | 41 |
| **operations** | iso20000 | 30 |
| **ai** | iso42001 | 29 |
| **architecture** | arc42, iso42010 | 17 |
| **ux** | iso9241, nielsen | 34 |
| **design-system** | material3, w3c-tokens, carbon, gov-uk | 178 |
| **accessibility** | wcag22, wai-aria | 223 |
| **Total** | **17 standards** | **692 rules** |

## Requirements

- **Node.js >= 18**
- No external dependencies

## Installation

### Global
```bash
npm install -g @xaledro/standards-mcp
# or
pnpm add -g @xaledro/standards-mcp
```

### Via git URL (recommended for latest)
```bash
npx -y git+https://github.com/xaledro/standards-mcp.git#v3.0.0
```

### As project dependency
```bash
npm install @xaledro/standards-mcp
# or
pnpm add @xaledro/standards-mcp
```

### Local development
```bash
git clone https://github.com/xaledro/standards-mcp.git
cd standards-mcp
pnpm install
node src/index.js
```

## Configuration

### Claude Code (.mcp.json)
```json
{
  "mcpServers": {
    "standards": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/xaledro/standards-mcp.git#v3.0.0"],
      "env": { "PROJECT_PATH": "${workspaceFolder}" }
    }
  }
}
```

### OpenCode (opencode.json)
```jsonc
{
  "mcp": {
    "standards": {
      "type": "local",
      "command": ["node", "src/index.js"],
      "cwd": "path/to/standards-mcp"
    }
  }
}
```

### Cursor / Zed / Windsurf
Reference AGENTS.md for detailed configuration per client.

## Usage Examples

### List all WCAG rules
```
rules.list({ standard: "wcag22", severity: "critical" })
```

### Get rule with relationships
```
rules.get({ id: "wcag22.1.4.3" })
```

### Find related accessibility rules
```
graph.related({ ruleId: "material3.accessibility.touch-target", depth: 2 })
```

### Find path between standards
```
graph.path({ from: "wcag22.2.4.7", to: "iso25010.usability" })
```

### Run validation on project
```
validation.run({ standard: "wcag22", projectPath: "/path/to/project" })
```

### Generate evidence
```
evidence.generate({ ruleId: "iso27001.a5.1", projectPath: "/path/to/project" })
```

### Resolve project context
```
context.resolve({ projectPath: "/path/to/project" })
```

## Development

```bash
# Run tests
pnpm test

# Rebuild knowledge graph
node src/lib/graph/rebuild.js --force

# Run validation engine standalone
node -e "import('./src/lib/validation/runner.js').then(m => m.runValidation({standard: 'wcag22', projectPath: '.'}).then(r => console.log(JSON.stringify(r, null, 2))))"
```

## Migration from v2.0

v3.0 is a **breaking change** — 41 v2.0 tools replaced by 12 canonical tools.

See `MIGRATION.md` for full tool mapping and examples.

## Project Structure

```
standards-mcp/
├── src/
│   ├── index.js              # MCP server entry (12 tools)
│   ├── tools/v3/rules.js     # rules.* tool implementations
│   ├── lib/
│   │   ├── rule-model.js     # Canonical rule schema + AJV
│   │   ├── registry.js       # Rule discovery and loading
│   │   ├── graph/
│   │   │   ├── db.js         # SQLite wrapper (sql.js)
│   │   │   ├── indexer.js    # Rule ingestion
│   │   │   ├── relations-indexer.js  # Cross-standard relations
│   │   │   └── schema.sql    # 5-table schema
│   │   ├── validation/
│   │   │   ├── runner.js     # Validation orchestrator
│   │   │   └── validators/   # 5 validators
│   │   ├── evidence/
│   │   │   └── generator.js  # Evidence generation
│   │   └── context-resolver.js  # Project context detection
│   └── standards/
│       ├── governance/iso27001/rules/   # 48 rules
│       ├── governance/iso27701/rules/   # 32 rules
│       ├── governance/iso29110/rules/   # 21 rules
│       ├── quality/iso25010/rules/     # 39 rules
│       ├── security/owasp-asvs/rules/   # 41 rules
│       ├── operations/iso20000/rules/   # 30 rules
│       ├── ai/iso42001/rules/           # 29 rules
│       ├── architecture/arc42/rules/     # 12 rules
│       ├── architecture/iso42010/rules/  # 5 rules
│       ├── ux/iso9241/rules/            # 24 rules
│       ├── ux/nielsen/rules/            # 10 rules
│       ├── design-system/material3/rules/ # 79 rules
│       ├── design-system/w3c-tokens/rules/ # 30 rules
│       ├── design-system/carbon/rules/   # 38 rules
│       ├── design-system/gov-uk/rules/    # 31 rules
│       ├── accessibility/wcag22/rules/    # 63 rules
│       ├── accessibility/wai-aria/rules/  # 160 rules
│       └── _relations/                    # 259 cross-standard relations
├── test/
│   ├── lib/rule-model.test.js
│   ├── lib/graph.test.js
│   ├── lib/graph-relations.test.js
│   └── tools/rules.test.js
├── scripts/
│   ├── migrate-*.js          # Rule generators
│   └── rebuild.js            # Graph rebuild CLI
├── AGENTS.md                 # Agent configuration guide
├── MIGRATION.md              # v2.0 → v3.0 migration
└── README.md
```

## License

MIT