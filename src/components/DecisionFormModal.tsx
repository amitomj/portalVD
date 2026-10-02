import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Printer, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  User, 
  Users, 
  Scale, 
  Activity, 
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Building2,
  Calendar,
  HeartCrack,
  Clock,
  Briefcase,
  GraduationCap,
  Home,
  DollarSign,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ShieldCheck,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
  FileCode,
  Lock,
  RefreshCw
} from 'lucide-react';
import { anonimizarTextoJudicial } from '../lib/anonymizer';
import type { 
  DecisaoJudicialVD, 
  Sexo, 
  TipoRelacao, 
  RegimeResidencia, 
  TitularidadeCasaPropria,
  TipoPericia
} from '../types/judicial';
import { salvarDecisaoFirestore } from '../lib/firebase';
import { criarAnaliseDetalhadaPadrao } from '../lib/decisionParser';

interface DecisionFormModalProps {
  decisao: DecisaoJudicialVD;
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (decisaoAtualizada: DecisaoJudicialVD) => void;
}

/**
 * Renderiza o texto processual aplicando estilo visual de borrão preto sólido (tarja de anonimização)
 * a todos os blocos de caracteres Unicode '█' e realce dinâmico em termos pesquisados.
 */
const RenderizarTextoComBorrao: React.FC<{ texto: string; termoPesquisa?: string }> = ({ texto, termoPesquisa }) => {
  const textoSeguro = React.useMemo(() => {
    if (!texto || texto.trim().length === 0) return '';
    // Garantir anonimização profunda e sistemática de quaisquer nomes ou dados remanescentes
    return anonimizarTextoJudicial(texto).textoAnonimizado;
  }, [texto]);

  if (!textoSeguro || textoSeguro.trim().length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 italic text-xs">
        Nenhum conteúdo textual registado para este segmento processual.
      </div>
    );
  }

  const linhas = textoSeguro.split('\n');

  return (
    <div className="font-mono text-[11.5px] leading-relaxed text-slate-800 space-y-0.5 select-text">
      {linhas.map((linha, lIdx) => {
        if (!linha.trim()) {
          return <div key={lIdx} className="h-2.5" />;
        }

        // Linha identificada como nota de rodapé ou citação
        const isNota = /^\s*(?:\[\d+\]|\(\d+\)|\d+\.\s+[A-ZÀ-ÿ]|\*{1,3}\s+|(?:Cfr\.|Acórdão|Ac\.|STJ|TR[LPCGE]|fls\.\s*\d+|artigo\s+\d+|Maia\s+Gonçalves))/i.test(linha.trim());

        // Divide a linha pelas ocorrências de borrão preto (caracteres █)
        const partes = linha.split(/(█+)/g);

        return (
          <div 
            key={lIdx} 
            className={`py-0.5 px-1 rounded transition-colors ${
              isNota 
                ? 'bg-amber-50/80 border-l-2 border-amber-500 pl-3 my-1 text-slate-700 font-sans text-xs' 
                : 'hover:bg-slate-50'
            }`}
          >
            {partes.map((parte, pIdx) => {
              if (parte.startsWith('█')) {
                return (
                  <span
                    key={pIdx}
                    className="inline-block bg-black text-black px-1 mx-0.5 rounded-[2px] font-mono tracking-tighter leading-none select-all shadow-xs cursor-help"
                    title="Dado confidencial anonimizado com borrão preto (tarja de proteção de privacidade)"
                  >
                    {parte}
                  </span>
                );
              }

              if (termoPesquisa && termoPesquisa.trim().length >= 2) {
                const regexPesquisa = new RegExp(`(${termoPesquisa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                const fragmentos = parte.split(regexPesquisa);
                return (
                  <span key={pIdx}>
                    {fragmentos.map((frag, fIdx) => 
                      regexPesquisa.test(frag) ? (
                        <mark key={fIdx} className="bg-amber-300 text-slate-950 font-bold px-0.5 rounded-xs">
                          {frag}
                        </mark>
                      ) : (
                        <span key={fIdx}>{frag}</span>
                      )
                    )}
                  </span>
                );
              }

              return <span key={pIdx}>{parte}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export const DecisionFormModal: React.FC<DecisionFormModalProps> = ({
  decisao,
  isOpen,
  onClose,
  onSalvar
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<DecisaoJudicialVD>(() => {
    const copy = { ...decisao };
    if (!copy.analiseDetalhada) {
      const partial = {
        numeroProcessoReal: copy.numeroProcessoReal,
        tipoPena: copy.tipoPena,
        artigosLegais: copy.artigosLegais,
        ofensas: copy.ofensas,
        reincidencia: copy.reincidencia,
        indemnizacaoCivel: copy.indemnizacaoCivel,
        tribunal: copy.tribunal,
        coabitacao: copy.coabitacao,
        arguido: copy.arguido,
        ofendido: copy.ofendido
      };
      copy.analiseDetalhada = criarAnaliseDetalhadaPadrao(copy.trechosDecisao?.textoIntegralAnonimizado || '', partial);
    }
    return copy;
  });
  const [abaAtivaForm, setAbaAtivaForm] = useState<'basico' | 'analise_detalhada'>('basico');
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mostrarFontes, setMostrarFontes] = useState(true);
  const [abaFonteAtiva, setAbaFonteAtiva] = useState<'integral' | 'relatorio' | 'factos' | 'dispositivo' | 'notas' | 'todos'>('integral');
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [reanonimizou, setReanonimizou] = useState(false);

  const handleReanonimizarTudo = () => {
    if (!formData.trechosDecisao) return;
    const t = formData.trechosDecisao;
    const novoIntegral = anonimizarTextoJudicial(t.textoIntegralAnonimizado || '').textoAnonimizado;
    const novoRelatorio = anonimizarTextoJudicial(t.relatorioInicial || '').textoAnonimizado;
    const novoFactos = anonimizarTextoJudicial(t.factosProvados || '').textoAnonimizado;
    const novoDispositivo = anonimizarTextoJudicial(t.dispositivoDecisorio || '').textoAnonimizado;
    const novasPenas = anonimizarTextoJudicial(t.penas || '').textoAnonimizado;
    const novaIdent = anonimizarTextoJudicial(t.identificacao || '').textoAnonimizado;
    const novaResid = anonimizarTextoJudicial(t.residencia || '').textoAnonimizado;

    setFormData(prev => ({
      ...prev,
      trechosDecisao: {
        ...prev.trechosDecisao!,
        textoIntegralAnonimizado: novoIntegral,
        relatorioInicial: novoRelatorio,
        factosProvados: novoFactos,
        dispositivoDecisorio: novoDispositivo,
        penas: novasPenas,
        identificacao: novaIdent,
        residencia: novaResid,
      }
    }));
    setReanonimizou(true);
    setTimeout(() => setReanonimizou(false), 3000);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    const atualizada = {
      ...formData,
      statusValidacao: 'validado' as const,
      dataProcessamento: new Date().toISOString()
    };
    await salvarDecisaoFirestore(atualizada);
    onSalvar(atualizada);
    setSalvando(false);
    setMensagemSucesso('Formulário guardado e sincronizado com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-md bg-amber-400 text-slate-950 font-mono font-bold text-sm tracking-wide">
              {formData.seqId}
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>Formulário de Decisão Judicial</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                  Anonimizado
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ficheiro: <span className="font-mono text-slate-300">{formData.nomeFicheiro}</span> • Processo substituído por ID sequencial
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Imprimir / Exportar Ficha em PDF"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {mensagemSucesso && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          
          {/* Identificador Sequencial & Âmbito */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">Identificador no Estudo:</span>
              <span className="px-3 py-1 bg-amber-400 text-slate-950 font-mono font-bold text-base rounded shadow-xs">
                {formData.seqId}
              </span>
              <span className="text-xs text-amber-800">
                (O processo real está protegido sob segredo na Área do Administrador)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Enquadramento Legal:</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-900">
                {formData.tipoCrimeDetectado === 'homicidio_contexto_vd' 
                  ? 'Homicídio em Contexto de VD' 
                  : 'Violência Doméstica (Art. 152.º)'}
              </span>
            </div>
          </div>
          
          {/* Tabs para alternar entre Ficha de Dados Básica e Análise Detalhada Extensa */}
          <div className="flex border-b border-slate-200 gap-4 mt-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setAbaAtivaForm('basico')}
              className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                abaAtivaForm === 'basico'
                  ? 'border-indigo-900 text-indigo-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-700" />
              <span>1. Ficha de Dados Básicos</span>
            </button>
            <button
              type="button"
              onClick={() => setAbaAtivaForm('analise_detalhada')}
              className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                abaAtivaForm === 'analise_detalhada'
                  ? 'border-purple-900 text-purple-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-700" />
              <span>2. Análise Sociológica & Processual Extensa</span>
            </button>
            <button
              type="button"
              onClick={() => setAbaAtivaForm('grelha_recolha')}
              className={`pb-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                abaAtivaForm === 'grelha_recolha'
                  ? 'border-emerald-950 text-emerald-950 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>3. Grelha de Recolha de Dados (66 Elementos)</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                Grelha Completa
              </span>
            </button>
          </div>

          {abaAtivaForm === 'basico' && (
            <>
              {/* 1. Tribunal e Crime */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>1. Identificação da Decisão & Tribunal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tribunal da Decisão
                </label>
                <input
                  type="text"
                  value={formData.tribunal}
                  onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ex: Tribunal Judicial da Comarca de Lisboa"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Data da Decisão Judicial</span>
                  <span className="text-[11px] font-normal text-slate-400">Constante da parte final</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.dataDecisao}
                    onChange={(e) => setFormData({ ...formData, dataDecisao: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    placeholder="Ex: 15 de Novembro de 2023"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Crime Identificado (Apenas Violência Doméstica ou Homicídio em Contexto de VD)
                </label>
                <input
                  type="text"
                  value={formData.crime}
                  onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Relação Rigorosa */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Categoria da Relação (Rigor Obrigatório)
                  </label>
                  <select
                    value={formData.tipoRelacao}
                    onChange={(e) => {
                      const val = e.target.value as TipoRelacao;
                      const labels: Record<TipoRelacao, string> = {
                        conjuge: 'Cônjuge (Casamento)',
                        ex_conjuge: 'Ex-cônjuge (Divorciados / Separados)',
                        unido_de_facto: 'Unido(a) de facto (União de facto em vigor)',
                        ex_unido_de_facto: 'Ex-unido(a) de facto (União de facto cessada)',
                        namorado: 'Namorado(a) (Relação de namoro)',
                        ex_namorado: 'Ex-namorado(a) (Relação de namoro finda)',
                        progenitor: 'Progenitor(a) (Pai / Mãe)',
                        filho: 'Filho(a) (Descendente)',
                        outro_familiar: 'Outro familiar',
                        nao_especificada: 'Não especificada'
                      };
                      setFormData({ 
                        ...formData, 
                        tipoRelacao: val,
                        relacaoAgressorVitima: labels[val] || val 
                      });
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="conjuge">Cônjuge (Casamento em vigor)</option>
                    <option value="ex_conjuge">Ex-cônjuge (Divorciados / Separados)</option>
                    <option value="unido_de_facto">Unido(a) de facto (União de facto em vigor)</option>
                    <option value="ex_unido_de_facto">Ex-unido(a) de facto (União de facto cessada)</option>
                    <option value="namorado">Namorado(a) (Relação de namoro em vigor)</option>
                    <option value="ex_namorado">Ex-namorado(a) (Relação de namoro terminada)</option>
                    <option value="progenitor">Progenitor(a) (Pai / Mãe)</option>
                    <option value="filho">Filho(a) (Descendente)</option>
                    <option value="outro_familiar">Outro familiar</option>
                    <option value="nao_especificada">Não especificada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição Detalhada da Relação
                  </label>
                  <input
                    type="text"
                    value={formData.relacaoAgressorVitima}
                    onChange={(e) => setFormData({ ...formData, relacaoAgressorVitima: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    placeholder="Ex: Cônjuges há 16 anos; Unidos de facto há 4 anos..."
                  />
                </div>
              </div>

            </div>
          </div>

          {/* 2. Coabitação e Regime de Residência */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Home className="w-4 h-4 text-indigo-600" />
              <span>2. Coabitação & Regime de Residência</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Coabitam? */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vivem na Mesma Residência?
                </label>
                <select
                  value={formData.coabitacao === true ? 'sim' : formData.coabitacao === false ? 'nao' : 'nao_apurado'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      coabitacao: val === 'sim' ? true : val === 'nao' ? false : null,
                      coabitacaoTexto: val === 'sim' ? 'Sim, vivem na mesma residência' : val === 'nao' ? 'Não vivem na mesma residência' : 'Não apurado expressamente'
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="sim">Sim, coabitam / mesma residência</option>
                  <option value="nao">Não, residências separadas</option>
                  <option value="nao_apurado">Não apurado expressamente nos autos</option>
                </select>
              </div>

              {/* Regime da Residência */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Regime da Residência
                </label>
                <select
                  value={formData.regimeResidencia}
                  onChange={(e) => {
                    const reg = e.target.value as RegimeResidencia;
                    setFormData({
                      ...formData,
                      regimeResidencia: reg,
                      titularidadeCasaPropria: reg === 'casa_propria' ? formData.titularidadeCasaPropria : 'nao_aplicavel'
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="casa_arrendada">Casa arrendada</option>
                  <option value="casa_cedida_gratuitamente">Casa cedida gratuitamente</option>
                  <option value="casa_propria">Casa própria</option>
                  <option value="outro">Outro regime</option>
                  <option value="nao_especificado">Não especificado nos autos</option>
                </select>
              </div>

              {/* Titularidade da Casa Própria (se aplicável) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dono da Casa Própria (se aplicável)
                </label>
                <select
                  disabled={formData.regimeResidencia !== 'casa_propria'}
                  value={formData.titularidadeCasaPropria}
                  onChange={(e) => setFormData({
                    ...formData,
                    titularidadeCasaPropria: e.target.value as TitularidadeCasaPropria
                  })}
                  className={`w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium ${
                    formData.regimeResidencia !== 'casa_propria' ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''
                  }`}
                >
                  <option value="arguido">O Arguido</option>
                  <option value="ofendida">A Ofendida</option>
                  <option value="ambos">Os Dois (Ambos / Bem Comum)</option>
                  <option value="nao_especificado">Não especificado</option>
                  <option value="nao_aplicavel">Não aplicável (não é casa própria)</option>
                </select>
              </div>

              {/* Detalhes da Residência */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas / Detalhes sobre a Habitação
                </label>
                <input
                  type="text"
                  value={formData.detalhesResidencia}
                  onChange={(e) => setFormData({ ...formData, detalhesResidencia: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  placeholder="Ex: Casa arrendada mediante renda mensal de 450€; Casa própria de ambos os cônjuges..."
                />
              </div>
            </div>
          </div>

          {/* 3. Identificação do Arguido e Ofendido (Profissão vs Vencimento) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Arguido */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-indigo-700" />
                <span>3. Identificação do Arguido</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Idade</label>
                    <input
                      type="text"
                      value={formData.arguido.idadeTexto || (formData.arguido.idade ? `${formData.arguido.idade} anos` : '')}
                      onChange={(e) => setFormData({
                        ...formData,
                        arguido: { ...formData.arguido, idadeTexto: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                      placeholder="Ex: 45 anos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
                    <select
                      value={formData.arguido.sexo}
                      onChange={(e) => setFormData({
                        ...formData,
                        arguido: { ...formData.arguido, sexo: e.target.value as Sexo }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="M">Masculino (M)</option>
                      <option value="F">Feminino (F)</option>
                      <option value="Outro">Outro</option>
                      <option value="Não especificado">Não especificado</option>
                    </select>
                  </div>
                </div>

                {/* Profissão e Vencimento do Arguido */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.arguido.profissao}
                      onChange={(e) => setFormData({
                        ...formData,
                        arguido: { ...formData.arguido, profissao: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                      placeholder="Não apurada"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Se não for clara, indicar "Não apurada"
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vencimento Mensal
                    </label>
                    <input
                      type="text"
                      value={formData.arguido.vencimentoMensal || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        arguido: { ...formData.arguido, vencimentoMensal: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-mono"
                      placeholder="Ex: 820,00 € / Não apurado"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Rendimento auferido nos autos
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Habilitações Literárias</label>
                  <input
                    type="text"
                    value={formData.arguido.habilitacoesLiterarias}
                    onChange={(e) => setFormData({
                      ...formData,
                      arguido: { ...formData.arguido, habilitacoesLiterarias: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                    placeholder="Ex: 9.º ano, 12.º ano..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Antecedentes Criminais (CRC)</label>
                  <textarea
                    rows={2}
                    value={formData.arguido.antecedentesCriminais}
                    onChange={(e) => setFormData({
                      ...formData,
                      arguido: { ...formData.arguido, antecedentesCriminais: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    placeholder="Ex: Sem antecedentes / Já condenado anteriormente..."
                  />
                </div>
              </div>
            </div>

            {/* Ofendido / Vítima */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>4. Identificação do(a) Ofendido(a)</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Idade</label>
                    <input
                      type="text"
                      value={formData.ofendido.idadeTexto || (formData.ofendido.idade ? `${formData.ofendido.idade} anos` : '')}
                      onChange={(e) => setFormData({
                        ...formData,
                        ofendido: { ...formData.ofendido, idadeTexto: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                      placeholder="Ex: 42 anos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
                    <select
                      value={formData.ofendido.sexo}
                      onChange={(e) => setFormData({
                        ...formData,
                        ofendido: { ...formData.ofendido, sexo: e.target.value as Sexo }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="F">Feminino (F)</option>
                      <option value="M">Masculino (M)</option>
                      <option value="Outro">Outro</option>
                      <option value="Não especificado">Não especificado</option>
                    </select>
                  </div>
                </div>

                {/* Profissão e Vencimento do Ofendido */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.ofendido.profissao}
                      onChange={(e) => setFormData({
                        ...formData,
                        ofendido: { ...formData.ofendido, profissao: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                      placeholder="Não apurada"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Se não for clara, indicar "Não apurada"
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vencimento Mensal
                    </label>
                    <input
                      type="text"
                      value={formData.ofendido.vencimentoMensal || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        ofendido: { ...formData.ofendido, vencimentoMensal: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-mono"
                      placeholder="Ex: 850,00 € / Não apurado"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Rendimento ou subsídio
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Habilitações Literárias</label>
                  <input
                    type="text"
                    value={formData.ofendido.habilitacoesLiterarias}
                    onChange={(e) => setFormData({
                      ...formData,
                      ofendido: { ...formData.ofendido, habilitacoesLiterarias: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                    placeholder="Ex: 12.º ano, Ensino Superior..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Antecedentes Criminais</label>
                  <textarea
                    rows={2}
                    value={formData.ofendido.antecedentesCriminais}
                    onChange={(e) => setFormData({
                      ...formData,
                      ofendido: { ...formData.ofendido, antecedentesCriminais: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    placeholder="Registo de antecedentes da ofendida..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Penas e Condenações */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Scale className="w-4 h-4 text-indigo-700" />
              <span>5. Pena Aplicada & Consequências Jurídicas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pena Principal Cominada
                </label>
                <input
                  type="text"
                  value={formData.penaAplicada}
                  onChange={(e) => setFormData({ ...formData, penaAplicada: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-medium"
                  placeholder="Ex: 2 anos e 6 meses de prisão suspensa na sua execução por 3 anos"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Regime da Pena
                </label>
                <select
                  value={formData.tipoPena}
                  onChange={(e) => setFormData({
                    ...formData,
                    tipoPena: e.target.value as any
                  })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="prisao_suspensa">Prisão Suspensa na Execução</option>
                  <option value="prisao_efetiva">Prisão Efetiva</option>
                  <option value="multa">Multa</option>
                  <option value="absolvicao">Absolvição</option>
                  <option value="trabalho_comunitario">Trabalho a Favor da Comunidade</option>
                  <option value="outro">Outro Regime</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penas Acessórias & Medidas de Coação/Injunção
                </label>
                <input
                  type="text"
                  value={formData.penasAcessorias}
                  onChange={(e) => setFormData({ ...formData, penasAcessorias: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="Ex: Proibição de contactos; Afastamento de residência; Vigilância eletrónica (pulseira)..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Indemnização Cível / Danos Morais
                </label>
                <input
                  type="text"
                  value={formData.indemnizacaoCivel}
                  onChange={(e) => setFormData({ ...formData, indemnizacaoCivel: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  placeholder="Ex: 3.500,00 € a título de danos não patrimoniais"
                />
              </div>
            </div>
          </div>

          {/* 5. Reincidência e Vítimas Menores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reincidência */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  6. Reincidência (Art. 75.º do Código Penal)
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reincidencia}
                    onChange={(e) => setFormData({ ...formData, reincidencia: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {formData.reincidencia ? 'Sim, Há Reincidência' : 'Sem Reincidência'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enquadramento da Reincidência nos Autos
                </label>
                <textarea
                  rows={2}
                  value={formData.reincidenciaDetalhe}
                  onChange={(e) => setFormData({ ...formData, reincidenciaDetalhe: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  placeholder="Fundamentação da reincidência ou delinquência primária..."
                />
              </div>
            </div>

            {/* Vítimas Menores */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HeartCrack className="w-4 h-4 text-rose-600" />
                  7. Vítimas ou Presença de Menores (&lt; 18 anos)
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vitimasMenores18}
                    onChange={(e) => setFormData({ ...formData, vitimasMenores18: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {formData.vitimasMenores18 ? 'Sim, Envolve Menores' : 'Sem Menores'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detalhes das Vítimas Menores (Art. 152.º, n.º 2, al. a))
                </label>
                <textarea
                  rows={2}
                  value={formData.vitimasMenoresDetalhe}
                  onChange={(e) => setFormData({ ...formData, vitimasMenoresDetalhe: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  placeholder="Ex: Presença do filho menor de 8 anos durante as agressões..."
                />
              </div>
            </div>
          </div>

          {/* 6. Tipos de Ofensas Perpetradas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>8. Tipos de Ofensas Perpetradas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Físicas */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ofensas.fisicas}
                    onChange={(e) => setFormData({
                      ...formData,
                      ofensas: { ...formData.ofensas, fisicas: e.target.checked }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900">Ofensas Físicas</span>
                </label>
                <input
                  type="text"
                  value={formData.ofensas.detalhesFisicas}
                  onChange={(e) => setFormData({
                    ...formData,
                    ofensas: { ...formData.ofensas, detalhesFisicas: e.target.value }
                  })}
                  className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                  placeholder="Socos, bofetadas, empurrões, escoriações..."
                />
              </div>

              {/* Psicológicas */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ofensas.psicologicas}
                    onChange={(e) => setFormData({
                      ...formData,
                      ofensas: { ...formData.ofensas, psicologicas: e.target.checked }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900">Ofensas Psicológicas / Emocionais</span>
                </label>
                <input
                  type="text"
                  value={formData.ofensas.detalhesPsicologicas}
                  onChange={(e) => setFormData({
                    ...formData,
                    ofensas: { ...formData.ofensas, detalhesPsicologicas: e.target.value }
                  })}
                  className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                  placeholder="Injúrias, insultos, ameaças de morte, perseguição..."
                />
              </div>

              {/* Sexuais */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ofensas.sexuais}
                    onChange={(e) => setFormData({
                      ...formData,
                      ofensas: { ...formData.ofensas, sexuais: e.target.checked }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900">Ofensas Sexuais</span>
                </label>
                <input
                  type="text"
                  value={formData.ofensas.detalhesSexuais}
                  onChange={(e) => setFormData({
                    ...formData,
                    ofensas: { ...formData.ofensas, detalhesSexuais: e.target.value }
                  })}
                  className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                  placeholder="Atos sexuais coagidos, coação sexual..."
                />
              </div>

              {/* Patrimoniais */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ofensas.patrimoniais}
                    onChange={(e) => setFormData({
                      ...formData,
                      ofensas: { ...formData.ofensas, patrimoniais: e.target.checked }
                    })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900">Ofensas Patrimoniais / Financeiras</span>
                </label>
                <input
                  type="text"
                  value={formData.ofensas.detalhesPatrimoniais}
                  onChange={(e) => setFormData({
                    ...formData,
                    ofensas: { ...formData.ofensas, detalhesPatrimoniais: e.target.value }
                  })}
                  className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                  placeholder="Partiu telemóvel, destruição de bens, retenção financeira..."
                />
              </div>
            </div>
          </div>

          {/* 9. Perícias Realizadas */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-700" />
                9. Realização de Perícias Forenses
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pericias.realizadas}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({
                      ...formData,
                      pericias: { 
                        ...formData.pericias, 
                        realizadas: checked,
                        categorias: checked ? (formData.pericias.categorias || []) : []
                      }
                    });
                  }}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  {formData.pericias.realizadas ? 'Sim, Foram Realizadas' : 'Sem Perícias Documentadas'}
                </span>
              </label>
            </div>

            {formData.pericias.realizadas && (
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Categorias de Perícias Identificadas:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'medico_legal', label: 'Médico-Legal / Dano Corporal (INMLCF)' },
                    { id: 'psiquiatrica', label: 'Psiquiátrica Forense' },
                    { id: 'psicologica', label: 'Psicológica / Personalidade' },
                    { id: 'relatorio_social_dgrsp', label: 'Relatório Social DGRSP' },
                    { id: 'informatica', label: 'Informática e Telefónica Forense' },
                    { id: 'toxicologica', label: 'Toxicológica Forense' },
                    { id: 'balistica', label: 'Balística / Armas' },
                    { id: 'outra', label: 'Outro Tipo de Perícia' }
                  ].map(({ id, label }) => {
                    const catId = id as TipoPericia;
                    const isSelected = formData.pericias.categorias?.includes(catId);
                    return (
                      <label key={id} className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={(e) => {
                            const current = formData.pericias.categorias || [];
                            const updatedCats = e.target.checked 
                              ? [...current, catId]
                              : current.filter(c => c !== catId);
                            setFormData({
                              ...formData,
                              pericias: {
                                ...formData.pericias,
                                categorias: updatedCats
                              }
                            });
                          }}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-800 font-medium">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipos e Resultados das Perícias (Extração textual dos autos)
              </label>
              <textarea
                rows={2}
                value={formData.pericias.detalhes}
                onChange={(e) => setFormData({
                  ...formData,
                  pericias: { ...formData.pericias, detalhes: e.target.value }
                })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                placeholder="Ex: Perícia médico-legal INMLCF com 8 dias para cura; Relatório social DGRSP..."
              />
            </div>
          </div>
          </>
          )}

          {abaAtivaForm === 'analise_detalhada' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* SECÇÃO 1. Metadados processuais e identificação do caso */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-purple-700" />
                  <span>1. Metadados Processuais e Identificação do Caso</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Número Único do Processo</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.numProcessoUnico || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, numProcessoUnico: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                      placeholder="Ex: 154/22.0PBFAR"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tribunal de Origem</label>
                    <input
                      type="text"
                      value={formData.tribunal}
                      onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data da Ocorrência dos Factos</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.dataOcorrenciaFactos || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, dataOcorrenciaFactos: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: 2021-08-15 ou Entre 2020 e 2022"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data da Decisão</label>
                    <input
                      type="text"
                      value={formData.dataDecisao}
                      onChange={(e) => setFormData({ ...formData, dataDecisao: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Decisão Final</label>
                    <select
                      value={formData.analiseDetalhada?.tipoDecisaoFinal || 'condenacao'}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, tipoDecisaoFinal: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="condenacao">Condenação</option>
                      <option value="absolvicao">Absolvição</option>
                      <option value="arquivamento">Arquivamento</option>
                      <option value="suspensao_provisoria">Suspensão Provisória do Processo</option>
                      <option value="outra">Outra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fase Processual</label>
                    <select
                      value={formData.analiseDetalhada?.faseProcessual || 'julgamento'}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, faseProcessual: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="instrucao">Instrução</option>
                      <option value="julgamento">Julgamento</option>
                      <option value="recurso">Recurso</option>
                      <option value="execucao">Execução</option>
                      <option value="nao_especificada">Não especificada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Regime Processual</label>
                    <select
                      value={formData.analiseDetalhada?.regimeProcessual || 'comum'}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, regimeProcessual: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="comum">Comum</option>
                      <option value="abreviado">Abreviado</option>
                      <option value="sumarissimo">Sumaríssimo</option>
                      <option value="especial">Especial</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Crime(s) Tipificado(s)</label>
                    <input
                      type="text"
                      value={formData.crime}
                      onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">Legislação Aplicável Citada</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.legislacaoCitada || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, legislacaoCitada: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                      placeholder="Ex: Artigo 152.º do Código Penal; Lei n.º 112/2009..."
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO 2. Características das partes */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Users className="w-4 h-4 text-purple-700" />
                  <span>2. Características das Partes (Vítima, Ofensor, Testemunhas e Peritos)</span>
                </div>
                
                {/* 2.1 Vítima */}
                <div className="space-y-3 p-3 bg-purple-50/40 rounded-xl border border-purple-100/60">
                  <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-700" />
                    <span>2.1. Vítima / Ofendido(a)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sexo/Género</label>
                      <select
                        value={formData.ofendido.sexo}
                        onChange={(e) => setFormData({
                          ...formData,
                          ofendido: { ...formData.ofendido, sexo: e.target.value as Sexo }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                      >
                        <option value="F">Feminino (F)</option>
                        <option value="M">Masculino (M)</option>
                        <option value="Outro">Outro</option>
                        <option value="Não especificado">Não especificado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Idade / Faixa Etária</label>
                      <input
                        type="text"
                        value={formData.ofendido.idadeTexto || (formData.ofendido.idade ? `${formData.ofendido.idade} anos` : '')}
                        onChange={(e) => setFormData({
                          ...formData,
                          ofendido: { ...formData.ofendido, idadeTexto: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: 34 anos"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Estado Civil</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.vitimaEstadoCivil || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaEstadoCivil: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Solteiro, Casado, Divorciado"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nível de Escolaridade</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.vitimaEscolaridade || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaEscolaridade: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: 9.º ano, Licenciatura"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Profissão / Ocupação</label>
                      <input
                        type="text"
                        value={formData.ofendido.profissao}
                        onChange={(e) => setFormData({
                          ...formData,
                          ofendido: { ...formData.ofendido, profissao: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Empregada de escritório"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Existência de Filhos em Comum (n.º, idades)</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.vitimaFilhosComum || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaFilhosComum: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: 2 filhos (3 e 5 anos)"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tempo de Relação</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.vitimaTempoRelacao || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaTempoRelacao: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: 5 anos"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Situação de Coabitação</label>
                      <select
                        value={formData.analiseDetalhada?.vitimaSituacaoCoabitacao || 'nao_especificado'}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaSituacaoCoabitacao: e.target.value as any }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="juntos">Viviam juntos</option>
                        <option value="separados">Separados</option>
                        <option value="em_separacao">Em processo de separação</option>
                        <option value="nao_especificado">Não especificado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Dependência Económica Ofensor</label>
                      <select
                        value={formData.analiseDetalhada?.vitimaDependenciaEconomica === true ? 'sim' : formData.analiseDetalhada?.vitimaDependenciaEconomica === false ? 'nao' : 'nao_apurado'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            analiseDetalhada: {
                              ...formData.analiseDetalhada!,
                              vitimaDependenciaEconomica: val === 'sim' ? true : val === 'nao' ? false : null
                            }
                          });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="sim">Sim, dependente</option>
                        <option value="nao">Não, autónoma</option>
                        <option value="nao_apurado">Não especificado / Não apurado</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">Participação no Processo</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.vitimaParticipacaoProcesso || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaParticipacaoProcesso: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: constituiu assistente, prestou depoimento, desistiu da queixa"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Histórico Prévio de Violência (queixas, medidas já aplicadas)</label>
                      <textarea
                        rows={2}
                        value={formData.analiseDetalhada?.vitimaHistoricoViolencia || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaHistoricoViolencia: e.target.value }
                        })}
                        className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Queixas policiais arquivadas anteriormente, histórico de episódios recorrentes..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Presença de Vulnerabilidades Específicas (gravidez, deficiência, etc.)</label>
                      <textarea
                        rows={2}
                        value={formData.analiseDetalhada?.vitimaVulnerabilidades || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, vitimaVulnerabilidades: e.target.value }
                        })}
                        className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Gravidez, deficiência, idade avançada, doença crónica..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2.2 Ofensor */}
                <div className="space-y-3 p-3 bg-amber-50/40 rounded-xl border border-amber-100/60">
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span>2.2. Ofensor / Arguido / Réu</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sexo/Género</label>
                      <select
                        value={formData.arguido.sexo}
                        onChange={(e) => setFormData({
                          ...formData,
                          arguido: { ...formData.arguido, sexo: e.target.value as Sexo }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                      >
                        <option value="M">Masculino (M)</option>
                        <option value="F">Feminino (F)</option>
                        <option value="Outro">Outro</option>
                        <option value="Não especificado">Não especificado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Idade</label>
                      <input
                        type="text"
                        value={formData.arguido.idadeTexto || (formData.arguido.idade ? `${formData.arguido.idade} anos` : '')}
                        onChange={(e) => setFormData({
                          ...formData,
                          arguido: { ...formData.arguido, idadeTexto: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: 45 anos"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Estado Civil</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.ofensorEstadoCivil || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, ofensorEstadoCivil: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Casado, Solteiro, Divorciado"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nível de Escolaridade</label>
                      <input
                        type="text"
                        value={formData.arguido.habilitacoesLiterarias}
                        onChange={(e) => setFormData({
                          ...formData,
                          arguido: { ...formData.arguido, habilitacoesLiterarias: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: 4.º ano, 9.º ano, Ensino Secundário"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Profissão / Ocupação</label>
                      <input
                        type="text"
                        value={formData.arguido.profissao}
                        onChange={(e) => setFormData({
                          ...formData,
                          arguido: { ...formData.arguido, profissao: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Consumo Problemático Álcool/Drogas</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.ofensorConsumoProblema || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, ofensorConsumoProblema: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Sim, dependência alcoólica expressa / Não mencionado"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Participação em Programas de Reabilitação (antes/durante)</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.ofensorProgramasReabilitacao || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, ofensorProgramasReabilitacao: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Condenado a frequentar programa PAVD"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Antecedentes Criminais (reincidência, crimes anteriores)</label>
                      <textarea
                        rows={2}
                        value={formData.arguido.antecedentesCriminais}
                        onChange={(e) => setFormData({
                          ...formData,
                          arguido: { ...formData.arguido, antecedentesCriminais: e.target.value }
                        })}
                        className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="CRC do arguido..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Histórico de Violência Doméstica</label>
                      <textarea
                        rows={2}
                        value={formData.analiseDetalhada?.ofensorHistoricoViolencia || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, ofensorHistoricoViolencia: e.target.value }
                        })}
                        className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Padrão habitual ou queixas passadas..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2.3 Outros Sujeitos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Testemunhas (número, tipo: familiares, vizinhos, técnicos, etc.)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.testemunhasDetalhe || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, testemunhasDetalhe: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: 3 testemunhas inquiridas (2 familiares, 1 vizinho)..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Peritos (psicólogos, assistentes sociais, médicos legistas, etc.)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.peritosDetalhe || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, peritosDetalhe: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Intervenção de peritos médicos do INMLCF e perito DGRSP..."
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO 3. Contexto factual e tipologia da violência */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <AlertTriangle className="w-4 h-4 text-purple-700" />
                  <span>3. Contexto Factual e Tipologia da Violência</span>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="block font-bold text-slate-800 mb-1.5">Tipologia(s) de Violência Identificada(s):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { id: 'violenciaFisica', label: 'Agressões Físicas' },
                        { id: 'violenciaPsicologica', label: 'Violência Psic./Emocional' },
                        { id: 'violenciaSexual', label: 'Violência Sexual' },
                        { id: 'violenciaEconomica', label: 'Violência Económica/Patr.' },
                        { id: 'violenciaMoral', label: 'Violência Moral / Injúrias' }
                      ].map((item) => {
                        const key = item.id as 'violenciaFisica' | 'violenciaPsicologica' | 'violenciaSexual' | 'violenciaEconomica' | 'violenciaMoral';
                        return (
                          <label key={item.id} className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100">
                            <input
                              type="checkbox"
                              checked={!!formData.analiseDetalhada?.[key]}
                              onChange={(e) => setFormData({
                                ...formData,
                                analiseDetalhada: { ...formData.analiseDetalhada!, [key]: e.target.checked }
                              })}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="font-semibold text-slate-800">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Frequência da Violência</label>
                      <select
                        value={formData.analiseDetalhada?.frequenciaViolencia || 'nao_especificado'}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, frequenciaViolencia: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="episodio_isolado">Episódio Isolado (Facto único)</option>
                        <option value="padrao_repetido">Padrão Repetido / Reiterado</option>
                        <option value="cronica">Violência Crónica</option>
                        <option value="nao_especificado">Não especificado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gravidade das Lesões</label>
                      <select
                        value={formData.analiseDetalhada?.gravidadeLesoes || 'nao_especificado'}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, gravidadeLesoes: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="sem_lesoes">Sem lesões físicas</option>
                        <option value="leve">Leve (Cura &lt; 10 dias / Escoriações)</option>
                        <option value="moderada">Moderada (Tratamento hospitalar)</option>
                        <option value="grave">Grave (Internamento / Perigo de Vida)</option>
                        <option value="nao_especificado">Não especificado nos autos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Uso de Armas ou Objetos</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.usoArmasObjetos || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, usoArmasObjetos: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Faca de cozinha, bastão de madeira, etc."
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Local da Agressão</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.localAgressao || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, localAgressao: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Habitação comum das partes, via pública"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Presença de Filhos durante Agressão</label>
                      <select
                        value={formData.analiseDetalhada?.presencaFilhosAgressao === true ? 'sim' : formData.analiseDetalhada?.presencaFilhosAgressao === false ? 'nao' : 'nao_apurado'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            analiseDetalhada: {
                              ...formData.analiseDetalhada!,
                              presencaFilhosAgressao: val === 'sim' ? true : val === 'nao' ? false : null
                            }
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="sim">Sim, presenciaram as agressões</option>
                        <option value="nao">Não presenciaram</option>
                        <option value="nao_apurado">Não especificado / Não apurado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ameaças de Morte ou Suicídio</label>
                      <select
                        value={formData.analiseDetalhada?.ameacasMorteSuicidio === true ? 'sim' : formData.analiseDetalhada?.ameacasMorteSuicidio === false ? 'nao' : 'nao_apurado'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            analiseDetalhada: {
                              ...formData.analiseDetalhada!,
                              ameacasMorteSuicidio: val === 'sim' ? true : val === 'nao' ? false : null
                            }
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="sim">Sim, expressas e reiteradas</option>
                        <option value="nao">Não apuradas nos autos</option>
                        <option value="nao_apurado">Não especificado</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">Provas Apresentadas (Relatórios, testemunhos, perícias...)</label>
                      <input
                        type="text"
                        value={(formData.analiseDetalhada?.provasApresentadas || []).join(', ')}
                        onChange={(e) => {
                          const arr = e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                          setFormData({
                            ...formData,
                            analiseDetalhada: { ...formData.analiseDetalhada!, provasApresentadas: arr }
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                        placeholder="Ex: Testemunhos, Relatórios médicos, Fotografias..."
                      />
                      <span className="text-[10px] text-slate-400 block mt-0.5">Separe as provas com vírgulas.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECÇÃO 4. Medidas processuais e cautelares */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>4. Medidas Processuais e Cautelares Aplicadas</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Houve Aplicação de Medidas Cautelares?</label>
                    <select
                      value={formData.analiseDetalhada?.medidasCautelaresAplicadas === true ? 'sim' : formData.analiseDetalhada?.medidasCautelaresAplicadas === false ? 'nao' : 'nao_apurado'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          analiseDetalhada: {
                            ...formData.analiseDetalhada!,
                            medidasCautelaresAplicadas: val === 'sim' ? true : val === 'nao' ? false : null
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="sim">Sim, aplicadas nos autos</option>
                      <option value="nao">Não, nenhuma medida especial</option>
                      <option value="nao_apurado">Não especificado / Não apurado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data de Concessão das Medidas</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasCautelaresDataConcessao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasCautelaresDataConcessao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: 2022-03-12 / Fase de Inquérito"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duração das Medidas Cautelares</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasCautelaresDuracao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasCautelaresDuracao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Até julgamento / 6 meses"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mecanismos de Monitorização</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasCautelaresMonitorizacao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasCautelaresMonitorizacao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Pulseira eletrónica, policiamento"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block font-bold text-slate-800 mb-1.5">Tipos de Medidas Aplicadas (Se aplicável):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        'Afastamento do lar',
                        'Proibição de contactos',
                        'Proibição de aproximação',
                        'Suspensão de visitas a filhos',
                        'Entrega de armas'
                      ].map((item) => {
                        const isSelected = formData.analiseDetalhada?.medidasCautelaresTipos?.includes(item);
                        return (
                          <label key={item} className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={(e) => {
                                const current = formData.analiseDetalhada?.medidasCautelaresTipos || [];
                                const updated = e.target.checked 
                                  ? [...current, item]
                                  : current.filter(c => c !== item);
                                setFormData({
                                  ...formData,
                                  analiseDetalhada: {
                                    ...formData.analiseDetalhada!,
                                    medidasCautelaresTipos: updated
                                  }
                                });
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="font-semibold text-slate-800">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECÇÃO 5. Decisão judicial: fundamentação e resultado */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Scale className="w-4 h-4 text-purple-700" />
                  <span>5. Decisão Judicial: Fundamentação e Resultado</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Resultado Final do Julgamento</label>
                    <select
                      value={formData.analiseDetalhada?.tipoDecisaoFinal || 'condenacao'}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, tipoDecisaoFinal: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="condenacao">Condenação</option>
                      <option value="absolvicao">Absolvição</option>
                      <option value="arquivamento">Arquivamento</option>
                      <option value="suspensao_provisoria">Suspensão Provisória do Processo</option>
                      <option value="outra">Outra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Crime(s) Condenado(s)</label>
                    <input
                      type="text"
                      value={formData.crime}
                      onChange={(e) => setFormData({ ...formData, crime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pena Principal</label>
                    <input
                      type="text"
                      value={formData.penaAplicada}
                      onChange={(e) => setFormData({ ...formData, penaAplicada: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Pena Principal</label>
                    <select
                      value={formData.tipoPena}
                      onChange={(e) => setFormData({ ...formData, tipoPena: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="prisao_suspensa">Prisão Suspensa na Execução</option>
                      <option value="prisao_efetiva">Prisão Efetiva</option>
                      <option value="multa">Multa</option>
                      <option value="absolvicao">Absolvição</option>
                      <option value="trabalho_comunitario">Trabalho Comunitário</option>
                      <option value="outro">Outro Regime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duração da Pena (Meses)</label>
                    <input
                      type="number"
                      value={formData.duracaoPenaMeses || ''}
                      onChange={(e) => setFormData({ ...formData, duracaoPenaMeses: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                      placeholder="Ex: 24 (2 anos)"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pena(s) Acessória(s) / Injunções</label>
                    <input
                      type="text"
                      value={formData.penasAcessorias}
                      onChange={(e) => setFormData({ ...formData, penasAcessorias: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Proibição de contactos; Afastamento..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Indemnização à Vítima (Valor)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.indemnizacaoValor || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, indemnizacaoValor: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                      placeholder="Ex: 2500 EUR"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Indemnização (Tipo de Danos)</label>
                    <select
                      value={formData.analiseDetalhada?.indemnizacaoTipo || 'nao_aplicavel'}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, indemnizacaoTipo: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="danos_morais">Danos não patrimoniais (Morais)</option>
                      <option value="danos_materiais">Danos materiais (Materiais)</option>
                      <option value="ambos">Ambos (Danos materiais e morais)</option>
                      <option value="nao_aplicavel">Não arbitrada / Não aplicável</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Medidas Pós-Sentença (reabilitação, etc.)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasPosSentenca || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasPosSentenca: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Frequência obrigatória do PAVD"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">Principais Argumentos para Condenação (prova testemunhal, confissão, perícia...)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.argumentosCondenacao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, argumentosCondenacao: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Credibilidade do testemunho da vítima, fotografias de hematomas..."
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">Principais Argumentos para Absolvição / Arquivamento (insuficiência, retratação...)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.argumentosAbsolvicao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, argumentosAbsolvicao: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Falta de provas conclusivas, a vítima retratou o depoimento em tribunal..."
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block font-bold text-slate-800 mb-1">Reconhecimento de Atenuantes e Agravantes:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Atenuantes Reconhecidas (Ex: Confissão, CRC limpo, reparação do dano)</label>
                        <input
                          type="text"
                          value={(formData.analiseDetalhada?.atenuantesReconhecidas || []).join(', ')}
                          onChange={(e) => {
                            const arr = e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                            setFormData({
                              ...formData,
                              analiseDetalhada: { ...formData.analiseDetalhada!, atenuantesReconhecidas: arr }
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                          placeholder="Confissão, Reparação do dano, Primariedade"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Agravantes Reconhecidas (Ex: Reincidência, na presença de filhos)</label>
                        <input
                          type="text"
                          value={(formData.analiseDetalhada?.agravantesReconhecidas || []).join(', ')}
                          onChange={(e) => {
                            const arr = e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0);
                            setFormData({
                              ...formData,
                              analiseDetalhada: { ...formData.analiseDetalhada!, agravantesReconhecidas: arr }
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                          placeholder="Reincidência, Prática na presença de filhos"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECÇÃO 6. Dados para análise sociológica e de política pública */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Building2 className="w-4 h-4 text-purple-700" />
                  <span>6. Dados para Análise Sociológica e de Política Pública</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Região Geográfica</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.regiaoGeografica || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, regiaoGeografica: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Área Metropolitana de Lisboa"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Área</label>
                    <select
                      value={formData.analiseDetalhada?.tipoArea || 'nao_especificada'}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, tipoArea: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="urbana">Urbana</option>
                      <option value="rural">Rural</option>
                      <option value="periurbana">Periurbana</option>
                      <option value="nao_especificada">Não especificada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Existência de Serviços de Apoio Mencionados</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.servicosApoioMencionados || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, servicosApoioMencionados: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Casa-abrigo, apoio da APAV"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {abaAtivaForm === 'grelha_recolha' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* I. Identificação e Contexto Processual */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>I. Identificação e Contexto Processual (Itens 1-6)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">1. Identificação / Tribunal / Proc.</label>
                    <input
                      type="text"
                      value={`${formData.seqId} • ${formData.tribunal} • Proc. ${formData.analiseDetalhada?.numProcessoUnico || 'Não apurado'}`}
                      disabled
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">2. Decisão de Condenação ou Absolvição</label>
                    <select
                      value={formData.analiseDetalhada?.tipoDecisaoFinal || 'condenacao'}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, tipoDecisaoFinal: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="condenacao">Condenação</option>
                      <option value="absolvicao">Absolvição</option>
                      <option value="arquivamento">Arquivamento</option>
                      <option value="suspensao_provisoria">Suspensão Provisória do Processo</option>
                      <option value="outra">Outra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">3. Se Teve Instrução ou Não</label>
                    <select
                      value={formData.analiseDetalhada?.teveInstrucao === true ? 'sim' : formData.analiseDetalhada?.teveInstrucao === false ? 'nao' : 'nao_apurado'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          analiseDetalhada: {
                            ...formData.analiseDetalhada!,
                            teveInstrucao: val === 'sim' ? true : val === 'nao' ? false : null
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="nao">Não teve instrução</option>
                      <option value="sim">Sim, teve instrução</option>
                      <option value="nao_apurado">Não especificado / Não apurado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">4. Data dos Factos</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.dataOcorrenciaFactos || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, dataOcorrenciaFactos: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                      placeholder="Ex: Entre 2022 e 2023"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">5. Local dos Factos (Último facto)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.localFactosUltimo || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, localFactosUltimo: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Habitação comum das partes"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">6. Período Temporal da Violência</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.periodoTemporalViolencia || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, periodoTemporalViolencia: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Ex: Poucos episódios isolados"
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO II: Características das Partes */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>II. Características das Partes & Habitação (Itens 7-10)</span>
                </div>
                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">7. Características do Agente / Arguido (Idade, Sexo, Escolaridade, Situação Profissional, Económica, Habitacional)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.sitHabitacionalAgente || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, sitHabitacionalAgente: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Agente: 42 anos, sexo M, escolaridade primária, operário da construção civil..."
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">8. Características das Vítimas (Idade, Sexo, Escolaridade, Situação Profissional, Económica, Habitacional)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.sitHabitacionalVitima || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, sitHabitacionalVitima: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      placeholder="Vítima: 38 anos, sexo F, escolaridade média, empregada de escritório..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">9. Residência Comum ou Separada (ou sem residência estável)</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.situacaoResidencial || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, situacaoResidencial: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: Residência comum à data dos factos"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">10. Filhos Comuns / Outras Relações / Presença de Menores</label>
                      <input
                        type="text"
                        value={formData.analiseDetalhada?.filhosMenoresDetalhe || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          analiseDetalhada: { ...formData.analiseDetalhada!, filhosMenoresDetalhe: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        placeholder="Ex: 2 filhos menores comuns de 5 e 8 anos"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECÇÃO III: Relação, Vulnerabilidade e Antecedentes */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>III. Relação, Vulnerabilidade, Medidas e Antecedentes (Itens 11-20)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">11. Existência de Medidas de Promoção e Proteção</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasPromocaoProtecao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasPromocaoProtecao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">12. Antecedentes Criminais por Violência Doméstica (Penas aplicadas)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.antecedentesVD || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, antecedentesVD: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">13. Antecedentes Criminais por Outros Crimes</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.antecedentesOutros || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, antecedentesOutros: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">14. Medidas de Coação Aplicadas no Processo (além do TIR)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasCoacaoProcesso || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasCoacaoProcesso: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">15. Relação, Duração, Coabitação, Separações e Reconciliações Anteriores</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.relacaoDetalheCompleto || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, relacaoDetalheCompleto: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">16. Gravidez da Vítima à data dos factos</label>
                    <select
                      value={formData.analiseDetalhada?.gravidezVitima === true ? 'sim' : formData.analiseDetalhada?.gravidezVitima === false ? 'nao' : 'nao_apurado'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          analiseDetalhada: {
                            ...formData.analiseDetalhada!,
                            gravidezVitima: val === 'sim' ? true : val === 'nao' ? false : null
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    >
                      <option value="nao">Não aplicável / Não estava grávida</option>
                      <option value="sim">Sim, estava grávida</option>
                      <option value="nao_apurado">Não especificado nos autos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">17. Particular Vulnerabilidade expressamente identificada pelo Tribunal</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.vulnerabilidadeParticular || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, vulnerabilidadeParticular: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">18. Dependência Económica, Habitacional ou Emocional da Vítima</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.dependenciaVitima || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, dependenciaVitima: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">19. Deficiência, Doença ou Incapacidade do Agente e da Vítima</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.deficienciaIncapacidadeAgenteVitima || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, deficienciaIncapacidadeAgenteVitima: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">20. Existência de Dependências (Álcool, Drogas) do Agente e/ou da Vítima</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.dependenciasSubstanciasAgenteVitima || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, dependenciasSubstanciasAgenteVitima: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO IV: Contexto Factual e Violência */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>IV. Motivações, Tipologias de Violência & Separação (Itens 21-25)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">21. "Motivações" (Ciúmes, término, partilhas, disputas parentais, dependências, etc.)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.motivacoesRelacao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, motivacoesRelacao: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">22. Tipo de Violência (Física, Psicológica, Sexual, Digital, Económica, Stalking, Controlo Coercivo, Controlo Social)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.violenciaTipologiaDetalhada || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, violenciaTipologiaDetalhada: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">23. Quem Quis a Separação</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.quemQuisSeparacao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, quemQuisSeparacao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">24. Condenação Autónoma (Cônjuge + Filho)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.condenacaoAutonomaFilho || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, condenacaoAutonomaFilho: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">25. Condenação Autónoma por Crime Sexual</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.condenacaoAutonomaSexual || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, condenacaoAutonomaSexual: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO V: Envolvimento de Crianças */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>V. Envolvimento de Filhos / Crianças no Processo (Item 26)</span>
                </div>
                <div className="text-xs">
                  <label className="block font-semibold text-slate-700 mb-1">26. Detalhe Completo do Impacto e Envolvimento das Crianças (Número, sexo, idades, presença, se ouviu/viu/interveio, agressões, instrumentalização, etc.)</label>
                  <textarea
                    rows={4}
                    value={formData.analiseDetalhada?.criancasEnvolvidasDetalhe || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      analiseDetalhada: { ...formData.analiseDetalhada!, criancasEnvolvidasDetalhe: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    placeholder="Ex: 2 crianças de 4 e 7 anos; presenciaram diretamente as agressões; intervindo a mais velha em defesa da mãe..."
                  />
                </div>
              </div>

              {/* SECÇÃO VI: Perícias e Tramitação */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>VI. Perícias e Tramitação do Processo (Itens 27-33)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">27. Existência de Perícias nos Autos (Dano corporal, psicológica, psiquiátrica)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.periciasAutos || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, periciasAutos: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">28. Acompanhamento das Vítimas desde a Queixa</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.acompanhamentoDesdeQueixa || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, acompanhamentoDesdeQueixa: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">29. Acionamento da CPCJ / Processos de Promoção e Proteção</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.cpcjIntervencao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, cpcjIntervencao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">30. A Criança foi Ouvida no Processo Criminal?</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.criancaOuvidaProcesso || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, criancaOuvidaProcesso: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">31. Há Declarações para Memória Futura das Vítimas</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.declaracoesMemoriaFutura || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, declaracoesMemoriaFutura: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">32. Não obstante, as Vítimas foram Novamente Chamadas a Julgamento</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.vitimasChamadasJulgamento || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, vitimasChamadasJulgamento: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">32.bis. Foi Conferido Estatuto de Vítima no Processo</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.estatutoVitimaConferido || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, estatutoVitimaConferido: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">33. Há PIC / Arbitrada Indemnização Oficiosa</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.picEIndemnizacaoOficiosa || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, picEIndemnizacaoOficiosa: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO VII: Penas e Decisão Final */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>VII. Penas, Agressores e Medidas sobre Crianças (Itens 34-47)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">34. Tipo de Penas (Efetiva, suspensa simples, com regime de prova)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.tipoPenasCompleto || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, tipoPenasCompleto: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">35. Foi Aplicado Programa para Agressores</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.programaAgressoresAplicado || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, programaAgressoresAplicado: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">36. Foi Aplicado Tratamento para Dependências</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.tratamentoDependenciasAplicado || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, tratamentoDependenciasAplicado: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">37. Medidas de Afastamento no âmbito do Regime de Prova</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasAfastamentoRegimeProva || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasAfastamentoRegimeProva: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">38. Foram Aplicadas Penas Acessórias</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.penasAcessoriasAplicadas || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, penasAcessoriasAplicadas: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">39. Compensação à Vítima fixada como condição de suspensão da pena</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.compensacaoCondicaoSuspensao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, compensacaoCondicaoSuspensao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">40. Tribunal considerou a criança Vítima Autónoma, Agravante ou nenhuma referência</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.criancaVitimaAutonomaAgravante || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, criancaVitimaAutonomaAgravante: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">41. Presença da criança considerada na Qualificação Jurídica ou Medida da Pena</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.presencaCriancaQualificacaoPena || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, presencaCriancaQualificacaoPena: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">42. O Tribunal considerou Consequências para a Criança</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.consequenciasCrianca || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, consequenciasCrianca: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">43-47. Responsabilidades Parentais, Regulação Provisória, Suspensão, Supervisionadas, Superior Interesse</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.medidasResponsabilidadesParentais || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasResponsabilidadesParentais: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECÇÃO VIII: Denúncia e Tramitação Anterior */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>VIII. Histórico, Denúncia, Prova, Coação e Resultado Final (Itens 48-66)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">48. Denúncia (Quem, quando, desistências, arquivamentos, processos anteriores, denúncias anteriores)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.denunciaQuemEQuando || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, denunciaQuemEQuando: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">49. Intervenção da Polícia / Escola / Vizinhos / Outros</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.intervencaoPoliciaEscolaVizinhos || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, intervencaoPoliciaEscolaVizinhos: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">50-51. Medidas de Proteção Anteriores & Sinalizações (Serviços sociais, CPCJ, escola)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasProtecaoAnteriores || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasProtecaoAnteriores: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">52. Meios de Prova (Declarações, testemunhos diretos/indiretos, docs, fotos, mensagens, perícias, auto notícia)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.meiosProva || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, meiosProva: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">53. Avaliação de Risco</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.avaliacaoRisco || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, avaliacaoRisco: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">54-55. Declarações das Partes em Julgamento (Vítima e Arguido quiseram prestar declarações?)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.declaracoesPartesJulgamento || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, declaracoesPartesJulgamento: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">56. Medidas de Coação Aplicadas</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.medidasCoacaoAplicadasDet || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, medidasCoacaoAplicadasDet: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">57-60. Crimes Imputados (Número de crimes imputados, condenações, absolvições, convolação, alteração de factos)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.crimesImputadosCondenados || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, crimesImputadosCondenados: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">61. Pena Concreta Aplicada / Penas de Substituição (Suspensão, multa, TFC, regime prova)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.penaConcretaSubstituicao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, penaConcretaSubstituicao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">62. Penas Acessórias Detalhadas (Afastamento, VE, proibição armas, programas, etc.)</label>
                    <textarea
                      rows={2}
                      value={formData.analiseDetalhada?.penasAcessoriasDetalhe || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, penasAcessoriasDetalhe: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">63. Indemnização à Vítima (PIC ou Arbitramento oficioso e valor)</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.indemnizacaoDetalheCompleto || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, indemnizacaoDetalheCompleto: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">64. Ausência de Antecedentes ou Condenações Anteriores</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.ausenciaAntecedentes || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, ausenciaAntecedentes: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">65. Reincidência</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.reincidenciaDet || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, reincidenciaDet: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">66. Confissão, Arrependimento ou Negação dos Factos</label>
                    <input
                      type="text"
                      value={formData.analiseDetalhada?.confissaoArrependimentoNegacao || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        analiseDetalhada: { ...formData.analiseDetalhada!, confissaoArrependimentoNegacao: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. Fontes Processuais Determinantes da Decisão (Art. 374.º CPP) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Fontes Processuais Determinantes
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-200 font-mono border border-indigo-700">
                      Art. 374.º do CPP
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black text-amber-300 font-medium border border-amber-400/40">
                      <ShieldCheck className="w-3 h-3 text-amber-300" />
                      Anonimização Ativa (Borrão Preto)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Texto completo extraído da decisão judicial com anonimização de nomes, moradas, contactos e NIF sob borrão preto. Notas de rodapé preservadas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {formData.trechosDecisao?.totalAnonimizacoes !== undefined && (
                  <span className="text-[11px] bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
                    <strong className="text-amber-400">{formData.trechosDecisao.totalAnonimizacoes}</strong> dados confidenciais protegidos
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setMostrarFontes(!mostrarFontes)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title={mostrarFontes ? "Ocultar Fontes Processuais" : "Expandir Fontes Processuais"}
                >
                  {mostrarFontes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mostrarFontes && (
              <div className="p-4 sm:p-5 border-t border-slate-200 space-y-4 bg-white">
                {/* Control bar: Tabs, Search, Copy and Expand */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  {/* View Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setAbaFonteAtiva('integral')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        abaFonteAtiva === 'integral'
                          ? 'bg-white text-indigo-950 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Texto Completo da Decisão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAbaFonteAtiva('relatorio')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        abaFonteAtiva === 'relatorio'
                          ? 'bg-white text-indigo-950 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>1. Relatório Inicial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAbaFonteAtiva('factos')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        abaFonteAtiva === 'factos'
                          ? 'bg-white text-indigo-950 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2. Factos Provados</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAbaFonteAtiva('dispositivo')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        abaFonteAtiva === 'dispositivo'
                          ? 'bg-white text-indigo-950 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      <span>3. Dispositivo Decisório</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAbaFonteAtiva('notas')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        abaFonteAtiva === 'notas'
                          ? 'bg-white text-indigo-950 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      <span>Notas de Rodapé & Fim</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAbaFonteAtiva('todos')}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        abaFonteAtiva === 'todos'
                          ? 'bg-white text-indigo-950 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 text-slate-600" />
                      <span>Visão Segmentada</span>
                    </button>
                  </div>

                  {/* Search, Copy and Expand Controls */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={termoPesquisa}
                        onChange={(e) => setTermoPesquisa(e.target.value)}
                        placeholder="Pesquisar texto..."
                        className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg w-36 sm:w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleReanonimizarTudo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                      title="Re-executar anonimização exaustiva com borrão preto em todos os segmentos da decisão"
                    >
                      {reanonimizou ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">100% Anonimizado!</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Re-anonimizar Dados</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        let textoParaCopiar = '';
                        if (abaFonteAtiva === 'integral') {
                          textoParaCopiar = formData.trechosDecisao?.textoIntegralAnonimizado || 
                            [formData.trechosDecisao?.relatorioInicial, formData.trechosDecisao?.factosProvados, formData.trechosDecisao?.dispositivoDecisorio].filter(Boolean).join('\n\n---\n\n');
                        } else if (abaFonteAtiva === 'relatorio') {
                          textoParaCopiar = formData.trechosDecisao?.relatorioInicial || '';
                        } else if (abaFonteAtiva === 'factos') {
                          textoParaCopiar = formData.trechosDecisao?.factosProvados || '';
                        } else if (abaFonteAtiva === 'dispositivo') {
                          textoParaCopiar = formData.trechosDecisao?.dispositivoDecisorio || formData.trechosDecisao?.penas || '';
                        } else if (abaFonteAtiva === 'notas') {
                          textoParaCopiar = formData.trechosDecisao?.notasRodapePreservadas || '';
                        } else {
                          textoParaCopiar = formData.trechosDecisao?.textoIntegralAnonimizado || '';
                        }

                        if (textoParaCopiar) {
                          navigator.clipboard.writeText(textoParaCopiar);
                          setCopiado(true);
                          setTimeout(() => setCopiado(false), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                      title="Copiar texto atualmente visível (com dados pessoais anonimizados)"
                    >
                      {copiado ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandido(!expandido)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                      title={expandido ? "Reduzir visualizador" : "Expandir visualizador"}
                    >
                      {expandido ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub-header context label */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">
                      {abaFonteAtiva === 'integral' && '📄 Texto Completo da Decisão Judicial'}
                      {abaFonteAtiva === 'relatorio' && '👤 1. Relatório Inicial (Identificação de Arguido e Vítima)'}
                      {abaFonteAtiva === 'factos' && '📋 2. Factos Provados (Fixação da Matéria de Facto Provada)'}
                      {abaFonteAtiva === 'dispositivo' && '⚖️ 3. Segmento Final Decisório (Dispositivo, Penas e Fecho)'}
                      {abaFonteAtiva === 'notas' && '📚 Notas de Rodapé e Notas de Fim de Documento'}
                      {abaFonteAtiva === 'todos' && '📑 Visão em Múltiplos Segmentos Processuais'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="italic">
                      {abaFonteAtiva === 'integral' && 'Texto integral da decisão judicial limpo de cabeçalhos/rodapés e com dados pessoais sob borrão preto.'}
                      {abaFonteAtiva === 'relatorio' && 'Fonte canónica para qualificação dos sujeitos processuais (Art. 374.º, n.º 1 CPP).'}
                      {abaFonteAtiva === 'factos' && 'Fonte canónica para apuramento de ofensas, residência, menores e perícias (Art. 374.º, n.º 2 CPP).'}
                      {abaFonteAtiva === 'dispositivo' && 'Fonte canónica para condenação/absolvição, determinação de penas e data (Art. 374.º, n.º 3 CPP).'}
                      {abaFonteAtiva === 'notas' && 'Notas de rodapé, notas finais e remissões doutrinárias integralmente preservadas.'}
                      {abaFonteAtiva === 'todos' && 'Exibição dos 3 segmentos canónicos do Art. 374.º do CPP.'}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {termoPesquisa ? `Pesquisa: "${termoPesquisa}"` : 'Preservação de estrutura original'}
                  </span>
                </div>

                {/* Main Content Area based on Active Tab */}
                {abaFonteAtiva === 'integral' && (
                  <div className={`p-4 bg-slate-50/70 rounded-xl border border-slate-200 overflow-y-auto ${expandido ? 'max-h-[650px]' : 'max-h-[420px]'}`}>
                    <RenderizarTextoComBorrao 
                      texto={
                        formData.trechosDecisao?.textoIntegralAnonimizado ||
                        [formData.trechosDecisao?.relatorioInicial, formData.trechosDecisao?.factosProvados, formData.trechosDecisao?.dispositivoDecisorio].filter(Boolean).join('\n\n--- // ---\n\n')
                      } 
                      termoPesquisa={termoPesquisa} 
                    />
                  </div>
                )}

                {abaFonteAtiva === 'relatorio' && (
                  <div className={`p-4 bg-slate-50/70 rounded-xl border border-slate-200 overflow-y-auto ${expandido ? 'max-h-[650px]' : 'max-h-[420px]'}`}>
                    <RenderizarTextoComBorrao 
                      texto={formData.trechosDecisao?.relatorioInicial || ''} 
                      termoPesquisa={termoPesquisa} 
                    />
                  </div>
                )}

                {abaFonteAtiva === 'factos' && (
                  <div className={`p-4 bg-slate-50/70 rounded-xl border border-slate-200 overflow-y-auto ${expandido ? 'max-h-[650px]' : 'max-h-[420px]'}`}>
                    <RenderizarTextoComBorrao 
                      texto={formData.trechosDecisao?.factosProvados || ''} 
                      termoPesquisa={termoPesquisa} 
                    />
                  </div>
                )}

                {abaFonteAtiva === 'dispositivo' && (
                  <div className={`p-4 bg-slate-50/70 rounded-xl border border-slate-200 overflow-y-auto ${expandido ? 'max-h-[650px]' : 'max-h-[420px]'}`}>
                    <RenderizarTextoComBorrao 
                      texto={formData.trechosDecisao?.dispositivoDecisorio || formData.trechosDecisao?.penas || ''} 
                      termoPesquisa={termoPesquisa} 
                    />
                  </div>
                )}

                {abaFonteAtiva === 'notas' && (
                  <div className={`p-4 bg-amber-50/30 rounded-xl border border-amber-200/80 overflow-y-auto ${expandido ? 'max-h-[650px]' : 'max-h-[420px]'}`}>
                    {formData.trechosDecisao?.notasRodapePreservadas ? (
                      <div className="space-y-2">
                        <div className="text-xs text-amber-900 font-semibold mb-2">
                          Notas de Rodapé e Notas de Fim de Documento Identificadas no Texto:
                        </div>
                        <RenderizarTextoComBorrao 
                          texto={formData.trechosDecisao.notasRodapePreservadas} 
                          termoPesquisa={termoPesquisa} 
                        />
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        <p className="font-medium text-slate-700">Não foram detetadas notas de rodapé isoladas em bloco final.</p>
                        <p className="text-slate-400 mt-1">
                          Quaisquer referências ou notas de rodapé existentes foram integralmente preservadas ao longo do texto principal.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {abaFonteAtiva === 'todos' && (
                  <div className="space-y-4">
                    {/* Relatório Inicial */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>1. Relatório Inicial (Identificação de Arguido e Vítima com Dados sob Borrão Preto)</span>
                      </div>
                      <div className="p-4 bg-slate-50/70 max-h-52 overflow-y-auto">
                        <RenderizarTextoComBorrao 
                          texto={formData.trechosDecisao?.relatorioInicial || ''} 
                          termoPesquisa={termoPesquisa} 
                        />
                      </div>
                    </div>

                    {/* Lista de Factos Provados */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>2. Factos Provados (Ofensas, Residência, Menores e Perícias)</span>
                      </div>
                      <div className="p-4 bg-slate-50/70 max-h-52 overflow-y-auto">
                        <RenderizarTextoComBorrao 
                          texto={formData.trechosDecisao?.factosProvados || ''} 
                          termoPesquisa={termoPesquisa} 
                        />
                      </div>
                    </div>

                    {/* Segmento Final Decisório */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200">
                        <Scale className="w-3.5 h-3.5 text-amber-600" />
                        <span>3. Segmento Final Decisório (Dispositivo: Condenação/Absolvição, Penas e Data)</span>
                      </div>
                      <div className="p-4 bg-slate-50/70 max-h-52 overflow-y-auto">
                        <RenderizarTextoComBorrao 
                          texto={formData.trechosDecisao?.dispositivoDecisorio || formData.trechosDecisao?.penas || ''} 
                          termoPesquisa={termoPesquisa} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Última atualização: {new Date(formData.dataProcessamento).toLocaleString('pt-PT')}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>{salvando ? 'A Guardar...' : 'Validar & Guardar Formulário'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
