// task-engine.js
import { getAgent, saveAgent, getTask, saveTask, logActivity, registerTaskId } from './kv-manager.js';
import { AGENT_CONFIGS } from './agents/index.js';

let taskSeed = 0;

export async function assignTasks(env) {
  for (const agentCfg of AGENT_CONFIGS) {
    const agent = await getAgent(env, agentCfg.id);
    if (!agent.current_task) {
      const taskId = `task-${++taskSeed}-${agent.id}`;
      const task = {
        id: taskId,
        assigned_to: agent.id,
        type: "demo_task",
        description: `Demo task for ${agent.name}`,
        status: "in_progress",
        progress: 0,
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: null,
        result: null,
        blocker: null
      };
      await saveTask(env, task);
      await registerTaskId(env, taskId);
      agent.current_task = taskId;
      agent.assigned_tasks.push(taskId);
      await saveAgent(env, agent);
      await logActivity(env, { agent_id: agent.id, action: "assigned_task", task_id: taskId, status: "success" });
    }
  }
}

export async function handleAgentTick(env) {
  for (const agentCfg of AGENT_CONFIGS) {
    const agent = await getAgent(env, agentCfg.id);
    if (agent.current_task) {
      const task = await getTask(env, agent.current_task);
      if (task && task.status === "in_progress") {
        task.progress += 20;
        if (task.progress >= 100) {
          task.progress = 100;
          task.status = "completed";
          task.completed_at = new Date().toISOString();
          task.result = "Completed by agent tick";
          agent.completed_tasks.push(task.id);
          agent.current_task = null;
          await logActivity(env, { agent_id: agent.id, action: "completed_task", task_id: task.id, status: "success" });
        }
        await saveTask(env, task);
        await saveAgent(env, agent);
      }
    }
  }
}
