#!/usr/bin/env node
/**
 * migrate-gov-uk.js
 * Generates GOV.UK Design System rules
 * Focus: forms, validation, errors, accessibility (UK government)
 */

const GOVUK_RULES = [
  // === COMPONENTS - FORMS ===
  { id: 'govuk.input', name: 'Text Input', category: 'form', description: 'Standard text input with label and hint.', severity: 'critical', automated: false },
  { id: 'govuk.input-error', name: 'Input with Error', category: 'form', description: 'Text input showing validation error state.', severity: 'critical', automated: true },
  { id: 'govuk.textarea', name: 'Textarea', category: 'form', description: 'Multi-line text input for longer answers.', severity: 'warning', automated: false },
  { id: 'govuk.select', name: 'Select', category: 'form', description: 'Dropdown select component.', severity: 'warning', automated: false },
  { id: 'govuk.radio', name: 'Radio Buttons', category: 'form', description: 'Radio button group for single selection.', severity: 'critical', automated: false },
  { id: 'govuk.checkbox', name: 'Checkboxes', category: 'form', description: 'Checkbox group for multiple selection.', severity: 'critical', automated: false },
  { id: 'govuk.date-input', name: 'Date Input', category: 'form', description: 'Date input with day/month/year fields.', severity: 'critical', automated: false },
  { id: 'govuk.character-count', name: 'Character Count', category: 'form', description: 'Text input with character limit indicator.', severity: 'warning', automated: false },
  { id: 'govuk.file-upload', name: 'File Upload', category: 'form', description: 'File upload component with drag-and-drop.', severity: 'warning', automated: false },

  // === COMPONENTS - FEEDBACK ===
  { id: 'govuk.error-summary', name: 'Error Summary', category: 'feedback', description: 'Summary box at top of page listing all errors.', severity: 'critical', automated: true },
  { id: 'govuk.error-message', name: 'Error Message', category: 'feedback', description: 'Inline error message below form fields.', severity: 'critical', automated: true },
  { id: 'govuk.success-banner', name: 'Success Banner', category: 'feedback', description: 'Green success notification banner.', severity: 'warning', automated: false },
  { id: 'govuk.warning-text', name: 'Warning Text', category: 'feedback', description: 'Warning callout with exclamation icon.', severity: 'warning', automated: false },
  { id: 'govuk.notification-banner', name: 'Notification Banner', category: 'feedback', description: 'Application-wide notification banner.', severity: 'warning', automated: false },

  // === COMPONENTS - NAVIGATION ===
  { id: 'govuk.breadcrumbs', name: 'Breadcrumbs', category: 'navigation', description: 'Breadcrumb trail for page hierarchy.', severity: 'warning', automated: false },
  { id: 'govuk.pagination', name: 'Pagination', category: 'navigation', description: 'Page navigation for lists.', severity: 'warning', automated: false },
  { id: 'govuk.skip-link', name: 'Skip Link', category: 'navigation', description: 'Skip to main content link for accessibility.', severity: 'critical', automated: true },
  { id: 'govuk.back-link', name: 'Back Link', category: 'navigation', description: 'Back navigation link.', severity: 'warning', automated: false },

  // === COMPONENTS - CONTENT ===
  { id: 'govuk.button', name: 'Button', category: 'content', description: 'Primary, secondary, warning button variants.', severity: 'critical', automated: false },
  { id: 'govuk.tag', name: 'Tag', category: 'content', description: 'Tag labels for status and categories.', severity: 'info', automated: false },
  { id: 'govuk.table', name: 'Table', category: 'content', description: 'Data table with sortable columns.', severity: 'warning', automated: false },
  { id: 'govuk.summary-list', name: 'Summary List', category: 'content', description: 'Key-value pair list for summaries.', severity: 'warning', automated: false },

  // === PATTERNS ===
  { id: 'govuk.pattern.check-answers', name: 'Check Answers Pattern', category: 'pattern', description: 'Summary page before submission with edit links.', severity: 'critical', automated: false },
  { id: 'govuk.pattern.confirmation', name: 'Confirmation Page', category: 'pattern', description: 'Success confirmation after form submission.', severity: 'critical', automated: false },
  { id: 'govuk.pattern.multi-step', name: 'Multi-Step Form', category: 'pattern', description: 'Multi-step form with progress indicator.', severity: 'warning', automated: false },
  { id: 'govuk.pattern.autocomplete', name: 'Autocomplete', category: 'pattern', description: 'Text input with autocomplete suggestions.', severity: 'warning', automated: false },
  { id: 'govuk.pattern.passport', name: 'Passport Pattern', category: 'pattern', description: 'One thing per page with clear title.', severity: 'warning', automated: false },

  // === ACCESSIBILITY ===
  { id: 'govuk.accessibility.labels', name: 'Labels and Hints', category: 'a11y', description: 'All form inputs must have visible labels.', severity: 'critical', automated: true },
  { id: 'govuk.accessibility.required', name: 'Required Fields', category: 'a11y', description: 'Required fields marked with asterisk and described.', severity: 'critical', automated: true },
  { id: 'govuk.accessibility.autocomplete-attr', name: 'Autocomplete Attribute', category: 'a11y', description: 'Use autocomplete attribute for common fields.', severity: 'warning', automated: false },
  { id: 'govuk.accessibility.focus', name: 'Focus Management', category: 'a11y', description: 'Focus moves to error summary on validation failure.', severity: 'critical', automated: true }
];

async function main() {
  const govukDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/design-system/gov-uk/rules';
  const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');

  console.log(`Generating GOV.UK Design System rules (${GOVUK_RULES.length} rules)...`);

  if (!existsSync(govukDir)) {
    mkdirSync(govukDir, { recursive: true });
  }

  let count = 0;
  for (const rule of GOVUK_RULES) {
    const ruleData = {
      id: rule.id,
      standard: 'gov-uk',
      version: '4.0',
      category: rule.category,
      title: rule.name,
      description: rule.description,
      appliesTo: { frontend: true },
      severity: rule.severity,
      relatedStandards: rule.category === 'a11y' 
        ? ['wcag22', 'govuk.accessibility']
        : ['govuk', 'wcag22'],
      tags: ['govuk', 'design-system', 'government', 'uk', rule.category],
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
        industries: ['government', 'public-sector', 'healthcare', 'education'],
        platforms: ['frontend'],
        criticality: rule.severity === 'critical' ? ['high'] : ['medium']
      },
      source: 'https://design-system.service.gov.uk/'
    };
    const fileName = `${rule.id.replace(/\./g, '-')}.json`;
    writeFileSync(`${govukDir}/${fileName}`, JSON.stringify(ruleData, null, 2));
    count++;
  }

  console.log(`Created ${count} GOV.UK Design System rule files`);
}

main();