#!/usr/bin/env node
/**
 * migrate-nielsen.js
 * Generates Nielsen Usability Heuristics rules
 */

const NIELSEN_RULES = [
  { id: 'nielsen.1.visibility-status', name: 'Visibility of System Status', category: 'heuristic', description: 'The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.', severity: 'warning', automated: false },
  { id: 'nielsen.2.system-match', name: 'Match between System and Real World', category: 'heuristic', description: 'The system should speak the users language, with words, phrases and concepts familiar to the user.', severity: 'warning', automated: false },
  { id: 'nielsen.3.user-control', name: 'User Control and Freedom', category: 'heuristic', description: 'Users often choose system functions by mistake and need clearly marked emergency exits.', severity: 'warning', automated: false },
  { id: 'nielsen.4.consistency', name: 'Consistency and Standards', category: 'heuristic', description: 'Users should not have to wonder whether different words, situations, or actions mean the same thing.', severity: 'critical', automated: false },
  { id: 'nielsen.5.error-prevention', name: 'Error Prevention', category: 'heuristic', description: 'Even better than good error messages is a careful design which prevents a problem from occurring in the first place.', severity: 'critical', automated: false },
  { id: 'nielsen.6.recognition', name: 'Recognition rather than Recall', category: 'heuristic', description: 'Minimize the users memory load by making objects, actions, and options visible.', severity: 'warning', automated: false },
  { id: 'nielsen.7.flexibility', name: 'Flexibility and Efficiency of Use', category: 'heuristic', description: 'Shortcuts — invisible to new users — may speed up the interaction for the expert user.', severity: 'info', automated: false },
  { id: 'nielsen.8.aesthetic', name: 'Aesthetic and Minimalist Design', category: 'heuristic', description: 'Dialogues should not contain information which is irrelevant or rarely needed.', severity: 'info', automated: false },
  { id: 'nielsen.9.error-help', name: 'Help Users Recognize and Recover from Errors', category: 'heuristic', description: 'Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.', severity: 'critical', automated: true },
  { id: 'nielsen.10.help', name: 'Help and Documentation', category: 'heuristic', description: 'Even though it is better if the system can be used without documentation, it may be necessary to provide help.', severity: 'warning', automated: false }
];

async function main() {
  const nielsenDir = 'D:/workspace/gesta/design-system/standards-mcp/src/standards/ux/nielsen/rules';
  const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');

  console.log(`Generating Nielsen Heuristics rules (${NIELSEN_RULES.length} rules)...`);

  if (!existsSync(nielsenDir)) {
    mkdirSync(nielsenDir, { recursive: true });
  }

  let count = 0;
  for (const rule of NIELSEN_RULES) {
    const ruleData = {
      id: rule.id,
      standard: 'nielsen',
      version: '1.0',
      category: rule.category,
      title: rule.name,
      description: rule.description,
      appliesTo: { frontend: true, mobile: true, desktop: true },
      severity: rule.severity,
      relatedStandards: ['iso9241', 'iso25010.usability', 'wcag22'],
      tags: ['nielsen', 'ux', 'usability', 'heuristics', rule.category],
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
        requiredArtifacts: rule.automated ? ['usability-test', 'heuristic-evaluation'] : ['expert-review'],
        generators: []
      },
      context: {
        industries: ['technology', 'government', 'healthcare', 'finance', 'e-commerce', 'education'],
        platforms: ['frontend', 'mobile', 'desktop'],
        criticality: rule.severity === 'critical' ? ['high'] : ['medium']
      },
      source: 'https://www.nngroup.com/articles/ten-usability-heuristics/'
    };
    const fileName = `${rule.id.replace(/\./g, '-')}.json`;
    writeFileSync(`${nielsenDir}/${fileName}`, JSON.stringify(ruleData, null, 2));
    count++;
  }

  console.log(`Created ${count} Nielsen Heuristics rule files`);
}

main();