import { Inbound, SystemStats, ThemeConfig, ApiServerConfig, TelegramBotConfig, PanelSettings, BackupRecord } from '../types';

export const initialTelegramBotConfig: TelegramBotConfig = {
  enabled: true,
  botToken: '7829104812:AAH9xKzL2m_P3oR1vQ5wU8yT4nE7sJ2mQ9k',
  chatId: '10928374',
  backupCron: 'daily',
  notifyOnRestart: true,
  notifyOnLogin: true,
  notifyOnExpiration: true,
  notifyOnTrafficLimit: true,
  notifyOnCpuAlert: true,
  cpuThreshold: 85,
  lastBackupTime: new Date(Date.now() - 3600000 * 4).toISOString(),
  lastBackupStatus: 'success',
};

export const initialPanelSettings: PanelSettings = {
  port: 2053,
  webBasePath: '/xui/',
  sslEnabled: true,
  certPath: '/etc/letsencrypt/live/vpn.example.com/fullchain.pem',
  keyPath: '/etc/letsencrypt/live/vpn.example.com/privkey.pem',
  username: 'admin_3xui',
  subPort: 2096,
  subPath: '/sub/',
  subDomain: 'sub.example.com',
  subEnable: true,
  subEncrypt: true,
  sessionTimeoutMinutes: 60,
  maxLoginFailures: 5,
  ipWhitelist: '',
  xuiVersion: 'v2.4.8 (Latest)',
};

export const initialBackups: BackupRecord[] = [
  {
    id: 'bk_101',
    filename: 'x-ui-backup-2026-08-02-0000.db',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    sizeBytes: 1048576 * 2.4, // 2.4 MB
    inboundsCount: 4,
    clientsCount: 8,
    type: 'auto_telegram',
    status: 'sent_to_telegram',
  },
  {
    id: 'bk_100',
    filename: 'x-ui-backup-2026-08-01-0000.db',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    sizeBytes: 1048576 * 2.3,
    inboundsCount: 4,
    clientsCount: 7,
    type: 'auto_telegram',
    status: 'sent_to_telegram',
  },
  {
    id: 'bk_099',
    filename: '3xui_manual_config_export.json',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    sizeBytes: 45056,
    inboundsCount: 4,
    clientsCount: 6,
    type: 'json',
    status: 'completed',
  },
];


export const initialSystemStats: SystemStats = {
  cpu: 18.4,
  memoryUsed: 1420 * 1024 * 1024, // 1.42 GB
  memoryTotal: 4096 * 1024 * 1024, // 4 GB
  diskUsed: 12.8 * 1024 * 1024 * 1024, // 12.8 GB
  diskTotal: 60 * 1024 * 1024 * 1024, // 60 GB
  swapUsed: 128 * 1024 * 1024,
  swapTotal: 1024 * 1024 * 1024,
  netTrafficUp: 458.2 * 1024 * 1024 * 1024, // 458.2 GB
  netTrafficDown: 892.6 * 1024 * 1024 * 1024, // 892.6 GB
  netSpeedUp: 1.8 * 1024 * 1024, // 1.8 MB/s
  netSpeedDown: 6.4 * 1024 * 1024, // 6.4 MB/s
  xrayState: 'running',
  xrayVersion: 'v1.8.24',
  uptimeSeconds: 842910, // ~9.7 days
  ipAddress: '159.65.132.88',
};

export const initialInbounds: Inbound[] = [
  {
    id: 1,
    user_id: 1,
    up: 124 * 1024 * 1024 * 1024,
    down: 312 * 1024 * 1024 * 1024,
    total: 1000 * 1024 * 1024 * 1024, // 1 TB quota
    remark: '⚡ US-East VLESS Reality Vision',
    enable: true,
    expiryTime: 0,
    listen: '',
    port: 443,
    protocol: 'vless',
    tag: 'inbound-443',
    settings: {
      decryption: 'none',
      clients: [
        {
          id: 'c101',
          email: 'alex_vip@3xui.net',
          uuid: '9f82d1a3-48e2-4b31-a890-7299a9b1c201',
          flow: 'xtls-rprx-vision',
          limitIp: 3,
          totalBytes: 250 * 1024 * 1024 * 1024,
          upBytes: 18 * 1024 * 1024 * 1024,
          downBytes: 64 * 1024 * 1024 * 1024,
          expiryTime: Date.now() + 25 * 24 * 60 * 60 * 1000,
          enable: true,
          subId: 'sub_alex_82931',
          tgId: '10928374',
        },
        {
          id: 'c102',
          email: 'sara_mobile@3xui.net',
          uuid: 'a471f28b-9103-4e2a-b731-89332211aa02',
          flow: 'xtls-rprx-vision',
          limitIp: 2,
          totalBytes: 100 * 1024 * 1024 * 1024,
          upBytes: 8 * 1024 * 1024 * 1024,
          downBytes: 32 * 1024 * 1024 * 1024,
          expiryTime: Date.now() + 12 * 24 * 60 * 60 * 1000,
          enable: true,
          subId: 'sub_sara_91823',
        },
        {
          id: 'c103',
          email: 'dev_test@3xui.net',
          uuid: 'e1122334-5566-7788-9900-aabbccddeeff',
          flow: 'xtls-rprx-vision',
          limitIp: 1,
          totalBytes: 50 * 1024 * 1024 * 1024,
          upBytes: 42 * 1024 * 1024 * 1024,
          downBytes: 8 * 1024 * 1024 * 1024,
          expiryTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // expired
          enable: false,
          subId: 'sub_dev_00011',
        },
      ],
    },
    streamSettings: {
      network: 'tcp',
      security: 'reality',
      realitySettings: {
        show: false,
        dest: 'itunes.apple.com:443',
        serverNames: ['itunes.apple.com', 'swdist.apple.com'],
        privateKey: 'eL9...privateKey...sampleKeyXYZ',
        publicKey: '6f_a9Xk2L3M0_pQv7W8z1rT4uI9oE2yU4iO',
        shortIds: ['6b1109a2', 'd402'],
        maxTimeDiff: 60000,
      },
    },
    sniffing: {
      enabled: true,
      destOverride: ['http', 'tls', 'quic'],
    },
  },
  {
    id: 2,
    user_id: 1,
    up: 89 * 1024 * 1024 * 1024,
    down: 210 * 1024 * 1024 * 1024,
    total: 0, // unlimited
    remark: '🚀 EU-Fast VMess WebSocket CDN',
    enable: true,
    expiryTime: 0,
    listen: '',
    port: 8080,
    protocol: 'vmess',
    tag: 'inbound-8080',
    settings: {
      clients: [
        {
          id: 'c201',
          email: 'gamer_pro@3xui.net',
          uuid: 'b281f912-39e1-4c10-9922-817263541100',
          limitIp: 5,
          totalBytes: 0,
          upBytes: 35 * 1024 * 1024 * 1024,
          downBytes: 120 * 1024 * 1024 * 1024,
          expiryTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
          enable: true,
          subId: 'sub_gamer_77212',
        },
      ],
    },
    streamSettings: {
      network: 'ws',
      security: 'none',
      wsSettings: {
        path: '/vmess-ws-cdn',
        headers: {
          Host: 'cdn.myfastnode.net',
        },
      },
    },
  },
  {
    id: 3,
    user_id: 1,
    up: 45 * 1024 * 1024 * 1024,
    down: 180 * 1024 * 1024 * 1024,
    total: 500 * 1024 * 1024 * 1024,
    remark: '🛡️ SG Trojan gRPC Encrypted',
    enable: true,
    expiryTime: 0,
    listen: '',
    port: 2096,
    protocol: 'trojan',
    tag: 'inbound-2096',
    settings: {
      clients: [
        {
          id: 'c301',
          email: 'streamer_x@3xui.net',
          uuid: 'tr_pass_9921_secret_key',
          limitIp: 2,
          totalBytes: 200 * 1024 * 1024 * 1024,
          upBytes: 15 * 1024 * 1024 * 1024,
          downBytes: 85 * 1024 * 1024 * 1024,
          expiryTime: Date.now() + 40 * 24 * 60 * 60 * 1000,
          enable: true,
          subId: 'sub_trojan_88291',
        },
      ],
    },
    streamSettings: {
      network: 'grpc',
      security: 'tls',
      grpcSettings: {
        serviceName: 'trojan-grpc-service',
      },
    },
  },
  {
    id: 4,
    user_id: 1,
    up: 12 * 1024 * 1024 * 1024,
    down: 48 * 1024 * 1024 * 1024,
    total: 0,
    remark: '🔒 Shadowsocks 2022-blake3',
    enable: true,
    expiryTime: 0,
    listen: '',
    port: 8388,
    protocol: 'shadowsocks',
    tag: 'inbound-8388',
    settings: {
      decryption: '2022-blake3-aes-128-gcm',
      clients: [
        {
          id: 'c401',
          email: 'shadow_user@3xui.net',
          uuid: 'ss_key_8899001122334455',
          limitIp: 0,
          totalBytes: 0,
          upBytes: 2 * 1024 * 1024 * 1024,
          downBytes: 12 * 1024 * 1024 * 1024,
          expiryTime: 0,
          enable: true,
          subId: 'sub_shadow_11223',
        },
      ],
    },
    streamSettings: {
      network: 'tcp',
      security: 'none',
    },
  },
];

export const themePresets: ThemeConfig[] = [
  {
    presetName: 'Cyberpunk Neon Glass',
    primaryColor: '#00f2fe',
    secondaryColor: '#4facfe',
    accentColor: '#f39c12',
    bgColor: '#0a0d14',
    cardBg: 'rgba(15, 23, 42, 0.75)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    textColor: '#f8fafc',
    borderRadius: '16px',
    glassmorphism: true,
    blurIntensity: 16,
    customLogoUrl: '',
    panelTitle: '3x-ui Cyber Core',
    fontFamily: 'Inter, system-ui, sans-serif',
    customCss: `/* 3x-ui Cyberpunk Custom CSS */
.xui-layout { background: radial-gradient(circle at top right, #0f172a 0%, #0a0d14 100%) !important; }
.ant-card, .xui-card { background: rgba(15, 23, 42, 0.75) !important; backdrop-filter: blur(16px); border: 1px solid rgba(56, 189, 248, 0.2) !important; border-radius: 16px !important; box-shadow: 0 10px 30px rgba(0,242,254,0.08) !important; }
.ant-btn-primary { background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%) !important; border: none !important; color: #000 !important; font-weight: 700 !important; box-shadow: 0 0 15px rgba(0,242,254,0.4) !important; }
.ant-table-wrapper { border-radius: 12px; overflow: hidden; }`,
    customJs: `// 3x-ui Custom Script Injection
console.log("3x-ui Cyber Core theme loaded successfully");
document.addEventListener("DOMContentLoaded", function() {
  const brand = document.querySelector(".ant-layout-header .logo");
  if(brand) brand.innerHTML = "<span style='color:#00f2fe;font-weight:900;'>⚡ 3X-UI CYBER</span>";
});`,
    showServerInfo: true,
    showQuickStats: true,
  },
  {
    presetName: 'Emerald Matrix',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    accentColor: '#34d399',
    bgColor: '#061712',
    cardBg: 'rgba(6, 30, 22, 0.8)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    textColor: '#ecfdf5',
    borderRadius: '12px',
    glassmorphism: true,
    blurIntensity: 12,
    customLogoUrl: '',
    panelTitle: '3x-ui Emerald Shield',
    fontFamily: 'system-ui, sans-serif',
    customCss: `/* 3x-ui Emerald Matrix Theme */
body { background-color: #061712 !important; color: #ecfdf5 !important; }
.ant-card { background: rgba(6, 30, 22, 0.8) !important; backdrop-filter: blur(12px); border: 1px solid rgba(16, 185, 129, 0.25) !important; }
.ant-btn-primary { background: #10b981 !important; border-color: #10b981 !important; box-shadow: 0 0 12px rgba(16, 185, 129, 0.3); }`,
    customJs: `console.log("3x-ui Emerald Matrix Theme Active");`,
    showServerInfo: true,
    showQuickStats: true,
  },
  {
    presetName: 'OLED Midnight Dark',
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    accentColor: '#818cf8',
    bgColor: '#000000',
    cardBg: '#121212',
    borderColor: '#262626',
    textColor: '#ffffff',
    borderRadius: '10px',
    glassmorphism: false,
    blurIntensity: 0,
    customLogoUrl: '',
    panelTitle: '3x-ui OLED Black',
    fontFamily: 'monospace',
    customCss: `/* 3x-ui Pure OLED Black Theme */
body { background-color: #000000 !important; }
.ant-card { background-color: #121212 !important; border: 1px solid #262626 !important; }
.ant-btn-primary { background: #6366f1 !important; }`,
    customJs: `console.log("OLED Midnight Theme Active");`,
    showServerInfo: true,
    showQuickStats: true,
  },
  {
    presetName: 'Luxury Gold & Carbon',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    accentColor: '#fbbf24',
    bgColor: '#0f0f11',
    cardBg: 'rgba(24, 24, 27, 0.85)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    textColor: '#fef3c7',
    borderRadius: '14px',
    glassmorphism: true,
    blurIntensity: 14,
    customLogoUrl: '',
    panelTitle: '3x-ui Gold VIP Panel',
    fontFamily: 'sans-serif',
    customCss: `/* 3x-ui Luxury Gold Theme */
body { background: #0f0f11 !important; }
.ant-card { background: rgba(24, 24, 27, 0.85) !important; border: 1px solid rgba(245, 158, 11, 0.3) !important; }
.ant-btn-primary { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: #000 !important; font-weight: bold; }`,
    customJs: `console.log("Luxury Gold Theme Active");`,
    showServerInfo: true,
    showQuickStats: true,
  },
];

export const defaultApiConfig: ApiServerConfig = {
  baseUrl: 'https://159.65.132.88:2053',
  pathPrefix: '/xui/',
  username: 'admin',
  isLoggedIn: true,
  lastSync: 'Just now',
  useSimulatedData: true,
};

// Formatting helpers
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'Unlimited';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec, 1)}/s`;
}

export function generateConnectionLink(inbound: Inbound, clientEmail?: string): string {
  const serverIp = '159.65.132.88';
  const client = inbound.settings.clients.find(c => c.email === clientEmail) || inbound.settings.clients[0];
  if (!client) return '';

  const remarkEncoded = encodeURIComponent(`${inbound.remark} - ${client.email}`);

  if (inbound.protocol === 'vless') {
    const net = inbound.streamSettings.network;
    const sec = inbound.streamSettings.security;
    let extraParams = `type=${net}&security=${sec}`;
    if (client.flow) extraParams += `&flow=${client.flow}`;
    if (sec === 'reality' && inbound.streamSettings.realitySettings) {
      const rs = inbound.streamSettings.realitySettings;
      extraParams += `&pbk=${rs.publicKey}&sni=${rs.serverNames[0] || 'apple.com'}&sid=${rs.shortIds[0] || ''}&fp=chrome`;
    }
    return `vless://${client.uuid}@${serverIp}:${inbound.port}?${extraParams}#${remarkEncoded}`;
  }

  if (inbound.protocol === 'vmess') {
    const vmessConfig = {
      v: '2',
      ps: `${inbound.remark} (${client.email})`,
      add: serverIp,
      port: String(inbound.port),
      id: client.uuid,
      aid: '0',
      scy: 'auto',
      net: inbound.streamSettings.network,
      type: 'none',
      host: inbound.streamSettings.wsSettings?.headers?.Host || '',
      path: inbound.streamSettings.wsSettings?.path || '/',
      tls: inbound.streamSettings.security === 'tls' ? 'tls' : '',
      sni: '',
      alpn: '',
    };
    return `vmess://${btoa(JSON.stringify(vmessConfig))}`;
  }

  if (inbound.protocol === 'trojan') {
    let extra = `type=${inbound.streamSettings.network}&security=${inbound.streamSettings.security}`;
    if (inbound.streamSettings.grpcSettings) {
      extra += `&serviceName=${inbound.streamSettings.grpcSettings.serviceName}`;
    }
    return `trojan://${client.uuid}@${serverIp}:${inbound.port}?${extra}#${remarkEncoded}`;
  }

  if (inbound.protocol === 'shadowsocks') {
    const method = inbound.settings.decryption || 'aes-256-gcm';
    const credentials = btoa(`${method}:${client.uuid}`);
    return `ss://${credentials}@${serverIp}:${inbound.port}#${remarkEncoded}`;
  }

  return `vless://${client.uuid}@${serverIp}:${inbound.port}#${remarkEncoded}`;
}

export function generateClashYaml(inbound: Inbound, clientEmail?: string): string {
  const client = inbound.settings.clients.find(c => c.email === clientEmail) || inbound.settings.clients[0];
  const serverIp = '159.65.132.88';

  return `proxies:
  - name: "${inbound.remark} [${client?.email || 'User'}]"
    type: ${inbound.protocol}
    server: ${serverIp}
    port: ${inbound.port}
    uuid: ${client?.uuid || ''}
    network: ${inbound.streamSettings.network}
    tls: ${inbound.streamSettings.security !== 'none'}
    udp: true
    ${inbound.streamSettings.realitySettings ? `reality-opts:
      public-key: ${inbound.streamSettings.realitySettings.publicKey}
      short-id: ${inbound.streamSettings.realitySettings.shortIds[0] || ''}
    client-fingerprint: chrome` : ''}
    ${inbound.streamSettings.wsSettings ? `ws-opts:
      path: "${inbound.streamSettings.wsSettings.path}"
      headers:
        Host: "${inbound.streamSettings.wsSettings.headers?.Host || ''}"` : ''}`;
}

export function generateSingboxJson(inbound: Inbound, clientEmail?: string): string {
  const client = inbound.settings.clients.find(c => c.email === clientEmail) || inbound.settings.clients[0];
  const serverIp = '159.65.132.88';

  return JSON.stringify({
    outbounds: [
      {
        type: inbound.protocol,
        tag: inbound.remark,
        server: serverIp,
        server_port: inbound.port,
        uuid: client?.uuid,
        flow: client?.flow || undefined,
        network: inbound.streamSettings.network,
        tls: inbound.streamSettings.security !== 'none' ? {
          enabled: true,
          server_name: inbound.streamSettings.realitySettings?.serverNames[0] || 'apple.com',
          reality: inbound.streamSettings.security === 'reality' ? {
            enabled: true,
            public_key: inbound.streamSettings.realitySettings?.publicKey,
            short_id: inbound.streamSettings.realitySettings?.shortIds[0]
          } : undefined
        } : undefined
      }
    ]
  }, null, 2);
}

export function generateCustomCssJsInjection(theme: ThemeConfig): { css: string; js: string; fullInjectCode: string } {
  const css = theme.customCss;
  const js = theme.customJs;

  const fullInjectCode = `<!-- 3x-ui Custom Branding Injection Code -->
<!-- Paste this in 3x-ui Panel -> Settings -> Custom CSS & JS fields -->

<!-- Custom CSS -->
<style id="xui-custom-theme">
${css}
</style>

<!-- Custom JS -->
<script>
${js}
</script>`;

  return { css, js, fullInjectCode };
}
