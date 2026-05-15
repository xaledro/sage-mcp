import { join } from 'node:path';

export const SAGE_RUNTIME_DIR = '.sage';
export const GOVERNANCE_DIR = 'governance';

export function sagePath(projectPath, ...segments) {
  return join(projectPath, SAGE_RUNTIME_DIR, ...segments);
}

export function governancePath(projectPath, ...segments) {
  return join(projectPath, GOVERNANCE_DIR, ...segments);
}

export const paths = (projectPath) => ({
  graphDb:        sagePath(projectPath, 'graph.db'),
  cacheDir:       sagePath(projectPath, 'cache'),
  cacheFacts:     sagePath(projectPath, 'cache', 'facts.json'),
  discoveredDir:  sagePath(projectPath, 'discovered'),
  runsDir:        sagePath(projectPath, 'runs'),

  config:         governancePath(projectPath, 'config.json'),
  decisionsDir:   governancePath(projectPath, 'decisions'),
  evidenceDir:    governancePath(projectPath, 'evidence'),
  evidenceFor:    (standard) => governancePath(projectPath, 'evidence', standard),
  reportsDir:     governancePath(projectPath, 'reports'),
  stateDir:       governancePath(projectPath, 'state'),
});