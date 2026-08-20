# Mapeamento AS-IS e regras de negócio para o Scrap Geral

Status: levantamento técnico para validação, ainda não homologado  
Data da análise: 19/08/2026  
Planilha analisada: `Controle de Scrap - IF Cost Rev01 (1).xlsm`  
Código analisado: `docs/GERP_Other account/index.py`, `automação.py`, `index.html`, `scripts.js` e `api-dashboard.js`

## 1. Objetivo e conclusão executiva

Este documento separa três coisas que hoje estão misturadas:

1. o que a automação extrai e consolida;
2. o que a planilha realmente transforma, filtra e apresenta;
3. o que o protótipo web já calcula ou ainda simula.

A conclusão principal é que a planilha enviada **não representa o scrap geral**. Ela parte de uma fonte já restrita e ainda aplica recortes adicionais nas tabelas dinâmicas e segmentações.

O impacto mais material aparece em junho de 2026:

| Escopo | IF Cost líquido | QTY Scrap líquida | Participação no total do mês |
|---|---:|---:|---:|
| Base disponível, todos os produtos | US$ 48.723,82 | 76.389 | 100% |
| Dashboard atual: AV + MNT + TV | US$ 6.915,29 | 48.228 | 14,2% do IF Cost / 63,1% da QTY |
| Produto BM omitido | US$ 41.808,53 | 28.161 | 85,8% do IF Cost / 36,9% da QTY |

Portanto, limpar apenas os filtros visuais não basta para chegar ao scrap geral. É necessário ampliar a origem, formalizar quais contas representam scrap e retirar recortes persistidos das pivôs.

## 2. Evidências inspecionadas

A pasta de trabalho foi aberta em modo somente leitura. Todas as 12 abas, inclusive as ocultas, foram renderizadas e conferidas visualmente.

| Objeto | Quantidade |
|---|---:|
| Abas | 12: 6 visíveis e 6 ocultas |
| Fórmulas de célula | 547 |
| Tabelas dinâmicas | 20 |
| Gráficos | 16, sendo 10 no Dashboard |
| Caches de segmentação | 13 |
| Tabelas estruturadas | 2 |
| Consultas Power Query | 2 |
| Registros na tabela `Raw data` | 10.761 |
| Colunas da base | 43 |
| Período dos dados | 03/01/2025 a 30/06/2026 |

O arquivo contém projeto VBA, mas o acesso programático ao código foi bloqueado pela configuração de segurança do Excel. A inspeção binária permitiu identificar três macros de navegação: `Dashboard` (`Ctrl+D`), `RawData` (`Ctrl+R`) e `Macro1`/Analysis (`Ctrl+A`). Não foi encontrada evidência de regra financeira ou transformação implementada em VBA.

## 3. Fluxo atual de dados

### 3.1 Extração no GERP

O arquivo `index.py`, e não `automação.py`, é quem automatiza a interface do GERP com `pyautogui`.

Fluxo observado:

1. solicita data inicial e final;
2. acessa a rotina `Textdown:XXINVM`;
3. seleciona `other`;
4. informa o período;
5. solicita o download;
6. repete a operação para `NW1`, `NW4` e `NWK`.

Limitações relevantes:

- somente três organizações são extraídas;
- a base da planilha contém dez organizações: `NWK`, `NW1`, `NWH`, `NWX`, `NWU`, `NW4`, `NWD`, `NWE`, `NWW` e `NWZ`;
- a automação por imagem não confirma a tela encontrada, o arquivo baixado, a contagem de linhas nem o sucesso do download;
- não há identificação do arquivo de origem ou da linha de origem no resultado;
- não há chave de execução, lote ou `Transaction ID` persistido.

Se o futuro pipeline usar somente `index.py`, ele ficará **mais restrito que a planilha atual**, pois perderá sete organizações presentes na base analisada.

### 3.2 Consolidação dos CSVs

`automação.py` não filtra setor, divisão, produto, conta ou linha. Ele:

1. lista todos os arquivos com extensão minúscula `.csv` em `X:\2. FIELD\4. If cost\New folder`;
2. tenta detectar automaticamente o delimitador;
3. lê primeiro com a codificação padrão e, em caso de qualquer exceção, tenta `latin1`;
4. ignora linhas desalinhadas com `on_bad_lines="skip"`;
5. concatena os DataFrames com união de colunas;
6. grava `consolidado_final.csv` com `;` e `UTF-8-SIG`.

Riscos do consolidador:

- o próprio `consolidado_final.csv` entra na lista na execução seguinte, causando duplicação cumulativa;
- arquivos antigos que permanecerem na pasta também serão incorporados;
- linhas inválidas são descartadas silenciosamente;
- não há validação de esquema, colunas obrigatórias ou tipos;
- não há deduplicação;
- não há coluna `source_file`, `source_row`, `execution_id` ou hash de rastreabilidade;
- `except (UnicodeDecodeError, Exception)` equivale, na prática, a capturar qualquer erro;
- não há reconciliação entre quantidade lida, descartada e gravada.

### 3.3 Desconexão entre a automação e a planilha

A planilha `.xlsm` **não consulta** `consolidado_final.csv`.

As duas consultas Power Query apontam para arquivos absolutos diferentes:

- `S:\Others\02 - FABRICA 01\01 - LQC\07 - IF COST (new)\03 - CONTROLE MENSAL\01 - Base de dados.xlsx`;
- `E:\02 - FABRICA 01\01 - LQC\07 - IF COST\01 - Monitoramento Scrap\01 - Base de dados.xlsx`.

Consequências:

- o fluxo enviado não é, hoje, ponta a ponta;
- a planilha depende de unidades de rede e caminhos pessoais;
- não é possível provar que os CSVs consolidados são os mesmos registros carregados no `.xlsm`;
- a atualização pode funcionar na máquina do analista e falhar em outro ambiente;
- a origem usada pela aplicação web ainda precisa ser escolhida formalmente.

## 4. Mapa de todas as abas da planilha

| Aba | Estado | Área usada | Objetivo observado | Fórmulas / objetos | Filtros ou riscos |
|---|---|---:|---|---|---|
| `Target Result Control MS W` | Oculta | `B1:BY34` | Controle semanal de target, resultado e achievement para total, MFG e SMT | 171 fórmulas; 1 gráfico | Estrutura de 56 posições semanais; muitos períodos sem resultado |
| `Raw data` | Visível | `A1:DV10764` | Base transacional e tela de consulta | tabela `Base_D_DIRECT___COMMON`, 10.761 linhas; 3 fórmulas de total | Fonte já restrita a `FA` e `D-DIRECT`; segmentações contêm itens antigos |
| `Suporte` | Visível | `A1:I129` | Tabela de target/resultado e pivô auxiliar | 36 vínculos com `Target Result Control MS`; 1 pivô | Target sem chave de ano na tabela estruturada |
| `Target Result Control TV` | Oculta | `B3:BY30` | Controle semanal/mensal legado para TV/MFG/SMT | 171 fórmulas | Parece versão legada; não alimenta o dashboard principal observado |
| `Planilha1 (2)` | Oculta | `B2:U26` | Quadro legado de target, resultado e achievement | 2 somas | Mistura snapshots estáticos e fórmulas mínimas |
| `Target Result Control MS` | Visível | `B1:AO50` | Controle mensal e acumulado, com comparação 2024/2025 | 75 fórmulas; 5 gráficos | Agosto aparece parcial, gerando achievement de 2.939%; há valores manuais |
| `Dashboard` | Visível | `A1:DT1069` | Tela executiva da planilha | 10 gráficos; nenhuma fórmula de célula | Depende integralmente de pivôs; recorte atual exclui `BM` |
| `Analysis` | Visível | `A1:DT1788` | Drill-down transacional por item/comentário | 1 pivô, sem fórmulas | `Department = FA`; detalhamento de Item Type, data, modelo, item, QTY, valor e comentário |
| `Pivot Table` | Visível | `A1:AW955` | Motor de agregação do Dashboard | 16 pivôs; 88 fórmulas | 51 erros de fórmula; contém filtros persistidos e resultados intermediários |
| `Ánálise` | Oculta | `A1:B1255` | Agrupamento de comentários por Item Type | 1 pivô | Mantém somente `Division = HE + MNT` e `Department = FA` |
| `Análise 02` | Oculta | `A1:B122` | Agrupamento de causa/categoria a partir de base curada | 1 pivô; 1 `GETPIVOTDATA` | Converte um agregado para real com taxa fixa 6,1 |
| `Planilha2` | Oculta | `A1:AQ175` | Amostra curada com a coluna manual `Categoria` | 175 linhas, sem fórmulas | Não é tabela estruturada; classificação manual não cobre a base completa |

## 5. Escopo real da `Raw data`

### 5.1 Dimensões disponíveis

| Dimensão | Valores presentes | Observação |
|---|---|---|
| `Department` | somente `FA` | A planilha não permite analisar o departamento geral da empresa |
| `Division` | `BM`, `HE`, `MNT` | A aba oculta `Ánálise` mantém apenas `HE` e `MNT` |
| `Product` | `BM`, `AV`, `TV`, `MNT` | O dashboard mantém apenas `AV`, `MNT` e `TV` |
| `Account Alias` | somente `D-DIRECT` | O nome da consulta menciona `D-DIRECT & COMMON`, mas `D-COMMON` não aparece nos dados |
| `Account` | somente `12110301` | Escopo contábil único |
| `To be Counted (Y/N)` | somente `Y` | A consulta não aplica filtro, mas a amostra inteira já chega marcada `Y` |
| `Receipt Department` | 11 valores | `A01`, `A02`, `A03`, `A04`, `A05`, `A08`, `BM1`, `BM2`, `BM3`, `BMCELL`, `C02` |
| `Organization Code` | 10 valores | A extração automatizada cobre somente 3 deles |
| `Item Type` | 118 valores atuais | O cache da segmentação retém 239 itens, evidência de lixo histórico |
| `Subinventory Group` | `RAW-WIP`, `WIP-ASSY`, `RAW-MTL` | `RAW-MTL` possui uma linha neutra |
| `Allocation error` | `0` e `1` | 5 registros com erro, US$ 280,14 e 25 unidades, hoje incluídos nos totais |

Não existe uma coluna chamada `Sector` ou `Posto`. A dimensão que o dashboard chama de linha é, na origem, `Receipt Department`. Essa equivalência precisa de homologação; ela não deve ser tratada automaticamente como setor físico.

### 5.2 Distribuição por produto na base completa

| Produto | Registros | IF Cost líquido | QTY líquida | Participação do IF Cost |
|---|---:|---:|---:|---:|
| BM | 3.590 | US$ 532.780,02 | 121.138 | 75,7% |
| TV | 3.295 | US$ 104.677,94 | 73.986 | 14,9% |
| AV | 2.416 | US$ 12.751,66 | 56.307 | 1,8% |
| MNT | 1.460 | US$ 53.148,03 | 46.921 | 7,6% |
| Total | 10.761 | US$ 703.357,66 | 298.352 | 100% |

Excluir `BM` não é um refinamento pequeno: remove 75,7% do IF Cost disponível no arquivo inteiro.

### 5.3 Qualidade e completude

| Campo / regra | Resultado |
|---|---:|
| Data ausente | 1 linha |
| `Issue Quantity` / `Issue Amount` ausentes | 1 linha |
| `Qty Scrap` ausente | 1 linha, além de 20 células não numéricas/vazias detectadas no intervalo |
| `Item Type` ausente | 60 linhas |
| `REQ Comment` ausente | 1.944 linhas |
| `Reference` ausente | 9.583 linhas |
| `Reason` preenchido | 0 linhas |
| `Coluna1` preenchida | 0 linhas |
| `Allocation error = 1` | 5 linhas |

A planilha não possui identificador transacional estável. Para Base de Scrap, revisão, auditoria e deduplicação, o backend precisará criar um `source_transaction_id` ou um hash determinístico acompanhado de `source_file`, `source_row` e `execution_id`.

## 6. Dicionário dos 43 campos

| Campo | Papel observado | Regra ou pendência |
|---|---|---|
| `YY.MM` | período numérico, por exemplo `2606` | manter como chave derivada da data, não como texto sem século |
| `To be Counted (Y/N)` | elegibilidade | futuro total deve usar somente `Y`; valores diferentes precisam ser auditáveis |
| `Department` | departamento | a amostra só contém `FA` |
| `Product` | família/área de produto | não aplicar exclusão padrão de `BM` |
| `Amount (USD)` | valor em USD com sinal da origem | campo-base usado pela planilha |
| `Tax` | taxa de conversão local por USD | nome ambíguo; renomear semanticamente no modelo canônico |
| `Organization Code` | organização/planta | não confundir com divisão ou produto |
| `Account` | conta contábil | somente `12110301` na amostra |
| `Description` | descrição da conta | dois textos; quase tudo é `Defect - Direct Charged` |
| `Account Alias` | alias contábil | somente `D-DIRECT`; regra de inclusão geral ainda não homologada |
| `Subinventory Group` | grupo de subinventário | dimensão de filtro e auditoria |
| `Subinventory` | subinventário | dimensão operacional |
| `W/H Market` | mercado/armazém | somente zero na amostra; sem valor analítico atual |
| `Receipt Department` | destino/linha de recebimento | usado como `Linha` no dashboard; equivalência pendente |
| `Description_1` | descrição associada ao receipt | significado formal não documentado |
| `Item` | Part Number | chave do componente na análise |
| `UIT` | classificação/código | significado de negócio não documentado |
| `Item Desc` | descrição do item | usada para leitura humana |
| `Item Spec` | especificação | alta cardinalidade; útil no drill-down |
| `Transaction Date` | data da movimentação | origem para ano, mês e semana |
| `Issue Quantity` | quantidade assinada | normalmente negativa para scrap |
| `Issue Price` | preço unitário local | usado apenas como reconciliação, não na fórmula principal da planilha |
| `Issue Amount` | valor local assinado | aproximadamente quantidade × preço |
| `Sales Price` | preço de venda | sempre zero; não usar em IF Cost |
| `Sales Amount` | valor de venda | sempre zero; não usar em IF Cost |
| `Warehouse Keeper` | responsável do armazém | dado operacional |
| `Planner` | planejador | dado operacional |
| `Work Order` | ordem de produção | possível parte da chave natural |
| `Reason` | motivo | completamente vazio |
| `REQ Reason` | motivo da requisição | 9 valores; precisa de normalização |
| `REQ Comment` | comentário livre | fonte das análises manuais; 1.944 ausentes |
| `Coluna1` | coluna sem função | completamente vazia; remover do modelo canônico |
| `Reference` | referência complementar | 89% vazia; não serve como ID |
| `Make Item` | modelo/produto fabricado | usado em ranking de modelos |
| `Created by` | criador da transação | dado de auditoria |
| `Item Type` | tipo/componente normalizado | `LCD` é substituído por `Module` no Power Query |
| `Division` | divisão | valores atuais `BM`, `HE`, `MNT` |
| `Allocation error` | indicador de erro de alocação | definir exclusão ou quarentena; hoje entra no total |
| `Amount USD` | valor normalizado | `Amount (USD) × -1` |
| `Nome do Mês` | mês abreviado | derivado da data, mas sem ano |
| `Semana do Ano` | número da semana | derivação atual depende do padrão local do Power Query |
| `Nome da Semana` | rótulo `W` + número | precisa incluir o ano para não misturar períodos |
| `Qty Scrap` | quantidade normalizada | `Issue Quantity × -1` |

## 7. Transformações Power Query observadas

A consulta principal executa, nesta ordem:

1. abre uma planilha externa chamada `Base_D-DIRECT & COMMON`;
2. tipa 37 colunas iniciais;
3. remove linhas totalmente vazias;
4. remove a primeira linha restante;
5. promove a linha seguinte a cabeçalho;
6. reaplica tipos;
7. cria `Amount USD = Amount (USD) × -1`;
8. cria o nome completo do mês a partir de `Transaction Date`;
9. cria `Semana do Ano = Date.WeekOfYear(Transaction Date)`;
10. cria `Nome da Semana = "W" + Semana do Ano`;
11. reduz o mês aos três primeiros caracteres e aplica capitalização;
12. cria `Qty Scrap = Issue Quantity × -1`;
13. substitui o texto `LCD` por `Module` em `Item Type`;
14. termina com `Table.SelectRows(..., each true)`, que não filtra nada.

Não existe, dentro do M code, filtro de departamento, divisão, produto, receipt department ou período. O estreitamento principal já está no arquivo de origem e nos filtros das pivôs.

Pontos de atenção:

- `Date.WeekOfYear` não informa explicitamente o primeiro dia e a regra da primeira semana;
- mês abreviado e semana sem ano não são chaves seguras;
- `ReplaceText("LCD", "Module")` é textual, sensível ao conteúdo e não usa uma tabela de mapeamento versionada;
- a consulta secundária termina antes de criar `Amount USD` e `Qty Scrap`, sinal de versão antiga;
- os caminhos absolutos impedem portabilidade.

## 8. Filtros que reduzem o universo atual

### 8.1 Filtros persistidos

| Local | Campo | Selecionado | Excluído / efeito |
|---|---|---|---|
| Segmentação principal | `YY.MM` | `2606` | exclui todos os outros 17 períodos nos pivôs conectados |
| Segmentação principal | `Product` | `AV`, `MNT`, `TV` | exclui `BM`; `VS` permanece apenas no cache antigo |
| Maioria das pivôs | `Department` | `FA` | no arquivo atual não muda o total, pois toda a base já é FA |
| Aba oculta `Ánálise` | `Division` | `HE`, `MNT` | exclui `BM` |
| Aba oculta `Ánálise` | `Department` | `FA` | restringe a análise textual |
| Fonte externa | `Account Alias` | efetivamente `D-DIRECT` | impede qualquer visão de outros aliases |
| Fonte externa | `Account` | `12110301` | impede outras contas |

### 8.2 Segmentações sem filtro efetivo atual

- `Receipt Department`: todos os 11 valores disponíveis na tabela atual;
- `Division` na tela Raw data: `BM`, `HE` e `MNT`;
- mês e semana na Raw data: todos os itens atuais;
- `Item Type`: todos os itens atuais.

Os caches principais ainda listam valores que já não existem na tabela atual: 239 tipos de item contra 118 reais, 39 receipt departments contra 11 reais e o produto `VS` sem registros. Esses itens retidos devem ser limpos no novo pipeline; não podem definir o catálogo do dashboard.

### 8.3 Interpretação do “deixa só dois setores”

Há três recortes que podem ter gerado essa percepção:

1. a aba oculta `Ánálise` deixa exatamente duas divisões: `HE` e `MNT`;
2. o nome da fonte menciona dois aliases: `D-DIRECT & COMMON`, embora a carga efetiva só tenha `D-DIRECT`;
3. o dashboard deixa três produtos: `AV`, `MNT` e `TV`, excluindo `BM`.

O campo “setor” não existe na base. Antes de implementar o filtro correspondente no HTML, é necessário confirmar se o termo do negócio significa `Division`, `Product`, `Receipt Department` ou uma dimensão externa ainda não carregada.

## 9. Fórmulas de negócio observadas

### 9.1 Normalização de valor e quantidade

Fórmulas da planilha:

```text
AMOUNT_USD_SIGNED = -1 × Amount (USD)
QTY_SCRAP_SIGNED = -1 × Issue Quantity
```

Essas fórmulas preservam o sinal. Não são equivalentes a `ABS`.

Interpretação técnica proposta, ainda não homologada como categoria de negócio:

- resultado positivo: perda/scrap;
- resultado negativo: movimento de sinal inverso; pode representar correção, devolução, ajuste ou estorno, mas a fonte não informa qual;
- zero: movimentação neutra;
- sinal incoerente: enviar para validação, não converter automaticamente em perda.

Validação da base:

- 0 divergências entre `Amount USD` e `-Amount (USD)`;
- 0 divergências entre `Qty Scrap` e `-Issue Quantity`;
- 10.760 linhas comparáveis entre `Amount (USD)` e `Issue Amount ÷ Tax`;
- 2 divergências acima de US$ 0,02:
  - linha Excel 2042, item `EAJ65915901`: diferença US$ 2,1621;
  - linha Excel 6585, item `COV30490901`: diferença US$ 3,4496.

Regra recomendada: manter `Amount (USD)` da origem como valor contábil autoritativo e usar `Issue Amount ÷ Tax` somente como controle de qualidade, até a área confirmar outra precedência.

### 9.2 Separação matemática dos sinais — não homologada como estorno

Para qualquer medida assinada `x`:

```text
GROSS = Σ max(x, 0)
ADJUSTMENT_SIGNED = Σ min(x, 0)
REVERSAL_MAGNITUDE = -ADJUSTMENT_SIGNED
NET = GROSS + ADJUSTMENT_SIGNED
NET = GROSS - REVERSAL_MAGNITUDE
```

Reconciliação da base:

| Medida | Bruto positivo | Ajustes assinados | Líquido |
|---|---:|---:|---:|
| IF Cost | US$ 930.390,50 | -US$ 227.032,84 | US$ 703.357,66 |
| QTY Scrap | 387.489 | -89.137 | 298.352 |

Os ajustes representam 24,4% do bruto financeiro e 23,0% do bruto quantitativo. Usar `ABS` inflaria materialmente os números.

### 9.3 Totais da Raw data

```text
Raw data!AM2 = SUBTOTAL(9, AM4:AM1048576)
Raw data!AN2 = AM2 × 6,1
Raw data!AQ2 = SUBTOTAL(9, AQ4:AQ1048576)
```

`SUBTOTAL(9, ...)` soma apenas as linhas visíveis após filtro. Essa é a razão pela qual o total muda quando as segmentações da tabela são usadas.

O fator fixo `6,1` aparece também em `Pivot Table!R2` e `Análise 02!A1`. Ele não deve virar regra do sistema: a base possui uma taxa por transação e o agregado correto em moeda local deve vir do valor local assinado, não de `total USD × 6,1`.

### 9.4 Target e achievement

Nos controles de target:

```text
ACHIEVEMENT = Target ÷ Result
```

Exemplo de janeiro:

```text
Target = US$ 28.812,47
Result = US$ 27.854,95
Achievement = 103,4%
```

Como menor scrap é melhor, acima de 100% é favorável.

As planilhas usam:

```text
=IFERROR(Target / Result, "-")
```

No backend, o erro não deve virar o texto `-`. Deve virar `null` com motivo explícito:

- target ausente;
- realizado ausente;
- realizado zero;
- período futuro;
- escopo incompatível.

O bloco legado `Pivot Table!B6:N20` usa:

```text
RATE = Target ÷ Result
GAP_AMOUNT = Target - Result
```

Para evitar ambiguidade no sistema, usar nomes diferentes:

```text
HEADROOM = Target - Actual       # positivo é favorável
UNFAVORABLE_VARIANCE = Actual - Target  # positivo é desfavorável
```

### 9.5 Acumulados

Os controles somam:

- 12 meses para o target anual;
- janeiro a agosto para os blocos `Jan~Aug`;
- resultados disponíveis para o acumulado;
- targets e resultados separadamente para total, MFG e SMT.

O target precisa ser cadastrado por `year + month + scope`. A tabela `Suporte` contém apenas `Departamento`, `Mês`, `Target` e `Result`; sem ano, ela não é adequada como fonte permanente de múltiplos exercícios.

### 9.6 Inventário das 547 fórmulas

| Aba | Qtde. | Famílias de fórmula |
|---|---:|---|
| `Raw data` | 3 | dois `SUBTOTAL(9, ...)` e uma conversão fixa `× 6,1` |
| `Suporte` | 36 | referências diretas aos resultados mensais de `Target Result Control MS` |
| `Target Result Control MS` | 75 | somas mensais/acumuladas; 39 `IFERROR(Target/Result,"-")`; 12 somas auxiliares; 1 valor digitado como fórmula `=5399` |
| `Target Result Control MS W` | 171 | 168 achievements semanais em `F10:BI10`, `F17:BI17`, `F24:BI24`; 3 somas anuais em `BJ8`, `BJ9`, `BJ15` |
| `Target Result Control TV` | 171 | 168 achievements semanais em `F7:BI7`, `F14:BI14`, `F21:BI21`; 3 somas anuais em `BJ5`, `BJ6`, `BJ12` |
| `Planilha1 (2)` | 2 | `E3=SUM(E4:E5)` e `F3=SUM(F4:F5)` |
| `Pivot Table` | 88 | 39 rates, 39 gaps, 4 totais, 3 KPIs do dashboard, 2 `GETPIVOTDATA` e 1 soma de divisões |
| `Análise 02` | 1 | `GETPIVOTDATA(...) × 6,1` |

Fórmulas centrais do motor do dashboard Excel:

```text
Pivot Table!Q2 = GETPIVOTDATA("Amount USD", $A$87)
Pivot Table!R2 = Q2 × 6,1
Pivot Table!S2 = GETPIVOTDATA("Soma de Qty Scrap", $A$672)
```

## 10. Erros e resíduos técnicos encontrados

### 10.1 Fórmulas quebradas

Existem 51 erros de célula, todos em `Pivot Table!B4:N20`:

- 18 `#REF!`;
- 33 `#DIV/0!`.

As causas são `GETPIVOTDATA` legados para `Division = HE/MNT`, referências propagadas e divisões por células vazias. Esses blocos não devem ser portados para o backend.

### 10.2 Nomes definidos quebrados

Dois nomes `DadosExternos_1` apontam para `Dashboard!#REF!` e `Analysis!#REF!`. O nome equivalente da `Raw data` ainda aponta para a tabela válida.

### 10.3 Cache antigo

As segmentações exibem itens que não existem na carga atual. O catálogo de filtros do sistema deve vir de consulta distinta sobre os dados vigentes ou de dimensões mestres versionadas, nunca do cache do Excel.

### 10.4 Mistura de anos no gráfico mensal

As pivôs mensais `Tabela dinâmica8` e `Tabela dinâmica13` não estão ligadas ao filtro `YY.MM`. Elas agrupam somente por `Nome do Mês` e, com dados de 2025 e 2026, somam meses de anos diferentes.

Regra correta:

```text
GROUP BY year, month_number
```

Nunca agrupar a tendência somente por `Jan`, `Fev`, etc.

## 11. Mapa dos 10 gráficos do Dashboard Excel

| # | Visual observado | Fonte | Medida atual | Regra para a versão geral |
|---:|---|---|---|---|
| 1 | Total por produto | `Pivot Table!A822:C825` | Amount USD + Qty Scrap | agrupar todos os produtos; não incluir `Grand Total` como categoria |
| 2 | Evolução mensal + target | `A565:H575` e target legado | valor, quantidade e target | usar `year-month`; separar eixos/unidades ou alternar por toggle |
| 3 | Evolução semanal | `M703:O708` | Amount USD + Qty | usar `ISO year-week`; manter sinal e marcar semana parcial |
| 4 | Percentual ofensor | `A331:C335` | participação por Item Type | substituir donut por Pareto/ranking auditável; explicitar denominador |
| 5 | Top 10 Item Type em USD | `A840:B849` | soma assinada | decidir líquido ou bruto; recomendação: bruto para ofensores |
| 6 | Receipt Department em USD | `A675:B682` | soma assinada | chamar de Linha somente após homologação semântica |
| 7 | Top 10 Make Item em USD | `I840:J850` | soma assinada | ranking por modelo com drill-down |
| 8 | Top 10 Item Type em QTY | `A840:C849` | soma assinada | mesma população e filtros da visão financeira |
| 9 | Receipt Department em QTY | `A675:C682` | soma assinada | manter unidade explícita |
| 10 | Top 10 Make Item em QTY | `I840:K850` | soma assinada | ranking por modelo com drill-down |

O dashboard Excel não contém fórmulas próprias: todos os gráficos dependem dos resultados da aba `Pivot Table`.

## 12. O que o protótipo web faz hoje

`index.html` contém principalmente o shell. As regras estão em `scripts.js` e a integração em `api-dashboard.js`.

### 12.1 Pontos já alinhados

- preserva a separação matemática dos sinais na integração, sem exibir o card `Ajustes / estornos` no Dashboard;
- usa `Target ÷ Actual × 100` para achievement;
- considera redução quando a variação é negativa;
- oferece filtros por ano, produto, receipt department/linha, item type e item;
- separa impacto absoluto de eficiência relativa;
- sinaliza que denominadores relativos são mockados;
- mantém valores futuros como `null` nas séries.

### 12.2 Divergências e riscos

| Tema | Planilha observada | Protótipo atual | Decisão necessária |
|---|---|---|---|
| QTY normalizada | `-Issue Quantity` | tela de configuração declara `ABS(Issue Quantity)` | alterar para inversão de sinal; nunca usar `ABS` como regra geral |
| IF Cost | `-Amount (USD)` | configuração declara `(Issue Price × QTY) ÷ Exchange Rate` | usar valor da origem e manter recomposição como QA |
| Taxa de câmbio | presente em todas as linhas válidas | API mapeia `exchangeRate: null` | preservar `Tax` e o valor local |
| Conta/alias | presentes na planilha | API devolve `Não disponível` | expor campos e filtros para provar escopo geral |
| Linha | `Receipt Department` | renomeada para `scrapLine` | homologar a equivalência |
| Setor/posto | inexistentes | preenchidos como mock | não publicar mapa real até integrar a dimensão correta |
| Período real | dados até junho/2026 | mock local informa agosto parcial | exibir data máxima e status do snapshot real |
| Targets | controle da planilha é 2025 | mock usa outra série de 2026 | escolher fonte oficial e versionada |
| Rankings | pivôs usam soma assinada | web usa `gross_scrap_*` | recomendação: rankings de ofensores brutos, claramente rotulados |
| Pareto | workbook tem percentual/donut | web calcula acumulado só sobre Top 8 | denominador deve ser todo o universo, não somente o Top 8 |
| Semanas | `W1...W53` sem ano | API recebe `week_label` | exigir `week_year` e regra ISO/industrial homologada |
| Visão relativa | não existe no workbook | numerador por linha é alocado proporcionalmente e denominador é mock | não homologar resultados; usar soma real por mesma granularidade |

### 12.3 Problemas específicos do código web

1. Com API conectada, KPIs mensais usam líquido, enquanto rankings usam bruto. Isso pode ser correto, mas os títulos devem dizer explicitamente qual medida está em uso.
2. O Pareto pega apenas os oito maiores Part Numbers e calcula o acumulado sobre esses oito; assim, a curva sempre termina em 100% mesmo ignorando a cauda.
3. A evolução semanal calcula rótulos reais, mas o HTML usa quatro rótulos fixos de agosto. Quantidade de barras e rótulos pode divergir.
4. Na visão relativa, o numerador da linha é estimado por rateio proporcional do total, não somado das transações da linha.
5. Filtro de componente/Part Number reduz o numerador relativo, mas não reduz o denominador. A própria interface admite essa incompatibilidade; o resultado não deve ser usado como KPI industrial.
6. `issueAmount` recebe `abs(amount_usd_original)`, embora o nome indique valor local e o módulo elimine o sinal.
7. `account` e `accountAlias` são descartados no adaptador, impedindo auditar o recorte contábil.
8. O dashboard não oferece filtros de `Department`, `Division`, `Organization Code`, `Account` ou `Account Alias`.
9. Sem backend disponível no projeto, a tela cai para séries e transações mockadas; ela ainda não é uma reprodução confiável do `.xlsm`.

## 13. Regras propostas para o Scrap Geral

Estas são recomendações para homologação; não devem ser tratadas como decisões corporativas já aprovadas.

### 13.1 Universo padrão

```text
DEFAULT_SCOPE = todos os registros elegíveis do snapshot
```

O padrão deve começar com:

- todas as organizações autorizadas;
- todos os departamentos;
- todas as divisões;
- todos os produtos;
- todos os receipt departments;
- todos os itens e modelos;
- nenhuma segmentação persistida invisível.

Filtros ativos devem sempre aparecer como chips e em um resumo de escopo exportável.

### 13.2 Elegibilidade contábil

Não assumir que toda transação da rotina `Other Account` é scrap.

Criar uma tabela versionada:

| Chave | Classificação | Tratamento |
|---|---|---|
| Account + Account Alias + Description | Scrap | inclui |
| Account + Account Alias + Description | Ajuste/estorno | inclui com sinal |
| Account + Account Alias + Description | Fora do escopo | exclui e registra motivo |
| combinação não mapeada | Pendente | quarentena e alerta |

`D-DIRECT` não pode ser transformado em sinônimo definitivo de “todo scrap” sem validação. `D-COMMON` e demais aliases precisam ser medidos na exportação completa.

### 13.3 Medidas técnicas propostas — classificação de estorno pendente

```text
amount_usd_signed = -amount_usd_source
qty_scrap_signed = -issue_quantity

gross_scrap_usd = Σ max(amount_usd_signed, 0)
reversal_usd = Σ max(-amount_usd_signed, 0)
net_scrap_usd = gross_scrap_usd - reversal_usd

gross_scrap_qty = Σ max(qty_scrap_signed, 0)
reversal_qty = Σ max(-qty_scrap_signed, 0)
net_scrap_qty = gross_scrap_qty - reversal_qty
```

Uso recomendado:

- KPIs executivos, tendência e comparação com target: líquido;
- Pareto e ranking de ofensores: bruto;
- investigação e reconciliação: bruto, reversões e líquido juntos;
- exportação transacional: valor assinado original e normalizado.

### 13.4 Datas e períodos

Derivar e armazenar:

```text
transaction_date
year
month_number
year_month
week_year
week_number
year_week
```

Regras:

- definir se a semana é ISO ou calendário industrial;
- não agregar anos distintos pelo nome do mês;
- marcar mês/semana como fechado, parcial ou futuro;
- períodos futuros são `null`, não zero;
- comparações YTD usam o último período fechado comum.

### 13.5 Targets

Chave mínima:

```text
target(year, month, scope_type, scope_id, version)
```

Fórmulas:

```text
achievement_pct = target_usd / actual_net_usd × 100
headroom_usd = target_usd - actual_net_usd
unfavorable_variance_usd = actual_net_usd - target_usd
```

Não ratear target total automaticamente entre filtros menores. Quando não houver target no mesmo escopo, retornar `null` e explicar “meta não cadastrada para este recorte”.

### 13.6 Pareto

```text
category_gross = Σ gross_scrap na categoria
share = category_gross / Σ gross_scrap de todas as categorias do escopo
cumulative_share_n = Σ share da posição 1 até n
```

O gráfico pode mostrar Top N, mas o denominador do percentual precisa incluir a cauda completa. A interface deve informar quanto o Top N cobre.

### 13.7 Taxas relativas

Não existe denominador de produção, Material Amount ou BOM na planilha analisada.

Até a integração de uma fonte homologada:

- não exibir IF Cost Rate ou Scrap Rate como dado real;
- manter a área marcada como `MOCK` apenas em ambiente de protótipo;
- nunca ratear o numerador de uma linha proporcionalmente;
- desabilitar a taxa se produto, linha, modelo ou componente não tiver denominador na mesma granularidade.

### 13.8 Linhas inválidas e quarentena

Proposta:

- `Allocation error = 1`: quarentena até decisão do negócio;
- data ausente: não entra em série temporal;
- valor/quantidade ausente: não transformar em zero;
- conta/alias não mapeado: pendente de classificação;
- duplicidade: rejeitar ou marcar, sem somar novamente;
- linha ignorada pelo parser: registrar arquivo, número da linha e motivo.

## 14. Contrato mínimo para o dashboard

### 14.1 Filtros obrigatórios

- ano e período;
- organização;
- departamento;
- divisão;
- produto;
- receipt department/linha;
- conta e account alias;
- item type/componente;
- Part Number;
- Make Item/modelo;
- tipo de movimento: scrap, ajuste/estorno;
- status de qualidade da linha.

### 14.2 Campos mínimos por transação

```text
transaction_id
source_file
source_row
execution_id
transaction_date
organization_code
department
division
product
account
account_alias
receipt_department
item
item_type
make_item
work_order
issue_quantity
qty_scrap_signed
issue_amount_local
exchange_rate
amount_usd_original
amount_usd_signed
allocation_error
eligibility_status
```

### 14.3 Campos mínimos por agregado mensal

```text
year
month_number
scope
gross_scrap_usd
reversal_usd
net_scrap_usd
gross_scrap_qty
reversal_qty
net_scrap_qty
target_usd
achievement_pct
is_closed
data_through
```

## 15. Decisões que precisam de homologação

| Prioridade | Pergunta | Recomendação inicial |
|---|---|---|
| P0 | Quais contas e aliases compõem “scrap geral”? | mapear por tabela versionada; não assumir só `D-DIRECT` |
| P0 | O escopo inclui todas as 10 organizações ou apenas NW1/NW4/NWK? | incluir todas as autorizadas e tornar organização um filtro |
| P0 | `BM` deve entrar na visão padrão? | sim; é 75,7% do IF Cost disponível |
| P0 | `Receipt Department` pode ser chamado de Linha? | confirmar com o dono do processo; manter nome de origem até lá |
| P0 | Ranking/Pareto usa bruto ou líquido? | bruto para ofensores, líquido para resultado executivo |
| P0 | Qual é a fonte oficial de targets e qual o ano vigente? | cadastro versionado independente da planilha |
| P1 | `Allocation error = 1` entra no resultado? | quarentena até validação |
| P1 | Semana é ISO ou calendário industrial? | definir explicitamente e armazenar ano da semana |
| P1 | Como tratar os dois desvios cambiais encontrados? | preservar valor fonte e abrir alerta de reconciliação |
| P1 | A conversão para real é necessária? | somar valor local assinado; eliminar taxa fixa 6,1 |
| P1 | Como classificar comentários/causas? | transformar `Categoria` em cadastro governado, não planilha manual isolada |
| P2 | Visão relativa entra na primeira versão? | somente depois da integração de produção/Material Amount/BOM |

## 16. Critérios de aceite para a futura implementação

1. Com todos os filtros limpos, o dashboard reconcilia exatamente com a soma assinada do snapshot.
2. Selecionar junho/2026 e todos os produtos retorna US$ 48.723,82 e 76.389 unidades para o arquivo analisado.
3. Selecionar somente AV + MNT + TV retorna US$ 6.915,29 e 48.228 unidades.
4. Selecionar BM retorna US$ 41.808,53 e 28.161 unidades em junho/2026.
5. Bruto menos reversões reconcilia com líquido em qualquer recorte.
6. Nenhum filtro fica ativo sem chip, resumo ou parâmetro visível.
7. Tendência mensal nunca mistura o mesmo mês de anos diferentes.
8. Pareto usa o universo completo no denominador, mesmo exibindo Top N.
9. Target só aparece quando ano, período e escopo são compatíveis.
10. Taxas sem denominador retornam `não calculável`, nunca `0%`.
11. Registros inválidos, pulados ou duplicados aparecem em relatório de qualidade.
12. Cada total do dashboard pode ser rastreado até transações, arquivo, linha e execução.
13. O sistema informa `data_through`, período parcial e última execução bem-sucedida.
14. O modo mock nunca é apresentado como dado industrial real.

## 17. Posição final para alinhamento

Ainda não há acordo completo entre automação, planilha e dashboard web.

Os pontos já sustentados pela evidência são:

- o consolidador não aplica filtros de negócio;
- a planilha não consome o consolidado enviado;
- a fonte efetiva só contém `FA`, conta `12110301` e alias `D-DIRECT`;
- o Dashboard Excel exclui `BM`, que é o maior impacto financeiro;
- o sinal deve ser invertido, não convertido em valor absoluto;
- o total executivo deve ser líquido e o ranking de ofensores deve declarar se é bruto;
- targets e taxas relativas ainda precisam de fonte homologada;
- setor/posto não existe na base atual;
- há fórmulas quebradas, caches antigos e mistura potencial de anos que não devem ser reproduzidos no backend.

A versão “Scrap Geral” deve começar ampliando e tornando explícito o universo de dados. Só depois os mesmos filtros, fórmulas e totais devem chegar ao `index.html` por um contrato de API rastreável.
