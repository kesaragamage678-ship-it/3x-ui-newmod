import React from 'react';
import { ShieldCheck, Cpu, HardDrive, RefreshCw, Palette, Server, Globe, Power, Terminal, QrCode } from 'lucide-react';
import { SystemStats, ThemeConfig, ApiServerConfig } from '../types';
import { formatSpeed } from '../data/mock3xui';

interface HeaderProps {
  stats: SystemStats;
  theme: ThemeConfig;
  apiConfig: ApiServerConfig;
  onOpenApiModal: () => void;
  onRestartXray: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  theme,
  apiConfig,
  onOpenApiModal,
  onRestartXray,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-black text-xl overflow-hidden">
            {theme.customLogoUrl ? (
              <img src={theme.customLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 8 L20 34 L36 8"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 8 L20 18 L26 8"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.55"
                />
              </svg>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">{theme.panelTitle || '3X-UI MR.VPNXL'}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                Xray {stats.xrayVersion}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{apiConfig.baseUrl}</span>
              <span className="text-slate-600">•</span>
              <span className={apiConfig.useSimulatedData ? 'text-amber-400' : 'text-emerald-400'}>
                {apiConfig.useSimulatedData ? 'Demo Mode' : 'Connected'}
              </span>
            </p>
          </div>
        </div>

        {/* Live Network Bandwidth Ticker & Xray Status */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-300">
          
          <div className="hidden md:flex items-center gap-4 bg-slate-950/60 px-3.5 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="font-mono text-emerald-400">↑ {formatSpeed(stats.netSpeedUp)}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="font-mono text-cyan-400">↓ {formatSpeed(stats.netSpeedDown)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Xray State Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
              stats.xrayState === 'running'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
            }`}>
              <Power className={`w-3.5 h-3.5 ${stats.xrayState === 'running' ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span>{stats.xrayState === 'running' ? 'Xray Active' : 'Xray Stopped'}</span>
            </div>

            <button
              onClick={onRestartXray}
              title="Restart Xray Core"
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('customizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                activeTab === 'customizer'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-cyan-300" />
              <span>Theme Builder</span>
            </button>

            <button
              onClick={onOpenApiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>Server API</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
