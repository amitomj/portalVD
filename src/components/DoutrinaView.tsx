import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  ExternalLink, 
  FileText, 
  Download, 
  BookOpen, 
  Trash2, 
  X, 
  Link as LinkIcon, 
  Upload, 
  Check, 
  Eye, 
  Calendar, 
  Building2, 
  User, 
  FileCode,
  Globe,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  BookMarked,
  Filter,
  Copy,
  FileUp,
  Sparkles
} from 'lucide-react';
import { ReferenciaDoutrinaria } from '../types/modules';
import { 
  executarVarreduraDoutrinaPortugal, 
  FONTES_EDITORIAIS_PORTUGAL 
} from '../services/doutrinaHarvester';
import { 
  carregarDoutrinaPendente, 
  salvarDoutrinaPendente, 
  aprovarDoutrinaItem, 
  aprovarTodasDoutrinas,
  rejeitarDoutrinaItem 
} from '../lib/firebase';
import { ModalImportarDocumento } from './ModalImportarDocumento';

interface DoutrinaViewProps {
  doutrinas: ReferenciaDoutrinaria[];
  onSalvarDoutrina: (item: ReferenciaDoutrinaria) => Promise<boolean>;
  onSalvarVariasDoutrinas?: (itens: ReferenciaDoutrinaria[]) => Promise<void> | void;
  onEliminarDoutrina: (id: string) => Promise<boolean>;
  onLimparModuloDoutrina?: () => Promise<void>;
}

export const DoutrinaView: React.FC<DoutrinaViewProps> = ({
  doutrinas,
  onSalvarDoutrina,
  onSalvarVariasDoutrinas,
  onEliminarDoutrina,
  onLimparModuloDoutrina
}) => {
  // Aba ativa: 'ativo' (Catálogo visível na app) ou 'admin_validacao' (Varredura web para validar)
  const [abaAtiva, setAbaAtiva] = useState<'ativo' | 'admin_validacao'>('ativo');

  const [pesquisa, setPesquisa] = useState('');
  const [filtroAcessoLivre, setFiltroAcessoLivre] = useState<boolean | 'todos'>('todos');
  const [filtroAmbito, setFiltroAmbito] = useState<'todos' | 'nacional' | 'estrangeira'>('todos');
  const [filtroArea, setFiltroArea] = useState<string>('todos');
  
  // Itens recolhidos na varredura web pendentes de validação pelo Administrador
  const [itensPendentes, setItensPendentes] = useState<ReferenciaDoutrinaria[]>([]);
  const [carregandoPendentes, setCarregandoPendentes] = useState(false);
  const [validandoTodos, setValidandoTodos] = useState(false);
  const [modalConfirmarLimpeza, setModalConfirmarLimpeza] = useState(false);
  const [varrendoWeb, setVarrendoWeb] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);

  // Modal de Leitura Automática de Documento PDF / Word
  const [modalImportarAberto, setModalImportarAberto] = useState(false);

  // Modal de Adicionar / Editar Doutrina
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [itemEmEdicaoId, setItemEmEdicaoId] = useState<string | null>(null);
  
  // Modal de Visualização de Documento
  const [documentoVisualizando, setDocumentoVisualizando] = useState<ReferenciaDoutrinaria | null>(null);

  // Form State
  const [autor, setAutor] = useState('');
  const [nomeObra, setNomeObra] = useState('');
  const [edicao, setEdicao] = useState('');
  const [anoEdicao, setAnoEdicao] = useState(new Date().getFullYear().toString());
  const [nomeEditora, setNomeEditora] = useState('');
  const [parteOuAmbito, setParteOuAmbito] = useState<'Obras Nacionais (Portugal)' | 'Obras Estrangeiras (Seleção)'>('Obras Nacionais (Portugal)');
  const [areaTematica, setAreaTematica] = useState<string>('Área Jurídica');
  const [outraAreaPersonalizada, setOutraAreaPersonalizada] = useState<string>('');
  const [linksAcesso, setLinksAcesso] = useState<string[]>(['']);
  const [acessoLivre, setAcessoLivre] = useState(true);
  const [resumo, setResumo] = useState('');
  const [ficheiroUpload, setFicheiroUpload] = useState<{
    nome: string;
    tipo: string;
    tamanho: number;
    conteudoTexto?: string;
    dataUrl?: string;
  } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [copiadoCitacaoId, setCopiadoCitacaoId] = useState<string | null>(null);

  const handleCopiarCitacao = (texto: string, id: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(texto);
        setCopiadoCitacaoId(id);
        setTimeout(() => setCopiadoCitacaoId(null), 2500);
      }
    } catch (err) {
      console.warn('Falha ao copiar citação:', err);
    }
  };

  const formatarRotuloLink = (url: string): { label: string; tag: string } => {
    const u = url.toLowerCase();
    if (u.includes('almedina.net')) return { label: 'Almedina', tag: 'Catálogo' };
    if (u.includes('cej.justica.gov.pt')) return { label: 'CEJ E-books', tag: 'Formação Judiciária' };
    if (u.includes('julgar.pt')) return { label: 'Revista JULGAR', tag: 'ASJP' };
    if (u.includes('smmp.pt') || u.includes('revistadoministeriopublico')) return { label: 'Revista do MP', tag: 'SMMP' };
    if (u.includes('petrony.pt')) return { label: 'Petrony Editora', tag: 'Editora' };
    if (u.includes('gestlegal.pt')) return { label: 'Gestlegal / RPCC', tag: 'Ciência Criminal' };
    if (u.includes('aafdl.pt')) return { label: 'Livraria AAFDL', tag: 'Académica' };
    if (u.includes('rcaap.pt')) return { label: 'RCAAP', tag: 'Repositório Nacional' };
    if (u.includes('estudogeral') || u.includes('repositorium') || u.includes('run.unl') || u.includes('handle')) return { label: 'Repositório Univ.', tag: 'Universitário' };
    return { label: 'Aceder à Obra', tag: 'Web' };
  };

  // Carregar itens pendentes ao iniciar
  useEffect(() => {
    carregarPendentesIniciais();
  }, []);

  const carregarPendentesIniciais = async () => {
    setCarregandoPendentes(true);
    try {
      const pendentes = await carregarDoutrinaPendente();
      setItensPendentes(pendentes);
    } catch (err) {
      console.error('Erro ao carregar doutrina pendente:', err);
    } finally {
      setCarregandoPendentes(false);
    }
  };

  // Receber itens extraídos do documento PDF / Word e colocar na fila de validação
  const handleImportarDoutrinasExtraidas = async (itensNovos: ReferenciaDoutrinaria[]) => {
    const unicosMap = new Map<string, ReferenciaDoutrinaria>();
    for (const it of itensPendentes) {
      unicosMap.set(it.nomeObra.toLowerCase().trim(), it);
    }
    for (const it of itensNovos) {
      unicosMap.set(it.nomeObra.toLowerCase().trim(), it);
    }
    const listaAtualizada = Array.from(unicosMap.values());
    setItensPendentes(listaAtualizada);
    await salvarDoutrinaPendente(listaAtualizada);
    setAbaAtiva('admin_validacao');
    setMensagemStatus(`Documento processado com sucesso: ${itensNovos.length} obras extraídas com todos os campos pré-preenchidos e encaminhadas para validação.`);
    setTimeout(() => setMensagemStatus(null), 8000);
  };

  // Limpar todos os dados do módulo (Doutrina ativa)
  const handleLimparTodosDados = async () => {
    setModalConfirmarLimpeza(true);
  };

  const handleConfirmarLimparModulo = async () => {
    setModalConfirmarLimpeza(false);
    if (onLimparModuloDoutrina) {
      await onLimparModuloDoutrina();
    }
    setMensagemStatus('Todos os registos de doutrina foram eliminados da aplicação.');
    setTimeout(() => setMensagemStatus(null), 5000);
  };

  const resetForm = () => {
    setItemEmEdicaoId(null);
    setAutor('');
    setNomeObra('');
    setEdicao('');
    setAnoEdicao(new Date().getFullYear().toString());
    setNomeEditora('');
    setParteOuAmbito('Obras Nacionais (Portugal)');
    setAreaTematica('Área Jurídica');
    setOutraAreaPersonalizada('');
    setLinksAcesso(['']);
    setAcessoLivre(true);
    setResumo('');
    setFicheiroUpload(null);
    setErroForm(null);
  };

  const abrirFormComItem = (item: ReferenciaDoutrinaria) => {
    setItemEmEdicaoId(item.id);
    setAutor(item.autores);
    setNomeObra(item.nomeObra);
    setEdicao(item.edicao || '1.ª Edição');
    setAnoEdicao(String(item.anoEdicao));
    setNomeEditora(item.nomeEditora);
    
    // Configurar âmbito / nacionalidade
    if (item.parteOuAmbito && item.parteOuAmbito.toLowerCase().includes('estrangeir')) {
      setParteOuAmbito('Obras Estrangeiras (Seleção)');
    } else {
      setParteOuAmbito('Obras Nacionais (Portugal)');
    }

    // Configurar área temática
    const standard = [
      'Área Jurídica',
      'Área da Psicologia',
      'Área das Perícias (Forense e Investigação)',
      'Área da Medicina e Saúde Pública',
      'Área Social e Apoio à Vítima'
    ];
    if (item.areaTematica && standard.includes(item.areaTematica)) {
      setAreaTematica(item.areaTematica);
      setOutraAreaPersonalizada('');
    } else if (item.areaTematica) {
      setAreaTematica('Outra');
      setOutraAreaPersonalizada(item.areaTematica);
    } else {
      setAreaTematica('Área Jurídica');
      setOutraAreaPersonalizada('');
    }

    setLinksAcesso(item.linksAcesso && item.linksAcesso.length > 0 ? item.linksAcesso : ['']);
    setAcessoLivre(item.acessoLivre);
    setResumo(item.resumo || '');
    if (item.temDocumento && item.documentoNome) {
      setFicheiroUpload({
        nome: item.documentoNome,
        tipo: item.documentoTipo || 'application/pdf',
        tamanho: item.documentoTamanho || 1024,
        conteudoTexto: item.documentoTexto,
        dataUrl: item.documentoDataUrl
      });
    } else {
      setFicheiroUpload(null);
    }
    setErroForm(null);
    setModalFormAberto(true);
  };

  const handleAdicionarLink = () => {
    setLinksAcesso([...linksAcesso, '']);
  };

  const handleRemoverLink = (index: number) => {
    setLinksAcesso(linksAcesso.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, valor: string) => {
    const novos = [...linksAcesso];
    novos[index] = valor;
    setLinksAcesso(novos);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        setFicheiroUpload({
          nome: file.name,
          tipo: file.type || 'text/plain',
          tamanho: file.size,
          conteudoTexto: event.target?.result as string,
        });
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        setFicheiroUpload({
          nome: file.name,
          tipo: file.type || 'application/pdf',
          tamanho: file.size,
          dataUrl: event.target?.result as string,
          conteudoTexto: `Documento "${file.name}" carregado para consulta na aplicação.`
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmeterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autor.trim() || !nomeObra.trim() || !nomeEditora.trim()) {
      setErroForm('Por favor, preencha os campos obrigatórios: Nome do Autor, Nome da Obra e Editora.');
      return;
    }

    setSalvando(true);
    setErroForm(null);

    const novoId = itemEmEdicaoId || `doutrina_${Date.now()}`;
    const linksValidos = linksAcesso.map(l => l.trim()).filter(l => l.length > 0);

    const areaFinal = areaTematica === 'Outra'
      ? (outraAreaPersonalizada.trim() || 'Outra')
      : areaTematica;

    const novaReferencia: ReferenciaDoutrinaria = {
      id: novoId,
      autores: autor.trim(),
      nomeObra: nomeObra.trim(),
      edicao: edicao.trim() || '1.ª Edição',
      anoEdicao: parseInt(anoEdicao, 10) || new Date().getFullYear(),
      nomeEditora: nomeEditora.trim(),
      parteOuAmbito,
      areaTematica: areaFinal,
      temDocumento: !!ficheiroUpload,
      documentoNome: ficheiroUpload?.nome,
      documentoTipo: ficheiroUpload?.tipo,
      documentoTamanho: ficheiroUpload?.tamanho,
      documentoDataUrl: ficheiroUpload?.dataUrl,
      documentoTexto: ficheiroUpload?.conteudoTexto,
      linksAcesso: linksValidos,
      acessoLivre,
      resumo: resumo.trim(),
      dataRegisto: new Date().toISOString().split('T')[0],
      statusValidacao: 'validado'
    };

    try {
      await onSalvarDoutrina(novaReferencia);

      // Se este item estava pendente, remover da lista de pendentes
      if (itemEmEdicaoId && itensPendentes.some(p => p.id === itemEmEmIdCompativel(itemEmEdicaoId))) {
        await aprovarDoutrinaItem(novaReferencia);
        setItensPendentes(prev => prev.filter(p => p.id !== itemEmEdicaoId));
      }

      resetForm();
      setModalFormAberto(false);
      setMensagemStatus(`Referência "${novaReferencia.nomeObra}" validada e colocada visível na app.`);
      setTimeout(() => setMensagemStatus(null), 6000);
    } catch {
      setErroForm('Erro ao guardar a referência doutrinária.');
    } finally {
      setSalvando(false);
    }
  };

  const itemEmEmIdCompativel = (id: string) => id;

  // Executar Varredura na Web (Editoras e Revistas Portuguesas)
  const handleExecutarVarreduraWeb = async () => {
    setVarrendoWeb(true);
    setMensagemStatus(null);
    try {
      const resultado = await executarVarreduraDoutrinaPortugal(doutrinas, itensPendentes);
      
      // Mesclar de forma única com os pendentes existentes para evitar perda de dados e duplicações
      const unicosMap = new Map<string, ReferenciaDoutrinaria>();
      for (const it of itensPendentes) {
        unicosMap.set(it.id, it);
      }
      for (const it of resultado.itensEncontrados) {
        unicosMap.set(it.id, it);
      }
      const listaAtualizada = Array.from(unicosMap.values());
      
      setItensPendentes(listaAtualizada);
      await salvarDoutrinaPendente(listaAtualizada);
      
      // Mudar automaticamente para a aba de validação para mostrar os novos resultados
      setAbaAtiva('admin_validacao');
      
      setMensagemStatus(
        `Varredura web concluída nas editoras e revistas de Portugal: ${resultado.totalDescobertos} publicações recolhidas com todos os campos do formulário preenchidos para validação.`
      );
      setTimeout(() => setMensagemStatus(null), 8000);
    } catch (err) {
      console.error('Erro na varredura de doutrina:', err);
    } finally {
      setVarrendoWeb(false);
    }
  };

  // Validar e colocar visível diretamente na app
  const handleValidarItem = async (item: ReferenciaDoutrinaria) => {
    try {
      await aprovarDoutrinaItem(item);
      await onSalvarDoutrina({
        ...item,
        statusValidacao: 'validado',
        dataRegisto: new Date().toISOString().split('T')[0]
      });
      setItensPendentes(prev => prev.filter(p => p.id !== item.id));
      setMensagemStatus(`Publicação "${item.nomeObra}" aprovada pelo administrador e agora visível na app.`);
      setTimeout(() => setMensagemStatus(null), 5000);
    } catch (err) {
      console.error('Erro ao aprovar item:', err);
    }
  };

  // Validar todos os pendentes em lote e publicar na app
  const handleValidarTodos = async () => {
    if (itensPendentes.length === 0 || validandoTodos) return;
    setValidandoTodos(true);
    setMensagemStatus('A validar todas as obras doutrinárias e a integrá-las no catálogo...');

    try {
      const aprovados = await aprovarTodasDoutrinas(itensPendentes);

      if (onSalvarVariasDoutrinas) {
        await onSalvarVariasDoutrinas(aprovados);
      } else {
        for (const item of aprovados) {
          await onSalvarDoutrina(item);
        }
      }

      setItensPendentes([]);
      // Mudar imediatamente para o catálogo ativo da aplicação
      setAbaAtiva('ativo');
      setMensagemStatus(`Sucesso: ${aprovados.length} obras doutrinárias foram validadas e publicadas no catálogo da aplicação.`);
      setTimeout(() => setMensagemStatus(null), 7000);
    } catch (err) {
      console.error('Erro ao validar todas as obras doutrinárias:', err);
      setMensagemStatus('Ocorreu um erro ao validar as obras. Por favor, tente novamente.');
    } finally {
      setValidandoTodos(false);
    }
  };

  // Rejeitar item recolhido
  const handleRejeitarItem = async (id: string, titulo: string) => {
    try {
      await rejeitarDoutrinaItem(id);
      setItensPendentes(prev => prev.filter(p => p.id !== id));
      setMensagemStatus(`Registo "${titulo}" descartado da lista de pendentes.`);
      setTimeout(() => setMensagemStatus(null), 4000);
    } catch (err) {
      console.error('Erro ao rejeitar item:', err);
    }
  };

  // Normalizar âmbito de uma obra: 'nacional' ou 'estrangeira'
  const normalizarAmbito = (d: ReferenciaDoutrinaria): 'nacional' | 'estrangeira' => {
    const p = (d.parteOuAmbito || '').toLowerCase();
    const ed = (d.nomeEditora || '').toLowerCase();
    const res = (d.resumo || '').toLowerCase();
    if (p.includes('estrangeir') || p.includes('internacional') || p === 'estrangeira') {
      return 'estrangeira';
    }
    if (p.includes('nacional') || p.includes('portugal') || p === 'nacional') {
      return 'nacional';
    }
    if (ed.includes('oxford') || ed.includes('springer') || ed.includes('routledge') || ed.includes('harvard') || ed.includes('aija') || res.includes('internacional')) {
      return 'estrangeira';
    }
    return 'nacional';
  };

  // Normalizar agrupamento de áreas temáticas
  const normalizarArea = (areaRaw?: string): string => {
    if (!areaRaw) return 'Área Jurídica';
    const a = areaRaw.toLowerCase();
    if (a.includes('jurídic') || a.includes('juridic') || a.includes('penal') || a.includes('processual') || a.includes('direito')) return 'Área Jurídica';
    if (a.includes('psicol') || a.includes('trauma') || a.includes('psiquiat') || a.includes('saúde mental') || a.includes('saude mental')) return 'Área da Psicologia';
    if (a.includes('perícia') || a.includes('pericia') || a.includes('forense') || a.includes('investiga') || a.includes('criminalíst')) return 'Área das Perícias (Forense e Investigação)';
    if (a.includes('medicin') || a.includes('saúde') || a.includes('saude') || a.includes('clínic') || a.includes('urgência') || a.includes('hospital')) return 'Área da Medicina e Saúde Pública';
    if (a.includes('social') || a.includes('apoio') || a.includes('vítima') || a.includes('vitima') || a.includes('acolhimento')) return 'Área Social e Apoio à Vítima';
    return areaRaw;
  };

  // Lista de áreas padrão e áreas adicionais presentes nas obras
  const AREAS_PADRAO = [
    'Área Jurídica',
    'Área da Psicologia',
    'Área das Perícias (Forense e Investigação)',
    'Área da Medicina e Saúde Pública',
    'Área Social e Apoio à Vítima'
  ];

  const areasDisponiveis = React.useMemo(() => {
    const setAreas = new Set<string>(AREAS_PADRAO);
    for (const d of doutrinas) {
      if (d.areaTematica && d.areaTematica.trim()) {
        const norm = normalizarArea(d.areaTematica);
        setAreas.add(norm);
        setAreas.add(d.areaTematica.trim());
      }
    }
    return Array.from(setAreas);
  }, [doutrinas]);

  // Contadores para os filtros
  const totalNacionais = React.useMemo(() => {
    return doutrinas.filter(d => normalizarAmbito(d) === 'nacional').length;
  }, [doutrinas]);

  const totalEstrangeiras = React.useMemo(() => {
    return doutrinas.filter(d => normalizarAmbito(d) === 'estrangeira').length;
  }, [doutrinas]);

  const doutrinasFiltradas = doutrinas.filter(d => {
    const q = pesquisa.toLowerCase().trim();
    const matchPesquisa = !q ||
      d.autores.toLowerCase().includes(q) ||
      d.nomeObra.toLowerCase().includes(q) ||
      d.nomeEditora.toLowerCase().includes(q) ||
      String(d.anoEdicao).includes(q) ||
      (d.resumo && d.resumo.toLowerCase().includes(q)) ||
      (d.areaTematica && d.areaTematica.toLowerCase().includes(q)) ||
      (d.parteOuAmbito && d.parteOuAmbito.toLowerCase().includes(q));

    const matchAcesso = filtroAcessoLivre === 'todos' ? true : d.acessoLivre === filtroAcessoLivre;

    const matchAmbito = filtroAmbito === 'todos'
      ? true
      : normalizarAmbito(d) === filtroAmbito;

    const matchArea = filtroArea === 'todos'
      ? true
      : (
          d.areaTematica === filtroArea ||
          normalizarArea(d.areaTematica) === filtroArea ||
          (d.areaTematica && d.areaTematica.toLowerCase().includes(filtroArea.toLowerCase()))
        );

    return matchPesquisa && matchAcesso && matchAmbito && matchArea;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* ========================================================================= */}
      {/* 1. CABEÇALHO DO MÓDULO & SELEÇÃO DE ABAS (CATÁLOGO ATIVO vs VALIDAÇÃO ADMIN) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
              <span>Doutrina Jurídica • Portugal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Doutrina e Publicações sobre Violência Doméstica
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Monografias, artigos científicos, manuais e publicações das principais editoras (Almedina, Petrony, AAFDL) e revistas especializadas (JULGAR/ASJP, CEJ, RPCC, Revista do Ministério Público).
            </p>
          </div>

          {/* Botões de Ação do Topo */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-importar-documento-doutrina"
              onClick={() => setModalImportarAberto(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow active:scale-98 cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-indigo-100" />
              <span>Importar Documento (PDF / Word)</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>

            <button
              id="btn-executar-varredura-doutrina"
              onClick={handleExecutarVarreduraWeb}
              disabled={varrendoWeb}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                varrendoWeb
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-900 text-white hover:bg-indigo-800 active:scale-98'
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${varrendoWeb ? 'animate-spin' : ''}`} />
              <span>{varrendoWeb ? 'A varrer editoras...' : 'Varrer Web (Editoras PT)'}</span>
            </button>

            <button
              id="btn-adicionar-doutrina-manual"
              onClick={() => {
                resetForm();
                setModalFormAberto(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-700" />
              <span>Nova Referência Manual</span>
            </button>

            {onLimparModuloDoutrina && (
              <button
                id="btn-limpar-modulo-doutrina"
                onClick={handleLimparTodosDados}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                title="Eliminar todos os registos do módulo Doutrina"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Eliminar Dados</span>
              </button>
            )}
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {mensagemStatus && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium">{mensagemStatus}</p>
          </div>
        )}

        {/* Abas: Catálogo Ativo vs Validação pelo Administrador */}
        <div className="flex border-b border-slate-200 pt-2 gap-2">
          <button
            id="tab-doutrina-ativo"
            onClick={() => setAbaAtiva('ativo')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              abaAtiva === 'ativo'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Repositório Visível na App</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-700">
              {doutrinas.length}
            </span>
          </button>

          <button
            id="tab-doutrina-admin-validacao"
            onClick={() => setAbaAtiva('admin_validacao')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              abaAtiva === 'admin_validacao'
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Fila de Validação (PDF / Web)</span>
            {itensPendentes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-100 text-amber-900 font-extrabold animate-pulse">
                {itensPendentes.length} pendentes
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ÁREA EXCLUSIVA: VALIDAÇÃO DE DESCOBERTAS WEB PELO ADMINISTRADOR        */}
      {/*    (REQUISITO EXPRESSO DO UTILIZADOR)                                      */}
      {/* ========================================================================= */}
      {abaAtiva === 'admin_validacao' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          
          {/* Card explicativo das fontes e extrações */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-amber-950">
                    Área do Administrador: Fila de Validação (Documentos PDF e Descobertas Web)
                  </h2>
                  <p className="text-xs text-amber-800">
                    Nenhum registo recolhido da web ou extraído de ficheiros é exibido publicamente sem a sua aprovação explícita.
                  </p>
                </div>
              </div>

              {itensPendentes.length > 0 && (
                <button
                  id="btn-validar-todos-doutrinas"
                  onClick={handleValidarTodos}
                  disabled={validandoTodos}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 text-white hover:bg-amber-950 disabled:bg-amber-800/70 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  {validandoTodos ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>A validar e publicar na app...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Validar Todos ({itensPendentes.length}) e Publicar na App</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed">
              Os formulários abaixo foram gerados automaticamente a partir de <strong>leitura inteligente de documentos PDF</strong> ou <strong>varredura na web em Portugal</strong>. Cada registo apresenta todos os campos preenchidos (Autores, Obra, Edição, Ano, Editora, Links e Resumo) e pode ser editado antes da validação final.
            </p>

            {/* Badges das Fontes Oficiais Rastreadas */}
            <div className="pt-2 border-t border-amber-200/60">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-2">
                Fontes Editoriais Rastreadas em Portugal:
              </span>
              <div className="flex flex-wrap gap-2">
                {FONTES_EDITORIAIS_PORTUGAL.map(f => (
                  <span
                    key={f.nome}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 border border-amber-200 text-amber-950 text-[11px] font-medium shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{f.nome}</span>
                    <span className="text-amber-700 font-mono text-[10px]">({f.tipo})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Registos Descobertos Aguardando Validação */}
          {itensPendentes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Não existem publicações pendentes de validação
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Pode importar um documento PDF / Word contendo compilações de artigos ou executar uma nova varredura na web nas editoras portuguesas.
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
                  onClick={handleExecutarVarreduraWeb}
                  disabled={varrendoWeb}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${varrendoWeb ? 'animate-spin' : ''}`} />
                  <span>Executar Varredura nas Editoras</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>{itensPendentes.length} publicações aguardam a sua validação:</span>
                <span>Pré-preenchimento determinístico automático</span>
              </div>

              {itensPendentes.map((item) => (
                <div
                  key={item.id}
                  id={`item-pendente-${item.id}`}
                  className="bg-white rounded-2xl border border-amber-200/90 shadow-2xs hover:shadow-xs transition-all p-6 space-y-4"
                >
                  {/* Cabeçalho do Item Pendente */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.nomeFicheiroOrigem ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-indigo-700" />
                            <span>Doc: {item.nomeFicheiroOrigem}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {item.fonteVarredura || 'Varredura Web Portugal'}
                          </span>
                        )}

                        {item.parteOuAmbito && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            item.parteOuAmbito.toLowerCase().includes('estrangeir')
                              ? 'bg-sky-50 text-sky-900 border-sky-200'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          }`}>
                            {item.parteOuAmbito.toLowerCase().includes('estrangeir') ? '🌐 Estrangeira' : '🇵🇹 Nacional'}
                          </span>
                        )}

                        {item.areaTematica && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                            {item.areaTematica}
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700">
                          {item.nomeEditora}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.acessoLivre ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.acessoLivre ? 'Acesso Aberto / Livre' : 'Subscrição / Comercial'}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {item.nomeObra}
                      </h3>
                      <p className="text-xs text-indigo-900 font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Autores: {item.autores}</span>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-end gap-1 text-xs text-slate-500 shrink-0">
                      <span className="font-semibold text-slate-700">{item.edicao}</span>
                      <span className="font-mono">Ano: {item.anoEdicao}</span>
                    </div>
                  </div>

                  {/* Formulário Preenchido - Detalhes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-700 block">Resumo do Estudo / Artigo:</span>
                      <p className="text-slate-600 leading-relaxed font-serif">
                        {item.resumo}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-slate-700 block">Ligações Diretas Detetadas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.linksAcesso.map((lnk, idx) => {
                          const info = formatarRotuloLink(lnk);
                          return (
                            <a
                              key={idx}
                              href={lnk}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-indigo-800 hover:bg-indigo-50 font-medium transition-colors text-xs"
                              title={`Abrir ${lnk}`}
                            >
                              <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span>{info.label}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                            </a>
                          );
                        })}
                      </div>

                      {item.temDocumento && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-800 font-medium">
                            <FileText className="w-3.5 h-3.5 text-indigo-700" />
                            <span>Documento: {item.documentoNome}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de Ações do Administrador para este Item */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleValidarItem(item)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                      >
                        <Check className="w-4 h-4" />
                        <span>Validar e Colocar Visível na App</span>
                      </button>

                      <button
                        onClick={() => abrirFormComItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Editar antes de Validar</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRejeitarItem(item.id, item.nomeObra)}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 text-xs font-semibold transition-colors cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Descartar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. CATÁLOGO ATIVO DE DOUTRINA (PÚBLICO / VISÍVEL NA APP)                  */}
      {/* ========================================================================= */}
      {abaAtiva === 'ativo' && (
        <section className="space-y-6 animate-in fade-in duration-200">
          
          {/* Barra de Filtros e Pesquisa */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
            {/* Linha superior: Seleção rápida de Âmbito (Nacional vs Estrangeira) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">Origem:</span>
                <button
                  id="filtro-ambito-todos"
                  onClick={() => setFiltroAmbito('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroAmbito === 'todos'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Todas as Obras</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filtroAmbito === 'todos' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                    {doutrinas.length}
                  </span>
                </button>

                <button
                  id="filtro-ambito-nacional"
                  onClick={() => setFiltroAmbito('nacional')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroAmbito === 'nacional'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  <span>🇵🇹 Obras Nacionais</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filtroAmbito === 'nacional' ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-100 text-emerald-800'}`}>
                    {totalNacionais}
                  </span>
                </button>

                <button
                  id="filtro-ambito-estrangeira"
                  onClick={() => setFiltroAmbito('estrangeira')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filtroAmbito === 'estrangeira'
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>🌐 Obras Estrangeiras</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${filtroAmbito === 'estrangeira' ? 'bg-sky-900 text-sky-100' : 'bg-sky-100 text-sky-800'}`}>
                    {totalEstrangeiras}
                  </span>
                </button>
              </div>

              {/* Botão limpar filtros quando algum filtro estiver ativo */}
              {(pesquisa || filtroAmbito !== 'todos' || filtroArea !== 'todos' || filtroAcessoLivre !== 'todos') && (
                <button
                  onClick={() => {
                    setPesquisa('');
                    setFiltroAmbito('todos');
                    setFiltroArea('todos');
                    setFiltroAcessoLivre('todos');
                  }}
                  className="text-xs font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpar todos os filtros</span>
                </button>
              )}
            </div>

            {/* Inputs: Search, Área Temática, Regime */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  placeholder="Pesquisar por autor, título da obra, editora, ano ou termos..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {pesquisa && (
                  <button
                    onClick={() => setPesquisa('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filtro por Área Temática (Jurídica, Psicologia, etc...) */}
              <div className="md:col-span-4 relative">
                <select
                  id="filtro-area-tematica"
                  value={filtroArea}
                  onChange={(e) => setFiltroArea(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:bg-white focus:outline-none font-medium transition-all ${
                    filtroArea !== 'todos'
                      ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold ring-2 ring-purple-400/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <option value="todos">📚 Todas as Áreas Temáticas</option>
                  <option value="Área Jurídica">⚖️ Área Jurídica (Direito Penal e Tutela)</option>
                  <option value="Área da Psicologia">🧠 Área da Psicologia e Trauma</option>
                  <option value="Área das Perícias (Forense e Investigação)">🔬 Área das Perícias (Forense e Investigação)</option>
                  <option value="Área da Medicina e Saúde Pública">🩺 Área da Medicina e Saúde Pública</option>
                  <option value="Área Social e Apoio à Vítima">🤝 Área Social e Apoio à Vítima</option>
                  {areasDisponiveis
                    .filter(a => !AREAS_PADRAO.includes(a))
                    .map(a => (
                      <option key={a} value={a}>📌 {a}</option>
                    ))}
                </select>
              </div>

              {/* Filtro por Regime de Acesso */}
              <div className="md:col-span-3 relative">
                <select
                  value={filtroAcessoLivre === 'todos' ? 'todos' : filtroAcessoLivre ? 'livre' : 'pago'}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'todos') setFiltroAcessoLivre('todos');
                    else if (v === 'livre') setFiltroAcessoLivre(true);
                    else setFiltroAcessoLivre(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-700"
                >
                  <option value="todos">Todos os regimes de acesso</option>
                  <option value="livre">🔓 Apenas Acesso Aberto / Livre</option>
                  <option value="pago">🔒 Apenas Sob Assinatura / Editora</option>
                </select>
              </div>
            </div>

            {/* Sub-barra com contadores e botões rápidos de área temática */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-2">
                <span>A apresentar <strong>{doutrinasFiltradas.length}</strong> de <strong>{doutrinas.length}</strong> obras</span>
                {filtroAmbito !== 'todos' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium text-[11px]">
                    {filtroAmbito === 'nacional' ? '🇵🇹 Nacional' : '🌐 Estrangeira'}
                    <button onClick={() => setFiltroAmbito('todos')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                  </span>
                )}
                {filtroArea !== 'todos' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-medium text-[11px]">
                    {filtroArea}
                    <button onClick={() => setFiltroArea('todos')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                  </span>
                )}
              </div>

              {/* Atalhos rápidos para Áreas Temáticas */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setFiltroArea(filtroArea === 'Área Jurídica' ? 'todos' : 'Área Jurídica')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    filtroArea === 'Área Jurídica'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ⚖️ Jurídica
                </button>
                <button
                  onClick={() => setFiltroArea(filtroArea === 'Área da Psicologia' ? 'todos' : 'Área da Psicologia')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    filtroArea === 'Área da Psicologia'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🧠 Psicologia
                </button>
                <button
                  onClick={() => setFiltroArea(filtroArea === 'Área das Perícias (Forense e Investigação)' ? 'todos' : 'Área das Perícias (Forense e Investigação)')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    filtroArea === 'Área das Perícias (Forense e Investigação)'
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🔬 Perícias
                </button>
                <button
                  onClick={() => setFiltroArea(filtroArea === 'Área da Medicina e Saúde Pública' ? 'todos' : 'Área da Medicina e Saúde Pública')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    filtroArea === 'Área da Medicina e Saúde Pública'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🩺 Medicina
                </button>
                <button
                  onClick={() => setFiltroArea(filtroArea === 'Área Social e Apoio à Vítima' ? 'todos' : 'Área Social e Apoio à Vítima')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    filtroArea === 'Área Social e Apoio à Vítima'
                      ? 'bg-rose-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🤝 Apoio à Vítima
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Cards de Doutrina */}
          {doutrinasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                Nenhuma obra encontrada para esta pesquisa
              </h3>
              <p className="text-xs text-slate-500">
                Tente redefinir os termos de busca ou consulte a aba de «Validação de Descobertas Web».
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {doutrinasFiltradas.map((item) => (
                <article
                  key={item.id}
                  id={`doutrina-${item.id}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Origem: Nacional vs Estrangeira */}
                        {normalizarAmbito(item) === 'estrangeira' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200 inline-flex items-center gap-1">
                            <Globe className="w-3 h-3 text-sky-600" />
                            <span>Estrangeira</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <span>🇵🇹 Nacional</span>
                          </span>
                        )}

                        {/* Área Temática */}
                        {item.areaTematica && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            item.areaTematica.includes('Psicolog')
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : item.areaTematica.includes('Perícia') || item.areaTematica.includes('Forense')
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : item.areaTematica.includes('Medicin') || item.areaTematica.includes('Saúde')
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : item.areaTematica.includes('Social') || item.areaTematica.includes('Vítima')
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {item.areaTematica}
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.acessoLivre ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {item.acessoLivre ? 'Acesso Aberto' : 'Sob Assinatura'}
                        </span>
                      </div>

                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {item.anoEdicao}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {item.nomeObra}
                      </h3>
                      <p className="text-xs font-medium text-indigo-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                        <span>{item.autores}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.nomeEditora}</span>
                      </span>
                      {item.edicao && (
                        <span>• {item.edicao}</span>
                      )}
                    </div>

                    {item.resumo && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-serif bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {item.resumo}
                      </p>
                    )}
                  </div>

                  {/* Ações do Card */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.temDocumento && (
                        <button
                          onClick={() => setDocumentoVisualizando(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-700" />
                          <span>Consultar Documento</span>
                        </button>
                      )}

                      {item.linksAcesso && item.linksAcesso.length > 0 && item.linksAcesso.map((lnk, idx) => {
                        const info = formatarRotuloLink(lnk);
                        return (
                          <a
                            key={idx}
                            href={lnk}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                            title={`Aceder: ${lnk}`}
                          >
                            <Globe className="w-3 h-3 text-slate-500" />
                            <span>{info.label}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        );
                      })}

                      <a
                        href={`https://www.rcaap.pt/search.php?q=${encodeURIComponent(item.autores + ' ' + item.nomeObra)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                        title="Pesquisar esta obra no RCAAP (Repositórios Científicos de Portugal)"
                      >
                        <Search className="w-3 h-3 text-indigo-500" />
                        <span>RCAAP</span>
                        <ExternalLink className="w-2.5 h-2.5 text-indigo-400" />
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-2">
                        <span>Registo: {item.dataRegisto}</span>
                        <button
                          onClick={() => handleCopiarCitacao(`${item.autores} (${item.anoEdicao}) - "${item.nomeObra}", ${item.edicao}, ${item.nomeEditora}.`, item.id)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-700 text-xs transition-colors cursor-pointer ml-1"
                          title="Copiar citação bibliográfica"
                        >
                          {copiadoCitacaoId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-medium text-[11px]">Citação copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[11px]">Copiar citação</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirFormComItem(item)}
                          className="hover:text-indigo-800 transition-colors p-1"
                          title="Editar esta referência"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEliminarDoutrina(item.id)}
                          className="hover:text-rose-700 transition-colors p-1"
                          title="Eliminar esta referência"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ADICIONAR / EDITAR REFERÊNCIA DOUTRINÁRIA                      */}
      {/* ========================================================================= */}
      {modalFormAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {itemEmEdicaoId ? 'Editar Referência Doutrinária' : 'Adicionar Nova Referência Doutrinária'}
                </h3>
              </div>
              <button
                onClick={() => setModalFormAberto(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroForm && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium">
                {erroForm}
              </div>
            )}

            <form onSubmit={handleSubmeterForm} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Nome da Obra / Artigo *</label>
                  <input
                    type="text"
                    required
                    value={nomeObra}
                    onChange={(e) => setNomeObra(e.target.value)}
                    placeholder="Ex.: O Crime de Violência Doméstica: Da Tutela Penal à Proteção da Vítima"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Nome do(s) Autor(es) *</label>
                  <input
                    type="text"
                    required
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    placeholder="Ex.: Maria Elisabete Ferreira"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Editora / Revista Científica *</label>
                  <input
                    type="text"
                    required
                    value={nomeEditora}
                    onChange={(e) => setNomeEditora(e.target.value)}
                    placeholder="Ex.: Almedina, CEJ, Revista JULGAR..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Edição</label>
                    <input
                      type="text"
                      value={edicao}
                      onChange={(e) => setEdicao(e.target.value)}
                      placeholder="Ex.: 2.ª Edição"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Ano</label>
                    <input
                      type="number"
                      value={anoEdicao}
                      onChange={(e) => setAnoEdicao(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Âmbito / Origem e Área Temática */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Origem / Âmbito da Obra *</label>
                  <select
                    value={parteOuAmbito}
                    onChange={(e) => setParteOuAmbito(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Obras Nacionais (Portugal)">🇵🇹 Obras Nacionais (Portugal)</option>
                    <option value="Obras Estrangeiras (Seleção)">🌐 Obras Estrangeiras (Seleção Internacional)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Área Temática *</label>
                  <select
                    value={areaTematica}
                    onChange={(e) => setAreaTematica(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Área Jurídica">⚖️ Área Jurídica (Direito Penal e Tutela)</option>
                    <option value="Área da Psicologia">🧠 Área da Psicologia e Trauma</option>
                    <option value="Área das Perícias (Forense e Investigação)">🔬 Área das Perícias (Forense e Investigação)</option>
                    <option value="Área da Medicina e Saúde Pública">🩺 Área da Medicina e Saúde Pública</option>
                    <option value="Área Social e Apoio à Vítima">🤝 Área Social e Apoio à Vítima</option>
                    <option value="Outra">Outra Área (Personalizada)</option>
                  </select>
                </div>

                {areaTematica === 'Outra' && (
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-semibold text-slate-700">Especificar Área Personalizada *</label>
                    <input
                      type="text"
                      required
                      value={outraAreaPersonalizada}
                      onChange={(e) => setOutraAreaPersonalizada(e.target.value)}
                      placeholder="Ex.: Criminologia Clínica, Vitimologia Aplicada..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Links de Acesso */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Links de Acesso à Obra / Artigo</label>
                  <button
                    type="button"
                    onClick={handleAdicionarLink}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Link</span>
                  </button>
                </div>

                {linksAcesso.map((lnk, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={lnk}
                      onChange={(e) => handleLinkChange(i, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {linksAcesso.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoverLink(i)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Acesso Livre */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="chk-acesso-livre"
                  checked={acessoLivre}
                  onChange={(e) => setAcessoLivre(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-700 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="chk-acesso-livre" className="text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
                  Disponível em Regime de Acesso Livre (Open Access / Sem Custo)
                </label>
              </div>

              {/* Upload de Documento / Ficheiro */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block">Documento Anexo (PDF, DOCX, TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 cursor-pointer"
                />
                {ficheiroUpload && (
                  <p className="text-xs text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Ficheiro pronto: {ficheiroUpload.nome}</span>
                  </p>
                )}
              </div>

              {/* Resumo */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block">Resumo / Notas Dogmáticas</label>
                <textarea
                  rows={4}
                  value={resumo}
                  onChange={(e) => setResumo(e.target.value)}
                  placeholder="Sumário dos temas tratados, conclusões dogmáticas e enquadramento prático..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalFormAberto(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 rounded-xl bg-indigo-900 text-white text-xs font-semibold hover:bg-indigo-800 transition-colors shadow-xs cursor-pointer"
                >
                  {salvando ? 'A guardar...' : itemEmEdicaoId ? 'Guardar e Validar' : 'Guardar Referência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DE VISUALIZAÇÃO DE DOCUMENTO ANEXO                              */}
      {/* ========================================================================= */}
      {documentoVisualizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider">Documento Jurídico</span>
                <h3 className="text-base font-bold text-slate-900">{documentoVisualizando.nomeObra}</h3>
                <p className="text-xs text-slate-500">{documentoVisualizando.autores} • {documentoVisualizando.nomeEditora}</p>
              </div>
              <button
                onClick={() => setDocumentoVisualizando(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs sm:text-sm text-slate-800 font-serif leading-relaxed whitespace-pre-line">
              {documentoVisualizando.documentoTexto || documentoVisualizando.resumo || 'Nenhum texto disponível para pré-visualização.'}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Ficheiro: {documentoVisualizando.documentoNome || 'Anexo'}
              </span>
              <div className="flex items-center gap-2">
                {documentoVisualizando.documentoDataUrl && (
                  <a
                    href={documentoVisualizando.documentoDataUrl}
                    download={documentoVisualizando.documentoNome || 'documento.pdf'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900 text-white font-semibold hover:bg-indigo-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Transferir Ficheiro</span>
                  </a>
                )}
                <button
                  onClick={() => setDocumentoVisualizando(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE IMPORTAÇÃO E EXTRAÇÃO INTELIGENTE DE DOCUMENTOS (PDF / WORD) */}
      {/* ========================================================================= */}
      <ModalImportarDocumento
        isOpen={modalImportarAberto}
        onClose={() => setModalImportarAberto(false)}
        tipoAlvo="doutrina"
        onImportarDoutrinas={handleImportarDoutrinasExtraidas}
      />

    </div>
  );
};
