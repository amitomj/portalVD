import React, { useState } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Globe, 
  Mail, 
  Plus, 
  Search, 
  Building, 
  ChevronRight, 
  ChevronDown, 
  X, 
  ExternalLink, 
  Phone, 
  Check, 
  Trash2, 
  Map as MapIcon, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Navigation
} from 'lucide-react';
import { ContactoUtil, AmbitoAtuacao } from '../types/modules';
import { DISTRITOS_PORTUGAL } from '../data/portugalGeo';

interface ContactosUteisViewProps {
  contactos: ContactoUtil[];
  onSalvarContacto: (contacto: ContactoUtil) => Promise<boolean>;
  onEliminarContacto: (id: string) => Promise<boolean>;
}

export const ContactosUteisView: React.FC<ContactosUteisViewProps> = ({
  contactos,
  onSalvarContacto,
  onEliminarContacto
}) => {
  // Estado de navegação geográfica
  // Por padrão, selecionamos 'lisboa' e 'Lisboa' para visualização imediata rica
  const [distritoSelecionadoId, setDistritoSelecionadoId] = useState<string>('lisboa');
  const [municipioSelecionado, setMunicipioSelecionado] = useState<string>('Lisboa');
  const [filtroPesquisa, setFiltroPesquisa] = useState<string>('');
  
  // Modal de Detalhes da Instituição selecionada
  // Fechando a modal, continuamos exatamente onde estávamos (distrito e município selecionados permanecem)
  const [instituicaoModal, setInstituicaoModal] = useState<ContactoUtil | null>(null);

  // Modal de Criação de Novo Contacto
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  // Form State para Novo Contacto
  const [nome, setNome] = useState('');
  const [site, setSite] = useState('');
  const [morada, setMorada] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [distritoSede, setDistritoSede] = useState('Lisboa');
  const [municipioSede, setMunicipioSede] = useState('Lisboa');
  const [ambitoAtuacao, setAmbitoAtuacao] = useState<AmbitoAtuacao>('local');
  const [municipiosAtuacao, setMunicipiosAtuacao] = useState<string[]>(['Lisboa']);
  const [horario, setHorario] = useState('Dias úteis das 09h00 às 17h30');
  const [descricao, setDescricao] = useState('');
  const [linhaGratuita, setLinhaGratuita] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const distritoAtual = DISTRITOS_PORTUGAL.find(d => d.id === distritoSelecionadoId) || DISTRITOS_PORTUGAL[0];

  const resetForm = () => {
    setNome('');
    setSite('');
    setMorada('');
    setTelefone('');
    setEmail('');
    setDistritoSede('Lisboa');
    setMunicipioSede('Lisboa');
    setAmbitoAtuacao('local');
    setMunicipiosAtuacao(['Lisboa']);
    setHorario('Dias úteis das 09h00 às 17h30');
    setDescricao('');
    setLinhaGratuita(false);
    setErroForm(null);
  };

  const handleSubmeterNovoContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim() || !municipioSede.trim()) {
      setErroForm('Por favor, preencha o Nome da Instituição, Telefone e Município da Sede.');
      return;
    }

    setSalvando(true);
    setErroForm(null);

    const novoContacto: ContactoUtil = {
      id: `cont_${Date.now()}`,
      nome: nome.trim(),
      site: site.trim(),
      morada: morada.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      municipioSede: municipioSede.trim(),
      distritoSede: distritoSede.trim(),
      ambitoAtuacao,
      municipiosAtuacao: ambitoAtuacao === 'local' ? municipiosAtuacao : [],
      horarioFuncionamento: horario.trim(),
      descricao: descricao.trim(),
      linhaGratuita,
      dataCriacao: new Date().toISOString().split('T')[0]
    };

    try {
      await onSalvarContacto(novoContacto);
      resetForm();
      setModalNovoAberto(false);
    } catch {
      setErroForm('Erro ao guardar contacto no sistema.');
    } finally {
      setSalvando(false);
    }
  };

  // Filtragem das instituições para a área geográfica selecionada
  const instituicoesParaArea = contactos.filter(item => {
    const q = filtroPesquisa.toLowerCase();
    const matchPesquisa = !q ||
      item.nome.toLowerCase().includes(q) ||
      item.municipioSede.toLowerCase().includes(q) ||
      item.telefone.toLowerCase().includes(q) ||
      (item.email && item.email.toLowerCase().includes(q));

    if (!matchPesquisa) return false;

    // Se a instituição for de âmbito nacional, está disponível em todos os municípios
    if (item.ambitoAtuacao === 'nacional') return true;

    // Se for de âmbito local, verifica se atua no município selecionado
    if (municipioSelecionado && item.municipiosAtuacao.includes(municipioSelecionado)) {
      return true;
    }

    // Se for do mesmo município da sede
    if (municipioSelecionado && item.municipioSede.toLowerCase() === municipioSelecionado.toLowerCase()) {
      return true;
    }

    // Se for do mesmo distrito
    if (distritoAtual && item.distritoSede.toLowerCase() === distritoAtual.nome.toLowerCase()) {
      return true;
    }

    return false;
  });

  return (
    <div className="space-y-6">

      {/* Header com Descrição e Ação de Novo Contacto */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Contactos Úteis e Rede de Apoio
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Localizador geográfico de serviços de apoio, gabinetes municipais, estruturas de acolhimento e linhas de emergência em Portugal.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setModalNovoAberto(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-900 text-white text-xs font-semibold hover:bg-indigo-950 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Criar Novo Contacto</span>
          </button>
        </div>

        {/* Barra de Pesquisa Rápida */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filtroPesquisa}
              onChange={(e) => setFiltroPesquisa(e.target.value)}
              placeholder="Pesquisar instituição, telefone, serviço ou email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500">
            Total registado: <strong className="text-slate-800 font-mono">{contactos.length}</strong> instituições
          </div>
        </div>
      </div>

      {/* ÁREA GEOGRÁFICA INTERATIVA: MAPA DE DISTRITOS E EXPANSÃO PARA MUNICÍPIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: NAVEGADOR GEOGRÁFICO DE DISTRITOS & EXPANSÃO DE MUNICÍPIOS */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-indigo-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Área Geográfica de Portugal
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              18 Distritos + Regiões Autónomas
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Clique num distrito para expandir e consultar os respetivos municípios e serviços disponíveis:
          </p>

          {/* Lista Acordeão de Distritos */}
          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {DISTRITOS_PORTUGAL.map(distrito => {
              const isSelected = distritoSelecionadoId === distrito.id;
              const countNoDistrito = contactos.filter(c => 
                c.ambitoAtuacao === 'nacional' || 
                c.distritoSede.toLowerCase() === distrito.nome.toLowerCase()
              ).length;

              return (
                <div 
                  key={distrito.id}
                  className={`rounded-xl border transition-all ${
                    isSelected 
                      ? 'border-indigo-400 bg-indigo-50/40 shadow-xs' 
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  {/* Cabeçalho do Distrito */}
                  <button
                    type="button"
                    onClick={() => {
                      setDistritoSelecionadoId(distrito.id);
                      setMunicipioSelecionado(distrito.municipios[0]);
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`} />
                      <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-700'}`}>
                        {distrito.nome}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({distrito.municipios.length} municípios)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 font-mono">
                        {countNoDistrito} serv.
                      </span>
                      {isSelected ? (
                        <ChevronDown className="w-4 h-4 text-indigo-700" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expansão para os Municípios do Distrito */}
                  {isSelected && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-indigo-100 space-y-2">
                      <div className="text-[11px] font-semibold text-indigo-900 flex items-center justify-between">
                        <span>Selecione um Município:</span>
                        <span className="font-mono text-indigo-600">{municipioSelecionado}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto pr-1">
                        {distrito.municipios.map(muni => {
                          const isMuniSelected = municipioSelecionado === muni;
                          return (
                            <button
                              key={muni}
                              type="button"
                              onClick={() => setMunicipioSelecionado(muni)}
                              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                                isMuniSelected
                                  ? 'bg-indigo-900 text-white shadow-2xs font-semibold'
                                  : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {muni}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUNA DIREITA: LISTA DE INSTITUIÇÕES / PROGRAMAS / SERVIÇOS NO MUNICÍPIO */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Distrito: <strong>{distritoAtual.nome}</strong></span>
                <span>•</span>
                <span>Município: <strong className="text-indigo-900">{municipioSelecionado || 'Todos'}</strong></span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Instituições, Programas e Serviços Disponíveis
              </h3>
            </div>
            <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-1 rounded-lg font-mono font-bold">
              {instituicoesParaArea.length} disponíveis
            </span>
          </div>

          {/* Cards de Instituições */}
          <div className="space-y-3">
            {instituicoesParaArea.map(inst => (
              <div
                key={inst.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Ao clicar no nome abre a janela modal com todos os dados */}
                      <button
                        type="button"
                        onClick={() => setInstituicaoModal(inst)}
                        className="text-sm font-bold text-indigo-950 hover:text-indigo-700 text-left underline decoration-indigo-200 hover:decoration-indigo-700 transition-colors cursor-pointer"
                        title="Ver detalhes completos em janela modal"
                      >
                        {inst.nome}
                      </button>

                      {inst.linhaGratuita && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                          Gratuita
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Sede: {inst.municipioSede} ({inst.distritoSede})
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-slate-400" />
                        Âmbito: <strong>{inst.ambitoAtuacao === 'nacional' ? 'Nacional' : 'Local'}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInstituicaoModal(inst)}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Tem a certeza de que deseja eliminar o contacto "${inst.nome}"?`)) {
                          onEliminarContacto(inst.id);
                        }
                      }}
                      className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors cursor-pointer"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {inst.descricao || inst.morada}
                </p>

                {/* Linhas Rápidas de Acesso */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <a
                    href={`tel:${inst.telefone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50/60 px-2.5 py-1 rounded-md"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{inst.telefone}</span>
                  </a>

                  {inst.email && (
                    <a
                      href={`mailto:${inst.email}`}
                      className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-900"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[180px]">{inst.email}</span>
                    </a>
                  )}

                  {inst.site && (
                    <a
                      href={inst.site.startsWith('http') ? inst.site : `https://${inst.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-medium"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}

            {instituicoesParaArea.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 space-y-2">
                <Building className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-medium">Nenhum serviço localizado diretamente neste município.</p>
                <p className="text-xs text-slate-400">
                  Consulte os serviços de âmbito nacional como a APAV (116 006) ou a Linha de Emergência (144).
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* JANELA MODAL COM TODOS OS DADOS DA INSTITUIÇÃO */}
      {/* Ao fechar esta modal, continuamos exatamente onde estávamos (distrito e município selecionados permanecem) */}
      {instituicaoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="p-5 bg-indigo-950 text-white flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  {instituicaoModal.ambitoAtuacao === 'nacional' ? 'Âmbito Nacional' : `Área Local • ${instituicaoModal.municipioSede}`}
                </span>
                <h3 className="text-base font-bold text-white leading-snug">
                  {instituicaoModal.nome}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInstituicaoModal(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Fechar modal e continuar onde estávamos"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Telefone e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Telefone de Contacto:</span>
                  <a
                    href={`tel:${instituicaoModal.telefone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-700 text-sm hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {instituicaoModal.telefone}
                  </a>
                  {instituicaoModal.linhaGratuita && (
                    <span className="text-[10px] text-emerald-600 block">Chamada Gratuita</span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Horário de Atendimento:</span>
                  <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{instituicaoModal.horarioFuncionamento || 'Horário de expediente'}</span>
                  </div>
                </div>
              </div>

              {/* Morada e Município da Sede */}
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold text-[11px]">Morada Física:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                    <span>{instituicaoModal.morada || 'Morada não especificada'}</span>
                  </div>
                  {instituicaoModal.morada && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(instituicaoModal.morada)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 hover:text-indigo-900 font-semibold shrink-0"
                    >
                      Ver no Mapa
                    </a>
                  )}
                </div>
              </div>

              {/* Sede e Âmbito de Atuação Geográfica */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 font-semibold text-[11px]">Município da Sede:</span>
                  <p className="font-bold text-slate-900">{instituicaoModal.municipioSede}</p>
                  <p className="text-[11px] text-slate-500">Distrito: {instituicaoModal.distritoSede}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 font-semibold text-[11px]">Área de Atuação:</span>
                  <p className="font-bold text-slate-900">
                    {instituicaoModal.ambitoAtuacao === 'nacional' ? 'Âmbito Nacional (Todo o país)' : 'Âmbito Local'}
                  </p>
                  {instituicaoModal.ambitoAtuacao === 'local' && instituicaoModal.municipiosAtuacao.length > 0 && (
                    <p className="text-[11px] text-slate-500">
                      {instituicaoModal.municipiosAtuacao.length} município(s) abrangido(s)
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de Municípios se local */}
              {instituicaoModal.ambitoAtuacao === 'local' && instituicaoModal.municipiosAtuacao.length > 0 && (
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold text-[11px]">Municípios com Intervenção:</span>
                  <div className="flex flex-wrap gap-1">
                    {instituicaoModal.municipiosAtuacao.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Site e Email */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {instituicaoModal.site && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Website Oficial:</span>
                    <a
                      href={instituicaoModal.site.startsWith('http') ? instituicaoModal.site : `https://${instituicaoModal.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{instituicaoModal.site}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {instituicaoModal.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Endereço de Email:</span>
                    <a
                      href={`mailto:${instituicaoModal.email}`}
                      className="text-indigo-700 font-semibold hover:underline"
                    >
                      {instituicaoModal.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Descrição adicional */}
              {instituicaoModal.descricao && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-slate-700 leading-relaxed">
                  {instituicaoModal.descricao}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Ao fechar, o mapa permanece no distrito {distritoAtual.nome}.
              </span>
              <button
                type="button"
                onClick={() => setInstituicaoModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Fechar e Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CRIAR NOVO CONTACTO */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-900 text-amber-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Criar Novo Contacto / Instituição
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registo de instituição, programa ou serviço de apoio a vítimas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erroForm && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {erroForm}
              </div>
            )}

            <form onSubmit={handleSubmeterNovoContacto} className="space-y-3.5 text-xs">
              
              {/* Nome da Instituição */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Nome da Instituição / Programa / Serviço *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: GAV - Gabinete de Apoio à Vítima de Sintra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Site e Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Website Oficial
                  </label>
                  <input
                    type="url"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                    placeholder="https://exemplo.pt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@instituicao.pt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Telefone e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: 21 358 7900 ou 116 006"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Horário de Funcionamento
                  </label>
                  <input
                    type="text"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    placeholder="Ex: Dias úteis das 09h00 às 17h30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Morada */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Morada Física Completa
                </label>
                <input
                  type="text"
                  value={morada}
                  onChange={(e) => setMorada(e.target.value)}
                  placeholder="Rua, Número, Código Postal, Localidade"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Distrito da Sede e Município onde está sediada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Distrito da Sede
                  </label>
                  <select
                    value={distritoSede}
                    onChange={(e) => {
                      const dNome = e.target.value;
                      setDistritoSede(dNome);
                      const d = DISTRITOS_PORTUGAL.find(dist => dist.nome === dNome);
                      if (d && d.municipios.length > 0) {
                        setMunicipioSede(d.municipios[0]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {DISTRITOS_PORTUGAL.map(d => (
                      <option key={d.id} value={d.nome}>{d.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Município onde está sediada *
                  </label>
                  <select
                    value={municipioSede}
                    onChange={(e) => setMunicipioSede(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                    required
                  >
                    {(DISTRITOS_PORTUGAL.find(d => d.nome === distritoSede)?.municipios || []).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Área Geográfica de Atuação */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-800">
                  Área Geográfica de Atuação *
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="ambito"
                      value="nacional"
                      checked={ambitoAtuacao === 'nacional'}
                      onChange={() => setAmbitoAtuacao('nacional')}
                      className="w-3.5 h-3.5 text-indigo-600"
                    />
                    <span>Âmbito Nacional (Todo o país)</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="ambito"
                      value="local"
                      checked={ambitoAtuacao === 'local'}
                      onChange={() => setAmbitoAtuacao('local')}
                      className="w-3.5 h-3.5 text-indigo-600"
                    />
                    <span>Âmbito Local (Município(s) específicos)</span>
                  </label>
                </div>

                {ambitoAtuacao === 'local' && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="text-[11px] text-slate-500 block">
                      Selecione os municípios onde este serviço atua:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
                      {(DISTRITOS_PORTUGAL.find(d => d.nome === distritoSede)?.municipios || []).map(m => {
                        const checked = municipiosAtuacao.includes(m);
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              if (checked) {
                                setMunicipiosAtuacao(municipiosAtuacao.filter(item => item !== m));
                              } else {
                                setMunicipiosAtuacao([...municipiosAtuacao, m]);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              checked 
                                ? 'bg-indigo-900 text-white font-semibold' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {m} {checked && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Linha Gratuita */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-gratuita"
                  checked={linhaGratuita}
                  onChange={(e) => setLinhaGratuita(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="chk-gratuita" className="font-medium text-slate-700 cursor-pointer">
                  Linha Telefónica de Chamada Gratuita
                </label>
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Descrição e Serviços Prestados
                </label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Informação sobre valências, equipas de apoio e encaminhamento..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 rounded-lg bg-indigo-900 text-white font-semibold hover:bg-indigo-950 disabled:opacity-50 cursor-pointer"
                >
                  {salvando ? 'A Gravar...' : 'Gravar Contacto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
