import { inspect } from '../lib/project-intelligence.js';

const iso9241Checklists = {
  effectiveness: {
    name: "Effectiveness",
    description: "The extent to which users can achieve their goals",
    criteria: [
      { id: "E1", text: "Users can complete tasks without errors", weight: "high" },
      { id: "E2", text: "Users can achieve their intended outcome", weight: "high" },
      { id: "E3", text: "Task completion rate is above 85%", weight: "medium" },
      { id: "E4", text: "Users can recover from errors easily", weight: "high" },
      { id: "E5", text: "Help is available when needed", weight: "medium" },
      { id: "E6", text: "Users understand what actions are available", weight: "high" },
      { id: "E7", text: "Users can identify how to perform actions", weight: "high" },
      { id: "E8", text: "Results are presented clearly", weight: "medium" }
    ]
  },
  efficiency: {
    name: "Efficiency",
    description: "The resources expended in relation to the accuracy and completeness of goals",
    criteria: [
      { id: "N1", text: "Tasks complete in reasonable time", weight: "high" },
      { id: "N2", text: "Minimum steps required to complete tasks", weight: "high" },
      { id: "N3", text: "No unnecessary effort or repetition", weight: "medium" },
      { id: "N4", text: "System responds within 1 second for user actions", weight: "high" },
      { id: "N5", text: "Shortcuts available for expert users", weight: "medium" },
      { id: "N6", text: "Information is easily accessible", weight: "medium" },
      { id: "N7", text: "Drag-and-drop operations work smoothly", weight: "low" },
      { id: "N8", text: "Batch operations supported where appropriate", weight: "low" }
    ]
  },
  satisfaction: {
    name: "Satisfaction",
    description: "The extent to which users find the system acceptable",
    criteria: [
      { id: "S1", text: "Users find the interface pleasant to use", weight: "medium" },
      { id: "S2", text: "Users would recommend the system to others", weight: "medium" },
      { id: "S3", text: "Users feel confident using the system", weight: "high" },
      { id: "S4", text: "Interface is visually consistent", weight: "medium" },
      { id: "S5", text: "No unnecessary cognitive load", weight: "high" },
      { id: "S6", text: "User feedback is helpful and timely", weight: "medium" },
      { id: "S7", text: "Error messages are constructive", weight: "high" },
      { id: "S8", text: "System feels reliable and stable", weight: "high" }
    ]
  }
};

function getIso9241Checklist(category, projectPath = null) {
  if (!category) {
    return {
      standard: "ISO 9241-11",
      description: "Usability evaluation based on effectiveness, efficiency, and satisfaction",
      categories: Object.entries(iso9241Checklists).map(([key, cat]) => ({
        id: key,
        name: cat.name,
        description: cat.description,
        criteriaCount: cat.criteria.length
      })),
      totalCriteria: Object.values(iso9241Checklists).reduce((sum, cat) => sum + cat.criteria.length, 0)
    };
  }

  const categoryLower = category.toLowerCase();
  const categoryData = iso9241Checklists[categoryLower];

  if (!categoryData) {
    throw new Error(`Invalid category: ${category}. Available: ${Object.keys(iso9241Checklists).join(', ')}`);
  }

  let projectInfo = null;
  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      projectInfo = getProjectUsabilityContext(facts);
    } catch {
    }
  }

  return {
    standard: "ISO 9241-11",
    category: categoryLower,
    name: categoryData.name,
    description: categoryData.description,
    criteria: categoryData.criteria,
    scoring: {
      high: "Critical for usability - must pass",
      medium: "Important - should pass",
      low: "Nice to have - consider for improvement"
    },
    projectInfo
  };
}

function getProjectUsabilityContext(facts) {
  const { stack, modules } = facts;
  const context = {};

  if (stack.available) {
    context.framework = stack.framework.id;
    context.bundler = stack.bundler.id;

    if (stack.framework.id === 'react' || stack.framework.id === 'vue') {
      context.componentLibrary = 'Component-based SPA - accessibility depends on component quality';
    }

    if (stack.css.id === 'tailwind') {
      context.styling = 'Tailwind CSS - utility-first approach';
    }
  }

  if (modules.available) {
    context.moduleCount = modules.count;
    context.modules = modules.modules.slice(0, 5).map(m => m.name);
  }

  return context;
}

function listIso9241Categories() {
  return Object.entries(iso9241Checklists).map(([key, cat]) => ({
    id: key,
    name: cat.name,
    criteriaCount: cat.criteria.length
  }));
}

export { getIso9241Checklist, listIso9241Categories, iso9241Checklists };