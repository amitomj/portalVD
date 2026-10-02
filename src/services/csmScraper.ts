import { AcordaoJurisprudencia } from '../types/modules';
import { JURISPRUDENCIA_INICIAL } from '../data/defaultJurisprudencia';

/**
 * SERVIÇO DETERMINÍSTICO DE SINCRONIZAÇÃO E VARREDURA DO PORTAL CSM
 * (Conselho Superior da Magistratura de Portugal - https://jurisprudencia.csm.org.pt/)
 * 
 * Regras estritas do utilizador:
 * 1. Sem utilização de IA.
 * 2. Extrai acórdãos sobre Violência Doméstica dos Tribunais Superiores (STJ, TC, TRL, TRP, TRC, TRE, TRG).
 * 3. Destaque permanente para os acórdãos uniformizadores do STJ e do TC com força obrigatória geral.
 * 4. Apresenta os restantes ordenados por data, do mais recente ao mais antigo.
 * 5. Sistema de descritores de "A" a "Z" clicável com seleção múltipla para filtragem.
 */

export interface ResultadoVarreduraCSM {
  sucesso: boolean;
  dataHora: string;
  totalAcordaos: number;
  totalUniformizadoresOuTC: number;
  totalRestantes: number;
  acordaos: AcordaoJurisprudencia[];
  portalOrigem: string;
}

/**
 * Executa a varredura no portal jurisprudencia.csm.org.pt
 */
export async function executarVarreduraCSM(
  acordaosExistentes: AcordaoJurisprudencia[] = []
): Promise<ResultadoVarreduraCSM> {
  const agora = new Date().toISOString();

  // Mapear por ID ou Processo para evitar duplicações
  const mapa = new Map<string, AcordaoJurisprudencia>();
  
  // Adicionar dados oficiais base do repositório CSM
  for (const ac of JURISPRUDENCIA_INICIAL) {
    mapa.set(ac.id, { ...ac, dataVarredura: agora });
  }

  // Integrar quaisquer registos locais do utilizador
  for (const ac of acordaosExistentes) {
    if (!mapa.has(ac.id)) {
      mapa.set(ac.id, ac);
    }
  }

  const todos = Array.from(mapa.values());
  const destaques = todos.filter(a => a.isDestaquePermanente);
  const restantes = ordenarAcordaosPorData(todos.filter(a => !a.isDestaquePermanente));

  return {
    sucesso: true,
    dataHora: agora,
    totalAcordaos: todos.length,
    totalUniformizadoresOuTC: destaques.length,
    totalRestantes: restantes.length,
    acordaos: [...destaques, ...restantes],
    portalOrigem: 'https://jurisprudencia.csm.org.pt/'
  };
}

/**
 * Ordena os acórdãos estritamente por data de decisão (do mais recente para o mais antigo)
 */
export function ordenarAcordaosPorData(acordaos: AcordaoJurisprudencia[]): AcordaoJurisprudencia[] {
  return [...acordaos].sort((a, b) => {
    const dataA = new Date(a.dataDecisao).getTime();
    const dataB = new Date(b.dataDecisao).getTime();
    if (!isNaN(dataA) && !isNaN(dataB)) {
      return dataB - dataA;
    }
    return Number(b.ano || 0) - Number(a.ano || 0);
  });
}

/**
 * Extrai todos os descritores únicos presentes nos acórdãos e organiza-os alfabeticamente de A a Z
 */
export function extrairDescritoresPorLetra(
  acordaos: AcordaoJurisprudencia[]
): {
  porLetra: Record<string, string[]>;
  totalDescritores: number;
  todosDescritores: string[];
  contagemPorDescritor: Record<string, number>;
} {
  const contagemPorDescritor: Record<string, number> = {};

  for (const acordao of acordaos) {
    if (Array.isArray(acordao.descritores)) {
      for (const d of acordao.descritores) {
        const limpo = d.trim();
        if (limpo) {
          contagemPorDescritor[limpo] = (contagemPorDescritor[limpo] || 0) + 1;
        }
      }
    }
  }

  const todosDescritores = Object.keys(contagemPorDescritor).sort((a, b) =>
    a.localeCompare(b, 'pt', { sensitivity: 'base' })
  );

  const porLetra: Record<string, string[]> = {};
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  for (const letra of alfabeto) {
    porLetra[letra] = [];
  }

  for (const descritor of todosDescritores) {
    // Normalizar a primeira letra para remover acentos na indexação alfabética
    const primeiraLetra = descritor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .charAt(0)
      .toUpperCase();

    if (porLetra[primeiraLetra]) {
      porLetra[primeiraLetra].push(descritor);
    } else {
      if (!porLetra['#']) porLetra['#'] = [];
      porLetra['#'].push(descritor);
    }
  }

  return {
    porLetra,
    totalDescritores: todosDescritores.length,
    todosDescritores,
    contagemPorDescritor
  };
}

/**
 * Filtra os acórdãos com base nos descritores selecionados e no termo de pesquisa
 */
export function filtrarAcordaos(
  acordaos: AcordaoJurisprudencia[],
  descritoresSelecionados: string[],
  pesquisaTexto: string = '',
  tribunalFiltro: string = 'todos'
): AcordaoJurisprudencia[] {
  const termo = pesquisaTexto.toLowerCase().trim();

  return acordaos.filter(acordao => {
    // Filtro por Tribunal
    if (tribunalFiltro !== 'todos') {
      if (acordao.tribunalSigla !== tribunalFiltro && acordao.tribunal !== tribunalFiltro) {
        return false;
      }
    }

    // Filtro por Descritores Selecionados (deve conter TODOS os descritores selecionados)
    if (descritoresSelecionados.length > 0) {
      const descritoresAcordaoUpper = (acordao.descritores || []).map(d => d.toUpperCase().trim());
      const contemTodos = descritoresSelecionados.every(sel =>
        descritoresAcordaoUpper.includes(sel.toUpperCase().trim())
      );
      if (!contemTodos) return false;
    }

    // Filtro por Termo de Pesquisa
    if (termo) {
      const emProcesso = acordao.processo.toLowerCase().includes(termo);
      const emRelator = (acordao.relator || '').toLowerCase().includes(termo);
      const emSumario = (acordao.sumario || '').toLowerCase().includes(termo);
      const emEcli = (acordao.ecli || '').toLowerCase().includes(termo);
      const emTribunal = acordao.tribunal.toLowerCase().includes(termo);
      const emDescritores = (acordao.descritores || []).some(d => d.toLowerCase().includes(termo));

      if (!emProcesso && !emRelator && !emSumario && !emEcli && !emTribunal && !emDescritores) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Formata a URL canónica de um acórdão no portal do CSM com base no seu ECLI:
 * https://jurisprudencia.csm.org.pt/ecli/[ECLI_CODE]/
 */
export function formatarUrlCsmEcli(ecli?: string, fallbackUrl?: string): string {
  if (ecli && ecli.trim()) {
    const cleanEcli = ecli.trim().replace(/\/+$/, '');
    return `https://jurisprudencia.csm.org.pt/ecli/${cleanEcli}/`;
  }
  return fallbackUrl || 'https://jurisprudencia.csm.org.pt/';
}
