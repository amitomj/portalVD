export interface SampleDocument {
  nome: string;
  conteudo: string;
  descricao: string;
  tipoEsperado: 'VD' | 'Homicidio_VD' | 'Nao_Elegivel';
}

export const CASOS_EXEMPLO: SampleDocument[] = [
  {
    nome: 'Sentenca_VD_Proc_145_21_4PBAMD.txt',
    descricao: 'Sentença de Violência Doméstica contra Cônjuge, coabitam em casa própria de ambos, vencimento, perícia INMLCF e menor.',
    tipoEsperado: 'VD',
    conteudo: `TRIBUNAL JUDICIAL DA COMARCA DE LISBOA OESTE
JUÍZO LOCAL CRIMINAL DA AMADORA - JUIZ 2
Processo Comum Singular n.º 145/21.4PBAMD

I. RELATÓRIO
O Ministério Público deduziu acusação contra:
O arguido António Manuel Ferreira, nascido a 12 de Maio de 1981 (45 anos de idade), do sexo masculino, de nacionalidade portuguesa, eletricista da profissão, auferindo o vencimento mensal de cerca de 1.150 euros, habilitado com o 9.º ano de escolaridade (3.º ciclo do ensino básico), sem antecedentes criminais averbados no seu Certificado de Registo Criminal (CRC).

Imputando-lhe a prática de:
- 1 (um) crime de violência doméstica, p. e p. pelo artigo 152.º, n.º 1, alínea a) e n.º 2, alínea a) do Código Penal.

Ofendida:
Maria Luísa Costa Ferreira, com 42 anos de idade, do sexo feminino, casada com o arguido há 16 anos (cônjuges entre si), exercendo a profissão de assistente administrativa, auferindo o vencimento de 850 euros mensais, titular do 12.º ano de escolaridade, sem antecedentes.

II. FACTOS PROVADOS
Resultou provado que o arguido e a ofendida são cônjuges (casados entre si desde 2008) e coabitam na mesma residência, sita na Amadora, tratando-se de casa própria adquirida por ambos os cônjuges (bem comum do casal), juntamente com o filho menor de ambos, Tomás, nascido a 14/03/2018, com 8 anos de idade.
No período compreendido entre janeiro de 2021 e outubro de 2023, o arguido:
1. Agrediu fisicamente a ofendida no domicílio comum, desferindo-lhe bofetadas, empurrões e socos nos braços e rosto, provocando-lhe hematomas e escoriações no corpo.
2. Dirigiu-lhe repetidamente expressões injuriosas e vexatórias, tais como "não vales nada", "és uma incompetente", e ameaçou-a de morte dizendo "se te separas de mim, mato-te a ti e a quem estiver contigo".
3. Tais agressões e ameaças foram praticadas reiteradamente na presença do filho menor do casal, que chorava a pedir para o pai parar.
4. Partiu o telemóvel da ofendida contra o chão com o intuito de impedir que esta contactasse as autoridades ou familiares.

Foram realizadas perícias nos autos:
- Perícia médico-legal de avaliação do dano corporal pelo Instituto Nacional de Medicina Legal e Ciências Forenses (INMLCF), que atestou 8 dias para cura com incapacidade para o trabalho;
- Relatório social elaborado pela Direção-Geral de Reinserção e Serviços Prisionais (DGRSP) quanto ao enquadramento social do arguido.

III. DECISÃO (DISPOSITIVO)
Pelo exposto, decide-se:
a) Condenar o arguido António Manuel Ferreira pela prática de um crime de violência doméstica (artigo 152.º, n.º 1, al. a) e n.º 2, al. a) do Código Penal) na pena de 2 (dois) anos e 6 (seis) meses de prisão, suspensa na sua execução pelo período de 3 (três) anos, subordinada a regime de prova e à frequência do Programa de Agressores de Violência Doméstica (PAVD);
b) Não se verifica a reincidência porquanto o arguido é delinquente primário;
c) Condenar o arguido na pena acessória de proibição de contactos com a ofendida por qualquer meio, e de aproximação da sua residência e local de trabalho, a fiscalizar através de meios técnicos de controlo à distância (pulseira eletrónica);
d) Condenar o arguido no pagamento de 3.500,00 € (três mil e quinhentos euros) à ofendida a título de indemnização por danos morais.

Comarca de Lisboa Oeste, 15 de Novembro de 2023.
O Juiz de Direito.`
  },
  {
    nome: 'Sentenca_VD_Proc_512_22_3PBLRA.txt',
    descricao: 'Violência Doméstica entre Unidos de Facto, coabitam em casa arrendada, profissão não apurada com vencimento apurado.',
    tipoEsperado: 'VD',
    conteudo: `TRIBUNAL JUDICIAL DA COMARCA DE LEIRIA
Juízo Local Criminal de Leiria - Juiz 1
Processo Comum Singular n.º 512/22.3PBLRA

I. RELATÓRIO
O Ministério Público requereu o julgamento de:
Arguido: Manuel Jorge Duarte, de 38 anos de idade, do sexo masculino, nascido a 20/04/1988, solteiro, profissão não apurada cabalmente nos autos mas resultou apurado que aufere o vencimento mensal de cerca de 950 euros em biscates na construção civil, habilitado com o 6.º ano de escolaridade, sem antecedentes criminais averbados.

Ofendida:
Carla Sofia Moreira, com 35 anos, do sexo feminino, solteira, profissão não apurada, recebendo o subsídio de desemprego no montante de 600 euros, habilitada com o 9.º ano.

Imputação:
Prática de 1 crime de violência doméstica, previsto e punido pelo art. 152.º, n.º 1, alínea b) do Código Penal.

II. FACTOS PROVADOS
1. O arguido e a ofendida viveram em união de facto durante cerca de 4 anos, coabitando em condições análogas às dos cônjuges na mesma residência sita em Leiria.
2. A habitação onde residiam tratava-se de casa arrendada, mediante o pagamento da renda mensal de 450 euros suportada por ambos.
3. Não têm filhos menores.
4. O arguido injuriou a companheira apelidando-a de rameira, empurrou-a contra uma parede e ameaçou atear fogo à casa arrendada se esta o abandonasse.
5. Realizada perícia de avaliação do dano corporal pelo INMLCF comprovando hematomas no braço direito.

III. DECISÃO
Pelo exposto, o tribunal decide condenar o arguido Manuel Jorge Duarte na pena de 1 (um) ano e 8 (oito) meses de prisão suspensa na sua execução por igual período.

Leiria, 22 de Fevereiro de 2024.
A Juíza de Direito.`
  },
  {
    nome: 'Acordao_Homicidio_Tentado_Proc_389_20_8JAPRT.txt',
    descricao: 'Tentativa de Homicídio qualificado em contexto de relacionamento conjugal íntimo (Ex-cônjuge / divorciados), com reincidência.',
    tipoEsperado: 'Homicidio_VD',
    conteudo: `TRIBUNAL DA RELAÇÃO DO PORTO
1.ª Secção Criminal
Processo n.º 389/20.8JAPRT

ACÓRDÃO
I. Relatório
No Juízo Central Criminal de Vila Nova de Gaia - Juiz 3, foi submetido a julgamento em processo comum perante tribunal coletivo:
O arguido Carlos Alberto Ribeiro, com 51 anos de idade, sexo masculino, profissão de carpinteiro, vencimento de 1.300 euros mensais, habilitado com o 4.º ano do ensino primário, já com antecedentes criminais averbados por crimes de ofensas à integridade física e ameaças.

Ofendida:
Ana Paula Sousa Ribeiro, de 48 anos, sexo feminino, empregada de limpeza, auferindo 780 euros de vencimento, habilitada com o 6.º ano de escolaridade, ex-cônjuge do arguido (divorciados em 2019 após casamento de 22 anos). Não coabitam, vivendo em habitações distintas.

Imputação:
Prática de um crime de homicídio qualificado na forma tentada (artigos 131.º, 132.º, n.º 1 e n.º 2, alínea b) do Código Penal), conjugado com o contexto de relacionamento íntimo e perseguição (art. 154.º-A do CP).

II. Factos Provados
O arguido não aceitou o divórcio. Perseguiu a ex-mulher durante meses.
No dia 14 de setembro de 2020, abordou a ofendida na via pública e munido de uma arma branca (faca de cozinha) desferiu-lhe golpes na zona torácica com intenção manifesta de lhe tirar a vida. A morte só não sobreveio devido à pronta assistência médica hospitalar.
Realizada perícia psiquiátrica forense que concluiu pela plena imputabilidade do arguido, perícia médico-legal do INMLCF e perícia informática às mensagens de perseguição no telemóvel.
Verifica-se a reincidência do arguido nos termos do artigo 75.º do Código Penal, atendendo a condenação prévia transitada em julgado há menos de três anos.

III. Dispositivo
Acordam os Juízes do Tribunal da Relação do Porto em condenar o arguido Carlos Alberto Ribeiro na pena de 7 (sete) anos e 8 (oito) meses de prisão efetiva.
Condenar ainda no pagamento à ofendida da indemnização cível de 25.000,00 €.

Porto, 18 de Outubro de 2023.
Os Juízes Desembargadores.`
  },
  {
    nome: 'Sentenca_Crime_Furto_Proc_89_22_1PBBRG.txt',
    descricao: 'Processo de Furto Qualificado em armazém comercial (Não elegível: a app deve ignorá-la automaticamente).',
    tipoEsperado: 'Nao_Elegivel',
    conteudo: `TRIBUNAL JUDICIAL DA COMARCA DE BRAGA
Juízo Local Criminal de Braga - Juiz 1
Processo n.º 89/22.1PBBRG

Sentença
O Ministério Público deduziu acusação contra o arguido João Pedro Silva, de 34 anos, pela prática de um crime de furto qualificado, p. e p. pelos artigos 203.º e 204.º do Código Penal, praticado num armazém comercial.
Ofendida: Sociedade Comercial Distribuição SA.
O arguido subtraiu material elétrico no valor de 1.200 euros.
Pelo exposto, condena-se o arguido na pena de 120 dias de multa à taxa diária de 6 euros.

Braga, 12 de Junho de 2023.
O Juiz de Direito.`
  }
];
