import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  KeyRound, 
  Search, 
  Download, 
  FileKey, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Building2,
  FileSpreadsheet,
  Eye,
  Key,
  Trash2
} from 'lucide-react';
import type { ProcessoCorrespondencia, DecisaoJudicialVD } from '../types/judicial';

interface AdminMappingAreaProps {
  mapeamentos: ProcessoCorrespondencia[];
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  onVerFormularioPorSeqId?: (seqId: string) => void;
  onLimparBaseDeDados?: () => void;
}

export const AdminMappingArea: React.FC<AdminMappingAreaProps> = ({
  mapeamentos,
  isAdminUnlocked,
  setIsAdminUnlocked,
  onVerFormularioPorSeqId,
  onLimparBaseDeDados
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('vd_form_admin_pin') || 'admin123';
  });
  const [showAlterarPin, setShowAlterarPin] = useState(false);
  const [novoPin, setNovoPin] = useState('');
  const [pinAlteradoMsg, setPinAlteradoMsg] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminPin) {
      setIsAdminUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Código de acesso de administrador incorreto. Acesso restrito.');
    }
  };

  const handleLock = () => {
    setIsAdminUnlocked(false);
    setShowAlterarPin(false);
  };

  const handleSalvarNovoPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoPin.trim().length < 4) {
      alert('O código PIN deve ter no mínimo 4 caracteres.');
      return;
    }
    setAdminPin(novoPin.trim());
    localStorage.setItem('vd_form_admin_pin', novoPin.trim());
    setNovoPin('');
    setShowAlterarPin(false);
    setPinAlteradoMsg('Código de administrador atualizado com sucesso.');
    setTimeout(() => setPinAlteradoMsg(''), 4000);
  };

  const filteredMapeamentos = mapeamentos.filter(m => 
    m.seqId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.numeroProcessoReal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.tribunal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nomeFicheiro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportarTabelaCorrespondenciaCSV = () => {
    if (mapeamentos.length === 0) return;

    const headers = [
      'Identificador Sequencial',
      'Numero Processo Judicial Real',
      'Tribunal',
      'Nome Ficheiro Original',
      'Data de Atribuicao'
    ];

    const rows = mapeamentos.map(m => [
      `"${m.seqId}"`,
      `"${m.numeroProcessoReal.replace(/"/g, '""')}"`,
      `"${m.tribunal.replace(/"/g, '""')}"`,
      `"${m.nomeFicheiro.replace(/"/g, '""')}"`,
      `"${m.dataAtribuicao}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tabela_correspondencia_confidencial_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Se o utilizador ainda não desbloqueou com o PIN
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white border border-amber-300/80 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 text-center">
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Área Restrita do Administrador
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tabela de correspondência confidencial entre o <strong>número do processo</strong> e o <strong>número sequencial</strong> atribuído a cada decisão.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Acesso exclusivo ao administrador do estudo</span>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Código de Acesso / Palavra-Passe:
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Introduza a palavra-passe..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
              {pinError && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-700 text-white font-medium text-sm hover:bg-amber-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Desbloquear Tabela de Correspondência</span>
            </button>
          </form>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-left">
            <span className="font-semibold text-slate-700 block mb-0.5">Credencial Inicial predefinida:</span>
            <span>Palavra-passe: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-900 font-bold">admin123</code> (pode ser alterada após o desbloqueio).</span>
          </div>

        </div>
      </div>
    );
  }

  // Se estiver DESBLOQUEADO
  return (
    <div className="space-y-6">
      {/* Admin Header with Lock Action */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900 text-xs font-bold font-mono">
              CONFIDENCIAL
            </span>
            <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Sessão de Administrador Ativa
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Tabela Mestra de Desanonimização & Correspondência
          </h2>
          <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
            Esta lista estabelece a correspondência inequívoca entre o <strong>número sequencial (ex: VD-001)</strong> utilizado em cada formulário e o <strong>número de processo judicial real</strong>. Guarde esta informação sob estrito segredo de justiça.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlterarPin(!showAlterarPin)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span>Alterar Senha</span>
          </button>

          <button
            onClick={exportarTabelaCorrespondenciaCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-900 text-white text-xs font-medium hover:bg-indigo-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Exportar Correspondência (CSV)</span>
          </button>

          {onLimparBaseDeDados && (
            <button
              onClick={onLimparBaseDeDados}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 text-xs font-medium hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
              title="Limpar todos os dados da base de dados e mapeamentos"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Limpar Base de Dados</span>
            </button>
          )}

          <button
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloquear e Sair</span>
          </button>
        </div>
      </div>

      {pinAlteradoMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{pinAlteradoMsg}</span>
        </div>
      )}

      {/* Alterar PIN Modal / Box */}
      {showAlterarPin && (
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-xs max-w-md">
          <h4 className="text-xs font-bold text-slate-900 mb-2">Definir Nova Palavra-Passe de Administrador</h4>
          <form onSubmit={handleSalvarNovoPin} className="flex gap-2">
            <input
              type="password"
              placeholder="Nova senha (min. 4 caracteres)"
              value={novoPin}
              onChange={(e) => setNovoPin(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowAlterarPin(false)}
              className="px-2 py-1.5 text-slate-500 text-xs hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Pesquisar por número de processo real, ID sequencial, tribunal ou ficheiro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="text-xs text-slate-500">
          Total de registos mapeados: <strong className="text-slate-900">{mapeamentos.length}</strong>
        </div>
      </div>

      {/* Mapping Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredMapeamentos.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileKey className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-700">
              Nenhuma correspondência registada até ao momento.
            </p>
            <p className="text-xs text-slate-400">
              Quando processar ficheiros com decisões de violência doméstica, os números dos processos serão automaticamente mapeados aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Número Sequencial (No Formulário)</th>
                  <th className="px-4 py-3 text-amber-900 bg-amber-50/50">Número do Processo Real (Tribunal)</th>
                  <th className="px-4 py-3">Tribunal da Decisão</th>
                  <th className="px-4 py-3">Ficheiro Original</th>
                  <th className="px-4 py-3">Data Registo</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-xs">
                {filteredMapeamentos.map((m) => (
                  <tr key={m.seqId} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-indigo-900">
                      <span className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 inline-block">
                        {m.seqId}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-950 bg-amber-50/30 font-mono text-sm">
                      {m.numeroProcessoReal}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-800 text-xs">
                      {m.tribunal}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-500 text-xs truncate max-w-xs" title={m.nomeFicheiro}>
                      {m.nomeFicheiro}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-400 text-xs">
                      {new Date(m.dataAtribuicao).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      {onVerFormularioPorSeqId && (
                        <button
                          onClick={() => onVerFormularioPorSeqId(m.seqId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 text-xs font-medium transition-colors cursor-pointer"
                          title="Abrir formulário desta decisão"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Abrir Ficha</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
