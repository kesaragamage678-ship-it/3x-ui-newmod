import React, { useState } from 'react';
import {
  Settings,
  Lock,
  Globe,
  ShieldCheck,
  Key,
  CheckCircle2,
  Save,
  Server,
  RefreshCw,
  Terminal,
  Layers,
  Copy,
  AlertCircle
} from 'lucide-react';
import { PanelSettings } from '../types';

interface PanelSettingsViewProps {
  settings: PanelSettings;
  onUpdateSettings: (updated: Partial<PanelSettings>) => void;
}

export const PanelSettingsView: React.FC<PanelSettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [saved, setSaved] = useState(false);
  const [sslDomain, setSslDomain] = useState('vpn.example.com');
  const [isGeneratingSsl, setIsGeneratingSsl] = useState(false);
  const [sslSuccess, setSslSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGenerateSslCert = () => {
    setIsGeneratingSsl(true);
    setSslSuccess(false);
    setTimeout(() => {
      setIsGeneratingSsl(false);
      setSslSuccess(true);
      onUpdateSettings({
        sslEnabled: true,
        certPath: `/etc/letsencrypt/live/${sslDomain}/fullchain.pem`,
        keyPath: `/etc/letsencrypt/live/${sslDomain}/privkey.pem`,
      });
      setTimeout(() => setSslSuccess(false), 3000);
    }, 2000);
  };

  const acmeScript = `~/.acme.sh/acme.sh --issue -d ${sslDomain} --standalone -k ec-256
~/.acme.sh/acme.sh --installcert -d ${sslDomain} --fullchainpath ${settings.certPath} --keypath ${settings.keyPath} --ecc`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              3X-UI Panel & SSL Settings
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                {settings.xuiVersion}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Panel listening port, SSL certs, admin security, sub-domain & session timeouts
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Panel Settings Saved!' : 'Save Panel Config'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel Listening & Admin Security */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Panel Server Configuration
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Web Listening Port</label>
              <input
                type="number"
                value={settings.port}
                onChange={(e) => onUpdateSettings({ port: parseInt(e.target.value) || 2053 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default 3X-UI port is 2053</span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Base Path / URL Prefix</label>
              <input
                type="text"
                value={settings.webBasePath}
                onChange={(e) => onUpdateSettings({ webBasePath: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Example: /xui/ or /panel/ (prevents bot scans)</span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Admin Username</label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => onUpdateSettings({ username: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Change Admin Password</label>
              <input
                type="password"
                placeholder="Enter new password to update..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Session Timeout (Mins)</label>
                <input
                  type="number"
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => onUpdateSettings({ sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Max Login Failures</label>
                <input
                  type="number"
                  value={settings.maxLoginFailures}
                  onChange={(e) => onUpdateSettings({ maxLoginFailures: parseInt(e.target.value) || 5 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SSL & Let's Encrypt Certificate Manager */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              SSL / TLS Certificate Manager
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sslEnabled}
                onChange={(e) => onUpdateSettings({ sslEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              <span className="ml-2 text-xs font-semibold text-slate-300">
                {settings.sslEnabled ? 'HTTPS Active' : 'HTTP'}
              </span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Target Domain Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sslDomain}
                  onChange={(e) => setSslDomain(e.target.value)}
                  placeholder="vpn.yourdomain.com"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleGenerateSslCert}
                  disabled={isGeneratingSsl}
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  {isGeneratingSsl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{isGeneratingSsl ? 'Issuing...' : 'Issue Cert (Acme)'}</span>
                </button>
              </div>
              {sslSuccess && (
                <p className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Let's Encrypt SSL certificate issued successfully!
                </p>
              )}
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Public Key Path (.crt / .pem)</label>
              <input
                type="text"
                value={settings.certPath}
                onChange={(e) => onUpdateSettings({ certPath: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Private Key Path (.key / .pem)</label>
              <input
                type="text"
                value={settings.keyPath}
                onChange={(e) => onUpdateSettings({ keyPath: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Acme.sh VPS Command Script
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(acmeScript);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedScript ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap">
                {acmeScript}
              </pre>
            </div>
          </div>
        </div>

        {/* Subscription Engine Settings */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Subscription Link & Encryption Configuration
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.subEnable}
                onChange={(e) => onUpdateSettings({ subEnable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              <span className="ml-2 text-xs font-semibold text-slate-300">
                {settings.subEnable ? 'Sub Service Active' : 'Sub Service Off'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Sub Service Domain</label>
              <input
                type="text"
                value={settings.subDomain}
                onChange={(e) => onUpdateSettings({ subDomain: e.target.value })}
                placeholder="sub.example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Sub Service Port</label>
              <input
                type="number"
                value={settings.subPort}
                onChange={(e) => onUpdateSettings({ subPort: parseInt(e.target.value) || 2096 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Sub Path Prefix</label>
              <input
                type="text"
                value={settings.subPath}
                onChange={(e) => onUpdateSettings({ subPath: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Base64 Link Encryption for Subscriptions</span>
              <span className="text-[10px] text-slate-400">Encodes vless://, vmess:// and trojan:// links for Clash, v2rayNG & Shadowrocket compatibility</span>
            </div>
            <input
              type="checkbox"
              checked={settings.subEncrypt}
              onChange={(e) => onUpdateSettings({ subEncrypt: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
};
