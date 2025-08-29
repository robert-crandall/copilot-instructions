#!/usr/bin/env node
/**
 * Multi-service Dev Controller (devctl)
 *
 * Adapted for this monorepo (backend = Bun Hono API, frontend = Vite/SvelteKit).
 * Provides a single entrypoint to start/stop/restart services in the background
 * so interactive terminals remain available to Copilot / the developer.
 *
 * Features:
 *  - Start one or both services (backend, frontend) in detached/background mode
 *  - Stop them gracefully (SIGTERM -> SIGKILL fallback)
 *  - Run backend DB migrations automatically (optional flag)
 *  - Status JSON (per service + aggregate) with pids, ports, uptime, log paths
 *  - Tail recent logs (combined or per service)
 *  - Restart convenience
 *  - Minimal dependencies (Node core only; Bun/vite executed via existing scripts)
 *
 * Commands:
 *  node scripts/devctl.mjs start [--backend] [--frontend] [--force]
 *  node scripts/devctl.mjs stop  [--backend] [--frontend]
 *  node scripts/devctl.mjs restart [...same flags as start]
 *  node scripts/devctl.mjs status [--json]
 *  node scripts/devctl.mjs logs [--backend|--frontend] [--lines 100]
 *
 * Defaults:
 *  - start with neither --backend nor --frontend => starts both
 *  - stop with neither => stops both
 *  - logs with neither => combined interleaved (simple merge by timestamp)
 *
 * Environment Variables:
 *  BACKEND_PORT (default 3000)  FRONTEND_PORT (default 5173)
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { openSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';

// Early debug to verify execution path (can be removed later)
if (process.env.DEVCTL_DEBUG_ECHO === '1') {
  console.log('[devctl-debug] argv=', process.argv.join(' '));
}

const exec = promisify(_exec);

const CONFIG = {
  host: process.env.HOST || 'localhost',
  backendPort: parseInt(process.env.BACKEND_PORT || '3000', 10),
  frontendPort: parseInt(process.env.FRONTEND_PORT || '5173', 10),
  logsDir: '.logs/devctl',
  backend: {
    name: 'backend',
    pidFile: '.devctl-backend.pid',
    logFile: 'backend.log',
    cwd: 'backend',
    startCmd: ['bun', 'run', 'dev'], // uses package script
    healthUrl: () => `http://${process.env.HOST || 'localhost'}:${process.env.BACKEND_PORT || '3000'}/api/health`,
  },
  frontend: {
    name: 'frontend',
    pidFile: '.devctl-frontend.pid',
    logFile: 'frontend.log',
    cwd: 'frontend',
    startCmd: ['bun', 'run', 'dev'],
    healthUrl: () => `http://${process.env.HOST || 'localhost'}:${process.env.FRONTEND_PORT || '5173'}`,
  },
};

function fullLogPath(svc) {
  return join(CONFIG.logsDir, svc.logFile);
}

function ensureLogsDir() {
  if (!existsSync(CONFIG.logsDir)) mkdirSync(CONFIG.logsDir, { recursive: true });
}

function log(msg, level = 'info') {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase()}] ${msg}\n`;
  ensureLogsDir();
  try {
    appendFileSync(join(CONFIG.logsDir, 'devctl.log'), line);
  } catch {}
  const colors = { info: '\x1b[36m', success: '\x1b[32m', warning: '\x1b[33m', error: '\x1b[31m', reset: '\x1b[0m' };
  const color = colors[level] || colors.info;
  process.stdout.write(`${color}${ts} [devctl] ${msg}${colors.reset}\n`);
}

async function killProcessOnPort(port, serviceName = 'unknown') {
  log(`Force mode: Checking for process on port ${port} for service ${serviceName}...`);
  try {
    const { stdout } = await exec(`lsof -ti tcp:${port}`);
    const pid = stdout.trim();
    if (pid) {
      log(`Found process ${pid} on port ${port}. Terminating...`, 'warning');
      await exec(`kill -9 ${pid}`);
      log(`Process ${pid} terminated.`, 'success');
      // Give the OS a moment to release the port
      await new Promise((r) => setTimeout(r, 250));
    } else {
      log(`No process found on port ${port}.`);
    }
  } catch (error) {
    // `lsof` exits with status 1 if no process is found, which is not an error for us.
    if (error.code === 1 && error.stdout === '' && error.stderr === '') {
      log(`No process found on port ${port}.`);
      return;
    }
    log(`Error trying to kill process on port ${port}: ${error.message}`, 'error');
  }
}

async function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readPidFile(pidFile) {
  if (!existsSync(pidFile)) return undefined;
  const raw = readFileSync(pidFile, 'utf8').trim();
  const pid = parseInt(raw, 10);
  return Number.isNaN(pid) ? undefined : pid;
}

async function serviceStatus(svc, port) {
  const pid = readPidFile(svc.pidFile);
  if (!pid || !(await isProcessRunning(pid))) return { name: svc.name, running: false };
  let uptime;
  try {
    const { stdout } = await exec(`ps -o etime= -p ${pid}`);
    uptime = stdout.trim();
  } catch {}
  return {
    name: svc.name,
    running: true,
    pid,
    port,
    url: `http://${CONFIG.host}:${port}`,
    logFile: fullLogPath(svc),
    uptime,
  };
}

async function status() {
  const backend = await serviceStatus(CONFIG.backend, CONFIG.backendPort);
  const frontend = await serviceStatus(CONFIG.frontend, CONFIG.frontendPort);
  return {
    running: backend.running || frontend.running,
    host: CONFIG.host,
    backend,
    frontend,
  };
}

async function startService(svc, port, extraEnv = {}) {
  // If already running, skip
  const st = await serviceStatus(svc, port);
  if (st.running) {
    log(`${svc.name} already running (PID ${st.pid})`);
    return st;
  }
  ensureLogsDir();
  const logPath = fullLogPath(svc);
  writeFileSync(logPath, ''); // truncate
  const outFd = openSync(logPath, 'a');
  const errFd = openSync(logPath, 'a');
  log(`Starting ${svc.name} on port ${port}...`);
  const child = spawn(svc.startCmd[0], svc.startCmd.slice(1), {
    cwd: svc.cwd,
    env: { ...process.env, PORT: String(port), BACKEND_PORT: String(CONFIG.backendPort), FRONTEND_PORT: String(CONFIG.frontendPort), ...extraEnv },
    detached: true,
    stdio: ['ignore', outFd, errFd],
  });
  closeSync(outFd);
  closeSync(errFd);
  if (!child.pid) throw new Error(`Failed to spawn ${svc.name}`);
  writeFileSync(svc.pidFile, String(child.pid));
  child.unref();
  // readiness poll
  const url = svc.healthUrl();
  const deadline = Date.now() + 15000;
  async function poll() {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(t);
      if (res.ok) return true;
    } catch {}
    return false;
  }
  while (Date.now() < deadline) {
    /* eslint-disable no-await-in-loop */
    if (await poll()) {
      log(`${svc.name} ready: ${url}`, 'success');
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return serviceStatus(svc, port);
}

async function runMigrations() {
  log('Running backend migrations (drizzle-kit migrate)...');
  try {
    const { stdout, stderr } = await exec('bun run db:migrate', { cwd: 'backend' });
    if (stdout)
      stdout
        .split(/\n/)
        .filter(Boolean)
        .forEach((l) => log(`[migrate] ${l}`));
    if (stderr)
      stderr
        .split(/\n/)
        .filter(Boolean)
        .forEach((l) => log(`[migrate-err] ${l}`, 'warning'));
    log('Migrations completed', 'success');
  } catch (e) {
    log(`Migration failed: ${e.message}`, 'error');
    throw e;
  }
}

async function start(opts) {
  const targets = [];
  if (opts.backend) targets.push('backend');
  if (opts.frontend) targets.push('frontend');
  if (targets.length === 0) targets.push('backend', 'frontend');

  if (opts.force) {
    log('Force flag is set. Killing any existing processes on target ports.', 'warning');
    for (const t of targets) {
      const port = t === 'backend' ? CONFIG.backendPort : CONFIG.frontendPort;
      // eslint-disable-next-line no-await-in-loop
      await killProcessOnPort(port, t);
    }
  }

  await runMigrations();

  const results = {};
  for (const t of targets) {
    // sequential to keep logs cleaner
    /* eslint-disable no-await-in-loop */
    const svc = CONFIG[t];
    results[t] = await startService(svc, t === 'backend' ? CONFIG.backendPort : CONFIG.frontendPort);
  }
  return status();
}

function stopService(svc) {
  const pid = readPidFile(svc.pidFile);
  if (!pid) return { name: svc.name, stopped: false, reason: 'not-running' };
  log(`Stopping ${svc.name} (PID ${pid})`);
  try {
    process.kill(pid, 'SIGTERM');
  } catch (e) {
    if (e.code !== 'ESRCH') throw e;
  }
  const deadline = Date.now() + 4000;
  return new Promise((resolve) => {
    (async function waitLoop() {
      if ((await isProcessRunning(pid)) && Date.now() < deadline) {
        setTimeout(waitLoop, 200);
        return;
      }
      if (await isProcessRunning(pid)) {
        log(`${svc.name} still running, sending SIGKILL`, 'warning');
        try {
          process.kill(pid, 'SIGKILL');
        } catch {}
      }
      try {
        unlinkSync(svc.pidFile);
      } catch {}
      resolve({ name: svc.name, stopped: true });
    })();
  });
}

async function stop(opts) {
  const targets = [];
  if (opts.backend) targets.push('backend');
  if (opts.frontend) targets.push('frontend');
  if (targets.length === 0) targets.push('backend', 'frontend');
  const results = {};
  await Promise.all(
    targets.map(async (t) => {
      results[t] = await stopService(CONFIG[t]);
    }),
  );
  return status();
}

function tailFile(path, lines) {
  if (!existsSync(path)) return [];
  const data = readFileSync(path, 'utf8').trim().split(/\n/);
  return lines && data.length > lines ? data.slice(-lines) : data;
}

async function showLogs(opts) {
  ensureLogsDir();
  const lines = opts.lines || 50;
  const selected = [];
  if (opts.backend) selected.push({ name: 'backend', lines: tailFile(fullLogPath(CONFIG.backend), lines) });
  if (opts.frontend) selected.push({ name: 'frontend', lines: tailFile(fullLogPath(CONFIG.frontend), lines) });
  if (selected.length === 0) {
    // combined
    const b = tailFile(fullLogPath(CONFIG.backend), lines).map((l) => ({ svc: 'backend', l }));
    const f = tailFile(fullLogPath(CONFIG.frontend), lines).map((l) => ({ svc: 'frontend', l }));
    const merged = [...b, ...f];
    merged.sort((a, b) => a.l.localeCompare(b.l));
    merged.forEach((r) => console.log(`[${r.svc}] ${r.l}`));
    return;
  }
  for (const s of selected) {
    console.log(`\n===== ${s.name} =====`);
    s.lines.forEach((l) => console.log(l));
  }
}

async function restart(opts) {
  await stop(opts);
  return start(opts);
}

async function main() {
  const cmd = process.argv[2];
  const argv = process.argv.slice(3);
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const flag = (f) => flags.has(f);
  function getFlagValue(name, def) {
    const idx = argv.findIndex((a) => a === name);
    if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1];
    return def;
  }
  const opts = {
    backend: flag('--backend'),
    frontend: flag('--frontend'),
    force: flag('--force'),
    lines: parseInt(getFlagValue('--lines', '50'), 10) || 50,
    json: flag('--json'),
  };
  // Basic debug output to confirm main executes when no output is observed
  if (!cmd) {
    log('No command provided; showing help', 'warning');
  }
  switch (cmd) {
    case 'start': {
      const s = await start(opts);
      console.log(JSON.stringify({ action: 'start', ...s }, null, 2));
      break;
    }
    case 'stop': {
      const s = await stop(opts);
      console.log(JSON.stringify({ action: 'stop', ...s }, null, 2));
      break;
    }
    case 'restart': {
      const s = await restart(opts);
      console.log(JSON.stringify({ action: 'restart', ...s }, null, 2));
      break;
    }
    case 'status': {
      const s = await status();
      if (opts.json) console.log(JSON.stringify(s, null, 2));
      else {
        console.log(
          `Dev Status:\n  backend: ${s.backend.running ? 'RUNNING' : 'stopped'}${s.backend.running ? ' pid=' + s.backend.pid : ''}\n  frontend: ${s.frontend.running ? 'RUNNING' : 'stopped'}${s.frontend.running ? ' pid=' + s.frontend.pid : ''}`,
        );
      }
      break;
    }
    case 'logs': {
      await showLogs(opts);
      break;
    }
    default: {
      console.log(
        `\nUsage: node scripts/devctl.mjs <command> [flags]\n\nCommands:\n  start            Start services (default both)\n  stop             Stop services\n  restart          Restart services\n  status           Show status (use --json for JSON)\n  logs             Show recent logs (combined unless filtered)\n\nFlags:\n  --backend        Limit action to backend service\n  --frontend       Limit action to frontend service\n  --migrate        Run backend migrations before start\n  --force          Kill any process on the required port(s) before starting\n  --lines <n>      Lines to show for logs (default 50)\n  --json           JSON output for status\n\nExamples:\n  node scripts/devctl.mjs start --migrate\n  node scripts/devctl.mjs start --backend --force\n  node scripts/devctl.mjs logs --backend --lines 100\n  node scripts/devctl.mjs status --json\n`,
      );
      process.exit(1);
    }
  }
}

// Determine if this module is the entrypoint (Node doesn't provide import.meta.main like Deno)
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (process.env.DEVCTL_DEBUG_ECHO === '1') {
  console.log('[devctl-debug] isMain=', isMain, 'argv[1]=', process.argv[1], 'self=', fileURLToPath(import.meta.url));
}
if (isMain)
  main().catch((err) => {
    log(`Error: ${err.message}`, 'error');
    process.exit(1);
  });
