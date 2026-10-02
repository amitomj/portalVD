import React, { useRef, useState } from 'react';
import { 
  FolderUp, 
  Files, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { extrairTextoDeFicheiro } from '../lib/documentReader';
import { analisarDecisaoJudicial } from '../lib/decisionParser';
import { CASOS_EXEMPLO } from '../lib/sampleDecisions';
import { salvarDecisaoFirestore, salvarMapeamentoAdminFirestore } from '../lib/firebase';
import type { DecisaoJudicialVD, ProcessoCorrespondencia, ResultadoProcessamentoFicheiro } from '../types/judicial';

interface UploadSectionProps {
  onProcessamentoConcluido: (novasDecisoes: DecisaoJudicialVD[], novosMapeamentos: ProcessoCorrespondencia[]) => void;
  proximoNumeroSequencial: number;
  onVerFormulario: (decisao: DecisaoJudicialVD) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onProcessamentoConcluido,
  proximoNumeroSequencial,
  onVerFormulario,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [resultados, setResultados] = useState<ResultadoProcessamentoFicheiro[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Manipulador de ficheiros da pasta ou ficheiros selecionados
  const processarListaDeFicheiros = async (files: File[]) => {
    if (!files || files.length === 0) return;

    // Filtrar ficheiros suportados (.pdf, .docx, .doc, .txt)
    const validFiles = files.filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext === 'pdf' || ext === 'docx' || ext === 'doc' || ext === 'txt';
    });

    if (validFiles.length === 0) {
      alert('Nenhum ficheiro suportado (.pdf, .docx, .txt) foi encontrado na pasta ou seleção.');
      return;
    }

    setIsProcessing(true);
    setTotalFiles(validFiles.length);
    setProcessedCount(0);
    const novosResultados: ResultadoProcessamentoFicheiro[] = [];
    const novasDecisoes: DecisaoJudicialVD[] = [];
    const novosMapeamentos: ProcessoCorrespondencia[] = [];

    let seqCounter = (typeof proximoNumeroSequencial === 'number' && !isNaN(proximoNumeroSequencial) && proximoNumeroSequencial > 0)
      ? proximoNumeroSequencial
      : 1;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setProgressMsg(`A analisar (${i + 1}/${validFiles.length}): ${file.name}`);
      setProcessedCount(i + 1);

      try {
        // 1. Extração de texto client-side
        const docExtraido = await extrairTextoDeFicheiro(file);

        // 2. Análise determinística sem IA (regras e padrões judiciais)
        const parsed = analisarDecisaoJudicial(docExtraido.text, file.name);

        if (parsed.isElegivel) {
          const seqId = `VD-${String(seqCounter).padStart(3, '0')}`;
          
          const novaDecisao: DecisaoJudicialVD = {
            id: seqId,
            seqId: seqId,
            seqNumber: seqCounter,
            nomeFicheiro: file.name,
            tamanhoFicheiro: file.size,
            tipoFicheiro: docExtraido.fileType,
            dataProcessamento: new Date().toISOString(),
            isElegivel: true,
            motivoElegibilidade: parsed.motivoElegibilidade,
            tipoCrimeDetectado: parsed.tipoCrimeDetectado,
            tipoRelacao: parsed.tipoRelacao,
            relacaoAgressorVitima: parsed.relacaoAgressorVitima,
            coabitacao: parsed.coabitacao,
            coabitacaoTexto: parsed.coabitacaoTexto,
            regimeResidencia: parsed.regimeResidencia,
            titularidadeCasaPropria: parsed.titularidadeCasaPropria,
            detalhesResidencia: parsed.detalhesResidencia,
            tribunal: parsed.tribunal,
            dataDecisao: parsed.dataDecisao,
            crime: parsed.crime,
            artigosLegais: parsed.artigosLegais,
            arguido: parsed.arguido,
            ofendido: parsed.ofendido,
            penaAplicada: parsed.penaAplicada,
            tipoPena: parsed.tipoPena,
            duracaoPenaMeses: parsed.duracaoPenaMeses,
            penasAcessorias: parsed.penasAcessorias,
            indemnizacaoCivel: parsed.indemnizacaoCivel,
            reincidencia: parsed.reincidencia,
            reincidenciaDetalhe: parsed.reincidenciaDetalhe,
            vitimasMenores18: parsed.vitimasMenores18,
            vitimasMenoresDetalhe: parsed.vitimasMenoresDetalhe,
            ofensas: parsed.ofensas,
            pericias: parsed.pericias,
            trechosDecisao: parsed.trechosDecisao,
            statusValidacao: 'pendente_revisao',
            sincronizadoFirebase: true
          };

          // Criar correspondência protegida para a Área do Administrador
          const novoMapping: ProcessoCorrespondencia = {
            id: `map_${seqId}`,
            seqId: seqId,
            seqNumber: seqCounter,
            numeroProcessoReal: parsed.numeroProcessoReal,
            tribunal: parsed.tribunal,
            nomeFicheiro: file.name,
            dataAtribuicao: new Date().toISOString(),
          };

          // Guardar no Firebase Firestore e cache
          await salvarDecisaoFirestore(novaDecisao);
          await salvarMapeamentoAdminFirestore(novoMapping);

          novasDecisoes.push(novaDecisao);
          novosMapeamentos.push(novoMapping);

          novosResultados.push({
            nomeFicheiro: file.name,
            tipoFicheiro: docExtraido.fileType,
            tamanho: file.size,
            sucesso: true,
            elegivel: true,
            ignorado: false,
            numeroProcessoOriginal: parsed.numeroProcessoReal,
            decisao: novaDecisao,
            correspondencia: novoMapping,
            textoOriginal: docExtraido.text
          });

          seqCounter++;
        } else {
          // A decisão não versa sobre crimes de violência doméstica e homicídio em contexto de VD: a app ignora-a
          novosResultados.push({
            nomeFicheiro: file.name,
            tipoFicheiro: docExtraido.fileType,
            tamanho: file.size,
            sucesso: true,
            elegivel: false,
            ignorado: true,
            motivoNaoElegivel: parsed.motivoElegibilidade,
            numeroProcessoOriginal: parsed.numeroProcessoReal,
            textoOriginal: docExtraido.text
          });
        }
      } catch (err: any) {
        novosResultados.push({
          nomeFicheiro: file.name,
          tipoFicheiro: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
          tamanho: file.size,
          sucesso: false,
          erro: err?.message || 'Erro ao processar documento',
          elegivel: false
        });
      }
    }

    setResultados(prev => [...novosResultados, ...prev]);
    setIsProcessing(false);
    setProgressMsg('');

    if (novasDecisoes.length > 0) {
      onProcessamentoConcluido(novasDecisoes, novosMapeamentos);
    }
  };

  // Carregar casos de exemplo incluídos na app para teste imediato
  const carregarCasosExemplo = async () => {
    setIsProcessing(true);
    setProgressMsg('A carregar casos judiciais de exemplo...');
    
    const sampleFiles = CASOS_EXEMPLO.map(caso => {
      const blob = new Blob([caso.conteudo], { type: 'text/plain' });
      return new File([blob], caso.nome, { type: 'text/plain' });
    });

    await processarListaDeFicheiros(sampleFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processarListaDeFicheiros(Array.from(e.dataTransfer.files));
    }
  };

  const elegiveisCount = resultados.filter(r => r.elegivel).length;
  const descartadosCount = resultados.filter(r => !r.elegivel && r.sucesso).length;

  return (
    <div className="space-y-6">
      {/* Privacy Notice Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex items-start gap-4">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 shrink-0 mt-0.5">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-emerald-950">
            Conformidade Rigorosa: Processamento Local & Sem Inteligência Artificial
          </h2>
          <p className="text-sm text-emerald-800 leading-relaxed">
            Nenhum ficheiro é transmitido para a internet ou modelos de IA externos. Os documentos Word e PDF são lidos inteiramente na memória do seu navegador. O número de processo é automaticamente removido de todos os formulários públicos e substituído por um <strong>código sequencial</strong> (ex: <span className="font-mono font-bold">VD-001</span>), ficando a correspondência estritamente guardada na <strong>Área do Administrador</strong>.
          </p>
        </div>
      </div>

      {/* Main Upload Dropzone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005]' 
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50 shadow-xs'
        }`}
      >
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shadow-xs">
            <FolderUp className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Indique a Pasta com as Decisões Judiciais
            </h3>
            <p className="text-sm text-slate-500 mt-1.5">
              Selecione uma pasta inteira do computador ou arraste múltiplos ficheiros Word (<strong>.docx</strong>), PDF (<strong>.pdf</strong>) ou <strong>.txt</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Folder selection with HTML5 webkitdirectory */}
            <input
              type="file"
              ref={folderInputRef}
              // @ts-ignore - directory support
              webkitdirectory=""
              directory=""
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  processarListaDeFicheiros(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />

            {/* Individual files selection */}
            <input
              type="file"
              ref={filesInputRef}
              accept=".pdf,.docx,.doc,.txt"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  processarListaDeFicheiros(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />

            <button
              id="btn-select-folder"
              disabled={isProcessing}
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-900 text-white font-medium text-sm hover:bg-indigo-800 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FolderUp className="w-4 h-4 text-amber-300" />
              <span>Selecionar Pasta do PC</span>
            </button>

            <button
              id="btn-select-files"
              disabled={isProcessing}
              onClick={() => filesInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Files className="w-4 h-4 text-slate-500" />
              <span>Selecionar Ficheiros</span>
            </button>

            <button
              id="btn-sample-cases"
              disabled={isProcessing}
              onClick={carregarCasosExemplo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium text-sm hover:bg-amber-100/70 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Carrega 3 decisões reais de tribunais portugueses para demonstrar o filtro automático de VD e extração"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Testar com Casos de Exemplo</span>
            </button>
          </div>

          {/* Supported formats & filter criteria */}
          <div className="text-xs text-slate-400 pt-3 flex flex-wrap items-center justify-center gap-4">
            <span>✓ Ficheiros suportados: .pdf, .docx, .txt</span>
            <span>•</span>
            <span>✓ Filtro: Violência Doméstica (art. 152.º) ou Homicídio em contexto de VD</span>
            <span>•</span>
            <span>✓ Anonimização sequencial automática</span>
          </div>
        </div>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-indigo-950 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-700" />
              <span>{progressMsg}</span>
            </div>
            <span className="text-slate-500 font-mono text-xs">
              {processedCount} de {totalFiles} ficheiros
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-indigo-700 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${totalFiles > 0 ? (processedCount / totalFiles) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500">
            A ler estrutura do texto, a verificar artigos do Código Penal e a extrair partes processuais, antecedentes, penas e perícias...
          </p>
        </div>
      )}

      {/* Results & History Table */}
      {resultados.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registo de Processamento de Decisões
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {resultados.length} ficheiros analisados pelo motor determinístico
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {elegiveisCount} Elegíveis (VD / Homicídio)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                <Info className="w-3.5 h-3.5" />
                {descartadosCount} Ignoradas (Fora do Âmbito de VD)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Ficheiro</th>
                  <th className="px-4 py-3">Formulário Atribuído</th>
                  <th className="px-4 py-3">Âmbito / Elegibilidade</th>
                  <th className="px-4 py-3">Tribunal Extraído</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {resultados.map((res, index) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs" title={res.nomeFicheiro}>
                          {res.nomeFicheiro}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      {res.elegivel && res.decisao ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs">
                          {res.decisao.seqId}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {res.elegivel ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {res.decisao?.tipoCrimeDetectado === 'homicidio_contexto_vd' 
                            ? 'Homicídio em Contexto de VD' 
                            : 'Violência Doméstica (Art. 152.º)'}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs block max-w-sm truncate" title={res.motivoNaoElegivel}>
                          Não elegível: {res.motivoNaoElegivel || 'Fora do âmbito legal'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700">
                      {res.decisao?.tribunal || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {res.elegivel && res.decisao ? (
                        <button
                          onClick={() => onVerFormulario(res.decisao!)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Formulário</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Descartado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
