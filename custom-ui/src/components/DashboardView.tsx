import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Power,
  RefreshCw,
  Radio,
  Users,
  ShieldAlert,
  Server,
  Zap,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { SystemStats, Inbound } from '../types';
import { formatBytes, formatSpeed } from '../data/mock3xui';

interface DashboardViewProps {
  stats: SystemStats;
  inbounds: Inbound[];
  onRestartXray: () => void;
  onToggleXrayState: () => void;
  onNavigateToInbounds: () => void;
  onNavigateToClients: () => void;
  onOpenQrCode: (inbound: Inbound) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  inbounds,
  onRestartXray,
  onToggleXrayState,
  onNavigateToInbounds,
  onNavigateToClients,
  onOpenQrCode,
}) => {
  // Live simulated bandwidth pulsing
  const [currentNetSpeedUp, setCurrentNetSpeedUp] = useState(stats.netSpeedUp);
  const [currentNetSpeedDown, setCurrentNetSpeedDown] = useState(stats.netSpeedDown);

  useEffect(() => {
    const interval = setInterval(() => {
      // Small variation to demonstrate live monitoring
      const upDelta = (Math.random() - 0.5) * 0.4 * 1024 * 1024;
      const downDelta = (Math.random() - 0.5) * 1.2 * 1024 * 1024;
      setCurrentNetSpeedUp(prev => Math.max(0.2 * 1024 * 1024, prev + upDelta));
      setCurrentNetSpeedDown(prev => Math.max(1.0 * 1024 * 1024, prev + downDelta));
    }, 2000);
    return () => clearInterval(interval);
  }, [stats]);

  const memPercent = Math.round((stats.memoryUsed / stats.memoryTotal) * 100);
  const diskPercent = Math.round((stats.diskUsed / stats.diskTotal) * 100);

  // Compute total clients across inbounds
  const totalClients = inbounds.reduce((acc, inb) => acc + (inb.settings.clients?.length || 0), 0);
  const activeInboundsCount = inbounds.filter(i => i.enable).length;

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-xs font-semibold">
              <Zap className="w-3 h-3 text-cyan-400" />
              Live Server Monitoring
            </span>
            <span className="text-xs text-slate-400">IP: <strong className="text-slate-200 font-mono">{stats.ipAddress}</strong></span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">3x-ui Core Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Xray Core {stats.xrayVersion} • Server Uptime: <strong className="text-emerald-400">{formatUptime(stats.uptimeSeconds)}</strong></p>
        </div>

        {/* Xray Control Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-2">
            <span className="text-xs font-medium text-slate-300">Xray Engine</span>
            <span className={`text-[11px] font-mono ${stats.xrayState === 'running' ? 'text-emerald-400' : 'text-rose-400'}`}>
              Status: {stats.xrayState.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onToggleXrayState}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
              stats.xrayState === 'running'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{stats.xrayState === 'running' ? 'Active Core' : 'Start Core'}</span>
          </button>
          <button
            onClick={onRestartXray}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Restart Xray Core"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CPU Utilization */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">CPU Usage</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-black text-white font-mono">{Math.round(stats.cpu * 10) / 10}%</span>
            <span className="text-[10px] text-slate-400">4 Cores vCPU</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${stats.cpu > 80 ? 'bg-rose-500' : stats.cpu > 50 ? 'bg-amber-500' : 'bg-cyan-400'}`}
              style={{ width: `${Math.min(100, Math.max(0, stats.cpu))}%` }}
            />
          </div>
        </div>

        {/* Memory RAM */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">RAM Memory</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-black text-white font-mono">{memPercent}%</span>
            <span className="text-[10px] text-slate-400">{formatBytes(stats.memoryUsed)} / {formatBytes(stats.memoryTotal)}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${memPercent > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${memPercent}%` }}
            />
          </div>
        </div>

        {/* Disk Storage */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">Disk Storage</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-black text-white font-mono">{diskPercent}%</span>
            <span className="text-[10px] text-slate-400">{formatBytes(stats.diskUsed)} / {formatBytes(stats.diskTotal)}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${diskPercent}%` }}
            />
          </div>
        </div>

        {/* Inbounds & Users Count */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Active Inbounds & Users</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-cyan-500/40" onClick={onNavigateToInbounds}>
              <div className="text-lg font-black text-cyan-300">{activeInboundsCount} / {inbounds.length}</div>
              <div className="text-[10px] text-slate-400">Inbounds</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-cyan-500/40" onClick={onNavigateToClients}>
              <div className="text-lg font-black text-emerald-300">{totalClients}</div>
              <div className="text-[10px] text-slate-400">Clients</div>
            </div>
          </div>
        </div>

      </div>

      {/* Real-time Bandwidth Speeds & Total Accumulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Real-time Speeds Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Network Speed</h3>
                <p className="text-xs text-slate-400">Real-time throughput speed</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Monitoring
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Upload Speed</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {formatSpeed(currentNetSpeedUp)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
                <span>Download Speed</span>
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {formatSpeed(currentNetSpeedDown)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Accumulated Traffic Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Total Network Traffic</h3>
                <p className="text-xs text-slate-400">Lifetime server bandwidth usage</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Sum: <strong className="text-indigo-300">{formatBytes(stats.netTrafficUp + stats.netTrafficDown)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Up Traffic</div>
              <div className="text-xl font-bold text-slate-100 font-mono">
                {formatBytes(stats.netTrafficUp)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Down Traffic</div>
              <div className="text-xl font-bold text-slate-100 font-mono">
                {formatBytes(stats.netTrafficDown)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Inbounds Status & Quick Links Overview */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Active Inbounds Summary
            </h3>
            <p className="text-xs text-slate-400">Inbound ports, protocols and connection settings</p>
          </div>
          <button
            onClick={onNavigateToInbounds}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1"
          >
            <span>Manage All Inbounds ({inbounds.length})</span>
            <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remark / Tag</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Port</th>
                <th className="py-2.5 px-3">Network / Security</th>
                <th className="py-2.5 px-3">Traffic (Up / Down)</th>
                <th className="py-2.5 px-3">Clients</th>
                <th className="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inbounds.map((inbound) => (
                <tr key={inbound.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inbound.enable ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {inbound.enable ? 'ACTIVE' : 'OFF'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {inbound.remark}
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      {inbound.protocol}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    :{inbound.port}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                    {inbound.streamSettings.network.toUpperCase()} / {inbound.streamSettings.security.toUpperCase()}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    <span className="text-emerald-400">↑ {formatBytes(inbound.up)}</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span className="text-cyan-400">↓ {formatBytes(inbound.down)}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {inbound.settings.clients?.length || 0} users
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onOpenQrCode(inbound)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-semibold rounded-lg text-[11px] transition-all border border-slate-700"
                    >
                      Get QR & Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
