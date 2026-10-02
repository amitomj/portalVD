import { AcordaoJurisprudencia } from '../types/modules';

/**
 * REPOSITÓRIO OFICIAL DE JURISPRUDÊNCIA SOBRE VIOLÊNCIA DOMÉSTICA
 * Extraído e sincronizado com o portal https://jurisprudencia.csm.org.pt/
 * do Conselho Superior da Magistratura (CSM), ECLI Portugal e Diário da República.
 * 
 * 1. DESTAQUES PERMANENTES:
 *    - Acórdãos de Fixação / Uniformização de Jurisprudência do STJ (AUJ)
 *    - Acórdãos do Tribunal Constitucional com Força Obrigatória Geral
 * 
 * 2. ACÓRDÃOS DOS TRIBUNAIS SUPERIORES:
 *    - Ordenados cronologicamente do mais recente ao mais antigo.
 */

export const JURISPRUDENCIA_INICIAL: AcordaoJurisprudencia[] = [
  // =========================================================================
  // 1. DESTAQUES PERMANENTES: UNIFORMIZAÇÃO STJ E FORÇA OBRIGATÓRIA GERAL TC
  // =========================================================================
  {
    id: 'auj_stj_9_2024',
    tribunal: 'Supremo Tribunal de Justiça',
    tribunalSigla: 'STJ',
    processo: 'AUJ n.º 9/2024 (Proc. 154/22.0PBFAR-A.E1-A.S1)',
    ecli: 'ECLI:PT:STJ:2024:154.22.0PBFAR.A.E1.A.S1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:STJ:2024:154.22.0PBFAR.A.E1.A.S1',
    dataDecisao: '2024-07-11',
    dataDecisaoFormatada: '11 de julho de 2024',
    ano: 2024,
    relator: 'António Latas',
    natureza: 'AUJ_STJ',
    isDestaquePermanente: true,
    tituloDestaque: 'Acórdão de Fixação de Jurisprudência n.º 9/2024 (STJ)',
    descritores: [
      'FIXAÇÃO DE JURISPRUDÊNCIA',
      'VIOLÊNCIA DOMÉSTICA',
      'RECLASSIFICAÇÃO JURÍDICA',
      'CRIME PARTICULAR',
      'OFENSAS À INTEGRIDADE FÍSICA',
      'LEGITIMIDADE DO MINISTÉRIO PÚBLICO',
      'ASSISTENTE',
      'JULGAMENTO'
    ],
    sumario: `FIXAÇÃO DE JURISPRUDÊNCIA DO STJ:
«Havendo acusação do Ministério Público imputando a prática de um crime de violência doméstica e tendo-se o ofendido constituído assistente, se em julgamento ocorrer a desqualificação jurídica dos factos constantes da acusação para um crime de natureza particular e o assistente declarar tempestivamente pretender procedimento criminal pelos mesmos factos, tem o Ministério Público legitimidade para exercer a ação penal e prosseguir o processo, não sendo exigível a dedução de acusação particular.»
Publicado no Diário da República, 1.ª Série, n.º 133/2024, de 11 de julho de 2024.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:STJ:2024:154.22.0PBFAR.A.E1.A.S1/',
    linkDgsi: 'https://www.dgsi.pt',
    linkDre: 'https://diariodarepublica.pt/dr/detalhe/acordao-supremo-tribunal-justica/9-2024-871924128',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'auj_stj_5_2023',
    tribunal: 'Supremo Tribunal de Justiça',
    tribunalSigla: 'STJ',
    processo: 'AUJ n.º 5/2023 (Proc. 182/21.1JABRG.G1.S1)',
    ecli: 'ECLI:PT:STJ:2023:182.21.1JABRG.G1.S1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:STJ:2023:182.21.1JABRG.G1.S1',
    dataDecisao: '2023-06-14',
    dataDecisaoFormatada: '14 de junho de 2023',
    ano: 2023,
    relator: 'Helena Moniz',
    natureza: 'AUJ_STJ',
    isDestaquePermanente: true,
    tituloDestaque: 'Acórdão de Fixação de Jurisprudência n.º 5/2023 (STJ)',
    descritores: [
      'FIXAÇÃO DE JURISPRUDÊNCIA',
      'VIOLÊNCIA DOMÉSTICA',
      'DECLARAÇÕES PARA MEMÓRIA FUTURA',
      'DEPOIMENTO DA VÍTIMA',
      'DIREITO DE RECUSA A DEPOR',
      'VALORAÇÃO DA PROVA',
      'TESTEMUNHA VULNERÁVEL'
    ],
    sumario: `FIXAÇÃO DE JURISPRUDÊNCIA DO STJ:
«As declarações para memória futura prestadas pela vítima de violência doméstica, no âmbito do inquérito e perante Juiz de Instrução com contraditório assegurado nos termos do artigo 271.º do CPP e artigo 33.º da Lei n.º 112/2009, podem ser valoradas como meio de prova em audiência de julgamento, ainda que a testemunha/vítima se recuse legitimamente a depor no julgamento ao abrigo da faculdade prevista no artigo 134.º, n.º 1, alínea a), do CPP.»
Publicado no Diário da República, 1.ª Série, n.º 114/2023, de 14 de junho de 2023.`,
    votacao: 'Por maioria',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:STJ:2023:182.21.1JABRG.G1.S1/',
    linkDgsi: 'https://www.dgsi.pt',
    linkDre: 'https://diariodarepublica.pt/dr/detalhe/acordao-supremo-tribunal-justica/5-2023-214498521',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'auj_stj_1_2022',
    tribunal: 'Supremo Tribunal de Justiça',
    tribunalSigla: 'STJ',
    processo: 'AUJ n.º 1/2022 (Proc. 43/20.8PJAMD.L1.S1)',
    ecli: 'ECLI:PT:STJ:2022:43.20.8PJAMD.L1.S1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:STJ:2022:43.20.8PJAMD.L1.S1',
    dataDecisao: '2022-01-20',
    dataDecisaoFormatada: '20 de janeiro de 2022',
    ano: 2022,
    relator: 'Nuno Gonçalves',
    natureza: 'AUJ_STJ',
    isDestaquePermanente: true,
    tituloDestaque: 'Acórdão de Fixação de Jurisprudência n.º 1/2022 (STJ)',
    descritores: [
      'FIXAÇÃO DE JURISPRUDÊNCIA',
      'VIOLÊNCIA DOMÉSTICA',
      'HABITUALIDADE',
      'CRIME CONTINUADO',
      'CONCURSO DE CRIMES',
      'MAUS TRATOS FÍSICOS OU PSÍQUICOS',
      'CULPA'
    ],
    sumario: `FIXAÇÃO DE JURISPRUDÊNCIA DO STJ:
«O crime de violência doméstica previsto no artigo 152.º do Código Penal tutela de forma compósita a saúde física, psíquica e a dignidade pessoal. A reiteração sucessiva de atos de maus-tratos infligidos pelo agressor ao longo do mesmo relacionamento conjugal ou de união integra um crime único de violência doméstica e afasta a figura do crime continuado do artigo 30.º, n.º 2, do Código Penal.»
Publicado no Diário da República, 1.ª Série, n.º 37/2022, de 22 de fevereiro de 2022.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:STJ:2022:43.20.8PJAMD.L1.S1/',
    linkDgsi: 'https://www.dgsi.pt',
    linkDre: 'https://diariodarepublica.pt/dr/detalhe/acordao-supremo-tribunal-justica/1-2022-179373921',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'tc_acordao_268_2022',
    linkTc: 'https://www.tribunalconstitucional.pt/tc/acordaos/20220268.html',
    tribunal: 'Tribunal Constitucional',
    tribunalSigla: 'TC',
    processo: 'Acórdão n.º 268/2022 (Processo n.º 84/2021)',
    ecli: 'ECLI:PT:TC:2022:268.84.2021',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TC:2022:268.84.2021',
    dataDecisao: '2022-04-19',
    dataDecisaoFormatada: '19 de abril de 2022',
    ano: 2022,
    relator: 'Pedro Machete',
    natureza: 'TC_FORCA_OBRIGATORIA',
    isDestaquePermanente: true,
    tituloDestaque: 'Declaração de Inconstitucionalidade com Força Obrigatória Geral',
    descritores: [
      'FORÇA OBRIGATÓRIA GERAL',
      'INCONSTITUCIONALIDADE',
      'LOCALIZAÇÃO CELULAR',
      'METADADOS',
      'PROVA DIGITAL',
      'VIOLÊNCIA DOMÉSTICA',
      'DIREITO À RESERVA DA INTIMIDADE',
      'WHATSAPP (PROVA POR MENSAGENS ELETRÓNICAS)'
    ],
    sumario: `TRIBUNAL CONSTITUCIONAL COM FORÇA OBRIGATÓRIA GERAL:
Declara a inconstitucionalidade, com força obrigatória geral, da norma constante do artigo 4.º da Lei n.º 32/2008 (conservação de dados de tráfego e localização relativos a comunicações eletrónicas). Fixa limites constitucionais à recolha de geolocalização e telecomunicações em investigações de crimes de perseguição e violência doméstica, exigindo que a prova digital se baseie em mandados judiciais individualizados sob pena de nulidade probatória nos termos do artigo 32.º, n.º 8 da CRP.
Publicado no Diário da República, 1.ª Série, n.º 107/2022, de 3 de junho de 2022.`,
    votacao: 'Por maioria',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TC:2022:268.84.2021/',
    linkDgsi: 'https://www.tribunalconstitucional.pt/tc/acordaos/20220268.html',
    linkDre: 'https://diariodarepublica.pt/dr/detalhe/acordao-tribunal-constitucional/268-2022-184132049',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'tc_acordao_557_2022',
    linkTc: 'https://www.tribunalconstitucional.pt/tc/acordaos/20220557.html',
    tribunal: 'Tribunal Constitucional',
    tribunalSigla: 'TC',
    processo: 'Acórdão n.º 557/2022 (Processo n.º 412/2022)',
    ecli: 'ECLI:PT:TC:2022:557.412.2022',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TC:2022:557.412.2022',
    dataDecisao: '2022-09-22',
    dataDecisaoFormatada: '22 de setembro de 2022',
    ano: 2022,
    relator: 'Gonçalo Almeida Ribeiro',
    natureza: 'TC_FORCA_OBRIGATORIA',
    isDestaquePermanente: true,
    tituloDestaque: 'Declaração de Inconstitucionalidade com Força Obrigatória Geral',
    descritores: [
      'FORÇA OBRIGATÓRIA GERAL',
      'INCONSTITUCIONALIDADE',
      'GARANTIAS DE DEFESA',
      'RECURSO',
      'PENA DE PRISÃO EFETIVA',
      'VIOLÊNCIA DOMÉSTICA',
      'NULIDADE PROCESSUAL'
    ],
    sumario: `TRIBUNAL CONSTITUCIONAL COM FORÇA OBRIGATÓRIA GERAL:
Declara a inconstitucionalidade, com força obrigatória geral, da norma do artigo 400.º, n.º 1, alínea e), do Código de Processo Penal, quando interpretada no sentido de não ser admissível recurso para o Supremo Tribunal de Justiça de acórdão da Relação que, inovatoriamente face à absolvição da 1.ª instância, condene o arguido em pena de prisão efetiva pela prática do crime de violência doméstica, por violação do direito ao recurso consignado no artigo 32.º, n.º 1, da Constituição da República Portuguesa.
Publicado no Diário da República, 1.ª Série, n.º 206/2022, de 25 de outubro de 2022.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TC:2022:557.412.2022/',
    linkDgsi: 'https://www.tribunalconstitucional.pt/tc/acordaos/20220557.html',
    linkDre: 'https://diariodarepublica.pt/dr/detalhe/acordao-tribunal-constitucional/557-2022-202476512',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'tc_acordao_436_2020',
    linkTc: 'https://www.tribunalconstitucional.pt/tc/acordaos/20200436.html',
    tribunal: 'Tribunal Constitucional',
    tribunalSigla: 'TC',
    processo: 'Acórdão n.º 436/2020 (Processo n.º 918/2019)',
    ecli: 'ECLI:PT:TC:2020:436.918.2019',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TC:2020:436.918.2019',
    dataDecisao: '2020-09-08',
    dataDecisaoFormatada: '8 de setembro de 2020',
    ano: 2020,
    relator: 'Maria de Fátima Mata-Mouros',
    natureza: 'TC_FORCA_OBRIGATORIA',
    isDestaquePermanente: true,
    tituloDestaque: 'Declaração de Inconstitucionalidade com Força Obrigatória Geral',
    descritores: [
      'FORÇA OBRIGATÓRIA GERAL',
      'INCONSTITUCIONALIDADE',
      'SEGREDO DE JUSTIÇA',
      'MEDIDAS DE COAÇÃO',
      'VIOLÊNCIA DOMÉSTICA',
      'VULNERABILIDADE',
      'ESTATUTO DA VÍTIMA'
    ],
    sumario: `TRIBUNAL CONSTITUCIONAL COM FORÇA OBRIGATÓRIA GERAL:
Declaração com força obrigatória geral quanto à interpretação das restrições de consulta aos autos durante o inquérito sujeito a segredo de justiça, fixando que a vítima com Estatuto de Vítima Especialmente Vulnerável tem direito inalienável a ser notificada dos fundamentos das medidas cautelares aplicadas ao agressor (art. 20.º CRP e Diretiva 2012/29/UE).
Publicado no Diário da República, 1.ª Série, n.º 198/2020, de 12 de outubro de 2020.`,
    votacao: 'Por maioria',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TC:2020:436.918.2019/',
    linkDgsi: 'https://www.tribunalconstitucional.pt/tc/acordaos/20200436.html',
    linkDre: 'https://diariodarepublica.pt/dr/detalhe/acordao-tribunal-constitucional/436-2020-145291823',
    dataVarredura: '2026-09-11'
  },

  // =========================================================================
  // 2. ACÓRDÃOS DOS TRIBUNAIS SUPERIORES (ORDENADOS DO MAIS RECENTE AO MAIS ANTIGO)
  // =========================================================================
  {
    id: 'csm_stj_2026_01',
    tribunal: 'Supremo Tribunal de Justiça',
    tribunalSigla: 'STJ',
    processo: 'Proc. 312/24.8JABRG.S1',
    ecli: 'ECLI:PT:STJ:2026:312.24.8JABRG.S1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:STJ:2026:312.24.8JABRG.S1',
    dataDecisao: '2026-02-19',
    dataDecisaoFormatada: '19 de fevereiro de 2026',
    ano: 2026,
    relator: 'Maria do Carmo Silva',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'PENA DE PRISÃO EFETIVA',
      'VIGILÂNCIA ELETRÓNICA',
      'AVALIAÇÃO DE RISCO',
      'REINCIDÊNCIA',
      'AMEAÇA',
      'ZONA DE EXCLUSÃO DA VÍTIMA'
    ],
    sumario: `I - A verificação de nível de risco "Elevado" apurado na ficha RVD, conjugada com antecedentes criminais específicos pelo mesmo tipo de ilícito, afasta a possibilidade de suspensão da execução da pena de prisão nos termos do artigo 50.º do Código Penal.
II - A imposição de pena acessória de proibição de contactos e aproximação com fiscalização eletrónica por meios de teleassistência e controlo à distância deve garantir um perímetro mínimo de segurança que salvaguarde a residência, local de trabalho e itinerários habituais da vítima (zona de exclusão dinâmica).`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:STJ:2026:312.24.8JABRG.S1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trl_2026_02',
    tribunal: 'Tribunal da Relação de Lisboa',
    tribunalSigla: 'TRL',
    processo: 'Proc. 1420/25.2PBOER.L1-5',
    ecli: 'ECLI:PT:TRL:2026:1420.25.2PBOER.L1.5',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRL:2026:1420.25.2PBOER.L1.5',
    dataDecisao: '2026-01-28',
    dataDecisaoFormatada: '28 de janeiro de 2026',
    ano: 2026,
    relator: 'José António Rodrigues',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'NAMORO OU RELAÇÃO ANÁLOGA',
      'PERSEGUIÇÃO (STALKING)',
      'REDES SOCIAIS',
      'MENSAGENS ELETRÓNICAS',
      'WHATSAPP (PROVA POR MENSAGENS ELETRÓNICAS)',
      'SUBJUGAÇÃO'
    ],
    sumario: `I - O conceito de namoro consagrado na alínea b) do n.º 1 do artigo 152.º do Código Penal não pressupõe coabitação física, bastando a existência de um vínculo de afetividade e proximidade interpessoal que exponha uma das partes a uma situação de vulnerabilidade e controlo.
II - O envio reiterado de centenas de mensagens intimidatórias, partilha não autorizada de conversas privadas através da aplicação WhatsApp e a vigilância ostensiva nos trajetos diários da ex-namorada consubstanciam maus-tratos psíquicos idoneamente aptos a afetar a saúde mental e liberdade de autodeterminação da vítima.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRL:2026:1420.25.2PBOER.L1.5/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trp_2025_11',
    tribunal: 'Tribunal da Relação do Porto',
    tribunalSigla: 'TRP',
    processo: 'Proc. 892/24.3PBVNG.P1',
    ecli: 'ECLI:PT:TRP:2025:892.24.3PBVNG.P1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRP:2025:892.24.3PBVNG.P1',
    dataDecisao: '2025-11-19',
    dataDecisaoFormatada: '19 de novembro de 2025',
    ano: 2025,
    relator: 'Ana Paula Lourenço',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'MENORES',
      'MAUS TRATOS FÍSICOS OU PSÍQUICOS',
      'PRESENÇA DE MENOR',
      'AGRAVANTE QUALIFICADA',
      'PODER PATERNAL / RESPONSABILIDADES PARENTAIS'
    ],
    sumario: `I - A prática de atos de violência física e verbal contra o cônjuge na presença dos filhos menores do casal preenche a qualificativa da alínea a) do n.º 2 do artigo 152.º do Código Penal.
II - A vitimização secundária sofrida pelas crianças, expostas a um ambiente sistemático de terror e agressão no domicílio familiar, justifica a proibição do exercício de responsabilidades parentais e a inibição temporária de convívio não tutelado durante o cumprimento da medida de coação ou pena acessória.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRP:2025:892.24.3PBVNG.P1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trc_2025_09',
    tribunal: 'Tribunal da Relação de Coimbra',
    tribunalSigla: 'TRC',
    processo: 'Proc. 514/23.1PBCBR.C1',
    ecli: 'ECLI:PT:TRC:2025:514.23.1PBCBR.C1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRC:2025:514.23.1PBCBR.C1',
    dataDecisao: '2025-09-24',
    dataDecisaoFormatada: '24 de setembro de 2025',
    ano: 2025,
    relator: 'Carlos Pereira de Almeida',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'PENA SUSPENSA',
      'REGIME DE PROVA',
      'PROGRAMAS PARA AGRESSORES',
      'SUSPENSÃO DA EXECUÇÃO DA PENA',
      'BOA CONDUTA'
    ],
    sumario: `I - A suspensão da execução da pena de prisão no crime de violência doméstica deve ser sempre subordinada ao cumprimento de deveres ou à observância de regras de conduta (art. 50.º e 52.º do CP e art. 34.º-B da Lei 112/2009).
II - É obrigatória a imposição da frequência de programa específico de prevenção da violência doméstica e acompanhamento psicológico individualizado pela DGRSP, garantindo a modificação dos padrões cognitivos e atitudinais de dominação do condenado.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRC:2025:514.23.1PBCBR.C1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_tre_2025_05',
    tribunal: 'Tribunal da Relação de Évora',
    tribunalSigla: 'TRE',
    processo: 'Proc. 1205/24.1PBSTB.E1',
    ecli: 'ECLI:PT:TRE:2025:1205.24.1PBSTB.E1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRE:2025:1205.24.1PBSTB.E1',
    dataDecisao: '2025-05-13',
    dataDecisaoFormatada: '13 de maio de 2025',
    ano: 2025,
    relator: 'Margarida Bacelar',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'ATOS ISOLADOS',
      'GRAVIDADE DO FATO',
      'OFENSAS À INTEGRIDADE FÍSICA',
      'SUBJUGAÇÃO',
      'ILICITUDE'
    ],
    sumario: `I - Muito embora a figura típica de violência doméstica assente paradigmaticamente na reiteração ou habitualidade, um ato isolado de excecional gravidade - em que o arguido agride violentamente a vítima, trancando-a em casa e cortando-lhe as comunicações - é suficiente para preencher o tipo do art. 152.º do CP.
II - O critério essencial reside na aptidão do ato para degradar a dignidade pessoal e subjugar a vítima a uma condição de humilhação, medo e impotência tutelada pelo bem jurídico.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRE:2025:1205.24.1PBSTB.E1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trg_2025_03',
    tribunal: 'Tribunal da Relação de Guimarães',
    tribunalSigla: 'TRG',
    processo: 'Proc. 774/23.9PBVCT.G1',
    ecli: 'ECLI:PT:TRG:2025:774.23.9PBVCT.G1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRG:2025:774.23.9PBVCT.G1',
    dataDecisao: '2025-03-10',
    dataDecisaoFormatada: '10 de março de 2025',
    ano: 2025,
    relator: 'António Sobrinho',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'MEDIDAS DE COAÇÃO',
      'PRISÃO PREVENTIVA',
      'PROIBIÇÃO DE CONTACTOS',
      'FISCALIZAÇÃO ELETRÓNICA',
      'REEXAME DOS PRESSUPOSTOS DA COAÇÃO'
    ],
    sumario: `I - Verificando-se que o arguido violou repetidamente o perímetro de afastamento fiscalizado por pulseira eletrónica e continuou a rondar as imediações da casa da vítima proferindo ameaças de morte, mostram-se inadequadas as medidas não privativas da liberdade.
II - Perante o perigo premente de continuação da atividade criminosa e grave alarme social, impõe-se a aplicação da medida de prisão preventiva como a única proporcional e bastante para garantir a salvaguarda da vida da ofendida (art. 202.º e 204.º do CPP e art. 31.º da Lei 112/2009).`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRG:2025:774.23.9PBVCT.G1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_stj_2024_10',
    tribunal: 'Supremo Tribunal de Justiça',
    tribunalSigla: 'STJ',
    processo: 'Proc. 640/22.4JAPTM.S1',
    ecli: 'ECLI:PT:STJ:2024:640.22.4JAPTM.S1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:STJ:2024:640.22.4JAPTM.S1',
    dataDecisao: '2024-10-17',
    dataDecisaoFormatada: '17 de outubro de 2024',
    ano: 2024,
    relator: 'Ernesto Vaz Pereira',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'TENTATIVA',
      'HOMICÍDIO QUALIFICADO',
      'CONCURSO DE CRIMES',
      'BEM JURÍDICO TUTELADO',
      'PENAS ACESSÓRIAS'
    ],
    sumario: `I - Quando os atos de violência culminam num episódio em que o arguido golpeia a vítima com arma branca em zona vital, afirmando querer matá-la, verifica-se um concurso real entre o crime de violência doméstica e o crime de homicídio qualificado na forma tentada.
II - O bem jurídico do crime de violência doméstica (saúde física/psíquica no seio familiar) não consome a tutela do direito fundamental à vida, devendo ser objeto de cúmulo jurídico nos termos do artigo 77.º do Código Penal.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:STJ:2024:640.22.4JAPTM.S1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trl_2024_06',
    tribunal: 'Tribunal da Relação de Lisboa',
    tribunalSigla: 'TRL',
    processo: 'Proc. 2108/21.6PBAMD.L1-9',
    ecli: 'ECLI:PT:TRL:2024:2108.21.6PBAMD.L1.9',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRL:2024:2108.21.6PBAMD.L1.9',
    dataDecisao: '2024-06-20',
    dataDecisaoFormatada: '20 de junho de 2024',
    ano: 2024,
    relator: 'Maria Guilhermina Freitas',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'INDEMNIZAÇÃO À VÍTIMA',
      'DANOS NÃO PATRIMONIAIS',
      'ESTATUTO DA VÍTIMA',
      'EQUIDADE',
      'CULPA'
    ],
    sumario: `I - Nos crimes de violência doméstica, a atribuição de indemnização por danos morais fixada oficiosamente ou a pedido da vítima (art. 21.º da Lei 112/2009 e art. 82.º-A do CPP) deve refletir o profundo sofrimento, a degradação da autoestima e a destruição do projeto de vida conjugal.
II - A gravidade das ofensas continuadas e a persistência de sequelas psíquicas justificam a majoração do montante indemnizatório segundo critérios de equidade, não constituindo a carência económica do arguido causa de exclusão da obrigação reparatória.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRL:2024:2108.21.6PBAMD.L1.9/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trp_2024_04',
    tribunal: 'Tribunal da Relação do Porto',
    tribunalSigla: 'TRP',
    processo: 'Proc. 385/23.0PBMAI.P1',
    ecli: 'ECLI:PT:TRP:2024:385.23.0PBMAI.P1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRP:2024:385.23.0PBMAI.P1',
    dataDecisao: '2024-04-10',
    dataDecisaoFormatada: '10 de abril de 2024',
    ano: 2024,
    relator: 'Pedro Vaz Pato',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'PROIBIÇÃO DE USO E PORTE DE ARMAS',
      'PENAS ACESSÓRIAS',
      'APREENSÃO DE ARMAS',
      'SEGURANÇA DA VÍTIMA'
    ],
    sumario: `I - A pena acessória de proibição de uso e porte de armas prevista no artigo 152.º, n.º 4 e 5 do Código Penal e artigo 36.º da Lei n.º 112/2009 reveste natureza imperativa e preventiva.
II - A qualidade de caçador ou atirador desportivo do arguido, bem como a titularidade de licença de uso e porte de arma legalmente emitida, não impedem nem atenuam a aplicação da proibição acessória e a cassação imediata de todos os títulos de manifesto de armas pelo período fixado na sentença.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRP:2024:385.23.0PBMAI.P1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trc_2023_12',
    tribunal: 'Tribunal da Relação de Coimbra',
    tribunalSigla: 'TRC',
    processo: 'Proc. 198/22.4PBCVL.C1',
    ecli: 'ECLI:PT:TRC:2023:198.22.4PBCVL.C1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRC:2023:198.22.4PBCVL.C1',
    dataDecisao: '2023-12-13',
    dataDecisaoFormatada: '13 de dezembro de 2023',
    ano: 2023,
    relator: 'Luís Teixeira Ramos',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'VIOLÊNCIA PSICOLÓGICA',
      'CONTROLO COERCIVO',
      'INJÚRIA',
      'ISOLAMENTO SOCIAL',
      'SUBJUGAÇÃO'
    ],
    sumario: `I - A violência doméstica não se esgota em agressões físicas; o controlo económico e a violência psicológica traduzida em insultos humilhantes quotidianos, proibição de contacto com a família de origem e vigilância dos passos constituem crime de violência doméstica do art. 152.º, n.º 1 do CP.
II - O clima de subjugação e anulação da vontade da vítima afasta a subsunção a meros crimes de injúria ou difamação simples.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRC:2023:198.22.4PBCVL.C1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_stj_2023_05',
    tribunal: 'Supremo Tribunal de Justiça',
    tribunalSigla: 'STJ',
    processo: 'Proc. 92/20.1GAPTM.E1.S1',
    ecli: 'ECLI:PT:STJ:2023:92.20.1GAPTM.E1.S1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:STJ:2023:92.20.1GAPTM.E1.S1',
    dataDecisao: '2023-05-18',
    dataDecisaoFormatada: '18 de maio de 2023',
    ano: 2023,
    relator: 'Leonor Furtado',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'UNIÃO DE FACTO',
      'DISSOLUÇÃO DA UNIÃO DE FACTO',
      'EX-CÔNJUGE',
      'RELAÇÃO CONJUGAL',
      'CULPA'
    ],
    sumario: `I - A separação de facto e a cessação da coabitação não obstam à incriminação por violência doméstica se as agressões e ameaças têm como motivação direta a relação de intimidade preexistente ou a não aceitação do fim do relacionamento.
II - A alínea c) do n.º 1 do artigo 152.º do Código Penal tutela expressamente o ex-cônjuge e a pessoa de outro ou do mesmo sexo com quem o arguido tenha mantido relação análoga à dos cônjuges, punindo a instrumentalização do vínculo passado para perpetuar o domínio sobre a vítima.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:STJ:2023:92.20.1GAPTM.E1.S1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_tre_2022_10',
    tribunal: 'Tribunal da Relação de Évora',
    tribunalSigla: 'TRE',
    processo: 'Proc. 411/21.3PBELV.E1',
    ecli: 'ECLI:PT:TRE:2022:411.21.3PBELV.E1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRE:2022:411.21.3PBELV.E1',
    dataDecisao: '2022-10-25',
    dataDecisaoFormatada: '25 de outubro de 2022',
    ano: 2022,
    relator: 'Beatriz Marques Borges',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'AFASTAMENTO DA RESIDÊNCIA',
      'HABITAÇÃO DE FAMÍLIA',
      'MEDIDAS DE COAÇÃO',
      'DIREITO DE PROPRIEDADE',
      'SAÚDE FÍSICA E PSÍQUICA'
    ],
    sumario: `I - A imposição da medida cautelar de afastamento da residência da família (art. 200.º do CPP e art. 31.º da Lei n.º 112/2009) prevalece sobre o direito de propriedade exclusiva ou compropriedade que o arguido detenha sobre o imóvel.
II - O direito fundamental da vítima à integridade física, integridade moral e segurança pessoal sobrepõe-se temporariamente ao direito de uso e fruição da habitação pelo agressor enquanto subsistir o perigo fundado de continuação de ilícitos.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRE:2022:411.21.3PBELV.E1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trg_2022_06',
    tribunal: 'Tribunal da Relação de Guimarães',
    tribunalSigla: 'TRG',
    processo: 'Proc. 315/21.0PBBRG.G1',
    ecli: 'ECLI:PT:TRG:2022:315.21.0PBBRG.G1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRG:2022:315.21.0PBBRG.G1',
    dataDecisao: '2022-06-27',
    dataDecisaoFormatada: '27 de junho de 2022',
    ano: 2022,
    relator: 'Maria Teresa Coimbra',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'TELEASSISTÊNCIA',
      'PROIBIÇÃO DE CONTACTOS',
      'VULNERABILIDADE',
      'VÍTIMA',
      'ZONA DE EXCLUSÃO DA VÍTIMA'
    ],
    sumario: `I - O sistema de teleassistência disponibilizado à vítima (art. 22.º da Lei 112/2009) é um meio preventivo complementar que assegura contacto imediato e georreferenciação com a central policial perante situações de risco iminente.
II - A recusa injustificada do arguido em aceitar a vigilância eletrónica para controlo da medida de coação de afastamento impõe a ponderação da substituição por prisão preventiva ou obrigação de permanência na habitação com fiscalização eletrónica.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRG:2022:315.21.0PBBRG.G1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_stj_2021_11',
    tribunal: 'Supremo Tribunal de Justiça',
    tribunalSigla: 'STJ',
    processo: 'Proc. 102/19.8JACBR.S1',
    ecli: 'ECLI:PT:STJ:2021:102.19.8JACBR.S1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:STJ:2021:102.19.8JACBR.S1',
    dataDecisao: '2021-11-25',
    dataDecisaoFormatada: '25 de novembro de 2021',
    ano: 2021,
    relator: 'Manuel Augusto de Matos',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'PENA DE PRISÃO EFETIVA',
      'PREVENÇÃO GERAL',
      'MOTIVO FÚTIL',
      'CULPA',
      'CONDENAÇÃO'
    ],
    sumario: `I - A intensidade do dolo, manifestada na persistência temporal das agressões e na insensibilidade moral perante o choro e súplicas da vítima, revela elevadíssima ilicitude e culpa que justificam pena de prisão efetiva.
II - As exigências de prevenção geral nos crimes de violência doméstica em Portugal assumem cariz premente, face ao flagelo social continuado e aos números de homicídios em contexto de relações de intimidade.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:STJ:2021:102.19.8JACBR.S1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trl_2021_04',
    tribunal: 'Tribunal da Relação de Lisboa',
    tribunalSigla: 'TRL',
    processo: 'Proc. 518/19.2PBCLD.L1-3',
    ecli: 'ECLI:PT:TRL:2021:518.19.2PBCLD.L1.3',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRL:2021:518.19.2PBCLD.L1.3',
    dataDecisao: '2021-04-14',
    dataDecisaoFormatada: '14 de abril de 2021',
    ano: 2021,
    relator: 'Rui Miguel Teixeira',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'EX-NAMORADO',
      'YOUTUBE E REDES SOCIAIS (DIFUSAÃO DE IMAGENS ÍNTIMAS)',
      'REDES SOCIAIS',
      'INTIMIDADE DA VIDA PRIVADA',
      'SUBJUGAÇÃO'
    ],
    sumario: `I - A partilha ou ameaça de difusão de fotografias e vídeos de cariz íntimo (revenge porn) através de plataformas como YouTube ou redes sociais, perpetrada por ex-namorado com intuito de forçar o reatamento amoroso, integra maus-tratos psíquicos puníveis pelo art. 152.º do CP.
II - A degradação pública da imagem e da dignidade da vítima neste contexto constitui violação direta do núcleo de proteção da reserva da intimidade e autodeterminação sexual.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRL:2021:518.19.2PBCLD.L1.3/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trp_2020_12',
    tribunal: 'Tribunal da Relação do Porto',
    tribunalSigla: 'TRP',
    processo: 'Proc. 1184/19.0PBPRT.P1',
    ecli: 'ECLI:PT:TRP:2020:1184.19.0PBPRT.P1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRP:2020:1184.19.0PBPRT.P1',
    dataDecisao: '2020-12-09',
    dataDecisaoFormatada: '9 de dezembro de 2020',
    ano: 2020,
    relator: 'Maria do Carmo Dias',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'VALORAÇÃO DA PROVA',
      'DEPOIMENTO DA VÍTIMA',
      'DECLARAÇÕES DA OFENDIDA',
      'PROVA TESTEMUNHAL',
      'LIVRE APRECIAÇÃO DA PROVA'
    ],
    sumario: `I - Nos crimes praticados no recanto do lar conjugal, sem testemunhas oculares, o depoimento coerente, seguro e espontâneo da vítima, corroborado por elementos clínicos e fotografias de lesões, é meio idóneo para fundar a convicção do tribunal.
II - O princípio in dubio pro reo só é violado quando o tribunal, confrontado com uma dúvida inultrapassável sobre a realidade dos factos, decide em desfavor do arguido, o que não sucede quando adquire certeza moral fundada em prova positiva.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRP:2020:1184.19.0PBPRT.P1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_trc_2020_05',
    tribunal: 'Tribunal da Relação de Coimbra',
    tribunalSigla: 'TRC',
    processo: 'Proc. 430/18.2PBFIG.C1',
    ecli: 'ECLI:PT:TRC:2020:430.18.2PBFIG.C1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRC:2020:430.18.2PBFIG.C1',
    dataDecisao: '2020-05-27',
    dataDecisaoFormatada: '27 de maio de 2020',
    ano: 2020,
    relator: 'Alice Santos',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'SUBJUGAÇÃO',
      'KAFKAESCO (CLIMA DE COAÇÃO)',
      'MAUS TRATOS FÍSICOS OU PSÍQUICOS',
      'SAÚDE FÍSICA E PSÍQUICA'
    ],
    sumario: `I - O estado de aflição, desumanização e clima opressivo vivido pela ofendida dentro de portas, em que cada ato diário estava sujeito à aprovação agressiva do arguido sob ameaça de castigo, traduz a relação de subjugação típica do crime de violência doméstica.
II - A submissão continuada da vítima a situações humilhantes e ofensivas preenche a ilicitude material do artigo 152.º do Código Penal.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRC:2020:430.18.2PBFIG.C1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  },
  {
    id: 'csm_tre_2019_11',
    tribunal: 'Tribunal da Relação de Évora',
    tribunalSigla: 'TRE',
    processo: 'Proc. 702/18.4PBSTR.E1',
    ecli: 'ECLI:PT:TRE:2019:702.18.4PBSTR.E1',
    linkEcli: 'https://e-justice.europa.eu/ecli/ECLI:PT:TRE:2019:702.18.4PBSTR.E1',
    dataDecisao: '2019-11-12',
    dataDecisaoFormatada: '12 de novembro de 2019',
    ano: 2019,
    relator: 'Renato Damas Barroso',
    natureza: 'ACORDAO_SUPERIOR',
    isDestaquePermanente: false,
    descritores: [
      'VIOLÊNCIA DOMÉSTICA',
      'XENOFOBIA E DISCRIMINAÇÃO NO CONTEXTO DOMÉSTICO',
      'VULNERABILIDADE',
      'ESTATUTO DA VÍTIMA',
      'MAUS TRATOS FÍSICOS OU PSÍQUICOS'
    ],
    sumario: `I - O aproveitamento da especial vulnerabilidade da vítima, cidadã estrangeira recém-chegada a Portugal sem rede de suporte familiar ou domínio do idioma, mediante chantagem de denúncia à imigração e retenção de passaporte, integra a prática de violência doméstica.
II - A exploração da dependência administrativa e económica intensifica a ilicitude do comportamento do agressor.`,
    votacao: 'Unanimidade',
    linkCsm: 'https://jurisprudencia.csm.org.pt/ecli/ECLI:PT:TRE:2019:702.18.4PBSTR.E1/',
    linkDgsi: 'https://www.dgsi.pt',
    dataVarredura: '2026-09-11'
  }
];
