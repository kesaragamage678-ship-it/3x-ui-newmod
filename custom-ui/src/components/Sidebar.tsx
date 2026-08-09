import React from 'react';
import {
  LayoutDashboard,
  Radio,
  Users,
  Palette,
  Settings2,
  Code2,
  Bot,
  Settings,
  Zap,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inboundsCount: number;
  totalClientsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  inboundsCount,
  totalClientsCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'System resources & Xray status',
    },
    {
      id: 'inbounds',
      label: 'Inbounds Manager',
      icon: Radio,
      badge: inboundsCount.toString(),
      description: 'VLESS, VMess, Trojan, SS',
    },
    {
      id: 'clients',
      label: 'Clients & Subscriptions',
      icon: Users,
      badge: totalClientsCount.toString(),
      description: 'Traffic quotas & config links',
    },
    {
      id: 'telegram-bot',
      label: 'Telegram Bot & Backups',
      icon: Bot,
      badge: 'HOT',
      badgeColor: 'bg-blue-600 text-white font-bold',
      description: 'Auto DB backups & bot commands',
    },
    {
      id: 'panel-settings',
      label: 'Panel & SSL Settings',
      icon: Settings,
      badge: null,
      description: 'Port, HTTPS, Acme.sh & Sub link',
    },
    {
      id: 'xray-settings',
      label: 'Xray Core Config',
      icon: Settings2,
      badge: null,
      description: 'Routing, Sniffing & Reality keys',
    },
    {
      id: 'customizer',
      label: '3x-ui Theme Customizer',
      icon: Palette,
      badge: 'NEW',
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold',
      description: 'Custom CSS, JS & Brand Styling',
    },
    {
      id: 'export-api',
      label: 'API & Export Code',
      icon: Code2,
      badge: null,
      description: 'cURL, Subscription & Install scripts',
    },
  ];


  return (
    <aside className="w-full lg:w-64 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-col justify-between">
      <div className="space-y-6">
        
        {/* Navigation Heading */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            3x-ui Control Center
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl font-medium text-xs transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/60 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.description}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Customization Quick Tip Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/30 border border-cyan-800/40">
          <div className="flex items-center gap-2 mb-1.5 text-cyan-300 font-medium text-xs">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span>Customizing 3x-ui Panel</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            Design your custom panel style in the <strong>Theme Builder</strong>, copy the generated CSS/JS code, and paste it into your 3x-ui settings!
          </p>
          <button
            onClick={() => setActiveTab('customizer')}
            className="w-full py-1.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Launch Theme Builder</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>3x-ui v2.4+ Ready</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">Xray 1.8.24</span>
      </div>
    </aside>
  );
};
