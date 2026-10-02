export type Sexo = 'M' | 'F' | 'Outro' | 'Não especificado';

export type TipoRelacao = 
  | 'conjuge'
  | 'ex_conjuge'
  | 'unido_de_facto'
  | 'ex_unido_de_facto'
  | 'namorado'
  | 'ex_namorado'
  | 'progenitor'
  | 'filho'
  | 'outro_familiar'
  | 'nao_especificada';

export type RegimeResidencia = 
  | 'casa_arrendada'
  | 'casa_cedida_gratuitamente'
  | 'casa_propria'
  | 'outro'
  | 'nao_especificado';

export type TitularidadeCasaPropria = 
  | 'arguido'
  | 'ofendida'
  | 'ambos'
  | 'nao_aplicavel'
  | 'nao_especificado';

export interface PessoaIdentificacao {
  idade: number | null;
  idadeTexto: string;
  sexo: Sexo;
  profissao: string; // Se não for clara mas indicar vencimento, preencher "Não apurada"
  vencimentoMensal: string; // Ex: "820,00 €", "1.200,00 € / mês", "Não apurado"
  habilitacoesLiterarias: string;
  antecedentesCriminais: string;
  hasAntecedentes: boolean | null;
  relacaoComOutraParte?: string;
  trechoTexto?: string;
}

export interface TiposOfensas {
  fisicas: boolean;
  detalhesFisicas: string;
  psicologicas: boolean;
  detalhesPsicologicas: string;
  sexuais: boolean;
  detalhesSexuais: string;
  patrimoniais: boolean;
  detalhesPatrimoniais: string;
}

export type TipoPericia = 
  | 'medico_legal'
  | 'psiquiatrica'
  | 'psicologica'
  | 'relatorio_social_dgrsp'
  | 'informatica'
  | 'toxicologica'
  | 'balistica'
  | 'outra';

export interface PericiasInfo {
  realizadas: boolean;
  tipos: string[]; // ex: ['Perícia Médico-Legal (INMLCF)', 'Relatório Social DGRSP']
  categorias?: TipoPericia[];
  detalhes: string;
}

export interface DecisaoJudicialVD {
  id: string; // ID no Firestore / local (ex: 'VD-001')
  seqId: string; // Código Sequencial atribuído (ex: 'VD-001')
  seqNumber: number; // 1, 2, 3...
  
  // Metadados do Ficheiro
  nomeFicheiro: string;
  tamanhoFicheiro: number;
  tipoFicheiro: 'pdf' | 'docx' | 'txt';
  dataProcessamento: string;
  
  // Detecção e Elegibilidade
  isElegivel: boolean; // Se é violência doméstica ou homicídio em contexto de VD
  motivoElegibilidade: string;
  tipoCrimeDetectado: 'violencia_domestica' | 'homicidio_contexto_vd' | 'ambos' | 'outro';
  
  // Relação rigorosa entre agressor e vítima
  tipoRelacao: TipoRelacao;
  relacaoAgressorVitima: string; // Relação descritiva rigorosa (Cônjuge, Unido de facto, Namorado/a...)

  // Coabitação e Habitação
  coabitacao: boolean | null; // Vivem na mesma residência
  coabitacaoTexto: string; // "Sim, coabitam" / "Não coabitam" / "Não apurado"
  regimeResidencia: RegimeResidencia;
  titularidadeCasaPropria: TitularidadeCasaPropria;
  detalhesResidencia: string;

  // Dados Essenciais da Decisão
  tribunal: string;
  dataDecisao: string; // Data judicial no final da decisão
  crime: string;
  artigosLegais: string[];
  
  // Identificação do Arguido e Ofendido
  arguido: PessoaIdentificacao;
  ofendido: PessoaIdentificacao;
  
  // Penas e Consequências
  penaAplicada: string;
  tipoPena: 'prisao_efetiva' | 'prisao_suspensa' | 'multa' | 'absolvicao' | 'trabalho_comunitario' | 'outro';
  duracaoPenaMeses: number | null;
  penasAcessorias: string;
  indemnizacaoCivel: string;
  
  // Circunstâncias Específicas
  reincidencia: boolean;
  reincidenciaDetalhe: string;
  
  vitimasMenores18: boolean;
  vitimasMenoresDetalhe: string;
  
  // Tipos de Ofensas e Perícias
  ofensas: TiposOfensas;
  pericias: PericiasInfo;
  
  // Trechos de Suporte da Decisão
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

  // Estado de Validação do Formulário
  statusValidacao: 'pendente_revisao' | 'validado' | 'arquivado';
  observacoesUtilizador?: string;
  sincronizadoFirebase: boolean;
  analiseDetalhada?: AnaliseDetalhadaVD;
}

export interface AnaliseDetalhadaVD {
  // 1. Metadados processuais e identificação do caso
  numProcessoUnico: string;
  faseProcessual: 'instrucao' | 'julgamento' | 'recurso' | 'execucao' | 'nao_especificada';
  regimeProcessual: 'comum' | 'abreviado' | 'sumarissimo' | 'especial' | 'outro';
  dataOcorrenciaFactos: string;
  tipoDecisaoFinal: 'condenacao' | 'absolvicao' | 'arquivamento' | 'suspensao_provisoria' | 'outra';
  legislacaoCitada: string;

  // 2. Características das partes
  // 2.1 Vítima
  vitimaEstadoCivil: string;
  vitimaEscolaridade: string;
  vitimaFilhosComum: string; // Ex: "2 filhos (3 e 5 anos)"
  vitimaHistoricoViolencia: string; // Ex: "queixas anteriores, queixas arquivadas"
  vitimaTempoRelacao: string; // Ex: "5 anos"
  vitimaSituacaoCoabitacao: 'juntos' | 'separados' | 'em_separacao' | 'nao_especificado';
  vitimaDependenciaEconomica: boolean | null;
  vitimaVulnerabilidades: string; // Ex: "deficiência, gravidez"
  vitimaParticipacaoProcesso: string; // Ex: "constituiu assistente, prestou depoimento"

  // 2.2 Ofensor
  ofensorEstadoCivil: string;
  ofensorHistoricoViolencia: string;
  ofensorConsumoProblema: string; // Ex: "álcool/drogas"
  ofensorProgramasReabilitacao: string; // Ex: "frequentou curso"

  // 2.3 Outras partes
  testemunhasDetalhe: string; // Ex: "3 testemunhas (vizinhos)"
  peritosDetalhe: string; // Ex: "psicólogos, médicos legistas"

  // 3. Contexto factual e tipologia da violência
  violenciaFisica: boolean;
  violenciaPsicologica: boolean;
  violenciaSexual: boolean;
  violenciaEconomica: boolean;
  violenciaMoral: boolean;
  frequenciaViolencia: 'episodio_isolado' | 'padrao_repetido' | 'cronica' | 'nao_especificado';
  gravidadeLesoes: 'leve' | 'moderada' | 'grave' | 'sem_lesoes' | 'nao_especificado';
  usoArmasObjetos: string; // Ex: "arma branca, objeto improvisado"
  localAgressao: string; // Ex: "habitação comum, local público"
  presencaFilhosAgressao: boolean | null;
  ameacasMorteSuicidio: boolean | null;
  provasApresentadas: string[]; // ex: ['relatórios médicos', 'testemunhos']

  // 4. Medidas processuais e cautelares
  medidasCautelaresAplicadas: boolean | null;
  medidasCautelaresTipos: string[]; // ex: ['afastamento do lar', 'proibição de contactos']
  medidasCautelaresDataConcessao: string;
  medidasCautelaresDuracao: string;
  medidasCautelaresMonitorizacao: string; // Ex: "pulseira eletrónica, policiamento"

  // 5. Decisão judicial: fundamentação e resultado
  // 5.1 Resultado
  medidasPosSentenca: string; // Ex: "programa de reabilitação"
  indemnizacaoValor: string; // Ex: "1500 EUR"
  indemnizacaoTipo: 'danos_materiais' | 'danos_morais' | 'ambos' | 'nao_aplicavel';

  // 5.2 Fundamentação
  argumentosCondenacao: string;
  argumentosAbsolvicao: string;
  atenuantesReconhecidas: string[]; // ex: ['confissão', 'reparação do dano']
  agravantesReconhecidas: string[]; // ex: ['reincidência']

  // 6. Dados para análise sociológica e de política pública
  regiaoGeografica: string;
  tipoArea: 'urbana' | 'rural' | 'periurbana' | 'nao_especificada';
  servicosApoioMencionados: string; // Ex: "casa-abrigo, apoio psicológico"

  // ==========================================
  // Grelha de recolha de dados — decisões judiciais de violência doméstica
  // ==========================================
  teveInstrucao?: boolean | null;
  localFactosUltimo?: string;
  periodoTemporalViolencia?: string; // se a violência foram 20 anos ou poucos episódios ou episódio único
  sitHabitacionalAgente?: string;
  sitHabitacionalVitima?: string;
  situacaoResidencial?: string; // Residência comum ou residência separada com a vítima; ou sem residência estável
  medidasPromocaoProtecao?: string; // Existência de medidas de promoção e proteção
  antecedentesVD?: string; // Existência de antecedentes criminais por VD. Tipo de penas aí aplicadas.
  antecedentesOutros?: string; // Existência de antecedentes criminais por outros crimes.
  medidasCoacaoProcesso?: string; // Se existe medidas de coação aplicadas no processo (para além do TIR)
  relacaoDetalheCompleto?: string; // Relação detalhada, coabitação, separações anteriores, queixas, reconciliações...
  gravidezVitima?: boolean | null; // Gravidez da vítima à data dos factos, quando relevante
  vulnerabilidadeParticular?: string; // Situação de particular vulnerabilidade expressamente identificada pelo tribunal
  dependenciaVitima?: string; // Dependência económica, habitacional, emocional da vítima em relação ao agente
  deficienciaIncapacidadeAgenteVitima?: string; // Deficiência/doença/incapacidade do agente e da vítima
  dependenciasSubstanciasAgenteVitima?: string; // Existência de dependências (álcool, droga) do agente e da vítima
  motivacoesRelacao?: string; // “Motivações”: ciúmes, não aceitação do término, partilhas, etc.
  violenciaTipologiaDetalhada?: string; // Detalhe de física, psicológica, sexual, digital, económica, stalking, controlo coercivo, controlo social
  quemQuisSeparacao?: string; // Quem quis a separação
  condenacaoAutonomaFilho?: string; // Houve condenação autónoma (vítima cônjuge e vítima filho)
  condenacaoAutonomaSexual?: string; // Houve condenação autónoma por crime sexual
  criancasEnvolvidasDetalhe?: string; // Existem filhos / crianças envolvidos, idades, presenciou, ouviu, interveio, instrumentalizado, agredida, etc.
  periciasAutos?: string; // Existência de perícias nos autos: dano corporal, perícia psicológica, psiquiátrica
  acompanhamentoDesdeQueixa?: string; // As vítimas tiveram acompanhamento desde a apresentação da queixa
  cpcjIntervencao?: string; // Foi acionada a CPCJ. Houve processo de promoção e proteção. Foram aplicadas medidas de promoção e proteção.
  criancaOuvidaProcesso?: string; // A criança foi ouvida no processo criminal?
  declaracoesMemoriaFutura?: string; // Há declarações para memória futura das vítimas
  vitimasChamadasJulgamento?: string; // Não obstante, as vítimas foram novamente chamadas a julgamento
  estatutoVitimaConferido?: string; // Foi conferido estatuto de vítima no processo
  picEIndemnizacaoOficiosa?: string; // Há PIC. Foi arbitrada indemnização oficiosa.
  tipoPenasCompleto?: string; // Tipo de penas: prisão efetiva; pena suspensa simples; pena suspensa com regime de prova
  programaAgressoresAplicado?: string; // Foi aplicado Programa para agressores
  tratamentoDependenciasAplicado?: string; // Foi aplicado tratamento para dependências
  medidasAfastamentoRegimeProva?: string; // Foram aplicadas medidas de afastamento no âmbito do regime de prova
  penasAcessoriasAplicadas?: string; // Foram aplicadas penas acessórias
  compensacaoCondicaoSuspensao?: string; // Foi fixada compensação à vítima e o seu pagamento foi fixado como condição da suspensão
  criancaVitimaAutonomaAgravante?: string; // No caso de condenação, o Tribunal considerou a criança vítima autónoma ou mero fator agravante ou não fez qualquer referência relevante
  presencaCriancaQualificacaoPena?: string; // O tribunal considerou a presença da criança na qualificação jurídica e medida da pena
  consequenciasCrianca?: string; // O tribunal considerou consequências para a criança
  medidasResponsabilidadesParentais?: string; // Existiram medidas relativas às responsabilidades parentais / regulação provisória / suspensão / restrição de contactos / visitas supervisionadas / superior interesse
  denunciaQuemEQuando?: string; // Quem apresentou a denúncia. Quando foi apresentada. Houve denúncias anteriores. Queixas. Desistência. Arquivamentos. Processos anteriores.
  intervencaoPoliciaEscolaVizinhos?: string; // Houve intervenção da polícia / escola / vizinhos / outros
  medidasProtecaoAnteriores?: string; // Medidas de proteção anteriores / sinalização
  meiosProva?: string; // Meios de prova: declarações, testemunhos, documentos, perícias, autos de notícia
  avaliacaoRisco?: string; // Avaliação de risco
  declaracoesPartesJulgamento?: string; // A vítima falou/recusou-se a falar; o arguido quis/não quis prestar declarações
  medidasCoacaoAplicadasDet?: string; // Medidas de coação aplicadas
  crimesImputadosCondenados?: string; // Crime / crimes imputados. Número de crimes imputados / condenados / absolvidos. Convolação. Alteração de factos
  penaConcretaSubstituicao?: string; // Pena concreta aplicada. Pena de prisão. Pena de substituição
  penasAcessoriasDetalhe?: string; // Penas acessórias: proibição de contactos, afastamento, VE, programas, inibição de responsabilidades parentais, uso de armas, etc.
  indemnizacaoDetalheCompleto?: string; // Indemnização à vítima. PIC ou arbitramento oficioso. Valor
  ausenciaAntecedentes?: string; // Ausência de antecedentes ou condenações anteriores
  reincidenciaDet?: string; // Reincidência
  confissaoArrependimentoNegacao?: string; // Confissão / arrependimento. Negação dos factos.
}

export interface ProcessoCorrespondencia {
  id: string; // Ex: 'map_VD-001'
  seqId: string; // Ex: 'VD-001'
  seqNumber: number;
  numeroProcessoReal: string; // Ex: '145/21.3PBAMD'
  tribunal: string;
  nomeFicheiro: string;
  dataAtribuicao: string;
  arguidoIniciais?: string;
  ofendidoIniciais?: string;
}

export interface ResultadoProcessamentoFicheiro {
  nomeFicheiro: string;
  tipoFicheiro: 'pdf' | 'docx' | 'txt';
  tamanho: number;
  sucesso: boolean;
  erro?: string;
  elegivel: boolean;
  ignorado?: boolean; // Se não for VD nem homicídio em contexto de VD, é ignorado
  motivoNaoElegivel?: string;
  numeroProcessoOriginal?: string;
  decisao?: DecisaoJudicialVD;
  correspondencia?: ProcessoCorrespondencia;
  textoOriginal?: string;
}

export interface EstatisticasGlobais {
  totalFicheirosLidos: number;
  totalDecisoesElegiveis: number;
  totalIgnoradas: number;
  totalComReincidencia: number;
  totalComMenores: number;
  totalCoabitacao: number;
  totalPrisaoEfetiva: number;
  totalPrisaoSuspensa: number;
  tiposOfensasContagem: {
    fisicas: number;
    psicologicas: number;
    sexuais: number;
    patrimoniais: number;
  };
}
