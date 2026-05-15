#!/usr/bin/env node
/**
 * evidence/generator.js
 * Core evidence generator
 */

import { createGraphDb } from '../graph/db.js';
import { join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

export async function generateEvidence({ ruleId, projectPath }) {
  const graph = await createGraphDb();
  
  try {
    const rule = graph.getRule(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }
    
    const projectDir = projectPath || process.cwd();
    const evidenceDir = join(projectDir, 'governance', 'evidence', rule.standard, ruleId);
    
    if (!existsSync(evidenceDir)) {
      mkdirSync(evidenceDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString();
    const commitSha = getCommitSha(projectDir);
    
    const evidence = {
      id: `evidence-${Date.now()}`,
      ruleId,
      standard: rule.standard,
      generatedAt: timestamp,
      commitSha,
      artifacts: [],
      status: 'generated'
    };
    
    if (rule.evidence_requiredArtifacts) {
      for (const artifactType of rule.evidence_requiredArtifacts) {
        const artifact = await generateArtifact(artifactType, rule, projectDir);
        if (artifact) {
          evidence.artifacts.push(artifact);
        }
      }
    }
    
    const evidencePath = join(evidenceDir, `evidence-${Date.now()}.json`);
    writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
    
    recordEvidence(graph, evidence);
    
    return {
      status: 'success',
      evidencePath,
      artifacts: evidence.artifacts.length,
      timestamp
    };
  } finally {
    graph.close();
  }
}

async function generateArtifact(type, rule, projectDir) {
  const generators = {
    'test-report': () => generateTestReport(rule, projectDir),
    'token-coverage': () => generateTokenCoverage(rule, projectDir),
    'visual-inspection': () => generateVisualInspection(rule, projectDir),
    'manual-review': () => generateManualReviewTemplate(rule, projectDir)
  };
  
  if (generators[type]) {
    return generators[type]();
  }
  return null;
}

function generateTestReport(rule, projectDir) {
  return {
    type: 'test-report',
    description: 'Test coverage report for rule',
    status: 'generated',
    detail: 'Test report artifact placeholder'
  };
}

function generateTokenCoverage(rule, projectDir) {
  return {
    type: 'token-coverage',
    description: 'Token coverage analysis',
    status: 'generated',
    detail: 'Token coverage artifact placeholder'
  };
}

function generateVisualInspection(rule, projectDir) {
  return {
    type: 'visual-inspection',
    description: 'Visual inspection checklist',
    status: 'pending',
    detail: 'Manual visual inspection required'
  };
}

function generateManualReviewTemplate(rule, projectDir) {
  return {
    type: 'manual-review',
    description: 'Manual review template',
    status: 'pending',
    detail: 'Manual review template generated'
  };
}

function getCommitSha(projectDir) {
  try {
    const sha = execSync('git rev-parse HEAD', { cwd: projectDir, encoding: 'utf-8' });
    return sha.trim();
  } catch (e) {
    return 'unknown';
  }
}

function recordEvidence(graph, evidence) {
  try {
    graph.run(
      `INSERT INTO evidence_records (rule_id, project_path, artifact_path, status, generated_at, commit_sha, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        evidence.ruleId,
        evidence.commitSha || 'unknown',
        evidence.evidencePath || '',
        evidence.status,
        evidence.generatedAt,
        evidence.commitSha,
        JSON.stringify({ artifacts: evidence.artifacts })
      ]
    );
  } catch (e) {
    // table might not exist yet, ignore
  }
}

export async function listEvidence({ projectPath, standard }) {
  const graph = await createGraphDb();
  
  try {
    let query = 'SELECT * FROM evidence_records';
    const params = [];
    
    if (standard) {
      query += ' WHERE standard = ?';
      params.push(standard);
    }
    
    const records = graph.query(query, params);
    
    return {
      count: records.length,
      records: records.map(r => ({
        ruleId: r.rule_id,
        projectPath: r.project_path,
        status: r.status,
        generatedAt: r.generated_at,
        commitSha: r.commit_sha
      }))
    };
  } finally {
    graph.close();
  }
}

export async function exportEvidence({ projectPath, format = 'zip' }) {
  const evidenceDir = join(projectPath || process.cwd(), 'governance', 'evidence');
  
  if (!existsSync(evidenceDir)) {
    return { status: 'empty', message: 'No evidence to export' };
  }
  
  return {
    status: 'success',
    evidenceDir,
    format,
    message: `Evidence ready for export from ${evidenceDir}`
  };
}