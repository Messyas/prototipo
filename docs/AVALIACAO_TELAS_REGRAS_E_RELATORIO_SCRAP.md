# Avaliação das telas, gráficos e regras do sistema de Scrap

Status: proposta para validação de produto e negócio — não homologada  
Data: 19/08/2026  
Escopo: substituição da planilha e do relatório mensal por um sistema com ingestão JSON a cada duas horas, revisão humana, planos de ação e geração de relatório.

## 1. Decisão executiva

O protótipo está seguindo uma direção correta. Não é necessário refazer a solução nem voltar a copiar a planilha literalmente.

O desenho mais adequado é:

1. receber e preservar o dado original enviado pelo sistema de scrap;
2. normalizar e calcular os indicadores no backend;
3. colocar o analista em uma fila de ocorrências que precisam de justificativa;
4. transformar as justificativas relevantes em planos de ação;
5. congelar um snapshot mensal e gerar o relatório no próprio sistema;
6. oferecer duas apresentações em Modo TV: executiva e fábrica.

As páginas `Dashboard`, `Base de Scrap`, `Planos de ação` e `Relatórios` formam o núcleo correto. A subpágina `Revisar e justificar scrap` é a parte mais aderente ao relatório Rev04 e deve ser preservada.

As maiores mudanças necessárias são conceituais:

- o dashboard geral deve iniciar com **todas as áreas**, incluindo BM;
- filtros de área/produto devem ser multisseleção e fazer parte do snapshot do relatório;
- `registro`, `ocorrência`, `QTY SCRAP` e `IF Cost` não podem ser usados como sinônimos;
- o sistema deve separar explicitamente valor **bruto**, **estorno** e **líquido**;
- mês parcial não pode parecer mês fechado;
- o Pareto deve usar o total completo como denominador;
- a análise relativa não deve ser publicada como resultado industrial enquanto os denominadores forem mock;
- o Modo TV da fábrica deve ranquear linhas por ocorrências, mas sem chamar esse número de taxa ou eficiência.

## 2. Evidências usadas

Foram confrontadas quatro fontes:

- planilha `Controle de Scrap - IF Cost Rev01 (1).xlsm`, já inventariada no documento `MAPEAMENTO_AS_IS_REGRAS_NEGOCIO_SCRAP_GERAL.md`;
- [dashboard da planilha](../printsdashboad/dashboad.png);
- [tabelas e targets](../printsdashboad/pivot-table.png), [gráfico target × result](../printsdashboad/target-grafico-da-planilha.png) e [controle target × result](../printsdashboad/target-result-control.png);
- print da aba `Analysis`, enviado em 19/08/2026;
- [relatório Rev04](C:/Users/User/Downloads/Rev04_Capability_IF%20Cost%201.pptx), com os 27 slides inspecionados visualmente;
- `index.html`, `scripts.js` e `api-dashboard.js` do protótipo.

O relatório Rev04 não é somente um dashboard. Ele descreve um processo de gestão:

| Parte do relatório | Evidência | Necessidade no sistema |
|---|---|---|
| Objetivo, meta, período, líder e equipe | slides 1–2 | configuração do ciclo/relatório |
| Target × resultado e composição do IF Cost | slides 3, 9 e 27 | dashboard e snapshot mensal |
| Top itens, causa, risco e mapa de linha | slides 4, 6, 7 e 10 | investigação e classificação |
| Fluxo de execução | slide 5 | workflow do sistema |
| Lista e cronograma de melhorias | slide 8 | planos de ação |
| Padrão de preenchimento do registro | slide 11 | formulário de justificativa |
| Problema, 5 Porquês, antes/depois, ação, resultado e rollout | slides 12–26 | caso de melhoria e evidências |
| Core issues e main improvements | slide 27 | resumo executivo gerado |

## 3. O produto que está sendo construído

O sistema não deve ser apenas “a planilha em HTML”. Ele deve substituir três produtos atualmente misturados:

### 3.1 Monitoramento

Responde:

- quanto foi scrapado;
- em qual período;
- em quais áreas, linhas, postos, modelos, componentes e Part Numbers;
- qual é o desempenho contra target e período anterior;
- quais ofensores concentram o impacto.

Saída principal: `Dashboard` e Modo TV executivo.

### 3.2 Tratativa

Responde:

- quais ocorrências ainda não foram analisadas;
- o que ocorreu;
- qual foi a causa raiz;
- quem é responsável;
- quais ações imediata, corretiva e preventiva foram definidas;
- quais evidências comprovam a análise e a eficácia.

Saída principal: `Ocorrências de Scrap`, revisão e `Planos de ação`.

### 3.3 Prestação de contas

Responde:

- qual recorte foi apresentado;
- quais dados e justificativas compuseram o resultado;
- qual versão foi aprovada;
- quais ações e casos entraram no relatório;
- quem publicou e para quem foi enviado.

Saída principal: `Relatórios`, versões, aprovação e auditoria.

## 4. Arquitetura de informação recomendada

### 4.1 Navegação principal do analista

| Página | Decisão | Papel |
|---|---|---|
| Dashboard | manter e ajustar | leitura executiva e investigação inicial |
| Base de Scrap | manter, renomear para **Ocorrências de Scrap** | fila operacional e histórico transacional |
| Planos de ação | manter e fortalecer | execução, prazo, rollout e eficácia |
| Relatórios | manter | montagem, preview, aprovação, versão e envio |

### 4.2 Operação e suporte

| Página atual | Decisão | Motivo |
|---|---|---|
| Alertas | manter como P1 | útil quando as regras forem homologadas; não é requisito para substituir a planilha no primeiro corte |
| Execuções | manter, dentro do grupo `Operação` | importante para frescor, falhas, reprocessamento e lote de origem |
| Auditoria | manter, dentro do grupo `Administração` | necessária para justificativas, targets e relatórios |
| Configurações | manter | targets, áreas, linhas, mapas, usuários e integrações |
| Componentes | retirar da navegação principal | é cadastro/normalização, não uma atividade diária; mover para `Configurações > Cadastros` |

Com isso, o menu principal fica menor e orientado à tarefa do analista. Componentes, layouts, targets, destinatários e regras ficam em administração.

## 5. Avaliação das telas atuais

### 5.1 Dashboard

Decisão: **manter a estrutura, corrigir a semântica e reduzir repetições**.

O que está correto:

- filtro por ano, período, produto/área, linha, componente e Part Number;
- alternância `US$` × `QTY SCRAP`, evitando dois eixos incompatíveis no mesmo gráfico;
- opção de ocultar valores monetários;
- comparação com período anterior;
- target × realizado mensal;
- rankings de componentes, linhas, modelos e Part Numbers;
- drill-down para a base;
- informação de atualização a cada duas horas;
- marcação de mês fechado, parcial e futuro.

O que precisa mudar:

1. `Produto / área` deve aceitar múltiplos valores.
2. A seleção inicial deve ser `Todas`, incluindo BM.
3. O cabeçalho deve mostrar o escopo efetivo, por exemplo: `4 de 6 áreas · BM incluído`.
4. Deve existir um seletor explícito `Base de cálculo: líquido | bruto` quando a mesma tela misturar gestão financeira e investigação operacional.
5. Os rankings precisam informar se usam IF Cost bruto, IF Cost líquido, QTY bruta, QTY líquida ou ocorrências.
6. O Pareto deve acumular contra o universo inteiro, não somente contra os oito itens exibidos.
7. A semana deve ser calculada a partir das datas do recorte; hoje o protótipo produz rótulos fixos de agosto.
8. A análise relativa deve permanecer identificada como experimental e fora do relatório oficial até os denominadores serem reais.
9. O mapa de risco precisa usar limites homologados e versionados por linha/layout, não faixas derivadas apenas do maior valor do recorte.
10. O dashboard não deve remover textos explicativos por JavaScript; descrições curtas ajudam a evitar interpretação errada.

### 5.2 Ocorrências de Scrap

Decisão: **manter; esta passa a ser a principal tela de trabalho do analista**.

O print da aba `Analysis` confirma que ela é, na prática, uma tabela dinâmica de consulta. Os registros são agrupados por:

- `Item Type`;
- `Transaction Date`;
- `Make Item`;
- `Item`;
- `Qty Scrap`;
- `Amount USD`;
- `REQ Comment`.

Ela não registra causa raiz, responsável, prazo, evidência, status ou eficácia. O analista depende da leitura manual do `REQ Comment` para interpretar o lançamento. Portanto, a nova página `Ocorrências de Scrap` não está criando um processo paralelo: ela é a substituta natural das abas `Raw Data` e `Analysis`, acrescentando a tratativa que hoje fica fora da planilha.

O print também ajuda a fixar a semântica de dois campos: `Make Item` representa o modelo/aparelho produzido, enquanto `Item` representa o código do material ou Part Number scrapado. Esses campos devem permanecer separados no backend e na interface. O `REQ Comment` deve ser preservado como texto original imutável; a justificativa estruturada do analista deve ser gravada em outro objeto, com autor e versão.

Problemas confirmados pelo print:

- comentários livres e pouco padronizados, como `Defeito no processo`, `SCRAP A03` e `Material danificado no processo`;
- informações de localização misturadas ao texto, em vez de campos próprios;
- texto com problema de codificação em palavras como `locação`;
- muitas linhas de subtotal `Total`, que não são ocorrências e podem causar dupla contagem em uma exportação inadequada;
- agrupamentos recolhíveis que dificultam saber qual é a granularidade real;
- ausência de identificador de ocorrência;
- impossibilidade de diferenciar, apenas pela tela, comentário original, correção do analista e classificação homologada.

O que está correto:

- busca e filtros extensos;
- sinal original preservado;
- seleção em lote;
- status de processamento separado do status de revisão;
- acesso direto à justificativa;
- ranking contextual e drill-down;
- ocultação monetária compartilhada com o dashboard.

Ajustes recomendados:

- trocar o KPI `Ocorrências` por `Registros` enquanto não existir `occurrence_id` confiável;
- criar abas ou filtros rápidos: `Novos`, `Em revisão`, `Justificados`, `Com erro de dados` e `Todos`;
- ordenar a fila por impacto, idade e recorrência;
- mostrar a origem imutável e o enriquecimento humano como blocos diferentes;
- ligar estorno ao lançamento original quando possível;
- exibir o lote de ingestão, horário da fonte e horário de recebimento;
- impedir aplicação em lote quando os registros não compartilham a mesma ocorrência ou causa confirmada;
- permitir reabrir uma justificativa somente com motivo auditável.

### 5.3 Revisar e justificar scrap

Decisão: **manter como fluxo central**.

Esta tela já cobre quase todo o conteúdo dos slides 11–26 do relatório:

- problema e categoria;
- risco e recorrência;
- classificação 4M;
- 5 Porquês;
- causa raiz;
- ação imediata, corretiva e preventiva;
- responsável, departamento e prazo;
- resultado esperado e observado;
- evidências;
- inclusão e ordem no relatório.

Ajustes necessários:

- separar `sintoma`, `condição`, `posto`, `causa`, `responsável` e `comentário livre`, conforme o padrão mostrado no slide 11;
- registrar quem validou a causa e em qual data;
- exigir período de baseline e período de validação para declarar redução;
- não preencher automaticamente `100% de redução` apenas porque o valor depois é zero;
- distinguir `ação concluída` de `eficácia validada`;
- permitir rollout por linha com estados individuais: não aplicável, planejado, em andamento, concluído, validado e atrasado;
- guardar fotos como `antes`, `depois`, `causa`, `implementação` ou `comprovação`;
- manter histórico de versões da justificativa.

### 5.4 Planos de ação

Decisão: **manter, mas torná-la a visão operacional do cronograma do slide 8**.

Campos mínimos:

- título;
- ocorrência(s) e causa(s) vinculadas;
- área, linha, setor e posto;
- categoria 4M;
- `where/how`;
- item e issue;
- responsável e departamento;
- data de início e prazo;
- status;
- progresso;
- rollout por linha;
- evidências antes/depois;
- resultado esperado;
- resultado observado;
- baseline e janela de validação;
- eficácia validada por e data;
- inclusão no relatório.

O fluxo recomendado é:

`Planejada → Em andamento → Aguardando eficácia → Validada`

Também devem existir `Bloqueada`, `Cancelada` e `Reaberta`, sempre com justificativa.

### 5.5 Relatórios

Decisão: **manter; a proposta atual está muito próxima do produto necessário**.

A montagem por snapshot, seleção de casos, ações e preview reproduz corretamente a lógica do Rev04. O sistema deve congelar:

- filtros e áreas selecionadas;
- versão das regras de cálculo;
- versão dos targets;
- lote/snapshot dos dados;
- valores calculados;
- justificativas e ações nas versões usadas;
- template e idioma;
- autor, aprovador, data e status.

Se uma justificativa for alterada depois, um relatório já aprovado não deve mudar. Deve ser criada uma nova versão.

Seções padrão recomendadas:

1. capa, objetivo e escopo;
2. charter do ciclo;
3. target × resultado e composição;
4. análise absoluta;
5. análise quantitativa;
6. Pareto e top ofensores;
7. mapa de risco e 4M;
8. cronograma de ações;
9. casos antes/depois;
10. core issues e main improvements.

### 5.6 Componentes

Decisão: **mover para cadastro administrativo**.

A página só justifica destaque próprio se houver uma operação frequente de:

- consolidar aliases;
- corrigir nome normalizado;
- classificar tipo de item;
- relacionar Part Number, componente, produto e divisão.

Para o analista comum, isso deve aparecer como uma ação contextual quando um item estiver `Não mapeado`, e não como módulo principal.

### 5.7 Alertas

Decisão: **P1**.

Antes de ativar alertas reais, cada regra precisa declarar:

- métrica;
- escopo;
- janela;
- limite;
- quantidade mínima de registros;
- severidade;
- destinatários;
- cooldown;
- condição de encerramento.

Sem isso, o sistema tende a gerar ruído. Alertas não substituem a fila de revisão.

### 5.8 Execuções, auditoria e configurações

Decisão: **manter como suporte e administração**.

Essas telas estão conceitualmente adequadas, mas `Executar agora`, reprocessamento, targets, mapas e integrações devem ser protegidos por perfil de acesso.

## 6. Avaliação dos gráficos

| Visual | Decisão | Regra |
|---|---|---|
| Target × realizado mensal | manter | mesmo período, mesma moeda, status fechado/parcial/futuro |
| Barras de valor e quantidade no mesmo eixo | retirar | medidas incompatíveis; usar toggle ou painéis separados |
| Evolução semanal | manter | somente para o mês/período selecionado, com semanas derivadas da data |
| Distribuição por área/produto | manter como barras | melhor comparação e leitura de BM do que donut |
| Top componentes | manter como barras | mostrar valor, participação e quantidade de registros |
| Donut `Top 5 offender` | substituir | um top 5 que não fecha 100% não deve ocupar um círculo completo; usar barras ou incluir `Outros` |
| Ranking de linhas | manter com nomes explícitos | `maior IF Cost`, `maior QTY` ou `mais ocorrências`; nunca somente `pior linha` |
| Ranking de modelos | manter | remover `Grand Total` como categoria |
| Pareto de Part Number | manter e corrigir | acumulado calculado contra todos os itens do recorte |
| Mapa de risco | manter após homologação | layout, posto, limiar e vigência versionados |
| Scatter da análise relativa | adiar | só publicar com denominador industrial real |
| Gráficos duplicados em US$ e QTY | retirar | o toggle já resolve a necessidade |
| Antes × depois dos casos | manter | exigir baseline, janela posterior e status de eficácia |

## 7. Regras de cálculo propostas

### 7.1 Sinal, bruto, estorno e líquido

A planilha observada inverte o sinal recebido. O sistema não deve aplicar `ABS` diretamente e perder estornos.

```text
qty_normalizada_assinada = - issue_quantity
valor_usd_normalizado_assinado = - amount_usd_origem

qty_scrap_bruta = max(qty_normalizada_assinada, 0)
qty_estorno = max(-qty_normalizada_assinada, 0)
qty_scrap_liquida = qty_scrap_bruta - qty_estorno

if_cost_bruto_usd = max(valor_usd_normalizado_assinado, 0)
estorno_usd = max(-valor_usd_normalizado_assinado, 0)
if_cost_liquido_usd = if_cost_bruto_usd - estorno_usd
```

Consequências:

- performance financeira e comparação com target usam líquido;
- investigação de causa pode usar bruto;
- todo gráfico deve declarar a base;
- estorno não deve virar um novo ofensor;
- quando possível, estorno deve referenciar o lançamento original.

### 7.2 Target e atingimento

```text
atingimento_percentual = target_do_mes_ou_periodo / realizado_liquido_do_mes_ou_periodo × 100
```

- acima de 100% é favorável porque menor scrap é melhor;
- abaixo de 100% é desfavorável;
- target e realizado devem cobrir os mesmos meses;
- mês parcial deve ser marcado como parcial;
- se o realizado for zero, exibir `Sem scrap no período` e não infinito;
- target anual não pode ser dividido por realizado parcial e apresentado como atingimento YTD.

### 7.3 Variação contra referência

```text
variacao_percentual = (realizado_atual - referencia) / referencia × 100
reducao_percentual = (referencia - realizado_atual) / referencia × 100
```

Usar apenas um dos dois nomes na interface. Para `variação`, negativo é favorável. Para `redução`, positivo é favorável.

No relatório Rev04, `achievement`, `redução versus ano anterior` e `progresso contra meta` aparecem próximos e podem ser confundidos. O sistema deve tratá-los como indicadores diferentes.

### 7.4 Ocorrências

```text
ocorrencias = count(distinct occurrence_id)
registros = count(source_record_id)
```

Uma ocorrência pode gerar mais de um registro ou Part Number. Enquanto a fonte não enviar `occurrence_id` ou não existir uma regra homologada de agrupamento, a interface deve mostrar `registros`, não `ocorrências`.

### 7.5 Análise quantitativa

O modo `QTY SCRAP` é válido e deve existir em todo o produto. Ele não é automaticamente uma taxa.

Para comparação proporcional entre linhas, será necessário receber produção:

```text
scrap_por_1000 = qty_scrap_bruta / quantidade_produzida × 1.000
```

Se a QTY representar componentes e a produção representar aparelhos acabados, o indicador deve ser chamado `peças scrapadas por 1.000 aparelhos`, não `% de scrap`.

### 7.6 Análise relativa financeira

```text
if_cost_relativo = if_cost_liquido_usd / material_amount_usd × 100
```

Somente é válido quando numerador e denominador compartilham período, produto, linha e demais dimensões necessárias. Filtrar componente apenas no numerador quebra a comparabilidade e deve ser bloqueado ou explicado.

### 7.7 BRL e câmbio

- o USD informado pela fonte deve ser preservado;
- BRL deve usar taxa identificável por data, fonte e versão;
- o fator fixo `6,1` da planilha não deve virar regra do sistema;
- ocultar valores monetários deve esconder cards, eixos, labels, tooltips, tabelas, exportações e Modo TV.

## 8. Escopo geral e filtro de áreas

O dashboard da planilha está selecionando AV, MNT e TV e excluindo BM. Em junho de 2026, BM representa aproximadamente 85,8% do IF Cost líquido da base disponível naquele mês. Portanto, esse recorte não pode ser o padrão do novo sistema.

Regra recomendada:

- padrão do dashboard: todas as áreas autorizadas;
- seletor: multisseleção com busca e `Selecionar todas`;
- chips visíveis para cada área ativa;
- presets opcionais, por exemplo `Scrap geral`, `Relatório MS` e `Minha área`;
- cada preset deve mostrar claramente inclusões e exclusões;
- snapshot de relatório guarda a lista exata de áreas;
- filtros devem funcionar por códigos estáveis, não somente pelo rótulo exibido.

Também é necessário separar os conceitos `Division` e `Product`. BM aparece no material como valor possível em mais de uma dimensão; o modelo de dados não pode fundir essas colunas sem regra de domínio.

## 9. Modo TV

Devem existir dois modos escolhidos ao entrar em tela cheia.

### 9.1 Modo executivo

Objetivo: reunião, gestão e acompanhamento do resultado.

Painéis:

1. resultado acumulado, target, atingimento e comparação;
2. tendência mensal e status do período;
3. top ofensores por componente/Part Number/linha;
4. ações críticas e eficácia;
5. frescor dos dados e escopo.

O modo atual do protótipo já é uma boa base.

### 9.2 Modo fábrica

Objetivo: mostrar onde as ocorrências estão acontecendo agora e incentivar resposta operacional.

Conteúdo recomendado:

- ranking das linhas por `count(distinct occurrence_id)`;
- quantidade de registros como fallback, claramente rotulada;
- QTY SCRAP como indicador secundário;
- período curto selecionável: turno, hoje, últimas 24 horas ou últimos sete dias;
- linha, posição, tendência e diferença para o período anterior;
- última ocorrência e tempo desde a última ocorrência;
- status de tratativa;
- atualização e defasagem da fonte;
- filtro multisseleção de áreas, incluindo BM.

Cuidados:

- `mais ocorrências` não significa automaticamente `pior eficiência`;
- linhas com maior produção tendem a ter mais ocorrências;
- sem produção, não chamar o ranking de taxa, eficiência ou performance;
- não mostrar valores monetários por padrão na fábrica;
- não expor nome de operador ou informação pessoal;
- usar poucas informações, fonte grande e contraste alto.

Uma versão futura pode alternar `Ocorrências` e `Ocorrências por 1.000 aparelhos` quando o denominador de produção estiver disponível.

## 10. Modelo de dados mínimo

### 10.1 Ingestão

`ingestion_batch`

- `batch_id`;
- fonte e versão do schema;
- `source_generated_at`;
- `received_at`;
- quantidade recebida, válida, rejeitada e duplicada;
- hash do payload;
- status e erro.

`scrap_record_raw`

- JSON original imutável;
- `source_record_id`;
- `batch_id`;
- hash da linha;
- timestamps de origem e recebimento.

`scrap_record_normalized`

- dimensões normalizadas;
- sinais e valores bruto, estorno e líquido;
- flags de qualidade;
- vínculos de estorno e ocorrência;
- versão das regras usada.

### 10.2 Revisão humana

`scrap_review`

- status;
- sintoma, condição, posto, causa e comentário;
- categoria e 4M;
- 5 Porquês e causa raiz;
- risco e recorrência;
- responsáveis;
- ações;
- datas de criação, conclusão, validação e reabertura;
- versão e autor.

### 10.3 Gestão

- `action_plan` e `action_rollout`;
- `evidence`;
- `target_version` e `target_month`;
- `line_layout_version` e `station`;
- `report`, `report_snapshot` e `report_item`;
- `audit_log`;
- fatos de produção/material amount para análise relativa.

## 11. Estados e travas

### 11.1 Dado recebido

`Recebido → Validado → Publicado`

Desvios: `Quarentena`, `Duplicado` ou `Falha`.

### 11.2 Revisão

`Pendente → Em revisão → Justificado`

Desvio controlado: `Reaberto` com motivo.

### 11.3 Plano

`Planejada → Em andamento → Aguardando eficácia → Validada`

Desvios: `Bloqueada`, `Cancelada` e `Reaberta`.

### 11.4 Relatório

`Rascunho → Em aprovação → Aprovado → Publicado → Substituído`

O sistema não deve permitir relatório aprovado com:

- erro de ingestão não reconhecido;
- snapshot ausente;
- área selecionada sem aparecer no escopo;
- fórmula/regra sem versão;
- mês parcial apresentado como fechado;
- caso incluído sem causa ou responsável;
- valor de resultado manualmente sobrescrito.

## 12. Prioridades para o protótipo

### P0 — antes de validar com o negócio

1. Incluir BM no escopo padrão.
2. Transformar área/produto em multisseleção.
3. Corrigir `QTY SCRAP = ABS(Issue Quantity)` para a regra de bruto/estorno/líquido.
4. Definir e exibir a base de cada gráfico.
5. Corrigir o Pareto.
6. Trocar `ocorrências` por `registros` onde não houver ID de ocorrência.
7. Separar Modo TV executivo de Modo TV fábrica.
8. Marcar com clareza mês aberto, parcial e fechado.
9. Remover ou desabilitar percentuais relativos mock da demonstração oficial.
10. Mover Componentes para Configurações/Cadastros.

### P1 — para substituir o processo mensal

1. Persistir lote JSON e raw payload imutável.
2. Implementar fila de revisão e versionamento.
3. Implementar plano, rollout e validação de eficácia.
4. Congelar snapshots e versões de relatório.
5. Versionar targets e layouts de linha.
6. Implementar anexos classificados e auditáveis.
7. Ligar estornos aos lançamentos originais.
8. Implementar aprovação e publicação do relatório.

### P2 — evolução

1. Alertas homologados.
2. Análise relativa com produção e Material Amount reais.
3. Ranking normalizado por volume produzido.
4. Mapa industrial interativo completo.
5. Envio automático e integrações adicionais.

## 13. Pontos para homologação com o time

Antes de transformar esta proposta em regra definitiva, o negócio precisa responder:

1. O que identifica uma ocorrência única de scrap?
2. O JSON enviará `occurrence_id` ou apenas lançamentos contábeis?
3. Rankings de causa devem usar bruto ou líquido?
4. Quais contas, aliases, departamentos e movimentos pertencem ao scrap geral?
5. `Division` e `Product` representam quais hierarquias?
6. Quais áreas devem entrar no preset do relatório mensal além de BM?
7. Quando um mês passa de parcial para fechado?
8. Quem pode alterar target e quem aprova?
9. Qual janela comprova eficácia de uma ação?
10. A quantidade produzida e o Material Amount estarão disponíveis no backend?
11. O relatório final precisa ser PPTX, PDF ou ambos?
12. O Modo TV da fábrica deve comparar turno, dia ou sete dias por padrão?

## 14. Prints adicionais opcionais

Os materiais atuais já são suficientes para esta avaliação. Se for necessário confirmar o processo manual em uma segunda rodada, os únicos prints adicionais de alto valor são:

1. exemplo do registro original antes da correção e do mesmo registro depois da correção;
2. exemplo real de estorno e como o analista o trata;
3. tela/fonte em que são mantidos os targets;
4. exemplo de caso que reúne vários lançamentos em uma única ocorrência.

## 15. Limitação da inspeção

Os 27 slides do relatório e os prints enviados, incluindo a aba `Analysis`, foram inspecionados visualmente. A estrutura das nove rotas, subpáginas e quatro painéis do Modo TV foi conferida no código do protótipo. O navegador integrado não disponibilizou uma instância nesta sessão, portanto a navegação visual ao vivo do HTML não foi revalidada nesta rodada.
