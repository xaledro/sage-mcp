#!/usr/bin/env node
/**
 * migrate-material3.js
 * Expands Material Design 3 from 7 token rules to ~50+ rules
 * Covers: tokens, components, motion, accessibility, adaptive, interaction, patterns
 */

const MATERIAL3_RULES = [
  // === TOKENS (existing, enhanced) ===
  { id: 'material3.tokens.color', name: 'Color Tokens', category: 'tokens', description: 'Material 3 color system with tonal palettes, surfaces, and semantic color roles.', severity: 'critical', automated: true },
  { id: 'material3.tokens.typography', name: 'Typography Tokens', category: 'tokens', description: 'Type scale with display, headline, body, and label styles with MD3 type semantics.', severity: 'critical', automated: true },
  { id: 'material3.tokens.motion', name: 'Motion Tokens', category: 'tokens', description: 'Easing curves and duration tokens for consistent motion across components.', severity: 'warning', automated: true },
  { id: 'material3.tokens.shape', name: 'Shape Tokens', category: 'tokens', description: 'Corner radius tokens for small, medium, large, and extra-large components.', severity: 'warning', automated: true },
  { id: 'material3.tokens.elevation', name: 'Elevation Tokens', category: 'tokens', description: 'Shadow and tint elevation system for surfaces and overlays.', severity: 'warning', automated: true },
  { id: 'material3.tokens.spacing', name: 'Spacing Tokens', category: 'tokens', description: '4dp grid spacing system for layout and component alignment.', severity: 'warning', automated: true },
  { id: 'material3.tokens.state-layers', name: 'State Layer Tokens', category: 'tokens', description: 'Opacity and color for interaction states: hover, focus, pressed, dragged.', severity: 'warning', automated: true },

  // === COMPONENTS ===
  { id: 'material3.component.button', name: 'Button Component', category: 'components', description: 'Filled, outlined, text, and tonal button variants with icon support.', severity: 'critical', automated: false },
  { id: 'material3.component.filled-button', name: 'Filled Button', category: 'components', description: 'Primary action button with filled background and contrasting text.', severity: 'critical', automated: false },
  { id: 'material3.component.outlined-button', name: 'Outlined Button', category: 'components', description: 'Secondary button with outlined style and fill on hover.', severity: 'warning', automated: false },
  { id: 'material3.component.text-button', name: 'Text Button', category: 'components', description: 'Minimal button with text only, used for tertiary actions.', severity: 'warning', automated: false },
  { id: 'material3.component.tonal-button', name: 'Tonal Button', category: 'components', description: 'Mid-contrast button using secondary container color.', severity: 'warning', automated: false },
  { id: 'material3.component.icon-button', name: 'Icon Button', category: 'components', description: 'Icon-only button for compact actions, with toggle state variants.', severity: 'warning', automated: false },
  { id: 'material3.component.fab', name: 'Floating Action Button', category: 'components', description: 'FAB with small, regular, large, and extended variants.', severity: 'critical', automated: false },
  { id: 'material3.component.fab-small', name: 'Small FAB', category: 'components', description: 'Mini FAB for bottom navigation or toolbars.', severity: 'info', automated: false },
  { id: 'material3.component.fab-regular', name: 'Regular FAB', category: 'components', description: 'Standard FAB for primary screen actions.', severity: 'info', automated: false },
  { id: 'material3.component.fab-large', name: 'Large FAB', category: 'components', description: 'Large FAB for emphasis in spacious layouts.', severity: 'info', automated: false },
  { id: 'material3.component.fab-extended', name: 'Extended FAB', category: 'components', description: 'FAB with label and optional icon for clarity.', severity: 'info', automated: false },
  { id: 'material3.component.card', name: 'Card Component', category: 'components', description: 'Elevated, filled, and outlined card variants for content grouping.', severity: 'critical', automated: false },
  { id: 'material3.component.card-elevated', name: 'Elevated Card', category: 'components', description: 'Card with shadow elevation, used for interactive content.', severity: 'warning', automated: false },
  { id: 'material3.component.card-filled', name: 'Filled Card', category: 'components', description: 'Card with filled background, used for contained content.', severity: 'info', automated: false },
  { id: 'material3.component.card-outlined', name: 'Outlined Card', category: 'components', description: 'Card with outline only, used for inactive or secondary content.', severity: 'info', automated: false },
  { id: 'material3.component.dialog', name: 'Dialog Component', category: 'components', description: 'Alert, confirm, and full-screen dialog variants.', severity: 'critical', automated: false },
  { id: 'material3.component.dialog-alert', name: 'Alert Dialog', category: 'components', description: 'Simple dialog for urgent messages requiring acknowledgment.', severity: 'critical', automated: false },
  { id: 'material3.component.dialog-confirm', name: 'Confirmation Dialog', category: 'components', description: 'Dialog with title, message, and action buttons for confirmations.', severity: 'warning', automated: false },
  { id: 'material3.component.dialog-full-screen', name: 'Full-screen Dialog', category: 'components', description: 'Full-screen dialog for complex tasks on mobile.', severity: 'warning', automated: false },
  { id: 'material3.component.navigation-bar', name: 'Navigation Bar', category: 'components', description: 'Bottom navigation bar with destination icons and labels.', severity: 'critical', automated: false },
  { id: 'material3.component.navigation-rail', name: 'Navigation Rail', category: 'components', description: 'Navigation rail for larger screens, with labels and icons.', severity: 'warning', automated: false },
  { id: 'material3.component.navigation-drawer', name: 'Navigation Drawer', category: 'components', description: 'Modal and standard drawer variants for navigation hierarchy.', severity: 'warning', automated: false },
  { id: 'material3.component.navigation-drawer-modal', name: 'Modal Navigation Drawer', category: 'components', description: 'Temporary drawer that dismisses on outside tap.', severity: 'info', automated: false },
  { id: 'material3.component.navigation-drawer-standard', name: 'Standard Navigation Drawer', category: 'components', description: 'Permanent drawer for persistent navigation.', severity: 'info', automated: false },
  { id: 'material3.component.snackbar', name: 'Snackbar Component', category: 'components', description: 'Brief messages at bottom of screen with optional action.', severity: 'warning', automated: false },
  { id: 'material3.component.snackbar-action', name: 'Snackbar with Action', category: 'components', description: 'Snackbar including a text action button.', severity: 'warning', automated: false },
  { id: 'material3.component.snackbar-icon', name: 'Snackbar with Icon', category: 'components', description: 'Snackbar with leading icon for status indication.', severity: 'info', automated: false },
  { id: 'material3.component.top-app-bar', name: 'Top App Bar', category: 'components', description: 'Center-aligned, small, medium, and large top app bar variants.', severity: 'warning', automated: false },
  { id: 'material3.component.top-app-bar-small', name: 'Small Top App Bar', category: 'components', description: 'Single-line app bar with title and navigation.', severity: 'info', automated: false },
  { id: 'material3.component.top-app-bar-medium', name: 'Medium Top App Bar', category: 'components', description: 'App bar with expanded title on scroll.', severity: 'info', automated: false },
  { id: 'material3.component.top-app-bar-large', name: 'Large Top App Bar', category: 'components', description: 'App bar with prominent expanded title.', severity: 'info', automated: false },
  { id: 'material3.component.switch', name: 'Switch Component', category: 'components', description: 'Material 3 switch with thumb, track, and state layers.', severity: 'critical', automated: false },
  { id: 'material3.component.checkbox', name: 'Checkbox Component', category: 'components', description: 'Checkbox with mark, container, and state layers.', severity: 'critical', automated: false },
  { id: 'material3.component.radio-button', name: 'Radio Button Component', category: 'components', description: 'Radio button with dot, container, and state layers.', severity: 'critical', automated: false },
  { id: 'material3.component.slider', name: 'Slider Component', category: 'components', description: 'Continuous and discrete slider with value label support.', severity: 'warning', automated: false },
  { id: 'material3.component.segmented-button', name: 'Segmented Button', category: 'components', description: 'Segmented button group with single and multi-select variants.', severity: 'warning', automated: false },
  { id: 'material3.component.tabs', name: 'Tabs Component', category: 'components', description: 'Primary, secondary, and scrollable tab variants.', severity: 'warning', automated: false },
  { id: 'material3.component.chips', name: 'Chips Component', category: 'components', description: 'Assist, filter, input, and suggestion chip variants.', severity: 'warning', automated: false },
  { id: 'material3.component.chip-assist', name: 'Assist Chip', category: 'components', description: 'Chip for auxiliary actions in content areas.', severity: 'info', automated: false },
  { id: 'material3.component.chip-filter', name: 'Filter Chip', category: 'components', description: 'Chip for filtering content with checkmark selected state.', severity: 'info', automated: false },
  { id: 'material3.component.chip-input', name: 'Input Chip', category: 'components', description: 'Chip for input fields with text and leading icon.', severity: 'info', automated: false },
  { id: 'material3.component.progress-indicator', name: 'Progress Indicator', category: 'components', description: 'Linear, circular, and indeterminate progress indicators.', severity: 'warning', automated: false },
  { id: 'material3.component.linear-progress', name: 'Linear Progress Indicator', category: 'components', description: 'Horizontal linear progress bar with determinate/indeterminate.', severity: 'info', automated: false },
  { id: 'material3.component.circular-progress', name: 'Circular Progress Indicator', category: 'components', description: 'Circular progress with small, medium, and large sizes.', severity: 'info', automated: false },

  // === MOTION ===
  { id: 'material3.motion.easing', name: 'Motion Easing Curves', category: 'motion', description: 'Standard easing curves: standard, emphasized, decelerated, accelerated.', severity: 'warning', automated: false },
  { id: 'material3.motion.duration', name: 'Motion Duration Tokens', category: 'motion', description: 'Duration tokens: short1 (50ms), short2 (100ms), short3 (150ms), medium1 (200ms), medium2 (300ms), long1 (400ms), long2 (500ms).', severity: 'warning', automated: false },
  { id: 'material3.motion.entrance', name: 'Entrance Motion', category: 'motion', description: 'Content entering screen should use fade + expand from edge.', severity: 'warning', automated: false },
  { id: 'material3.motion.exit', name: 'Exit Motion', category: 'motion', description: 'Content leaving screen should use fade + collapse toward edge.', severity: 'warning', automated: false },
  { id: 'material3.motion.container-transform', name: 'Container Transform', category: 'motion', description: 'Transform between containers with shared element transitions.', severity: 'info', automated: false },

  // === ACCESSIBILITY ===
  { id: 'material3.accessibility.touch-target', name: 'Touch Target Size', category: 'accessibility', description: 'Interactive elements must have minimum 48x48dp touch target.', severity: 'critical', automated: true },
  { id: 'material3.accessibility.focus-indicator', name: 'Focus Indicator', category: 'accessibility', description: 'Visible focus indicator required on all interactive components.', severity: 'critical', automated: true },
  { id: 'material3.accessibility.contrast', name: 'Color Contrast', category: 'accessibility', description: 'Text and icon contrast ratios must meet WCAG AA (4.5:1 text, 3:1 large text).', severity: 'critical', automated: true },
  { id: 'material3.accessibility.state-visibility', name: 'State Visibility', category: 'accessibility', description: 'Interaction states (hover, focus, pressed) must be visually distinguishable.', severity: 'warning', automated: false },

  // === ADAPTIVE ===
  { id: 'material3.adaptive.breakpoints', name: 'Breakpoint System', category: 'adaptive', description: 'Window size breakpoints: compact (0-599dp), medium (600-839dp), expanded (840dp+).', severity: 'warning', automated: false },
  { id: 'material3.adaptive.window-size-classes', name: 'Window Size Classes', category: 'adaptive', description: 'Compact, medium, and expanded window size class definitions.', severity: 'warning', automated: false },
  { id: 'material3.adaptive.component-adaptation', name: 'Component Adaptation', category: 'adaptive', description: 'Components should adapt layout based on window size class.', severity: 'info', automated: false },

  // === INTERACTION ===
  { id: 'material3.interaction.states', name: 'Interaction States', category: 'interaction', description: 'States: hover (12% overlay), focus (8% focus), pressed (16% pressed), dragged (24% dragged), disabled (38% disabled).', severity: 'critical', automated: false },
  { id: 'material3.interaction.state-layer', name: 'State Layer Behavior', category: 'interaction', description: 'State layer appears on hover/press with opacity modulation.', severity: 'warning', automated: false },
  { id: 'material3.interaction.ripple', name: 'Ripple Effect', category: 'interaction', description: 'Ink ripple feedback on touch interaction for buttons and cards.', severity: 'warning', automated: false },
  { id: 'material3.interaction.drag', name: 'Drag Interaction', category: 'interaction', description: 'Drag feedback with container transform and shadow elevation.', severity: 'info', automated: false },

  // === PATTERNS ===
  { id: 'material3.pattern.empty-state', name: 'Empty State Pattern', category: 'patterns', description: 'Empty state with illustration, headline, body text, and action.', severity: 'warning', automated: false },
  { id: 'material3.pattern.loading', name: 'Loading Pattern', category: 'patterns', description: 'Loading states with skeleton, progress, or shimmer implementations.', severity: 'warning', automated: false },
  { id: 'material3.pattern.error', name: 'Error State Pattern', category: 'patterns', description: 'Error state with icon, message, and recovery action.', severity: 'critical', automated: false },
  { id: 'material3.pattern.offline', name: 'Offline Pattern', category: 'patterns', description: 'Offline state indicating no network connection with retry action.', severity: 'warning', automated: false },
  { id: 'material3.pattern.onboarding', name: 'Onboarding Pattern', category: 'patterns', description: 'Stepped onboarding with progress indicator and skip option.', severity: 'info', automated: false }
];

async function main() {
  const materialDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/design-system/material3/rules';
  const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');

  function createMaterialRule(rule) {
    return {
      id: `material3.${rule.id}`,
      standard: 'material3',
      version: '3.0',
      category: rule.category,
      title: rule.name,
      description: rule.description,
      appliesTo: { frontend: true, mobile: true },
      severity: rule.severity,
      relatedStandards: rule.category === 'accessibility' 
        ? ['wcag22', 'wai-aria', 'material3.accessibility.focus-indicator']
        : rule.category === 'tokens'
        ? ['w3c-tokens']
        : ['wcag22'],
      tags: ['material3', 'design-system', 'm3', rule.category],
      implementation: {
        patterns: [],
        antiPatterns: [],
        codeExamples: [],
        tokens: []
      },
      validation: {
        automated: rule.automated || false,
        manual: !rule.automated,
        lint: false
      },
      evidence: {
        requiredArtifacts: rule.automated ? ['test-report', 'visual-inspection'] : ['manual-review'],
        generators: rule.automated ? ['storybook-a11y', 'axe-devtools'] : []
      },
      context: {
        industries: ['technology', 'government', 'education', 'healthcare', 'finance', 'e-commerce'],
        platforms: ['frontend', 'mobile'],
        criticality: rule.severity === 'critical' ? ['high'] : ['medium']
      },
      source: 'https://m3.material.io/'
    };
  }

  console.log(`Generating Material 3 rules (${MATERIAL3_RULES.length} rules)...`);

  if (!existsSync(materialDir)) {
    mkdirSync(materialDir, { recursive: true });
  }

  let count = 0;
  for (const rule of MATERIAL3_RULES) {
    const fileName = `${rule.id.replace(/\./g, '-')}.json`;
    const filePath = `${materialDir}/${fileName}`;
    const ruleData = {
      id: rule.id.startsWith('material3.') ? rule.id : `material3.${rule.id}`,
      standard: 'material3',
      version: '3.0',
      category: rule.category,
      title: rule.name,
      description: rule.description,
      appliesTo: { frontend: true, mobile: true },
      severity: rule.severity,
      relatedStandards: rule.category === 'accessibility' 
        ? ['wcag22', 'wai-aria', 'material3.accessibility.focus-indicator']
        : rule.category === 'tokens'
        ? ['w3c-tokens']
        : ['wcag22'],
      tags: ['material3', 'design-system', 'm3', rule.category],
      implementation: {
        patterns: [],
        antiPatterns: [],
        codeExamples: [],
        tokens: []
      },
      validation: {
        automated: rule.automated || false,
        manual: !rule.automated,
        lint: false
      },
      evidence: {
        requiredArtifacts: rule.automated ? ['test-report', 'visual-inspection'] : ['manual-review'],
        generators: rule.automated ? ['storybook-a11y', 'axe-devtools'] : []
      },
      context: {
        industries: ['technology', 'government', 'education', 'healthcare', 'finance', 'e-commerce'],
        platforms: ['frontend', 'mobile'],
        criticality: rule.severity === 'critical' ? ['high'] : ['medium']
      },
      source: 'https://m3.material.io/'
    };
    writeFileSync(filePath, JSON.stringify(ruleData, null, 2));
    count++;
  }

  console.log(`Created ${count} Material 3 rule files`);
}

main();