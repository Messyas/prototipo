# Relatório de fórmulas, filtros, telas e experiência do Dashboard

Status: especificação exclusiva de métricas e UX  
Data: 15/08/2026  
Referências: planilha de IF Cost, `solucao_ouro.html`, apresentação Rev04, backlog e plano por tela.

## 1. Objetivo

Este relatório define:

- quais fórmulas o Hanaro utilizará;
- o significado matemático de numeradores e denominadores;
- onde cada indicador aparece;
- quais filtros podem ou não afetar cada fórmula;
- como toggles, seletores, filtros globais e controles locais se relacionam;
- quais gráficos preservam o Dashboard da planilha;
- como acrescentar a análise relativa sem tornar a interface confusa;
- quais dados existem na planilha e quais dependem de outra fonte.

## 2. Decisão principal de UX

O Dashboard não deve apresentar quatro combinações matemáticas por meio de toggles sem contexto. A proposta é separar duas perguntas de negócio em duas visões nomeadas:

### Visão A — Impacto absoluto

Pergunta: **onde está o maior volume ou impacto financeiro de scrap?**

Controle interno:

```text
Métrica: [ US$ | Unidades ]
```

Essa é a visão padrão e mais próxima do dashboard da planilha.

### Visão B — Eficiência relativa

Pergunta: **qual linha/produto perde mais em proporção ao que produziu ou processou?**

Controle interno:

```text
Taxa: [ Financeira | Quantitativa ]
```

Essa é a análise adicional solicitada pelo responsável gerencial.

### Por que separar as visões

- reduz a carga cognitiva;
- mantém a familiaridade com a planilha;
- evita um Pareto matematicamente inválido de taxas não aditivas;
- impede que o usuário confunda US$ com percentual;
- permite explicar o denominador somente quando ele é necessário;
- conserva impacto absoluto e eficiência proporcional como respostas complementares.

## 3. Notação matemática

Considere:

- `S`: escopo definido pelos filtros válidos;
- `T(S)`: transações de scrap pertencentes ao escopo;
- `P(S)`: registros de produção/material pertencentes ao mesmo escopo;
- `i`: uma transação de scrap;
- `j`: um registro de produção;
- `k`: uma categoria de agrupamento, como linha, produto ou componente.

O mesmo período, produto/área, linha, modelo e moeda devem ser usados no numerador e no denominador.

## 4. Fórmulas de origem e normalização

### 4.1 Quantidade normalizada de scrap

```text
QTY_SCRAPᵢ = - ISSUE_QUANTITYᵢ
```

Explicação:

- o GERP registra normalmente a saída do estoque com sinal negativo;
- o Dashboard precisa apresentar uma perda como valor positivo;
- por isso, o sinal é invertido;
- uma entrada positiva na origem torna-se um valor normalizado negativo, indicando possível ajuste, devolução ou estorno.

Exemplo:

```text
Issue Quantity = -5
QTY SCRAP      = -(-5)
QTY SCRAP      = 5 unidades
```

### 4.2 Valor local da movimentação

```text
ISSUE_AMOUNT_LOCALᵢ ≈ ISSUE_QUANTITYᵢ × ISSUE_PRICE_LOCALᵢ
```

O valor pode conter arredondamento vindo do sistema de origem.

### 4.3 Valor em dólar na origem

```text
AMOUNT_USD_SOURCEᵢ = ISSUE_AMOUNT_LOCALᵢ ÷ EXCHANGE_RATEᵢ
```

Unidades:

```text
moeda local ÷ (moeda local / US$) = US$
```

### 4.4 IF Cost normalizado

```text
IF_COST_USDᵢ = - AMOUNT_USD_SOURCEᵢ
```

Forma expandida:

```text
IF_COST_USDᵢ = -(ISSUE_AMOUNT_LOCALᵢ ÷ EXCHANGE_RATEᵢ)
```

Exemplo da planilha:

```text
Issue Amount local = -196,03
Taxa de câmbio     = 6,0396495747
Amount USD origem  = -196,03 ÷ 6,0396495747
Amount USD origem  ≈ -32,4572
IF Cost normalizado = 32,4572 US$
```

### 4.5 Por que não usar valor absoluto

```text
INCORRETO: IF_COST = ABS(AMOUNT_USD_SOURCE)
```

`ABS` transformaria ajustes negativos em novas perdas positivas. A reconciliação da planilha demonstra o efeito:

| Cálculo | QTY SCRAP | IF Cost |
|---|---:|---:|
| Soma assinada da planilha | 298.352 | US$ 703.357,66 |
| Soma de valores absolutos | 476.626 | US$ 1.157.423,34 |

Portanto, o sinal precisa ser preservado.

## 5. Scrap bruto, ajustes e resultado líquido

Para uma medida normalizada `xᵢ`, que pode ser `QTY_SCRAPᵢ` ou `IF_COST_USDᵢ`:

### 5.1 Scrap bruto

```text
GROSS(S) = Σ max(xᵢ, 0), para i ∈ T(S)
```

Soma apenas perdas positivas.

### 5.2 Ajustes/possíveis estornos

```text
ADJUSTMENTS(S) = Σ min(xᵢ, 0), para i ∈ T(S)
```

O resultado é zero ou negativo.

### 5.3 Resultado líquido

```text
NET(S) = GROSS(S) + ADJUSTMENTS(S)
```

Equivalente a:

```text
NET(S) = Σ xᵢ, para i ∈ T(S)
```

### Onde aparece

| Medida | Tela/elemento |
|---|---|
| Líquido | KPI executivo, evolução mensal, target × realizado, relatório e total da Base |
| Bruto | KPI de investigação, Pareto de ofensores e detalhe operacional |
| Ajustes | KPI secundário, tooltip, Base de Scrap e auditoria |

Recomendação: o Pareto deve ser intitulado `Pareto de perdas brutas`, porque uma taxa acumulada com valores negativos deixa de representar corretamente a concentração dos problemas.

## 6. Visão A — Impacto absoluto

Essa visão não usa denominador.

### 6.1 Total em unidades

```text
QTY_TOTAL(S) = Σ QTY_SCRAPᵢ
```

Unidade: `un.`

### 6.2 Total financeiro

```text
IF_COST_TOTAL(S) = Σ IF_COST_USDᵢ
```

Unidade: `US$`

### 6.3 Toggle da visão absoluta

```text
[ US$ | Unidades ]
```

O toggle altera:

- valores dos KPIs;
- eixos e rótulos dos gráficos;
- ranking e ordenação;
- tooltips;
- unidades das tabelas resumidas;
- conclusão automática do período.

O toggle não altera:

- filtros ativos;
- período;
- registros selecionados;
- status de revisão;
- snapshot de dados.

### 6.4 Botão de olho

Disponível somente quando `US$` estiver ativo.

Ao ocultar:

- mascara cards, eixos, rótulos, tooltips e células com valor monetário;
- mantém a forma relativa do gráfico;
- não altera cálculos;
- não substitui permissão de acesso;
- não libera exportação para usuário não autorizado.

## 7. Visão B — Eficiência relativa

Essa visão precisa de denominador.

## 7.1 Material Amount

Definição recomendada:

```text
MATERIAL_AMOUNT_USD(S)
  = Σ (PRODUCTION_QTYⱼ × STANDARD_MATERIAL_COST_USDⱼ), para j ∈ P(S)
```

Significado: valor material padrão associado à produção do mesmo período e escopo.

Não usar:

- receita de venda;
- preço comercial;
- denominador de outro período;
- total de uma linha inteira quando o numerador está filtrado para apenas um componente sem correspondência de BOM.

## 7.2 IF Cost relativo

```text
IF_COST_RATE(S)
  = IF_COST_NET_USD(S) ÷ MATERIAL_AMOUNT_USD(S) × 100
```

Unidade: `%`

Interpretação:

```text
IF Cost Rate = 0,40%
```

significa que, a cada US$ 100 de valor material produzido, US$ 0,40 correspondeu ao IF Cost líquido.

### Exemplo

```text
IF Cost líquido = US$ 4.000
Material Amount = US$ 1.000.000

IF Cost Rate = 4.000 ÷ 1.000.000 × 100
IF Cost Rate = 0,40%
```

## 7.3 Denominadores financeiros possíveis

| Denominador | Fórmula | Avaliação |
|---|---|---|
| Material padrão da produção | produção × custo material padrão/BOM | Recomendado: estável e comparável |
| Material efetivamente consumido | soma do valor real consumido | Possível, mas a própria ineficiência pode aumentar o denominador |
| Valor padrão dos produtos bons | quantidade boa × custo padrão | Pode penalizar duplamente uma linha com baixa produção |
| Receita | quantidade × preço de venda | Não recomendado: mistura custo com receita |

## 7.4 Scrap Rate quantitativo por componente

Quando a análise está filtrada para componente ou família compatível:

```text
EXPECTED_COMPONENT_QTY(S)
  = Σ (PRODUCTION_QTYⱼ × BOM_QTY_PER_PRODUCTⱼ)
```

```text
QTY_SCRAP_RATE(S)
  = QTY_SCRAP_NET(S) ÷ EXPECTED_COMPONENT_QTY(S) × 100
```

Exemplo:

```text
100 módulos descartados
10.000 módulos esperados pela BOM

Scrap Rate = 100 ÷ 10.000 × 100 = 1%
```

## 7.5 Taxa de produto acabado

Somente quando o numerador representar aparelhos/produtos defeituosos:

```text
DEFECT_RATE(S)
  = DEFECTIVE_FINISHED_UNITS(S) ÷ PRODUCTION_QTY(S) × 100
```

Não utilizar essa fórmula diretamente com componentes heterogêneos.

## 7.6 Componentes descartados por 1.000 produtos

Para uma linha com componentes misturados, quando não houver denominador BOM suficientemente detalhado:

```text
SCRAP_COMPONENTS_PER_1000(S)
  = QTY_SCRAP_NET(S) ÷ PRODUCTION_QTY(S) × 1.000
```

Unidade: `componentes descartados / 1.000 produtos`.

Isso é um índice, não um percentual.

## 7.7 Regra de indisponibilidade

Se o denominador estiver ausente, for zero ou tiver granularidade incompatível:

```text
resultado = NÃO CALCULÁVEL
```

Nunca exibir `0%`, porque zero significaria ausência de perda, não ausência de informação.

## 8. Targets e comparações

## 8.1 Target mensal absoluto

```text
TARGET_USD(year, month, scope)
```

É cadastrado no início do ano e versionado.

## 8.2 Gap nominal

```text
TARGET_GAP_USD = ACTUAL_USD - TARGET_USD
```

Interpretação:

- positivo: resultado acima do limite de custo;
- negativo: resultado abaixo do target, situação favorável.

## 8.3 Gap percentual

```text
TARGET_GAP_PCT
  = (ACTUAL_USD - TARGET_USD) ÷ TARGET_USD × 100
```

## 8.4 Atingimento

Como menor scrap é melhor:

```text
ACHIEVEMENT_PCT = TARGET_USD ÷ ACTUAL_USD × 100
```

Exemplo:

```text
Target = 28.812
Realizado = 27.874

Atingimento = 28.812 ÷ 27.874 × 100
Atingimento ≈ 103,4%
```

Acima de 100% indica resultado melhor que o limite planejado.

## 8.5 Comparação com mês anterior — MoM

```text
MOM_REDUCTION_PCT
  = (PREVIOUS_MONTH - CURRENT_MONTH) ÷ PREVIOUS_MONTH × 100
```

## 8.6 Comparação anual — YoY

```text
YOY_REDUCTION_PCT
  = (SAME_MONTH_PREVIOUS_YEAR - CURRENT_MONTH)
    ÷ SAME_MONTH_PREVIOUS_YEAR × 100
```

## 8.7 Comparação acumulada — YTD

Se o último mês fechado comum é junho:

```text
CURRENT_YTD  = Σ janeiro..junho do ano atual
PREVIOUS_YTD = Σ janeiro..junho do ano anterior

YTD_REDUCTION_PCT
  = (PREVIOUS_YTD - CURRENT_YTD) ÷ PREVIOUS_YTD × 100
```

Nunca comparar janeiro–junho do ano atual contra janeiro–dezembro do ano anterior.

## 8.8 Target relativo

Somente será exibido depois de homologado:

```text
TARGET_IF_COST_RATE(year, month, scope)
```

Um target em US$ não pode ser desenhado em um gráfico percentual ou de unidades.

## 9. Participação, Pareto e rankings

## 9.1 Participação de uma categoria

Para perdas brutas:

```text
SHAREₖ = GROSSₖ ÷ Σ GROSSₖ × 100
```

## 9.2 Percentual acumulado do Pareto

Ordenando categorias do maior para o menor:

```text
CUMULATIVE_SHAREₙ = Σ SHAREₖ, para k = 1..n
```

A linha de referência em 80% indica a concentração principal.

## 9.3 Por que não fazer Pareto de taxas relativas

Taxas possuem denominadores diferentes e não são diretamente aditivas:

```text
0,20% + 0,40% ≠ 60% de um total
```

Na visão relativa, usar ranking de taxas, não curva Pareto acumulada.

## 9.4 Posição e variação do ranking

```text
RANK_DELTA = PREVIOUS_POSITION - CURRENT_POSITION
```

- positivo: subiu no ranking de ofensores;
- negativo: caiu;
- para comunicar melhoria, a interface deve explicar que cair no ranking de perdas é favorável.

## 10. Heatmap/mapa de risco

O mapa não deve receber automaticamente todos os toggles globais.

### Métrica padrão pública

```text
RISK_VALUE(station, month) = Σ QTY_SCRAP_BRUTO
```

### Métrica autenticada opcional

```text
RISK_VALUE_USD(station, month) = Σ IF_COST_BRUTO_USD
```

### Classificação visual

```text
LOW       se value < threshold_moderate
MODERATE  se threshold_moderate ≤ value < threshold_critical
CRITICAL  se value ≥ threshold_critical
```

Os thresholds são configurados por métrica e escopo. Não usar cores relativas ao maior ponto do mês, pois isso mudaria o significado das cores a cada filtro.

Taxa relativa por posto só será permitida se existir produção/Material Amount por posto. Caso contrário, o controle ficará indisponível.

## 11. Arquitetura dos controles

## 11.1 Diferença entre controles

| Controle | Função | Exemplo |
|---|---|---|
| Filtro | Reduz o conjunto de registros | Produto = TV |
| Toggle | Alterna duas formas equivalentes de uma mesma leitura | US$ ↔ Unidades |
| Aba de análise | Muda a pergunta de negócio e o conjunto de gráficos | Impacto absoluto ↔ Eficiência relativa |
| Seletor de comparação | Define período de referência | YoY |
| Controle local | Muda somente um gráfico | Top 5 ↔ Top 10 |
| Drill-down | Navega do agregado para registros | Linha A05 → Base de Scrap |

## 11.2 Barra global de filtros

Sempre visíveis no desktop:

```text
[Ano] [Mês/Período] [Produto/Área] [Linha] [Mais filtros]
```

Dentro de `Mais filtros`:

```text
[Semana] [Setor/Posto] [Componente] [Modelo]
```

Regras:

- Ano e período são seleção única;
- produto/área, linha, componente e modelo podem ser multisseleção;
- setor/posto depende da linha;
- filtros ativos aparecem como chips removíveis;
- `Limpar filtros` retorna à visão consolidada;
- `Meu recorte` salva filtros do Analista sem alterar a visão geral.

## 11.3 Barra de análise

Logo abaixo dos filtros:

```text
[ Impacto absoluto | Eficiência relativa ]

Impacto absoluto:     [ US$ | Unidades ] [Comparar com ▾] [Olho]
Eficiência relativa:  [ Financeira | Quantitativa ] [Comparar com ▾]
```

O seletor `Comparar com` contém:

- sem comparação;
- mês anterior;
- mesmo mês do ano anterior;
- acumulado YTD anterior.

## 11.4 Controles locais de gráfico

Permitidos:

- Top 5/10/20;
- ordenar crescente/decrescente;
- agrupar por componente/tipo, quando a semântica for equivalente;
- exibir tabela de dados;
- expandir em tela cheia.

Não permitir um controle local que contradiga o toggle global de unidade.

## 12. Relação entre filtros e denominadores

A regra central é:

```text
escopo(numerador) = escopo(denominador)
```

### Matriz de compatibilidade

| Filtro | Impacto absoluto | IF Cost relativo | Scrap Rate quantitativo |
|---|---:|---:|---:|
| Ano/mês/semana | Sim | Sim, se produção tiver a mesma granularidade | Sim, se produção tiver a mesma granularidade |
| Produto/área | Sim | Sim | Sim |
| Linha | Sim | Sim | Sim |
| Modelo | Sim | Sim, se Material Amount existir por modelo | Sim, se produção/BOM existir por modelo |
| Componente | Sim | Somente com Material Amount do componente | Somente com consumo esperado/BOM do componente |
| Setor/posto | Sim | Somente com denominador por posto | Somente com produção/consumo por posto |
| Status de revisão | Sim na investigação | Não recomendado | Não recomendado |
| Status de ação | Sim em Ações | Não se aplica | Não se aplica |

### Exemplo de erro evitado

Incorreto:

```text
Numerador = IF Cost apenas do componente Module
Denominador = Material Amount de toda a linha
```

Correto:

```text
Numerador = IF Cost do componente Module
Denominador = valor material esperado/produzido do componente Module
```

Se essa correspondência não existir, a taxa fica indisponível.

## 13. Gráficos do Dashboard de Impacto absoluto

Essa tela preserva a intenção dos 10 gráficos da planilha. Os três pares duplicados de valor/quantidade são consolidados pelo toggle `US$ | Unidades`.

| Módulo | Tipo | US$ | Unidades | Filtros aplicados |
|---|---|---|---|---|
| Target × realizado mensal | Linhas com pontos | IF Cost líquido e target US$ | QTY SCRAP mensal; target oculto sem meta de unidades | Todos os filtros compatíveis |
| Evolução semanal | Colunas | IF Cost líquido por semana | QTY SCRAP líquido por semana | Período, produto, linha, componente/modelo |
| Distribuição por produto/área | Barras horizontais | IF Cost por categoria | QTY SCRAP por categoria | Período e filtros abaixo do agrupamento |
| Pareto de componentes | Colunas + linha acumulada | IF Cost bruto | QTY SCRAP bruto | Período, produto e linha |
| Top 10 componentes | Barras horizontais | IF Cost líquido/bruto detalhado | QTY SCRAP líquido/bruto detalhado | Todos os filtros compatíveis |
| Ranking de linhas | Barras horizontais | IF Cost por linha | QTY SCRAP por linha | Período, produto, componente/modelo |
| Ranking de modelos | Barras horizontais | IF Cost por modelo | QTY SCRAP por modelo | Período, produto e linha |
| Mapa de risco | Overlay espacial | IF Cost bruto opcional | QTY SCRAP bruto padrão | Mês, linha, setor/posto, produto |

## 14. Gráficos do Dashboard de Eficiência relativa

Essa aba usa gráficos próprios; não apenas troca os números da planilha.

| Módulo | Tipo | Fórmula | Função |
|---|---|---|---|
| IF Cost Rate por linha | Barras horizontais | IF Cost líquido ÷ Material Amount | Comparar eficiência financeira entre linhas de escalas diferentes |
| Scrap Rate por componente | Barras horizontais | QTY SCRAP ÷ consumo esperado/BOM | Identificar componentes com maior perda proporcional |
| Escala × eficiência | Dispersão com bolhas | X = Material Amount; Y = IF Cost Rate; bolha = IF Cost absoluto | Separar alto impacto de baixa eficiência |
| Tendência da taxa | Linha | taxa mensal/semana | Ver melhora ou piora proporcional ao longo do tempo |
| Atual × referência | Slope chart ou colunas agrupadas | taxa atual e MoM/YoY/YTD | Comparar evolução relativa |
| Cobertura do denominador | Barra de progresso/tabela | registros calculáveis ÷ escopo total | Evitar decisões sobre dados incompletos |

Não há Pareto acumulado de taxas.

## 15. Onde cada fórmula aparece

| Fórmula/indicador | Dashboard público | Dashboard completo | Base | Componentes | Ações | Relatório | TV | Configurações |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| QTY SCRAP líquido | Sim | Sim | Sim | Sim | Contexto | Sim | Sim | Dicionário |
| IF Cost líquido | Não | Sim | Sim autorizado | Sim autorizado | Contexto | Sim | Autenticado | Dicionário |
| Bruto/ajustes | Resumo em unidades | Sim | Sim | Sim | Contexto | Sim | Autenticado | Dicionário |
| Target/achievement | Não monetário | Sim | Não | Não | Não | Sim | Autenticado | Cadastro |
| MoM/YoY/YTD | Quantidade | Sim | Não | Tendência | Ações concluídas | Sim | Sim | Regra |
| Material Amount | Não | Sim autorizado | Não como campo de scrap | Contexto agregado | Não | Sim | Autenticado | Fonte/regra |
| IF Cost Rate | Não por padrão | Sim | Não por transação | Agregado | Contexto | Sim | Autenticado | Fórmula/target |
| Scrap Rate quantitativo | Sim, se disponível | Sim | Não por transação | Sim por componente | Contexto | Sim | Sim | Fórmula |
| Participação/Pareto | Sim em unidades | Sim | Não | Sim | Não | Sim | Sim | Regra |
| Risco por posto | Sim em unidades | Sim | Contexto | Não | Contexto | Sim | Sim | Threshold/layout |

Taxas não aparecem como propriedade de uma transação individual; são agregados calculados sobre numerador e denominador.

## 16. Layout recomendado — Dashboard completo

## 16.1 Cabeçalho

```text
Dashboard de Material Scrap / IF Cost
Atualizado em 15/08 10:00 · Próxima rotina 12:00 · EXE-...
                                      [Atualizar] [Exportar] [Criar relatório]
```

## 16.2 Filtros

Primeira linha compacta e estável:

```text
[2026 ▾] [Ago ▾] [Todos os produtos ▾] [Todas as linhas ▾] [Mais filtros]
```

Segunda linha somente quando houver filtros:

```text
Filtros: [TV ×] [A05 ×] [Module ×]                    [Limpar todos]
```

## 16.3 Barra de análise

```text
[ Impacto absoluto | Eficiência relativa ]
                         [US$ | Unidades] [YoY ▾] [Olho]
```

Ao trocar a aba, a posição dos controles permanece estável para evitar salto visual.

## 16.4 Grade — Impacto absoluto

Desktop em 12 colunas:

```text
┌─────────────────────────────────────────────────────────────┐
│ KPIs: líquido | bruto | ajustes | target | atingimento      │
├───────────────────────────────────────┬─────────────────────┤
│ Target × realizado mensal (8 col.)    │ Produto/área (4)    │
├───────────────────────────────────────┼─────────────────────┤
│ Evolução semanal (8)                  │ Top ofensores (4)    │
├───────────────────┬───────────────────┬─────────────────────┤
│ Componentes (4)   │ Linhas (4)        │ Modelos (4)         │
├─────────────────────────────────────────────────────────────┤
│ Pareto de perdas brutas (12)                                │
├─────────────────────────────────────────────────────────────┤
│ Mapa de risco + tabela de postos (12)                        │
├─────────────────────────────────────────────────────────────┤
│ Ocorrências prioritárias (12)                               │
└─────────────────────────────────────────────────────────────┘
```

## 16.5 Grade — Eficiência relativa

```text
┌─────────────────────────────────────────────────────────────┐
│ KPIs: IF Cost Rate | Scrap Rate | cobertura | variação      │
├──────────────────────────────┬──────────────────────────────┤
│ Ranking relativo de linhas   │ Escala × eficiência         │
├──────────────────────────────┼──────────────────────────────┤
│ Tendência da taxa            │ Atual × referência          │
├──────────────────────────────┴──────────────────────────────┤
│ Componentes/modelos com denominador válido                  │
├─────────────────────────────────────────────────────────────┤
│ Cobertura, exceções e explicação da fórmula                  │
└─────────────────────────────────────────────────────────────┘
```

## 16.6 Mobile

- filtros ficam em drawer;
- chips permanecem visíveis;
- tabs de análise ocupam toda a largura;
- gráficos ficam em uma coluna;
- tabelas viram cartões ou mantêm rolagem horizontal controlada;
- Modo TV não é usado como substituto do layout mobile.

## 17. Layout do Dashboard público

Mais simples e sem dados monetários:

```text
Material Scrap — Visão da linha
[Mês] [Produto/Área] [Linha]                         [Modo TV]

QTY SCRAP | Scrap Rate | Variação | Linha mais afetada

Evolução mensal de unidades
Ranking de linhas
Pareto de componentes em unidades
Mapa de risco
```

Não contém:

- toggle de US$;
- IF Cost Rate financeiro;
- exportação;
- relatório;
- registros individuais;
- Base de Scrap;
- filtros de revisão/justificativa.

## 18. Estados e mensagens de UX

### Denominador ausente

```text
Eficiência relativa indisponível
Não há Material Amount compatível com os filtros selecionados.
[Ver cobertura dos dados]
```

### Mês futuro

```text
Resultado ainda não disponível
Target de setembro: US$ ...
```

### Mês parcial

```text
Mês em andamento · dados até 15/08 10:00
```

### Ajustes

```text
O resultado líquido inclui -US$ ... em ajustes/possíveis estornos.
[Ver registros]
```

### Filtro incompatível com taxa

```text
A taxa por componente exige consumo esperado/BOM.
Remova o filtro de componente ou consulte o impacto absoluto.
```

## 19. Tooltips e explicações

Todo KPI relativo possui tooltip com:

- nome da fórmula;
- numerador;
- denominador;
- período;
- filtros relevantes;
- snapshot;
- regra de interpretação.

Exemplo:

```text
IF Cost Rate: 0,40%
IF Cost líquido: US$ 4.000
Material Amount: US$ 1.000.000
Período: Ago/2026 · Linha B
Fórmula: 4.000 ÷ 1.000.000 × 100
```

## 20. Dados necessários

## 20.1 Já disponíveis na planilha de scrap

- data/mês/semana;
- produto/área disponível na amostra;
- linha/Receipt Department;
- componente, código, descrição e tipo;
- Issue Quantity e `QTY SCRAP`;
- Issue Price, Issue Amount, taxa e Amount USD;
- modelo/Make Item;
- work order e comentários;
- targets e resultados salvos na planilha.

## 20.2 Dependem de fonte adicional ou cadastro

- produção total por período/produto/linha/modelo;
- custo material padrão por produto/modelo;
- Material Amount;
- BOM e quantidade esperada de cada componente;
- quantidade de produto acabado defeituoso, se usada;
- layouts das linhas;
- setores, postos e coordenadas;
- thresholds de risco;
- target relativo, caso seja adotado.

## 21. Regras de validação

1. Numerador e denominador usam o mesmo período e escopo.
2. Conversões monetárias usam moeda e taxa documentadas.
3. Filtros incompatíveis desabilitam a taxa em vez de produzir número aproximado.
4. Impacto absoluto permanece disponível mesmo sem dados de produção.
5. Pareto usa medida aditiva, não soma de taxas.
6. Resultado futuro é vazio, não zero.
7. Ajustes permanecem assinados e rastreáveis.
8. Usuário público não recebe dados financeiros.
9. Tooltip relativo mostra a conta completa.
10. A mesma seleção produz os mesmos totais no Dashboard, relatório e Modo TV autorizado.
11. Gráficos indicam unidade no título, eixo ou subtítulo.
12. Cores de risco usam thresholds configurados e não apenas posição relativa do mês.

## 22. Ordem recomendada de implementação

### Etapa 1 — Preservar a planilha

- implementar filtros globais;
- implementar a aba `Impacto absoluto`;
- transpor os gráficos e consolidar duplicações com `US$ | Unidades`;
- reconciliar totals, targets e sinais.

### Etapa 2 — Melhorar a investigação

- bruto, ajustes e líquido;
- Pareto dinâmico;
- drill-down;
- mapa de risco;
- tooltips e chips de filtro.

### Etapa 3 — Preparar denominadores

- integrar fixture/fonte de produção;
- integrar custo material padrão/Material Amount;
- validar chaves de período, produto, linha e modelo;
- implementar cobertura e estados `Não calculável`.

### Etapa 4 — Eficiência relativa

- IF Cost Rate;
- Scrap Rate quantitativo;
- ranking relativo;
- dispersão escala × eficiência;
- comparações MoM/YoY/YTD;
- inclusão no relatório e Modo TV autorizado.

## 23. Decisão final recomendada

Para ficar próximo do Dashboard da planilha sem comprometer a experiência:

1. manter `Impacto absoluto` como tela inicial;
2. usar um único toggle global `US$ | Unidades` nessa visão;
3. colocar `Eficiência relativa` em uma segunda aba de análise;
4. usar `Financeira | Quantitativa` dentro da aba relativa;
5. não aplicar taxa relativa em Pareto ou mapa sem denominador compatível;
6. manter filtros globais idênticos entre as duas abas;
7. sempre mostrar quando e por que uma taxa não pode ser calculada;
8. apresentar impacto absoluto e eficiência relativa lado a lado no relatório executivo.

Essa estrutura conserva a leitura conhecida da planilha, acrescenta a solicitação gerencial e evita uma barra de controles excessivamente complexa.
