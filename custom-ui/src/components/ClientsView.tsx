import React, { useState } from 'react';
import {
  Users,
  Search,
  Copy,
  CheckCircle2,
  QrCode,
  UserPlus,
  Trash2,
  Calendar,
  HardDrive,
  Radio,
  ExternalLink,
  ShieldAlert,
  Send,
  Zap,
  Filter
} from 'lucide-react';
import { Inbound, Client } from '../types';
import { formatBytes, generateConnectionLink, generateClashYaml, generateSingboxJson } from '../data/mock3xui';

interface ClientsViewProps {
  inbounds: Inbound[];
  onOpenQrCode: (inbound: Inbound, clientEmail?: string) => void;
  onAddClient: (inboundId: number) => void;
  onDeleteClient: (inboundId: number, clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  inbounds,
  onOpenQrCode,
  onAddClient,
  onDeleteClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'raw' | 'clash' | 'singbox'>('raw');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Flatten all clients across inbounds
  const allClientsWithInbound = inbounds.flatMap((inbound) => {
    return (inbound.settings.clients || []).map((client) => ({
      client,
      inbound,
    }));
  });

  const filteredClients = allClientsWithInbound.filter(({ client, inbound }) => {
    const query = searchQuery.toLowerCase();
    return (
      client.email.toLowerCase().includes(query) ||
      client.uuid.toLowerCase().includes(query) ||
      inbound.remark.toLowerCase().includes(query)
    );
  });

  const handleCopyLink = (inbound: Inbound, client: Client, format: 'raw' | 'clash' | 'singbox') => {
    let textToCopy = '';
    if (format === 'raw') {
      textToCopy = generateConnectionLink(inbound, client.email);
    } else if (format === 'clash') {
      textToCopy = generateClashYaml(inbound, client.email);
    } else if (format === 'singbox') {
      textToCopy = generateSingboxJson(inbound, client.email);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(`${inbound.id}-${client.id}-${format}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Clients & Subscription Manager
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage user accounts, traffic quotas, expiry dates, and config links for Clash, Sing-Box & Shadowrocket
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
            Total Users: <strong className="text-white">{allClientsWithInbound.length}</strong>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Export Format Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs">
        
        {/* Config Link Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Copy Format:</span>
          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedFormat('raw')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                selectedFormat === 'raw' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct Link (vless://)
            </button>
            <button
              onClick={() => setSelectedFormat('clash')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                selectedFormat === 'clash' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clash Meta YAML
            </button>
            <button
              onClick={() => setSelectedFormat('singbox')}
              className={`px-3 py-1 rounded font-bold transition-colors ${
                selectedFormat === 'singbox' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sing-Box JSON
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search email, UUID or inbound..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No client accounts match your search query.
          </div>
        ) : (
          filteredClients.map(({ client, inbound }) => {
            const isExpired = client.expiryTime > 0 && client.expiryTime < Date.now();
            const usedBytes = client.upBytes + client.downBytes;
            const isCopied = copiedKey === `${inbound.id}-${client.id}-${selectedFormat}`;
            const quotaPercent = client.totalBytes > 0 ? Math.min(100, Math.round((usedBytes / client.totalBytes) * 100)) : 0;

            return (
              <div
                key={`${inbound.id}-${client.id}`}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Bar: Email & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{client.email}</h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Radio className="w-3 h-3 text-cyan-400" />
                        <span className="font-semibold text-slate-300">{inbound.remark}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isExpired
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : client.enable
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isExpired ? 'EXPIRED' : client.enable ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>

                  {/* UUID Credentials */}
                  <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-400 truncate">
                    <span className="text-slate-500">UUID: </span>
                    <span className="text-cyan-300">{client.uuid}</span>
                  </div>

                  {/* Expiry Date & IP Limit */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {client.expiryTime > 0
                          ? new Date(client.expiryTime).toLocaleDateString()
                          : 'Unlimited Expiry'}
                      </span>
                    </span>

                    <span>Limit: {client.limitIp > 0 ? `${client.limitIp} IPs` : 'No IP Limit'}</span>
                  </div>
                </div>

                {/* Traffic Usage Progress */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Bandwidth Used</span>
                    <span className="font-mono text-white font-bold">
                      {formatBytes(usedBytes)} {client.totalBytes > 0 && `/ ${formatBytes(client.totalBytes)}`}
                    </span>
                  </div>

                  {client.totalBytes > 0 && (
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${quotaPercent > 90 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                        style={{ width: `${quotaPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCopyLink(inbound, client, selectedFormat)}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-lg text-xs transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Config'}</span>
                  </button>

                  <button
                    onClick={() => onOpenQrCode(inbound, client.email)}
                    className="p-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 rounded-lg text-xs transition-colors border border-slate-700"
                    title="Generate QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteClient(inbound.id, client.id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg text-xs transition-colors border border-slate-700"
                    title="Delete User Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
