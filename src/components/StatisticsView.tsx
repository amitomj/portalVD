import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Scale, 
  AlertTriangle, 
  HeartCrack, 
  Activity, 
  FileCheck, 
  Building2, 
  TrendingUp,
  Home,
  Heart,
  Search,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sliders,
  Sparkles
} from 'lucide-react';
import type { DecisaoJudicialVD, TipoPericia } from '../types/judicial';
import { CustomChartAnalytics } from './CustomChartAnalytics';

interface StatisticsViewProps {
  decisoes: DecisaoJudicialVD[];
  onSelecionarDecisao?: (decisao: DecisaoJudicialVD) => void;
}

interface DrillDownState {
  titulo: string;
  subtitulo: string;
  decisoes: DecisaoJudicialVD[];
  renderValor?: (d: DecisaoJudicialVD) => React.ReactNode;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ 
  decisoes,
  onSelecionarDecisao 
}) => {
  const [drillDown, setDrillDown] = useState<DrillDownState | null>(null);
  const [pesquisaDrillDown, setPesquisaDrillDown] = useState('');
  const [secaoAtiva, setSecaoAtiva] = useState<'graficos' | 'indicadores'>('graficos');

  if (decisoes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
        <BarChart3 className="w-12 h-12 mx-auto text-slate-300" />
        <h3 className="text-base font-bold text-slate-800">Sem dados estatísticos suficientes</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Processe decisões judiciais na aba "Processar Pasta" para visualizar indicadores agregados sobre crimes, penas, reincidência e perícias.
        </p>
      </div>
    );
  }

  const total = decisoes.length;

  // 1. Reincidência
  const reincidentes = decisoes.filter(d => d.reincidencia);
  const naoReincidentes = decisoes.filter(d => !d.reincidencia);

  // 2. Menores
  const comMenores = decisoes.filter(d => d.vitimasMenores18);
  const semMenores = decisoes.filter(d => !d.vitimasMenores18);

  // 3. Penas
  const prisaoSuspensa = decisoes.filter(d => d.tipoPena === 'prisao_suspensa');
  const prisaoEfetiva = decisoes.filter(d => d.tipoPena === 'prisao_efetiva');
  const multas = decisoes.filter(d => d.tipoPena === 'multa');
  const absolviçoes = decisoes.filter(d => d.tipoPena === 'absolvicao');
  const trabalhoComunitario = decisoes.filter(d => d.tipoPena === 'trabalho_comunitario');
  const outrasPenas = decisoes.filter(d => d.tipoPena === 'outro' && d.penaAplicada);

  // 4. Ofensas
  const ofensasFisicas = decisoes.filter(d => d.ofensas.fisicas);
  const ofensasPsico = decisoes.filter(d => d.ofensas.psicologicas);
  const ofensasSexuais = decisoes.filter(d => d.ofensas.sexuais);
  const ofensasPatri = decisoes.filter(d => d.ofensas.patrimoniais);

  // 5. Relações rigorosas
  const conjuges = decisoes.filter(d => d.tipoRelacao === 'conjuge');
  const unidosFacto = decisoes.filter(d => d.tipoRelacao === 'unido_de_facto');
  const namorados = decisoes.filter(d => d.tipoRelacao === 'namorado');
  const exConjuges = decisoes.filter(d => d.tipoRelacao === 'ex_conjuge');
  const exUnidosFacto = decisoes.filter(d => d.tipoRelacao === 'ex_unido_de_facto');
  const exNamorados = decisoes.filter(d => d.tipoRelacao === 'ex_namorado');
  const progenitores = decisoes.filter(d => d.tipoRelacao === 'progenitor');
  const filhos = decisoes.filter(d => d.tipoRelacao === 'filho');
  const outrosFamiliares = decisoes.filter(d => d.tipoRelacao === 'outro_familiar');

  // 6. Coabitação e Habitação
  const coabitam = decisoes.filter(d => d.coabitacao === true);
  const naoCoabitam = decisoes.filter(d => d.coabitacao === false);
  const casasArrendadas = decisoes.filter(d => d.regimeResidencia === 'casa_arrendada');
  const casasProprias = decisoes.filter(d => d.regimeResidencia === 'casa_propria');
  const casasCedidas = decisoes.filter(d => d.regimeResidencia === 'casa_cedida_gratuitamente');

  // 7. Perícias Forenses por Tipo
  const comPericias = decisoes.filter(d => d.pericias.realizadas);
  const semPericias = decisoes.filter(d => !d.pericias.realizadas);

  const periciasMedicoLegal = decisoes.filter(d => 
    d.pericias.categorias?.includes('medico_legal') ||
    d.pericias.tipos.some(t => /médico-legal|inmlcf|dano corporal|inml/i.test(t))
  );

  const periciasPsiquiatrica = decisoes.filter(d => 
    d.pericias.categorias?.includes('psiquiatrica') ||
    d.pericias.tipos.some(t => /psiquiátric/i.test(t))
  );

  const periciasPsicologica = decisoes.filter(d => 
    d.pericias.categorias?.includes('psicologica') ||
    d.pericias.tipos.some(t => /psicológic|personalidade/i.test(t))
  );

  const periciasDgrsp = decisoes.filter(d => 
    d.pericias.categorias?.includes('relatorio_social_dgrsp') ||
    d.pericias.tipos.some(t => /dgrsp|relatório social/i.test(t))
  );

  const periciasInformatica = decisoes.filter(d => 
    d.pericias.categorias?.includes('informatica') ||
    d.pericias.tipos.some(t => /informática|telefónica|digital|telemóvel/i.test(t))
  );

  const periciasToxicologica = decisoes.filter(d => 
    d.pericias.categorias?.includes('toxicologica') ||
    d.pericias.tipos.some(t => /toxicológic|alcoolemia|estupefaciente/i.test(t))
  );

  const periciasBalistica = decisoes.filter(d => 
    d.pericias.categorias?.includes('balistica') ||
    d.pericias.tipos.some(t => /balística|arma/i.test(t))
  );

  const periciasOutras = decisoes.filter(d => 
    d.pericias.realizadas &&
    !d.pericias.categorias?.some(c => ['medico_legal', 'psiquiatrica', 'psicologica', 'relatorio_social_dgrsp', 'informatica', 'toxicologica', 'balistica'].includes(c))
  );

  // Média de idades
  const idadesArguidos = decisoes.map(d => d.arguido.idade).filter((i): i is number => typeof i === 'number' && i > 0);
  const mediaIdadeArguido = idadesArguidos.length > 0 
    ? Math.round(idadesArguidos.reduce((a, b) => a + b, 0) / idadesArguidos.length)
    : null;

  const idadesOfendidos = decisoes.map(d => d.ofendido.idade).filter((i): i is number => typeof i === 'number' && i > 0);
  const mediaIdadeOfendido = idadesOfendidos.length > 0
    ? Math.round(idadesOfendidos.reduce((a, b) => a + b, 0) / idadesOfendidos.length)
    : null;

  // Antecedentes criminais do arguido
  const argComAntecedentes = decisoes.filter(d => d.arguido.hasAntecedentes === true);
  const argSemAntecedentes = decisoes.filter(d => d.arguido.hasAntecedentes === false);

  // Abrir drill-down
  const abrirDrillDown = (
    titulo: string, 
    subtitulo: string, 
    lista: DecisaoJudicialVD[],
    renderValor?: (d: DecisaoJudicialVD) => React.ReactNode
  ) => {
    setPesquisaDrillDown('');
    setDrillDown({
      titulo,
      subtitulo,
      decisoes: lista,
      renderValor
    });
  };

  // Filtragem na lista do drill-down
  const decisoesDrillDownFiltradas = drillDown ? drillDown.decisoes.filter(d => {
    if (!pesquisaDrillDown.trim()) return true;
    const q = pesquisaDrillDown.toLowerCase();
    return (
      d.seqId.toLowerCase().includes(q) ||
      d.tribunal.toLowerCase().includes(q) ||
      d.nomeFicheiro.toLowerCase().includes(q) ||
      d.delitoEnquadramento.toLowerCase().includes(q) ||
      (d.penaAplicada && d.penaAplicada.toLowerCase().includes(q)) ||
      (d.pericias.detalhes && d.pericias.detalhes.toLowerCase().includes(q))
    );
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-700" />
            <span>Indicadores e Estatísticas Criminológicas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Total de <span className="font-semibold text-slate-800">{total}</span> decisões judiciais elegíveis (Violência Doméstica / Homicídio em contexto de VD).
          </p>
        </div>
        <div className="text-xs bg-indigo-50 text-indigo-800 font-medium px-3 py-1.5 rounded-lg border border-indigo-200/80 flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>Clique em qualquer cartão ou campo para listar os respetivos processos</span>
        </div>
      </div>

      {/* Seletor de Modo: Estúdio de Conjugação e Gráficos vs Painel Consolidado */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit border border-slate-200/80">
        <button
          type="button"
          onClick={() => setSecaoAtiva('graficos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            secaoAtiva === 'graficos'
              ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 className={`w-4 h-4 ${secaoAtiva === 'graficos' ? 'text-indigo-600' : 'text-slate-500'}`} />
          <span>Conjugação de Variáveis & Gráficos</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60">
            8 Tipos de Gráficos
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('indicadores')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            secaoAtiva === 'indicadores'
              ? 'bg-white text-indigo-950 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Layers className={`w-4 h-4 ${secaoAtiva === 'indicadores' ? 'text-indigo-600' : 'text-slate-500'}`} />
          <span>Painel Consolidado de Indicadores</span>
        </button>
      </div>

      {/* Secção 1: Estúdio Interativo de Conjugação e Multi-Gráficos */}
      {secaoAtiva === 'graficos' && (
        <CustomChartAnalytics
          decisoes={decisoes}
          onSelecionarDecisao={onSelecionarDecisao}
          onAbrirDrillDown={(titulo, subtitulo, lista) => abrirDrillDown(titulo, subtitulo, lista)}
        />
      )}

      {/* Secção 2: Painel Consolidado de Indicadores */}
      {secaoAtiva === 'indicadores' && (
        <div className="space-y-6">
          {/* Primary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analisadas */}
        <button
          type="button"
          onClick={() => abrirDrillDown(
            'Todas as Decisões Elegíveis',
            'Listagem integral das decisões de violência doméstica ou homicídio em contexto de VD',
            decisoes,
            d => (
              <span className="text-xs text-slate-700">
                Pena: <strong className="font-semibold text-slate-900">{d.penaAplicada || 'Não especificada'}</strong>
              </span>
            )
          )}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Decisões VD Elegíveis</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">{total}</span>
            <span className="text-xs text-slate-400">processos</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <span>Ver todos os processos</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </button>

        {/* Reincidência */}
        <button
          type="button"
          onClick={() => abrirDrillDown(
            'Casos com Reincidência (Art. 75.º CP)',
            'Processos em que foi expressamente apurada a reincidência do arguido',
            reincidentes,
            d => (
              <div className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                <strong>Enquadramento da reincidência:</strong> {d.reincidenciaDetalhe || 'Com reincidência comprovada nos autos.'}
              </div>
            )
          )}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Taxa de Reincidência</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 font-mono">
              {Math.round((reincidentes.length / total) * 100)}%
            </span>
            <span className="text-xs text-slate-400">({reincidentes.length}/{total})</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            <span>Listar {reincidentes.length} reincidentes</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </button>

        {/* Vítimas Menores */}
        <button
          type="button"
          onClick={() => abrirDrillDown(
            'Processos com Vítimas Menores (< 18 Anos)',
            'Casos com menores de idade como vítimas diretas ou agressões na presença de menores (Art. 152.º, n.º 2, al. a) CP)',
            comMenores,
            d => (
              <div className="text-xs text-rose-900 bg-rose-50 p-2 rounded border border-rose-200 mt-1">
                <strong>Detalhe:</strong> {d.vitimasMenoresDetalhe || 'Menor de 18 anos presente ou ofendido.'}
              </div>
            )
          )}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Menores &lt; 18 Anos</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 font-mono">
              {Math.round((comMenores.length / total) * 100)}%
            </span>
            <span className="text-xs text-slate-400">({comMenores.length}/{total})</span>
          </div>
          <p className="text-[11px] text-rose-700 font-medium mt-1 flex items-center gap-1">
            <span>Listar {comMenores.length} com menores</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </button>

        {/* Penas Suspensas vs Efetivas */}
        <button
          type="button"
          onClick={() => abrirDrillDown(
            'Condenações com Prisão Efetiva',
            'Processos que culminaram em pena de prisão de cumprimento efetivo',
            prisaoEfetiva,
            d => (
              <div className="text-xs text-indigo-900 bg-indigo-50 p-2 rounded border border-indigo-200 mt-1">
                <strong>Pena Efetiva Aplicada:</strong> {d.penaAplicada}
              </div>
            )
          )}
          className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Prisão Efetiva</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-700 font-mono">
              {prisaoEfetiva.length}
            </span>
            <span className="text-xs text-slate-400">({Math.round((prisaoEfetiva.length / total) * 100)}%)</span>
          </div>
          <p className="text-[11px] text-indigo-700 font-medium mt-1 flex items-center gap-1">
            <span>Listar {prisaoEfetiva.length} penas efetivas</span>
            <ArrowUpRight className="w-3 h-3" />
          </p>
        </button>
      </div>

      {/* SEÇÃO DEDICADA: Perícias Forenses por Tipo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Perícias Forenses por Tipo
              </h3>
              <p className="text-xs text-slate-500">
                Identificação categorizada e contagem discriminada dos exames periciais realizados nos autos
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200/60 self-start sm:self-auto">
            {comPericias.length} de {total} decisões com perícias ({Math.round((comPericias.length / total) * 100)}%)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: 'Médico-Legal / Dano Corporal (INMLCF)',
              desc: 'Exames do Instituto Nacional de Medicina Legal e Ciências Forenses e avaliação de lesões corporais',
              lista: periciasMedicoLegal,
              cor: 'border-blue-200 bg-blue-50/40 text-blue-900 hover:border-blue-400',
              badgeCor: 'bg-blue-100 text-blue-800'
            },
            {
              label: 'Psiquiátrica Forense',
              desc: 'Avaliação de anomalia psíquica, imputabilidade e perturbações mentais',
              lista: periciasPsiquiatrica,
              cor: 'border-purple-200 bg-purple-50/40 text-purple-900 hover:border-purple-400',
              badgeCor: 'bg-purple-100 text-purple-800'
            },
            {
              label: 'Psicológica / Personalidade',
              desc: 'Perícias sobre a personalidade do arguido e impacto psicológico na vítima',
              lista: periciasPsicologica,
              cor: 'border-teal-200 bg-teal-50/40 text-teal-900 hover:border-teal-400',
              badgeCor: 'bg-teal-100 text-teal-800'
            },
            {
              label: 'Relatório Social da DGRSP',
              desc: 'Relatórios de reinserção social da Direção-Geral de Reinserção e Serviços Prisionais',
              lista: periciasDgrsp,
              cor: 'border-emerald-200 bg-emerald-50/40 text-emerald-900 hover:border-emerald-400',
              badgeCor: 'bg-emerald-100 text-emerald-800'
            },
            {
              label: 'Informática e Telefónica Forense',
              desc: 'Extração forense de comunicações, mensagens WhatsApp, telemóveis e dados digitais',
              lista: periciasInformatica,
              cor: 'border-amber-200 bg-amber-50/40 text-amber-900 hover:border-amber-400',
              badgeCor: 'bg-amber-100 text-amber-800'
            },
            {
              label: 'Toxicológica Forense',
              desc: 'Exames de taxa de álcool no sangue (TAS) e deteção de estupefacientes',
              lista: periciasToxicologica,
              cor: 'border-orange-200 bg-orange-50/40 text-orange-900 hover:border-orange-400',
              badgeCor: 'bg-orange-100 text-orange-800'
            },
            {
              label: 'Balística / Armas',
              desc: 'Exames balísticos, armas brancas ou de fogo apreendidas nos autos',
              lista: periciasBalistica,
              cor: 'border-rose-200 bg-rose-50/40 text-rose-900 hover:border-rose-400',
              badgeCor: 'bg-rose-100 text-rose-800'
            },
            {
              label: 'Outras Perícias Forenses',
              desc: 'Outros exames técnicos ou periciais não enquadrados nas categorias anteriores',
              lista: periciasOutras,
              cor: 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-400',
              badgeCor: 'bg-slate-200 text-slate-800'
            },
            {
              label: 'Sem Perícias Documentadas',
              desc: 'Decisões onde não constam referências a perícias realizadas',
              lista: semPericias,
              cor: 'border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300',
              badgeCor: 'bg-slate-100 text-slate-600'
            }
          ].map((item) => {
            const count = item.lista.length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={item.label}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${item.cor}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold leading-snug">{item.label}</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${item.badgeCor}`}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => abrirDrillDown(
                    `Perícia: ${item.label}`,
                    `Listagem de ${count} processo(s) com identificação de ${item.label}`,
                    item.lista,
                    d => (
                      <div className="text-xs text-slate-800 bg-white p-2.5 rounded border border-slate-200 space-y-1">
                        <div>
                          <span className="font-semibold text-slate-700">Tipos identificados: </span>
                          <span>{d.pericias.tipos.join('; ') || 'Perícia documentada'}</span>
                        </div>
                        {d.pericias.detalhes && (
                          <div className="text-[11px] text-slate-600">
                            <span className="font-semibold">Excerto: </span>
                            {d.pericias.detalhes}
                          </div>
                        )}
                      </div>
                    )
                  )}
                  disabled={count === 0}
                  className="w-full mt-2 py-1.5 px-2.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-600" />
                  <span>Listar {count} processo{count === 1 ? '' : 's'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relacionamento e Habitação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Relações Rigorosas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Vínculo Relacional Agressor-Vítima (Rigor Jurídico)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Clique para listar</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Cônjuge (Casamento em vigor)', lista: conjuges, cor: 'bg-blue-600' },
              { label: 'Unido(a) de facto (União em vigor)', lista: unidosFacto, cor: 'bg-purple-600' },
              { label: 'Namorado(a) (Relação de namoro em vigor)', lista: namorados, cor: 'bg-rose-500' },
              { label: 'Ex-cônjuge (Divórcio / Separação)', lista: exConjuges, cor: 'bg-slate-700' },
              { label: 'Ex-unido(a) de facto (Cessação da união)', lista: exUnidosFacto, cor: 'bg-slate-500' },
              { label: 'Ex-namorado(a) (Fim do namoro)', lista: exNamorados, cor: 'bg-amber-600' },
              { label: 'Progenitor(a) (Agressão a ascendente)', lista: progenitores, cor: 'bg-emerald-600' },
              { label: 'Filho(a) (Agressão a descendente)', lista: filhos, cor: 'bg-teal-600' },
              { label: 'Outro Familiar (Irmão, tio, etc.)', lista: outrosFamiliares, cor: 'bg-indigo-500' }
            ].map(item => {
              const count = item.lista.length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => abrirDrillDown(
                    `Vínculo: ${item.label}`,
                    `Decisões com relação categorizada como ${item.label}`,
                    item.lista,
                    d => (
                      <div className="text-xs text-slate-700">
                        Relação especificada: <strong>{d.relacaoAgressorVitima || d.tipoRelacao}</strong>
                      </div>
                    )
                  )}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="group-hover:text-indigo-600 flex items-center gap-1">
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.cor} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coabitação e Regime de Habitação */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Coabitação & Regime de Residência
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Clique para listar</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => abrirDrillDown(
                'Arguido e Vítima Coabitavam',
                'Processos onde se apurou que viviam na mesma residência',
                coabitam,
                d => (
                  <div className="text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Residência:</strong> {d.detalhesResidencia || 'Coabitação apurada na mesma habitação.'}
                  </div>
                )
              )}
              className="text-left p-4 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-amber-900 font-semibold uppercase">Coabitação</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono">
                {coabitam.length} <span className="text-xs font-normal text-slate-500">({Math.round((coabitam.length / total) * 100)}%)</span>
              </p>
              <span className="text-[11px] text-slate-500">Vivem na mesma residência</span>
            </button>

            <button
              type="button"
              onClick={() => abrirDrillDown(
                'Residências Separadas (Não Coabitavam)',
                'Processos onde agressor e vítima residiam separadamente',
                naoCoabitam,
                d => (
                  <div className="text-xs text-slate-700 bg-slate-100 p-2 rounded border border-slate-200">
                    <strong>Residência:</strong> {d.detalhesResidencia || 'Residências separadas.'}
                  </div>
                )
              )}
              className="text-left p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Residências Separadas</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-2xl font-bold text-slate-900 font-mono">
                {naoCoabitam.length} <span className="text-xs font-normal text-slate-500">({Math.round((naoCoabitam.length / total) * 100)}%)</span>
              </p>
              <span className="text-[11px] text-slate-500">Separação / não coabitantes</span>
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 block">Distribuição do Regime de Habitação:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => abrirDrillDown(
                  'Regime: Casa Arrendada',
                  'Processos em que a residência comum ou do casal é arrendada',
                  casasArrendadas,
                  d => (
                    <div className="text-xs text-slate-700">
                      Detalhes da habitação: {d.detalhesResidencia || 'Casa arrendada'}
                    </div>
                  )
                )}
                className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer"
              >
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Arrendada</span>
                <span className="text-base font-bold text-slate-900 font-mono">{casasArrendadas.length}</span>
                <span className="text-[10px] text-indigo-600 block mt-0.5 font-medium">Ver lista</span>
              </button>

              <button
                type="button"
                onClick={() => abrirDrillDown(
                  'Regime: Casa Própria',
                  'Habitação própria (com discriminação de titularidade: arguido, vítima ou ambos)',
                  casasProprias,
                  d => (
                    <div className="text-xs text-slate-700 space-y-1">
                      <div>Titularidade: <strong>{d.titularidadeCasaPropria || 'Não discriminada'}</strong></div>
                      <div>{d.detalhesResidencia}</div>
                    </div>
                  )
                )}
                className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer"
              >
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Casa Própria</span>
                <span className="text-base font-bold text-slate-900 font-mono">{casasProprias.length}</span>
                <span className="text-[10px] text-indigo-600 block mt-0.5 font-medium">Ver lista</span>
              </button>

              <button
                type="button"
                onClick={() => abrirDrillDown(
                  'Regime: Casa Cedida Gratuitamente',
                  'Habitação cedida gratuitamente por familiares ou terceiros',
                  casasCedidas,
                  d => (
                    <div className="text-xs text-slate-700">
                      Detalhes da habitação: {d.detalhesResidencia || 'Casa cedida gratuitamente'}
                    </div>
                  )
                )}
                className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer"
              >
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Cedida Grátis</span>
                <span className="text-base font-bold text-slate-900 font-mono">{casasCedidas.length}</span>
                <span className="text-[10px] text-indigo-600 block mt-0.5 font-medium">Ver lista</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Tipos de Ofensas e Penas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tipos de Ofensas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Prevalência de Tipos de Ofensas</h3>
            </div>
            <span className="text-[11px] text-slate-400">Clique para listar</span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Ofensas Psicológicas / Emocionais / Ameaças',
                lista: ofensasPsico,
                cor: 'bg-indigo-600',
                render: (d: DecisaoJudicialVD) => (
                  <div className="text-xs text-indigo-950 bg-indigo-50 p-2 rounded border border-indigo-200">
                    {d.ofensas.detalhesPsicologicas || 'Ofensas psicológicas e verbais provadas.'}
                  </div>
                )
              },
              {
                label: 'Ofensas Físicas (Agressões corporais, lesões)',
                lista: ofensasFisicas,
                cor: 'bg-rose-600',
                render: (d: DecisaoJudicialVD) => (
                  <div className="text-xs text-rose-950 bg-rose-50 p-2 rounded border border-rose-200">
                    {d.ofensas.detalhesFisicas || 'Ofensas físicas e corporais provadas.'}
                  </div>
                )
              },
              {
                label: 'Ofensas Patrimoniais (Danos, destruição de bens)',
                lista: ofensasPatri,
                cor: 'bg-amber-500',
                render: (d: DecisaoJudicialVD) => (
                  <div className="text-xs text-amber-950 bg-amber-50 p-2 rounded border border-amber-200">
                    {d.ofensas.detalhesPatrimoniais || 'Ofensas patrimoniais provadas.'}
                  </div>
                )
              },
              {
                label: 'Ofensas Sexuais (Coação / Abuso)',
                lista: ofensasSexuais,
                cor: 'bg-purple-600',
                render: (d: DecisaoJudicialVD) => (
                  <div className="text-xs text-purple-950 bg-purple-50 p-2 rounded border border-purple-200">
                    {d.ofensas.detalhesSexuais || 'Ofensas de natureza sexual apuradas.'}
                  </div>
                )
              }
            ].map(item => {
              const count = item.lista.length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => abrirDrillDown(
                    item.label,
                    `Processos em que foram evidenciadas ${item.label.toLowerCase()}`,
                    item.lista,
                    item.render
                  )}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="group-hover:text-indigo-600 flex items-center gap-1">
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`${item.cor} h-2.5 rounded-full`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tipos de Penas e Medidas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">Penas Principais Aplicadas</h3>
            </div>
            <span className="text-[11px] text-slate-400">Clique para listar</span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Prisão Suspensa na Execução',
                lista: prisaoSuspensa,
                cor: 'bg-indigo-600',
                desc: 'Com ou sem regime de prova / regras de conduta'
              },
              {
                label: 'Prisão Efetiva',
                lista: prisaoEfetiva,
                cor: 'bg-rose-600',
                desc: 'Cumprimento efetivo em estabelecimento prisional'
              },
              {
                label: 'Pena de Multa',
                lista: multas,
                cor: 'bg-amber-500',
                desc: 'Condenação em dias de multa'
              },
              {
                label: 'Absolvição do Arguido',
                lista: absolviçoes,
                cor: 'bg-emerald-600',
                desc: 'Julgada improcedente a acusação'
              },
              {
                label: 'Trabalho Comunitário / Outras Penas',
                lista: [...trabalhoComunitario, ...outrasPenas],
                cor: 'bg-slate-600',
                desc: 'Outras modalidades sancionatórias'
              }
            ].map(item => {
              const count = item.lista.length;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => abrirDrillDown(
                    `Pena: ${item.label}`,
                    `Listagem de processos com condenação de ${item.label.toLowerCase()}`,
                    item.lista,
                    d => (
                      <div className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                        <div><strong>Pena:</strong> {d.penaAplicada || 'Não especificada'}</div>
                        {d.penasAcessorias && (
                          <div className="text-[11px] text-slate-600"><strong>Penas acessórias:</strong> {d.penasAcessorias}</div>
                        )}
                        {d.indemnizacaoCivel && (
                          <div className="text-[11px] text-slate-600"><strong>Indemnização cível:</strong> {d.indemnizacaoCivel}</div>
                        )}
                      </div>
                    )
                  )}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="group-hover:text-indigo-600 flex items-center gap-1">
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`${item.cor} h-2.5 rounded-full`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Demografia e CRC */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-5 h-5 text-indigo-700" />
          <h3 className="text-sm font-bold text-slate-900">Perfil Sociodemográfico e Antecedentes Criminais</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Média de Idade Arguido</span>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {mediaIdadeArguido ? `${mediaIdadeArguido} anos` : '-'}
            </p>
            <span className="text-[11px] text-slate-400">Calculada sobre dados declarados</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Média de Idade Ofendida</span>
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {mediaIdadeOfendido ? `${mediaIdadeOfendido} anos` : '-'}
            </p>
            <span className="text-[11px] text-slate-400">Calculada sobre dados declarados</span>
          </div>

          <button
            type="button"
            onClick={() => abrirDrillDown(
              'Arguidos com Antecedentes Criminais (CRC)',
              'Processos em que o arguido tinha condenações anteriores averbadas no registo criminal',
              argComAntecedentes,
              d => (
                <div className="text-xs text-amber-950 bg-amber-50 p-2 rounded border border-amber-200">
                  <strong>Antecedentes:</strong> {d.arguido.antecedentesCriminais || 'Com antecedentes averbados no CRC.'}
                </div>
              )
            )}
            className="text-left p-4 bg-amber-50/40 rounded-xl border border-amber-100 space-y-1 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-800 font-semibold uppercase">Com Antecedentes (CRC)</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-amber-700 font-mono">
              {argComAntecedentes.length} <span className="text-xs font-normal text-slate-500">({Math.round((argComAntecedentes.length / total) * 100)}%)</span>
            </p>
            <span className="text-[11px] text-amber-700 font-medium">Ver {argComAntecedentes.length} arguidos</span>
          </button>

          <button
            type="button"
            onClick={() => abrirDrillDown(
              'Arguidos sem Antecedentes Criminais (Delinquentes Primários)',
              'Processos em que o arguido não registava antecedentes penais averbados',
              argSemAntecedentes,
              d => (
                <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                  <strong>Antecedentes:</strong> {d.arguido.antecedentesCriminais || 'Delinquente primário / CRC limpo.'}
                </div>
              )
            )}
            className="text-left p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold uppercase">Sem Antecedentes (Primários)</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-slate-800 font-mono">
              {argSemAntecedentes.length} <span className="text-xs font-normal text-slate-500">({Math.round((argSemAntecedentes.length / total) * 100)}%)</span>
            </p>
            <span className="text-[11px] text-slate-600 font-medium">Ver {argSemAntecedentes.length} arguidos</span>
          </button>
        </div>
      </div>
    </div>
  )}

      {/* DRILL-DOWN MODAL / PANEL */}
      {drillDown && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header do Drill-Down */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                    {decisoesDrillDownFiltradas.length} processos
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {drillDown.titulo}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {drillDown.subtitulo}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrillDown(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Pesquisa no Drill-Down */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={pesquisaDrillDown}
                  onChange={(e) => setPesquisaDrillDown(e.target.value)}
                  placeholder="Pesquisar por ID sequencial (ex: VD-001), tribunal, crime, texto..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {pesquisaDrillDown && (
                <button
                  type="button"
                  onClick={() => setPesquisaDrillDown('')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Lista de Processos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
              {decisoesDrillDownFiltradas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum processo encontrado com os critérios de pesquisa atuais.
                </div>
              ) : (
                decisoesDrillDownFiltradas.map((decisao) => (
                  <div
                    key={decisao.seqId}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded">
                          {decisao.seqId}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {decisao.tribunal || 'Tribunal não especificado'}
                        </span>
                        {decisao.dataDecisao && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {decisao.dataDecisao}
                          </span>
                        )}
                      </div>

                      {onSelecionarDecisao && (
                        <button
                          type="button"
                          onClick={() => {
                            setDrillDown(null);
                            onSelecionarDecisao(decisao);
                          }}
                          className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Abrir Ficha de Decisão</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-lg">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Crime Enquadrado</span>
                        <span className="font-medium text-slate-800">{decisao.delitoEnquadramento}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pena Aplicada</span>
                        <span className="font-medium text-slate-800">{decisao.penaAplicada || 'Não especificada'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vínculo</span>
                        <span className="font-medium text-slate-800">{decisao.relacaoAgressorVitima || decisao.tipoRelacao}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ficheiro</span>
                        <span className="font-mono text-slate-700 text-[11px] truncate block">{decisao.nomeFicheiro}</span>
                      </div>
                    </div>

                    {/* Destaque do Campo do Drill-Down */}
                    {drillDown.renderValor && (
                      <div className="pt-1">
                        {drillDown.renderValor(decisao)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer do Drill-Down */}
            <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Total apresentado: <strong>{decisoesDrillDownFiltradas.length}</strong> de {drillDown.decisoes.length} processos correspondentes
              </span>
              <button
                type="button"
                onClick={() => setDrillDown(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Fechar Listagem
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
