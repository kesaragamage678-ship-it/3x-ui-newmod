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
// Confirmed against v3.6.0 source: clients live under a SEPARATE
// /panel/api/clients/ group (not /panel/api/inbounds/), identified by
// EMAIL (not uuid), using the raw model.Client field names (totalGB,
// tgId as a number, etc.) — see internal/database/model/model.go.
function toApiClient(client: Record<string, any>) {
  return {
    id: client.uuid || client.id || '',
    email: client.email,
    flow: client.flow || '',
    limitIp: client.limitIp || 0,
    totalGB: client.totalBytes ? Math.round(client.totalBytes / 1024 ** 3) : 0,
    expiryTime: client.expiryTime || 0,
    enable: client.enable,
    subId: client.subId || '',
    tgId: client.tgId ? Number(client.tgId) || 0 : 0,
  };
}

export async function addClient(inboundId: number, client: Record<string, any>) {
  return rawFetch('panel/api/clients/add', {
    method: 'POST',
    body: JSON.stringify({ client: toApiClient(client), inboundIds: [inboundId] }),
  });
}

export async function updateClient(email: string, inboundId: number, client: Record<string, any>) {
  return rawFetch(`panel/api/clients/update/${encodeURIComponent(email)}?inboundIds=${inboundId}`, {
    method: 'POST',
    body: JSON.stringify(toApiClient(client)),
  });
}

export async function deleteClient(inboundId: number, email: string) {
  return rawFetch(`panel/api/clients/del/${encodeURIComponent(email)}?inboundIds=${inboundId}`, { method: 'POST' });
}

export async function resetClientTraffic(inboundId: number, email: string) {
  return rawFetch(`panel/api/clients/resetTraffic/${encodeURIComponent(email)}`, { method: 'POST' });
}

// ---- Server ---- (confirmed: internal/web/controller/server.go)
export async function getServerStatus() {
  const data = await rawFetch('panel/api/server/status', { method: 'GET' });
  return data.obj;
}

export async function restartXrayService() {
  return rawFetch('panel/api/server/restartXrayService', { method: 'POST' });
}

// ---- Panel Settings (native Telegram bot lives here, NOT in a custom table) ----
// Confirmed against MHSanaei/3x-ui internal/web/controller/setting.go +
// internal/web/entity/entity.go (AllSetting struct):
//   - POST panel/setting/all      -> browser-safe settings view. Secret
//     fields (like tgBotToken) come back BLANK with a `hasTgBotToken`
//     presence flag instead of the real value — the real token never
//     touches the browser.
//   - POST panel/setting/update   -> takes the FULL AllSetting object (not
//     a partial patch). A blank tgBotToken in the payload means "leave the
//     stored token unchanged"; to actually clear it you must also send
//     clearTgBotToken: true.
//   - POST panel/setting/testTgBot -> sends a real Telegram message using
//     whatever is currently SAVED in the DB (save first, then test).
//   - GET  panel/api/backuptotgbot -> packages a DB backup and pushes it to
//     every admin chat ID configured in the saved settings.
export interface AllSettingView {
  tgBotEnable: boolean;
  tgBotToken: string;
  hasTgBotToken?: boolean;
  tgBotChatId: string;
  tgBotAPIServer?: string;
  tgRunTime: string;
  tgCpu: number;
  [key: string]: any;
}

export async function getAllSettings(): Promise<AllSettingView> {
  const data = await rawFetch<AllSettingView>('panel/setting/all', { method: 'POST' });
  return data.obj as AllSettingView;
}

export interface UpdateSettingsExtras {
  twoFactorCode?: string;
  clearTgBotToken?: boolean;
}

// Fetches the current full settings, merges `patch` on top, and submits the
// whole thing back — the update endpoint replaces all fields, so we can't
// send a bare partial or every other setting (webPort, subPath, etc.) would
// be wiped/reset.
export async function updateSettings(
  patch: Partial<AllSettingView>,
  extras: UpdateSettingsExtras = {}
) {
  const current = await getAllSettings();
  const merged = { ...current, ...patch };
  return rawFetch('panel/setting/update', {
    method: 'POST',
    body: JSON.stringify({
      ...merged,
      twoFactorCode: extras.twoFactorCode || '',
      clearTgBotToken: !!extras.clearTgBotToken,
    }),
  });
}

export async function testTelegramBot() {
  return rawFetch('panel/setting/testTgBot', { method: 'POST' });
}

export async function backupToTelegram() {
  return rawFetch('panel/api/backuptotgbot', { method: 'GET' });
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

  const settings = safeParse(raw.settings, { clients: [] });

  // Real 3x-ui client objects use `id` (VLESS/VMess UUID) or `password`
  // (Trojan/Shadowsocks) as the identity field — there's no separate
  // `uuid` field like our UI expects. Traffic usage also isn't on the
  // client object at all; it lives in a parallel `inbound.clientStats`
  // array matched by email.
  const statsByEmail: Record<string, any> = {};
  (raw.clientStats || []).forEach((s: any) => {
    if (s?.email) statsByEmail[s.email] = s;
  });

  const clients = (settings.clients || []).map((c: any) => {
    const identity = c.id || c.password || c.email;
    const stat = statsByEmail[c.email];
    return {
      ...c,
      id: identity,
      uuid: c.id || c.password || '',
      totalBytes: stat?.total ?? (c.totalGB ? c.totalGB * 1024 ** 3 : c.totalBytes ?? 0),
      upBytes: stat?.up ?? c.upBytes ?? 0,
      downBytes: stat?.down ?? c.downBytes ?? 0,
      expiryTime: stat?.expiryTime ?? c.expiryTime ?? 0,
      enable: stat?.enable ?? c.enable ?? true,
    };
  });

  return {
    ...raw,
    settings: { ...settings, clients },
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
