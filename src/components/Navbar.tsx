import React from 'react';
import { 
  Shield, 
  FolderSearch, 
  FileSpreadsheet, 
  BarChart3, 
  Lock, 
  Laptop,
  Scale,
  Gavel,
  GraduationCap,
  PhoneCall,
  Activity
} from 'lucide-react';
import { ModuloApp } from '../types/modules';

interface NavbarProps {
  currentModule: ModuloApp;
  setCurrentModule: (module: ModuloApp) => void;
  currentTab: 'upload' | 'decisions' | 'stats' | 'admin';
  setCurrentTab: (tab: 'upload' | 'decisions' | 'stats' | 'admin') => void;
  totalDecisoes: number;
  totalProcessosMapeados: number;
  totalLegislacao: number;
  totalJurisprudencia?: number;
  totalDoutrina: number;
  totalContactos: number;
  isAdminUnlocked: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  setCurrentModule,
  currentTab,
  setCurrentTab,
  totalDecisoes,
  totalProcessosMapeados,
  totalLegislacao,
  totalJurisprudencia = 0,
  totalDoutrina,
  totalContactos,
  isAdminUnlocked
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Privacy & Legal disclaimer banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
            <Laptop className="w-3.5 h-3.5" />
            Processamento 100% no Dispositivo (Sem IA & Sem envio de ficheiros)
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Conforme RGPD e Segredo de Justiça</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-slate-800 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Firebase: vd-form
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Linha Principal: Brand e Módulos da Aplicação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 md:h-16 gap-3">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => {
              setCurrentModule('vd_numeros');
              setCurrentTab('upload');
            }}
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Plataforma Integrada <span className="text-indigo-800 font-serif italic text-base">Violência Doméstica</span>
              </h1>
              <p className="text-xs text-slate-500">
                Observatório judicial, legislação, doutrina e rede de apoio
              </p>
            </div>
          </div>

          {/* Os 5 Módulos Principais */}
          <nav className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {/* 1. Módulo: VD em números */}
            <button
              id="nav-module-vd-numeros"
              onClick={() => setCurrentModule('vd_numeros')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                currentModule === 'vd_numeros'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>VD em números</span>
              {totalDecisoes > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                  currentModule === 'vd_numeros' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {totalDecisoes}
                </span>
              )}
            </button>

            {/* 2. Módulo: Legislação */}
            <button
              id="nav-module-legislacao"
              onClick={() => setCurrentModule('legislacao')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                currentModule === 'legislacao'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Legislação</span>
              {totalLegislacao > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                  currentModule === 'legislacao' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {totalLegislacao}
                </span>
              )}
            </button>

            {/* 3. Módulo: Jurisprudência */}
            <button
              id="nav-module-jurisprudencia"
              onClick={() => setCurrentModule('jurisprudencia')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                currentModule === 'jurisprudencia'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-slate-100'
              }`}
            >
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Jurisprudência</span>
              {totalJurisprudencia > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                  currentModule === 'jurisprudencia' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {totalJurisprudencia}
                </span>
              )}
            </button>

            {/* 4. Módulo: Doutrina */}
            <button
              id="nav-module-doutrina"
              onClick={() => setCurrentModule('doutrina')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                currentModule === 'doutrina'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Doutrina</span>
              {totalDoutrina > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                  currentModule === 'doutrina' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {totalDoutrina}
                </span>
              )}
            </button>

            {/* 5. Módulo: Contactos úteis */}
            <button
              id="nav-module-contactos"
              onClick={() => setCurrentModule('contactos')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                currentModule === 'contactos'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-slate-100'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Contactos úteis</span>
              {totalContactos > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-mono ${
                  currentModule === 'contactos' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {totalContactos}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sub-Barra Específica do módulo "VD em números" com as 4 abas originais preservadas intactas */}
        {currentModule === 'vd_numeros' && (
          <div className="pt-1 pb-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
              <button
                id="nav-tab-upload"
                onClick={() => setCurrentTab('upload')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'upload'
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FolderSearch className="w-3.5 h-3.5 text-indigo-700" />
                <span>Processar Pasta</span>
              </button>

              <button
                id="nav-tab-decisions"
                onClick={() => setCurrentTab('decisions')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'decisions'
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
                <span>Formulários</span>
                {totalDecisoes > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-indigo-100 text-indigo-800 font-mono">
                    {totalDecisoes}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-stats"
                onClick={() => setCurrentTab('stats')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'stats'
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-700" />
                <span>Estatísticas</span>
              </button>

              <button
                id="nav-tab-admin"
                onClick={() => setCurrentTab('admin')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'border-slate-200 text-slate-700 hover:bg-amber-50/50'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${isAdminUnlocked ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>Área Admin</span>
                {totalProcessosMapeados > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-amber-100 text-amber-800 font-mono">
                    {totalProcessosMapeados}
                  </span>
                )}
              </button>
            </div>

            <div className="hidden sm:flex items-center text-xs text-slate-400 font-mono">
              <span>Módulo: VD em números</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
