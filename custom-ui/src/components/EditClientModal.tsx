import React, { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { Client, Inbound } from '../types';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  inbound: Inbound | null;
  client: Client | null;
  onSave: (inboundId: number, updatedClient: Client) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  inbound,
  client,
  onSave,
}) => {
  const [email, setEmail] = useState('');
  const [limitIp, setLimitIp] = useState(0);
  const [totalGB, setTotalGB] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [enable, setEnable] = useState(true);
  const [flow, setFlow] = useState('');

  useEffect(() => {
    if (client) {
      setEmail(client.email);
      setLimitIp(client.limitIp || 0);
      setTotalGB(client.totalBytes ? Math.round(client.totalBytes / 1024 ** 3) : 0);
      setExpiryDate(client.expiryTime ? new Date(client.expiryTime).toISOString().slice(0, 10) : '');
      setEnable(client.enable);
      setFlow(client.flow || '');
    }
  }, [client]);

  if (!isOpen || !inbound || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(inbound.id, {
      ...client,
      email,
      limitIp,
      totalBytes: totalGB * 1024 ** 3,
      expiryTime: expiryDate ? new Date(expiryDate).getTime() : 0,
      enable,
      flow: flow || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
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
            <h3 className="font-bold text-white text-base">Edit Client</h3>
            <p className="text-xs text-slate-400">{inbound.remark} &middot; {inbound.protocol.toUpperCase()}</p>
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
              required
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              UUID / Password <span className="text-slate-500 font-normal">(read-only)</span>
            </label>
            <input
              type="text"
              value={client.uuid}
              disabled
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-500 font-mono text-[11px] cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">IP Limit</label>
              <input
                type="number"
                min={0}
                value={limitIp}
                onChange={(e) => setLimitIp(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">0 = unlimited</p>
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Data Limit (GB)</label>
              <input
                type="number"
                min={0}
                value={totalGB}
                onChange={(e) => setTotalGB(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">0 = unlimited</p>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Leave blank for no expiry</p>
          </div>

          {inbound.protocol === 'vless' && (
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

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-300 font-semibold">Client Enabled</span>
            <input
              type="checkbox"
              checked={enable}
              onChange={(e) => setEnable(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
