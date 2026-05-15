import { inspect } from '../lib/project-intelligence.js';

const iso25010Model = {
  qualityCharacteristics: [
    {
      id: "functional_suitability",
      name: "Functional Suitability",
      description: "The degree to which a product provides functions that meet stated and implied needs when used under specified conditions",
      subCharacteristics: [
        {
          id: "functional_completeness",
          name: "Completeness",
          description: "Degree to which the functions cover all the specified tasks and user objectives",
          measures: ["Task coverage", "Goal achievement rate"]
        },
        {
          id: "functional_correctness",
          name: "Correctness",
          description: "Degree to which a product provides the right results with the needed degree of precision",
          measures: ["Accuracy of results", "Error rate"]
        },
        {
          id: "functional_appropriateness",
          name: "Appropriateness",
          description: "Degree to which the functions facilitate the accomplishment of specified tasks and objectives",
          measures: ["Task efficiency", "User satisfaction"]
        }
      ]
    },
    {
      id: "performance_efficiency",
      name: "Performance Efficiency",
      description: "The degree to which a product provides appropriate performance relative to the amount of resources used under stated conditions",
      subCharacteristics: [
        {
          id: "time_behavior",
          name: "Time Behavior",
          description: "Degree to which the response and processing times and throughput rates meet requirements",
          measures: ["Response time", "Processing time", "Throughput"]
        },
        {
          id: "resource_utilization",
          name: "Resource Utilization",
          description: "Degree to which the amounts and types of resources used meet requirements",
          measures: ["CPU usage", "Memory usage", "Storage usage"]
        },
        {
          id: "capacity",
          name: "Capacity",
          description: "Degree to which the maximum limits of a product parameter meet requirements",
          measures: ["Maximum users", "Maximum data size", "Maximum transactions"]
        }
      ]
    },
    {
      id: "compatibility",
      name: "Compatibility",
      description: "The degree to which a product, system, or component can exchange information with other products, systems, or components",
      subCharacteristics: [
        {
          id: "co-existence",
          name: "Co-existence",
          description: "Degree to which a product can perform its required functions while sharing a common environment with other products",
          measures: ["Resource conflict", "Interference detection"]
        },
        {
          id: "interoperability",
          name: "Interoperability",
          description: "Degree to which a product can exchange information with other products and operate with them",
          measures: ["Data exchange formats", "API compliance"]
        }
      ]
    },
    {
      id: "usability",
      name: "Usability",
      description: "The degree to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction",
      subCharacteristics: [
        {
          id: "recognizability",
          name: "Recognizability",
          description: "Degree to which users can recognize whether a product is appropriate for their needs",
          measures: ["Clear purpose indication", "Feature discovery"]
        },
        {
          id: "learnability",
          name: "Learnability",
          description: "Degree to which a product can be used by specified users to achieve specified goals of learning",
          measures: ["Time to learn", "Training requirements", "Documentation quality"]
        },
        {
          id: "operability",
          name: "Operability",
          description: "Degree to which a product has attributes that make it easy to operate and control",
          measures: ["Ease of use", "Control clarity", "Feedback quality"]
        },
        {
          id: "user_error_protection",
          name: "User Error Protection",
          description: "Degree to which a product protects users against making errors",
          measures: ["Error prevention", "Error recovery", "Confirmation dialogs"]
        },
        {
          id: "user_interface_aesthetics",
          name: "User Interface Aesthetics",
          description: "Degree to which a product enables interaction that is pleasing to the user",
          measures: ["Visual appeal", "Consistency", "Layout quality"]
        },
        {
          id: "accessibility",
          name: "Accessibility",
          description: "Degree to which a product can be used by people with the widest range of characteristics",
          measures: ["WCAG compliance", "Screen reader support", "Keyboard navigation"]
        }
      ]
    },
    {
      id: "reliability",
      name: "Reliability",
      description: "The degree to which a product performs specified functions under specified conditions for a specified period of time",
      subCharacteristics: [
        {
          id: "maturity",
          name: "Maturity",
          description: "Degree to which a product meets reliability requirements under normal operation",
          measures: ["Failure rate", "Uptime percentage", "MTBF"]
        },
        {
          id: "fault_tolerance",
          name: "Fault Tolerance",
          description: "Degree to which a product operates as intended despite the presence of hardware or software faults",
          measures: ["Graceful degradation", "Failover success rate"]
        },
        {
          id: "recoverability",
          name: "Recoverability",
          description: "Degree to which, in the event of a disruption, a product can recover the data directly affected and re-establish the desired state of the system",
          measures: ["Recovery time", "Data loss prevention", "Rollback success"]
        }
      ]
    },
    {
      id: "security",
      name: "Security",
      description: "The degree to which a product protects information and data so that persons, other products, or systems have access according to their authorization types",
      subCharacteristics: [
        {
          id: "confidentiality",
          name: "Confidentiality",
          description: "Degree to which a product ensures that data is accessible only to those authorized",
          measures: ["Encryption", "Access control", "Data classification"]
        },
        {
          id: "integrity",
          name: "Integrity",
          description: "Degree to which a product prevents unauthorized modification of data",
          measures: ["Checksum validation", "Audit trail", "Tamper detection"]
        },
        {
          id: "non_repudiation",
          name: "Non-repudiation",
          description: "Degree to which actions or events can be proven to have taken place",
          measures: ["Digital signatures", "Timestamp verification"]
        },
        {
          id: "accountability",
          name: "Accountability",
          description: "Degree to which the actions of an entity can be traced uniquely to that entity",
          measures: ["Audit logging", "User identification", "Action attribution"]
        },
        {
          id: "authenticity",
          name: "Authenticity",
          description: "Degree to which the identity of a subject or resource can be proved to be the one claimed",
          measures: ["Authentication methods", "Identity verification"]
        }
      ]
    },
    {
      id: "maintainability",
      name: "Maintainability",
      description: "The degree to which a product can be modified to improve it, correct it, or adapt it to changing environment",
      subCharacteristics: [
        {
          id: "modularity",
          name: "Modularity",
          description: "Degree to which a system is composed of discrete components such that a change to one component has minimal impact on other components",
          measures: ["Coupling", "Component independence"]
        },
        {
          id: "reusability",
          name: "Reusability",
          description: "Degree to which an asset can be used in more than one system or in building other assets",
          measures: ["Library usage", "Common components"]
        },
        {
          id: "analysability",
          name: "Analysability",
          description: "Degree to which it is possible to analyze the impact of a change on a product, or to diagnose deficiencies or causes of failures",
          measures: ["Code readability", "Testability", "Debug capability"]
        },
        {
          id: "modifiability",
          name: "Modifiability",
          description: "Degree to which a product can be effectively and efficiently modified without introducing defects or degrading existing performance",
          measures: ["Change impact", "Modification time"]
        },
        {
          id: "testability",
          name: "Testability",
          description: "Degree to which criteria for a product can be established and test criteria can be established for a product",
          measures: ["Test coverage", "Unit test ratio", "CI/CD success rate"]
        }
      ]
    },
    {
      id: "portability",
      name: "Portability",
      description: "The degree to which a product can be transferred from one environment to another",
      subCharacteristics: [
        {
          id: "adaptability",
          name: "Adaptability",
          description: "Degree to which a product can effectively and efficiently be adapted for different or evolving hardware, software, or operational environments",
          measures: ["Platform support", "Configuration flexibility"]
        },
        {
          id: "installability",
          name: "Installability",
          description: "Degree to which a product can be successfully installed and/or uninstalled in a specified environment",
          measures: ["Installation time", "Rollback capability", "Prerequisites"]
        },
        {
          id: "replaceability",
          name: "Replaceability",
          description: "Degree to which a product can replace another specified product for the same purpose in the same environment",
          measures: ["Migration effort", "Compatibility", "Data transfer"]
        }
      ]
    }
  ]
};

function getIso25010Model(projectPath = null) {
  const model = {
    standard: "ISO 25010:2011",
    version: "2011",
    description: "Software product quality requirements and evaluation model",
    characteristics: iso25010Model.qualityCharacteristics.map(char => ({
      id: char.id,
      name: char.name,
      description: char.description,
      subCharacteristicsCount: char.subCharacteristics.length
    })),
    totalCharacteristics: iso25010Model.qualityCharacteristics.length,
    totalSubCharacteristics: iso25010Model.qualityCharacteristics.reduce(
      (sum, char) => sum + char.subCharacteristics.length, 0
    )
  };

  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      model.projectContext = getProjectQualityContext(facts);
    } catch {
    }
  }

  return model;
}

function getIso25010Characteristic(characteristicId, projectPath = null) {
  const char = iso25010Model.qualityCharacteristics.find(c => c.id === characteristicId);
  if (!char) {
    throw new Error(`Unknown characteristic: ${characteristicId}. Available: ${iso25010Model.qualityCharacteristics.map(c => c.id).join(', ')}`);
  }

  const result = { ...char };

  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      result.projectContext = getProjectQualityContext(facts);
    } catch {
    }
  }

  return result;
}

function getIso25010SubCharacteristic(characteristicId, subCharacteristicId, projectPath = null) {
  const char = getIso25010Characteristic(characteristicId);
  const sub = char.subCharacteristics.find(s => s.id === subCharacteristicId);
  if (!sub) {
    throw new Error(`Unknown sub-characteristic: ${subCharacteristicId}. Available: ${char.subCharacteristics.map(s => s.id).join(', ')}`);
  }
  const result = {
    characteristic: char.id,
    ...sub
  };

  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      result.projectContext = getProjectQualityContext(facts);
    } catch {
    }
  }

  return result;
}

function getProjectQualityContext(facts) {
  const { stack, modules, tests } = facts;
  const context = {};

  if (stack.available) {
    context.stack = {
      framework: stack.framework.id,
      bundler: stack.bundler.id,
      css: stack.css.id,
      runtime: stack.runtime.id
    };
  }

  if (modules.available) {
    context.modularity = {
      moduleCount: modules.count,
      modules: modules.modules.slice(0, 5).map(m => m.name)
    };
  }

  if (tests.available) {
    context.testability = {
      testFramework: tests.framework,
      coverage: tests.coverage,
      hasTests: tests.hasTests
    };
  }

  return context;
}

export { getIso25010Model, getIso25010Characteristic, getIso25010SubCharacteristic, iso25010Model };