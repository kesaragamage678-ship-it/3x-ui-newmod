import React, { useState } from 'react';
import {
  Send,
  Bot,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Bell,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  Copy,
  Terminal
} from 'lucide-react';
import { TelegramBotConfig, BackupRecord, Inbound, SystemStats } from '../types';

interface TelegramBotViewProps {
  config: TelegramBotConfig;
  onUpdateConfig: (updated: Partial<TelegramBotConfig>) => void;
  backups: BackupRecord[];
  onTriggerBackup: (type: 'auto_telegram' | 'manual_db' | 'json') => void;
  onDeleteBackup: (id: string) => void;
  onRestoreBackup: (file: File) => void;
  inbounds: Inbound[];
  stats: SystemStats;
}

export const TelegramBotView: React.FC<TelegramBotViewProps> = ({
  config,
  onUpdateConfig,
  backups,
  onTriggerBackup,
  onDeleteBackup,
  onRestoreBackup,
  inbounds,
  stats,
}) => {
  const [saved, setSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [testMsgStatus, setTestMsgStatus] = useState<string | null>(null);
  
  // Telegram Interactive Bot Chat Simulator State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; attachment?: string }>>([
    {
      sender: 'bot',
      text: '🤖 *3X-UI Admin Telegram Bot Ready*\nType /help or use the quick buttons below to interact with your VPS panel.',
      time: '12:00 PM',
    },
  ]);
  const [inputCommand, setInputCommand] = useState('');

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSendTestNotification = () => {
    setTestMsgStatus('sending');
    setTimeout(() => {
      setTestMsgStatus('sent');
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `🔔 *3X-UI Alert Test*\n\n✅ Telegram Bot Token & Chat ID verified successfully!\n🖥️ Server IP: ${stats.ipAddress}\n⚡ Xray Engine: ${stats.xrayState.toUpperCase()}\n📊 CPU: ${stats.cpu.toFixed(1)}% | RAM: ${(stats.memoryUsed / 1024 / 1024 / 1024).toFixed(2)} GB`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setTimeout(() => setTestMsgStatus(null), 3000);
    }, 1200);
  };

  const handleManualBackupToTelegram = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      onTriggerBackup('auto_telegram');
      setIsBackingUp(false);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `📦 *New 3X-UI Database Backup Created*\n\n📁 File: \`x-ui-backup-${new Date().toISOString().slice(0, 10)}.db\`\n📊 Inbounds: ${inbounds.length} ports\n👥 Total Clients: ${inbounds.reduce((acc, i) => acc + (i.settings.clients?.length || 0), 0)}\n⏰ Timestamp: ${new Date().toLocaleString()}`,
          attachment: `x-ui-backup-${new Date().toISOString().slice(0, 10)}.db`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1500);
  };

  const handleRunBotCommand = (cmd: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: cmd, time };
    
    let botReplyText = '';
    let attachmentName: string | undefined = undefined;

    const lowerCmd = cmd.trim().toLowerCase();
    if (lowerCmd === '/start' || lowerCmd === '/help') {
      botReplyText = `🤖 *3X-UI Telegram Bot Commands*\n\n` +
        `/status - Check CPU, RAM, Disk & Xray Core state\n` +
        `/backup - Generate & send SQLite database backup\n` +
        `/inbounds - List all active inbound ports & protocols\n` +
        `/clients - View active users & traffic usage\n` +
        `/restart - Restart Xray Core engine\n` +
        `/usage - Show bandwidth summary`;
    } else if (lowerCmd === '/status') {
      botReplyText = `📊 *3X-UI Server Status*\n\n` +
        `🟢 *Xray Core*: ${stats.xrayState.toUpperCase()} (${stats.xrayVersion})\n` +
        `💻 *CPU Load*: ${stats.cpu.toFixed(1)}%\n` +
        `🧠 *RAM Usage*: ${(stats.memoryUsed / 1024 / 1024 / 1024).toFixed(2)} GB / ${(stats.memoryTotal / 1024 / 1024 / 1024).toFixed(1)} GB\n` +
        `💾 *Disk*: ${(stats.diskUsed / 1024 / 1024 / 1024).toFixed(1)} GB / ${(stats.diskTotal / 1024 / 1024 / 1024).toFixed(1)} GB\n` +
        `🌐 *Traffic Up*: ${(stats.netTrafficUp / 1024 / 1024 / 1024).toFixed(1)} GB | *Down*: ${(stats.netTrafficDown / 1024 / 1024 / 1024).toFixed(1)} GB\n` +
        `⏱️ *Uptime*: ${Math.floor(stats.uptimeSeconds / 3600)}h ${Math.floor((stats.uptimeSeconds % 3600) / 60)}m`;
    } else if (lowerCmd === '/backup') {
      attachmentName = `x-ui-backup-${Date.now().toString().slice(-6)}.db`;
      botReplyText = `📁 *Database Backup Exported*\n\nAttached SQLite file \`${attachmentName}\` contains all inbounds, clients, SSL keys, and panel credentials.`;
      onTriggerBackup('auto_telegram');
    } else if (lowerCmd === '/inbounds') {
      const list = inbounds.map(i => `• *${i.remark}* (${i.protocol.toUpperCase()}:${i.port}) -> ${i.enable ? '🟢 Active' : '🔴 Disabled'}`).join('\n');
      botReplyText = `📡 *3X-UI Inbound List (${inbounds.length})*\n\n${list}`;
    } else if (lowerCmd === '/restart') {
      botReplyText = `🔄 *Restarting Xray Core Engine...*\n\n✅ Xray core restarted successfully! Status is now RUNNING.`;
    } else {
      botReplyText = `❓ Unknown command \`${cmd}\`. Type /help for available 3X-UI bot commands.`;
    }

    setChatMessages(prev => [...prev, userMsg, { sender: 'bot', text: botReplyText, time, attachment: attachmentName }]);
    setInputCommand('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestoreBackup(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/60 border border-blue-800/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Telegram Bot & Backup Center
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                3X-UI Native
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated database backups to Telegram, real-time alerts & interactive bot administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualBackupToTelegram}
            disabled={isBackingUp}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isBackingUp ? 'Sending Backup...' : 'Backup to Telegram Now'}</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <ShieldCheck className="w-4 h-4 text-cyan-400" />}
            <span>{saved ? 'Saved!' : 'Save Config'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Telegram Bot Token & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Token & Chat ID Config Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                Telegram Bot Credentials
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => onUpdateConfig({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                <span className="ml-2 text-xs font-semibold text-slate-300">
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Telegram Bot Token (from @BotFather)
                </label>
                <input
                  type="text"
                  value={config.botToken}
                  onChange={(e) => onUpdateConfig({ botToken: e.target.value })}
                  placeholder="e.g. 7829104812:AAH9xKzL2m_P3oR1vQ5..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Admin Telegram Chat ID / User ID
                </label>
                <input
                  type="text"
                  value={config.chatId}
                  onChange={(e) => onUpdateConfig({ chatId: e.target.value })}
                  placeholder="e.g. 10928374 or group chat ID -100xxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSendTestNotification}
                  disabled={testMsgStatus === 'sending'}
                  className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {testMsgStatus === 'sending' ? 'Sending Test...' : testMsgStatus === 'sent' ? 'Test Sent to Bot!' : 'Send Test Alert to Telegram'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup Schedule & Alert Options */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Automated Backup Schedule & Real-time Alerts
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Auto Database Backup Cron</span>
                  <span className="text-[11px] text-slate-400">Automatically packages SQLite x-ui.db & sends to Telegram</span>
                </div>
                <select
                  value={config.backupCron}
                  onChange={(e) => onUpdateConfig({ backupCron: e.target.value as any })}
                  className="bg-slate-900 border border-slate-700 text-cyan-300 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="off">Off (Manual only)</option>
                  <option value="6h">Every 6 Hours</option>
                  <option value="12h">Every 12 Hours</option>
                  <option value="daily">Daily at 00:00</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifyOnRestart}
                    onChange={(e) => onUpdateConfig({ notifyOnRestart: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-200">Alert on Xray Core Restart / Crash</span>
                </label>

                <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifyOnLogin}
                    onChange={(e) => onUpdateConfig({ notifyOnLogin: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-200">Alert on Panel Admin Login</span>
                </label>

                <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifyOnExpiration}
                    onChange={(e) => onUpdateConfig({ notifyOnExpiration: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-200">Alert on Client Expiration</span>
                </label>

                <label className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifyOnTrafficLimit}
                    onChange={(e) => onUpdateConfig({ notifyOnTrafficLimit: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span className="text-slate-200">Alert when Client Quota Full</span>
                </label>
              </div>
            </div>
          </div>

          {/* Backup History Table */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Database Backup Archive
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTriggerBackup('manual_db')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Create .db Backup</span>
                </button>

                <label className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-semibold text-[11px] rounded-lg border border-cyan-500/30 cursor-pointer transition-colors flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore .db File</span>
                  <input type="file" accept=".db,.json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="p-3">File Name</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Inbounds/Clients</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {backups.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-800/30 text-slate-300">
                      <td className="p-3 text-cyan-300 font-semibold flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                        {bk.filename}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(bk.createdAt).toLocaleDateString()} {new Date(bk.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {(bk.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="p-3 text-slate-300 text-[11px]">
                        {bk.inboundsCount} inb / {bk.clientsCount} users
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">
                          {bk.status === 'sent_to_telegram' ? 'Telegram Sent' : 'Ready'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const blob = new Blob([JSON.stringify({ backup: bk, inbounds }, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = bk.filename;
                              a.click();
                            }}
                            title="Download Backup"
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBackup(bk.id)}
                            title="Delete"
                            className="p-1 rounded bg-slate-800 hover:bg-red-950/50 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Live Telegram Bot Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[620px] rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
          
          {/* Telegram Chat Header */}
          <div className="p-3.5 bg-gradient-to-r from-blue-900/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 absolute bottom-0 right-0 border-2 border-slate-900"></div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  3X-UI Admin Telegram Bot
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h4>
                <p className="text-[10px] text-cyan-300 font-mono">@3xui_vps_admin_bot • Online</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
              ID: {config.chatId}
            </div>
          </div>

          {/* Chat Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/80 font-sans">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line font-mono text-[11px]">{msg.text}</div>

                  {msg.attachment && (
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="font-mono text-[11px] text-cyan-300 font-bold line-clamp-1">{msg.attachment}</p>
                          <p className="text-[9px] text-slate-400">SQLite Database • 2.4 MB</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">.DB</span>
                    </div>
                  )}

                  <div className={`text-[9px] font-mono text-right ${msg.sender === 'user' ? 'text-cyan-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Command Buttons */}
          <div className="p-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleRunBotCommand('/status')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 rounded-lg border border-slate-700 transition-colors whitespace-nowrap font-mono"
            >
              /status
            </button>
            <button
              onClick={() => handleRunBotCommand('/backup')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 rounded-lg border border-slate-700 transition-colors whitespace-nowrap font-mono"
            >
              /backup
            </button>
            <button
              onClick={() => handleRunBotCommand('/inbounds')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 rounded-lg border border-slate-700 transition-colors whitespace-nowrap font-mono"
            >
              /inbounds
            </button>
            <button
              onClick={() => handleRunBotCommand('/restart')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 rounded-lg border border-slate-700 transition-colors whitespace-nowrap font-mono"
            >
              /restart
            </button>
          </div>

          {/* Command Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputCommand.trim()) handleRunBotCommand(inputCommand);
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              placeholder="Type /status, /backup, /inbounds..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl font-bold transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
