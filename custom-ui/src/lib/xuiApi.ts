// Real 3x-ui REST API client — built for NATIVE EMBEDDING.
//
// This version assumes the built React app is served directly by the 3x-ui
// Go binary itself (internal/web/dist/), NOT via a separate Nginx proxy.
// Confirmed against MHSanaei/3x-ui v3.6.0 source:
//   - Go injects `window.X_UI_BASE_PATH` + <meta name="csrf-token"> +
//     <meta name="base-path"> into every served HTML page's <head>.
//   - All API calls must be relative to that base path (it's a random
//     per-install path like /YQgWnJRukAuUgXEzrL/, not fixed).
//   - Every unsafe (POST/PUT/DELETE) request needs an `X-CSRF-Token` header
//     matching the session's token, or it gets a 403.
//   - Session cookie is native/browser-managed (credentials: 'include').

declare global {
  interface Window {
    X_UI_BASE_PATH?: string;
    X_UI_CUR_VER?: string;
    X_UI_DB_TYPE?: string;
  }
}

export function getBasePath(): string {
  if (typeof window !== 'undefined' && window.X_UI_BASE_PATH) {
    return window.X_UI_BASE_PATH;
  }
  const meta = document.querySelector('meta[name="base-path"]');
  const fromMeta = meta?.getAttribute('content');
  return fromMeta || '/';
}

// Go only injects X_UI_CUR_VER on non-login pages (see dist.go) — use that
// to tell whether this load is the logged-out login shell or panel shell.
export function isPanelContext(): boolean {
  return typeof window !== 'undefined' && !!window.X_UI_CUR_VER;
}

export class XuiApiError extends Error {
  code: 'UNAUTHORIZED' | 'FORBIDDEN_CSRF' | 'API_ERROR' | 'NETWORK_ERROR';
  constructor(code: XuiApiError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'XuiApiError';
  }
}

interface XuiRawResponse<T = any> {
  success: boolean;
  msg: string;
  obj: T;
}

let csrfToken: string | null = null;

function readCsrfFromMeta(): string | null {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute('content') || null;
}

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const fromMeta = readCsrfFromMeta();
  if (fromMeta) {
    csrfToken = fromMeta;
    return csrfToken;
  }
  const path = isPanelContext() ? 'panel/csrf-token' : 'csrf-token';
  const data = await rawFetch(path, { method: 'GET' }, false);
  csrfToken = data.obj as string;
  return csrfToken;
}

async function rawFetch<T = any>(
  path: string,
  options: RequestInit = {},
  attachCsrf = true
): Promise<XuiRawResponse<T>> {
  const base = getBasePath();
  const url = `${base}${path}`.replace(/([^:]\/)\/+/g, '$1');

  const method = (options.method || 'GET').toUpperCase();
  const isUnsafe = method !== 'GET' && method !== 'HEAD';

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (isUnsafe && attachCsrf) {
    headers['X-CSRF-Token'] = await ensureCsrfToken();
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, credentials: 'include', headers });
  } catch {
    throw new XuiApiError('NETWORK_ERROR', 'Could not reach the 3x-ui server.');
  }

  if (res.status === 401) {
    csrfToken = null;
    throw new XuiApiError('UNAUTHORIZED', 'Session expired. Please log in again.');
  }
  if (res.status === 403) {
    csrfToken = null;
    throw new XuiApiError('FORBIDDEN_CSRF', 'Request rejected (invalid session token). Please retry.');
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    throw new XuiApiError('API_ERROR', data?.msg || `Request failed (HTTP ${res.status})`);
  }
  // 3x-ui returns HTTP 200 even for logical failures (e.g. wrong password) —
  // always check the `success` flag, not just res.ok.
  if (data && data.success === false) {
    throw new XuiApiError('API_ERROR', data.msg || 'Request failed.');
  }
  return data ?? { success: true, msg: '', obj: null };
}

export function reloadToLogin() {
  window.location.href = getBasePath();
}

// ---- Auth ----
export async function login(username: string, password: string, twoFactorCode = '') {
  return rawFetch('login', {
    method: 'POST',
    body: JSON.stringify({ username, password, twoFactorCode }),
  });
}

export async function logout() {
  return rawFetch('logout', { method: 'POST' });
}

// ---- Inbounds ----
export async function listInbounds() {
  const data = await rawFetch<any[]>('panel/api/inbounds/list', { method: 'GET' });
  return data.obj || [];
}

export async function addInbound(payload: Record<string, any>) {
  return rawFetch('panel/api/inbounds/add', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateInbound(id: number, payload: Record<string, any>) {
  return rawFetch(`panel/api/inbounds/update/${id}`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function deleteInbound(id: number) {
  return rawFetch(`panel/api/inbounds/del/${id}`, { method: 'POST' });
}

// ---- Clients ----
export async function addClient(inboundId: number, client: Record<string, any>) {
  return rawFetch('panel/api/inbounds/addClient', {
    method: 'POST',
    body: JSON.stringify({ id: inboundId, settings: JSON.stringify({ clients: [client] }) }),
  });
}

export async function updateClient(clientId: string, inboundId: number, client: Record<string, any>) {
  return rawFetch(`panel/api/inbounds/updateClient/${clientId}`, {
    method: 'POST',
    body: JSON.stringify({ id: inboundId, settings: JSON.stringify({ clients: [client] }) }),
  });
}

export async function deleteClient(inboundId: number, clientId: string) {
  return rawFetch(`panel/api/inbounds/${inboundId}/delClient/${clientId}`, { method: 'POST' });
}

export async function resetClientTraffic(inboundId: number, email: string) {
  return rawFetch(`panel/api/inbounds/${inboundId}/resetClientTraffic/${encodeURIComponent(email)}`, {
    method: 'POST',
  });
}

// ---- Server ---- (confirmed: internal/web/controller/server.go)
export async function getServerStatus() {
  const data = await rawFetch('panel/api/server/status', { method: 'GET' });
  return data.obj;
}

export async function restartXrayService() {
  return rawFetch('panel/api/server/restartXrayService', { method: 'POST' });
}

// ---- Helpers: API <-> app-typed Inbound conversion (settings/streamSettings
// /sniffing are stringified JSON over the wire) ----
export function parseInboundFromApi(raw: any) {
  const safeParse = (v: any, fallback: any) => {
    if (v == null) return fallback;
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  };
  return {
    ...raw,
    settings: safeParse(raw.settings, { clients: [] }),
    streamSettings: safeParse(raw.streamSettings, { network: 'tcp', security: 'none' }),
    sniffing: safeParse(raw.sniffing, undefined),
  };
}

export function serializeInboundForApi(inbound: any) {
  return {
    ...inbound,
    settings: JSON.stringify(inbound.settings || { clients: [] }),
    streamSettings: JSON.stringify(inbound.streamSettings || {}),
    sniffing: inbound.sniffing ? JSON.stringify(inbound.sniffing) : JSON.stringify({ enabled: false, destOverride: [] }),
  };
}
