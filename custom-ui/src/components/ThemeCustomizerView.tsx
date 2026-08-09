import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Copy,
  CheckCircle2,
  Download,
  Eye,
  Code,
  Layout,
  Type,
  Maximize2,
  ShieldCheck,
  Radio,
  Server,
  Zap,
  RefreshCw,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { ThemeConfig } from '../types';
import { themePresets } from '../data/mock3xui';

interface ThemeCustomizerViewProps {
  theme: ThemeConfig;
  onUpdateTheme: (updatedTheme: Partial<ThemeConfig>) => void;
  onResetTheme: () => void;
}

export const ThemeCustomizerView: React.FC<ThemeCustomizerViewProps> = ({
  theme,
  onUpdateTheme,
  onResetTheme,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'code' | 'instructions'>('visual');
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedJs, setCopiedJs] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState<'dashboard' | 'login'>('dashboard');

  const handleApplyPreset = (preset: ThemeConfig) => {
    onUpdateTheme(preset);
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(theme.customCss);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleCopyJs = () => {
    navigator.clipboard.writeText(theme.customJs);
    setCopiedJs(true);
    setTimeout(() => setCopiedJs(false), 2000);
  };

  const handleCopyFullInjection = () => {
    const fullCode = `/* === 3x-ui Custom CSS Injection === */\n${theme.customCss}\n\n/* === 3x-ui Custom JS Injection === */\n${theme.customJs}`;
    navigator.clipboard.writeText(fullCode);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleDownloadFiles = () => {
    // Download custom.css
    const cssBlob = new Blob([theme.customCss], { type: 'text/css' });
    const cssUrl = URL.createObjectURL(cssBlob);
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = 'custom.css';
    cssLink.click();

    // Download custom.js
    const jsBlob = new Blob([theme.customJs], { type: 'text/javascript' });
    const jsUrl = URL.createObjectURL(jsBlob);
    const jsLink = document.createElement('a');
    jsLink.href = jsUrl;
    jsLink.download = 'custom.js';
    jsLink.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              3x-ui Styling Engine
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">3x-ui Theme Customizer & Live Builder</h2>
          <p className="text-xs text-slate-400 mt-1">
            Design custom themes, brand colors, glassmorphism effects, and CSS/JS for your 3x-ui Xray panel instance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetTheme}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Styles</span>
          </button>

          <button
            onClick={handleDownloadFiles}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Theme Files</span>
          </button>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Quick Theme Presets:</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themePresets.map((preset) => {
            const isSelected = theme.presetName === preset.presetName;
            return (
              <button
                key={preset.presetName}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white truncate">{preset.presetName}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                </div>
                <div className="flex gap-1">
                  <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                  <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: preset.bgColor }} />
                  <span className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Builder Grid: Left Controls, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Style Controls */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-2 pb-2">
            <button
              onClick={() => setActiveSubTab('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'visual'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Visual Design</span>
            </button>
            <button
              onClick={() => setActiveSubTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'code'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>CSS / JS Injector</span>
            </button>
            <button
              onClick={() => setActiveSubTab('instructions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'instructions'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Installation Guide</span>
            </button>
          </div>

          {activeSubTab === 'visual' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
              
              {/* Branding Section */}
              <div className="space-y-3 pb-4 border-b border-slate-800">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Type className="w-4 h-4 text-cyan-400" />
                  Branding & Text
                </h3>
                
                <div>
                  <label className="text-slate-400 block mb-1">Custom Panel Title</label>
                  <input
                    type="text"
                    value={theme.panelTitle}
                    onChange={(e) => onUpdateTheme({ panelTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="e.g., 3x-ui VPN Panel"
                  />
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-3 pb-4 border-b border-slate-800">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  Color Palette
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Primary Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.primaryColor}
                        onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.bgColor}
                        onChange={(e) => onUpdateTheme({ bgColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.bgColor}
                        onChange={(e) => onUpdateTheme({ bgColor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout & Glassmorphism */}
              <div className="space-y-3">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Layout className="w-4 h-4 text-cyan-400" />
                  Layout & Glassmorphism
                </h3>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">Glassmorphism Blur</span>
                  <input
                    type="checkbox"
                    checked={theme.glassmorphism}
                    onChange={(e) => onUpdateTheme({ glassmorphism: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Blur Intensity</span>
                    <span className="font-mono text-cyan-300">{theme.blurIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={theme.blurIntensity}
                    onChange={(e) => onUpdateTheme({ blurIntensity: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Border Radius</label>
                  <select
                    value={theme.borderRadius}
                    onChange={(e) => onUpdateTheme({ borderRadius: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="6px">Sharp (6px)</option>
                    <option value="12px">Rounded (12px)</option>
                    <option value="16px">Extra Smooth (16px)</option>
                    <option value="24px">Pill / Curved (24px)</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {activeSubTab === 'code' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Code className="w-4 h-4 text-cyan-400" />
                  Custom CSS Injector
                </h3>
                <button
                  onClick={handleCopyCss}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
                >
                  {copiedCss ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCss ? 'Copied' : 'Copy CSS'}</span>
                </button>
              </div>

              <textarea
                value={theme.customCss}
                onChange={(e) => onUpdateTheme({ customCss: e.target.value })}
                rows={8}
                className="w-full bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center justify-between pt-2">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Code className="w-4 h-4 text-indigo-400" />
                  Custom JS Injector
                </h3>
                <button
                  onClick={handleCopyJs}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
                >
                  {copiedJs ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJs ? 'Copied' : 'Copy JS'}</span>
                </button>
              </div>

              <textarea
                value={theme.customJs}
                onChange={(e) => onUpdateTheme({ customJs: e.target.value })}
                rows={4}
                className="w-full bg-slate-950 font-mono text-[11px] text-indigo-300 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {activeSubTab === 'instructions' && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                How to apply custom theme in 3x-ui
              </h3>

              <ol className="space-y-3 list-decimal list-inside text-slate-300 leading-relaxed">
                <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <strong>Option A (Web UI Settings):</strong> Open your real 3x-ui Panel → Go to <strong>Panel Settings</strong> → Scroll to <strong>Custom CSS & Custom JS</strong> fields.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  Paste the generated CSS into the <strong>Custom CSS</strong> box and JS into the <strong>Custom JS</strong> box, then click <strong>Save Settings</strong> & Restart Panel.
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <strong>Option B (Server CLI / SSH):</strong> Download <code className="text-cyan-300 font-mono">custom.css</code> and place it in <code className="text-cyan-300 font-mono">/etc/x-ui/</code> directory on your Linux VPS server.
                </li>
              </ol>

              <button
                onClick={handleCopyFullInjection}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {copiedFull ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedFull ? 'All Code Copied!' : 'Copy Combined CSS & JS Code'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Live Interactive Preview Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Live 3x-ui Preview Canvas:</span>
            </span>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setPreviewViewMode('dashboard')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  previewViewMode === 'dashboard' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard View
              </button>
              <button
                onClick={() => setPreviewViewMode('login')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  previewViewMode === 'login' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Login Screen
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div
            className="rounded-2xl border p-6 min-h-[480px] transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: theme.bgColor,
              borderRadius: theme.borderRadius,
              borderColor: theme.borderColor,
            }}
          >
            {/* Top Navigation Mock */}
            <div
              className="flex items-center justify-between p-3.5 mb-6 rounded-xl border transition-all"
              style={{
                backgroundColor: theme.cardBg,
                backdropFilter: theme.glassmorphism ? `blur(${theme.blurIntensity}px)` : 'none',
                borderColor: theme.borderColor,
                borderRadius: theme.borderRadius,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-slate-950"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  ⚡
                </div>
                <span className="font-bold text-xs text-white" style={{ fontFamily: theme.fontFamily }}>
                  {theme.panelTitle}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800">
                  Xray v1.8.24 Running
                </span>
                <span className="text-slate-400 font-mono">admin</span>
              </div>
            </div>

            {previewViewMode === 'dashboard' ? (
              /* Simulated Dashboard View */
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className="p-3 rounded-xl border text-left"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <div className="text-[10px] text-slate-400">CPU Load</div>
                    <div className="text-base font-black text-white font-mono mt-0.5">18.4%</div>
                  </div>

                  <div
                    className="p-3 rounded-xl border text-left"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <div className="text-[10px] text-slate-400">Memory RAM</div>
                    <div className="text-base font-black font-mono mt-0.5" style={{ color: theme.primaryColor }}>
                      1.42 / 4 GB
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-xl border text-left"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <div className="text-[10px] text-slate-400">Net Traffic</div>
                    <div className="text-base font-black text-white font-mono mt-0.5">1.35 TB</div>
                  </div>
                </div>

                {/* Simulated Inbound Card */}
                <div
                  className="p-4 rounded-xl border text-left space-y-2"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.borderColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">⚡ US-East VLESS Reality</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      PORT 443
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    tcp / reality • SNI: itunes.apple.com
                  </div>
                  <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-white/10">
                    <span>3 Clients Active</span>
                    <button
                      className="px-2.5 py-1 rounded text-slate-950 font-bold"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Get Link
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Simulated Login Screen */
              <div className="max-w-xs mx-auto w-full my-auto space-y-4 text-center">
                <div
                  className="p-6 rounded-2xl border space-y-4"
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.borderColor,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center font-black text-lg text-slate-950 shadow-lg" style={{ backgroundColor: theme.primaryColor }}>
                    ⚡
                  </div>
                  <h3 className="font-black text-base text-white">{theme.panelTitle}</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Username"
                      disabled
                      className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      disabled
                      className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600"
                    />
                  </div>
                  <button
                    className="w-full py-2.5 font-bold text-xs text-slate-950 rounded-lg shadow-md"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Login to Panel
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Footer */}
            <div className="pt-4 border-t border-white/10 text-center text-[10px] text-slate-500">
              3x-ui Customized Preview Canvas • Style: {theme.presetName}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
