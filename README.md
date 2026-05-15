# Sage-MCP v3.0.0

[![version](https://img.shields.io/badge/version-v3.0.0-blue)](https://github.com/xaledro/sage-mcp)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**SAGE** = **S**emantic **A**nalysis **G**overnance **E**ngine

Semantic governance platform for software lifecycle standards with knowledge graph, automated validation, and evidence generation.

## What is SAGE?

SAGE is an MCP server (stdio transport) providing **12 canonical tools** for governance, compliance, and design system validation. It indexes **686 rules** from **17 standards** into a queryable SQLite knowledge graph with 259 cross-standard relationships.

## Installation

### Via git URL (recommended)
```bash
npx -y git+https://github.com/xaledro/sage-mcp.git#v3.0.0
```

### Via npm
```bash
npm install -g @xaledro/sage-mcp
pnpm add -g @xaledro/sage-mcp
```

### Local development
```bash
git clone https://github.com/xaledro/sage-mcp.git
cd sage-mcp
pnpm install
node src/index.js
```

## MCP Client Configuration

### Claude Code (.mcp.json in project root)
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
```
Command: npx -y git+https://github.com/xaledro/sage-mcp.git#v3.0.0
Env: PROJECT_PATH=/path/to/project
```

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
      "command": ["node", "src/index.js"],
      "cwd": "path/to/sage-mcp"
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

| Tool | Description |
|------|-------------|
| `rules.list` | List rules (filter by standard/category/severity) |
| `rules.get` | Get rule by ID with relationships |
| `rules.query` | Query by platform/severity/tags/standard |
| `rules.audit` | Compliance audit summary |
| `graph.related` | Find related rules (with depth) |
| `graph.path` | Find path between two rules |
| `graph.cluster` | Get connected subgraph |
| `graph.export` | Export graph (json/mermaid/dot) |
| `validation.run` | Run validators against project |
| `validation.report` | Generate validation report |
| `evidence.generate` | Generate auditable evidence |
| `context.resolve` | Detect project industry/platform/criticality |

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
| **Total** | **17 standards** | **686 rules** |

## Usage Examples

### List all WCAG critical rules
```javascript
rules.list({ standard: "wcag22", severity: "critical" })
```

### Get rule with relationships
```javascript
rules.get({ id: "wcag22.1.4.3" })
```

### Find related accessibility rules
```javascript
graph.related({ ruleId: "material3.accessibility.touch-target", depth: 2 })
```

### Find path between standards
```javascript
graph.path({ from: "wcag22.2.4.7", to: "iso25010.usability" })
```

### Run validation on project
```javascript
validation.run({ standard: "wcag22", projectPath: "/path/to/project" })
```

### Generate evidence
```javascript
evidence.generate({ ruleId: "iso27001.a5.1", projectPath: "/path/to/project" })
```

### Resolve project context
```javascript
context.resolve({ projectPath: "/path/to/project" })
```

## Output Directories

SAGE uses a split directory structure in your project:

| Directory | Purpose | Gitignored |
|-----------|---------|------------|
| `.sage/` | Runtime: SQLite graph, cache, discovery output, validation runs | Yes |
| `governance/` | Auditable: evidence, ADRs, reports, state | No |

### `.sage/` (runtime)
```
.sage/
├── graph.db              # SQLite knowledge graph
├── cache/
│   └── facts.json        # Context resolver cache
├── discovered/           # Discovery output (regenerable)
└── runs/                 # Validation run logs
```

### `governance/` (auditable)
```
governance/
├── config.json           # Project configuration
├── decisions/            # ADRs (versionable)
├── evidence/             # Compliance evidence per standard
│   ├── iso27001/
│   ├── wcag22/
│   └── owasp-asvs/
├── reports/              # Audit reports
└── state/                # Workflow state (ISO 29110)
```

Add `.sage/` to your `.gitignore`:
```
# Sage-MCP runtime
.sage/
```

## Requirements

- **Node.js >= 18**
- No external dependencies — fully self-contained

## Development

```bash
# Run tests (62 passing)
pnpm test

# Rebuild knowledge graph
node src/lib/graph/rebuild.js --force

# Start server
node src/index.js
```

## Migration from v2.0 / standards-mcp

v3.0 is a **breaking change** — 41 v2.0 tools replaced by 12 canonical tools.

Key changes:
- Package renamed: `@xaledro/standards-mcp` → `@xaledro/sage-mcp`
- CLI renamed: `standards-mcp` → `sage-mcp`
- Output split: `ai/` → `.sage/` (runtime) + `governance/` (auditable)

See `MIGRATION.md` for full tool mapping and examples.

## Project Structure

```
sage-mcp/
├── src/
│   ├── index.js              # MCP server entry (12 tools)
│   ├── lib/
│   │   ├── paths.js          # Path constants (.sage/, governance/)
│   │   ├── rule-model.js     # Canonical rule schema + AJV
│   │   ├── registry.js       # Rule discovery and loading
│   │   ├── state.js          # Project state management
│   │   ├── graph/            # Knowledge graph (sql.js)
│   │   ├── validation/       # 5 validators (contrast, aria, tokens, secrets, coverage)
│   │   ├── evidence/         # Evidence generation
│   │   └── context-resolver.js  # Industry/platform detection
│   └── standards/             # 686 rules across 17 standards
│       ├── _relations/        # 259 cross-standard relations
│       ├── accessibility/    # wcag22 (63), wai-aria (160)
│       ├── ai/               # iso42001 (29)
│       ├── architecture/     # arc42 (12), iso42010 (5)
│       ├── design-system/    # material3, w3c-tokens, carbon, gov-uk
│       ├── governance/       # iso27001, iso27701, iso29110
│       ├── operations/       # iso20000
│       ├── quality/          # iso25010
│       ├── security/         # owasp-asvs
│       └── ux/              # iso9241, nielsen
├── test/                    # 62 tests
├── scripts/                 # Rule migration scripts
├── templates/
│   └── gitignore-sage.txt   # .sage/ gitignore template
├── AGENTS.md                # Agent configuration guide
├── MIGRATION.md             # v2.0 → v3.0 migration
├── CHANGELOG.md
└── README.md
```

## License

MIT