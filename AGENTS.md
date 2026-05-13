# Standards MCP Server — Agent Instructions

> MCP server exposing software lifecycle standards as tools.
> Compatible with any MCP client: Claude Code, Cursor, Zed, OpenCode, Windsurf, etc.

## What this is

An MCP server (stdio transport) that provides tools for generating and
managing software documentation according to international standards,
plus design system discovery and audit capabilities.

## Available tools (v1.1.0+)

### Standards Documentation
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

### Discovery & Audit (v1.1.0+)
| Tool | Description |
|------|-------------|
| `discovery.run` | Run design system discovery on a project |
| `discovery.status` | Get status of discovery scan |
| `discovery.results` | Get discovery results (tokens, components, assets) |
| `audit.run` | Run design system audit on a project |
| `audit.results` | Get audit results |
| `project.init` | Initialize project structure with ai/ folder |
| `report.gap` | Generate gap analysis report |

## Configuration by agent

### Claude Code (.mcp.json in project root)
```json
{
  "mcpServers": {
    "standards": {
      "command": "npx",
      "args": ["-y", "@xaledro/standards-mcp@latest"],
      "env": { "PROJECT_PATH": "${workspaceFolder}/ai" }
    }
  }
}
```

### Cursor (Settings > MCP Servers)
Add server with command: `npx -y @xaledro/standards-mcp`
Set env: `PROJECT_PATH` to your project's `ai/` directory.

### Zed (settings.json)
```json
{
  "context_servers": {
    "standards": {
      "command": { "path": "npx", "args": ["-y", "@xaledro/standards-mcp"] },
      "env": { "PROJECT_PATH": "ai" }
    }
  }
}
```

### Generic MCP client (stdio)
```bash
npx @xaledro/standards-mcp
# Communicates via stdin/stdout, JSON-RPC 2.0
```

## Requirements

- Node.js >= 18
- Optional: `@base/design-system@>=2.0.0` as peer dep (for ISO 29110 state tracking)