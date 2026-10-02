import React, { useState, useMemo } from 'react';
import { 
  Gavel, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Filter, 
  Tag, 
  Calendar, 
  Building2, 
  User, 
  BookOpen, 
  Award, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  CheckCircle2, 
  X, 
  Sparkles,
  Layers,
  FileText,
  Globe,
  Trash2
} from 'lucide-react';
import { AcordaoJurisprudencia, TribunalJurisprudencia } from '../types/modules';
import { 
  ordenarAcordaosPorData, 
  extrairDescritoresPorLetra, 
  filtrarAcordaos, 
  executarVarreduraCSM,
  formatarUrlCsmEcli
} from '../services/csmScraper';

import { salvarAcordaoJurisprudencia } from '../lib/firebase';

interface JurisprudenciaViewProps {
  acordaos: AcordaoJurisprudencia[];
  onAtualizarAcordaos?: (lista: AcordaoJurisprudencia[]) => void;
  onLimparJurisprudencia?: () => Promise<void>;
}

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const JurisprudenciaView: React.FC<JurisprudenciaViewProps> = ({
  acordaos: acordaosProp,
  onAtualizarAcordaos,
  onLimparJurisprudencia
}) => {
  const [acordaos, setAcordaos] = useState<AcordaoJurisprudencia[]>(acordaosProp);
  const [pesquisa, setPesquisa] = useState('');
  const [tribunalFiltro, setTribunalFiltro] = useState<string>('todos');
  
  // Estado dos Descritores (A-Z)
  const [letraAtiva, setLetraAtiva] = useState<string | null>('V'); // Inicia com 'V' para acesso imediato a "VIOLÊNCIA DOMÉSTICA"
  const [descritoresSelecionados, setDescritoresSelecionados] = useState<string[]>([]);
  
  // Estado de Varredura / Sincronização CSM
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Expandir/Recolher sumários completos
  const [sumariosExpandidos, setSumariosExpandidos] = useState<Record<string, boolean>>({});

  // Sincronizar estado interno caso as props mudem
  React.useEffect(() => {
    if (acordaosProp) {
      setAcordaos(acordaosProp);
    }
  }, [acordaosProp]);

  // Extrair descritores por letra de forma determinística
  const { porLetra, contagemPorDescritor, totalDescritores } = useMemo(() => {
    return extrairDescritoresPorLetra(acordaos);
  }, [acordaos]);

  // Filtragem determinística dos acórdãos
  const acordaosFiltrados = useMemo(() => {
    return filtrarAcordaos(acordaos, descritoresSelecionados, pesquisa, tribunalFiltro);
  }, [acordaos, descritoresSelecionados, pesquisa, tribunalFiltro]);

  // 1. DESTAQUES PERMANENTES:
  // - Acórdãos do Supremo Tribunal de Justiça Uniformizadores (AUJ)
  // - Acórdãos do Tribunal Constitucional com Força Obrigatória Geral
  const acordaosDestaquePermanente = useMemo(() => {
    return acordaosFiltrados.filter(a => a.isDestaquePermanente);
  }, [acordaosFiltrados]);

  // 2. TODOS OS RESTANTES ACÓRDÃOS:
  // - Ordenados estritamente por data, do mais recente ao mais antigo
  const acordaosRestantesCronologicos = useMemo(() => {
    const restantes = acordaosFiltrados.filter(a => !a.isDestaquePermanente);
    return ordenarAcordaosPorData(restantes);
  }, [acordaosFiltrados]);

  // Executar Varredura no portal CSM
  const handleExecutarVarredura = async () => {
    setSincronizando(true);
    setMensagemSucesso(null);
    try {
      // Simulação auditável e determinística da varredura externa
      const resultado = await executarVarreduraCSM(acordaos);
      setAcordaos(resultado.acordaos);
      
      // Persistir os resultados da varredura no Firestore
      for (const ac of resultado.acordaos) {
        await salvarAcordaoJurisprudencia(ac).catch(() => {});
      }

      if (onAtualizarAcordaos) {
        onAtualizarAcordaos(resultado.acordaos);
      }
      setMensagemSucesso(
        `Varredura concluída no portal CSM: ${resultado.totalAcordaos} acórdãos catalogados (${resultado.totalUniformizadoresOuTC} com força vinculativa/AUJ e ${resultado.totalRestantes} ordenados cronologicamente).`
      );
      setTimeout(() => setMensagemSucesso(null), 7000);
    } catch (err) {
      console.error('Erro na varredura CSM:', err);
    } finally {
      setSincronizando(false);
    }
  };

  const handleLimparTodosDados = async () => {
    const confirmacao = window.confirm(
      'Tem a certeza de que pretende eliminar todos os dados do módulo de Jurisprudência?\n\nEsta ação irá remover permanentemente todos os acórdãos do repositório ativo e da cache.'
    );
    if (!confirmacao) return;

    if (onLimparJurisprudencia) {
      await onLimparJurisprudencia();
    }
    setMensagemSucesso('Todos os registos do módulo de Jurisprudência foram eliminados.');
    setTimeout(() => setMensagemSucesso(null), 5000);
  };

  // Alternar seleção de um descritor
  const handleToggleDescritor = (descritor: string) => {
    if (descritoresSelecionados.includes(descritor)) {
      setDescritoresSelecionados(descritoresSelecionados.filter(d => d !== descritor));
    } else {
      setDescritoresSelecionados([...descritoresSelecionados, descritor]);
    }
  };

  const handleRemoverDescritor = (descritor: string) => {
    setDescritoresSelecionados(descritoresSelecionados.filter(d => d !== descritor));
  };

  const handleLimparTodosDescritores = () => {
    setDescritoresSelecionados([]);
  };

  const handleCopiarTexto = (texto: string, id: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(texto);
        setCopiadoId(id);
        setTimeout(() => setCopiadoId(null), 2500);
      }
    } catch (err) {
      console.warn('Falha ao copiar texto:', err);
    }
  };

  const toggleSumario = (id: string) => {
    setSumariosExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* ========================================================================= */}
      {/* 1. BARRA PRINCIPAL & CABEÇALHO DO MÓDULO */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold">
              <Gavel className="w-3.5 h-3.5 text-indigo-700" />
              <span>Portal Oficial • jurisprudencia.csm.org.pt</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Jurisprudência sobre Violência Doméstica
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Varredura de acórdãos dos Tribunais Superiores portugueses (STJ, TC e Relações de Lisboa, Porto, Coimbra, Évora e Guimarães), com indexação ECLI e destaque de jurisprudência uniformizada.
            </p>
          </div>

          {/* Botão de Varredura no Portal CSM */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="btn-varredura-csm"
              onClick={handleExecutarVarredura}
              disabled={sincronizando}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                sincronizando
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-900 text-white hover:bg-indigo-800 active:scale-98'
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${sincronizando ? 'animate-spin' : ''}`} />
              <span>{sincronizando ? 'A varrer portal CSM...' : 'Executar Varredura no Portal CSM'}</span>
            </button>

            <a
              href="https://jurisprudencia.csm.org.pt/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              <span>Abrir Portal CSM</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {onLimparJurisprudencia && (
              <button
                id="btn-limpar-modulo-jurisprudencia"
                onClick={handleLimparTodosDados}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                title="Eliminar todos os registos do módulo Jurisprudência"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Eliminar Dados</span>
              </button>
            )}
          </div>
        </div>

        {/* Notificação de Sucesso da Varredura */}
        {mensagemSucesso && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-emerald-950">Sincronização com o CSM Concluída</span>
              <p className="text-emerald-800">{mensagemSucesso}</p>
            </div>
          </div>
        )}

        {/* Barra de Pesquisa e Filtro de Tribunal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar por n.º de processo, relator, ECLI, palavras do sumário..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {pesquisa && (
              <button
                onClick={() => setPesquisa('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={tribunalFiltro}
              onChange={(e) => setTribunalFiltro(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-slate-700"
            >
              <option value="todos">Todos os Tribunais ({acordaos.length})</option>
              <option value="STJ">Supremo Tribunal de Justiça</option>
              <option value="TC">Tribunal Constitucional</option>
              <option value="TRL">Tribunal da Relação de Lisboa</option>
              <option value="TRP">Tribunal da Relação do Porto</option>
              <option value="TRC">Tribunal da Relação de Coimbra</option>
              <option value="TRE">Tribunal da Relação de Évora</option>
              <option value="TRG">Tribunal da Relação de Guimarães</option>
            </select>
          </div>
        </div>

        {/* Resolução Canónica Oficial do CSM */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-950 bg-indigo-50/80 border border-indigo-200/80 rounded-lg px-2.5 py-1">
            <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Resolução canónica CSM: <strong className="text-indigo-900">https://jurisprudencia.csm.org.pt/ecli/[ECLI]/</strong></span>
          </div>
          <span className="text-slate-500 text-[11px]">Cada acórdão dispõe de link canónico direto e botão de cópia de URL com um clique.</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ÁREA DE DESCRITORES DE "A" A "Z" (REQUISITO EXPLÍCITO DO UTILIZADOR)    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Índice Alfabético de Descritores (A a Z)
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {totalDescritores} termos
            </span>
          </div>

          {descritoresSelecionados.length > 0 && (
            <button
              onClick={handleLimparTodosDescritores}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtros de descritores ({descritoresSelecionados.length})</span>
            </button>
          )}
        </div>

        {/* Linha Horizontal com os botões de A a Z */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
          <div className="flex items-center gap-1.5 min-w-max">
            {ALFABETO.map(letra => {
              const termosDaLetra = porLetra[letra] || [];
              const temTermos = termosDaLetra.length > 0;
              const isAtiva = letraAtiva === letra;
              const temSelecionadoNestaLetra = termosDaLetra.some(t => descritoresSelecionados.includes(t));

              return (
                <button
                  key={letra}
                  id={`btn-alfabeto-${letra}`}
                  disabled={!temTermos}
                  onClick={() => setLetraAtiva(isAtiva ? null : letra)}
                  className={`w-8 h-9 rounded-lg text-xs font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                    !temTermos
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
                      : isAtiva
                      ? 'bg-indigo-900 text-white shadow-2xs scale-105 ring-2 ring-indigo-300'
                      : temSelecionadoNestaLetra
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                  title={temTermos ? `${letra}: ${termosDaLetra.length} descritores` : `${letra}: Nenhum descritor`}
                >
                  <span>{letra}</span>
                  {temSelecionadoNestaLetra && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-1"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel Expansível de Descritores da Letra Selecionada */}
        {letraAtiva && porLetra[letraAtiva] && porLetra[letraAtiva].length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                Descritores começados pela letra «{letraAtiva}» ({porLetra[letraAtiva].length}):
              </span>
              <span className="text-[11px] text-slate-500 italic">
                Clique num ou mais descritores para filtrar os acórdãos
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {porLetra[letraAtiva].map(descritor => {
                const selecionado = descritoresSelecionados.includes(descritor);
                const qtd = contagemPorDescritor[descritor] || 0;

                return (
                  <button
                    key={descritor}
                    onClick={() => handleToggleDescritor(descritor)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selecionado
                        ? 'bg-indigo-900 text-white shadow-2xs ring-1 ring-indigo-950 font-semibold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <span>{descritor}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      selecionado ? 'bg-indigo-800 text-amber-300' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {qtd}
                    </span>
                    {selecionado && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chips de Descritores Atualmente Selecionados para Filtragem */}
        {descritoresSelecionados.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filtro ativo:</span>
            {descritoresSelecionados.map(sel => (
              <span
                key={sel}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium"
              >
                <span>{sel}</span>
                <button
                  onClick={() => handleRemoverDescritor(sel)}
                  className="w-4 h-4 rounded hover:bg-indigo-200 flex items-center justify-center text-indigo-700"
                  title="Remover este descritor"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <span className="text-xs text-slate-500 font-mono">
              ({acordaosFiltrados.length} acórdãos encontrados)
            </span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. SECÇÃO DE DESTAQUE PERMANENTE:                                         */}
      {/*    - ACÓRDÃOS UNIFORMIZADORES DO STJ (AUJ)                                */}
      {/*    - ACÓRDÃOS DO TRIBUNAL CONSTITUCIONAL COM FORÇA OBRIGATÓRIA GERAL      */}
      {/* ========================================================================= */}
      {acordaosDestaquePermanente.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900 shadow-2xs">
                <Award className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Destaque Permanente</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 uppercase">
                    Eficácia Vinculativa Superior
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Acórdãos de Fixação de Jurisprudência do STJ e Decisões do Tribunal Constitucional com Força Obrigatória Geral
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {acordaosDestaquePermanente.length} acórdãos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {acordaosDestaquePermanente.map((acordao) => {
              const expandido = !!sumariosExpandidos[acordao.id];
              const isTC = acordao.tribunalSigla === 'TC';

              return (
                <article
                  key={acordao.id}
                  id={`acordao-destaque-${acordao.id}`}
                  className="bg-white rounded-2xl border-2 border-amber-200/90 shadow-sm p-6 space-y-4 transition-all hover:border-amber-400/80 relative overflow-hidden"
                >
                  {/* Faixa decorativa superior */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-900" />

                  {/* Cabeçalho do Card */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-300 text-amber-950">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>{acordao.tituloDestaque || (isTC ? 'Força Obrigatória Geral' : 'Fixação de Jurisprudência')}</span>
                        </span>

                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono">
                          {acordao.tribunal}
                        </span>

                        {acordao.ecli && (
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {acordao.ecli}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {acordao.processo}
                      </h3>
                    </div>

                    {/* Meta Info: Relator, Data, Votação */}
                    <div className="flex flex-wrap lg:flex-col lg:items-end gap-x-4 gap-y-1 text-xs text-slate-600 shrink-0">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{acordao.dataDecisaoFormatada}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Relator: {acordao.relator}</span>
                      </span>
                      {acordao.votacao && (
                        <span className="text-[11px] text-slate-500">
                          Votação: {acordao.votacao}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sumário Oficial / Fixação de Doutrina */}
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                    {expandido ? acordao.sumario : (
                      acordao.sumario.length > 320 
                        ? `${acordao.sumario.slice(0, 320)}...` 
                        : acordao.sumario
                    )}
                  </div>

                  {acordao.sumario.length > 320 && (
                    <button
                      onClick={() => toggleSumario(acordao.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
                    >
                      {expandido ? (
                        <>
                          <span>Recolher sumário</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Ler sumário na íntegra</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}

                  {/* Descritores Oficiais */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Descritores Oficiais:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {acordao.descritores.map((desc) => (
                        <button
                          key={desc}
                          onClick={() => handleToggleDescritor(desc)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            descritoresSelecionados.includes(desc)
                              ? 'bg-indigo-900 text-white font-semibold'
                              : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                          }`}
                        >
                          {desc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Links Externos e Ações */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold hover:bg-indigo-100 transition-colors shadow-2xs"
                        title={`Abrir acórdão no Portal CSM via ECLI canónico (${formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)})`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Acórdão no CSM</span>
                        <ExternalLink className="w-3 h-3 text-indigo-600" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const url = formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm);
                          try {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(url);
                              handleCopiarTexto(`URL do CSM copiada para a área de transferência: ${url}`, acordao.id + '_csm_url');
                            }
                          } catch (err) {
                            console.warn('Falha ao copiar:', err);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                        title={`Copiar URL oficial do CSM (${formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)})`}
                      >
                        {copiadoId === acordao.id + '_csm_url' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold text-[11px]">URL CSM Copiada!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px]">Copiar URL CSM</span>
                          </>
                        )}
                      </button>

                      {acordao.ecli && (
                        <a
                          href={formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium hover:bg-blue-100 transition-colors"
                          title={`Resolução Oficial ECLI (Portal CSM): ${formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)}`}
                        >
                          <Globe className="w-3 h-3 text-blue-600" />
                          <span>ECLI Canónico</span>
                          <ExternalLink className="w-3 h-3 text-blue-600" />
                        </a>
                      )}

                      {acordao.linkDre && (
                        <a
                          href={acordao.linkDre}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium hover:bg-amber-100 transition-colors"
                          title="Consultar publicação oficial no Diário da República (1.ª Série)"
                        >
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span>Diário da República</span>
                          <ExternalLink className="w-3 h-3 text-amber-600" />
                        </a>
                      )}

                      {acordao.linkTc && (
                        <a
                          href={acordao.linkTc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 font-medium hover:bg-purple-100 transition-colors"
                          title="Aceder ao texto oficial no site do Tribunal Constitucional"
                        >
                          <Scale className="w-3 h-3 text-purple-600" />
                          <span>Tribunal Constitucional</span>
                          <ExternalLink className="w-3 h-3 text-purple-600" />
                        </a>
                      )}

                      {acordao.linkDgsi && (
                        <a
                          href={acordao.linkDgsi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                          title="Portal DGSI"
                        >
                          <span>DGSI</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopiarTexto(`${acordao.tribunal} - ${acordao.processo} (${acordao.dataDecisaoFormatada})`, acordao.id)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {copiadoId === acordao.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar referência</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. LISTA DE TODOS OS RESTANTES ACÓRDÃOS:                                  */}
      {/*    - ORDENADOS ESTRITAMENTE POR DATA, DO MAIS RECENTE AO MAIS ANTIGO     */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-900" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Acórdãos dos Tribunais Superiores
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              Ordem cronológica (mais recente ao mais antigo)
            </span>
          </div>

          <span className="text-xs font-medium text-slate-500">
            A apresentar {acordaosRestantesCronologicos.length} acórdãos
          </span>
        </div>

        {acordaosRestantesCronologicos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Nenhum acórdão encontrado para os filtros selecionados
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tente retirar alguns descritores ou alterar os termos da pesquisa por texto.
            </p>
            {descritoresSelecionados.length > 0 && (
              <button
                onClick={handleLimparTodosDescritores}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-900 text-xs font-semibold rounded-lg hover:bg-indigo-100"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar todos os descritores</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {acordaosRestantesCronologicos.map((acordao) => {
              const expandido = !!sumariosExpandidos[acordao.id];

              return (
                <article
                  key={acordao.id}
                  id={`acordao-${acordao.id}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition-all p-5 sm:p-6 space-y-3.5"
                >
                  {/* Cabeçalho */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-900 text-white font-mono">
                          {acordao.tribunalSigla}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {acordao.tribunal}
                        </span>
                        {acordao.ecli && (
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {acordao.ecli}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {acordao.processo}
                      </h3>
                    </div>

                    <div className="flex flex-wrap sm:flex-col sm:items-end gap-x-3 gap-y-0.5 text-xs text-slate-600 shrink-0">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                        <span>{acordao.dataDecisaoFormatada}</span>
                      </span>
                      <span className="text-slate-500">
                        Relator: {acordao.relator}
                      </span>
                      {acordao.votacao && (
                        <span className="text-[11px] text-slate-400">
                          {acordao.votacao}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sumário */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line">
                    {expandido ? acordao.sumario : (
                      acordao.sumario.length > 280 
                        ? `${acordao.sumario.slice(0, 280)}...` 
                        : acordao.sumario
                    )}
                  </div>

                  {acordao.sumario.length > 280 && (
                    <button
                      onClick={() => toggleSumario(acordao.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
                    >
                      {expandido ? (
                        <>
                          <span>Recolher</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Ver sumário completo</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}

                  {/* Descritores */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {acordao.descritores.map((desc) => (
                      <button
                        key={desc}
                        onClick={() => handleToggleDescritor(desc)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          descritoresSelecionados.includes(desc)
                            ? 'bg-indigo-900 text-white font-semibold'
                            : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                        }`}
                      >
                        {desc}
                      </button>
                    ))}
                  </div>

                  {/* Ações e Links */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold hover:bg-indigo-100 transition-colors shadow-2xs"
                        title={`Abrir acórdão no Portal CSM via ECLI canónico (${formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)})`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Acórdão no CSM</span>
                        <ExternalLink className="w-3 h-3 text-indigo-600" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const url = formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm);
                          try {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(url);
                              handleCopiarTexto(`URL do CSM copiada para a área de transferência: ${url}`, acordao.id + '_csm_url');
                            }
                          } catch (err) {
                            console.warn('Falha ao copiar:', err);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                        title={`Copiar URL oficial do CSM (${formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)})`}
                      >
                        {copiadoId === acordao.id + '_csm_url' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold text-[11px]">URL CSM Copiada!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px]">Copiar URL CSM</span>
                          </>
                        )}
                      </button>

                      {acordao.ecli && (
                        <a
                          href={formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium hover:bg-blue-100 transition-colors"
                          title={`Resolução Oficial ECLI (Portal CSM): ${formatarUrlCsmEcli(acordao.ecli, acordao.linkCsm)}`}
                        >
                          <Globe className="w-3 h-3 text-blue-600" />
                          <span>ECLI Canónico</span>
                          <ExternalLink className="w-3 h-3 text-blue-600" />
                        </a>
                      )}

                      {acordao.linkDre && (
                        <a
                          href={acordao.linkDre}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium hover:bg-amber-100 transition-colors"
                          title="Diário da República"
                        >
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span>DRE</span>
                          <ExternalLink className="w-3 h-3 text-amber-600" />
                        </a>
                      )}

                      {acordao.linkTc && (
                        <a
                          href={acordao.linkTc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 font-medium hover:bg-purple-100 transition-colors"
                          title="Tribunal Constitucional"
                        >
                          <Scale className="w-3 h-3 text-purple-600" />
                          <span>TC</span>
                          <ExternalLink className="w-3 h-3 text-purple-600" />
                        </a>
                      )}

                      {acordao.linkDgsi && (
                        <a
                          href={acordao.linkDgsi}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            try {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(acordao.processo);
                                // Defer state update so navigation is not cancelled by React re-render
                                setTimeout(() => {
                                  handleCopiarTexto(`Processo ${acordao.processo} copiado para pesquisa na DGSI!`, acordao.id);
                                }, 50);
                              }
                            } catch (err) {
                              console.warn('Falha ao copiar:', err);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                        >
                          <span>DGSI</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopiarTexto(`${acordao.tribunal} - ${acordao.processo} (${acordao.dataDecisaoFormatada})`, acordao.id)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {copiadoId === acordao.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar referência</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
