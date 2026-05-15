#!/usr/bin/env node
/**
 * migrate-w3c-tokens.js
 * Generates W3C Design Tokens specification rules
 */

const W3C_TOKEN_CATEGORIES = [
  // Token Format
  { id: 'tokens.format.color', name: 'Color Token Format', description: 'Color tokens must use {$type: "color", $value: "#rrggbb"} format.', tags: ['w3c-tokens', 'format', 'color', 'design-system'], severity: 'critical', automated: true },
  { id: 'tokens.format.dimension', name: 'Dimension Token Format', description: 'Dimension tokens must use {$type: "dimension", $value: "<length>"} format.', tags: ['w3c-tokens', 'format', 'dimension', 'spacing'], severity: 'critical', automated: true },
  { id: 'tokens.format.fontFamily', name: 'Font Family Token Format', description: 'Font family tokens must use {$type: "fontFamily", $value: "<string>"} format.', tags: ['w3c-tokens', 'format', 'typography'], severity: 'warning', automated: true },
  { id: 'tokens.format.fontWeight', name: 'Font Weight Token Format', description: 'Font weight tokens must use {$type: "fontWeight", $value: "<number>"} format.', tags: ['w3c-tokens', 'format', 'typography'], severity: 'warning', automated: true },
  { id: 'tokens.format.duration', name: 'Duration Token Format', description: 'Duration tokens must use {$type: "duration", $value: "<time>"} format.', tags: ['w3c-tokens', 'format', 'motion', 'animation'], severity: 'warning', automated: true },
  { id: 'tokens.format.cubicBezier', name: 'Cubic Bezier Token Format', description: 'Cubic bezier tokens must use {$type: "cubicBezier", $value: [p1, p2, p3, p4]} format.', tags: ['w3c-tokens', 'format', 'motion', 'easing'], severity: 'warning', automated: true },
  { id: 'tokens.format.shadow', name: 'Shadow Token Format', description: 'Shadow tokens must use {$type: "shadow", $value: "<shadow>"} format.', tags: ['w3c-tokens', 'format', 'elevation'], severity: 'warning', automated: true },
  { id: 'tokens.format.gradient', name: 'Gradient Token Format', description: 'Gradient tokens must use {$type: "gradient", $value: "<gradient>"} format.', tags: ['w3c-tokens', 'format', 'color'], severity: 'warning', automated: false },

  // Composite Tokens
  { id: 'tokens.composite.typography', name: 'Typography Composite', description: 'Typography tokens compose fontFamily, fontWeight, fontSize, lineHeight, letterSpacing.', tags: ['w3c-tokens', 'composite', 'typography'], severity: 'warning', automated: false },
  { id: 'tokens.composite.border', name: 'Border Composite', description: 'Border tokens compose width, style, color.', tags: ['w3c-tokens', 'composite', 'border'], severity: 'warning', automated: false },
  { id: 'tokens.composite.spacing', name: 'Spacing Composite', description: 'Spacing tokens support shorthand for multiple sides.', tags: ['w3c-tokens', 'composite', 'spacing'], severity: 'warning', automated: false },
  { id: 'tokens.composite.size', name: 'Size Composite', description: 'Size tokens support width, height, minWidth, maxWidth.', tags: ['w3c-tokens', 'composite', 'size'], severity: 'warning', automated: false },

  // References
  { id: 'tokens.references.resolved', name: 'Resolved Token References', description: 'Token references should resolve to primitive values at build time.', tags: ['w3c-tokens', 'references', 'resolution'], severity: 'warning', automated: false },
  { id: 'tokens.references.circular', name: 'No Circular References', description: 'Token references must not create circular dependencies.', tags: ['w3c-tokens', 'references', 'validation'], severity: 'critical', automated: true },
  { id: 'tokens.references.depth', name: 'Reference Depth Limit', description: 'Token references should not exceed 3 levels of indirection.', tags: ['w3c-tokens', 'references', 'complexity'], severity: 'warning', automated: false },

  // Themes
  { id: 'tokens.themes.metadata', name: 'Theme Metadata', description: 'Themes must define $themes array with name and $value.', tags: ['w3c-tokens', 'themes', 'metadata'], severity: 'warning', automated: false },
  { id: 'tokens.themes.mode', name: 'Theme Mode', description: 'Mode tokens enable light/dark theme switching.', tags: ['w3c-tokens', 'themes', 'mode'], severity: 'warning', automated: false },
  { id: 'tokens.themes.semantic', name: 'Semantic Theme Tokens', description: 'Semantic tokens map to primitive tokens with theme overrides.', tags: ['w3c-tokens', 'themes', 'semantic'], severity: 'warning', automated: false },

  // Naming Conventions
  { id: 'tokens.naming.kebab-case', name: 'Kebab-Case Naming', description: 'Token names must use kebab-case (lowercase with hyphens).', tags: ['w3c-tokens', 'naming', 'convention'], severity: 'warning', automated: true },
  { id: 'tokens.naming.semantic-vs-primitive', name: 'Semantic vs Primitive Naming', description: 'Primitive tokens describe raw values; semantic tokens describe intent.', tags: ['w3c-tokens', 'naming', 'semantic'], severity: 'info', automated: false },
  { id: 'tokens.naming.prefix', name: 'Category Prefix', description: 'Token names should have category prefix (color-, space-, font-, etc.).', tags: ['w3c-tokens', 'naming', 'convention'], severity: 'info', automated: false },
  { id: 'tokens.naming.no-abbreviations', name: 'No Abbreviations', description: 'Token names should not use abbreviations.', tags: ['w3c-tokens', 'naming', 'readability'], severity: 'info', automated: false },

  // File Structure
  { id: 'tokens.file.valid-json', name: 'Valid JSON', description: 'Token files must contain valid JSON.', tags: ['w3c-tokens', 'file', 'validation'], severity: 'critical', automated: true },
  { id: 'tokens.file.schema', name: 'Schema Compliance', description: 'Token files must comply with W3C Design Tokens format.', tags: ['w3c-tokens', 'file', 'schema'], severity: 'critical', automated: true },
  { id: 'tokens.file.export', name: 'Export Format', description: 'Tokens should export via $type and $value properties.', tags: ['w3c-tokens', 'file', 'export'], severity: 'warning', automated: false },
  { id: 'tokens.file.bundle', name: 'Token Bundle Structure', description: 'Token bundles should organize by category or component.', tags: ['w3c-tokens', 'file', 'structure'], severity: 'info', automated: false },

  // Design Decisions
  { id: 'tokens.design.decisions.opacity', name: 'Opacity vs Alpha', description: 'Use alpha channel instead of opacity token for colors.', tags: ['w3c-tokens', 'design', 'color', 'opacity'], severity: 'warning', automated: false },
  { id: 'tokens.design.decisions.hardcoded', name: 'No Hardcoded Values', description: 'Design decisions should reference tokens, not raw values.', tags: ['w3c-tokens', 'design', 'governance'], severity: 'critical', automated: false },
  { id: 'tokens.design.decisions.token-coverage', name: 'Token Coverage', description: 'All design decisions should be represented by tokens.', tags: ['w3c-tokens', 'design', 'coverage'], severity: 'info', automated: false },
  { id: 'tokens.design.decisions.versioning', name: 'Token Versioning', description: 'Tokens should follow semver for breaking changes.', tags: ['w3c-tokens', 'design', 'versioning'], severity: 'warning', automated: false }
];

async function main() {
  const tokensDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/design-system/w3c-tokens/rules';
  const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');

  function createTokenRule(category) {
    return {
      id: `w3c-tokens.${category.id}`,
      standard: 'w3c-tokens',
      version: '1.0',
      category: 'design-token-spec',
      title: category.name,
      description: category.description,
      appliesTo: { frontend: true, mobile: true },
      severity: category.severity,
      relatedStandards: ['material3', 'wcag22'],
      tags: category.tags,
      implementation: {
        patterns: [],
        antiPatterns: [],
        codeExamples: [],
        tokens: []
      },
      validation: {
        automated: category.automated,
        manual: !category.automated,
        lint: category.automated
      },
      evidence: {
        requiredArtifacts: category.automated ? ['test-report', 'token-coverage'] : ['manual-review'],
        generators: category.automated ? ['style-dictionary', 'token-linter'] : []
      },
      context: {
        industries: ['government', 'education', 'healthcare', 'finance', 'e-commerce', 'technology'],
        platforms: ['frontend', 'mobile'],
        criticality: category.severity === 'critical' ? ['high'] : ['medium']
      },
      source: 'https://design-tokens.github.io/community-group/format/'
    };
  }

  console.log(`Generating W3C Design Tokens rules...`);

  if (!existsSync(tokensDir)) {
    mkdirSync(tokensDir, { recursive: true });
  }

  let count = 0;
  for (const category of W3C_TOKEN_CATEGORIES) {
    const rule = createTokenRule(category);
    const filePath = `${tokensDir}/w3c-tokens.${category.id.replace(/\./g, '-')}.json`;
    writeFileSync(filePath, JSON.stringify(rule, null, 2));
    count++;
  }

  console.log(`Created ${count} W3C Design Tokens rule files`);
}

main();