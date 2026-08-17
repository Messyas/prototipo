# Plano de implementação por tela — Hanaro Material Scrap / IF Cost

Status: especificação funcional e técnica do próximo protótipo navegável  
Data: 15/08/2026  
Base: protótipo atual, backlog consolidado, planilha `Controle de Scrap - IF Cost Rev01.xlsm` e apresentação `Rev04_Capability_IF Cost 1.pptx`.

## 1. Escopo e premissas

Este documento define o que será apresentado em cada tela, quem pode acessar, quais dados a sustentam, quais seletores e ações existirão e como cada gráfico deve funcionar.

Na próxima versão do protótipo:

- dados, autenticação, atualização do GERP, envio de e-mail e geração do PPTX serão simulados;
- a interface nunca afirmará que uma operação externa real foi executada;
- a navegação, permissões, cálculos, estados e rastreabilidade serão demonstráveis;
- ECharts continuará sendo a biblioteca local de gráficos;
- os dados simulados seguirão o dicionário e as regras de sinal da planilha;
- nenhuma lista de Pareto, ranking ou conclusão ficará fixa no HTML/JavaScript.

No produto com backend:

- o GERP muda aproximadamente a cada cinco minutos;
- a rotina Hanaro processa e publica um novo snapshot a cada duas horas;
- execução manual, autenticação, autorização, e-mail, armazenamento e geração de PPTX serão operações reais e auditadas.

## 2. Perfis e experiências

| Perfil | Autenticação | Experiência principal |
|---|---|---|
| Usuário comum | Não possui login | Dashboard simplificado e Modo TV somente em `QTY SCRAP`, sem exportação ou dados monetários |
| Analista | Login | Dashboard completo, Base de Scrap, justificativas, planos de ação, alertas e construção de relatórios |
| Administrador | Login | Todo o fluxo de negócio, targets, rotina, mapas, e-mails, aprovação e envio de relatórios |
| Developer | Login | Cadastro de pessoas/autoridades, execuções, diagnóstico e logs técnicos amplos; acesso a negócio somente para suporte controlado |

Regra de segurança: a resposta destinada ao Usuário comum não deve conter campos monetários. Esconder US$ apenas com CSS ou com o botão de olho não é suficiente.

## 3. Arquitetura de navegação

### Rotas públicas

| Rota | Tela |
|---|---|
| `#public-dashboard` | Dashboard simplificado da linha |
| `#public-tv` | Modo TV público em unidades |
| `#login` | Entrada de usuários autenticados |

### Rotas autenticadas

| Rota | Tela |
|---|---|
| `#dashboard` | Dashboard analítico completo |
| `#scrap` | Base de Scrap |
| `#scrap/revisar/:id` | Revisão e justificativa individual/em lote |
| `#componentes` | Catálogo de componentes |
| `#acoes` | Planos de ação e melhorias |
| `#alertas` | Alertas e exceções |
| `#relatorios` | Construtor, versões e envios de relatórios |
| `#execucoes` | Rotina GERP/Hanaro e disparo manual |
| `#auditoria` | Auditoria de negócio e técnica conforme perfil |
| `#configuracoes` | Targets, dados, mapas, rotina, e-mails, acesso, integrações e interface |
| `#tv` | Modo TV autenticado |

## 4. Regras centrais de dados e cálculo

### 4.1 Registro normalizado de scrap

Registro representativo derivado da planilha:

| Campo | Tipo | Exemplo | Uso |
|---|---|---|---|
| `scrap_id` | string | `SCR-2025-000001` | Identificador gerado pelo Hanaro |
| `source` | enum | `GERP` | Origem do registro |
| `transaction_date` | date | `2025-01-14` | Data da movimentação |
| `department` | string | `FA` | Área/departamento |
| `product_area` | string | `BM` | Produto/área normalizada |
| `line_code` | string | `BMCELL` | Linha/Receipt Department |
| `station_id` | string/null | `null` | Posto mapeado; pode exigir classificação humana |
| `item_code` | string | `ACQ30524303` | Código do componente |
| `item_description` | string | `Cover Assembly,LED` | Descrição do componente |
| `item_type` | string | `Back cover` | Tipo normalizado |
| `work_order` | string | `5ADR0008` | Ordem de produção |
| `issue_quantity` | decimal | `-1` | Quantidade assinada da origem |
| `qty_scrap` | decimal | `1` | Quantidade normalizada para análise |
| `issue_price_local` | decimal | `196.03085` | Custo unitário de compra em moeda local |
| `issue_amount_local` | decimal | `-196.03` | Valor local da movimentação |
| `exchange_rate` | decimal | `6.0396495747` | Taxa usada na conversão |
| `if_cost_usd` | decimal | `32.4572` | IF Cost normalizado em dólar |
| `movement_kind` | enum | `SCRAP` | `SCRAP`, `AJUSTE` ou `ESTORNO_PENDENTE` |
| `review_status` | enum | `PENDENTE` | Estado da revisão humana |
| `execution_id` | string | `EXE-20250815-0800` | Snapshot/execução que incorporou o dado |

### 4.2 Fórmulas de referência

```text
issue_amount_local ≈ issue_quantity × issue_price_local
amount_usd_source  = issue_amount_local ÷ exchange_rate
if_cost_usd        = -amount_usd_source
qty_scrap          = -issue_quantity
```

Não aplicar `ABS` indiscriminadamente. A planilha usa soma líquida:

```text
scrap_bruto = soma de valores normalizados positivos
ajustes     = soma de valores normalizados negativos
scrap_liquido = scrap_bruto + ajustes
```

Isso reconcilia os totais da planilha: 298.352 unidades e US$ 703.357,66. Com `ABS`, os valores seriam inflados.

### 4.3 Comparações temporais

| Indicador | Fórmula / regra |
|---|---|
| Atingimento da meta | `target ÷ actual × 100`, quando `actual > 0`; acima de 100% é favorável porque menor scrap é melhor |
| Variação MoM | `(mês anterior - mês atual) ÷ mês anterior × 100` |
| Variação YoY | `(mesmo mês anterior - mês atual) ÷ mesmo mês anterior × 100` |
| Variação YTD | Compara somente janeiro até o último mês fechado comum aos dois anos |
| Mês parcial | Mostra resultado provisório e não o usa como mês fechado sem indicação explícita |
| Mês futuro | Target visível; resultado `null`, nunca zero |

Os rótulos `Atingimento`, `MoM`, `YoY` e `YTD` não serão usados como sinônimos.

### 4.4 Análise absoluta × custo relativo

O pedido adicional do responsável gerencial introduz uma segunda lente de análise. Ela complementa, mas não substitui, o IF Cost absoluto.

| Métrica | Pergunta respondida |
|---|---|
| IF Cost absoluto | Onde ocorreu o maior impacto financeiro em US$? |
| IF Cost relativo | Qual linha/produto perdeu mais em relação ao valor material produzido? |
| Scrap Rate quantitativo | Qual parcela do volume produzido virou scrap em unidades? |

Fórmulas propostas:

```text
material_amount_usd = production_qty × standard_material_cost_usd
if_cost_relative_pct = if_cost_usd_net ÷ material_amount_usd × 100
scrap_rate_qty_pct = qty_scrap_net ÷ production_qty × 100
```

O denominador deve usar a mesma janela, linha/produto, moeda e base de custo do numerador. `Material Amount` significa valor material produzido/consumido segundo a fonte homologada; não deve ser chamado de receita ou “riqueza gerada”.

Exemplo ilustrativo do arquivo `solucao_ouro.html`:

| Linha | Produção | Custo material/un. | Material Amount | IF Cost | IF Cost relativo |
|---|---:|---:|---:|---:|---:|
| Linha A | 10.000 | R$ 3.000 | R$ 30.000.000 | R$ 6.000 | 0,02% |
| Linha B | 10.000 | R$ 100 | R$ 1.000.000 | R$ 4.000 | 0,40% |

Nesse cenário, A possui maior impacto absoluto, enquanto B possui taxa relativa 20 vezes maior. As duas conclusões são verdadeiras e devem aparecer lado a lado.

Dependência: a planilha de scrap não contém o volume total produzido nem o Material Amount completo. Essa análise só poderá usar dados reais depois da definição da fonte de produção/custo padrão. Até lá, o protótipo usará uma fixture claramente identificada como ilustrativa.

## 5. Especificação das telas

## Tela 1 — Login

**Rota:** `#login`  
**Perfis:** Developer, Analista e Administrador.

### Conteúdo

- logomarca Hanaro;
- campo de e-mail/usuário;
- campo de senha ou indicação de SSO futuro;
- ação `Entrar`;
- link `Abrir painel da linha`, que navega para o Dashboard público;
- no protótipo, seletor de perfil de demonstração claramente identificado como simulação.

### Estados

- credencial inválida;
- usuário inativo;
- perfil sem permissão para a rota solicitada;
- sessão expirada.

### Registro representativo

| `user_id` | `name` | `email` | `role` | `status` |
|---|---|---|---|---|
| `USR-0042` | `Ana Souza` | `ana.souza@empresa.com` | `ANALISTA` | `ATIVO` |

Não há gráficos nesta tela.

## Tela 2 — Dashboard público da linha

**Rota:** `#public-dashboard`  
**Perfil:** Usuário comum, sem login.  
**Métrica fixa:** `QTY SCRAP`.

### Cabeçalho

- título `Material Scrap — Visão da linha`;
- mês de referência;
- `Atualizado em`, `Próxima atualização` e status do snapshot;
- ação `Abrir Modo TV`;
- nenhum botão de exportação, relatório, Base de Scrap ou troca para US$.

### Seletores

| Seletor | Comportamento |
|---|---|
| Mês | Um mês ou acumulado do ano; padrão: mês atual |
| Produto/área | Lista normalizada; padrão: todos |
| Linha | Uma ou várias linhas permitidas para o painel público |

### KPIs

- `QTY SCRAP líquida` no período;
- `Scrap bruto` em unidades;
- `Ajustes` em unidades, quando existirem;
- variação versus mês anterior;
- volume produzido e Scrap Rate quantitativo, quando a fonte de produção estiver disponível;
- linha mais afetada;
- quantidade de ocorrências.

### Gráficos

| Gráfico | Tipo | O que mostra |
|---|---|---|
| Evolução mensal de quantidade | Colunas verticais | `QTY SCRAP` de cada mês do ano; meses futuros sem barra |
| Pareto de componentes | Colunas + linha acumulada | Componentes que concentram a quantidade e percentual acumulado; Top 10 dinâmico |
| Ranking de linhas | Barras horizontais | Quantidade por linha e posição no período |
| Mapa de risco | Overlay/heatmap espacial | Layout da linha com zonas amarelo/laranja/vermelho e postos mais afetados |
| Eficiência por linha | Barras horizontais | `QTY SCRAP ÷ volume produzido`; não usa valores financeiros no painel público |

### Interações e restrições

- tooltip mostra somente quantidade, participação e posição;
- clique filtra/agrega o painel, mas não abre registros individuais;
- nenhum campo monetário é criado no DOM, estado público ou payload simulado;
- títulos mostram os filtros ativos.

### Registro agregado representativo

| `period` | `line_code` | `item_description` | `qty_scrap_net` | `occurrences` |
|---|---|---|---:|---:|
| `2026-06` | `A05` | `Module` | 124 | 18 |

O IF Cost relativo financeiro não aparece na rota pública por padrão. Mesmo sendo percentual, ele deriva de valores monetários; sua liberação futura exigirá decisão explícita de confidencialidade.

## Tela 3 — Dashboard analítico completo

**Rota:** `#dashboard`  
**Perfis:** Analista e Administrador; Developer somente em suporte controlado.

### Cabeçalho e ações

- título `Dashboard de Material Scrap / IF Cost`;
- visão `Geral | Meu recorte`;
- `Atualizado em`, idade do dado, Execution ID e próxima rotina;
- ação `Solicitar atualização manual`, somente Administrador;
- ações `Exportar dados` e `Criar relatório`, conforme permissão;
- seletor global `US$ | QTY SCRAP`;
- seletor de análise `Impacto absoluto | Eficiência relativa` quando a métrica permitir;
- botão de olho disponível apenas no modo US$.

### Filtros globais

| Filtro | Tipo |
|---|---|
| Ano | Seleção única |
| Período | Mês, acumulado YTD ou intervalo permitido |
| Comparar com | Sem comparação, mês anterior, mesmo mês do ano anterior ou YTD anterior |
| Análise | Impacto absoluto ou eficiência relativa |
| Semana | Seleção única/múltipla, habilitada quando aplicável |
| Produto/área | Multisseleção: AV, BM, Monitor/MNT, TV, VS, SMT, FA/MFG e Injeção/IPI conforme cadastro |
| Linha | Multisseleção normalizada |
| Setor/posto | Multisseleção dependente da linha |
| Componente | Busca e multisseleção por nome/código |
| Modelo | Busca e multisseleção |

`Limpar filtros` volta à visão consolidada, nunca a uma lista previamente reduzida pelo Analista.

### KPIs no modo US$

- IF Cost líquido;
- scrap bruto;
- ajustes/possíveis estornos;
- target do período;
- atingimento da meta;
- variação do comparativo selecionado;
- Material Amount e IF Cost relativo, quando a fonte de produção estiver disponível;
- `QTY SCRAP` complementar e número de ocorrências.

### KPIs no modo QTY SCRAP

- quantidade líquida;
- quantidade bruta;
- ajustes;
- ocorrências;
- variação do comparativo;
- produção total e Scrap Rate quantitativo;
- linha e componente mais afetados.

Target monetário não será desenhado como se fosse target de unidades.

### Gráficos

| Ordem | Gráfico | Tipo | Conteúdo |
|---:|---|---|---|
| 1 | Target × realizado mensal | Linhas com pontos | Doze targets e resultados mensais; fechado/parcial/futuro; em `QTY SCRAP`, mostra apenas quantidade enquanto não existir meta de unidades |
| 2 | Evolução semanal | Colunas verticais | Valor ou quantidade por semana dentro do período; semanas sem ocorrência aparecem com zero somente se já transcorreram |
| 3 | Distribuição por produto/área | Barras horizontais | Participação de todas as categorias normalizadas na métrica ativa |
| 4 | Pareto de componentes | Colunas + linha em eixo secundário | Componentes ordenados, percentual individual, curva acumulada e referência de 80%; nome no eixo e código no tooltip |
| 5 | Top 10 componentes | Barras horizontais | Top dinâmico por US$ ou `QTY SCRAP`; acesso ao catálogo/ocorrências |
| 6 | Ranking de linhas | Barras horizontais com posição/delta | Linha, valor, posição atual e variação contra período comparado |
| 7 | Ranking de modelos | Barras horizontais | Modelos mais afetados pela métrica ativa |
| 8 | Mapa de risco por linha | Overlay/heatmap espacial | Layout versionado, zonas de risco, postos numerados e intensidade no mês |
| 9 | Comparativo contextual | Colunas agrupadas ou slope chart | Atual × referência para mês, YoY ou YTD equivalente |
| 10 | Ranking relativo de linhas | Barras horizontais | `IF Cost líquido ÷ Material Amount` por linha, com denominador e período explícitos; não reutiliza o ranking absoluto |
| 11 | Impacto absoluto × eficiência relativa | Dispersão com bolhas | Eixo X = Material Amount, eixo Y = IF Cost relativo, tamanho = IF Cost absoluto e cor = faixa de desempenho; permite reconhecer linhas caras eficientes e linhas baratas ineficientes |

### Tabela de ocorrências prioritárias

Colunas: data, produto/área, linha, posto, item/código, `QTY SCRAP`, IF Cost, severidade, revisão e ações.

Clique em gráfico, ranking ou mapa abre a Base de Scrap com o contexto preservado.

Regras da análise relativa:

- o ranking absoluto nunca é substituído silenciosamente pelo relativo;
- todo percentual mostra numerador, denominador e período no tooltip;
- verde/amarelo/vermelho depende de target ou faixa configurada, não do exemplo ilustrativo;
- ajustes/estornos aparecem no detalhe para explicar a diferença entre taxa bruta e líquida;
- linha sem Material Amount válido aparece como `Não calculável`, nunca como 0%.

### Registro agregado representativo

| `period` | `metric` | `scope` | `gross` | `adjustments` | `net` | `target` |
|---|---|---|---:|---:|---:|---:|
| `2026-06` | `IF_COST_USD` | `ALL` | 27,415.00 | -2,728.00 | 24,687.00 | 24,920.00 |

Registro de produção necessário para a análise relativa:

| `period` | `line_code` | `production_qty` | `standard_material_cost_usd` | `material_amount_usd` |
|---|---|---:|---:|---:|
| `2026-06` | `A05` | 10,000 | 580.00 | 5,800,000.00 |

## Tela 4 — Base de Scrap

**Rota:** `#scrap`  
**Perfis:** Analista e Administrador.

### Filtros e busca

- texto por ID, código, descrição, ordem e Execution ID;
- data/período;
- produto/área;
- linha, setor e posto;
- Account Alias;
- componente/código;
- tipo de movimento: scrap, ajuste, possível estorno;
- status de processamento;
- status de revisão;
- status de inclusão em relatório.

### Tabela

| Coluna | Observação |
|---|---|
| Seleção | Permite ação em lote |
| Data | Data GERP normalizada |
| Produto/área | Categoria consolidada |
| Linha / posto | Posto pode estar pendente de mapeamento |
| Código / componente | Código e descrição em duas linhas |
| Issue Quantity | Valor assinado da origem, disponível no detalhe |
| QTY SCRAP | Medida oficial de quantidade |
| Issue Price | Visível somente a perfil monetário autorizado |
| Taxa de câmbio | Visível no detalhe |
| IF Cost USD | Respeita olho e permissão |
| Movimento | Scrap, ajuste ou estorno pendente |
| Revisão | Pendente, em revisão ou justificado |
| Ações | Abrir, revisar, ver execução |

### Ações

- selecionar página ou registros individuais;
- `Justificar selecionados`;
- limpar seleção;
- abrir detalhe lateral;
- preservar filtros vindos do Dashboard;
- exportar somente para Analista/Administrador autorizado.

### Registro representativo

Usa o registro `SCR-2025-000001` descrito na seção 4.1. O detalhe mostra também campos brutos da origem para rastreabilidade, sem permitir edição.

Não há gráfico principal nesta tela. Um painel lateral pode mostrar a participação do registro no período, sem substituir a tabela.

## Tela 5 — Revisão e justificativa

**Rota:** `#scrap/revisar/:id`  
**Perfis:** Analista e Administrador.

### Estrutura

1. lista dos scraps selecionados;
2. resumo de quantidade e IF Cost afetados;
3. contexto da ocorrência;
4. formulário de causa e justificativa;
5. plano de ação;
6. evidências e antes/depois;
7. rastreabilidade e inclusão no relatório.

### Campos

| Grupo | Campos |
|---|---|
| Problema | Título, sintoma, descrição, produto/modelo, linha, setor e posto |
| Classificação | Categoria, 4M, risco, recorrência e componente afetado |
| Causa | 5 Porquês, causa raiz e observação do Analista |
| Ações | Imediata, corretiva e preventiva; responsável, departamento, prazo e status |
| Resultado | Baseline, resultado esperado/real, efeito quantitativo e qualitativo |
| Evidências | Fotos, documentos, comentários, referências GERP, antes e depois |
| Relatório | Incluir no relatório, destaque executivo e ordem sugerida |

### Ações da tela

- salvar rascunho;
- aplicar a mesma justificativa aos N registros selecionados;
- criar ou vincular plano de ação;
- concluir revisão;
- enviar para curadoria do relatório;
- registrar cada scrap individualmente na auditoria, mesmo em operação em lote.

### Validações

- causa raiz, categoria, responsável e justificativa são obrigatórios para concluir;
- aplicar em lote exige confirmação com quantidade e total afetado;
- registros incompatíveis são sinalizados, não alterados silenciosamente;
- evidências “antes/depois” são obrigatórias apenas quando o caso for escolhido como estudo de melhoria no PPTX.

### Registro representativo

| Campo | Exemplo |
|---|---|
| `justification_id` | `JUS-2026-0048` |
| `title` | `Módulo danificado no input` |
| `classification_4m` | `MAN`, `METHOD` |
| `root_cause` | `Ausência de limitador e método padronizado de alimentação` |
| `responsible_user_id` | `USR-0042` |
| `status` | `CONCLUIDA` |
| `include_in_report` | `true` |

Não há gráfico; o foco é registro estruturado e evidência.

## Tela 6 — Catálogo de componentes

**Rota:** `#componentes`  
**Perfis:** Analista consulta; Administrador normaliza/edita.

### Conteúdo

- busca por código, descrição ou alias;
- filtros de produto/área, divisão, tipo e status;
- tabela paginada;
- drawer com origem, aliases, alterações e ocorrências relacionadas;
- ação administrativa de consolidar aliases sem apagar o valor original.

### Tabela

Código, descrição normalizada, tipo, produto/área, divisão, quantidade de aliases, última ocorrência e status.

### Registro representativo

| `component_id` | `item_code` | `normalized_name` | `item_type` | `product_area` | `status` |
|---|---|---|---|---|---|
| `CMP-000742` | `ACQ30524303` | `Cover Assembly, LED` | `Back cover` | `BM` | `ATIVO` |

Não há gráfico obrigatório. Um pequeno ranking de ocorrências por alias poderá ser incluído apenas no detalhe.

## Tela 7 — Planos de ação e melhorias

**Rota:** `#acoes`  
**Perfis:** Analista e Administrador.

### Cabeçalho e filtros

- período, área, linha, responsável, categoria 4M, risco, status e atraso;
- ações `Nova ação`, `Exportar lista` e `Adicionar ao relatório`;
- alternância `Lista | Kanban`.

### KPIs

- ações abertas;
- vencidas;
- concluídas no mês;
- ações aguardando validação de eficácia;
- `QTY SCRAP` e IF Cost vinculados às causas tratadas.

### Gráficos

| Gráfico | Tipo | Conteúdo |
|---|---|---|
| Ações por status | Rosca | Planejada, em andamento, bloqueada, concluída e validada |
| Atrasos por área | Barras horizontais | Quantidade de ações vencidas por responsável/área |
| Evolução de conclusão | Linha | Ações concluídas por mês e acumulado anual |

### Lista/Kanban

Cada cartão mostra problema, ação, linha/posto, responsável, prazo, risco, status, evidências e vínculo com scraps/relatório.

### Registro representativo

| `action_id` | `title` | `line_code` | `owner_area` | `due_date` | `status` |
|---|---|---|---|---|---|
| `ACT-2026-001` | `Implantar JIG de reconexão` | `A05` | `MFG` | `2026-03-31` | `VALIDADA` |

## Tela 8 — Alertas

**Rota:** `#alertas`  
**Perfis:** Analista e Administrador; Developer vê apenas alertas técnicos.

### Tipos de alerta

- spike de IF Cost ou `QTY SCRAP`;
- concentração em componente/linha/posto;
- desvio do target;
- ação vencida;
- execução atrasada, parcial ou com falha;
- ausência/qualidade de mapeamento.

### Filtros

Período, severidade, tipo, produto/área, linha, status e canal.

### KPIs e gráfico

- novos, críticos, lidos, arquivados e enviados por e-mail;
- gráfico de colunas `Alertas por dia`, segmentado por severidade.

### Tabela

Data/hora, severidade, tipo, descrição, escopo, impacto permitido ao perfil, status, canal e ação `Ver registros`.

### Registro representativo

| `alert_id` | `type` | `severity` | `line_code` | `status` | `execution_id` |
|---|---|---|---|---|---|
| `ALT-2026-0087` | `CONCENTRACAO_SCRAP` | `ALTA` | `A05` | `NOVO` | `EXE-20260815-0800` |

## Tela 9 — Relatórios

**Rota:** `#relatorios`  
**Perfis:** Analista cria/revisa; Administrador aprova, gera e envia.

### Abas

1. `Construir relatório`;
2. `Preview`;
3. `Versões`;
4. `Envios`.

### Construir relatório

Seletores:

- ano e mês;
- snapshot/Execution ID;
- áreas/produtos;
- comparação: MoM, YoY e YTD;
- template `Rev04 — Monthly Report`;
- idioma;
- seções incluídas;
- justificativas, mapas e ações selecionadas;
- evidências antes/depois;
- principais problemas e melhorias, ordenados pelo Analista.

### Estrutura do PPTX

| Seção | Origem |
|---|---|
| Capa e objetivo | Configuração do ciclo e metadados |
| Task Charter | Baseline, redução planejada, equipe e período |
| Histórico e achievement | Targets e resultados mensais/YTD |
| Análise absoluta × relativa | IF Cost, Material Amount, taxa relativa e ranking justo entre linhas/produtos |
| Pareto e composição | Dados agregados do snapshot |
| Mapa de risco | Layout, postos, risco, causa e responsável |
| 4M | Justificativas concluídas |
| Plano de ação | Ações selecionadas e cronograma |
| Casos de melhoria | Problema, 5 Porquês, causa, antes/depois e efeito |
| Resumo executivo | Principais problemas, melhorias e comparativos |

O número de slides é variável: existe um núcleo obrigatório e slides repetíveis por estudo de caso. A Rev04, com 27 slides, é referência de conteúdo e identidade, não uma obrigação de sempre gerar exatamente 27.

### Preview

- miniaturas por slide;
- avisos de campo/evidência ausente;
- valores calculados bloqueados para edição manual;
- narrativa editável e marcada como conteúdo humano;
- ação `Enviar para aprovação`.

### Versões

Tabela: ID, período, versão, snapshot, autor, aprovador, criado em, número de slides, status e formato.

### Envios

Administrador escolhe somente destinatários ativos do CRUD de e-mails, revisa lista e envia uma versão aprovada.

### Registros representativos

| Entidade | ID | Exemplo de estado |
|---|---|---|
| Relatório | `REP-2026-06-v03` | `APROVADO` |
| Snapshot | `EXE-20260815-0800` | `CONCLUIDO` |
| Envio | `SND-2026-0019` | `ENVIADO` |

No protótipo, `Gerar PPTX` cria uma versão simulada e um registro de auditoria; não produz um arquivo real.

## Tela 10 — Execuções e atualização

**Rota:** `#execucoes`  
**Perfis:** Administrador e Developer; Analista consulta estado/frescor.

### Cabeçalho

- origem `GERP — atualização aproximada a cada 5 min`;
- rotina `Hanaro — processamento a cada 2 h`;
- última execução concluída;
- próxima execução;
- ação `Executar agora`, disponível para Administrador/Developer.

### Comportamento do disparo manual no protótipo

1. confirmação;
2. criação de Execution ID simulado;
3. estados `Agendada → Em andamento → Concluída` ou cenário de falha;
4. atualização de contagens e timestamp;
5. evento de auditoria;
6. aviso explícito de que nenhuma chamada real ao GERP ocorreu.

### KPIs

- execuções do dia;
- última duração;
- registros recebidos/válidos/rejeitados;
- falhas/parciais;
- idade do último snapshot publicado.

### Tabela

Execution ID, origem, gatilho, início, fim, duração, recebidos, válidos, rejeitados, snapshot publicado, status e ator.

### Gráfico

`Falhas por categoria — 30 dias`, em barras horizontais.

### Registro representativo

| `execution_id` | `trigger` | `started_at` | `received` | `valid` | `status` |
|---|---|---|---:|---:|---|
| `EXE-20260815-0800` | `SCHEDULED` | `2026-08-15T08:00:00-04:00` | 10,824 | 10,760 | `CONCLUIDO` |

## Tela 11 — Auditoria

**Rota:** `#auditoria`  
**Perfis:** Developer completa; Administrador negócio/operacional; Analista apenas seu escopo.

### Filtros

Período, ator, perfil, origem, ação, entidade, identificador, severidade e Correlation ID.

### KPIs

- eventos hoje;
- ações humanas;
- eventos automáticos;
- alterações de permissão;
- eventos críticos.

### Tabela

Timestamp, ator, perfil, origem, ação, entidade, identificador, antes, depois, IP/sessão quando aplicável e Correlation ID.

### Registro representativo

| `audit_id` | `actor_id` | `action` | `entity` | `entity_id` | `correlation_id` |
|---|---|---|---|---|---|
| `AUD-2026-00931` | `USR-0042` | `JUSTIFICATIVA_CONCLUIDA` | `SCRAP` | `SCR-2025-000001` | `COR-892104` |

Não há gráfico obrigatório além dos KPIs. Eventos são imutáveis.

## Tela 12 — Configurações

**Rota:** `#configuracoes`  
**Perfis:** abas variam entre Administrador e Developer; Analista possui consultas específicas.

### Aba Negócio — Targets anuais

**Perfis:** Administrador edita; Analista consulta.

- seletor de ano;
- estados `Rascunho`, `Publicado` e `Encerrado`;
- ação `Criar novo ano` e `Copiar ano anterior`;
- baseline e redução anual planejada;
- grade de 12 meses por Total e áreas normalizadas;
- target absoluto em US$ e, somente após homologação, faixa/target opcional de IF Cost relativo;
- histórico de versões e justificativa para alteração após publicação;
- meses futuros mantêm target e resultado vazio.

Registro representativo:

| `target_id` | `year` | `month` | `scope` | `target_usd` | `status` |
|---|---:|---:|---|---:|---|
| `TGT-2026-01-ALL` | 2026 | 1 | `ALL` | 27,091.00 | `PUBLICADO` |

### Aba Dados — Dicionário e normalização

**Perfis:** Administrador edita mapeamentos; Analista consulta.

- fórmulas de IF Cost e `QTY SCRAP`;
- fonte e fórmula de `production_qty`, `Material Amount`, IF Cost relativo e Scrap Rate quantitativo;
- códigos de produto/área;
- normalização de linhas e aliases como `A05`/`a05`;
- regras de vazio/desconhecido;
- tratamento ainda pendente de estorno;
- data e versão de cada regra.

Aba também exibe teste de cobertura do denominador: registros/linhas sem produção ou custo padrão correspondente não podem participar do ranking relativo.

### Aba Rotina

**Perfis:** Administrador.

- frequência Hanaro: a cada duas horas;
- fuso `America/Manaus`;
- horário-base e próxima execução;
- política de concorrência/reprocessamento;
- link para Execuções;
- informação da cadência aproximada do GERP;
- botão de atualização manual.

### Aba Linhas e mapa de risco

**Perfis:** Administrador edita; Analista consulta.

- cadastro de linha e versão do layout;
- upload/referência de imagem ou SVG;
- setores e postos;
- coordenadas dos marcadores;
- faixas de baixo, moderado e crítico;
- responsável padrão;
- vigência para preservar mapas históricos.

Registros representativos:

| Entidade | ID | Exemplo |
|---|---|---|
| Layout | `LAY-A05-v2` | Linha A05, vigente desde 2026-01-01 |
| Posto | `PST-A05-10` | Encaixotadora/LIFT, coordenadas 31% × 48% |

### Aba E-mails

**Perfil:** Administrador; Analista consulta destinatários elegíveis.

- CRUD de nome, e-mail, grupo, escopo, categoria de notificação, consentimento e status;
- busca, filtros e confirmação de inativação;
- exclusão lógica para preservar histórico;
- teste de envio apenas no produto com backend.

Registro representativo:

| `recipient_id` | `name` | `email` | `group` | `consent_status` | `status` |
|---|---|---|---|---|---|
| `REC-0018` | `Coordenação MFG` | `mfg@empresa.com` | `GESTAO` | `ACEITO` | `ATIVO` |

### Aba Acesso

**Perfil:** somente Developer.

- CRUD de pessoas autenticadas;
- perfil Developer, Analista ou Administrador;
- ativação/inativação;
- redefinição/integração de identidade futura;
- alteração de autoridade com motivo obrigatório;
- histórico de acesso e mudança de perfil.

O Usuário comum não é cadastrado, pois utiliza a rota pública sem login.

### Aba Notificações

**Perfil:** Administrador.

- regras de alerta;
- severidade e canal;
- grupos de destinatários;
- frequência/resumo;
- status ativo/pausado.

### Aba Integrações

**Perfis:** Developer completa; Administrador leitura operacional.

- GERP, câmbio, banco, e-mail e gerador de relatório;
- status, última comunicação, latência e falha;
- nenhum segredo ou credencial exposto no protótipo.

### Aba Interface

**Perfis autenticados:** preferência individual.

- tema claro/escuro/sistema;
- idioma PT/EN/KO;
- densidade de tabela;
- preferência de visão/recorte quando permitido.

## Tela 13 — Modo TV

**Rotas:** `#public-tv` e `#tv`  
**Perfis:** público em unidades; autenticados conforme permissão.

### Painéis em rotação

| Painel | Visualização | Tipo |
|---|---|---|
| 1. Visão executiva | `QTY SCRAP`, ocorrências, variação e atualização | KPIs + tendência mensal |
| 2. Ranking mensal de linhas | Mês atual × anterior, posição e movimento | Barras horizontais + indicadores de subida/queda |
| 3. Ranking anual de linhas | YTD atual × YTD anterior | Barras/slope chart |
| 4. Pareto de componentes | Top componentes e acumulado | Colunas + linha acumulada |
| 5. Mapa de risco | Linha/postos mais afetados | Heatmap espacial |
| 6. Ações e melhorias | Concluídas, vencidas e destaque do mês | KPIs + lista curta |
| 7. Eficiência relativa | Ranking de Scrap Rate quantitativo; IF Cost relativo apenas em sessão autorizada | Barras horizontais ou dispersão |

### Controles

- anterior/próximo;
- pausar/continuar;
- rotação automática;
- intervalo 10/15/30/60 segundos;
- tela cheia;
- indicador de posição;
- saída do Modo TV.

### Regras

- rota pública usa somente `QTY SCRAP` e agregados;
- sessão autenticada pode usar US$ somente se autorizada e respeitando o botão de olho;
- rankings oferecem modos mensal e anual;
- melhoria significa redução de scrap, portanto a direção visual deve ser explicada;
- não mostrar nomes individuais de operadores.

## 6. Componentes globais

### Topbar autenticada

- breadcrumb;
- indicador de atualização;
- notificações;
- idioma;
- Modo TV;
- tema;
- perfil e encerramento da sessão.

### Estados obrigatórios em todas as telas de dados

- carregando;
- sem dados para os filtros;
- dado parcial;
- dado desatualizado;
- falha de carregamento;
- sem permissão;
- ação simulada no protótipo;
- sucesso/erro com mensagem específica.

### Acessibilidade

- gráficos possuem resumo textual e tabela alternativa quando necessário;
- risco não depende apenas da cor;
- foco visível e navegação por teclado;
- tooltips acessíveis;
- números exibem unidade e período;
- botão de olho possui estado anunciado por leitor de tela.

## 7. Dicionário resumido de entidades

| Entidade | Chave | Tela consumidora | Campos centrais |
|---|---|---|---|
| `scrap_transaction` | `scrap_id` | Dashboard, Base, Revisão | origem, data, produto, linha, posto, componente, `qty_scrap`, IF Cost, movimento, execução |
| `component` | `component_id` | Catálogo, filtros, Pareto | código, nome normalizado, aliases, tipo, produto/área, status |
| `monthly_target` | `target_id` | Dashboard, Configurações, Relatório | ano, mês, escopo, target, versão, status |
| `production_summary` | `production_summary_id` | Dashboard, Modo TV, Relatório | período, produto/área, linha, produção, custo material padrão, Material Amount, fonte |
| `data_snapshot` | `snapshot_id` | Todas as telas analíticas, Relatório | execução, instante, período máximo, contagens, qualidade |
| `execution` | `execution_id` | Execuções, Auditoria | gatilho, início/fim, contagens, status, ator |
| `justification` | `justification_id` | Revisão, Relatório | problema, 4M, 5 Porquês, causa, responsável, evidências, status |
| `action_plan` | `action_id` | Ações, Relatório | ação, responsável, prazo, status, antes/depois, efetividade |
| `line_layout` | `layout_id` | Heatmap, Configurações | linha, versão, ativo visual, vigência |
| `risk_point` | `risk_point_id` | Heatmap, Relatório | layout, posto, coordenadas, risco, causa, responsável |
| `alert` | `alert_id` | Alertas | tipo, severidade, escopo, registros, status, canal |
| `report` | `report_id` | Relatórios | período, snapshot, template, versão, autor, aprovador, status |
| `report_delivery` | `delivery_id` | Envios | relatório, destinatário, solicitado, status, tentativas |
| `email_recipient` | `recipient_id` | Configurações, Envios | nome, e-mail, grupo, consentimento, status |
| `user` | `user_id` | Login, Acesso, Auditoria | identidade, perfil, status |
| `audit_event` | `audit_id` | Auditoria | ator, ação, entidade, antes/depois, correlação |

## 8. Estrutura técnica recomendada para o protótipo

O arquivo atual `scripts.js` concentra modelo, estado, renderização e eventos. Antes de adicionar o novo escopo, a implementação deve ser modularizada:

```text
src/
  app.js
  router.js
  state.js
  permissions.js
  data/
    fixtures.js
    repository.js
    selectors.js
  domain/
    metrics.js
    comparisons.js
    normalization.js
    report-model.js
  charts/
    chart-factory.js
    dashboard-charts.js
    tv-charts.js
    risk-map.js
  screens/
    login.js
    public-dashboard.js
    dashboard.js
    scrap.js
    review.js
    components.js
    actions.js
    alerts.js
    reports.js
    executions.js
    audit.js
    settings.js
    tv.js
```

Para o protótipo, `repository.js` trabalha sobre fixtures e `localStorage` apenas para preferências e mudanças demonstrativas. Métricas e seletores devem ser funções puras reutilizadas pelo Dashboard, Modo TV e relatório.

## 9. Ordem de implementação

### Fase 1 — Fundação

- modularizar o JavaScript atual;
- criar roteamento público/autenticado;
- implementar os quatro perfis e guards;
- criar fixtures normalizadas e funções de fórmula/sinal;
- criar fixture separada de produção/Material Amount e chave de cruzamento por período, produto/área e linha;
- implementar snapshot e estado global de filtros.

### Fase 2 — Dashboards

- Dashboard público sem dados monetários;
- Dashboard completo com filtros, comparações e métrica global;
- análise absoluta × relativa com validação de denominador;
- transpor os gráficos da planilha;
- implementar Pareto e rankings dinâmicos;
- criar primeiro mapa de risco navegável.

### Fase 3 — Investigação

- Base de Scrap e drill-down;
- revisão individual/em lote;
- catálogo de componentes;
- planos de ação;
- alertas vinculados aos registros.

### Fase 4 — Governança

- targets anuais e histórico;
- rotina de duas horas e disparo manual simulado;
- layouts/postos;
- CRUD de e-mails;
- acesso Developer;
- auditoria ampliada.

### Fase 5 — Relatório e Modo TV

- modelo de dados do PPTX;
- construtor e preview;
- versões, aprovação e envios simulados;
- ranking mensal/anual e mapa no Modo TV.

### Fase 6 — Homologação

- reconciliar um período com a planilha;
- validar um relatório contra a Rev04;
- testar permissões, estados e acessibilidade;
- executar roteiro completo com os quatro perfis.

## 10. Critérios técnicos de aceite prioritários

1. O total assinado das fixtures reconcilia `QTY SCRAP` e IF Cost da fonte.
2. Usuário comum não encontra `US$`, `issue_price`, `exchange_rate` ou `if_cost_usd` no estado/payload público.
3. Todos os gráficos respondem à mesma seleção global e não usam arrays fixos de ranking.
4. Mês futuro permanece sem resultado e mês parcial é identificado.
5. MoM, YoY, YTD e atingimento produzem valores e textos distintos.
6. Clique em gráfico autenticado abre exatamente os registros que formam o agregado.
7. Justificativa em lote gera auditoria para cada scrap.
8. Target publicado só muda com versão e justificativa.
9. Execução manual do protótipo informa que é simulação e não chama serviço externo.
10. Relatório usa snapshot imutável; narrativa humana não altera valores calculados.
11. Somente Developer cadastra pessoas/autoridades.
12. Somente Administrador envia relatório a destinatários ativos.
13. Exportação é impossível para o Usuário comum, inclusive por navegação direta.
14. Modo TV público mostra apenas unidades e não identifica operadores.
15. IF Cost relativo nunca é calculado sem Material Amount válido e compatível com o mesmo período/escopo.
16. Rankings absoluto e relativo permanecem identificados e reconciliáveis; um não substitui o outro.
17. Tooltip da taxa relativa informa IF Cost, Material Amount e fórmula aplicada.
