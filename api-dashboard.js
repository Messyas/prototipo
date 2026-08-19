'use strict';

const dashboardApi = { loading: false, connected: false, error: '', request: 0 };
window.dashboardApiConnected = false;
window.dashboardApiYears = [];

const replaceValues = (target, values) => target.splice(0, target.length, ...values);
const monthlyValues = (rows, key) => Array.from({ length: 12 }, (_, index) => {
  const row = rows.find((item) => item.month_number === index + 1);
  return row ? row[key] : null;
});

function dashboardQuery() {
  const filters = state.dashboardFilters;
  const params = new URLSearchParams({ year: filters.year });
  const dimensions = {
    product: ['product', 'Todos'],
    receipt_department: ['scrapLine', 'Todas'],
    item_type: ['component', 'Todos'],
    item: ['partNumber', 'Todos'],
  };
  Object.entries(dimensions).forEach(([parameter, [key, empty]]) => {
    if (filters[key] !== empty) params.set(parameter, filters[key]);
  });
  return params;
}

function asTransaction(row) {
  const [year, month, day] = row.transaction_date.split('-');
  const isReversal = row.gross_scrap_usd === 0 && row.reversal_usd > 0;
  return {
    id: row.source_id,
    transactionDate: `${day}/${month}/${year}`,
    monthIndex: row.month_number - 1,
    weekLabel: row.week_label,
    productArea: row.product,
    scrapLine: row.receipt_department,
    component: row.item_type,
    partNumber: row.item,
    itemDescription: row.item_description,
    modelCode: row.make_item,
    qty: row.gross_scrap_qty,
    netQty: row.net_scrap_qty,
    ifCost: row.gross_scrap_usd,
    netCost: row.net_scrap_usd,
    issueQuantitySigned: row.issue_quantity,
    issueAmount: Math.abs(row.amount_usd_original),
    issuePrice: row.gross_scrap_qty ? row.gross_scrap_usd / row.gross_scrap_qty : 0,
    exchangeRate: null,
    department: row.department,
    division: row.division,
    sector: 'Sem dado na planilha',
    stationCode: 'MOCK',
    defect: row.reason,
    occurrence: row.request_reason,
    movementType: isReversal ? 'Estorno' : 'Scrap',
    processingStatus: 'Processado',
    review: {
      status: 'Mock', category: 'Não disponível', risk: 'Não disponível',
      reason: row.request_comment, rootCause: '', responsible: 'Não disponível',
      responsibleDepartment: 'Não disponível', actionPlanId: null, includeInReport: false,
    },
    account: 'Não disponível', accountAlias: 'Não disponível',
    source: 'API / SQLite', batch: 'workbook-import', executionId: 'workbook-import',
    processedAt: state.dashboardUpdatedAt,
  };
}

function applyDashboardPayload(payload) {
  const current = payload.monthly;
  const previous = payload.previous_monthly;
  replaceValues(dashboardSpreadsheetSeries.actualUsd, monthlyValues(current, 'net_scrap_usd'));
  replaceValues(dashboardSpreadsheetSeries.actualQty, monthlyValues(current, 'net_scrap_qty'));
  replaceValues(dashboardSpreadsheetSeries.previousUsd, monthlyValues(previous, 'net_scrap_usd'));
  replaceValues(dashboardSpreadsheetSeries.previousQty, monthlyValues(previous, 'net_scrap_qty'));
  replaceValues(dashboardSpreadsheetSeries.grossUsd, monthlyValues(current, 'gross_scrap_usd'));
  replaceValues(dashboardSpreadsheetSeries.reversalUsd, monthlyValues(current, 'reversal_usd'));
  replaceValues(dashboardSpreadsheetSeries.grossQty, monthlyValues(current, 'gross_scrap_qty'));
  replaceValues(dashboardSpreadsheetSeries.reversalQty, monthlyValues(current, 'reversal_qty'));
  replaceValues(dashboardSpreadsheetSeries.targetUsd, monthlyValues(current, 'target_usd'));

  replaceValues(productAreas, payload.filters.product);
  replaceValues(scrapLines, payload.filters.receipt_department);
  replaceValues(components, payload.filters.item_type);
  replaceValues(partNumbers, payload.filters.item);
  window.dashboardApiYears = payload.filters.year;
  model.transactions.splice(0, model.transactions.length, ...payload.details.map(asTransaction));
}

window.dashboardApiStatusHtml = () => {
  if (dashboardApi.loading) return '<section class="api-data-state loading"><strong>Atualizando dados da API…</strong><span>Os gráficos serão redesenhados ao concluir.</span></section>';
  if (dashboardApi.connected) return '<section class="api-data-state connected"><strong>Dados reais · FastAPI + SQLite</strong><span>Mock somente em posto/setor, workflow de revisão e análise relativa.</span></section>';
  return `<section class="api-data-state error"><strong>API indisponível · exibindo o mock inicial</strong><span>${dashboardApi.error || 'Abra o protótipo por http://localhost:8000/prototype/.'}</span></section>`;
};

async function refreshDashboardData() {
  const request = ++dashboardApi.request;
  dashboardApi.loading = true;
  dashboardApi.error = '';
  if (state.route === 'dashboard') renderPage();
  try {
    const response = await fetch(`/dashboard/data?${dashboardQuery()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (request !== dashboardApi.request) return;
    applyDashboardPayload(payload);
    dashboardApi.connected = true;
    window.dashboardApiConnected = true;
    const now = new Date();
    state.dashboardUpdatedAt = now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch (error) {
    if (request !== dashboardApi.request) return;
    dashboardApi.connected = false;
    window.dashboardApiConnected = false;
    dashboardApi.error = error.message;
  } finally {
    if (request === dashboardApi.request) {
      dashboardApi.loading = false;
      if (state.route === 'dashboard') renderPage();
    }
  }
}

if (state.dashboardFilters.period === 'Acumulado Jan–Ago') state.dashboardFilters.period = 'Acumulado no ano';
refreshDashboardData();

document.addEventListener('change', (event) => {
  if (['dash-year', 'dash-product', 'dash-scrap-line', 'dash-component', 'dash-part-number'].includes(event.target.id)) {
    if (event.target.id === 'dash-year' && state.dashboardFilters.compare.startsWith('Mesmo período')) {
      state.dashboardFilters.compare = `Mesmo período de ${Number(state.dashboardFilters.year) - 1}`;
    }
    setTimeout(refreshDashboardData, 0);
  }
});

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (['refresh-dashboard', 'clear-dashboard', 'dashboard-remove-filter', 'dashboard-apply-more-filters'].includes(action)) {
    setTimeout(refreshDashboardData, 0);
  }
});
