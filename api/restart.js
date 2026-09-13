import { config, ptero, send } from "./_ptero.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

  try {
    const { server } = config();
    await ptero(`/api/client/servers/${server}/power`, {
      method: "POST",
      body: JSON.stringify({ signal: "restart" })
    });
    send(res, 200, { ok: true, action: "restart" });
  } catch (error) {
    send(res, error.status || 500, { error: error.message });
  }
}
