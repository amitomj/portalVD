import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Sliders,
  Table as TableIcon,
  Layers,
  Sparkles,
  Filter,
  CheckCircle2,
  Maximize2,
  Copy,
  Check,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import type { DecisaoJudicialVD, TipoRelacao, RegimeResidencia } from '../types/judicial';

export type DimensaoEstatistica = 
  | 'tipoPena'
  | 'reincidencia'
  | 'vitimasMenores18'
  | 'tipoRelacao'
  | 'coabitacao'
  | 'regimeResidencia'
  | 'ofensasTipo'
  | 'periciasRealizadas'
  | 'periciasCategorias'
  | 'arguidoAntecedentes'
  | 'arguidoSexo'
  | 'ofendidoSexo'
  | 'faixaEtariaArguido'
  | 'faixaEtariaOfendido'
  | 'tribunal'
  | 'anoDecisao';

export type TipoGrafico = 
  | 'barras_agrupadas'
  | 'barras_empilhadas'
  | 'barras_horizontais'
  | 'circular_donut'
  | 'linha'
  | 'area'
  | 'radar'
  | 'tabela_cruzada';

interface CustomChartAnalyticsProps {
  decisoes: DecisaoJudicialVD[];
  onSelecionarDecisao?: (decisao: DecisaoJudicialVD) => void;
  onAbrirDrillDown?: (titulo: string, subtitulo: string, lista: DecisaoJudicialVD[]) => void;
}

const PALETA_CORES = [
  '#4f46e5', // Indigo
  '#0ea5e9', // Sky blue
  '#f59e0b', // Amber
  '#ef4444', // Red / Rose
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b', // Slate
  '#84cc16', // Lime
  '#06b6d4'  // Cyan
];

export const DIMENSOES_CONFIG: Record<DimensaoEstatistica, {
  nome: string;
  descricao: string;
  extrair: (d: DecisaoJudicialVD) => string | string[];
}> = {
  tipoPena: {
    nome: 'Tipo de Pena / Desfecho',
    descricao: 'Desfecho condenatório ou absolutório aplicado',
    extrair: (d) => {
      switch (d.tipoPena) {
        case 'prisao_suspensa': return 'Prisão Suspensa';
        case 'prisao_efetiva': return 'Prisão Efetiva';
        case 'multa': return 'Pena de Multa';
        case 'absolvicao': return 'Absolvição';
        case 'trabalho_comunitario': return 'Trabalho Comunitário';
        case 'outro': return 'Outra Pena';
        default: return 'Não especificado';
      }
    }
  },
  reincidencia: {
    nome: 'Reincidência Criminal (Art. 75.º CP)',
    descricao: 'Existência ou não de reincidência apurada',
    extrair: (d) => (d.reincidencia ? 'Reincidente' : 'Não Reincidente')
  },
  vitimasMenores18: {
    nome: 'Vítimas Menores (< 18 anos)',
    descricao: 'Presença de menores na residência ou como vítimas diretas',
    extrair: (d) => (d.vitimasMenores18 ? 'Com Menores Presentes' : 'Sem Menores')
  },
  tipoRelacao: {
    nome: 'Tipo de Vínculo Relacional',
    descricao: 'Relação canónica entre agressor e ofendido',
    extrair: (d) => {
      switch (d.tipoRelacao) {
        case 'conjuge': return 'Cônjuge';
        case 'ex_conjuge': return 'Ex-Cônjuge';
        case 'unido_de_facto': return 'União de Facto';
        case 'ex_unido_de_facto': return 'Ex-União de Facto';
        case 'namorado': return 'Namorado(a)';
        case 'ex_namorado': return 'Ex-Namorado(a)';
        case 'progenitor': return 'Progenitor(a)';
        case 'filho': return 'Filho(a)';
        case 'outro_familiar': return 'Outro Familiar';
        default: return 'Não especificada';
      }
    }
  },
  coabitacao: {
    nome: 'Coabitação Habitacional',
    descricao: 'Se coabitavam ou residiam em moradas separadas',
    extrair: (d) => {
      if (d.coabitacao === true) return 'Coabitavam';
      if (d.coabitacao === false) return 'Não Coabitavam';
      return 'Não Apurado';
    }
  },
  regimeResidencia: {
    nome: 'Regime de Habitação',
    descricao: 'Casa própria, arrendada ou cedida gratuitamente',
    extrair: (d) => {
      switch (d.regimeResidencia) {
        case 'casa_propria': return 'Casa Própria';
        case 'casa_arrendada': return 'Casa Arrendada';
        case 'casa_cedida_gratuitamente': return 'Cedida Gratuitamente';
        case 'outro': return 'Outro Regime';
        default: return 'Não Especificado';
      }
    }
  },
  ofensasTipo: {
    nome: 'Tipologia de Ofensas',
    descricao: 'Categorias de agressões apuradas (física, psicológica, sexual, patrimonial)',
    extrair: (d) => {
      const tipos: string[] = [];
      if (d.ofensas.fisicas) tipos.push('Ofensa Física');
      if (d.ofensas.psicologicas) tipos.push('Ofensa Psicológica/Ameaça');
      if (d.ofensas.sexuais) tipos.push('Ofensa Sexual');
      if (d.ofensas.patrimoniais) tipos.push('Dano Patrimonial');
      return tipos.length > 0 ? tipos : ['Sem Ofensa Típica'];
    }
  },
  periciasRealizadas: {
    nome: 'Perícias Forenses (Geral)',
    descricao: 'Presença de exames periciais realizados no processo',
    extrair: (d) => (d.pericias.realizadas ? 'Com Perícias Forenses' : 'Sem Perícias')
  },
  periciasCategorias: {
    nome: 'Categorias de Perícias Forenses',
    descricao: 'Tipos específicos de relatórios e exames periciais',
    extrair: (d) => {
      if (!d.pericias.realizadas) return ['Nenhuma Perícia'];
      const cats: string[] = [];
      if (d.pericias.categorias?.includes('medico_legal') || d.pericias.tipos.some(t => /médico-legal|inml|dano corporal/i.test(t))) {
        cats.push('Médico-Legal (INMLCF)');
      }
      if (d.pericias.categorias?.includes('psiquiatrica') || d.pericias.tipos.some(t => /psiquiátric/i.test(t))) {
        cats.push('Psiquiátrica');
      }
      if (d.pericias.categorias?.includes('psicologica') || d.pericias.tipos.some(t => /psicológic|personalidade/i.test(t))) {
        cats.push('Psicológica');
      }
      if (d.pericias.categorias?.includes('relatorio_social_dgrsp') || d.pericias.tipos.some(t => /dgrsp|social/i.test(t))) {
        cats.push('Relatório Social DGRSP');
      }
      if (d.pericias.categorias?.includes('informatica') || d.pericias.tipos.some(t => /informátic|telefónic|digital/i.test(t))) {
        cats.push('Informática / Telefónica');
      }
      if (d.pericias.categorias?.includes('toxicologica') || d.pericias.tipos.some(t => /toxicol|álcool|estupef/i.test(t))) {
        cats.push('Toxicológica');
      }
      if (d.pericias.categorias?.includes('balistica') || d.pericias.tipos.some(t => /balístic|arma/i.test(t))) {
        cats.push('Balística / Armas');
      }
      return cats.length > 0 ? cats : ['Outra Perícia'];
    }
  },
  arguidoAntecedentes: {
    nome: 'Antecedentes Criminais do Arguido',
    descricao: 'Se o arguido possui condenações anteriores transitadas',
    extrair: (d) => {
      if (d.arguido.hasAntecedentes === true) return 'Com Antecedentes';
      if (d.arguido.hasAntecedentes === false) return 'Primário (Sem Antecedentes)';
      return 'Não Consta / Não Apurado';
    }
  },
  arguidoSexo: {
    nome: 'Género do Arguido',
    descricao: 'Sexo do arguido nos autos',
    extrair: (d) => {
      if (d.arguido.sexo === 'M') return 'Masculino';
      if (d.arguido.sexo === 'F') return 'Feminino';
      return 'Não Especificado';
    }
  },
  ofendidoSexo: {
    nome: 'Género da Vítima/Ofendido',
    descricao: 'Sexo da vítima nos autos',
    extrair: (d) => {
      if (d.ofendido.sexo === 'F') return 'Feminino';
      if (d.ofendido.sexo === 'M') return 'Masculino';
      return 'Não Especificado';
    }
  },
  faixaEtariaArguido: {
    nome: 'Faixa Etária do Arguido',
    descricao: 'Grupos etários calculados para o arguido',
    extrair: (d) => {
      const id = d.arguido.idade;
      if (!id || id <= 0) return 'Idade Não Apurada';
      if (id < 25) return '< 25 anos';
      if (id < 40) return '25 a 39 anos';
      if (id < 55) return '40 a 54 anos';
      return '55 anos ou mais';
    }
  },
  faixaEtariaOfendido: {
    nome: 'Faixa Etária da Vítima',
    descricao: 'Grupos etários calculados para a vítima',
    extrair: (d) => {
      const id = d.ofendido.idade;
      if (!id || id <= 0) return 'Idade Não Apurada';
      if (id < 18) return '< 18 anos (Menor)';
      if (id < 30) return '18 a 29 anos';
      if (id < 45) return '30 a 44 anos';
      if (id < 60) return '45 a 59 anos';
      return '60 anos ou mais (Idoso)';
    }
  },
  tribunal: {
    nome: 'Tribunal / Instância Judicial',
    descricao: 'Tribunal ou Comarca de origem da decisão',
    extrair: (d) => {
      if (!d.tribunal || d.tribunal.trim().length === 0) return 'Tribunal Não Indicado';
      // Simplificar tribunais muito extensos para etiquetas claras
      const t = d.tribunal.replace(/^Tribunal\s+(?:da\s+Comarca\s+(?:de\s+)?)?/i, '').trim();
      return t || 'Tribunal Não Indicado';
    }
  },
  anoDecisao: {
    nome: 'Ano da Decisão Judicial',
    descricao: 'Ano de prolação da sentença ou acórdão',
    extrair: (d) => {
      if (!d.dataDecisao) return 'Data Não Apurada';
      const m = d.dataDecisao.match(/\b(19\d\d|20\d\d)\b/);
      return m ? m[1] : 'Data Não Apurada';
    }
  }
};

export const CustomChartAnalytics: React.FC<CustomChartAnalyticsProps> = ({
  decisoes,
  onSelecionarDecisao,
  onAbrirDrillDown
}) => {
  // Configuração principal da análise
  const [dimensaoPrimaria, setDimensaoPrimaria] = useState<DimensaoEstatistica>('tipoPena');
  const [dimensaoSecundaria, setDimensaoSecundaria] = useState<DimensaoEstatistica | 'nenhuma'>('reincidencia');
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('barras_agrupadas');
  const [tipoMetrica, setTipoMetrica] = useState<'absoluto' | 'percentual'>('absoluto');

  // Filtros rápidos
  const [filtroReincidencia, setFiltroReincidencia] = useState<'todos' | 'sim' | 'nao'>('todos');
  const [filtroMenores, setFiltroMenores] = useState<'todos' | 'sim' | 'nao'>('todos');
  const [filtroPericias, setFiltroPericias] = useState<'todos' | 'sim' | 'nao'>('todos');
  const [filtroCoabitacao, setFiltroCoabitacao] = useState<'todos' | 'sim' | 'nao'>('todos');

  // Estado de cópia para a área de transferência
  const [tabelaCopiada, setTabelaCopiada] = useState(false);

  // 1. Filtrar decisões de acordo com os seletores rápidos
  const decisoesFiltradas = useMemo(() => {
    return decisoes.filter(d => {
      if (filtroReincidencia === 'sim' && !d.reincidencia) return false;
      if (filtroReincidencia === 'nao' && d.reincidencia) return false;

      if (filtroMenores === 'sim' && !d.vitimasMenores18) return false;
      if (filtroMenores === 'nao' && d.vitimasMenores18) return false;

      if (filtroPericias === 'sim' && !d.pericias.realizadas) return false;
      if (filtroPericias === 'nao' && d.pericias.realizadas) return false;

      if (filtroCoabitacao === 'sim' && d.coabitacao !== true) return false;
      if (filtroCoabitacao === 'nao' && d.coabitacao !== false) return false;

      return true;
    });
  }, [decisoes, filtroReincidencia, filtroMenores, filtroPericias, filtroCoabitacao]);

  // 2. Processar a conjugação de dados
  const { dadosGrafico, chavesSecundarias, totalAgregado, matrizCruzada, mapeamentoProcessos } = useMemo(() => {
    const configPri = DIMENSOES_CONFIG[dimensaoPrimaria];
    const isConjugado = dimensaoSecundaria !== 'nenhuma';
    const configSec = isConjugado ? DIMENSOES_CONFIG[dimensaoSecundaria] : null;

    // Mapa para armazenar os processos de cada combinação: chave -> DecisaoJudicialVD[]
    const mapaProcessos: Record<string, DecisaoJudicialVD[]> = {};

    // Mapa primário: valorPrimario -> { total: number, [valorSecundario]: number }
    const mapaContagem: Record<string, { total: number; [key: string]: number }> = {};
    const conjuntoSecundario = new Set<string>();

    for (const d of decisoesFiltradas) {
      const valsPri = configPri.extrair(d);
      const listaPri = Array.isArray(valsPri) ? valsPri : [valsPri];

      const listaSec = configSec 
        ? (() => {
            const v = configSec.extrair(d);
            return Array.isArray(v) ? v : [v];
          })()
        : ['Total'];

      for (const vp of listaPri) {
        if (!mapaContagem[vp]) {
          mapaContagem[vp] = { total: 0 };
        }
        mapaContagem[vp].total += 1;

        for (const vs of listaSec) {
          conjuntoSecundario.add(vs);
          mapaContagem[vp][vs] = (mapaContagem[vp][vs] || 0) + 1;

          // Registo para drill-down exato
          const chaveComposta = `${vp}__${vs}`;
          if (!mapaProcessos[chaveComposta]) {
            mapaProcessos[chaveComposta] = [];
          }
          mapaProcessos[chaveComposta].push(d);
        }

        // Registo para drill-down primário
        if (!mapaProcessos[vp]) {
          mapaProcessos[vp] = [];
        }
        mapaProcessos[vp].push(d);
      }
    }

    const listaSecundarias = Array.from(conjuntoSecundario).sort();

    // Formatar array final para recharts
    const totalGeral = decisoesFiltradas.length;
    const arrayFormatado = Object.entries(mapaContagem).map(([categoria, contagens]) => {
      const item: Record<string, any> = {
        name: categoria,
        total: contagens.total,
        totalPct: totalGeral > 0 ? Number(((contagens.total / totalGeral) * 100).toFixed(1)) : 0
      };

      for (const sec of listaSecundarias) {
        const val = contagens[sec] || 0;
        item[sec] = val;
        item[`${sec}_pct`] = totalGeral > 0 ? Number(((val / totalGeral) * 100).toFixed(1)) : 0;
        item[`${sec}_pctGrupo`] = contagens.total > 0 ? Number(((val / contagens.total) * 100).toFixed(1)) : 0;
      }

      return item;
    });

    // Ordenar de forma decrescente pelo total
    arrayFormatado.sort((a, b) => b.total - a.total);

    // Formatar matriz cruzada para a tabela/heatmap
    const matriz = {
      linhas: arrayFormatado.map(item => item.name),
      colunas: listaSecundarias,
      dados: mapaContagem,
      totalGeral
    };

    return {
      dadosGrafico: arrayFormatado,
      chavesSecundarias: listaSecundarias,
      totalAgregado: totalGeral,
      matrizCruzada: matriz,
      mapeamentoProcessos: mapaProcessos
    };
  }, [decisoesFiltradas, dimensaoPrimaria, dimensaoSecundaria]);

  // Aplicar pré-definições de conjugação rápida recomendadas
  const aplicarPredefinicao = (pri: DimensaoEstatistica, sec: DimensaoEstatistica | 'nenhuma', tipo: TipoGrafico) => {
    setDimensaoPrimaria(pri);
    setDimensaoSecundaria(sec);
    setTipoGrafico(tipo);
  };

  // Tratar clique em gráfico para abrir drill-down
  const tratarCliqueNoGrafico = (dados: any, chaveSecundaria?: string) => {
    if (!onAbrirDrillDown) return;

    const nomePrimario = dados?.name || dados?.activeLabel;
    if (!nomePrimario) return;

    let lista: DecisaoJudicialVD[] = [];
    let titulo = '';
    let subtitulo = '';

    if (chaveSecundaria && chaveSecundaria !== 'total' && chaveSecundaria !== 'Total') {
      const chaveComposta = `${nomePrimario}__${chaveSecundaria}`;
      lista = mapeamentoProcessos[chaveComposta] || [];
      titulo = `${DIMENSOES_CONFIG[dimensaoPrimaria].nome}: ${nomePrimario} ⨉ ${dimensaoSecundaria !== 'nenhuma' ? DIMENSOES_CONFIG[dimensaoSecundaria].nome : ''}: ${chaveSecundaria}`;
      subtitulo = `Conjugação cruzada apurada em ${lista.length} processo(s)`;
    } else {
      lista = mapeamentoProcessos[nomePrimario] || [];
      titulo = `${DIMENSOES_CONFIG[dimensaoPrimaria].nome}: ${nomePrimario}`;
      subtitulo = `Listagem de ${lista.length} processo(s) correspondentes à categoria`;
    }

    if (lista.length > 0) {
      onAbrirDrillDown(titulo, subtitulo, lista);
    }
  };

  // Copiar tabela cruzada em formato TSV (para colar diretamente em Excel/Word)
  const copiarTabelaCruzada = () => {
    const cabecalho = ['Categoria', ...matrizCruzada.colunas, 'Total'].join('\t');
    const linhas = matrizCruzada.linhas.map(linha => {
      const valores = matrizCruzada.colunas.map(col => matrizCruzada.dados[linha]?.[col] || 0);
      const totalLinha = matrizCruzada.dados[linha]?.total || 0;
      return [linha, ...valores, totalLinha].join('\t');
    });

    const totaisColunas = matrizCruzada.colunas.map(col => {
      return matrizCruzada.linhas.reduce((acc, linha) => acc + (matrizCruzada.dados[linha]?.[col] || 0), 0);
    });
    const linhaTotal = ['Total Geral', ...totaisColunas, matrizCruzada.totalGeral].join('\t');

    const textoCompleto = [cabecalho, ...linhas, linhaTotal].join('\n');
    navigator.clipboard.writeText(textoCompleto);
    setTabelaCopiada(true);
    setTimeout(() => setTabelaCopiada(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Barra de Configuração e Conjugação de Elementos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Conjugação de Variáveis e Seleção de Gráficos</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                  {totalAgregado} processos filtrados
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Selecione as variáveis para cruzar, escolha o tipo de gráfico e filtre a amostra em tempo real
              </p>
            </div>
          </div>

          {/* Seletor de Métrica: Absoluto (N) vs Percentual (%) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTipoMetrica('absoluto')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                tipoMetrica === 'absoluto' 
                  ? 'bg-white text-indigo-950 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              N.º de Casos (N)
            </button>
            <button
              type="button"
              onClick={() => setTipoMetrica('percentual')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                tipoMetrica === 'percentual' 
                  ? 'bg-white text-indigo-950 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Percentagem (%)
            </button>
          </div>
        </div>

        {/* Seletores das Variáveis (Dimensão 1 + Dimensão 2 Conjugada) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Variável Principal (Eixo X / Base) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>1. Elemento Principal (Eixo X / Categorias)</span>
            </label>
            <select
              value={dimensaoPrimaria}
              onChange={(e) => setDimensaoPrimaria(e.target.value as DimensaoEstatistica)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              {Object.entries(DIMENSOES_CONFIG).map(([chave, cfg]) => (
                <option key={chave} value={chave}>
                  {cfg.nome}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {DIMENSOES_CONFIG[dimensaoPrimaria].descricao}
            </p>
          </div>

          {/* Variável Secundária (Conjugação / Segmentação / Cor) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>2. Conjugar Com (Segmentação Cruzada / Pilhas)</span>
            </label>
            <select
              value={dimensaoSecundaria}
              onChange={(e) => setDimensaoSecundaria(e.target.value as DimensaoEstatistica | 'nenhuma')}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="nenhuma">— Nenhuma (Distribuição Univariada Simples) —</option>
              {Object.entries(DIMENSOES_CONFIG).map(([chave, cfg]) => (
                <option key={chave} value={chave} disabled={chave === dimensaoPrimaria}>
                  {cfg.nome} {chave === dimensaoPrimaria ? '(Já selecionada)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              {dimensaoSecundaria === 'nenhuma' 
                ? 'Apresenta a frequência isolada da variável principal.' 
                : DIMENSOES_CONFIG[dimensaoSecundaria].descricao}
            </p>
          </div>
        </div>

        {/* Seleção do Tipo de Gráfico */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Tipo de Gráfico & Visualização</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: 'barras_agrupadas', nome: 'Barras Agrupadas', icone: BarChart3 },
              { id: 'barras_empilhadas', nome: 'Barras Empilhadas', icone: Layers },
              { id: 'barras_horizontais', nome: 'Barras Horizontais', icone: BarChart3 },
              { id: 'circular_donut', nome: 'Circular / Donut', icone: PieChartIcon },
              { id: 'linha', nome: 'Linhas / Tendência', icone: TrendingUp },
              { id: 'area', nome: 'Área Contínua', icone: TrendingUp },
              { id: 'radar', nome: 'Radar / Teia', icone: Sparkles },
              { id: 'tabela_cruzada', nome: 'Matriz Cruzada', icone: TableIcon }
            ].map((tipo) => {
              const Icone = tipo.icone;
              const isSelected = tipoGrafico === tipo.id;
              return (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoGrafico(tipo.id as TipoGrafico)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-2xs font-bold' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icone className={`w-4 h-4 mb-1 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`} />
                  <span className="text-[11px] leading-tight line-clamp-1">{tipo.nome}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pré-definições de Conjugação Popular (1 clique) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Conjugações Rápidas:</span>
          </span>

          <button
            type="button"
            onClick={() => aplicarPredefinicao('tipoPena', 'reincidencia', 'barras_empilhadas')}
            className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            ⚖️ Penas ⨉ Reincidência
          </button>

          <button
            type="button"
            onClick={() => aplicarPredefinicao('tipoPena', 'vitimasMenores18', 'barras_agrupadas')}
            className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            👶 Penas ⨉ Menores
          </button>

          <button
            type="button"
            onClick={() => aplicarPredefinicao('tipoRelacao', 'ofensasTipo', 'barras_agrupadas')}
            className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            💔 Vínculo ⨉ Tipos de Ofensa
          </button>

          <button
            type="button"
            onClick={() => aplicarPredefinicao('tipoPena', 'periciasRealizadas', 'barras_empilhadas')}
            className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            🔬 Penas ⨉ Perícias Forenses
          </button>

          <button
            type="button"
            onClick={() => aplicarPredefinicao('tipoRelacao', 'coabitacao', 'circular_donut')}
            className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            🏠 Vínculo ⨉ Coabitação
          </button>

          <button
            type="button"
            onClick={() => aplicarPredefinicao('arguidoAntecedentes', 'reincidencia', 'tabela_cruzada')}
            className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            📋 Antecedentes ⨉ Reincidência
          </button>
        </div>

        {/* Filtros rápidos da amostra */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Filtrar Amostra:</span>
          </span>

          {/* Reincidência */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Reincidência:</span>
            <select
              value={filtroReincidencia}
              onChange={(e) => setFiltroReincidencia(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="sim">Apenas Reincidentes</option>
              <option value="nao">Apenas Não Reincidentes</option>
            </select>
          </div>

          {/* Menores */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Menores:</span>
            <select
              value={filtroMenores}
              onChange={(e) => setFiltroMenores(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="sim">Com Menores</option>
              <option value="nao">Sem Menores</option>
            </select>
          </div>

          {/* Perícias */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Perícias:</span>
            <select
              value={filtroPericias}
              onChange={(e) => setFiltroPericias(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="todos">Todas</option>
              <option value="sim">Com Perícias</option>
              <option value="nao">Sem Perícias</option>
            </select>
          </div>

          {/* Coabitação */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Coabitação:</span>
            <select
              value={filtroCoabitacao}
              onChange={(e) => setFiltroCoabitacao(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="todos">Todas</option>
              <option value="sim">Coabitavam</option>
              <option value="nao">Não Coabitavam</option>
            </select>
          </div>

          {(filtroReincidencia !== 'todos' || filtroMenores !== 'todos' || filtroPericias !== 'todos' || filtroCoabitacao !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setFiltroReincidencia('todos');
                setFiltroMenores('todos');
                setFiltroPericias('todos');
                setFiltroCoabitacao('todos');
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* 2. Área Central de Renderização do Gráfico Selecionado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        {/* Cabeçalho da Visualização */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{DIMENSOES_CONFIG[dimensaoPrimaria].nome}</span>
              {dimensaoSecundaria !== 'nenhuma' && (
                <>
                  <span className="text-slate-400 font-normal">cruzado com</span>
                  <span className="text-indigo-700 font-bold">{DIMENSOES_CONFIG[dimensaoSecundaria].nome}</span>
                </>
              )}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique em qualquer elemento do gráfico para consultar os processos judiciais correspondentes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {tipoMetrica === 'absoluto' ? 'Métrica: Casos (N)' : 'Métrica: Percentagem (%)'}
            </span>

            {tipoGrafico === 'tabela_cruzada' && (
              <button
                type="button"
                onClick={copiarTabelaCruzada}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                {tabelaCopiada ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiada para Excel!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Matriz</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Visualização: Caso não haja dados na seleção */}
        {dadosGrafico.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Nenhum dado encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="w-full">
            {/* 2.1 Gráfico de Barras Agrupadas */}
            {tipoGrafico === 'barras_agrupadas' && (
              <div className="h-[420px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        const chave = e.activePayload[0].dataKey as string;
                        tratarCliqueNoGrafico(e.activePayload[0].payload, chave);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-25} 
                      textAnchor="end" 
                      interval={0}
                      tick={{ fill: '#475569', fontSize: 11 }}
                      height={60}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      unit={tipoMetrica === 'percentual' ? '%' : ''}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => {
                        const v = Number(val);
                        if (tipoMetrica === 'percentual') {
                          return [`${v}%`, name];
                        }
                        const pct = item.payload[`${name}_pct`] ?? item.payload.totalPct;
                        return [`${v} processo(s) (${pct}%)`, name];
                      }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                    
                    {dimensaoSecundaria === 'nenhuma' ? (
                      <Bar 
                        dataKey={tipoMetrica === 'percentual' ? 'totalPct' : 'total'} 
                        name="Total de Decisões" 
                        fill="#4f46e5" 
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      />
                    ) : (
                      chavesSecundarias.map((chave, idx) => (
                        <Bar
                          key={chave}
                          dataKey={tipoMetrica === 'percentual' ? `${chave}_pct` : chave}
                          name={chave}
                          fill={PALETA_CORES[idx % PALETA_CORES.length]}
                          radius={[4, 4, 0, 0]}
                          cursor="pointer"
                        />
                      ))
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2.2 Gráfico de Barras Empilhadas */}
            {tipoGrafico === 'barras_empilhadas' && (
              <div className="h-[420px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        const chave = e.activePayload[0].dataKey as string;
                        tratarCliqueNoGrafico(e.activePayload[0].payload, chave);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-25} 
                      textAnchor="end" 
                      interval={0}
                      tick={{ fill: '#475569', fontSize: 11 }}
                      height={60}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      unit={tipoMetrica === 'percentual' ? '%' : ''}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => {
                        const v = Number(val);
                        if (tipoMetrica === 'percentual') {
                          return [`${v}%`, name];
                        }
                        const pct = item.payload[`${name}_pct`] ?? item.payload.totalPct;
                        return [`${v} processo(s) (${pct}%)`, name];
                      }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                    
                    {dimensaoSecundaria === 'nenhuma' ? (
                      <Bar 
                        dataKey={tipoMetrica === 'percentual' ? 'totalPct' : 'total'} 
                        name="Total" 
                        fill="#4f46e5" 
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      />
                    ) : (
                      chavesSecundarias.map((chave, idx) => (
                        <Bar
                          key={chave}
                          stackId="a"
                          dataKey={tipoMetrica === 'percentual' ? `${chave}_pct` : chave}
                          name={chave}
                          fill={PALETA_CORES[idx % PALETA_CORES.length]}
                          cursor="pointer"
                        />
                      ))
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2.3 Gráfico de Barras Horizontais */}
            {tipoGrafico === 'barras_horizontais' && (
              <div className="h-[480px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        const chave = e.activePayload[0].dataKey as string;
                        tratarCliqueNoGrafico(e.activePayload[0].payload, chave);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      unit={tipoMetrica === 'percentual' ? '%' : ''}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fill: '#334155', fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => {
                        const v = Number(val);
                        if (tipoMetrica === 'percentual') {
                          return [`${v}%`, name];
                        }
                        const pct = item.payload[`${name}_pct`] ?? item.payload.totalPct;
                        return [`${v} processo(s) (${pct}%)`, name];
                      }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                    
                    {dimensaoSecundaria === 'nenhuma' ? (
                      <Bar 
                        dataKey={tipoMetrica === 'percentual' ? 'totalPct' : 'total'} 
                        name="Total" 
                        fill="#4f46e5" 
                        radius={[0, 4, 4, 0]}
                        cursor="pointer"
                      />
                    ) : (
                      chavesSecundarias.map((chave, idx) => (
                        <Bar
                          key={chave}
                          dataKey={tipoMetrica === 'percentual' ? `${chave}_pct` : chave}
                          name={chave}
                          fill={PALETA_CORES[idx % PALETA_CORES.length]}
                          radius={[0, 4, 4, 0]}
                          cursor="pointer"
                        />
                      ))
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2.4 Gráfico Circular / Donut */}
            {tipoGrafico === 'circular_donut' && (
              <div className="h-[420px] w-full flex flex-col md:flex-row items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGrafico}
                      dataKey={tipoMetrica === 'percentual' ? 'totalPct' : 'total'}
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={3}
                      label={({ name, percent, value }) => 
                        `${name}: ${value}${tipoMetrica === 'percentual' ? '%' : ''} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={true}
                      onClick={(entry) => tratarCliqueNoGrafico(entry)}
                      cursor="pointer"
                    >
                      {dadosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PALETA_CORES[index % PALETA_CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, item: any) => {
                        return [`${value} ${tipoMetrica === 'percentual' ? '%' : 'processo(s)'} (${item.payload.totalPct}%)`, name];
                      }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2.5 Gráfico de Linhas / Tendência */}
            {tipoGrafico === 'linha' && (
              <div className="h-[420px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        const chave = e.activePayload[0].dataKey as string;
                        tratarCliqueNoGrafico(e.activePayload[0].payload, chave);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-25} 
                      textAnchor="end" 
                      interval={0}
                      tick={{ fill: '#475569', fontSize: 11 }}
                      height={60}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      unit={tipoMetrica === 'percentual' ? '%' : ''}
                    />
                    <Tooltip 
                      formatter={(val: any, name: any) => [val, name]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                    
                    {dimensaoSecundaria === 'nenhuma' ? (
                      <Line 
                        type="monotone"
                        dataKey={tipoMetrica === 'percentual' ? 'totalPct' : 'total'} 
                        name="Total" 
                        stroke="#4f46e5" 
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    ) : (
                      chavesSecundarias.map((chave, idx) => (
                        <Line
                          key={chave}
                          type="monotone"
                          dataKey={tipoMetrica === 'percentual' ? `${chave}_pct` : chave}
                          name={chave}
                          stroke={PALETA_CORES[idx % PALETA_CORES.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 7 }}
                        />
                      ))
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2.6 Gráfico de Área */}
            {tipoGrafico === 'area' && (
              <div className="h-[420px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        const chave = e.activePayload[0].dataKey as string;
                        tratarCliqueNoGrafico(e.activePayload[0].payload, chave);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      angle={-25} 
                      textAnchor="end" 
                      interval={0}
                      tick={{ fill: '#475569', fontSize: 11 }}
                      height={60}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      unit={tipoMetrica === 'percentual' ? '%' : ''}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                    
                    {dimensaoSecundaria === 'nenhuma' ? (
                      <Area 
                        type="monotone"
                        dataKey={tipoMetrica === 'percentual' ? 'totalPct' : 'total'} 
                        name="Total" 
                        stroke="#4f46e5" 
                        fill="#4f46e5"
                        fillOpacity={0.25}
                      />
                    ) : (
                      chavesSecundarias.map((chave, idx) => (
                        <Area
                          key={chave}
                          type="monotone"
                          dataKey={tipoMetrica === 'percentual' ? `${chave}_pct` : chave}
                          name={chave}
                          stroke={PALETA_CORES[idx % PALETA_CORES.length]}
                          fill={PALETA_CORES[idx % PALETA_CORES.length]}
                          fillOpacity={0.2}
                        />
                      ))
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2.7 Gráfico de Radar / Teia */}
            {tipoGrafico === 'radar' && (
              <div className="h-[440px] w-full pt-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius={150} data={dadosGrafico}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                    
                    {dimensaoSecundaria === 'nenhuma' ? (
                      <Radar
                        name="Total"
                        dataKey={tipoMetrica === 'percentual' ? 'totalPct' : 'total'}
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.4}
                      />
                    ) : (
                      chavesSecundarias.map((chave, idx) => (
                        <Radar
                          key={chave}
                          name={chave}
                          dataKey={tipoMetrica === 'percentual' ? `${chave}_pct` : chave}
                          stroke={PALETA_CORES[idx % PALETA_CORES.length]}
                          fill={PALETA_CORES[idx % PALETA_CORES.length]}
                          fillOpacity={0.3}
                        />
                      ))
                    )}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 2.8 Matriz de Contingência (Tabela Cruzada / Heatmap) */}
            {tipoGrafico === 'tabela_cruzada' && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 bg-slate-200/80 sticky left-0 z-10">
                        {DIMENSOES_CONFIG[dimensaoPrimaria].nome} ↓ \ {dimensaoSecundaria !== 'nenhuma' ? DIMENSOES_CONFIG[dimensaoSecundaria].nome : 'Total'} →
                      </th>
                      {matrizCruzada.colunas.map((col) => (
                        <th key={col} className="p-3 text-center border-l border-slate-200 min-w-[120px]">
                          {col}
                        </th>
                      ))}
                      <th className="p-3 text-center bg-indigo-50/80 text-indigo-950 border-l border-indigo-200 font-extrabold min-w-[100px]">
                        Total Linha
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {matrizCruzada.linhas.map((linha) => {
                      const totalLinha = matrizCruzada.dados[linha]?.total || 0;
                      const pctLinhaGeral = totalAgregado > 0 ? ((totalLinha / totalAgregado) * 100).toFixed(1) : '0';

                      return (
                        <tr key={linha} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 bg-slate-50 sticky left-0 z-10 border-r border-slate-200">
                            <button
                              type="button"
                              onClick={() => {
                                const lista = mapeamentoProcessos[linha] || [];
                                if (onAbrirDrillDown && lista.length > 0) {
                                  onAbrirDrillDown(`${DIMENSOES_CONFIG[dimensaoPrimaria].nome}: ${linha}`, `Listagem de ${lista.length} processo(s)`, lista);
                                }
                              }}
                              className="text-left text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer flex items-center justify-between w-full"
                            >
                              <span>{linha}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </td>

                          {matrizCruzada.colunas.map((col) => {
                            const contagem = matrizCruzada.dados[linha]?.[col] || 0;
                            const pctRelativa = totalLinha > 0 ? ((contagem / totalLinha) * 100).toFixed(1) : '0';
                            const pctGeral = totalAgregado > 0 ? ((contagem / totalAgregado) * 100).toFixed(1) : '0';

                            // Intensidade visual de cor (heatmap de contingência)
                            const intensidade = totalLinha > 0 ? Math.min(contagem / totalLinha, 1) : 0;
                            const bgStyle = contagem > 0 
                              ? { backgroundColor: `rgba(99, 102, 241, ${0.05 + intensidade * 0.35})` }
                              : {};

                            return (
                              <td 
                                key={col} 
                                style={bgStyle}
                                className="p-3 text-center border-l border-slate-200 font-mono transition-colors"
                              >
                                {contagem > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const chaveComposta = `${linha}__${col}`;
                                      const lista = mapeamentoProcessos[chaveComposta] || [];
                                      if (onAbrirDrillDown && lista.length > 0) {
                                        onAbrirDrillDown(
                                          `${linha} ⨉ ${col}`, 
                                          `Cruzamento de ${DIMENSOES_CONFIG[dimensaoPrimaria].nome} com ${dimensaoSecundaria !== 'nenhuma' ? DIMENSOES_CONFIG[dimensaoSecundaria].nome : ''} (${lista.length} processos)`, 
                                          lista
                                        );
                                      }
                                    }}
                                    className="w-full text-indigo-900 hover:text-indigo-600 font-bold hover:underline cursor-pointer"
                                    title="Clique para ver os processos desta conjugação"
                                  >
                                    <div>{contagem}</div>
                                    <div className="text-[10px] text-slate-500 font-normal">
                                      {tipoMetrica === 'percentual' ? `${pctRelativa}%` : `(${pctRelativa}% linha)`}
                                    </div>
                                  </button>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="p-3 text-center bg-indigo-50/50 font-bold text-indigo-950 border-l border-indigo-200 font-mono">
                            <div>{totalLinha}</div>
                            <div className="text-[10px] text-indigo-600 font-normal">({pctLinhaGeral}% total)</div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Linha de Totais da Matriz */}
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td className="p-3 bg-slate-200 sticky left-0 z-10 border-r border-slate-300 uppercase text-[11px] tracking-wider">
                        Total das Colunas
                      </td>
                      {matrizCruzada.colunas.map((col) => {
                        const totalCol = matrizCruzada.linhas.reduce(
                          (acc, linha) => acc + (matrizCruzada.dados[linha]?.[col] || 0), 
                          0
                        );
                        const pctCol = totalAgregado > 0 ? ((totalCol / totalAgregado) * 100).toFixed(1) : '0';
                        return (
                          <td key={col} className="p-3 text-center border-l border-slate-300 font-mono">
                            <div>{totalCol}</div>
                            <div className="text-[10px] text-slate-500 font-normal">({pctCol}%)</div>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center bg-indigo-100 font-black text-indigo-950 border-l border-indigo-300 font-mono">
                        <div>{totalAgregado}</div>
                        <div className="text-[10px] text-indigo-700">100%</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Destaques Analíticos e Conclusões da Conjugação Atual */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>Leitura Criminológica da Conjugação Atual</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold block">Categoria Mais Frequente</span>
            <span className="font-bold text-slate-900 text-sm">
              {dadosGrafico[0]?.name || 'N/A'}
            </span>
            <p className="text-slate-500 text-[11px]">
              {dadosGrafico[0]?.total || 0} processos ({dadosGrafico[0]?.totalPct || 0}% da amostra filtrada)
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold block">Conjugação Ativa</span>
            <span className="font-bold text-indigo-700 text-sm">
              {dimensaoSecundaria === 'nenhuma' 
                ? 'Distribuição Univariada' 
                : `${DIMENSOES_CONFIG[dimensaoPrimaria].nome} ⨉ ${DIMENSOES_CONFIG[dimensaoSecundaria].nome}`}
            </span>
            <p className="text-slate-500 text-[11px]">
              {chavesSecundarias.length} segmentos cruzados identificados
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold block">Amostra Analisada</span>
            <span className="font-bold text-slate-900 text-sm font-mono">
              {totalAgregado} de {decisoes.length} decisões
            </span>
            <p className="text-slate-500 text-[11px]">
              {totalAgregado === decisoes.length ? '100% da base elegível analisada' : 'Filtros rápidos ativos'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
