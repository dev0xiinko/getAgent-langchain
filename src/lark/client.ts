import { config, LARK_BASE_URL } from "../config";

/** A raw Bitable record: opaque field bag keyed by the table's column names. */
export interface LarkRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

/** Small fetch helper with an AbortController timeout (mirrors tools/clients.ts). */
async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

/** Tenant access token, cached until ~1 min before expiry. */
export async function getTenantAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  if (!config.lark.appId || !config.lark.appSecret) {
    throw new Error("Lark credentials not configured (LARK_APP_ID / LARK_APP_SECRET)");
  }

  const res = await fetchWithTimeout(
    `${LARK_BASE_URL}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: config.lark.appId, app_secret: config.lark.appSecret }),
    },
    12000,
  );
  const data: any = await res.json();
  if (data.code !== 0) throw new Error(`Lark auth failed: ${data.msg}`);

  cachedToken = data.tenant_access_token as string;
  tokenExpiry = now + (data.expire - 60) * 1000; // refresh 1 min early
  return cachedToken;
}

/**
 * Fetch every record from a Bitable table, following pagination. `body` is the
 * Bitable search payload — pass `{ field_names: [...] }` to scope columns, or a
 * `filter` block to filter server-side; `{}` returns all fields.
 */
export async function searchRecords(
  appToken: string,
  tableId: string,
  body: Record<string, unknown> = {},
): Promise<LarkRecord[]> {
  const token = await getTenantAccessToken();
  const all: LarkRecord[] = [];
  let pageToken: string | null = null;

  do {
    const params = new URLSearchParams({ page_size: "500" });
    if (pageToken) params.set("page_token", pageToken);

    const res = await fetchWithTimeout(
      `${LARK_BASE_URL}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search?${params}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      12000,
    );
    const data: any = await res.json();
    if (data.code !== 0) throw new Error(`Lark query failed (${tableId}): ${data.msg}`);

    all.push(...((data.data?.items as LarkRecord[]) ?? []));
    pageToken = data.data?.has_more ? data.data.page_token : null;
    if (pageToken) await new Promise((r) => setTimeout(r, 100)); // stay within rate limits
  } while (pageToken);

  return all;
}
