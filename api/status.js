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
      running: state === "running",
      connected: state === "running",
      state,
      uptime: 0,
      stats: {
        messages: 0,
        commands: 0,
        groups: 0
      },
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
    send(res, error.status || 500, { error: error.message });
  }
}
