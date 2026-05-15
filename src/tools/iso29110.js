const PHASES = [
  { id: 'GP.1', name: 'Project Initiation', description: 'Project charter and stakeholder agreement' },
  { id: 'GP.2', name: 'Project Planning', description: 'Project plan and resource allocation' },
  { id: 'GP.3', name: 'Project Execution', description: 'Implementation of project deliverables' },
  { id: 'GP.4', name: 'Project Closure', description: 'Final delivery and project evaluation' },
  { id: 'IS.1', name: 'Initialization', description: 'Define system scope and boundaries' },
  { id: 'IS.2', name: 'Requirements', description: 'Gather and analyze system requirements' },
  { id: 'IS.3', name: 'Design', description: 'System architecture and detailed design' },
  { id: 'IS.4', name: 'Implementation', description: 'Build and integrate system components' },
  { id: 'IS.5', name: 'Integration Testing', description: 'Verify system meets requirements' },
  { id: 'IS.6', name: 'Acceptance Testing', description: 'Validate system with stakeholders' }
];

const PRODUCTS = {
  'GP-001': { name: 'Project Charter', phase: 'GP.1', description: 'Initial project definition and scope' },
  'GP-002': { name: 'Project Plan', phase: 'GP.2', description: 'Detailed project schedule and resources' },
  'GP-003': { name: 'Quality Record', phase: 'GP.3', description: 'Ongoing quality tracking and metrics' },
  'GP-004': { name: 'Lessons Learned', phase: 'GP.4', description: 'Project retrospective and knowledge capture' },
  'IS-001': { name: 'Software Requirements', phase: 'IS.1', description: 'System requirements specification' },
  'IS-002': { name: 'Software Design', phase: 'IS.2', description: 'Architecture and interface design' },
  'IS-003': { name: 'Code and Unit Test', phase: 'IS.3', description: 'Implementation and verification' },
  'IS-004': { name: 'Integration Test Report', phase: 'IS.4', description: 'System integration verification' },
  'IS-005': { name: 'User Documentation', phase: 'IS.4', description: 'End user and operational documentation' },
  'IS-006': { name: 'Acceptance Test Report', phase: 'IS.5', description: 'Stakeholder acceptance verification' },
  'IS-007': { name: 'Software Release', phase: 'IS.6', description: 'Final delivery package' }
};

const ARTEFACT_TEMPLATES = {
  'GP-001': `# Project Charter

## Project Information

| Field | Value |
|-------|-------|
| Project ID | {{projectId}} |
| Project Name | {{projectName}} |
| Date | {{date}} |
| Version | {{version}} |

## Purpose

{{purpose}}

## Scope

{{scope}}

## Stakeholders

| Role | Name | Contact | Responsibilities |
|------|------|---------|------------------|
{{stakeholders}}

## Deliverables

{{deliverables}}

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Sponsor | | | |
`,
  'GP-002': `# Project Plan

## Project Overview

- **Project:** {{projectName}}
- **Manager:** {{manager}}
- **Start Date:** {{startDate}}
- **End Date:** {{endDate}}

## Schedule

{{schedule}}

## Resources

| Resource | Role | Allocation |
|----------|------|------------|
{{resources}}

## Risks

{{risks}}
`,
  'IS-009': `# Software Requirements Specification

## Introduction

{{introduction}}

## Overall Description

{{description}}

## Functional Requirements

{{requirements}}

## Non-Functional Requirements

{{nonFunctionalRequirements}}

## Acceptance Criteria

{{acceptanceCriteria}}
`
};

function renderTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

function getArtefact(id, data = {}, projectPath = null) {
  const product = PRODUCTS[id];
  if (!product) {
    return {
      id,
      error: true,
      message: `Unknown artefact ID: ${id}. Available: ${Object.keys(PRODUCTS).join(', ')}`
    };
  }

  const template = ARTEFACT_TEMPLATES[id];
  if (!template) {
    return {
      id,
      ...product,
      data,
      status: 'template',
      message: `Artefact template available for ${id}`
    };
  }

  const defaultData = {
    projectId: id,
    projectName: 'Project',
    date: new Date().toISOString().slice(0, 10),
    version: '1.0',
    purpose: 'To be defined',
    scope: 'To be defined',
    stakeholders: '',
    deliverables: '',
    introduction: 'To be defined',
    description: 'To be defined',
    requirements: '',
    nonFunctionalRequirements: '',
    acceptanceCriteria: '',
    ...data
  };

  const content = renderTemplate(template, defaultData);

  return {
    id,
    ...product,
    content,
    status: 'generated',
    generatedAt: new Date().toISOString()
  };
}

function getStatus(projectPath = null) {
  const phases = PHASES.map(phase => ({
    ...phase,
    status: 'pending',
    products: Object.entries(PRODUCTS)
      .filter(([, p]) => p.phase === phase.id)
      .map(([id, p]) => ({
        id,
        name: p.name,
        status: 'pending'
      }))
  }));

  return {
    standard: 'ISO/IEC 29110',
    profile: 'Entry Level',
    version: '2011',
    phases,
    totalProducts: Object.keys(PRODUCTS).length,
    completedProducts: 0,
    pendingProducts: Object.keys(PRODUCTS).length
  };
}

function markGenerated(artefactId, projectPath = null) {
  const product = PRODUCTS[artefactId];
  if (!product) {
    return {
      artefactId,
      status: 'error',
      message: `Unknown artefact ID: ${artefactId}`
    };
  }

  return {
    artefactId,
    name: product.name,
    status: 'marked_complete',
    markedAt: new Date().toISOString()
  };
}

function listPhases() {
  return PHASES;
}

function listProducts() {
  return Object.entries(PRODUCTS).map(([id, p]) => ({ id, ...p }));
}

export { getArtefact, getStatus, markGenerated, listPhases, listProducts, PRODUCTS, PHASES };