'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatCurrency = (value, compact = false) => compact
  ? `US$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
  : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value);
const formatPercentage = (value) => `${value > 0 ? '+' : ''}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
let pendingCharts = [];
let chartInstances = [];

const iconPaths = {
  dashboard: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
  database: ['M4 6c0-2 3.6-3.5 8-3.5S20 4 20 6s-3.6 3.5-8 3.5S4 8 4 6Z', 'M4 6v6c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5V6', 'M4 12v6c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5v-6'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z', 'M10 21h4'],
  analysis: ['M4 14a8 8 0 1 1 4 5.5', 'M3 21l5-5', 'M8 16v5H3', 'M8 12h2l2-5 3 10 2-5h3'],
  report: ['M5 3h10l4 4v14H5z', 'M14 3v5h5', 'M8 13h8', 'M8 17h6'],
  play: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'm10 8 6 4-6 4Z'],
  audit: ['M4 3h16v18H4z', 'M8 8h1', 'M12 8h4', 'M8 12h1', 'M12 12h4', 'M8 16h1', 'M12 16h4'],
  settings: ['M4 6h10', 'M18 6h2', 'M14 4v4', 'M4 12h2', 'M10 12h10', 'M6 10v4', 'M4 18h8', 'M16 18h4', 'M12 16v4'],
  sidebar: ['M4 4h16v16H4z', 'M9 4v16', 'm14 9-3 3 3 3'],
  search: ['M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z', 'm21 21-4.3-4.3'],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
  upload: ['M12 16V4', 'm7 9 5-5 5 5', 'M5 20h14'],
  refresh: ['M20 6v5h-5', 'M4 18v-5h5', 'M18.5 9A7 7 0 0 0 6 6.5L4 11', 'M5.5 15A7 7 0 0 0 18 17.5l2-4.5'],
  plus: ['M12 5v14', 'M5 12h14'],
  x: ['m6 6 12 12', 'M18 6 6 18'],
  more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
  sun: ['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z', 'M12 1v2', 'M12 21v2', 'M4.22 4.22l1.42 1.42', 'm18.36 18.36 1.42 1.42', 'M1 12h2', 'M21 12h2'],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z'],
  check: ['m5 12 4 4L19 6'],
  alert: ['M12 3 2 21h20L12 3Z', 'M12 9v5', 'M12 18h.01'],
  chevronLeft: ['m15 18-6-6 6-6'],
  chevronRight: ['m9 18 6-6-6-6'],
  mail: ['M3 5h18v14H3z', 'm3 8 6 5 6-5'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 22a8 8 0 0 1 16 0'],
  filter: ['M4 5h16', 'M7 12h10', 'M10 19h4'],
  file: ['M5 3h10l4 4v14H5z', 'M14 3v5h5'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  tv: ['M3 5h18v13H3z', 'M8 22h8', 'M12 18v4'],
  pause: ['M8 5v14', 'M16 5v14'],
  fullscreen: ['M8 3H3v5', 'M16 3h5v5', 'M8 21H3v-5', 'M16 21h5v-5'],
};

function icon(name, label = '') {
  const paths = (iconPaths[name] || iconPaths.file).map((d) => `<path pathLength="1" d="${d}"></path>`).join('');
  return `<span class="icon" ${label ? `aria-label="${label}"` : 'aria-hidden="true"'}><svg viewBox="0 0 24 24">${paths}</svg></span>`;
}

const navigation = [
  { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: 'scrap', label: 'Base de Scrap', icon: 'database' },
  { route: 'alertas', label: 'Alertas', icon: 'bell', badge: 12 },
  { route: 'relatorios', label: 'Relatórios', icon: 'report' },
  { route: 'execucoes', label: 'Execuções', icon: 'play' },
  { route: 'auditoria', label: 'Auditoria', icon: 'audit' },
  { route: 'configuracoes', label: 'Configurações', icon: 'settings' },
];

const products = ['OLED65C4', 'OLED55C4', '32UN650', '27UP650', 'MyLink IVS', 'XBOOM RN9'];
const partNumbers = ['EAJ65714501', 'EAY65769201', 'EAJ66284201', 'EBR85875402', 'EBR89032104', 'EAJ65987304', 'EAJ66124008', 'EAJ65871302', 'EBR88410211', 'EBR87941306', 'EAJ66310007', 'EBR90221003', 'EAJ66048109', 'EBR89273012', 'EAJ65600418', 'EBR87145021', 'EAJ66490005', 'EBR89916010'];
const departments = ['Final Assembly A', 'Final Assembly B', 'SMT', 'IPI'];
const lines = ['Line 02', 'Line 04', 'Line 05', 'Line 07'];
const modules = ['Tela LCD', 'Moldura frontal', 'Placa principal PCB'];
const productionScenarios = [
  {
    component: 'Tela LCD', defect: 'Risco profundo no painel', station: 'Esteira de montagem final',
    occurrence: 'Um prego solto caiu na esteira e entrou em contato com a tela durante o transporte.',
    category: 'Processo', classification4m: ['Method'], rootCause: 'Falha no controle de objetos estranhos e na inspeção da esteira antes do início do turno.',
    corrective: 'Parar a esteira, remover o objeto e segregar as telas que passaram pelo trecho.', preventive: 'Implantar inspeção magnética e checklist de liberação da esteira.'
  },
  {
    component: 'Moldura frontal', defect: 'Trinca no ponto de fixação', station: 'Posto de parafusamento',
    occurrence: 'O parafuso foi aplicado com torque acima do especificado e trincou a moldura.',
    category: 'Máquina', classification4m: ['Machine', 'Method'], rootCause: 'Parafusadeira operando com parâmetro de torque incorreto.',
    corrective: 'Bloquear a ferramenta e substituir as molduras trincadas.', preventive: 'Validar o torque no início de cada lote e bloquear receitas fora do padrão.'
  },
  {
    component: 'Placa principal PCB', defect: 'Falha no teste funcional', station: 'Montagem eletrônica',
    occurrence: 'A placa apresentou falha após manuseio sem proteção eletrostática adequada.',
    category: 'Processo', classification4m: ['Method', 'Man'], rootCause: 'Pulseira ESD desconectada durante o manuseio da placa.',
    corrective: 'Segregar as placas do posto e repetir o teste funcional.', preventive: 'Adicionar intertravamento ESD e confirmação visual antes do manuseio.'
  },
  {
    component: 'Tela LCD', defect: 'Painel trincado por impacto', station: 'Abastecimento da linha',
    occurrence: 'A tela escorregou do dispositivo de movimentação durante o abastecimento.',
    category: 'Mão de obra', classification4m: ['Man', 'Method'], rootCause: 'Posicionamento incompleto da tela no suporte de transporte.',
    corrective: 'Segregar o painel danificado e inspecionar o lote no carrinho.', preventive: 'Revisar o dispositivo e treinar o abastecimento com dupla checagem.'
  },
  {
    component: 'Moldura frontal', defect: 'Deformação e desalinhamento', station: 'Prensa de encaixe',
    occurrence: 'A moldura entrou desalinhada no dispositivo e foi deformada durante o encaixe.',
    category: 'Máquina', classification4m: ['Machine'], rootCause: 'Guia lateral do dispositivo estava com folga acima do limite.',
    corrective: 'Ajustar o dispositivo e segregar as molduras produzidas desde a última inspeção.', preventive: 'Incluir medição da folga na manutenção autônoma diária.'
  },
  {
    component: 'Placa principal PCB', defect: 'Conector danificado', station: 'Conexão do cabo flat',
    occurrence: 'O cabo flat foi inserido inclinado e danificou os contatos do conector da placa.',
    category: 'Processo', classification4m: ['Method', 'Man'], rootCause: 'Ausência de guia para garantir o ângulo correto de inserção.',
    corrective: 'Substituir a placa e inspecionar os conectores montados no turno.', preventive: 'Adicionar guia poka-yoke e reforçar o padrão visual do posto.'
  }
];
const aliases = ['D-COMMON', 'D-DIRECT', 'D-RW-REQ', 'P-REWORK', 'E-Q-SCRAP', 'Z-Q-RMA-ADJ'];
const families = ['TV', 'Monitor', 'Áudio', 'IVS'];

function generateTransactions() {
  const rows = Array.from({ length: 96 }, (_, i) => {
    const scenario = productionScenarios[i % productionScenarios.length];
    const day = 12 - (i % 12);
    const qty = i === 0 ? 14 : 2 + ((i * 7) % 39);
    const exchange = i % 11 === 2 ? null : 5.05 + (i % 8) * .017;
    const periodic = i === 0 ? 2845.7 : 390 + ((i * 347) % 2900);
    const local = periodic * qty;
    return {
      id: i === 0 ? 'TX-20260811-82194' : `TX-202608${String(day).padStart(2, '0')}-${82194 - i}`,
      date: `${String(day).padStart(2, '0')}/08/2026`, division: i % 5 === 4 ? 'VS' : 'HE',
      department: departments[i % departments.length], line: lines[(i + 1) % lines.length],
      family: families[i % families.length], product: products[i % products.length],
      partNumber: partNumbers[i % partNumbers.length], module: scenario.component, alias: aliases[i % aliases.length],
      defect: scenario.defect, occurrence: scenario.occurrence, station: scenario.station,
      qty, periodic, local, exchange, ifCost: exchange ? local / exchange : 0,
      source: 'GERP',
      executionId: i < 18 ? 'EXE-20260811-0042' : `EXE-202608${String(day).padStart(2, '0')}-${String(46 - (i % 15)).padStart(4, '0')}`,
      status: !exchange ? 'Câmbio pendente' : i % 17 === 6 ? 'Rejeitado' : 'Validado',
      batch: `BAT-202608-${String(Math.floor(i / 12) + 1).padStart(3, '0')}`,
      processedAt: `${String(day).padStart(2, '0')}/08/2026 05:${String((i * 3) % 60).padStart(2, '0')}`,
      review: {
        status: i > 0 && i % 13 === 0 && exchange ? 'Justificado' : 'Pendente de revisão',
        category: i > 0 && i % 13 === 0 && exchange ? scenario.category : '', reason: i > 0 && i % 13 === 0 && exchange ? scenario.occurrence : '',
        requiresCause: i > 0 && i % 26 === 0 && exchange, classification4m: i > 0 && i % 26 === 0 && exchange ? scenario.classification4m : [], rootCause: i > 0 && i % 26 === 0 && exchange ? scenario.rootCause : '',
        corrective: i > 0 && i % 13 === 0 && exchange ? scenario.corrective : '', preventive: i > 0 && i % 26 === 0 && exchange ? scenario.preventive : '', responsible: 'M. França', evidence: [], includeInReport: Boolean(i > 0 && i % 13 === 0 && exchange),
      },
    };
  });
  Object.assign(rows[0], { date: '11/08/2026', exchange: 5.18, periodic: 2845.7, local: 39839.8, ifCost: 39839.8 / 5.18 });
  const telaRows = rows.filter((row) => row.module === 'Tela LCD');
  telaRows.forEach((row, index) => { row.partNumber = partNumbers[index % partNumbers.length]; if (!row.exchange) row.exchange = 5.12; });
  const normalizeQuantity = (group, target) => {
    const original = group.reduce((sum, row) => sum + row.qty, 0);
    group.forEach((row) => { row.qty = Math.max(1, Math.floor(row.qty * target / original)); });
    let difference = target - group.reduce((sum, row) => sum + row.qty, 0), cursor = 0;
    while (difference > 0) { group[cursor % group.length].qty += 1; difference -= 1; cursor += 1; }
  };
  normalizeQuantity(telaRows, 287);
  normalizeQuantity(rows.filter((row) => row.module === 'Moldura frontal'), 540);
  normalizeQuantity(rows.filter((row) => row.module === 'Placa principal PCB'), 420);
  let mainQtyDifference = 14 - rows[0].qty, mainQtyCursor = 1;
  rows[0].qty = 14;
  while (mainQtyDifference > 0) { const candidate=telaRows[mainQtyCursor % telaRows.length]; if(candidate!==rows[0]&&candidate.qty>1){candidate.qty-=1;mainQtyDifference-=1;} mainQtyCursor+=1; }
  while (mainQtyDifference < 0) { const candidate=telaRows[mainQtyCursor % telaRows.length]; if(candidate!==rows[0]){candidate.qty+=1;mainQtyDifference+=1;} mainQtyCursor+=1; }
  rows.forEach((row) => { row.local = row.periodic * row.qty; row.ifCost = row.exchange ? row.local / row.exchange : 0; });
  const normalizeCost = (group, target) => {
    const current = group.reduce((sum, row) => sum + row.ifCost, 0);
    const factor = target / current;
    group.forEach((row) => { if (row.exchange) row.periodic *= factor; row.local = row.periodic * row.qty; row.ifCost = row.exchange ? row.local / row.exchange : 0; });
  };
  normalizeCost(telaRows, 72400);
  normalizeCost(rows.filter((row) => row.module === 'Moldura frontal'), 41800);
  normalizeCost(rows.filter((row) => row.module === 'Placa principal PCB'), 70060);
  rows[0].periodic = 8420 * rows[0].exchange / rows[0].qty; rows[0].local = rows[0].periodic * rows[0].qty; rows[0].ifCost = 8420;
  normalizeCost(telaRows.filter((row) => row.partNumber === 'EAJ65714501' && row !== rows[0]), 29980);
  normalizeCost(telaRows.filter((row) => row.partNumber === 'EAY65769201'), 19100);
  normalizeCost(telaRows.filter((row) => row.partNumber === 'EAJ66284201'), 7800);
  normalizeCost(telaRows.filter((row) => !['EAJ65714501','EAY65769201','EAJ66284201'].includes(row.partNumber)), 7100);
  Object.assign(rows[54], { department: 'Final Assembly A', line: 'Line 04', family: 'TV', product: 'OLED65C4' });
  return rows;
}

function generateAlerts() {
  const types = ['Aumento de telas riscadas', 'Reincidência de objeto estranho', 'Falhas no teste funcional', 'Desvio de torque', 'Painéis trincados', 'Alto volume de scrap'];
  return Array.from({ length: 20 }, (_, i) => {
    const scenario = productionScenarios[i % productionScenarios.length];
    return ({
    id: i === 0 ? 'ALT-20260812-0021' : `ALT-202608${String(12 - (i % 5)).padStart(2, '0')}-${String(21 - i).padStart(4, '0')}`,
    severity: i < 6 ? 'Crítico' : i < 14 ? 'Alto' : 'Médio',
    dateTime: i === 0 ? '12/08 08:42' : `${12 - (i % 5)}/08 ${String(7 + (i % 9)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    type: types[i % types.length], department: departments[i % 4], line: lines[(i + 1) % 4], module: scenario.component,
    impact: i === 0 ? 8420 : 1300 + ((i * 793) % 6500),
    description: i === 0 ? 'Aumento de telas riscadas associado a objeto metálico encontrado na esteira' : `${scenario.defect}: ocorrência acima do limite configurado no posto ${scenario.station}`,
    status: i === 0 ? 'Novo' : i % 5 === 0 ? 'Arquivado' : i % 3 === 0 ? 'Lido' : 'Novo',
    channel: i % 2 === 0 ? 'E-mail e plataforma' : 'Plataforma',
    transactionIds: i === 0 ? ['TX-20260811-82194', 'TX-20260806-82140'] : [],
    });
  });
}

function generateExecutions() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i === 0 ? 'EXE-20260812-0046' : i === 1 ? 'EXE-20260811-0042' : `EXE-202608${String(12 - (i % 6)).padStart(2, '0')}-${String(46 - i).padStart(4, '0')}`,
    source: 'GERP', process: 'Other Account Transaction Text Download',
    start: `${12 - (i % 6)}/08 05:00`, end: `${12 - (i % 6)}/08 05:${String(6 + (i % 4)).padStart(2, '0')}`,
    duration: `0${6 + (i % 4)}m${String(12 + i * 3).slice(-2)}s`, received: 1106 + i * 71, valid: 1106 + i * 71 - (i % 5), rejected: i % 5,
    status: i === 0 ? 'Parcial' : i === 7 ? 'Falha' : 'Concluído', scheduled: true, retryCount: 0, contingencyAvailable: false,
  }));
}

function generateAudit() {
  const actions = ['Persistiu lote', 'Validou transação', 'Atualizou alerta', 'Consultou relatório', 'Aplicou taxa de câmbio'];
  const events = Array.from({ length: 50 }, (_, i) => ({
    id: `AUD-${92300 - i}`, timestamp: `12/08/2026 ${String(9 - Math.floor(i / 12)).padStart(2, '0')}:${String((51 - i * 3 + 60) % 60).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    actor: i % 4 === 0 ? 'm.franca' : 'hanaro-backend', origin: i % 4 === 0 ? 'Web' : 'API', action: actions[i % actions.length],
    entity: i % 2 ? 'Transaction' : 'Execution', identifier: i % 2 ? `TX-20260811-${82194 - i}` : `EXE-20260812-${String(46 - (i % 15)).padStart(4, '0')}`,
    before: i % 3 ? 'Recebido' : 'Validando', after: i % 3 ? 'Validado' : 'Concluído', correlation: `COR-${921842 - i}`, severity: i % 17 === 0 ? 'Crítico' : 'Informativo',
  }));
  return [
    { id:'AUD-92351',timestamp:'12/08/2026 09:51:02',actor:'hanaro-backend',origin:'API',action:'Processou dados recebidos do GERP',entity:'Execution',identifier:'EXE-20260811-0042',before:'Recebido',after:'Concluído',correlation:'COR-921842',severity:'Informativo' },
    { id:'AUD-92350',timestamp:'12/08/2026 09:50:11',actor:'hanaro-backend',origin:'API',action:'Gerou alerta por variação de IF Cost',entity:'Alert',identifier:'ALT-20260812-0021',before:'Inexistente',after:'Novo',correlation:'COR-921842',severity:'Crítico' },
    { id:'AUD-92349',timestamp:'12/08/2026 09:48:22',actor:'m.franca',origin:'Web',action:'Abriu registros relacionados pelo alerta',entity:'Alert',identifier:'ALT-20260812-0021',before:'Novo',after:'Lido',correlation:'COR-921842',severity:'Informativo' },
    { id:'AUD-92348',timestamp:'12/08/2026 09:45:09',actor:'m.franca',origin:'Web',action:'Justificou registro de scrap',entity:'Transaction',identifier:'TX-20260810-82168',before:'Pendente de revisão',after:'Justificado',correlation:'COR-921842',severity:'Informativo' },
    { id:'AUD-92347',timestamp:'12/08/2026 09:42:41',actor:'m.franca',origin:'Web',action:'Registrou relatório com scraps revisados',entity:'Report',identifier:'REP-2026-W33-v8',before:'Rascunho',after:'Publicado',correlation:'COR-921842',severity:'Informativo' },
    ...events,
  ];
}

const model = {
  transactions: generateTransactions(), alerts: generateAlerts(), executions: generateExecutions(), audit: generateAudit(),
  reports: Array.from({ length: 8 }, (_, i) => ({ id: `REP-2026-W${String(33 - Math.floor(i / 2)).padStart(2, '0')}-v${8 - i}`, version: `v1.${8 - i}`, type: i % 3 === 0 ? 'Mensal' : 'Semanal', period: i % 3 === 0 ? 'Ago/2026' : '03–09 Ago', generatedAt: `${10 - (i % 4)}/08 08:${54 - i}`, author: 'M. França', ifCost: 47820 + i * 870, format: i % 2 ? 'XLSX' : 'PDF', status: i === 7 ? 'Rascunho' : 'Publicado', reviewIds: i < 3 ? ['TX-20260810-82168','TX-20260809-82155'] : [] })),
  sends: Array.from({ length: 6 }, (_, i) => ({ report: `v1.${8 - i}`, recipient: i % 2 ? 'qualidade@exemplo.local' : 'gestores@exemplo.local', channel: 'E-mail', requestedAt: `${10 - i}/08 09:10`, status: i === 2 ? 'Falha' : i === 4 ? 'Pendente' : 'Enviado', attempts: i === 2 ? 2 : 1 })),
  settings: { target: -15, baseline: 2025, year: 2026, upload: true, validation: true, reportFrequency: 'Semanal', notifyCritical: true },
};

const initialRouteParts = (location.hash.slice(1) || 'dashboard').split('?')[0].split('/');
const initialReviewId = initialRouteParts[0] === 'scrap' && initialRouteParts[1] === 'revisar' ? decodeURIComponent(initialRouteParts[2] || '') : null;
const state = {
  route: initialRouteParts[0] || 'dashboard', reportTab: 'gerar', settingsTab: 'negocio',
  scrapPage: 1, scrapPageSize: 10, scrapSearch: '', scrapSort: { key: 'date', direction: 'desc' }, auditSearch: '', dashboardFactor: 1,
  scrapFilters: { date: 'Todas as datas', division: 'Todas', department: 'Todos', line: 'Todas', reviewStatus: 'Todos' },
  alertSeverity: 'Todas', executionStatus: 'Todos', auditEntity: 'Todas', reportFactor: 1,
  scrapView: initialRouteParts[1] === 'revisar' ? 'review' : 'list', selectedScrapIds: initialReviewId ? [initialReviewId] : [], activeReviewId: initialReviewId,
  tvActive: false, tvPanel: 0, tvPaused: false, tvRotation: true, tvDuration: 15,
  context: { source: null, module: null, partNumber: null, line: null, transactionId: null, alertId: null, executionId: null },
};
let tvTimer = null;
let tvControlsTimer = null;

function statusTone(status) {
  const s = String(status).toLowerCase();
  if (/conclu|validado|justificado|enviado|publicado|normal|operacional|configurado|ativo/.test(s)) return 'success';
  if (/crítico|falha|rejeitado/.test(s)) return 'danger';
  if (/alto|parcial|pendente/.test(s)) return 'warning';
  if (/análise|revisão|processando|atenção|reaberto|lido/.test(s)) return 'info';
  return '';
}
function badge(text, tone = statusTone(text)) { return `<span class="badge ${tone}">${text}</span>`; }
function button(label, action, options = {}) { return `<button class="btn ${options.primary ? 'primary' : ''} ${options.small ? 'small' : ''}" type="button" data-action="${action}" ${options.id ? `data-id="${options.id}"` : ''}>${options.icon ? icon(options.icon) : ''}${label}</button>`; }
function pageHeader(title, actions = '') { return `<header class="page-header"><h1 class="page-title">${title}</h1><div class="page-actions">${actions}</div></header>`; }
function field(label, id, options, value = '') { return `<div class="field"><label for="${id}">${label}</label><select class="control" id="${id}" data-filter="${id}">${options.map((o) => `<option ${o === value ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`; }
function kpiCard(label, value, detail = '', tone = '') { return `<article class="kpi-card ${tone}"><span class="kpi-label">${label}</span><strong class="kpi-value">${value}</strong>${detail ? `<span class="kpi-detail">${detail}</span>` : ''}</article>`; }
function filtersPanel(fields, footer = '') { return `<section class="filter-panel" aria-label="Filtros"><div class="filters">${fields}</div>${footer ? `<div class="filter-footer">${footer}</div>` : ''}</section>`; }
function tablePanel(title, headers, rows, options = {}) {
  return `<section class="table-panel">${title ? `<header class="panel-header"><h2>${title}</h2>${options.headerAction || ''}</header>` : ''}<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th class="${h.number ? 'number' : ''}">${h.label}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}"><div class="empty-state">Nenhum registro encontrado.</div></td></tr>`}</tbody></table></div>${options.pagination || ''}</section>`;
}
function aggregateTransactions(data, key) {
  return [...data.reduce((map, row) => {
    const label = row[key] || 'Não informado';
    const current = map.get(label) || { label, value: 0, qty: 0, count: 0 };
    current.value += row.ifCost; current.qty += row.qty; current.count += 1; map.set(label, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.value - a.value);
}
function contextLabel(key) {
  return ({ module: 'Material', partNumber: 'Part Number', line: 'Linha', transactionId: 'Transação', alertId: 'Alerta', executionId: 'Execução', source: 'Origem' })[key] || key;
}
function setExplorationContext(next = {}, source = 'navegação') {
  state.context = { ...state.context, ...next, source };
  state.scrapPage = 1; state.scrapSearch = '';
}
function contextTrail() {
  const entries = Object.entries(state.context).filter(([key, value]) => key !== 'source' && value);
  if (!entries.length) return '';
  return `<div class="context-trail"><span class="context-origin">Contexto da investigação</span>${entries.map(([key, value]) => `<span class="context-chip"><small>${contextLabel(key)}</small>${value}<button type="button" data-action="clear-context" data-key="${key}" aria-label="Remover filtro ${contextLabel(key)}">×</button></span>`).join('')}<button class="link-button" data-action="clear-all-context">Limpar contexto</button></div>`;
}
function lineChart(valuesA, valuesB = [], target = 0, height = 210) {
  const index = pendingCharts.push({ valuesA, valuesB, target }) - 1;
  return `<div class="chart echart" data-chart-index="${index}" style="height:${height}px" role="img" aria-label="Gráfico de evolução temporal com tooltip"></div>`;
}
function initCharts() {
  chartInstances.forEach((instance) => instance.dispose()); chartInstances = [];
  if (!window.echarts) return;
  const css = getComputedStyle(document.documentElement), main = css.getPropertyValue('--chart-main').trim(), secondary = css.getPropertyValue('--chart-secondary').trim(), muted = css.getPropertyValue('--app-text-muted').trim(), grid = css.getPropertyValue('--app-chart-grid').trim(), text = css.getPropertyValue('--app-text-secondary').trim();
  $$(state.tvActive ? '#tv-mode .echart' : '#page-content .echart').forEach((element) => {
    const data = pendingCharts[Number(element.dataset.chartIndex)]; if (!data) return;
    const count = Math.max(data.valuesA.length, data.valuesB.length), labels = Array.from({ length: count }, (_, i) => `${String(i + 1).padStart(2, '0')}/08`);
    const series = [{ name: '2026', type: 'line', data: data.valuesA, smooth: .2, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3, color: main }, itemStyle: { color: main } }];
    if (data.valuesB.length) series.push({ name: '2025', type: 'line', data: data.valuesB, smooth: .2, symbol: 'none', lineStyle: { width: 3, color: secondary }, itemStyle: { color: secondary } });
    if (data.target) series.push({ name: 'Meta', type: 'line', data: Array(count).fill(data.target), symbol: 'none', lineStyle: { width: 1.5, type: 'dashed', color: muted }, itemStyle: { color: muted } });
    const instance = echarts.init(element, null, { renderer: 'svg' });
    instance.setOption({ animationDuration: 350, grid: { left: 12, right: 12, top: 15, bottom: 22, containLabel: true }, xAxis: { type: 'category', boundaryGap: false, data: labels, axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: text, fontFamily: 'Fustat Variable', fontSize: 10, interval: Math.max(0, Math.floor(count / 6) - 1) } }, yAxis: { type: 'value', splitNumber: 3, splitLine: { lineStyle: { color: grid } }, axisLabel: { show: false } }, tooltip: { trigger: 'axis', backgroundColor: css.getPropertyValue('--app-surface-raised').trim(), borderColor: css.getPropertyValue('--app-border').trim(), textStyle: { color: css.getPropertyValue('--app-text').trim(), fontFamily: 'Fustat Variable', fontSize: 12 }, formatter(params) { const current = params.find(p => p.seriesName === '2026'), previous = params.find(p => p.seriesName === '2025'); const difference = current && previous ? `<br>Diferença: ${(current.value - previous.value).toLocaleString('pt-BR')}` : ''; return `<strong>${params[0]?.axisValue || ''}</strong><br>${params.map(p => `${p.marker} ${p.seriesName}: ${Number(p.value).toLocaleString('pt-BR')}`).join('<br>')}${difference}`; } }, series });
    chartInstances.push(instance);
  });
}
function barList(items) {
  const max = Math.max(...items.map((i) => i.value));
  return `<div class="bar-list">${items.map((item, index) => `<div class="bar-row"><span>${item.label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4,item.value/max*100)}%;opacity:${1-index*.13}"></div></div><strong>${item.display || formatCurrency(item.value, true)}</strong></div>`).join('')}</div>`;
}
function renderShell() {
  $('#main-navigation').innerHTML = navigation.map((item) => `<li class="nav-menu-item"><a class="nav-button ${state.route === item.route ? 'active' : ''}" href="#${item.route}" ${state.route === item.route ? 'aria-current="page"' : ''}>${icon(item.icon)}<span class="nav-label sidebar-copy">${item.label}</span>${item.badge ? `<span class="nav-badge sidebar-copy">${item.badge}</span>` : ''}</a></li>`).join('');
  $('.utility-button').innerHTML = `${icon('mail')}<span class="sidebar-copy">Ajuda e suporte</span>`;
  $('#sidebar-toggle').innerHTML = icon('sidebar'); $('#mobile-menu').innerHTML = icon('sidebar');
  $('[data-action="notifications"]').innerHTML = `${icon('bell')}<span class="notification-dot"></span>`;
  $('#tv-mode-trigger').innerHTML = icon('tv');
  $('#tv-mode-trigger').hidden = state.route !== 'dashboard';
  $('[data-action="toggle-theme"]').innerHTML = icon(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon');
  $('.profile-menu-trigger').innerHTML = icon('more');
  const current = navigation.find((n) => n.route === state.route) || navigation[0];
  $('#breadcrumb').innerHTML = `<span class="breadcrumb-item">${icon(current.icon)}<span class="breadcrumb-label">${current.label}</span></span>`;
}

function renderDashboard() {
  const factor = state.dashboardFactor;
  const total = model.transactions.reduce((sum, row) => sum + row.ifCost, 0);
  const totalQty = model.transactions.reduce((sum, row) => sum + row.qty, 0);
  const offenders = aggregateTransactions(model.transactions, 'module').slice(0, 3);
  const fields = field('Período', 'dash-period', ['01/08/2026 — 12/08/2026', 'Últimos 7 dias', 'Agosto/2026']) + field('Visão', 'dash-view', ['Acumulado', 'Diário', 'Semanal', 'Mensal']) + field('Division', 'dash-division', ['Todas', 'HE', 'VS']) + field('Departamento', 'dash-department', ['Todos', ...departments]) + field('Linha', 'dash-line', ['Todas', ...lines]) + field('Família', 'dash-family', ['Todas', ...families]) + field('Material', 'dash-module', ['Todos', ...modules]);
  const attention = model.transactions.filter((row) => row.ifCost > 1800).sort((a, b) => b.ifCost - a.ifCost).slice(0, 5).map((row, index) => `<tr><td>${row.date.slice(0,5)}</td><td>${row.department}</td><td>${row.line}</td><td>${row.family}</td><td>${row.product}</td><td><strong>${row.module}</strong><small class="cell-stack">${row.defect}</small></td><td class="number">${row.qty}</td><td class="number"><strong>${formatCurrency(row.ifCost)}</strong></td><td>${badge(row.review.status)}</td><td><div class="table-actions">${button('Ver na Base','dashboard-row-explore',{small:true,id:row.id})}${button(row.review.status==='Justificado'?'Ver revisão':'Revisar','dashboard-row-review',{small:true,primary:true,id:row.id})}</div></td></tr>`).join('');
  const offenderCards = offenders.map((item, index) => `<article class="offender-row"><span class="offender-rank">${index + 1}</span><div><strong>${item.label}</strong><small>${formatNumber(item.qty)} un. · ${item.count} registros</small><div class="bar-track"><i style="width:${item.value / offenders[0].value * 100}%"></i></div></div><b>${formatCurrency(item.value * factor, true)}</b><div class="table-actions">${button('Explorar na Base','dashboard-explore',{small:true,primary:true,id:item.label})}</div></article>`).join('');
  return `<section class="page-stack">${pageHeader('Dashboard de Scrap', `${button('Atualizar','refresh-dashboard',{icon:'refresh'})}${button('Exportar dados','export-dashboard',{icon:'download'})}${button('Gerar relatório','go-reports',{icon:'report'})}`)}<section class="automation-banner">${icon('refresh')}<div><strong>Fluxo automatizado ativo</strong><span>GERP → processamento Hanaro → indicadores → investigação → relatório</span></div><small>Última execução concluída às 05:08</small></section>${filtersPanel(fields, `<span class="filter-note">Filtros atualizam indicadores e rankings</span><button class="link-button" data-action="clear-dashboard">Limpar filtros</button>`)}<section class="kpi-grid">${kpiCard('IF Cost acumulado', formatCurrency(total*factor), 'Ago/2026 · calculado automaticamente')}${kpiCard('Mesmo período 2025', formatCurrency(212300*factor), '↓ US$ 28.040')}${kpiCard('Redução YoY', formatPercentage(-13.2/factor), 'Meta anual: -15%', 'success')}${kpiCard('Gap para meta', `${(1.8*factor).toLocaleString('pt-BR',{maximumFractionDigits:1})} p.p.`, 'US$ 3.805 acima do target', 'danger')}${kpiCard('Scrap registrado', `${formatNumber(Math.round(totalQty*factor))} un.`, `${model.transactions.length} transações`)}</section><section class="content-grid"><article class="panel"><header class="panel-header"><div><h2>Evolução diária do IF Cost</h2><p class="panel-description">Comparativo automático 2026, 2025 e meta</p></div></header><div class="chart-legend"><span class="legend-key" style="--key:var(--chart-main)">2026</span><span class="legend-key" style="--key:var(--chart-secondary)">2025</span><span class="legend-key" style="--key:var(--app-text-muted)">Meta</span></div>${lineChart([8,9,11,14,18,23,25,22,24,27,26,29].map(v=>v*factor),[12,13,17,20,19,18,25,28,31,29,33,35],24)}</article><article class="panel offender-panel"><header class="panel-header"><div><h2 class="metric-title">Top ofensores <span class="metric-help" tabindex="0" role="button" aria-label="Como o IF Cost é calculado">${icon('alert')}<span class="metric-tooltip" role="tooltip"><strong>O que é IF Cost?</strong> É o custo das perdas internas de produção. Cada registro considera o valor local do scrap convertido para USD pela taxa de câmbio aplicável. O ranking soma esse custo por componente e ordena do maior para o menor.</span></span> IF Cost</h2><p class="panel-description">Ponto de partida para investigação</p></div></header>${offenderCards}</article></section><section class="content-grid equal"><article class="panel"><header class="panel-header"><h2>Pareto de componentes</h2></header>${barList(aggregateTransactions(model.transactions,'partNumber').slice(0,5))}</article><article class="panel"><header class="panel-header"><h2>IF Cost por departamento</h2></header>${barList(aggregateTransactions(model.transactions,'department'))}</article></section>${tablePanel('Ocorrências que exigem atenção',[{label:'Data'},{label:'Departamento'},{label:'Linha'},{label:'Família'},{label:'Produto'},{label:'Componente'},{label:'QTY',number:true},{label:'IF Cost',number:true},{label:'Status'},{label:'Ações'}],attention)}</section>`;
}

function filteredTransactions() {
  const q = state.scrapSearch.toLowerCase();
  const contextualAlert = state.context.alertId ? model.alerts.find((alert) => alert.id === state.context.alertId) : null;
  let data = model.transactions.filter((t) =>
    (!q || [t.id,t.partNumber,t.product,t.executionId,t.module,t.defect,t.occurrence,t.station].some((v) => v.toLowerCase().includes(q))) &&
    (state.scrapFilters.date==='Todas as datas'||state.scrapFilters.date==='Agosto/2026'||(state.scrapFilters.date==='Hoje'&&t.date==='12/08/2026')||(state.scrapFilters.date==='Últimos 7 dias'&&Number(t.date.slice(0,2))>=6)) &&
    (state.scrapFilters.division==='Todas'||t.division===state.scrapFilters.division) &&
    (state.scrapFilters.department==='Todos'||t.department===state.scrapFilters.department) &&
    (state.scrapFilters.line==='Todas'||t.line===state.scrapFilters.line) &&
    (state.scrapFilters.reviewStatus==='Todos'||t.review.status===state.scrapFilters.reviewStatus) &&
    (!state.context.module || t.module === state.context.module) &&
    (!state.context.partNumber || t.partNumber === state.context.partNumber) &&
    (!state.context.line || t.line === state.context.line) &&
    (!state.context.transactionId || t.id === state.context.transactionId) &&
    (!contextualAlert?.transactionIds.length || contextualAlert.transactionIds.includes(t.id)) &&
    (!state.context.executionId || t.executionId === state.context.executionId));
  const { key, direction } = state.scrapSort;
  data = [...data].sort((a,b) => String(a[key]).localeCompare(String(b[key]),'pt-BR',{numeric:true}) * (direction === 'asc' ? 1 : -1));
  return data;
}
function pagination(total) {
  const pages = Math.max(1,Math.ceil(total/state.scrapPageSize)); state.scrapPage = Math.min(state.scrapPage,pages);
  return `<div class="pagination"><span>${total} registros · página ${state.scrapPage} de ${pages}</span><div class="pagination-actions"><select class="control" id="page-size" aria-label="Registros por página"><option ${state.scrapPageSize===10?'selected':''}>10</option><option ${state.scrapPageSize===25?'selected':''}>25</option><option ${state.scrapPageSize===50?'selected':''}>50</option></select><button class="btn small" data-action="page-prev" ${state.scrapPage===1?'disabled':''}>${icon('chevronLeft')}</button><button class="btn small" data-action="page-next" ${state.scrapPage===pages?'disabled':''}>${icon('chevronRight')}</button></div></div>`;
}
function renderScrap() {
  if(state.scrapView==='review') return renderScrapReview();
  const filtered = filteredTransactions(), start = (state.scrapPage-1)*state.scrapPageSize, data = filtered.slice(start,start+state.scrapPageSize);
  const rows = data.map((t) => `<tr data-row-id="${t.id}" data-row-type="transaction" class="${state.selectedScrapIds.includes(t.id)?'selected-row':''}" title="${t.occurrence}"><td><input type="checkbox" data-action="toggle-scrap" data-id="${t.id}" aria-label="Selecionar ${t.id}" ${state.selectedScrapIds.includes(t.id)?'checked':''}></td><td>${t.date}</td><td>${t.department}<small class="cell-stack">${t.line}</small></td><td>${t.product}<small class="cell-stack">${t.family}</small></td><td><strong>${t.partNumber}</strong><small class="cell-stack">${t.module}</small><small class="cell-stack cell-defect">${t.defect}</small></td><td class="number">${t.qty}</td><td class="number"><strong>${t.ifCost ? formatCurrency(t.ifCost) : '—'}</strong></td><td>${badge(t.review.status)}</td><td>${button(t.review.status==='Justificado'?'Ver revisão':'Revisar','review-one',{small:true,id:t.id})}</td></tr>`).join('');
  const ifCost=filtered.reduce((sum,row)=>sum+row.ifCost,0),qty=filtered.reduce((sum,row)=>sum+row.qty,0),share=ifCost/model.transactions.reduce((sum,row)=>sum+row.ifCost,0)*100;
  const ranking=aggregateTransactions(filtered,'partNumber').slice(0,8);
  const selected=model.transactions.filter(row=>state.selectedScrapIds.includes(row.id));
  const sortLabel=(label,key)=>`<button class="sort-button" data-action="sort-scrap" data-key="${key}">${label}${state.scrapSort.key===key?(state.scrapSort.direction==='asc'?' ↑':' ↓'):''}</button>`;
  const selectionBar=selected.length?`<section class="selection-bar"><div><strong>${selected.length} registro${selected.length>1?'s':''} selecionado${selected.length>1?'s':''}</strong><span>${formatNumber(selected.reduce((sum,row)=>sum+row.qty,0))} un. · ${formatCurrency(selected.reduce((sum,row)=>sum+row.ifCost,0))}</span></div>${button('Limpar seleção','clear-scrap-selection')}${button('Justificar selecionados','review-selected',{primary:true,icon:'check'})}</section>`:'';
  return `<section class="page-stack">${pageHeader('Base de Scrap',button('Exportar dados','export-scrap',{icon:'download'}))}<section class="filter-panel context-panel scrap-filter-panel">${contextTrail()}<div class="scrap-search-row"><div class="search-wrap scrap-search">${icon('search')}<input class="search-control" id="scrap-search" value="${state.scrapSearch}" placeholder="Buscar Part Number, produto ou ID..." aria-label="Buscar registros de scrap"></div><button class="btn" data-action="more-filters">${icon('filter')}Mais filtros</button></div><div class="scrap-filter-grid">${field('Data da transação','scrap-date',['Todas as datas','Hoje','Últimos 7 dias','Agosto/2026'],state.scrapFilters.date)}${field('Division','scrap-division',['Todas','HE','VS'],state.scrapFilters.division)}${field('Departamento','scrap-department',['Todos',...departments],state.scrapFilters.department)}${field('Linha','scrap-line',['Todas',...lines],state.scrapFilters.line)}${field('Status da revisão','scrap-review-status',['Todos','Pendente de revisão','Em revisão','Justificado'],state.scrapFilters.reviewStatus)}</div></section>${selectionBar}<section class="kpi-grid">${kpiCard('IF Cost filtrado',formatCurrency(ifCost))}${kpiCard('QTY filtrada',formatNumber(qty))}${kpiCard('Participação no total',`${share.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`)}${kpiCard('Pendentes de revisão',formatNumber(filtered.filter(row=>row.review.status!=='Justificado').length))}${kpiCard('Justificados',formatNumber(filtered.filter(row=>row.review.status==='Justificado').length))}</section><section class="panel ranking-panel"><header class="panel-header"><div><h2>Ranking de Part Numbers</h2><p class="panel-description">Use o ranking para filtrar; selecione registros na tabela para justificá-los.</p></div></header><div class="ranking-grid">${ranking.map((item,index)=>`<button class="ranking-item" data-action="drill-part" data-id="${item.label}"><span>${index+1}</span><div><strong>${item.label}</strong><small>${item.count} registros · ${formatNumber(item.qty)} un.</small><i><b style="width:${item.value/ranking[0].value*100}%"></b></i></div><em>${formatCurrency(item.value)}</em>${icon('chevronRight')}</button>`).join('')||'<div class="empty-state">Nenhum Part Number no contexto atual.</div>'}</div></section>${tablePanel('Registros de scrap',[{label:`<input type="checkbox" data-action="select-visible-scrap" aria-label="Selecionar registros visíveis" ${data.length&&data.every(row=>state.selectedScrapIds.includes(row.id))?'checked':''}>`},{label:sortLabel('Data','date')},{label:'Departamento / Linha'},{label:'Produto / Família'},{label:sortLabel('Part Number','partNumber')},{label:sortLabel('QTY','qty'),number:true},{label:sortLabel('IF Cost','ifCost'),number:true},{label:'Revisão'},{label:'Ação'}],rows,{pagination:pagination(filtered.length)})}</section>`;
}

function syncScrapReview() {
  const row=model.transactions.find(item=>item.id===state.activeReviewId); if(!row)return;
  row.review.category=$('#review-category')?.value||row.review.category;
  row.review.reason=$('#review-reason')?.value||row.review.reason;
  row.review.requiresCause=$('#review-requires-cause')?.checked??row.review.requiresCause;
  row.review.rootCause=$('#review-root-cause')?.value||row.review.rootCause;
  row.review.corrective=$('#review-corrective')?.value||row.review.corrective;
  row.review.preventive=$('#review-preventive')?.value||row.review.preventive;
  row.review.responsible=$('#review-responsible')?.value||row.review.responsible;
  row.review.includeInReport=$('#review-include-report')?.checked??row.review.includeInReport;
}
function renderScrapReview() {
  const selected=model.transactions.filter(row=>state.selectedScrapIds.includes(row.id));
  if(!selected.length){state.scrapView='list';return renderScrap();}
  if(!selected.some(row=>row.id===state.activeReviewId))state.activeReviewId=selected[0].id;
  const row=selected.find(item=>item.id===state.activeReviewId),review=row.review;
  const list=selected.map((item,index)=>`<button class="review-list-item ${item.id===row.id?'active':''}" data-action="select-review-item" data-id="${item.id}"><span>${index+1}</span><div><strong>${item.partNumber}</strong><small>${item.defect}</small><small>${item.id} · ${item.line}</small></div>${badge(item.review.status)}</button>`).join('');
  return `<section class="page-stack review-subpage">${pageHeader('Revisar registros de scrap',`${button('Voltar para a Base','back-scrap',{icon:'chevronLeft'})}${button('Salvar rascunho','save-scrap-review')}${button(`Concluir ${selected.length} revisão${selected.length>1?'ões':''}`,'conclude-scrap-review',{primary:true,icon:'check'})}`)}<div class="review-context"><span>Base de Scrap</span>${icon('chevronRight')}<strong>${selected.length} registro${selected.length>1?'s':''} selecionado${selected.length>1?'s':''}</strong></div><div class="review-layout"><aside class="review-list"><header><h2>Seleção</h2><p>A justificativa pode ser revisada item a item.</p></header>${list}<footer><strong>${formatCurrency(selected.reduce((sum,item)=>sum+item.ifCost,0))}</strong><span>${formatNumber(selected.reduce((sum,item)=>sum+item.qty,0))} unidades</span></footer></aside><article class="review-workspace"><section class="review-facts"><header><div><span class="block-kicker">Registro de scrap</span><h2>${row.partNumber} · ${row.product}</h2><p>${row.id}</p></div>${badge(review.status)}</header><div class="meta-grid">${[['Data',row.date],['Departamento',row.department],['Linha',row.line],['Módulo',row.module],['QTY',`${row.qty} un.`],['IF Cost',formatCurrency(row.ifCost)],['Origem',row.source],['Execução',row.executionId]].map(([label,value])=>`<div class="meta-item"><small>${label}</small><strong>${value}</strong></div>`).join('')}</div></section><section class="review-form"><header><div><span class="block-kicker">Revisão humana</span><h2>Justificativa do scrap</h2><p>Explique por que o item foi registrado como scrap. Os campos serão auditados.</p></div><label class="checkbox-row"><input id="review-include-report" type="checkbox" ${review.includeInReport?'checked':''}> Incluir no próximo relatório</label></header><div class="form-grid">${field('Categoria da justificativa','review-category',['Selecione...','Material','Processo','Máquina','Mão de obra','Engenharia','Fornecedor','Outro'],review.category)}<div class="field"><label for="review-responsible">Revisor responsável</label><input class="control" id="review-responsible" value="${review.responsible}"></div><div class="field full"><label for="review-reason">Justificativa obrigatória</label><textarea class="control" id="review-reason" placeholder="Descreva o motivo deste registro de scrap...">${review.reason}</textarea></div><div class="field full"><label class="checkbox-row cause-toggle"><input id="review-requires-cause" type="checkbox" ${review.requiresCause?'checked':''}> Este item exige análise de causa detalhada</label><p class="field-help">Ative somente quando a justificativa simples não for suficiente para explicar o scrap.</p></div>${review.requiresCause?`<div class="field full"><span class="field-label">Classificação 4M</span><div class="choice-group">${['Machine','Method','Material','Man'].map(value=>`<button class="choice ${review.classification4m.includes(value)?'selected':''}" data-action="toggle-review-4m" data-value="${value}">${value}</button>`).join('')}</div></div><div class="field full"><label for="review-root-cause">Causa identificada</label><textarea class="control" id="review-root-cause" placeholder="Registre a causa validada...">${review.rootCause}</textarea></div><div class="field"><label for="review-corrective">Ação corretiva</label><input class="control" id="review-corrective" value="${review.corrective}" placeholder="Ação imediata"></div><div class="field"><label for="review-preventive">Ação preventiva</label><input class="control" id="review-preventive" value="${review.preventive}" placeholder="Prevenção de recorrência"></div>`:''}</div><section class="review-evidence"><header><div><h3>Evidências (${review.evidence.length})</h3><p>Fotos, documentos ou comentários vinculados ao registro.</p></div>${button('Adicionar evidência','add-review-evidence',{small:true,icon:'plus'})}</header>${review.evidence.length?review.evidence.map(item=>`<span class="badge brand">${icon('file')}${item}</span>`).join(' '):'<div class="review-empty">Nenhuma evidência adicionada.</div>'}</section></section>${selected.length>1?`<label class="apply-all"><input id="review-apply-all" type="checkbox" checked><span><strong>Aplicar esta justificativa aos ${selected.length} registros selecionados</strong><small>Você ainda pode abrir cada item e ajustar dados individuais antes de concluir.</small></span></label>`:''}</article></div></section>`;
}

function renderAlerts() {
  const visible=model.alerts.filter(a=>state.alertSeverity==='Todas'||a.severity===state.alertSeverity);
  const rows=visible.map(a=>`<tr data-row-id="${a.id}" data-row-type="alert"><td>${badge(a.severity)}</td><td>${a.dateTime}</td><td><strong>${a.type}</strong><small class="cell-stack">${a.id}</small></td><td>${a.department}<small class="cell-stack">${a.line}</small></td><td>${a.module}</td><td class="number"><strong>${formatCurrency(a.impact)}</strong></td><td class="cell-ellipsis">${a.description}</td><td>${badge(a.status)}</td><td>${a.channel}</td><td>${button('Ver registros','alert-transactions',{small:true,primary:true,id:a.id})}</td></tr>`).join('');
  const fields=field('Período','alert-period',['Últimos 7 dias','Hoje','Últimos 30 dias'])+field('Severidade','alert-severity',['Todas','Crítico','Alto','Médio'],state.alertSeverity)+field('Tipo','alert-type',['Todos','Objeto estranho na esteira','Defeito de montagem','Falha no teste funcional','Desvio de torque'])+field('Departamento','alert-dept',['Todos',...departments])+field('Linha','alert-line',['Todas',...lines])+field('Componente afetado','alert-module',['Todos',...modules])+field('Status','alert-status',['Todos','Novo','Lido','Arquivado']);
  return `<section class="page-stack">${pageHeader('Alertas',`${button('Atualizar','refresh-alerts',{icon:'refresh'})}${button('Exportar','export-alerts',{icon:'download'})}${button('Marcar novos como lidos','read-alerts',{primary:true})}`)}${filtersPanel(fields)}<section class="kpi-grid">${kpiCard('Novos',String(model.alerts.filter(a=>a.status==='Novo').length),'Notificações ainda não abertas','danger')}${kpiCard('Críticos','6','','danger')}${kpiCard('Lidos',String(model.alerts.filter(a=>a.status==='Lido').length))}${kpiCard('Enviados por e-mail',String(model.alerts.filter(a=>a.channel.includes('E-mail')).length))}</section><section class="content-grid equal"><article class="panel"><header class="panel-header"><h2>Alertas por dia</h2></header>${barList(['06/08','07/08','08/08','09/08','10/08','11/08','12/08'].map((d,i)=>({label:d,value:[3,6,4,8,5,7,10][i],display:`${[3,6,4,8,5,7,10][i]} alertas`})))}</article><article class="panel"><header class="panel-header"><div><h2>Origem das notificações</h2><p class="panel-description">Alertas apenas comunicam eventos; a revisão ocorre na Base de Scrap.</p></div></header>${barList([{label:'E-mail e plataforma',value:10,display:'10 alertas'},{label:'Somente plataforma',value:10,display:'10 alertas'}])}</article></section>${tablePanel('',[{label:'Severidade'},{label:'Data/Hora'},{label:'Evento'},{label:'Departamento / Linha'},{label:'Módulo'},{label:'Impacto',number:true},{label:'Descrição'},{label:'Leitura'},{label:'Canal'},{label:'Ação'}],rows)}</section>`;
}

function renderAnalyses() {
  return '';
  const selected=model.analyses.find(a=>a.id===state.selectedAnalysis)||model.analyses[0];
  const related=model.transactions.filter(row=>selected.transactionIds.includes(row.id)||(!selected.transactionIds.length&&row.partNumber===selected.partNumber));
  const topLines=aggregateTransactions(related,'line').slice(0,3),topParts=aggregateTransactions(related,'partNumber').slice(0,3);
  const cards=model.analyses.map(a=>`<button class="case-card ${a.id===selected.id?'active':''}" data-action="select-analysis" data-id="${a.id}"><span class="case-card-header"><small>${a.id}</small>${badge(a.severity)}</span><strong>${a.module}</strong><small>${a.line}</small><span class="case-card-footer"><b>${formatCurrency(a.impact)}</b>${badge(a.status)}</span></button>`).join('');
  const workflow=['Pendente','Em análise','Concluído','Reaberto'];
  return `<section class="page-stack">${pageHeader('Análise de Causa',`${button('Salvar rascunho','save-analysis')}${button('Adicionar evidência','add-evidence',{icon:'plus'})}${selected.status==='Concluído'?button('Reabrir análise','reopen-analysis',{primary:true}):button('Concluir análise','conclude-analysis',{primary:true})}`)}<div class="split-layout"><aside class="case-list" aria-label="Análises"><div class="case-list-controls"><h2 class="section-title">Análises</h2><p class="panel-description">Pendentes, em andamento e concluídas</p><div class="search-wrap">${icon('search')}<input class="search-control" placeholder="Buscar análise..." aria-label="Buscar análise"></div></div><div class="case-list-items">${cards}</div></aside><article class="case-detail"><div class="workflow-strip">${workflow.map(item=>`<span class="${selected.status===item?'active':''}">${item}</span>`).join('')}</div><section class="detail-hero"><div><small>${selected.id}</small><h2>${selected.module} — ${selected.line}</h2><span>${badge(selected.status)}</span></div><div><small>Impacto financeiro calculado</small><div class="detail-hero-value">${formatCurrency(selected.impact)}</div></div></section><section class="analysis-block system-block"><header><div><span class="block-kicker">Dados do sistema</span><h2>Fatos calculados automaticamente</h2><p>Origem GERP · execução, transações e alertas preservados para rastreabilidade</p></div>${button('Ver transações relacionadas','analysis-transactions',{small:true,id:selected.id})}</header><div class="meta-grid">${[['QTY refugada',`${selected.qty} un.`],['Variação (14d)',formatPercentage(selected.variation)],['Part Number',selected.partNumber],['Departamento',selected.department],['Produto',selected.product],['Data registro',selected.date],['Alertas vinculados',selected.alertIds?.join(', ')||'Nenhum'],['Transações vinculadas',String(related.length)]].map(([l,v])=>`<div class="meta-item"><small>${l}</small><strong>${v}</strong></div>`).join('')}</div><div class="analysis-facts-grid"><article><h3>Histórico de IF Cost — 14 dias</h3>${lineChart([3,4,3,5,6,5,7,6,8,9,8,11,10,14],[],7,130)}</article><article><h3>Top linhas relacionadas</h3>${barList(topLines.length?topLines:[{label:selected.line,value:selected.impact}])}</article><article><h3>Top Part Numbers</h3>${barList(topParts.length?topParts:[{label:selected.partNumber,value:selected.impact}])}</article></div></section><section class="analysis-block user-block"><header><div><span class="block-kicker">Análise do usuário</span><h2>Interpretação e plano de ação</h2><p>Campos preenchidos pelo analista; todas as alterações são auditadas.</p></div><label class="checkbox-row"><input id="include-report" type="checkbox" ${selected.includeInReport?'checked':''}> Incluir no relatório automático</label></header><div class="form-grid"><div class="field"><span class="field-label">Classificação 4M (múltipla escolha)</span><div class="choice-group">${['Machine','Method','Material','Man'].map(v=>`<button class="choice ${selected.selected4m.includes(v)?'selected':''}" data-action="toggle-4m" data-value="${v}">${v}</button>`).join('')}</div></div>${field('Origem provável','analysis-origin',['Ainda não definida','Processo interno / Linha','Fornecedor'],selected.origin)}${field('Sintoma observado','analysis-symptom',['Selecione...','Dano visual','Quebra','Falha elétrica','Montagem incorreta','Componente fora de especificação','Outro'],selected.symptom)}<div class="field"><label for="analysis-cause">Causa raiz</label><input class="control" id="analysis-cause" value="${selected.cause}" placeholder="Hipótese ou causa validada"></div><div class="field full"><label for="analysis-notes">Observações e conclusão técnica</label><textarea class="control" id="analysis-notes" placeholder="Registre evidências, interpretação e conclusão...">${selected.notes}</textarea></div><div class="field"><label for="corrective">Ação corretiva</label><input class="control" id="corrective" value="${selected.corrective}" placeholder="Ação imediata"></div><div class="field"><label for="preventive">Ação preventiva</label><input class="control" id="preventive" value="${selected.preventive}" placeholder="Prevenção de recorrência"></div><div class="field"><label for="responsible">Responsável</label><input class="control" id="responsible" value="${selected.responsible}"></div><div class="field"><label for="deadline">Prazo</label><input class="control" id="deadline" value="${selected.deadline}"></div></div></section><section class="form-section"><header class="panel-header"><h2>Evidências (${selected.evidence.length})</h2></header>${selected.evidence.length?selected.evidence.map(e=>`<span class="badge brand">${icon('file')}${e}</span>`).join(' '):'<p class="panel-description">Nenhuma evidência adicionada neste caso.</p>'}</section></article></div></section>`;
}

function renderReports() {
  const tabs=`<div class="tabs" role="tablist">${[['gerar','Gerar relatório'],['versoes','Versões'],['envios','Envios']].map(([id,l])=>`<button class="tab ${state.reportTab===id?'active':''}" data-action="report-tab" data-id="${id}">${l}</button>`).join('')}</div>`;
  let content='';
  const reviewed=model.transactions.filter(row=>row.review.status==='Justificado');
  const included=reviewed.filter(row=>row.review.includeInReport);
  if(state.reportTab==='gerar') content=`<div class="report-builder"><section><div class="form-grid">${field('Tipo','report-type',['Semanal','Diário','Mensal'],'Semanal')}<div class="field"><label>Período</label><input class="control" id="report-period" value="Semana W33 · 10/08/2026 — 16/08/2026"></div>${field('Comparação','report-compare',['Acumulado 2026 vs 2025','Mesmo período 2025','Sem comparação'])}<div class="field full"><label for="report-observation">Observação do responsável</label><textarea class="control" id="report-observation" placeholder="Comentário opcional para contextualizar o período..."></textarea></div><div class="field full"><span class="field-label">Conteúdo consolidado</span>${['Indicadores e comparativo','Top ofensores','Scraps revisados e suas justificativas'].map(x=>`<label class="checkbox-row"><input type="checkbox" checked> ${x}</label>`).join('')}</div></div><section class="report-analysis-list"><header><div><h2>Registros justificados do período</h2><p>Somente scraps revisados podem compor o relatório.</p></div>${badge(`${included.length} incluídos`,'brand')}</header>${reviewed.map(row=>`<article><button class="report-check ${row.review.includeInReport?'selected':''}" data-action="toggle-report-review" data-id="${row.id}" aria-pressed="${row.review.includeInReport}">${icon('check')}</button><div><strong>${row.partNumber} · ${row.line}</strong><small>${row.review.category} · ${row.review.reason} · ${formatCurrency(row.ifCost)}</small></div>${button('Ver revisão','open-report-review',{small:true,id:row.id})}</article>`).join('')||'<div class="empty-state">Nenhum registro justificado no período.</div>'}</section></section><aside><div class="report-preview"><small class="block-kicker">Preview · W33</small><h2>Relatório de Material Scrap</h2><div class="preview-comparison"><div><small>IF COST REVISADO</small><div class="preview-value">${formatCurrency(included.reduce((sum,row)=>sum+row.ifCost,0)*state.reportFactor)}</div></div><div><small>${included.length} registros</small><div class="positive">Justificados</div></div></div>${lineChart([5,7,6,9,8,11].map(v=>v*state.reportFactor),[4,5,4.5,7,6,9],0,125)}<h3>Justificativas predominantes</h3>${barList(aggregateTransactions(included.length?included:reviewed,'module').slice(0,3))}<div class="preview-foot"><span>${included.length} scraps incluídos</span><span>Revisões rastreáveis</span></div></div><div class="inline-actions report-actions">${button('Gerar PDF','generate-pdf',{icon:'report'})}${button('Gerar Excel','generate-excel',{icon:'download'})}${button('Gerar e registrar versão','register-report',{primary:true,icon:'check'})}</div></aside></div>`;
  if(state.reportTab==='versoes'){const rows=model.reports.map(r=>`<tr data-row-id="${r.id}" data-row-type="report"><td><strong>${r.id}</strong><small class="cell-stack">${r.version}</small></td><td>${r.type}</td><td>${r.period}</td><td>${r.generatedAt}</td><td>${r.author}</td><td class="number">${formatCurrency(r.ifCost)}</td><td>${r.reviewIds?.length||0}</td><td>${r.format}</td><td>${badge(r.status)}</td></tr>`).join('');content=tablePanel('',[{label:'ID rastreável'},{label:'Tipo'},{label:'Período'},{label:'Gerado em'},{label:'Gerado por'},{label:'IF Cost',number:true},{label:'Scraps revisados'},{label:'Formato'},{label:'Status'}],rows)}
  if(state.reportTab==='envios'){const rows=model.sends.map((s,i)=>`<tr><td><strong>${s.report}</strong></td><td>${s.recipient}</td><td>${s.channel}</td><td>${s.requestedAt}</td><td>${badge(s.status)}</td><td class="number">${s.attempts}</td><td>${s.status==='Falha'?button('Reenviar','resend-report',{small:true,id:String(i)}):s.status==='Pendente'?button('Simular envio','send-report',{small:true,id:String(i)}):'—'}</td></tr>`).join('');content=tablePanel('',[{label:'Relatório'},{label:'Destinatário'},{label:'Canal'},{label:'Solicitado em'},{label:'Status'},{label:'Tentativas',number:true},{label:'Ação'}],rows)}
  return `<section class="page-stack">${pageHeader('Relatórios',`${button('Exportar histórico','export-reports',{icon:'download'})}${button('Novo relatório','new-report',{icon:'plus',primary:true})}`)}${tabs}${content}</section>`;
}

function renderExecutions() {
  const visible=model.executions.filter(e=>state.executionStatus==='Todos'||e.status===state.executionStatus);
  const rows=visible.map(e=>`<tr data-row-id="${e.id}" data-row-type="execution"><td><strong>${e.id}</strong></td><td>${e.source}</td><td>${e.process}</td><td>${e.start}</td><td>${e.end}</td><td>${e.duration}</td><td class="number">${formatNumber(e.received)}</td><td class="number">${formatNumber(e.valid)}</td><td class="number">${e.rejected}</td><td>${badge(e.status)}</td></tr>`).join('');
  const fields=field('Período','exec-period',['Hoje','Últimos 7 dias','Últimos 30 dias'])+field('Status','exec-status',['Todos','Concluído','Parcial','Falha'],state.executionStatus)+field('Origem','exec-source',['Todas','GERP','Contingência operacional'])+field('Tipo','exec-type',['Todos','Ingestão automática','Importação contingencial'])+`<div class="field"><label>Execution ID</label><input class="control" placeholder="EXE-..."></div>`;
  return `<section class="page-stack">${pageHeader('Execuções',button('Atualizar','refresh-executions',{icon:'refresh'}))}<section class="automation-banner">${icon('clock')}<div><strong>Coleta automática agendada</strong><span>Other Account Transaction Text Download · diariamente às 05:00 · origem GERP</span></div><small>Próxima execução: 13/08/2026 05:00</small></section>${filtersPanel(fields)}<section class="kpi-grid">${kpiCard('Execuções hoje','12','Disparadas pelo agendamento')}${kpiCard('Concluídas','10','','success')}${kpiCard('Parciais','1','','warning')}${kpiCard('Falhas','1','Reprocessamento disponível','danger')}${kpiCard('Registros processados','8.426')}</section>${tablePanel('',[{label:'Execution ID'},{label:'Origem'},{label:'Processo'},{label:'Início'},{label:'Fim'},{label:'Duração'},{label:'Recebidos',number:true},{label:'Válidos',number:true},{label:'Rejeitados',number:true},{label:'Status'}],rows)}<article class="panel"><header class="panel-header"><div><h2>Falhas por categoria — últimos 30 dias</h2><p class="panel-description">A contingência só é liberada após uma tentativa de reprocessamento sem sucesso.</p></div></header>${barList([{label:'Câmbio indisponível',value:12,display:'12 ocorrências'},{label:'Arquivo inválido',value:7,display:'7 ocorrências'},{label:'Duplicidade',value:5,display:'5 ocorrências'},{label:'Schema divergente',value:3,display:'3 ocorrências'}])}</article></section>`;
}

function renderAudit() {
  const q=state.auditSearch.toLowerCase(), events=model.audit.filter(e=>(state.auditEntity==='Todas'||e.entity===state.auditEntity)&&(!q||Object.values(e).some(v=>String(v).toLowerCase().includes(q))));
  const rows=events.map(e=>`<tr data-row-id="${e.id}" data-row-type="audit"><td>${e.timestamp}</td><td>${e.actor}</td><td>${e.origin}</td><td><strong>${e.action}</strong></td><td>${e.entity}</td><td>${e.identifier}</td><td>${e.before}</td><td>${badge(e.after)}</td><td>${e.correlation}</td></tr>`).join('');
  return `<section class="page-stack">${pageHeader('Auditoria',button('Exportar eventos','export-audit',{icon:'download'}))}<section class="filter-panel"><div class="search-wrap">${icon('search')}<input class="search-control" id="audit-search" value="${state.auditSearch}" placeholder="Buscar ID, usuário, entidade ou descrição..."></div><div class="filters">${field('Período','audit-period',['Hoje','Últimos 7 dias'])+field('Ator','audit-actor',['Todos','m.franca','hanaro-backend'])+field('Tipo','audit-type',['Todos','Humano','Automático'])+field('Entidade','audit-entity',['Todas','Transaction','Execution','Alert','Report'],state.auditEntity)+field('Severidade','audit-severity',['Todas','Informativo','Crítico'])}</div></section><section class="kpi-grid">${kpiCard('Eventos hoje',formatNumber(284))}${kpiCard('Ações humanas','73')}${kpiCard('Eventos automáticos','211')}${kpiCard('Eventos críticos','3','','danger')}</section>${tablePanel('',[{label:'Timestamp'},{label:'Ator'},{label:'Origem'},{label:'Ação'},{label:'Entidade'},{label:'Identificador'},{label:'Estado anterior'},{label:'Estado posterior'},{label:'Correlation ID'}],rows)}</section>`;
}

function renderSettings() {
  const tabLabels=[['negocio','Negócio'],['dados','Dados'],['relatorios','Relatórios'],['notificacoes','Notificações'],['acesso','Acesso'],['integracoes','Integrações'],['interface','Interface']];
  const tabs=`<div class="tabs">${tabLabels.map(([id,l])=>`<button class="tab ${state.settingsTab===id?'active':''}" data-action="settings-tab" data-id="${id}">${l}</button>`).join('')}</div>`;
  let content='';
  if(state.settingsTab==='negocio') content=`<article class="settings-card"><h2>Metas de Material Scrap</h2><p>Parâmetros usados nos comparativos de IF Cost.</p><div class="form-grid"><div class="field"><label>Baseline</label><input class="control" value="${model.settings.baseline}"></div><div class="field"><label>Meta de redução</label><input class="control" id="setting-target" value="${model.settings.target}%"></div><div class="field"><label>Ano</label><input class="control" value="${model.settings.year}"></div><div class="field"><span class="field-label">Escopo</span><div class="choice-group">${families.map(f=>`<button class="choice selected" data-action="toggle-choice">${f}</button>`).join('')}</div></div></div><div class="setting-row"><div><strong>Componentes prioritários</strong><p>1. Tela LCD · 2. Placa principal PCB · 3. Moldura frontal</p></div>${badge('Ativo')}</div></article>`;
  if(state.settingsTab==='dados') content=`<article class="settings-card"><h2>Regras de dados</h2><p>Parâmetros fictícios sujeitos à homologação.</p><div class="setting-row"><div><strong>Alias Codes</strong><p>${aliases.join(' · ')}</p></div>${badge('Sujeito à homologação','warning')}</div><div class="setting-row"><div><strong>Contingência pós-falha</strong><p>Liberada apenas por uma execução cujo reprocessamento também falhou.</p></div><button class="switch ${model.settings.upload?'on':''}" data-action="toggle-setting" data-key="upload" aria-label="Alternar contingência pós-falha"></button></div><div class="setting-row"><div><strong>Validação obrigatória</strong><p>Valida o arquivo antes da recuperação.</p></div><button class="switch ${model.settings.validation?'on':''}" data-action="toggle-setting" data-key="validation"></button></div></article>`;
  if(state.settingsTab==='relatorios') content=`<article class="settings-card"><h2>Padrões de relatório</h2><p>Preferências aplicadas a novos relatórios.</p><div class="form-grid">${field('Frequência padrão','setting-frequency',['Semanal','Diário','Mensal'],model.settings.reportFrequency)+field('Visão','setting-view',['Acumulado','Mensal','Semanal'])+field('Comparação','setting-compare',['YoY','Sem comparação'])+field('Formato','setting-format',['PDF','XLSX'])}</div></article>`;
  if(state.settingsTab==='notificacoes') content=tablePanel('',[{label:'Nome'},{label:'Grupo'},{label:'E-mail'},{label:'Tipo'},{label:'Status'}],[['Alertas críticos','Qualidade','qualidade@exemplo.local','Imediato','Ativo'],['Resumo semanal','Gestores','gestores@exemplo.local','Semanal','Ativo'],['Falhas de ingestão','Dados','dados@exemplo.local','Imediato','Pausado']].map(r=>`<tr>${r.map((v,i)=>`<td>${i===4?badge(v):v}</td>`).join('')}</tr>`).join(''));
  if(state.settingsTab==='acesso') content=tablePanel('',[{label:'Usuário'},{label:'Perfil'},{label:'Escopo'},{label:'Status'}],[['Marina França','Analista','HE / Qualidade','Ativo'],['Rafael Souza','Gestor','Todas as divisões','Ativo'],['Operação SMT','Operação','SMT','Ativo'],['Consulta TV','Consulta','TV','Inativo']].map(r=>`<tr>${r.map((v,i)=>`<td>${i===3?badge(v):v}</td>`).join('')}</tr>`).join(''));
  if(state.settingsTab==='integracoes') content=`<div class="settings-layout">${[['GERP','Configurado','12/08 05:00'],['Cotação','Operacional','12/08 00:05'],['Banco','Operacional','12/08 09:40'],['Relatórios','Operacional','12/08 08:54']].map(([n,s,d])=>`<article class="settings-card"><div class="setting-row" style="border:0;padding:0"><div><h2>${n}</h2><p>Última atualização: ${d}</p></div>${badge(s)}</div></article>`).join('')}</div>`;
  if(state.settingsTab==='interface') content=`<div class="interface-settings-grid"><article class="settings-card"><h2>Tema</h2><p>Escolha a aparência da interface.</p><div class="theme-options">${[['light','Claro'],['dark','Escuro'],['system','Sistema']].map(([id,l])=>`<button class="theme-card ${document.documentElement.dataset.themePreference===id?'selected':''}" data-action="set-theme" data-id="${id}" data-theme-choice="${id}"><span class="theme-swatch"><i></i><i></i></span><strong>${l}</strong></button>`).join('')}</div></article><article class="settings-card"><h2>Idioma</h2><p>Idioma exibido na interface do sistema.</p><div class="language-options">${[['pt-BR','Português','PT'],['en','Inglês','EN'],['ko','Coreano','KO']].map(([id,label,code],index)=>`<button class="language-card ${index===0?'selected':''}" type="button" aria-pressed="${index===0}"><span>${code}</span><div><strong>${label}</strong><small>${id}</small></div>${index===0?icon('check'):''}</button>`).join('')}</div><small class="settings-note">Seleção ilustrativa neste protótipo.</small></article></div>`;
  return `<section class="page-stack">${pageHeader('Configurações',button('Salvar alterações','save-settings',{primary:true,icon:'check'}))}${tabs}${content}</section>`;
}

function hydrateReviewProductionContext() {
  if (state.route !== 'scrap' || state.scrapView !== 'review') return;
  const row = model.transactions.find((item) => item.id === state.activeReviewId);
  const facts = $('.review-facts');
  if (!row || !facts) return;
  const moduleLabel = $$('.meta-item small', facts).find((label) => label.textContent === 'Módulo');
  if (moduleLabel) moduleLabel.textContent = 'Componente';
  facts.insertAdjacentHTML('beforeend', `<article class="production-context"><div><span class="block-kicker">Ocorrência de produção</span><h3>${row.defect}</h3><p>${row.occurrence}</p></div><dl><div><dt>Componente afetado</dt><dd>${row.module}</dd></div><div><dt>Posto</dt><dd>${row.station}</dd></div></dl></article>`);
}

function removeRedundantHelperCopy() {
  const unwanted = new Set([
    'Filtros atualizam indicadores e rankings',
    'Use o ranking para filtrar; selecione registros na tabela para justificá-los.',
    'Alertas apenas comunicam eventos; a revisão ocorre na Base de Scrap.',
    'Ponto de partida para investigação'
  ]);
  $$('.filter-note, .panel-description', $('#page-content')).forEach((element) => {
    if (unwanted.has(element.textContent.trim())) element.remove();
  });
  const offenderHeader = $('.offender-panel .panel-header');
  const offenderTitle = offenderHeader?.querySelector('.metric-title');
  const metricHelp = offenderTitle?.querySelector('.metric-help');
  if (offenderHeader && offenderTitle && metricHelp) {
    offenderTitle.textContent = 'Top ofensores';
    offenderHeader.append(metricHelp);
    offenderHeader.classList.add('offender-header');
  }
}

const renderers={dashboard:renderDashboard,scrap:renderScrap,alertas:renderAlerts,relatorios:renderReports,execucoes:renderExecutions,auditoria:renderAudit,configuracoes:renderSettings};
function renderPage(){state.route=renderers[state.route]?state.route:'dashboard';pendingCharts=[];renderShell();$('#page-content').innerHTML=renderers[state.route]();hydrateReviewProductionContext();removeRedundantHelperCopy();$$('.automation-banner',$('#page-content')).forEach((card)=>card.remove());initCharts();$('#main-canvas').scrollTop=0;}
function navigateTo(route){location.hash=route;if(location.hash===`#${route}`){state.route=route;renderPage();}closeOverlay();closeMobileSidebar();}

function showToast(message,type='success'){
  const el=document.createElement('div');el.className=`toast ${type}`;el.innerHTML=`${icon(type==='error'?'alert':'check')}<div><strong>${type==='error'?'Ação não concluída':'Tudo certo'}</strong><div>${message}</div></div>`;$('#toast-region').append(el);setTimeout(()=>el.remove(),3500);
}
function openOverlay(html){const layer=$('#overlay-layer');layer.innerHTML=html;layer.style.display='flex';const focusable=$('button,input,select,textarea',layer);focusable?.focus();}
function closeOverlay(){const layer=$('#overlay-layer');layer.innerHTML='';layer.style.display='';}
function modal(title,body,footer=''){return `<section class="modal" role="dialog" aria-modal="true" aria-label="${title}"><header class="modal-header"><h2>${title}</h2><button class="close-button" data-action="close-overlay" aria-label="Fechar">${icon('x')}</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section>`;}
function drawer(title,body,footer=''){return `<aside class="drawer" role="dialog" aria-modal="true" aria-label="${title}"><header class="drawer-header"><h2>${title}</h2><button class="close-button" data-action="close-overlay" aria-label="Fechar">${icon('x')}</button></header><div class="drawer-body">${body}</div>${footer?`<footer class="drawer-footer">${footer}</footer>`:''}</aside>`;}

function openTransaction(id) {
  const t = model.transactions.find((item) => item.id === id);
  if (!t) return;
  const scrapDetails = `<div class="inline-actions">${badge(t.review.status)}</div>
    <section class="detail-section"><h3>Defeito de produção</h3><dl class="detail-list">
      <div><dt>Componente afetado</dt><dd>${t.module}</dd></div><div><dt>Defeito observado</dt><dd>${t.defect}</dd></div>
      <div><dt>Posto</dt><dd>${t.station}</dd></div><div><dt>Ocorrência registrada</dt><dd>${t.occurrence}</dd></div>
    </dl></section>
    <section class="detail-section"><h3>Dados do scrap</h3><dl class="detail-list">
      <div><dt>Produto</dt><dd>${t.product}</dd></div><div><dt>Part Number</dt><dd>${t.partNumber}</dd></div>
      <div><dt>Departamento / Linha</dt><dd>${t.department} · ${t.line}</dd></div><div><dt>QTY</dt><dd>${t.qty} un.</dd></div>
      <div><dt>IF Cost</dt><dd>${formatCurrency(t.ifCost)}</dd></div>
    </dl></section>
    ${t.review.status === 'Justificado' ? `<section class="detail-section"><h3>Justificativa registrada</h3><dl class="detail-list"><div><dt>Categoria</dt><dd>${t.review.category}</dd></div><div><dt>Justificativa</dt><dd>${t.review.reason}</dd></div><div><dt>Revisor</dt><dd>${t.review.responsible}</dd></div><div><dt>Relatório</dt><dd>${t.review.includeInReport ? 'Elegível para inclusão' : 'Não incluído'}</dd></div></dl></section>` : ''}
    <section class="detail-section"><h3>Rastreabilidade automática</h3><dl class="detail-list"><div><dt>Origem</dt><dd>${t.source}</dd></div><div><dt>Batch</dt><dd>${t.batch}</dd></div><div><dt>Execution ID</dt><dd>${t.executionId}</dd></div><div><dt>Processado em</dt><dd>${t.processedAt}</dd></div></dl></section>`;
  openOverlay(drawer(t.id, scrapDetails, `${button('Ver execução','open-related-execution',{id:t.executionId})}${button('Explorar Part Number','transaction-explore',{id:t.id})}${button(t.review.status==='Justificado'?'Ver revisão':'Revisar registro','review-one',{id:t.id,primary:true})}`));
}
function openAlert(id){const a=model.alerts.find(x=>x.id===id);if(!a)return;const before=a.status;if(a.status==='Novo'){a.status='Lido';addAudit('Visualizou alerta','Alert',a.id,before,'Lido');}openOverlay(drawer(a.type,`<div class="inline-actions">${badge(a.severity)}${badge(a.status)}</div><section class="detail-section"><h3>Evento notificado</h3><p>${a.description}</p><dl class="detail-list"><div><dt>Alerta</dt><dd>${a.id}</dd></div><div><dt>Impacto estimado</dt><dd>${formatCurrency(a.impact)}</dd></div><div><dt>Área</dt><dd>${a.department} · ${a.line}</dd></div><div><dt>Canal</dt><dd>${a.channel}</dd></div></dl></section><section class="detail-section"><h3>Registros relacionados</h3><p>${a.transactionIds.length?`${a.transactionIds.length} registros de scrap originaram esta notificação.`:'Nenhum registro diretamente vinculado.'}</p><p class="panel-description">A justificativa e a revisão são feitas na Base de Scrap.</p></section><section class="detail-section"><h3>Histórico da notificação</h3><ol class="timeline"><li>Condição detectada<small>${a.dateTime}</small></li><li>Notificação enviada<small>${a.channel}</small></li><li>Status: ${a.status}<small>Estado atual</small></li></ol></section>`,`${button('Arquivar alerta','archive-alert',{id:a.id})}${button('Ver registros de scrap','alert-transactions',{id:a.id,primary:true})}`));}
function openExecution(id){const e=model.executions.find(x=>x.id===id);if(!e)return;const steps=['Request automático iniciado','Arquivo localizado no GERP','Arquivo recebido','Validação estrutural','Normalização','Conversão','Persistência','Processamento concluído'];const failed=e.status==='Falha'||e.status==='Parcial';const footer=`${button('Ver registros processados','execution-records',{id:e.id})}${failed?button('Reprocessar','reprocess',{id:e.id,primary:true,icon:'refresh'}):''}${e.contingencyAvailable?button('Usar contingência','open-contingency',{id:e.id,icon:'upload'}):''}`;openOverlay(drawer(e.id,`<div class="inline-actions">${badge(e.status)}<span class="badge">${e.source}</span>${e.scheduled?badge('Agendada','info'):''}</div><section class="detail-section"><h3>Timeline automática</h3><ol class="timeline">${steps.map((s,i)=>`<li class="${failed&&i===5?'failed':''}">${s}<small>${i===5&&failed?'Taxa de câmbio não localizada':`Etapa ${i+1} registrada`}</small></li>`).join('')}</ol></section><section class="detail-section"><h3>Exceções</h3>${tablePanel('',[{label:'Tipo'},{label:'Registro'},{label:'Motivo'},{label:'Etapa'},{label:'Status'}],`<tr><td>Câmbio indisponível</td><td>TX-82194</td><td>Taxa não localizada</td><td>Conversão</td><td>${badge(e.status==='Concluído'?'Resolvido':'Pendente')}</td></tr><tr><td>Duplicidade</td><td>TX-82171</td><td>Registro já processado</td><td>Persistência</td><td>${badge('Ignorado')}</td></tr>`)}</section>${e.contingencyAvailable?`<section class="contingency-notice"><strong>Contingência liberada</strong><p>O reprocessamento falhou. Um arquivo operacional pode ser usado exclusivamente para recuperar esta execução.</p></section>`:''}`,footer));}
function openAudit(id){const e=model.audit.find(x=>x.id===id);if(!e)return;openOverlay(drawer(e.action,`<section class="detail-section"><dl class="detail-list">${Object.entries(e).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section><section class="detail-section"><h3>Integridade</h3><p class="panel-description">Eventos de auditoria são imutáveis e não podem ser excluídos pelo protótipo.</p></section>`));}

function addAudit(action,entity,identifier,before,after){model.audit.unshift({id:`AUD-${Date.now()}`,timestamp:new Date().toLocaleString('pt-BR'),actor:'m.franca',origin:'Web',action,entity,identifier,before,after,correlation:`COR-${Math.floor(900000+Math.random()*99999)}`,severity:'Informativo'});}
function applyTheme(preference){localStorage.setItem('hanaro-theme',preference);document.documentElement.dataset.themePreference=preference;const dark=preference==='dark'||(preference==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';renderPage();}
function closeMobileSidebar(){$('#app-shell').classList.remove('sidebar-open');}

const tvPanels = [
  { title: 'Visão Executiva', eyebrow: 'Material Scrap / IF Cost' },
  { title: 'Principais ofensores do período', eyebrow: 'Onde estamos perdendo dinheiro' },
  { title: 'Ocorrências prioritárias', eyebrow: 'Problemas que exigem ação' },
  { title: '2026 × 2025', eyebrow: 'Comparativo e tendência' },
];
function tvKpi(label, value, detail = '', tone = '') { return `<article class="tv-kpi ${tone}"><span>${label}</span><strong>${value}</strong>${detail ? `<small>${detail}</small>` : ''}</article>`; }
function tvHeader(panel) { return `<header class="tv-panel-header"><div><span class="tv-eyebrow">${panel.eyebrow}</span><h1>${panel.title}</h1></div><div class="tv-freshness"><strong>12 Ago 2026 · Atualizado às 14:32</strong><span>${icon('check')} Dados atualizados</span></div></header>`; }
function tvPanelContent(index) {
  const panel = tvPanels[index];
  if (index === 0) return `${tvHeader(panel)}<div class="tv-kpi-grid">${tvKpi('IF Cost acumulado','US$ 184.260','Ago/2026')}${tvKpi('Redução vs 2025','-13,2%','US$ 28.040 abaixo','success')}${tvKpi('Meta 2026','-15,0%','Redução anual')}${tvKpi('Gap para meta','1,8 p.p.','US$ 3.805 acima','danger')}</div><div class="tv-main-grid"><article class="tv-card tv-chart-card"><h2>Evolução do IF Cost — 2026 × 2025 × Meta</h2>${lineChart([8,9,11,14,18,23,25,22,24,27,26,29],[12,13,17,20,19,18,25,28,31,29,33,35],24,330)}</article><article class="tv-card"><h2>Top 3 componentes afetados</h2>${barList([{label:'Tela LCD',value:72400,display:'US$ 72,4k'},{label:'Placa principal PCB',value:70060,display:'US$ 70,1k'},{label:'Moldura frontal',value:41800,display:'US$ 41,8k'}])}</article></div><div class="tv-summary-strip"><strong>1.247</strong> unidades de scrap <i></i><strong>96</strong> transações <i></i><strong class="negative">6</strong> alertas críticos</div>`;
  if (index === 1) return `${tvHeader(panel)}<div class="tv-offender-grid"><article class="tv-card"><h2>Pareto de defeitos por IF Cost</h2>${barList([{label:'Risco profundo no painel',value:38400},{label:'Falha no teste funcional',value:27600},{label:'Painel trincado por impacto',value:19100},{label:'Trinca no ponto de fixação',value:14800},{label:'Conector danificado',value:10700}])}</article><article class="tv-card"><h2>IF Cost por departamento</h2>${barList([{label:'Final Assembly A',value:62100},{label:'Final Assembly B',value:48500},{label:'SMT',value:32700},{label:'IPI',value:19400}])}</article></div><div class="tv-highlight-grid"><article class="tv-highlight"><span>Linha mais crítica</span><strong>Line 04</strong><b>US$ 31.840</b><small class="negative">+22% vs média recente</small></article><article class="tv-highlight"><span>Defeito mais crítico</span><strong>Risco no painel</strong><b>39,3%</b><small>do IF Cost acumulado</small></article></div>`;
  if (index === 2) { const priorities = model.alerts.filter(a => a.severity === 'Crítico' || a.severity === 'Alto').slice(0,3); const justified=model.transactions.filter(row=>row.review.status==='Justificado').length; return `${tvHeader(panel)}<div class="tv-priority-layout"><div class="tv-priority-list">${priorities.map((a,i)=>`<article class="tv-priority ${i===0?'critical':''}"><div><span>${badge(a.severity)}</span><strong>${a.line}</strong></div><h2>${a.module}</h2><b>${formatCurrency(a.impact)}</b><p>${a.description}</p></article>`).join('')}</div><aside class="tv-card tv-analysis-status"><h2>Situação das revisões</h2><div class="tv-analysis-counts"><div><strong>${model.transactions.length-justified}</strong><span>Pendentes</span></div><div><strong>${model.transactions.filter(row=>row.review.status==='Em revisão').length}</strong><span>Em revisão</span></div><div><strong>${justified}</strong><span>Justificadas</span></div></div><h2>Categorias predominantes</h2>${barList([{label:'Material',value:42,display:'42%'},{label:'Processo',value:27,display:'27%'},{label:'Máquina',value:19,display:'19%'},{label:'Outros',value:12,display:'12%'}])}</aside></div>`; }
  return `${tvHeader(panel)}<div class="tv-trend-layout"><article class="tv-card tv-chart-card"><h2>Evolução acumulada no ano</h2>${lineChart([172,176,169,183,177,171,168,184],[188,201,194,211,205,198,216,212],181,430)}</article><aside class="tv-results"><h2>Resultado acumulado</h2>${tvKpi('2025','US$ 1,625M')}${tvKpi('2026','US$ 1,400M')}${tvKpi('Redução','-13,8%','','success')}${tvKpi('Restante para meta','1,2 p.p.','','danger')}</aside></div>`;
}
function renderTvMode(resetProgress = true) {
  const root = $('#tv-mode'); pendingCharts = [];
  root.innerHTML = `<div class="tv-stage"><div class="tv-panel" data-panel="${state.tvPanel}">${tvPanelContent(state.tvPanel)}</div><footer class="tv-footer"><span>HANARO · Material Scrap / IF Cost</span><span>Atualizado 12/08/2026 14:32 · Próxima atualização 15:00</span></footer><div class="tv-controls visible" aria-label="Controles do Modo TV"><button data-action="tv-prev" aria-label="Painel anterior">${icon('chevronLeft')}</button><button data-action="tv-pause" aria-label="${state.tvPaused?'Continuar':'Pausar'} rotação">${icon(state.tvPaused?'play':'pause')}<span>${state.tvPaused?'Continuar':'Pausar'}</span></button><button data-action="tv-next" aria-label="Próximo painel">${icon('chevronRight')}</button><button data-action="tv-toggle-rotation" class="tv-text-control">${state.tvRotation?'Rotação automática':'Visão única'}</button><label class="tv-duration-control"><span>Intervalo</span><select id="tv-duration"><option value="10" ${state.tvDuration===10?'selected':''}>10s</option><option value="15" ${state.tvDuration===15?'selected':''}>15s</option><option value="30" ${state.tvDuration===30?'selected':''}>30s</option><option value="60" ${state.tvDuration===60?'selected':''}>60s</option></select></label><button data-action="tv-fullscreen" aria-label="Tela cheia">${icon('fullscreen')}<span>Tela cheia</span></button><button data-action="exit-tv" aria-label="Sair do Modo TV">${icon('x')}<span>Sair</span></button></div><div class="tv-position"><span>${state.tvPanel + 1} / ${tvPanels.length}</span><div class="tv-dots">${tvPanels.map((_,i)=>`<i class="${i===state.tvPanel?'active':''}"></i>`).join('')}</div></div><div class="tv-progress ${state.tvPaused || !state.tvRotation ? 'paused' : ''}" style="--tv-duration:${state.tvDuration}s"><i></i></div></div>`;
  initCharts(); showTvControls();
  if (resetProgress) restartTvTimer();
}
function restartTvTimer() { clearTimeout(tvTimer); if (!state.tvActive || state.tvPaused || !state.tvRotation) return; tvTimer = setTimeout(() => changeTvPanel(1), state.tvDuration * 1000); }
function changeTvPanel(direction) { state.tvPanel = (state.tvPanel + direction + tvPanels.length) % tvPanels.length; renderTvMode(); }
function showTvControls() { const controls = $('.tv-controls'); if (!controls) return; controls.classList.add('visible'); clearTimeout(tvControlsTimer); tvControlsTimer = setTimeout(() => controls.classList.remove('visible'), 4000); }
function enterTvMode() { if (state.route !== 'dashboard') return; state.tvActive = true; state.tvPanel = 0; state.tvPaused = false; state.tvRotation = true; document.body.classList.add('tv-active'); $('#tv-mode').setAttribute('aria-hidden','false'); renderTvMode(); }
function exitTvMode() { clearTimeout(tvTimer); clearTimeout(tvControlsTimer); state.tvActive = false; document.body.classList.remove('tv-active'); $('#tv-mode').setAttribute('aria-hidden','true'); $('#tv-mode').innerHTML=''; if (document.fullscreenElement) document.exitFullscreen().catch(()=>{}); renderPage(); $('#tv-mode-trigger')?.focus(); }
function toggleTvPause() { state.tvPaused = !state.tvPaused; renderTvMode(); }

async function handleAction(action,el){
  const id=el.dataset.id;
  if(action==='close-overlay')return closeOverlay();
  if(action==='toggle-theme')return applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  if(action==='set-theme')return applyTheme(id);
  if(action==='toggle-choice'){el.classList.toggle('selected');el.setAttribute('aria-pressed',String(el.classList.contains('selected')));return;}
  if(action==='enter-tv')return enterTvMode();
  if(action==='exit-tv')return exitTvMode();
  if(action==='tv-prev')return changeTvPanel(-1);
  if(action==='tv-next')return changeTvPanel(1);
  if(action==='tv-pause')return toggleTvPause();
  if(action==='tv-toggle-rotation'){state.tvRotation=!state.tvRotation;state.tvPaused=false;if(!state.tvRotation)state.tvPanel=0;return renderTvMode();}
  if(action==='tv-fullscreen'){if(!document.fullscreenElement)$('#tv-mode').requestFullscreen?.();else document.exitFullscreen?.();return;}
  if(action==='support')return showToast('Central de suporte simulada. Nenhum chamado real foi enviado.');
  if(action==='profile')return showToast('O perfil do protótipo está em modo de demonstração.');
  if(action==='notifications')return showToast('Você tem novos alertas. Abra a notificação para ver os registros relacionados.');
  if(action==='go-reports'||action==='new-report'){state.reportTab='gerar';return navigateTo('relatorios');}
  if(action.startsWith('export')||action==='generate-pdf'||action==='generate-excel'){el.classList.add('spinning');el.disabled=true;await delay(650);el.classList.remove('spinning');el.disabled=false;return showToast('Arquivo fictício preparado para demonstração.');}
  if(action==='refresh-dashboard'){el.classList.add('spinning');el.disabled=true;$('#sync-state').textContent='Atualizando...';await delay(600);state.dashboardFactor=1+.03*Math.random();el.disabled=false;el.classList.remove('spinning');$('#sync-state').textContent=`Atualizado às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;renderPage();return showToast('Dados atualizados.');}
  if(action==='clear-dashboard'){state.dashboardFactor=1;renderPage();return showToast('Filtros limpos.');}
  if(action==='dashboard-explore'){setExplorationContext({module:id},'Dashboard');state.scrapView='list';return navigateTo('scrap');}
  if(action==='dashboard-row-explore'){const row=model.transactions.find(t=>t.id===id);if(!row)return;setExplorationContext({module:row.module,partNumber:row.partNumber,line:row.line,transactionId:row.id},'Dashboard');state.scrapView='list';return navigateTo('scrap');}
  if(action==='dashboard-row-review'){const row=model.transactions.find(t=>t.id===id);if(!row)return;state.selectedScrapIds=[row.id];state.activeReviewId=row.id;state.scrapView='review';setExplorationContext({module:row.module,partNumber:row.partNumber,line:row.line,transactionId:row.id},'Dashboard');navigateTo('scrap');history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(row.id)}`);return;}
  if(action==='page-prev'){state.scrapPage--;return renderPage();} if(action==='page-next'){state.scrapPage++;return renderPage();}
  if(action==='sort-scrap'){const key=el.dataset.key;state.scrapSort.direction=state.scrapSort.key===key&&state.scrapSort.direction==='asc'?'desc':'asc';state.scrapSort.key=key;state.scrapPage=1;return renderPage();}
  if(action==='more-filters')return openOverlay(modal('Mais filtros',`<div class="form-grid">${field('Família','modal-family',['Todas',...families])+field('Produto','modal-product',['Todos',...products])+field('Part Number','modal-part',['Todos',...partNumbers])+field('Account Alias','modal-alias',['Todos',...aliases])+field('Módulo','modal-module',['Todos',...modules])+field('Fornecedor','modal-supplier',['Todos','Fornecedor A','Fornecedor B'])}</div>`,`${button('Cancelar','close-overlay')}${button('Aplicar filtros','apply-more-filters',{primary:true})}`));
  if(action==='apply-more-filters'){closeOverlay();state.scrapPage=1;state.scrapSearch='EAJ';renderPage();return showToast('Filtros avançados aplicados.');}
  if(action==='drill-part'){setExplorationContext({partNumber:id},state.context.source||'Explorador');renderPage();return showToast(`Exploração aprofundada em ${id}.`);}
  if(action==='clear-context'){state.context[el.dataset.key]=null;state.scrapPage=1;renderPage();return;}
  if(action==='clear-all-context'){state.context={source:null,module:null,partNumber:null,line:null,transactionId:null,alertId:null,executionId:null};state.scrapPage=1;renderPage();return;}
  if(action==='toggle-scrap'){state.selectedScrapIds=state.selectedScrapIds.includes(id)?state.selectedScrapIds.filter(value=>value!==id):[...state.selectedScrapIds,id];return renderPage();}
  if(action==='select-visible-scrap'){const ids=filteredTransactions().slice((state.scrapPage-1)*state.scrapPageSize,state.scrapPage*state.scrapPageSize).map(row=>row.id);const allSelected=ids.every(value=>state.selectedScrapIds.includes(value));state.selectedScrapIds=allSelected?state.selectedScrapIds.filter(value=>!ids.includes(value)):[...new Set([...state.selectedScrapIds,...ids])];return renderPage();}
  if(action==='clear-scrap-selection'){state.selectedScrapIds=[];return renderPage();}
  if(action==='review-one'){closeOverlay();state.selectedScrapIds=[id];state.activeReviewId=id;state.scrapView='review';if(state.route!=='scrap')navigateTo('scrap');else renderPage();history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(id)}`);return;}
  if(action==='review-selected'){if(!state.selectedScrapIds.length)return showToast('Selecione ao menos um registro.','error');state.activeReviewId=state.selectedScrapIds[0];state.scrapView='review';history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(state.activeReviewId)}`);return renderPage();}
  if(action==='back-scrap'){syncScrapReview();state.scrapView='list';history.replaceState(null,'','#scrap');return renderPage();}
  if(action==='select-review-item'){syncScrapReview();state.activeReviewId=id;history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(id)}`);return renderPage();}
  if(action==='toggle-review-4m'){syncScrapReview();const row=model.transactions.find(item=>item.id===state.activeReviewId),value=el.dataset.value;if(!row)return;row.review.classification4m=row.review.classification4m.includes(value)?row.review.classification4m.filter(item=>item!==value):[...row.review.classification4m,value];return renderPage();}
  if(action==='save-scrap-review'){const row=model.transactions.find(item=>item.id===state.activeReviewId),before=row.review.status;syncScrapReview();row.review.status='Em revisão';addAudit('Salvou justificativa de scrap','Transaction',row.id,before,'Em revisão');renderPage();return showToast('Rascunho da revisão salvo.');}
  if(action==='conclude-scrap-review'){syncScrapReview();const source=model.transactions.find(item=>item.id===state.activeReviewId);if(!source.review.category||source.review.category==='Selecione...'||!source.review.reason.trim())return showToast('Informe a categoria e a justificativa antes de concluir.','error');const applyAll=$('#review-apply-all')?.checked??false;const targets=applyAll?model.transactions.filter(item=>state.selectedScrapIds.includes(item.id)):[source];targets.forEach(item=>{const before=item.review.status;if(item!==source)item.review={...source.review,classification4m:[...source.review.classification4m],evidence:[...source.review.evidence]};item.review.status='Justificado';addAudit('Concluiu revisão e justificativa de scrap','Transaction',item.id,before,'Justificado');});const remaining=state.selectedScrapIds.filter(value=>!targets.some(item=>item.id===value));state.selectedScrapIds=remaining;if(remaining.length){state.activeReviewId=remaining[0];history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(state.activeReviewId)}`);renderPage();}else{state.scrapView='list';history.replaceState(null,'','#scrap');renderPage();}return showToast(`${targets.length} registro${targets.length>1?'s':''} justificado${targets.length>1?'s':''} e ${targets.length>1?'disponíveis':'disponível'} para relatório.`);}
  if(action==='add-review-evidence'){syncScrapReview();return openOverlay(modal('Adicionar evidência à revisão',`<div class="choice-group">${['Foto','Documento','Comentário','Referência GERP'].map(value=>`<button class="choice" data-action="choose-review-evidence" data-value="${value}">${value}</button>`).join('')}</div><p class="panel-description">A inclusão é simulada; nenhum arquivo real será enviado.</p>`));}
  if(action==='choose-review-evidence'){const row=model.transactions.find(item=>item.id===state.activeReviewId);row.review.evidence.push(`${el.dataset.value} fictício · ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`);closeOverlay();renderPage();return showToast('Evidência adicionada à revisão.');}
  if(action==='transaction-explore'){const row=model.transactions.find(t=>t.id===id);if(!row)return;closeOverlay();setExplorationContext({module:row.module,partNumber:row.partNumber,line:row.line,transactionId:null},'Transação');renderPage();return;}
  if(action==='validate-upload'){el.disabled=true;el.classList.add('spinning');await delay(700);return openUploadResult();}
  if(action==='confirm-upload'){model.executions.unshift({id:'EXE-20260812-0047',source:'Contingência operacional',process:'Recuperação de execução com falha',start:'12/08 10:02',end:'12/08 10:03',duration:'01m14s',received:827,valid:824,rejected:3,status:'Concluído',scheduled:false,retryCount:0,contingencyAvailable:false});addAudit('Executou contingência após falha de reprocessamento','Execution','EXE-20260812-0047','Arquivo validado','Concluído');closeOverlay();renderPage();return showToast('Contingência concluída e auditada.');}
  if(action==='read-alerts'){const targets=model.alerts.filter(a=>a.status==='Novo');targets.forEach(a=>{a.status='Lido';addAudit('Marcou alerta como lido','Alert',a.id,'Novo','Lido');});renderPage();return showToast(`${targets.length} alertas marcados como lidos.`);}
  if(action==='archive-alert'){const a=model.alerts.find(x=>x.id===id);if(a){const before=a.status;a.status='Arquivado';addAudit('Arquivou alerta','Alert',a.id,before,'Arquivado');}closeOverlay();renderPage();return showToast('Alerta arquivado.');}
  if(action==='alert-transactions'){const a=model.alerts.find(x=>x.id===id);if(!a)return;const before=a.status;if(a.status==='Novo')a.status='Lido';setExplorationContext({module:a.module,line:a.line,alertId:a.id,transactionId:null},'Alerta');state.selectedScrapIds=[];state.scrapView='list';if(before==='Novo')addAudit('Abriu registros a partir do alerta','Alert',a.id,'Novo','Lido');closeOverlay();return navigateTo('scrap');}
  if(action==='report-tab'){state.reportTab=id;return renderPage();}
  if(action==='toggle-report-review'){const row=model.transactions.find(item=>item.id===id);if(row){row.review.includeInReport=!row.review.includeInReport;renderPage();}return;}
  if(action==='open-report-review'){state.selectedScrapIds=[id];state.activeReviewId=id;state.scrapView='review';navigateTo('scrap');history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(id)}`);return;}
  if(action==='register-report'){const version=`v1.${model.reports.length+1}`,reportId=`REP-2026-W33-v${model.reports.length+1}`,reviewIds=model.transactions.filter(row=>row.review.status==='Justificado'&&row.review.includeInReport).map(row=>row.id),reportCost=model.transactions.filter(row=>reviewIds.includes(row.id)).reduce((sum,row)=>sum+row.ifCost,0);model.reports.unshift({id:reportId,version,type:$('#report-type')?.value||'Semanal',period:'W33 · 10–16 Ago',generatedAt:'12/08 10:14',author:'M. França',ifCost:reportCost,format:'PDF',status:'Publicado',reviewIds});model.sends.unshift({report:reportId,recipient:'gestores@exemplo.local',channel:'E-mail',requestedAt:'12/08 10:15',status:'Pendente',attempts:0});addAudit('Gerou relatório com scraps justificados','Report',reportId,'Rascunho','Publicado');state.reportTab='versoes';renderPage();return showToast(`Relatório ${reportId} registrado com ${reviewIds.length} scrap(s) revisado(s).`);}
  if(action==='resend-report'){const s=model.sends[Number(id)];s.status='Processando';renderPage();await delay(700);s.status='Enviado';s.attempts++;addAudit('Reenviou relatório','Report',s.report,'Falha','Enviado');renderPage();return showToast('Relatório reenviado com sucesso.');}
  if(action==='send-report'){const s=model.sends[Number(id)];s.status='Processando';renderPage();await delay(700);s.status='Enviado';s.attempts++;addAudit('Enviou relatório','Report',s.report,'Pendente','Enviado');renderPage();return showToast('Envio simulado com sucesso.');}
  if(action==='open-related-execution'){closeOverlay();navigateTo('execucoes');setTimeout(()=>openExecution(id),80);return;}
  if(action==='execution-records'){closeOverlay();setExplorationContext({executionId:id,module:null,partNumber:null,line:null,transactionId:null},'Execução');return navigateTo('scrap');}
  if(action==='open-contingency'){const e=model.executions.find(x=>x.id===id);if(!e?.contingencyAvailable)return showToast('A contingência ainda não está disponível.','error');return openUploadModal(id);}
  if(action==='reprocess'){const e=model.executions.find(x=>x.id===id),before=e.status;e.status='Processando';e.retryCount=(e.retryCount||0)+1;closeOverlay();renderPage();showToast('Reprocessamento iniciado.');await delay(900);if(before==='Falha'&&e.retryCount===1){e.status='Falha';e.contingencyAvailable=true;addAudit('Reprocessamento falhou; liberou contingência','Execution',e.id,before,'Falha');renderPage();setTimeout(()=>openExecution(e.id),80);return showToast('O reprocessamento falhou. A contingência foi liberada.','error');}e.status='Concluído';e.rejected=0;e.valid=e.received;e.contingencyAvailable=false;addAudit('Reprocessou execução','Execution',e.id,before,'Concluído');renderPage();return showToast('Execução reprocessada com sucesso.');}
  if(action==='settings-tab'){state.settingsTab=id;return renderPage();}
  if(action==='toggle-setting'){const key=el.dataset.key;model.settings[key]=!model.settings[key];return renderPage();}
  if(action==='save-settings'){model.settings.reportFrequency=$('#setting-frequency')?.value||model.settings.reportFrequency;addAudit('Alterou configuração','Settings','CFG-HANARO','Anterior','Atualizado');return showToast('Alterações salvas durante esta sessão.');}
  if(action==='refresh-alerts'||action==='refresh-executions'){el.classList.add('spinning');await delay(600);el.classList.remove('spinning');return showToast('Dados atualizados.');}
}

function openUploadModal(executionId=''){openOverlay(modal('Contingência operacional',`<section class="contingency-notice"><strong>Uso excepcional liberado</strong><p>O arquivo só pode recuperar a execução ${executionId||'com falha'} após o reprocessamento malsucedido. A ação será registrada na Auditoria.</p></section><div class="form-grid"><div class="field full"><label for="upload-file">Arquivo de recuperação</label><input class="control" id="upload-file" type="text" value="scrap_contingencia_20260812.xlsx" readonly></div>${field('Tipo','upload-type',['XLSX','CSV','TXT'])}<div class="field"><label>Execução de origem</label><input class="control" value="${executionId}" readonly></div><div class="field full"><label>Justificativa obrigatória</label><textarea class="control" placeholder="Descreva por que a automação não pôde recuperar esta execução...">Falha de câmbio persistente após reprocessamento</textarea></div></div>`,`${button('Cancelar','close-overlay')}${button('Validar contingência','validate-upload',{primary:true,icon:'check'})}`));}
function openUploadResult(){openOverlay(modal('Contingência validada',`<div class="inline-actions">${badge('Validação concluída','success')}</div><dl class="detail-list" style="margin-top:1rem"><div><dt>Arquivo</dt><dd>scrap_contingencia_20260812.xlsx</dd></div><div><dt>Registros</dt><dd>827</dd></div><div><dt>Válidos</dt><dd class="positive">824</dd></div><div><dt>Rejeitados</dt><dd class="negative">3</dd></div></dl>`,`${button('Cancelar','close-overlay')}${button('Confirmar contingência','confirm-upload',{primary:true,icon:'upload'})}`));}

document.addEventListener('click',(event)=>{
  const actionEl=event.target.closest('[data-action]');if(actionEl){event.preventDefault();handleAction(actionEl.dataset.action,actionEl);return;}
  const row=event.target.closest('tr[data-row-id]');if(row){const {rowId,rowType}=row.dataset;if(rowType==='transaction')openTransaction(rowId);if(rowType==='alert')openAlert(rowId);if(rowType==='execution')openExecution(rowId);if(rowType==='audit')openAudit(rowId);if(rowType==='dashboard')openTransaction(rowId);if(rowType==='report')showToast(`Detalhes da versão ${rowId} carregados.`);}
});
document.addEventListener('input',(event)=>{if(event.target.id==='scrap-search'){state.scrapSearch=event.target.value;state.scrapPage=1;renderPage();setTimeout(()=>{const input=$('#scrap-search');input?.focus();input?.setSelectionRange(input.value.length,input.value.length)},0)}if(event.target.id==='audit-search'){state.auditSearch=event.target.value;renderPage();setTimeout(()=>{const input=$('#audit-search');input?.focus();input?.setSelectionRange(input.value.length,input.value.length)},0)}});
document.addEventListener('change',(event)=>{if(event.target.id==='page-size'){state.scrapPageSize=Number(event.target.value);state.scrapPage=1;renderPage()}if(event.target.matches('[data-filter^="dash-"]')){state.dashboardFactor=.91+Math.random()*.12;renderPage();showToast('Visão atualizada pelos filtros.')}if(event.target.id==='scrap-date'){state.scrapFilters.date=event.target.value;state.scrapPage=1;renderPage()}if(event.target.id==='scrap-division'){state.scrapFilters.division=event.target.value;state.scrapPage=1;renderPage()}if(event.target.id==='scrap-department'){state.scrapFilters.department=event.target.value;state.scrapPage=1;renderPage()}if(event.target.id==='scrap-line'){state.scrapFilters.line=event.target.value;state.scrapPage=1;renderPage()}if(event.target.id==='scrap-review-status'){state.scrapFilters.reviewStatus=event.target.value;state.scrapPage=1;renderPage()}if(event.target.id==='alert-severity'){state.alertSeverity=event.target.value;renderPage()}if(event.target.id==='exec-status'){state.executionStatus=event.target.value;renderPage()}if(event.target.id==='audit-entity'){state.auditEntity=event.target.value;renderPage()}if(event.target.id==='report-type'||event.target.id==='report-compare'){state.reportFactor=.9+Math.random()*.2;renderPage();showToast('Preview atualizado.')}if(event.target.id==='review-requires-cause'){syncScrapReview();renderPage()}if(event.target.id==='tv-duration'){state.tvDuration=Number(event.target.value);renderTvMode();}});
$('#overlay-layer').addEventListener('click',(event)=>{if(event.target.id==='overlay-layer')closeOverlay();});
$('#sidebar-toggle').addEventListener('click',()=>{const shell=$('#app-shell'),collapsed=shell.classList.toggle('sidebar-collapsed');$('#sidebar-toggle').setAttribute('aria-expanded',String(!collapsed));$('#sidebar-toggle').setAttribute('aria-label',collapsed?'Expandir menu':'Recolher menu');});
$('#mobile-menu').addEventListener('click',()=>$('#app-shell').classList.add('sidebar-open'));
$('#sidebar-backdrop').addEventListener('click',closeMobileSidebar);
window.addEventListener('hashchange',()=>{const parts=(location.hash.slice(1)||'dashboard').split('?')[0].split('/');state.route=parts[0]||'dashboard';if(state.route==='scrap'){state.scrapView=parts[1]==='revisar'?'review':'list';if(parts[2]){state.activeReviewId=decodeURIComponent(parts[2]);state.selectedScrapIds=[state.activeReviewId];}}renderPage();closeMobileSidebar();});
window.addEventListener('mousemove',()=>{if(state.tvActive)showTvControls();});
window.addEventListener('keydown',(event)=>{if(state.tvActive){showTvControls();if(event.key==='ArrowLeft'){event.preventDefault();changeTvPanel(-1)}if(event.key==='ArrowRight'){event.preventDefault();changeTvPanel(1)}if(event.key===' '){event.preventDefault();toggleTvPause()}if(event.key.toLowerCase()==='f'){event.preventDefault();if(!document.fullscreenElement)$('#tv-mode').requestFullscreen?.();else document.exitFullscreen?.()}if(event.key==='Escape')exitTvMode();return}if(event.key==='Escape'){closeOverlay();closeMobileSidebar();}});
window.addEventListener('resize',()=>chartInstances.forEach(instance=>instance.resize()));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(document.documentElement.dataset.themePreference==='system')applyTheme('system');});

renderPage();
