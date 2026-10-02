// Tipos para os novos módulos da aplicação: Legislação, Doutrina, Contactos Úteis e Jurisprudência

export type ModuloPrincipal = 'vd_numeros' | 'legislacao' | 'jurisprudencia' | 'doutrina' | 'contactos';
export type ModuloApp = ModuloPrincipal;

// ==========================================
// 1. MÓDULO LEGISLAÇÃO
// ==========================================
export type TipoDiploma = 
  | 'Lei'
  | 'Decreto-Lei'
  | 'Resolução da Assembleia da República'
  | 'Portaria'
  | 'Decreto Regulamentar'
  | 'Resolução do Conselho de Ministros'
  | 'Tratado / Instrumento Internacional'
  | 'Decreto do Presidente da República'
  | 'Outro';

export type NivelRelevancia = 'estruturante' | 'politica_publica' | 'regulamentar' | 'complementar';

export interface DiplomaLegislativo {
  id: string;
  tipo: TipoDiploma;
  numero: string; // Ex: "Lei n.º 112/2009" ou "Resolução da Assembleia da República n.º 233/2026"
  ano?: number; // Ex: 2026
  dataPublicacao: string; // Ex: "16 de setembro de 2009"
  titulo: string;
  descricao: string; // Informação básica descrevendo o diploma
  linkOficial: string; // Link direto para o diploma (DRE / Powerlex)
  linkPowerlex?: string; // Link no Powerlex
  origem: string; // "Powerlex (https://powerlex.altec-csm.dev/#/)" ou "DRE"
  emVigor: boolean;
  estadoVigencia?: string; // Ex: "Em vigor", "Em vigor desde 03/08/2026", "Revogado", etc.
  relevancia?: NivelRelevancia;
  relevanciaScore?: number; // 1 a 100 para ordenação de relevância
  serieDRE?: string; // "Série I"
  temas: string[];
  dataUltimaVerificacao?: string;
  statusValidacao?: 'pendente' | 'validado' | 'rejeitado';
  fonteExtracao?: string;
  nomeFicheiroOrigem?: string;
}

// ==========================================
// 2. MÓDULO DOUTRINA
// ==========================================
export type StatusValidacaoDoutrina = 'pendente' | 'validado' | 'rejeitado';

export interface ReferenciaDoutrinaria {
  id: string;
  autores: string; // Nome do autor ou múltiplos autores (obra coletiva)
  nomeObra: string; // Nome da obra / artigo / manual
  edicao: string; // Número da edição (ex: "1.ª Edição", "4.ª Edição Revista")
  anoEdicao: number | string; // Ano da edição
  nomeEditora: string; // Nome da editora ou revista científica
  
  // Documento para consulta
  temDocumento: boolean;
  documentoNome?: string;
  documentoTamanho?: number;
  documentoTipo?: string;
  documentoDataUrl?: string; // Data URL ou conteúdo texto para visualização e consulta direta
  documentoTexto?: string;
  
  // Links de acesso online
  linksAcesso: string[]; // Um ou mais links de acesso
  acessoLivre: boolean; // Se o documento for de acesso livre
  
  // Observações e temas
  resumo?: string;
  dataRegisto: string;

  // Metadados de varredura na web & validação pelo administrador
  fonteVarredura?: string; // Ex: "Editora Almedina", "Revista JULGAR (ASJP)", "CEJ", "Petrony", etc.
  statusValidacao?: StatusValidacaoDoutrina; // 'pendente' para descobertas da web a aguardar aprovação, 'validado' para visíveis
  dataDescoberta?: string;
  isbnOuIssn?: string;
  revistaOuVolume?: string;
  areaTematica?: string; // Ex: "Área Jurídica", "Área das Perícias (Forense e Investigação)", "Área da Psicologia", "Área da Medicina e Saúde Pública"
  parteOuAmbito?: string; // Ex: "Obras Nacionais (Portugal)", "Obras Estrangeiras (Seleção)"
  nomeFicheiroOrigem?: string;
}

// ==========================================
// 3. MÓDULO JURISPRUDÊNCIA (PORTAL CSM)
// ==========================================
export type TribunalJurisprudencia =
  | 'Supremo Tribunal de Justiça'
  | 'Tribunal Constitucional'
  | 'Tribunal da Relação de Lisboa'
  | 'Tribunal da Relação do Porto'
  | 'Tribunal da Relação de Coimbra'
  | 'Tribunal da Relação de Évora'
  | 'Tribunal da Relação de Guimarães';

export type NaturezaAcordao =
  | 'AUJ_STJ' // Fixação / Uniformização de Jurisprudência do STJ
  | 'TC_FORCA_OBRIGATORIA' // Tribunal Constitucional com Força Obrigatória Geral
  | 'ACORDAO_SUPERIOR'; // Acórdãos dos Tribunais Superiores

export interface AcordaoJurisprudencia {
  id: string;
  tribunal: TribunalJurisprudencia;
  tribunalSigla: 'STJ' | 'TC' | 'TRL' | 'TRP' | 'TRC' | 'TRE' | 'TRG';
  processo: string; // Ex: "154/22.0PBFAR-A.E1-A.S1" ou "Acórdão n.º 9/2024"
  ecli?: string; // Ex: "ECLI:PT:STJ:2024:154.22.0PBFAR.A.E1.A.S1"
  dataDecisao: string; // "YYYY-MM-DD"
  dataDecisaoFormatada: string; // "11 de julho de 2024"
  ano: number;
  relator: string;
  natureza: NaturezaAcordao;
  isDestaquePermanente: boolean; // True para AUJ do STJ e TC com força obrigatória geral
  tituloDestaque?: string; // Ex: "Acórdão de Fixação de Jurisprudência n.º 9/2024" ou "Força Obrigatória Geral"
  descritores: string[]; // Lista oficial de termos descritores
  sumario: string;
  decisaoTexto?: string;
  votacao?: string; // Ex: "Unanimidade"
  linkCsm: string; // Portal CSM: https://jurisprudencia.csm.org.pt/
  linkEcli?: string; // Resolucao Oficial ECLI (Portal Europeu e-Justice)
  linkDgsi?: string; // Portal DGSI
  linkDre?: string; // Diário da República
  linkTc?: string; // Tribunal Constitucional Oficial
  dataVarredura?: string;
}

// ==========================================
// 4. MÓDULO CONTACTOS ÚTEIS
// ==========================================
export type AmbitoAtuacao = 'nacional' | 'local';

export interface ContactoUtil {
  id: string;
  nome: string; // Nome da instituição / programa / serviço
  site: string;
  morada: string;
  telefone: string;
  email: string;
  municipioSede: string; // Município onde está sediada
  distritoSede: string; // Distrito onde está sediada
  ambitoAtuacao: AmbitoAtuacao; // Nacional ou Local
  municipiosAtuacao: string[]; // Lista de municípios de atuação (se local)
  
  tipoInstituicao?: 'apoio_vitima' | 'acolhimento' | 'policial' | 'judicial' | 'programa_agressores' | 'saude' | 'outro';
  horarioFuncionamento?: string;
  linhaGratuita?: boolean;
  descricao?: string;
  dataCriacao: string;
}

// ==========================================
// DADOS GEOGRÁFICOS DE PORTUGAL
// ==========================================
export interface DistritoPortugal {
  id: string;
  nome: string;
  regiao: 'Norte' | 'Centro' | 'Lisboa' | 'Alentejo' | 'Algarve' | 'Açores' | 'Madeira';
  municipios: string[];
}
