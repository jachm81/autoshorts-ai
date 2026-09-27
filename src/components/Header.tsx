import React from 'react';
import { 
  Globe, 
  Search, 
  KeyRound, 
  Code2, 
  FileText, 
  Sparkles,
  Layers
} from 'lucide-react';
import { SeoTab } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: SeoTab;
  onTabChange: (tab: SeoTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'audit' as SeoTab, label: 'Auditoría On-Page', icon: Globe },
    { id: 'serp' as SeoTab, label: 'Simulador SERP & Metas', icon: Search },
    { id: 'keywords' as SeoTab, label: 'Palabras Clave', icon: KeyRound },
    { id: 'schema' as SeoTab, label: 'Schema JSON-LD', icon: Code2 },
    { id: 'robots-sitemap' as SeoTab, label: 'Robots & Sitemap', icon: Layers },
    { id: 'content' as SeoTab, label: 'Optimizador de Contenido', icon: Sparkles },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  Herramientas SEO
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Suite Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Auditoría on-page, SERP, palabras clave y optimización
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Motor SEO activo</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-button-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors rounded-t-lg ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
