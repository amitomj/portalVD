import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileUp, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Scale, 
  ExternalLink, 
  X, 
  ArrowRight, 
  Layers, 
  Library,
  Loader2,
  Check,
  FileCheck
} from 'lucide-react';
import { ReferenciaDoutrinaria, DiplomaLegislativo } from '../types/modules';
import { 
  extrairConteudoDeFicheiro, 
  analisarTextoDocumento, 
  TEXTO_EXEMPLO_REPOSITORIO_PDF,
  ExtractedContentResult 
} from '../services/documentContentExtractor';

interface ModalImportarDocumentoProps {
  isOpen: boolean;
  onClose: () => void;
  tipoAlvo: 'doutrina' | 'legislacao' | 'misto';
  onImportarDoutrinas: (itens: ReferenciaDoutrinaria[]) => Promise<void> | void;
  onImportarLegislacoes?: (itens: DiplomaLegislativo[]) => Promise<void> | void;
}

export const ModalImportarDocumento: React.FC<ModalImportarDocumentoProps> = ({
  isOpen,
  onClose,
  tipoAlvo,
  onImportarDoutrinas,
  onImportarLegislacoes
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [etapaTexto, setEtapaTexto] = useState('');
  const [resultado, setResultado] = useState<ExtractedContentResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucessoImportacao, setSucessoImportacao] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetarEstado = () => {
    setResultado(null);
    setErro(null);
    setSucessoImportacao(false);
    setProcessando(false);
  };

  const processarFicheiro = async (file: File) => {
    setErro(null);
    setProcessando(true);
    setSucessoImportacao(false);
    setEtapaTexto('A analisar e extrair texto do documento...');

    try {
      const res = await extrairConteudoDeFicheiro(file);

      if (res.doutrinas.length === 0 && res.legislacoes.length === 0) {
        setErro('Não foram identificadas entradas estruturadas de doutrina ou legislação no documento fornecido. Certifique-se de que o ficheiro contém referências bibliográficas ou diplomas.');
        setProcessando(false);
        return;
      }

      setResultado(res);
    } catch (err: any) {
      console.error('Erro ao processar ficheiro:', err);
      setErro(err?.message || 'Ocorreu um erro ao ler o ficheiro. Tente com outro documento PDF, DOCX ou TXT.');
    } finally {
      setProcessando(false);
    }
  };

  const handleCarregarExemploConversa = () => {
    setErro(null);
    setProcessando(true);
    setSucessoImportacao(false);
    setEtapaTexto('A processar documento de compilação exaustiva de violência doméstica...');

    setTimeout(() => {
      try {
        const { doutrinas, legislacoes } = analisarTextoDocumento(
          TEXTO_EXEMPLO_REPOSITORIO_PDF, 
          'Repositorio_Exaustivo_Violencia_Domestica.pdf'
        );

        const areasCount: Record<string, number> = {};
        for (const d of doutrinas) {
          const a = d.areaTematica || 'Geral';
          areasCount[a] = (areasCount[a] || 0) + 1;
        }

        setResultado({
          fileName: 'Repositorio_Exaustivo_Violencia_Domestica.pdf',
          fileType: 'application/pdf',
          fileSize: 145000,
          totalPaginas: 6,
          doutrinas,
          legislacoes,
          textoBruto: TEXTO_EXEMPLO_REPOSITORIO_PDF,
          estatisticas: {
            totalDoutrinas: doutrinas.length,
            totalLegislacoes: legislacoes.length,
            areasDoutrina: areasCount
          }
        });
      } catch (err: any) {
        setErro('Erro ao processar dados de exemplo: ' + err.message);
      } finally {
        setProcessando(false);
      }
    }, 400);
  };

  const handleConfirmarImportacao = async () => {
    if (!resultado) return;

    setProcessando(true);
    setEtapaTexto('A gerar formulários e a submeter para a fila de validação...');

    try {
      if (resultado.doutrinas.length > 0 && onImportarDoutrinas) {
        await onImportarDoutrinas(resultado.doutrinas);
      }
      if (resultado.legislacoes.length > 0 && onImportarLegislacoes) {
        await onImportarLegislacoes(resultado.legislacoes);
      }

      setSucessoImportacao(true);
      setTimeout(() => {
        resetarEstado();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErro('Erro ao gravar os formulários: ' + err?.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processarFicheiro(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processarFicheiro(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header do Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Leitura Automática de Documento PDF / Word
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Extração Inteligente
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Extração semântica de obras doutrinárias, artigos e legislação para pré-preenchimento e validação
              </p>
            </div>
          </div>
          <button
            onClick={() => { resetarEstado(); onClose(); }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Central */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

          {erro && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Erro no processamento</p>
                <p className="text-xs text-rose-700 mt-0.5">{erro}</p>
              </div>
            </div>
          )}

          {sucessoImportacao && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center space-y-2 text-emerald-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
              <h3 className="font-bold text-base text-emerald-900">Documento Processado com Sucesso!</h3>
              <p className="text-xs text-emerald-700">
                Os formulários foram gerados e encaminhados para a Fila de Validação. A carregar...
              </p>
            </div>
          )}

          {/* Estado de Processamento Ativo */}
          {processando && (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <Sparkles className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">{etapaTexto}</p>
                <p className="text-xs text-slate-400">A extrair metadados: Autores, Obras, Editoras, Edições, Anos e Links</p>
              </div>
            </div>
          )}

          {/* Área de Seleção de Ficheiro (se ainda não há resultado) */}
          {!resultado && !processando && !sucessoImportacao && (
            <div className="space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-slate-50/40'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange} 
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden" 
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">
                  Arraste e solte o seu documento PDF ou clique para selecionar
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Suporta ficheiros em formato <strong>PDF</strong>, <strong>Word (.docx)</strong> e <strong>Texto (.txt)</strong>.
                  O motor extrai automaticamente os blocos com indicação de Autor(es), Título, Detalhes e Links.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Procurar ficheiro no computador
                </div>
              </div>

              {/* Botão de Exemplo Direto do Repositório da Conversa */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Experimentar com o Documento PDF fornecido na conversa
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      «Repositório Exaustivo sobre Violência Doméstica»: 36 obras científicas, artigos jurídicos, periciais, psicológicos e médicos.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCarregarExemploConversa}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0 hover:shadow"
                >
                  <FileCheck className="w-4 h-4" />
                  Processar Documento Exemplo (36 Itens)
                </button>
              </div>

              {/* Orientações sobre Formatos Suportados */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                <h5 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Formatos de Conteúdo Identificados Automaticamente
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Doutrina & Artigos Estruturados</span>
                    Campos como <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Autor(es):</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Título:</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Detalhes:</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Link:</code>.
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Legislação e Diplomas</span>
                    Identificação de <code className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono">Lei n.º</code>, <code className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono">Decreto-Lei n.º</code>, <code className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono">Portaria n.º</code>, com links e temas.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resultado da Extração Pronta */}
          {resultado && !processando && !sucessoImportacao && (
            <div className="space-y-5">
              
              {/* Resumo da Extração */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Extração Concluída: {resultado.fileName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Foram extraídos com sucesso <strong>{resultado.estatisticas.totalDoutrinas} registos de doutrina</strong>
                      {resultado.estatisticas.totalLegislacoes > 0 && ` e ${resultado.estatisticas.totalLegislacoes} diplomas de legislação`}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetarEstado}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Mudar Ficheiro
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmarImportacao}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Enviar Todos para Fila de Validação
                  </button>
                </div>
              </div>

              {/* Estatísticas por Área */}
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(resultado.estatisticas.areasDoutrina).map(([area, count]) => (
                  <span 
                    key={area}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <strong>{area}:</strong> {count}
                  </span>
                ))}
              </div>

              {/* Lista Prévia dos Itens Extraídos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Pré-visualização dos formulários gerados ({resultado.doutrinas.length} itens):</span>
                  <span>Ficarão sujeitos a validação antes da publicação</span>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {resultado.doutrinas.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all text-left space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900 leading-snug">
                              {item.nomeObra}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-700 font-medium">
                            {item.autores}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {item.acessoLivre ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Acesso Livre
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Comercial
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {item.anoEdicao} • {item.edicao}
                          </span>
                        </div>
                      </div>

                      {/* Metadados e Editora */}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="truncate">
                          <strong>Editora:</strong> {item.nomeEditora}
                        </span>
                        {item.areaTematica && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {item.areaTematica}
                          </span>
                        )}
                      </div>

                      {/* Links extraídos */}
                      {item.linksAcesso.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-slate-400">Links:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.linksAcesso.map((l, lIdx) => (
                              <a
                                key={lIdx}
                                href={l}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 px-1.5 py-0.5 rounded hover:underline max-w-[220px] truncate"
                              >
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{l}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer do Modal */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {resultado ? (
              <span>{resultado.doutrinas.length} formulários prontos para a fila de validação</span>
            ) : (
              <span>Formatos suportados: PDF, DOCX, TXT</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => { resetarEstado(); onClose(); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>
            {resultado && !sucessoImportacao && (
              <button
                type="button"
                onClick={handleConfirmarImportacao}
                disabled={processando}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Submeter para Validação
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
