#!/usr/bin/env node
/**
 * migrate-carbon.js
 * Generates Carbon Design System rules
 * Focus: dashboards, ERP, industrial systems (mining sector)
 */

const CARBON_RULES = [
  // === DATA TABLES ===
  { id: 'carbon.data-table.basic', name: 'Basic Data Table', category: 'data-table', description: 'Standard data table with sortable columns, row selection, and pagination.', severity: 'critical', automated: false },
  { id: 'carbon.data-table.expanded', name: 'Expanded Data Table', category: 'data-table', description: 'Data table with expandable rows for detail views.', severity: 'warning', automated: false },
  { id: 'carbon.data-table.with-toolbar', name: 'Data Table with Toolbar', category: 'data-table', description: 'Data table with integrated toolbar for batch actions and filtering.', severity: 'warning', automated: false },
  { id: 'carbon.data-table.tree-view', name: 'Tree Table', category: 'data-table', description: 'Hierarchical data table with expandable tree structure.', severity: 'info', automated: false },
  { id: 'carbon.data-table.sticky-header', name: 'Sticky Header Data Table', category: 'data-table', description: 'Data table with sticky header that remains visible on scroll.', severity: 'warning', automated: false },
  { id: 'carbon.data-table.batch-actions', name: 'Batch Actions', category: 'data-table', description: 'Batch action bar for multi-select operations.', severity: 'warning', automated: false },

  // === DATA VISUALIZATION ===
  { id: 'carbon.dataviz.bar-chart', name: 'Bar Chart', category: 'dataviz', description: 'Horizontal and vertical bar chart patterns.', severity: 'warning', automated: false },
  { id: 'carbon.dataviz.line-chart', name: 'Line Chart', category: 'dataviz', description: 'Line chart for time-series data visualization.', severity: 'warning', automated: false },
  { id: 'carbon.dataviz.area-chart', name: 'Area Chart', category: 'dataviz', description: 'Area chart for cumulative data visualization.', severity: 'warning', automated: false },
  { id: 'carbon.dataviz.scatter-plot', name: 'Scatter Plot', category: 'dataviz', description: 'Scatter plot for correlation analysis.', severity: 'info', automated: false },
  { id: 'carbon.dataviz.pie-chart', name: 'Pie Chart', category: 'dataviz', description: 'Pie and donut charts for proportional data.', severity: 'info', automated: false },
  { id: 'carbon.dataviz.gauge', name: 'Gauge Chart', category: 'dataviz', description: 'Gauge charts for KPI display.', severity: 'warning', automated: false },
  { id: 'carbon.dataviz.status-indicator', name: 'Status Indicator', category: 'dataviz', description: 'Status tiles and indicators for operational dashboards.', severity: 'critical', automated: true },

  // === WORKFLOWS ===
  { id: 'carbon.workflow.multi-step', name: 'Multi-Step Workflow', category: 'workflow', description: 'Multi-step process with progress indicator.', severity: 'warning', automated: false },
  { id: 'carbon.workflow.current-step', name: 'Current Step Indicator', category: 'workflow', description: 'Visual indicator of current workflow step.', severity: 'warning', automated: false },
  { id: 'carbon.workflow.saved-progress', name: 'Save Progress', category: 'workflow', description: 'Ability to save and resume workflow.', severity: 'warning', automated: false },
  { id: 'carbon.workflow.validation', name: 'Step Validation', category: 'workflow', description: 'Validation at each workflow step before proceeding.', severity: 'critical', automated: false },

  // === NAVIGATION - OPERATIONAL ===
  { id: 'carbon.nav.side-panel', name: 'Side Panel Navigation', category: 'nav', description: 'Persistent side panel for navigation.', severity: 'warning', automated: false },
  { id: 'carbon.nav.header-bar', name: 'Header Bar', category: 'nav', description: 'Application header with navigation and actions.', severity: 'critical', automated: false },
  { id: 'carbon.nav.breadcrumb', name: 'Breadcrumb Navigation', category: 'nav', description: 'Breadcrumb trail for hierarchical navigation.', severity: 'warning', automated: false },
  { id: 'carbon.nav.tabs', name: 'Application Tabs', category: 'nav', description: 'Tab navigation for multiple views within an app.', severity: 'warning', automated: false },

  // === DENSITY VARIANTS ===
  { id: 'carbon.density.compact', name: 'Compact Density', category: 'density', description: 'Compact density for high-information-density interfaces.', severity: 'warning', automated: false },
  { id: 'carbon.density.regular', name: 'Regular Density', category: 'density', description: 'Regular density as default option.', severity: 'info', automated: false },
  { id: 'carbon.density.comfortable', name: 'Comfortable Density', category: 'density', description: 'Comfortable density for reduced cognitive load.', severity: 'info', automated: false },

  // === UI COMPONENTS ===
  { id: 'carbon.component.button', name: 'Button', category: 'component', description: 'Primary, secondary, ghost, danger button variants.', severity: 'critical', automated: false },
  { id: 'carbon.component.icon-button', name: 'Icon Button', category: 'component', description: 'Icon-only buttons for toolbar actions.', severity: 'warning', automated: false },
  { id: 'carbon.component.tile', name: 'Tile', category: 'component', description: 'Clickable tile component for dashboards.', severity: 'warning', automated: false },
  { id: 'carbon.component.modal', name: 'Modal', category: 'component', description: 'Modal dialogs for confirmations and forms.', severity: 'critical', automated: false },
  { id: 'carbon.component.notification', name: 'Notification', category: 'component', description: 'Toast and inline notifications.', severity: 'warning', automated: false },
  { id: 'carbon.component.dropdown', name: 'Dropdown', category: 'component', description: 'Dropdown menu and select components.', severity: 'warning', automated: false },
  { id: 'carbon.component.date-picker', name: 'Date Picker', category: 'component', description: 'Date and time picker components.', severity: 'warning', automated: false },
  { id: 'carbon.component.file-uploader', name: 'File Uploader', category: 'component', description: 'File upload with drag-and-drop support.', severity: 'warning', automated: false },

  // === PATTERNS ===
  { id: 'carbon.pattern.dashboard-layout', name: 'Dashboard Layout', category: 'pattern', description: 'Standard dashboard layout with grid system.', severity: 'critical', automated: false },
  { id: 'carbon.pattern.form-layout', name: 'Form Layout', category: 'pattern', description: 'Standard form layout with label alignment.', severity: 'warning', automated: false },
  { id: 'carbon.pattern.list-page', name: 'List Page', category: 'pattern', description: 'Standard list page with filters and actions.', severity: 'warning', automated: false },
  { id: 'carbon.pattern.detail-page', name: 'Detail Page', category: 'pattern', description: 'Standard detail page with header and sections.', severity: 'warning', automated: false },
  { id: 'carbon.pattern.empty-state', name: 'Empty State', category: 'pattern', description: 'Empty state with illustration and call-to-action.', severity: 'warning', automated: false },
  { id: 'carbon.pattern.loading', name: 'Loading State', category: 'pattern', description: 'Skeleton loading states for content.', severity: 'warning', automated: false }
];

async function main() {
  const carbonDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/design-system/carbon/rules';
  const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');

  console.log(`Generating Carbon Design System rules (${CARBON_RULES.length} rules)...`);

  if (!existsSync(carbonDir)) {
    mkdirSync(carbonDir, { recursive: true });
  }

  let count = 0;
  for (const rule of CARBON_RULES) {
    const ruleData = {
      id: rule.id,
      standard: 'carbon',
      version: '11.0',
      category: rule.category,
      title: rule.name,
      description: rule.description,
      appliesTo: { frontend: true, desktop: true },
      severity: rule.severity,
      relatedStandards: rule.category === 'dataviz' 
        ? ['iso25010', 'wcag22']
        : rule.category === 'data-table'
        ? ['iso25010.usability', 'wcag22.1.3.1']
        : ['carbon', 'wcag22'],
      tags: ['carbon', 'design-system', 'ibm', rule.category],
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
        industries: ['technology', 'manufacturing', 'mining', 'energy', 'logistics'],
        platforms: ['frontend', 'desktop'],
        criticality: rule.severity === 'critical' ? ['high'] : ['medium']
      },
      source: 'https://carbondesignsystem.com/'
    };
    const fileName = `${rule.id.replace(/\./g, '-')}.json`;
    writeFileSync(`${carbonDir}/${fileName}`, JSON.stringify(ruleData, null, 2));
    count++;
  }

  console.log(`Created ${count} Carbon Design System rule files`);
}

main();