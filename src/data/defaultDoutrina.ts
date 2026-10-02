import { ReferenciaDoutrinaria } from '../types/modules';

// Compact metadata definitions to prevent token overflow
const OBRAS_PORTUGAL_RAW: [string, string, string, string, number, string, string, string, string][] = [
  [
    'dout_001', 'Isabel Dias (coord.)', 'Violência doméstica e de género: uma abordagem multidisciplinar',
    '1.ª Edição', 2018, 'PACTOR',
    'https://m.pactor.pt/pt/catalogo/ciencias-sociais-ciencias-forenses/ciencias-forenses-criminologia/violencia-domestica-e-de-genero/',
    'Área Social e Apoio à Vítima', 'Obra coletiva de cariz multidisciplinar sobre a violência de género sob prismas socioculturais, psicológicos e jurídicos.'
  ],
  [
    'dout_002', 'Isabel Dias', 'Violência na família: uma abordagem sociológica',
    '2.ª Edição', 2010, 'Afrontamento',
    'https://www.edicoesafrontamento.pt/products/violencia-na-familia',
    'Área Social e Apoio à Vítima', 'Estudo sociológico sobre dinâmicas e tipologias de abuso intrafamiliar em Portugal.'
  ],
  [
    'dout_003', 'Nuno Poiares', 'A letra e os espíritos da lei. A violência doméstica em Portugal',
    '1.ª Edição', 2016, 'Chiado Editora',
    'https://comum.rcaap.pt/handle/10400.26/38996',
    'Área Jurídica', 'Reflexão crítica sobre a evolução legislativa e a aplicação do estatuto de vítima em Portugal.'
  ],
  [
    'dout_004', 'Teresa Morais', 'Violência Doméstica – (A)notações',
    '1.ª Edição', 2026, 'Almedina',
    'https://www.almedina.net/violencia-domestica-anotacoes-1769177040.html',
    'Área Jurídica', 'Anotações exaustivas e comentários jurídicos detalhados ao regime jurídico da violência doméstica em Portugal.'
  ],
  [
    'dout_005', 'Teresa Morais (coord.)', 'Violências Domésticas – Novas Questões Antigas',
    '1.ª Edição', 2022, 'Almedina',
    'https://www.almedina.net/violencias-domesticas-novas-questoes-antigas-1660837042.html',
    'Área Jurídica', 'Estudos reunidos que abordam o impacto habitacional, idoneidade penal e teleassistência.'
  ],
  [
    'dout_006', 'Maria Elisabete Ferreira', 'Violência Doméstica: O Direito Perante a Violência no Espaço Familiar',
    '1.ª Edição', 2024, 'Almedina',
    'https://www.fnac.pt/Violencia-Domestica-O-Direito-Perante-a-Violencia-no-Espaco-Familiar-Maria-Elisabete-Ferreira/a14958766',
    'Área Jurídica', 'Enquadramento civil e criminal do crime de maus-tratos no espaço da convivência familiar.'
  ],
  [
    'dout_007', 'Cristina Araújo Dias, Margarida Santos, Rui do Carmo (Coords.)', 'Legislação sobre violência doméstica – anotada',
    '1.ª Edição', 2025, 'Almedina',
    'https://bibliografia.bnportugal.gov.pt/bnp/bnp.exe/registo?2219077',
    'Área Jurídica', 'Coletânea legislativa anotada contendo o regime geral de proteção à vítima, penal, processual e civil.'
  ],
  [
    'dout_008', 'Tomás Carvalho Guerra', 'O Crime de Violência Doméstica – Perspetivas Familiares Contemporâneas',
    '1.ª Edição', 2024, 'Almedina',
    'https://www.fnac.pt/O-Crime-de-Violencia-Domestica-Perspetivas-Familiares-Contemporaneas-Tomas-Carvalho-Guerra/a11778774',
    'Área Jurídica', 'Foca nas dinâmicas familiares atuais e no tratamento penal contemporâneo.'
  ],
  [
    'dout_009', 'Jorge Quintas, Pedro Sousa', 'As Respostas Judiciais na Criminalidade de Género',
    '1.ª Edição', 2021, 'Almedina',
    'https://www.fnac.pt/As-Respostas-Judiciais-na-Criminalidade-de-Genero-Jorge-Quintas/a9300347',
    'Área Jurídica', 'Estudo criminológico sobre a consistência e eficácia prática das sentenças proferidas pelos tribunais.'
  ],
  [
    'dout_010', 'Alexandra Vilela, Hugo Cunha, et al.', 'Violência de género, mulher e Direito Penal',
    '1.ª Edição', 2024, "Editora d'Ideias",
    'https://www.ulusofona.pt/',
    'Área Jurídica', 'Obra coletiva contendo contributos sobre os desafios penais da proteção das mulheres contra a violência.'
  ],
  [
    'dout_011', 'Carla Isabel Mendes de Carvalho', 'Violência doméstica: Competências teóricas, técnico-operativas e ético-políticas do serviço social',
    'Dissertação', 2022, 'Iscte-IUL',
    'http://hdl.handle.net/10071/28841',
    'Área Social e Apoio à Vítima', 'Estudo sobre intervenção técnico-operativa e ética dos assistentes sociais no apoio às vítimas.'
  ],
  [
    'dout_012', 'Nuno Caetano Lopes de Barros Poiares', 'Políticas de segurança e as dimensões simbólicas da lei: O caso da violência doméstica em Portugal',
    'Tese de Doutoramento', 2015, 'Iscte-IUL',
    'http://hdl.handle.net/10071/10004',
    'Área Jurídica', 'Analisa o papel simbólico e prático das leis contra a violência doméstica na segurança interna.'
  ],
  [
    'dout_013', 'Irene Andrade Pita', 'A violência doméstica em contexto social e institucional: O caso da Região Autónoma da Madeira',
    'Tese de Mestrado', 2011, 'Iscte-IUL',
    'http://hdl.handle.net/10071/4539',
    'Área Social e Apoio à Vítima', 'Análise institucional de apoio e articulação dos serviços sociais na Região Autónoma da Madeira.'
  ],
  [
    'dout_014', 'Nara Andreia Marcelino Marques', 'O impacto da (des)igualdade de género na violência doméstica: uma perspectiva jurídico-penal',
    'Tese Académica', 2019, 'FDUL',
    'https://repositorio.ulisboa.pt/handle/10451/41689',
    'Área Jurídica', 'Perspetiva jurídica sobre a desigualdade de género como causa estrutural da violência íntima.'
  ],
  [
    'dout_015', 'Autor Não Especificado', 'O crime de violência doméstica conjugal e o exercício das responsabilidades parentais em Portugal: uma análise crítica à luz da Convenção de Istambul',
    'Dissertação', 2022, 'Universidade do Minho',
    'https://repositorium.uminho.pt/entities/publication/b40b7866-a11b-4c71-97d8-8096733bc550/full',
    'Área Jurídica', 'Estuda as decisões de guarda de menores em confronto com o histórico de agressão intrafamiliar.'
  ],
  [
    'dout_016', 'Clementina Pires de Almeida', 'Violência doméstica na gravidez: consequências para o desenvolvimento do bebé no primeiro ano de vida',
    'Estudo Clínico', 2013, 'FPCEUC',
    'https://estudogeral.uc.pt/',
    'Área da Psicologia', 'Demonstra as severas consequências clínicas e neurológicas do trauma no feto e no bebé.'
  ],
  [
    'dout_017', 'Iris Sofia Balbino de Almeida', 'Avaliação de risco de femicídio: poder e controlo nas dinâmicas das relações íntimas',
    'Dissertação', 2013, 'ISCTE-IUL',
    'https://repositorio.iscte-iul.pt/',
    'Área das Perícias (Forense e Investigação)', 'Fatores preditivos de letalidade e escalas de poder/controlo em relações violentas.'
  ],
  [
    'dout_018', 'Julia Bitello Lobo Barbosa', 'Violência doméstica em tempos de COVID-19: Contributo para a análise de políticas públicas em Portugal',
    'Tese de Mestrado', 2022, 'Iscte-IUL',
    'https://repositorio.iscte-iul.pt/handle/10071/24983',
    'Área Social e Apoio à Vítima', 'Recomendações e análise da resposta pública e rede de apoio durante o confinamento.'
  ],
  [
    'dout_019', 'Daniela Sofia Morais Gonçalves', 'Fatores de risco preditores de episódios de Violência Doméstica repetida: Avaliação de risco focalizada nas vítimas',
    'Tese de Mestrado', 2020, 'FPCEUC',
    'https://estudogeral.uc.pt/handle/10316/94875',
    'Área das Perícias (Forense e Investigação)', 'Estudo focado em reincidência de agressões intrafamiliares em Portugal.'
  ],
  [
    'dout_020', 'Autor Não Especificado (ISPA)', 'Família, violência doméstica e rede social',
    'Estudo', 2010, 'ISPA',
    'https://repositorio.ispa.pt/entities/publication/f4342905-ee28-4959-b6ff-e9d2fac27a56',
    'Área Social e Apoio à Vítima', 'Avaliação sobre o papel de amortecimento das redes sociais de suporte primário.'
  ],
  [
    'dout_021', 'Jorge Alexandre Oliveira', 'Avaliação do Risco em Violência Doméstica',
    'Tese de Investigação', 2025, 'ISMT',
    'https://repositorio.ismt.pt/items/310588c0-f014-4a4d-931e-239965d3a734',
    'Área das Perícias (Forense e Investigação)', 'Analisa a escala RVD de avaliação e a sua aplicação prática pelas forças policiais.'
  ],
  [
    'dout_022', 'Autor Não Especificado (Iscte-IUL)', 'Fronteiras invisíveis: As barreiras no acesso de mulheres imigrantes às políticas de enfrentamento à violência doméstica em Portugal',
    'Investigação', 2024, 'Iscte-IUL',
    'https://repositorio.iscte-iul.pt/',
    'Área Social e Apoio à Vítima', 'Aborda as barreiras linguísticas e residenciais enfrentadas por imigrantes vítimas de abuso.'
  ],
  [
    'dout_023', 'Autor Não Especificado (ISCSP)', 'Percepção Social de Mulher Vítima de Violência Conjugal: Estudo Exploratório Realizado no Concelho de Lisboa',
    'Monografia', 2017, 'ISCSP-ULisboa',
    'https://edicoes.iscsp.ulisboa.pt/pt/',
    'Área Social e Apoio à Vítima', 'Estudo qualitativo realizado na capital sobre preconceitos e crenças de vitimação.'
  ],
  [
    'dout_024', 'Isabel Dias', 'Violência doméstica e justiça: respostas e desafios',
    'Artigo Científico', 2010, 'Revista Sociologia FLUP',
    'https://ojs.letras.up.pt/index.php/Sociologia/article/view/2287',
    'Área Jurídica', 'Analisa a eficácia das respostas policiais e do Ministério Público em Portugal.'
  ],
  [
    'dout_025', 'Autor Não Especificado', 'Violência Conjugal em Portugal: Um Olhar Sobre a Última Década (2010-2020)',
    'Artigo', 2022, 'Revista Temas Sociais',
    'https://revistas.ulusofona.pt/index.php/temassociais/',
    'Área Social e Apoio à Vítima', 'Revisão de dados empíricos, avanços judiciais e aspetos estruturais verificados.'
  ],
  [
    'dout_026', 'Ariana Correia, Mafalda Ferreira, Joana Topa, Estefânia Silva, Sofia Neves', 'A violência doméstica contra as mulheres em Portugal: Uma breve análise crítica sobre a proteção às vítimas',
    'Artigo Científico', 2025, 'Revista Configurações',
    'https://revistas.uminho.pt/configuracoes/',
    'Área Social e Apoio à Vítima', 'Estudo crítico sobre a proteção das vítimas na comarca criminal.'
  ],
  [
    'dout_027', 'Rita Domingos, Maria Cunha Louro, et al.', 'A VIOLÊNCIA DOMÉSTICA EM PORTUGAL: CONTRIBUTOS DE UMA REFLEXÃO JUSPSICOLÓGICA',
    'Artigo', 2024, 'Revista Delictae',
    'https://periodicos.pucminas.br/delictae/article/view/34305',
    'Área da Psicologia', 'Reflexão sobre a interseção entre direito penal e psicologia clínica forense no depoimento.'
  ],
  [
    'dout_028', 'E. E. Nogueira, E. Simões, A. I. Sani', 'Violência doméstica: crenças e o impacto de campanhas publicitárias',
    'Artigo', 2025, 'Revista Estudos Feministas',
    'https://periodicos.ufsc.br/',
    'Área Social e Apoio à Vítima', 'Avalia a eficácia de campanhas públicas de sensibilização e mitigação de mitos.'
  ],
  [
    'dout_029', 'I. Oliveira, B. Figueiredo, et al.', 'Representação social da violência doméstica sobre as mulheres',
    'Artigo', 2019, 'Revista RIIS',
    'https://riis.essnortecvp.pt/index.php/RIIS/',
    'Área da Medicina e Saúde Pública', 'Análise sobre o papel dos enfermeiros de saúde familiar na deteção precoce de abusos.'
  ],
  [
    'dout_030', 'Autor Não Especificado (NTQR)', 'Violência doméstica e atuação da justiça portuguesa sob a óptica dos operadores jurídicos',
    'Artigo', 2022, 'NTQR, vol. 14',
    'https://publi.ludomedia.org/index.php/ntqr/',
    'Área Jurídica', 'Estudo qualitativo com juízes e procuradores sobre entraves à eficácia penal.'
  ],
  [
    'dout_031', 'N. Poiares', 'Violência doméstica e atividade policial',
    'Artigo Técnico', 2019, 'Anatomia do Crime',
    'https://comum.rcaap.pt/',
    'Área Jurídica', 'Avalia os procedimentos específicos de atuação policial urgente das forças PSP/GNR.'
  ],
  [
    'dout_032', 'Equipa de Investigação UMAIA', 'Violência doméstica e serviço social na pandemia COVID-19: desafios e medidas',
    'Artigo', 2020, 'Miscellanea, nº 12',
    'https://uiccc.umaia.pt/pt/',
    'Área Social e Apoio à Vítima', 'Identifica soluções urgentes operacionais de abrigo e acolhimento em tempos de pandemia.'
  ],
  [
    'dout_033', 'R. Ribeiro, I. Almeida, et al.', 'The Different Contexts of Domestic Violence Before and During the COVID-19 Pandemic: A Portuguese Overview',
    'Artigo Científico', 2022, 'Victims & Offenders',
    'https://apav.pt/',
    'Área Social e Apoio à Vítima', 'Estudo empírico conjunto APAV e órgãos de investigação que monitorizou pedidos de ajuda.'
  ],
  [
    'dout_034', 'Equipa de Pesquisa UMAIA', 'Domestic Violence during the COVID-19 Pandemic in Portugal',
    'Artigo', 2021, 'PJPH',
    'https://www.umaia.pt/',
    'Área da Medicina e Saúde Pública', 'Monitorização de indicadores de urgência médica e sinalizações clínicas de agressão.'
  ],
  [
    'dout_035', 'Autor Não Especificado', 'Violência doméstica contra as mulheres e as políticas no Brasil e em Portugal nos anos de 2010 a 2020',
    'Estudo Comparativo', 2022, 'Revista Temas Sociais',
    'https://revistas.ulusofona.pt/',
    'Área Social e Apoio à Vítima', 'Políticas de género e estruturas de proteção em perspetiva comparada Brasil-Portugal.'
  ],
  [
    'dout_036', 'Autor Não Especificado', 'Política de enfrentamento à violência doméstica em Portugal: desafios da sua implementação em municípios urbanos e rurais',
    'Artigo', 2023, 'Sociedade e Estado',
    'https://pdfs.semanticscholar.org/',
    'Área Social e Apoio à Vítima', 'Evidencia as assimetrias regionais de proteção entre comarcas urbanas e rurais.'
  ],
  [
    'dout_037', 'Autor Não Especificado', 'VIOLÊNCIA DOMÉSTICA CONTRA A MULHER: CONHECIMENTOS E ATITUDES DO ENFERMEIRO DA URGÊNCIA',
    'Artigo', 2021, 'Revista RIIS',
    'https://www.redalyc.org/',
    'Área da Medicina e Saúde Pública', 'Pesquisa com profissionais de urgência hospitalar sobre barreiras na triagem e acolhimento.'
  ],
  [
    'dout_038', 'Ariana Correia, Mafalda Ferreira, Joana Topa, Estefânia Silva, Sofia Neves', 'Intimate partner violence in Portugal: Reflections on the last three decades',
    'Capítulo', 2024, 'IGI Global',
    'https://journals.openedition.org/',
    'Área Social e Apoio à Vítima', 'Estudo de 30 anos de respostas penais e psicosociais em Portugal sob as diretivas comunitárias.'
  ],
  [
    'dout_039', 'APAV (R. Ribeiro, I. Almeida, et al.)', 'Necessidades especiais das Vítimas de Violência Doméstica',
    'Capítulo', 2022, 'Almedina',
    'https://apav.pt/',
    'Área Social e Apoio à Vítima', 'Capítulo detalhando perfis psicológicos de vulnerabilidades acrescidas.'
  ],
  [
    'dout_040', 'Maria Cunha Louro et al.', 'Violência Doméstica e a Avaliação Psicológica',
    'Capítulo', 2024, "Editora d'Ideias",
    'https://www.ulusofona.pt/',
    'Área da Psicologia', 'Capítulo focando-se em metodologias de avaliação e perícia forense juspsicológica.'
  ],
  [
    'dout_041', 'Comissão para a Cidadania e a Igualdade de Género (CIG) / Assembleia da República', 'Fim à violência doméstica contra as mulheres – Biblioteca Virtual',
    'Recurso Virtual', 2022, 'CIG',
    'https://app.parlamento.pt/violenciadomestica/conteudo/seccao-bibliotecavirtual.html',
    'Área Jurídica', 'Diretório digital de recursos, e-books e recomendações para prevenção de crimes violentos.'
  ],
  [
    'dout_042', 'Isabel Dias', 'Violência na família: uma abordagem sociológica (Registo BNP)',
    'Registo', 2010, 'Afrontamento',
    'https://bibliografia.bnportugal.gov.pt/bnp/bnp.exe/registo?1816605',
    'Área Social e Apoio à Vítima', 'Ficha bibliográfica oficial indexada da obra no repositório da Biblioteca Nacional de Portugal.'
  ],
  [
    'dout_043', 'Comissão para a Cidadania e a Igualdade de Género (CIG)', 'Teses doutoramento na área da Violência',
    'Catálogo', 2012, 'CIG',
    'https://www.cig.gov.pt/siic/2012/12/teses-doutoramento-na-area-da-violencia/',
    'Área Jurídica', 'Catálogo consolidado de teses de doutoramento elaboradas em universidades de Portugal.'
  ],
  [
    'dout_044', 'CIG / Centro de Estudos Sociais (CES)', 'Observatório Permanente da Justiça Portuguesa (OPJ) – Estudos sobre decisões judiciais em violência doméstica',
    'Relatório', 2015, 'CIG',
    'https://www.cig.gov.pt/wp-content/uploads/2015/07/SUM%C3%81RIO-EXECUTIVO-Decis%C3%B5es-judiciais-em-mat%C3%A9ria-de-viol%C3%AAncia-dom%C3%A9stica.pdf',
    'Área Jurídica', 'Estudo empírico nacional de sentenças judiciais relativas à aplicação e suspensão da pena de prisão.'
  ],

  // ==========================================
  // NOVOS DE PSICOLOGIA/PERÍCIAS/MEDICINA (PORTUGAL) - 104 a 116
  // ==========================================
  [
    'dout_104', 'Albino Gomes', 'Violência interpessoal: aspetos forenses',
    '1.ª Edição', 2025, 'Rei dos Livros',
    'https://www.dgsi.pt/bpjl.nsf/585dea57ef154656802569030064d624/fb1e660167ddafd480258ded00545339?OpenDocument',
    'Área das Perícias (Forense e Investigação)', 'Aborda violência doméstica, violência sexual, perícia médico-legal e exames médico-legais.'
  ],
  [
    'dout_105', 'Ricardo Barroso, David Dias Neto (Coords.)', 'A prática profissional da psicologia na justiça',
    '1.ª Edição', 2020, 'Ordem dos Psicólogos Portugueses',
    'https://www.dgsi.pt/bpgr/bpgr.nsf/305fde3cddf188ab802569660044179b/12b548e0a5c4bfd2802586d200358518?OpenDocument',
    'Área da Psicologia', 'Manual de boas práticas da atuação e parecer técnico dos psicólogos no enquadramento judicial.'
  ],
  [
    'dout_106', 'Rute Agulhas, Alexandra Anciães', 'Casos práticos em psicologia forense: enquadramento legal e avaliação pericial (3.ª ed.)',
    '3.ª Edição', 2023, 'Sílabo',
    'https://bibliografia.bnportugal.gov.pt/bnp/bnp.exe/q?mfn=183236&qf_CDU==343.95(035)',
    'Área da Psicologia', 'Abordagem prática com modelos de relatórios periciais forenses e metodologias de avaliação.'
  ],
  [
    'dout_107', 'Mauro Paulino, Laura Alho (Coords.)', 'Comportamento criminal e avaliação forense',
    '1.ª Edição', 2018, 'PACTOR',
    'https://www.dgsi.pt/bpjl.nsf/83cbe9acef94db5a8025730800549412/d5988b88c4fe3b2e80258a8a004f3494?OpenDocument',
    'Área das Perícias (Forense e Investigação)', 'Inclui capítulo relevante sobre a evolução das polícias na avaliação de risco nas relações de violência.'
  ],
  [
    'dout_108', 'Mauro Paulino, Fátima Almeida (Coords.)', 'Psicologia, justiça & ciências forenses: perspetivas atuais',
    '1.ª Edição', 2014, 'PACTOR',
    'https://www.dgsi.pt/bpgr/bpgr.nsf/305fde3cddf188ab802569660044179b/f3b442472703db6380257dfe005a2cd3',
    'Área da Psicologia', 'Aborda a credibilidade de testemunhos, dano psíquico de agressões contra mulheres e representações das vítimas.'
  ],
  [
    'dout_109', 'Isabel Dias', 'Violência Doméstica e de Género: uma abordagem multidisciplinar',
    '1.ª Edição', 2018, 'PACTOR',
    'https://www.fnac.pt/Violencia-Domestica-e-de-Genero-Isabel-Dias/a6385171',
    'Área da Psicologia', 'Inclui capítulos dedicados à perícia médico-legal forense e intervenção com vítimas e agressores conjugais.'
  ],
  [
    'dout_110', 'Ana Sani', 'Violência, Agressão e Vitimação: Práticas Para a Intervenção',
    '1.ª Edição', 2026, 'Fnac Disponibilizada',
    'https://www.fnac.pt/Violencia-Agressao-e-Vitimacao-Praticas-Para-a-Intervancao-Ana-Sani/a1456011',
    'Área Social e Apoio à Vítima', 'Diretrizes empíricas inovadoras voltadas para a cessação e reabilitação de agressões físicas na família.'
  ],
  [
    'dout_111', 'Autor Não Especificado (UMinho)', 'Psicologia forense: instrumentos de avaliação',
    'Manual de Instrumentos', 2018, 'Universidade do Minho',
    'https://repositorium.uminho.pt/entities/publication/9496bdfd-ad4a-4177-9d87-a04b658a9dac/full',
    'Área da Psicologia', 'Apresenta 24 instrumentos de avaliação forense focados na gestão de risco e risco de violência física.'
  ],
  [
    'dout_112', 'Autor Não Especificado', 'Manual de Psiquiatria Forense',
    '1.ª Edição', 2018, 'Fnac Distribuidora',
    'https://static.fnac-static.com/multimedia/PT/pdf/9789896930653.pdf',
    'Área das Perícias (Forense e Investigação)', 'Capítulo dedicado à avaliação do risco de violência e prognose jurídica de perigosidade.'
  ],
  [
    'dout_113', 'Rui Abrunhosa Gonçalves', 'A avaliação de ofensores violentos e perigosos: o caso dos agressores conjugais',
    'Tese / Estudo', 2005, 'Procuradoria-Geral da República',
    'https://www.dgsi.pt/bpgr/bpgr.nsf/305fde3cddf188ab802569660044179b/992d12fbfe26e3548025717e00549e84?OpenDocument',
    'Área da Psicologia', 'Aborda em detalhe a tipologia psicológica dos agressores conjugais portugueses e os perfis clínicos.'
  ],
  [
    'dout_114', 'Joana Filipa Mendes Gonçalves', 'Psicologia forense nas forças de segurança: o profiling em crimes de violência doméstica',
    'Dissertação', 2023, 'ISCPSI',
    'https://www.dgsi.pt/bpjl.nsf/585dea57ef154656802569030064d624/8c235efbd7b5654f80258abb0040bdce?OpenDocument',
    'Área das Perícias (Forense e Investigação)', 'Foca no profiling de agressores como ferramenta essencial no policiamento de proximidade.'
  ],
  [
    'dout_115', 'Autor Não Especificado', 'Abordagem Médico-Legal de Vítimas de Violência Doméstica. Problemática da Violência por Parceiro Íntimo',
    'Dissertação de Mestrado', 2024, 'FMUC',
    'https://estudogeral.uc.pt/handle/10316/117453',
    'Área da Medicina e Saúde Pública', 'Mestrado especializado focado em perícias de lesão corporal traumática e sequelas clínicas.'
  ],
  [
    'dout_116', 'Autor Não Especificado', 'A Violência Doméstica e o Papel do Médico Ortopedista: Revisão das Lesões Musculoesqueléticas Não Acidentais e Plano de Atuação',
    'Dissertação de Mestrado', 2023, 'Universidade do Porto',
    'https://repositorio-aberto.up.pt/bitstream/10216/159846/2/679833.pdf',
    'Área da Medicina e Saúde Pública', 'Orientações clínicas para triagem de lesões fraturárias não acidentais por médicos ortopedistas em urgências.'
  ]
];

const OBRAS_ESTRANGEIRAS_RAW: [string, string, string, string, number, string, string, string, string][] = [
  [
    'dout_045', 'Fausto Rodrigues de Lima, Claudiene Santos (Coords.)', 'Violência doméstica: vulnerabilidades e desafios na intervenção criminal e multidisciplinar',
    '1.ª Edição', 2009, 'Lumen Juris',
    'https://www.lexml.gov.br/urn/urn:lex:br:rede.virtual.bibliotecas:livro:2009;000831473',
    'Área Jurídica', 'Intervenção criminal multidisciplinar e acolhimento das ofendidas.'
  ],
  [
    'dout_046', 'Autor Não Especificado', 'Violência Contra A Mulher: O Homicídio Privilegiado E A Violência Doméstica',
    '1.ª Edição', 2009, 'Atlas',
    'https://www.estantevirtual.com.br/busca/violencia-contra-a-mulher',
    'Área Jurídica', 'Homicídio privilegiado e conexões criminais intrafamiliares.'
  ],
  [
    'dout_047', 'Autor Não Especificado', 'Violencia Contra A Mulher - Aspectos Criminais Da Lei N 11340/2006',
    '1.ª Edição', 2010, 'Saraiva',
    'https://www.estantevirtual.com.br/busca/violencia-contra-a-mulher',
    'Área Jurídica', 'Aspectos criminais práticos e tutela cautelar da Lei Maria da Penha.'
  ],
  [
    'dout_048', 'Angela Regina Ramina de Lucca', 'Responsabilidade Civil Decorrente da Violência de Gênero',
    '1.ª Edição', 2026, 'Lumen Juris',
    'https://lumenjuris.com.br/direitos-humanos/responsabilidade-civil-decorrente-da-violencia-de-genero-a-2026-4958/p',
    'Área Jurídica', 'Direito civil indemnizatório autónomo face a danos sofridos no ambiente doméstico.'
  ],
  [
    'dout_049', 'Autor Não Especificado', 'Violência de Gênero Online',
    '1.ª Edição', 2026, 'Lumen Juris',
    'https://lumenjuris.com.br/',
    'Área Jurídica', 'Estudo sobre assédio virtual, cyberstalking e extorsão íntima em plataformas digitais.'
  ],
  [
    'dout_050', 'Autor Não Especificado', 'Violência Intrafamiliar e o Sistema de Garantia de Direitos',
    '1.ª Edição', 2024, 'Lumen Juris',
    'https://lumenjuris.com.br/',
    'Área Social e Apoio à Vítima', 'Intervenção integrada assistencial e proteção de menores e idosos.'
  ],
  [
    'dout_051', 'Autor Não Especificado', 'Violência doméstica contra as mulheres: vivências e repercussões da solicitação de revogação da medida protetiva de urgência',
    'Dissertação', 2024, 'UNESP',
    'https://repositorio.unesp.br/items/38091776-215a-41d9-aeaa-c595e1e41a0e',
    'Área Social e Apoio à Vítima', 'Explora a complexidade e coação que levam as vítimas a solicitar revogação de medidas protetivas.'
  ],
  [
    'dout_052', 'Autor Não Especificado', 'Violência doméstica: uma questão de saúde pública',
    'Estudo Histórico', 2000, 'USP',
    'https://repositorio.usp.br/item/001090607',
    'Área da Medicina e Saúde Pública', 'Custos de urgências e deteção clínica de abuso doméstico.'
  ],
  [
    'dout_053', 'Autor Não Especificado', 'Insubmissos relatos de mulheres negras: violências raciais em contexto de violência doméstica e familiar e seus desdobramentos judiciais',
    'Dissertação', 2023, 'USP',
    'https://repositorio.usp.br/item/003227909',
    'Área Social e Apoio à Vítima', 'Foco na dupla discriminação racial e género em comarcas familiares.'
  ],
  [
    'dout_054', 'Autor Não Especificado', 'A violência psicológica e dos danos à saúde mental causados pela violência contra a mulher cometida por parceiro íntimo em processos judiciais',
    'Tese Académica', 2024, 'USP Ribeirão Preto',
    'https://repositorio.usp.br/item/003209338',
    'Área da Psicologia', 'Metodologia de avaliação pericial de danos emocionais continuados.'
  ],
  [
    'dout_055', 'Autor Não Especificado', 'Feminicídio e violência doméstica',
    'Tese Académica', 2020, 'USP',
    'https://repositorio.usp.br/item/003022201',
    'Área Jurídica', 'Estudo sobre fatores preditivos e reincidência processual em homicídios conjugais.'
  ],
  [
    'dout_056', 'Autor Não Especificado', 'A Lei de Alienação Parental e sua relação com a violência doméstica e familiar: análise empírica à luz da proteção integral e prioritária da criança e do adolescente',
    'Estudo Doutoral', 2025, 'USP',
    'https://teses.usp.br/teses/disponiveis/2/2140/tde-26112025-180406/pt-br.html',
    'Área Jurídica', 'Uso do argumento de alienação parental contra denúncias sérias de violência de género.'
  ],
  [
    'dout_057', 'Rosilene Miranda Barroso da Cruz', 'Violência doméstica contra crianças e adolescentes: os (des) caminhos entre a denúncia e a proteção',
    'Tese Académica', 2013, 'UFMG',
    'https://repositorio.ufmg.br/handle/1843/BUOS-97NF2G',
    'Área Social e Apoio à Vítima', 'Sinalização e encaminhamento assistencial de menores agredidos.'
  ],
  [
    'dout_058', 'Autor Não Especificado', 'A violência conjugal em contextos de ruralidades: um estudo com mulheres rurais de comunidades do interior de Minas Gerais',
    'Tese', 2017, 'UFMG',
    'https://repositorio.ufmg.br/items/556217e4-547e-4709-bc94-64ded1c623ec',
    'Área Social e Apoio à Vítima', 'Isolamento espacial e barreiras institucionais em distritos rurais.'
  ],
  [
    'dout_059', 'Autor Não Especificado', 'Violência por parceiro íntimo em mulheres no Brasil: da notificação ao óbito',
    'Estudo', 2022, 'UFMG',
    'https://repositorio.ufmg.br/items/01aaa853-5bdf-4bfe-a16b-05b40b9274e4',
    'Área da Medicina e Saúde Pública', 'Análise epidemiológica que traça o trajeto das vítimas a partir das urgências médicas.'
  ],
  [
    'dout_060', 'Autor Não Especificado', 'Análise dos atendimentos a mulheres em situação de violência pelo parceiro íntimo em uma unidade hospitalar',
    'Artigo', 2021, 'UFMG',
    'https://repositorio.ufmg.br/items/d7bdff9d-829d-40fe-b571-c012b51695d1',
    'Área da Medicina e Saúde Pública', 'Apresentação clínica de lesões corporais traumatológicas.'
  ],
  [
    'dout_061', 'Autor Não Especificado', 'Buscando a porta de saída: morosidade e acesso à (in)justiça nas sentenças de processos criminais por violência doméstica no território de Irecê - BA (2013-2023)',
    'Tese Académica', 2025, 'UnB',
    'https://repositorio.unb.br/handle/10482/54127',
    'Área Jurídica', 'Estudo focado na morosidade processual das decisões criminais familiares.'
  ],
  [
    'dout_062', 'Ana Carolina Litran Andrade', 'Núcleo Integrado de Atendimento à Mulher da Polícia Civil do Distrito Federal: um estudo de avaliabilidade',
    'Dissertação', 2025, 'UnB',
    'https://repositorio.unb.br/handle/10482/52153',
    'Área das Perícias (Forense e Investigação)', 'Resultados operacionais obtidos por núcleos policiais integrados.'
  ],
  [
    'dout_063', 'Ana Claudia Rodrigues Maia', 'O PAEFI no atendimento às mulheres em situação de violência doméstica: um estudo realizado em três regiões administrativas do Distrito Federal',
    'Estudo Prático', 2023, 'UnB',
    'https://repositorio.unb.br/handle/10482/49872',
    'Área Social e Apoio à Vítima', 'Intervenção continuada e mitigação do trauma familiar na rede.'
  ],
  [
    'dout_064', 'Aline Oliveira Cardoso', '"Homem machuca a gente demais": a experiência de mulheres em situação de violência doméstica e o papel da Atenção Primária à Saúde',
    'Tese Académica', 2023, 'UnB',
    'https://repositorio.unb.br/handle/10482/49815',
    'Área da Medicina e Saúde Pública', 'Papel da rede sanitária comunitária primária na identificação precoce do risco.'
  ],
  [
    'dout_065', 'Izabella de Moraes da Silva', 'Violência contra mulheres em período de pandemia: desafios e inovações na atuação de delegacias especializadas de atendimento à mulher',
    'Monografia', 2023, 'UnB',
    'https://repositorio.unb.br/handle/10482/49320',
    'Área das Perícias (Forense e Investigação)', 'Inovação com atendimento policial remoto e geolocalização emergencial.'
  ],
  [
    'dout_066', 'Aline Teixeira da Silva Lima', 'Quando o amor rima com dor: representações da violência conjugal na literatura contemporânea',
    'Análise Doutoral', 2022, 'UnB',
    'https://repositorio.unb.br/handle/10482/44272',
    'Área Social e Apoio à Vítima', 'Crítica literária e construções culturais de dor íntima conjugal.'
  ],
  [
    'dout_067', 'Autor Não Especificado', 'Violência doméstica: vitimização e enfrentamento',
    'Estudo Académico', 2010, 'UFRGS',
    'https://lume.ufrgs.br/handle/10183/23015',
    'Área Social e Apoio à Vítima', 'Desatamento de laços violentos e percursos institucionais.'
  ],
  [
    'dout_068', 'R. R. Silva', 'Um basta a violência doméstica contra mulher camponesa: a práxis e os desafios do Movimento de Mulheres Camponesas',
    'Investigação', 2025, 'UFG',
    'https://repositorio.bc.ufg.br/tede/items/8e3b8653-af1c-4af6-83e2-2729f886abce/full',
    'Área Social e Apoio à Vítima', 'Realidade camponesa, isolamento e dinâmicas de resistência de mulheres.'
  ],
  [
    'dout_069', 'Nádia de Machado Vasconcelos', 'A carga da violência contra as mulheres no Brasil',
    'Tese Doutoral', 2024, 'UFMG',
    'https://www.ufmg.br/',
    'Área da Medicina e Saúde Pública', 'Análise epidemiológica do peso em anos de saúde perdidos decorrentes de agressões.'
  ],
  [
    'dout_070', 'Autor Não Especificado', 'Violência doméstica no contexto de isolamento social pela pandemia de COVID-19',
    'Artigo', 2022, 'Serviço Social & Sociedade',
    'https://www.scielo.br/j/sssoc/',
    'Área Social e Apoio à Vítima', 'Dificuldades acrescidas das redes institucionais e confinamento forçado.'
  ],
  [
    'dout_071', 'Autor Não Especificado', 'VIOLÊNCIA CONTRA A MULTIMULHER: PROBLEMATIZANDO DEFINIÇÕES TEÓRICAS',
    'Artigo', 2015, 'Psicologia & Sociedade',
    'https://www.scielo.br/j/psoc/',
    'Área da Psicologia', 'Conceitualização teórica do abuso psicológico continuado.'
  ],
  [
    'dout_072', 'Autor Não Especificado', 'violência doméstica ou violência intrafamiliar: análise dos termos e suas implicações',
    'Artigo', 2018, 'Psicologia & Sociedade',
    'https://www.scielo.br/j/psoc/',
    'Área da Psicologia', 'Análise conceptual e as suas consequências nas políticas de segurança.'
  ],
  [
    'dout_073', 'Autor Não Especificado', 'violência por parceiro íntimo: perpetração e vitimização por violência física e psicológica',
    'Artigo', 2019, 'Psicologia & Sociedade',
    'https://www.scielo.br/j/psoc/',
    'Área da Psicologia', 'Avaliação de agressões de cariz corporal simples e agressões psicológicas.'
  ],
  [
    'dout_074', 'Autor Não Especificado', 'Brazil - Violência contra a mulher: revisão sistemática da produção científica',
    'Revisão', 2021, 'Ciência & Saúde Coletiva',
    'https://www.scielo.br/j/csc/',
    'Área da Medicina e Saúde Pública', 'Pesquisa empírica sobre epidemiologia e proteção contra violência.'
  ],
  [
    'dout_075', 'Autor Não Especificado', 'Sistema de justiça criminal e violência doméstica contra as crianças e adolescentes',
    'Artigo', 2020, 'Revista Katálysis',
    'https://www.scielo.br/j/rk/',
    'Área Jurídica', 'Sinalização e proteção criminal de menores agredidos no domicílio.'
  ],
  [
    'dout_076', 'Autor Não Especificado', 'A violência doméstica e racismo contra mulheres negras',
    'Artigo', 2020, 'Revista Estudos Feministas',
    'https://educa.fcc.org.br/',
    'Área Social e Apoio à Vítima', 'Interseccionalidade de racismo e género em abusos familiares.'
  ],
  [
    'dout_077', 'Autor Não Especificado', 'Violência doméstica: um estudo bibliométrico',
    'Artigo', 2011, 'Psicologia em Estudo',
    'https://pepsic.bvsalud.org/',
    'Área da Psicologia', 'Mapeamento bibliométrico da literatura em psicologia e direito de família.'
  ],
  [
    'dout_078', 'Autor Não Especificado', 'Violência doméstica: uma análise teórica/psicossocial das intervenções',
    'Artigo Técnico', 2025, 'REASE',
    'https://periodicorease.pro.br/',
    'Área da Psicologia', 'Aborda vinculação traumática e desamparo em dinâmicas de parceria íntima.'
  ],
  [
    'dout_079', 'Eduardo Ramón Ribas', 'Violencia de género y violencia doméstica',
    '1.ª Edição', 2008, 'Tirant lo Blanch',
    'https://libreria.tirant.com/es/',
    'Área Jurídica', 'Monografia penal espanhola sobre a diferenciação de crime de género.'
  ],
  [
    'dout_080', 'Fernando Vázquez-Portomeñe Seijas, Natalia Pérez Rivas (Coords.)', 'Violencia contra la mujer: Manual de apoyo para el grado de criminología',
    'Manual', 2024, 'Tirant lo Blanch',
    'https://www.marcialpons.es/',
    'Área das Perícias (Forense e Investigação)', 'Manual académico contendo critérios de perigosidade criminal e reincidência.'
  ],
  [
    'dout_081', 'Autor Não Especificado', 'Manual práctico sobre violencia de género, violencia doméstica y sobre la infancia. Cuestiones prácticas y procesales',
    '1.ª Edição', 2025, 'Tirant lo Blanch',
    'https://libreria.tirant.com/es/',
    'Área Jurídica', 'Grelhas práticas judiciais e processuais para proteção da infância.'
  ],
  [
    'dout_082', 'Pilar Álvarez Olalla', 'Violencia de género y responsabilidad civil',
    '1.ª Edição', 2020, 'Editorial Reus',
    'https://www.editorialreus.es/',
    'Área Jurídica', 'Critérios civis de quantificação de danos morais decorrentes de maus-tratos.'
  ],
  [
    'dout_083', 'Autor Não Especificado', 'El olvido de los direitos de la infancia en la violencia de género',
    'Coleção', 2021, 'Editorial Reus',
    'https://www.editorialreus.es/',
    'Área Social e Apoio à Vítima', 'Crítica ao direito de visita concedido a progenitores agressores.'
  ],
  [
    'dout_084', 'Autor Não Especificado', 'La guarda y custodia de los menores en los supuestos de violencia doméstica',
    'Estudo', 2022, 'Editorial Reus',
    'https://www.editorialreus.es/',
    'Área Jurídica', 'Suspensão de poder paternal e o primado absoluto do interesse de crianças.'
  ],
  [
    'dout_085', 'Autor Não Especificado', 'Mujer extranjera, violencia doméstica y violencia de género',
    'Estudo', 2023, 'Editorial Reus',
    'https://www.editorialreus.es/',
    'Área Social e Apoio à Vítima', 'Garantias residenciais e assistência social de imigrantes vítimas de agressões.'
  ],
  [
    'dout_086', 'Rosa Salvador Concepción', 'Violencia de género en España, Francia, Reino Unido e Italia: ¿un conceito global?',
    '1.ª Edição', 2015, 'Dykinson',
    'https://www.marcialpons.es/',
    'Área Jurídica', 'Estudo comparado europeu de proteção à mulher.'
  ],
  [
    'dout_087', 'Josep M.ª Tamarit Sumalla, Noemí Pereda Beltran (Coords.)', 'Violencia y género en las relaciones de pareja',
    '1.ª Edição', 2020, 'Marcial Pons',
    'https://www.dykinson.com/',
    'Área Jurídica', 'Investigação victimológica das consequências físicas e mentais das agressões.'
  ],
  [
    'dout_088', 'Silvina Álvarez Medina, Susana Quicios Molina (Coords.)', 'El direito frente a la violencia dentro de la família...',
    '1.ª Edição', 2020, 'Editorial Aranzadi',
    'https://www.marcialpons.es/',
    'Área Jurídica', 'Abordagem multidisciplinar e processual de tutela criminal e civil urgente.'
  ],
  [
    'dout_089', 'Autor Não Especificado', 'Violencia vicaria: Niñas, niños y adolescentes supervivientes de la violencia machista en la pareja',
    'Estudo', 2026, 'Dykinson',
    'https://www.marcialpons.es/',
    'Área da Psicologia', 'Estuda as agressões dirigidas a filhos com intuito de tortura psicológica da progenitora.'
  ],
  [
    'dout_090', 'Julián Sánchez Melgar, Mª Concepción Rayón Ballesteros (Coords.)', 'Violencia sobre las mujeres: Direito, proceso y protección',
    '1.ª Edição', 2026, 'Sepin / Dykinson',
    'https://www.marcialpons.es/',
    'Área Jurídica', 'Tratado completo de direito penal e medidas protetivas urgentes.'
  ],
  [
    'dout_091', 'Carmen Ruiz Sutil', 'Las violencias de género en entornos transfronterizos...',
    '1.ª Edição', 2025, 'Dykinson',
    'https://www.dykinson.com/',
    'Área Jurídica', 'Conflitos internacionais de asilo, direito privado e extradição de agressores.'
  ],
  [
    'dout_092', 'Sergio Cámara Arroyo', '(Ni) Acoso (Ni) Sexual (Ni) Callejero: Fundamentos criminológicos y análisis jurídico-penal del art. 173.4',
    '1.ª Edição', 2026, 'Dykinson',
    'https://www.marcialpons.es/',
    'Área Jurídica', 'Fundações criminológicas sobre assédio moral e perseguição continuada.'
  ],
  [
    'dout_093', 'Autor Não Especificado', 'El delito de malos tratos físicos y psíquicos en el ámbito familiar',
    'Clássico', 2000, 'Tirant lo Blanch',
    'https://books.google.com/',
    'Área Jurídica', 'Estudo pioneiro sobre a dogmática do crime de maus-tratos intrafamiliares.'
  ],
  [
    'dout_094', 'Pedro Fernández Santiago', 'Violencia familiar',
    '1.ª Edição', 2007, 'Tirant lo Blanch',
    'https://libreria.tirant.com/es/',
    'Área Social e Apoio à Vítima', 'Análise sociológica das agressões físicas no âmbito doméstico.'
  ],
  [
    'dout_095', 'Juan J. Medina', 'Violencia contra la mujer en la pareja: Investigación comparada y situación en España',
    '1.ª Edição', 2002, 'Tirant lo Blanch',
    'https://libreria.tirant.com/es/',
    'Área das Perícias (Forense e Investigação)', 'Investigação comparada contendo preditores de risco e reabilitação de agressores.'
  ],
  [
    'dout_096', 'Patricia Esquinas Valverde', 'Mediación entre víctima y agresor en la violencia de género',
    '1.ª Edição', 2008, 'Tirant lo Blanch',
    'https://libreria.tirant.com/es/',
    'Área Jurídica', 'Aborda a inadequabilidade de mediação cível perante agressões físicas continuadas.'
  ],
  [
    'dout_097', 'Elena Martínez García', 'Ley de Protección integral contra la violencia de género',
    '1.ª Edição', 2005, 'Tirant lo Blanch',
    'https://libreria.tirant.com/es/',
    'Área Jurídica', 'Analisa a reforma legal espanhola e a constituição de juízos especializados.'
  ],
  [
    'dout_098', 'José A. Mora Alarcón', 'Formularios sobre processos por violencia de género',
    '1.ª Edição', 2005, 'Tirant lo Blanch',
    'https://libreria.tirant.com/es/',
    'Área Jurídica', 'Modelos e formulários processuais para investigadores e magistrados.'
  ],
  [
    'dout_099', 'Guajardo, G. & Rivera, Ch. (Coords.)', 'Violencias contra las mulheres',
    'Estudo', 2015, 'FLACSO',
    'https://biblio.flacsoandes.edu.ec/libros/digital/54988.pdf',
    'Área Social e Apoio à Vítima', 'Diretrizes de proteção e acompanhamento a vítimas de agressões graves.'
  ],
  [
    'dout_100', 'Vários Autores', 'Violencia de género en América Latina',
    'Estudo', 2012, 'CLADEM',
    'https://www.scba.gov.ar/instituto/generoyviolenciafamiliar/',
    'Área Social e Apoio à Vítima', 'Sumário de dinâmicas criminais e letalidade na esfera conjugal.'
  ],
  [
    'dout_101', 'Springer Research', 'Journal of Family Violence',
    'Revista', 2024, 'Springer',
    'https://link.springer.com/journal/10896',
    'Área da Psicologia', 'Artigos de investigação científica dedicados a fatores psicosociais e tratamento do trauma.'
  ],
  [
    'dout_102', 'SAGE Research', 'Violence Against Women',
    'Revista', 2024, 'SAGE Publications',
    'https://journals.sagepub.com/home/vaw',
    'Área da Psicologia', 'Foco em aspetos de policiamento de género e mitigação de perigosidade.'
  ],
  [
    'dout_103', 'SAGE Research', 'Journal of Interpersonal Violence',
    'Revista', 2024, 'SAGE Publications',
    'https://journals.sagepub.com/home/jiv',
    'Área da Psicologia', 'Investigação de topo em trauma de violência intrafamiliar.'
  ],

  // ==========================================
  // NOVOS DE PSICOLOGIA/PERÍCIAS/MEDICINA (ESTRANGEIRAS E INTERNACIONAIS) - 117 a 146
  // ==========================================
  [
    'dout_117', 'Vetor Editora (Coord.)', 'Manual da Perícia Psicológica Forense VOL. 2: Aplicações nos Contextos Cível e Criminal',
    '1.ª Edição', 2024, 'Vetor Editora',
    'https://www.vetoreditora.com.br/produto/manual-da-pericia-psicologica-forense-vol-2-71669',
    'Área das Perícias (Forense e Investigação)', 'Inclui capítulos específicos dedicados a perícia psicológica forense na violência doméstica e de género.'
  ],
  [
    'dout_118', 'Claudio Simon Hutz, Denise Ruschel Bandeira, et al. (Coords.)', 'Avaliação psicológica no contexto forense',
    '1.ª Edição', 2020, 'Artmed',
    'https://sinopsyseditora.com.br/livros/avaliacao-psicologica-no-contexto-forense-artmed-grupo-a-1875',
    'Área da Psicologia', 'Capítulos relevantes sobre avaliação psicológica na violência intrafamiliar e avaliação de risco em parceiro íntimo.'
  ],
  [
    'dout_119', 'Paula Inez Cunha Gomide, Sérgio Said Staut Júnior (Coords.)', 'Introdução à Psicologia Forense',
    '1.ª Edição', 2021, 'Juruá Editora',
    'https://www.jurua.com.br/shop_item.asp?id=24517',
    'Área da Psicologia', 'Contém aspetos específicos da intervenção de agressores domésticos sob acompanhamento psicológico.'
  ],
  [
    'dout_120', 'Denise Maria Perissini da Silva', 'Psicologia Jurídica e os Aspectos Processuais da Perícia em Varas de Família',
    '6.ª Edição', 2024, 'Juruá Editora',
    'https://www.jurua.com.br/shop_item.asp?id=30633',
    'Área da Psicologia', 'Regula as perícias e as garantias processuais das crianças em varas cíveis e de família.'
  ],
  [
    'dout_121', 'Matthew T. Huss', 'Psicologia Forense: Pesquisa, Prática Clínica e Aplicações',
    '1.ª Edição', 2020, 'Artmed',
    'https://loja.grupoa.com.br/psicologia-forense-p990533',
    'Área da Psicologia', 'Capítulos completos relativos a avaliação de risco de violência física, perseguição e stalking.'
  ],
  [
    'dout_122', 'Cristiane Flôres Bortoncello', 'Violência: compêndio teórico-prático sobre vítimas e agressores',
    '1.ª Edição', 2024, 'Sinopsys Editora',
    'https://sinopsyseditora.com.br/livros/violencia-compendio-teorico-pratico-sobre-vitimas-e-agressores-3960',
    'Área da Psicologia', 'Compêndio contendo 39 capítulos práticos de tratamento cognitivo-comportamental para ofendidos e ofensores.'
  ],
  [
    'dout_123', 'Algelita Maria Ferreira Machado Rios, Luiziana Souto Schaefer', 'Perícia Médico-Legal e Criminal em Casos de Violência Sexual Contra Crianças e Adolescentes',
    '2.ª Edição', 2026, 'Editora Mundo Jurídico',
    'https://www.editoramundojuridico.com.br/',
    'Área das Perícias (Forense e Investigação)', 'Metodologia médico-legal com referências à Lei Henry Borel de proteção infanto-juvenil contra abusos domésticos.'
  ],
  [
    'dout_124', 'Autor Não Especificado', 'Perícia Médica no Direito',
    'Manual Clínico', 2025, 'Editora Rumo Jurídico',
    'https://www.rumojuridico.com.br/wp-content/uploads/2025/04/Pericia_Medica_no_Direito.pdf',
    'Área da Medicina e Saúde Pública', 'Capítulo dedicado ao exame médico-legal em casos de lesão corporal traumática.'
  ],
  [
    'dout_125', 'Autor Não Especificado', 'Vade Mecum de Medicina Legal e Odontologia Legal',
    'Manual Técnico', 2011, 'Livraria Florence',
    'https://www.livrariaflorence.com.br/livro-vade-mecum-de-medicina-legal-e-odontologia-legal',
    'Área da Medicina e Saúde Pública', 'Inclui secções focadas em aspetos médico-legais de maus-tratos domésticos e lesões faciais.'
  ],
  [
    'dout_126', 'Leonardo Henriques da Silva', 'Violência doméstica contra a mulher e lesões corporais: aspectos médico-legais',
    'Dissertação Académica', 2013, 'Universidade de São Paulo (USP)',
    'https://teses.usp.br/teses/disponiveis/2/2136/tde-18022013-115234/',
    'Área da Medicina e Saúde Pública', 'Estudo exaustivo sobre a natureza médico-legal das escoriações e fraturas decorrentes de conflito familiar.'
  ],
  [
    'dout_127', 'Murillo Carvalho et al.', 'Violência doméstica contra mulher e lesões corporais: aspectos médico-legais',
    'Artigo Científico', 2023, 'Revista de Acadêmicos e Egressos da Medicina - RaMED',
    'https://repositorio.uniceub.br/jspui/bitstream/prefix/16950/1/14.pdf',
    'Área da Medicina e Saúde Pública', 'Aborda o papel pericial médico na tipificação judicial do dolo de agressores conjugais.'
  ],
  [
    'dout_128', 'Juliano Silva', 'A PERÍCIA MÉDICA NA INVESTIGAÇÃO DE CASOS DE VIOLÊNCIA',
    'Tese de Especialidade', 2024, 'Universidade Federal do Paraná (UFPR)',
    'https://saude.ufpr.br/epmufpr/wp-content/uploads/sites/42/2024/07/JULIANO-SILVA.pdf',
    'Área da Medicina e Saúde Pública', 'Manual de apoio a médicos peritos na caracterização do nexo de causalidade das lesões.'
  ],
  [
    'dout_129', 'Fabia Pereira Angelim', 'Construindo novos discursos sobre a violência doméstica: uma articulação entre a psicologia clínica e a justiça',
    'Dissertação de Mestrado', 2009, 'Universidade de Brasília (UnB)',
    'https://repositorio.unb.br/bitstream/10482/7367/1/2009_FabiaPereiraAngelim.pdf',
    'Área da Psicologia', 'Foca na intervenção juspsicológica integrada para cessação das dinâmicas repetitivas.'
  ],
  [
    'dout_130', 'Luciane Leandro Fernandes Souza', 'Intervenção psicológica às vítimas de violência doméstica',
    'Monografia', 2022, 'Repositório PPGS',
    'https://repositorio.pgsscogna.com.br/bitstream/123456789/61585/1/LUCIANE_LEANDRO_FERNANDES_SOUZA.pdf',
    'Área da Psicologia', 'Estudo focado na eficácia da intervenção psicológica em grupos de apoio.'
  ],
  [
    'dout_131', 'Amanda', 'Práticas psicológicas no apoio às mulheres vítimas de violência doméstica no Brasil',
    'Estudo Técnico', 2023, 'Repositório AEE',
    'http://repositorio.aee.edu.br/bitstream/aee/23131/',
    'Área da Psicologia', 'Sistematiza práticas clínicas de psicoterapia de apoio e acolhimento institucional urgente.'
  ],
  [
    'dout_132', 'Autor Não Especificado', 'Violência contra o homem perpetrada por sua (seu) parceira (o) íntima (o): estudo quanti/quali',
    'Tese de Doutoramento', 2017, 'Universidade Federal de Juiz de Fora (UFJF)',
    'https://www2.ufjf.br/nevas/publicacoes/',
    'Área da Psicologia', 'Estudo quantitativo e qualitativo sobre vitimização masculina no contexto doméstico.'
  ],
  [
    'dout_133', 'Gross, Zamora, Ruoso, Ligório, Rodrigues, Freitas, & Habigzang', 'Psicoterapia com mulheres em situação de violência por parceiro íntimo: revisão sistemática',
    'Artigo Científico', 2023, 'SciELO / Pepsic',
    'https://pepsic.bvsalud.org/scielo.php?script=sci_arttext&pid=S1516-36872025000103003',
    'Área da Psicologia', 'Avalia o impacto de protocolo de psicoterapia cognitivo-comportamental focado no trauma.'
  ],
  [
    'dout_134', 'Autor Não Especificado', 'Psicoterapia cognitivo-comportamental para mulheres em situação de violência doméstica: revisão sistemática',
    'Revisão Sistemática', 2018, 'Redalyc',
    'https://www.redalyc.org/journal/2910/291059507008/html/',
    'Área da Psicologia', 'Sistematização de técnicas de intervenção e mitigação de sintomas de perturbação de stress pós-traumático.'
  ],
  [
    'dout_135', 'Autor Não Especificado', 'Violência doméstica e psicologia: uma revisão integrativa da literatura',
    'Artigo Académico', 2023, 'Revista de Saúde e Ciências (UESB)',
    'https://periodicos2.uesb.br/index.php/rsc/article/view/16438',
    'Área da Psicologia', 'Mapeia a evolução teórica sobre a alienação, dependência e trauma.'
  ],
  [
    'dout_136', 'Autor Não Especificado', 'Violência conjugal: diferentes olhares epistemológicos e práticas',
    'Artigo de Revisão', 2021, 'Pepsic',
    'https://pepsic.bvsalud.org/scielo.php?script=sci_arttext&pid=S1809-89082021000300003',
    'Área da Psicologia', 'Discute terapias de casal focadas em soluções e limites éticos do contraditório.'
  ],
  [
    'dout_137', 'Rovinski, S. L. R.', 'O lugar da psicologia forense na violência intrafamiliar',
    'Artigo de Doutrina', 2005, 'SciELO',
    'https://www.scielo.br/j/estpsi/',
    'Área da Psicologia', 'Aborda o papel do psicólogo perito na avaliação do comportamento familiar e risco.'
  ],
  [
    'dout_138', 'Rovinski, S. L. R.', 'A avaliação do dano psíquico em mulheres vítimas de violência',
    'Capítulo / Estudo', 2005, 'SciELO',
    'https://www.scielo.br/j/estpsi/',
    'Área da Psicologia', 'Descreve métodos científicos de quantificação e demonstração jurídica de dano psíquico.'
  ],
  [
    'dout_139', 'Pilar Álvarez Olalla', 'Violencia de género y responsabilidad civil (Registo Reus)',
    'Estudo', 2020, 'Editorial Reus',
    'https://www.editorialreus.es/libros/etiqueta/violencia-domestica/',
    'Área Jurídica', 'Estudo jurídico focado no ressarcimento civil por dano psíquico decorrente de maus-tratos.'
  ],
  [
    'dout_140', 'Silvina Álvarez Medina, Susana Quicios Molina (Coords.)', 'El derecho frente a la violencia dentro de la familia (Registo Aranzadi)',
    'Manual Multidisciplinar', 2020, 'Editorial Aranzadi',
    'https://www.marcialpons.es/libros/el-derecho-frente-a-la-violencia-dentro-de-la-familia/9788413097428/',
    'Área Jurídica', 'Enfoque multidisciplinar que une aspetos penais, de apoio de emergência e psicologia.'
  ],
  [
    'dout_141', 'Josep M.ª Tamarit Sumalla, Noemí Pereda Beltran (Coords.)', 'Violencia y género en las relaciones de pareja (Registo Dykinson)',
    'Estudo Victimológico', 2020, 'Marcial Pons',
    'https://www.dykinson.com/libros/violencia-y-genero-en-las-relaciones-de-pareja-9788491238867/',
    'Área Jurídica', 'Capítulos dedicados à avaliação pericial de dano emocional e stress pós-traumático.'
  ],
  [
    'dout_142', 'Karla Jordana de Moraes Carvalho', 'Terapia Narrativa de Re-autoria com mulheres vítimas de violência doméstica',
    'Dissertação Académica', 2022, 'Universidade do Minho',
    'https://repositorium.uminho.pt/server/api/core/bitstreams/8cb7fdea-0237-4d67-aefc-bc980cdc29d3/content',
    'Área da Psicologia', 'Avaliação qualitativa do processo de mudança terapêutica e reconstrução da narrativa.'
  ],
  [
    'dout_143', 'Springer Research (Eds.)', 'Journal of Family Violence (Área Psicológica)',
    'Revista Científica', 2024, 'Springer',
    'https://link.springer.com/',
    'Área da Psicologia', 'Artigos de referência na avaliação do trauma, perícias psicológicas e medicina.'
  ],
  [
    'dout_144', 'SAGE Research (Eds.)', 'Violence Against Women (Saúde & Perícias)',
    'Revista Científica', 2024, 'SAGE Publications',
    'https://journals.sagepub.com/',
    'Área da Psicologia', 'Artigos de ponta sobre stress pós-traumático, vitimização de mulheres e perícias.'
  ],
  [
    'dout_145', 'SAGE Research (Eds.)', 'Journal of Interpersonal Violence (Estudos Clínicos)',
    'Revista Científica', 2024, 'SAGE Publications',
    'https://journals.sagepub.com/',
    'Área da Psicologia', 'Revista internacional dedicada a aspetos clínicos e tratamentos de reabilitação.'
  ],
  [
    'dout_146', 'SAGE Research (Eds.)', 'Trauma, Violence, & Abuse',
    'Revista Científica', 2024, 'SAGE Publications',
    'https://pepsic.bvsalud.org/',
    'Área da Psicologia', 'Revista internacional especializada em trauma, psicologia forense e aspetos clínicos de saúde pública.'
  ]
];

// Combine national and international arrays
const OBRAS_CONSOLIDADAS_RAW = [...OBRAS_PORTUGAL_RAW, ...OBRAS_ESTRANGEIRAS_RAW];

// Map compact metadata into complete ReferenciaDoutrinaria objects
export const DOUTRINA_INICIAL: ReferenciaDoutrinaria[] = OBRAS_CONSOLIDADAS_RAW.map((raw) => {
  const [id, autores, nomeObra, edicao, anoEdicao, nomeEditora, url, area, resumo] = raw;
  const parteOuAmbito = id.startsWith('dout_0') && Number(id.replace('dout_0', '')) <= 44 || id === 'dout_104' || id === 'dout_105' || id === 'dout_106' || id === 'dout_107' || id === 'dout_108' || id === 'dout_109' || id === 'dout_110' || id === 'dout_111' || id === 'dout_112' || id === 'dout_113' || id === 'dout_114' || id === 'dout_115' || id === 'dout_116'
    ? 'Obras Nacionais (Portugal)'
    : 'Obras Estrangeiras (Seleção)';

  const linksAcesso = url ? [url] : [];
  
  return {
    id,
    autores,
    nomeObra,
    edicao,
    anoEdicao,
    nomeEditora,
    temDocumento: false,
    linksAcesso,
    acessoLivre: url.includes('.pdf') || url.includes('hdl.handle.net') || url.includes('repositor') || url.includes('ojs.') || url.includes('estudogeral') || url.includes('periodicos'),
    resumo,
    dataRegisto: '2026-09-30',
    statusValidacao: 'validado',
    fonteVarredura: nomeEditora,
    areaTematica: area,
    parteOuAmbito
  };
});
