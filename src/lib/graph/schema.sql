-- standards-mcp v3.0 Knowledge Graph SQLite Schema

-- Rules table: stores all StandardRule entries
CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  standard TEXT NOT NULL,
  version TEXT,
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK(severity IN ('info', 'warning', 'critical')),
  applies_to JSON,
  related_standards JSON,
  tags JSON,
  implementation JSON,
  validation JSON,
  evidence JSON,
  context JSON,
  source TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rules_standard ON rules(standard);
CREATE INDEX IF NOT EXISTS idx_rules_severity ON rules(severity);
CREATE INDEX IF NOT EXISTS idx_rules_category ON rules(category);
CREATE INDEX IF NOT EXISTS idx_rules_tags ON rules(tags);

-- Relations table: cross-standard relationships
CREATE TABLE IF NOT EXISTS relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_rule TEXT NOT NULL,
  target_rule TEXT NOT NULL,
  relation_type TEXT NOT NULL CHECK(relation_type IN ('IMPLEMENTS', 'EXTENDS', 'MAPS_TO', 'REQUIRES', 'CONFLICTS_WITH', 'RELATED')),
  weight REAL DEFAULT 1.0,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (source_rule) REFERENCES rules(id) ON DELETE CASCADE,
  FOREIGN KEY (target_rule) REFERENCES rules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rel_source ON relations(source_rule);
CREATE INDEX IF NOT EXISTS idx_rel_target ON relations(target_rule);
CREATE INDEX IF NOT EXISTS idx_rel_type ON relations(relation_type);

-- Evidence records: auditable compliance artifacts
CREATE TABLE IF NOT EXISTS evidence_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_id TEXT NOT NULL,
  project_path TEXT NOT NULL,
  artifact_path TEXT,
  status TEXT CHECK(status IN ('pass', 'fail', 'partial', 'unknown')),
  generated_at TEXT DEFAULT (datetime('now')),
  commit_sha TEXT,
  metadata JSON,
  FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ev_rule ON evidence_records(rule_id);
CREATE INDEX IF NOT EXISTS idx_ev_project ON evidence_records(project_path);
CREATE INDEX IF NOT EXISTS idx_ev_status ON evidence_records(status);

-- Validation runs: execution history
CREATE TABLE IF NOT EXISTS validation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_id TEXT NOT NULL,
  project_path TEXT NOT NULL,
  status TEXT CHECK(status IN ('pass', 'fail', 'error', 'skipped')),
  findings JSON,
  executed_at TEXT DEFAULT (datetime('now')),
  duration_ms INTEGER,
  FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_val_rule ON validation_runs(rule_id);
CREATE INDEX IF NOT EXISTS idx_val_project ON validation_runs(project_path);
CREATE INDEX IF NOT EXISTS idx_val_date ON validation_runs(executed_at);

-- Metadata table for cache invalidation
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Hash of rule files for cache invalidation
INSERT OR REPLACE INTO meta (key, value, updated_at) VALUES (
  'rules_hash',
  '',
  datetime('now')
);