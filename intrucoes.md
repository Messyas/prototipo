Você vai implementar um **protótipo navegável e interativo do sistema Hanaro — Material Scrap / IF Cost**, utilizando exclusivamente **HTML, CSS e JavaScript**.

O objetivo NÃO é criar ou redefinir o design visual do produto. Já existe uma base de estilização e um Design System implementado no projeto.

Sua responsabilidade é construir:

- conteúdo das telas;
- estrutura dos componentes;
- navegação;
- gráficos;
- tabelas;
- filtros;
- drawers;
- modais;
- formulários;
- estados;
- interações simuladas;
- dados mockados coerentes entre todas as telas.

O resultado deve permitir apresentar o sistema como se fosse um produto funcional, simulando os principais fluxos de uso sem backend real.

# 1. REGRA PRINCIPAL: NÃO REDESENHE O SISTEMA

Antes de implementar qualquer coisa:

1. Analise os arquivos HTML, CSS e JavaScript existentes.
2. Identifique a sidebar, layout, classes, componentes e padrões visuais já existentes.
3. Reutilize o máximo possível.
4. Não substitua o CSS existente por outro framework ou novo Design System.
5. Não crie uma identidade visual alternativa.
6. Não altere a estrutura visual da sidebar existente.

A sidebar existente deve ser reaproveitada.

A sidebar deve permanecer:

- na mesma posição;
- com a mesma largura;
- com o mesmo logo;
- com o mesmo comportamento;
- com a mesma estrutura;
- com a mesma cor do background geral.

Não adicione:

- borda na sidebar;
- sombra na sidebar;
- glow;
- halo;
- sombra vermelha;
- efeito esfumaçado vermelho;
- linha vermelha decorativa.

Use o vermelho apenas nos componentes previstos pelo Design System existente.

Não adicione subtítulos abaixo dos títulos das páginas.

Exemplo correto:

Dashboard de Scrap

Exemplo incorreto:

Dashboard de Scrap
Acompanhamento consolidado dos indicadores de desperdício industrial.

# 2. TECNOLOGIA

Implemente usando:

- HTML semântico;
- CSS existente do projeto;
- JavaScript vanilla;
- sem backend;
- sem banco de dados;
- sem Angular;
- sem React;
- sem Vue.

O objetivo atual é somente um protótipo navegável.

Se o projeto já possuir alguma biblioteca de gráficos, reutilize-a.

Se NÃO existir biblioteca de gráficos, utilize Chart.js via CDN.

Não introduza dependências desnecessárias.

# 3. ARQUITETURA DO PROTÓTIPO

Organize o código de forma que seja fácil posteriormente migrar os conceitos para Angular.

Preferencialmente organize em:

index.html
styles/
scripts/
app.js
mock-data.js
charts.js
components.js

Caso a estrutura atual já seja diferente, preserve a estrutura existente e adapte-se a ela.

Centralize todos os dados fictícios em um único objeto ou arquivo JavaScript.

Não espalhe números mockados em dezenas de trechos diferentes do HTML.

Exemplo conceitual:

const mockData = {
transactions: [],
alerts: [],
executions: [],
causeAnalyses: [],
reports: [],
auditEvents: []
};

As diferentes telas devem consultar os mesmos dados para manter consistência.

# 4. NAVEGAÇÃO

Transforme a sidebar existente em navegação funcional entre:

1. Dashboard
2. Base de Scrap
3. Alertas
4. Análise de Causa
5. Relatórios
6. Execuções
7. Auditoria
8. Configurações

Não recarregue a página inteira ao trocar de seção.

Implemente comportamento semelhante a uma SPA simples utilizando JavaScript:

- esconder conteúdo anterior;
- renderizar conteúdo correspondente;
- atualizar item ativo da sidebar;
- preservar os dados mockados;
- permitir navegação entre entidades relacionadas.

Exemplo:

Ao clicar em um alerta e depois em "Abrir transações", navegar para Base de Scrap já filtrando as transações relacionadas.

Ao clicar em "Abrir análise de causa", navegar diretamente para o caso correspondente.

# 5. CONTEXTO FUNCIONAL

O Hanaro será usado para acompanhar **Material Scrap / IF Cost** de linhas de produção.

IF Cost representa o impacto financeiro das perdas internas relacionadas a Material Scrap.

Trabalhe principalmente com valores em US$.

O sistema deve representar:

- acompanhamento diário;
- acompanhamento semanal;
- acompanhamento mensal;
- acumulado anual;
- comparação Year-over-Year;
- comparação 2026 versus 2025;
- meta de redução de 15%;
- análise por divisão;
- departamento;
- linha;
- família de produto;
- produto;
- componente;
- Part Number;
- módulo;
- fornecedor.

Famílias principais:

- TV
- Monitor
- Áudio
- IVS

Módulos prioritários:

1. Tela + Front
2. Box
3. PCB

Ferramentas de análise:

- Pareto;
- análise 4M:
  - Machine
  - Method
  - Material
  - Man

Também deve existir classificação preliminar da origem da falha:

- Processo interno / Linha
- Fornecedor
- Ainda não definida

# 6. DADOS MOCKADOS

Crie dados fictícios suficientes para que todas as telas pareçam realmente utilizadas.

Todos os dados devem ser claramente fictícios e usados somente para prototipação.

Crie aproximadamente:

- 80 a 120 transações de scrap;
- 15 a 25 alertas;
- 15 execuções;
- 10 análises de causa;
- 8 relatórios;
- 50 eventos de auditoria.

Não precisa escrever manualmente centenas de objetos.

Você pode gerar os registros programaticamente a partir de datasets base.

Os dados devem ser coerentes entre as telas.

Por exemplo:

Uma transação:

Transaction ID:
TX-20260811-82194

Data:
11/08/2026

Division:
HE

Department:
Final Assembly A

Line:
Line 04

Family:
TV

Product:
OLED65C4

Part Number:
EAJ65714501

Module:
Tela + Front

Account Alias:
D-COMMON

QTY:
14

Periodic Cost:
2845.70

Local Amount:
39839.80

Exchange Rate:
5.18

IF Cost:
US$ 7.691,08

Source:
GERP

Execution ID:
EXE-20260811-0042

Status:
Validado

Use outros exemplos como:

Products:

- OLED65C4
- OLED55C4
- 32UN650
- 27UP650
- MyLink IVS
- XBOOM RN9

Part Numbers:

- EAJ65714501
- EBR85875402
- EAY65769201
- EBR89032104
- EAJ66284201

Departments:

- Final Assembly A
- Final Assembly B
- SMT
- IPI

Lines:

- Line 02
- Line 04
- Line 05
- Line 07

Account Alias examples:

- D-COMMON
- D-DIRECT
- D-RW-REQ
- P-REWORK
- E-Q-SCRAP
- Z-Q-RMA-ADJ

Esses códigos devem aparecer como dados de protótipo e não como regras corporativas definitivamente homologadas.

# 7. TELA DASHBOARD

Crie a página:

Dashboard de Scrap

Não adicione subtítulo.

## Cabeçalho

Dentro da área principal coloque:

- título;
- Atualizar;
- Exportar Excel;
- Gerar relatório.

Os botões devem realmente executar ações simuladas.

Atualizar:

- mostrar loading por aproximadamente 600ms;
- atualizar horário da última atualização;
- mostrar toast "Dados atualizados".

Exportar Excel:

- simular exportação;
- pode gerar CSV local ou apenas mostrar feedback visual.

Gerar relatório:

- navegar para Relatórios > Gerar relatório.

## Filtros

Implemente filtros funcionais:

- período;
- visão:
  - Diário
  - Semanal
  - Mensal
  - Acumulado

- Division;
- Department;
- Linha;
- Família;
- Módulo;
- Produto;
- Componente.

Inclua:

Limpar filtros

Quando um filtro mudar, atualize:

- KPIs;
- gráficos;
- tabela.

Não precisa implementar lógica estatística perfeita, mas deve haver comportamento perceptível e consistente.

## KPIs

Mostre:

IF Cost acumulado
US$ 184.260

Mesmo período 2025
US$ 212.300

Redução YoY
-13,2%

Gap para meta
1,8 p.p.

Scrap registrado
1.247 un.

Inclua variações e pequenos indicadores auxiliares.

## Gráfico 1

Crie gráfico de linha:

Evolução diária do IF Cost

Séries:

- 2026;
- 2025;
- target/meta.

Utilize 12 a 20 dias fictícios.

Tooltip deve apresentar:

Data
2026
2025
Diferença

## Gráfico 2

Crie ranking horizontal:

Top 3 ofensores — IF Cost

Exemplo:

Tela + Front
US$ 72.400
39,3%

Box
US$ 41.800
22,7%

PCB
US$ 28.600
15,5%

## Gráfico 3

Crie Pareto:

Pareto de componentes

Exemplo:

EAJ65714501 — US$ 38,4k
EBR85875402 — US$ 27,6k
EAY65769201 — US$ 19,1k
Módulo Box — US$ 14,8k
PCB Main — US$ 10,7k

Use barras para valores e, se a biblioteca permitir sem tornar o gráfico confuso, linha acumulada percentual.

## Gráfico 4

IF Cost por departamento

Barras horizontais:

Final Assembly A — US$ 62,1k
Final Assembly B — US$ 48,5k
SMT — US$ 32,7k
IPI — US$ 19,4k

## Tabela

Título:

Ocorrências que exigem atenção

Colunas:

- Data
- Departamento
- Linha
- Família
- Produto
- Componente
- QTY
- IF Cost
- Variação
- Status

Permita clicar em uma ocorrência.

Ao clicar:

- abrir detalhes;
  ou
- navegar para análise correspondente.

# 8. TELA BASE DE SCRAP

Crie:

Base de Scrap

Não adicione subtítulo.

Esta deve ser uma tela TABLE-FIRST.

## Cabeçalho

Ações:

- Upload manual
- Exportar CSV
- Exportar Excel

## Indicadores

- Registros
- QTY total
- IF Cost
- Rejeitados
- Pendentes

## Busca

Campo:

Buscar Part Number, produto ou ID...

A busca deve funcionar em tempo real.

## Filtros

- data;
- Division;
- Department;
- Linha;
- Família;
- Produto;
- Part Number;
- Account Alias;
- Módulo;
- fornecedor;
- origem;
- status;
- Execution ID.

## Tabela

Colunas:

- Transaction Date
- Division
- Department
- Line
- Product
- PART_NO
- ACCOUNT_ALIAS_CODE
- QTY
- ENDING_PERIODIC_COST
- Local Amount
- Exchange Rate
- IF Cost USD
- Source
- Execution ID
- Status

Implemente:

- ordenação;
- paginação;
- 10 / 25 / 50 registros;
- seleção de linha;
- hover;
- filtros;
- busca.

## Drawer de detalhe

Ao clicar em uma transação, abra drawer lateral.

Mostre:

Dados originais

Dados normalizados

Financeiro:

- Periodic Cost
- Local Amount
- Exchange Rate
- IF Cost USD

Rastreabilidade:

- Source
- Batch
- Execution ID
- horário de processamento

Status

Histórico

Inclua botões:

- Abrir execução
- Abrir análise relacionada

Esses botões devem navegar para as telas correspondentes.

## Upload manual

Ao clicar em Upload manual:

abra modal.

Campos:

Arquivo:

- TXT
- CSV
- XLSX

Período

Origem

Observação opcional

Botões:

Cancelar
Validar arquivo

Após clicar "Validar arquivo":

simule processamento e mostre:

Arquivo:
scrap_20260812.xlsx

Registros:
827

Válidos:
824

Rejeitados:
3

Depois disponibilize:

Confirmar importação

Ao confirmar:

- adicionar execução fictícia;
- atualizar Base de Scrap;
- mostrar toast.

# 9. TELA ALERTAS

Crie:

Alertas e Anomalias

Não adicione subtítulo.

## KPIs

Críticos
6

Altos
14

Em análise
9

Pendentes +24h
4

## Filtros

- período;
- severidade;
- tipo;
- departamento;
- linha;
- módulo;
- status;
- responsável.

## Tabela

Colunas:

- Severidade
- Data/Hora
- Tipo
- Departamento
- Linha
- Entidade
- Impacto
- Descrição
- Status
- Responsável

Tipos de alerta:

- Spike de IF Cost
- Concentração de Scrap
- Falha de ingestão
- Câmbio pendente
- Aumento YoY
- Alto volume de QTY

Exemplo:

Crítico
12/08 08:42
Spike de IF Cost
Final Assembly A
Line 04
Tela + Front
US$ 8.420
IF Cost 42% acima da média móvel
Novo

## Gráficos

Alertas por dia

Use barras.

Áreas com maior impacto

Use barras horizontais.

## Drawer

Clique no alerta abre detalhes.

Mostre:

- severidade;
- condição detectada;
- métricas;
- transações relacionadas;
- período;
- responsável;
- status;
- histórico.

Ações:

- Marcar em análise
- Marcar revisado
- Abrir transações
- Abrir análise de causa

Alterar status deve atualizar o dado em memória.

# 10. TELA ANÁLISE DE CAUSA

Crie:

Análise de Causa

Não adicione subtítulo.

Divida a tela em:

- lista de casos;
- detalhe do caso.

## Lista

Exemplo:

CAS-2026-0812-014
Tela + Front
Line 04
US$ 8.420
Crítico
Em análise

CAS-2026-0812-011
PCB
Line 02
US$ 4.180
Alto
Pendente

CAS-2026-0811-008
Box
Line 05
US$ 3.260
Médio
Concluído

Permita:

- pesquisar;
- filtrar;
- selecionar.

## Detalhe

Mostre:

ID
Módulo
Linha
IF Cost
QTY
Variação

Dados relacionados:

- Product
- Part Number
- Department
- Line
- Data
- Source
- Transactions

Inclua mini gráfico:

Histórico de IF Cost — últimos 14 dias

## 4M

Crie seleção para:

Machine
Method
Material
Man

Permita múltipla seleção.

## Origem

Radio:

Processo interno / Linha

Fornecedor

Ainda não definida

## Sintoma

Dropdown:

- Dano visual
- Quebra
- Falha elétrica
- Montagem incorreta
- Componente fora de especificação
- Outro

## Análise

Textarea.

## Ações

Campos:

Ação corretiva

Ação preventiva

Responsável

Prazo

Status

## Evidências

Permita simular inclusão de:

- Foto
- Documento
- Transação GERP
- Relatório
- Comentário

Não precisa fazer upload real.

Crie interação para adicionar uma evidência fictícia.

## Workflow

Estados:

- Pendente
- Em análise
- Concluído
- Reaberto

Botões:

Salvar rascunho

Adicionar evidência

Concluir análise

Ao concluir:

- atualizar status;
- registrar evento na Auditoria;
- mostrar toast.

## Gráfico

Distribuição das análises por 4M

Use barras horizontais.

Não use donut.

# 11. TELA RELATÓRIOS

Crie:

Relatórios

Não adicione subtítulo.

Use três abas internas:

- Gerar relatório
- Versões
- Envios

## Gerar relatório

Tipo:

- Diário
- Semanal
- Mensal

Período.

Filtros:

- Division
- Department
- Linha
- Família
- Produto
- Módulo
- Categoria

Comparação:

- Sem comparação
- Mesmo período 2025
- Acumulado 2026 vs 2025

Opções:

- Incluir Top 3
- Incluir alertas críticos
- Incluir análises concluídas

## Preview

Atualize o preview conforme os filtros.

Inclua:

IF Cost

US$ 47.820

2025

US$ 56.340

Variação

-15,1%

Top 3

Tela + Front
US$ 18,7k

Box
US$ 11,4k

PCB
US$ 7,9k

Inclua:

- mini gráfico temporal;
- Pareto;
- principais ocorrências.

Botões:

Gerar PDF

Gerar Excel

Gerar e registrar versão

Não é necessário produzir PDF real.

"Gerar e registrar versão" deve:

1. criar uma nova versão em memória;
2. adicioná-la à tabela Versões;
3. registrar evento na Auditoria;
4. mostrar toast;
5. navegar para aba Versões.

## Versões

Tabela:

- Versão
- Tipo
- Período
- Gerado em
- Gerado por
- IF Cost
- Formato
- Status

Exemplo:

v1.3
Semanal
03–09 Ago
10/08 08:54
M. França
US$ 47.820
PDF
Publicado

Clique abre drawer.

## Envios

Tabela:

- Relatório
- Destinatário
- Canal
- Solicitado em
- Status
- Tentativas

Estados:

- Pendente
- Aceito
- Enviado
- Falha

Permita:

Reenviar

Simule:
loading → sucesso/falha.

# 12. TELA EXECUÇÕES

Crie:

Execuções

Não adicione subtítulo.

## KPIs

Execuções hoje
12

Concluídas
10

Parciais
1

Falhas
1

Registros processados
8.426

## Filtros

- período;
- status;
- origem;
- tipo;
- Execution ID.

## Tabela

Colunas:

- Execution ID
- Origem
- Processo
- Início
- Fim
- Duração
- Recebidos
- Válidos
- Rejeitados
- Status

Exemplo:

EXE-20260812-0046
GERP
Other Account Transaction Text Download
12/08 05:00
12/08 05:08
08m12s
1.248
1.241
7
Parcial

Outro:

EXE-20260811-0042
GERP
Other Account Transaction Text Download
11/08 05:00
11/08 05:06
06m31s
1.106
1.106
0
Concluído

## Drawer

Timeline:

1. Request iniciado
2. Arquivo localizado
3. Arquivo recebido
4. Validação estrutural
5. Normalização
6. Conversão
7. Persistência
8. Processamento concluído

Para execução parcial, marque a etapa com falha.

## Exceções

Tabela:

- Tipo
- Registro
- Motivo
- Etapa
- Status
- Ação

Exemplos:

Arquivo inválido
file_0046.txt
Coluna obrigatória ausente
Validação
Pendente

Câmbio indisponível
TX-82194
Taxa não localizada
Conversão
Pendente

Duplicidade
TX-82171
Registro já processado
Persistência
Ignorado

## Reprocessamento

Permita selecionar execução problemática e clicar:

Reprocessar

Simule:

Pendente → Processando → Concluído

ou ocasionalmente:

Pendente → Processando → Falha

Atualize:

- tabela;
- timeline;
- auditoria;
- toast.

## Gráfico

Falhas por categoria — últimos 30 dias

Use barras horizontais.

# 13. TELA AUDITORIA

Crie:

Auditoria

Não adicione subtítulo.

Esta tela deve ser TABLE-FIRST.

## Indicadores

Eventos hoje
284

Ações humanas
73

Eventos automáticos
211

Eventos críticos
3

## Filtros

- período;
- ator;
- tipo;
- entidade;
- Execution ID;
- Report ID;
- severidade.

## Busca

Buscar ID, usuário, entidade ou descrição...

## Tabela

Colunas:

- Timestamp
- Ator
- Origem
- Ação
- Entidade
- Identificador
- Estado anterior
- Estado posterior
- Correlation ID

Exemplo:

12/08/2026 09:14:22
m.franca
Web
Concluiu análise
Cause Analysis
CAS-2026-0812-014
Em análise
Concluído
COR-921842

Outro:

12/08/2026 08:51:07
hanaro-backend
API
Persistiu lote
Execution
EXE-20260812-0046
Validando
Parcial
COR-921711

Eventos produzidos pelas interações do protótipo devem ser adicionados dinamicamente nesta tabela.

Exemplo:

Ao gerar um relatório:
novo evento.

Ao concluir análise:
novo evento.

Ao reprocessar execução:
novo evento.

Ao alterar configuração:
novo evento.

## Drawer

Mostre todos os detalhes do evento.

Não permita excluir eventos.

# 14. TELA CONFIGURAÇÕES

Crie:

Configurações

Não adicione subtítulo.

Abas:

- Negócio
- Dados
- Relatórios
- Notificações
- Acesso
- Integrações

## Negócio

Meta de redução:

Baseline:
2025

Meta:
-15%

Ano:
2026

Escopo:

- TV
- Monitor
- Áudio
- IVS

Módulos prioritários:

1. Tela + Front
2. Box
3. PCB

## Dados

Mostrar Alias Codes:

- D-COMMON
- D-DIRECT
- D-RW-REQ
- P-REWORK
- E-Q-SCRAP
- Z-Q-RMA-ADJ

Mostrar indicação visual:

"Valores sujeitos à homologação."

Upload contingencial:

Habilitado

Tipos:
TXT
CSV
XLSX

Validação obrigatória:
Ativa

## Relatórios

Frequência padrão:
Semanal

Visão:
Acumulado

Comparação:
YoY

Formato:
PDF

Incluir Top 3:
Sim

Incluir alertas:
Sim

## Notificações

Tabela:

- Nome
- Grupo
- E-mail
- Tipo
- Status

Use endereços fictícios.

## Acesso

Perfis:

- Administrador
- Gestor
- Analista
- Operação
- Consulta

Tabela:

- Usuário
- Perfil
- Escopo
- Status

## Integrações

Somente status.

GERP
Configurado
Última execução: 12/08 05:00

Cotação
Operacional
Última atualização: 12/08 00:05

Banco
Operacional

Relatórios
Operacional

Não mostrar:

- senha;
- token;
- API key;
- connection string.

## Salvar alterações

Ao alterar uma configuração e salvar:

1. atualizar valor em memória;
2. adicionar evento à auditoria;
3. mostrar toast;
4. preservar a alteração ao navegar entre telas durante a sessão.

# 15. COMPONENTES REUTILIZÁVEIS

Crie funções JavaScript reutilizáveis para componentes como:

renderKpiCard()

renderTable()

renderStatusBadge()

renderFilters()

openDrawer()

closeDrawer()

openModal()

closeModal()

showToast()

renderEmptyState()

renderLoadingState()

formatCurrency()

formatPercentage()

navigateTo()

Não é obrigatório usar exatamente esses nomes, mas evite duplicação de implementação.

# 16. ESTADOS DA INTERFACE

Simule os seguintes estados quando apropriado:

- carregando;
- vazio;
- sucesso;
- atenção;
- erro;
- parcialmente processado;
- sem permissão;
- execução pendente;
- falha de ingestão;
- câmbio pendente;
- relatório gerado;
- envio pendente;
- envio concluído;
- falha de envio.

Crie pelo menos um mecanismo simples para demonstrar esses estados.

Por exemplo:

um botão "Simular estado" somente durante desenvolvimento pode alternar determinados casos.

Se isso poluir a interface final, coloque-o atrás de:

const DEV_MODE = true;

# 17. FEEDBACK DE INTERAÇÃO

Todas as ações importantes devem fornecer feedback.

Use:

- loading;
- toast;
- badge;
- alteração de estado;
- modal;
- drawer.

Evite alert() do navegador.

Não utilize confirm() nativo.

Crie componentes próprios usando o Design System existente.

# 18. RESPONSIVIDADE

Priorize desktop em:

1366 × 768
1440 × 900
1920 × 1080

O protótipo deve continuar utilizável em viewport menor.

Não é necessário criar experiência mobile completa nesta etapa.

# 19. GRÁFICOS

Use gráficos somente onde agregam informação.

Utilize:

Dashboard:

- linha temporal;
- Pareto;
- ranking horizontal;
- comparação por departamento.

Alertas:

- alertas por período;
- impacto por área.

Análise de Causa:

- evolução temporal;
- distribuição 4M em barras.

Relatórios:

- linha;
- Pareto.

Execuções:

- falhas por categoria.

Auditoria:
não precisa de gráfico.

Configurações:
não usar gráficos.

Evite:

- pie;
- donut;
- gauge;
- 3D;
- gráficos puramente decorativos.

# 20. CONSISTÊNCIA ENTRE TELAS

Esse é um requisito obrigatório.

Os mesmos dados devem aparecer corretamente em diferentes módulos.

Exemplo:

Se:
TX-20260811-82194

possui:
IF Cost US$ 7.691

e está relacionada a:
CAS-2026-0812-014

e:
EXE-20260811-0042

então:

Base de Scrap deve mostrar a transação.

Análise de Causa deve relacionar a mesma transação.

Execuções deve mostrar EXE-20260811-0042.

Auditoria pode relacionar os IDs.

Alertas podem apontar para aquela ocorrência.

Evite criar universos de dados desconectados entre telas.

# 21. FLUXOS QUE DEVEM SER DEMONSTRÁVEIS

O protótipo final deve permitir apresentar pelo menos estes fluxos:

## Fluxo A — investigar um problema

Dashboard
→ clicar ocorrência crítica
→ Alertas ou Análise de Causa
→ abrir transações relacionadas
→ Base de Scrap
→ voltar à análise
→ preencher 4M
→ concluir análise
→ Auditoria registra a ação.

## Fluxo B — investigar uma falha técnica

Execuções
→ abrir execução parcial
→ visualizar exceção
→ reprocessar
→ execução muda de estado
→ Auditoria registra a ação.

## Fluxo C — gerar reporte semanal

Dashboard
→ Gerar relatório
→ Relatórios
→ escolher Semanal
→ selecionar período
→ comparar com 2025
→ visualizar preview
→ gerar versão
→ versão aparece em Versões
→ simular envio
→ consultar resultado em Envios
→ Auditoria registra geração e envio.

## Fluxo D — contingência

Base de Scrap
→ Upload manual
→ selecionar arquivo fictício
→ validar
→ mostrar registros válidos/rejeitados
→ confirmar importação
→ nova execução aparece em Execuções
→ dados aparecem na Base de Scrap
→ Auditoria registra importação.

# 22. NÃO IMPLEMENTE NESTA ETAPA

Não implemente:

- autenticação real;
- backend;
- banco de dados real;
- FastAPI;
- integração real com GERP;
- scraping;
- upload real para servidor;
- serviço real de câmbio;
- envio real de e-mail;
- envio real de WhatsApp;
- geração complexa de PDF;
- RBAC real;
- persistência externa.

Simule tudo em memória.

Se for simples, utilize localStorage para preservar alterações durante refresh.

# 23. NÃO INVENTE FUNCIONALIDADES FORA DO ESCOPO

Não adicione módulos aleatórios como:

- estoque;
- compras;
- vendas;
- produtividade geral;
- eficiência OEE;
- RH;
- financeiro genérico;
- manutenção preventiva;
- CRM.

O protótipo deve permanecer focado em:

Material Scrap
IF Cost
análise
relatórios
rastreabilidade
automação.

# 24. CRITÉRIO DE CONCLUSÃO

Considere o trabalho concluído quando:

- todas as oito telas estiverem navegáveis;
- a sidebar existente estiver sendo reutilizada;
- os filtros principais funcionarem;
- gráficos forem renderizados;
- tabelas tiverem dados coerentes;
- drawers abrirem e fecharem;
- modais funcionarem;
- busca funcionar;
- paginação funcionar;
- status puderem ser alterados;
- geração de relatório for simulada;
- envio for simulado;
- análise 4M puder ser preenchida;
- upload manual puder ser simulado;
- reprocessamento puder ser simulado;
- auditoria receber eventos gerados pelas ações;
- não existirem links principais sem comportamento;
- os dados permanecerem consistentes entre as telas.

# 25. FORMA DE TRABALHO

Antes de editar:

1. analise a base existente;
2. identifique componentes reutilizáveis;
3. explique brevemente quais arquivos pretende modificar;
4. implemente o protótipo;
5. teste todas as rotas e interações;
6. corrija erros JavaScript;
7. verifique o console;
8. valide que nenhuma navegação principal ficou quebrada.

Não pare após criar apenas os layouts estáticos.

O requisito principal é entregar um **protótipo realmente navegável**, no qual seja possível demonstrar o fluxo do Hanaro do início ao fim utilizando dados fictícios coerentes.
