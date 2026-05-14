# Standards MCP

[![latest](https://img.shields.io/badge/latest-v1.1.0-blue)](https://github.com/xaledro/standards-mcp)
[![license](https://img.shields.io/badge/license-ISC-green)](./LICENSE)

Servidor MCP que expone estándares del ciclo de vida del software como herramientas para agentes IA.

## ¿Qué es esto?

Un servidor MCP (transporte stdio) que proporciona **22 herramientas** para generar y gestionar documentación de software según estándares internacionales. Funciona con cualquier agente IA compatible con MCP (Claude Code, Cursor, Zed, OpenCode, Windsurf, etc.).

## Estándares Soportados

| Estándar | Descripción | Herramientas |
|----------|-------------|--------------|
| **arc42** | Documentación de arquitectura (12 secciones) | `arc42.section`, `arc42.template` |
| **OWASP ASVS** | Verificación de seguridad de aplicaciones (L1/L2/L3) | `owasp.requirements` |
| **ISO 29110** | Perfiles del ciclo de vida del software | `iso29110.artefact` |
| **ISO 42010** | Vistas de arquitectura | `iso42010.view` |
| **ISO 9241** | Lista de verificación de usabilidad | `iso9241.usabilityCheck` |
| **ISO 25010** | Modelo de calidad | `iso25010.qualityModel` |
| **Material Design 3** | Tokens de diseño | `material.tokens` |

## Requisitos

- **Node.js >= 18**
- Opcional: `@base/design-system@>=2.0.0` como peer dependency (para seguimiento de estado ISO 29110)

## Instalación

### Global (uso CLI)
```bash
npm install -g @xaledro/standards-mcp
```

### Como dependencia de proyecto
```bash
npm install @xaledro/standards-mcp
# o
pnpm add @xaledro/standards-mcp
```

## Configuración por Agente IA

### OpenCode

> **Nota:** npm muestra v1.0.0 (15 herramientas). La versión local es v1.1.0 (22 herramientas) — npm desactualizado.

Agregar a tu `opencode.json` (raíz del proyecto o global `~/.config/opencode/opencode.json`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "standards": {
      "type": "local",
      "command": ["pnpm", "dlx", "@xaledro/standards-mcp@latest"],
      "enabled": true,
      "environment": {
        "PROJECT_PATH": "${workspaceFolder}/ai"
      }
    }
  }
}
```

**Ubicaciones de config (precedencia):**
1. Proyecto: `opencode.json` en raíz del proyecto
2. Global: `~/.config/opencode/opencode.json`
3. Custom: variable env `$OPENCODE_CONFIG`

**Usando con OpenCode:**
- Después de agregar la config, reinicia OpenCode o ejecuta `/init` para recargar herramientas MCP
- Las herramientas aparecen automáticamente junto con las herramientas integradas
- Pregunta a OpenCode: "use the standards tool to generate arc42 documentation for section 3"

### Claude Code

Agregar a `.mcp.json` en la raíz del proyecto:

```json
{
  "mcpServers": {
    "standards": {
      "command": "npx",
      "args": ["-y", "@xaledro/standards-mcp@latest"],
      "env": {
        "PROJECT_PATH": "${workspaceFolder}/ai"
      }
    }
  }
}
```

### Cursor

1. Abrir Cursor Settings → MCP Servers
2. Agregar nuevo servidor:
   - Nombre: `standards`
   - Comando: `npx -y @xaledro/standards-mcp`
   - Variables de entorno: `PROJECT_PATH` = ruta al directorio `ai/` de tu proyecto

### Zed

Agregar a `settings.json`:

```json
{
  "context_servers": {
    "standards": {
      "command": {
        "path": "npx",
        "args": ["-y", "@xaledro/standards-mcp"]
      },
      "env": {
        "PROJECT_PATH": "ai"
      }
    }
  }
}
```

### Windsurf

Agregar vía Windsurf Settings → MCP Servers:
- Nombre: `standards`
- Comando: `npx -y @xaledro/standards-mcp`
- Env: `PROJECT_PATH` = ruta al directorio `ai/`

### Cliente MCP genérico (stdio)

```bash
npx @xaledro/standards-mcp
# Se comunica via stdin/stdout, JSON-RPC 2.0
```

## Herramientas Disponibles

### Documentación de Estándares (15 herramientas) — npm v1.0.0

| Herramienta | Descripción |
|------------|-------------|
| `standards.list` | Listar todos los estándares disponibles |
| `standards.activate` | Activar un estándar con configuración |
| `arc42.section` | Obtener plantilla arc42 para sección 1-12 |
| `arc42.template` | Obtener metadatos de arc42 |
| `owasp.requirements` | Obtener requisitos ASVS por nivel (L1/L2/L3) |
| `iso29110.artefact` | Obtener plantilla de artefacto ISO 29110 |
| `iso42010.view` | Obtener vista de arquitectura (lógica/despliegue/operacional) |
| `iso9241.usabilityCheck` | Obtener lista de verificación de usabilidad |
| `iso25010.qualityModel` | Obtener modelo de calidad de software |
| `material.tokens` | Obtener tokens de Material Design 3 |
| `requestInfo` | Solicitar datos de cumplimiento faltantes |
| `defaults.get` | Obtener valores por defecto del estándar |
| `generate` | Generar artefactos multi-estándar |
| `status` | Obtener estado del proyecto |
| `markGenerated` | Marcar artefacto como completo |

### Discovery y Audit (v1.1.0+) (7 herramientas) — npm desactualizado

| Herramienta | Descripción |
|------------|-------------|
| `discovery.run` | Ejecutar discovery del sistema de diseño en un proyecto |
| `discovery.status` | Obtener estado del scan de discovery |
| `discovery.results` | Obtener resultados de discovery (tokens, componentes, assets) |
| `audit.run` | Ejecutar audit del sistema de diseño en un proyecto |
| `audit.results` | Obtener resultados del audit |
| `project.init` | Inicializar estructura del proyecto con carpeta ai/ |
| `report.gap` | Generar reporte de análisis de brechas |

### Ejemplo: Generar Documentación arc42 con OpenCode

```
1. Pregunta a OpenCode: "use the standards tool to list available standards"
2. Pregunta a OpenCode: "activate arc42 standard with sections 1, 2, 3, 4"
3. Pregunta a OpenCode: "use arc42.section to get template for section 1 (Overview)"
4. Pregunta a OpenCode: "generate the complete arc42 document using the templates"
5. Pregunta a OpenCode: "mark the document as generated when complete"
```

### Flujos de Trabajo con OpenCode

**Audit del sistema de diseño:**
```
use the audit.run tool to scan ./src/styles for hardcoded design tokens
```

**Discovery de proyecto:**
```
use discovery.run on ./external-app --stacks react,tailwind
```

**Análisis de brechas:**
```
use report.gap to compare discovered tokens against base-design-system
```

## Integración con @base/design-system

El servidor MCP puede conectarse a `@base/design-system` para seguimiento de estado ISO 29110:

```js
const Interface = require('@base/design-system/management');
Interface.configure({ basePath: process.env.PROJECT_PATH });
```

Esto habilita:
- Seguimiento de estado de productos (products.json)
- Gestión de sprints (sprints.json, backlog.json)
- Fases del ciclo de vida ISO 29110

## Desarrollo

```bash
# Clonar y setup
git clone https://github.com/xaledro/standards-mcp.git
cd standards-mcp
pnpm install

# Ejecutar en modo desarrollo (con --watch)
pnpm dev

# Ejecutar tests
pnpm test

# Iniciar producción
pnpm start
```

## Estructura del Proyecto

```
standards-mcp/
├── src/
│   ├── index.js          # Punto de entrada del servidor MCP
│   └── tools/
│       ├── arc42.js      # Herramienta de plantilla arc42
│       ├── owasp.js      # Herramienta OWASP ASVS
│       ├── iso42010.js   # Vistas ISO 42010
│       ├── iso9241.js    # Usabilidad ISO 9241
│       ├── iso25010.js   # Calidad ISO 25010
│       └── material.js   # Material Design 3
├── test/
│   └── standards.test.js # Tests unitarios
└── README.md
```

## Licencia

ISC