import React from 'react';
import { X, ShieldCheck, LogOut } from 'lucide-react';
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
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await xuiApi.logout();
    } catch {
      // ignore -- we still navigate away regardless
    }
    onUpdateApiConfig({ isLoggedIn: false, lastSync: null });
    window.location.href = xuiApi.getBasePath();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Server Connection</h3>
            <p className="text-xs text-slate-400">Live session on this 3x-ui panel</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Username</span>
            <span className="text-white font-mono">{apiConfig.username || '-'}</span>
          </div>
          {apiConfig.lastSync && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Logged in</span>
              <span className="text-white font-mono">{apiConfig.lastSync}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 bg-rose-900/60 hover:bg-rose-800/70 text-rose-200 font-bold text-xs rounded-xl border border-rose-800 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
