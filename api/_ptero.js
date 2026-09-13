export function config() {
  const base = String(process.env.PTERODACTYL_URL || "").replace(/\/+$/, "");
  const token = process.env.PTERODACTYL_API_KEY;
  const server = process.env.SERVER_ID;

  if (!base || !token || !server) {
    throw new Error("Missing PTERODACTYL_URL, PTERODACTYL_API_KEY, or SERVER_ID");
  }
  return { base, token, server };
}

export async function ptero(path, options = {}) {
  const { base, token } = config();
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      Accept: "Application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!response.ok) {
    const details = data?.errors?.map((item) => item.detail).filter(Boolean) || [];
    const message = details.join("; ") || data?.message || text || `HTTP ${response.status}`;
    const error = new Error(`Pterodactyl API ${response.status}: ${message}`);
    error.status = response.status;
    error.responseBody = text;
    throw error;
  }

  return { response, data };
}

export function send(res, status, body) {
  res.status(status).setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
