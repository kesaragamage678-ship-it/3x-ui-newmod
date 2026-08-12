import React, { useState, useEffect } from 'react';
import { X, User, Key, RefreshCw, Calendar, Wifi, Gauge, Check } from 'lucide-react';
import { Client } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>, isEdit: boolean) => void;
  editingClient?: Client | null;
  protocol?: string; // 'vless' | 'vmess' | 'trojan' | 'shadowsocks' — affects which fields show
}

const genUuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient,
  protocol = 'vless',
}) => {
  const [email, setEmail] = useState('');
  const [uuid, setUuid] = useState('');
  const [flow, setFlow] = useState('');
  const [limitIp, setLimitIp] = useState(0);
  const [totalGB, setTotalGB] = useState(0); // 0 = unlimited
  const [unlimitedQuota, setUnlimitedQuota] = useState(true);
  const [expiryDays, setExpiryDays] = useState(30);
  const [unlimitedExpiry, setUnlimitedExpiry] = useState(true);
  const [enable, setEnable] = useState(true);
  const [tgId, setTgId] = useState('');
  const [subId, setSubId] = useState('');

  useEffect(() => {
    if (editingClient) {
      setEmail(editingClient.email);
      setUuid(editingClient.uuid);
      setFlow(editingClient.flow || '');
      setLimitIp(editingClient.limitIp || 0);
      const gb = editingClient.totalBytes ? Math.round(editingClient.totalBytes / 1024 ** 3) : 0;
      setTotalGB(gb);
      setUnlimitedQuota(gb === 0);
      setUnlimitedExpiry(!editingClient.expiryTime || editingClient.expiryTime === 0);
      setExpiryDays(
        editingClient.expiryTime
          ? Math.max(1, Math.round((editingClient.expiryTime - Date.now()) / (24 * 60 * 60 * 1000)))
          : 30
      );
      setEnable(editingClient.enable);
      setTgId(editingClient.tgId || '');
      setSubId(editingClient.subId || '');
    } else {
      setEmail(`user_${Date.now().toString().slice(-5)}`);
      setUuid(genUuid());
      setFlow(protocol === 'vless' ? 'xtls-rprx-vision' : '');
      setLimitIp(0);
      setTotalGB(0);
      setUnlimitedQuota(true);
      setExpiryDays(30);
      setUnlimitedExpiry(true);
      setEnable(true);
      setTgId('');
      setSubId(Math.random().toString(36).substring(2, 10));
    }
  }, [editingClient, isOpen, protocol]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const clientData: Partial<Client> = {
      id: editingClient?.id || uuid,
      email,
      uuid,
      flow: flow || undefined,
      limitIp,
      totalBytes: unlimitedQuota ? 0 : totalGB * 1024 ** 3,
      expiryTime: unlimitedExpiry ? 0 : Date.now() + expiryDays * 24 * 60 * 60 * 1000,
      enable,
      tgId: tgId || undefined,
      subId: subId || Math.random().toString(36).substring(2, 10),
    };
    onSave(clientData, !!editingClient);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
            <p className="text-xs text-slate-400">{editingClient ? `Editing ${editingClient.email}` : 'Create a new VPN account'}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email / Remark</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              {protocol === 'trojan' || protocol === 'shadowsocks' ? 'Password' : 'UUID'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setUuid(genUuid())}
                className="px-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {protocol === 'vless' && (
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Flow</label>
              <select
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">None</option>
                <option value="xtls-rprx-vision">xtls-rprx-vision</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold flex items-center gap-1 mb-1">
                <Wifi className="w-3 h-3" /> IP Limit
              </label>
              <input
                type="number"
                min={0}
                value={limitIp}
                onChange={(e) => setLimitIp(parseInt(e.target.value) || 0)}
                placeholder="0 = unlimited"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold flex items-center gap-1 mb-1">
                <Gauge className="w-3 h-3" /> Telegram ID
              </label>
              <input
                type="text"
                value={tgId}
                onChange={(e) => setTgId(e.target.value)}
                placeholder="optional"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Traffic Quota</span>
              <label className="flex items-center gap-1.5 text-slate-400">
                <input type="checkbox" checked={unlimitedQuota} onChange={(e) => setUnlimitedQuota(e.target.checked)} className="accent-cyan-500" />
                Unlimited
              </label>
            </div>
            {!unlimitedQuota && (
              <input
                type="number"
                min={1}
                value={totalGB}
                onChange={(e) => setTotalGB(parseInt(e.target.value) || 0)}
                placeholder="GB"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Expiry
              </span>
              <label className="flex items-center gap-1.5 text-slate-400">
                <input type="checkbox" checked={unlimitedExpiry} onChange={(e) => setUnlimitedExpiry(e.target.checked)} className="accent-cyan-500" />
                No Expiry
              </label>
            </div>
            {!unlimitedExpiry && (
              <input
                type="number"
                min={1}
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
                placeholder="Days from now"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-300 font-semibold">Account Enabled</span>
            <input type="checkbox" checked={enable} onChange={(e) => setEnable(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            {editingClient ? 'Save Changes' : 'Create Client'}
          </button>
        </div>
      </div>
    </div>
  );
};
