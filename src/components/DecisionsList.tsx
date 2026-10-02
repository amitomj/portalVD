import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  HeartCrack,
  Clock,
  Building2,
  Scale,
  Home,
  Users,
  DollarSign
} from 'lucide-react';
import type { DecisaoJudicialVD, TipoRelacao, RegimeResidencia } from '../types/judicial';

interface DecisionsListProps {
  decisoes: DecisaoJudicialVD[];
  onSelecionarDecisao: (decisao: DecisaoJudicialVD) => void;
  onEliminarDecisao: (seqId: string) => void;
  onLimparBaseDeDados?: () => void;
}

export const DecisionsList: React.FC<DecisionsListProps> = ({
  decisoes,
  onSelecionarDecisao,
  onEliminarDecisao,
  onLimparBaseDeDados
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRelacao, setFiltroRelacao] = useState<string>('todas');
  const [filtroCrime, setFiltroCrime] = useState<string>('todos');
  const [filtroCoabitacao, setFiltroCoabitacao] = useState<string>('todos');
  const [filtroReincidencia, setFiltroReincidencia] = useState<string>('todos');
  const [filtroMenores, setFiltroMenores] = useState<string>('todos');

  const filteredDecisoes = decisoes.filter(d => {
    // Search
    const matchesSearch = 
      d.seqId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tribunal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.crime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.relacaoAgressorVitima.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.penaAplicada.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter Crime
    if (filtroCrime !== 'todos' && d.tipoCrimeDetectado !== filtroCrime) {
      return false;
    }

    // Filter Relação (Rigor Obrigatório: Cônjuge vs Unido de facto vs Namorado)
    if (filtroRelacao !== 'todas') {
      if (filtroRelacao === 'conjuge' && d.tipoRelacao !== 'conjuge') return false;
      if (filtroRelacao === 'ex_conjuge' && d.tipoRelacao !== 'ex_conjuge') return false;
      if (filtroRelacao === 'unido_de_facto' && d.tipoRelacao !== 'unido_de_facto') return false;
      if (filtroRelacao === 'ex_unido_de_facto' && d.tipoRelacao !== 'ex_unido_de_facto') return false;
      if (filtroRelacao === 'namorado' && d.tipoRelacao !== 'namorado') return false;
      if (filtroRelacao === 'ex_namorado' && d.tipoRelacao !== 'ex_namorado') return false;
      if (filtroRelacao === 'familiar' && !['progenitor', 'filho', 'outro_familiar'].includes(d.tipoRelacao)) return false;
    }

    // Filter Coabitação
    if (filtroCoabitacao === 'sim' && d.coabitacao !== true) return false;
    if (filtroCoabitacao === 'nao' && d.coabitacao !== false) return false;

    // Filter Reincidencia
    if (filtroReincidencia === 'sim' && !d.reincidencia) return false;
    if (filtroReincidencia === 'nao' && d.reincidencia) return false;

    // Filter Menores
    if (filtroMenores === 'sim' && !d.vitimasMenores18) return false;
    if (filtroMenores === 'nao' && d.vitimasMenores18) return false;

    return true;
  });

  // Exportar dados dos formulários em CSV anonimizado (sem número de processo)
  const exportarCSVAnonimizado = () => {
    if (decisoes.length === 0) return;

    const headers = [
      'ID Sequencial',
      'Tribunal',
      'Data Decisão Judicial',
      'Crime',
      'Categoria Relação',
      'Relação Detalhada',
      'Vivem na Mesma Residência (Coabitação)',
      'Regime Residência',
      'Dono da Casa Própria',
      'Detalhes Residência',
      'Arguido Idade',
      'Arguido Sexo',
      'Arguido Profissão',
      'Arguido Vencimento Mensal',
      'Arguido Habilitações',
      'Arguido Antecedentes',
      'Ofendido Idade',
      'Ofendido Sexo',
      'Ofendido Profissão',
      'Ofendido Vencimento Mensal',
      'Ofendido Habilitações',
      'Pena Aplicada',
      'Tipo Pena',
      'Penas Acessórias',
      'Indemnização Cível',
      'Reincidência',
      'Vítimas Menores de 18 Anos',
      'Ofensas Físicas',
      'Ofensas Psicológicas',
      'Ofensas Sexuais',
      'Ofensas Patrimoniais',
      'Perícias Realizadas'
    ];

    const rows = decisoes.map(d => [
      `"${d.seqId}"`,
      `"${d.tribunal.replace(/"/g, '""')}"`,
      `"${d.dataDecisao}"`,
      `"${d.crime.replace(/"/g, '""')}"`,
      `"${d.tipoRelacao}"`,
      `"${d.relacaoAgressorVitima.replace(/"/g, '""')}"`,
      d.coabitacao === true ? 'Sim' : d.coabitacao === false ? 'Não' : 'Não apurado',
      `"${d.regimeResidencia}"`,
      `"${d.titularidadeCasaPropria}"`,
      `"${d.detalhesResidencia.replace(/"/g, '""')}"`,
      `"${d.arguido.idadeTexto || d.arguido.idade || ''}"`,
      `"${d.arguido.sexo}"`,
      `"${d.arguido.profissao.replace(/"/g, '""')}"`,
      `"${(d.arguido.vencimentoMensal || '').replace(/"/g, '""')}"`,
      `"${d.arguido.habilitacoesLiterarias.replace(/"/g, '""')}"`,
      `"${d.arguido.antecedentesCriminais.replace(/"/g, '""')}"`,
      `"${d.ofendido.idadeTexto || d.ofendido.idade || ''}"`,
      `"${d.ofendido.sexo}"`,
      `"${d.ofendido.profissao.replace(/"/g, '""')}"`,
      `"${(d.ofendido.vencimentoMensal || '').replace(/"/g, '""')}"`,
      `"${d.ofendido.habilitacoesLiterarias.replace(/"/g, '""')}"`,
      `"${d.penaAplicada.replace(/"/g, '""')}"`,
      `"${d.tipoPena}"`,
      `"${d.penasAcessorias.replace(/"/g, '""')}"`,
      `"${d.indemnizacaoCivel.replace(/"/g, '""')}"`,
      d.reincidencia ? 'Sim' : 'Não',
      d.vitimasMenores18 ? 'Sim' : 'Não',
      d.ofensas.fisicas ? 'Sim' : 'Não',
      d.ofensas.psicologicas ? 'Sim' : 'Não',
      d.ofensas.sexuais ? 'Sim' : 'Não',
      d.ofensas.patrimoniais ? 'Sim' : 'Não',
      d.pericias.realizadas ? 'Sim' : 'Não'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `decisoes_vd_anonimizadas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRelacaoBadgeClass = (tipo: TipoRelacao) => {
    switch (tipo) {
      case 'conjuge':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'ex_conjuge':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'unido_de_facto':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'ex_unido_de_facto':
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      case 'namorado':
        return 'bg-rose-50 text-rose-900 border-rose-200';
      case 'ex_namorado':
        return 'bg-stone-100 text-stone-800 border-stone-300';
      case 'progenitor':
      case 'filho':
      case 'outro_familiar':
        return 'bg-teal-50 text-teal-900 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-700" />
            <span>Formulários das Decisões Analisadas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cada decisão tem atribuído um identificador sequencial (ex: VD-001). Apenas decisões elegíveis de violência doméstica ou homicídio são apresentadas.
          </p>
        </div>

        {decisoes.length > 0 && (
          <div className="flex items-center gap-2">
            {onLimparBaseDeDados && (
              <button
                onClick={onLimparBaseDeDados}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-medium hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
                title="Limpar todos os dados da base de dados"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Limpar Base de Dados</span>
              </button>
            )}
            <button
              onClick={exportarCSVAnonimizado}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Exportar Dados em CSV (Anonimizado)</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar por ID, tribunal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Relação Rigorosa (Cônjuge vs Unido de Facto vs Namorado) */}
          <div>
            <select
              value={filtroRelacao}
              onChange={(e) => setFiltroRelacao(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="todas">Relação: Todas</option>
              <option value="conjuge">Cônjuge (Casados)</option>
              <option value="ex_conjuge">Ex-cônjuge (Divorciados)</option>
              <option value="unido_de_facto">Unido(a) de facto</option>
              <option value="ex_unido_de_facto">Ex-unido(a) de facto</option>
              <option value="namorado">Namorado(a)</option>
              <option value="ex_namorado">Ex-namorado(a)</option>
              <option value="familiar">Progenitor / Filho / Familiar</option>
            </select>
          </div>

          {/* Coabitação */}
          <div>
            <select
              value={filtroCoabitacao}
              onChange={(e) => setFiltroCoabitacao(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="todos">Coabitação: Todas</option>
              <option value="sim">Vivem na mesma residência</option>
              <option value="nao">Residências separadas</option>
            </select>
          </div>

          {/* Reincidência */}
          <div>
            <select
              value={filtroReincidencia}
              onChange={(e) => setFiltroReincidencia(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="todos">Reincidência: Todas</option>
              <option value="sim">Apenas com Reincidência</option>
              <option value="nao">Sem Reincidência</option>
            </select>
          </div>

          {/* Menores */}
          <div>
            <select
              value={filtroMenores}
              onChange={(e) => setFiltroMenores(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="todos">Menores &lt; 18: Todas</option>
              <option value="sim">Presença / Vítimas Menores</option>
              <option value="nao">Sem Menores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Decisions Cards */}
      {filteredDecisoes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            Nenhum formulário encontrado com os critérios selecionados.
          </p>
          <p className="text-xs text-slate-400">
            Carregue uma pasta com ficheiros de decisões na aba "Processar Pasta" para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecisoes.map((decisao) => (
            <div
              key={decisao.seqId}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded shadow-2xs">
                      {decisao.seqId}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getRelacaoBadgeClass(decisao.tipoRelacao)}`}>
                      {decisao.relacaoAgressorVitima}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono" title="Data da decisão judicial">
                    {decisao.dataDecisao}
                  </span>
                </div>

                {/* Tribunal */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900 transition-colors flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{decisao.tribunal}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ficheiro: <span className="font-mono text-slate-600">{decisao.nomeFicheiro}</span>
                  </p>
                </div>

                {/* Partes Processuais com Profissão e Vencimento */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Arguido</span>
                    <p className="font-medium text-slate-800 truncate">
                      {decisao.arguido.sexo === 'M' ? 'M' : 'F'}, {decisao.arguido.idadeTexto || `${decisao.arguido.idade || '?'} anos`}
                    </p>
                    <p className="text-slate-600 truncate text-[11px] font-medium">
                      {decisao.arguido.profissao}
                    </p>
                    {decisao.arguido.vencimentoMensal && decisao.arguido.vencimentoMensal !== 'Não apurado' && (
                      <p className="text-indigo-700 truncate text-[10px] font-mono">
                        {decisao.arguido.vencimentoMensal}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ofendido(a)</span>
                    <p className="font-medium text-slate-800 truncate">
                      {decisao.ofendido.sexo === 'F' ? 'F' : 'M'}, {decisao.ofendido.idadeTexto || `${decisao.ofendido.idade || '?'} anos`}
                    </p>
                    <p className="text-slate-600 truncate text-[11px] font-medium">
                      {decisao.ofendido.profissao}
                    </p>
                    {decisao.ofendido.vencimentoMensal && decisao.ofendido.vencimentoMensal !== 'Não apurado' && (
                      <p className="text-indigo-700 truncate text-[10px] font-mono">
                        {decisao.ofendido.vencimentoMensal}
                      </p>
                    )}
                  </div>
                </div>

                {/* Coabitação e Habitação */}
                <div className="text-xs bg-amber-50/40 p-2 rounded-lg border border-amber-100/60 flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>
                      {decisao.coabitacao === true ? 'Coabitam' : decisao.coabitacao === false ? 'Residências separadas' : 'Coabitação: N/D'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">
                    {decisao.regimeResidencia === 'casa_arrendada' && 'Casa arrendada'}
                    {decisao.regimeResidencia === 'casa_cedida_gratuitamente' && 'Casa cedida gratuitamente'}
                    {decisao.regimeResidencia === 'casa_propria' && `Casa própria (${
                      decisao.titularidadeCasaPropria === 'ambos' ? 'de ambos' : 
                      decisao.titularidadeCasaPropria === 'arguido' ? 'do arguido' : 
                      decisao.titularidadeCasaPropria === 'ofendida' ? 'da ofendida' : 'própria'
                    })`}
                    {decisao.regimeResidencia === 'nao_especificado' && 'Regime não especificado'}
                  </span>
                </div>

                {/* Pena Aplicada */}
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <Scale className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="line-clamp-1">{decisao.penaAplicada}</span>
                  </div>
                </div>

                {/* Badges: Reincidência, Menores, Perícias */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {decisao.reincidencia ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">
                      Reincidente (Art. 75.º)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-500 bg-slate-100">
                      Primário
                    </span>
                  )}

                  {decisao.vitimasMenores18 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                      <HeartCrack className="w-3 h-3" />
                      Menores &lt; 18
                    </span>
                  )}

                  {decisao.pericias.realizadas && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                      Perícias ({decisao.pericias.tipos.length})
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {decisao.statusValidacao === 'validado' ? '✓ Validado' : 'Pendente de revisão'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelecionarDecisao(decisao)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-900 text-white text-xs font-medium hover:bg-indigo-800 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver & Editar Formulário</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Tem a certeza que deseja eliminar o formulário ${decisao.seqId}?`)) {
                        onEliminarDecisao(decisao.seqId);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar decisão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
