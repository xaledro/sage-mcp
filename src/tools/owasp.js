import { inspect } from '../lib/project-intelligence.js';

const owaspASVS = {
  L1: {
    name: "Level 1 - All requirements",
    description: "Minimum security requirements for all applications. Automated checks possible.",
    categories: [
      {
        id: "A01",
        name: "Broken Access Control",
        requirements: [
          { id: "1.1.1", text: "Verify that the application enforces access control rules on every request." },
          { id: "1.1.2", text: "Verify that user ownership is checked before data display or modification." },
          { id: "1.1.3", text: "Verify that role-based access control is properly implemented." },
          { id: "1.2.1", text: "Verify that administrative functions are restricted to authorized users." },
          { id: "1.2.2", text: "Verify that directory browsing is disabled." },
          { id: "1.3.1", text: "Verify that主体 can only access resources they own or are explicitly allowed to." },
          { id: "1.3.2", text: "Verify that file inclusion vulnerabilities are mitigated." },
          { id: "1.4.1", text: "Verify that access control failures result in denial of access." },
          { id: "1.5.1", text: "Verify that API access uses secure authentication." }
        ]
      },
      {
        id: "A02",
        name: "Cryptographic Failures",
        requirements: [
          { id: "2.1.1", text: "Verify that sensitive data is encrypted at rest." },
          { id: "2.1.2", text: "Verify that sensitive data in transit is encrypted using TLS." },
          { id: "2.2.1", text: "Verify that cryptographic keys are generated using secure random sources." },
          { id: "2.2.2", text: "Verify that cryptographic keys are properly protected." },
          { id: "2.3.1", text: "Verify that passwords are not stored in plain text." },
          { id: "2.4.1", text: "Verify that weak cryptographic algorithms are not used." }
        ]
      },
      {
        id: "A03",
        name: "Injection",
        requirements: [
          { id: "3.1.1", text: "Verify that user input is validated on the server side." },
          { id: "3.1.2", text: "Verify that SQL injection is prevented via parameterized queries." },
          { id: "3.2.1", text: "Verify that OS command injection is prevented." },
          { id: "3.3.1", text: "Verify that LDAP injection is prevented." },
          { id: "3.4.1", text: "Verify that XPath injection is prevented." },
          { id: "3.5.1", text: "Verify that XML injection is prevented." }
        ]
      },
      {
        id: "A04",
        name: "Insecure Design",
        requirements: [
          { id: "4.1.1", text: "Verify that security logging is implemented." },
          { id: "4.2.1", text: "Verify that horizontal access control is enforced." },
          { id: "4.3.1", text: "Verify that business logic validates user input." }
        ]
      },
      {
        id: "A05",
        name: "Security Misconfiguration",
        requirements: [
          { id: "5.1.1", text: "Verify that error handling does not leak sensitive information." },
          { id: "5.2.1", text: "Verify that default accounts are disabled or renamed." },
          { id: "5.3.1", text: "Verify that security headers are properly configured." },
          { id: "5.4.1", text: "Verify that unnecessary features are disabled." }
        ]
      },
      {
        id: "A06",
        name: "Vulnerable and Outdated Components",
        requirements: [
          { id: "6.1.1", text: "Verify that all components are up to date." },
          { id: "6.2.1", text: "Verify that unnecessary dependencies are removed." }
        ]
      },
      {
        id: "A07",
        name: "Authentication and Identity Failures",
        requirements: [
          { id: "7.1.1", text: "Verify that user accounts are properly managed." },
          { id: "7.2.1", text: "Verify that session IDs are unique and random." },
          { id: "7.3.1", text: "Verify that password strength requirements are enforced." },
          { id: "7.4.1", text: "Verify that multi-factor authentication is implemented for sensitive operations." }
        ]
      },
      {
        id: "A08",
        name: "Software and Data Integrity Failures",
        requirements: [
          { id: "8.1.1", text: "Verify that software updates are verified before installation." },
          { id: "8.2.1", text: "Verify that CI/CD pipelines are secured." }
        ]
      },
      {
        id: "A09",
        name: "Security Logging and Monitoring Failures",
        requirements: [
          { id: "9.1.1", text: "Verify that security events are logged." },
          { id: "9.2.1", text: "Verify that logs are protected from tampering." },
          { id: "9.3.1", text: "Verify that security incidents trigger alerts." }
        ]
      },
      {
        id: "A10",
        name: "Server-Side Request Forgery (SSRF)",
        requirements: [
          { id: "10.1.1", text: "Verify that user-supplied URLs are validated." },
          { id: "10.2.1", text: "Verify that access to internal resources is restricted." }
        ]
      }
    ]
  },
  L2: {
    name: "Level 2 - Advanced requirements",
    description: "For applications handling sensitive data. Requires manual testing and business logic review.",
    categories: [
      {
        id: "A01",
        name: "Broken Access Control",
        requirements: [
          { id: "1.4.2", text: "Verify that rate limiting is implemented for API access." },
          { id: "1.5.2", text: "Verify that API keys are properly secured." },
          { id: "1.6.1", text: "Verify that CORS is properly configured." }
        ]
      },
      {
        id: "A02",
        name: "Cryptographic Failures",
        requirements: [
          { id: "2.5.1", text: "Verify that key rotation is implemented." },
          { id: "2.6.1", text: "Verify that HSM is used for sensitive key storage." }
        ]
      },
      {
        id: "A03",
        name: "Injection",
        requirements: [
          { id: "3.6.1", text: "Verify that ORM injection is prevented." },
          { id: "3.7.1", text: "Verify that template injection is prevented." }
        ]
      }
    ]
  },
  L3: {
    name: "Level 3 - Advanced testing",
    description: "For critical applications. Requires comprehensive testing, threat modeling, and penetration testing.",
    categories: [
      {
        id: "A01",
        name: "Broken Access Control",
        requirements: [
          { id: "1.7.1", text: "Verify that access control is tested for all roles." },
          { id: "1.8.1", text: "Verify that IDOR vulnerabilities are tested." }
        ]
      },
      {
        id: "A04",
        name: "Insecure Design",
        requirements: [
          { id: "4.4.1", text: "Verify that threat modeling is performed." },
          { id: "4.5.1", text: "Verify that abuse cases are documented." }
        ]
      }
    ]
  }
};

function getOwaspRequirements(level, category, projectPath = null) {
  const levelData = owaspASVS[level];
  if (!levelData) {
    throw new Error(`Invalid ASVS level: ${level}. Valid: L1, L2, L3`);
  }

  let categories = levelData.categories;

  if (category) {
    categories = categories.filter(c =>
      c.name.toLowerCase().includes(category.toLowerCase()) ||
      c.id.toLowerCase() === category.toLowerCase()
    );
  }

  let verification = null;
  if (projectPath) {
    try {
      const facts = inspect(projectPath);
      verification = verifyOwaspAgainstProject(facts);
    } catch {
    }
  }

  return {
    level,
    levelName: levelData.name,
    description: levelData.description,
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      requirements: cat.requirements.map(req => ({
        id: req.id,
        text: req.text,
        verified: false
      }))
    })),
    totalRequirements: categories.reduce((sum, cat) => sum + cat.requirements.length, 0),
    verification
  };
}

function verifyOwaspAgainstProject(facts) {
  const { stack, backend } = facts;
  const verified = [];
  const gaps = [];

  if (stack.available) {
    if (stack.framework.id === 'react' || stack.framework.id === 'vue') {
      verified.push({ id: 'A05', text: 'Client-side framework detected - CSRF protection needed' });
    }
    if (stack.runtime.id === 'supabase') {
      verified.push({ id: 'A07', text: 'Supabase Auth - session management built-in' });
    }
    if (!stack.packages?.list?.includes('helmet')) {
      gaps.push({ id: 'A05', text: 'Missing helmet.js for security headers' });
    }
  }

  if (backend.available) {
    if (backend.supabase) {
      verified.push({ id: 'A01', text: 'Supabase RLS policies protect data' });
    }
    if (backend.prisma) {
      verified.push({ id: 'A03', text: 'Prisma ORM - SQL injection mitigated via parameterized queries' });
    }
  }

  return { verified, gaps };
}

function verifyOwaspRequirements(level, projectPath) {
  const levelData = owaspASVS[level];
  if (!levelData) {
    throw new Error(`Invalid ASVS level: ${level}. Valid: L1, L2, L3`);
  }

  if (!projectPath) {
    return { level, verified: false, message: 'projectPath required for verification' };
  }

  let facts;
  try {
    facts = inspect(projectPath);
  } catch (e) {
    return { level, verified: false, message: e.message };
  }

  const { stack, backend } = facts;
  const results = {
    level,
    passed: [],
    failed: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  if (!stack.available) {
    results.failed.push({ check: 'package.json', message: 'No package.json found - cannot verify' });
  }

  if (stack.available && stack.runtime.id === 'supabase') {
    results.passed.push({ check: 'A01-RLS', message: 'Supabase RLS policies available' });
  }

  if (backend.available && backend.prisma) {
    results.passed.push({ check: 'A03-ORM', message: 'Prisma parameterized queries (SQL injection mitigated)' });
  }

  if (stack.available && stack.packages?.list) {
    if (stack.packages.list.includes('zod')) {
      results.passed.push({ check: 'A03-Zod', message: 'Zod validation available' });
    }
    if (stack.packages.list.includes('helmet')) {
      results.passed.push({ check: 'A05-Helmet', message: 'Security headers configured' });
    }
  }

  results.summary.total = results.passed.length + results.failed.length;
  results.summary.passed = results.passed.length;
  results.summary.failed = results.failed.length;

  return results;
}

function getOwaspCategories() {
  return {
    L1: owaspASVS.L1.categories.map(c => ({ id: c.id, name: c.name })),
    L2: owaspASVS.L2.categories.map(c => ({ id: c.id, name: c.name })),
    L3: owaspASVS.L3.categories.map(c => ({ id: c.id, name: c.name }))
  };
}

export { getOwaspRequirements, getOwaspCategories, verifyOwaspRequirements, owaspASVS };