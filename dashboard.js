// dashboard.js
import { listAgents } from './kv-manager.js';

export async function renderDashboard(env) {
  const agents = await listAgents(env);
  return `
    <html>
    <head>
      <title>MCP Multi-Agent Dashboard</title>
      <meta http-equiv="refresh" content="30" />
      <style>
        body { font-family: sans-serif; background: #f8fafc; padding: 2em; }
        table { background: #fff; border-collapse: collapse; margin: 1em 0; }
        th, td { border: 1px solid #ccc; padding: .5em .7em; }
        th { background: #eee; }
      </style>
    </head>
    <body>
      <h1>MCP Agent Dashboard</h1>
      <table>
        <tr>
          <th>Agent</th>
          <th>Role</th>
          <th>Status</th>
          <th>Current Task</th>
          <th>Completed Tasks</th>
          <th>Last Activity</th>
          <th>Blockers</th>
        </tr>
        ${agents.map(agent => `
        <tr>
          <td>${agent?.name}</td>
          <td>${agent?.role}</td>
          <td>${agent?.status}</td>
          <td>${agent?.current_task ?? ''}</td>
          <td>${(agent?.completed_tasks || []).length}</td>
          <td>${agent?.last_activity?.replace("T", " ").slice(0,19) || ''}</td>
          <td>${agent?.blockers?.join(', ') || ''}</td>
        </tr>
        `).join('')}
      </table>
      <p>Refreshes every 30 seconds.</p>
    </body>
    </html>
  `;
}
