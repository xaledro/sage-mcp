# Standards MCP

[![latest](https://img.shields.io/badge/latest-v1.1.0-blue)](https://github.com/xaledro/standards-mcp)
[![license](https://img.shields.io/badge/license-ISC-green)](./LICENSE)

MCP server exposing software lifecycle standards as tools for AI agents.

## What is this?

An MCP server (stdio transport) that provides **22 tools** for generating and managing software documentation according to international standards. Works with any MCP-compatible AI agent (Claude Code, Cursor, Zed, OpenCode, Windsurf, etc.).

## Standards Supported

| Standard | Description | Tools |
|----------|-------------|-------|
| **arc42** | Architecture documentation (12 sections) | `arc42.section`, `arc42.template` |
| **OWASP ASVS** | Application security verification (L1/L2/L3) | `owasp.requirements` |
| **ISO 29110** | Software lifecycle profiles | `iso29110.artefact` |
| **ISO 42010** | Architecture views | `iso42010.view` |
| **ISO 9241** | Usability checklist | `iso9241.usabilityCheck` |
| **ISO 25010** | Quality model | `iso25010.qualityModel` |
| **Material Design 3** | Design tokens | `material.tokens` |

## Requirements

- **Node.js >= 18**
- Optional: `@base/design-system@>=2.0.0` as peer dependency (for ISO 29110 state tracking)

## Installation

### Global (CLI usage)
```bash
npm install -g @xaledro/standards-mcp
```

### As project dependency
```bash
npm install @xaledro/standards-mcp
# or
pnpm add @xaledro/standards-mcp
```

## Configuration by AI Agent

### OpenCode

> **Nota:** npm muestra v1.0.0 (15 herramientas). La versión local es v1.1.0 (22 herramientas) — npm desactualizado.

Add to your `opencode.json` (project root or global `~/.config/opencode/opencode.json`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "standards": {
      "type": "local",
      "command": ["pnpm", "dlx", "git+https://github.com/xaledro/standards-mcp.git#v1.1.0"],
      "enabled": true,
      "environment": {
        "PROJECT_PATH": "${workspaceFolder}/ai"
      }
    }
  }
}
```

**Config locations (precedence):**
1. Project: `opencode.json` in project root
2. Global: `~/.config/opencode/opencode.json`
3. Custom: `$OPENCODE_CONFIG` env var

**Using with OpenCode:**
- After adding the config, restart OpenCode or run `/init` to reload MCP tools
- Tools appear automatically alongside built-in tools
- Ask OpenCode: "use the standards tool to generate arc42 documentation for section 3"

### Claude Code

Add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "standards": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/xaledro/standards-mcp.git#v1.1.0"],
      "env": {
        "PROJECT_PATH": "${workspaceFolder}/ai"
      }
    }
  }
}
```

### Cursor

1. Open Cursor Settings → MCP Servers
2. Add new server:
   - Name: `standards`
- Command: `npx -y git+https://github.com/xaledro/standards-mcp.git#v1.1.0`
   - Environment variables: `PROJECT_PATH` = path to your project's `ai/` directory

### Zed

Add to `settings.json`:

```json
{
  "context_servers": {
    "standards": {
      "command": {
        "path": "npx",
        "args": ["-y", "@xaledro/standards-mcp@v1.1.0"]
      },
      "env": {
        "PROJECT_PATH": "ai"
      }
    }
  }
}
```

### Windsurf

Add via Windsurf Settings → MCP Servers:
- Name: `standards`
- Command: `npx -y git+https://github.com/xaledro/standards-mcp.git#v1.1.0`
- Env: `PROJECT_PATH` = path to `ai/` directory

### Generic MCP client (stdio)

```bash
npx git+https://github.com/xaledro/standards-mcp.git#v1.1.0
# Communicates via stdin/stdout, JSON-RPC 2.0
```

## Available Tools

### Standards Documentation (15 tools) — npm v1.0.0

| Tool | Description |
|------|-------------|
| `standards.list` | List all available standards |
| `standards.activate` | Activate a standard with configuration |
| `arc42.section` | Get arc42 template for section 1-12 |
| `arc42.template` | Get arc42 metadata |
| `owasp.requirements` | Get ASVS requirements by level (L1/L2/L3) |
| `iso29110.artefact` | Get ISO 29110 artefact template |
| `iso42010.view` | Get architecture view (logical/deployment/operational) |
| `iso9241.usabilityCheck` | Get usability checklist |
| `iso25010.qualityModel` | Get software quality model |
| `material.tokens` | Get Material Design 3 tokens |
| `requestInfo` | Request missing compliance data |
| `defaults.get` | Get standard defaults |
| `generate` | Generate multi-standard artefacts |
| `status` | Get project status |
| `markGenerated` | Mark artefact complete |

### Discovery & Audit (v1.1.0+) (7 tools) — npm desactualizado

| Tool | Description |
|------|-------------|
| `discovery.run` | Run design system discovery on a project |
| `discovery.status` | Get status of discovery scan |
| `discovery.results` | Get discovery results (tokens, components, assets) |
| `audit.run` | Run design system audit on a project |
| `audit.results` | Get audit results |
| `project.init` | Initialize project structure with ai/ folder |
| `report.gap` | Generate gap analysis report |

### Example: Generate arc42 Documentation with OpenCode

```
1. Ask OpenCode: "use the standards tool to list available standards"
2. Ask OpenCode: "activate arc42 standard with sections 1, 2, 3, 4"
3. Ask OpenCode: "use arc42.section to get template for section 1 (Overview)"
4. Ask OpenCode: "generate the complete arc42 document using the templates"
5. Ask OpenCode: "mark the document as generated when complete"
```

### OpenCode Workflows

**Design system audit:**
```
use the audit.run tool to scan ./src/styles for hardcoded design tokens
```

**Project discovery:**
```
use discovery.run on ./external-app --stacks react,tailwind
```

**Gap analysis:**
```
use report.gap to compare discovered tokens against base-design-system
```

## Integration with @base/design-system

The MCP server can connect to `@base/design-system` for ISO 29110 state tracking:

```js
const Interface = require('@base/design-system/management');
Interface.configure({ basePath: process.env.PROJECT_PATH });
```

This enables:
- Product state tracking (products.json)
- Sprint management (sprints.json, backlog.json)
- ISO 29110 lifecycle phases

## Development

```bash
# Clone and setup
git clone https://github.com/xaledro/standards-mcp.git
cd standards-mcp
pnpm install

# Run in development mode (with --watch)
pnpm dev

# Run tests
pnpm test

# Start production
pnpm start
```

## Project Structure

```
standards-mcp/
├── src/
│   ├── index.js          # Main MCP server entry point
│   └── tools/
│       ├── arc42.js      # arc42 template tool
│       ├── owasp.js      # OWASP ASVS tool
│       ├── iso42010.js   # ISO 42010 views
│       ├── iso9241.js    # ISO 9241 usability
│       ├── iso25010.js   # ISO 25010 quality
│       └── material.js   # Material Design 3
├── test/
│   └── standards.test.js # Unit tests
└── README.md
```

## License

ISC