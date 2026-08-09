import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Radio, Plus, Check, RefreshCw } from 'lucide-react';
import { Inbound, Protocol, NetworkType, SecurityType } from '../types';

interface InboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inboundData: Partial<Inbound>) => void;
  editingInbound?: Inbound | null;
}

export const InboundModal: React.FC<InboundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingInbound,
}) => {
  const [remark, setRemark] = useState('');
  const [port, setPort] = useState<number>(443);
  const [protocol, setProtocol] = useState<Protocol>('vless');
  const [network, setNetwork] = useState<NetworkType>('tcp');
  const [security, setSecurity] = useState<SecurityType>('reality');
  
  // Reality parameters
  const [sni, setSni] = useState('itunes.apple.com');
  const [publicKey, setPublicKey] = useState('6f_a9Xk2L3M0_pQv7W8z1rT4uI9oE2yU4iO');
  const [shortId, setShortId] = useState('6b1109a2');

  // WS parameters
  const [wsPath, setWsPath] = useState('/vmess-ws');

  // gRPC parameters
  const [grpcService, setGrpcService] = useState('trojan-grpc');

  // Client initial user
  const [clientEmail, setClientEmail] = useState('user1@3xui.net');
  const [clientUuid, setClientUuid] = useState('9f82d1a3-48e2-4b31-a890-7299a9b1c201');

  useEffect(() => {
    if (editingInbound) {
      setRemark(editingInbound.remark);
      setPort(editingInbound.port);
      setProtocol(editingInbound.protocol);
      setNetwork(editingInbound.streamSettings.network);
      setSecurity(editingInbound.streamSettings.security);
      if (editingInbound.streamSettings.realitySettings) {
        setSni(editingInbound.streamSettings.realitySettings.serverNames[0] || 'apple.com');
        setPublicKey(editingInbound.streamSettings.realitySettings.publicKey || '');
        setShortId(editingInbound.streamSettings.realitySettings.shortIds[0] || '');
      }
      if (editingInbound.streamSettings.wsSettings) {
        setWsPath(editingInbound.streamSettings.wsSettings.path);
      }
      if (editingInbound.streamSettings.grpcSettings) {
        setGrpcService(editingInbound.streamSettings.grpcSettings.serviceName);
      }
    } else {
      setRemark('⚡ VLESS Reality Inbound');
      setPort(Math.floor(1024 + Math.random() * 60000));
      setProtocol('vless');
      setNetwork('tcp');
      setSecurity('reality');
      setClientUuid(crypto.randomUUID());
    }
  }, [editingInbound, isOpen]);

  if (!isOpen) return null;

  const handleGenerateKeys = () => {
    setPublicKey('pub_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    setShortId(Math.random().toString(16).substring(2, 10));
    setClientUuid(crypto.randomUUID());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInboundData: Partial<Inbound> = {
      remark,
      port,
      protocol,
      enable: true,
      tag: `inbound-${port}`,
      streamSettings: {
        network,
        security,
        realitySettings: security === 'reality' ? {
          show: false,
          dest: `${sni}:443`,
          serverNames: [sni, `swdist.${sni}`],
          privateKey: 'priv_sample_key_' + Math.random().toString(36).substring(2, 10),
          publicKey: publicKey,
          shortIds: [shortId],
          maxTimeDiff: 60000,
        } : undefined,
        wsSettings: network === 'ws' ? { path: wsPath } : undefined,
        grpcSettings: network === 'grpc' ? { serviceName: grpcService } : undefined,
      },
      settings: {
        clients: editingInbound ? editingInbound.settings.clients : [
          {
            id: 'c_' + Date.now(),
            email: clientEmail,
            uuid: clientUuid,
            flow: protocol === 'vless' && security === 'reality' ? 'xtls-rprx-vision' : undefined,
            limitIp: 0,
            totalBytes: 0,
            upBytes: 0,
            downBytes: 0,
            expiryTime: 0,
            enable: true,
            subId: 'sub_' + Math.random().toString(36).substring(2, 8),
          }
        ],
      },
    };

    onSave(newInboundData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              {editingInbound ? 'Edit 3x-ui Inbound' : 'Add New Xray Inbound'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure port, protocol, reality security and client credentials
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Remark & Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-slate-300 font-semibold block mb-1">Remark / Tag Name</label>
              <input
                type="text"
                required
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. US VLESS Reality"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Port</label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Protocol Selection */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Protocol</label>
            <div className="grid grid-cols-4 gap-2">
              {(['vless', 'vmess', 'trojan', 'shadowsocks'] as Protocol[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProtocol(p)}
                  className={`py-2 px-2 rounded-xl font-bold uppercase transition-all ${
                    protocol === p ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Network & Security */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Network Transport</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as NetworkType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="tcp">TCP</option>
                <option value="ws">WebSocket (WS)</option>
                <option value="grpc">gRPC</option>
                <option value="h2">HTTP/2 (H2)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Security</label>
              <select
                value={security}
                onChange={(e) => setSecurity(e.target.value as SecurityType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="none">None</option>
                <option value="tls">TLS</option>
                <option value="reality">REALITY (Stealth)</option>
              </select>
            </div>
          </div>

          {/* REALITY Settings */}
          {security === 'reality' && (
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
              <div className="flex justify-between items-center text-cyan-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  REALITY Parameters
                </span>
                <button
                  type="button"
                  onClick={handleGenerateKeys}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto-Gen Keys
                </button>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target SNI (Dest Domain)</label>
                <input
                  type="text"
                  value={sni}
                  onChange={(e) => setSni(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div>
                  <label className="text-slate-400 block mb-1">Public Key</label>
                  <input
                    type="text"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-cyan-300 truncate"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Short ID</label>
                  <input
                    type="text"
                    value={shortId}
                    onChange={(e) => setShortId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-cyan-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* WebSocket Settings */}
          {network === 'ws' && (
            <div>
              <label className="text-slate-300 font-semibold block mb-1">WS Path</label>
              <input
                type="text"
                value={wsPath}
                onChange={(e) => setWsPath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          )}

          {/* Initial Client Info (If Creating) */}
          {!editingInbound && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-slate-300 font-semibold block">Initial User Client Account</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Client Email"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  value={clientUuid}
                  onChange={(e) => setClientUuid(e.target.value)}
                  placeholder="UUID / Password"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono truncate"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20"
            >
              Save Inbound
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
