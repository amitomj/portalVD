/**
 * Módulo Especializado de Limpeza e Anonimização Judicial.
 * 
 * Cumpre escrupulosamente a diretiva:
 * - Extrai o texto completo da decisão judicial;
 * - Anonimiza nomes, moradas, números de telefone, emails, números de identificação fiscal (NIF/NIPC)
 *   e outros elementos que ajudem a identificar as pessoas (CC, BI, NISS, matrículas, etc.);
 * - No lugar desses dados insere um borrão preto sólido (caracteres Unicode '█');
 * - Preserva integralmente tudo o resto (exceto cabeçalhos e rodapés de paginação);
 * - Preserva escrupulosamente as notas de rodapé e as notas de fim de documento.
 */

// Lista de termos jurídicos/institucionais protegidos contra falsa anonimização
const TERMOS_PROTEGIDOS = new Set([
  'código penal',
  'código de processo penal',
  'código civil',
  'código de processo civil',
  'tribunal judicial',
  'tribunal da relação',
  'supremo tribunal de justiça',
  'tribunal constitucional',
  'tribunal coletivo',
  'tribunal singular',
  'juízo local criminal',
  'juízo central criminal',
  'juízo de instrução criminal',
  'juízo de família e menores',
  'ministério público',
  'república portuguesa',
  'constituição da república',
  'instituto nacional de medicina legal',
  'ciências forenses',
  'inmlcf',
  'dgrsp',
  'apav',
  'polícia de segurança pública',
  'psp',
  'guarda nacional republicana',
  'gnr',
  'polícia judiciária',
  'pj',
  'ordem dos advogados',
  'programa de agressores',
  'programa de agressores de violência doméstica',
  'pavd',
  'violência doméstica',
  'homicídio qualificado',
  'homicídio tentado',
  'homicídio',
  'ofensas à integridade física',
  'ameaça agravada',
  'audiência de julgamento',
  'factos provados',
  'factos não provados',
  'dispositivo',
  'sentença',
  'acórdão',
  'recurso',
  'medida de coação',
  'pulseira eletrónica',
  'registo criminal',
  'segurança social',
  'delinquente primário',
  'reincidência',
  'danos morais',
  'danos patrimoniais',
  'indemnização por danos',
  'indemnização por danos morais',
  'título de indemnização',
  'regime de prova',
  'suspensão da execução da pena',
  'pena de prisão',
  'pena de multa',
  'pena acessória',
  'afastamento da residência',
  'proibição de contactos',
  'processo comum singular',
  'processo comum coletivo',
  'processo sumário',
  'processo abreviado',
  'juiz de direito',
  'juíza de direito',
  'juiz presidente',
  'juiz relator',
  'juíza relatora',
  'procurador da república',
  'procuradora da república',
  'comarca de lisboa',
  'comarca de lisboa oeste',
  'comarca de lisboa norte',
  'comarca do porto',
  'comarca do porto este',
  'comarca de braga',
  'comarca de leiria',
  'comarca de coimbra',
  'comarca de aveiro',
  'comarca de santarém',
  'comarca de setúbal',
  'comarca de faro',
  'comarca de évora',
  'comarca de viseu',
  'comarca de vila real',
  'comarca de bragança',
  'comarca da guarda',
  'comarca de castelo branco',
  'comarca de portalegre',
  'comarca de beja',
  'comarca da madeira',
  'comarca dos açores'
]);

// Palavras e vocábulos processuais que NUNCA devem ser considerados nomes de pessoas
const PALAVRAS_NAO_NOME = new Set([
  'arguido', 'arguida', 'arguidos', 'arguidas',
  'ofendido', 'ofendida', 'ofendidos', 'ofendidas',
  'vítima', 'vítimas', 'assistente', 'assistentes',
  'testemunha', 'testemunhas', 'réu', 'réus', 'ré', 'rés',
  'acusado', 'acusada', 'acusados', 'acusadas',
  'demandado', 'demandada', 'demandante', 'demandantes',
  'tribunal', 'coletivo', 'singular', 'juízo', 'comarca',
  'processo', 'ministério', 'público', 'direito', 'relação',
  'supremo', 'justiça', 'código', 'penal', 'civil', 'artigo',
  'factos', 'provados', 'relatório', 'decisão', 'dispositivo',
  'sentença', 'acórdão', 'crime', 'violência', 'doméstica',
  'homicídio', 'qualificado', 'furto', 'roubo', 'ofensa',
  'pena', 'prisão', 'multa', 'suspensa', 'execução',
  'regime', 'prova', 'programa', 'agressores', 'dano', 'danos',
  'morais', 'patrimoniais', 'indemnização', 'título', 'pagamento',
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  'anos', 'idade', 'sexo', 'masculino', 'feminino', 'nacionalidade',
  'portuguesa', 'estrangeira', 'solteiro', 'casado', 'divorciado',
  'separado', 'viúvo', 'união', 'facto', 'coabitação', 'residência',
  'domicílio', 'conflito', 'habitação', 'própria', 'arrendada',
  'vencimento', 'ordenado', 'salário', 'rendimento', 'escolaridade',
  'antecedentes', 'criminais', 'condenação', 'absolvição'
]);

// Dicionário canónico de nomes próprios portugueses mais comuns (masculinos e femininos)
const NOMES_PROPRIOS_PORTUGUESES = new Set([
  'antónio', 'antonio', 'manuel', 'josé', 'jose', 'joão', 'joao', 'francisco', 'carlos',
  'pedro', 'paulo', 'miguel', 'jorge', 'luís', 'luis', 'rui', 'tiago', 'diogo',
  'bruno', 'nuno', 'duarte', 'humberto', 'vítor', 'vitor', 'mário', 'mario',
  'fernando', 'gonçalo', 'goncalo', 'rodrigo', 'afonso', 'martim', 'tomás', 'tomas',
  'lourenço', 'lourenco', 'salvador', 'vicente', 'gabriel', 'lucas', 'mateus', 'bernardo',
  'joaquim', 'armando', 'alberto', 'artur', 'jaime', 'eduardo', 'ricardo', 'guilherme',
  'henrique', 'leandro', 'rafael', 'vasco', 'álvaro', 'alvaro', 'aníbal', 'anibal',
  'hélio', 'helio', 'sérgio', 'sergio', 'claudio', 'cláudio', 'gustavo', 'daniel',
  'david', 'filipe', 'marcos', 'marco', 'hélder', 'helder', 'alexandre', 'andré',
  'andre', 'hugo', 'ivo', 'renato', 'samuel', 'sebastião', 'sebastiao', 'xavier',
  'maria', 'ana', 'carla', 'sofia', 'paula', 'teresa', 'isabel', 'cristina', 'helena',
  'sandra', 'rita', 'patrícia', 'patricia', 'catarina', 'inês', 'ines', 'mariana',
  'beatriz', 'leonor', 'matilde', 'margarida', 'carolina', 'francisca', 'cláudia', 'claudia',
  'marta', 'sílvia', 'silvia', 'sara', 'joana', 'raquel', 'filipa', 'andreia', 'daniela',
  'susana', 'mónica', 'monica', 'vanessa', 'alexandra', 'cátia', 'catia', 'sónia', 'sonia',
  'fátima', 'fatima', 'graça', 'graca', 'lurdes', 'lourdes', 'conceição', 'conceicao',
  'madalena', 'amélia', 'amelia', 'rosa', 'luísa', 'luisa', 'alice', 'olga',
  'bruna', 'lara', 'diana', 'débora', 'debora', 'verónica', 'veronica'
]);

/**
 * Valida se uma dada sequência textual tem estrutura plausível de nome pessoal português
 * e não coincide com vocábulos processuais, termos protegidos ou frases legais.
 */
export function validarNomePessoa(candidato: string): boolean {
  if (!candidato) return false;
  const limpo = candidato.trim();
  if (limpo.length < 3 || limpo.length > 70) return false;
  
  if (ehTermoProtegido(limpo)) return false;

  const palavras = limpo.toLowerCase().split(/\s+/).filter(p => !/^(?:de|da|do|dos|das|e)$/.test(p));
  if (palavras.length === 0) return false;

  // Se alguma palavra for claramente um termo processual não-nome
  for (const p of palavras) {
    if (PALAVRAS_NAO_NOME.has(p)) return false;
  }

  // Não pode conter dígitos numéricos
  if (/\d/.test(limpo)) return false;

  return true;
}

/**
 * Expande um nome pessoal detetado nas suas sub-variantes canónicas (ex: nome completo,
 * primeiro + último apelido, primeiro + segundo nome, versões em maiúsculas) para garantir
 * que nenhuma menção truncada no relatório, factos ou dispositivo escapa à anonimização.
 */
export function expandirVariantesNome(nome: string): string[] {
  const limpo = nome.trim();
  const variantes = new Set<string>();
  variantes.add(limpo);
  variantes.add(limpo.toUpperCase());

  const partes = limpo.split(/\s+/).filter(p => !/^(?:de|da|do|dos|das|e)$/i.test(p));
  if (partes.length >= 2) {
    variantes.add(`${partes[0]} ${partes[partes.length - 1]}`);
    variantes.add(`${partes[0]} ${partes[1]}`);
    if (partes.length >= 3) {
      variantes.add(`${partes[0]} ${partes[1]} ${partes[partes.length - 1]}`);
    }
  }

  return Array.from(variantes).sort((a, b) => b.length - a.length);
}

/**
 * Deteta e extrai exaustivamente todos os nomes de intervenientes pessoais (arguidos,
 * ofendidos/vítimas, menores/filhos, testemunhas, magistrados, filiação) presentes no texto judicial.
 */
export function extrairTodosNomesPessoas(texto: string): string[] {
  if (!texto) return [];
  const nomes = new Set<string>();

  // 1. Papéis processuais formais seguidos de nome próprio (com ou sem artigos, pontuação, quebras)
  const regexPapeis = /(?:(?:[oO]\s+|[aA]\s+|[àÀ]\s+|[aA]o\s+|[dD][oa]\s+|[pP]el[oa]\s+|[cC]om\s+|[cC]ontra\s+)?(?:[aA]rguid[oa]|[oO]fendid[ao]|[vV][íi]tima|[aA]ssistente|[tT]estemunha|[eE]spos[ao]|[mM]arido|[mM]ulher|[cC]ompanheir[oa]|[dD]emandad[oa]|[dD]emandante|[aA]cusad[oa]|[rR][ée]u)\b(?:\s*\([ao]\))?\s*:?,?\s+)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){0,5})/g;
  let m: RegExpExecArray | null;
  while ((m = regexPapeis.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) {
      nomes.add(m[1].trim());
    }
  }

  // 2. Menores e crianças
  const regexMenores = /(?:filh[oa]\s+menor|a\s+menor|o\s+menor|crian[çc]a)(?:\s+(?:de\s+ambos|do\s+casal|d[ao]s\s+mesm[oa]s))?,?\s+([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){0,3})/g;
  while ((m = regexMenores.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) {
      nomes.add(m[1].trim());
    }
  }

  // 3. Magistrados, advogados e agentes da autoridade
  const regexMagistrados = /(?:Juiz(?:a)?\s+de\s+Direito|Procurador(?:a)?(?:\s+da\s+República)?|Relator(?:a)?|Adjunt[oa]|Advogad[oa]|Defensor(?:a)?\s+oficios[ao]|Perit[oa]\s+médic[oa]|Inspetor(?:a)?|Agente|Guarda)\s*:?,?\s+([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){1,4})/g;
  while ((m = regexMagistrados.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) {
      nomes.add(m[1].trim());
    }
  }

  // 4. Títulos de cortesia formais (Dr., Dra., etc.)
  const regexTitulos = /\b(?:Dr\.?|Dra\.?|Senhor(?:a)?|Sr\.?|Sra\.?)\s+([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){1,4})/g;
  while ((m = regexTitulos.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) {
      nomes.add(m[1].trim());
    }
  }

  // 5. Acusação, julgamento e submissão a tribunal
  const regexAcusacao = /(?:(?:deduziu\s+)?acusa[çc][ãa]o\s+contra|requereu\s+o\s+julgamento\s+de|submetido\s+a\s+julgamento(?:\s+em\s+processo\s+comum)?(?:\s+perante\s+tribunal\s+(?:coletivo|singular))?)\s*:?,?\s*(?:(?:o|a|os|as)\s+)?(?:(?:arguid[oa]|réu|acusad[oa])\s*:?,?\s*)?([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){0,5})/gi;
  while ((m = regexAcusacao.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) {
      nomes.add(m[1].trim());
    }
  }

  // 6. Condenações no dispositivo
  const regexCondenacao = /(?:[cC]ondenar|[aA]bsolver)\s+(?:o\s+arguido|a\s+arguida|o\s+réu|a\s+ré)\s+([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){0,5})/g;
  while ((m = regexCondenacao.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) {
      nomes.add(m[1].trim());
    }
  }

  // 7. Filiação nominal ("filho de ... e de ...")
  const regexFiliacao = /(?:filh[oa]\s+de\s+)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){1,4})\s+e\s+de\s+([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){1,4})/g;
  while ((m = regexFiliacao.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) nomes.add(m[1].trim());
    if (m[2] && validarNomePessoa(m[2])) nomes.add(m[2].trim());
  }

  // 8. Nomes compostos próprios portugueses (iniciados por nome próprio do dicionário)
  const regexCompostos = /\b([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){1,5})\b/g;
  while ((m = regexCompostos.exec(texto)) !== null) {
    const full = m[1].trim();
    const parts = full.split(/\s+/);
    if (parts.length >= 2 && NOMES_PROPRIOS_PORTUGUESES.has(parts[0].toLowerCase()) && validarNomePessoa(full)) {
      nomes.add(full);
    }
  }

  // 9. Nomes em caixa alta nos cabeçalhos (ex: ARGUIDO: ANTÓNIO MANUEL FERREIRA)
  const regexCaixaAlta = /\b(?:ARGUID[OA]|OFENDID[AO]|V[ÍI]TIMA|ASSISTENTE|TESTEMUNHA)\s*:?\s*([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ]{2,}(?:\s+(?:DE|DA|DO|DOS|DAS|E\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ]{2,}){1,5})/g;
  while ((m = regexCaixaAlta.exec(texto)) !== null) {
    if (m[1] && validarNomePessoa(m[1])) {
      nomes.add(m[1].trim());
    }
  }

  return Array.from(nomes);
}

/**
 * Cria a representação visual de "borrão preto" a partir de uma string original.
 * Substitui caracteres alfa-numéricos por blocos pretos '█', mantendo pontuação e espaços.
 */
export function gerarBorraoPreto(texto: string): string {
  if (!texto) return '';
  return texto.replace(/[^\s\.,;:()\/\[\]\-]/g, '█');
}

/**
 * Remove cabeçalhos e rodapés de paginação, preservando escrupulosamente:
 * - O corpo integral da decisão;
 * - As notas de rodapé ([1], 1., etc.);
 * - As notas de fim de documento.
 */
export function limparCabecalhosERodapesPreservandoNotas(textoOriginal: string): string {
  if (!textoOriginal) return '';

  const normalizado = textoOriginal.replace(/\r\n/g, '\n');
  const linhas = normalizado.split('\n');
  const linhasFiltradas: string[] = [];

  // Padrões de cabeçalho e rodapé puramente de paginação a remover
  const regexDivisorPagina = /^\s*---+\s*P[AÁ]GINA(?:\s*\d+)?\s*---+\s*$/i;
  const regexNumeroPaginaIsolado = /^\s*(?:P[aá]gina|P[aá]g\.?|Page)\s*\d+\s*(?:(?:de|\/)\s*\d+)?\s*$/i;
  const regexPaginacaoHifen = /^\s*-\s*\d{1,4}\s*-\s*$/;
  const regexPaginacaoBarra = /^\s*\d{1,4}\s*\/\s*\d{1,4}\s*$/;
  const regexApenasNumeroIsolado = /^\s*\d{1,3}\s*$/;
  const regexSoftwareFooter = /^\s*(?:Documento\s+(?:assinado\s+eletronicamente|processado\s+por\s+computador)|Impresso\s+em\s+\d{2}[\/\.-]\d{2}[\/\.-]\d{4})\s*$/i;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const linhaTrim = linha.trim();

    // 1. Verificar se é nota de rodapé ou nota final: PRESERVAR SEMPRE!
    const isNotaRodapeOuFim = (
      /^\s*\[\d+\]/.test(linhaTrim) || // [1] Cfr. ...
      /^\s*\(\d+\)/.test(linhaTrim) || // (1) Cfr. ...
      /^\s*\d{1,2}\.\s+[A-ZÀ-ÿ]/.test(linhaTrim) || // 1. Cfr. ...
      /^\s*\*{1,3}\s+/.test(linhaTrim) || // * Cfr. ...
      /^\s*(?:Notas|Notas\s+de\s+rodap[ée]|Notas\s+de\s+fim\s+de\s+documento|Notas\s+finais|Jurisprud[êe]ncia\s+citada)\s*:?/i.test(linhaTrim) ||
      /(?:Cfr\.|Ac[oó]rd[ãa]o\s+do\s+STJ|Ac\.\s+do\s+STJ|Ac[oó]rd[ãa]o\s+do\s+TR[LPCGE]|fls\.\s*\d+|artigo\s+\d+|Maia\s+Gon[çc]alves|Paulo\s+Pinto)/i.test(linhaTrim)
    );

    if (isNotaRodapeOuFim) {
      linhasFiltradas.push(linha);
      continue;
    }

    // 2. Remover marcadores sintéticos de página
    if (regexDivisorPagina.test(linhaTrim)) {
      continue;
    }

    // 3. Remover rodapés de paginação
    if (
      regexNumeroPaginaIsolado.test(linhaTrim) ||
      regexPaginacaoHifen.test(linhaTrim) ||
      regexPaginacaoBarra.test(linhaTrim) ||
      regexSoftwareFooter.test(linhaTrim)
    ) {
      continue;
    }

    // 4. Se for apenas um número isolado e a linha anterior ou seguinte for vazia (típico número de página isolado)
    if (regexApenasNumeroIsolado.test(linhaTrim)) {
      const prevVazia = i === 0 || linhas[i - 1].trim() === '';
      const nextVazia = i === linhas.length - 1 || linhas[i + 1].trim() === '';
      if (prevVazia && nextVazia) {
        continue; // Ignorar número de página solitário
      }
    }

    linhasFiltradas.push(linha);
  }

  // Normalizar quebras de linha excessivas (mais de 3 seguidas)
  return linhasFiltradas.join('\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

/**
 * Anonimiza integralmente dados de identificação pessoal com "borrão preto".
 * 
 * Elementos anonimizados:
 * - Nomes de arguido(s), ofendido(s)/vítima(s), menores/filhos, testemunhas, assistentes e intervenientes;
 * - Moradas, ruas, avenidas, andares, números de polícia e códigos postais;
 * - Números de telefone e telemóvel;
 * - Endereços de correio eletrónico (emails);
 * - Números de identificação fiscal (NIF / NIPC);
 * - Cartões de Cidadão (CC), Bilhetes de Identidade (BI), Passaportes;
 * - Números de Segurança Social (NISS);
 * - Matrículas de veículos automóveis e IBANs bancários.
 */
export function anonimizarTextoJudicial(
  texto: string, 
  nomesConhecidos: string[] = []
): { textoAnonimizado: string; totalAnonimizacoes: number } {
  if (!texto) {
    return { textoAnonimizado: '', totalAnonimizacoes: 0 };
  }

  let processado = texto;
  let totalSubstituicoes = 0;

  // Função auxiliar para substituir mantendo contagem
  const substituirComBorrao = (regex: RegExp, extratorAlvo?: (match: RegExpMatchArray) => string) => {
    processado = processado.replace(regex, (...args) => {
      const match = args[0] as string;
      const groups = args.slice(1, -2);
      
      // Se tiver grupo de captura específico
      if (extratorAlvo) {
        // Criar estrutura similar a match array
        const matchArray = [match, ...groups] as unknown as RegExpMatchArray;
        const alvo = extratorAlvo(matchArray);
        if (alvo && !ehTermoProtegido(alvo)) {
          totalSubstituicoes++;
          return match.replace(alvo, gerarBorraoPreto(alvo));
        }
        return match;
      }

      if (!ehTermoProtegido(match)) {
        totalSubstituicoes++;
        return gerarBorraoPreto(match);
      }
      return match;
    });
  };

  // 1. Anonimizar Emails
  substituirComBorrao(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g);

  // 2. Anonimizar Números de Telefone / Telemóvel
  // Indicativo português +351 / 00351
  substituirComBorrao(/(?:\+351|00351)[\s\.-]?[29]\d{2}[\s\.-]?\d{3}[\s\.-]?\d{3}\b/g);
  // Telemóveis (91, 92, 93, 96...)
  substituirComBorrao(/\b9[1236]\d{1}[\s\.-]?\d{3}[\s\.-]?\d{3}\b/g);
  // Telefones fixos (21, 22, 23...)
  substituirComBorrao(/\b2\d{2}[\s\.-]?\d{3}[\s\.-]?\d{3}\b/g);
  // Telefone rotulado
  substituirComBorrao(/(?:\b(?:tel(?:efone)?|tlm|telem[óo]vel|contat?o)\s*:?\s*)(\+?\d[\d\s\.-]{7,15}\d)\b/gi, (m) => m[1]);

  // 3. Anonimizar NIF / NIPC
  substituirComBorrao(/(?:\b(?:NIF|NIPC|contribuinte|identifica[çc][ãa]o\s+fiscal)\s*(?:n\.?º?|n[uú]mero)?\s*:?\s*)(\b\d{9}\b)/gi, (m) => m[1]);

  // 4. Anonimizar Cartão de Cidadão / BI / NISS / Passaporte / IBAN / Matrícula
  substituirComBorrao(/(?:\b(?:CC|BI|Cart[ãa]o\s+de\s+Cidad[ãa]o|Bilhete\s+de\s+Identidade)\s*(?:n\.?º?|n[uú]mero)?\s*:?\s*)([0-9]{6,9}(?:[\s-]?[0-9A-Z]{1,4})?)/gi, (m) => m[1]);
  substituirComBorrao(/(?:\b(?:NISS|Seguran[çc]a\s+Social)\s*(?:n\.?º?|n[uú]mero)?\s*:?\s*)(\b\d{11}\b)/gi, (m) => m[1]);
  substituirComBorrao(/\bPT50[\s\d]{23,27}\b/gi); // IBAN português
  substituirComBorrao(/\b(?:\d{2}-[A-Z]{2}-\d{2}|[A-Z]{2}-\d{2}-[A-Z]{2}|\d{2}-\d{2}-[A-Z]{2}|[A-Z]{2}-\d{2}-\d{2})\b/g); // Matrículas

  // 5. Anonimizar Moradas e Domicílios
  // Códigos Postais portugueses (ex: 1200-100 Lisboa)
  substituirComBorrao(/\b\d{4}\s*-\s*\d{3}(?:\s+[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûçA-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ\s-]+)?\b/g);

  // Ruas, avenidas, praças, etc.
  substituirComBorrao(
    /\b(?:Rua|Avenida|Av\.?|Travessa|Praceta|Pra[çc]a|Largo|Bairro|Alameda|Estrada|Caminho|Viela|Cal[çc]ada|Urbaniza[çc][ãa]o)\s+[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ0-9\s,\.ºª-]+?(?=(?:,\s*(?:em|concelho|comarca|c[óo]digo|telefone|nif|fls|natural|freguesia))|\.|\n|;)/gi
  );

  // Residência / domicílio
  substituirComBorrao(
    /(?:\b(?:residente|domiciliad[oa]|com\s+domic[íi]lio|morada\s+em|residia)\s+(?:em|na|no|[àa]|[àa]o|nos|nas)?\s+)([^,\.\n;]+(?:,\s*n\.?º?\s*\d+[^,\.\n;]*)?)/gi,
    (m) => m[1]
  );

  // Andares e frações específicas
  substituirComBorrao(/\b(?:n\.?º?\s*\d+[\s,-]*(?:\d+[\.ºª]|r[ée]s-do-ch[ãa]o|r\/c|cave|subcave|direito|esquerdo|dto\.?|esq\.?|frente|recuado|fra[çc][ãa]o\s+[A-Z]))\b/gi);

  // 6. Filiação Nominal ("filho de ... e de ...")
  substituirComBorrao(
    /(?:\bfilh[oa]\s+de\s+)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç\s]+?)(?:\s+e\s+de\s+)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç\s]+?)(?:,|\.|\n|;|\s+natural)/gi,
    (m) => {
      // Retorna a combinação dos nomes dos progenitores
      if (m[1] && m[2]) {
        processado = processado.replace(m[1], gerarBorraoPreto(m[1]));
        processado = processado.replace(m[2], gerarBorraoPreto(m[2]));
        totalSubstituicoes += 2;
      }
      return '';
    }
  );

  // 7. Resolução Total de Nomes Próprios (Conhecidos + Descobertos no Documento)
  const todosNomesAlvo = new Set<string>();

  // Incorporar nomes explicitamente fornecidos
  for (const n of nomesConhecidos) {
    if (validarNomePessoa(n)) {
      todosNomesAlvo.add(n.trim());
    }
  }

  // Descobrir exaustivamente todos os nomes presentes no texto
  const nomesDescobertos = extrairTodosNomesPessoas(texto);
  for (const n of nomesDescobertos) {
    if (validarNomePessoa(n)) {
      todosNomesAlvo.add(n.trim());
    }
  }

  // Expandir cada nome nas suas sub-variantes (completo, primeiro+último, siglas, etc.)
  const todasVariantes = new Set<string>();
  for (const nome of todosNomesAlvo) {
    const vars = expandirVariantesNome(nome);
    for (const v of vars) {
      if (validarNomePessoa(v)) {
        todasVariantes.add(v);
      }
    }
  }

  // Ordenar por comprimento decrescente (os nomes mais longos são substituídos primeiro para evitar colisões parciais)
  const listaVariantesOrdenada = Array.from(todasVariantes).sort((a, b) => b.length - a.length);

  for (const variante of listaVariantesOrdenada) {
    const rx = new RegExp(`\\b${escaparRegex(variante)}\\b`, 'g');
    if (rx.test(processado)) {
      processado = processado.replace(rx, (match) => {
        totalSubstituicoes++;
        return gerarBorraoPreto(match);
      });
    }
  }

  // 8. Padrões Contextuais de Nomes de Pessoas (Salvaguarda de nomes isolados ou em contexto de papel processual)
  const regexPessoasContextuais = /\b((?:[oO]\s+|[aA]\s+|[àÀ]\s+|[aA]o\s+|[dD][oa]\s+|[pP]el[oa]\s+|[cC]om\s+|[cC]ontra\s+)?(?:[aA]rguid[oa]|[oO]fendid[ao]|[vV][íi]tima|[aA]ssistente|[tT]estemunha|[eE]spos[ao]|[mM]arido|[mM]ulher|[cC]ompanheir[oa]|[dD]emandad[oa]|[dD]emandante|[aA]cusad[oa]|[rR][ée]u)\b(?:\s*\([ao]\))?\s*:?,?\s+)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){0,5})/g;
  processado = processado.replace(regexPessoasContextuais, (match, prefixo, nomeCandidato) => {
    if (validarNomePessoa(nomeCandidato)) {
      totalSubstituicoes++;
      return `${prefixo}${gerarBorraoPreto(nomeCandidato)}`;
    }
    return match;
  });

  // Títulos formais seguidos de nome (Dr., Dra., Juiz, etc.)
  const regexTitulosComNome = /\b((?:Dr\.?|Dra\.?|Senhor(?:a)?|Sr\.?|Sra\.?|Juiz(?:a)?\s+de\s+Direito|Procurador(?:a)?(?:\s+da\s+Rep[úu]blica)?|Inspetor(?:a)?|Agente|Guarda)\s*:?,?\s+)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){0,4})/g;
  processado = processado.replace(regexTitulosComNome, (match, prefixo, nomeCandidato) => {
    if (validarNomePessoa(nomeCandidato)) {
      totalSubstituicoes++;
      return `${prefixo}${gerarBorraoPreto(nomeCandidato)}`;
    }
    return match;
  });

  // Acusação contra / Julgamento de
  const regexAcusacaoContra = /\b((?:acusa[çc][ãa]o\s+contra|requereu\s+o\s+julgamento\s+de|submetido\s+a\s+julgamento)\s*:?,?\s*(?:(?:o|a|os|as)\s+)?(?:(?:arguid[oa]|réu|acusad[oa])\s*:?,?\s*)?)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+(?:\s+(?:(?:de|da|do|dos|das|e)\s+)?[A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+){0,5})/gi;
  processado = processado.replace(regexAcusacaoContra, (match, prefixo, nomeCandidato) => {
    if (validarNomePessoa(nomeCandidato)) {
      totalSubstituicoes++;
      return `${prefixo}${gerarBorraoPreto(nomeCandidato)}`;
    }
    return match;
  });

  // Menores identificados no texto ("filho menor Tomás", "a menor Leonor")
  const regexMenorNome = /\b((?:filh[oa]\s+menor|a\s+menor|o\s+menor|crian[çc]a)(?:\s+(?:de\s+ambos|do\s+casal|d[ao]s\s+mesm[oa]s))?,?\s+)([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]+)/gi;
  processado = processado.replace(regexMenorNome, (match, prefixo, nomeCandidato) => {
    if (validarNomePessoa(nomeCandidato)) {
      totalSubstituicoes++;
      return `${prefixo}${gerarBorraoPreto(nomeCandidato)}`;
    }
    return match;
  });

  return {
    textoAnonimizado: processado,
    totalAnonimizacoes: totalSubstituicoes
  };
}

/**
 * Verifica se uma expressão corresponde a um termo legal ou institucional protegido.
 */
export function ehTermoProtegido(termo: string): boolean {
  if (!termo) return false;
  const t = termo.toLowerCase().trim();
  if (TERMOS_PROTEGIDOS.has(t)) return true;
  for (const protegido of TERMOS_PROTEGIDOS) {
    if (t === protegido || t.startsWith(protegido + ' ') || t.endsWith(' ' + protegido)) {
      return true;
    }
  }
  return false;
}

function escaparRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extrai notas de rodapé e notas de fim de documento identificadas no texto judicial.
 */
export function extrairNotasDocumento(texto: string): string[] {
  if (!texto) return [];
  const linhas = texto.split('\n');
  const notas: string[] = [];
  let notaAtual = '';

  for (const linha of linhas) {
    const linhaTrim = linha.trim();
    const isInicioNota = /^(?:\[\d+\]|\(\d+\)|\d{1,2}\.\s+[A-ZÀ-ÿ]|\*{1,3}\s+|(?:Notas|Notas\s+de\s+rodap[ée]|Notas\s+finais|Jurisprud[êe]ncia\s+citada):?)/i.test(linhaTrim);

    if (isInicioNota) {
      if (notaAtual) {
        notas.push(notaAtual.trim());
      }
      notaAtual = linhaTrim;
    } else if (notaAtual && linhaTrim.length > 0 && !/^(?:relat[óo]rio|factos|dispositivo)/i.test(linhaTrim)) {
      notaAtual += ' ' + linhaTrim;
    } else if (!linhaTrim && notaAtual) {
      notas.push(notaAtual.trim());
      notaAtual = '';
    }
  }

  if (notaAtual) {
    notas.push(notaAtual.trim());
  }

  return notas;
}
