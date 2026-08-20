# Validação de cobertura — Dashboard Scrap

Base de comparação: aba **Dashboard** da planilha `Controle de Scrap - IF Cost`, Pivot Table e `Target Result Control MS` fornecidos em 19/08/2026.

## Regras de seleção

- **Ano** define o ciclo analisado.
- **Período** equivale ao slicer `MONTHLY`: acumulado anual ou um mês disponível.
- **Semana** equivale ao slicer `WEEK`: `W1` a `W53`; aceita múltipla seleção dentro do período.
- **Produto**, **Linha**, **Divisão**, **Semana** e **Componente** podem ser combinados. Valores dentro do mesmo filtro usam OR; filtros diferentes usam AND. Divisão usa o campo da planilha com BM, HE e MNT.
- A comparação não é mais um seletor: no acumulado, a referência é o mesmo acumulado do ano anterior; em um mês, a referência é o mês anterior disponível.
- O filtro de Linha usa o catálogo de Configurações. Uma linha sem ocorrência permanece catalogada, mas não participa de ranking até receber dados.

## Cobertura dos gráficos da planilha

| Gráfico de referência | Equivalente no protótipo | Recorte necessário | Situação |
|---|---|---|---|
| Monthly Scrap — valor, quantidade e target | Target × realizado mensal | Ano + Período = Acumulado no ano; alternar US$/QTY | Coberto. O toggle evita misturar dólar e quantidade no mesmo eixo. |
| Division — mês | Distribuição por produto / área | Escolher o mês no Período; Produto / área pode restringir o consolidado | Coberto. |
| Week Scrap — mês | Evolução semanal | Escolher o mês no Período; Semana para detalhar W1…W53 | Coberto. |
| Top 5 Offensor — composição percentual | Top 5 ofensores | Escolher mês ou acumulado; alternar métrica | Coberto com barras e participação no recorte. A rosca da planilha foi evitada porque cinco itens não fecham 100% sem uma categoria Outros. |
| Top 10 Items — US$ e QTY | Top 10 componentes | Alternar US$/QTY | Coberto. `Item Type` da planilha é a dimensão de componente. |
| Top Worst Lines — US$ e QTY | Top 10 linhas | Alternar US$/QTY | Coberto. |
| Top Worst Model — US$ e QTY | Top 10 modelos | Alternar US$/QTY | Coberto. `Make Item` da planilha é o modelo. |
| Target Result Control — target, result e achievement | KPIs + Target × realizado mensal | Ano, Período, Produto / área e Linha | Coberto para valor. A taxa relativa continua marcada como mock até chegar o denominador produtivo. |

## Decisões de interface

- `Part Number` não reaparece como Pareto no Dashboard: na base, é o campo `Item`; ele é mais granular que componente e não constava no painel original. Continua disponível para consulta na Base de Scrap e drill-down.
- Não há card de ajustes/estornos: nem a planilha nem o relatório recebido definem estorno como indicador de negócio.
- O produto atende `BM`, `AV`, `MNT`, `TV` e `VS`. VS permanece disponível mesmo quando ainda não há registro no mock.
- A massa do protótipo é distribuída entre os cinco produtos, dez componentes e dez modelos para preencher os rankings; ela é apenas ilustrativa e não reproduz os valores da planilha.

## Pendências para a integração real

1. JSON deve fornecer `week_number` (1–53), produto, linha/receipt department, setor, item type, item, make item, quantidade e IF Cost.
2. Confirmar a equivalência de `Receipt Department` para o rótulo de negócio **Linha**.
3. Para análise relativa, fornecer produção e/ou Material Amount no mesmo grão de mês × produto × linha.
