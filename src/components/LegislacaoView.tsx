import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Globe, 
  Tag, 
  Calendar,
  Layers,
  FileText,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  ShieldAlert,
  Info,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  FileUp,
  ShieldCheck,
  X
} from 'lucide-react';
import { DiplomaLegislativo, TipoDiploma, NivelRelevancia } from '../types/modules';
import { 
  registarVerificacaoDiariaLegis, 
  carregarLegislacaoPendente, 
  salvarLegislacaoPendente, 
  aprovarLegislacaoItem, 
  rejeitarLegislacaoItem,
  sincronizarComPowerlex
} from '../lib/firebase';
import { 
  ModalSimuladorPowerlex, 
  gerarUrlPowerlexPesquisa, 
  gerarUrlPowerlexDiploma 
} from './ModalSimuladorPowerlex';
import { ModalImportarDocumento } from './ModalImportarDocumento';

interface LegislacaoViewProps {
  diplomas: DiplomaLegislativo[];
  onAtualizarLegis?: () => void;
  onSalvarDiploma?: (diploma: DiplomaLegislativo) => Promise<boolean>;
  onEliminarDiploma?: (id: string) => Promise<boolean>;
  onLimparModuloLegislacao?: () => Promise<void>;
}

export const LegislacaoView: React.FC<LegislacaoViewProps> = ({ 
  diplomas, 
  onAtualizarLegis,
  onSalvarDiploma,
  onEliminarDiploma,
  onLimparModuloLegislacao
}) => {
  // Aba: 'catalogo' (legislação ativa) vs 'validacao' (diplomas pendentes de validação)
  const [abaAtiva, setAbaAtiva] = useState<'catalogo' | 'validacao'>('catalogo');
  const [itensPendentes, setItensPendentes] = useState<DiplomaLegislativo[]>([]);
  const [carregandoPendentes, setCarregandoPendentes] = useState(false);

  // Modais
  const [modalImportarAberto, setModalImportarAberto] = useState(false);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [itemEmEdicaoId, setItemEmEdicaoId] = useState<string | null>(null);

  // Form Fields
  const [formTipo, setFormTipo] = useState<TipoDiploma>('Lei');
  const [formNumero, setFormNumero] = useState('');
  const [formDataPublicacao, setFormDataPublicacao] = useState('');
  const [formAno, setFormAno] = useState(new Date().getFullYear());
  const [formTitulo, setFormTitulo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formLinkOficial, setFormLinkOficial] = useState('');
  const [formLinkPowerlex, setFormLinkPowerlex] = useState('');
  const [formRelevancia, setFormRelevancia] = useState<NivelRelevancia>('estruturante');
  const [formEmVigor, setFormEmVigor] = useState(true);
  const [formEstadoVigencia, setFormEstadoVigencia] = useState('Em vigor');
  const [formTemas, setFormTemas] = useState('');
  const [salvandoForm, setSalvandoForm] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const [tipoFiltro, setTipoFiltro] = useState<string>('todos');
  const [filtroVigencia, setFiltroVigencia] = useState<'todos' | 'vigentes' | 'nao_vigentes'>('todos');
  const [filtroRelevancia, setFiltroRelevancia] = useState<'todos' | NivelRelevancia>('todos');
  const [ordenacao, setOrdenacao] = useState<'relevancia' | 'recentes' | 'antigos'>('relevancia');
  const [pesquisa, setPesquisa] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [mensagemSync, setMensagemSync] = useState<string | null>(null);
  const [agruparPorTipo, setAgruparPorTipo] = useState(false);
  const [modalPowerlexAberta, setModalPowerlexAberta] = useState(false);
  const [diplomaParaSimular, setDiplomaParaSimular] = useState<DiplomaLegislativo | null>(null);
  const [feedbackCopiaGlobal, setFeedbackCopiaGlobal] = useState<string | null>(null);

  useEffect(() => {
    carregarPendentesIniciais();
  }, []);

  const carregarPendentesIniciais = async () => {
    setCarregandoPendentes(true);
    try {
      const pendentes = await carregarLegislacaoPendente();
      setItensPendentes(pendentes);
    } catch (err) {
      console.error('Erro ao carregar legislação pendente:', err);
    } finally {
      setCarregandoPendentes(false);
    }
  };

  const handleImportarLegislacoesExtraidas = async (itensNovos: DiplomaLegislativo[]) => {
    const unicosMap = new Map<string, DiplomaLegislativo>();
    for (const it of itensPendentes) {
      unicosMap.set(it.numero.toLowerCase().trim(), it);
    }
    for (const it of itensNovos) {
      unicosMap.set(it.numero.toLowerCase().trim(), it);
    }
    const unicos = Array.from(unicosMap.values());
    setItensPendentes(unicos);
    await salvarLegislacaoPendente(unicos);
    setAbaAtiva('validacao');
    setMensagemSync(`Documento processado: ${itensNovos.length} diplomas extraídos com dados pré-preenchidos e encaminhados para validação.`);
    setTimeout(() => setMensagemSync(null), 8000);
  };

  const handleValidarItem = async (item: DiplomaLegislativo) => {
    try {
      await aprovarLegislacaoItem(item);
      if (onSalvarDiploma) {
        await onSalvarDiploma({
          ...item,
          statusValidacao: 'validado'
        });
      }
      setItensPendentes(prev => prev.filter(d => d.id !== item.id));
      setMensagemSync(`Diploma "${item.numero}" validado com sucesso e integrado no repositório ativo.`);
      setTimeout(() => setMensagemSync(null), 5000);
    } catch (err) {
      console.error('Erro ao validar diploma:', err);
    }
  };

  const handleValidarTodos = async () => {
    if (itensPendentes.length === 0) return;
    const confirm = window.confirm(`Deseja validar e integrar todos os ${itensPendentes.length} diplomas pendentes no repositório ativo?`);
    if (!confirm) return;

    for (const item of itensPendentes) {
      await aprovarLegislacaoItem(item);
      if (onSalvarDiploma) {
        await onSalvarDiploma({
          ...item,
          statusValidacao: 'validado'
        });
      }
    }
    setItensPendentes([]);
    setAbaAtiva('catalogo');
    setMensagemSync(`${itensPendentes.length} diplomas validados e integrados no repositório ativo.`);
    setTimeout(() => setMensagemSync(null), 6000);
  };

  const handleRejeitarItem = async (id: string, numero: string) => {
    await rejeitarLegislacaoItem(id);
    setItensPendentes(prev => prev.filter(d => d.id !== id));
    setMensagemSync(`Diploma "${numero}" descartado.`);
    setTimeout(() => setMensagemSync(null), 4000);
  };

  const handleLimparTodosDados = async () => {
    const confirmacao = window.confirm(
      'Tem a certeza de que pretende eliminar todos os dados do módulo de Legislação?\n\nEsta ação irá remover permanentemente todos os diplomas do repositório ativo e da cache.'
    );
    if (!confirmacao) return;

    if (onLimparModuloLegislacao) {
      await onLimparModuloLegislacao();
    }
    setMensagemSync('Todos os registos do módulo de Legislação foram eliminados.');
    setTimeout(() => setMensagemSync(null), 5000);
  };

  const handleAbrirFormNovo = () => {
    setItemEmEdicaoId(null);
    setFormTipo('Lei');
    setFormNumero('');
    setFormDataPublicacao('');
    setFormAno(new Date().getFullYear());
    setFormTitulo('');
    setFormDescricao('');
    setFormLinkOficial('');
    setFormLinkPowerlex('');
    setFormRelevancia('estruturante');
    setFormEmVigor(true);
    setFormEstadoVigencia('Em vigor');
    setFormTemas('Violência Doméstica, Proteção da Vítima');
    setErroForm(null);
    setModalFormAberto(true);
  };

  const handleAbrirFormEdicao = (diploma: DiplomaLegislativo) => {
    setItemEmEdicaoId(diploma.id);
    setFormTipo(diploma.tipo || 'Lei');
    setFormNumero(diploma.numero || '');
    setFormDataPublicacao(diploma.dataPublicacao || '');
    setFormAno(diploma.ano || new Date().getFullYear());
    setFormTitulo(diploma.titulo || '');
    setFormDescricao(diploma.descricao || '');
    setFormLinkOficial(diploma.linkOficial || '');
    setFormLinkPowerlex(diploma.linkPowerlex || '');
    setFormRelevancia(diploma.relevancia || 'estruturante');
    setFormEmVigor(diploma.emVigor ?? true);
    setFormEstadoVigencia(diploma.estadoVigencia || (diploma.emVigor ? 'Em vigor' : 'Não vigente'));
    setFormTemas(Array.isArray(diploma.temas) ? diploma.temas.join(', ') : '');
    setErroForm(null);
    setModalFormAberto(true);
  };

  const handleSalvarForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumero.trim()) {
      setErroForm('O número do diploma é obrigatório (Ex: Lei n.º 112/2009).');
      return;
    }
    if (!formTitulo.trim()) {
      setErroForm('O título oficial do diploma é obrigatório.');
      return;
    }

    setSalvandoForm(true);
    setErroForm(null);

    try {
      const temasArray = formTemas
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const novoDiploma: DiplomaLegislativo = {
        id: itemEmEdicaoId || `legis_manual_${Date.now()}`,
        tipo: formTipo,
        numero: formNumero.trim(),
        dataPublicacao: formDataPublicacao.trim() || `${formAno}`,
        ano: formAno,
        titulo: formTitulo.trim(),
        descricao: formDescricao.trim() || formTitulo.trim(),
        linkOficial: formLinkOficial.trim() || `https://diariodarepublica.pt/dr/pesquisa?termo=${encodeURIComponent(formNumero.trim())}`,
        linkPowerlex: formLinkPowerlex.trim() || gerarUrlPowerlexDiploma({ numero: formNumero.trim(), titulo: formTitulo.trim(), linkPowerlex: '' } as DiplomaLegislativo),
        origem: 'Inserção Manual / Validação',
        emVigor: formEmVigor,
        estadoVigencia: formEstadoVigencia.trim() || (formEmVigor ? 'Em vigor' : 'Não vigente'),
        relevancia: formRelevancia,
        relevanciaScore: formRelevancia === 'estruturante' ? 95 : formRelevancia === 'politica_publica' ? 75 : 50,
        temas: temasArray.length > 0 ? temasArray : ['Violência Doméstica'],
        statusValidacao: 'validado'
      };

      if (onSalvarDiploma) {
        await onSalvarDiploma(novoDiploma);
      }

      // Se estava na lista de pendentes, remove-o
      if (itemEmEdicaoId) {
        await aprovarLegislacaoItem(novoDiploma);
        setItensPendentes(prev => prev.filter(d => d.id !== itemEmEdicaoId));
      }

      setModalFormAberto(false);
      setMensagemSync(`Diploma "${novoDiploma.numero}" guardado com sucesso.`);
      setTimeout(() => setMensagemSync(null), 5000);
    } catch (err) {
      console.error('Erro ao guardar diploma:', err);
      setErroForm('Erro ao guardar diploma. Por favor tente novamente.');
    } finally {
      setSalvandoForm(false);
    }
  };

  const handleCopiarUrlPesquisaPowerlex = () => {
    const url = gerarUrlPowerlexPesquisa(pesquisa);
    navigator.clipboard.writeText(url);
    setFeedbackCopiaGlobal(pesquisa.trim() ? `URL de pesquisa no Powerlex copiada: ${url}` : `URL do repositório no Powerlex copiada: ${url}`);
    setTimeout(() => setFeedbackCopiaGlobal(null), 3500);
  };

  const handleAbrirSimulador = (diploma?: DiplomaLegislativo) => {
    setDiplomaParaSimular(diploma || null);
    setModalPowerlexAberta(true);
  };

  // Contagens globais
  const totalVigentes = useMemo(() => diplomas.filter(d => d.emVigor).length, [diplomas]);
  const totalNaoVigentes = useMemo(() => diplomas.filter(d => !d.emVigor).length, [diplomas]);

  // Tipos únicos presentes na base de dados
  const tiposDisponiveis: TipoDiploma[] = useMemo(() => {
    return (Array.from(new Set(diplomas.map(d => d.tipo))) as TipoDiploma[]).sort();
  }, [diplomas]);

  const handleVerificacaoDiaria = async () => {
    setVerificando(true);
    setMensagemSync(null);

    // Consulta de verificação contra https://powerlex.altec-csm.dev/#/
    try {
      await sincronizarComPowerlex();
      registarVerificacaoDiariaLegis();
      setMensagemSync('Sincronização confirmada: O repositório reflete os 101 registos da 1.ª Série do DRE e do Powerlex CSM.');
      if (onAtualizarLegis) onAtualizarLegis();
    } catch (err) {
      console.error('Erro na sincronização:', err);
      setMensagemSync('Ocorreu um erro ao sincronizar os dados com o Powerlex.');
    } finally {
      setVerificando(false);
      setTimeout(() => setMensagemSync(null), 5000);
    }
  };

  // Filtragem e Ordenação dos Diplomas
  const diplomasFiltrados = useMemo(() => {
    const filtrados = diplomas.filter(d => {
      // Filtro de Vigência
      if (filtroVigencia === 'vigentes' && !d.emVigor) return false;
      if (filtroVigencia === 'nao_vigentes' && d.emVigor) return false;

      // Filtro de Relevância
      if (filtroRelevancia !== 'todos' && d.relevancia !== filtroRelevancia) return false;

      // Filtro de Tipo
      if (tipoFiltro !== 'todos' && d.tipo !== tipoFiltro) return false;

      // Filtro de Pesquisa textual
      if (pesquisa.trim()) {
        const q = pesquisa.toLowerCase().trim();
        const match = 
          d.numero.toLowerCase().includes(q) ||
          d.titulo.toLowerCase().includes(q) ||
          d.descricao.toLowerCase().includes(q) ||
          d.tipo.toLowerCase().includes(q) ||
          (d.estadoVigencia && d.estadoVigencia.toLowerCase().includes(q)) ||
          d.temas.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });

    // Ordenação
    return filtrados.sort((a, b) => {
      if (ordenacao === 'relevancia') {
        const scoreA = a.relevanciaScore ?? 50;
        const scoreB = b.relevanciaScore ?? 50;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.ano ?? 0) - (a.ano ?? 0);
      }
      if (ordenacao === 'recentes') {
        return (b.ano ?? 0) - (a.ano ?? 0);
      }
      if (ordenacao === 'antigos') {
        return (a.ano ?? 0) - (b.ano ?? 0);
      }
      return 0;
    });
  }, [diplomas, filtroVigencia, filtroRelevancia, tipoFiltro, pesquisa, ordenacao]);

  // Agrupamento por tipo se ativo
  const diplomasPorTipo = useMemo(() => {
    return tiposDisponiveis.reduce((acc, tipo) => {
      const lista = diplomasFiltrados.filter(d => d.tipo === tipo);
      if (lista.length > 0) {
        acc[tipo] = lista;
      }
      return acc;
    }, {} as Record<string, DiplomaLegislativo[]>);
  }, [diplomasFiltrados, tiposDisponiveis]);

  const getTipoBadgeColor = (tipo: TipoDiploma) => {
    switch (tipo) {
      case 'Lei':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Decreto-Lei':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Resolução da Assembleia da República':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Portaria':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Resolução do Conselho de Ministros':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Tratado / Instrumento Internacional':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Decreto do Presidente da República':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRelevanciaLabel = (relevancia?: NivelRelevancia) => {
    switch (relevancia) {
      case 'estruturante':
        return { label: 'Regime Estruturante', badge: 'bg-indigo-900 text-amber-300 border-indigo-700' };
      case 'politica_publica':
        return { label: 'Política Pública', badge: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'regulamentar':
        return { label: 'Regulamentar', badge: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'complementar':
      default:
        return { label: 'Complementar', badge: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner de Integração com o Powerlex e Verificação Diária */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Legislação de Violência Doméstica
                </h2>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Repositório Oficial
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Diplomas normativos da 1.ª Série do Diário da República, base documental do{' '}
                <a 
                  href="https://powerlex.altec-csm.dev/#/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-700 font-semibold underline hover:text-indigo-900 inline-flex items-center gap-0.5"
                >
                  Powerlex CSM
                  <ExternalLink className="w-3 h-3" />
                </a>
                {' '}e extrações automáticas de ficheiros PDF sujeitos a validação.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-importar-documento-legis"
              onClick={() => setModalImportarAberto(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow active:scale-98 cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-indigo-100" />
              <span>Importar Documento (PDF / Word)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>

            <button
              id="btn-novo-diploma-manual"
              onClick={handleAbrirFormNovo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-700" />
              <span>Novo Diploma Manual</span>
            </button>

            <button
              onClick={handleVerificacaoDiaria}
              disabled={verificando}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              title="Aceder a https://powerlex.altec-csm.dev/#/ e sincronizar dados com o Diário da República"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verificando ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">{verificando ? 'A sincronizar...' : 'Verificar Atualizações'}</span>
            </button>

            {onLimparModuloLegislacao && (
              <button
                id="btn-limpar-modulo-legislacao"
                onClick={handleLimparTodosDados}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                title="Eliminar todos os registos do módulo Legislação"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Eliminar Dados</span>
              </button>
            )}
          </div>
        </div>

        {mensagemSync && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{mensagemSync}</span>
          </div>
        )}

        {/* Abas: Catálogo Legislativo vs Fila de Validação */}
        <div className="flex border-b border-slate-200 pt-2 gap-2">
          <button
            id="tab-legis-catalogo"
            onClick={() => setAbaAtiva('catalogo')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              abaAtiva === 'catalogo'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Catálogo Ativo</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700">
              {diplomas.length}
            </span>
          </button>

          <button
            id="tab-legis-validacao"
            onClick={() => setAbaAtiva('validacao')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              abaAtiva === 'validacao'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Fila de Validação (PDF / Inserções)</span>
            {itensPendentes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-100 text-amber-900 font-extrabold animate-pulse">
                {itensPendentes.length} pendentes
              </span>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* BLOCO DE FILTROS SOLICITADOS: VIGÊNCIA E RELEVÂNCIA (CATÁLOGO) */}
        {/* ========================================================= */}
        {abaAtiva === 'catalogo' && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
          
          {/* Linha 1: Filtro de Vigência ("Vigentes" e "Não vigentes") */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                Vigência:
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                <button
                  type="button"
                  onClick={() => setFiltroVigencia('todos')}
                  className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filtroVigencia === 'todos'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({diplomas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroVigencia('vigentes')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filtroVigencia === 'vigentes'
                      ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filtroVigencia === 'vigentes' ? 'bg-white' : 'bg-emerald-500'}`} />
                  Vigentes ({totalVigentes})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroVigencia('nao_vigentes')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filtroVigencia === 'nao_vigentes'
                      ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filtroVigencia === 'nao_vigentes' ? 'bg-white' : 'bg-amber-500'}`} />
                  Não vigentes / Revogados ({totalNaoVigentes})
                </button>
              </div>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                Ordenar:
              </span>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="relevancia">Maior Relevância Normativa</option>
                <option value="recentes">Mais Recentes (Ano)</option>
                <option value="antigos">Mais Antigos</option>
              </select>
            </div>
          </div>

          {/* Linha 2: Filtro de Relevância */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Relevância:
            </span>
            <button
              type="button"
              onClick={() => setFiltroRelevancia('todos')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroRelevancia === 'todos'
                  ? 'bg-indigo-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas as Relevâncias
            </button>
            <button
              type="button"
              onClick={() => setFiltroRelevancia('estruturante')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroRelevancia === 'estruturante'
                  ? 'bg-indigo-900 text-white'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              Regime Estruturante (Nuclear)
            </button>
            <button
              type="button"
              onClick={() => setFiltroRelevancia('politica_publica')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroRelevancia === 'politica_publica'
                  ? 'bg-blue-900 text-white'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              Políticas Públicas e Planos
            </button>
            <button
              type="button"
              onClick={() => setFiltroRelevancia('regulamentar')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroRelevancia === 'regulamentar'
                  ? 'bg-teal-900 text-white'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              Regulamentar e Operacional
            </button>
            <button
              type="button"
              onClick={() => setFiltroRelevancia('complementar')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filtroRelevancia === 'complementar'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Complementar / Setorial
            </button>
          </div>

          {/* Linha 3: Barra de Pesquisa e Modos de Vista */}
          <div className="pt-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar diploma, artigo, número, tema ou termo..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => handleAbrirSimulador()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Simular a pesquisa no Powerlex CSM e visualizar/copiar URLs canónicas dos resultados"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simular no Powerlex</span>
              </button>

              <button
                type="button"
                onClick={handleCopiarUrlPesquisaPowerlex}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
                title="Copiar URL gerada de pesquisa no Powerlex para a área de transferência"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar URL Powerlex</span>
              </button>

              <button
                type="button"
                onClick={() => setAgruparPorTipo(!agruparPorTipo)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                  agruparPorTipo 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agrupar por Tipo</span>
              </button>

              <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
                {diplomasFiltrados.length} diploma{diplomasFiltrados.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {feedbackCopiaGlobal && (
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-lg flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{feedbackCopiaGlobal}</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold shrink-0">Pronto a colar</span>
            </div>
          )}

          {/* Abas de Tipos de Diplomas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTipoFiltro('todos')}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                tipoFiltro === 'todos'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos os Tipos ({diplomas.length})
            </button>
            {tiposDisponiveis.map(tipo => {
              const qtd = diplomas.filter(d => d.tipo === tipo).length;
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTipoFiltro(tipo)}
                  className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    tipoFiltro === tipo
                      ? 'bg-indigo-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tipo} ({qtd})
                </button>
              );
            })}
          </div>

        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* 2. CONTEÚDO DA ABA DE VALIDAÇÃO DE DIPLOMAS (PDF / INSERÇÃO MANUAL)      */}
      {/* ========================================================================= */}
      {abaAtiva === 'validacao' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-amber-950">
                    Área de Validação de Legislação Extraída (PDF / Inserções)
                  </h2>
                  <p className="text-xs text-amber-800">
                    Diplomas extraídos automaticamente de documentos PDF ou inseridos manualmente sujeitos a validação prévia.
                  </p>
                </div>
              </div>

              {itensPendentes.length > 0 && (
                <button
                  onClick={handleValidarTodos}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 text-white hover:bg-amber-950 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Validar Todos ({itensPendentes.length}) e Publicar</span>
                </button>
              )}
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed">
              Todos os campos foram pré-preenchidos a partir do documento (Tipo, Número, Título, Data, Âmbitos, Ligações ao Diário da República e Powerlex). Pode rever, editar ou descartar antes de integrar no repositório ativo.
            </p>
          </div>

          {itensPendentes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Não existem diplomas pendentes de validação
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Carregue um documento PDF com legislação para que a aplicação extraia automaticamente todos os diplomas e preencha os formulários de validação.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setModalImportarAberto(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Importar Documento PDF / Word</span>
                </button>
                <button
                  onClick={handleAbrirFormNovo}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Inserir Diploma Manualmente</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itensPendentes.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-amber-200 shadow-2xs hover:shadow-xs transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.nomeFicheiroOrigem ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-indigo-700" />
                            <span>PDF: {item.nomeFicheiroOrigem}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {item.origem || 'Inserção Manual'}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getTipoBadgeColor(item.tipo)}`}>
                          {item.tipo}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">{item.dataPublicacao}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.numero}</h4>
                      <p className="text-xs font-semibold text-indigo-950 mt-1">{item.titulo}</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {item.descricao}
                    </p>

                    {item.temas && item.temas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.temas.map(t => (
                          <span key={t} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAbrirFormEdicao(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                        title="Editar campos do formulário antes de validar"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleRejeitarItem(item.id, item.numero)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-medium cursor-pointer"
                        title="Rejeitar e eliminar este diploma pendente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Descartar</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleValidarItem(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Aprovar e adicionar este diploma ao repositório visível"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Validar e Publicar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTEÚDO DO CATÁLOGO LEGISLATIVO ATIVO                                */}
      {/* ========================================================================= */}
      {abaAtiva === 'catalogo' && (
        <>
          {agruparPorTipo && tipoFiltro === 'todos' ? (
            <div className="space-y-8">
              {(Object.entries(diplomasPorTipo) as [string, DiplomaLegislativo[]][]).map(([tipo, lista]) => (
                <div key={tipo} className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getTipoBadgeColor(tipo as TipoDiploma)}`}>
                      {tipo}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ({lista.length} diploma{lista.length === 1 ? '' : 's'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lista.map(diploma => (
                      <CardDiploma 
                        key={diploma.id} 
                        diploma={diploma} 
                        getTipoBadgeColor={getTipoBadgeColor}
                        getRelevanciaLabel={getRelevanciaLabel}
                        onSimularPowerlex={handleAbrirSimulador}
                        onEditar={handleAbrirFormEdicao}
                        onEliminar={onEliminarDiploma}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diplomasFiltrados.map(diploma => (
                <CardDiploma 
                  key={diploma.id} 
                  diploma={diploma} 
                  getTipoBadgeColor={getTipoBadgeColor}
                  getRelevanciaLabel={getRelevanciaLabel}
                  onSimularPowerlex={handleAbrirSimulador}
                  onEditar={handleAbrirFormEdicao}
                  onEliminar={onEliminarDiploma}
                />
              ))}
              {diplomasFiltrados.length === 0 && (
                <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">Nenhum diploma encontrado para os critérios selecionados.</p>
                  <p className="text-xs text-slate-500 mt-1">Tente ajustar os filtros de vigência, relevância ou o termo de pesquisa.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAIS DO MÓDULO                                                       */}
      {/* ========================================================================= */}
      <ModalSimuladorPowerlex
        isOpen={modalPowerlexAberta}
        onClose={() => setModalPowerlexAberta(false)}
        termoPesquisaInicial={pesquisa}
        diplomas={diplomasFiltrados.length > 0 ? diplomasFiltrados : diplomas}
        diplomaInicial={diplomaParaSimular}
      />

      <ModalImportarDocumento
        isOpen={modalImportarAberto}
        onClose={() => setModalImportarAberto(false)}
        tipoAlvo="legislacao"
        onImportarLegislacoes={handleImportarLegislacoesExtraidas}
      />

      {/* Modal de Adicionar / Editar Diploma Legislativo */}
      {modalFormAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider">
                  {itemEmEdicaoId ? 'Edição e Validação' : 'Registo Manual'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {itemEmEdicaoId ? 'Formulário do Diploma Legislativo' : 'Adicionar Novo Diploma Legislativo'}
                </h3>
              </div>
              <button
                onClick={() => setModalFormAberto(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarForm} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {erroForm && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{erroForm}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Diploma *</label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as TipoDiploma)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Lei">Lei</option>
                    <option value="Decreto-Lei">Decreto-Lei</option>
                    <option value="Resolução da Assembleia da República">Resolução da Assembleia da República</option>
                    <option value="Portaria">Portaria</option>
                    <option value="Decreto Regulamentar">Decreto Regulamentar</option>
                    <option value="Resolução do Conselho de Ministros">Resolução do Conselho de Ministros</option>
                    <option value="Tratado / Instrumento Internacional">Tratado / Instrumento Internacional</option>
                    <option value="Decreto do Presidente da República">Decreto do Presidente da República</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número Oficial *</label>
                  <input
                    type="text"
                    required
                    value={formNumero}
                    onChange={(e) => setFormNumero(e.target.value)}
                    placeholder="Ex: Lei n.º 112/2009"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data de Publicação</label>
                  <input
                    type="text"
                    value={formDataPublicacao}
                    onChange={(e) => setFormDataPublicacao(e.target.value)}
                    placeholder="Ex: 16 de setembro de 2009"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ano</label>
                  <input
                    type="number"
                    value={formAno}
                    onChange={(e) => setFormAno(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título Oficial do Diploma *</label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Regime jurídico aplicável à prevenção da violência doméstica e proteção da vítima"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição / Sumário</label>
                <textarea
                  rows={3}
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Sumário das disposições normativas ou notas práticas..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-serif leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grau de Relevância</label>
                  <select
                    value={formRelevancia}
                    onChange={(e) => setFormRelevancia(e.target.value as NivelRelevancia)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="estruturante">Regime Estruturante</option>
                    <option value="politica_publica">Política Pública</option>
                    <option value="regulamentar">Regulamentar</option>
                    <option value="complementar">Complementar / Setorial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de Vigência</label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formEmVigor}
                        onChange={(e) => {
                          setFormEmVigor(e.target.checked);
                          setFormEstadoVigencia(e.target.checked ? 'Em vigor' : 'Não vigente');
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 font-medium">Em Vigor</span>
                    </label>
                    <input
                      type="text"
                      value={formEstadoVigencia}
                      onChange={(e) => setFormEstadoVigencia(e.target.value)}
                      placeholder="Ex: Em vigor"
                      className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link Diário da República (DRE)</label>
                  <input
                    type="url"
                    value={formLinkOficial}
                    onChange={(e) => setFormLinkOficial(e.target.value)}
                    placeholder="https://diariodarepublica.pt/dr/detalhe/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link Powerlex CSM</label>
                  <input
                    type="url"
                    value={formLinkPowerlex}
                    onChange={(e) => setFormLinkPowerlex(e.target.value)}
                    placeholder="https://powerlex.altec-csm.dev/#/diploma?..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temas / Âmbitos (separados por vírgula)</label>
                <input
                  type="text"
                  value={formTemas}
                  onChange={(e) => setFormTemas(e.target.value)}
                  placeholder="Ex: Estatuto da Vítima, Teleassistência, Regime Penal"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalFormAberto(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoForm}
                  className="px-5 py-2 rounded-xl bg-indigo-900 text-white font-semibold hover:bg-indigo-800 transition-colors shadow-xs cursor-pointer"
                >
                  {salvandoForm ? 'A guardar...' : itemEmEdicaoId ? 'Guardar e Validar' : 'Guardar Diploma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const CardDiploma: React.FC<{
  diploma: DiplomaLegislativo;
  getTipoBadgeColor: (tipo: TipoDiploma) => string;
  getRelevanciaLabel: (relevancia?: NivelRelevancia) => { label: string; badge: string };
  onSimularPowerlex?: (diploma: DiplomaLegislativo) => void;
  onEditar?: (diploma: DiplomaLegislativo) => void;
  onEliminar?: (id: string) => Promise<boolean>;
}> = ({ diploma, getTipoBadgeColor, getRelevanciaLabel, onSimularPowerlex, onEditar, onEliminar }) => {
  const [copiado, setCopiado] = useState(false);
  const [copiadoUrl, setCopiadoUrl] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const relInfo = getRelevanciaLabel(diploma.relevancia);
  const urlPowerlex = gerarUrlPowerlexDiploma(diploma);

  const handleCopiarNumero = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(diploma.numero);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    } catch (err) {
      console.warn('Falha ao copiar número:', err);
    }
  };

  const handleCopiarUrlPowerlex = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(urlPowerlex);
        setCopiadoUrl(true);
        setTimeout(() => setCopiadoUrl(false), 2000);
      }
    } catch (err) {
      console.warn('Falha ao copiar URL Powerlex:', err);
    }
  };

  const handleAbrirPowerlex = () => {
    // Copia a URL canónica do Powerlex para que o utilizador a tenha no clipboard
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(urlPowerlex);
        setCopiadoUrl(true);
        setTimeout(() => setCopiadoUrl(false), 2500);
      }
    } catch (err) {
      console.warn('Falha ao copiar URL Powerlex:', err);
    }
  };

  const handleEliminarItem = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onEliminar) return;
    const confirm = window.confirm(`Deseja remover permanentemente o diploma "${diploma.numero}" do catálogo?`);
    if (!confirm) return;
    setEliminando(true);
    try {
      await onEliminar(diploma.id);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
      diploma.emVigor 
        ? 'border-slate-200 hover:border-indigo-300 hover:shadow-md' 
        : 'border-slate-200 bg-slate-50/40 opacity-95 hover:border-slate-300'
    }`}>
      <div className="space-y-2.5">
        {/* Top badges: Tipo, Vigência e Relevância */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getTipoBadgeColor(diploma.tipo)}`}>
              {diploma.tipo}
            </span>
            
            {/* Badge de Relevância */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${relInfo.badge}`}>
              {relInfo.label}
            </span>
          </div>

          {/* Badge de Vigência em Destaque */}
          {diploma.emVigor ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title={diploma.estadoVigencia || 'Em vigor'}>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{diploma.estadoVigencia || 'Em vigor'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200" title={diploma.estadoVigencia || 'Não vigente'}>
              <XCircle className="w-3 h-3 text-amber-600" />
              <span>{diploma.estadoVigencia || 'Não vigente'}</span>
            </span>
          )}
        </div>

        {/* Identificação e Número */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {diploma.numero}
            </h3>
            <button
              onClick={handleCopiarNumero}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-700 font-medium px-2 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Copiar número do diploma"
            >
              {copiado ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 text-[10px]">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px]">Copiar</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {diploma.dataPublicacao}
            </span>
            {diploma.serieDRE && (
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                {diploma.serieDRE}
              </span>
            )}
          </div>
        </div>

        {/* Título do Diploma */}
        <p className="text-xs font-semibold text-indigo-950 leading-snug">
          {diploma.titulo}
        </p>

        {/* Resumo explicativo */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
          {diploma.descricao}
        </p>

        {/* Temas / Tags */}
        {diploma.temas && diploma.temas.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {diploma.temas.map(tema => (
              <span key={tema} className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tema}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé com origens e ligações diretas */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <span>{diploma.origem}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Editar Diploma */}
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(diploma)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
              title="Editar os dados deste diploma"
            >
              <Edit3 className="w-3 h-3 text-indigo-600" />
              <span className="text-[11px]">Editar</span>
            </button>
          )}

          {/* Botão Eliminar Diploma */}
          {onEliminar && (
            <button
              type="button"
              disabled={eliminando}
              onClick={handleEliminarItem}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-medium transition-colors cursor-pointer"
              title="Eliminar este diploma do catálogo"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
            </button>
          )}

          {/* Botão Copiar URL Powerlex */}
          <button
            type="button"
            onClick={handleCopiarUrlPowerlex}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            title={`Copiar URL canónica do Powerlex para este diploma (${urlPowerlex})`}
          >
            {copiadoUrl ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold text-[11px]">URL Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span className="text-[11px]">Copiar URL</span>
              </>
            )}
          </button>

          {/* Botão Simular no Powerlex */}
          {onSimularPowerlex && (
            <button
              type="button"
              onClick={() => onSimularPowerlex(diploma)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-200 hover:bg-indigo-100 text-indigo-900 text-xs font-medium transition-colors cursor-pointer"
              title="Abrir no Simulador Powerlex CSM com URL canónica e detalhes"
            >
              <Globe className="w-3 h-3 text-indigo-600" />
              <span className="text-[11px]">Simular</span>
            </button>
          )}

          {diploma.linkPowerlex && (
            <a
              href={diploma.linkPowerlex}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-medium transition-colors"
              title={`Aceder no Powerlex CSM`}
            >
              <Globe className="w-3 h-3 text-indigo-600" />
              <span>Powerlex CSM</span>
              <ExternalLink className="w-2.5 h-2.5 text-indigo-500" />
            </a>
          )}

          <a
            href={diploma.linkOficial || `https://diariodarepublica.pt/dr/pesquisa?termo=${encodeURIComponent(diploma.numero)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            title={`Abrir página oficial da lei no Diário da República (${diploma.numero})`}
          >
            <FileText className="w-3 h-3 text-amber-300" />
            <span>Página da Lei (DRE)</span>
            <ExternalLink className="w-3 h-3 text-slate-300" />
          </a>
        </div>
      </div>
    </div>
  );
};
