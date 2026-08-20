# Backlog de execução — revisão do protótipo Hanaro

Status do documento: ativo  
Início da revisão: 19/08/2026  
Escopo: protótipo navegável em HTML, CSS e JavaScript  
Referências: planilha de Controle de Scrap, apresentação Rev04, prints de Dashboard/Pivot/Analysis e documentos de regras do projeto.

## Convenções

- `Concluído`: implementado e verificado no nível indicado.
- `Em andamento`: alteração em execução nesta rodada.
- `Pendente`: escopo conhecido, ainda não iniciado.
- `Bloqueado`: exige definição de negócio ou contrato externo antes de alterar o protótipo.

## Lote 1 — correções objetivas do Dashboard

| ID | Prioridade | Estado | Item | Critério de aceite |
|---|---|---|---|---|
| REV-001 | P0 | Concluído | Corrigir o denominador da curva de Pareto | O acumulado do Top exibido usa o total de todos os Part Numbers do recorte; o último item visível só chega a 100% quando o Top cobre todo o universo. |
| REV-002 | P0 | Concluído | Usar as semanas realmente calculadas | Rótulos e valores do gráfico semanal têm a mesma origem e o mesmo número de posições, sem datas fixas de agosto. |
| REV-003 | P1 | Concluído | Remover anos fixos do comparativo mensal | Legenda e nomes das séries refletem o ano selecionado e seu ano anterior. |
| REV-004 | P0 | Concluído | Diferenciar registro e ocorrência | `Ocorrência` representa um registro válido da ingestão com `occurrence_id`; `Registro` continua sendo usado para linhas, paginação e processamento técnico. |
| REV-005 | P1 | Concluído | Remover condição duplicada em filtros ativos | A função tem uma única saída para ausência de filtros e mantém o comportamento atual. |
| REV-006 | P0 | Bloqueado | Validar Dashboard nos temas e breakpoints do design system | A instância integrada do navegador não está disponível nesta sessão; a validação visual continua obrigatória. |

## Próximos lotes

| ID | Prioridade | Estado | Item | Dependência ou observação |
|---|---|---|---|---|
| REV-010 | P0 | Concluído | Tornar Produto/Área um filtro multisseleção, com todas as áreas incluídas por padrão | O protótipo usa seleção vazia como consolidado geral e propõe parâmetros repetidos para a API. |
| REV-011 | P0 | Concluído | Garantir que BM participe do consolidado geral por padrão | BM permanece no conjunto de áreas e é incluído quando nenhuma área específica é marcada. |
| REV-012 | P0 | Concluído | Criar o Modo TV Fábrica com ranking de linhas por ocorrências | Alternância Executivo/Fábrica, ranking mensal/anual, distribuição por setor e comparação quando houver detalhe anterior. |
| REV-013 | P0 | Suspenso | Separar movimentos de sinal inverso sem classificá-los como estorno | Planilha e PPTX não homologam a categoria `estorno`; preservar o sinal na base e não expor KPI específico até a área definir o significado. |
| REV-014 | P0 | Pendente | Substituir a regra visual `ABS(Issue Quantity)` pela regra homologada de sinais | Atualizar fórmulas, exemplos, configurações e dados simulados sem apagar o sinal de origem. |
| REV-015 | P0 | Pendente | Impedir que a análise relativa simulada pareça um indicador oficial | Manter identificação inequívoca de mock ou ocultar até existir denominador real por período/área/linha. |
| REV-016 | P1 | Pendente | Derivar meses fechado, parcial e futuro dos dados da execução | Depende da regra de fechamento mensal e do instante do snapshot. |
| REV-017 | P1 | Pendente | Evoluir Base de Scrap para o papel de Ocorrências de Scrap | Preservar dados imutáveis da fonte e separar comentário REQ de justificativa humana estruturada. |
| REV-018 | P1 | Pendente | Revisar a posição do Catálogo de Componentes na arquitetura de informação | Avaliar migração para Configurações/Administração sem perder acesso operacional. |
| REV-019 | P1 | Pendente | Completar o relatório PPTX no fluxo do sistema | Dashboard, casos priorizados, causa, evidências, ações, resultado e aprovação versionada. |
| REV-020 | P0 | Concluído | Propor o contrato JSON e o fluxo de fila | Envelope versionado, idempotência, staging, HTTP 202, worker, erros por registro e snapshot documentados. |
| REV-021 | P0 | Concluído | Adicionar multisseleção de Linha e Setor | Seletores compartilham o padrão visual do produto e aceitam múltiplos valores. |
| REV-022 | P0 | Concluído | Identificar cruzamentos dimensionais incompatíveis | Opções sem relação são desabilitadas e consultas vazias exibem estado específico sem inferir valores. |
| REV-023 | P1 | Concluído | Remover kickers vermelhos dos gráficos | Cabeçalhos dos gráficos mantêm apenas o título principal; rótulos como `Composição` e `Ranking` não são mais exibidos. |
| REV-024 | P0 | Concluído | Corrigir mês e semana dos registros simulados | O mock cobre jan–ago/2026 com `year`, `monthIndex`, `weekNumber` e `weekLabel`, permitindo recortes mensais e semanais reais no protótipo. |
| REV-025 | P1 | Pendente | Disponibilizar histórico detalhado anterior por linha | O Modo TV já calcula Atual × Anterior quando houver registros; o endpoint ainda precisa entregar detalhes do mês/ano anterior. |
| REV-026 | P0 | Concluído | Evitar chamada automática à API no protótipo estático | A integração fica desativada por padrão; o mock abre sem requisitar `/dashboard/data` e sem gerar 404. |
| REV-027 | P1 | Concluído | Consolidar os filtros do Dashboard em uma única faixa | Componente e Part Number passaram para a linha principal; o modal `Mais filtros` e a faixa inferior de chips foram removidos. |
| REV-028 | P2 | Concluído | Remover o título redundante do Dashboard | O cabeçalho preserva atualização e ações, sem repetir `Dashboard de Material Scrap / IF Cost`. |
| REV-029 | P1 | Concluído | Remover o mapa de risco do Dashboard | A linha `Mapa de risco por linha e setor` deixou de ser renderizada. |
| REV-030 | P1 | Concluído | Simplificar controles de análise e unidade | Segmentos textuais viraram switches convencionais com o estado atual ao lado; o olho ficou sem texto e o contêiner não possui card visível. |
| REV-031 | P2 | Concluído | Remover os indicadores `!` dos KPIs do Dashboard | Os cards não exibem mais os atalhos de ajuda com exclamação. |
| REV-032 | P1 | Concluído | Diferenciar Componente de Part Number e alinhar o Dashboard original | `Item Type` permanece como Componente; `Item` permanece como Part Number na Base/detalhe. O filtro e o Pareto de Part Number foram retirados do Dashboard. |
| REV-033 | P2 | Concluído | Reordenar os controles de unidade e privacidade | O grupo direito segue a ordem olho, estado atual (`US$` ou `QTY SCRAP`) e toggle no extremo direito. |
| REV-034 | P2 | Concluído | Atualizar as cores dos switches do Dashboard | O estado anteriormente cinza usa a cor primária da marca em cada tema e o estado anteriormente vermelho usa amarelo. |
| REV-035 | P2 | Concluído | Simplificar as ações do cabeçalho do Dashboard | Atualizar, Exportar dados e Criar relatório foram substituídos por um único acesso primário à Base de Scrap. |
| REV-036 | P0 | Concluído | Remover `Ajustes / estornos` sem respaldo explícito | Planilha e PPTX não tratam estorno como categoria ou KPI; o card e o termo `líquido` foram retirados, preservando o sinal original dos registros na base técnica. |
| REV-037 | P2 | Concluído | Remover o acesso à Base de Scrap do cabeçalho | O Dashboard não exibe mais botões de ação no cabeçalho. |
| REV-038 | P2 | Substituído | Alinhar o espaçamento externo do canvas | A margem externa não era o espaçamento indicado na referência; a alteração foi revertida em REV-039. |
| REV-039 | P2 | Concluído | Equalizar o padding superior e lateral da visão | O cabeçalho vazio do Dashboard foi removido, fazendo o painel de filtros iniciar com o mesmo recuo visual lateral e superior. |
| REV-040 | P1 | Concluído | Remover a comparação manual do Dashboard | A referência passou a ser automática: acumulado compara ano anterior; visões mensais comparam mês anterior disponível. |

## Decisões necessárias

### D-001 — identidade da ocorrência — decisão provisória

A aba `Analysis` não exibe um `occurrence_id`. Para o protótipo e a primeira versão, cada registro válido recebido será uma ocorrência. O backend gera uma `occurrence_id` e usa o identificador da origem — ou um fingerprint provisório — para evitar duplicidade. Data, produto, linha, setor, posto, modelo e item permanecem dimensões de consulta.

### D-002 — contrato do filtro de áreas — proposta definida

O protótipo e o adaptador enviam parâmetros repetidos, por exemplo `product=TV&product=BM`. O backend deve aplicar `OR` dentro da dimensão e `AND` entre dimensões. A seleção padrão representa o consolidado geral e inclui BM.

### D-003 — fechamento mensal

Para rotular um mês como fechado ou parcial, falta definir se o sistema usa calendário, aprovação do analista ou status fornecido pelo backend.

### D-004 — movimentos de sinal inverso — classificação não homologada

A planilha preserva sinais positivos e negativos, mas não chama os movimentos inversos de `estorno`, `devolução` ou `ajuste` como categoria de negócio. O PPTX também não apresenta esse indicador. O sistema deve preservar o valor original para auditoria, sem exibir `Ajustes / estornos` nem assumir uma classificação até confirmação da área responsável.

## Registro de validação

| Data | Escopo | Resultado |
|---|---|---|
| 19/08/2026 | Estado inicial de `scripts.js` e `api-dashboard.js` | Sintaxe JavaScript válida antes das alterações. |
| 19/08/2026 | Lote REV-001 a REV-005 | `node --check` aprovado nos dois arquivos JavaScript; `git diff --check` sem erro; busca de padrões obsoletos sem ocorrências. |
| 19/08/2026 | Servidor estático local | `index.html` respondeu HTTP 200 e referenciou `scripts.js` e `styles.css`. |
| 19/08/2026 | Validação visual REV-006 | Bloqueada: nenhuma instância do navegador integrado foi descoberta. Não substituída por inspeção estática. |
| 19/08/2026 | Contrato de ingestão REV-020 | Proposta registrada em `CONTRATO_INGESTAO_JSON_SCRAP.md`; a automação atual foi confirmada como simples concatenação de CSVs. |
| 19/08/2026 | Filtros REV-010, REV-011, REV-021 e REV-022 | Sintaxe JavaScript e integridade do diff aprovadas; carregamento HTTP aprovado. Validação visual continua pendente pela indisponibilidade do navegador integrado. |
| 19/08/2026 | Dashboard e TV REV-012, REV-023 e REV-024 | Modo Fábrica e remoção dos kickers implementados; sintaxe e integridade estática aprovadas. Comparação anterior depende de REV-025. |
| 19/08/2026 | Execução estática REV-026 | A chamada à API passou a exigir configuração explícita; sem backend, a interface informa `Dados simulados` e não realiza requisição de rede. |
| 19/08/2026 | Filtros do Dashboard REV-027 | Os oito seletores ficam na faixa principal em telas largas e quebram responsivamente apenas quando o espaço não comporta leitura segura. |
| 19/08/2026 | Classificação de sinais REV-036 | Busca textual no XLSM encontrou `ajuste` somente em comentários livres de processo; não encontrou categoria `estorno/reversal`. O PPTX não contém esses termos. |
| 19/08/2026 | Comparação automática REV-040 | O filtro manual `Comparar com` foi removido. Acumulado compara o mesmo acumulado do ano anterior; mês compara o mês imediatamente anterior disponível. |

## Itens adicionados na revisão de cobertura

| ID | Prioridade | Status | Item | Critério de aceite |
|---|---:|---|---|---|
| REV-041 | P0 | Concluído | Adicionar semanas W1–W53 ao Dashboard | O filtro de Semana aceita múltipla seleção e a evolução semanal usa rótulos `Wn`. |
| REV-042 | P0 | Concluído | Permitir qualquer mês disponível | `Período` oferece o acumulado ou cada mês que possui dado no ano escolhido. |
| REV-043 | P0 | Concluído | Catálogo configurável de linhas | Configurações > Linhas permite cadastrar código novo e mantém a lista no navegador do protótipo. |
| REV-044 | P1 | Pendente | Homologar o campo `week_number` no JSON | Backend deve fornecer semana ISO de 1 a 53; o front aceita também `week_label` como contingência. |
| REV-045 | P1 | Pendente | Confirmar semântica de Linha | Validar se `Receipt Department` deve continuar sendo exibido como Linha na visão de negócio. |
| REV-046 | P0 | Concluído | Cobrir os rankings Top 5/Top 10 da referência | Dashboard passou a ter Top 5 ofensores com participação e rankings Top 10 de componentes, linhas e modelos, alternados por US$/QTY. |
| REV-047 | P0 | Concluído | Corrigir dimensão Setor no Dashboard | O seletor passou a usar Divisão (BM, HE e MNT), que é a dimensão confirmada na planilha; Setor físico continua restrito às telas operacionais enquanto for mock. |
| REV-048 | P1 | Concluído | Consolidar a faixa de filtros | Os sete seletores ocupam uma linha larga; “Limpar seleção” fica abaixo, alinhado à direita, sem fundo ou borda. |
| REV-049 | P1 | Concluído | Distribuir melhor a massa simulada | Produtos, componentes e modelos passaram a alternar por ciclos coprimos; a divisão por produto e os rankings Top 10 deixam de exibir uma única categoria no estado inicial. |
| REV-050 | P1 | Concluído | Padronizar filtros e switches das telas operacionais | Base de Scrap, Componentes e Planos de ação usam o painel, a linha responsiva de seletores e o link “Limpar seleção” do Dashboard; Base e Planos usam o mesmo controle olho + unidade + switch, e Lista/Kanban também usa switch. |
| REV-051 | P0 | Concluído | Reorganizar filtros, seleção e registros da Base de Scrap | Filtros principais usam período, produto, divisão, linha, componente, modelo e revisão; ranking usa componente; Part Number permanece como identificador detalhado; checklist fica na primeira coluna e a seleção em lote aparece abaixo do ranking. |
| REV-052 | P0 | Concluído | Redesenhar a revisão em lote | A tela identifica o registro-modelo, permite filtrar os selecionados, apresenta o escopo do lote antes do formulário e organiza o preenchimento em quatro etapas. A cópia preserva dados do scrap, evidências, ordem e curadoria individuais. |

## Validação do lote REV-050

| Data | Escopo | Resultado |
|---|---|---|
| 19/08/2026 | Filtros e switches de Base, Componentes e Planos de ação | `node --check` aprovado em `scripts.js` e `api-dashboard.js`; `git diff --check` sem erros. Validação visual continua pendente porque não há navegador conectado nesta sessão. |
| 19/08/2026 | Base de Scrap REV-051 | Filtro mensal corrigido, dimensão Movimento retirada da visão principal, tabela alinhada à aba Analysis e ao fluxo de revisão; sintaxe e integridade do diff aprovadas. |
| 19/08/2026 | Revisão em lote REV-052 | Navegação por etapas, filtro da seleção e aplicação do modelo implementados; validação de campos retorna à etapa correspondente. Sintaxe e integridade do diff aprovadas. |
