import { ReferenciaDoutrinaria, DiplomaLegislativo, TipoDiploma } from '../types/modules';
import { extrairTextoDeFicheiro, ExtractedDocument } from '../lib/documentReader';

export interface ExtractedContentResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  totalPaginas?: number;
  doutrinas: ReferenciaDoutrinaria[];
  legislacoes: DiplomaLegislativo[];
  textoBruto: string;
  estatisticas: {
    totalDoutrinas: number;
    totalLegislacoes: number;
    areasDoutrina: Record<string, number>;
  };
}

/**
 * Normaliza e limpa URLs encontradas
 */
function normalizarUrl(url: string): string {
  let u = url.trim();
  // Remover pontuações finais acidentais
  u = u.replace(/[.,;:)\]]+$/, '');
  return u;
}

/**
 * Extrai ano de 4 dígitos de um texto
 */
function extrairAno(texto: string): number {
  const match = texto.match(/\b(19\d\d|20\d\d)\b/);
  if (match) return parseInt(match[1], 10);
  return new Date().getFullYear();
}

/**
 * Extrai edição de texto de detalhes
 */
function extrairEdicao(texto: string): string {
  const matchEd = texto.match(/(\d+\.ª\s*Ediç[ãa]o(?:[^\n,;]*))/i);
  if (matchEd) return matchEd[1].trim();

  if (/dissertaç[ãa]o de mestrado/i.test(texto)) return 'Dissertação de Mestrado';
  if (/tese de doutoramento/i.test(texto)) return 'Tese de Doutoramento';
  if (/revista\s+portuguesa/i.test(texto)) return 'Artigo em Revista Científica';
  if (/acta\s+m[ée]dica/i.test(texto)) return 'Artigo Médico';
  if (/relat[óo]rio/i.test(texto)) return 'Relatório Técnico';
  if (/manual/i.test(texto)) return 'Manual Prático';
  if (/e-book/i.test(texto)) return 'Edição Digital (E-book)';

  return '1.ª Edição';
}

/**
 * Extrai nome da editora / entidade a partir dos detalhes
 */
function extrairEditora(texto: string): string {
  if (/Ediç[õo]es\s+Almedina|Almedina/i.test(texto)) return 'Edições Almedina';
  if (/Centro de Estudos Judici[áa]rios|CEJ/i.test(texto)) return 'Centro de Estudos Judiciários (CEJ)';
  if (/Universidade Cat[óo]lica Editora|Cat[óo]lica/i.test(texto)) return 'Universidade Católica Editora';
  if (/Ordem dos Advogados/i.test(texto)) return 'Ordem dos Advogados (CRL)';
  if (/Pactor\s*Editora|Pactor/i.test(texto)) return 'Pactor Editora';
  if (/Lidel\s*Editora|Lidel/i.test(texto)) return 'Lidel Editora';
  if (/Psiquiquil[íi]brio/i.test(texto)) return 'Psiquiquilíbrio';
  if (/Coimbra\s+Editora/i.test(texto)) return 'Coimbra Editora';
  if (/Faculdade de Direito.*Porto|Universidade do Porto/i.test(texto)) return 'Faculdade de Direito da Univ. do Porto';
  if (/Faculdade de Letras.*Porto/i.test(texto)) return 'Faculdade de Letras da Univ. do Porto';
  if (/Faculdade de Medicina.*Coimbra/i.test(texto)) return 'Faculdade de Medicina da Univ. de Coimbra';
  if (/ICBAS/i.test(texto)) return 'ICBAS, Univ. do Porto';
  if (/Minist[ée]rio da Administraç[ãa]o Interna|Minist[ée]rio da Justi[çc]a|MAI|MJ/i.test(texto)) return 'MAI / Ministério da Justiça';
  if (/Direç[ãa]o-Geral da Sa[úu]de|DGS/i.test(texto)) return 'Direção-Geral da Saúde (DGS)';
  if (/APAV/i.test(texto)) return 'APAV';
  if (/SGMAI/i.test(texto)) return 'SGMAI';
  if (/Routledge/i.test(texto)) return 'Routledge';
  if (/Oxford University Press/i.test(texto)) return 'Oxford University Press';
  if (/Springer/i.test(texto)) return 'Springer Publishing Company';
  if (/Harvard Law Review/i.test(texto)) return 'Harvard Law Review';
  if (/Basic Books/i.test(texto)) return 'Basic Books';
  if (/StatPearls|NIH/i.test(texto)) return 'StatPearls / National Institutes of Health (NIH)';
  if (/AIJA/i.test(texto)) return 'AIJA (Australasian Institute of Judicial Administration)';

  // Fallback: tentar apanhar algo antes do ano
  const partes = texto.split(/,\s*/);
  if (partes.length >= 2) {
    const p1 = partes[1].trim();
    if (p1 && !/^\d+/.test(p1)) return p1;
  }
  return 'Editora Independente / Edição de Autor';
}

/**
 * Processador de Documento: extrai obras doutrinárias e legislação a partir do texto
 */
export function analisarTextoDocumento(
  texto: string, 
  nomeFicheiro: string
): { doutrinas: ReferenciaDoutrinaria[]; legislacoes: DiplomaLegislativo[] } {
  const linhas = texto.split(/\r?\n/);
  
  let parteAtual = 'Obras Nacionais (Portugal)';
  let areaAtual = 'Área Jurídica';

  const doutrinasEncontradas: ReferenciaDoutrinaria[] = [];
  const legislacoesEncontradas: DiplomaLegislativo[] = [];

  // 1. Procurar blocos explícitos no formato estruturado (como no PDF de exemplo: Autor(es): / Título: / Detalhes: ...)
  let autorBuffer = '';
  let tituloBuffer = '';
  let detalhesBuffer = '';
  let linksBuffer: string[] = [];
  let isAcessoLivre = false;
  let isInEntry = false;

  const salvarEntradaDoutrinaAtual = () => {
    if (!tituloBuffer.trim() || !autorBuffer.trim()) return;

    const ano = extrairAno(detalhesBuffer);
    const edicao = extrairEdicao(detalhesBuffer);
    const editora = extrairEditora(detalhesBuffer);

    // ISBN se presente
    const isbnMatch = detalhesBuffer.match(/ISBN[:\s]*([0-9Xx-]+)/i);
    const isbn = isbnMatch ? isbnMatch[1] : undefined;

    // Unique links
    const linksUnicos = Array.from(new Set(linksBuffer.map(normalizarUrl))).filter(Boolean);

    const id = `doutrina_doc_${Date.now()}_${doutrinasEncontradas.length + 1}`;

    const novaObra: ReferenciaDoutrinaria = {
      id,
      autores: autorBuffer.trim(),
      nomeObra: tituloBuffer.trim(),
      edicao: edicao,
      anoEdicao: ano,
      nomeEditora: editora,
      temDocumento: linksUnicos.some(l => l.toLowerCase().endsWith('.pdf')),
      documentoNome: linksUnicos.some(l => l.toLowerCase().endsWith('.pdf')) ? `${tituloBuffer.slice(0, 30)}.pdf` : undefined,
      linksAcesso: linksUnicos.length > 0 ? linksUnicos : ['https://www.almedina.net'],
      acessoLivre: isAcessoLivre || linksUnicos.some(l => l.includes('repositorio') || l.includes('.pdf') || l.includes('gov.pt') || l.includes('actamedica') || l.includes('rpmgf')),
      resumo: detalhesBuffer ? `${detalhesBuffer.trim()} [Âmbito: ${parteAtual} | Secção: ${areaAtual}]` : `Obra de referência extraída do documento ${nomeFicheiro}.`,
      dataRegisto: new Date().toISOString().split('T')[0],
      fonteVarredura: `Extração de Documento: ${nomeFicheiro}`,
      statusValidacao: 'pendente',
      dataDescoberta: new Date().toISOString().split('T')[0],
      isbnOuIssn: isbn,
      areaTematica: areaAtual,
      parteOuAmbito: parteAtual,
      nomeFicheiroOrigem: nomeFicheiro
    };

    doutrinasEncontradas.push(novaObra);

    // Limpar buffers
    autorBuffer = '';
    tituloBuffer = '';
    detalhesBuffer = '';
    linksBuffer = [];
    isAcessoLivre = false;
    isInEntry = false;
  };

  for (let i = 0; i < linhas.length; i++) {
    const linhaOriginal = linhas[i];
    const linha = linhaOriginal.trim();

    if (!linha) continue;

    // Detetar Mudança de Parte (Nacional vs Estrangeira)
    if (/PARTE\s*I\s*:\s*OBRAS\s*NACIONAIS/i.test(linha)) {
      parteAtual = 'Obras Nacionais (Portugal)';
      continue;
    }
    if (/PARTE\s*II\s*:\s*OBRAS\s*ESTRANGEIRAS/i.test(linha)) {
      parteAtual = 'Obras Estrangeiras (Seleção)';
      continue;
    }

    // Detetar Mudança de Área
    if (/\d+\.\s*ÁREA\s*JURÍDICA/i.test(linha)) {
      areaAtual = 'Área Jurídica';
      continue;
    }
    if (/\d+\.\s*ÁREA\s*DAS\s*PERÍCIAS/i.test(linha)) {
      areaAtual = 'Área das Perícias (Forense e Investigação)';
      continue;
    }
    if (/\d+\.\s*ÁREA\s*DA\s*PSICOLOGIA/i.test(linha)) {
      areaAtual = 'Área da Psicologia';
      continue;
    }
    if (/\d+\.\s*ÁREA\s*DA\s*MEDICINA/i.test(linha)) {
      areaAtual = 'Área da Medicina e Saúde Pública';
      continue;
    }

    // Padrão estruturado de Autor:
    if (/^Autor(?:es)?\s*(?:\([^)]*\))?\s*:\s*(.*)/i.test(linha)) {
      if (isInEntry) {
        salvarEntradaDoutrinaAtual();
      }
      isInEntry = true;
      const match = linha.match(/^Autor(?:es)?\s*(?:\([^)]*\))?\s*:\s*(.*)/i);
      autorBuffer = match ? match[1].trim() : '';
      continue;
    }

    // Padrão de Título:
    if (/^T[íi]tulo\s*:\s*(.*)/i.test(linha)) {
      const match = linha.match(/^T[íi]tulo\s*:\s*(.*)/i);
      tituloBuffer = match ? match[1].trim() : '';
      continue;
    }

    // Padrão de Detalhes:
    if (/^Detalhes\s*:\s*(.*)/i.test(linha)) {
      const match = linha.match(/^Detalhes\s*:\s*(.*)/i);
      detalhesBuffer = match ? match[1].trim() : '';
      continue;
    }

    // Padrão de Links:
    if (/Link\s*Comercial\/Editora.*:\s*(https?:\/\/[^\s]+)/i.test(linha)) {
      const match = linha.match(/https?:\/\/[^\s]+/i);
      if (match) linksBuffer.push(match[0]);
      continue;
    }

    if (/Link\s*de\s*Acesso\s*Livre.*:\s*(https?:\/\/[^\s]+)/i.test(linha)) {
      const match = linha.match(/https?:\/\/[^\s]+/i);
      if (match) {
        linksBuffer.push(match[0]);
        isAcessoLivre = true;
      }
      continue;
    }

    // URLs isoladas na linha
    const urlMatches = linha.match(/https?:\/\/[^\s)]+/g);
    if (urlMatches && isInEntry) {
      for (const u of urlMatches) {
        linksBuffer.push(u);
      }
      continue;
    }

    // Se estiver em detalhes de múltiplas linhas
    if (isInEntry && detalhesBuffer && !linha.startsWith('Link') && !linha.startsWith('Autor') && !linha.startsWith('Título')) {
      detalhesBuffer += ' ' + linha;
    }

    // Detetar também Diplomas Legislativos explícitos no documento
    // Ex: "Lei n.º 112/2009, de 16 de setembro - Estabelece o regime..."
    const matchLei = linha.match(/(Lei|Decreto-Lei|Portaria|Resoluç[ãa]o da Assembleia da Rep[úu]blica|Resoluç[ãa]o do Conselho de Ministros|Decreto Regulamentar)\s+n\.?[ºo]?\s*([0-9A-Za-z\/-]+)/i);
    if (matchLei && !isInEntry) {
      const tipoRaw = matchLei[1];
      const numeroIdentificado = `${tipoRaw} n.º ${matchLei[2]}`;
      const anoMatch = linha.match(/\b(19\d\d|20\d\d)\b/);
      const ano = anoMatch ? parseInt(anoMatch[1], 10) : new Date().getFullYear();

      let tipo: TipoDiploma = 'Lei';
      if (/Decreto-Lei/i.test(tipoRaw)) tipo = 'Decreto-Lei';
      else if (/Portaria/i.test(tipoRaw)) tipo = 'Portaria';
      else if (/Conselho de Ministros/i.test(tipoRaw)) tipo = 'Resolução do Conselho de Ministros';
      else if (/Assembleia/i.test(tipoRaw)) tipo = 'Resolução da Assembleia da República';
      else if (/Regulamentar/i.test(tipoRaw)) tipo = 'Decreto Regulamentar';

      // Tentar apanhar o título após hífen ou traço
      const partes = linha.split(/\s*[-–—]\s*/);
      const tituloLegis = partes.length > 1 ? partes.slice(1).join(' - ') : linha;

      const idLegis = `legis_doc_${Date.now()}_${legislacoesEncontradas.length + 1}`;
      legislacoesEncontradas.push({
        id: idLegis,
        tipo,
        numero: numeroIdentificado,
        ano,
        dataPublicacao: `${ano}`,
        titulo: tituloLegis.slice(0, 150),
        descricao: `Diploma extraído de documento "${nomeFicheiro}".`,
        linkOficial: `https://diariodarepublica.pt/dr/detalhe/${tipo.toLowerCase()}/${matchLei[2]}`,
        linkPowerlex: `https://powerlex.altec-csm.dev/#/pesquisa?q=${encodeURIComponent(numeroIdentificado)}`,
        origem: `Extração de Documento: ${nomeFicheiro}`,
        emVigor: true,
        estadoVigencia: 'Em vigor',
        relevancia: 'complementar',
        relevanciaScore: 80,
        serieDRE: 'Série I',
        temas: ['Violência Doméstica', 'Documentação Anexa'],
        statusValidacao: 'pendente',
        fonteExtracao: nomeFicheiro,
        nomeFicheiroOrigem: nomeFicheiro
      });
    }
  }

  // Guardar última se pendente
  if (isInEntry) {
    salvarEntradaDoutrinaAtual();
  }

  return {
    doutrinas: doutrinasEncontradas,
    legislacoes: legislacoesEncontradas
  };
}

/**
 * Lê ficheiro PDF, DOCX ou TXT e extrai todo o conteúdo de doutrina e legislação
 */
export async function extrairConteudoDeFicheiro(file: File): Promise<ExtractedContentResult> {
  const docExtraido: ExtractedDocument = await extrairTextoDeFicheiro(file);
  const parsed = analisarTextoDocumento(docExtraido.text, file.name);

  const areasCount: Record<string, number> = {};
  for (const d of parsed.doutrinas) {
    const a = d.areaTematica || 'Geral';
    areasCount[a] = (areasCount[a] || 0) + 1;
  }

  return {
    fileName: file.name,
    fileType: docExtraido.fileType,
    fileSize: docExtraido.fileSize,
    totalPaginas: docExtraido.pageCount,
    doutrinas: parsed.doutrinas,
    legislacoes: parsed.legislacoes,
    textoBruto: docExtraido.text,
    estatisticas: {
      totalDoutrinas: parsed.doutrinas.length,
      totalLegislacoes: parsed.legislacoes.length,
      areasDoutrina: areasCount
    }
  };
}

/**
 * Conjunto de dados estruturado do documento PDF de exemplo fornecido pelo utilizador:
 * "REPOSITÓRIO EXAUSTIVO SOBRE VIOLÊNCIA DOMÉSTICA" (36 Obras Científicas e Manuais)
 */
export const TEXTO_EXEMPLO_REPOSITORIO_PDF = `REPOSITÓRIO EXAUSTIVO SOBRE VIOLÊNCIA DOMÉSTICA
Compilação compreensiva de obras científicas, manuais práticos e artigos jurídicos, periciais, psicológicos e médicos.

PARTE I: OBRAS NACIONAIS (PORTUGAL)

1. ÁREA JURÍDICA
Autor(es): Morais, Teresa
Título: Violência Doméstica - (A)notações. Legislação Anotada
Detalhes: 1.ª Edição, Edições Almedina, 2026. ISBN: 97897240XXXXX.
Link Comercial/Editora (Texto): https://www.almedina.net/violencia-domestica-anotacoes-1769177040.html
Link Comercial/Editora (Hiperlink): https://www.almedina.net/violencia-domestica-anotacoes-1769177040.html

Autor(es): Guerra, Tomás Carvalho; Rocha, Francisca, et al.
Título: O Crime de Violência Doméstica - Perspetivas Familiares Contemporâneas
Detalhes: 1.ª Edição, Edições Almedina, 2024.
Link Comercial/Editora (Texto): https://www.almedina.net/o-crime-de-violencia-domestica-perspetivas-familiares-contemporaneas-1681297042.html
Link Comercial/Editora (Hiperlink): https://www.almedina.net/o-crime-de-violencia-domestica-perspetivas-familiares-contemporaneas-1681297042.html

Autor(es): Morais, Teresa
Título: Violência Doméstica
Detalhes: 1.ª Edição, Edições Almedina, 2022.
Link Comercial/Editora (Texto): https://www.wook.pt/livro/violencia-domestica-teresa-morais/23042702
Link Comercial/Editora (Hiperlink): https://www.wook.pt/livro/violencia-domestica-teresa-morais/23042702

Autor(es): Guerra, Paulo (Coord.)
Título: Violência Doméstica - Implicações Sociológicas, Psicológicas e Jurídicas do Fenómeno: Manual Pluridisciplinar
Detalhes: 2.ª Edição, Centro de Estudos Judiciários (CEJ), 2022.
Link de Acesso Livre (Texto): https://www.redesocialcascais.net/files/uploads/2022/05/Violencia-Domestica-implicacoes-sociologicas-psicologicas-e-juridicas-do-fenomeno-%E2%80%93-Manual-pluridisciplinar-2.a-edicao.pdf
Link de Acesso Livre (Hiperlink): https://www.redesocialcascais.net/files/uploads/2022/05/Violencia-Domestica-implicacoes-sociologicas-psicologicas-e-juridicas-do-fenomeno-%E2%80%93-Manual-pluridisciplinar-2.a-edicao.pdf
Link Comercial/Editora (Texto): https://www.ministeriopublico.pt/destaque/violencia-domestica-e-book
Link Comercial/Editora (Hiperlink): https://www.ministeriopublico.pt/destaque/violencia-domestica-e-book

Autor(es): Morais, Teresa (Coord.)
Título: Violências Domésticas - Novas Questões Antigas
Detalhes: 1.ª Edição, Edições Almedina, 2022.
Link Comercial/Editora (Texto): https://www.almedina.net/violencias-domesticas-novas-questoes-antigas-1660837042.html
Link Comercial/Editora (Hiperlink): https://www.almedina.net/violencias-domesticas-novas-questoes-antigas-1660837042.html

Autor(es): Dias, Cristina Araújo; Santos, Margarida; Carmo, Rui do
Título: Legislação sobre Violência Doméstica Anotada
Detalhes: 3.ª Edição, Edições Almedina, 2021.
Link Comercial/Editora (Texto): https://www.almedina.net
Link Comercial/Editora (Hiperlink): https://www.almedina.net

Autor(es): Brandão, Nuno
Título: A tutela penal da violência doméstica: Luzes e sombras de um crime fustigado pela inflação legislativa
Detalhes: Revista Portuguesa de Ciência Criminal (RPCC), Coimbra Editora, Ano 26, N.º 1, pp. 7-54, 2016.
Link Comercial/Editora (Texto): https://www.almedina.net
Link Comercial/Editora (Hiperlink): https://www.almedina.net

Autor(es): Pinto, Irene
Título: O crime de violência doméstica e o segredo profissional do advogado
Detalhes: Faculdade de Direito da Universidade do Porto, Dissertação de Mestrado, 2019.
Link de Acesso Livre (Texto): https://repositorio-aberto.up.pt
Link de Acesso Livre (Hiperlink): https://repositorio-aberto.up.pt

Autor(es): Silva, Maria João
Título: A Proteção Jurídica da Vítima de Violência Doméstica em Portugal
Detalhes: Almedina, 2018.
Link Comercial/Editora (Texto): https://www.almedina.net
Link Comercial/Editora (Hiperlink): https://www.almedina.net

Autor(es): Albuquerque, Paulo Pinto de
Título: Comentário do Código Penal
Detalhes: 4.ª Edição, Universidade Católica Editora, 2021 (Secção Artigo 152.º).
Link Comercial/Editora (Texto): https://www.uceditora.uc.pt
Link Comercial/Editora (Hiperlink): https://www.uceditora.uc.pt

2. ÁREA DAS PERÍCIAS (FORENSE E INVESTIGAÇÃO)
Autor(es): XXII Governo Constitucional / Secretária de Estado para a Cidadania e a Igualdade
Título: Manual de Atuação Funcional a Adotar pelos Órgãos de Polícia Criminal (OPC) nas 72 Horas Subsequentes à Apresentação de Denúncia
Detalhes: Ministério da Administração Interna / Ministério da Justiça, 2020.
Link de Acesso Livre (Texto): https://portugal.gov.pt/gc22/comunicacao/documentos/novos-instrumentos-de-combate-a-violencia-domestica
Link de Acesso Livre (Hiperlink): https://portugal.gov.pt/gc22/comunicacao/documentos/novos-instrumentos-de-combate-a-violencia-domestica

Autor(es): Conselho Regional de Lisboa da Ordem dos Advogados
Título: Manual de Boas Práticas Judiciais: Perícias Médico-Legais e Forenses
Detalhes: Ordem dos Advogados, CRL, 2020.
Link de Acesso Livre (Texto): https://www.oa.pt/upl/%7Bfdfb8137-d4c1-4c96-a793-bf0d6c260c32%7D.pdf
Link de Acesso Livre (Hiperlink): https://www.oa.pt/upl/%7Bfdfb8137-d4c1-4c96-a793-bf0d6c260c32%7D.pdf

Autor(es): Magalhães, Teresa
Título: A Perícia Médico-Legal na Violência Doméstica: Desafios e Metodologia de Avaliação
Detalhes: Acta Médica Portuguesa, Vol. 31, N.º 4, 2018.
Link Comercial/Editora (Texto): https://www.actamedicaportuguesa.com
Link Comercial/Editora (Hiperlink): https://www.actamedicaportuguesa.com

Autor(es): Soares, Rui; Matos, Marlene
Título: Avaliação do Risco na Violência Doméstica: O uso da escala RVD em Portugal
Detalhes: Psicologia dos Atos Criminais, Almedina, 2019.
Link Comercial/Editora (Texto): https://www.almedina.net
Link Comercial/Editora (Hiperlink): https://www.almedina.net

Autor(es): Associação Portuguesa de Apoio à Vítima (APAV)
Título: Manual de Apoio à Distância a Vítimas de Violência e Crime
Detalhes: Edição APAV, 2019.
Link Comercial/Editora (Texto): https://loja.apav.pt/categoria-produto/publicacoes-apav/
Link Comercial/Editora (Hiperlink): https://loja.apav.pt/categoria-produto/publicacoes-apav/

Autor(es): GNR / PSP
Título: Relatório de Monitorização e Avaliação do Risco de Violência Doméstica
Detalhes: Relatório Anual Técnico, SGMAI, 2023.
Link de Acesso Livre (Texto): https://www.sg.mai.gov.pt
Link de Acesso Livre (Hiperlink): https://www.sg.mai.gov.pt

Autor(es): Dinis, Maria Isabel
Título: A Perícia Psicológica Forense na Avaliação do Dano em Vítimas de Violência Doméstica
Detalhes: Pactor, 2020.
Link Comercial/Editora (Texto): https://m.pactor.pt
Link Comercial/Editora (Hiperlink): https://m.pactor.pt

3. ÁREA DA PSICOLOGIA
Autor(es): Paulino, Mauro; Rodrigues, Miguel
Título: Violência Doméstica
Detalhes: 1.ª Edição, Pactor Editora, 2016.
Link Comercial/Editora (Texto): https://m.pactor.pt/en/catalogue/social-sciences-forensic-sciences/psychology/violencia-domestica-e-crimes-sexuais/
Link Comercial/Editora (Hiperlink): https://m.pactor.pt/en/catalogue/social-sciences-forensic-sciences/psychology/violencia-domestica-e-crimes-sexuais/

Autor(es): Maia, Ângela (Coord.)
Título: Violência Doméstica e Crimes Sexuais: Apoio à Vítima
Detalhes: 2.ª Edição, Editora Lidel, 2021.
Link Comercial/Editora (Texto): https://m.lidel.pt/pt/catalogo/ciencias-sociais-ciencias-forenses/psicologia/violencia-domestica-e-crimes-sexuais/
Link Comercial/Editora (Hiperlink): https://m.lidel.pt/pt/catalogo/ciencias-sociais-ciencias-forenses/psicologia/violencia-domestica-e-crimes-sexuais/

Autor(es): Machado, Carla; Matos, Marlene
Título: Violência Doméstica: Uma Perspetiva Psicológica e Forense
Detalhes: Psiquiquilíbrio, 2015.
Link Comercial/Editora (Texto): https://www.wook.pt
Link Comercial/Editora (Hiperlink): https://www.wook.pt

Autor(es): Dias, Isabel
Título: Violência Familiar: Uma Síntese da Investigação em Portugal
Detalhes: Faculdade de Letras da Universidade do Porto, 2011.
Link de Acesso Livre (Texto): https://repositorio-aberto.up.pt/bitstream/10216/25491/2/isabeldiasViolenciaFamiliar000101593.pdf
Link de Acesso Livre (Hiperlink): https://repositorio-aberto.up.pt/bitstream/10216/25491/2/isabeldiasViolenciaFamiliar000101593.pdf

Autor(es): Sani, Ana; Caridade, Maria
Título: Violência Conjugal e Parentalidade: Dinâmicas Psicológicas e de Intervenção
Detalhes: Almedina, 2020.
Link Comercial/Editora (Texto): https://www.almedina.net
Link Comercial/Editora (Hiperlink): https://www.almedina.net

Autor(es): Lopes, Ricardo
Título: O Impacto Psicológico da Exposição à Violência Doméstica em Crianças e Jovens
Detalhes: Análise Psicológica, Vol. 35, 2018.
Link de Acesso Livre (Texto): https://www.ispa.pt
Link de Acesso Livre (Hiperlink): https://www.ispa.pt

Autor(es): Gomes, Sílvia
Título: Perfis Psicológicos do Agressor Conjugal: Contributos para a Reabilitação
Detalhes: Editora Pactor, 2022.
Link Comercial/Editora (Texto): https://m.pactor.pt/pt/catalogo/ciencias-sociais-ciencias-forenses/ciencias-forenses-criminologia/violencia-domestica-e-de-genero/
Link Comercial/Editora (Hiperlink): https://m.pactor.pt/pt/catalogo/ciencias-sociais-ciencias-forenses/ciencias-forenses-criminologia/violencia-domestica-e-de-genero/

4. ÁREA DA MEDICINA e SAÚDE PÚBLICA
Autor(es): Direção-Geral da Saúde (DGS)
Título: Ação de Saúde sobre Género, Violência e Ciclo de Vida: Guia de Abordagem Clínica
Detalhes: DGS, Lisboa, 2018.
Link de Acesso Livre (Texto): https://www.dgs.pt
Link de Acesso Livre (Hiperlink): https://www.dgs.pt

Autor(es): Pina, Alexandra
Título: Quanto mais me bates, menos gosto de mim – abordagem da violência doméstica em Cuidados de Saúde Primários
Detalhes: Revista Portuguesa de Medicina Geral e Familiar (RPMGF), 2014.
Link de Acesso Livre (Texto): https://rpmgf.pt/ojs/index.php/rpmgf/article/download/11110/10840/11022
Link de Acesso Livre (Hiperlink): https://rpmgf.pt/ojs/index.php/rpmgf/article/download/11110/10840/11022

Autor(es): Santos, Joana C. R.
Título: A violência doméstica: realidade portuguesa no contexto da medicina legal
Detalhes: Faculdade de Medicina da Universidade de Coimbra, Dissertação de Mestrado, 2017.
Link de Acesso Livre (Texto): https://estudogeral.uc.pt/handle/10316/47726
Link de Acesso Livre (Hiperlink): https://estudogeral.uc.pt/handle/10316/47726

Autor(es): Vieira, Duarte Nuno
Título: Tratado de Medicina Legal
Detalhes: Lidel Editora, 2019 (Capítulo sobre Lesonologia Relacional e Violência na Família).
Link Comercial/Editora (Texto): https://www.lidel.pt
Link Comercial/Editora (Hiperlink): https://www.lidel.pt

Autor(es): Ferreira, Mariana
Título: Sinalização Médica de Lesões por Violência Doméstica nos Serviços de Urgência
Detalhes: Acta Médica Portuguesa, 2021.
Link Comercial/Editora (Texto): https://www.actamedicaportuguesa.com
Link Comercial/Editora (Hiperlink): https://www.actamedicaportuguesa.com

Autor(es): Teixeira, António
Título: O papel do Médico de Família no Diagnóstico Clínico da Violência contra a Mulher
Detalhes: ICBAS, Universidade do Porto, 2024.
Link de Acesso Livre (Texto): https://noticias.up.pt/2024/06/03/medicos-de-familia-alertam-para-barreiras-no-combate-a-violencia-domestica/
Link de Acesso Livre (Hiperlink): https://noticias.up.pt/2024/06/03/medicos-de-familia-alertam-para-barreiras-no-combate-a-violencia-domestica/

PARTE II: OBRAS ESTRANGEIRAS (SELEÇÃO)

1. ÁREA JURÍDICA
Autor(es): Australasian Institute of Judicial Administration (AIJA)
Título: National Domestic and Family Violence Bench Book
Detalhes: AIJA, 2025.
Link de Acesso Livre (Texto): https://aija.org.au/publications/national-domestic-and-family-violence-bench-book/
Link de Acesso Livre (Hiperlink): https://aija.org.au/publications/national-domestic-and-family-violence-bench-book/

Autor(es): Schneider, Elizabeth M.
Título: The Violence of Privacy: Domestic Violence, the State, and Legal Power
Detalhes: Harvard Law Review, Vol. 104, N.º 5, 1991.
Link Comercial/Editora (Texto): https://www.jstor.org
Link Comercial/Editora (Hiperlink): https://www.jstor.org

Autor(es): Cretney, Stephen
Título: Family Law and Domestic Violence: Policy and Practice
Detalhes: Oxford University Press, 2010.
Link Comercial/Editora (Texto): https://global.oup.com
Link Comercial/Editora (Hiperlink): https://global.oup.com

2. ÁREA DAS PERÍCIAS (FORENSE E INVESTIGAÇÃO)
Autor(es): Jackson, Rebecca; Davies, Graham
Título: Forensic Psychology and Domestic Violence: Forensic Assessment
Detalhes: Routledge, 2019.
Link Comercial/Editora (Texto): https://www.routledge.com
Link Comercial/Editora (Hiperlink): https://www.routledge.com

Autor(es): Kropp, P. Randall; Hart, Stephen D.
Título: The Spousal Assault Risk Assessment Guide (SARA): Reliability and Validity
Detalhes: Journal of Interpersonal Violence, Vol. 15, 2000.
Link Comercial/Editora (Texto): https://journals.sagepub.com
Link Comercial/Editora (Hiperlink): https://journals.sagepub.com

3. ÁREA DA PSICOLOGIA
Autor(es): Walker, Lenore E. A.
Título: The Battered Woman Syndrome
Detalhes: 4.ª Edição, Springer Publishing Company, 2017.
Link Comercial/Editora (Texto): https://www.springerpub.com
Link Comercial/Editora (Hiperlink): https://www.springerpub.com

Autor(es): Skafida, Valeria
Título: Mothers, Children and Domestic Violence and Abuse
Detalhes: Routledge, 2025.
Link Comercial/Editora (Texto): https://www.routledge.com/Domestic-Abuse-and-Intimate-Partner-Violence/book-series/DAIPV
Link Comercial/Editora (Hiperlink): https://www.routledge.com/Domestic-Abuse-and-Intimate-Partner-Violence/book-series/DAIPV

Autor(es): Dutton, Donald G.
Título: The Psychological Profile of the Domestic Abuser
Detalhes: Psychological Bulletin, Vol. 128, 2002.
Link Comercial/Editora (Texto): https://psycnet.apa.org
Link Comercial/Editora (Hiperlink): https://psycnet.apa.org

Autor(es): Herman, Judith Lewis
Título: Trauma and Recovery: The Aftermath of Violence, From Domestic Abuse to Political Terror
Detalhes: Basic Books, 2015.
Link Comercial/Editora (Texto): https://www.basicbooks.com
Link Comercial/Editora (Hiperlink): https://www.basicbooks.com

4. ÁREA DA MEDICINA e SAÚDE PÚBLICA
Autor(es): National Center for Injury Prevention and Control
Título: Domestic Violence: Intimate Partner Violence Clinical Assessment
Detalhes: StatPearls Publishing / National Institutes of Health (NIH), 2023.
Link de Acesso Livre (Texto): https://www.ncbi.nlm.nih.gov/books/NBK499891/
Link de Acesso Livre (Hiperlink): https://www.ncbi.nlm.nih.gov/books/NBK499891/

Autor(es): Campbell, Jacquelyn C., et al.
Título: Risk Factors for Femicide in Abusive Relationships: Results from a Multisite Case-Control Study
Detalhes: American Journal of Public Health (AJPH), Vol. 93, N.º 7, 2003.
Link de Acesso Livre (Texto): https://ajph.aphapublications.org/doi/full/10.2105/AJPH.93.7.1089
Link de Acesso Livre (Hiperlink): https://ajph.aphapublications.org/doi/full/10.2105/AJPH.93.7.1089
`;
