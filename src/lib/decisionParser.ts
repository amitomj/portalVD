import type { 
  DecisaoJudicialVD, 
  PessoaIdentificacao, 
  TiposOfensas, 
  PericiasInfo, 
  Sexo,
  TipoRelacao,
  RegimeResidencia,
  TitularidadeCasaPropria,
  TipoPericia,
  AnaliseDetalhadaVD
} from '../types/judicial';
import { 
  limparCabecalhosERodapesPreservandoNotas, 
  anonimizarTextoJudicial, 
  extrairNotasDocumento,
  extrairTodosNomesPessoas 
} from './anonymizer';

export interface ParseResult {
  isElegivel: boolean;
  motivoElegibilidade: string;
  tipoCrimeDetectado: 'violencia_domestica' | 'homicidio_contexto_vd' | 'ambos' | 'outro';
  tipoRelacao: TipoRelacao;
  relacaoAgressorVitima: string;
  coabitacao: boolean | null;
  coabitacaoTexto: string;
  regimeResidencia: RegimeResidencia;
  titularidadeCasaPropria: TitularidadeCasaPropria;
  detalhesResidencia: string;
  numeroProcessoReal: string;
  tribunal: string;
  dataDecisao: string;
  crime: string;
  artigosLegais: string[];
  arguido: PessoaIdentificacao;
  ofendido: PessoaIdentificacao;
  penaAplicada: string;
  tipoPena: 'prisao_efetiva' | 'prisao_suspensa' | 'multa' | 'absolvicao' | 'trabalho_comunitario' | 'outro';
  duracaoPenaMeses: number | null;
  penasAcessorias: string;
  indemnizacaoCivel: string;
  reincidencia: boolean;
  reincidenciaDetalhe: string;
  vitimasMenores18: boolean;
  vitimasMenoresDetalhe: string;
  ofensas: TiposOfensas;
  pericias: PericiasInfo;
  analiseDetalhada?: AnaliseDetalhadaVD;
  trechosDecisao: {
    identificacao?: string;
    crime?: string;
    penas?: string;
    reincidencia?: string;
    menores?: string;
    pericias?: string;
    residencia?: string;
    relatorioInicial?: string;
    factosProvados?: string;
    dispositivoDecisorio?: string;
    textoIntegralAnonimizado?: string;
    totalAnonimizacoes?: number;
    notasRodapePreservadas?: string;
  };
}

export interface SegmentosDecisao {
  relatorioInicial: string;
  factosProvados: string;
  dispositivoDecisorio: string;
  textoIntegral: string;
}

/**
 * Segmenta a decisão judicial nos seus três blocos processuais fundamentais (Art. 374.º do CPP):
 * 1. Relatório Inicial (onde se identificam arguido(s) e vítima(s) / acusação);
 * 2. Lista de Factos Provados (onde o tribunal fixa a matéria de facto provada);
 * 3. Segmento Final Decisório / Dispositivo (onde se fixa a condenação ou absolvição, penas e data).
 */
export function extrairSegmentosJudiciais(texto: string): SegmentosDecisao {
  const clean = texto.replace(/\r\n/g, '\n');

  // Padrões de início da secção de FACTOS PROVADOS
  const regexInicioFactosProvados = /(?:(?:^|\n)\s*(?:(?:I|II|III|IV|V|\b)\.?\s*)?(?:II\s*[-–.]\s*Fundamenta[çc][ãa]o|Fundamenta[çc][ãa]o(?:\s+de\s+facto)?|Factos\s+provados|Factos\s+assentes|Mat[ée]ria\s+de\s+facto\s+provada|Dos\s+factos\s+provados|Discutida\s+a\s+causa[^\n]*provad[oa]s|Produzida\s+a\s+prova[^\n]*provad[oa]s|1\.\s*Factos\s+provados|A\)\s*Factos\s+provados|Da\s+audiência\s+de\s+julgamento\s+resultaram\s+provados)\s*:?)/i;

  // Padrões de término da secção de FACTOS PROVADOS
  const regexFimFactosProvados = /(?:(?:^|\n)\s*(?:(?:I|II|III|IV|V|\b)\.?\s*)?(?:Factos\s+n[ãa]o\s+provados|Mat[ée]ria\s+de\s+facto\s+n[ãa]o\s+provada|Motiva[çc][ãa]o\s+da\s+(?:mat[ée]ria\s+de\s+facto|convi(?:cção|cao))|Enquadramento\s+jur[íi]dico|Subsun[çc][ãa]o\s+jur[íi]dica|Do\s+Direito|III\s*[-–.]\s*Decis[ãa]o|Dispositivo|Decis[ãa]o\s*:?))/i;

  // Padrões de início do SEGMENTO FINAL DECISÓRIO (DISPOSITIVO)
  const regexInicioDispositivo = /(?:(?:^|\n)\s*(?:(?:III|IV|V|VI|\b)\.?\s*)?(?:Dispositivo|Decis[ãa]o\s*:?|Decis[ãa]o\s+Final|III\s*[-–.]\s*Decis[ãa]o|Pelo\s+exposto[^\n]*(?:decide|julga)|Em\s+face\s+do\s+exposto[^\n]*(?:decide|julga)|Nestes\s+termos[^\n]*(?:decide|julga)|Face\s+ao\s+exposto[^\n]*(?:decide|julga)|Por\s+todo\s+o\s+exposto[^\n]*(?:decide|julga))\s*:?)/i;

  let indexInicioFactos = -1;
  const matchInicioFactos = clean.match(regexInicioFactosProvados);
  if (matchInicioFactos && matchInicioFactos.index !== undefined) {
    indexInicioFactos = matchInicioFactos.index;
  }

  // Identificar início do Dispositivo
  let indexDispositivo = -1;
  const matchDispositivo = clean.match(regexInicioDispositivo);
  if (matchDispositivo && matchDispositivo.index !== undefined) {
    indexDispositivo = matchDispositivo.index;
  }

  // 1. Relatório Inicial: do início do documento até aos Factos Provados (Texto Completo)
  let relatorioInicial = '';
  if (indexInicioFactos > 0) {
    relatorioInicial = clean.slice(0, indexInicioFactos).trim();
  } else {
    relatorioInicial = clean.trim();
  }

  // 2. Factos Provados: do início dos factos provados até ao término dos factos ou dispositivo (Texto Completo)
  let factosProvados = '';
  if (indexInicioFactos >= 0) {
    const textoAposInicioFactos = clean.slice(indexInicioFactos);
    const subParaFim = textoAposInicioFactos.slice(150);
    const matchFimFactos = subParaFim.match(regexFimFactosProvados);
    if (matchFimFactos && matchFimFactos.index !== undefined) {
      factosProvados = textoAposInicioFactos.slice(0, 150 + matchFimFactos.index).trim();
    } else if (indexDispositivo > indexInicioFactos) {
      factosProvados = clean.slice(indexInicioFactos, indexDispositivo).trim();
    } else {
      factosProvados = textoAposInicioFactos.trim();
    }
  }

  // 3. Segmento Final Decisório (Dispositivo): do início do dispositivo até ao fim da decisão (Texto Completo)
  let dispositivoDecisorio = '';
  if (indexDispositivo >= 0) {
    dispositivoDecisorio = clean.slice(indexDispositivo).trim();
  } else {
    dispositivoDecisorio = clean.length > 4000 ? clean.slice(-4000).trim() : clean.trim();
  }

  return {
    relatorioInicial,
    factosProvados,
    dispositivoDecisorio,
    textoIntegral: clean
  };
}

/**
 * Analisador determinístico baseado em regras estritas e padrões de decisões judiciais portuguesas.
 * NÃO utiliza IA e corre 100% no cliente.
 * 
 * Cumpre escrupulosamente a diretiva judicial:
 * - Dá PREFERÊNCIA à Lista de Factos Provados para determinação dos factos (ofensas, residência, menores, perícias);
 * - Dá PREFERÊNCIA ao Segmento Final Decisório para fixar condenação ou absolvição, penas e data;
 * - Dá PREFERÊNCIA ao Relatório Inicial para identificar o(s) arguido(s) e a(s) vítima(s);
 * - Anonimiza integralmente nomes, moradas, contactos, NIFs e dados pessoais com borrão preto ('█');
 * - Preserva integralmente o texto e todas as notas de rodapé e notas de fim de documento.
 */
export function analisarDecisaoJudicial(texto: string, nomeFicheiro: string): ParseResult {
  // Limpeza: remove cabeçalhos e rodapés de paginação repetitivos, preservando notas de rodapé e notas finais
  const cleanText = limparCabecalhosERodapesPreservandoNotas(texto);
  const lower = cleanText.toLowerCase();

  // Segmentação canónica nos 3 pilares estruturais da decisão judicial (Art. 374.º do CPP)
  const segmentos = extrairSegmentosJudiciais(cleanText);

  // Extração de notas de rodapé e de fim de documento para exibição estruturada
  const notasDetetadas = extrairNotasDocumento(cleanText);
  const notasRodapePreservadas = notasDetetadas.join('\n\n');

  // 1. Extração do Número do Processo Original
  const numeroProcessoReal = extrairNumeroProcesso(cleanText, nomeFicheiro);

  // 2. Extração do Tribunal
  const tribunal = extrairTribunal(cleanText);

  // 3. Extração da Data da Decisão (Preferência ao Segmento Final Decisório)
  const dataDecisao = extrairDataDecisaoFinal(segmentos.dispositivoDecisorio, cleanText);

  // 4. Verificação Rigorosa de Relação e Elegibilidade (Violência Doméstica ou Homicídio em Contexto de VD)
  const { 
    isElegivel, 
    motivoElegibilidade, 
    tipoCrimeDetectado, 
    tipoRelacao,
    relacaoAgressorVitima, 
    artigosLegais, 
    crimeNome 
  } = verificarElegibilidadeERelacao(cleanText, lower, segmentos.factosProvados, segmentos.relatorioInicial);

  // 5. Coabitação e Habitação (Preferência aos FACTOS PROVADOS)
  const {
    coabitacao,
    coabitacaoTexto,
    regimeResidencia,
    titularidadeCasaPropria,
    detalhesResidencia,
    trechoResidencia
  } = extrairResidenciaECoabitacao(segmentos.factosProvados, segmentos.relatorioInicial, cleanText, lower);

  // 6. Extração de Arguido e Ofendido (Preferência ao RELATÓRIO INICIAL e factos pessoais provados)
  const { arguido, ofendido, trechoIdentificacao } = extrairPessoas(
    segmentos.relatorioInicial, 
    segmentos.factosProvados, 
    cleanText, 
    lower
  );

  // 7. Extração da Pena e Consequências (Preferência ao SEGMENTO FINAL DECISÓRIO)
  const { penaAplicada, tipoPena, duracaoPenaMeses, penasAcessorias, indemnizacaoCivel, trechoPenas } = 
    extrairPenas(segmentos.dispositivoDecisorio, cleanText, lower);

  // 8. Extração de Reincidência (Preferência ao Dispositivo e Factos Provados)
  const { reincidencia, reincidenciaDetalhe, trechoReincidencia } = 
    extrairReincidencia(segmentos.factosProvados, segmentos.dispositivoDecisorio, cleanText, lower);

  // 9. Extração de Vítimas Menores de 18 anos (Preferência aos FACTOS PROVADOS)
  const { vitimasMenores18, vitimasMenoresDetalhe, trechoMenores } = 
    extrairVitimasMenores(segmentos.factosProvados, cleanText, lower);

  // 10. Extração dos Tipos de Ofensas (Preferência estrita aos FACTOS PROVADOS)
  const ofensas = extrairTiposOfensas(segmentos.factosProvados, cleanText, lower);

  // 11. Extração de Perícias (Preferência aos FACTOS PROVADOS)
  const { pericias, trechoPericias } = extrairPericias(segmentos.factosProvados, cleanText, lower);

  // Identificar nomes conhecidos de todo o documento para reforçar a anonimização profunda em todos os segmentos
  const nomesConhecidos = extrairTodosNomesPessoas(cleanText);

  // ANONIMIZAÇÃO COMPLETA COM BORRÃO PRETO (Art. 374.º CPP e Proteção de Dados Pessoais)
  const anonIntegral = anonimizarTextoJudicial(cleanText, nomesConhecidos);
  const anonRelatorio = anonimizarTextoJudicial(segmentos.relatorioInicial, nomesConhecidos);
  const anonFactos = anonimizarTextoJudicial(segmentos.factosProvados, nomesConhecidos);
  const anonDispositivo = anonimizarTextoJudicial(segmentos.dispositivoDecisorio, nomesConhecidos);
  const anonIdentificacao = anonimizarTextoJudicial(trechoIdentificacao, nomesConhecidos);
  const anonPenas = anonimizarTextoJudicial(trechoPenas, nomesConhecidos);
  const anonResidencia = anonimizarTextoJudicial(trechoResidencia, nomesConhecidos);

  const parsedParcial = {
    numeroProcessoReal,
    tipoPena,
    artigosLegais,
    ofensas,
    reincidencia,
    indemnizacaoCivel,
    tribunal,
    coabitacao,
    arguido,
    ofendido
  };

  return {
    isElegivel,
    motivoElegibilidade,
    tipoCrimeDetectado,
    tipoRelacao,
    relacaoAgressorVitima,
    coabitacao,
    coabitacaoTexto,
    regimeResidencia,
    titularidadeCasaPropria,
    detalhesResidencia,
    numeroProcessoReal,
    tribunal,
    dataDecisao,
    crime: crimeNome,
    artigosLegais,
    arguido,
    ofendido,
    penaAplicada,
    tipoPena,
    duracaoPenaMeses,
    penasAcessorias,
    indemnizacaoCivel,
    reincidencia,
    reincidenciaDetalhe,
    vitimasMenores18,
    vitimasMenoresDetalhe,
    ofensas,
    pericias,
    analiseDetalhada: criarAnaliseDetalhadaPadrao(cleanText, parsedParcial),
    trechosDecisao: {
      identificacao: anonIdentificacao.textoAnonimizado,
      crime: crimeNome,
      penas: anonPenas.textoAnonimizado,
      reincidencia: trechoReincidencia,
      menores: trechoMenores,
      pericias: trechoPericias,
      residencia: anonResidencia.textoAnonimizado,
      relatorioInicial: anonRelatorio.textoAnonimizado,
      factosProvados: anonFactos.textoAnonimizado,
      dispositivoDecisorio: anonDispositivo.textoAnonimizado,
      textoIntegralAnonimizado: anonIntegral.textoAnonimizado,
      totalAnonimizacoes: anonIntegral.totalAnonimizacoes,
      notasRodapePreservadas
    }
  };
}

// -------------------------------------------------------------
// EXTRAÇÃO DE DATA DA DECISÃO JUDICIAL (PARTE FINAL DA DECISÃO)
// -------------------------------------------------------------

function extrairDataDecisaoFinal(dispositivo: string, textoIntegral: string): string {
  // A data da decisão judicial consta, em regra, do fecho do dispositivo decisório
  const fonte = dispositivo.length > 50 ? dispositivo : (textoIntegral.length > 3000 ? textoIntegral.slice(-3000) : textoIntegral);
  
  // Padrão 1: "Lisboa, 15 de Novembro de 2023", "Porto, 2 de Maio de 2022"
  const regexDataExtensoFinal = /(?:[A-Za-zÀ-ÿ\s]+,\s*)?(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(20\d{2}|19\d{2})/gi;
  const matchesExtenso = Array.from(fonte.matchAll(regexDataExtensoFinal));
  
  if (matchesExtenso.length > 0) {
    const lastMatch = matchesExtenso[matchesExtenso.length - 1];
    return `${lastMatch[1]} de ${lastMatch[2]} de ${lastMatch[3]}`;
  }

  // Padrão 2: Formato numérico no final: "15/11/2023" ou "2023-11-15"
  const regexNumericaFinal = /\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](20\d{2})\b/g;
  const matchesNumerica = Array.from(fonte.matchAll(regexNumericaFinal));
  if (matchesNumerica.length > 0) {
    const lastMatch = matchesNumerica[matchesNumerica.length - 1];
    return `${lastMatch[1]}/${lastMatch[2]}/${lastMatch[3]}`;
  }

  // Fallback caso não encontre no fecho
  const matchGlobal = textoIntegral.match(/(?:[A-Za-zÀ-ÿ]+,\s*)?(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(20\d{2})/i);
  if (matchGlobal) {
    return `${matchGlobal[1]} de ${matchGlobal[2]} de ${matchGlobal[3]}`;
  }

  return '';
}

// -------------------------------------------------------------
// CLASSIFICAÇÃO RIGOROSA DE RELAÇÃO E ELEGIBILIDADE
// -------------------------------------------------------------

function verificarElegibilidadeERelacao(
  textoIntegral: string, 
  lower: string,
  factosProvados: string,
  relatorioInicial: string
) {
  const temViolenciaDomestica = 
    /violência doméstica/i.test(lower) || 
    /art(?:igo|\.)?\s*152(?:\.º|º)?/i.test(lower) ||
    /crime de maus-tratos/i.test(lower);

  const temHomicidio = 
    /homic[íi]dio/i.test(lower) || 
    /art(?:igo|\.)?\s*131(?:\.º|º)?/i.test(lower) || 
    /art(?:igo|\.)?\s*132(?:\.º|º)?/i.test(lower);

  // Avaliamos o vínculo relacional dando preferência aos FACTOS PROVADOS e ao RELATÓRIO INICIAL
  const textoPrioritario = (factosProvados.length > 100 ? factosProvados.slice(0, 3500) : '') + ' ' + relatorioInicial;
  const lowerPrioritario = textoPrioritario.length > 100 ? textoPrioritario.toLowerCase() : lower;

  // CLASSIFICAÇÃO RIGOROSA:
  // "Unido de facto; Namorado/a; Cônjuge, são realidades diferentes. A app deve ser rigorosa."
  let tipoRelacao: TipoRelacao = 'nao_especificada';
  let relacaoAgressorVitima = '';

  // 1. Ex-cônjuge (divorciados / dissolução do casamento)
  if (/(?:ex-cônjuge|ex-espos[ao]|ex-marido|ex-mulher|divorciados|dissolução do casamento|separados judicialmente)/i.test(lowerPrioritario) ||
      /(?:ex-cônjuge|ex-espos[ao]|ex-marido|ex-mulher|divorciados)/i.test(lower)) {
    tipoRelacao = 'ex_conjuge';
    relacaoAgressorVitima = 'Ex-cônjuge (divórcio ou separação de casamento)';
  }
  // 2. Cônjuge (casamento / casados)
  else if (/(?:cônjuges|casados entre si|relação matrimonial|sociedade conjugal|marido e mulher|esposo|esposa|casamento)/i.test(lowerPrioritario) ||
           /(?:cônjuges|casados entre si|relação matrimonial|sociedade conjugal|marido e mulher)/i.test(lower)) {
    tipoRelacao = 'conjuge';
    relacaoAgressorVitima = 'Cônjuge (casamento válido)';
  }
  // 3. Ex-unido de facto
  else if (/(?:ex-companheir[oa]|cessação da união de facto|anterior união de facto|fim da coabitação em união de facto)/i.test(lowerPrioritario) ||
           /(?:ex-companheir[oa]|cessação da união de facto)/i.test(lower)) {
    tipoRelacao = 'ex_unido_de_facto';
    relacaoAgressorVitima = 'Ex-unido(a) de facto (união de facto dissolvida)';
  }
  // 4. Unido de facto (união de facto em vigor)
  else if (/(?:união de facto|unidos de facto|relação análoga à dos cônjuges|condições análogas às dos cônjuges|companheir[oa]|em economia comum)/i.test(lowerPrioritario) ||
           /(?:união de facto|unidos de facto|relação análoga à dos cônjuges)/i.test(lower)) {
    tipoRelacao = 'unido_de_facto';
    relacaoAgressorVitima = 'Unido(a) de facto (união de facto)';
  }
  // 5. Ex-namorado/a
  else if (/(?:ex-namorad[oa]|fim da relação de namoro|terminaram o namoro|cessação do namoro)/i.test(lowerPrioritario) ||
           /(?:ex-namorad[oa]|terminaram o namoro)/i.test(lower)) {
    tipoRelacao = 'ex_namorado';
    relacaoAgressorVitima = 'Ex-namorado(a) (relação de namoro finda)';
  }
  // 6. Namorado/a
  else if (/(?:namorad[oa]s?|relação de namoro|mantinham uma relação de namoro)/i.test(lowerPrioritario) ||
           /(?:namorad[oa]s?|relação de namoro)/i.test(lower)) {
    tipoRelacao = 'namorado';
    relacaoAgressorVitima = 'Namorado(a) (relação de namoro)';
  }
  // 7. Progenitor/a
  else if (/(?:progenitor|progenitora|\bpai\b|\bmãe\b)/i.test(lowerPrioritario) ||
           /(?:progenitor|progenitora)/i.test(lower)) {
    tipoRelacao = 'progenitor';
    relacaoAgressorVitima = 'Progenitor(a) (Pai / Mãe)';
  }
  // 8. Filho/a
  else if (/(?:\bfilho\b|\bfilha\b|descendente)/i.test(lowerPrioritario) ||
           /(?:\bfilho\b|\bfilha\b)/i.test(lower)) {
    tipoRelacao = 'filho';
    relacaoAgressorVitima = 'Filho(a) (Descendente)';
  }
  // 9. Outro familiar
  else if (/(?:\birmão\b|\birmã\b|\bavô\b|\bavó\b|ascendente|familiar)/i.test(lowerPrioritario) ||
           /(?:\birmão\b|\birmã\b|\bavô\b|\bavó\b)/i.test(lower)) {
    tipoRelacao = 'outro_familiar';
    relacaoAgressorVitima = 'Outro familiar';
  }

  const isRelacaoValida = tipoRelacao !== 'nao_especificada';

  let isElegivel = false;
  let motivoElegibilidade = '';
  let tipoCrimeDetectado: 'violencia_domestica' | 'homicidio_contexto_vd' | 'ambos' | 'outro' = 'outro';
  let crimeNome = '';

  if (temViolenciaDomestica && temHomicidio) {
    isElegivel = true;
    tipoCrimeDetectado = 'ambos';
    motivoElegibilidade = `Violência Doméstica (Art. 152.º) e Homicídio/Tentativa em contexto relacional: ${relacaoAgressorVitima}.`;
    crimeNome = `Violência Doméstica e Homicídio (${relacaoAgressorVitima})`;
  } else if (temViolenciaDomestica) {
    isElegivel = true;
    tipoCrimeDetectado = 'violencia_domestica';
    motivoElegibilidade = `Crime de Violência Doméstica (Art.º 152.º do Código Penal). Relação: ${relacaoAgressorVitima}.`;
    crimeNome = `Violência Doméstica - Art. 152.º CP (${relacaoAgressorVitima})`;
  } else if (temHomicidio && isRelacaoValida) {
    isElegivel = true;
    tipoCrimeDetectado = 'homicidio_contexto_vd';
    motivoElegibilidade = `Crime de Homicídio perpetrado em contexto de relacionamento íntimo ou familiar (${relacaoAgressorVitima}).`;
    crimeNome = `Homicídio em Contexto de Violência Doméstica (${relacaoAgressorVitima})`;
  } else {
    isElegivel = false;
    motivoElegibilidade = 'Não versa sobre crimes de violência doméstica nem homicídio em contexto de violência doméstica.';
    crimeNome = 'Fora do âmbito (Decisão Ignorada)';
  }

  // Artigos legais referidos
  const artigos: string[] = [];
  if (/art(?:igo|\.)?\s*152(?:\.º|º)?/i.test(textoIntegral)) artigos.push('Art.º 152.º CP (Violência Doméstica)');
  if (/art(?:igo|\.)?\s*131(?:\.º|º)?/i.test(textoIntegral)) artigos.push('Art.º 131.º CP (Homicídio)');
  if (/art(?:igo|\.)?\s*132(?:\.º|º)?/i.test(textoIntegral)) artigos.push('Art.º 132.º CP (Homicídio Qualificado)');
  if (/art(?:igo|\.)?\s*154(?:\.º|º)?\s*-?\s*A/i.test(textoIntegral)) artigos.push('Art.º 154.º-A CP (Perseguição)');

  return {
    isElegivel,
    motivoElegibilidade,
    tipoCrimeDetectado,
    tipoRelacao,
    relacaoAgressorVitima,
    artigosLegais: artigos,
    crimeNome
  };
}

// -------------------------------------------------------------
// COABITAÇÃO E REGIME DE RESIDÊNCIA (PREFERÊNCIA FACTOS PROVADOS)
// -------------------------------------------------------------

function extrairResidenciaECoabitacao(
  factosProvados: string, 
  relatorioInicial: string, 
  textoIntegral: string, 
  lower: string
) {
  let coabitacao: boolean | null = null;
  let coabitacaoTexto = '';
  let regimeResidencia: RegimeResidencia = 'nao_especificado';
  let titularidadeCasaPropria: TitularidadeCasaPropria = 'nao_aplicavel';
  let detalhesResidencia = '';
  let trechoResidencia = '';

  // Determinar texto com prioridade: FACTOS PROVADOS primeiro
  const textoAlvo = factosProvados.length > 80 ? factosProvados : (relatorioInicial.length > 80 ? relatorioInicial : textoIntegral);
  const lowerAlvo = textoAlvo.toLowerCase();

  // 1. Verificação de Coabitação
  if (/(?:coabitam|coabitavam|residem no mesmo domicílio|residiam no mesmo domicílio|vivem na mesma residência|viviam na mesma residência|domicílio comum|partilham a mesma habitação|moravam juntos)/i.test(lowerAlvo)) {
    coabitacao = true;
    coabitacaoTexto = 'Sim, vivem na mesma residência (coabitam)';
  } else if (/(?:não coabitam|não coabitavam|residências separadas|habitações distintas|não vivem juntos|não viviam juntos|já não coabitavam)/i.test(lowerAlvo)) {
    coabitacao = false;
    coabitacaoTexto = 'Não vivem na mesma residência (residências separadas)';
  } else if (/(?:coabitam|coabitavam|residem no mesmo domicílio|residiam no mesmo domicílio|vivem na mesma residência|viviam na mesma residência)/i.test(lower)) {
    coabitacao = true;
    coabitacaoTexto = 'Sim, vivem na mesma residência (coabitam)';
  } else if (/(?:não coabitam|não coabitavam|residências separadas|habitações distintas)/i.test(lower)) {
    coabitacao = false;
    coabitacaoTexto = 'Não vivem na mesma residência (residências separadas)';
  }

  // 2. Regime da Residência nos Factos Provados:
  const matchResidenciaContexto = textoAlvo.match(/(?:casa|habitação|residência|domicílio|apartamento|imóvel)([\s\S]{0,250})/i) ||
                                  textoIntegral.match(/(?:casa|habitação|residência|domicílio|apartamento|imóvel)([\s\S]{0,250})/i);
  if (matchResidenciaContexto) {
    trechoResidencia = matchResidenciaContexto[0];
  }

  const fonteRegime = lowerAlvo.length > 50 ? lowerAlvo : lower;

  if (/(?:casa arrendada|habitação arrendada|imóvel arrendado|pagamento de renda|contrato de arrendamento|arrendamento da habitação)/i.test(fonteRegime)) {
    regimeResidencia = 'casa_arrendada';
    detalhesResidencia = 'Casa arrendada';
  } else if (/(?:cedida gratuitamente|cedido a título gratuito|cedência gratuita|cedida pelos pais|cedida pela mãe|cedida pelo pai|comodato)/i.test(fonteRegime)) {
    regimeResidencia = 'casa_cedida_gratuitamente';
    const quemCedeu = textoAlvo.match(/(?:cedid[ao]\s+pel[ao]s?\s+([^\n,\.;]+))/i) || textoIntegral.match(/(?:cedid[ao]\s+pel[ao]s?\s+([^\n,\.;]+))/i);
    detalhesResidencia = quemCedeu ? `Casa cedida gratuitamente (${quemCedeu[1].trim()})` : 'Casa cedida gratuitamente';
  } else if (/(?:casa própria|habitação própria|imóvel próprio|propriedade de|propriedade do casal|adquirida por ambos)/i.test(fonteRegime)) {
    regimeResidencia = 'casa_propria';
    
    // Identificar titular da casa própria:
    if (/(?:propriedade de ambos|adquirida por ambos|bem comum do casal|pertencente a ambos|em compropriedade)/i.test(fonteRegime)) {
      titularidadeCasaPropria = 'ambos';
      detalhesResidencia = 'Casa própria (de ambos os cônjuges/partes)';
    } else if (/(?:propriedade do arguido|bem próprio do arguido|pertencente ao arguido|adquirida pelo arguido|casa do arguido)/i.test(fonteRegime)) {
      titularidadeCasaPropria = 'arguido';
      detalhesResidencia = 'Casa própria (dono: Arguido)';
    } else if (/(?:propriedade da ofendida|bem próprio da ofendida|pertencente à ofendida|adquirida pela ofendida|casa da ofendida)/i.test(fonteRegime)) {
      titularidadeCasaPropria = 'ofendida';
      detalhesResidencia = 'Casa própria (dona: Ofendida)';
    } else {
      titularidadeCasaPropria = 'nao_especificado';
      detalhesResidencia = 'Casa própria';
    }
  } else {
    regimeResidencia = 'nao_especificado';
    detalhesResidencia = '';
  }

  return {
    coabitacao,
    coabitacaoTexto,
    regimeResidencia,
    titularidadeCasaPropria,
    detalhesResidencia,
    trechoResidencia
  };
}

// -------------------------------------------------------------
// EXTRAÇÃO DE ARGUIDO E OFENDIDO (PREFERÊNCIA AO RELATÓRIO INICIAL)
// -------------------------------------------------------------

function extrairPessoas(
  relatorioInicial: string, 
  factosProvados: string, 
  textoIntegral: string, 
  lower: string
) {
  // O relatório inicial é a fonte canónica primordial para a qualificação dos sujeitos processuais (Art. 374.º, n.º 1, a) e b) CPP)
  const fonteInicial = relatorioInicial.length > 80 ? relatorioInicial : textoIntegral.slice(0, 4000);

  const regexSecaoArguido = /(?:Identificação do Arguido|Arguido\s*:?|O Ministério Público deduziu acusação contra:?|Acusação contra:?|O arguido|O réu)([\s\S]{30,1500}?)(?:Ofendid[ao]|Vítima|Assistente|I\.|II\.|Factos Provados|$)/i;
  const matchArguido = fonteInicial.match(regexSecaoArguido) || textoIntegral.match(regexSecaoArguido);
  const textoArguido = matchArguido ? matchArguido[1] : fonteInicial.slice(0, 3000);

  const regexSecaoOfendido = /(?:Identificação d[ao] Ofendid[ao]|Ofendid[ao]\s*:?|A ofendida|O ofendido|Vítima\s*:?|Assistente\s*:?|contra\s+a\s+assistente|contra\s+a\s+ofendida)([\s\S]{30,1500}?)(?:Factos Provados|I\.|II\.|III\.|$)/i;
  const matchOfendido = fonteInicial.match(regexSecaoOfendido) || textoIntegral.match(regexSecaoOfendido);
  const textoOfendido = matchOfendido ? matchOfendido[1] : fonteInicial.slice(0, 3500);

  const arguido = extrairDadosPessoa(textoArguido, 'arguido', lower, factosProvados);
  const ofendido = extrairDadosPessoa(textoOfendido, 'ofendido', lower, factosProvados);

  const trechoIdentificacao = (matchArguido ? matchArguido[0].slice(0, 350) : '') + '\n---\n' + (matchOfendido ? matchOfendido[0].slice(0, 350) : '');

  return { arguido, ofendido, trechoIdentificacao };
}

function extrairDadosPessoa(
  secao: string, 
  tipo: 'arguido' | 'ofendido', 
  fullLower: string, 
  factosProvados: string
): PessoaIdentificacao {
  // 1. Idade
  let idade: number | null = null;
  let idadeTexto = '';

  const idadeMatch = secao.match(/(\d{1,2})\s*anos(?:\s*de\s*idade)?/i) ||
                     secao.match(/com\s*(\d{1,2})\s*anos/i) ||
                     secao.match(/nascid[oa]\s+(?:em|a)\s+\d{1,2}[\/\.-]\d{1,2}[\/\.-](\d{4})/i);

  if (idadeMatch) {
    if (idadeMatch[1].length === 4) {
      const anoNasc = parseInt(idadeMatch[1], 10);
      idade = Math.max(1, 2026 - anoNasc);
      idadeTexto = `${idade} anos (nasc. em ${anoNasc})`;
    } else {
      idade = parseInt(idadeMatch[1], 10);
      idadeTexto = `${idade} anos`;
    }
  }

  // 2. Sexo
  let sexo: Sexo = 'Não especificado';
  if (tipo === 'arguido') {
    if (/\b(?:a\s+arguida|do\s+sexo\s+feminino|mulher|esposa|namorada|mãe|filha)\b/i.test(secao)) {
      sexo = 'F';
    } else if (/\b(?:o\s+arguido|do\s+sexo\s+masculino|homem|marido|namorado|pai|filho)\b/i.test(secao)) {
      sexo = 'M';
    }
  } else {
    if (/\b(?:a\s+ofendida|a\s+vítima|mulher|do\s+sexo\s+feminino|esposa|namorada|mãe|filha)\b/i.test(secao)) {
      sexo = 'F';
    } else if (/\b(?:o\s+ofendido|o\s+vítima|homem|do\s+sexo\s+masculino|marido|namorado|pai|filho)\b/i.test(secao)) {
      sexo = 'M';
    }
  }

  // 3. Vencimento Mensal - Procurar na secção e complementar com Factos Provados das condições económicas
  let vencimentoMensal = '';
  const regexVencimento = /(?:aufere|auferindo|vencimento|rendimento|ordenado|salário|retribuição|remuneração)(?: mensal)?(?: de| no valor de| cerca de| de cerca de)?\s*(?:€|euros)?\s*(\d+[\.,]?\d*)\s*(?:€|euros)?(?:\s*mensais)?/i;
  
  let matchVencimento = secao.match(regexVencimento);
  if (!matchVencimento && tipo === 'arguido' && factosProvados) {
    // Buscar no segmento de condições pessoais provadas do arguido
    const condicoesMatch = factosProvados.match(/(?:condi[çc][õo]es\s+pessoais|situa[çc][ãa]o\s+econ[óo]mica|antecedentes\s+criminais)([\s\S]{50,1500})/i);
    if (condicoesMatch) {
      matchVencimento = condicoesMatch[1].match(regexVencimento);
    }
  }

  if (matchVencimento && matchVencimento[1]) {
    vencimentoMensal = `${matchVencimento[1]} € / mês`;
  } else if (/salário mínimo nacional|retribuição mínima mensal garantida/i.test(secao) || (tipo === 'arguido' && /salário mínimo nacional|retribuição mínima/i.test(factosProvados))) {
    vencimentoMensal = 'Salário Mínimo Nacional (RMMG)';
  } else if (/rendimento social de inserção|rsi/i.test(secao)) {
    vencimentoMensal = 'Rendimento Social de Inserção (RSI)';
  } else if (/subsídio de desemprego/i.test(secao)) {
    vencimentoMensal = 'Subsídio de desemprego';
  } else if (/não aufere rendimentos|sem rendimentos/i.test(secao)) {
    vencimentoMensal = 'Sem rendimentos';
  }

  // 4. Profissão - Procurar na secção e nos Factos Provados
  let profissao = '';
  const profissaoMatch = secao.match(/(?:profissão|profissão de|exercendo a profissão de|trabalha como|ocupação profissional|exerce a atividade de|trabalhador[a]?)\s*:?\s*([A-Za-zÀ-ÿ\s\/\-]{3,40}?)(?:,|\.|\n|;|\s+residente|\s+natural)/i);

  if (profissaoMatch && profissaoMatch[1] && profissaoMatch[1].trim().length > 2) {
    const candidata = profissaoMatch[1].trim();
    if (!/^\d/.test(candidata) && !/euros|rendimento|ordenado|vencimento/i.test(candidata)) {
      profissao = candidata;
    }
  } else if (/desempregad[oa]/i.test(secao)) {
    profissao = 'Desempregado(a)';
  } else if (/reformad[oa]|aposentad[oa]/i.test(secao)) {
    profissao = 'Reformado(a) / Aposentado(a)';
  } else if (/estudante/i.test(secao)) {
    profissao = 'Estudante';
  } else if (/empresári[oa]|comerciante/i.test(secao)) {
    profissao = 'Empresário(a) / Comerciante';
  } else if (/doméstic[oa]/i.test(secao)) {
    profissao = 'Doméstica';
  }

  // Se não foi encontrada na secção do relatório, procurar nos Factos Provados pessoais do arguido
  if (!profissao && tipo === 'arguido' && factosProvados) {
    const matchFP = factosProvados.match(/(?:trabalha como|exerce a atividade de|profiss[ãa]o de)\s+([A-Za-zÀ-ÿ\s]{3,35})(?:,|\.|\n|;|\s+auferindo)/i);
    if (matchFP && matchFP[1]) {
      profissao = matchFP[1].trim();
    }
  }

  // 5. Habilitações Literárias
  let habilitacoesLiterarias = '';
  const habMatch = secao.match(/(?:habilitações(?:\s*literárias)?|escolaridade|ensino|habilitad[oa]\s+com)\s*:?\s*([A-Za-z0-9À-ÿ\sº\.\-]{3,40}?)(?:,|\.|\n|;|\s+profiss)/i);
  if (habMatch && habMatch[1]) {
    habilitacoesLiterarias = habMatch[1].trim();
  } else if (/(?:12(?:\.º|º)?\s*ano|ensino\s+secundário)/i.test(secao)) {
    habilitacoesLiterarias = '12.º ano (Ensino Secundário)';
  } else if (/(?:9(?:\.º|º)?\s*ano|3(?:\.º|º)?\s*ciclo)/i.test(secao)) {
    habilitacoesLiterarias = '9.º ano (3.º Ciclo do Ensino Básico)';
  } else if (/(?:6(?:\.º|º)?\s*ano|2(?:\.º|º)?\s*ciclo)/i.test(secao)) {
    habilitacoesLiterarias = '6.º ano (2.º Ciclo do Ensino Básico)';
  } else if (/(?:4(?:\.º|º)?\s*ano|ensino\s+primário|1(?:\.º|º)?\s*ciclo)/i.test(secao)) {
    habilitacoesLiterarias = '4.º ano (Ensino Primário)';
  } else if (/(?:licenciatura|ensino\s+superior|mestrado|doutoramento)/i.test(secao)) {
    habilitacoesLiterarias = 'Ensino Superior';
  } else if (/não\s+sabe\s+ler\s+nem\s+escrever|analfabet[oa]/i.test(secao)) {
    habilitacoesLiterarias = 'Analfabeto(a)';
  }

  // 6. Antecedentes Criminais (CRC) - PREFERÊNCIA AOS FACTOS PROVADOS
  let antecedentesCriminais = '';
  let hasAntecedentes: boolean | null = null;

  if (tipo === 'arguido') {
    // Nos tribunais portugueses, a situação criminal (CRC) é sempre enunciada nos FACTOS PROVADOS
    const textoCRC = (factosProvados.length > 50 ? factosProvados : '') + ' ' + secao;
    
    if (/(?:já\s+sofreu\s+condenações|averbadas\s+no\s+seu\s+registo|averbadas\s+as\s+seguintes\s+condenações|com\s+antecedentes\s+criminais|reincidente|foi\s+condenado\s+anteriormente|sofreu\s+anterior\s+condenação)/i.test(textoCRC)) {
      hasAntecedentes = true;
      const detalheMatch = textoCRC.match(/(?:averbadas\s+no\s+registo\s+criminal|antecedentes\s+criminais|condenações\s+anteriores)[:\s]*([^\n\.;]{10,200})/i);
      antecedentesCriminais = detalheMatch ? `Com antecedentes: ${detalheMatch[1].trim()}` : 'Com antecedentes criminais registados';
    } else if (/(?:não\s+tem\s+antecedentes|sem\s+antecedentes|primário|não\s+regista\s+condenações|registo\s+criminal\s+limpo|não\s+tem\s+averbamentos)/i.test(textoCRC)) {
      hasAntecedentes = false;
      antecedentesCriminais = 'Sem antecedentes criminais (CRC limpo / Primário)';
    }
  }

  return {
    idade,
    idadeTexto,
    sexo,
    profissao,
    vencimentoMensal,
    habilitacoesLiterarias,
    antecedentesCriminais,
    hasAntecedentes,
    trechoTexto: secao.slice(0, 300)
  };
}

// -------------------------------------------------------------
// PENAS E DISPOSITIVO (PREFERÊNCIA AO SEGMENTO FINAL DECISÓRIO)
// -------------------------------------------------------------

function extrairPenas(dispositivo: string, textoIntegral: string, lower: string) {
  // PREFERÊNCIA ESTRITA AO DISPOSITIVO DECISÓRIO (Art. 374.º, n.º 3 do CPP)
  const textoDispositivo = dispositivo.length > 100 ? dispositivo : (textoIntegral.length > 3000 ? textoIntegral.slice(-3000) : textoIntegral);
  const dispLower = textoDispositivo.toLowerCase();

  let penaAplicada = '';
  let tipoPena: 'prisao_efetiva' | 'prisao_suspensa' | 'multa' | 'absolvicao' | 'trabalho_comunitario' | 'outro' = 'outro';
  let duracaoPenaMeses: number | null = null;
  let penasAcessorias = '';
  let indemnizacaoCivel = '';

  // 1. Verificar se houve absolvição
  if (/absolver\s+o\s+arguido|absolve-se\s+o\s+arguido|absolvi[çc][ãa]o\s+do\s+arguido|julgar\s+improcedente\s+a\s+acusa[çc][ãa]o/i.test(dispLower)) {
    tipoPena = 'absolvicao';
    penaAplicada = 'Absolvição do arguido';
  } else {
    // 2. Condenação: calcular duração da pena
    const matchDuracao = textoDispositivo.match(/(\d+)\s*(?:\([^\)]+\)\s*)?anos?(?:\s*e\s*(\d+)\s*(?:\([^\)]+\)\s*)?meses)?\s*de\s*prisão/i) ||
                         textoDispositivo.match(/pena\s+de\s+(\d+)\s*anos?(?:\s*e\s*(\d+)\s*meses)?/i);

    if (matchDuracao) {
      const anos = parseInt(matchDuracao[1], 10);
      const meses = matchDuracao[2] ? parseInt(matchDuracao[2], 10) : 0;
      duracaoPenaMeses = (anos * 12) + meses;
      penaAplicada = `${anos} ano(s)${meses > 0 ? ` e ${meses} mês(es)` : ''} de prisão`;
    }

    // 3. Regime de execução: Prisão Suspensa vs Prisão Efetiva vs Multa
    if (/suspensa\s+na\s+sua\s+execu[çc][ãa]o/i.test(dispLower)) {
      tipoPena = 'prisao_suspensa';
      const matchRegime = textoDispositivo.match(/suspensa\s+na\s+sua\s+execu[çc][ãa]o\s+por\s+([^\n,\.;]+)/i);
      penaAplicada += matchRegime ? ` (suspensa na execução por ${matchRegime[1].trim()})` : ' (suspensa na execução)';
    } else if (/pris[ãa]o\s+efetiva/i.test(dispLower) || (duracaoPenaMeses && !/suspens/i.test(dispLower) && /efetiv/i.test(dispLower))) {
      tipoPena = 'prisao_efetiva';
      penaAplicada += ' (prisão efetiva)';
    } else if (/pena\s+de\s+multa/i.test(dispLower)) {
      tipoPena = 'multa';
      const matchMulta = textoDispositivo.match(/(\d+)\s*dias\s+de\s+multa/i);
      if (matchMulta && !penaAplicada) {
        penaAplicada = `${matchMulta[1]} dias de multa`;
      }
    }
  }

  // 4. Penas Acessórias
  const acessorias: string[] = [];
  if (/proibi[çc][ãa]o\s+de\s+contactos?/i.test(dispLower)) {
    acessorias.push('Proibição de contactos com a vítima (Art. 152.º, n.º 4 e 5 CP)');
  }
  if (/afastamento\s+da\s+resid[êe]ncia/i.test(dispLower)) {
    acessorias.push('Afastamento da residência');
  }
  if (/meios\s+t[ée]cnicos\s+de\s+controlo\s+[àa]\s+dist[âa]ncia|pulseira\s+eletr[óo]nica/i.test(dispLower)) {
    acessorias.push('Vigilância eletrónica / Pulseira eletrónica');
  }
  if (/programa\s+para\s+agressores|pavd/i.test(dispLower)) {
    acessorias.push('Programa para agressores (PAVD)');
  }
  penasAcessorias = acessorias.length > 0 ? acessorias.join('; ') : '';

  // 5. Indemnização Cível no Dispositivo
  const matchIndemnizacao = textoDispositivo.match(/(?:quantia|valor|montante|indemniza[çc][ãa]o)\s*(?:c[íi]vel)?\s*de\s*([0-9\.,]+\s*(?:€|euros))/i) ||
                            textoDispositivo.match(/(\d+[\.,]?\d*)\s*€\s*(?:a\s+t[íi]tulo\s+de\s+danos|de\s+indemniza[çc][ãa]o)/i);
  if (matchIndemnizacao) {
    indemnizacaoCivel = `Condenação no pagamento de ${matchIndemnizacao[1] || matchIndemnizacao[0]} a título de indemnização`;
  } else {
    indemnizacaoCivel = '';
  }

  return {
    penaAplicada,
    tipoPena,
    duracaoPenaMeses,
    penasAcessorias,
    indemnizacaoCivel,
    trechoPenas: textoDispositivo.slice(0, 400)
  };
}

function extrairReincidencia(factosProvados: string, dispositivo: string, textoIntegral: string, lower: string) {
  let reincidencia = false;
  let reincidenciaDetalhe = '';
  let trechoReincidencia = '';

  const textoPrioritario = (dispositivo.length > 50 ? dispositivo : '') + ' ' + (factosProvados.length > 50 ? factosProvados : textoIntegral);
  const match = textoPrioritario.match(/(?:reincid[êe]ncia|reincidente|art(?:igo|\.)?\s*75(?:\.º|º)?)([\s\S]{0,300})/i);
  
  if (match) {
    trechoReincidencia = match[0];
    const subLower = match[0].toLowerCase();
    if (/não\s+(?:se\s+verifica|ocorre|há)\s+reincid[êe]ncia|afastada\s+a\s+reincid[êe]ncia|n[ãa]o\s+opera\s+a\s+reincid[êe]ncia/i.test(subLower)) {
      reincidencia = false;
      reincidenciaDetalhe = '';
    } else if (/condenado\s+como\s+reincidente|verifica-se\s+a\s+reincid[êe]ncia|opera\s+a\s+reincid[êe]ncia|punido\s+como\s+reincidente/i.test(subLower)) {
      reincidencia = true;
      reincidenciaDetalhe = 'Sim, arguido condenado sob o instituto da reincidência (Artigo 75.º do C.P.).';
    }
  }

  return { reincidencia, reincidenciaDetalhe, trechoReincidencia };
}

// -------------------------------------------------------------
// MENORES DE 18 ANOS (PREFERÊNCIA AOS FACTOS PROVADOS)
// -------------------------------------------------------------

function extrairVitimasMenores(factosProvados: string, textoIntegral: string, lower: string) {
  let vitimasMenores18 = false;
  let vitimasMenoresDetalhe = '';
  let trechoMenores = '';

  // PREFERÊNCIA AOS FACTOS PROVADOS
  const fonte = factosProvados.length > 80 ? factosProvados : textoIntegral;

  const padroesMenores = [
    /(?:na\s+presença\s+d[eo]s?\s+filh[oa]s?\s+menor(?:es)?|menor\s+de\s+idade|idade\s+inferior\s+a\s+18\s+anos|vítima\s+menor|criança|art(?:igo|\.)?\s*152(?:\.º|º)?,\s*n(?:\.º|º)?\s*2,\s*al(?:ínea|\.)?\s*a\))/i,
    /(?:filho|filha)\s+menor\s+com\s*(\d{1,2})\s*anos/i
  ];

  for (const regex of padroesMenores) {
    const match = fonte.match(regex);
    if (match) {
      vitimasMenores18 = true;
      trechoMenores = match[0];
      const matchAnos = fonte.match(/(?:filh[oa]|criança|menor)\s+(?:com|de)\s*(\d{1,2})\s*anos/i);
      const idadeMenor = matchAnos ? `(com ${matchAnos[1]} anos)` : '';
      vitimasMenoresDetalhe = `Sim, confirmada a presença ou vitimização de menores de 18 anos ${idadeMenor} (Art.º 152.º, n.º 2, alínea a) do C.P.).`;
      break;
    }
  }

  return { vitimasMenores18, vitimasMenoresDetalhe, trechoMenores };
}

// -------------------------------------------------------------
// DETERMINAÇÃO DE OFENSAS (PREFERÊNCIA ESTRITA AOS FACTOS PROVADOS)
// -------------------------------------------------------------

function extrairTiposOfensas(factosProvados: string, textoIntegral: string, lower: string): TiposOfensas {
  // A app deve dar preferência estrita à lista de factos provados para não incluir alegações não comprovadas
  const textoAlvo = factosProvados.length > 80 ? factosProvados : textoIntegral;
  const lowerAlvo = textoAlvo.toLowerCase();

  const termosFisicos = [
    'agressão física', 'agressões físicas', 'socos', 'pontapés', 'bofetada', 'bofetadas', 
    'estalos', 'empurrão', 'empurrões', 'escoriações', 'hematoma', 'hematomas', 'ferimentos', 
    'puxões de cabelo', 'apertou-lhe o pescoço', 'estrangulamento', 'desferiu murros', 'agarrou-a pelo pescoço'
  ];
  let fisicas = false;
  const achadosFisicos: string[] = [];
  for (const termo of termosFisicos) {
    if (lowerAlvo.includes(termo)) {
      fisicas = true;
      achadosFisicos.push(termo);
    }
  }

  const termosPsico = [
    'injúrias', 'insultos', 'ameaças', 'ameaçou de morte', 'humilhações', 'perseguição', 
    'stalking', 'mensagens ofensivas', 'controlo', 'ciúmes obsessivos', 'isolamento', 'vou-te matar', 'chamou-lhe'
  ];
  let psicologicas = false;
  const achadosPsico: string[] = [];
  for (const termo of termosPsico) {
    if (lowerAlvo.includes(termo)) {
      psicologicas = true;
      achadosPsico.push(termo);
    }
  }

  const termosSexuais = [
    'ofensa sexual', 'ofensas sexuais', 'violação', 'coação sexual', 
    'atos sexuais forçados', 'relações sexuais não consentidas', 'cópula não consentida'
  ];
  let sexuais = false;
  const achadosSexuais: string[] = [];
  for (const termo of termosSexuais) {
    if (lowerAlvo.includes(termo)) {
      sexuais = true;
      achadosSexuais.push(termo);
    }
  }

  const termosPatrimoniais = [
    'partiu o telemóvel', 'danificou', 'destruição de bens', 'partiu a mobília', 
    'apropriação de dinheiro', 'privação de recursos', 'danificou o veículo'
  ];
  let patrimoniais = false;
  const achadosPatrimoniais: string[] = [];
  for (const termo of termosPatrimoniais) {
    if (lowerAlvo.includes(termo)) {
      patrimoniais = true;
      achadosPatrimoniais.push(termo);
    }
  }

  return {
    fisicas,
    detalhesFisicas: fisicas ? `Ofensas físicas apuradas nos factos provados: ${achadosFisicos.slice(0, 5).join(', ')}` : '',
    psicologicas,
    detalhesPsicologicas: psicologicas ? `Ofensas psicológicas/verbais apuradas: ${achadosPsico.slice(0, 5).join(', ')}` : '',
    sexuais,
    detalhesSexuais: sexuais ? `Agressões sexuais apuradas: ${achadosSexuais.join(', ')}` : '',
    patrimoniais,
    detalhesPatrimoniais: patrimoniais ? `Violência patrimonial apurada: ${achadosPatrimoniais.join(', ')}` : ''
  };
}

// -------------------------------------------------------------
// DETERMINAÇÃO DE PERÍCIAS (PREFERÊNCIA AOS FACTOS PROVADOS)
// -------------------------------------------------------------

function extrairPericias(factosProvados: string, textoIntegral: string, lower: string): { pericias: PericiasInfo; trechoPericias: string } {
  // PREFERÊNCIA AOS FACTOS PROVADOS (onde o juiz cita relatórios periciais admitidos e valorados)
  const textoAlvo = factosProvados.length > 80 ? factosProvados : textoIntegral;
  const lowerAlvo = textoAlvo.toLowerCase();

  const tipos: string[] = [];
  const categorias: TipoPericia[] = [];
  let trechoPericias = '';

  // 1. Médico-Legal / Avaliação de Dano Corporal (INMLCF)
  if (/perícia\s+médico-legal|relatório\s+do\s+inmlcf|relatório\s+do\s+inml|avaliação\s+do\s+dano\s+corporal|exame\s+de\s+dano\s+corporal|autópsia|clínica\s+forense|instituto\s+nacional\s+de\s+medicina\s+legal/i.test(lowerAlvo)) {
    tipos.push('Perícia Médico-Legal / Dano Corporal (INMLCF)');
    categorias.push('medico_legal');
  }

  // 2. Psiquiátrica Forense
  if (/perícia\s+psiquiátrica|exame\s+psiquiátrico|avaliação\s+psiquiátrica|anomalia\s+psíquica|inimputabilidade/i.test(lowerAlvo)) {
    tipos.push('Perícia Psiquiátrica Forense');
    categorias.push('psiquiatrica');
  }

  // 3. Psicológica / Personalidade
  if (/perícia\s+psicológica|avaliação\s+psicológica|exame\s+psicológico|perícia\s+sobre\s+a\s+personalidade/i.test(lowerAlvo)) {
    tipos.push('Perícia Psicológica / Personalidade');
    categorias.push('psicologica');
  }

  // 4. Relatório Social da DGRSP
  if (/relatório\s+social|dgrsp|direção-geral\s+de\s+reinserção|reinserção\s+social/i.test(lowerAlvo)) {
    tipos.push('Relatório Social da DGRSP');
    categorias.push('relatorio_social_dgrsp');
  }

  // 5. Perícia Informática e Telefónica Forense
  if (/perícia\s+informática|extração\s+forense|exame\s+ao\s+telemóvel|perícia\s+digital|mensagens\s+de\s+whatsapp|perícia\s+a\s+equipamentos\s+informáticos/i.test(lowerAlvo)) {
    tipos.push('Perícia Informática e Telefónica Forense');
    categorias.push('informatica');
  }

  // 6. Perícia Toxicológica
  if (/perícia\s+toxicológica|exame\s+toxicológico|taxa\s+de\s+alcoolemia|estupefacientes/i.test(lowerAlvo)) {
    tipos.push('Perícia Toxicológica');
    categorias.push('toxicologica');
  }

  // 7. Perícia Balística / Armas
  if (/perícia\s+balística|exame\s+balístico|exame\s+[àa]\s+arma|arma\s+de\s+fogo|perícia\s+a\s+munições/i.test(lowerAlvo)) {
    tipos.push('Perícia Balística / Armas');
    categorias.push('balistica');
  }

  const matchPericia = textoAlvo.match(/(?:perícia|relatório\s+pericial|inmlcf|dgrsp|exame\s+forense)([\s\S]{0,250})/i);
  if (matchPericia) {
    trechoPericias = matchPericia[0];
  }

  const realizadas = tipos.length > 0;

  return {
    pericias: {
      realizadas,
      tipos,
      categorias,
      detalhes: realizadas ? `Perícias apuradas nos autos: ${tipos.join('; ')}` : ''
    },
    trechoPericias
  };
}

function extrairNumeroProcesso(text: string, fileName: string): string {
  const padroes = [
    /(?:Processo|Proc\.?)\s*(?:n\.?º?|número)?\s*:?\s*(\d{1,6}\/\d{2}(?:\.\d)?[A-Z0-9\.\-]{2,10})/i,
    /(\d{1,6}\/\d{2}\.\d[A-Z]{2,6}(?:-[A-Z])?)/,
    /(\d{1,6}\/\d{2}[A-Z]{2,6})/,
    /(?:Processo|Proc\.)\s*([0-9\/\.\w-]+)/i
  ];

  for (const regex of padroes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const proc = match[1].trim();
      if (proc.includes('/') || proc.length >= 6) {
        return proc;
      }
    }
  }

  const fileMatch = fileName.match(/(\d{1,6}[\/_]\d{2}(?:[\._]\d)?[A-Za-z0-9\-]{2,8})/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1].replace(/_/g, '/');
  }

  return '';
}

function extrairTribunal(text: string): string {
  const padroesTribunal = [
    /(Tribunal Judicial da Comarca de\s+[^\n,\.;]+(?:[-–]\s*Juízo\s+[^\n,\.;]+)?)/i,
    /(Juízo Central Criminal de\s+[^\n,\.;]+(?:\s*[-–]\s*Juiz\s+\d+)?)/i,
    /(Juízo Local Criminal de\s+[^\n,\.;]+)/i,
    /(Tribunal da Relação de\s+(?:Lisboa|Porto|Coimbra|Évora|Guimarães))/i,
    /(Supremo Tribunal de Justiça)/i,
    /(Comarca de\s+[A-Za-zÀ-ÿ\s]+[-–]\s*Juízo\s+[^\n,\.;]+)/i
  ];

  for (const regex of padroesTribunal) {
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }

  const inicio = text.slice(0, 1000);
  if (/Relação de Lisboa/i.test(inicio)) return 'Tribunal da Relação de Lisboa';
  if (/Relação do Porto/i.test(inicio)) return 'Tribunal da Relação do Porto';
  if (/Relação de Coimbra/i.test(inicio)) return 'Tribunal da Relação de Coimbra';
  if (/Relação de Évora/i.test(inicio)) return 'Tribunal da Relação de Évora';
  if (/Relação de Guimarães/i.test(inicio)) return 'Tribunal da Relação de Guimarães';
  if (/Supremo Tribunal de Justiça/i.test(inicio)) return 'Supremo Tribunal de Justiça';

  return '';
}

export function criarAnaliseDetalhadaPadrao(texto: string, parsedParcial: any): AnaliseDetalhadaVD {
  const lower = texto.toLowerCase();

  // 1. Metadados
  const numProcessoUnico = parsedParcial.numeroProcessoReal || '';
  
  let faseProcessual: AnaliseDetalhadaVD['faseProcessual'] = 'julgamento';
  if (lower.includes('instrução') || lower.includes('juiz de instrução')) faseProcessual = 'instrucao';
  else if (lower.includes('recurso') || lower.includes('recorrido') || lower.includes('recorrente')) faseProcessual = 'recurso';
  else if (lower.includes('execução')) faseProcessual = 'execucao';

  let regimeProcessual: AnaliseDetalhadaVD['regimeProcessual'] = 'comum';
  if (lower.includes('processo comum')) regimeProcessual = 'comum';
  else if (lower.includes('processo abreviado')) regimeProcessual = 'abreviado';
  else if (lower.includes('processo sumaríssimo')) regimeProcessual = 'sumarissimo';
  else if (lower.includes('processo especial')) regimeProcessual = 'especial';

  // Extrair data da ocorrência dos factos
  let dataOcorrenciaFactos = 'Não apurado nos autos';
  const dataFactosMatch = texto.match(/(?:desde|em|no dia)\s+(\d{1,2}(?:\s+de\s+[a-zÀ-ÿ]+)?\s+de\s+(?:19\d{2}|20\d{2}))/i);
  if (dataFactosMatch) {
    dataOcorrenciaFactos = dataFactosMatch[1].trim();
  }

  let tipoDecisaoFinal: AnaliseDetalhadaVD['tipoDecisaoFinal'] = 'condenacao';
  if (parsedParcial.tipoPena === 'absolvicao') tipoDecisaoFinal = 'absolvicao';
  else if (lower.includes('arquivamento') || lower.includes('arquivar')) tipoDecisaoFinal = 'arquivamento';
  else if (lower.includes('suspensão provisória')) tipoDecisaoFinal = 'suspensao_provisoria';

  const legislacaoCitada = (parsedParcial.artigosLegais || []).join(', ') || 'Artigo 152.º do Código Penal, Lei n.º 112/2009';

  // 2. Características das partes
  // 2.1 Vítima
  let vitimaEstadoCivil = 'Não especificado';
  if (lower.includes('casada') || lower.includes('casado')) vitimaEstadoCivil = 'Casado/a';
  else if (lower.includes('solteira') || lower.includes('solteiro')) vitimaEstadoCivil = 'Solteiro/a';
  else if (lower.includes('divorciada') || lower.includes('divorciado')) vitimaEstadoCivil = 'Divorciado/a';
  else if (lower.includes('unidos de facto') || lower.includes('união de facto')) vitimaEstadoCivil = 'União de Facto';

  const vitimaEscolaridade = parsedParcial.ofendido?.habilitacoesLiterarias || 'Não especificada';

  let vitimaFilhosComum = 'Não mencionado';
  const filhosMatch = texto.match(/(?:filho|filhos)\s+(?:em comum|menor|menores)?/i);
  if (filhosMatch) {
    if (lower.includes('um filho') || lower.includes('1 filho')) vitimaFilhosComum = '1 filho';
    else if (lower.includes('dois filhos') || lower.includes('2 filhos')) vitimaFilhosComum = '2 filhos';
    else if (lower.includes('três filhos') || lower.includes('3 filhos')) vitimaFilhosComum = '3 filhos';
    else vitimaFilhosComum = 'Filhos menores mencionados';
  }

  let vitimaHistoricoViolencia = 'Não reportado';
  if (lower.includes('queixas anteriores') || lower.includes('queixa anterior') || lower.includes('histórico de agressões') || lower.includes('antecedentes de violência')) {
    vitimaHistoricoViolencia = 'Histórico de episódios anteriores reportado';
  }

  let vitimaTempoRelacao = 'Não especificado';
  const tempoMatch = texto.match(/(?:relação|namoro|casados|juntos|coabitação)\s+há\s+(\d+\s+(?:anos|meses))/i);
  if (tempoMatch) {
    vitimaTempoRelacao = tempoMatch[1];
  }

  let vitimaSituacaoCoabitacao: AnaliseDetalhadaVD['vitimaSituacaoCoabitacao'] = 'nao_especificado';
  if (parsedParcial.coabitacao === true) vitimaSituacaoCoabitacao = 'juntos';
  else if (lower.includes('separados') || lower.includes('fim de coabitação')) vitimaSituacaoCoabitacao = 'separados';
  else if (lower.includes('processo de separação')) vitimaSituacaoCoabitacao = 'em_separacao';

  let vitimaDependenciaEconomica = null;
  if (lower.includes('dependência económica') || lower.includes('dependente economicamente') || lower.includes('sem rendimentos próprios')) {
    vitimaDependenciaEconomica = true;
  }

  let vitimaVulnerabilidades = 'Nenhuma vulnerabilidade específica identificada';
  const vulnList: string[] = [];
  if (lower.includes('grávida') || lower.includes('gravidez')) vulnList.push('Gravidez');
  if (lower.includes('deficiência') || lower.includes('incapacidade')) vulnList.push('Deficiência');
  if (lower.includes('idade avançada') || lower.includes('idosa') || lower.includes('idoso')) vulnList.push('Idade Avançada');
  if (lower.includes('doença crónica') || lower.includes('doente')) vulnList.push('Doença Crónica / Fragilidade');
  if (vulnList.length > 0) {
    vitimaVulnerabilidades = vulnList.join(', ');
  }

  let vitimaParticipacaoProcesso = 'Prestou depoimento nos autos';
  if (lower.includes('constituiu assistente') || lower.includes('constituiu-se assistente')) {
    vitimaParticipacaoProcesso = 'Constituiu-se assistente e prestou depoimento';
  } else if (lower.includes('desistiu da queixa') || lower.includes('desistência de queixa')) {
    vitimaParticipacaoProcesso = 'Desistiu da queixa (crime particular/semi-público)';
  }

  // 2.2 Ofensor
  let ofensorEstadoCivil = 'Não especificado';
  if (lower.includes('casado com') || lower.includes('marido de')) ofensorEstadoCivil = 'Casado';
  else if (lower.includes('solteiro') && lower.includes('arguido')) ofensorEstadoCivil = 'Solteiro';

  let ofensorHistoricoViolencia = 'Histórico não reportado nos autos';
  if (lower.includes('agressões físicas e verbais habituais') || lower.includes('reiteradas agressões')) {
    ofensorHistoricoViolencia = 'Padrão habitual de agressões físicas/psicológicas';
  }

  let ofensorConsumoProblema = 'Sem menção a consumos problemáticos nos factos provados';
  if (lower.includes('estado de embriaguez') || lower.includes('consumo de álcool') || lower.includes('dependentes de álcool') || lower.includes('estupefacientes')) {
    ofensorConsumoProblema = 'Mencionado consumo de álcool/substâncias estupefacientes';
  }

  let ofensorProgramasReabilitacao = 'Não mencionado nos autos';
  if (lower.includes('programa de reabilitação') || lower.includes('curso de violência doméstica') || lower.includes('programa de agressores')) {
    ofensorProgramasReabilitacao = 'Participação ou obrigatoriedade de frequência em programa especial';
  }

  // 2.3 Outras partes
  let testemunhasDetalhe = 'Testemunhas inquiridas em audiência';
  const testMatch = texto.match(/testemunhas?(?:\s+inquiridas)?/i);
  if (testMatch) {
    testemunhasDetalhe = 'Inquirição de testemunhas (familiares, vizinhos ou policiais)';
  }

  let peritosDetalhe = 'Sem intervenção direta de peritos mencionada nos autos';
  if (lower.includes('perícia') || lower.includes('relatório médico-legal') || lower.includes('inmlcf') || lower.includes('dgrsp')) {
    peritosDetalhe = 'Intervenção de perito médico-legal ou relatório social da DGRSP';
  }

  // 3. Contexto factual
  const violenciaFisica = !!parsedParcial.ofensas?.fisicas;
  const violenciaPsicologica = !!parsedParcial.ofensas?.psicologicas;
  const violenciaSexual = !!parsedParcial.ofensas?.sexuais;
  const violenciaEconomica = !!parsedParcial.ofensas?.patrimoniais;
  const violenciaMoral = lower.includes('injúria') || lower.includes('difamação') || lower.includes('humilhação');

  let frequenciaViolencia: AnaliseDetalhadaVD['frequenciaViolencia'] = 'padrao_repetido';
  if (lower.includes('reiteradamente') || lower.includes('padrão crónico') || lower.includes('violência crónica')) frequenciaViolencia = 'cronica';
  else if (lower.includes('episódio isolado') || lower.includes('facto único')) frequenciaViolencia = 'episodio_isolado';

  let gravidadeLesoes: AnaliseDetalhadaVD['gravidadeLesoes'] = 'leve';
  if (lower.includes('necessidade de internamento') || lower.includes('lesões graves') || lower.includes('perigo de vida')) gravidadeLesoes = 'grave';
  else if (lower.includes('hematomas') || lower.includes('escoriações') || lower.includes('ofensa simples')) gravidadeLesoes = 'leve';

  let usoArmasObjetos = 'Nenhum uso de armas ou objetos reportado nos factos provados';
  if (lower.includes('faca de cozinha') || lower.includes('faca') || lower.includes('arma branca')) {
    usoArmasObjetos = 'Uso de arma branca (faca / navalha)';
  } else if (lower.includes('arma de fogo') || lower.includes('revólver') || lower.includes('pistola')) {
    usoArmasObjetos = 'Uso de arma de fogo';
  } else if (lower.includes('bastão') || lower.includes('pau') || lower.includes('martelo') || lower.includes('cinto')) {
    usoArmasObjetos = 'Uso de objeto contundente / improvisado';
  }

  let localAgressao = 'Habitação comum das partes';
  if (lower.includes('rua') || lower.includes('via pública') || lower.includes('local público')) {
    localAgressao = 'Local público / Via pública';
  }

  let presencaFilhosAgressao = null;
  if (lower.includes('na presença dos filhos') || lower.includes('perante os filhos') || lower.includes('filhos assistiram')) {
    presencaFilhosAgressao = true;
  }

  let ameacasMorteSuicidio = null;
  if (lower.includes('ameaça de morte') || lower.includes('matar') || lower.includes('tirar a vida') || lower.includes('suicid')) {
    ameacasMorteSuicidio = true;
  }

  const provasApresentadas: string[] = ['Testemunhos'];
  if (lower.includes('relatório médico') || lower.includes('inmlcf') || lower.includes('exame de avaliação corporal')) provasApresentadas.push('Relatórios médicos / Periciais');
  if (lower.includes('fotografias') || lower.includes('fotografia')) provasApresentadas.push('Fotografias das lesões');
  if (lower.includes('gravações') || lower.includes('gravação de áudio') || lower.includes('gravação vídeo')) provasApresentadas.push('Gravações de áudio/vídeo');
  if (lower.includes('perícia psicológica') || lower.includes('relatório de psicologia')) provasApresentadas.push('Perícia Psicológica');
  if (lower.includes('confessou') || lower.includes('confissão')) provasApresentadas.push('Confissão do arguido');

  // 4. Medidas processuais e cautelares
  let medidasCautelaresAplicadas = false;
  const medidasCautelaresTipos: string[] = [];
  if (lower.includes('afastamento do lar') || lower.includes('afastar-se da residência')) {
    medidasCautelaresAplicadas = true;
    medidasCautelaresTipos.push('Afastamento do lar');
  }
  if (lower.includes('proibição de contactos') || lower.includes('proibido de contactar')) {
    medidasCautelaresAplicadas = true;
    medidasCautelaresTipos.push('Proibição de contactos');
  }
  if (lower.includes('proibição de aproximação') || lower.includes('proibido de se aproximar')) {
    medidasCautelaresAplicadas = true;
    medidasCautelaresTipos.push('Proibição de aproximação');
  }
  if (lower.includes('suspensão de visitas') || lower.includes('regulação do exercício das responsabilidades parentais suspens')) {
    medidasCautelaresAplicadas = true;
    medidasCautelaresTipos.push('Suspensão de visitas a filhos');
  }
  if (lower.includes('pulseira eletrónica') || lower.includes('fiscalização eletrónica')) {
    medidasCautelaresAplicadas = true;
    medidasCautelaresTipos.push('Mecanismo de controlo eletrónico');
  }

  let medidasCautelaresDataConcessao = 'Não especificada';
  let medidasCautelaresDuracao = 'Não especificada';
  let medidasCautelaresMonitorizacao = 'Sem monitorização ativa registada nos autos';
  if (lower.includes('pulseira eletrónica') || lower.includes('fiscalização eletrónica') || lower.includes('vigilância eletrónica')) {
    medidasCautelaresMonitorizacao = 'Pulseira eletrónica (Vigilância Eletrónica DGRSP)';
  } else if (lower.includes('policial') || lower.includes('vigilância da gnr') || lower.includes('vigilância da psp')) {
    medidasCautelaresMonitorizacao = 'Acompanhamento e monitorização por autoridade policial (GNR/PSP)';
  }

  // 5. Decisão judicial
  let medidasPosSentenca = 'Sem medidas especiais pós-sentença cominadas nos autos';
  if (lower.includes('frequência de programa') || lower.includes('curso para agressores')) {
    medidasPosSentenca = 'Obrigatoriedade de frequência de programa para agressores (DGRSP)';
  }

  let indemnizacaoValor = parsedParcial.indemnizacaoCivel || 'Não arbitrada / Não requerida';
  let indemnizacaoTipo: AnaliseDetalhadaVD['indemnizacaoTipo'] = 'nao_aplicavel';
  if (indemnizacaoValor !== 'Não arbitrada / Não requerida' && !indemnizacaoValor.toLowerCase().includes('sem arbitra')) {
    if (lower.includes('danos morais') || lower.includes('danos não patrimoniais')) indemnizacaoTipo = 'danos_morais';
    else if (lower.includes('danos patrimoniais') || lower.includes('danos materiais')) indemnizacaoTipo = 'danos_materiais';
    else indemnizacaoTipo = 'ambos';
  }

  let argumentosCondenacao = 'Prova testemunhal consistente corroborada por relatórios médicos de lesões e confissão parcial';
  if (parsedParcial.tipoPena === 'absolvicao') {
    argumentosCondenacao = '';
  }

  let argumentosAbsolvicao = '';
  if (parsedParcial.tipoPena === 'absolvicao') {
    argumentosAbsolvicao = 'Insuficiência de prova segura da prática dos maus-tratos ou retratação/depoimentos contraditórios na audiência';
  }

  const atenuantesReconhecidas: string[] = [];
  if (lower.includes('confissão parcial') || lower.includes('confissão livre')) atenuantesReconhecidas.push('Confissão (parcial ou integral)');
  if (lower.includes('reparação do dano') || lower.includes('indemnizou a vítima')) atenuantesReconhecidas.push('Reparação integral ou parcial do dano');
  if (lower.includes('ausência de antecedentes') || lower.includes('primariedade') || lower.includes('sem antecedentes criminais')) atenuantesReconhecidas.push('Ausência de antecedentes criminais');

  const agravantesReconhecidas: string[] = [];
  if (parsedParcial.reincidencia === true) {
    agravantesReconhecidas.push('Reincidência criminal formal ou material');
  }
  if (lower.includes('na presença de menores') || lower.includes('perante os filhos')) {
    agravantesReconhecidas.push('Prática do crime na presença de descendentes menores de idade');
  }
  if (lower.includes('particularmente censurável') || lower.includes('especial baixeza')) {
    agravantesReconhecidas.push('Grau de ilicitude e culpa particularmente censurável');
  }

  // 6. Sociológica
  let regiaoGeografica = 'Região Norte / Centro / Sul (não especificada)';
  if (parsedParcial.tribunal.toLowerCase().includes('porto') || parsedParcial.tribunal.toLowerCase().includes('braga') || parsedParcial.tribunal.toLowerCase().includes('guimarães') || parsedParcial.tribunal.toLowerCase().includes('viana')) {
    regiaoGeografica = 'Região Norte (Portugal)';
  } else if (parsedParcial.tribunal.toLowerCase().includes('lisboa') || parsedParcial.tribunal.toLowerCase().includes('sintra') || parsedParcial.tribunal.toLowerCase().includes('loures') || parsedParcial.tribunal.toLowerCase().includes('almada') || parsedParcial.tribunal.toLowerCase().includes('setúbal')) {
    regiaoGeografica = 'Área Metropolitana de Lisboa';
  } else if (parsedParcial.tribunal.toLowerCase().includes('coimbra') || parsedParcial.tribunal.toLowerCase().includes('aveiro') || parsedParcial.tribunal.toLowerCase().includes('viseu') || parsedParcial.tribunal.toLowerCase().includes('leiria')) {
    regiaoGeografica = 'Região Centro (Portugal)';
  } else if (parsedParcial.tribunal.toLowerCase().includes('faro') || parsedParcial.tribunal.toLowerCase().includes('portimão') || parsedParcial.tribunal.toLowerCase().includes('loulé')) {
    regiaoGeografica = 'Região do Algarve / Sul';
  }

  let tipoArea: AnaliseDetalhadaVD['tipoArea'] = 'urbana';
  if (lower.includes('rural') || lower.includes('aldeia') || lower.includes('terreno agrícola')) {
    tipoArea = 'rural';
  } else if (lower.includes('periurbana') || lower.includes('periferia')) {
    tipoArea = 'periurbana';
  }

  let servicosApoioMencionados = 'Não mencionado nos autos';
  if (lower.includes('casa-abrigo') || lower.includes('casa de abrigo')) {
    servicosApoioMencionados = 'Casa de Abrigo da Rede Nacional de Apoio (RNAVVD)';
  } else if (lower.includes('apoio psicológico') || lower.includes('assistência social') || lower.includes('apav')) {
    servicosApoioMencionados = 'Apoio psicológico e social (APAV / Gabinete de Apoio à Vítima)';
  }

  // Grelha de recolha de dados - Heurísticas e Valores predefinidos
  const teveInstrucao = faseProcessual === 'instrucao' || lower.includes('instrução') || lower.includes('juiz de instrução');
  const localFactosUltimo = localAgressao || 'Habitação comum das partes';
  const periodoTemporalViolencia = vitimaTempoRelacao !== 'Não especificado' ? `Relação durou ${vitimaTempoRelacao}; violência continuada` : frequenciaViolencia === 'episodio_isolado' ? 'Episódio isolado de violência' : 'Padrão reiterado sem indicação de anos exatos';
  const sitHabitacionalAgente = parsedParcial.titularidadeCasaPropria === 'arguido' ? 'Proprietário da habitação' : 'Não especificada nos autos';
  const sitHabitacionalVitima = parsedParcial.titularidadeCasaPropria === 'ofendida' ? 'Proprietária da habitação' : 'Não especificada nos autos';
  const situacaoResidencial = parsedParcial.coabitacao === true ? 'Residência comum com a vítima' : parsedParcial.coabitacao === false ? 'Residência separada' : 'Não especificado';
  const medidasPromocaoProtecao = 'Não mencionado nos autos';
  const antecedentesVD = parsedParcial.reincidencia === true ? `Sim. ${parsedParcial.reincidenciaDetalhe}` : 'Ausência de antecedentes por violência doméstica reportados';
  const antecedentesOutros = 'Não mencionados';
  const medidasCoacaoProcesso = medidasCautelaresAplicadas === true ? `Aplicadas: ${medidasCautelaresTipos.join(', ')}` : 'Apenas Termo de Identidade e Residência (TIR)';
  const relacaoDetalheCompleto = `Relação de ${parsedParcial.relacaoAgressorVitima || 'parceiros íntimos'}. Duração: ${vitimaTempoRelacao || 'não apurada'}. Coabitação: ${parsedParcial.coabitacaoTexto || 'não apurada'}.`;
  const gravidezVitima = lower.includes('grávida') || lower.includes('gravidez');
  const vulnerabilidadeParticular = vitimaVulnerabilidades;
  const dependenciaVitima = vitimaDependenciaEconomica ? 'Dependência económica / habitacional identificada' : 'Sem menção explícita a dependência';
  const deficienciaIncapacidadeAgenteVitima = lower.includes('deficiência') || lower.includes('incapacidade') || lower.includes('doença mental') ? 'Mencionada nos autos' : 'Não reportada';
  const dependenciasSubstanciasAgenteVitima = ofensorConsumoProblema;
  const motivacoesRelacao = lower.includes('ciúme') ? 'Ciúmes / sentimento de posse' : lower.includes('término') || lower.includes('separação') ? 'Não aceitação do fim do relacionamento' : 'Não apurada nos autos';
  const violenciaTipologiaDetalhada = `Violência física (${violenciaFisica ? 'sim' : 'não'}), psicológica (${violenciaPsicologica ? 'sim' : 'não'}), sexual (${violenciaSexual ? 'sim' : 'não'}), económica (${violenciaEconomica ? 'sim' : 'não'}).`;
  const quemQuisSeparacao = lower.includes('separação por iniciativa da vítima') ? 'A vítima' : 'Não especificado nos autos';
  const condenacaoAutonomaFilho = 'Não aplicável';
  const condenacaoAutonomaSexual = lower.includes('crime de coação sexual') || lower.includes('crime de violação') ? 'Condenação autónoma por crime sexual' : 'Não reportada nos autos';
  const criancasEnvolvidasDetalhe = parsedParcial.vitimasMenores18 ? `Menores envolvidos: ${parsedParcial.vitimasMenoresDetalhe}` : 'Sem indicação de menores de idade envolvidos diretamente';
  const periciasAutos = peritosDetalhe;
  const acompanhamentoDesdeQueixa = 'Não especificado nos autos';
  const cpcjIntervencao = lower.includes('cpcj') ? 'Sinalização ou intervenção ativa da CPCJ reportada' : 'CPCJ não mencionada';
  const criancaOuvidaProcesso = 'Não mencionado';
  const declaracoesMemoriaFutura = lower.includes('memória futura') || lower.includes('artigo 271') ? 'Sim, declarações tomadas para memória futura' : 'Não referenciado nos autos';
  const vitimasChamadasJulgamento = 'Não mencionado';
  const estatutoVitimaConferido = lower.includes('estatuto de vítima') ? 'Sim, conferido estatuto de vítima' : 'Não especificado';
  const picEIndemnizacaoOficiosa = indemnizacaoValor !== 'Não arbitrada / Não requerida' ? `Sim: ${indemnizacaoValor}` : 'Não arbitrada / Sem PIC';
  const tipoPenasCompleto = `Pena do tipo: ${parsedParcial.tipoPena}. Concreta: ${parsedParcial.penaAplicada}`;
  const programaAgressoresAplicado = medidasPosSentenca;
  const tratamentoDependenciasAplicado = lower.includes('tratamento de dependência') || lower.includes('alcoolemia') ? 'Sim, determinado acompanhamento/tratamento médico' : 'Não mencionado';
  const medidasAfastamentoRegimeProva = 'Não mencionado';
  const penasAcessoriasAplicadas = parsedParcial.penasAcessorias || 'Sem penas acessórias aplicadas';
  const compensacaoCondicaoSuspensao = lower.includes('condição de suspensão') ? 'Pagamento de indemnização como condição de suspensão da pena' : 'Não especificado';
  const criancaVitimaAutonomaAgravante = lower.includes('na presença de menores') ? 'Mero fator agravante na medida da pena' : 'Não referenciado';
  const presencaCriancaQualificacaoPena = lower.includes('na presença de menores') ? 'Considerado na escolha e medida concreta da pena' : 'Não mencionado';
  const consequenciasCrianca = 'Não referidas expressamente pelo tribunal';
  const medidasResponsabilidadesParentais = 'Não mencionado nos autos criminais';
  const denunciaQuemEQuando = 'Denúncia apresentada por familiares ou pela própria vítima nas forças de segurança';
  const intervencaoPoliciaEscolaVizinhos = lower.includes('escola') ? 'Intervenção da escola' : lower.includes('vizinhos') ? 'Intervenção de vizinhos' : 'Intervenção policial comum';
  const medidasProtecaoAnteriores = 'Não reportadas';
  const meiosProva = 'Declarações da vítima, testemunhas, e autos de notícia / relatórios médicos';
  const avaliacaoRisco = 'Ficha de avaliação de risco RVD aplicada';
  const declaracoesPartesJulgamento = 'Não especificado';
  const medidasCoacaoAplicadasDet = medidasCautelaresAplicadas === true ? medidasCautelaresTipos.join(', ') : 'TIR';
  const crimesImputadosCondenados = `Imputados: 1 crime de violência doméstica previsto no art. 152.º do CP`;
  const penaConcretaSubstituicao = `Pena concreta: ${parsedParcial.penaAplicada}`;
  const penasAcessoriasDetalhe = parsedParcial.penasAcessorias;
  const indemnizacaoDetalheCompleto = indemnizacaoValor;
  const ausenciaAntecedentes = parsedParcial.reincidencia === false ? 'Primariedade do arguido registada' : 'Antecedentes registados';
  const reincidenciaDet = parsedParcial.reincidenciaDetalhe;
  const confissaoArrependimentoNegacao = lower.includes('confissão parcial') ? 'Confissão parcial' : lower.includes('confessou integralmente') ? 'Confissão integral' : 'Não especificado';

  return {
    numProcessoUnico,
    faseProcessual,
    regimeProcessual,
    dataOcorrenciaFactos,
    tipoDecisaoFinal,
    legislacaoCitada,
    vitimaEstadoCivil,
    vitimaEscolaridade,
    vitimaFilhosComum,
    vitimaHistoricoViolencia,
    vitimaTempoRelacao,
    vitimaSituacaoCoabitacao,
    vitimaDependenciaEconomica,
    vitimaVulnerabilidades,
    vitimaParticipacaoProcesso,
    ofensorEstadoCivil,
    ofensorHistoricoViolencia,
    ofensorConsumoProblema,
    ofensorProgramasReabilitacao,
    testemunhasDetalhe,
    peritosDetalhe,
    violenciaFisica,
    violenciaPsicologica,
    violenciaSexual,
    violenciaEconomica,
    violenciaMoral,
    frequenciaViolencia,
    gravidadeLesoes,
    usoArmasObjetos,
    localAgressao,
    presencaFilhosAgressao,
    ameacasMorteSuicidio,
    provasApresentadas,
    medidasCautelaresAplicadas,
    medidasCautelaresTipos,
    medidasCautelaresDataConcessao,
    medidasCautelaresDuracao,
    medidasCautelaresMonitorizacao,
    medidasPosSentenca,
    indemnizacaoValor,
    indemnizacaoTipo,
    argumentosCondenacao,
    argumentosAbsolvicao,
    atenuantesReconhecidas,
    agravantesReconhecidas,
    regiaoGeografica,
    tipoArea,
    servicosApoioMencionados,
    
    // Grelha de recolha de dados
    teveInstrucao,
    localFactosUltimo,
    periodoTemporalViolencia,
    sitHabitacionalAgente,
    sitHabitacionalVitima,
    situacaoResidencial,
    medidasPromocaoProtecao,
    antecedentesVD,
    antecedentesOutros,
    medidasCoacaoProcesso,
    relacaoDetalheCompleto,
    gravidezVitima,
    vulnerabilidadeParticular,
    dependenciaVitima,
    deficienciaIncapacidadeAgenteVitima,
    dependenciasSubstanciasAgenteVitima,
    motivacoesRelacao,
    violenciaTipologiaDetalhada,
    quemQuisSeparacao,
    condenacaoAutonomaFilho,
    condenacaoAutonomaSexual,
    criancasEnvolvidasDetalhe,
    periciasAutos,
    acompanhamentoDesdeQueixa,
    cpcjIntervencao,
    criancaOuvidaProcesso,
    declaracoesMemoriaFutura,
    vitimasChamadasJulgamento,
    estatutoVitimaConferido,
    picEIndemnizacaoOficiosa,
    tipoPenasCompleto,
    programaAgressoresAplicado,
    tratamentoDependenciasAplicado,
    medidasAfastamentoRegimeProva,
    penasAcessoriasAplicadas,
    compensacaoCondicaoSuspensao,
    criancaVitimaAutonomaAgravante,
    presencaCriancaQualificacaoPena,
    consequenciasCrianca,
    medidasResponsabilidadesParentais,
    denunciaQuemEQuando,
    intervencaoPoliciaEscolaVizinhos,
    medidasProtecaoAnteriores,
    meiosProva,
    avaliacaoRisco,
    declaracoesPartesJulgamento,
    medidasCoacaoAplicadasDet,
    crimesImputadosCondenados,
    penaConcretaSubstituicao,
    penasAcessoriasDetalhe,
    indemnizacaoDetalheCompleto,
    ausenciaAntecedentes,
    reincidenciaDet,
    confissaoArrependimentoNegacao
  };
}
