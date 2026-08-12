import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, CheckCircle2, Download, QrCode as QrIcon, Smartphone, Globe, Code2 } from 'lucide-react';
import { Inbound } from '../types';
import { generateConnectionLink, generateClashYaml, generateSingboxJson } from '../data/mock3xui';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inbound: Inbound | null;
  clientEmail?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  inbound,
  clientEmail,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeFormat, setActiveFormat] = useState<'vless' | 'clash' | 'singbox'>('vless');
  const [copied, setCopied] = useState(false);

  const connectionLink = isOpen && inbound ? generateConnectionLink(inbound, clientEmail) : '';

  useEffect(() => {
    if (canvasRef.current && connectionLink) {
      QRCode.toCanvas(canvasRef.current, connectionLink, {
        width: 220,
        margin: 2,
        color: {
          dark: '#00f2fe',
          light: '#0a0d14',
        },
      }, (err) => {
        if (err) console.error('QR Code generation error:', err);
      });
    }
  }, [connectionLink]);

  if (!isOpen || !inbound) return null;

  const clashYaml = generateClashYaml(inbound, clientEmail);
  const singboxJson = generateSingboxJson(inbound, clientEmail);

  const displayString = activeFormat === 'vless' ? connectionLink : activeFormat === 'clash' ? clashYaml : singboxJson;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        
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
            <QrIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Client Connection QR Code</h3>
            <p className="text-xs text-slate-400">
              {inbound.remark} {clientEmail && `• ${clientEmail}`}
            </p>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveFormat('vless')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeFormat === 'vless' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            VLESS / Raw
          </button>
          <button
            onClick={() => setActiveFormat('clash')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeFormat === 'clash' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Clash Meta
          </button>
          <button
            onClick={() => setActiveFormat('singbox')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              activeFormat === 'singbox' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sing-Box
          </button>
        </div>

        {/* QR Code Canvas */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800">
          <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            Scan with Shadowrocket, v2rayN, V2Box, or Clash
          </p>
        </div>

        {/* Display Code Box */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Connection String:</span>
            <button
              onClick={handleCopy}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy String'}</span>
            </button>
          </div>

          <textarea
            readOnly
            rows={3}
            value={displayString}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-cyan-300 focus:outline-none resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Connection Code'}</span>
        </button>

      </div>
    </div>
  );
};
