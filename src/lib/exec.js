import { spawn } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify;

export async function execCli(packageName, args, options = {}) {
  const { cwd = process.cwd(), timeout = 5 * 60 * 1000, onStderr = null } = options;

  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['-y', packageName, ...args], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      const line = data.toString();
      if (onStderr) {
        onStderr(line);
      } else {
        stderr += line;
      }
    });

    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timeoutId);

      let stdoutJson = null;
      try {
        stdoutJson = JSON.parse(stdout);
      } catch {
      }

      resolve({
        code,
        stdout,
        stderr,
        stdoutJson
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

export async function execFile(command, args, options = {}) {
  const { cwd = process.cwd(), timeout = 5 * 60 * 1000, env = {} } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timeoutId);

      let stdoutJson = null;
      try {
        stdoutJson = JSON.parse(stdout);
      } catch {
      }

      resolve({
        code,
        stdout,
        stderr,
        stdoutJson
      });
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}