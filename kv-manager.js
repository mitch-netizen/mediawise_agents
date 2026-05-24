// kv-manager.js

import { AGENT_CONFIGS } from './agents/index.js';

const AGENT_PREFIX = 'agent:';
const TASK_PREFIX = 'task:';
const LOG_PREFIX = 'log:daily:';

export async function initAgents(env) {
  for (const config of AGENT_CONFIGS) {
    const key = AGENT_PREFIX + config.id;
    if (!(await env.STATE.get(key))) {
      await env.STATE.put(key, JSON.stringify({
        ...config,
        status: "active",
        assigned_tasks: [],
        completed_tasks: [],
        current_task: null,
        last_activity: null,
        blockers: []
      }));
    }
  }
}

export async function getAgent(env, id) {
  const raw = await env.STATE.get(AGENT_PREFIX + id);
  return raw ? JSON.parse(raw) : null;
}
export async function saveAgent(env, agent) {
  await env.STATE.put(AGENT_PREFIX + agent.id, JSON.stringify(agent));
}
export async function listAgents(env) {
  return Promise.all(AGENT_CONFIGS.map(cfg => getAgent(env, cfg.id)));
}

export async function getTask(env, id) {
  const raw = await env.STATE.get(TASK_PREFIX + id);
  return raw ? JSON.parse(raw) : null;
}
export async function saveTask(env, task) {
  await env.STATE.put(TASK_PREFIX + task.id, JSON.stringify(task));
}
export async function listTasks(env) {
  if (!(await env.STATE.get('tasks:list'))) return [];
  const ids = JSON.parse(await env.STATE.get("tasks:list"));
  return Promise.all(ids.map(id => getTask(env, id)));
}
export async function registerTaskId(env, id) {
  let ids = [];
  if (await env.STATE.get("tasks:list")) {
    ids = JSON.parse(await env.STATE.get("tasks:list"));
    if (!ids.includes(id)) ids.push(id);
  } else {
    ids = [id];
  }
  await env.STATE.put("tasks:list", JSON.stringify(ids));
}

export async function logActivity(env, entry) {
  const date = new Date().toISOString().substring(0, 10);
  const key = LOG_PREFIX + date;
  let log = [];
  const raw = await env.STATE.get(key);
  if (raw) log = JSON.parse(raw);
  log.push({ ...entry, timestamp: new Date().toISOString() });
  await env.STATE.put(key, JSON.stringify(log));
}
