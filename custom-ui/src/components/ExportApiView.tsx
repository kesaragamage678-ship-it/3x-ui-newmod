import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Copy,
  CheckCircle2,
  Download,
  Server,
  Key,
  Globe,
  FileJson
} from 'lucide-react';
import { Inbound, ApiServerConfig } from '../types';

interface ExportApiViewProps {
  inbounds: Inbound[];
  apiConfig: ApiServerConfig;
}

export const ExportApiView: React.FC<ExportApiViewProps> = ({
  inbounds,
  apiConfig,
}) => {
  const [copiedBash, setCopiedBash] = useState(false);
  const [copiedInboundsJson, setCopiedInboundsJson] = useState(false);

  const installBashScript = `bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)`;

  const inboundsJson = JSON.stringify(inbounds, null, 2);

  const handleCopyBash = () => {
    navigator.clipboard.writeText(installBashScript);
    setCopiedBash(true);
    setTimeout(() => setCopiedBash(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(inboundsJson);
    setCopiedInboundsJson(true);
    setTimeout(() => setCopiedInboundsJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([inboundsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '3xui_inbounds_backup.json';
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            API & Configuration Exporter
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            1-Click 3x-ui installation script, JSON backup export, and REST API commands
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bash Installation Script */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              3x-ui VPS 1-Click Install Command
            </h3>
            <button
              onClick={handleCopyBash}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
            >
              {copiedBash ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBash ? 'Copied' : 'Copy Bash'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
            {installBashScript}
          </pre>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Run this command on your clean Ubuntu / Debian / AlmaLinux VPS server as root to install the 3x-ui Xray core panel.
          </p>
        </div>

        {/* Inbounds JSON Backup */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileJson className="w-4 h-4 text-purple-400" />
              Inbounds Config JSON
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyJson}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
              >
                {copiedInboundsJson ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInboundsJson ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>

          <textarea
            readOnly
            rows={6}
            value={inboundsJson}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10px] text-purple-300 focus:outline-none resize-none"
          />
        </div>

      </div>

    </div>
  );
};
