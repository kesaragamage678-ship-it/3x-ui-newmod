import React, { useState } from 'react';
import { X, Server, Key, CheckCircle2, AlertCircle, RefreshCw, Globe, Terminal, Lock } from 'lucide-react';
import { ApiServerConfig } from '../types';
import * as xuiApi from '../lib/xuiApi';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiServerConfig;
  onUpdateApiConfig: (updatedConfig: Partial<ApiServerConfig>) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  onUpdateApiConfig,
}) => {
  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [username, setUsername] = useState(apiConfig.username);
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMsg(null);

    // Demo Mode: no real network call, just simulate like before.
    if (apiConfig.useSimulatedData) {
      setTimeout(() => {
        setIsTesting(false);
        setTestResult('success');
        onUpdateApiConfig({
          baseUrl,
          username,
          isLoggedIn: true,
          lastSync: new Date().toLocaleTimeString(),
        });
      }, 1200);
      return;
    }

    // Live Mode: real login against your 3x-ui panel via the Nginx proxy.
    if (!password) {
      setIsTesting(false);
      setTestResult('failed');
      setErrorMsg('Enter your 3x-ui password.');
      return;
    }
    try {
      await xuiApi.login(username, password);
      setIsTesting(false);
      setTestResult('success');
      onUpdateApiConfig({
        baseUrl,
        username,
        isLoggedIn: true,
        lastSync: new Date().toLocaleTimeString(),
      });
      // Embedded/native mode: Go only serves the authenticated dashboard
      // shell (with session globals injected) at panel/ once logged in.
      window.location.href = xuiApi.getBasePath() + 'panel/';
    } catch (e) {
      setIsTesting(false);
      setTestResult('failed');
      setErrorMsg(e instanceof Error ? e.message : 'Login failed. Check username/password.');
    }
  };

  const handleLogout = async () => {
    try {
      await xuiApi.logout();
    } catch {
      // ignore — we clear local state regardless
    }
    onUpdateApiConfig({ isLoggedIn: false, lastSync: null });
    setTestResult(null);
  };

  const curlSnippet = `curl -X POST "${baseUrl}/login" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=${username}&password=YOUR_PASSWORD"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">3x-ui Server API Connection</h3>
            <p className="text-xs text-slate-400">
              Connect to your live 3x-ui VPS panel (via the Nginx proxy) or use Demo Mode
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-white block">Use Simulated Demo Mode</span>
            <span className="text-[10px] text-slate-400">
              {apiConfig.useSimulatedData
                ? 'Pre-populated realistic VLESS Reality & traffic stats'
                : 'OFF — actions here affect your REAL 3x-ui panel'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={apiConfig.useSimulatedData}
            onChange={(e) => onUpdateApiConfig({ useSimulatedData: e.target.checked, isLoggedIn: false })}
            className="w-4 h-4 accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* API Credentials */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              3x-ui Panel Base URL {!apiConfig.useSimulatedData && <span className="text-slate-500 font-normal">(display only — routed via /xui-api proxy)</span>}
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                placeholder="https://my-vps.com:2053"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={apiConfig.useSimulatedData ? '••••••••' : 'Your 3x-ui password'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>3x-ui Server Session Authenticated Successfully!</span>
            </div>
          )}

          {testResult === 'failed' && errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* cURL Code Snippet */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              API cURL Test Command:
            </span>
            <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 font-mono overflow-x-auto">
              {curlSnippet}
            </pre>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
          >
            Close
          </button>
          {!apiConfig.useSimulatedData && apiConfig.isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 bg-rose-900/60 hover:bg-rose-800/70 text-rose-200 font-bold text-xs rounded-xl border border-rose-800"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isTesting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{isTesting ? 'Authenticating...' : 'Test & Save API'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
