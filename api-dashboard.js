'use strict';

const dashboardApi = { loading: false, connected: false, error: '', request: 0 };
const dashboardApiConfig = {
  enabled: window.HANARO_DASHBOARD_API?.enabled === true,
  endpoint: window.HANARO_DASHBOARD_API?.endpoint || '/dashboard/data',
};
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
    division: ['division', 'Todos'],
    week: ['week', 'Todas'],
    item_type: ['component', 'Todos'],
    item: ['partNumber', 'Todos'],
  };
  Object.entries(dimensions).forEach(([parameter, [key, empty]]) => {
    const values = dashboardFilterValues(filters[key], empty);
    values.forEach((value) => params.append(parameter, value));
  });
  return params;
}

function asTransaction(row) {
  const [year, month, day] = row.transaction_date.split('-');
  const isReversal = row.gross_scrap_usd === 0 && row.reversal_usd > 0;
  return {
    id: row.occurrence_id || row.source_id,
    occurrenceId: row.occurrence_id || row.source_id,
    year: Number(year),
    transactionDate: `${day}/${month}/${year}`,
    monthIndex: row.month_number - 1,
    weekNumber: row.week_number,
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
    sector: row.sector || 'Não informado',
    stationCode: row.station_code || 'Não informado',
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
    source: row.source || 'API', batch: row.ingestion_id || 'workbook-import', executionId: row.bot_run_id || row.ingestion_id || 'workbook-import',
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

  replaceValues(productAreas, [...new Set([...productAreas, ...(payload.filters.product || [])])]);
  replaceValues(scrapLines, [...new Set([...scrapLines, ...(payload.filters.receipt_department || [])])]);
  if (Array.isArray(payload.filters.division)) replaceValues(divisions, payload.filters.division);
  replaceValues(components, payload.filters.item_type);
  replaceValues(partNumbers, payload.filters.item);
  replaceValues(sectors, payload.filters.sector || [...new Set(payload.details.map((row) => row.sector || 'Não informado'))]);
  window.dashboardApiYears = payload.filters.year;
  model.transactions.splice(0, model.transactions.length, ...payload.details.map(asTransaction));
}

window.dashboardApiStatusHtml = () => {
  if (dashboardApi.loading) return '<section class="api-data-state loading"><strong>Atualizando dados da API…</strong><span>Os gráficos serão redesenhados ao concluir.</span></section>';
  if (dashboardApi.connected) return '<section class="api-data-state connected"><strong>Dados reais · FastAPI + SQLite</strong><span>Mock somente em posto/setor, workflow de revisão e análise relativa.</span></section>';
  if (!dashboardApiConfig.enabled) return '<section class="api-data-state mock"><strong>Dados simulados</strong><span>Integração com o backend desativada neste protótipo.</span></section>';
  return `<section class="api-data-state error"><strong>API indisponível · exibindo o mock inicial</strong><span>${dashboardApi.error || 'Abra o protótipo por http://localhost:8000/prototype/.'}</span></section>`;
};

async function refreshDashboardData() {
  if (!dashboardApiConfig.enabled) {
    dashboardApi.loading = false;
    dashboardApi.connected = false;
    dashboardApi.error = '';
    window.dashboardApiConnected = false;
    return;
  }
  const request = ++dashboardApi.request;
  dashboardApi.loading = true;
  dashboardApi.error = '';
  if (state.route === 'dashboard') renderPage();
  try {
    const separator = dashboardApiConfig.endpoint.includes('?') ? '&' : '?';
    const response = await fetch(`${dashboardApiConfig.endpoint}${separator}${dashboardQuery()}`);
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
  if (['dash-year', 'dash-period', 'dash-product', 'dash-scrap-line', 'dash-division', 'dash-component'].includes(event.target.id)) {
    setTimeout(refreshDashboardData, 0);
  }
});

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (['refresh-dashboard', 'clear-dashboard', 'clear-dashboard-selection', 'dashboard-remove-filter', 'dashboard-multi-clear', 'dashboard-multi-apply'].includes(action)) {
    setTimeout(refreshDashboardData, 0);
  }
});
