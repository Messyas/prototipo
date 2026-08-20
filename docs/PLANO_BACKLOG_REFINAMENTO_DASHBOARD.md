# Plano de refinamento — Hanaro Material Scrap / IF Cost

Status: planejamento de escopo, sem implementação  
Data de consolidação: 15/08/2026  
Fontes consideradas: protótipo navegável atual, dashboard da planilha `Controle de Scrap - IF Cost Rev01.xlsm`, notas da reunião de 14/08, esclarecimentos de 15/08 e apresentação `Rev04_Capability_IF Cost 1.pptx`.

## 1. Objetivo da próxima revisão

Evoluir o protótipo atual para que o Dashboard represente toda a leitura analítica disponível na planilha, sem transportar números ou listas fixas. O novo desenho deve:

- preservar a intenção dos 10 gráficos do dashboard da planilha;
- permitir alternar toda a análise entre **IF Cost em US$** e **quantidade em unidades**;
- ocultar os valores monetários exatos quando necessário;
- oferecer filtros coerentes e compartilhados por todos os indicadores;
- administrar targets mensais, atualização dos dados, perfis e notificações;
- acrescentar heatmap, ranking de linhas e histórico no Modo TV;
- preparar o fluxo de justificativas e planos de ação para gerar um relatório PPTX no padrão da apresentação Rev04;
- manter rastreabilidade das alterações e ações humanas.

O foco desta fase é definir o comportamento do **protótipo navegável**. Integração real com GERP, autenticação, envio real de e-mail, persistência definitiva e geração binária do PPTX pertencem à etapa de produto/engenharia posterior. O protótipo deve representar esses fluxos, estados e permissões de forma navegável, sem alegar que executou operações de backend.

### Decisões de negócio confirmadas em 15/08

- o GERP recebe atualização aproximadamente a cada cinco minutos;
- a rotina completa do Hanaro, que processa scrap e atualiza as tabelas do sistema, roda **a cada duas horas**;
- existe disparo manual da atualização; no protótipo ele será apenas simulado e registrado como execução;
- a medida oficial de quantidade é `QTY SCRAP`;
- os valores de scrap vindos com sinal negativo são normalizados para apresentação positiva, preservando a necessidade de homologar o caso inverso/estorno;
- os 12 targets mensais são planejados no início de cada ano;
- o sistema deve guardar anos anteriores e suportar comparações mensais, anuais e acumuladas durante um ano ainda incompleto;
- o heatmap é um mapa visual da linha, com regiões de risco por setor/posto, e não apenas uma matriz convencional;
- o usuário comum, sem login, acessa apenas um Dashboard simplificado e o Modo TV em unidades, sem exportação;
- o cadastro de destinatários de e-mail é um CRUD em Configurações;
- o ranking do Modo TV terá visões anual e mensal, com comparação anterior × atual;
- o relatório final desejado é um PPTX semelhante à apresentação Rev04, formado a partir das análises, justificativas, evidências e planos de ação.

## 2. O que existe hoje no protótipo

O protótipo atual já oferece:

- Dashboard com filtros por período, visão, componente, Part Number e linha de scrap;
- KPIs de IF Cost, comparação com 2025, redução, gap para meta e quantidade;
- evolução temporal, Top ofensores, ranking de Part Numbers e IF Cost por linha;
- navegação do gráfico/ocorrência para a Base de Scrap;
- seleção de vários scraps e aplicação da mesma justificativa;
- relatórios, registro de versões e simulação de envio por e-mail;
- Modo TV, auditoria, tela de execuções e configurações;
- cadastros ilustrativos de usuários e notificações.

Esses recursos são uma boa base, mas alguns ainda são demonstrativos ou usam taxonomias diferentes das encontradas na planilha.

## 3. Inventário do dashboard da planilha

Foram identificados 10 gráficos na aba visível `Dashboard`:

| Origem | Leitura atual | Tratamento no protótipo revisado |
|---|---|---|
| Gráfico 7 | Divisão/produto, valor e quantidade | Distribuição por produto/divisão, obedecendo ao modo US$/unidades |
| Gráfico 8 | Scrap mensal, quantidade, valor e target | Evolução mensal com realizado e target; quantidade no mesmo módulo quando o modo for alterado |
| Gráfico 9 | Scrap semanal, valor e quantidade | Evolução semanal no modo selecionado |
| Gráfico 10 | Top 5 ofensores em percentual | Pareto dinâmico de componentes, com participação e curva acumulada |
| Gráfico 11 | Top 10 itens por US$ | Ranking de componentes/itens no modo US$ |
| Gráfico 12 | Piores linhas por US$ | Ranking de linhas no modo US$ |
| Gráfico 13 | Piores modelos por US$ | Ranking de modelos no modo US$ |
| Gráfico 14 | Top 10 itens por quantidade | Mesmo módulo do gráfico 11 no modo unidades |
| Gráfico 15 | Piores linhas por quantidade | Mesmo módulo do gráfico 12 no modo unidades |
| Gráfico 16 | Piores modelos por quantidade | Mesmo módulo do gráfico 13 no modo unidades |

Recomendação: não reproduzir três pares de gráficos duplicados. Os 10 gráficos serão transpostos para **sete módulos analíticos**, e os três pares US$/quantidade serão consolidados pelo seletor global de métrica. Isso preserva a informação e atende diretamente ao pedido de troca entre valor e quantidade.

Os slicers/filtros encontrados na planilha são Produto, Mês, Semana, Linha/Receipt Department, Item Scrap e período `YY.MM`. No cabeçalho também existem os totais Dollar Amount, Real Amount e Qty Total.

### Estrutura de referência do relatório Rev04

A apresentação possui 27 slides, quatro gráficos vinculados e uma grande quantidade de fotos, diagramas e evidências. Ela não é apenas uma exportação do Dashboard: combina conteúdo calculado automaticamente com narrativa e curadoria humana.

| Bloco do PPTX | Slides de referência | Origem proposta no Hanaro |
|---|---:|---|
| Capa, índice e objetivo | 1 | Metadados do relatório, ano, equipe e target anual |
| Task Charter | 2 | Configurações do ciclo anual, baseline, meta, período e responsáveis |
| Resultado histórico e composição do IF Cost | 3, 9, 10 e 27 | Targets, resultados mensais, YoY, YTD, produtos/componentes e gráficos do Dashboard |
| Mapeamento de causas e riscos | 4, 6 e 7 | Heatmap/mapa da linha, postos, risco, causa raiz, responsável e classificação 4M |
| Fluxo de execução | 5 | Estrutura padrão do processo e status do ciclo de melhoria |
| Lista de melhorias e plano de ação | 8 | Ações derivadas das justificativas, com área, categoria, local, item, problema e cronograma |
| Padronização do registro | 11 | Campos obrigatórios, qualidade da justificativa e exemplos selecionados |
| Estudos de caso / melhorias | 12 a 26 | Um ou mais slides repetíveis por ação, com problema, 5 Porquês, causa raiz, antes/depois, evidências, custo/quantidade e resultado |
| Resumo executivo mensal | 27 | Target × realizado, acumulado, variação, principais problemas e melhorias do período |

Consequência de escopo: a geração deve ser **híbrida**. O sistema calcula indicadores e preenche estruturas; o Analista seleciona casos, revisa textos e anexa evidências; o Administrador pode revisar/aprovar antes de gerar e enviar uma versão do PPTX.

## 4. Proposta de organização do Dashboard

1. Cabeçalho: data/hora da última atualização, próxima atualização e estado da carga.
2. Barra de contexto: filtros globais, seletor `US$ | Unidades` e botão de ocultar valores.
3. Resumo: total do período, target, atingimento, variação versus referência, `QTY SCRAP` e quantidade de ocorrências.
4. Tendência: evolução mensal com target, evolução semanal e seletor de comparação `mês anterior | mesmo mês do ano anterior | acumulado YTD`.
5. Composição: produto/divisão e Pareto dinâmico de componentes.
6. Rankings: componentes, linhas e modelos.
7. Heatmap: mapa visual por linha, setor e posto para o mês selecionado, com zonas de baixo/moderado/crítico, pontos numerados e tabela de causas/responsáveis.
8. Investigação: ocorrências prioritárias e acesso à Base de Scrap com o mesmo contexto de filtros.

Todos os títulos devem refletir o filtro ativo. Textos fixos como `— Nov` não podem permanecer quando outro mês for selecionado.

## 5. Backlog priorizado

Legenda: P0 = indispensável para a próxima validação; P1 = necessário para fechar o fluxo; P2 = refinamento após validação. Tamanho é relativo e não representa prazo.

### Épico A — Contrato de dados e taxonomia

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| DATA-01 | P0 | M | Consolidar o dicionário de métricas e dimensões | Documentar IF Cost, `QTY SCRAP`, Material Amount, Scrap Rate, produto/área, divisão, setor, linha, posto, modelo, componente e código; nenhuma visualização usa uma fórmula diferente para a mesma métrica |
| DATA-02 | P0 | M | Aplicar a taxonomia normalizada de produtos/áreas, componentes e linhas | Disponibilizar AV, BM, Monitor/MNT, TV, VS, SMT e Injeção/IPI; unificar diferenças de caixa/grafia; categorias vazias deixam de aparecer no Pareto |
| DATA-03 | P0 | M | Aplicar a regra completa de composição do IF Cost | O consolidado inclui todas as categorias normalizadas, inclusive FA/MFG, SMT e Injeção/IPI; exclusões feitas pelo analista são apenas filtros temporários de visualização e não removem dados da base ou do total gerencial |
| DATA-04 | P0 | S | Usar dados atualizados, não séries congeladas | Gráficos, KPIs, títulos e rankings são derivados da mesma coleção filtrada; Top N muda quando dados ou filtros mudam |
| DATA-05 | P1 | S | Definir comparação anual | Adotar o texto `vs. ano anterior (YoY)` ou `2026 × 2025`, com tooltip; remover o acrônimo isolado `PY` da interface |
| DATA-06 | P0 | M | Implementar a normalização assinada da planilha | Regra de referência: `QTY SCRAP = -Issue Quantity`; `IF Cost USD = -(Issue Amount ÷ taxa de câmbio)`, sendo o custo local derivado da quantidade pelo `Issue Price`; fórmulas, arredondamento e linhagem ficam documentados |
| DATA-07 | P0 | M | Tratar ajustes e estornos sem inflar o total | Não aplicar `ABS` indiscriminadamente; uma movimentação positiva na origem gera valor normalizado negativo e fica identificada como possível ajuste/estorno até a regra ser homologada |
| DATA-08 | P0 | S | Separar atingimento, YoY e MoM | `Atingimento da meta`, `variação vs. mesmo mês do ano anterior`, `variação vs. mês anterior` e `variação acumulada YTD` têm fórmulas e rótulos distintos |
| DATA-09 | P0 | S | Tratar ano corrente incompleto | Meses futuros mantêm target e resultado vazio; mês aberto é identificado como parcial; somente meses fechados entram em comparações que exigem fechamento |
| DATA-10 | P0 | L | Integrar produção e Material Amount | Obter, por período/produto/linha, volume produzido e custo material padrão/total; validar mesma granularidade, moeda e janela do IF Cost |
| DATA-11 | P0 | M | Calcular indicadores relativos sem misturar conceitos | `IF Cost relativo = IF Cost líquido ÷ Material Amount × 100`; `Scrap Rate quantitativo = QTY SCRAP líquido ÷ produção × 100`; numerador e denominador ficam rastreáveis |
| DATA-12 | P0 | M | Administrar aliases dos códigos de produto | Concluído no protótipo: Administrador cria e edita o vínculo entre código recebido e produto normalizado; código original, status, autor e data são preservados; alteração vale para novas cargas e reprocessamentos sem reescrever o histórico |

### Épico B — Filtros e contexto global

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| DASH-01 | P0 | M | Reconstruir a barra de filtros globais | Filtros mínimos: ano/período, mês, semana, produto/área normalizada, linha/setor e componente; o estado inicial inclui todas as categorias; limpar filtros restaura essa visão completa; todos os módulos respondem à mesma seleção |
| DASH-02 | P0 | S | Exibir resumo dos filtros ativos | O usuário identifica sem ambiguidade mês, produtos e escopo aplicados; títulos e estado vazio usam o mesmo contexto |
| DASH-03 | P1 | M | Permitir seleção múltipla onde houver ganho analítico | Produto, linha e componente aceitam múltiplos valores; mês começa como seleção única até a regra de target ser confirmada |
| DASH-04 | P0 | S | Preservar filtros no drill-down | Ao abrir a Base de Scrap, os registros correspondem ao ponto, barra ou célula do heatmap escolhido e aos filtros globais ativos |
| DASH-05 | P0 | M | Oferecer comparações temporais explícitas | Usuário escolhe mês anterior, mesmo mês do ano anterior, ano anterior acumulado ou sem comparação; período base e período comparado aparecem no título e tooltip |
| DASH-06 | P1 | M | Criar `Visão geral` e `Meu recorte` | A visão geral inclui todas as áreas/produtos; usuários autenticados podem salvar um recorte pessoal sem alterar o consolidado gerencial |
| DASH-07 | P0 | M | Alternar impacto absoluto e eficiência relativa | A interface mantém as duas leituras identificadas; IF Cost absoluto responde impacto financeiro e taxa relativa responde perda proporcional ao valor material produzido |

### Épico C — Modo US$ / unidades e privacidade

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| METRIC-01 | P0 | M | Criar seletor global `US$ | Unidades` | A troca atualiza KPIs, gráficos, rankings, unidades, legendas e tooltips sem perder filtros; não coexistem gráficos duplicados apenas pela unidade |
| METRIC-02 | P0 | M | Criar botão de olho para ocultar US$ | No modo US$, o botão mascara valores exatos em cards, eixos, rótulos, tooltips, tabelas e Modo TV; a forma relativa dos gráficos permanece visível; em unidades o botão fica oculto ou desabilitado |
| METRIC-03 | P0 | S | Definir comportamento do target no modo unidades | Concluído no protótipo: `Target QTY` é uma meta mensal própria, configurável e versionada; nunca é convertido do target monetário. A série inicial é ilustrativa até homologação do planejamento quantitativo |
| METRIC-04 | P1 | S | Separar privacidade visual de permissão | O olho é um recurso de apresentação, não um controle de segurança; permissão para ver/exportar US$ é definida pelo perfil do usuário |

### Épico D — Transposição dos gráficos da planilha

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| CHART-01 | P0 | M | Evolução mensal de scrap | Exibe realizado e target dos 12 meses; meses fechados, parcial e futuros são distinguíveis; alterna para `QTY SCRAP` sem misturar escalas incompatíveis |
| CHART-02 | P0 | M | Evolução semanal de scrap | Exibe as semanas do mês/período escolhido, inclusive semanas sem ocorrência; alterna US$/unidades |
| CHART-03 | P0 | S | Distribuição por produto/divisão | Reproduz a intenção do gráfico `DIVISION`, ordena de forma consistente e aceita todos os produtos homologados |
| CHART-04 | P0 | L | Pareto dinâmico de componentes | Barras ordenadas do maior para o menor, curva acumulada e referência de 80%; usa nome/descrição do componente como rótulo e mostra o código no detalhe/tooltip; nunca usa lista fixa |
| CHART-05 | P0 | M | Ranking Top 10 de componentes | Alterna US$/unidades e oferece acesso à lista completa de códigos e registros relacionados |
| CHART-06 | P0 | M | Ranking de linhas | Alterna US$/`QTY SCRAP`, mostra posição, variação mensal ou anual conforme o contexto e abre os scraps da linha |
| CHART-07 | P0 | M | Ranking de modelos | Alterna US$/unidades e usa o identificador do modelo homologado, sem misturá-lo ao Part Number de componente |
| CHART-08 | P0 | XL | Mapa de risco/heatmap mensal sobre o layout das linhas | Reproduz a lógica visual da Rev04: planta da linha, setores/postos, zonas amarelo/laranja/vermelho e marcadores numerados; filtros escolhem mês e linha; clicar em uma zona abre ocorrências relacionadas |
| CHART-09 | P0 | M | Tabela e conclusão vinculadas ao mapa | Marcador, posto, causa raiz, responsável, métrica e risco usam o mesmo identificador; conclusão informa linha/setor/posto mais afetado e muda com os filtros sem inventar causalidade |
| CHART-11 | P0 | M | Comparativo contextual do período | Exibe, conforme escolha, mês atual × anterior, mesmo mês entre anos ou YTD atual × YTD anterior, sempre usando somente intervalos equivalentes |
| CHART-12 | P1 | L | Configurar layouts e postos das linhas | Cada linha possui imagem/SVG versionado, setores, postos, coordenadas e responsáveis; mudança de layout não altera retroativamente mapas de períodos já fechados |
| CHART-13 | P0 | M | Ranking relativo de linhas/produtos | Ordena por IF Cost relativo, mostra IF Cost e Material Amount no tooltip e marca escopos sem denominador como não calculáveis |
| CHART-14 | P1 | L | Cruzar escala e eficiência | Dispersão: X = Material Amount, Y = IF Cost relativo, bolha = IF Cost absoluto e cor = faixa configurada; evita penalizar automaticamente linhas de maior valor agregado |
| CHART-10 | P1 | M | Área de ocorrências prioritárias | Mantém a tabela do protótipo, mas usa a métrica/filtros ativos e permite abrir ou revisar o registro |

### Épico E — Target mensal

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| TARGET-01 | P0 | L | Configurar os 12 targets no início do ano | Administrador informa ano, escopo e valor de cada mês; a tela valida lacunas, duplicidades, moeda e valores inválidos antes de publicar |
| TARGET-02 | P0 | M | Versionar e auditar alterações | Alteração posterior exige justificativa; mantém valor anterior, novo valor, autor e data/hora; gráficos usam a versão vigente |
| TARGET-03 | P0 | S | Aplicar governança de edição | Administrador configura e publica; Analista consulta e usa nas comparações; Usuário comum vê somente resultados em unidades; Developer não altera regra de negócio |
| TARGET-04 | P1 | M | Oferecer visão Total e por área | Estrutura contempla o Total gerencial e os recortes normalizados, incluindo FA/MFG, SMT e Injeção/IPI; nenhum recorte operacional fica excluído do consolidado |
| TARGET-05 | P0 | L | Administrar ciclos anuais e histórico | Configurações exibem anos anteriores, ano corrente e próximo planejamento; cada ano guarda 12 targets, baseline, redução planejada, status e versão |
| TARGET-06 | P0 | M | Preparar a transição de ano | Administrador pode criar o novo ciclo copiando o ano anterior como referência, editar mês a mês e publicar; resultados futuros permanecem vazios até existirem dados |
| TARGET-07 | P0 | M | Comparar períodos equivalentes | Dashboard oferece mesmo mês entre anos, mês anterior do ano corrente e acumulado YTD contra o mesmo intervalo anterior, sem comparar 12 meses completos com um ano parcial |

### Épico F — Catálogo de componentes

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| COMP-01 | P0 | M | Criar lista pesquisável de componentes | Lista apresenta código, descrição normalizada, tipo, produto/divisão e status; permite busca por código ou nome e paginação |
| COMP-02 | P1 | M | Tratar aliases e qualidade cadastral | Variações equivalentes são agrupadas sem perder o valor original; conflitos ficam sinalizados para revisão administrativa |

### Épico G — Revisão e justificativa em lote

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| REVIEW-01 | P0 | S | Consolidar a justificativa para vários registros | Usuário seleciona N scraps, visualiza quantos serão alterados, aplica justificativa, categoria, causa e ação em lote e recebe confirmação; evidências permanecem individuais |
| REVIEW-02 | P0 | S | Auditar individualmente a operação em lote | Cada scrap mantém evento rastreável, responsável e instante da alteração; falha parcial informa quais registros não foram atualizados |
| REVIEW-03 | P0 | L | Estruturar a justificativa para alimentar o PPTX | Registro contempla título do problema, sintoma, linha/setor/posto, modelo, classificação 4M, 5 Porquês, causa raiz, ação imediata/corretiva/preventiva, responsável, prazo, status, custo, `QTY SCRAP` e resultado esperado |
| REVIEW-04 | P1 | M | Registrar antes/depois e efetividade | Concluído no protótipo: plano registra baseline e resultado atual em `QTY SCRAP` e IF Cost, redução calculada, resultado qualitativo, implementação, status e evidências simuladas |
| REVIEW-05 | P1 | M | Transformar justificativas em plano de ação | Concluído no protótipo: causa, 5 Porquês, contenção, ações, responsável, prazo e evidências são herdados da revisão; plano mantém scraps, snapshot, produto, linha, posto, componente e origem rastreáveis |
| REVIEW-07 | P0 | M | Criar plano mestre de ações e melhorias | Concluído no protótipo: criação permite selecionar um scrap revisado ou bruto como registro-modelo e herda contexto, impacto, snapshot e análise; visão detalhada compara antes × atual, permite editar, anexar evidência, avançar status e selecionar para o relatório mensal |
| REVIEW-06 | P0 | S | Separar montagem do lote e revisão individual | Concluído no protótipo: configuração geral permite adicionar/remover registros e escolher a referência; formulário permanece dedicado ao registro de referência e cards ocupam toda a largura da lateral |

O comportamento básico já existe no protótipo. O trabalho é refiná-lo, validar permissões e tornar o resultado da ação mais explícito.

### Épico H — Perfis, usuários e sensibilidade

Foram confirmados quatro perfis para a primeira estrutura: **Developer**, **Usuário comum**, **Analista** e **Administrador**.

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| ACCESS-01 | P0 | L | Implementar quatro perfis separados desde o início | Navegação, botões, dados e rotas respeitam Developer, Usuário comum, Analista e Administrador |
| ACCESS-02 | P0 | L | Criar acesso público simplificado para a linha | Usuário comum não faz login, vê somente Dashboard e Modo TV em `QTY SCRAP`, não recebe US$ na resposta de dados e não acessa exportação, relatórios, Base de Scrap ou configurações |
| ACCESS-03 | P0 | M | Bloquear exportação para perfil somente visualização | Botões, atalhos e rotas de exportação ficam indisponíveis; tentativa direta é recusada e não gera arquivo |
| ACCESS-04 | P0 | M | Reservar gestão de identidades ao Developer | Somente Developer cadastra pessoas, ativa/desativa contas, atribui autoridade e consulta logs técnicos amplos; toda alteração é auditada |
| ACCESS-05 | P0 | M | Separar Developer e Administrador | Developer governa identidades/autoridades e logs técnicos; Administrador governa configurações de negócio, targets, destinatários e envios |
| ACCESS-06 | P0 | S | Vincular análises ao Analista autenticado | Justificativas, curadoria do relatório e planos de ação registram o Analista responsável, data/hora e alterações posteriores |

Matriz inicial para o protótipo:

| Capacidade | Developer | Usuário comum | Analista | Administrador |
|---|---:|---:|---:|---:|
| Dashboard simplificado e Modo TV em unidades | Sim | Sim | Sim | Sim |
| Dashboard completo e valores em US$ | Suporte controlado | Não | Sim | Sim |
| Exportar dados/PPTX | Não por padrão | Não | Sim | Sim |
| Investigar Base de Scrap | Suporte controlado | Não | Sim | Sim |
| Justificar scraps e gerir ações | Não por padrão | Não | Sim | Sim |
| Configurar targets, aliases e rotina | Não | Não | Consulta | Sim |
| CRUD de e-mails | Não | Não | Consulta | Sim |
| Enviar relatório por e-mail | Não | Não | Gerar/revisar | Sim |
| Cadastrar pessoas e alterar autoridade | Sim, exclusivo | Não | Não | Não |
| Logs técnicos e execuções | Completo | Não | Operacional | Operacional |
| Auditoria de negócio | Consulta de suporte | Não | Escopo de análise | Completa |

### Épico I — Atualização e integração

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| UPDATE-01 | P0 | M | Agendar e editar a rotina completa | Concluído no protótipo: Administrador edita estado, frequência, horário-base, fuso, concorrência, reprocessamento e publicação de snapshot; Configurações e Execuções refletem a mesma agenda e cada alteração gera auditoria |
| UPDATE-02 | P0 | M | Diferenciar atualização do GERP e processamento Hanaro | A fonte GERP pode mudar aproximadamente a cada cinco minutos, mas o Dashboard é republicado após a rotina Hanaro de duas horas; a interface mostra a idade do último dado efetivamente processado |
| UPDATE-03 | P1 | M | Representar sucesso, em andamento, atraso, parcial e falha | Usuário reconhece qualidade/frescor do dado; nova tentativa não apaga o histórico; relatórios usam o último snapshot concluído |
| UPDATE-04 | P0 | M | Oferecer disparo manual | Usuário autorizado confirma a ação; execução manual não duplica uma rotina já em andamento; no protótipo, apenas simula estados, timestamps, contagens e auditoria |
| UPDATE-05 | P1 | S | Informar o snapshot usado | Dashboard e relatório exibem data/hora, Execution ID e se a atualização foi agendada ou manual |

### Épico J — Relatórios, e-mail e consentimento

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| MAIL-01 | P1 | M | Criar CRUD de destinatários em Configurações | Administrador cria, consulta, edita, ativa/inativa e pesquisa nome, e-mail, grupo, escopo, categorias de comunicação e consentimento; remoção preserva histórico de envios |
| MAIL-02 | P1 | M | Permitir envio sob demanda pelo Administrador | Administrador escolhe relatório e usuários cadastrados elegíveis, revisa destinatários e confirma o envio |
| MAIL-03 | P1 | S | Manter histórico de entrega | Registrar solicitado, enviado, falha, tentativa e reenvio por destinatário, sem alterar a versão do relatório |
| MAIL-04 | P1 | S | Restringir o envio à versão aprovada | O e-mail referencia uma versão imutável do relatório; destinatários inativos ou sem consentimento aplicável ficam sinalizados antes da confirmação |

### Épico K — Auditoria

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| AUDIT-01 | P0 | M | Ampliar a auditoria existente | Registrar targets, agenda, usuários/perfis, preferências de e-mail, justificativas em lote, geração/envio de relatório e mudanças administrativas |
| AUDIT-02 | P1 | S | Facilitar investigação | Filtros por ator, ação, entidade, período e identificador; antes/depois legíveis; exportação sujeita a perfil |

### Épico L — Modo TV

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| TV-01 | P1 | L | Gamificar ranking de linhas | Exibir posição, subida/queda, destaque da melhor evolução e liderança do período sem incentivar ocultação de problemas ou competição individual |
| TV-02 | P1 | M | Alternar ranking anual e mensal | Rotação inclui acumulado anual e mês atual × mês anterior; título, janela comparada e direção de melhora ficam explícitos; ausência de histórico é tratada |
| TV-03 | P1 | M | Incluir Scrap Rate e Material Amount | Só implementar após fórmula, denominador e fonte serem homologados; unidades e período ficam sempre visíveis |
| TV-04 | P0 | S | Respeitar ocultação e permissão de US$ | Modo TV público usa somente `QTY SCRAP`; uma sessão autenticada nunca revela valor que o perfil ou o estado de privacidade não permite |
| TV-05 | P1 | M | Mostrar eficiência proporcional | Público pode ver Scrap Rate quantitativo; IF Cost relativo financeiro exige sessão autorizada e nunca expõe numerador/denominador monetário ao usuário comum |

### Épico M — Relatório mensal em PPTX

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| REPORT-01 | P0 | L | Criar construtor do relatório mensal | Usuário escolhe ano/mês, snapshot de dados, áreas, seções, justificativas e ações; sistema mostra pendências antes de permitir aprovação |
| REPORT-02 | P0 | XL | Mapear dados para o template Rev04 | Capa, charter, targets/resultados, comparativos, Pareto, mapa de risco, 4M, plano de ação, casos e resumo executivo possuem campos de origem definidos e rastreáveis |
| REPORT-03 | P0 | L | Permitir curadoria humana | Analista seleciona principais problemas e melhorias, revisa narrativa, ordena casos e escolhe evidências sem editar manualmente os valores calculados |
| REPORT-04 | P1 | XL | Gerar PPTX versionado | Em produção, gera arquivo `.pptx` editável mantendo identidade visual, layout, gráficos e imagens; no protótipo, demonstra configuração, preview e estado de geração simulada |
| REPORT-05 | P0 | M | Criar resumo executivo mensal | Reproduz a intenção do slide 27: target × realizado, YTD equivalente, variação YoY, principais causas e melhorias, sem confundir atingimento da meta com redução anual |
| REPORT-06 | P1 | L | Criar slides repetíveis de estudo de caso | Parcial no protótipo: a curadoria e o preview já recebem ações ordenadas, causa, antes/depois, resultado e evidências; a geração real do slide editável permanece para a implementação PPTX |
| REPORT-07 | P0 | M | Versionar, aprovar e auditar | Versão registra autor, aprovador, snapshot, filtros, data/hora e seções; aprovada fica imutável e é a única elegível para envio |
| REPORT-08 | P0 | S | Aplicar confidencialidade e permissão | Usuário comum não acessa nem exporta o PPTX; relatório com US$ exige perfil autorizado e mantém marcação de uso interno |
| REPORT-09 | P1 | M | Incluir análise absoluta × relativa | Relatório mostra impacto absoluto, Material Amount e taxa relativa como perspectivas complementares, sem qualificar uma linha apenas pelo valor bruto |

### Épico N — Validação do protótipo

| ID | Prioridade | Tamanho | História / ação | Critérios de aceite |
|---|---:|---:|---|---|
| VALID-01 | P0 | M | Criar cenários de demonstração coerentes | Dados simulados cobrem produtos, meses fechados/parcial/futuros, anos anteriores, linhas/postos, targets, ajustes negativos, estados vazios e falhas de carga |
| VALID-02 | P0 | M | Roteiro de homologação com stakeholders | Validar gráficos, comparações temporais, US$/`QTY SCRAP`, olho, target anual, mapa de risco, lote, quatro perfis, rotina de duas horas, disparo manual, CRUD de e-mail, auditoria, Modo TV e relatório PPTX |
| VALID-03 | P1 | S | Verificar responsividade e acessibilidade | Operação por teclado, contraste, rótulos de controles, leitura sem depender apenas de cor e comportamento em tela de reunião/TV |
| VALID-04 | P0 | M | Reconciliar com planilha e PPTX | Para um período fechado, totais, targets, ranking e comparativos batem com a fonte homologada dentro da regra de arredondamento; cada seção do PPTX tem amostra aprovada |

## 6. Sequência recomendada de execução

### Etapa 0 — Fechar semântica e dados

Executar DATA-01 a DATA-11, fechar o tratamento de estornos e homologar a fonte de produção/Material Amount. Esta etapa evita desenhar gráficos corretos visualmente com conceitos incorretos.

### Etapa 1 — Estrutura central do Dashboard

Executar DASH-01 a DASH-06, METRIC-01 a METRIC-04 e o cabeçalho/KPIs. Ao final, filtros, comparação, unidade e privacidade já devem controlar uma única fonte de estado.

### Etapa 2 — Transpor os gráficos e o heatmap

Executar CHART-01 a CHART-14 e COMP-01. Validar cada módulo em US$, `QTY SCRAP`, impacto absoluto e eficiência relativa, inclusive anos parciais, estados sem dados, Top N, mapa de risco e drill-down.

### Etapa 3 — Governança e operação

Executar targets e histórico anual, quatro perfis, rotina de duas horas, disparo manual, justificativa/plano de ação, CRUD de e-mail e ampliação da auditoria. No protótipo, integrações externas continuam simuladas, mas com fluxos e estados realistas.

### Etapa 4 — Relatório PPTX e Modo TV

Executar REPORT-01 a REPORT-09 e TV-01 a TV-05. O relatório e o Modo TV devem reutilizar o mesmo contrato de métricas, permissões e snapshots do Dashboard.

### Etapa 5 — Homologação

Executar VALID-01 a VALID-04, reconciliar um período fechado com a planilha e validar uma amostra de relatório contra a estrutura Rev04.

## 7. Decisões que precisam ser fechadas antes da implementação

| Tema | Evidência / conflito | Recomendação inicial |
|---|---|---|
| Produtos/áreas normalizados | **Decisão fechada:** o analista ocultava recortes que não precisava acompanhar, mas a visão consolidada deve incluir AV, BM, Monitor/MNT, TV, VS, SMT e Injeção/IPI | Incluir todas as categorias no consolidado e no filtro; filtros do analista alteram apenas sua visualização, nunca a disponibilidade ou composição da base |
| Nome da dimensão | A origem já normaliza os diferentes recortes, embora SMT também possa representar um processo/departamento | Usar provisoriamente `Produto/área` na interface e preservar o código normalizado da origem; confirmar apenas o nome final do campo, não sua inclusão |
| Quantidade | **Decisão fechada:** a medida oficial é `QTY SCRAP` | Usar `QTY SCRAP` em Dashboard, ranking, Modo TV e relatório; manter `Issue Quantity` apenas na rastreabilidade da origem |
| IF Cost | **Decisão parcialmente fechada:** conversão simples do custo local do material para dólar | Referência da planilha: `IF Cost USD = -(Issue Amount ÷ taxa de câmbio)` e `Issue Amount ≈ Issue Quantity × Issue Price`; homologar apenas arredondamento e nome da taxa |
| Sinal/estorno | A planilha inverte o sinal, não aplica valor absoluto: saída negativa vira scrap positivo e entrada positiva vira ajuste negativo | Preservar a regra assinada; não usar `ABS` até decidir se ajustes/estornos reduzem o total, são excluídos ou aparecem separadamente |
| Real Amount | A planilha mostra R$, mas o pedido de troca menciona US$ e unidades | Manter R$ fora da primeira revisão, salvo confirmação de que é KPI obrigatório |
| Target | **Decisão fechada:** planejamento dos 12 meses no início do ano, com histórico de anos anteriores | Permitir publicação anual, transição de ciclo e alteração excepcional versionada com justificativa |
| Target em unidades | A planilha define apenas target monetário | O protótipo permite cadastrar um `Target QTY` independente mês a mês; a série inicial é ilustrativa e deve ser homologada antes de uso operacional |
| Pareto | Notas pedem nome do item em vez de Part Number | Usar descrição normalizada no eixo e código no tooltip/detalhe |
| Heatmap | **Formato fechado:** mapa visual semelhante ao slide 6 da Rev04, sobre o layout das linhas | Ainda falta mapear cada posto/setor aos registros e obter layouts versionados das linhas; usar `QTY SCRAP` como padrão público |
| Scrap Rate | A base de scrap não fornece claramente o denominador de produção | Identificar fonte de produção/material consumido antes de criar o indicador |
| Custo relativo | O HTML propõe dividir o desperdício pelo valor total produzido; a matemática do exemplo está correta, mas a base real ainda não foi identificada | Usar `IF Cost líquido ÷ Material Amount` com mesmo período/escopo/moeda; manter IF Cost absoluto lado a lado e não chamar o denominador de receita/riqueza |
| Atualização | **Decisão fechada:** GERP muda aproximadamente a cada 5 minutos; rotina Hanaro completa a cada 2 horas; existe disparo manual | Mostrar as duas cadências e simular o disparo no protótipo; a rotina mais recente substitui a nota antiga de duas vezes por dia |
| Sigilo | **Decisão fechada para público:** usuário comum não recebe US$, não exporta e acessa apenas Dashboard simplificado/Modo TV em unidades | Aplicar proteção no dado/rota, não somente esconder elementos visuais |
| Comparações | Precisam existir mês anterior, mesmo mês do ano anterior e YTD equivalente | Separar `Atingimento da meta`, `MoM`, `YoY` e `YTD`; preferir rótulos em português e explicar siglas no tooltip |
| Perfis | **Decisão fechada:** Developer, Usuário comum, Analista e Administrador | Developer governa identidades; Analista investiga/justifica; Administrador governa negócio e envio; Usuário comum vê apenas unidades sem login |
| Geração do PPTX | A Rev04 mistura dados automáticos, narrativa, fotos, diagramas e estudos de caso | Adotar geração híbrida: cálculos bloqueados pelo snapshot e conteúdo narrativo curado antes da aprovação |

## 8. Riscos já identificados na planilha

- A base possui 10.761 registros, 2.052 códigos de item, 193 descrições e 160 variações de `Item Type`; há diferenças de maiúsculas/minúsculas e erros de grafia.
- `Receipt Department` contém, por exemplo, `A05` e `a05`, que seriam linhas diferentes sem normalização.
- O Pareto atual contém categoria `(blank)`; vazios precisam de tratamento explícito.
- Alguns títulos e caches dos gráficos estão associados a um mês específico; no produto, títulos e dados precisam ser recalculados pelo filtro atual.
- Targets da amostra da planilha estão organizados para Total, MFG e SMT; a próxima versão da massa simulada deve representar também os demais recortes normalizados, inclusive Injeção/IPI.
- Séries salvas no arquivo podem estar desatualizadas em relação à base. A planilha serve de referência analítica/visual, não de fonte para copiar valores congelados.
- A coluna normalizada da planilha inverte o sinal. Transformar todos os valores em absolutos apagaria ajustes e poderia superestimar IF Cost e `QTY SCRAP`.
- A reconciliação confirma a intenção: 9.165 linhas têm saída negativa e 1.575 têm movimento positivo. A soma assinada resulta em `QTY SCRAP = 298.352` e `US$ 703.357,66`, exatamente os totais exibidos no dashboard da planilha; com `ABS`, os totais subiriam indevidamente para 476.626 unidades e US$ 1.157.423,34.
- O PPTX possui 27 slides, 135 mídias, quatro gráficos e 14 objetos incorporados; replicá-lo exige template, gestão de imagens, campos estruturados e curadoria, não apenas “exportar o Dashboard”.
- O slide executivo usa termos como `Achievement` e `Vs. PY` de forma que pode misturar atingimento de target com redução YoY; o sistema deve separar essas métricas antes de automatizar o texto.
- O mapa de risco depende de layouts e coordenadas de postos que não estão presentes como dimensão pronta na base de scrap; será necessário cadastro/mapeamento adicional.
- A planilha de scrap não possui o total produzido nem o Material Amount necessário ao custo relativo. Sem essa segunda fonte, qualquer taxa real por linha seria inventada.
- Um ranking somente por IF Cost absoluto favorece linhas baratas; um ranking somente relativo pode esconder grande impacto financeiro. As duas lentes precisam permanecer simultaneamente disponíveis.

## 9. Definição de pronto da próxima versão navegável

A revisão estará pronta para homologação quando:

- as decisões de dados P0 estiverem registradas;
- todas as intenções analíticas dos 10 gráficos estiverem representadas;
- filtros, US$/unidades e ocultação funcionarem em todo o Dashboard e Modo TV;
- Pareto, Top N, títulos e conclusões forem dinâmicos;
- target mensal e histórico anual suportarem ano parcial e comparações MoM/YoY/YTD;
- rotina a cada duas horas, atualização manual simulada e quatro perfis tiverem fluxos navegáveis;
- usuário comum receber somente `QTY SCRAP`, sem exportação ou acesso indireto a US$;
- justificativa em lote, plano de ação, CRUD de e-mail, envio administrativo e auditoria puderem ser demonstrados de ponta a ponta;
- o mapa de risco representar linha, setor, posto, causa e responsável de forma vinculada;
- as visões absoluta e relativa mostrarem respostas complementares e recusarem cálculo quando o denominador de produção estiver ausente;
- o construtor do relatório demonstrar seleção, curadoria, preview, aprovação e geração simulada de uma versão PPTX;
- nenhum gráfico usar lista fixa para simular atualização;
- o roteiro VALID-02 tiver sido aprovado pelos stakeholders.
