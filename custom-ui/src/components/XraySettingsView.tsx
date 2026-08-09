import React, { useState } from 'react';
import {
  Settings2,
  Shield,
  Radio,
  FileCode2,
  Lock,
  RefreshCw,
  CheckCircle2,
  Save,
  AlertOctagon,
  Zap
} from 'lucide-react';
import { SystemStats } from '../types';

interface XraySettingsViewProps {
  stats: SystemStats;
  onRestartXray: () => void;
}

export const XraySettingsView: React.FC<XraySettingsViewProps> = ({
  stats,
  onRestartXray,
}) => {
  const [logLevel, setLogLevel] = useState('warning');
  const [blockBt, setBlockBt] = useState(true);
  const [blockAds, setBlockAds] = useState(true);
  const [sniffingEnabled, setSniffingEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            Xray Core Global Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Traffic routing rules, BitTorrent blocking, Ad filtering, and Sniffing configurations
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved Successfully!' : 'Save Xray Config'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Version & Logging */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Core Engine & Log Level
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Installed Xray Core Version</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  value={stats.xrayVersion}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono"
                />
                <button
                  onClick={onRestartXray}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors whitespace-nowrap"
                >
                  Restart Core
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Xray Log Level</label>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="debug">Debug (Verbose)</option>
                <option value="info">Info</option>
                <option value="warning">Warning (Recommended)</option>
                <option value="error">Error Only</option>
                <option value="none">None (Silent)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Traffic Rules */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            Routing & Protection Rules
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Block BitTorrent / P2P Traffic</span>
                <span className="text-[10px] text-slate-400">Protects VPS from DMCA copyright strike notices</span>
              </div>
              <input
                type="checkbox"
                checked={blockBt}
                onChange={(e) => setBlockBt(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Enable Ad-Block (geosite:category-ads-all)</span>
                <span className="text-[10px] text-slate-400">Filters malicious ad domains at server level</span>
              </div>
              <input
                type="checkbox"
                checked={blockAds}
                onChange={(e) => setBlockAds(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Traffic Sniffing (HTTP / TLS / QUIC)</span>
                <span className="text-[10px] text-slate-400">Inspects domain headers for accurate routing</span>
              </div>
              <input
                type="checkbox"
                checked={sniffingEnabled}
                onChange={(e) => setSniffingEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
