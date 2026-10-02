import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Search, 
  Layers, 
  SlidersHorizontal, 
  Scale, 
  CheckCircle2, 
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DiplomaLegislativo } from '../types/modules';

interface ModalSimuladorPowerlexProps {
  isOpen: boolean;
  onClose: () => void;
  termoPesquisaInicial?: string;
  diplomas: DiplomaLegislativo[];
  diplomaInicial?: DiplomaLegislativo | null;
}

/**
 * Gera a URL canónica simulada do Powerlex para um termo de pesquisa
 */
export const gerarUrlPowerlexPesquisa = (termo: string): string => {
  const t = termo.trim();
  if (!t) return 'https://powerlex.altec-csm.dev/#/';
  return `https://powerlex.altec-csm.dev/#/pesquisa?q=${encodeURIComponent(t)}`;
};

/**
 * Gera a URL canónica simulada do Powerlex para um diploma específico
 */
export const gerarUrlPowerlexDiploma = (diploma: DiplomaLegislativo): string => {
  if (diploma.linkPowerlex && diploma.linkPowerlex.startsWith('https://powerlex.altec-csm.dev/#/')) {
    return diploma.linkPowerlex;
  }
  const slug = diploma.numero
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://powerlex.altec-csm.dev/#/diploma/${slug}`;
};

export const ModalSimuladorPowerlex: React.FC<ModalSimuladorPowerlexProps> = ({
  isOpen,
  onClose,
  termoPesquisaInicial = '',
  diplomas,
  diplomaInicial = null
}) => {
  const [pesquisaLocal, setPesquisaLocal] = useState<string>(termoPesquisaInicial);
  const [copiadoUrlGeral, setCopiadoUrlGeral] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [diplomaAtivo, setDiplomaAtivo] = useState<DiplomaLegislativo | null>(diplomaInicial);
  const [copiadoLista, setCopiadoLista] = useState(false);

  // Sincronizar quando abre
  React.useEffect(() => {
    if (isOpen) {
      setPesquisaLocal(termoPesquisaInicial);
      setDiplomaAtivo(diplomaInicial);
      setCopiadoUrlGeral(false);
      setCopiadoId(null);
      setCopiadoLista(false);
    }
  }, [isOpen, termoPesquisaInicial, diplomaInicial]);

  if (!isOpen) return null;

  // Filtragem dos diplomas com base na pesquisa da simulação
  const resultadosSimulados = diplomas.filter(d => {
    if (!pesquisaLocal.trim()) return true;
    const q = pesquisaLocal.toLowerCase().trim();
    return (
      d.numero.toLowerCase().includes(q) ||
      d.titulo.toLowerCase().includes(q) ||
      d.descricao.toLowerCase().includes(q) ||
      d.tipo.toLowerCase().includes(q) ||
      (d.estadoVigencia && d.estadoVigencia.toLowerCase().includes(q)) ||
      d.temas.some(t => t.toLowerCase().includes(q))
    );
  });

  // URL simulada atual na barra de endereços
  const urlSimuladaAtual = diplomaAtivo 
    ? gerarUrlPowerlexDiploma(diplomaAtivo)
    : gerarUrlPowerlexPesquisa(pesquisaLocal);

  const handleCopiarUrlGeral = () => {
    navigator.clipboard.writeText(urlSimuladaAtual);
    setCopiadoUrlGeral(true);
    setTimeout(() => setCopiadoUrlGeral(false), 2500);
  };

  const handleCopiarUrlItem = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  const handleCopiarTodosUrls = () => {
    const texto = resultadosSimulados
      .map(d => `${d.numero} - ${d.titulo}\nPowerlex: ${gerarUrlPowerlexDiploma(d)}\nDRE: ${d.linkOficial}\n`)
      .join('\n');
    navigator.clipboard.writeText(texto);
    setCopiadoLista(true);
    setTimeout(() => setCopiadoLista(false), 3000);
  };

  const handleAbrirPowerlexReal = () => {
    // Copia a URL antes de abrir para garantia total
    navigator.clipboard.writeText(urlSimuladaAtual);
    setCopiadoUrlGeral(true);
    window.open(urlSimuladaAtual, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Top Header do Simulador */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Simulador de Pesquisa & Geração de URLs — Powerlex CSM
                </h3>
                <span className="text-[11px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-400/30">
                  SPA Hash Routing
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gera a rota canónica exata no Powerlex CSM (<span className="text-indigo-200 font-mono">https://powerlex.altec-csm.dev/#/</span>) e copia a URL pronta a utilizar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar simulador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Endereço Simulada (Browser Address Bar) */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 sm:px-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>URL Powerlex CSM:</span>
          </div>

          <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-2xs font-mono text-xs text-indigo-950 overflow-hidden">
            <span className="text-slate-400 mr-1 select-none">https://</span>
            <span className="truncate select-all text-indigo-900 font-semibold">
              {urlSimuladaAtual.replace(/^https?:\/\//, '')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopiarUrlGeral}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                copiadoUrlGeral
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title="Copiar URL gerada para a área de transferência"
            >
              {copiadoUrlGeral ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>URL Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar URL</span>
                </>
              )}
            </button>

            <a
              href={urlSimuladaAtual}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                try {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(urlSimuladaAtual);
                    setCopiadoUrlGeral(true);
                    setTimeout(() => setCopiadoUrlGeral(false), 2500);
                  }
                } catch {}
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
              title="Abrir a rota diretamente no Powerlex CSM (em nova aba). Copia também a URL canónica."
            >
              <span>Abrir no Powerlex</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Barra de Pesquisa Interativa da Simulação */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={pesquisaLocal}
                onChange={(e) => {
                  setPesquisaLocal(e.target.value);
                  setDiplomaAtivo(null);
                }}
                placeholder="Simular termo de pesquisa no Powerlex (ex: 112/2009, vítima, teleassistência)..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              {pesquisaLocal && (
                <button
                  onClick={() => {
                    setPesquisaLocal('');
                    setDiplomaAtivo(null);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopiarTodosUrls}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Copiar lista com o diploma e respetivas URLs do Powerlex e do DRE"
              >
                {copiadoLista ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Lista Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Todos os URLs ({resultadosSimulados.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {diplomaAtivo && (
            <div className="p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-lg flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold">Diploma focado na simulação:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200 truncate">
                  {diplomaAtivo.numero} — {diplomaAtivo.titulo}
                </span>
              </div>
              <button
                onClick={() => setDiplomaAtivo(null)}
                className="text-indigo-600 hover:text-indigo-950 font-medium ml-2 underline shrink-0 cursor-pointer"
              >
                Voltar à pesquisa global
              </button>
            </div>
          )}
        </div>

        {/* Corpo com Resultados Simulados */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Resultados encontrados na simulação: <strong className="text-slate-800">{resultadosSimulados.length}</strong> diplomas</span>
            <span>Clique num diploma para focar o URL ou no botão para copiar individualmente</span>
          </div>

          {resultadosSimulados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Nenhum resultado simulado para "{pesquisaLocal}".</p>
              <p className="text-xs text-slate-500">Experimente outro termo ou limpe o campo de pesquisa.</p>
            </div>
          ) : (
            resultadosSimulados.map((diploma) => {
              const urlItem = gerarUrlPowerlexDiploma(diploma);
              const isFocado = diplomaAtivo?.id === diploma.id;

              return (
                <div 
                  key={diploma.id}
                  onClick={() => setDiplomaAtivo(diploma)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                    isFocado 
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {diploma.numero}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          diploma.emVigor 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {diploma.estadoVigencia || (diploma.emVigor ? 'Em vigor' : 'Não vigente')}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          {diploma.tipo}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-1">
                        {diploma.titulo}
                      </p>

                      {/* URL Simulada deste item */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-900 bg-indigo-50/60 border border-indigo-100 rounded-md px-2.5 py-1">
                        <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{urlItem}</span>
                      </div>
                    </div>

                    {/* Ações por Item */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopiarUrlItem(urlItem, diploma.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          copiadoId === diploma.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        title="Copiar URL deste diploma no Powerlex"
                      >
                        {copiadoId === diploma.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-[11px] font-semibold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px]">Copiar URL</span>
                          </>
                        )}
                      </button>

                      <a
                        href={urlItem}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(urlItem);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-colors"
                        title="Abrir este diploma no Powerlex CSM"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3 text-indigo-600" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Origem:</span>
            <span>Powerlex CSM (Conselho Superior da Magistratura) & Diário da República</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer transition-colors text-xs"
            >
              Concluir
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
