import { config, ptero, send } from "./_ptero.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });

  try {
    const { server } = config();
    const { data } = await ptero(`/api/client/servers/${server}/resources`);

    const attrs = data?.attributes || {};
    const r = attrs?.resources || {};
    const state = attrs?.current_state || "unknown";

    send(res, 200, {
      ok: true,
      running: state === "running",
      connected: state === "running",
      state,
      uptime: 0,
      stats: { messages: 0, commands: 0, groups: 0 },
      resources: {
        cpu: Number(r.cpu_absolute || 0),
        memory: Number(r.memory_bytes || 0),
        memoryLimit: Number(r.memory_limit_bytes || 0),
        disk: Number(r.disk_bytes || 0),
        networkRx: Number(r.network_rx_bytes || 0),
        networkTx: Number(r.network_tx_bytes || 0)
      }
    });
  } catch (error) {
    // Keep this diagnostic response at 200 temporarily so the browser can display
    // the upstream Pterodactyl error instead of hiding it behind Vercel's 500 page.
    send(res, 200, {
      ok: false,
      diagnostic: true,
      error: error.message || "Unknown Pterodactyl API error",
      upstreamStatus: error.status || null
    });
  }
}
