# Standards MCP

MCP server exposing software standards (arc42, OWASP, ISO) as tools for AI agents.

## Standards Supported

- **arc42** - Architecture documentation (12 sections)
- **OWASP ASVS** - Application security verification (L1/L2/L3)
- **ISO 29110** - Software lifecycle profiles
- **ISO 42010** - Architecture views
- **ISO 9241** - Usability checklist
- **ISO 25010** - Quality model
- **Material Design 3** - Design tokens

## Installation

```bash
npm install -g @xaledro/standards-mcp
```

## Usage with Claude Code

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "standards": {
      "command": "npx",
      "args": ["-y", "@xaledro/standards-mcp"],
      "env": { "PROJECT_PATH": "${workspaceFolder}/ai" }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `standards.list` | List all available standards |
| `standards.activate` | Activate a standard for use |
| `arc42.section` | Get arc42 section template |
| `owasp.requirements` | Get ASVS requirements by level |
| `iso29110.artefact` | Get ISO 29110 artefact |
| `iso42010.view` | Get architecture view template |
| `iso9241.usabilityCheck` | Get usability checklist |
| `iso25010.qualityModel` | Get quality model |
| `material.tokens` | Get MD3 tokens |
| `requestInfo` | Request missing info |
| `defaults.get` | Get standard defaults |
| `generate` | Generate artefacts |
| `status` | Get project status |
| `markGenerated` | Mark artefact as generated |

## Configuration

Requires `@base/design-system@>=2.0.0` as peer dependency.

The MCP connects to the Design System's management interface via:
```js
const Interface = require('@base/design-system/management');
Interface.configure({ basePath: process.env.PROJECT_PATH });
```

## Development

```bash
npm install
npm run dev  # Run with --watch
npm test
```

## License

ISC