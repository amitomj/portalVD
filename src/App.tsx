import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { DecisionsList } from './components/DecisionsList';
import { DecisionFormModal } from './components/DecisionFormModal';
import { AdminMappingArea } from './components/AdminMappingArea';
import { StatisticsView } from './components/StatisticsView';
import { LegislacaoView } from './components/LegislacaoView';
import { JurisprudenciaView } from './components/JurisprudenciaView';
import { DoutrinaView } from './components/DoutrinaView';
import { ContactosUteisView } from './components/ContactosUteisView';

import { 
  carregarDecisoes, 
  carregarMapeamentosAdmin, 
  eliminarDecisao, 
  salvarDecisaoFirestore,
  limparTodaBaseDeDados,
  carregarLegislacao,
  salvarDiplomaLegislativo,
  eliminarDiplomaLegislativo,
  limparModuloLegislacao,
  carregarDoutrina,
  salvarReferenciaDoutrinaria,
  eliminarReferenciaDoutrinaria,
  limparModuloDoutrina,
  carregarContactos,
  salvarContactoUtil,
  eliminarContactoUtil,
  carregarJurisprudencia,
  salvarAcordaoJurisprudencia,
  eliminarAcordaoJurisprudencia,
  limparModuloJurisprudencia,
  verificarEInicializarBancoDeDados
} from './lib/firebase';
import type { DecisaoJudicialVD, ProcessoCorrespondencia } from './types/judicial';
import type { ModuloApp, DiplomaLegislativo, ReferenciaDoutrinaria, ContactoUtil, AcordaoJurisprudencia } from './types/modules';

export default function App() {
  // Módulo Principal Ativo (5 módulos)
  const [currentModule, setCurrentModule] = useState<ModuloApp>('vd_numeros');

  // Sub-abas do Módulo "VD em números" (preservadas a 100%)
  const [currentTab, setCurrentTab] = useState<'upload' | 'decisions' | 'stats' | 'admin'>('upload');
  
  // Estados de Dados
  const [decisoes, setDecisoes] = useState<DecisaoJudicialVD[]>([]);
  const [mapeamentos, setMapeamentos] = useState<ProcessoCorrespondencia[]>([]);
  const [legislacao, setLegislacao] = useState<DiplomaLegislativo[]>([]);
  const [jurisprudencia, setJurisprudencia] = useState<AcordaoJurisprudencia[]>([]);
  const [doutrina, setDoutrina] = useState<ReferenciaDoutrinaria[]>([]);
  const [contactos, setContactos] = useState<ContactoUtil[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // Modal State para Decisões do Módulo "VD em números"
  const [selectedDecisao, setSelectedDecisao] = useState<DecisaoJudicialVD | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Admin lock state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Carregar dados de todos os módulos na inicialização
  useEffect(() => {
    async function loadData() {
      try {
        // Inicializar a base de dados com os dados padrão se for a primeira execução
        await verificarEInicializarBancoDeDados();

        const [
          loadedDecisoes, 
          loadedMapeamentos,
          loadedLegislacao,
          loadedJurisprudencia,
          loadedDoutrina,
          loadedContactos
        ] = await Promise.all([
          carregarDecisoes(),
          carregarMapeamentosAdmin(),
          carregarLegislacao(),
          carregarJurisprudencia(),
          carregarDoutrina(),
          carregarContactos()
        ]);

        // Sanitização dos números sequenciais das decisões
        let precisaReparar = false;
        const decisoesSanitizadas = loadedDecisoes.map((d, index) => {
          const numInvalido = !d.seqNumber || isNaN(d.seqNumber) || d.seqId === 'VD-NaN' || !d.seqId || d.seqId.includes('NaN');
          if (numInvalido) precisaReparar = true;
          const num = !numInvalido ? d.seqNumber : (index + 1);
          const formattedId = `VD-${String(num).padStart(3, '0')}`;
          return {
            ...d,
            id: formattedId,
            seqId: formattedId,
            seqNumber: num
          };
        });

        decisoesSanitizadas.sort((a, b) => (a.seqNumber || 0) - (b.seqNumber || 0));

        const mapeamentosSanitizados = loadedMapeamentos.map((m, index) => {
          const numInvalido = !m.seqNumber || isNaN(m.seqNumber) || m.seqId === 'VD-NaN' || !m.seqId || m.seqId.includes('NaN');
          if (numInvalido) precisaReparar = true;
          const num = !numInvalido ? m.seqNumber : (index + 1);
          const formattedId = `VD-${String(num).padStart(3, '0')}`;
          return {
            ...m,
            id: `map_${formattedId}`,
            seqId: formattedId,
            seqNumber: num
          };
        });

        mapeamentosSanitizados.sort((a, b) => (a.seqNumber || 0) - (b.seqNumber || 0));

        setDecisoes(decisoesSanitizadas);
        setMapeamentos(mapeamentosSanitizados);
        setLegislacao(loadedLegislacao);
        setJurisprudencia(loadedJurisprudencia);
        setDoutrina(loadedDoutrina);
        setContactos(loadedContactos);

        if (precisaReparar && decisoesSanitizadas.length > 0) {
          decisoesSanitizadas.forEach(d => salvarDecisaoFirestore(d));
        }
      } catch (err) {
        console.error('Erro ao carregar dados da plataforma:', err);
      } finally {
        setLoadingInitialData(false);
      }
    }
    loadData();
  }, []);

  // Calcular próximo número sequencial para "VD em números"
  const proximoNumeroSequencial = (() => {
    let maxNum = 0;
    for (const d of decisoes) {
      if (typeof d.seqNumber === 'number' && !isNaN(d.seqNumber) && d.seqNumber > maxNum) {
        maxNum = d.seqNumber;
      } else if (typeof d.seqId === 'string' && d.seqId.startsWith('VD-')) {
        const parsed = parseInt(d.seqId.replace('VD-', ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
    for (const m of mapeamentos) {
      if (typeof m.seqNumber === 'number' && !isNaN(m.seqNumber) && m.seqNumber > maxNum) {
        maxNum = m.seqNumber;
      } else if (typeof m.seqId === 'string' && m.seqId.startsWith('VD-')) {
        const parsed = parseInt(m.seqId.replace('VD-', ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
    return maxNum + 1;
  })();

  // Handlers do Módulo "VD em números"
  const handleProcessamentoConcluido = (
    novasDecisoes: DecisaoJudicialVD[], 
    novosMapeamentos: ProcessoCorrespondencia[]
  ) => {
    setDecisoes(prev => {
      const combined = [...novasDecisoes, ...prev];
      return combined.sort((a, b) => (a.seqNumber || 0) - (b.seqNumber || 0));
    });
    setMapeamentos(prev => {
      const combined = [...novosMapeamentos, ...prev];
      return combined.sort((a, b) => (a.seqNumber || 0) - (b.seqNumber || 0));
    });
  };

  const handleAbrirFormulario = (decisao: DecisaoJudicialVD) => {
    setSelectedDecisao(decisao);
    setIsModalOpen(true);
  };

  const handleSalvarFormulario = (decisaoAtualizada: DecisaoJudicialVD) => {
    setDecisoes(prev => 
      prev.map(d => d.seqId === decisaoAtualizada.seqId ? decisaoAtualizada : d)
    );
    setSelectedDecisao(decisaoAtualizada);
  };

  const handleEliminarDecisao = async (seqId: string) => {
    await eliminarDecisao(seqId);
    setDecisoes(prev => prev.filter(d => d.seqId !== seqId));
    setMapeamentos(prev => prev.filter(m => m.seqId !== seqId));
    if (selectedDecisao?.seqId === seqId) {
      setIsModalOpen(false);
      setSelectedDecisao(null);
    }
  };

  const handleLimparBaseDeDados = async () => {
    const confirmacao = window.confirm(
      'Tem a certeza de que deseja limpar completamente a base de dados de decisões e mapeamentos?\n\nEsta ação irá remover permanentemente todos os registos do Firebase Firestore e da cache local.'
    );
    if (!confirmacao) return;

    try {
      await limparTodaBaseDeDados();
      setDecisoes([]);
      setMapeamentos([]);
      setSelectedDecisao(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao limpar base de dados:', err);
    }
  };

  const handleAbrirPorSeqId = (seqId: string) => {
    const encontrada = decisoes.find(d => d.seqId === seqId);
    if (encontrada) {
      setSelectedDecisao(encontrada);
      setIsModalOpen(true);
    } else {
      alert(`Formulário com identificador ${seqId} não foi encontrado.`);
    }
  };

  // Handlers de Legislação
  const handleSalvarDiploma = async (novoDiploma: DiplomaLegislativo) => {
    const ok = await salvarDiplomaLegislativo(novoDiploma);
    if (ok) {
      setLegislacao(prev => {
        const idx = prev.findIndex(d => d.id === novoDiploma.id);
        if (idx >= 0) {
          const cp = [...prev];
          cp[idx] = novoDiploma;
          return cp;
        }
        return [novoDiploma, ...prev];
      });
    }
    return ok;
  };

  const handleEliminarDiploma = async (id: string) => {
    const ok = await eliminarDiplomaLegislativo(id);
    if (ok) {
      setLegislacao(prev => prev.filter(d => d.id !== id));
    }
    return ok;
  };

  const handleLimparModuloLegislacao = async () => {
    await limparModuloLegislacao();
    setLegislacao([]);
  };

  // Handlers de Doutrina
  const handleSalvarDoutrina = async (novaDoutrina: ReferenciaDoutrinaria) => {
    const ok = await salvarReferenciaDoutrinaria(novaDoutrina);
    if (ok) {
      setDoutrina(prev => {
        const idx = prev.findIndex(d => d.id === novaDoutrina.id);
        if (idx >= 0) {
          const cp = [...prev];
          cp[idx] = novaDoutrina;
          return cp;
        }
        return [novaDoutrina, ...prev];
      });
    }
    return ok;
  };

  const handleSalvarVariasDoutrinas = async (itensNovos: ReferenciaDoutrinaria[]) => {
    setDoutrina(prev => {
      const mapa = new Map<string, ReferenciaDoutrinaria>();
      for (const d of prev) mapa.set(d.id, d);
      for (const d of itensNovos) mapa.set(d.id, d);
      const combinada = Array.from(mapa.values());
      combinada.sort((a, b) => Number(b.anoEdicao || 0) - Number(a.anoEdicao || 0));
      return combinada;
    });
  };

  const handleEliminarDoutrina = async (id: string) => {
    const ok = await eliminarReferenciaDoutrinaria(id);
    if (ok) {
      setDoutrina(prev => prev.filter(d => d.id !== id));
    }
    return ok;
  };

  const handleLimparModuloDoutrina = async () => {
    await limparModuloDoutrina();
    setDoutrina([]);
  };

  const handleLimparModuloJurisprudencia = async () => {
    await limparModuloJurisprudencia();
    setJurisprudencia([]);
  };

  // Handlers de Contactos
  const handleSalvarContacto = async (novoContacto: ContactoUtil) => {
    const ok = await salvarContactoUtil(novoContacto);
    if (ok) {
      setContactos(prev => {
        const idx = prev.findIndex(c => c.id === novoContacto.id);
        if (idx >= 0) {
          const cp = [...prev];
          cp[idx] = novoContacto;
          return cp;
        }
        return [...prev, novoContacto];
      });
    }
    return ok;
  };

  const handleEliminarContacto = async (id: string) => {
    const ok = await eliminarContactoUtil(id);
    if (ok) {
      setContactos(prev => prev.filter(c => c.id !== id));
    }
    return ok;
  };

  const handleRecarregarLegislacao = async () => {
    const lista = await carregarLegislacao();
    setLegislacao(lista);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation Header com os 5 Módulos e sub-abas para "VD em números" */}
      <Navbar
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        totalDecisoes={decisoes.length}
        totalProcessosMapeados={mapeamentos.length}
        totalLegislacao={legislacao.length}
        totalJurisprudencia={jurisprudencia.length}
        totalDoutrina={doutrina.length}
        totalContactos={contactos.length}
        isAdminUnlocked={isAdminUnlocked}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingInitialData ? (
          <div className="py-20 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">A sincronizar plataforma com a base de dados...</p>
          </div>
        ) : (
          <>
            {/* 1. MÓDULO: VD EM NÚMEROS (Sub-abas totalmente preservadas) */}
            {currentModule === 'vd_numeros' && (
              <>
                {currentTab === 'upload' && (
                  <UploadSection
                    onProcessamentoConcluido={handleProcessamentoConcluido}
                    proximoNumeroSequencial={proximoNumeroSequencial}
                    onVerFormulario={handleAbrirFormulario}
                  />
                )}

                {currentTab === 'decisions' && (
                  <DecisionsList
                    decisoes={decisoes}
                    onSelecionarDecisao={handleAbrirFormulario}
                    onEliminarDecisao={handleEliminarDecisao}
                    onLimparBaseDeDados={handleLimparBaseDeDados}
                  />
                )}

                {currentTab === 'stats' && (
                  <StatisticsView
                    decisoes={decisoes}
                    onSelecionarDecisao={handleAbrirFormulario}
                  />
                )}

                {currentTab === 'admin' && (
                  <AdminMappingArea
                    mapeamentos={mapeamentos}
                    isAdminUnlocked={isAdminUnlocked}
                    setIsAdminUnlocked={setIsAdminUnlocked}
                    onVerFormularioPorSeqId={handleAbrirPorSeqId}
                    onLimparBaseDeDados={handleLimparBaseDeDados}
                  />
                )}
              </>
            )}

            {/* 2. MÓDULO: LEGISLAÇÃO */}
            {currentModule === 'legislacao' && (
              <LegislacaoView
                diplomas={legislacao}
                onAtualizarLegis={handleRecarregarLegislacao}
                onSalvarDiploma={handleSalvarDiploma}
                onEliminarDiploma={handleEliminarDiploma}
                onLimparModuloLegislacao={handleLimparModuloLegislacao}
              />
            )}

            {/* 3. MÓDULO: JURISPRUDÊNCIA */}
            {currentModule === 'jurisprudencia' && (
              <JurisprudenciaView 
                acordaos={jurisprudencia} 
                onAtualizarAcordaos={setJurisprudencia} 
                onLimparJurisprudencia={handleLimparModuloJurisprudencia}
              />
            )}

            {/* 4. MÓDULO: DOUTRINA */}
            {currentModule === 'doutrina' && (
              <DoutrinaView
                doutrinas={doutrina}
                onSalvarDoutrina={handleSalvarDoutrina}
                onSalvarVariasDoutrinas={handleSalvarVariasDoutrinas}
                onEliminarDoutrina={handleEliminarDoutrina}
                onLimparModuloDoutrina={handleLimparModuloDoutrina}
              />
            )}

            {/* 5. MÓDULO: CONTACTOS ÚTEIS */}
            {currentModule === 'contactos' && (
              <ContactosUteisView
                contactos={contactos}
                onSalvarContacto={handleSalvarContacto}
                onEliminarContacto={handleEliminarContacto}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Formulário Individual Anonimizado do Módulo VD em números */}
      {selectedDecisao && (
        <DecisionFormModal
          decisao={selectedDecisao}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDecisao(null);
          }}
          onSalvar={handleSalvarFormulario}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Plataforma Integrada • Violência Doméstica: Decisões, Legislação, Doutrina e Rede de Apoio
          </p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Processamento Seguro</span>
            <span>•</span>
            <span>Sem IA</span>
            <span>•</span>
            <span>Firebase: vd-form</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
