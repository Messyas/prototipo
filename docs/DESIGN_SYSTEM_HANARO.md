# Hanaro — Design System

**Versão 1.0 · Derivada de `styles.css` · 13 de agosto de 2026**

Este documento registra o design system atualmente implementado no protótipo Hanaro. O CSS é a fonte de verdade; valores marcados como “padrão observado” foram consolidados a partir de usos recorrentes e ainda não existem como custom properties.

## 1. Identidade e princípios

O Hanaro é uma interface operacional orientada a dados. Sua linguagem visual combina uma base neutra quente, superfícies limpas e o vinho da marca para ações e seleção.

1. **Clareza operacional:** hierarquia compacta, números em destaque e títulos objetivos.
2. **Consistência semântica:** verde, vermelho, amarelo, azul e laranja têm funções estáveis.
3. **Densidade confortável:** cartões e tabelas acomodam bastante informação sem perder separação visual.
4. **Tema como sistema:** claro e escuro usam os mesmos tokens semânticos, não cores isoladas por componente.
5. **Responsividade progressiva:** grades reduzem colunas; a navegação vira drawer; controles críticos continuam acessíveis.

## 2. Tokens fundamentais

### 2.1 Marca

| Token | Claro | Escuro | Uso |
|---|---:|---:|---|
| `--brand-primary` | `#A50034` | `#E7194A` | CTA, seleção, navegação ativa e destaques |
| `--brand-primary-hover` | `#850029` | `#D11442` | Hover de ação primária |
| `--brand-primary-strong` | `#1A1A1A` | `#F5F5F5` | Contraste forte relacionado à marca |
| `--brand-primary-soft` | `#FCE4EC` | `#2A1119` | Fundo sutil, avatar, badge e switch |
| `--brand-primary-softer` | `#FEF0F3` | `#1F0D12` | Fundo selecionado de baixa ênfase |
| `--brand-primary-border` | `#F8BBD0` | `#5C1A2A` | Contorno de seleção/contexto |
| `--brand-primary-contrast` | `#FFFFFF` | `#FFFFFF`* | Texto/ícone sobre primária |

\* O tema escuro herda o valor declarado no tema claro.

### 2.2 Superfícies e estrutura

| Token | Claro | Escuro | Uso |
|---|---:|---:|---|
| `--app-page` | `#F4F2EE` | `#000000` | Fundo externo e sidebar |
| `--app-canvas` | `#FFFFFF` | `#141414` | Canvas principal |
| `--app-surface` | `#FFFFFF` | `#141414` | Controles e superfícies comuns |
| `--app-surface-raised` | `#FFFFFF` | `#141414` | Cards, modais e drawers |
| `--app-surface-muted` | `#F4F2EE` | `#1E1E1E` | Hover, filtros e áreas secundárias |
| `--app-canvas-border` | `rgba(229,224,219,.45)` | `rgba(255,255,255,.05)` | Contorno do canvas |
| `--app-border` | `#E5E0DB` | `#2C2C2C` | Contorno padrão |
| `--app-border-soft` | `#EEEBE7` | `#222222` | Divisão sutil |
| `--app-divider` | `#EEEBE7` | `#3A3A3A` | Separadores |
| `--app-border-strong` | `#D5D0CB` | `#364257` | Contorno de maior ênfase |
| `--app-card-border` | `#E5E0DB` | `#404040` | Contorno de cards |
| `--app-overlay` | `rgba(26,26,26,.42)` | `rgba(0,0,0,.72)` | Fundo de modal/drawer |
| `--app-scrollbar` | `#D5D0CB` | `#404040` | Scrollbar |
| `--app-chart-grid` | `#E5E0DB` | `#404040` | Grade de gráficos |

### 2.3 Texto

| Token | Claro | Escuro | Papel |
|---|---:|---:|---|
| `--app-page-title` | `#121217` | `#FFFFFF` | Títulos de página e seção |
| `--app-text` | `#1A1A1A` | `#F5F5F5` | Texto padrão |
| `--app-text-strong` | `#1A1A1A` | `#FFFFFF` | Números e valores fortes |
| `--app-text-secondary` | `#666666` | `#A3A3A3` | Labels e texto auxiliar |
| `--app-text-muted` | `#888888` | `#8A8A8A` | Metadados e detalhes |
| `--app-text-subtle` | `#A3A3A3` | `#616161` | Ícones de baixa ênfase |
| `--app-text-description` | `#6B7280` | `#A3A3A3` | Descrições |
| `--app-text-muted-detail` | `#83899F` | `#8A8A8A` | Detalhes adicionais |
| `--app-dropdown-text` | `#0A1B39` | `#FFFFFF` | Texto de dropdown |
| `--app-breadcrumb-text` | `#303038` | `#F5F5F5` | Breadcrumb |

### 2.4 Cores semânticas e gráficos

| Papel | Claro | Fundo claro | Escuro | Fundo escuro |
|---|---:|---:|---:|---:|
| Sucesso | `#047857` | `#E7F8F2` | `#5AD6B3` | `#103228` |
| Perigo/erro | `#D21E27` | `#FEF2F2` | `#FF6C74` | `#3B171B` |
| Aviso | `#B96B00` | `#FFF7DF` | `#F8BD58` | `#332815` |
| Informação | `#2563EB` | `#EAF2FF` | `#78A6FF` | `#172744` |
| Laranja auxiliar | `#C86520` | `#FFF0E7` | `#FFAD78` | `#382216` |
| Gráfico principal | `#A50034` | — | `#E7194A` | — |
| Gráfico secundário | `#BDC7DF` | — | `#66728D` | — |
| Gráfico terciário | `#81AEF1` | — | `#78A6FF` | — |

**Regra:** cor semântica deve reforçar texto ou ícone, nunca ser o único portador de significado. Combine-a com rótulo, forma, posição ou ícone.

### 2.5 Tipografia

- Família principal: **Fustat Variable**, carregada localmente por `assets/fonts/fustat-latin-wght-normal.woff2`.
- Eixos/pesos disponíveis: `200–800`.
- Fallback: `Fustat, Inter, ui-sans-serif, system-ui, sans-serif`.
- Números críticos podem usar `font-variant-numeric: tabular-nums`.

| Papel | Tamanho | Peso | Entrelinha/observação |
|---|---:|---:|---|
| Título de página | `32px` | `600` | `1.2`, tracking `-0.025em` |
| Título de página mobile | `24px` | `600` | `32px` |
| Título de painel/seção | `20px` | `600` | `28px` |
| Título de modal | `17.6px` (`1.1rem`) | padrão/forte | — |
| Título pequeno | `15.2–16px` | forte | — |
| Corpo/controle | `12.8px` (`.8rem`) | `400–700` | padrão do produto |
| Label/navegação | `12.5–13.1px` | `600–700` | compacto |
| Metadado/descrição | `10.7–12px` | `400–650` | baixa ênfase |
| Kicker/badge | `9.9–10.6px` | `750–800` | pode usar caixa alta |
| KPI | `18.4–43.2px` | `650–700` | tracking negativo |

### 2.6 Espaçamento, raio, borda e elevação

O sistema usa base de **4px** e combina incrementos de 2px e 4px. Escala observada: `4, 6, 8, 10, 12, 14, 16, 20, 24 e 32px`.

| Categoria | Padrões observados |
|---|---|
| Gap interno compacto | `4–8px` |
| Gap entre controles | `10–12px` |
| Gap entre cards/seções | `16–24px` |
| Padding de controle | `6–14px` |
| Padding de card/painel | `16–20px` |
| Padding de conteúdo | `24px`; mobile `16px` |
| Raio pequeno | `8–10px` |
| Raio de controle | `10–12px` |
| Raio de card/painel | `14–16px` |
| Raio do canvas | `24px` (`--app-canvas-radius`) |
| Pill/circular | `99px`, `999px` ou `50%` |
| Borda padrão | `1px solid var(--app-border)` |
| Card | `0 1px 3px rgba(26,26,26,.04)`; escuro `0 1px 4px rgba(0,0,0,.32)` |
| Ação primária | `0 5px 14px rgba(165,0,52,.18)`; escuro `0 8px 20px rgba(0,0,0,.36)` |
| Modal | `0 24px 80px rgba(0,0,0,.24)` |

## 3. Estrutura e responsividade

- Sidebar expandida: `16.5rem` (`264px`); recolhida: `4.5rem` (`72px`).
- Topbar: `2.5rem` (`40px`).
- Canvas principal: raio de `1.5rem` (`24px`) e scroll interno.
- Conteúdo: `24px`; em telas estreitas, `16px`.
- Largura mínima global: `320px`.

| Breakpoint | Comportamento principal |
|---:|---|
| Altura `≤ 800px` e largura `≥ 900px` | Compacta o Modo TV |
| Largura `≤ 1180px` | KPIs passam de 5 para 3 colunas; grids de conteúdo e relatórios viram 1 coluna |
| Largura `≤ 900px` | Formulários viram 1 coluna; layouts mestre-detalhe estreitam; status de sincronização some |
| Largura `≤ 760px` | Sidebar vira drawer; título cai para 24px; KPIs usam 2 colunas; ações ocupam a largura |
| Largura `≤ 520px` | KPIs/filtros viram 1 coluna; detalhes e barras se reorganizam; toggle rápido de tema some |

## 4. Componentes

### Navegação

- **Sidebar (`.dashboard-sidebar`)**: fixa no desktop e drawer no mobile.
- **Item (`.nav-button`)**: altura mínima `40px`, raio `12px`; hover usa superfície muted; ativo usa primária e texto branco.
- **Breadcrumb (`.breadcrumbs`)**: gap `12px`; label `18/28px`, reduzido para `12/16px` em telas muito estreitas.
- **Botão de ícone (`.icon-button`)**: `38.4px`, borda e raio de `12px`; ícone padrão de `17.6px`.

### Ações e entrada

- **Botão (`.btn`)**: altura mínima `40px`, raio `11.5px`, peso `700`. Variantes `primary`, `danger` e `small`.
- **Campo (`.control`, `.search-control`)**: altura `40.8px`, raio `10.4px`, borda de dropdown; textarea mínimo `96px`.
- **Choice chip (`.choice`)**: pill com altura mínima `35.2px`; selecionado usa borda e fundo da marca.
- **Switch (`.switch`)**: `42.4 × 24px`; estado ligado em primária.
- **Checkbox/radio**: `accent-color` da marca.
- **Link-button (`.link-button`)**: ação textual sem contorno; uso secundário.

### Conteúdo e dados

- **Painel (`.panel`)**: borda de card, raio `16px`, padding `20px` e sombra sutil.
- **KPI (`.kpi-card`)**: raio `14.4px`, padding `16.8px`; valor responsivo por container query.
- **Tabela (`.table-panel`)**: cabeçalho em caixa alta, `10.7px`; corpo `12.2px`; linhas têm hover e bordas suaves.
- **Badge (`.badge`)**: pill, altura mínima `21.6px`, texto `9.9px/750`; variantes semânticas e de marca.
- **Tabs (`.tabs`, `.tab`)**: linha inferior de `2px`; ativo em primária.
- **Gráficos (`.chart`)**: altura mínima `190px`; linha principal/secondária de `3px`; meta tracejada de `1.5px`.
- **Barra de progresso (`.bar-track`)**: altura `8.8px`, pill; preenchimento usa gráfico principal.

### Feedback e camadas

- **Modal (`.modal`)**: largura máxima `560px`, margem mínima de `16px`, raio `16px`.
- **Drawer (`.drawer`)**: largura máxima `520px`; entra pela direita em `220ms`.
- **Toast (`.toast`)**: largura regional máxima `360px`; animação de `180ms`; ícone recebe semântica.
- **Tooltip (`.metric-tooltip`)**: largura máxima `320px`, fundo elevado e transição de `150ms`.
- **Loading (`.loading-block`)**: skeleton com ciclo de `1.2s`.
- **Empty state (`.empty-state`)**: altura mínima `256px`, conteúdo centralizado.

### Padrões compostos

- **Filtro**: painel muted, grid auto-fit, footer com nota e ação de limpeza.
- **Master–detail**: lista lateral de `290px` (`240px` em tablet), conteúdo fluido; empilha no mobile.
- **Workflow**: quatro etapas em pills; estado ativo usa marca.
- **Revisão/análise**: blocos de sistema em muted e blocos de usuário em superfície suave da marca.
- **Modo TV**: tipografia e espaçamento fluidos com `clamp()`, grades específicas para leitura à distância e controle de progresso.

## 5. Estados de interação

| Estado | Tratamento |
|---|---|
| Hover | Mudança de fundo para muted, aumento de contraste ou `--brand-primary-hover` |
| Active/selected | Primária sólida ou combinação `softer + border`; nunca apenas sombra |
| Focus visible | `3px solid var(--app-focus-ring)` com offset de `2px` |
| Disabled/loading | Opacidade `.58`, cursor `wait`; ícone pode girar em `.7s` |
| Error | `--app-danger` + texto/ícone explicativo |
| Success | `--app-success` + texto/ícone explicativo |
| Overlay | Cor semântica de overlay + blur de `5px` |

## 6. Movimento

- Colapso/abertura de navegação: `300ms cubic-bezier(.4,0,.2,1)`.
- Desenho de ícone: `420ms`, com delays de `60ms` por path.
- Drawer: `220ms ease-out`.
- Toast: `180ms ease-out`.
- Tooltip: `150ms ease`.
- Switch: `160ms ease`.
- Modo TV: entrada de `420ms` e progresso linear configurável.
- `prefers-reduced-motion: reduce` reduz animações e transições para `.01ms` e remove smooth scroll.

## 7. Acessibilidade

- Foco visível é global para `button`, `a`, `input`, `select` e `textarea`.
- A largura mínima suportada é `320px`.
- O tema respeita a preferência do sistema e persiste a escolha do usuário.
- Modais, navegação e toasts já usam rótulos/regions ARIA no HTML.
- Contrastes observados: texto padrão claro `17.40:1`; secundário claro `5.74:1`; marca clara sobre branco `7.93:1`; texto padrão escuro `16.90:1`; secundário escuro `7.30:1`.
- **Atenção:** `--app-text-muted` claro sobre branco mede aproximadamente `3.54:1`, adequado apenas para texto grande/elementos não textuais; `--brand-primary` escuro sobre canvas escuro e `--app-warning` claro sobre branco ficam perto de `4.07:1`, abaixo de 4.5:1 para texto normal. Validar tamanho/peso ou ajustar a cor antes de uso em corpo de texto.
- Não remover `:focus-visible`; não comunicar status somente por cor; manter alvos de toque próximos de `40px` ou maiores.

## 8. Regras de implementação

1. Use tokens semânticos; não replique hexadecimais dentro de componentes.
2. Toda nova cor de tema deve ser definida em `:root` e sobrescrita em `:root[data-theme='dark']` quando necessário.
3. Reutilize `.btn`, `.control`, `.panel`, `.badge`, `.tabs` e padrões de grid antes de criar variações.
4. Prefira a escala de espaçamento observada e raios já existentes.
5. Teste cada componente nos temas claro/escuro e nas larguras `1180`, `900`, `760`, `520` e `320px`.
6. Preserve estados de hover, focus, selected, disabled, loading, empty e error.
7. Para números de operação, considere algarismos tabulares e evite quebra de linha.
8. Ao criar um token novo, registre nome, valor por tema, papel e exemplos de uso.

## 9. Débito técnico recomendado

- Formalizar como tokens a escala de espaçamento, tipografia, raios, z-index e durações.
- Substituir valores equivalentes misturados em `px` e `rem` por uma escala única.
- Criar tokens para sombras de modal, toast e navegação mobile.
- Revisar cores de baixa ênfase que não chegam a `4.5:1` em texto normal.
- Documentar estados inválido, readonly e disabled de todos os campos.
- Adicionar especificação de iconografia (grid, stroke, tamanhos permitidos).
- Criar uma página viva de componentes para inspeção visual e regressão.

---

**Fonte auditada:** `styles.css` (650 linhas) e estrutura base de `index.html`. Este documento descreve o estado atual; alterações posteriores no CSS devem ser refletidas aqui.
