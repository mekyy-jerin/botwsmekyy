export function config() {
  let base = String(process.env.PTERODACTYL_URL || "").replace(/\/+$/, "");
  const token = process.env.PTERODACTYL_API_KEY;
  const server = process.env.SERVER_ID;

  // Arqonara's official panel/API hostname is panel.arqonara.com.
  // Accept the older typo automatically so the Vercel env var does not break the bot.
  base = base.replace(/^https:\/\/panel\.argonara\.com$/i, "https://panel.arqonara.com");

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
    console.error("Pterodactyl API error", {
      path,
      status: response.status,
      statusText: response.statusText,
      body: text
    });
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
