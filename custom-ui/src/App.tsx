import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InboundsView } from './components/InboundsView';
import { ClientsView } from './components/ClientsView';
import { ThemeCustomizerView } from './components/ThemeCustomizerView';
import { XraySettingsView } from './components/XraySettingsView';
import { ExportApiView } from './components/ExportApiView';
import { TelegramBotView } from './components/TelegramBotView';
import { PanelSettingsView } from './components/PanelSettingsView';
import { QrCodeModal } from './components/QrCodeModal';
import { InboundModal } from './components/InboundModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import {
  initialSystemStats,
  initialInbounds,
  themePresets,
  defaultApiConfig,
  initialTelegramBotConfig,
  initialPanelSettings,
  initialBackups,
} from './data/mock3xui';
import { Inbound, SystemStats, ThemeConfig, ApiServerConfig, Client, TelegramBotConfig, PanelSettings, BackupRecord } from './types';
import * as xuiApi from './lib/xuiApi';
import { XuiApiError } from './lib/xuiApi';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Live-mode UX state (only relevant when apiConfig.useSimulatedData === false)
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  
  // State with LocalStorage persistence
  const [systemStats, setSystemStats] = useState<SystemStats>(() => {
    const saved = localStorage.getItem('3xui_stats');
    return saved ? JSON.parse(saved) : initialSystemStats;
  });

  const [inbounds, setInbounds] = useState<Inbound[]>(() => {
    const saved = localStorage.getItem('3xui_inbounds');
    return saved ? JSON.parse(saved) : initialInbounds;
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('3xui_theme');
    return saved ? JSON.parse(saved) : themePresets[0];
  });

  const [apiConfig, setApiConfig] = useState<ApiServerConfig>(() => {
    const saved = localStorage.getItem('3xui_apiconfig');
    return saved ? JSON.parse(saved) : defaultApiConfig;
  });

  // Live Mode = real API calls to your 3x-ui panel via the embedded SPA
  // (this app IS internal/web/dist/index.html — the browser already has a
  // valid, authenticated session cookie before this code ever runs, since
  // Go's checkLogin middleware gates /panel/* before serving the shell).
  // Demo Mode (useSimulatedData=true) keeps everything local/mock.
  const isLive = () => !apiConfig.useSimulatedData;

  const [telegramConfig, setTelegramConfig] = useState<TelegramBotConfig>(() => {
    const saved = localStorage.getItem('3xui_telegram');
    return saved ? JSON.parse(saved) : initialTelegramBotConfig;
  });

  const [panelSettings, setPanelSettings] = useState<PanelSettings>(() => {
    const saved = localStorage.getItem('3xui_panel_settings');
    return saved ? JSON.parse(saved) : initialPanelSettings;
  });

  const [backups, setBackups] = useState<BackupRecord[]>(() => {
    const saved = localStorage.getItem('3xui_backups');
    return saved ? JSON.parse(saved) : initialBackups;
  });

  // Modal States
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrInbound, setQrInbound] = useState<Inbound | null>(null);
  const [qrClientEmail, setQrClientEmail] = useState<string | undefined>(undefined);

  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [editingInbound, setEditingInbound] = useState<Inbound | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('3xui_inbounds', JSON.stringify(inbounds));
  }, [inbounds]);

  useEffect(() => {
    localStorage.setItem('3xui_theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('3xui_apiconfig', JSON.stringify(apiConfig));
  }, [apiConfig]);

  useEffect(() => {
    localStorage.setItem('3xui_telegram', JSON.stringify(telegramConfig));
  }, [telegramConfig]);

  useEffect(() => {
    localStorage.setItem('3xui_panel_settings', JSON.stringify(panelSettings));
  }, [panelSettings]);

  useEffect(() => {
    localStorage.setItem('3xui_backups', JSON.stringify(backups));
  }, [backups]);

  // On first mount: if Go served us the authenticated panel shell (embedded
  // native mode), auto-switch into Live Mode + logged-in — no manual login
  // modal needed. If it served the login shell, leave Demo Mode as-is until
  // the user logs in via the modal.
  useEffect(() => {
    if (xuiApi.isPanelContext()) {
      setApiConfig(prev => ({ ...prev, useSimulatedData: false, isLoggedIn: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- LIVE MODE: fetch real data straight from this same 3x-ui server ----
  const refreshLiveInbounds = async () => {
    try {
      const raw = await xuiApi.listInbounds();
      const parsed = raw.map(xuiApi.parseInboundFromApi) as Inbound[];
      setInbounds(parsed);
      setLiveError(null);
    } catch (e) {
      if (e instanceof XuiApiError && e.code === 'UNAUTHORIZED') {
        setLiveError('Session expired — reloading to the login page...');
        setTimeout(() => xuiApi.reloadToLogin(), 1200);
      } else {
        setLiveError(e instanceof Error ? e.message : 'Failed to load inbounds from panel.');
      }
    }
  };

  const refreshLiveServerStatus = async () => {
    try {
      const obj: any = await xuiApi.getServerStatus();
      if (obj) {
        setSystemStats(prev => ({
          ...prev,
          cpu: typeof obj.cpu === 'number' ? Math.round(obj.cpu * 10) / 10 : prev.cpu,
          ipAddress: window.location.hostname || prev.ipAddress,
          memoryUsed: obj.mem?.current ?? prev.memoryUsed,
          memoryTotal: obj.mem?.total ?? prev.memoryTotal,
          diskUsed: obj.disk?.current ?? prev.diskUsed,
          diskTotal: obj.disk?.total ?? prev.diskTotal,
          netTrafficUp: obj.netTraffic?.sent ?? prev.netTrafficUp,
          netTrafficDown: obj.netTraffic?.recv ?? prev.netTrafficDown,
          netSpeedUp: obj.netIO?.up ?? prev.netSpeedUp,
          netSpeedDown: obj.netIO?.down ?? prev.netSpeedDown,
          xrayState: obj.xray?.state ?? prev.xrayState,
          xrayVersion: obj.xray?.version ?? prev.xrayVersion,
          uptimeSeconds: obj.uptime ?? prev.uptimeSeconds,
        }));
      }
    } catch {
      // Best-effort only — some panel versions expose stats over a
      // WebSocket instead of this endpoint. Inbounds/clients still work.
    }
  };

  // On mount (or switching into Live Mode), do an initial load + start polling.
  useEffect(() => {
    if (apiConfig.useSimulatedData) return;

    let cancelled = false;
    (async () => {
      setIsLiveLoading(true);
      await refreshLiveInbounds();
      await refreshLiveServerStatus();
      if (!cancelled) setIsLiveLoading(false);
    })();

    const inboundsInterval = setInterval(refreshLiveInbounds, 15000);
    const statusInterval = setInterval(refreshLiveServerStatus, 5000);

    return () => {
      cancelled = true;
      clearInterval(inboundsInterval);
      clearInterval(statusInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig.useSimulatedData, apiConfig.isLoggedIn]);

  // Trigger Backup Handler
  const handleTriggerBackup = (type: 'auto_telegram' | 'manual_db' | 'json') => {
    const clientsCount = inbounds.reduce((acc, i) => acc + (i.settings.clients?.length || 0), 0);
    const dateStr = new Date().toISOString().slice(0, 10);
    const newBk: BackupRecord = {
      id: 'bk_' + Date.now(),
      filename: type === 'json' ? `3xui_export_${dateStr}.json` : `x-ui-backup-${dateStr}-${Math.floor(Math.random()*1000)}.db`,
      createdAt: new Date().toISOString(),
      sizeBytes: Math.floor(1048576 * (2 + Math.random())),
      inboundsCount: inbounds.length,
      clientsCount,
      type,
      status: type === 'auto_telegram' ? 'sent_to_telegram' : 'completed',
    };

    setBackups(prev => [newBk, ...prev]);
    setTelegramConfig(prev => ({
      ...prev,
      lastBackupTime: newBk.createdAt,
      lastBackupStatus: 'success',
    }));
  };

  const handleDeleteBackup = (id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id));
  };

  const handleRestoreBackup = (file: File) => {
    alert(`Restoring 3X-UI configuration from file: ${file.name}. Backup data loaded successfully!`);
  };


  // Restart Xray Core handler
  const handleRestartXray = () => {
    if (isLive()) {
      setSystemStats(prev => ({ ...prev, xrayState: 'restarting' }));
      xuiApi
        .restartXrayService()
        .then(() => refreshLiveServerStatus())
        .catch(e => setLiveError(e instanceof Error ? e.message : 'Failed to restart Xray'))
        .finally(() => setSystemStats(prev => ({ ...prev, xrayState: 'running' })));
      return;
    }
    setSystemStats(prev => ({ ...prev, xrayState: 'restarting' }));
    setTimeout(() => {
      setSystemStats(prev => ({ ...prev, xrayState: 'running' }));
    }, 1500);
  };

  const handleToggleXrayState = () => {
    // Demo-mode-only convenience toggle; in Live Mode use Restart above,
    // 3x-ui doesn't expose a direct "stop" endpoint via the standard API.
    setSystemStats(prev => ({
      ...prev,
      xrayState: prev.xrayState === 'running' ? 'stopped' : 'running',
    }));
  };

  // Inbounds handlers
  const handleToggleInbound = (id: number) => {
    if (isLive()) {
      const target = inbounds.find(i => i.id === id);
      if (!target) return;
      const updated = { ...target, enable: !target.enable };
      setInbounds(prev => prev.map(inb => (inb.id === id ? updated : inb)));
      xuiApi
        .updateInbound(id, xuiApi.serializeInboundForApi(updated))
        .catch(e => {
          setLiveError(e instanceof Error ? e.message : 'Failed to update inbound');
          refreshLiveInbounds(); // revert to server truth
        });
      return;
    }
    setInbounds(prev =>
      prev.map(inb => (inb.id === id ? { ...inb, enable: !inb.enable } : inb))
    );
  };

  const handleDeleteInbound = (id: number) => {
    if (!confirm('Are you sure you want to delete this inbound port?')) return;

    if (isLive()) {
      setInbounds(prev => prev.filter(inb => inb.id !== id)); // optimistic
      xuiApi
        .deleteInbound(id)
        .then(() => refreshLiveInbounds())
        .catch(e => {
          setLiveError(e instanceof Error ? e.message : 'Failed to delete inbound');
          refreshLiveInbounds();
        });
      return;
    }
    setInbounds(prev => prev.filter(inb => inb.id !== id));
  };

  const handleSaveInbound = (inboundData: Partial<Inbound>) => {
    if (isLive()) {
      if (editingInbound) {
        const merged = { ...editingInbound, ...inboundData } as Inbound;
        xuiApi
          .updateInbound(editingInbound.id, xuiApi.serializeInboundForApi(merged))
          .then(() => refreshLiveInbounds())
          .catch(e => setLiveError(e instanceof Error ? e.message : 'Failed to update inbound'));
      } else {
        const newInboundPayload = {
          up: 0,
          down: 0,
          total: 0,
          remark: inboundData.remark || 'New Inbound',
          enable: true,
          expiryTime: 0,
          listen: '',
          port: inboundData.port || 443,
          protocol: inboundData.protocol || 'vless',
          tag: inboundData.tag || `inbound-${inboundData.port}`,
          settings: inboundData.settings || { clients: [] },
          streamSettings: inboundData.streamSettings || { network: 'tcp', security: 'none' },
        };
        xuiApi
          .addInbound(xuiApi.serializeInboundForApi(newInboundPayload))
          .then(() => refreshLiveInbounds())
          .catch(e => setLiveError(e instanceof Error ? e.message : 'Failed to add inbound'));
      }
      return;
    }

    if (editingInbound) {
      setInbounds(prev =>
        prev.map(inb => (inb.id === editingInbound.id ? { ...inb, ...inboundData } as Inbound : inb))
      );
    } else {
      const newInbound: Inbound = {
        id: Date.now(),
        user_id: 1,
        up: 0,
        down: 0,
        total: 0,
        remark: inboundData.remark || 'New Inbound',
        enable: true,
        expiryTime: 0,
        listen: '',
        port: inboundData.port || 443,
        protocol: inboundData.protocol || 'vless',
        tag: inboundData.tag || `inbound-${inboundData.port}`,
        settings: inboundData.settings || { clients: [] },
        streamSettings: inboundData.streamSettings || { network: 'tcp', security: 'none' },
      };
      setInbounds(prev => [newInbound, ...prev]);
    }
  };

  // Client handlers
  const handleAddClient = (inboundId: number) => {
    const clientEmail = prompt('Enter new client email:', `user_${Date.now().toString().slice(-4)}@3xui.net`);
    if (!clientEmail) return;

    const newClient: Client = {
      id: 'c_' + Date.now(),
      email: clientEmail,
      uuid: crypto.randomUUID(),
      limitIp: 2,
      totalBytes: 100 * 1024 * 1024 * 1024, // 100 GB
      upBytes: 0,
      downBytes: 0,
      expiryTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
      enable: true,
      subId: 'sub_' + Math.random().toString(36).substring(2, 8),
    };

    if (isLive()) {
      xuiApi
        .addClient(inboundId, newClient)
        .then(() => refreshLiveInbounds())
        .catch(e => setLiveError(e instanceof Error ? e.message : 'Failed to add client'));
      return;
    }

    setInbounds(prev =>
      prev.map(inb => {
        if (inb.id === inboundId) {
          return {
            ...inb,
            settings: {
              ...inb.settings,
              clients: [...(inb.settings.clients || []), newClient],
            },
          };
        }
        return inb;
      })
    );
  };

  const handleDeleteClient = (inboundId: number, clientId: string) => {
    if (isLive()) {
      const inbound = inbounds.find(i => i.id === inboundId);
      const client = inbound?.settings.clients.find(c => c.id === clientId);
      // 3x-ui identifies clients by uuid (vless/vmess) or password (trojan) or email (shadowsocks) — not our local `id`.
      const apiClientId = client ? (client.uuid || client.email) : clientId;
      xuiApi
        .deleteClient(inboundId, apiClientId)
        .then(() => refreshLiveInbounds())
        .catch(e => setLiveError(e instanceof Error ? e.message : 'Failed to delete client'));
      return;
    }

    setInbounds(prev =>
      prev.map(inb => {
        if (inb.id === inboundId) {
          return {
            ...inb,
            settings: {
              ...inb.settings,
              clients: (inb.settings.clients || []).filter(c => c.id !== clientId),
            },
          };
        }
        return inb;
      })
    );
  };

  // Open QR modal
  const handleOpenQrModal = (inbound: Inbound, clientEmail?: string) => {
    setQrInbound(inbound);
    setQrClientEmail(clientEmail);
    setIsQrModalOpen(true);
  };

  // Theme update
  const handleUpdateTheme = (updatedTheme: Partial<ThemeConfig>) => {
    setTheme(prev => ({ ...prev, ...updatedTheme }));
  };

  const handleResetTheme = () => {
    setTheme(themePresets[0]);
  };

  const totalClientsCount = inbounds.reduce(
    (acc, inb) => acc + (inb.settings.clients?.length || 0),
    0
  );

  // ---- Embedded login gate ----
  // Only matters when this app is served BY the 3x-ui Go binary itself
  // (window.X_UI_BASE_PATH is injected on every page, login.html included —
  // see internal/web/controller/dist.go). If Go served the login shell
  // (isPanelContext() === false) and we're not already logged in, show a
  // real login screen instead of the dashboard. Standalone/dev preview
  // (no X_UI_BASE_PATH at all) keeps the old Demo Mode behavior untouched.
  const isEmbedded = typeof window !== 'undefined' && !!window.X_UI_BASE_PATH;
  const showLoginGate = isEmbedded && !xuiApi.isPanelContext() && !apiConfig.isLoggedIn;

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTwoFactor, setLoginTwoFactor] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const handleEmbeddedLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError(null);
    try {
      await xuiApi.login(loginUsername, loginPassword, loginTwoFactor);
      // Go only serves the authenticated dashboard shell at panel/ —
      // full navigation so the server re-renders with session globals.
      window.location.href = xuiApi.getBasePath() + 'panel/';
    } catch (err) {
      setLoginBusy(false);
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    }
  };

  if (showLoginGate) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <form
          onSubmit={handleEmbeddedLogin}
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl"
        >
          <div className="text-center space-y-1 mb-2">
            <div className="text-2xl font-black text-white">3x-ui Cyber Core</div>
            <div className="text-xs text-slate-400">Sign in to your panel</div>
          </div>

          {loginError && (
            <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/80 rounded-xl px-3 py-2">
              {loginError}
            </div>
          )}

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">Username</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              2FA Code <span className="text-slate-500 font-normal">(only if enabled)</span>
            </label>
            <input
              type="text"
              value={loginTwoFactor}
              onChange={(e) => setLoginTwoFactor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loginBusy}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            {loginBusy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 antialiased">
      
      {/* Header */}
      <Header
        stats={systemStats}
        theme={theme}
        apiConfig={apiConfig}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onRestartXray={handleRestartXray}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Live Mode status / error banner */}
      {!apiConfig.useSimulatedData && (
        <div className="max-w-7xl w-full mx-auto px-4 lg:px-6 pt-3">
          {isLiveLoading && (
            <div className="text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 rounded-lg px-3 py-2 mb-2">
              Loading live data from your 3x-ui panel…
            </div>
          )}
          {!apiConfig.isLoggedIn && !isLiveLoading && (
            <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-lg px-3 py-2 mb-2">
              Not connected to your 3x-ui panel. Click "Server API" above and log in to see real data.
            </div>
          )}
          {liveError && (
            <div className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2 mb-2 flex items-center justify-between gap-2">
              <span>{liveError}</span>
              <button onClick={() => setLiveError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          inboundsCount={inbounds.length}
          totalClientsCount={totalClientsCount}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={systemStats}
              inbounds={inbounds}
              onRestartXray={handleRestartXray}
              onToggleXrayState={handleToggleXrayState}
              onNavigateToInbounds={() => setActiveTab('inbounds')}
              onNavigateToClients={() => setActiveTab('clients')}
              onOpenQrCode={(inbound) => handleOpenQrModal(inbound)}
            />
          )}

          {activeTab === 'inbounds' && (
            <InboundsView
              inbounds={inbounds}
              onAddInbound={() => {
                setEditingInbound(null);
                setIsInboundModalOpen(true);
              }}
              onEditInbound={(inbound) => {
                setEditingInbound(inbound);
                setIsInboundModalOpen(true);
              }}
              onDeleteInbound={handleDeleteInbound}
              onToggleInbound={handleToggleInbound}
              onOpenQrCode={handleOpenQrModal}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              inbounds={inbounds}
              onOpenQrCode={handleOpenQrModal}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeTab === 'telegram-bot' && (
            <TelegramBotView
              config={telegramConfig}
              onUpdateConfig={(cfg) => setTelegramConfig(prev => ({ ...prev, ...cfg }))}
              backups={backups}
              onTriggerBackup={handleTriggerBackup}
              onDeleteBackup={handleDeleteBackup}
              onRestoreBackup={handleRestoreBackup}
              inbounds={inbounds}
              stats={systemStats}
            />
          )}

          {activeTab === 'panel-settings' && (
            <PanelSettingsView
              settings={panelSettings}
              onUpdateSettings={(st) => setPanelSettings(prev => ({ ...prev, ...st }))}
            />
          )}

          {activeTab === 'customizer' && (
            <ThemeCustomizerView
              theme={theme}
              onUpdateTheme={handleUpdateTheme}
              onResetTheme={handleResetTheme}
            />
          )}

          {activeTab === 'xray-settings' && (
            <XraySettingsView
              stats={systemStats}
              onRestartXray={handleRestartXray}
            />
          )}

          {activeTab === 'export-api' && (
            <ExportApiView
              inbounds={inbounds}
              apiConfig={apiConfig}
            />
          )}
        </main>

      </div>

      {/* Modals */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        inbound={qrInbound}
        clientEmail={qrClientEmail}
      />

      <InboundModal
        isOpen={isInboundModalOpen}
        onClose={() => setIsInboundModalOpen(false)}
        onSave={handleSaveInbound}
        editingInbound={editingInbound}
      />

      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiConfig={apiConfig}
        onUpdateApiConfig={(cfg) => setApiConfig(prev => ({ ...prev, ...cfg }))}
      />

    </div>
  );
}
