import React, { useState } from 'react';
import {
  Radio,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Pencil,
  UserPlus,
  Users,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Globe,
  Key,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { Inbound, Protocol, Client } from '../types';
import { formatBytes, generateConnectionLink } from '../data/mock3xui';

interface InboundsViewProps {
  inbounds: Inbound[];
  onAddInbound: () => void;
  onEditInbound: (inbound: Inbound) => void;
  onDeleteInbound: (id: number) => void;
  onToggleInbound: (id: number) => void;
  onOpenQrCode: (inbound: Inbound, clientEmail?: string) => void;
  onAddClient: (inboundId: number) => void;
  onDeleteClient: (inboundId: number, clientId: string) => void;
  onEditClient: (inbound: Inbound, client: Client) => void;
}

export const InboundsView: React.FC<InboundsViewProps> = ({
  inbounds,
  onAddInbound,
  onEditInbound,
  onDeleteInbound,
  onToggleInbound,
  onOpenQrCode,
  onAddClient,
  onDeleteClient,
  onEditClient,
}) => {
  const [filterProtocol, setFilterProtocol] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInboundId, setExpandedInboundId] = useState<number | null>(1); // default expand first
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const filteredInbounds = inbounds.filter((inb) => {
    const matchesProtocol = filterProtocol === 'all' || inb.protocol === filterProtocol;
    const matchesSearch =
      inb.remark.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inb.port.toString().includes(searchQuery) ||
      inb.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProtocol && matchesSearch;
  });

  const handleCopyLink = (inbound: Inbound, clientEmail?: string) => {
    const link = generateConnectionLink(inbound, clientEmail);
    navigator.clipboard.writeText(link);
    setCopiedLink(`${inbound.id}-${clientEmail || 'default'}`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            3x-ui Inbounds Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Xray protocol listeners (VLESS REALITY, VMess, Trojan, ShadowSocks)
          </p>
        </div>

        <button
          onClick={onAddInbound}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Inbound</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Protocol Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', 'vless', 'vmess', 'trojan', 'shadowsocks'].map((proto) => (
            <button
              key={proto}
              onClick={() => setFilterProtocol(proto)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterProtocol === proto
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {proto === 'all' ? 'All Protocols' : proto}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search remark or port..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Inbounds Cards List */}
      <div className="space-y-4">
        {filteredInbounds.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No inbounds found matching your filter criteria.
          </div>
        ) : (
          filteredInbounds.map((inbound) => {
            const isExpanded = expandedInboundId === inbound.id;
            const clients = inbound.settings.clients || [];

            return (
              <div
                key={inbound.id}
                className={`rounded-2xl border transition-all ${
                  inbound.enable
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-75'
                }`}
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Protocol Icon, Remark, Port & Tag */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl flex items-center justify-center font-bold text-xs font-mono uppercase ${
                      inbound.protocol === 'vless'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : inbound.protocol === 'vmess'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : inbound.protocol === 'trojan'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {inbound.protocol.slice(0, 4)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{inbound.remark}</h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          :{inbound.port}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-[11px]">
                          {inbound.streamSettings.network}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className={`font-mono uppercase px-2 py-0.5 rounded text-[11px] ${
                          inbound.streamSettings.security === 'reality'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold'
                            : inbound.streamSettings.security === 'tls'
                            ? 'bg-purple-950 text-purple-300'
                            : 'bg-slate-950 text-slate-400'
                        }`}>
                          Security: {inbound.streamSettings.security}
                        </span>
                        {inbound.streamSettings.realitySettings && (
                          <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                            <Key className="w-3 h-3" />
                            SNI: {inbound.streamSettings.realitySettings.serverNames[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Traffic Counter */}
                  <div className="flex items-center gap-6 text-xs text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-semibold">Total Usage</div>
                      <div className="font-mono text-white font-bold">
                        {formatBytes(inbound.up + inbound.down)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ↑{formatBytes(inbound.up)} / ↓{formatBytes(inbound.down)}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px] uppercase font-semibold">Clients</div>
                      <div className="font-mono text-cyan-300 font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{clients.length} Users</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center pt-2 md:pt-0">
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={() => onToggleInbound(inbound.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        inbound.enable
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {inbound.enable ? 'Enabled' : 'Disabled'}
                    </button>

                    {/* QR Code Button */}
                    <button
                      onClick={() => onOpenQrCode(inbound)}
                      className="p-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                      title="Show QR Code & Subscription Link"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEditInbound(inbound)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                      title="Edit Inbound Settings"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteInbound(inbound.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                      title="Delete Inbound"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand Clients Drawer Button */}
                    <button
                      onClick={() => setExpandedInboundId(isExpanded ? null : inbound.id)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors border border-slate-700"
                      title="Toggle Clients List"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                  </div>

                </div>

                {/* Expanded Drawer: Client Users & Credentials */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 rounded-b-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>Connected Clients / Users ({clients.length})</span>
                      </div>

                      <button
                        onClick={() => onAddClient(inbound.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Client User</span>
                      </button>
                    </div>

                    {clients.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl">
                        No clients registered for this inbound yet. Click "Add Client User" above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {clients.map((client) => {
                          const isCopied = copiedLink === `${inbound.id}-${client.email}`;
                          const isExpired = client.expiryTime > 0 && client.expiryTime < Date.now();

                          return (
                            <div
                              key={client.id}
                              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-2 text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{client.email}</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                                      client.enable && !isExpired
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                                    }`}>
                                      {isExpired ? 'EXPIRED' : client.enable ? 'ACTIVE' : 'OFF'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[200px]">
                                    UUID: {client.uuid}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleCopyLink(inbound, client.email)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors"
                                    title="Copy Connection String"
                                  >
                                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => onOpenQrCode(inbound, client.email)}
                                    className="p-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 rounded text-[11px] transition-colors"
                                    title="View QR Code"
                                  >
                                    <QrCode className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onEditClient(inbound, client)}
                                    className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded text-[11px] transition-colors"
                                    title="Edit Client"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteClient(inbound.id, client.id)}
                                    className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded text-[11px] transition-colors"
                                    title="Remove Client"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Traffic Quota Progress */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>Used: {formatBytes(client.upBytes + client.downBytes)}</span>
                                  <span>Quota: {client.totalBytes > 0 ? formatBytes(client.totalBytes) : 'Unlimited'}</span>
                                </div>
                                {client.totalBytes > 0 && (
                                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-cyan-400"
                                      style={{ width: `${Math.min(100, Math.round(((client.upBytes + client.downBytes) / client.totalBytes) * 100))}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
