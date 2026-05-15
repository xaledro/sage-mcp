import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function detectAiUsage(cwd, options = {}) {
  const maxFiles = options.maxFiles || 200;

  const aiSdks = [
    'openai', '@openai', 'openai-api',
    'anthropic', '@anthropic-ai/sdk',
    'google-generativeai', '@google/generative-ai',
    'langchain', '@langchain/core',
    'ai', '@ai-sdk/react', '@ai-sdk/vue', '@ai-sdk/solid',
    '@vercel/ai', 'ai-sdk',
    'cohere', '@cohere-ai/sdk',
    'togetherai'
  ];

  const aiFeatures = [
    { pattern: /tool_use|tools\[|getTools/, feature: 'tool-calling' },
    { pattern: /streamText|streamResponse|stream/, feature: 'streaming' },
    { pattern: /systemPrompt|system_prompt|systemprompt/i, feature: 'system-prompts' },
    { pattern: /agent|Agent/i, feature: 'agents' },
    { pattern: /chatcompletion|createChatCompletion|chat/, feature: 'chat' },
    { pattern: /embeddings|createEmbedding/, feature: 'embeddings' }
  ];

  const pkgPath = join(cwd, 'package.json');
  let pkgDeps = [];

  if (existsSync(pkgPath)) {
    try {
      const content = readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      pkgDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    } catch {
    }
  }

  const detectedSdks = aiSdks.filter(sdk => pkgDeps.includes(sdk));

  if (detectedSdks.length === 0) {
    const codeFiles = scanForAiCode(cwd, maxFiles);
    if (codeFiles.length > 0) {
      return {
        available: true,
        detected: true,
        sdks: [],
        files: codeFiles,
        features: ['detected-via-code'],
        source: 'code-scan'
      };
    }

    return {
      available: false,
      detected: false,
      reason: 'No AI SDKs or AI usage patterns detected',
      sdks: [],
      files: [],
      features: []
    };
  }

  const files = scanForAiCode(cwd, maxFiles);
  const features = detectFeatures(cwd, maxFiles);

  return {
    available: true,
    detected: true,
    sdks: detectedSdks,
    files: files.slice(0, 20),
    features,
    source: 'package-json'
  };
}

function scanForAiCode(cwd, maxFiles) {
  const files = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  function scan(dir) {
    if (files.length >= maxFiles) return;

    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (files.length >= maxFiles) return;

        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile()) {
          const ext = '.' + entry.name.split('.').pop();
          if (extensions.includes(ext)) {
            try {
              const content = readFileSync(fullPath, 'utf-8');
              if (content.includes('openai') || content.includes('anthropic') ||
                  content.includes('AI_PROMPT') || content.includes('langchain')) {
                files.push(fullPath.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, ''));
              }
            } catch {
            }
          }
        }
      }
    } catch {
    }
  }

  scan(cwd);
  return files;
}

function detectFeatures(cwd, maxFiles) {
  const features = [];
  const aiPatterns = [
    [/tool_use|getTools|tool\s*\(/, 'tool-calling'],
    [/streamText|streamResponse|createStream/, 'streaming'],
    [/systemPrompt|system_prompt/i, 'system-prompts'],
    [/createChatCompletion|chatCompletion/, 'chat'],
    [/createEmbedding|embeddings/, 'embeddings']
  ];

  function scan(dir, depth = 0) {
    if (depth > 3 || features.length >= 5) return;

    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (features.length >= 5) return;

        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath, depth + 1);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          try {
            const content = readFileSync(fullPath, 'utf-8').slice(0, 10000);
            for (const [pattern, feature] of aiPatterns) {
              if (pattern.test(content) && !features.includes(feature)) {
                features.push(feature);
              }
            }
          } catch {
          }
        }
      }
    } catch {
    }
  }

  scan(join(cwd, 'src'));
  return features;
}