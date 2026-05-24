// agent-orchestrator.js

import { initAgents, listAgents } from './kv-manager.js';
import { assignTasks, handleAgentTick } from './task-engine.js';
import { renderDashboard } from './dashboard.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    await initAgents(env); // idempotent

    if (url.pathname === "/") {
      await assignTasks(env);
      await handleAgentTick(env);
      return new Response("Orchestration tick complete.", { status: 200 });
    }
    if (url.pathname === "/agents") {
      const agents = await listAgents(env);
      return new Response(JSON.stringify(agents), { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname === "/dashboard") {
      const html = await renderDashboard(env);
      return new Response(html, { headers: { 'content-type': 'text/html' } });
    }
    return new Response("Not found", { status: 404 });
  }
};
