#!/usr/bin/env node
/**
 * migrate-wcag22.js
 * Generates WCAG 2.2 success criteria as rule JSON files
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wcagDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/accessibility/wcag22/rules';

const WCAG22_CRITERIA = [
  // Perceivable - Level A
  { id: '1.1.1', name: 'Non-text Content', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'All non-text content has a text alternative.', tags: ['wcag22', 'accessibility', 'perceivable', 'non-text'], severity: 'critical', automated: true },
  { id: '1.2.1', name: 'Audio-only and Video-only (Prerecorded)', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Prerecorded audio-only and video-only media has alternatives.', tags: ['wcag22', 'accessibility', 'media'], severity: 'critical', automated: false },
  { id: '1.2.2', name: 'Captions (Prerecorded)', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Captions for prerecorded audio content.', tags: ['wcag22', 'accessibility', 'captions'], severity: 'critical', automated: false },
  { id: '1.2.3', name: 'Audio Description or Media Alternative (Prerecorded)', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Audio description or media alternative for prerecorded video.', tags: ['wcag22', 'accessibility', 'media'], severity: 'warning', automated: false },
  { id: '1.3.1', name: 'Info and Relationships', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Information structure is programmatically determinable.', tags: ['wcag22', 'accessibility', 'semantic'], severity: 'critical', automated: true },
  { id: '1.3.2', name: 'Meaningful Sequence', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Reading sequence is programmatically determinable.', tags: ['wcag22', 'accessibility', 'structure'], severity: 'critical', automated: true },
  { id: '1.3.3', name: 'Sensory Characteristics', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Instructions do not rely solely on sensory characteristics.', tags: ['wcag22', 'accessibility', 'usability'], severity: 'warning', automated: false },
  { id: '1.4.1', name: 'Use of Color', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Color is not the only means of conveying information.', tags: ['wcag22', 'accessibility', 'color', 'contrast'], severity: 'critical', automated: true },
  { id: '1.4.2', name: 'Audio Control', level: 'a', category: 'perceivable', appliesTo: ['frontend'], description: 'Audio can be paused, stopped, or muted.', tags: ['wcag22', 'accessibility', 'audio'], severity: 'critical', automated: false },

  // Perceivable - Level AA
  { id: '1.4.3', name: 'Contrast (Minimum)', level: 'aa', category: 'perceivable', appliesTo: ['frontend'], description: 'Text has contrast ratio of at least 4.5:1 (3:1 for large text).', tags: ['wcag22', 'accessibility', 'contrast', 'color'], severity: 'critical', automated: true },
  { id: '1.4.4', name: 'Resize Text', level: 'aa', category: 'perceivable', appliesTo: ['frontend'], description: 'Text can be resized up to 200% without loss of content.', tags: ['wcag22', 'accessibility', 'typography', 'responsive'], severity: 'critical', automated: true },
  { id: '1.4.5', name: 'Images of Text', level: 'aa', category: 'perceivable', appliesTo: ['frontend'], description: 'Text is not presented as image unless essential.', tags: ['wcag22', 'accessibility', 'typography'], severity: 'warning', automated: true },
  { id: '1.4.10', name: 'Reflow', level: 'aa', category: 'perceivable', appliesTo: ['frontend'], description: 'Content reflows at 320px width without horizontal scrolling.', tags: ['wcag22', 'accessibility', 'responsive', 'layout'], severity: 'critical', automated: true },
  { id: '1.4.11', name: 'Non-text Contrast', level: 'aa', category: 'perceivable', appliesTo: ['frontend'], description: 'Non-text UI components have 3:1 contrast ratio.', tags: ['wcag22', 'accessibility', 'contrast', 'ui'], severity: 'critical', automated: true },
  { id: '1.4.12', name: 'Text Spacing', level: 'aa', category: 'perceivable', appliesTo: ['frontend'], description: 'Text spacing can be changed without loss of content.', tags: ['wcag22', 'accessibility', 'typography', 'spacing'], severity: 'warning', automated: true },
  { id: '1.4.13', name: 'Content on Hover or Focus', level: 'aa', category: 'perceivable', appliesTo: ['frontend'], description: 'Hover/focus content is dismissible and hoverable.', tags: ['wcag22', 'accessibility', 'interaction', 'usability'], severity: 'warning', automated: false },

  // Operable - Level A
  { id: '2.1.1', name: 'Keyboard', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'All functionality accessible by keyboard.', tags: ['wcag22', 'accessibility', 'keyboard', 'navigation'], severity: 'critical', automated: true },
  { id: '2.1.2', name: 'No Keyboard Trap', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Keyboard focus can be moved away from components.', tags: ['wcag22', 'accessibility', 'keyboard'], severity: 'critical', automated: true },
  { id: '2.1.4', name: 'Character Key Shortcuts', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Removable or deactivatable single-character shortcuts.', tags: ['wcag22', 'accessibility', 'keyboard', 'shortcuts'], severity: 'warning', automated: false },
  { id: '2.2.1', name: 'Timing Adjustable', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'User can adjust or turn off time limits.', tags: ['wcag22', 'accessibility', 'usability', 'timing'], severity: 'warning', automated: false },
  { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Moving, blinking, or scrolling content can be paused.', tags: ['wcag22', 'accessibility', 'animation', 'motion'], severity: 'warning', automated: false },
  { id: '2.3.1', name: 'Three Flashes or Below Threshold', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Content does not flash more than 3 times per second.', tags: ['wcag22', 'accessibility', 'photosensitivity', 'safety'], severity: 'critical', automated: true },
  { id: '2.4.1', name: 'Bypass Blocks', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Skip navigation link or landmark region available.', tags: ['wcag22', 'accessibility', 'navigation', 'landmark'], severity: 'critical', automated: true },
  { id: '2.4.2', name: 'Page Titled', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Pages have descriptive titles.', tags: ['wcag22', 'accessibility', 'metadata', 'seo'], severity: 'warning', automated: true },
  { id: '2.4.3', name: 'Focus Order', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Focus order follows logical sequence.', tags: ['wcag22', 'accessibility', 'keyboard', 'tab order'], severity: 'critical', automated: true },
  { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Link purpose is determinable from link text.', tags: ['wcag22', 'accessibility', 'links', 'navigation'], severity: 'warning', automated: false },
  { id: '2.4.5', name: 'Multiple Ways', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'At least two ways to locate pages.', tags: ['wcag22', 'accessibility', 'navigation', 'search'], severity: 'warning', automated: false },
  { id: '2.4.6', name: 'Headings and Labels', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Headings and labels describe topic or purpose.', tags: ['wcag22', 'accessibility', 'semantic', 'structure'], severity: 'warning', automated: true },
  { id: '2.4.7', name: 'Focus Visible', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Keyboard focus indicator is visible.', tags: ['wcag22', 'accessibility', 'keyboard', 'focus'], severity: 'critical', automated: true },
  { id: '2.4.11', name: 'Focus Not Obscured (Minimum)', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Focused element is not fully hidden by other content.', tags: ['wcag22', 'accessibility', 'focus', 'visibility'], severity: 'critical', automated: true },
  { id: '2.5.1', name: 'Pointer Gestures', level: 'a', category: 'operable', appliesTo: ['frontend', 'mobile'], description: 'Multi-point or path-based gestures have alternatives.', tags: ['wcag22', 'accessibility', 'mobile', 'gestures'], severity: 'warning', automated: false },
  { id: '2.5.2', name: 'Pointer Cancellation', level: 'a', category: 'operable', appliesTo: ['frontend', 'mobile'], description: 'Functions completed on pointer up can be undone.', tags: ['wcag22', 'accessibility', 'mobile', 'interaction'], severity: 'warning', automated: false },
  { id: '2.5.3', name: 'Label in Name', level: 'a', category: 'operable', appliesTo: ['frontend'], description: 'Text labels match visible text for icon buttons.', tags: ['wcag22', 'accessibility', 'labels', 'naming'], severity: 'warning', automated: true },
  { id: '2.5.4', name: 'Motion Actuation', level: 'a', category: 'operable', appliesTo: ['frontend', 'mobile'], description: 'Motion-based functions can be disabled.', tags: ['wcag22', 'accessibility', 'mobile', 'motion'], severity: 'warning', automated: false },

  // Operable - Level AA
  { id: '2.4.9', name: 'Link Purpose (Link Only)', level: 'aa', category: 'operable', appliesTo: ['frontend'], description: 'Link purpose is identifiable from link text alone.', tags: ['wcag22', 'accessibility', 'links'], severity: 'warning', automated: false },
  { id: '2.4.10', name: 'Section Headings', level: 'aa', category: 'operable', appliesTo: ['frontend'], description: 'Section headings identify content sections.', tags: ['wcag22', 'accessibility', 'structure', 'headings'], severity: 'warning', automated: true },
  { id: '2.4.12', name: 'Focus Not Obscured (Enhanced)', level: 'aa', category: 'operable', appliesTo: ['frontend'], description: 'Focused element is never obscured by any content.', tags: ['wcag22', 'accessibility', 'focus'], severity: 'critical', automated: true },
  { id: '2.4.13', name: 'Focus Appearance', level: 'aa', category: 'operable', appliesTo: ['frontend'], description: 'Focus indicator has sufficient size and contrast.', tags: ['wcag22', 'accessibility', 'focus', 'contrast'], severity: 'critical', automated: true },
  { id: '2.5.5', name: 'Target Size (Minimum)', level: 'aa', category: 'operable', appliesTo: ['frontend', 'mobile'], description: 'Touch targets are at least 24x24 CSS pixels.', tags: ['wcag22', 'accessibility', 'touch', 'mobile'], severity: 'warning', automated: true },
  { id: '2.5.6', name: 'Concurrent Input Mechanisms', level: 'aa', category: 'operable', appliesTo: ['frontend', 'mobile'], description: 'Input mechanisms available for all functions.', tags: ['wcag22', 'accessibility', 'mobile', 'input'], severity: 'warning', automated: false },

  // Understandable - Level A
  { id: '3.1.1', name: 'Language of Page', level: 'a', category: 'understandable', appliesTo: ['frontend'], description: 'Default human language is programmatically determinable.', tags: ['wcag22', 'accessibility', 'language', 'i18n'], severity: 'critical', automated: true },
  { id: '3.2.1', name: 'On Focus', level: 'a', category: 'understandable', appliesTo: ['frontend'], description: 'Components do not cause context change on focus.', tags: ['wcag22', 'accessibility', 'usability', 'forms'], severity: 'warning', automated: true },
  { id: '3.2.2', name: 'On Input', level: 'a', category: 'understandable', appliesTo: ['frontend'], description: 'Components do not cause context change on input.', tags: ['wcag22', 'accessibility', 'usability', 'forms'], severity: 'warning', automated: true },
  { id: '3.3.1', name: 'Error Identification', level: 'a', category: 'understandable', appliesTo: ['frontend'], description: 'Input errors are identified and described.', tags: ['wcag22', 'accessibility', 'forms', 'validation'], severity: 'critical', automated: false },
  { id: '3.3.2', name: 'Labels or Instructions', level: 'a', category: 'understandable', appliesTo: ['frontend'], description: 'Labels are provided for inputs.', tags: ['wcag22', 'accessibility', 'forms', 'labels'], severity: 'critical', automated: true },

  // Understandable - Level AA
  { id: '3.1.2', name: 'Language of Parts', level: 'aa', category: 'understandable', appliesTo: ['frontend'], description: 'Language of parts is programmatically determinable.', tags: ['wcag22', 'accessibility', 'language', 'i18n'], severity: 'warning', automated: false },
  { id: '3.2.3', name: 'Consistent Navigation', level: 'aa', category: 'understandable', appliesTo: ['frontend'], description: 'Navigation sequences are consistent across pages.', tags: ['wcag22', 'accessibility', 'navigation', 'consistency'], severity: 'warning', automated: false },
  { id: '3.2.4', name: 'Consistent Identification', level: 'aa', category: 'understandable', appliesTo: ['frontend'], description: 'Components with same function have consistent identification.', tags: ['wcag22', 'accessibility', 'consistency', 'naming'], severity: 'warning', automated: false },
  { id: '3.3.3', name: 'Error Suggestion', level: 'aa', category: 'understandable', appliesTo: ['frontend'], description: 'Suggestions for correcting errors are provided.', tags: ['wcag22', 'accessibility', 'forms', 'validation'], severity: 'warning', automated: false },
  { id: '3.3.4', name: 'Error Prevention (Legal, Financial, Data)', level: 'aa', category: 'understandable', appliesTo: ['frontend'], description: 'Data can be reviewed, corrected, or confirmed.', tags: ['wcag22', 'accessibility', 'forms', 'safety'], severity: 'warning', automated: false },

  // Robust - Level A
  { id: '4.1.1', name: 'Parsing', level: 'a', category: 'robust', appliesTo: ['frontend'], description: 'ID attributes are unique; markup is valid.', tags: ['wcag22', 'accessibility', 'html', 'validation'], severity: 'critical', automated: true },
  { id: '4.1.2', name: 'Name, Role, Value', level: 'a', category: 'robust', appliesTo: ['frontend'], description: 'UI components have accessible name, role, and state.', tags: ['wcag22', 'accessibility', 'aria', 'components'], severity: 'critical', automated: true },
  { id: '4.1.3', name: 'Status Messages', level: 'a', category: 'robust', appliesTo: ['frontend'], description: 'Status messages are programmatically determinable.', tags: ['wcag22', 'accessibility', 'aria', 'notifications'], severity: 'critical', automated: false },

  // Robust - Level AA
  { id: '4.1.4', name: 'Label in Name', level: 'aa', category: 'robust', appliesTo: ['frontend'], description: 'Text labels match visible text for components.', tags: ['wcag22', 'accessibility', 'labels', 'aria'], severity: 'warning', automated: true },
  { id: '4.1.5', name: 'Target Size (Enhanced)', level: 'aa', category: 'robust', appliesTo: ['frontend', 'mobile'], description: 'Touch targets are at least 44x44 CSS pixels.', tags: ['wcag22', 'accessibility', 'touch', 'mobile'], severity: 'warning', automated: true },
  { id: '4.1.6', name: 'Concurrent Input Mechanisms', level: 'aa', category: 'robust', appliesTo: ['frontend', 'mobile'], description: 'Input mechanisms available for all functions.', tags: ['wcag22', 'accessibility', 'mobile', 'input'], severity: 'warning', automated: false },

  // Additional Level AAA (some key ones)
  { id: '1.2.5', name: 'Audio Description (Prerecorded)', level: 'aaa', category: 'perceivable', appliesTo: ['frontend'], description: 'Audio description for prerecorded video.', tags: ['wcag22', 'accessibility', 'media', 'aaa'], severity: 'info', automated: false },
  { id: '1.4.6', name: 'Contrast (Enhanced)', level: 'aaa', category: 'perceivable', appliesTo: ['frontend'], description: 'Text has contrast ratio of at least 7:1.', tags: ['wcag22', 'accessibility', 'contrast', 'aaa'], severity: 'info', automated: true },
  { id: '1.4.7', name: 'Low or No Background Audio', level: 'aaa', category: 'perceivable', appliesTo: ['frontend'], description: 'Audio is at least 20dB below background.', tags: ['wcag22', 'accessibility', 'audio', 'aaa'], severity: 'info', automated: false },
  { id: '2.1.3', name: 'Keyboard (No Exception)', level: 'aaa', category: 'operable', appliesTo: ['frontend'], description: 'All functionality accessible by keyboard only.', tags: ['wcag22', 'accessibility', 'keyboard', 'aaa'], severity: 'info', automated: true },
  { id: '2.4.8', name: 'Location', level: 'aaa', category: 'operable', appliesTo: ['frontend'], description: 'Location in content is determinable.', tags: ['wcag22', 'accessibility', 'navigation', 'aaa'], severity: 'info', automated: false },
  { id: '3.1.5', name: 'Reading Level', level: 'aaa', category: 'understandable', appliesTo: ['frontend'], description: 'Content reading level can be adjusted.', tags: ['wcag22', 'accessibility', 'readability', 'aaa'], severity: 'info', automated: false },
  { id: '3.3.5', name: 'Help', level: 'aaa', category: 'understandable', appliesTo: ['frontend'], description: 'Context-sensitive help is available.', tags: ['wcag22', 'accessibility', 'help', 'aaa'], severity: 'info', automated: false },
];

function severityFromLevel(level) {
  if (level === 'a') return 'critical';
  if (level === 'aa') return 'warning';
  return 'info';
}

function createRule(criterion) {
  return {
    id: `wcag22.${criterion.id}`,
    standard: 'wcag22',
    version: '2.2',
    category: `${criterion.category}-${criterion.level}`,
    title: `${criterion.id} - ${criterion.name}`,
    description: criterion.description,
    appliesTo: criterion.appliesTo.reduce((acc, platform) => ({ ...acc, [platform]: true }), {}),
    severity: criterion.severity || severityFromLevel(criterion.level),
    relatedStandards: [],
    tags: criterion.tags,
    implementation: {
      patterns: [],
      antiPatterns: [],
      codeExamples: [],
      tokens: []
    },
    validation: {
      automated: criterion.automated || false,
      manual: !criterion.automated,
      lint: criterion.automated
    },
    evidence: {
      requiredArtifacts: criterion.automated ? ['test-report', 'code-coverage'] : ['manual-review', 'test-plan'],
      generators: criterion.automated ? ['axe-core', 'eslint-plugin-jsx-a11y'] : []
    },
    context: {
      industries: ['government', 'education', 'healthcare', 'finance', 'e-commerce'],
      platforms: criterion.appliesTo,
      criticality: criterion.level === 'a' ? ['high'] : ['medium']
    },
    source: `https://www.w3.org/TR/WCAG22/#${criterion.id.replace('.', '-')}`
  };
}

async function main() {
  console.log(`Generating ${WCAG22_CRITERIA.length} WCAG 2.2 rules...`);

  let count = 0;
  for (const criterion of WCAG22_CRITERIA) {
    const rule = createRule(criterion);
    const fileName = `wcag22.${criterion.id}.json`;

    let subDir;
    if (criterion.category === 'perceivable') {
      subDir = criterion.level === 'a' ? 'perceivable-a' : criterion.level === 'aa' ? 'perceivable-aa' : 'level-aaa';
    } else if (criterion.category === 'operable') {
      subDir = criterion.level === 'a' ? 'operable-a' : criterion.level === 'aa' ? 'operable-aa' : 'level-aaa';
    } else if (criterion.category === 'understandable') {
      subDir = criterion.level === 'a' ? 'understandable-a' : criterion.level === 'aa' ? 'understandable-aa' : 'level-aaa';
    } else {
      subDir = criterion.level === 'a' ? 'robust-a' : criterion.level === 'aa' ? 'robust-aa' : 'level-aaa';
    }

    const dir = join(wcagDir, subDir);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filePath = join(dir, fileName);
    writeFileSync(filePath, JSON.stringify(rule, null, 2));
    count++;
  }

  console.log(`Created ${count} WCAG 2.2 rule files in ${wcagDir}`);
}

main();