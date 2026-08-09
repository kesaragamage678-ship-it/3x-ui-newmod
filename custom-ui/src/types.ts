export type Protocol = 'vless' | 'vmess' | 'trojan' | 'shadowsocks' | 'dokodemo-door' | 'socks' | 'http';

export type NetworkType = 'tcp' | 'ws' | 'grpc' | 'h2' | 'kcp';

export type SecurityType = 'none' | 'tls' | 'reality';

export interface Client {
  id: string;
  email: string;
  uuid: string; // or password
  flow?: string; // e.g. xtls-rprx-vision
  limitIp: number;
  totalBytes: number; // 0 = unlimited
  upBytes: number;
  downBytes: number;
  expiryTime: number; // timestamp in ms, 0 = unlimited
  enable: boolean;
  subId: string;
  tgId?: string;
}

export interface RealitySettings {
  show: boolean;
  dest: string;
  serverNames: string[];
  privateKey: string;
  publicKey: string;
  shortIds: string[];
  maxTimeDiff: number;
}

export interface StreamSettings {
  network: NetworkType;
  security: SecurityType;
  externalProxy?: string[];
  realitySettings?: RealitySettings;
  wsSettings?: {
    path: string;
    headers?: Record<string, string>;
  };
  grpcSettings?: {
    serviceName: string;
  };
}

export interface Inbound {
  id: number;
  user_id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  listen: string;
  port: number;
  protocol: Protocol;
  settings: {
    clients: Client[];
    decryption?: string;
    fallbacks?: any[];
  };
  streamSettings: StreamSettings;
  tag: string;
  sniffing?: {
    enabled: boolean;
    destOverride: string[];
  };
}

export interface SystemStats {
  cpu: number; // percentage 0-100
  memoryUsed: number; // bytes
  memoryTotal: number; // bytes
  diskUsed: number; // bytes
  diskTotal: number; // bytes
  swapUsed: number;
  swapTotal: number;
  netTrafficUp: number; // total bytes
  netTrafficDown: number; // total bytes
  netSpeedUp: number; // bytes per sec
  netSpeedDown: number; // bytes per sec
  xrayState: 'running' | 'stopped' | 'restarting';
  xrayVersion: string;
  uptimeSeconds: number;
  ipAddress: string;
}

export interface ThemeConfig {
  presetName: string;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  accentColor: string; // hex
  bgColor: string; // hex/gradient
  cardBg: string; // rgba or hex
  borderColor: string;
  textColor: string;
  borderRadius: string; // e.g., '12px'
  glassmorphism: boolean;
  blurIntensity: number; // px
  customLogoUrl: string;
  panelTitle: string;
  fontFamily: string;
  customCss: string;
  customJs: string;
  showServerInfo: boolean;
  showQuickStats: boolean;
}

export interface ApiServerConfig {
  baseUrl: string; // e.g. https://my-vps-ip:2053
  pathPrefix: string; // e.g. /xui/
  username: string;
  isLoggedIn: boolean;
  lastSync: string | null;
  useSimulatedData: boolean;
}

export interface TelegramBotConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  backupCron: 'off' | '6h' | '12h' | 'daily' | 'weekly';
  notifyOnRestart: boolean;
  notifyOnLogin: boolean;
  notifyOnExpiration: boolean;
  notifyOnTrafficLimit: boolean;
  notifyOnCpuAlert: boolean;
  cpuThreshold: number; // e.g. 85%
  lastBackupTime?: string;
  lastBackupStatus?: 'success' | 'failed' | 'idle';
}

export interface PanelSettings {
  port: number;
  webBasePath: string;
  sslEnabled: boolean;
  certPath: string;
  keyPath: string;
  username: string;
  subPort: number;
  subPath: string;
  subDomain: string;
  subEnable: boolean;
  subEncrypt: boolean;
  sessionTimeoutMinutes: number;
  maxLoginFailures: number;
  ipWhitelist: string;
  xuiVersion: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  inboundsCount: number;
  clientsCount: number;
  type: 'auto_telegram' | 'manual_db' | 'json';
  status: 'completed' | 'sent_to_telegram';
}

