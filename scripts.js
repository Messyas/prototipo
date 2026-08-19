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
  language: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M3 12h18', 'M12 3a14 14 0 0 1 0 18', 'M12 3a14 14 0 0 0 0 18'],
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
  eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  eyeOff: ['m3 3 18 18', 'M10.6 10.6A2 2 0 0 0 13.4 13.4', 'M9.9 4.2A11 11 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.2', 'M6.6 6.6C3.7 8.4 2 12 2 12s3.5 8 10 8a10.6 10.6 0 0 0 5.4-1.4'],
  sliders: ['M4 6h7', 'M15 6h5', 'M11 4v4', 'M4 12h2', 'M10 12h10', 'M6 10v4', 'M4 18h10', 'M18 18h2', 'M14 16v4'],
};

function icon(name, label = '') {
  const paths = (iconPaths[name] || iconPaths.file).map((d) => `<path pathLength="1" d="${d}"></path>`).join('');
  return `<span class="icon" ${label ? `aria-label="${label}"` : 'aria-hidden="true"'}><svg viewBox="0 0 24 24">${paths}</svg></span>`;
}

const navigation = [
  { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: 'scrap', label: 'Base de Scrap', icon: 'database' },
  { route: 'componentes', label: 'Componentes', icon: 'sliders' },
  { route: 'acoes', label: 'Planos de ação', icon: 'analysis' },
  { route: 'alertas', label: 'Alertas', icon: 'bell', badge: 12 },
  { route: 'relatorios', label: 'Relatórios', icon: 'report' },
  { route: 'execucoes', label: 'Execuções', icon: 'play' },
  { route: 'auditoria', label: 'Auditoria', icon: 'audit' },
  { route: 'configuracoes', label: 'Configurações', icon: 'settings' },
];

const partNumbers = ['EAJ65714501', 'EAY65769201', 'EAJ66284201', 'EBR85875402', 'EBR89032104', 'EAJ65987304', 'EAJ66124008', 'EAJ65871302', 'EBR88410211', 'EBR87941306', 'EAJ66310007', 'EBR90221003', 'EAJ66048109', 'EBR89273012', 'EAJ65600418', 'EBR87145021', 'EAJ66490005', 'EBR89916010'];
const components = ['Tela LCD', 'Placa principal PCB', 'Moldura frontal', 'Fonte de alimentação', 'Alto-falante'];
const organizationCodes = ['ORG-01', 'ORG-02', 'ORG-03'];
const accounts = ['541101', '541205', '541310', '541420', '541535', '541640'];
const accountDescriptions = ['Consumo de material', 'Ajuste de inventário', 'Requisição de retrabalho', 'Perda de processo', 'Scrap de qualidade', 'Ajuste de devolução'];
const subinventoryGroups = ['Produção', 'Qualidade', 'Retrabalho'];
const subinventories = ['SUB-PRD-01', 'SUB-QLT-01', 'SUB-RWK-01', 'SUB-PRD-02'];
const warehouseMarkets = ['Mercado A', 'Mercado B', 'Mercado C'];
const receiptDepartments = ['Recebimento 01', 'Recebimento 02', 'Recebimento 03'];
const scrapLines = ['A01', 'A02', 'A04', 'A05', 'C02'];
const productAreas = ['TV', 'Monitor', 'AV', 'BM', 'VS', 'SMT', 'FA/MFG', 'Injeção/IPI'];
const modelCodes = ['OLED65C4', 'OLED55B4', '32MR50C', '27UP650', 'AV-S95QR', 'BM-UR8750', 'VS-43UR78', 'SMT-MAIN'];
const sectors = ['Packing', 'Insert Box', 'Inspection', 'Adjustment / Test', 'Final Assembly'];
const itemDescriptions = ['Painel OLED 65 polegadas', 'Moldura frontal OLED 55', 'Placa principal Monitor 32', 'Painel LCD 27 UHD', 'Moldura frontal IVS', 'Placa principal de áudio'];
const itemSpecs = ['OLED UHD', 'Resina ABS preta', 'PCB multicamadas', 'LCD UHD', 'Resina ABS preta', 'PCB amplificador'];
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
  },
  {
    component: 'Fonte de alimentação', defect: 'Saída de tensão fora da faixa', station: 'Teste elétrico',
    occurrence: 'A fonte apresentou tensão instável durante a validação funcional do conjunto.',
    category: 'Material', classification4m: ['Material', 'Machine'], rootCause: 'Componente eletrônico com variação acima do limite de especificação.',
    corrective: 'Segregar as fontes do lote e repetir o teste elétrico.', preventive: 'Reforçar a inspeção de recebimento e o controle por lote do fornecedor.'
  },
  {
    component: 'Alto-falante', defect: 'Distorção no teste de áudio', station: 'Teste acústico',
    occurrence: 'O conjunto apresentou ruído e distorção acima do limite durante o teste final.',
    category: 'Material', classification4m: ['Material'], rootCause: 'Variação na bobina do alto-falante comprometeu a resposta acústica.',
    corrective: 'Substituir o componente e reinspecionar o aparelho.', preventive: 'Aplicar amostragem acústica reforçada no recebimento do componente.'
  }
];
const aliases = ['D-COMMON', 'D-DIRECT', 'D-RW-REQ', 'P-REWORK', 'E-Q-SCRAP', 'Z-Q-RMA-ADJ'];

function generateTransactions() {
  const rows = Array.from({ length: 96 }, (_, i) => {
    const scenario = productionScenarios[i % productionScenarios.length];
    const day = 12 - (i % 12);
    const qty = i === 0 ? 14 : 2 + ((i * 7) % 39);
    const exchange = i % 11 === 2 ? null : 5.05 + (i % 8) * .017;
    const issuePrice = i === 0 ? 2845.7 : 390 + ((i * 347) % 2900);
    const issueAmount = issuePrice * qty;
    return {
      id: i === 0 ? 'TX-20260811-82194' : `TX-202608${String(day).padStart(2, '0')}-${82194 - i}`,
      transactionDate: `${String(day).padStart(2, '0')}/08/2026`,
      organizationCode: organizationCodes[i % organizationCodes.length],
      account: accounts[i % accounts.length], accountDescription: accountDescriptions[i % accountDescriptions.length], accountAlias: aliases[i % aliases.length],
      subinventoryGroup: subinventoryGroups[i % subinventoryGroups.length], subinventory: subinventories[i % subinventories.length],
      warehouseMarket: warehouseMarkets[i % warehouseMarkets.length], receiptDepartment: receiptDepartments[i % receiptDepartments.length],
      scrapLine: scrapLines[(i * 3 + 1) % scrapLines.length],
      productArea: productAreas[(i * 5 + 1) % productAreas.length], modelCode: modelCodes[(i * 3 + 2) % modelCodes.length],
      sector: sectors[(i * 2 + 1) % sectors.length], stationCode: `P${String((i % 11) + 1).padStart(2, '0')}`,
      partNumber: partNumbers[i % partNumbers.length], itemDescription: itemDescriptions[i % itemDescriptions.length], itemSpec: itemSpecs[i % itemSpecs.length],
      component: scenario.component,
      defect: scenario.defect, occurrence: scenario.occurrence, station: scenario.station,
      qty, issueQuantitySigned: -Math.abs(qty), issuePrice, issueAmount, exchangeRate: exchange, ifCost: exchange ? issueAmount / exchange : 0,
      movementType: 'Scrap',
      source: 'GERP',
      executionId: i < 18 ? 'EXE-20260811-0042' : `EXE-202608${String(day).padStart(2, '0')}-${String(46 - (i % 15)).padStart(4, '0')}`,
      processingStatus: !exchange ? 'Pendente' : i % 17 === 6 ? 'Rejeitado' : 'Validado',
      batch: `BAT-202608-${String(Math.floor(i / 12) + 1).padStart(3, '0')}`,
      processedAt: `${String(day).padStart(2, '0')}/08/2026 05:${String((i * 3) % 60).padStart(2, '0')}`,
      review: {
        status: i > 0 && i % 13 === 0 && exchange ? 'Justificado' : 'Pendente de revisão',
        category: i > 0 && i % 13 === 0 && exchange ? scenario.category : '', reason: i > 0 && i % 13 === 0 && exchange ? scenario.occurrence : '',
        requiresCause: i > 0 && i % 26 === 0 && exchange, classification4m: i > 0 && i % 26 === 0 && exchange ? scenario.classification4m : [], rootCause: i > 0 && i % 26 === 0 && exchange ? scenario.rootCause : '',
        title: i > 0 && i % 13 === 0 && exchange ? scenario.defect : '',
        risk: i % 3 === 0 ? 'Alto' : i % 3 === 1 ? 'Médio' : 'Baixo', recurrence: i % 4 === 0 ? 'Recorrente' : 'Pontual',
        fiveWhys: '', immediate: i > 0 && i % 13 === 0 && exchange ? scenario.corrective : '',
        corrective: i > 0 && i % 13 === 0 && exchange ? scenario.corrective : '', preventive: i > 0 && i % 26 === 0 && exchange ? scenario.preventive : '',
        responsible: 'Analista de Qualidade', responsibleDepartment: 'Qualidade', dueDate: '31/08/2026', actionStatus: 'Planejada',
        expectedResult: '', actualResult: '', executiveHighlight: '', reportOrder: i + 1,
        evidence: [], includeInReport: Boolean(i > 0 && i % 13 === 0 && exchange),
      },
    };
  });
  Object.assign(rows[0], { transactionDate: '11/08/2026', processedAt: '11/08/2026 05:00', exchangeRate: 5.18, issuePrice: 2845.7, issueAmount: 39839.8, ifCost: 39839.8 / 5.18 });
  const telaRows = rows.filter((row) => row.component === 'Tela LCD');
  telaRows.forEach((row, index) => { row.partNumber = partNumbers[index % partNumbers.length]; if (!row.exchangeRate) { row.exchangeRate = 5.12; row.processingStatus = 'Validado'; } });
  const normalizeQuantity = (group, target) => {
    const original = group.reduce((sum, row) => sum + row.qty, 0);
    group.forEach((row) => { row.qty = Math.max(1, Math.floor(row.qty * target / original)); });
    let difference = target - group.reduce((sum, row) => sum + row.qty, 0), cursor = 0;
    while (difference > 0) { group[cursor % group.length].qty += 1; difference -= 1; cursor += 1; }
  };
  normalizeQuantity(telaRows, 287);
  normalizeQuantity(rows.filter((row) => row.component === 'Moldura frontal'), 360);
  normalizeQuantity(rows.filter((row) => row.component === 'Placa principal PCB'), 330);
  normalizeQuantity(rows.filter((row) => row.component === 'Fonte de alimentação'), 160);
  normalizeQuantity(rows.filter((row) => row.component === 'Alto-falante'), 110);
  let mainQtyDifference = 14 - rows[0].qty, mainQtyCursor = 1;
  rows[0].qty = 14;
  while (mainQtyDifference > 0) { const candidate=telaRows[mainQtyCursor % telaRows.length]; if(candidate!==rows[0]&&candidate.qty>1){candidate.qty-=1;mainQtyDifference-=1;} mainQtyCursor+=1; }
  while (mainQtyDifference < 0) { const candidate=telaRows[mainQtyCursor % telaRows.length]; if(candidate!==rows[0]){candidate.qty+=1;mainQtyDifference+=1;} mainQtyCursor+=1; }
  rows.forEach((row) => { row.issueQuantitySigned = -Math.abs(row.qty); row.issueAmount = row.issuePrice * row.qty; row.ifCost = row.exchangeRate ? row.issueAmount / row.exchangeRate : 0; });
  const normalizeCost = (group, target) => {
    const current = group.reduce((sum, row) => sum + row.ifCost, 0);
    const factor = target / current;
    group.forEach((row) => { if (row.exchangeRate) row.issuePrice *= factor; row.issueAmount = row.issuePrice * row.qty; row.ifCost = row.exchangeRate ? row.issueAmount / row.exchangeRate : 0; });
  };
  normalizeCost(telaRows, 72400);
  normalizeCost(rows.filter((row) => row.component === 'Placa principal PCB'), 46000);
  normalizeCost(rows.filter((row) => row.component === 'Moldura frontal'), 38000);
  normalizeCost(rows.filter((row) => row.component === 'Fonte de alimentação'), 17500);
  normalizeCost(rows.filter((row) => row.component === 'Alto-falante'), 10360);
  rows[0].issuePrice = 8420 * rows[0].exchangeRate / rows[0].qty; rows[0].issueAmount = rows[0].issuePrice * rows[0].qty; rows[0].ifCost = 8420;
  normalizeCost(telaRows.filter((row) => row.partNumber === 'EAJ65714501' && row !== rows[0]), 29980);
  normalizeCost(telaRows.filter((row) => row.partNumber === 'EAY65769201'), 19100);
  normalizeCost(telaRows.filter((row) => row.partNumber === 'EAJ66284201'), 7800);
  normalizeCost(telaRows.filter((row) => !['EAJ65714501','EAY65769201','EAJ66284201'].includes(row.partNumber)), 7100);
  Object.assign(rows[54], { organizationCode: 'ORG-01', accountAlias: 'E-Q-SCRAP', itemDescription: 'Painel OLED 65 polegadas' });
  return rows;
}

function generateAlerts() {
  const types = ['Aumento de telas riscadas', 'Reincidência de objeto estranho', 'Falhas no teste funcional', 'Desvio de torque', 'Painéis trincados', 'Alto volume de scrap'];
  return Array.from({ length: 20 }, (_, i) => {
    const transaction = model?.transactions?.[i % model.transactions.length] || null;
    const scenario = productionScenarios[i % productionScenarios.length];
    const component = transaction?.component || scenario.component;
    const partNumber = transaction?.partNumber || partNumbers[i % partNumbers.length];
    const alertDay = 12 - (i % 12);
    const related = i === 0 ? ['TX-20260811-82194', 'TX-20260806-82140'] : [i, i + 6].map((index) => model?.transactions?.[index % model.transactions.length]?.id).filter(Boolean);
    return ({
    id: i === 0 ? 'ALT-20260812-0021' : `ALT-202608${String(alertDay).padStart(2, '0')}-${String(21 - i).padStart(4, '0')}`,
    severity: i < 6 ? 'Crítico' : i < 14 ? 'Alto' : 'Médio',
    dateTime: i === 0 ? '12/08 08:42' : `${String(alertDay).padStart(2, '0')}/08 ${String(7 + (i % 9)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    type: types[i % types.length], component, partNumber, productArea: transaction?.productArea||productAreas[i%productAreas.length], lineCode: transaction?.scrapLine||scrapLines[i%scrapLines.length], executionId: transaction?.executionId||'',
    impact: i === 0 ? 8420 : 1300 + ((i * 793) % 6500),
    description: i === 0 ? 'Aumento de telas riscadas associado a objeto metálico encontrado na esteira' : `${scenario.defect}: ocorrência acima do limite configurado no posto ${scenario.station}`,
    status: i === 0 ? 'Novo' : i % 5 === 0 ? 'Arquivado' : i % 3 === 0 ? 'Lido' : 'Novo',
    channel: i % 2 === 0 ? 'E-mail e plataforma' : 'Plataforma',
    transactionIds: related,
    });
  });
}

function generateExecutions() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: i === 0 ? 'EXE-20260812-0046' : i === 1 ? 'EXE-20260811-0042' : `EXE-202608${String(12 - (i % 6)).padStart(2, '0')}-${String(46 - i).padStart(4, '0')}`,
    source: 'GERP', process: 'Other Account Transaction Text Download',
    start: `${12 - (i % 6)}/08 05:00`, end: `${12 - (i % 6)}/08 05:${String(6 + (i % 4)).padStart(2, '0')}`,
    duration: `0${6 + (i % 4)}m${String(12 + i * 3).slice(-2)}s`, received: 1106 + i * 71, valid: 1106 + i * 71 - (i % 5), rejected: i % 5,
    status: i === 0 ? 'Parcial' : i === 7 ? 'Falha' : 'Concluído', scheduled: true, trigger: i%5===0?'Manual':'Agendada', actor:i%5===0?'Analista de Qualidade':'hanaro-scheduler', snapshotPublished:i===0?'Parcial':'Publicado', retryCount: 0, contingencyAvailable: false,
  }));
}

function generateComponentCatalog() {
  const types=['Painel','PCB','Estrutural','Fonte','Áudio'];
  return partNumbers.map((itemCode,index)=>({
    id:`CMP-${String(742+index).padStart(6,'0')}`,itemCode,
    normalizedName:itemDescriptions[index%itemDescriptions.length],component:components[index%components.length],
    itemType:types[index%types.length],productArea:productAreas[index%productAreas.length],division:index%2?'MFG':'MS',
    aliases:[itemCode.toLowerCase(),`${itemCode}-LEGACY`,index%3===0?`ALT-${itemCode.slice(-5)}`:null].filter(Boolean),
    source:'GERP · Other Account Transaction Text Download',lastOccurrence:`${String(12-(index%8)).padStart(2,'0')}/08/2026`,
    status:index%9===0?'Em validação':'Ativo',updatedAt:`${String(11-(index%5)).padStart(2,'0')}/08/2026 10:00`,
  }));
}

function generateActionPlans() {
  const titles=['Implantar JIG de reconexão','Revisar torque da parafusadeira','Instalar proteção na esteira','Padronizar manuseio ESD','Criar guia poka-yoke','Reforçar inspeção de recebimento','Nivelar esteira de transporte','Adicionar câmera no posto crítico','Revisar embalagem do painel','Validar receita de teste','Treinar abastecimento de linha','Auditar dispositivo de encaixe'];
  const statuses=['Planejada','Em andamento','Bloqueada','Concluída','Aguardando eficácia','Validada'];
  return titles.map((title,index)=>({
    id:`ACT-2026-${String(index+1).padStart(3,'0')}`,title,lineCode:scrapLines[index%scrapLines.length],stationCode:`P${String(index%11+1).padStart(2,'0')}`,
    productArea:productAreas[index%productAreas.length],owner:index%3===0?'Marina Souza':index%3===1?'Carlos Lima':'Equipe PM',ownerArea:index%3===0?'MFG':index%3===1?'Qualidade':'PM',
    category4m:['Method','Machine','Material','Man'][index%4],risk:index%4===0?'Crítico':index%3===0?'Alto':'Médio',
    dueDate:`${String(8+(index%18)).padStart(2,'0')}/08/2026`,status:statuses[index%statuses.length],progress:[10,45,25,100,90,100][index%6],
    evidenceCount:index%4,transactionIds:model?.transactions?.slice(index,index+2).map((row)=>row.id)||[],
    ifCost:6200+index*875,qty:18+index*7,reportIncluded:index%4===0,
    description:productionScenarios[index%productionScenarios.length].preventive,
  }));
}

function generateRecipients(){return [
  {id:'REC-0018',name:'Coordenação MFG',email:'mfg@empresa.com',group:'Gestão',scope:'Relatórios mensais',categories:'Relatórios e alertas críticos',consent:'Aceito',status:'Ativo'},
  {id:'REC-0019',name:'Qualidade MS',email:'qualidade@empresa.com',group:'Qualidade',scope:'TV e Monitor',categories:'Relatórios',consent:'Aceito',status:'Ativo'},
  {id:'REC-0020',name:'Produção TV',email:'producao.tv@empresa.com',group:'Produção',scope:'TV',categories:'Alertas críticos',consent:'Pendente',status:'Ativo'},
  {id:'REC-0021',name:'PM Hanaro',email:'pm@empresa.com',group:'Projeto',scope:'Todos',categories:'Relatórios e falhas',consent:'Aceito',status:'Ativo'},
  {id:'REC-0022',name:'Lista histórica',email:'historico@empresa.com',group:'Arquivo',scope:'Todos',categories:'Relatórios',consent:'Revogado',status:'Inativo'},
];}

function generateAudit() {
  const actions = ['Persistiu lote', 'Validou transação', 'Atualizou alerta', 'Consultou relatório', 'Aplicou taxa de câmbio'];
  const events = Array.from({ length: 50 }, (_, i) => ({
    id: `AUD-${92300 - i}`, timestamp: `12/08/2026 ${String(9 - Math.floor(i / 12)).padStart(2, '0')}:${String((51 - i * 3 + 60) % 60).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    actor: i % 4 === 0 ? 'analista.qualidade' : 'hanaro-backend', origin: i % 4 === 0 ? 'Web' : 'API', action: actions[i % actions.length],
    entity: i % 2 ? 'Transaction' : 'Execution', identifier: i % 2 ? `TX-20260811-${82194 - i}` : `EXE-20260812-${String(46 - (i % 15)).padStart(4, '0')}`,
    before: i % 3 ? 'Recebido' : 'Validando', after: i % 3 ? 'Validado' : 'Concluído', correlation: `COR-${921842 - i}`, severity: i % 17 === 0 ? 'Crítico' : 'Informativo',
  }));
  return [
    { id:'AUD-92351',timestamp:'12/08/2026 09:51:02',actor:'hanaro-backend',origin:'API',action:'Processou dados recebidos do GERP',entity:'Execution',identifier:'EXE-20260811-0042',before:'Recebido',after:'Concluído',correlation:'COR-921842',severity:'Informativo' },
    { id:'AUD-92350',timestamp:'12/08/2026 09:50:11',actor:'hanaro-backend',origin:'API',action:'Gerou alerta por variação de IF Cost',entity:'Alert',identifier:'ALT-20260812-0021',before:'Inexistente',after:'Novo',correlation:'COR-921842',severity:'Crítico' },
    { id:'AUD-92349',timestamp:'12/08/2026 09:48:22',actor:'analista.qualidade',origin:'Web',action:'Abriu registros relacionados pelo alerta',entity:'Alert',identifier:'ALT-20260812-0021',before:'Novo',after:'Lido',correlation:'COR-921842',severity:'Informativo' },
    { id:'AUD-92348',timestamp:'12/08/2026 09:45:09',actor:'analista.qualidade',origin:'Web',action:'Justificou registro de scrap',entity:'Transaction',identifier:'TX-20260810-82168',before:'Pendente de revisão',after:'Justificado',correlation:'COR-921842',severity:'Informativo' },
    { id:'AUD-92347',timestamp:'12/08/2026 09:42:41',actor:'analista.qualidade',origin:'Web',action:'Registrou relatório com scraps revisados',entity:'Report',identifier:'REP-2026-W33-v8',before:'Rascunho',after:'Publicado',correlation:'COR-921842',severity:'Informativo' },
    ...events,
  ];
}

const model = {
  transactions: generateTransactions(), components: generateComponentCatalog(), actions: [], recipients: generateRecipients(), alerts: [], executions: generateExecutions(), audit: generateAudit(),
  reports: Array.from({ length: 8 }, (_, i) => ({ id: `REP-2026-W${String(33 - Math.floor(i / 2)).padStart(2, '0')}-v${8 - i}`, version: `v1.${8 - i}`, type: i % 3 === 0 ? 'Mensal' : 'Semanal', period: i % 3 === 0 ? 'Ago/2026' : '03–09 Ago', generatedAt: `${10 - (i % 4)}/08 08:${54 - i}`, author: 'Analista de Qualidade', ifCost: 47820 + i * 870, format: i % 2 ? 'XLSX' : 'PDF', status: i === 7 ? 'Rascunho' : 'Publicado', reviewIds: i < 3 ? ['TX-20260810-82168','TX-20260809-82155'] : [] })),
  sends: Array.from({ length: 6 }, (_, i) => ({ report: `v1.${8 - i}`, recipient: i % 2 ? 'qualidade@exemplo.local' : 'gestores@exemplo.local', channel: 'E-mail', requestedAt: `${10 - i}/08 09:10`, status: i === 2 ? 'Falha' : i === 4 ? 'Pendente' : 'Enviado', attempts: i === 2 ? 2 : 1 })),
  settings: { target: -15, baseline: 2025, year: 2026, targetStatus:'Publicado', targetVersion:'v1.2', monthlyTargets:[27091,26596,26100,25605,25410,24920,23813,23324,22728,22136,21538,21125], upload: true, validation: true, reportFrequency: 'Semanal', notifyCritical: true },
};
model.alerts = generateAlerts();
model.actions = generateActionPlans();

const initialRouteParts = (location.hash.slice(1) || 'dashboard').split('?')[0].split('/');
const initialReviewId = initialRouteParts[0] === 'scrap' && initialRouteParts[1] === 'revisar' ? decodeURIComponent(initialRouteParts[2] || '') : null;
const supportedLocales = ['pt-BR', 'en', 'ko'];
const storedLocale = localStorage.getItem('hanaro-locale');
const queryParams = new URLSearchParams(location.search);
const queryLocale = queryParams.get('lang');
const state = {
  route: initialRouteParts[0] || 'dashboard', reportTab: initialRouteParts[0]==='relatorios'&&['construir','preview','versoes','envios'].includes(initialRouteParts[1])?initialRouteParts[1]:'construir', settingsTab: initialRouteParts[0]==='configuracoes'&&['negocio','dados','rotina','linhas','emails','notificacoes','integracoes','interface'].includes(initialRouteParts[1])?initialRouteParts[1]:'negocio',
  locale: supportedLocales.includes(queryLocale) ? queryLocale : supportedLocales.includes(storedLocale) ? storedLocale : 'pt-BR',
  scrapPage: 1, scrapPageSize: 10, scrapSearch: '', scrapSort: { key: 'transactionDate', direction: 'desc' }, scrapListScroll: 0, pendingScrollTop: null, auditSearch: '', dashboardFactor: 1,
  dashboardMetric: queryParams.get('metric') === 'qty' ? 'qty' : 'usd', dashboardMasked: queryParams.get('masked') === '1', dashboardAnalysis: queryParams.get('analysis') === 'relative' ? 'relative' : 'absolute', dashboardUpdatedAt: '15/08/2026 10:00',
  dashboardFilters: { year: '2026', period: 'Acumulado Jan–Ago', compare: 'Mesmo período de 2025', product: 'Todos', scrapLine: 'Todas', component: 'Todos', partNumber: 'Todos' },
  scrapFilters: { date: 'Todas as datas', productArea: 'Todos', scrapLine: 'Todas', movementType: 'Todos', processingStatus: 'Todos', reviewStatus: 'Todos' },
  scrapAdvancedFilters: { organizationCode: 'Todas', accountAlias: 'Todos', subinventoryGroup: 'Todos', subinventory: 'Todos', warehouseMarket: 'Todos', receiptDepartment: 'Todos', component: 'Todos', modelCode: 'Todos', sector: 'Todos', stationCode: 'Todos', partNumber: 'Todos', reportInclusion: 'Todos' },
  alertFilters: { period: 'Últimos 7 dias', severity: 'Todas', type: 'Todos', productArea: 'Todos', scrapLine: 'Todas', status: 'Todos', channel: 'Todos' },
  executionStatus: 'Todos', executionFilters:{period:'Hoje',source:'Todas',trigger:'Todos'}, auditEntity: 'Todas', auditFilters:{period:'Hoje',actor:'Todos',origin:'Todos',severity:'Todas'},
  componentSearch: '', componentFilters: { productArea: 'Todos', division: 'Todas', itemType: 'Todos', status: 'Todos' },
  actionView: 'list', actionFilters: { period: 'Agosto/2026', productArea: 'Todos', scrapLine: 'Todas', owner: 'Todos', category4m: 'Todos', risk: 'Todos', status: 'Todos', overdue: 'Todos' },
  scrapView: initialRouteParts[1] === 'revisar' ? 'review' : 'list', selectedScrapIds: initialReviewId ? [initialReviewId] : [], activeReviewId: initialReviewId,
  tvActive: false, tvPanel: 0, tvPaused: false, tvRotation: true, tvDuration: 15,
  context: { source: null, productArea: null, component: null, modelCode: null, sector: null, stationCode: null, partNumber: null, scrapLine: null, transactionId: null, alertId: null, executionId: null },
};
let tvTimer = null;
let tvControlsTimer = null;

const i18nMessages = {
  en: {
    'Base de Scrap': 'Scrap Database', 'Alertas': 'Alerts', 'Relatórios': 'Reports', 'Execuções': 'Runs', 'Auditoria': 'Audit', 'Configurações': 'Settings',
    'Ajuda e suporte': 'Help and support', 'Analista de Qualidade': 'Quality Analyst', 'Atualizado às 09:42': 'Updated at 09:42',
    'Dashboard de Scrap': 'Scrap Dashboard', 'Atualizar': 'Refresh', 'Exportar dados': 'Export data', 'Gerar relatório': 'Generate report', 'Limpar filtros': 'Clear filters',
    'Período': 'Period', 'Visão': 'View', 'Material': 'Material',
    'Acumulado': 'Cumulative', 'Diário': 'Daily', 'Semanal': 'Weekly', 'Mensal': 'Monthly', 'Todas': 'All', 'Todos': 'All', 'Últimos 7 dias': 'Last 7 days',
    'IF Cost acumulado': 'Cumulative IF Cost', 'Mesmo período': 'Same period', 'Redução': 'Reduction', 'Gap para meta': 'Gap to target', 'Scrap registrado': 'Recorded scrap',
    'Evolução acumulada do IF Cost': 'Cumulative IF Cost trend', 'Evolução diária do IF Cost': 'Daily IF Cost trend', 'Evolução semanal do IF Cost': 'Weekly IF Cost trend', 'Evolução mensal do IF Cost': 'Monthly IF Cost trend',
    'Comparativo automático 2026, 2025 e meta': 'Automatic comparison: 2026, 2025 and target', 'Top ofensores': 'Top offenders', 'Explorar na Base': 'Explore database',
    'Pareto de componentes': 'Component Pareto', 'Ocorrências que exigem atenção': 'Occurrences requiring attention',
    'Data': 'Date', 'Componente': 'Component', 'Status': 'Status', 'Ações': 'Actions', 'Ver na Base': 'View in database', 'Revisar': 'Review', 'Ver revisão': 'View review',
    'Mais filtros': 'More filters', 'Data da transação': 'Transaction date', 'Status da revisão': 'Review status',
    'Todas as datas': 'All dates', 'Hoje': 'Today', 'Pendente de revisão': 'Pending review', 'Em revisão': 'Under review', 'Justificado': 'Justified',
    'IF Cost filtrado': 'Filtered IF Cost', 'QTY filtrada': 'Filtered QTY', 'Participação no total': 'Share of total', 'Pendentes de revisão': 'Pending review', 'Justificados': 'Justified',
    'Ranking de Part Numbers': 'Part Number ranking', 'Registros de scrap': 'Scrap records', 'Revisão': 'Review', 'Ação': 'Action', 'Justificar selecionados': 'Justify selected', 'Limpar seleção': 'Clear selection',
    'Revisar registros de scrap': 'Review scrap records', 'Voltar para a Base': 'Back to database', 'Salvar rascunho': 'Save draft', 'Seleção': 'Selection',
    'Registro de scrap': 'Scrap record', 'Ocorrência de produção': 'Production occurrence', 'Componente afetado': 'Affected component', 'Posto': 'Station',
    'Revisão humana': 'Human review', 'Justificativa do scrap': 'Scrap justification', 'Categoria da justificativa': 'Justification category', 'Revisor responsável': 'Responsible reviewer',
    'Justificativa obrigatória': 'Required justification', 'Este item exige análise de causa detalhada': 'This item requires detailed root cause analysis', 'Classificação 4M': '4M classification',
    'Causa identificada': 'Identified cause', 'Ação corretiva': 'Corrective action', 'Ação preventiva': 'Preventive action', 'Evidências': 'Evidence', 'Adicionar evidência': 'Add evidence',
    'Incluir no próximo relatório': 'Include in next report', 'Origem': 'Source', 'Execução': 'Run', 'Defeito de produção': 'Production defect', 'Defeito observado': 'Observed defect',
    'Ocorrência registrada': 'Recorded occurrence', 'Dados do scrap': 'Scrap data', 'Rastreabilidade automática': 'Automatic traceability', 'Processado em': 'Processed at',
    'Severidade': 'Severity', 'Tipo': 'Type', 'Componente afetado': 'Affected component', 'Novos': 'New', 'Críticos': 'Critical', 'Lidos': 'Read', 'Enviados por e-mail': 'Sent by email',
    'Alertas por dia': 'Alerts per day', 'Evento': 'Event', 'Descrição': 'Description', 'Leitura': 'Read status', 'Canal': 'Channel', 'Ver registros': 'View records',
    'Marcar novos como lidos': 'Mark new as read', 'Exportar': 'Export', 'Gerar relatório': 'Generate report', 'Versões': 'Versions', 'Envios': 'Deliveries', 'Novo relatório': 'New report',
    'Exportar histórico': 'Export history', 'Configuração': 'Configuration', 'Comparação': 'Comparison', 'Formato': 'Format', 'Gerar PDF': 'Generate PDF', 'Gerar Excel': 'Generate Excel',
    'Gerar e registrar versão': 'Generate and register version', 'Registros justificados do período': 'Justified records for the period', 'Preview': 'Preview',
    'Execuções': 'Runs', 'Origem': 'Source', 'Início': 'Start', 'Fim': 'End', 'Duração': 'Duration', 'Recebidos': 'Received', 'Válidos': 'Valid', 'Rejeitados': 'Rejected',
    'Execuções hoje': 'Runs today', 'Concluídas': 'Completed', 'Parciais': 'Partial', 'Falhas': 'Failures', 'Registros processados': 'Processed records',
    'Eventos hoje': 'Events today', 'Ações humanas': 'Human actions', 'Eventos automáticos': 'Automated events', 'Eventos críticos': 'Critical events', 'Ator': 'Actor', 'Entidade': 'Entity',
    'Negócio': 'Business', 'Dados': 'Data', 'Notificações': 'Notifications', 'Acesso': 'Access', 'Integrações': 'Integrations', 'Interface': 'Interface', 'Salvar alterações': 'Save changes',
    'Tema': 'Theme', 'Escolha a aparência da interface.': 'Choose the interface appearance.', 'Claro': 'Light', 'Escuro': 'Dark', 'Sistema': 'System', 'Idioma': 'Language',
    'Idioma exibido na interface do sistema.': 'Language displayed in the system interface.', 'Português': 'Portuguese', 'Inglês': 'English', 'Coreano': 'Korean',
    'Seleção ilustrativa neste protótipo.': 'Illustrative selection in this prototype.', 'Metas de Material Scrap': 'Material Scrap targets', 'Regras de dados': 'Data rules',
    'Padrões de relatório': 'Report defaults', 'Nome': 'Name', 'Grupo': 'Group', 'Usuário': 'User', 'Perfil': 'Role', 'Escopo': 'Scope',
    'Modo TV': 'TV Mode', 'Abrir Modo TV': 'Open TV Mode', 'Alternar tema': 'Toggle theme', 'Notificações': 'Notifications', 'Alterar idioma': 'Change language'
  },
  ko: {
    'Dashboard': '대시보드', 'Base de Scrap': '스크랩 데이터', 'Alertas': '알림', 'Relatórios': '보고서', 'Execuções': '실행', 'Auditoria': '감사', 'Configurações': '설정',
    'Ajuda e suporte': '도움말 및 지원', 'Analista de Qualidade': '품질 분석가', 'Atualizado às 09:42': '09:42 업데이트',
    'Dashboard de Scrap': '스크랩 대시보드', 'Atualizar': '새로고침', 'Exportar dados': '데이터 내보내기', 'Gerar relatório': '보고서 생성', 'Limpar filtros': '필터 초기화',
    'Período': '기간', 'Visão': '보기', 'Material': '자재',
    'Acumulado': '누적', 'Diário': '일간', 'Semanal': '주간', 'Mensal': '월간', 'Todas': '전체', 'Todos': '전체', 'Últimos 7 dias': '최근 7일',
    'IF Cost acumulado': '누적 IF Cost', 'Mesmo período': '동일 기간', 'Redução': '감소율', 'Gap para meta': '목표 차이', 'Scrap registrado': '등록 스크랩',
    'Evolução acumulada do IF Cost': '누적 IF Cost 추이', 'Evolução diária do IF Cost': '일간 IF Cost 추이', 'Evolução semanal do IF Cost': '주간 IF Cost 추이', 'Evolução mensal do IF Cost': '월간 IF Cost 추이',
    'Comparativo automático 2026, 2025 e meta': '2026년, 2025년 및 목표 자동 비교', 'Top ofensores': '주요 손실 항목', 'Explorar na Base': '데이터에서 보기',
    'Pareto de componentes': '부품 파레토', 'Ocorrências que exigem atenção': '주의가 필요한 발생 건',
    'Data': '날짜', 'Componente': '부품', 'Status': '상태', 'Ações': '작업', 'Ver na Base': '데이터 보기', 'Revisar': '검토', 'Ver revisão': '검토 보기',
    'Mais filtros': '추가 필터', 'Data da transação': '거래 날짜', 'Status da revisão': '검토 상태',
    'Todas as datas': '전체 날짜', 'Hoje': '오늘', 'Pendente de revisão': '검토 대기', 'Em revisão': '검토 중', 'Justificado': '사유 등록 완료',
    'IF Cost filtrado': '필터된 IF Cost', 'QTY filtrada': '필터된 수량', 'Participação no total': '전체 비중', 'Pendentes de revisão': '검토 대기', 'Justificados': '사유 등록 완료',
    'Ranking de Part Numbers': '부품 번호 순위', 'Registros de scrap': '스크랩 기록', 'Revisão': '검토', 'Ação': '작업', 'Justificar selecionados': '선택 항목 사유 등록', 'Limpar seleção': '선택 해제',
    'Revisar registros de scrap': '스크랩 기록 검토', 'Voltar para a Base': '데이터로 돌아가기', 'Salvar rascunho': '초안 저장', 'Seleção': '선택 항목',
    'Registro de scrap': '스크랩 기록', 'Ocorrência de produção': '생산 발생 건', 'Componente afetado': '영향 부품', 'Posto': '작업 공정',
    'Revisão humana': '담당자 검토', 'Justificativa do scrap': '스크랩 사유', 'Categoria da justificativa': '사유 분류', 'Revisor responsável': '담당 검토자',
    'Justificativa obrigatória': '필수 사유', 'Este item exige análise de causa detalhada': '이 항목은 상세 원인 분석이 필요합니다', 'Classificação 4M': '4M 분류',
    'Causa identificada': '확인된 원인', 'Ação corretiva': '시정 조치', 'Ação preventiva': '예방 조치', 'Evidências': '증빙', 'Adicionar evidência': '증빙 추가',
    'Incluir no próximo relatório': '다음 보고서에 포함', 'Origem': '출처', 'Execução': '실행', 'Defeito de produção': '생산 결함', 'Defeito observado': '관찰된 결함',
    'Ocorrência registrada': '등록된 발생 내용', 'Dados do scrap': '스크랩 데이터', 'Rastreabilidade automática': '자동 추적', 'Processado em': '처리 시간',
    'Severidade': '심각도', 'Tipo': '유형', 'Novos': '신규', 'Críticos': '긴급', 'Lidos': '읽음', 'Enviados por e-mail': '이메일 발송',
    'Alertas por dia': '일별 알림', 'Evento': '이벤트', 'Descrição': '설명', 'Leitura': '열람 상태', 'Canal': '채널', 'Ver registros': '기록 보기',
    'Marcar novos como lidos': '신규 알림 읽음 처리', 'Exportar': '내보내기', 'Versões': '버전', 'Envios': '발송', 'Novo relatório': '새 보고서', 'Exportar histórico': '이력 내보내기',
    'Configuração': '구성', 'Comparação': '비교', 'Formato': '형식', 'Gerar PDF': 'PDF 생성', 'Gerar Excel': 'Excel 생성', 'Gerar e registrar versão': '버전 생성 및 등록',
    'Registros justificados do período': '기간 내 사유 등록 기록', 'Preview': '미리보기', 'Início': '시작', 'Fim': '종료', 'Duração': '소요 시간', 'Recebidos': '수신', 'Válidos': '유효', 'Rejeitados': '거부',
    'Execuções hoje': '오늘 실행', 'Concluídas': '완료', 'Parciais': '부분 완료', 'Falhas': '실패', 'Registros processados': '처리된 기록',
    'Eventos hoje': '오늘 이벤트', 'Ações humanas': '사용자 작업', 'Eventos automáticos': '자동 이벤트', 'Eventos críticos': '긴급 이벤트', 'Ator': '수행자', 'Entidade': '엔터티',
    'Negócio': '비즈니스', 'Dados': '데이터', 'Notificações': '알림', 'Acesso': '접근 권한', 'Integrações': '연동', 'Interface': '인터페이스', 'Salvar alterações': '변경 저장',
    'Tema': '테마', 'Escolha a aparência da interface.': '인터페이스 모양을 선택하세요.', 'Claro': '라이트', 'Escuro': '다크', 'Sistema': '시스템', 'Idioma': '언어',
    'Idioma exibido na interface do sistema.': '시스템 인터페이스에 표시할 언어입니다.', 'Português': '포르투갈어', 'Inglês': '영어', 'Coreano': '한국어',
    'Seleção ilustrativa neste protótipo.': '이 프로토타입에서는 화면 예시용입니다.', 'Metas de Material Scrap': '자재 스크랩 목표', 'Regras de dados': '데이터 규칙',
    'Padrões de relatório': '보고서 기본값', 'Nome': '이름', 'Grupo': '그룹', 'Usuário': '사용자', 'Perfil': '역할', 'Escopo': '범위',
    'Modo TV': 'TV 모드', 'Abrir Modo TV': 'TV 모드 열기', 'Alternar tema': '테마 전환', 'Alterar idioma': '언어 변경'
  }
};

Object.assign(i18nMessages.en, {
  'Meta': 'Target', 'Meta anual: -15%': 'Annual target: -15%', 'US$ 3.805 acima do target': 'US$ 3,805 above target',
  'Tela LCD': 'LCD panel', 'Moldura frontal': 'Front frame', 'Placa principal PCB': 'Main PCB',
  'Áudio': 'Audio', 'Acumulado 2026 × PY': 'Cumulative 2026 × PY', 'Mesmo período PY': 'Same period PY',
  'Agosto/2026': 'August/2026', 'Ago/2026': 'Aug/2026', '03–09 Ago': 'Aug 03–09',
  '1. Tela LCD · 2. Placa principal PCB · 3. Moldura frontal': '1. LCD panel · 2. Main PCB · 3. Front frame',
  'Data/Hora': 'Date/Time', 'Impacto': 'Impact',
  'Risco profundo no painel': 'Deep scratch on panel', 'Trinca no ponto de fixação': 'Crack at mounting point', 'Falha no teste funcional': 'Functional test failure',
  'Painel trincado por impacto': 'Impact-cracked panel', 'Deformação e desalinhamento': 'Deformation and misalignment', 'Conector danificado': 'Damaged connector',
  'Esteira de montagem final': 'Final assembly conveyor', 'Posto de parafusamento': 'Screwdriving station', 'Montagem eletrônica': 'Electronics assembly',
  'Abastecimento da linha': 'Line feeding', 'Prensa de encaixe': 'Press-fit station', 'Conexão do cabo flat': 'Flat cable connection',
  'Pendente': 'Pending', 'Concluído': 'Completed', 'Parcial': 'Partial', 'Falha': 'Failed', 'Validado': 'Validated', 'Rejeitado': 'Rejected',
  'Novo': 'New', 'Lido': 'Read', 'Arquivado': 'Archived', 'Crítico': 'Critical', 'Alto': 'High', 'Médio': 'Medium', 'Ativo': 'Active', 'Inativo': 'Inactive',
  'Configurado': 'Configured', 'Operacional': 'Operational', 'Pausado': 'Paused', 'Informativo': 'Informational', 'Processando': 'Processing', 'Publicado': 'Published',
  'E-mail e plataforma': 'Email and platform', 'Somente plataforma': 'Platform only', 'Plataforma': 'Platform', 'Imediato': 'Immediate',
  'Notificações ainda não abertas': 'Notifications not opened yet', 'Nenhum registro encontrado.': 'No records found.', 'Nenhum Part Number no contexto atual.': 'No Part Number in the current context.',
  'Nenhum registro para os filtros selecionados.': 'No records for the selected filters.', 'Nenhuma evidência adicionada.': 'No evidence added.',
  'A justificativa pode ser revisada item a item.': 'The justification can be reviewed item by item.',
  'Explique por que o item foi registrado como scrap. Os campos serão auditados.': 'Explain why the item was recorded as scrap. The fields are auditable.',
  'Ative somente quando a justificativa simples não for suficiente para explicar o scrap.': 'Enable only when a simple justification is not enough to explain the scrap.',
  'Fotos, documentos ou comentários vinculados ao registro.': 'Photos, documents or comments linked to the record.',
  'Descreva o motivo deste registro de scrap...': 'Describe the reason for this scrap record...', 'Selecione...': 'Select...',
  'Registre a causa validada...': 'Enter the validated cause...', 'Ação imediata': 'Immediate action', 'Prevenção de recorrência': 'Recurrence prevention',
  'Este item exige análise de causa detalhada': 'This item requires detailed root cause analysis',
  'Categoria da justificativa': 'Justification category', 'Máquina': 'Machine', 'Mão de obra': 'Labor', 'Processo': 'Process', 'Engenharia': 'Engineering', 'Fornecedor': 'Supplier', 'Outro': 'Other',
  'Aumento de telas riscadas': 'Increase in scratched panels', 'Reincidência de objeto estranho': 'Foreign-object recurrence', 'Falhas no teste funcional': 'Functional test failures',
  'Desvio de torque': 'Torque deviation', 'Painéis trincados': 'Cracked panels', 'Alto volume de scrap': 'High scrap volume',
  'Objeto estranho na esteira': 'Foreign object on conveyor', 'Defeito de montagem': 'Assembly defect', 'Últimos 30 dias': 'Last 30 days',
  'Resumo semanal': 'Weekly summary', 'Alertas críticos': 'Critical alerts', 'Falhas de ingestão': 'Ingestion failures', 'Qualidade': 'Quality', 'Gestores': 'Managers',
  'Gerar relatório': 'Generate report', 'Conteúdo consolidado': 'Consolidated content', 'Indicadores e comparativo': 'Indicators and comparison',
  'Scraps revisados e suas justificativas': 'Reviewed scrap records and their justifications', 'Observação do responsável': 'Owner note',
  'Comentário opcional para contextualizar o período...': 'Optional comment to provide context for the period...',
  'Somente scraps revisados podem compor o relatório.': 'Only reviewed scrap records can be included in the report.',
  'Relatório de Material Scrap': 'Material Scrap Report', 'IF COST REVISADO': 'REVIEWED IF COST', 'Justificativas predominantes': 'Leading justifications',
  'Revisões rastreáveis': 'Traceable reviews', 'Nenhum registro justificado no período.': 'No justified records in the period.',
  'ID rastreável': 'Traceable ID', 'Gerado em': 'Generated at', 'Gerado por': 'Generated by', 'Scraps revisados': 'Reviewed scrap',
  'Destinatário': 'Recipient', 'Solicitado em': 'Requested at', 'Tentativas': 'Attempts', 'Reenviar': 'Resend', 'Simular envio': 'Simulate delivery',
  'Processo': 'Process', 'Disparadas pelo agendamento': 'Triggered by schedule', 'Reprocessamento disponível': 'Reprocessing available',
  'Falhas por categoria — últimos 30 dias': 'Failures by category — last 30 days',
  'A contingência só é liberada após uma tentativa de reprocessamento sem sucesso.': 'Contingency is released only after an unsuccessful reprocessing attempt.',
  'Câmbio indisponível': 'Exchange rate unavailable', 'Arquivo inválido': 'Invalid file', 'Duplicidade': 'Duplicate record', 'Schema divergente': 'Schema mismatch',
  'Buscar ID, usuário, entidade ou descrição...': 'Search ID, user, entity or description...', 'Humano': 'Human', 'Automático': 'Automated',
  'Identificador': 'Identifier', 'Estado anterior': 'Previous state', 'Estado posterior': 'New state', 'Exportar eventos': 'Export events',
  'Parâmetros usados nos comparativos de IF Cost.': 'Parameters used in IF Cost comparisons.', 'Baseline': 'Baseline', 'Meta de redução': 'Reduction target', 'Ano': 'Year',
  'Componentes prioritários': 'Priority components', 'Parâmetros fictícios sujeitos à homologação.': 'Mock parameters subject to validation.',
  'Contingência operacional': 'Operational contingency', 'Ingestão automática': 'Automatic ingestion', 'Importação contingencial': 'Contingency import',
  'Relatório': 'Report', 'Enviado': 'Sent',
  'Visão Executiva': 'Executive View', 'Dados atualizados': 'Data up to date', 'Meta 2026': '2026 target', 'Redução anual': 'Annual reduction',
  'Evolução do IF Cost — 2026 × 2025 × Meta': 'IF Cost trend — 2026 × 2025 × Target', 'Top 3 componentes afetados': 'Top 3 affected components',
  'unidades de scrap': 'scrap units', 'transações': 'transactions', 'alertas críticos': 'critical alerts',
  'Pausar': 'Pause', 'Continuar': 'Resume', 'Rotação automática': 'Automatic rotation', 'Visão única': 'Single view', 'Intervalo': 'Interval', 'Tela cheia': 'Full screen', 'Sair': 'Exit',
  'ONDE ESTAMOS PERDENDO DINHEIRO': 'WHERE WE ARE LOSING MONEY', 'Principais ofensores do período': 'Top offenders for the period',
  'Onde estamos perdendo dinheiro': 'Where we are losing money',
  'Pareto de defeitos por IF Cost': 'Defect Pareto by IF Cost',
  'Defeito mais crítico': 'Most critical defect', 'Risco no painel': 'Panel scratch', 'do IF Cost acumulado': 'of cumulative IF Cost',
  'PROBLEMAS QUE EXIGEM AÇÃO': 'ISSUES REQUIRING ACTION', 'Ocorrências prioritárias': 'Priority occurrences', 'Situação das revisões': 'Review status',
  'Problemas que exigem ação': 'Issues requiring action',
  'Pendentes': 'Pending', 'Justificadas': 'Justified', 'Categorias predominantes': 'Leading categories', 'Outros': 'Others',
  'COMPARATIVO E TENDÊNCIA': 'COMPARISON AND TREND', 'Evolução acumulada no ano': 'Cumulative yearly trend',
  'Comparativo e tendência': 'Comparison and trend', 'Controles do Modo TV': 'TV Mode controls', 'Painel anterior': 'Previous panel',
  'Pausar rotação': 'Pause rotation', 'Continuar rotação': 'Resume rotation', 'Próximo painel': 'Next panel', 'Sair do Modo TV': 'Exit TV Mode',
  'Resultado acumulado': 'Cumulative result', 'Restante para meta': 'Remaining to target',
  'Ver execução': 'View run', 'Explorar Part Number': 'Explore Part Number', 'Revisar registro': 'Review record',
  'Evento notificado': 'Notified event', 'Alerta': 'Alert', 'Impacto estimado': 'Estimated impact', 'Área': 'Area',
  'Registros relacionados': 'Related records', 'A justificativa e a revisão são feitas na Base de Scrap.': 'Justification and review are completed in the Scrap Database.',
  'Histórico da notificação': 'Notification history', 'Condição detectada': 'Condition detected', 'Notificação enviada': 'Notification sent',
  'Estado atual': 'Current state', 'Arquivar alerta': 'Archive alert', 'Ver registros de scrap': 'View scrap records',
  'Agendada': 'Scheduled', 'Timeline automática': 'Automated timeline', 'Request automático iniciado': 'Automated request started',
  'Arquivo localizado no GERP': 'File located in GERP', 'Arquivo recebido': 'File received', 'Validação estrutural': 'Structural validation',
  'Normalização': 'Normalization', 'Conversão': 'Conversion', 'Taxa de câmbio não localizada': 'Exchange rate not found',
  'Persistência': 'Persistence', 'Processamento concluído': 'Processing completed', 'Exceções': 'Exceptions',
  'Registro': 'Record', 'Motivo': 'Reason', 'Etapa': 'Step', 'Taxa não localizada': 'Exchange rate not found',
  'Registro já processado': 'Record already processed', 'Ignorado': 'Ignored', 'Ver registros processados': 'View processed records', 'Reprocessar': 'Reprocess',
  'Integridade': 'Integrity', 'Eventos de auditoria são imutáveis e não podem ser excluídos pelo protótipo.': 'Audit events are immutable and cannot be deleted in the prototype.',
  'Fechar': 'Close', 'Tudo certo': 'All set', 'Ação não concluída': 'Action not completed',
  'Central de suporte simulada. Nenhum chamado real foi enviado.': 'Simulated support center. No real ticket was submitted.',
  'O perfil do protótipo está em modo de demonstração.': 'The prototype profile is in demo mode.',
  'Você tem novos alertas. Abra a notificação para ver os registros relacionados.': 'You have new alerts. Open the notification to view related records.',
  'Arquivo fictício preparado para demonstração.': 'Mock file prepared for the demo.', 'Dados atualizados.': 'Data updated.',
  'Filtros limpos.': 'Filters cleared.', 'Filtros avançados aplicados.': 'Advanced filters applied.', 'Selecione ao menos um registro.': 'Select at least one record.',
  'Rascunho da revisão salvo.': 'Review draft saved.', 'Informe a categoria e a justificativa antes de concluir.': 'Enter the category and justification before completing the review.',
  'Evidência adicionada à revisão.': 'Evidence added to the review.', 'Contingência concluída e auditada.': 'Contingency completed and audited.',
  'Alerta arquivado.': 'Alert archived.', 'Relatório reenviado com sucesso.': 'Report resent successfully.', 'Envio simulado com sucesso.': 'Simulated delivery completed successfully.',
  'A contingência ainda não está disponível.': 'Contingency is not available yet.', 'Reprocessamento iniciado.': 'Reprocessing started.',
  'O reprocessamento falhou. A contingência foi liberada.': 'Reprocessing failed. Contingency was released.', 'Execução reprocessada com sucesso.': 'Run reprocessed successfully.',
  'Alterações salvas durante esta sessão.': 'Changes saved for this session.', 'Preview atualizado.': 'Preview updated.',
  'Processou dados recebidos do GERP': 'Processed data received from GERP', 'Gerou alerta por variação de IF Cost': 'Generated an alert due to IF Cost variation',
  'Abriu registros relacionados pelo alerta': 'Opened records related to the alert', 'Justificou registro de scrap': 'Justified scrap record',
  'Registrou relatório com scraps revisados': 'Registered report with reviewed scraps', 'Persistiu lote': 'Persisted batch',
  'Validou transação': 'Validated transaction', 'Atualizou alerta': 'Updated alert', 'Consultou relatório': 'Viewed report',
  'Aplicou taxa de câmbio': 'Applied exchange rate', 'Recebido': 'Received', 'Validando': 'Validating', 'Inexistente': 'Nonexistent', 'Rascunho': 'Draft',
  'Analista': 'Analyst', 'Qualidade': 'Quality', 'Gestor': 'Manager', 'Consulta': 'Viewer',
  'Sujeito à homologação': 'Subject to validation', 'Contingência pós-falha': 'Post-failure contingency',
  'Liberada apenas por uma execução cujo reprocessamento também falhou.': 'Released only for a run whose reprocessing also failed.',
  'Validação obrigatória': 'Required validation', 'Valida o arquivo antes da recuperação.': 'Validates the file before recovery.',
  'Preferências aplicadas a novos relatórios.': 'Preferences applied to new reports.', 'Frequência padrão': 'Default frequency', 'Sem comparação': 'No comparison',
  'Última atualização:': 'Last update:', 'Banco': 'Database', 'Cotação': 'Exchange rate', 'Relatórios': 'Reports',
  'Claro': 'Light', 'Escuro': 'Dark', 'Sistema': 'System', 'Escolha a aparência da interface.': 'Choose the interface appearance.',
  'Idioma exibido na interface do sistema.': 'Language displayed in the system interface.',
  'O que é IF Cost?': 'What is IF Cost?',
  'Aumento de telas riscadas associado a objeto metálico encontrado na esteira': 'Increase in scratched panels associated with a metal object found on the conveyor',
  'Um prego solto caiu na esteira e entrou em contato com a tela durante o transporte.': 'A loose nail fell onto the conveyor and contacted the panel during transport.',
  'O parafuso foi aplicado com torque acima do especificado e trincou a moldura.': 'The screw was tightened above the specified torque and cracked the frame.',
  'A placa apresentou falha após manuseio sem proteção eletrostática adequada.': 'The board failed after handling without proper electrostatic protection.',
  'A tela escorregou do dispositivo de movimentação durante o abastecimento.': 'The panel slipped from the handling device during line feeding.',
  'A moldura entrou desalinhada no dispositivo e foi deformada durante o encaixe.': 'The frame entered the fixture misaligned and was deformed during fitting.',
  'O cabo flat foi inserido inclinado e danificou os contatos do conector da placa.': 'The flat cable was inserted at an angle and damaged the board connector contacts.',
  'Falha no controle de objetos estranhos e na inspeção da esteira antes do início do turno.': 'Failure in foreign-object control and conveyor inspection before the shift.',
  'Parafusadeira operando com parâmetro de torque incorreto.': 'Screwdriver operating with an incorrect torque setting.',
  'Pulseira ESD desconectada durante o manuseio da placa.': 'ESD wrist strap disconnected while handling the board.',
  'Posicionamento incompleto da tela no suporte de transporte.': 'Panel not fully positioned in the transport support.',
  'Guia lateral do dispositivo estava com folga acima do limite.': 'The fixture side guide had clearance above the limit.',
  'Ausência de guia para garantir o ângulo correto de inserção.': 'No guide was available to ensure the correct insertion angle.',
  'Parar a esteira, remover o objeto e segregar as telas que passaram pelo trecho.': 'Stop the conveyor, remove the object and segregate panels that passed through the section.',
  'Implantar inspeção magnética e checklist de liberação da esteira.': 'Implement magnetic inspection and a conveyor release checklist.',
  'É o custo das perdas internas de produção. Cada registro considera o valor local do scrap convertido para USD pela taxa de câmbio aplicável. O ranking soma esse custo por componente e ordena do maior para o menor.': 'It is the cost of internal production losses. Each record uses the local scrap value converted to USD at the applicable exchange rate. The ranking totals this cost by component from highest to lowest.',
  'Como o IF Cost é calculado': 'How IF Cost is calculated', 'Previous Year': 'Previous Year'
});

Object.assign(i18nMessages.ko, {
  'Meta': '목표', 'Meta anual: -15%': '연간 목표: -15%', 'US$ 3.805 acima do target': '목표보다 US$ 3,805 초과',
  'Tela LCD': 'LCD 패널', 'Moldura frontal': '전면 프레임', 'Placa principal PCB': '메인 PCB',
  'Áudio': '오디오', 'Acumulado 2026 × PY': '2026년 누적 × PY', 'Mesmo período PY': 'PY 동일 기간',
  'Agosto/2026': '2026년 8월', 'Ago/2026': '2026년 8월', '03–09 Ago': '8월 3–9일',
  '1. Tela LCD · 2. Placa principal PCB · 3. Moldura frontal': '1. LCD 패널 · 2. 메인 PCB · 3. 전면 프레임',
  'Data/Hora': '날짜/시간', 'Impacto': '영향',
  'Risco profundo no painel': '패널 깊은 긁힘', 'Trinca no ponto de fixação': '체결부 균열', 'Falha no teste funcional': '기능 검사 실패',
  'Painel trincado por impacto': '충격으로 인한 패널 균열', 'Deformação e desalinhamento': '변형 및 정렬 불량', 'Conector danificado': '커넥터 손상',
  'Esteira de montagem final': '최종 조립 컨베이어', 'Posto de parafusamento': '나사 체결 공정', 'Montagem eletrônica': '전자 조립',
  'Abastecimento da linha': '라인 자재 공급', 'Prensa de encaixe': '압입 공정', 'Conexão do cabo flat': '플랫 케이블 연결',
  'Pendente': '대기', 'Concluído': '완료', 'Parcial': '부분 완료', 'Falha': '실패', 'Validado': '검증 완료', 'Rejeitado': '거부',
  'Novo': '신규', 'Lido': '읽음', 'Arquivado': '보관됨', 'Crítico': '긴급', 'Alto': '높음', 'Médio': '중간', 'Ativo': '활성', 'Inativo': '비활성',
  'Configurado': '설정됨', 'Operacional': '정상 운영', 'Pausado': '일시 중지', 'Informativo': '정보', 'Processando': '처리 중', 'Publicado': '게시됨',
  'E-mail e plataforma': '이메일 및 플랫폼', 'Somente plataforma': '플랫폼만', 'Plataforma': '플랫폼', 'Imediato': '즉시',
  'Notificações ainda não abertas': '아직 열지 않은 알림', 'Nenhum registro encontrado.': '기록이 없습니다.', 'Nenhum Part Number no contexto atual.': '현재 조건에 해당하는 부품 번호가 없습니다.',
  'Nenhum registro para os filtros selecionados.': '선택한 필터에 해당하는 기록이 없습니다.', 'Nenhuma evidência adicionada.': '추가된 증빙이 없습니다.',
  'A justificativa pode ser revisada item a item.': '각 항목별로 사유를 검토할 수 있습니다.',
  'Explique por que o item foi registrado como scrap. Os campos serão auditados.': '해당 항목이 스크랩으로 등록된 이유를 입력하세요. 모든 필드는 감사 대상입니다.',
  'Ative somente quando a justificativa simples não for suficiente para explicar o scrap.': '단순 사유만으로 스크랩을 설명하기 어려운 경우에만 활성화하세요.',
  'Fotos, documentos ou comentários vinculados ao registro.': '기록에 연결된 사진, 문서 또는 의견입니다.',
  'Descreva o motivo deste registro de scrap...': '이 스크랩 기록의 사유를 입력하세요...', 'Selecione...': '선택...',
  'Registre a causa validada...': '확인된 원인을 입력하세요...', 'Ação imediata': '즉시 조치', 'Prevenção de recorrência': '재발 방지',
  'Categoria da justificativa': '사유 분류', 'Máquina': '설비', 'Mão de obra': '작업자', 'Processo': '공정', 'Engenharia': '엔지니어링', 'Fornecedor': '공급업체', 'Outro': '기타',
  'Aumento de telas riscadas': '패널 긁힘 증가', 'Reincidência de objeto estranho': '이물 재발', 'Falhas no teste funcional': '기능 검사 실패',
  'Desvio de torque': '토크 편차', 'Painéis trincados': '패널 균열', 'Alto volume de scrap': '스크랩 수량 과다',
  'Objeto estranho na esteira': '컨베이어 이물', 'Defeito de montagem': '조립 불량', 'Últimos 30 dias': '최근 30일',
  'Resumo semanal': '주간 요약', 'Alertas críticos': '긴급 알림', 'Falhas de ingestão': '데이터 수집 실패', 'Qualidade': '품질', 'Gestores': '관리자',
  'Conteúdo consolidado': '통합 내용', 'Indicadores e comparativo': '지표 및 비교', 'Scraps revisados e suas justificativas': '검토된 스크랩과 사유',
  'Observação do responsável': '담당자 메모', 'Comentário opcional para contextualizar o período...': '기간 설명을 위한 선택 메모...',
  'Somente scraps revisados podem compor o relatório.': '검토된 스크랩만 보고서에 포함할 수 있습니다.',
  'Relatório de Material Scrap': '자재 스크랩 보고서', 'IF COST REVISADO': '검토된 IF COST', 'Justificativas predominantes': '주요 사유',
  'Revisões rastreáveis': '추적 가능한 검토', 'Nenhum registro justificado no período.': '해당 기간에 사유 등록된 기록이 없습니다.',
  'ID rastreável': '추적 ID', 'Gerado em': '생성 시간', 'Gerado por': '생성자', 'Scraps revisados': '검토된 스크랩',
  'Destinatário': '수신자', 'Solicitado em': '요청 시간', 'Tentativas': '시도 횟수', 'Reenviar': '재전송', 'Simular envio': '발송 시뮬레이션',
  'Processo': '프로세스', 'Disparadas pelo agendamento': '예약 실행', 'Reprocessamento disponível': '재처리 가능',
  'Falhas por categoria — últimos 30 dias': '유형별 실패 — 최근 30일',
  'A contingência só é liberada após uma tentativa de reprocessamento sem sucesso.': '재처리 시도가 실패한 후에만 비상 처리를 사용할 수 있습니다.',
  'Câmbio indisponível': '환율 없음', 'Arquivo inválido': '잘못된 파일', 'Duplicidade': '중복', 'Schema divergente': '스키마 불일치',
  'Buscar ID, usuário, entidade ou descrição...': 'ID, 사용자, 엔터티 또는 설명 검색...', 'Humano': '사용자', 'Automático': '자동',
  'Identificador': '식별자', 'Estado anterior': '이전 상태', 'Estado posterior': '변경 상태', 'Exportar eventos': '이벤트 내보내기',
  'Parâmetros usados nos comparativos de IF Cost.': 'IF Cost 비교에 사용하는 매개변수입니다.', 'Meta de redução': '감소 목표', 'Ano': '연도',
  'Componentes prioritários': '우선 관리 부품', 'Parâmetros fictícios sujeitos à homologação.': '검증이 필요한 예시 매개변수입니다.',
  'Contingência operacional': '운영 비상 처리', 'Ingestão automática': '자동 수집', 'Importação contingencial': '비상 가져오기',
  'Relatório': '보고서', 'Enviado': '전송됨',
  'Visão Executiva': '경영진 보기', 'Dados atualizados': '최신 데이터', 'Meta 2026': '2026년 목표', 'Redução anual': '연간 감소율',
  'Evolução do IF Cost — 2026 × 2025 × Meta': 'IF Cost 추이 — 2026 × 2025 × 목표', 'Top 3 componentes afetados': '영향이 큰 부품 TOP 3',
  'unidades de scrap': '스크랩 수량', 'transações': '거래', 'alertas críticos': '긴급 알림',
  'Pausar': '일시 정지', 'Continuar': '계속', 'Rotação automática': '자동 전환', 'Visão única': '단일 보기', 'Intervalo': '전환 간격', 'Tela cheia': '전체 화면', 'Sair': '나가기',
  'ONDE ESTAMOS PERDENDO DINHEIRO': '비용 손실이 발생하는 영역', 'Principais ofensores do período': '기간별 주요 손실 요인',
  'Onde estamos perdendo dinheiro': '비용 손실이 발생하는 영역',
  'Pareto de defeitos por IF Cost': 'IF Cost 기준 불량 파레토',
  'Defeito mais crítico': '가장 심각한 불량', 'Risco no painel': '패널 긁힘', 'do IF Cost acumulado': '누적 IF Cost 중',
  'PROBLEMAS QUE EXIGEM AÇÃO': '조치가 필요한 문제', 'Ocorrências prioritárias': '우선 처리 발생 건', 'Situação das revisões': '검토 현황',
  'Problemas que exigem ação': '조치가 필요한 문제',
  'Pendentes': '대기', 'Justificadas': '소명 완료', 'Categorias predominantes': '주요 분류', 'Outros': '기타',
  'COMPARATIVO E TENDÊNCIA': '비교 및 추세', 'Evolução acumulada no ano': '연간 누적 추이',
  'Comparativo e tendência': '비교 및 추세', 'Controles do Modo TV': 'TV 모드 제어', 'Painel anterior': '이전 패널',
  'Pausar rotação': '자동 전환 일시 정지', 'Continuar rotação': '자동 전환 계속', 'Próximo painel': '다음 패널', 'Sair do Modo TV': 'TV 모드 나가기',
  'Resultado acumulado': '누적 결과', 'Restante para meta': '목표까지 남은 값',
  'Ver execução': '실행 보기', 'Explorar Part Number': 'Part Number 탐색', 'Revisar registro': '레코드 검토',
  'Evento notificado': '통지된 이벤트', 'Alerta': '알림', 'Impacto estimado': '예상 영향', 'Área': '영역',
  'Registros relacionados': '관련 레코드', 'A justificativa e a revisão são feitas na Base de Scrap.': '소명과 검토는 스크랩 데이터베이스에서 진행합니다.',
  'Histórico da notificação': '알림 이력', 'Condição detectada': '감지 조건', 'Notificação enviada': '알림 전송',
  'Estado atual': '현재 상태', 'Arquivar alerta': '알림 보관', 'Ver registros de scrap': '스크랩 레코드 보기',
  'Agendada': '예약됨', 'Timeline automática': '자동 타임라인', 'Request automático iniciado': '자동 요청 시작',
  'Arquivo localizado no GERP': 'GERP에서 파일 확인', 'Arquivo recebido': '파일 수신', 'Validação estrutural': '구조 검증',
  'Normalização': '정규화', 'Conversão': '변환', 'Taxa de câmbio não localizada': '환율을 찾을 수 없음',
  'Persistência': '저장', 'Processamento concluído': '처리 완료', 'Exceções': '예외',
  'Registro': '레코드', 'Motivo': '사유', 'Etapa': '단계', 'Taxa não localizada': '환율을 찾을 수 없음',
  'Registro já processado': '이미 처리된 레코드', 'Ignorado': '무시됨', 'Ver registros processados': '처리된 레코드 보기', 'Reprocessar': '재처리',
  'Integridade': '무결성', 'Eventos de auditoria são imutáveis e não podem ser excluídos pelo protótipo.': '감사 이벤트는 변경할 수 없으며 프로토타입에서 삭제할 수 없습니다.',
  'Fechar': '닫기', 'Tudo certo': '완료', 'Ação não concluída': '작업을 완료하지 못함',
  'Central de suporte simulada. Nenhum chamado real foi enviado.': '지원 센터 시뮬레이션입니다. 실제 문의는 전송되지 않았습니다.',
  'O perfil do protótipo está em modo de demonstração.': '프로토타입 프로필은 데모 모드입니다.',
  'Você tem novos alertas. Abra a notificação para ver os registros relacionados.': '새 알림이 있습니다. 관련 레코드를 보려면 알림을 여세요.',
  'Arquivo fictício preparado para demonstração.': '데모용 예시 파일이 준비되었습니다.', 'Dados atualizados.': '데이터가 업데이트되었습니다.',
  'Filtros limpos.': '필터가 초기화되었습니다.', 'Filtros avançados aplicados.': '고급 필터가 적용되었습니다.', 'Selecione ao menos um registro.': '레코드를 하나 이상 선택하세요.',
  'Rascunho da revisão salvo.': '검토 초안이 저장되었습니다.', 'Informe a categoria e a justificativa antes de concluir.': '검토를 완료하기 전에 분류와 소명 내용을 입력하세요.',
  'Evidência adicionada à revisão.': '검토에 증빙이 추가되었습니다.', 'Contingência concluída e auditada.': '비상 처리가 완료되고 감사 기록에 남았습니다.',
  'Alerta arquivado.': '알림이 보관되었습니다.', 'Relatório reenviado com sucesso.': '보고서를 다시 전송했습니다.', 'Envio simulado com sucesso.': '모의 전송이 완료되었습니다.',
  'A contingência ainda não está disponível.': '비상 처리를 아직 사용할 수 없습니다.', 'Reprocessamento iniciado.': '재처리가 시작되었습니다.',
  'O reprocessamento falhou. A contingência foi liberada.': '재처리에 실패하여 비상 처리가 활성화되었습니다.', 'Execução reprocessada com sucesso.': '실행을 성공적으로 재처리했습니다.',
  'Alterações salvas durante esta sessão.': '이 세션의 변경 사항이 저장되었습니다.', 'Preview atualizado.': '미리보기가 업데이트되었습니다.',
  'Processou dados recebidos do GERP': 'GERP 수신 데이터를 처리함', 'Gerou alerta por variação de IF Cost': 'IF Cost 변동으로 알림을 생성함',
  'Abriu registros relacionados pelo alerta': '알림 관련 레코드를 열람함', 'Justificou registro de scrap': '스크랩 레코드를 소명함',
  'Registrou relatório com scraps revisados': '검토된 스크랩 보고서를 등록함', 'Persistiu lote': '배치를 저장함',
  'Validou transação': '거래를 검증함', 'Atualizou alerta': '알림을 업데이트함', 'Consultou relatório': '보고서를 조회함',
  'Aplicou taxa de câmbio': '환율을 적용함', 'Recebido': '수신됨', 'Validando': '검증 중', 'Inexistente': '없음', 'Rascunho': '초안',
  'Analista': '분석가', 'Qualidade': '품질', 'Gestor': '관리자', 'Consulta': '조회 사용자',
  'Sujeito à homologação': '검증 필요', 'Contingência pós-falha': '실패 후 비상 처리',
  'Liberada apenas por uma execução cujo reprocessamento também falhou.': '재처리도 실패한 실행에만 허용됩니다.',
  'Validação obrigatória': '필수 검증', 'Valida o arquivo antes da recuperação.': '복구 전에 파일을 검증합니다.',
  'Preferências aplicadas a novos relatórios.': '새 보고서에 적용되는 기본 설정입니다.', 'Frequência padrão': '기본 주기', 'Sem comparação': '비교 없음',
  'Última atualização:': '마지막 업데이트:', 'Banco': '데이터베이스', 'Cotação': '환율',
  'O que é IF Cost?': 'IF Cost란?',
  'Aumento de telas riscadas associado a objeto metálico encontrado na esteira': '컨베이어에서 발견된 금속 이물과 관련된 패널 긁힘 증가',
  'Um prego solto caiu na esteira e entrou em contato com a tela durante o transporte.': '느슨한 못이 컨베이어에 떨어져 운반 중 패널과 접촉했습니다.',
  'O parafuso foi aplicado com torque acima do especificado e trincou a moldura.': '규정 이상의 토크로 나사를 체결하여 프레임에 균열이 발생했습니다.',
  'A placa apresentou falha após manuseio sem proteção eletrostática adequada.': '적절한 정전기 보호 없이 취급한 후 보드에 고장이 발생했습니다.',
  'A tela escorregou do dispositivo de movimentação durante o abastecimento.': '라인 공급 중 패널이 운반 장치에서 미끄러졌습니다.',
  'A moldura entrou desalinhada no dispositivo e foi deformada durante o encaixe.': '프레임이 지그에 잘못 정렬되어 결합 중 변형되었습니다.',
  'O cabo flat foi inserido inclinado e danificou os contatos do conector da placa.': '플랫 케이블을 기울여 삽입하여 보드 커넥터 접점이 손상되었습니다.',
  'Falha no controle de objetos estranhos e na inspeção da esteira antes do início do turno.': '교대 시작 전 이물 관리 및 컨베이어 점검이 누락되었습니다.',
  'Parafusadeira operando com parâmetro de torque incorreto.': '전동 드라이버의 토크 설정이 잘못되었습니다.',
  'Pulseira ESD desconectada durante o manuseio da placa.': '보드 취급 중 ESD 손목 밴드가 분리되었습니다.',
  'Posicionamento incompleto da tela no suporte de transporte.': '패널이 운반 지지대에 완전히 안착되지 않았습니다.',
  'Guia lateral do dispositivo estava com folga acima do limite.': '지그 측면 가이드의 유격이 기준을 초과했습니다.',
  'Ausência de guia para garantir o ângulo correto de inserção.': '올바른 삽입 각도를 보장하는 가이드가 없었습니다.',
  'Parar a esteira, remover o objeto e segregar as telas que passaram pelo trecho.': '컨베이어를 정지하고 이물을 제거한 뒤 해당 구간을 통과한 패널을 격리합니다.',
  'Implantar inspeção magnética e checklist de liberação da esteira.': '자기 검사와 컨베이어 가동 승인 체크리스트를 도입합니다.',
  'É o custo das perdas internas de produção. Cada registro considera o valor local do scrap convertido para USD pela taxa de câmbio aplicável. O ranking soma esse custo por componente e ordena do maior para o menor.': '생산 내부 손실 비용입니다. 각 기록은 스크랩의 현지 금액을 적용 환율로 USD로 환산합니다. 순위는 부품별 비용 합계를 큰 순서대로 표시합니다.',
  'Como o IF Cost é calculado': 'IF Cost 계산 방식'
});

Object.assign(i18nMessages.en, {
  'Item / Componente': 'Item / Component', 'Tipo de movimentação': 'Movement type', 'Pareto de Part Numbers': 'Part Number Pareto',
  'Linha do scrap': 'Scrap line', 'IF Cost por linha de scrap': 'IF Cost by scrap line', 'Part Number / Descrição': 'Part Number / Description', 'Meta fixa': 'Fixed target', 'Meta do período': 'Period target',
  'Mesmo período 2025': 'Same period in 2025', 'Redução vs 2025': 'Reduction vs 2025', 'Entenda esta métrica': 'Understand this metric', 'Como avaliar esta métrica?': 'How to read this metric?',
  'Impacto no período': 'Period impact',
  'Compara o IF Cost atual com o mesmo período de 2025. Quanto maior a redução do custo, melhor. A meta é reduzir 15%; o gap mostra quanto ainda falta em pontos percentuais.': 'Compares the current IF Cost with the same period in 2025. A larger cost reduction is better. The target is a 15% reduction; the gap shows the remaining percentage points.',
  'Comparação com o ano anterior': 'Previous-year comparison',
  'PY significa Previous Year (ano anterior). Este valor representa o IF Cost do mesmo intervalo de datas de 2025 e serve como referência para calcular a redução de 2026.': 'PY means Previous Year. This value is the IF Cost for the same date range in 2025 and is the reference used to calculate the 2026 reduction.',
  '2025 — Mesmo período': '2025 — Same period',
  'Buscar Part Number, descrição ou ID...': 'Search Part Number, description or ID...', 'Status do registro': 'Record status',
  'Organização': 'Organization', 'Grupo de subinventário': 'Subinventory group', 'Subinventário': 'Subinventory',
  'Mercado do armazém': 'Warehouse market', 'Departamento de recebimento': 'Receipt department', 'Descrição do item': 'Item description',
  'Alertas por tipo': 'Alerts by type', 'Registros relacionados': 'Related records', 'Part Number mais crítico': 'Top-impact Part Number',
  'Maior impacto acumulado': 'Highest cumulative impact', 'Revisão de scrap': 'Scrap review', 'Indicadores e relatórios': 'Indicators and reports',
  'Consulta / Kiosk': 'Viewer / Kiosk', 'Visualização': 'View only', 'Administrador': 'Administrator',
  'Configuração do protótipo': 'Prototype settings', 'Usuário de demonstração': 'Demo user', 'Analista de Qualidade': 'Quality Analyst',
  'Participação equivalente ao filtro atual': 'Equivalent share for the current filter'
});

Object.assign(i18nMessages.ko, {
  'Item / Componente': '품목 / 부품', 'Tipo de movimentação': '이동 유형', 'Pareto de Part Numbers': 'Part Number 파레토',
  'Linha do scrap': '스크랩 라인', 'IF Cost por linha de scrap': '스크랩 라인별 IF Cost', 'Part Number / Descrição': 'Part Number / 설명', 'Meta fixa': '고정 목표', 'Meta do período': '기간 목표',
  'Mesmo período 2025': '2025년 동일 기간', 'Redução vs 2025': '2025년 대비 감소율', 'Entenda esta métrica': '이 지표 이해하기', 'Como avaliar esta métrica?': '이 지표를 해석하는 방법',
  'Impacto no período': '기간 영향',
  'Compara o IF Cost atual com o mesmo período de 2025. Quanto maior a redução do custo, melhor. A meta é reduzir 15%; o gap mostra quanto ainda falta em pontos percentuais.': '현재 IF Cost를 2025년 같은 기간과 비교합니다. 비용 감소 폭이 클수록 좋습니다. 목표는 15% 감소이며, 갭은 아직 필요한 퍼센트포인트를 나타냅니다.',
  'Comparação com o ano anterior': '전년 비교',
  'PY significa Previous Year (ano anterior). Este valor representa o IF Cost do mesmo intervalo de datas de 2025 e serve como referência para calcular a redução de 2026.': 'PY는 Previous Year(전년)를 의미합니다. 이 값은 2025년 동일 기간의 IF Cost이며 2026년 감소율 계산 기준으로 사용됩니다.',
  '2025 — Mesmo período': '2025년 — 동일 기간',
  'Buscar Part Number, descrição ou ID...': 'Part Number, 설명 또는 ID 검색...', 'Status do registro': '레코드 상태',
  'Organização': '조직', 'Grupo de subinventário': '하위 재고 그룹', 'Subinventário': '하위 재고',
  'Mercado do armazém': '창고 시장', 'Departamento de recebimento': '입고 부서', 'Descrição do item': '품목 설명',
  'Alertas por tipo': '유형별 알림', 'Registros relacionados': '관련 레코드', 'Part Number mais crítico': '최대 영향 Part Number',
  'Maior impacto acumulado': '최대 누적 영향', 'Revisão de scrap': '스크랩 검토', 'Indicadores e relatórios': '지표 및 보고서',
  'Consulta / Kiosk': '조회 / 키오스크', 'Visualização': '조회 전용', 'Administrador': '관리자',
  'Configuração do protótipo': '프로토타입 설정', 'Usuário de demonstração': '데모 사용자', 'Analista de Qualidade': '품질 분석가',
  'Participação equivalente ao filtro atual': '현재 필터와 동일한 비중'
});

const i18nTextSources = new WeakMap();
const i18nAttributeSources = new WeakMap();

function translateDynamicText(text, locale) {
  if (locale === 'pt-BR') return text;
  const rules = locale === 'en' ? [
    [/^([\d.,]+)% do IF Cost$/, '$1% of IF Cost'],
    [/^Meta do período: (.+)$/, 'Period target: $1'], [/^US\$\s*([\d.,]+) (acima|abaixo) da meta do período$/, (_, amount, position) => `US$ ${amount} ${position === 'acima' ? 'above' : 'below'} the period target`],
    [/^(\d+) transações$/, '$1 transactions'], [/^(\d+) registros$/, '$1 records'], [/^(\d+) alertas$/, '$1 alerts'], [/^(\d+) unidades$/, '$1 units'], [/^(\d+) ocorrências$/, '$1 occurrences'],
    [/^(\d+) un\.$/, '$1 units'], [/^(\d+) un\. · (\d+) registros$/, '$1 units · $2 records'], [/^(\d+) registros · (\d+) un\.$/, '$1 records · $2 units'],
    [/^(\d+) registros · página (\d+) de (\d+)$/, '$1 records · page $2 of $3'], [/^(\d+) incluídos$/, '$1 included'], [/^(\d+) scraps incluídos$/, '$1 scrap records included'],
    [/^Evidências \((\d+)\)$/, 'Evidence ($1)'], [/^(\d+) registro selecionado$/, '$1 record selected'], [/^(\d+) registros selecionados$/, '$1 records selected'],
    [/^Concluir (\d+) revisão$/, 'Complete $1 review'], [/^Concluir (\d+) revisões$/, 'Complete $1 reviews'],
    [/^Atualizado às (.+)$/, 'Updated at $1'], [/^Última atualização: (.+)$/, 'Last update: $1'], [/^Próxima execução: (.+)$/, 'Next run: $1'],
    [/^(\d+) Ago (\d{4}) · Atualizado às (.+)$/, 'Aug $1, $2 · Updated at $3'], [/^Atualizado (.+) · Próxima atualização (.+)$/, 'Updated $1 · Next update $2'],
    [/^Etapa (\d+) registrada$/, 'Step $1 logged'], [/^(\d+) registros de scrap originaram esta notificação\.$/, '$1 scrap records triggered this notification.'],
    [/^Status: (.+)$/, (_, status) => `Status: ${i18nMessages.en[status] || status}`],
    [/^Exploração aprofundada em (.+)\.$/, 'Detailed exploration of $1.'], [/^(\d+) alertas marcados como lidos\.$/, '$1 alerts marked as read.'],
    [/^(\d+) registros? justificados? e disponíveis? para relatório\.$/, '$1 justified record(s) available for the report.'],
    [/^Relatório (.+) registrado com (\d+) scrap\(s\) revisado\(s\)\.$/, 'Report $1 registered with $2 reviewed scrap record(s).'],
    [/^Detalhes da versão (.+) carregados\.$/, 'Version $1 details loaded.'],
    [/^(.+) atualizado para (.+)\.$/, (_, label, value) => `${i18nMessages.en[label] || label} updated to ${i18nMessages.en[value] || value}.`],
    [/^Semana (W\d+) · (.+)$/, 'Week $1 · $2'],
    [/^US\$ ([\d.,]+) abaixo$/, 'US$ $1 below'], [/^US\$ ([\d.,]+) acima$/, 'US$ $1 above'], [/^US\$ ([\d.,]+) acima do target$/, 'US$ $1 above target'],
    [/^(.+) ([↑↓])$/, (_, label, arrow) => `${i18nMessages.en[label] || label} ${arrow}`],
    [/^(.+) detectado acima do limite configurado$/, (_, eventName) => `${i18nMessages.en[eventName] || eventName} detected above the configured threshold`],
    [/^(.+): ocorrência acima do limite configurado no posto (.+)$/, (_, defect, station) => `${i18nMessages.en[defect] || defect}: occurrence above the configured threshold at ${i18nMessages.en[station] || station}`]
  ] : [
    [/^([\d.,]+)% do IF Cost$/, 'IF Cost의 $1%'],
    [/^Meta do período: (.+)$/, '기간 목표: $1'], [/^US\$\s*([\d.,]+) (acima|abaixo) da meta do período$/, (_, amount, position) => `기간 목표보다 US$ ${amount} ${position === 'acima' ? '초과' : '미만'}`],
    [/^(\d+) transações$/, '$1건의 거래'], [/^(\d+) registros$/, '$1건의 기록'], [/^(\d+) alertas$/, '$1개의 알림'], [/^(\d+) unidades$/, '$1개'], [/^(\d+) ocorrências$/, '$1건'],
    [/^(\d+) un\.$/, '$1개'], [/^(\d+) un\. · (\d+) registros$/, '$1개 · $2건'], [/^(\d+) registros · (\d+) un\.$/, '$1건 · $2개'],
    [/^(\d+) registros · página (\d+) de (\d+)$/, '$1건 · $2 / $3 페이지'], [/^(\d+) incluídos$/, '$1건 포함'], [/^(\d+) scraps incluídos$/, '스크랩 $1건 포함'],
    [/^Evidências \((\d+)\)$/, '증빙 ($1)'], [/^(\d+) registro selecionado$/, '$1건 선택'], [/^(\d+) registros selecionados$/, '$1건 선택'],
    [/^Concluir (\d+) revisão$/, '검토 $1건 완료'], [/^Concluir (\d+) revisões$/, '검토 $1건 완료'],
    [/^Atualizado às (.+)$/, '$1 업데이트'], [/^Última atualização: (.+)$/, '마지막 업데이트: $1'], [/^Próxima execução: (.+)$/, '다음 실행: $1'],
    [/^(\d+) Ago (\d{4}) · Atualizado às (.+)$/, '$2년 8월 $1일 · $3 업데이트'], [/^Atualizado (.+) · Próxima atualização (.+)$/, '$1 업데이트 · 다음 업데이트 $2'],
    [/^Etapa (\d+) registrada$/, '$1단계 기록'], [/^(\d+) registros de scrap originaram esta notificação\.$/, '스크랩 레코드 $1건으로 이 알림이 생성되었습니다.'],
    [/^Status: (.+)$/, (_, status) => `상태: ${i18nMessages.ko[status] || status}`],
    [/^Exploração aprofundada em (.+)\.$/, '$1 상세 탐색을 열었습니다.'], [/^(\d+) alertas marcados como lidos\.$/, '알림 $1개를 읽음으로 표시했습니다.'],
    [/^(\d+) registros? justificados? e disponíveis? para relatório\.$/, '소명 완료 레코드 $1건을 보고서에 사용할 수 있습니다.'],
    [/^Relatório (.+) registrado com (\d+) scrap\(s\) revisado\(s\)\.$/, '보고서 $1에 검토된 스크랩 $2건을 등록했습니다.'],
    [/^Detalhes da versão (.+) carregados\.$/, '버전 $1 상세 정보를 불러왔습니다.'],
    [/^(.+) atualizado para (.+)\.$/, (_, label, value) => `${i18nMessages.ko[label] || label}을(를) ${i18nMessages.ko[value] || value}(으)로 변경했습니다.`],
    [/^Semana (W\d+) · (.+)$/, '$1주 · $2'],
    [/^US\$ ([\d.,]+) abaixo$/, 'US$ $1 절감'], [/^US\$ ([\d.,]+) acima$/, 'US$ $1 초과'], [/^US\$ ([\d.,]+) acima do target$/, '목표보다 US$ $1 초과'],
    [/^(.+) ([↑↓])$/, (_, label, arrow) => `${i18nMessages.ko[label] || label} ${arrow}`],
    [/^(.+) detectado acima do limite configurado$/, (_, eventName) => `${i18nMessages.ko[eventName] || eventName}: 설정 임계값 초과 감지`],
    [/^(.+): ocorrência acima do limite configurado no posto (.+)$/, (_, defect, station) => `${i18nMessages.ko[station] || station} 공정에서 ${i18nMessages.ko[defect] || defect} 발생 건이 설정 임계값을 초과했습니다`]
  ];
  return rules.reduce((value, [pattern, replacement]) => pattern.test(value) ? value.replace(pattern, replacement) : value, text);
}

function translateValue(value, locale = state.locale) {
  const trimmed = value.trim();
  if (!trimmed || locale === 'pt-BR') return value;
  const translated = i18nMessages[locale]?.[trimmed] || translateDynamicText(trimmed, locale);
  return value.replace(trimmed, translated);
}

function applyI18n(root = document) {
  document.documentElement.lang = state.locale;
  root.querySelectorAll?.('.report-analysis-list article small').forEach((element) => {
    const parts = element.textContent.split(' · ');
    if (parts.length >= 3) element.innerHTML = parts.map((part) => `<span>${part}</span>`).join(' · ');
  });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (node.parentElement?.closest('script, style, svg, .language-select')) return;
    if (!i18nTextSources.has(node)) i18nTextSources.set(node, node.nodeValue);
    node.nodeValue = translateValue(i18nTextSources.get(node), state.locale);
  });
  root.querySelectorAll?.('[placeholder], [aria-label], [title]').forEach((element) => {
    if (element.closest('.language-select')) return;
    if (!i18nAttributeSources.has(element)) {
      i18nAttributeSources.set(element, Object.fromEntries(['placeholder','aria-label','title'].filter((name) => element.hasAttribute(name)).map((name) => [name, element.getAttribute(name)])));
    }
    Object.entries(i18nAttributeSources.get(element)).forEach(([name, source]) => element.setAttribute(name, translateValue(source, state.locale)));
  });
  const reportPeriod = root.querySelector?.('#report-period');
  if (reportPeriod) reportPeriod.value = translateValue(reportPeriod.value, state.locale);
}

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
function field(label, id, options, value = '') {
  const optionLabels = { 'Acumulado 2026 vs 2025': 'Acumulado 2026 × PY', 'Mesmo período 2025': 'Mesmo período PY' };
  return `<div class="field"><label for="${id}">${label}</label><select class="control" id="${id}" data-filter="${id}">${options.map((o) => `<option value="${o}" ${o === value ? 'selected' : ''}>${optionLabels[o] || o}</option>`).join('')}</select></div>`;
}
function kpiCard(label, value, detail = '', tone = '', help = '') {
  const helper = help ? `<span class="metric-help kpi-help" tabindex="0" role="button" aria-label="Entenda esta métrica"><b aria-hidden="true">!</b><span class="metric-tooltip" role="tooltip"><strong>Como avaliar esta métrica?</strong>${help}</span></span>` : '';
  return `<article class="kpi-card ${tone} ${help ? 'has-help' : ''}">${helper}<span class="kpi-label">${label}</span><strong class="kpi-value">${value}</strong>${detail ? `<span class="kpi-detail">${detail}</span>` : ''}</article>`;
}
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
  return ({ productArea: 'Produto / área', component: 'Componente', modelCode: 'Modelo', sector: 'Setor', stationCode: 'Posto', partNumber: 'Part Number', scrapLine: 'Linha', transactionId: 'Transação', alertId: 'Alerta', executionId: 'Execução', source: 'Origem' })[key] || key;
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
function dashboardChart(config, height = 260) {
  const index = pendingCharts.push(config) - 1;
  return `<div class="chart echart" data-chart-index="${index}" style="height:${height}px" role="img" aria-label="${config.ariaLabel || 'Gráfico interativo do dashboard'}"></div>`;
}
function chartMetricValue(value, unit = 'usd', masked = false, compact = true) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Sem dado';
  if (masked && unit === 'usd') return 'Valor oculto';
  if (unit === 'percent') return `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%`;
  if (unit === 'usd') return formatCurrency(Number(value), compact);
  return `${formatNumber(Math.round(Number(value)))} un.`;
}
function chartAxisValue(value, unit = 'usd', masked = false) {
  if (masked && unit === 'usd') return '•••';
  if (unit === 'percent') return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}%`;
  if (unit === 'usd') return Math.abs(Number(value)) >= 1000000
    ? `${(Number(value) / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
    : `${Math.round(Number(value) / 1000)}k`;
  return formatNumber(Number(value));
}
function wireDashboardChartDrill(instance, data, element) {
  if (!data.drillKey || state.tvActive) return;
  element.classList.add('chart-drillable');
  instance.on('click', (params) => {
    if (!params.name) return;
    const filters = state.dashboardFilters;
    const next = {
      productArea: filters.product === 'Todos' ? null : filters.product,
      scrapLine: filters.scrapLine === 'Todas' ? null : filters.scrapLine,
      component: filters.component === 'Todos' ? null : filters.component,
      partNumber: filters.partNumber === 'Todos' ? null : filters.partNumber,
      modelCode: null, sector: null, stationCode: null, transactionId: null, alertId: null, executionId: null,
    };
    next[data.drillKey] = params.name;
    setExplorationContext(next, 'Dashboard');
    state.scrapView = 'list';
    navigateTo('scrap');
  });
}
function initCharts() {
  chartInstances.forEach((instance) => instance.dispose()); chartInstances = [];
  if (!window.echarts) return;
  const css = getComputedStyle(document.documentElement), main = css.getPropertyValue('--chart-main').trim(), secondary = css.getPropertyValue('--chart-secondary').trim(), muted = css.getPropertyValue('--app-text-muted').trim(), grid = css.getPropertyValue('--app-chart-grid').trim(), text = css.getPropertyValue('--app-text-secondary').trim();
  const surface = css.getPropertyValue('--app-surface-raised').trim(), border = css.getPropertyValue('--app-border').trim(), foreground = css.getPropertyValue('--app-text').trim();
  const blue = css.getPropertyValue('--chart-tertiary').trim() || '#16834b', success = css.getPropertyValue('--app-success').trim() || '#16834b';
  const targetColor = css.getPropertyValue('--chart-target').trim() || css.getPropertyValue('--chart-tertiary').trim() || success;
  $$(state.tvActive ? '#tv-mode .echart' : '#page-content .echart').forEach((element) => {
    const data = pendingCharts[Number(element.dataset.chartIndex)]; if (!data) return;
    const instance = echarts.init(element, null, { renderer: 'svg' });
    const commonTooltip = { trigger: 'axis', backgroundColor: surface, borderColor: border, textStyle: { color: foreground, fontFamily: 'Fustat Variable', fontSize: 12 } };

    if (data.kind === 'monthly') {
      const series = [{ name: data.actualLabel || 'Realizado', type: 'line', data: data.actual, connectNulls: false, symbol: 'circle', symbolSize: 7, lineStyle: { width: 3, color: main }, itemStyle: { color: main }, emphasis: { focus: 'series' } }];
      if (data.previous?.length) series.push({ name: data.previousLabel || 'Referência', type: 'line', data: data.previous, connectNulls: false, symbol: 'none', lineStyle: { width: 2, color: secondary }, itemStyle: { color: secondary } });
      if (data.target?.length) series.push({ name: 'Target', type: 'line', data: data.target, symbol: 'circle', symbolSize: 5, lineStyle: { width: 2, type: 'dashed', color: targetColor }, itemStyle: { color: targetColor } });
      instance.setOption({
        animationDuration: 400,
        grid: { left: 16, right: 18, top: 20, bottom: 28, containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: data.labels, axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: text, fontSize: 10 } },
        yAxis: { type: 'value', splitNumber: 4, splitLine: { lineStyle: { color: grid } }, axisLabel: { color: muted, fontSize: 9, formatter: (value) => chartAxisValue(value, data.unit, data.masked) } },
        tooltip: { ...commonTooltip, formatter(params) { return `<strong>${params[0]?.axisValue || ''}</strong><br>${params.map((item) => `${item.marker} ${item.seriesName}: ${chartMetricValue(item.value, data.unit, data.masked, false)}`).join('<br>')}`; } },
        series,
      });
      chartInstances.push(instance); return;
    }

    if (data.kind === 'columns') {
      const columnSeries=data.series?.length?data.series.map((series,index)=>({name:series.name,type:'bar',stack:data.stacked?'total':undefined,data:series.values,barMaxWidth:34,itemStyle:{color:[main,'#f59e0b',blue,success][index%4],borderRadius:data.stacked?0:[5,5,0,0]}})):[{ name: data.seriesName || 'Realizado', type: 'bar', data: data.values, barMaxWidth: 34, itemStyle: { color: main, borderRadius: [5, 5, 0, 0] } }];
      instance.setOption({
        animationDuration: 400,
        grid: { left: 14, right: 12, top: 18, bottom: 28, containLabel: true },
        legend: data.series?.length?{top:0,textStyle:{color:text,fontSize:10}}:undefined,
        xAxis: { type: 'category', data: data.labels, axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: text, fontSize: 10 } },
        yAxis: { type: 'value', splitNumber: 4, splitLine: { lineStyle: { color: grid } }, axisLabel: { color: muted, fontSize: 9, formatter: (value) => chartAxisValue(value, data.unit, data.masked) } },
        tooltip: { ...commonTooltip, formatter(params) { return `<strong>${params[0]?.axisValue || ''}</strong><br>${params.map((item)=>`${item.marker} ${item.seriesName}: ${chartMetricValue(item.value,data.unit,data.masked,false)}`).join('<br>')}`; } },
        series: columnSeries,
      });
      chartInstances.push(instance); return;
    }

    if (data.kind === 'horizontal') {
      instance.setOption({
        animationDuration: 400,
        grid: { left: 10, right: 18, top: 8, bottom: 8, containLabel: true },
        xAxis: { type: 'value', show: false },
        yAxis: { type: 'category', inverse: true, data: data.labels, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: text, fontSize: 10, width: 95, overflow: 'truncate' } },
        tooltip: { trigger: 'item', ...commonTooltip, formatter(item) { const detail = data.details?.[item.dataIndex] ? `<br><span style="color:${muted}">${data.details[item.dataIndex]}</span>` : ''; return `<strong>${item.name}</strong><br>${item.marker} ${chartMetricValue(item.value, data.unit, data.masked, false)}${detail}`; } },
        series: [{ type: 'bar', data: data.values, barMaxWidth: 18, label: { show: true, position: 'right', color: text, fontSize: 10, formatter: ({ value }) => data.masked && data.unit === 'usd' ? '••••' : chartMetricValue(value, data.unit, false, true) }, itemStyle: { color: main, borderRadius: [0, 5, 5, 0] } }],
      });
      wireDashboardChartDrill(instance, data, element); chartInstances.push(instance); return;
    }

    if (data.kind === 'scatter') {
      instance.setOption({
        animationDuration: 400,
        grid: { left: 18, right: 24, top: 22, bottom: 38, containLabel: true },
        xAxis: { type: 'value', name: data.xLabel || '', nameLocation: 'middle', nameGap: 28, splitLine: { lineStyle: { color: grid } }, axisLabel: { color: muted, fontSize: 9, formatter: (value) => chartAxisValue(value, data.xUnit, data.masked) } },
        yAxis: { type: 'value', name: data.yLabel || '', splitLine: { lineStyle: { color: grid } }, axisLabel: { color: muted, fontSize: 9, formatter: (value) => chartAxisValue(value, data.yUnit || 'percent') } },
        tooltip: { trigger: 'item', ...commonTooltip, formatter(item) { const point = item.data; return `<strong>${point.name}</strong><br>${data.xLabel}: ${chartMetricValue(point.value[0], data.xUnit, data.masked, false)}<br>${data.yLabel}: ${chartMetricValue(point.value[1], data.yUnit || 'percent', false, false)}${point.detail ? `<br><span style="color:${muted}">${point.detail}</span>` : ''}`; } },
        series: [{ type: 'scatter', symbolSize: (value) => Math.max(13, Math.min(28, 12 + Math.sqrt(Math.max(0, value[0])) / (data.xUnit === 'usd' ? 180 : 18))), data: data.points, label: { show: true, position: 'top', color: text, fontSize: 10, formatter: ({ data: point }) => point.name }, itemStyle: { color: main, opacity: .82 }, emphasis: { itemStyle: { opacity: 1, borderColor: surface, borderWidth: 2 } } }],
      });
      chartInstances.push(instance); return;
    }

    if (data.kind === 'donut') {
      instance.setOption({
        animationDuration: 400,
        tooltip: { trigger: 'item', backgroundColor: surface, borderColor: border, textStyle: { color: foreground }, formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, textStyle: { color: text, fontSize: 10 } },
        series: [{ type: 'pie', radius: ['52%','76%'], center: ['50%','43%'], avoidLabelOverlap: true, label: { color: text, fontSize: 10, formatter: '{b}\n{c}' }, itemStyle: { borderColor: surface, borderWidth: 3, borderRadius: 5 }, data: data.labels.map((label,index)=>({ name:label, value:data.values[index] })) }],
      });
      chartInstances.push(instance); return;
    }

    if (data.kind === 'pareto') {
      instance.setOption({
        animationDuration: 400,
        grid: { left: 16, right: 38, top: 22, bottom: 58, containLabel: true },
        xAxis: { type: 'category', data: data.labels, axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: text, fontSize: 9, interval: 0, rotate: 24, width: 90, overflow: 'truncate' } },
        yAxis: [{ type: 'value', splitNumber: 4, splitLine: { lineStyle: { color: grid } }, axisLabel: { color: muted, fontSize: 9, formatter: (value) => chartAxisValue(value, data.unit, data.masked) } }, { type: 'value', min: 0, max: 100, interval: 20, splitLine: { show: false }, axisLabel: { color: muted, fontSize: 9, formatter: '{value}%' } }],
        tooltip: { ...commonTooltip, formatter(params) { const bar = params.find((item) => item.seriesName === 'Impacto'); const curve = params.find((item) => item.seriesName === 'Acumulado'); return `<strong>${params[0]?.axisValue || ''}</strong><br>${bar?.marker || ''} Impacto: ${chartMetricValue(bar?.value, data.unit, data.masked, false)}<br>${curve?.marker || ''} Acumulado: ${Number(curve?.value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`; } },
        series: [{ name: 'Impacto', type: 'bar', data: data.values, barMaxWidth: 42, itemStyle: { color: main, borderRadius: [5, 5, 0, 0] } }, { name: 'Acumulado', type: 'line', yAxisIndex: 1, data: data.cumulative, symbolSize: 6, lineStyle: { width: 2.5, color: success }, itemStyle: { color: success }, markLine: { silent: true, symbol: 'none', label: { formatter: '80%', color: muted }, lineStyle: { color: muted, type: 'dashed' }, data: [{ yAxis: 80 }] } }],
      });
      wireDashboardChartDrill(instance, data, element); chartInstances.push(instance); return;
    }

    const count = Math.max(data.valuesA.length, data.valuesB.length), labels = Array.from({ length: count }, (_, i) => `${String(i + 1).padStart(2, '0')}/08`);
    const series = [{ name: '2026', type: 'line', data: data.valuesA, smooth: .2, symbol: 'circle', symbolSize: 5, lineStyle: { width: 3, color: main }, itemStyle: { color: main } }];
    if (data.valuesB.length) series.push({ name: '2025', type: 'line', data: data.valuesB, smooth: .2, symbol: 'none', lineStyle: { width: 3, color: secondary }, itemStyle: { color: secondary } });
    if (data.target) series.push({ name: 'Meta', type: 'line', data: Array.isArray(data.target) ? data.target : Array(count).fill(data.target), symbol: 'none', lineStyle: { width: 1.5, type: 'dashed', color: muted }, itemStyle: { color: muted } });
    instance.setOption({ animationDuration: 350, grid: { left: 12, right: 12, top: 15, bottom: 22, containLabel: true }, xAxis: { type: 'category', boundaryGap: false, data: labels, axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: text, fontFamily: 'Fustat Variable', fontSize: 10, interval: Math.max(0, Math.floor(count / 6) - 1) } }, yAxis: { type: 'value', splitNumber: 3, splitLine: { lineStyle: { color: grid } }, axisLabel: { show: false } }, tooltip: { trigger: 'axis', backgroundColor: css.getPropertyValue('--app-surface-raised').trim(), borderColor: css.getPropertyValue('--app-border').trim(), textStyle: { color: css.getPropertyValue('--app-text').trim(), fontFamily: 'Fustat Variable', fontSize: 12 }, formatter(params) { const current = params.find(p => p.seriesName === '2026'), previous = params.find(p => p.seriesName === '2025'); const difference = current && previous ? `<br>Diferença: ${(current.value - previous.value).toLocaleString('pt-BR')}` : ''; return `<strong>${params[0]?.axisValue || ''}</strong><br>${params.map(p => `${p.marker} ${p.seriesName}: ${Number(p.value).toLocaleString('pt-BR')}`).join('<br>')}${difference}`; } }, series });
    chartInstances.push(instance);
  });
}
function barList(items) {
  const max = Math.max(1,...items.map((i) => i.value));
  return `<div class="bar-list">${items.map((item, index) => `<div class="bar-row"><span>${item.label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4,item.value/max*100)}%;opacity:${1-index*.13}"></div></div><strong>${item.display || formatCurrency(item.value, true)}</strong></div>`).join('')}</div>`;
}
function renderShell() {
  $('#main-navigation').innerHTML = navigation.map((item) => `<li class="nav-menu-item"><a class="nav-button ${state.route === item.route ? 'active' : ''}" href="#${item.route}" ${state.route === item.route ? 'aria-current="page"' : ''}>${icon(item.icon)}<span class="nav-label sidebar-copy">${item.label}</span>${item.badge ? `<span class="nav-badge sidebar-copy">${item.badge}</span>` : ''}</a></li>`).join('');
  $('.utility-button').innerHTML = `${icon('mail')}<span class="sidebar-copy">Ajuda e suporte</span>`;
  $('#sidebar-toggle').innerHTML = icon('sidebar'); $('#mobile-menu').innerHTML = icon('sidebar');
  $('[data-action="notifications"]').innerHTML = `${icon('bell')}<span class="notification-dot"></span>`;
  $('.language-select-icon').innerHTML = icon('language');
  $('#global-language').value = state.locale;
  $('#tv-mode-trigger').innerHTML = icon('tv');
  $('#tv-mode-trigger').hidden = state.route !== 'dashboard';
  $('[data-action="toggle-theme"]').innerHTML = icon(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon');
  $('.profile-menu-trigger').innerHTML = icon('more');
  const current = navigation.find((n) => n.route === state.route) || navigation[0];
  $('#breadcrumb').innerHTML = `<span class="breadcrumb-item">${icon(current.icon)}<span class="breadcrumb-label">${current.label}</span></span>`;
}

const dashboardChartPresets = {
  Acumulado: { title: 'Evolução acumulada do IF Cost', current: [8,17,28,42,60,83,108,130,154,181,207,236], previous: [12,25,42,62,81,99,124,152,183,212,245,280], target: 181 },
  Diário: { title: 'Evolução diária do IF Cost', current: [8,9,11,14,18,23,25,22,24,27,26,29], previous: [12,13,17,20,19,18,25,28,31,29,33,35], target: 24 },
  Semanal: { title: 'Evolução semanal do IF Cost', current: [41,48,44,52,47,56], previous: [46,52,55,58,61,64], target: 50 },
  Mensal: { title: 'Evolução mensal do IF Cost', current: [168,174,161,184,176,169,181,184], previous: [188,201,194,211,205,198,216,212], target: 181 }
};

function accumulateValues(values) {
  let total = 0;
  return values.map((value) => (total += value));
}

function buildDashboardEvolution(rows, view) {
  const daily = Array(12).fill(0);
  rows.forEach((row) => {
    const day = Number(row.transactionDate.slice(0, 2));
    if (day >= 1 && day <= daily.length) daily[day - 1] += row.ifCost / 1000;
  });
  const currentTotal = daily.reduce((sum, value) => sum + value, 0);
  const fullTotal = model.transactions.reduce((sum, row) => sum + row.ifCost, 0) / 1000;
  const share = fullTotal ? currentTotal / fullTotal : 0;
  const previousTotal = 212.3 * share;
  const previousScale = currentTotal ? previousTotal / currentTotal : 0;
  const previousDaily = daily.map((value) => value * previousScale);
  const targetTotal = previousTotal * .85;
  if (view === 'Diário') return { current: daily, previous: previousDaily, target: Array(daily.length).fill(targetTotal / daily.length) };
  if (view === 'Semanal') {
    const groupPairs = (values) => Array.from({ length: 6 }, (_, index) => values[index * 2] + values[index * 2 + 1]);
    return { current: groupPairs(daily), previous: groupPairs(previousDaily), target: Array(6).fill(targetTotal / 6) };
  }
  if (view === 'Mensal') {
    const preset = dashboardChartPresets.Mensal;
    return { current: preset.current.map((value) => value * share), previous: preset.previous.map((value) => value * share), target: Array(preset.current.length).fill(preset.target * share) };
  }
  return { current: accumulateValues(daily), previous: accumulateValues(previousDaily), target: Array(daily.length).fill(targetTotal) };
}

const dashboardSpreadsheetSeries = {
  months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  targetUsd: [27091, 26596, 26100, 25605, 25410, 24920, 23813, 23324, 22728, 22136, 21538, 21125],
  actualUsd: [26408, 25645, 25885, 23191, 32128, 24687, 14000, 12316, null, null, null, null],
  previousUsd: [27874, 24988, 23632, 31277, 27796, 37045, 39147, 38500, null, null, null, null],
  actualQty: [170, 156, 149, 138, 182, 161, 145, 146, null, null, null, null],
  previousQty: [189, 172, 164, 153, 198, 176, 159, 162, null, null, null, null],
};

// Massa exclusivamente demonstrativa para validar a experiência da análise relativa.
// A futura integração deve substituir estes registros sem alterar as fórmulas ou a interface.
const relativeDenominatorMock = (() => {
  const monthlyProduction = { TV: 52000, Monitor: 38000, AV: 21000, BM: 18000, VS: 16000, SMT: 48000, 'FA/MFG': 32000, 'Injeção/IPI': 27000 };
  const materialUnitCost = { TV: 430, Monitor: 275, AV: 190, BM: 225, VS: 205, SMT: 82, 'FA/MFG': 145, 'Injeção/IPI': 118 };
  const lineShare = { A01: .18, A02: .16, A04: .14, A05: .29, C02: .23 };
  const seasonality = [.94, .91, .97, 1.02, 1.06, 1.03, .98, .56, 1.01, 1.04, .96, .82];
  return [2025, 2026].flatMap((year) => productAreas.flatMap((productArea, productIndex) => scrapLines.flatMap((scrapLine, lineIndex) => seasonality.map((monthFactor, monthIndex) => {
    const yearFactor = year === 2026 ? 1 : .965;
    const mixFactor = 1 + ((productIndex * 3 + lineIndex * 2 + monthIndex) % 7 - 3) * .012;
    const productionQty = Math.round(monthlyProduction[productArea] * lineShare[scrapLine] * monthFactor * yearFactor * mixFactor);
    const costFactor = year === 2026 ? 1 : .955;
    return {
      year, monthIndex, productArea, scrapLine, productionQty,
      materialAmountUsd: Math.round(productionQty * materialUnitCost[productArea] * costFactor),
      source: 'MOCK-DENOM-v1.0', status: 'Simulado',
    };
  }))));
})();

function dashboardPeriodContext(filters, metric) {
  const actual = metric === 'usd' ? dashboardSpreadsheetSeries.actualUsd : dashboardSpreadsheetSeries.actualQty;
  const previousYear = metric === 'usd' ? dashboardSpreadsheetSeries.previousUsd : dashboardSpreadsheetSeries.previousQty;
  const periodIndexes = {
    'Acumulado Jan–Ago': [0, 1, 2, 3, 4, 5, 6, 7],
    'Agosto (parcial)': [7],
    'Julho/2026': [6],
    'Junho/2026': [5],
  };
  const indexes = periodIndexes[filters.period] || periodIndexes['Agosto (parcial)'];
  const sumIndexes = (values, selected) => selected.reduce((sum, index) => sum + (values[index] || 0), 0);
  let reference = null, referenceLabel = 'Sem comparação';
  if (filters.compare === 'Mesmo período de 2025') {
    reference = sumIndexes(previousYear, indexes);
    referenceLabel = indexes.length > 1 ? 'Mesmo acumulado de 2025' : `Mesmo mês de 2025`;
  } else if (filters.compare === 'Mês anterior') {
    const referenceIndexes = indexes.length > 1 ? [6] : [Math.max(0, indexes[0] - 1)];
    reference = sumIndexes(actual, referenceIndexes);
    referenceLabel = indexes.length > 1 ? 'Julho/2026' : dashboardSpreadsheetSeries.months[referenceIndexes[0]];
  }
  return {
    indexes,
    actual: sumIndexes(actual, indexes),
    reference,
    referenceLabel,
    target: metric === 'usd' ? sumIndexes(dashboardSpreadsheetSeries.targetUsd, indexes) : null,
    isCurrentDetail: filters.period === 'Acumulado Jan–Ago',
  };
}

function dashboardAggregate(rows, key, metric, scale = 1) {
  return [...rows.reduce((map, row) => {
    const label = row[key] || 'Não informado';
    const current = map.get(label) || { label, value: 0, qty: 0, count: 0 };
    current.value += (metric === 'usd' ? row.ifCost : row.qty) * scale;
    current.qty += row.qty * scale; current.count += 1; map.set(label, current);
    return map;
  }, new Map()).values()].sort((a, b) => b.value - a.value);
}

function dashboardDisplay(value, metric, masked = false, compact = false) {
  if (metric === 'usd') return masked ? 'US$ •••••' : formatCurrency(value, compact);
  return `${formatNumber(Math.round(value))} un.`;
}

function dashboardActiveFilters(filters) {
  const entries = [
    ['product', 'Produto', filters.product, 'Todos'],
    ['scrapLine', 'Linha', filters.scrapLine, 'Todas'],
    ['component', 'Componente', filters.component, 'Todos'],
    ['partNumber', 'Part Number', filters.partNumber, 'Todos'],
  ].filter(([, , value, empty]) => value !== empty);
  if (!entries.length) return '';
  return `<div class="active-filter-list"><span>Filtros ativos</span>${entries.map(([key, label, value]) => `<button class="filter-chip" type="button" data-action="dashboard-remove-filter" data-key="${key}"><small>${label}</small>${value}<b aria-hidden="true">×</b></button>`).join('')}</div>`;
}

function dashboardRiskMap(rows, scale = 1) {
  const stations = [...rows.reduce((map, row) => {
    const key = `${row.scrapLine}-${row.stationCode}`;
    const current = map.get(key) || { line: row.scrapLine, station: row.stationCode, sector: row.sector, qty: 0, cost: 0 };
    current.qty += row.qty * scale; current.cost += row.ifCost * scale; map.set(key, current); return map;
  }, new Map()).values()].sort((a, b) => b.qty - a.qty);
  const max = Math.max(1, ...stations.map((item) => item.qty));
  const byLine = scrapLines.map((line) => ({ line, stations: stations.filter((item) => item.line === line).slice(0, 8) }));
  return `<div class="risk-map" role="img" aria-label="Mapa de risco por linha e posto baseado em QTY SCRAP">${byLine.map((group) => `<div class="risk-line"><strong>${group.line}</strong><div class="risk-track">${group.stations.length ? group.stations.map((item) => { const ratio = item.qty / max; const level = ratio >= .66 ? 'critical' : ratio >= .34 ? 'moderate' : 'low'; return `<button class="risk-station ${level}" type="button" data-action="dashboard-risk-explore" data-id="${item.line}" data-sector="${item.sector}" data-station="${item.station}" title="${item.sector} · ${item.station}: ${formatNumber(item.qty)} unidades"><b>${item.station}</b><small>${item.sector}</small><span>${formatNumber(item.qty)} un.</span></button>`; }).join('') : '<span class="risk-empty">Sem ocorrências no recorte</span>'}</div></div>`).join('')}</div>`;
}

function renderRelativeDashboard({ filters, metric, masked, dashboardRows, dimensionFactor }) {
  const periodContext = dashboardPeriodContext(filters, metric);
  const denominatorKey = metric === 'usd' ? 'materialAmountUsd' : 'productionQty';
  const formula = metric === 'usd'
    ? 'Σ IF Cost (US$) ÷ Σ Material Amount (US$) × 100'
    : 'Σ QTY SCRAP ÷ Σ Quantidade produzida × 100';
  const rateLabel = metric === 'usd' ? 'Taxa relativa de IF Cost' : 'Taxa relativa de scrap';
  const denominatorLabel = metric === 'usd' ? 'Material Amount' : 'Quantidade produzida';
  const metricSeries = metric === 'usd' ? dashboardSpreadsheetSeries.actualUsd : dashboardSpreadsheetSeries.actualQty;
  const previousSeries = metric === 'usd' ? dashboardSpreadsheetSeries.previousUsd : dashboardSpreadsheetSeries.previousQty;
  const fullMetric = model.transactions.reduce((sum, row) => sum + (metric === 'usd' ? row.ifCost : row.qty), 0);
  const rate = (numerator, denominator) => denominator ? numerator / denominator * 100 : null;
  const rateText = (value) => value === null ? '—' : `${value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}%`;
  const denominatorText = (value) => metric === 'usd'
    ? (masked ? 'US$ •••••' : formatCurrency(value))
    : `${formatNumber(Math.round(value))} un.`;
  const scopedDenominators = (year, indexes, line = null) => relativeDenominatorMock.filter((row) =>
    row.year === year && indexes.includes(row.monthIndex) &&
    (filters.product === 'Todos' || row.productArea === filters.product) &&
    (line ? row.scrapLine === line : filters.scrapLine === 'Todas' || row.scrapLine === filters.scrapLine));
  const denominatorTotal = (year, indexes, line = null) => scopedDenominators(year, indexes, line).reduce((sum, row) => sum + row[denominatorKey], 0);

  const currentNumerator = periodContext.actual * dimensionFactor;
  const currentDenominator = denominatorTotal(2026, periodContext.indexes);
  const currentRate = rate(currentNumerator, currentDenominator);
  let referenceYear = null, referenceIndexes = [], referenceDenominator = null, referenceRate = null;
  if (filters.compare === 'Mesmo período de 2025') {
    referenceYear = 2025; referenceIndexes = periodContext.indexes;
  } else if (filters.compare === 'Mês anterior') {
    referenceYear = 2026;
    referenceIndexes = periodContext.indexes.length > 1 ? [6] : [Math.max(0, periodContext.indexes[0] - 1)];
  }
  if (referenceYear !== null && periodContext.reference !== null) {
    referenceDenominator = denominatorTotal(referenceYear, referenceIndexes);
    referenceRate = rate(periodContext.reference * dimensionFactor, referenceDenominator);
  }
  const variation = currentRate !== null && referenceRate ? (currentRate / referenceRate - 1) * 100 : null;

  const monthlyRates = metricSeries.map((value, monthIndex) => value === null ? null : rate(value * dimensionFactor, denominatorTotal(2026, [monthIndex])));
  const monthlyPreviousRates = filters.compare === 'Mesmo período de 2025'
    ? previousSeries.map((value, monthIndex) => value === null ? null : rate(value * dimensionFactor, denominatorTotal(2025, [monthIndex])))
    : [];
  const visibleLines = filters.scrapLine === 'Todas' ? scrapLines : [filters.scrapLine];
  const lineRates = visibleLines.map((line) => {
    const rows = dashboardRows.filter((row) => row.scrapLine === line);
    const lineMetric = rows.reduce((sum, row) => sum + (metric === 'usd' ? row.ifCost : row.qty), 0);
    const numerator = fullMetric ? periodContext.actual * lineMetric / fullMetric : 0;
    const denominator = denominatorTotal(2026, periodContext.indexes, line);
    return { label: line, numerator, denominator, value: rate(numerator, denominator) || 0, count: rows.length };
  }).sort((a, b) => b.value - a.value);
  const expectedCells = periodContext.indexes.length * (filters.product === 'Todos' ? productAreas.length : 1) * visibleLines.length;
  const availableCells = scopedDenominators(2026, periodContext.indexes).length;
  const coverage = expectedCells ? availableCells / expectedCells * 100 : 0;
  const worstLine = lineRates[0];
  const dimensionNote = filters.component !== 'Todos' || filters.partNumber !== 'Todos'
    ? 'Componente e Part Number reduzem o numerador; o denominador permanece na produção do produto e da linha selecionados.'
    : 'Numerador e denominador usam o mesmo recorte de período, produto e linha.';
  const relativeKpis = `${kpiCard(rateLabel, rateText(currentRate), 'Quanto menor, melhor', currentRate !== null && referenceRate !== null && currentRate <= referenceRate ? 'success' : '')}${kpiCard(metric === 'usd' ? 'IF Cost do recorte' : 'QTY SCRAP do recorte', dashboardDisplay(currentNumerator, metric, masked), filters.period)}${kpiCard(`${denominatorLabel} · mock`, denominatorText(currentDenominator), 'Fonte MOCK-DENOM-v1.0')}${kpiCard('Referência relativa', rateText(referenceRate), periodContext.referenceLabel)}${kpiCard('Variação vs referência', variation === null ? '—' : formatPercentage(variation), 'Negativo é favorável', variation === null ? '' : variation <= 0 ? 'success' : 'danger')}${kpiCard('Linha com maior taxa', worstLine?.label || '—', worstLine ? rateText(worstLine.value) : 'Sem dados')}`;
  const lineDetails = lineRates.map((item) => `${item.count} registros · denominador ${denominatorText(item.denominator)}`);
  const scatterPoints = lineRates.map((item) => ({ name: item.label, value: [item.denominator, item.value], detail: `${item.count} registros no numerador` }));

  return `<section class="relative-analysis"><div class="relative-intro"><article class="relative-formula"><span>Fórmula ativa · ${metric === 'usd' ? 'valor' : 'quantidade'}</span><strong>${formula}</strong><p>${dimensionNote}</p></article><article class="relative-state mock">${icon('alert')}<div><strong>Denominadores simulados para validação do protótipo</strong><p>Produção e Material Amount são mocks por mês, produto e linha. Nenhum percentual desta visão deve ser tratado como resultado industrial homologado.</p></div>${badge('MOCK','warning')}</article></div><section class="dashboard-kpi-grid">${relativeKpis}</section><section class="dashboard-grid"><article class="panel chart-span-8"><header class="panel-header"><div><span class="panel-kicker">Tendência relativa · mock</span><h2>${rateLabel} por mês</h2><p class="panel-description">Taxa calculada após a soma do numerador e do denominador de cada mês.</p></div>${badge('Quanto menor, melhor','success')}</header><div class="chart-legend"><span class="legend-key" style="--key:var(--chart-main)">2026</span>${monthlyPreviousRates.length ? '<span class="legend-key" style="--key:var(--chart-secondary)">2025</span>' : ''}</div>${dashboardChart({kind:'monthly',labels:dashboardSpreadsheetSeries.months,actual:monthlyRates,previous:monthlyPreviousRates,actualLabel:'Taxa 2026',previousLabel:'Taxa 2025',unit:'percent',ariaLabel:`${rateLabel} mensal simulada`},290)}</article><article class="panel chart-span-4"><header class="panel-header"><div><span class="panel-kicker">Ranking relativo · mock</span><h2>Linhas com maior taxa</h2><p class="panel-description">Ordenação pela perda proporcional, não pelo impacto absoluto.</p></div></header>${dashboardChart({kind:'horizontal',labels:lineRates.map((item)=>item.label),values:lineRates.map((item)=>item.value),details:lineDetails,unit:'percent'},290)}</article><article class="panel chart-span-8"><header class="panel-header"><div><span class="panel-kicker">Escala × perda relativa · mock</span><h2>${denominatorLabel} versus taxa</h2><p class="panel-description">Ajuda a separar linhas grandes com baixa taxa de linhas menores proporcionalmente críticas.</p></div></header>${dashboardChart({kind:'scatter',points:scatterPoints,xLabel:denominatorLabel,yLabel:rateLabel,xUnit:metric === 'usd' ? 'usd' : 'qty',yUnit:'percent',masked},290)}</article><article class="panel chart-span-4 relative-coverage"><header class="panel-header"><div><span class="panel-kicker">Qualidade do denominador</span><h2>Cobertura da simulação</h2></div>${badge(`${coverage.toLocaleString('pt-BR',{maximumFractionDigits:0})}%`,'warning')}</header><div class="coverage-meter"><i style="width:${coverage}%"></i></div><dl class="dashboard-summary"><div><dt>Células disponíveis</dt><dd>${availableCells} de ${expectedCells}</dd></div><div><dt>Granularidade</dt><dd>Mês × produto × linha</dd></div><div><dt>Fonte atual</dt><dd>MOCK-DENOM-v1.0</dd></div><div><dt>Fonte homologada</dt><dd>Pendente</dd></div></dl><p class="summary-note">Cobertura de 100% indica apenas que o mock preenche o recorte, não que os dados foram validados.</p></article></section></section>`;
}

function renderDashboard() {
  const filters = state.dashboardFilters;
  const metric = state.dashboardMetric;
  const masked = state.dashboardMasked && metric === 'usd';
  const dashboardRows = model.transactions.filter((row) =>
    (filters.product === 'Todos' || row.productArea === filters.product) &&
    (filters.scrapLine === 'Todas' || row.scrapLine === filters.scrapLine) &&
    (filters.component === 'Todos' || row.component === filters.component) &&
    (filters.partNumber === 'Todos' || row.partNumber === filters.partNumber));
  const fullMetric = model.transactions.reduce((sum, row) => sum + (metric === 'usd' ? row.ifCost : row.qty), 0);
  const filteredMetric = dashboardRows.reduce((sum, row) => sum + (metric === 'usd' ? row.ifCost : row.qty), 0);
  const dimensionFactor = fullMetric ? filteredMetric / fullMetric : 0;
  const periodContext = dashboardPeriodContext(filters, metric);
  const aggregateScale = fullMetric ? periodContext.actual / fullMetric : 0;
  state.dashboardFactor = dimensionFactor;

  const current = periodContext.actual * dimensionFactor;
  // A massa demonstrativa ainda não classifica estornos. Até a regra ser homologada,
  // bruto e líquido permanecem iguais e nenhum ajuste artificial é criado.
  const gross = current;
  const adjustments = 0;
  const previous = periodContext.reference === null ? null : periodContext.reference * dimensionFactor;
  const variation = previous ? (current / previous - 1) * 100 : null;
  const target = periodContext.target === null ? null : periodContext.target * dimensionFactor;
  const achievement = current && target !== null ? target / current * 100 : null;
  const metricLabel = metric === 'usd' ? 'IF Cost' : 'QTY SCRAP';
  const topComponent = dashboardAggregate(dashboardRows, 'component', metric, aggregateScale)[0];

  const monthlyActualBase = metric === 'usd' ? dashboardSpreadsheetSeries.actualUsd : dashboardSpreadsheetSeries.actualQty;
  const monthlyPreviousBase = metric === 'usd' ? dashboardSpreadsheetSeries.previousUsd : dashboardSpreadsheetSeries.previousQty;
  const monthlyActual = monthlyActualBase.map((value) => value === null ? null : value * dimensionFactor);
  const monthlyPrevious = filters.compare === 'Mesmo período de 2025' ? monthlyPreviousBase.map((value) => value === null ? null : value * dimensionFactor) : [];
  const monthlyTarget = metric === 'usd' ? dashboardSpreadsheetSeries.targetUsd.map((value) => value * dimensionFactor) : [];

  const weekly = [0, 0, 0, 0];
  const currentMonthContext = dashboardPeriodContext({ ...filters, period: 'Agosto (parcial)' }, metric);
  const weeklyScale = fullMetric ? currentMonthContext.actual / fullMetric : 0;
  dashboardRows.forEach((row) => { const day = Number(row.transactionDate.slice(0, 2)); weekly[Math.min(3, Math.floor((day - 1) / 3))] += (metric === 'usd' ? row.ifCost : row.qty) * weeklyScale; });
  const products = dashboardAggregate(dashboardRows, 'productArea', metric, aggregateScale);
  const componentsRank = dashboardAggregate(dashboardRows, 'component', metric, aggregateScale);
  const linesRank = dashboardAggregate(dashboardRows, 'scrapLine', metric, aggregateScale);
  const modelsRank = dashboardAggregate(dashboardRows, 'modelCode', metric, aggregateScale);
  const partRank = dashboardAggregate(dashboardRows, 'partNumber', metric, aggregateScale).slice(0, 8);
  const paretoTotal = partRank.reduce((sum, item) => sum + item.value, 0);
  let paretoRunning = 0;
  const paretoCumulative = partRank.map((item) => { paretoRunning += item.value; return paretoTotal ? paretoRunning / paretoTotal * 100 : 0; });

  const fields = field('Ano', 'dash-year', ['2026'], filters.year)
    + field('Período', 'dash-period', ['Acumulado Jan–Ago', 'Agosto (parcial)', 'Julho/2026', 'Junho/2026'], filters.period)
    + field('Produto / área', 'dash-product', ['Todos', ...productAreas], filters.product)
    + field('Linha', 'dash-scrap-line', ['Todas', ...scrapLines], filters.scrapLine)
    + field('Componente', 'dash-component', ['Todos', ...components], filters.component)
    + field('Part Number', 'dash-part-number', ['Todos', ...partNumbers], filters.partNumber)
    + field('Comparar com', 'dash-compare', ['Mesmo período de 2025', 'Mês anterior', 'Sem comparação'], filters.compare);

  const analysisBar = `<section class="dashboard-analysis-bar"><div class="segmented-control" role="group" aria-label="Tipo de análise"><button class="${state.dashboardAnalysis === 'absolute' ? 'active' : ''}" data-action="dashboard-analysis" data-id="absolute">Impacto absoluto</button><button class="${state.dashboardAnalysis === 'relative' ? 'active' : ''}" data-action="dashboard-analysis" data-id="relative">Eficiência relativa <small>mock</small></button></div><div class="analysis-controls"><div class="segmented-control metric-switch" role="group" aria-label="Unidade de análise"><button class="${metric === 'usd' ? 'active' : ''}" data-action="dashboard-metric" data-id="usd">US$</button><button class="${metric === 'qty' ? 'active' : ''}" data-action="dashboard-metric" data-id="qty">QTY SCRAP</button></div>${metric === 'usd' ? `<button class="privacy-toggle ${masked ? 'active' : ''}" type="button" data-action="dashboard-mask" aria-pressed="${masked}" title="${masked ? 'Exibir valores monetários' : 'Ocultar valores monetários'}">${icon(masked ? 'eyeOff' : 'eye')}<span>${masked ? 'Valores ocultos' : 'Ocultar valores'}</span></button>` : ''}</div></section>`;

  const kpis = metric === 'usd'
    ? `${kpiCard('IF Cost líquido', dashboardDisplay(current, metric, masked), filters.period, '', 'Soma do IF Cost após ajustes no escopo dos filtros.')}${kpiCard('Scrap bruto', dashboardDisplay(gross, metric, masked), 'Sem estornos classificados no protótipo')}${kpiCard('Ajustes / estornos', dashboardDisplay(adjustments, metric, masked), 'Regra de estorno ainda em homologação', 'warning')}${kpiCard('Target do período', dashboardDisplay(target || 0, metric, masked), 'Planejado no início de 2026')}${kpiCard('Atingimento', achievement === null ? '—' : `${achievement.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`, achievement === null ? 'Sem realizado no recorte' : 'Acima de 100% é favorável', achievement === null ? '' : achievement >= 100 ? 'success' : 'danger', 'Target ÷ realizado × 100. Como menor scrap é melhor, superar 100% significa gastar menos que o target.')}${kpiCard('Variação vs referência', variation === null ? '—' : formatPercentage(variation), periodContext.referenceLabel, variation === null ? '' : variation <= 0 ? 'success' : 'danger')}`
    : `${kpiCard('QTY SCRAP líquido', dashboardDisplay(current, metric), filters.period)}${kpiCard('Quantidade bruta', dashboardDisplay(gross, metric), 'Sem estornos classificados no protótipo')}${kpiCard('Ajustes', dashboardDisplay(adjustments, metric), 'Regra de estorno ainda em homologação', 'warning')}${kpiCard('Ocorrências', formatNumber(dashboardRows.length), 'Registros disponíveis para investigação')}${kpiCard('Variação vs referência', variation === null ? '—' : formatPercentage(variation), periodContext.referenceLabel, variation === null ? '' : variation <= 0 ? 'success' : 'danger')}${kpiCard('Componente mais afetado', topComponent?.label || 'Sem dados', topComponent ? dashboardDisplay(topComponent.value, metric) : '')}`;

  const attention = periodContext.isCurrentDetail
    ? dashboardRows.slice().sort((a, b) => (metric === 'usd' ? b.ifCost - a.ifCost : b.qty - a.qty)).slice(0, 6).map((row) => `<tr><td>${row.transactionDate.slice(0,5)}</td><td>${row.productArea}</td><td><strong>${row.scrapLine}</strong><small class="cell-stack">${row.sector} · ${row.stationCode}</small></td><td><strong>${row.partNumber}</strong><small class="cell-stack">${row.component}</small></td><td class="number">${formatNumber(row.qty)}</td><td class="number"><strong>${masked ? 'US$ •••••' : formatCurrency(row.ifCost)}</strong></td><td>${badge(row.review.status)}</td><td><div class="table-actions">${button('Ver na Base','dashboard-row-explore',{small:true,id:row.id})}${button(row.review.status === 'Justificado' ? 'Ver revisão' : 'Revisar','dashboard-row-review',{small:true,primary:true,id:row.id})}</div></td></tr>`).join('')
    : `<tr><td colspan="8"><div class="empty-state"><strong>Detalhe histórico ainda não conectado</strong><span>Os agregados de ${filters.period} estão disponíveis na planilha, mas os registros transacionais desse mês ainda não fazem parte da massa navegável.</span></div></td></tr>`;

  const absoluteContent = `<section class="dashboard-kpi-grid">${kpis}</section><section class="dashboard-grid"><article class="panel chart-span-8"><header class="panel-header"><div><span class="panel-kicker">Visão anual · ${metricLabel}</span><h2>Target × realizado mensal</h2><p class="panel-description">Valores da planilha preservados para os meses fechados; agosto é parcial e meses futuros não recebem resultado.</p></div>${badge(metric === 'usd' ? 'Target disponível' : 'Sem target em unidades', metric === 'usd' ? 'brand' : 'warning')}</header><div class="chart-legend"><span class="legend-key" style="--key:var(--chart-main)">Realizado 2026</span>${monthlyPrevious.length ? '<span class="legend-key" style="--key:var(--chart-secondary)">Referência 2025</span>' : ''}${monthlyTarget.length ? '<span class="legend-key" style="--key:var(--chart-tertiary)">Target</span>' : ''}</div>${dashboardChart({kind:'monthly',labels:dashboardSpreadsheetSeries.months,actual:monthlyActual,previous:monthlyPrevious,target:monthlyTarget,actualLabel:'Realizado 2026',previousLabel:'Mesmo período 2025',unit:metric,masked,ariaLabel:'Target e realizado mensal'},300)}<div class="period-status"><span><i class="closed"></i>Jan–Jul fechados</span><span><i class="partial"></i>Ago parcial</span><span><i class="future"></i>Set–Dez futuros</span></div></article><article class="panel chart-span-4"><header class="panel-header"><div><span class="panel-kicker">Composição</span><h2>Distribuição por produto / área</h2><p class="panel-description">Clique em uma barra para investigar a categoria na Base de Scrap.</p></div></header>${dashboardChart({kind:'horizontal',labels:products.map((item)=>item.label),values:products.map((item)=>item.value),details:products.map((item)=>`${item.count} ocorrências · ${formatNumber(item.qty)} un.`),unit:metric,masked,drillKey:'productArea'},300)}</article><article class="panel chart-span-8"><header class="panel-header"><div><span class="panel-kicker">Comportamento do mês atual</span><h2>Evolução semanal</h2><p class="panel-description">As semanas usam agosto parcial mesmo quando o KPI está em acumulado YTD.</p></div></header>${dashboardChart({kind:'columns',labels:['S1 · 01–03','S2 · 04–06','S3 · 07–09','S4 · 10–12'],values:weekly,unit:metric,masked},245)}</article><article class="panel chart-span-4"><header class="panel-header"><div><span class="panel-kicker">Investigação</span><h2>Top componentes</h2><p class="panel-description">Clique em uma barra para abrir os registros relacionados.</p></div></header>${dashboardChart({kind:'horizontal',labels:componentsRank.slice(0,5).map((item)=>item.label),values:componentsRank.slice(0,5).map((item)=>item.value),details:componentsRank.slice(0,5).map((item)=>`${item.count} registros`),unit:metric,masked,drillKey:'component'},245)}</article><article class="panel chart-span-4"><header class="panel-header"><div><span class="panel-kicker">Ranking</span><h2>Linhas mais afetadas</h2></div></header>${dashboardChart({kind:'horizontal',labels:linesRank.map((item)=>item.label),values:linesRank.map((item)=>item.value),details:linesRank.map((item,index)=>`Posição ${index+1} no recorte atual`),unit:metric,masked,drillKey:'scrapLine'},230)}</article><article class="panel chart-span-4"><header class="panel-header"><div><span class="panel-kicker">Ranking</span><h2>Modelos mais afetados</h2></div></header>${dashboardChart({kind:'horizontal',labels:modelsRank.slice(0,6).map((item)=>item.label),values:modelsRank.slice(0,6).map((item)=>item.value),unit:metric,masked,drillKey:'modelCode'},230)}</article><article class="panel chart-span-4"><header class="panel-header"><div><span class="panel-kicker">Resumo do recorte</span><h2>Leitura rápida</h2></div></header><dl class="dashboard-summary"><div><dt>Produto líder</dt><dd>${products[0]?.label || 'Sem dados'}</dd></div><div><dt>Linha líder</dt><dd>${linesRank[0]?.label || 'Sem dados'}</dd></div><div><dt>Componente líder</dt><dd>${componentsRank[0]?.label || 'Sem dados'}</dd></div><div><dt>Registros disponíveis</dt><dd>${formatNumber(dashboardRows.length)}</dd></div></dl><p class="summary-note">“Líder” significa maior impacto de scrap, portanto requer atenção.</p></article><article class="panel chart-span-12"><header class="panel-header"><div><span class="panel-kicker">Perdas brutas</span><h2>Pareto de Part Numbers</h2><p class="panel-description">Clique em uma coluna para investigar o Part Number na Base.</p></div></header>${dashboardChart({kind:'pareto',labels:partRank.map((item)=>item.label),values:partRank.map((item)=>item.value),cumulative:paretoCumulative,unit:metric,masked,drillKey:'partNumber'},315)}</article><article class="panel chart-span-12"><header class="panel-header"><div><span class="panel-kicker">QTY SCRAP por posto</span><h2>Mapa de risco por linha e setor</h2><p class="panel-description">Primeira representação funcional. O desenho industrial definitivo e os limites de risco ainda precisam de homologação.</p></div><div class="risk-legend"><span><i class="low"></i>Baixo</span><span><i class="moderate"></i>Moderado</span><span><i class="critical"></i>Crítico</span></div></header>${dashboardRiskMap(dashboardRows, aggregateScale)}</article></section>${tablePanel(periodContext.isCurrentDetail ? 'Ocorrências prioritárias — amostra navegável' : `Ocorrências prioritárias — ${filters.period}`,[{label:'Data'},{label:'Produto'},{label:'Linha / posto'},{label:'Item / componente'},{label:'QTY',number:true},{label:'IF Cost',number:true},{label:'Revisão'},{label:'Ações'}],attention)}`;

  const emptyScope = dashboardRows.length ? '' : `<section class="dashboard-empty-scope">${icon('filter')}<div><strong>Nenhum registro combina com os filtros dimensionais</strong><p>Os totais foram zerados para evitar inferência incorreta. Remova um dos filtros de produto, linha, componente ou Part Number.</p></div><button class="btn small" data-action="clear-dashboard">Voltar à visão consolidada</button></section>`;
  const activeChips = dashboardActiveFilters(filters);
  const filterFooter = activeChips ? `<footer>${activeChips}<button class="link-button" data-action="clear-dashboard">Limpar todos</button></footer>` : '';
  return `<section class="page-stack dashboard-page"><header class="dashboard-page-header"><div><h1 class="page-title">Dashboard de Material Scrap / IF Cost</h1></div><div class="page-actions">${button('Atualizar','refresh-dashboard',{icon:'refresh'})}${button('Exportar dados','export-dashboard',{icon:'download'})}${button('Criar relatório','go-reports',{icon:'report',primary:true})}</div></header><section class="dashboard-filter-panel"><div class="dashboard-filter-row">${fields}</div>${filterFooter}</section>${analysisBar}${emptyScope}${state.dashboardAnalysis === 'relative' ? renderRelativeDashboard({ filters, metric, masked, dashboardRows, dimensionFactor }) : absoluteContent}</section>`;
}

function filteredTransactions() {
  const q = state.scrapSearch.toLowerCase();
  const contextualAlert = state.context.alertId ? model.alerts.find((alert) => alert.id === state.context.alertId) : null;
  let data = model.transactions.filter((t) =>
    (!q || [t.id,t.partNumber,t.itemDescription,t.component,t.accountAlias,t.executionId,t.productArea,t.modelCode,t.scrapLine,t.sector,t.stationCode].some((v) => String(v).toLowerCase().includes(q))) &&
    (state.scrapFilters.date==='Todas as datas'||state.scrapFilters.date==='Agosto/2026'||(state.scrapFilters.date==='Hoje'&&t.transactionDate==='12/08/2026')||(state.scrapFilters.date==='Últimos 7 dias'&&Number(t.transactionDate.slice(0,2))>=6)) &&
    (state.scrapFilters.productArea==='Todos'||t.productArea===state.scrapFilters.productArea) &&
    (state.scrapFilters.scrapLine==='Todas'||t.scrapLine===state.scrapFilters.scrapLine) &&
    (state.scrapFilters.movementType==='Todos'||t.movementType===state.scrapFilters.movementType) &&
    (state.scrapFilters.processingStatus==='Todos'||t.processingStatus===state.scrapFilters.processingStatus) &&
    (state.scrapFilters.reviewStatus==='Todos'||t.review.status===state.scrapFilters.reviewStatus) &&
    (state.scrapAdvancedFilters.organizationCode==='Todas'||t.organizationCode===state.scrapAdvancedFilters.organizationCode) &&
    (state.scrapAdvancedFilters.accountAlias==='Todos'||t.accountAlias===state.scrapAdvancedFilters.accountAlias) &&
    (state.scrapAdvancedFilters.subinventoryGroup==='Todos'||t.subinventoryGroup===state.scrapAdvancedFilters.subinventoryGroup) &&
    (state.scrapAdvancedFilters.subinventory==='Todos'||t.subinventory===state.scrapAdvancedFilters.subinventory) &&
    (state.scrapAdvancedFilters.warehouseMarket==='Todos'||t.warehouseMarket===state.scrapAdvancedFilters.warehouseMarket) &&
    (state.scrapAdvancedFilters.receiptDepartment==='Todos'||t.receiptDepartment===state.scrapAdvancedFilters.receiptDepartment) &&
    (state.scrapAdvancedFilters.component==='Todos'||t.component===state.scrapAdvancedFilters.component) &&
    (state.scrapAdvancedFilters.modelCode==='Todos'||t.modelCode===state.scrapAdvancedFilters.modelCode) &&
    (state.scrapAdvancedFilters.sector==='Todos'||t.sector===state.scrapAdvancedFilters.sector) &&
    (state.scrapAdvancedFilters.stationCode==='Todos'||t.stationCode===state.scrapAdvancedFilters.stationCode) &&
    (state.scrapAdvancedFilters.partNumber==='Todos'||t.partNumber===state.scrapAdvancedFilters.partNumber) &&
    (state.scrapAdvancedFilters.reportInclusion==='Todos'||(state.scrapAdvancedFilters.reportInclusion==='Incluído'&&t.review.includeInReport)||(state.scrapAdvancedFilters.reportInclusion==='Não incluído'&&!t.review.includeInReport)) &&
    (!state.context.productArea || t.productArea === state.context.productArea) &&
    (!state.context.component || t.component === state.context.component) &&
    (!state.context.modelCode || t.modelCode === state.context.modelCode) &&
    (!state.context.sector || t.sector === state.context.sector) &&
    (!state.context.stationCode || t.stationCode === state.context.stationCode) &&
    (!state.context.partNumber || t.partNumber === state.context.partNumber) &&
    (!state.context.scrapLine || t.scrapLine === state.context.scrapLine) &&
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
  if (state.scrapView === 'review') return renderScrapReview();
  const filtered = filteredTransactions();
  const start = (state.scrapPage - 1) * state.scrapPageSize;
  const data = filtered.slice(start, start + state.scrapPageSize);
  const metric = state.dashboardMetric;
  const masked = state.dashboardMasked;
  const money = (value) => masked ? 'US$ •••••' : formatCurrency(value);
  const ifCost = filtered.reduce((sum, row) => sum + row.ifCost, 0);
  const qty = filtered.reduce((sum, row) => sum + row.qty, 0);
  const metricTotal = metric === 'usd' ? ifCost : qty;
  const totalReference = metric === 'usd'
    ? model.transactions.reduce((sum, row) => sum + row.ifCost, 0)
    : model.transactions.reduce((sum, row) => sum + row.qty, 0);
  const metricShare = totalReference ? metricTotal / totalReference * 100 : 0;
  const selected = model.transactions.filter((row) => state.selectedScrapIds.includes(row.id));
  const mixedSelection = new Set(selected.map((row) => `${row.component}|${row.scrapLine}`)).size > 1;
  const ranking = aggregateTransactions(filtered, 'partNumber')
    .sort((a, b) => metric === 'usd' ? b.value - a.value : b.qty - a.qty)
    .slice(0, 8);
  const sortLabel = (label, key) => `<button class="sort-button" data-action="sort-scrap" data-key="${key}">${label}${state.scrapSort.key === key ? (state.scrapSort.direction === 'asc' ? ' ↑' : ' ↓') : ''}</button>`;
  const rows = data.map((t) => `<tr data-row-id="${t.id}" data-row-type="transaction" class="${state.selectedScrapIds.includes(t.id) ? 'selected-row' : ''}" title="${t.occurrence}">
    <td><input type="checkbox" data-action="toggle-scrap" data-id="${t.id}" aria-label="Selecionar ${t.id}" ${state.selectedScrapIds.includes(t.id) ? 'checked' : ''}></td>
    <td>${t.transactionDate}<small class="cell-stack">${t.id}</small></td>
    <td><strong>${t.productArea}</strong><small class="cell-stack">${t.modelCode}</small></td>
    <td><strong>${t.scrapLine} · ${t.stationCode}</strong><small class="cell-stack">${t.sector}</small></td>
    <td><strong>${t.partNumber}</strong><small class="cell-stack">${t.component}</small></td>
    <td class="number signed-value">${formatNumber(t.issueQuantitySigned)}</td>
    <td class="number"><strong>${formatNumber(t.qty)}</strong></td>
    <td class="number"><strong>${t.ifCost ? money(t.ifCost) : '—'}</strong></td>
    <td>${badge(t.movementType)}</td><td>${badge(t.processingStatus)}</td>
    <td>${badge(t.review.status)}${t.review.includeInReport ? '<small class="cell-stack">No relatório</small>' : ''}</td>
    <td>${button(t.review.status === 'Justificado' ? 'Ver revisão' : 'Revisar', 'review-one', { small: true, id: t.id })}</td>
  </tr>`).join('');
  const selectedValue = metric === 'usd'
    ? money(selected.reduce((sum, row) => sum + row.ifCost, 0))
    : `${formatNumber(selected.reduce((sum, row) => sum + row.qty, 0))} un.`;
  const selectionBar = selected.length ? `<section class="selection-bar ${mixedSelection ? 'warning' : ''}"><div><strong>${selected.length} registro${selected.length > 1 ? 's' : ''} selecionado${selected.length > 1 ? 's' : ''}</strong><span>${selectedValue}${mixedSelection ? ' · componentes ou linhas diferentes: revise antes de aplicar em lote' : ''}</span></div>${button('Limpar seleção', 'clear-scrap-selection')}${button('Justificar selecionados', 'review-selected', { primary: true, icon: 'check' })}</section>` : '';
  const analysisBar = `<section class="dashboard-analysis-bar base-analysis-bar"><div><strong>Medida da análise</strong><small>O seletor atualiza resumo, ranking e leitura da seleção.</small></div><div class="analysis-controls"><div class="segmented-control metric-switch"><button class="${metric === 'usd' ? 'active' : ''}" data-action="dashboard-metric" data-id="usd">US$</button><button class="${metric === 'qty' ? 'active' : ''}" data-action="dashboard-metric" data-id="qty">QTY SCRAP</button></div>${metric === 'usd' ? `<button class="privacy-toggle ${masked ? 'active' : ''}" data-action="dashboard-mask">${icon(masked ? 'eyeOff' : 'eye')}<span>${masked ? 'Valores ocultos' : 'Ocultar valores'}</span></button>` : ''}</div></section>`;
  const filters = field('Período', 'scrap-date', ['Todas as datas', 'Hoje', 'Últimos 7 dias', 'Agosto/2026'], state.scrapFilters.date)
    + field('Produto / área', 'scrap-product-area', ['Todos', ...productAreas], state.scrapFilters.productArea)
    + field('Linha', 'scrap-line', ['Todas', ...scrapLines], state.scrapFilters.scrapLine)
    + field('Movimentação', 'scrap-movement-type', ['Todos', 'Scrap', 'Ajuste / possível estorno'], state.scrapFilters.movementType)
    + field('Processamento', 'scrap-processing-status', ['Todos', 'Validado', 'Rejeitado', 'Pendente'], state.scrapFilters.processingStatus)
    + field('Revisão', 'scrap-review-status', ['Todos', 'Pendente de revisão', 'Em revisão', 'Justificado'], state.scrapFilters.reviewStatus);
  const rankingRows = ranking.map((item, index) => {
    const value = metric === 'usd' ? item.value : item.qty;
    const max = metric === 'usd' ? ranking[0].value : ranking[0].qty;
    return `<button class="ranking-item" data-action="drill-part" data-id="${item.label}"><span>${index + 1}</span><div><strong>${item.label}</strong><small>${item.count} registros · ${formatNumber(item.qty)} un.</small><i><b style="width:${max ? value / max * 100 : 0}%"></b></i></div><em>${metric === 'usd' ? money(item.value) : `${formatNumber(item.qty)} un.`}</em>${icon('chevronRight')}</button>`;
  }).join('');
  const table = tablePanel('Registros de scrap', [
    { label: `<input type="checkbox" data-action="select-visible-scrap" aria-label="Selecionar registros visíveis" ${data.length && data.every((row) => state.selectedScrapIds.includes(row.id)) ? 'checked' : ''}>` },
    { label: sortLabel('Data / ID', 'transactionDate') }, { label: 'Produto / modelo' }, { label: 'Linha / posto' },
    { label: sortLabel('PN / componente', 'partNumber') }, { label: 'Issue Qty', number: true },
    { label: sortLabel('QTY SCRAP', 'qty'), number: true }, { label: sortLabel('IF Cost', 'ifCost'), number: true },
    { label: 'Movimento' }, { label: 'Processamento' }, { label: 'Revisão' }, { label: 'Ação' }
  ], rows, { pagination: pagination(filtered.length) });
  return `<section class="page-stack scrap-page">${pageHeader('Base de Scrap', button('Exportar dados', 'export-scrap', { icon: 'download' }))}<section class="filter-panel context-panel scrap-filter-panel">${contextTrail()}<div class="scrap-search-row"><div class="search-wrap scrap-search">${icon('search')}<input class="search-control" id="scrap-search" value="${state.scrapSearch}" placeholder="Buscar ID, código, componente, modelo, linha ou execução..." aria-label="Buscar registros de scrap"></div><button class="btn" data-action="more-filters">${icon('filter')}Mais filtros</button></div><div class="scrap-filter-grid">${filters}</div></section>${analysisBar}${selectionBar}<section class="kpi-grid">${kpiCard(metric === 'usd' ? 'IF Cost filtrado' : 'QTY SCRAP filtrada', metric === 'usd' ? money(ifCost) : formatNumber(qty))}${kpiCard('Registros', formatNumber(filtered.length), 'Ocorrências no recorte')}${kpiCard('Participação no total', `${metricShare.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`, metric === 'usd' ? 'Por IF Cost' : 'Por QTY SCRAP')}${kpiCard('Pendentes de revisão', formatNumber(filtered.filter((row) => row.review.status !== 'Justificado').length))}${kpiCard('Justificados', formatNumber(filtered.filter((row) => row.review.status === 'Justificado').length))}</section><section class="panel ranking-panel"><header class="panel-header"><div><h2>Ranking dinâmico de Part Numbers</h2><p class="panel-description">Ordenado por ${metric === 'usd' ? 'IF Cost' : 'QTY SCRAP'} no recorte atual. Clique para aprofundar.</p></div></header><div class="ranking-grid">${rankingRows || '<div class="empty-state">Nenhum Part Number no contexto atual.</div>'}</div></section>${table}</section>`;
}

function syncScrapReview() {
  const row=model.transactions.find(item=>item.id===state.activeReviewId); if(!row)return;
  const value=(selector,current)=>{const element=$(selector);return element?element.value:current;};
  row.review.title=value('#review-title',row.review.title);
  row.review.category=value('#review-category',row.review.category);
  row.review.reason=value('#review-reason',row.review.reason);
  row.review.requiresCause=$('#review-requires-cause')?.checked??row.review.requiresCause;
  row.review.risk=value('#review-risk',row.review.risk);
  row.review.recurrence=value('#review-recurrence',row.review.recurrence);
  row.review.fiveWhys=value('#review-five-whys',row.review.fiveWhys);
  row.review.rootCause=value('#review-root-cause',row.review.rootCause);
  row.review.immediate=value('#review-immediate',row.review.immediate);
  row.review.corrective=value('#review-corrective',row.review.corrective);
  row.review.preventive=value('#review-preventive',row.review.preventive);
  row.review.responsible=value('#review-responsible',row.review.responsible);
  row.review.responsibleDepartment=value('#review-department',row.review.responsibleDepartment);
  row.review.dueDate=value('#review-due-date',row.review.dueDate);
  row.review.actionStatus=value('#review-action-status',row.review.actionStatus);
  row.review.expectedResult=value('#review-expected-result',row.review.expectedResult);
  row.review.actualResult=value('#review-actual-result',row.review.actualResult);
  row.review.executiveHighlight=value('#review-executive-highlight',row.review.executiveHighlight);
  row.review.reportOrder=Number(value('#review-report-order',row.review.reportOrder))||row.review.reportOrder;
  row.review.includeInReport=$('#review-include-report')?.checked??row.review.includeInReport;
}
function renderScrapReview() {
  const selected=model.transactions.filter((row)=>state.selectedScrapIds.includes(row.id));
  if(!selected.length){state.scrapView='list';return renderScrap();}
  if(!selected.some((row)=>row.id===state.activeReviewId))state.activeReviewId=selected[0].id;
  const row=selected.find((item)=>item.id===state.activeReviewId),review=row.review;
  const masked=state.dashboardMasked;
  const money=(value)=>masked?'US$ •••••':formatCurrency(value);
  const selectionGroups=new Set(selected.map((item)=>`${item.component}|${item.scrapLine}`));
  const mixedSelection=selectionGroups.size>1;
  const list=selected.map((item,index)=>`<button class="review-list-item ${item.id===row.id?'active':''}" data-action="select-review-item" data-id="${item.id}"><span>${index+1}</span><div><strong>${item.partNumber}</strong><small>${item.productArea} · ${item.scrapLine}/${item.stationCode}</small><small>${item.component} · ${item.id}</small></div>${badge(item.review.status)}</button>`).join('');
  const facts=[['Data',row.transactionDate],['Produto / modelo',`${row.productArea} · ${row.modelCode}`],['Linha / setor',`${row.scrapLine} · ${row.sector}`],['Posto',`${row.stationCode} · ${row.station}`],['Componente',row.component],['QTY SCRAP',`${formatNumber(row.qty)} un.`],['Issue Qty original',formatNumber(row.issueQuantitySigned)],['IF Cost',money(row.ifCost)],['Movimento',row.movementType],['Execução',row.executionId]];
  const reviewFields=`<section class="review-section"><header><span>1</span><div><h3>Problema e classificação</h3><p>Defina o que ocorreu e como o problema deve ser priorizado.</p></div></header><div class="form-grid"><div class="field full"><label for="review-title">Título do problema</label><input class="control" id="review-title" value="${review.title}" placeholder="Ex.: painel riscado no transporte interno"></div>${field('Categoria','review-category',['Selecione...','Material','Processo','Máquina','Mão de obra','Engenharia','Fornecedor','Outro'],review.category)}${field('Risco','review-risk',['Baixo','Médio','Alto','Crítico'],review.risk)}${field('Recorrência','review-recurrence',['Pontual','Recorrente','Em validação'],review.recurrence)}<div class="field"><label for="review-responsible">Responsável pela análise</label><input class="control" id="review-responsible" value="${review.responsible}"></div><div class="field full"><label for="review-reason">Justificativa / descrição do problema *</label><textarea class="control" id="review-reason" placeholder="Descreva o motivo deste registro de scrap...">${review.reason}</textarea></div></div></section>
  <section class="review-section"><header><span>2</span><div><h3>Análise de causa</h3><p>A causa raiz é obrigatória para concluir; 4M e 5 Porquês apoiam a investigação.</p></div></header><div class="form-grid"><div class="field full"><span class="field-label">Classificação 4M</span><div class="choice-group">${['Machine','Method','Material','Man'].map((value)=>`<button class="choice ${review.classification4m.includes(value)?'selected':''}" data-action="toggle-review-4m" data-value="${value}">${value}</button>`).join('')}</div></div><div class="field full"><label for="review-five-whys">5 Porquês / raciocínio da análise</label><textarea class="control" id="review-five-whys" placeholder="Registre a sequência usada para chegar à causa...">${review.fiveWhys}</textarea></div><div class="field full"><label for="review-root-cause">Causa raiz validada *</label><textarea class="control" id="review-root-cause" placeholder="Registre a causa validada...">${review.rootCause}</textarea></div></div></section>
  <section class="review-section"><header><span>3</span><div><h3>Plano de ação</h3><p>Separe contenção imediata, correção e prevenção de recorrência.</p></div></header><div class="form-grid"><div class="field full"><label for="review-immediate">Ação imediata / contenção</label><textarea class="control" id="review-immediate">${review.immediate}</textarea></div><div class="field"><label for="review-corrective">Ação corretiva</label><textarea class="control" id="review-corrective">${review.corrective}</textarea></div><div class="field"><label for="review-preventive">Ação preventiva</label><textarea class="control" id="review-preventive">${review.preventive}</textarea></div><div class="field"><label for="review-department">Departamento responsável</label><input class="control" id="review-department" value="${review.responsibleDepartment}"></div><div class="field"><label for="review-due-date">Prazo</label><input class="control" id="review-due-date" value="${review.dueDate}" placeholder="dd/mm/aaaa"></div>${field('Status da ação','review-action-status',['Planejada','Em andamento','Concluída','Bloqueada'],review.actionStatus)}</div><div class="inline-actions review-plan-action">${button('Criar ou vincular plano de ação','create-review-plan',{icon:'plus'})}</div></section>
  <section class="review-section"><header><span>4</span><div><h3>Resultado, evidências e relatório</h3><p>Prepare o conteúdo que poderá alimentar o relatório mensal e o PPTX.</p></div></header><div class="form-grid"><div class="field"><label for="review-expected-result">Resultado esperado</label><textarea class="control" id="review-expected-result">${review.expectedResult}</textarea></div><div class="field"><label for="review-actual-result">Resultado observado</label><textarea class="control" id="review-actual-result">${review.actualResult}</textarea></div><div class="field full"><label for="review-executive-highlight">Destaque executivo / melhoria principal</label><textarea class="control" id="review-executive-highlight" placeholder="Síntese curta para o relatório...">${review.executiveHighlight}</textarea></div><div class="field"><label for="review-report-order">Ordem sugerida no relatório</label><input class="control" id="review-report-order" type="number" min="1" value="${review.reportOrder}"></div><div class="field review-report-toggle"><span class="field-label">Curadoria</span><label class="checkbox-row"><input id="review-include-report" type="checkbox" ${review.includeInReport?'checked':''}> Incluir no próximo relatório</label></div></div><section class="review-evidence"><header><div><h3>Evidências (${review.evidence.length})</h3><p>Fotos, documentos, antes/depois ou referência GERP vinculados ao registro.</p></div>${button('Adicionar evidência','add-review-evidence',{small:true,icon:'plus'})}</header>${review.evidence.length?review.evidence.map((item)=>`<span class="badge brand">${icon('file')}${item}</span>`).join(' '):'<div class="review-empty">Nenhuma evidência adicionada.</div>'}</section></section>`;
  const applyAll=selected.length>1?`<label class="apply-all ${mixedSelection?'warning':''}"><input id="review-apply-all" type="checkbox" checked><span><strong>Aplicar esta revisão aos ${selected.length} registros selecionados</strong><small>${mixedSelection?'A seleção mistura componentes ou linhas; uma confirmação adicional será solicitada.':'Os registros pertencem ao mesmo agrupamento operacional. Você ainda pode ajustá-los individualmente.'}</small></span></label>`:'';
  return `<section class="page-stack review-subpage">${pageHeader('Revisar e justificar scrap',`${button('Voltar para a Base','back-scrap',{icon:'chevronLeft'})}${button('Salvar rascunho','save-scrap-review')}${button(`Concluir revisão${selected.length>1?' em lote':''}`,'conclude-scrap-review',{primary:true,icon:'check'})}`)}<div class="review-context"><span>Base de Scrap</span>${icon('chevronRight')}<strong>${selected.length} registro${selected.length>1?'s':''}</strong></div><div class="review-layout"><aside class="review-list"><header><h2>Seleção</h2><p>Abra cada item para revisar diferenças antes da aplicação em lote.</p></header>${list}<footer><strong>${state.dashboardMetric==='usd'?money(selected.reduce((sum,item)=>sum+item.ifCost,0)):`${formatNumber(selected.reduce((sum,item)=>sum+item.qty,0))} un.`}</strong><span>${selected.length} ocorrências</span></footer></aside><article class="review-workspace"><section class="review-facts"><header><div><span class="block-kicker">Contexto da ocorrência</span><h2>${row.partNumber} · ${row.itemDescription}</h2><p>${row.defect}: ${row.occurrence}</p></div>${badge(review.status)}</header><div class="meta-grid">${facts.map(([label,value])=>`<div class="meta-item"><small>${label}</small><strong>${value}</strong></div>`).join('')}</div><div class="formula-note"><strong>Leitura da quantidade</strong><span>Issue Qty preserva o sinal recebido (${formatNumber(row.issueQuantitySigned)}). QTY SCRAP usa o módulo para análise: |${formatNumber(row.issueQuantitySigned)}| = ${formatNumber(row.qty)}.</span></div></section><section class="review-form structured-review"><header><div><span class="block-kicker">Revisão humana</span><h2>Registro de causa e ação</h2><p>Campos marcados com * são necessários para concluir.</p></div></header>${reviewFields}</section>${applyAll}</article></div></section>`;
}

function renderComponents() {
  const q=state.componentSearch.toLowerCase(),filters=state.componentFilters;
  const visible=model.components.filter((item)=>(!q||[item.id,item.itemCode,item.normalizedName,item.component,...item.aliases].some((value)=>String(value).toLowerCase().includes(q)))&&(filters.productArea==='Todos'||item.productArea===filters.productArea)&&(filters.division==='Todas'||item.division===filters.division)&&(filters.itemType==='Todos'||item.itemType===filters.itemType)&&(filters.status==='Todos'||item.status===filters.status));
  const occurrences=(item)=>model.transactions.filter((row)=>row.partNumber===item.itemCode);
  const rows=visible.map((item)=>{const related=occurrences(item);return `<tr data-row-id="${item.id}" data-row-type="component"><td><strong>${item.itemCode}</strong><small class="cell-stack">${item.id}</small></td><td><strong>${item.normalizedName}</strong><small class="cell-stack">${item.component}</small></td><td>${item.itemType}</td><td>${item.productArea}</td><td>${item.division}</td><td class="number">${item.aliases.length}</td><td>${item.lastOccurrence}<small class="cell-stack">${related.length} ocorrências</small></td><td>${badge(item.status)}</td><td>${button('Ver detalhe','open-component',{small:true,id:item.id})}</td></tr>`}).join('');
  const types=[...new Set(model.components.map((item)=>item.itemType))];
  const fields=field('Produto / área','component-product',['Todos',...productAreas],filters.productArea)+field('Divisão','component-division',['Todas','MS','MFG'],filters.division)+field('Tipo','component-type',['Todos',...types],filters.itemType)+field('Status','component-status',['Todos','Ativo','Em validação'],filters.status);
  return `<section class="page-stack component-page">${pageHeader('Catálogo de componentes',`${button('Exportar catálogo','export-components',{icon:'download'})}${button('Novo componente','new-component',{primary:true,icon:'plus'})}`)}<section class="filter-panel"><div class="scrap-search-row"><div class="search-wrap scrap-search">${icon('search')}<input class="search-control" id="component-search" value="${state.componentSearch}" placeholder="Buscar código, descrição normalizada ou alias..."></div></div><div class="filters component-filter-grid">${fields}</div></section><section class="kpi-grid">${kpiCard('Componentes cadastrados',formatNumber(model.components.length))}${kpiCard('Visíveis no recorte',formatNumber(visible.length))}${kpiCard('Aliases mapeados',formatNumber(visible.reduce((sum,item)=>sum+item.aliases.length,0)))}${kpiCard('Em validação',formatNumber(model.components.filter((item)=>item.status==='Em validação').length),'Requer revisão de normalização','warning')}</section>${tablePanel('Dicionário normalizado',[{label:'Código / ID'},{label:'Descrição / componente'},{label:'Tipo'},{label:'Produto / área'},{label:'Divisão'},{label:'Aliases',number:true},{label:'Última ocorrência'},{label:'Status'},{label:'Ação'}],rows)}</section>`;
}

function actionIsOverdue(item){const [day,month,year]=item.dueDate.split('/').map(Number);return new Date(year,month-1,day)<new Date(2026,7,15)&&!['Concluída','Validada'].includes(item.status);}
function filteredActions(){const f=state.actionFilters;return model.actions.filter((item)=>(f.productArea==='Todos'||item.productArea===f.productArea)&&(f.scrapLine==='Todas'||item.lineCode===f.scrapLine)&&(f.owner==='Todos'||item.owner===f.owner)&&(f.category4m==='Todos'||item.category4m===f.category4m)&&(f.risk==='Todos'||item.risk===f.risk)&&(f.status==='Todos'||item.status===f.status)&&(f.overdue==='Todos'||(f.overdue==='Somente vencidas'&&actionIsOverdue(item))||(f.overdue==='No prazo'&&!actionIsOverdue(item))));}
function renderActions() {
  const visible=filteredActions(),metric=state.dashboardMetric,masked=state.dashboardMasked;
  const display=(item)=>metric==='usd'?(masked?'US$ •••••':formatCurrency(item.ifCost)):`${formatNumber(item.qty)} un.`;
  const owners=[...new Set(model.actions.map((item)=>item.owner))],statuses=['Planejada','Em andamento','Bloqueada','Concluída','Aguardando eficácia','Validada'];
  const fields=field('Período','action-period',['Agosto/2026','Ano 2026'],state.actionFilters.period)+field('Produto / área','action-product',['Todos',...productAreas],state.actionFilters.productArea)+field('Linha','action-line',['Todas',...scrapLines],state.actionFilters.scrapLine)+field('Responsável','action-owner',['Todos',...owners],state.actionFilters.owner)+field('Categoria 4M','action-4m',['Todos','Machine','Method','Material','Man'],state.actionFilters.category4m)+field('Risco','action-risk',['Todos','Médio','Alto','Crítico'],state.actionFilters.risk)+field('Status','action-status',['Todos',...statuses],state.actionFilters.status)+field('Prazo','action-overdue',['Todos','Somente vencidas','No prazo'],state.actionFilters.overdue);
  const statusCounts=statuses.map((status)=>visible.filter((item)=>item.status===status).length);
  const lateByArea=[...new Set(model.actions.map((item)=>item.ownerArea))].map((area)=>({label:area,value:visible.filter((item)=>item.ownerArea===area&&actionIsOverdue(item)).length,display:`${visible.filter((item)=>item.ownerArea===area&&actionIsOverdue(item)).length} ações`}));
  const tableRows=visible.map((item)=>`<tr data-row-id="${item.id}" data-row-type="action"><td><strong>${item.title}</strong><small class="cell-stack">${item.id}</small></td><td>${item.productArea}<small class="cell-stack">${item.lineCode} · ${item.stationCode}</small></td><td>${item.owner}<small class="cell-stack">${item.ownerArea}</small></td><td>${badge(item.risk)}</td><td>${item.category4m}</td><td class="${actionIsOverdue(item)?'negative':''}">${item.dueDate}${actionIsOverdue(item)?'<small class="cell-stack">Vencida</small>':''}</td><td>${badge(item.status)}<small class="cell-stack">${item.progress}% concluído</small></td><td class="number"><strong>${display(item)}</strong></td><td>${button('Abrir','open-action',{small:true,id:item.id})}</td></tr>`).join('');
  const kanban=statuses.map((status)=>`<section class="kanban-column"><header><strong>${status}</strong><span>${visible.filter((item)=>item.status===status).length}</span></header>${visible.filter((item)=>item.status===status).map((item)=>`<button class="action-card" data-action="open-action" data-id="${item.id}"><span>${badge(item.risk)}</span><strong>${item.title}</strong><small>${item.productArea} · ${item.lineCode}/${item.stationCode}</small><small>${item.owner} · ${item.dueDate}</small><i><b style="width:${item.progress}%"></b></i><em>${display(item)}</em></button>`).join('')||'<div class="kanban-empty">Nenhuma ação</div>'}</section>`).join('');
  const content=state.actionView==='kanban'?`<div class="kanban-board">${kanban}</div>`:tablePanel('Ações e melhorias',[{label:'Problema / ação'},{label:'Escopo'},{label:'Responsável'},{label:'Risco'},{label:'4M'},{label:'Prazo'},{label:'Status'},{label:metric==='usd'?'IF Cost vinculado':'QTY vinculada',number:true},{label:'Ação'}],tableRows);
  return `<section class="page-stack action-page">${pageHeader('Planos de ação e melhorias',`${button('Exportar lista','export-actions',{icon:'download'})}${button('Nova ação','new-action',{primary:true,icon:'plus'})}`)}<section class="filter-panel"><div class="filters action-filter-grid">${fields}</div></section><section class="dashboard-analysis-bar base-analysis-bar"><div><strong>Medida de impacto vinculada</strong><small>Valores resultam dos scraps associados às causas tratadas.</small></div><div class="analysis-controls"><div class="segmented-control metric-switch"><button class="${metric==='usd'?'active':''}" data-action="dashboard-metric" data-id="usd">US$</button><button class="${metric==='qty'?'active':''}" data-action="dashboard-metric" data-id="qty">QTY SCRAP</button></div>${metric==='usd'?`<button class="privacy-toggle ${masked?'active':''}" data-action="dashboard-mask">${icon(masked?'eyeOff':'eye')}<span>${masked?'Valores ocultos':'Ocultar valores'}</span></button>`:''}</div></section><section class="kpi-grid">${kpiCard('Ações abertas',formatNumber(visible.filter((item)=>!['Concluída','Validada'].includes(item.status)).length))}${kpiCard('Vencidas',formatNumber(visible.filter(actionIsOverdue).length),'Exigem replanejamento','danger')}${kpiCard('Concluídas no mês',formatNumber(visible.filter((item)=>item.status==='Concluída').length),'Aguardam ou concluíram validação','success')}${kpiCard('Aguardando eficácia',formatNumber(visible.filter((item)=>item.status==='Aguardando eficácia').length))}${kpiCard(metric==='usd'?'IF Cost vinculado':'QTY vinculada',metric==='usd'?(masked?'US$ •••••':formatCurrency(visible.reduce((sum,item)=>sum+item.ifCost,0))):formatNumber(visible.reduce((sum,item)=>sum+item.qty,0)))}</section><section class="content-grid equal action-charts"><article class="panel"><header class="panel-header"><h2>Ações por status</h2></header>${dashboardChart({kind:'donut',labels:statuses,values:statusCounts},250)}</article><article class="panel"><header class="panel-header"><h2>Atrasos por área</h2></header>${barList(lateByArea)}</article></section><article class="panel"><header class="panel-header"><div><h2>Evolução de conclusão</h2><p class="panel-description">Concluídas por mês e acumulado anual.</p></div></header>${dashboardChart({kind:'monthly',labels:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago'],actual:[2,3,4,5,6,8,9,11],previous:[1,2,3,4,5,6,7,8],actualLabel:'Acumulado 2026',previousLabel:'Referência',unit:'qty'},220)}</article><div class="view-toolbar"><div class="segmented-control"><button class="${state.actionView==='list'?'active':''}" data-action="action-view" data-id="list">Lista</button><button class="${state.actionView==='kanban'?'active':''}" data-action="action-view" data-id="kanban">Kanban</button></div><span>${visible.length} ações no recorte</span></div>${content}</section>`;
}

function renderAlerts() {
  const filters=state.alertFilters,masked=state.dashboardMasked;
  const money=(value)=>masked?'US$ •••••':formatCurrency(value);
  const visible=model.alerts.filter((alert)=>{const day=Number(alert.dateTime.slice(0,2));return (filters.period==='Últimos 30 dias'||(filters.period==='Últimos 7 dias'&&day>=6)||(filters.period==='Hoje'&&day===12))&&(filters.severity==='Todas'||alert.severity===filters.severity)&&(filters.type==='Todos'||alert.type===filters.type)&&(filters.productArea==='Todos'||alert.productArea===filters.productArea)&&(filters.scrapLine==='Todas'||alert.lineCode===filters.scrapLine)&&(filters.status==='Todos'||alert.status===filters.status)&&(filters.channel==='Todos'||alert.channel===filters.channel)});
  const types=[...new Set(model.alerts.map((alert)=>alert.type))];
  const fields=field('Período','alert-period',['Últimos 7 dias','Hoje','Últimos 30 dias'],filters.period)+field('Severidade','alert-severity',['Todas','Crítico','Alto','Médio'],filters.severity)+field('Tipo','alert-type',['Todos',...types],filters.type)+field('Produto / área','alert-product',['Todos',...productAreas],filters.productArea)+field('Linha','alert-line',['Todas',...scrapLines],filters.scrapLine)+field('Status','alert-status',['Todos','Novo','Lido','Arquivado'],filters.status)+field('Canal','alert-channel',['Todos','Plataforma','E-mail e plataforma'],filters.channel);
  const days=['06/08','07/08','08/08','09/08','10/08','11/08','12/08'];
  const daily=days.map((label)=>visible.filter((alert)=>alert.dateTime.startsWith(label.slice(0,2))).length);
  const severitySeries=['Crítico','Alto','Médio'].map((severity)=>({name:severity,values:days.map((label)=>visible.filter((alert)=>alert.dateTime.startsWith(label.slice(0,2))&&alert.severity===severity).length)}));
  const rows=visible.map((alert)=>`<tr data-row-id="${alert.id}" data-row-type="alert"><td>${alert.dateTime}</td><td>${badge(alert.severity)}</td><td><strong>${alert.type}</strong><small class="cell-stack">${alert.id}</small></td><td>${alert.productArea}<small class="cell-stack">${alert.lineCode} · ${alert.component}</small></td><td class="cell-ellipsis">${alert.description}</td><td class="number"><strong>${money(alert.impact)}</strong></td><td>${badge(alert.status)}</td><td>${alert.channel}</td><td>${button('Ver detalhe','open-alert',{small:true,primary:true,id:alert.id})}</td></tr>`).join('');
  const typesRank=[...visible.reduce((map,alert)=>map.set(alert.type,(map.get(alert.type)||0)+1),new Map())].map(([label,value])=>({label,value,display:`${value} alertas`})).sort((a,b)=>b.value-a.value);
  return `<section class="page-stack alert-page">${pageHeader('Alertas e exceções',`${button('Atualizar','refresh-alerts',{icon:'refresh'})}${button('Exportar','export-alerts',{icon:'download'})}${button('Marcar novos como lidos','read-alerts',{primary:true})}`)}<section class="filter-panel"><div class="filters alert-filter-grid">${fields}</div></section><section class="dashboard-analysis-bar base-analysis-bar"><div><strong>Privacidade dos valores</strong><small>O impacto monetário segue a mesma ocultação usada no dashboard.</small></div><div class="analysis-controls"><button class="privacy-toggle ${masked?'active':''}" data-action="dashboard-mask">${icon(masked?'eyeOff':'eye')}<span>${masked?'Valores ocultos':'Ocultar valores'}</span></button></div></section><section class="kpi-grid">${kpiCard('Novos',formatNumber(visible.filter((alert)=>alert.status==='Novo').length),'Ainda não abertos','danger')}${kpiCard('Críticos',formatNumber(visible.filter((alert)=>alert.severity==='Crítico').length),'Prioridade máxima','danger')}${kpiCard('Lidos',formatNumber(visible.filter((alert)=>alert.status==='Lido').length))}${kpiCard('Arquivados',formatNumber(visible.filter((alert)=>alert.status==='Arquivado').length))}${kpiCard('Enviados por e-mail',formatNumber(visible.filter((alert)=>alert.channel.includes('E-mail')).length))}</section><section class="content-grid equal"><article class="panel"><header class="panel-header"><div><h2>Alertas por dia</h2><p class="panel-description">Colunas empilhadas por severidade no período filtrado.</p></div></header>${dashboardChart({kind:'columns',labels:days,values:daily,series:severitySeries,stacked:true,unit:'qty'},260)}</article><article class="panel"><header class="panel-header"><h2>Alertas por tipo</h2></header>${typesRank.length?barList(typesRank):'<div class="empty-state">Nenhum alerta no recorte.</div>'}</article></section>${tablePanel('Eventos detectados',[{label:'Data / hora'},{label:'Severidade'},{label:'Tipo / ID'},{label:'Escopo'},{label:'Descrição'},{label:'Impacto',number:true},{label:'Status'},{label:'Canal'},{label:'Ação'}],rows)}</section>`;
}

function renderReports() {
  const reviewed=model.transactions.filter((row)=>row.review.status==='Justificado');
  const included=reviewed.filter((row)=>row.review.includeInReport).sort((a,b)=>a.review.reportOrder-b.review.reportOrder);
  const selectedActions=model.actions.filter((item)=>item.reportIncluded);
  const tabs=`<div class="tabs" role="tablist">${[['construir','Construir relatório'],['preview','Preview'],['versoes','Versões'],['envios','Envios']].map(([id,label])=>`<button class="tab ${state.reportTab===id?'active':''}" data-action="report-tab" data-id="${id}">${label}</button>`).join('')}</div>`;
  let content='';
  if(state.reportTab==='construir'){
    const selectors=field('Ano','report-year',['2026','2025'],'2026')+field('Mês','report-month',['Agosto','Julho','Junho'],'Agosto')+field('Snapshot / Execution ID','report-snapshot',['EXE-20260815-0051','EXE-20260812-0046','EXE-20260811-0042'],'EXE-20260815-0051')+field('Produto / área','report-product',['Todos',...productAreas],'Todos')+field('Comparação','report-compare',['MoM · mês anterior','YoY · mesmo mês de 2025','YTD · acumulado anual'],'YTD · acumulado anual')+field('Template','report-template',['Rev04 — Monthly Report'],'Rev04 — Monthly Report')+field('Idioma','report-language',['Português','English','한국어'],'Português');
    const sections=['Capa e objetivo','Task Charter','Histórico e achievement','Análise absoluta × relativa','Pareto e composição','Mapa de risco','4M','Plano de ação','Casos de melhoria','Resumo executivo'];
    const reviewRows=included.map((row,index)=>`<article><button class="report-check selected" data-action="toggle-report-review" data-id="${row.id}" aria-pressed="true">${icon('check')}</button><div><strong>${index+1}. ${row.partNumber} · ${row.component}</strong><small>${row.review.category} · ${row.review.rootCause||'causa pendente'} · ${state.dashboardMasked?'US$ •••••':formatCurrency(row.ifCost)}</small></div>${button('Ver revisão','open-report-review',{small:true,id:row.id})}</article>`).join('');
    const actionRows=selectedActions.map((item,index)=>`<article><button class="report-check selected" data-action="toggle-action-report" data-id="${item.id}" aria-pressed="true">${icon('check')}</button><div><strong>${index+1}. ${item.title}</strong><small>${item.lineCode} · ${item.owner} · ${item.status}</small></div>${button('Abrir ação','open-action',{small:true,id:item.id})}</article>`).join('');
    content=`<div class="report-build-layout"><section class="report-config-card"><header><span class="block-kicker">Fonte e recorte</span><h2>Configuração do relatório mensal</h2><p>Valores calculados vêm do snapshot selecionado; a narrativa humana vem das revisões e ações.</p></header><div class="form-grid report-selector-grid">${selectors}<div class="field full"><span class="field-label">Seções incluídas</span><div class="report-section-grid">${sections.map((section)=>`<label class="checkbox-row"><input type="checkbox" checked> ${section}</label>`).join('')}</div></div></div></section><section class="report-curation-grid"><article class="report-analysis-list"><header><div><h2>Justificativas selecionadas</h2><p>Ordenação sugerida pelo campo de curadoria da revisão.</p></div>${badge(`${included.length} incluídas`,'brand')}</header>${reviewRows||'<div class="empty-state">Nenhuma justificativa selecionada.</div>'}</article><article class="report-analysis-list"><header><div><h2>Planos de ação selecionados</h2><p>Ações marcadas para o resumo e cronograma.</p></div>${badge(`${selectedActions.length} incluídos`,'brand')}</header>${actionRows||'<div class="empty-state">Nenhuma ação selecionada.</div>'}</article></section><div class="report-next-step"><div><strong>Base para o PPTX pronta</strong><span>${included.length} casos · ${selectedActions.length} ações · template Rev04</span></div>${button('Revisar preview','report-preview',{primary:true,icon:'chevronRight'})}</div></div>`;
  }
  if(state.reportTab==='preview'){
    const missingEvidence=included.filter((row)=>!row.review.evidence.length).length;
    const missingNarrative=included.filter((row)=>!row.review.executiveHighlight).length;
    const warnings=missingEvidence+missingNarrative;
    const slides=['Capa','Task Charter','Achievement mensal','Análise absoluta','Análise relativa','Pareto de componentes','Mapa de risco','4M','Plano de ação',...included.slice(0,3).map((row)=>`Caso · ${row.component}`),'Resumo executivo'];
    content=`<div class="report-preview-layout"><aside class="slide-thumbnails"><header><strong>${slides.length} slides</strong><small>Núcleo + casos repetíveis</small></header>${slides.map((title,index)=>`<button class="slide-thumb ${index===2?'active':''}"><span>${index+1}</span><i></i><strong>${title}</strong></button>`).join('')}</aside><section class="report-preview-stage"><div class="preview-validation ${warnings?'warning':''}">${icon(warnings?'alert':'check')}<div><strong>${warnings?`${warnings} avisos de conteúdo`:'Conteúdo pronto para aprovação'}</strong><span>${missingEvidence} casos sem evidência · ${missingNarrative} sem destaque executivo. Valores calculados permanecem bloqueados.</span></div></div><article class="monthly-report-slide"><header><span>Achievement Management · Monthly Report</span><strong>MS Team — Redução IF Cost</strong></header><h2>Material Scrap Cost Y’2026</h2><div class="report-achievement-grid"><div><small>Target Jan–Ago</small><strong>${state.dashboardMasked?'US$ •••••':formatCurrency(dashboardSpreadsheetSeries.targetUsd.slice(0,8).reduce((sum,value)=>sum+value,0))}</strong></div><div><small>Resultado Jan–Ago</small><strong>${state.dashboardMasked?'US$ •••••':formatCurrency(dashboardSpreadsheetSeries.actualUsd.slice(0,8).reduce((sum,value)=>sum+value,0))}</strong></div><div><small>Vs. PY</small><strong class="positive">↓8%</strong></div></div>${dashboardChart({kind:'monthly',labels:dashboardSpreadsheetSeries.months,actual:dashboardSpreadsheetSeries.actualUsd,previous:dashboardSpreadsheetSeries.previousUsd,target:dashboardSpreadsheetSeries.targetUsd,actualLabel:'2026',previousLabel:'2025',unit:'usd',masked:state.dashboardMasked},260)}<div class="report-summary-columns"><section><h3>Core Issues</h3>${included.slice(0,3).map((row)=>`<strong>${row.review.title||row.defect}</strong><p>${row.review.rootCause||row.review.reason}</p>`).join('')||'<p>Sem casos selecionados.</p>'}</section><section><h3>Main Improvements</h3>${selectedActions.slice(0,4).map((item)=>`<p>— ${item.title}</p>`).join('')||'<p>Sem ações selecionadas.</p>'}</section></div></article><div class="inline-actions report-actions">${button('Voltar à construção','report-build')}${button('Enviar para aprovação','report-approve',{primary:true,icon:'check'})}${button('Gerar PPTX simulado','generate-pptx',{icon:'report'})}</div></section></div>`;
  }
  if(state.reportTab==='versoes'){
    const rows=model.reports.map((report)=>`<tr data-row-id="${report.id}" data-row-type="report"><td><strong>${report.id}</strong><small class="cell-stack">${report.version}</small></td><td>${report.period}</td><td>${report.snapshot||'EXE-20260811-0042'}</td><td>${report.author}</td><td>${report.approver||'—'}</td><td>${report.generatedAt}</td><td class="number">${report.slides||12}</td><td>${report.format==='PDF'?'PPTX':report.format}</td><td>${badge(report.status)}</td></tr>`).join('');
    content=tablePanel('Histórico de versões',[{label:'ID / versão'},{label:'Período'},{label:'Snapshot'},{label:'Autor'},{label:'Aprovador'},{label:'Criado em'},{label:'Slides',number:true},{label:'Formato'},{label:'Status'}],rows);
  }
  if(state.reportTab==='envios'){
    const activeRecipients=model.recipients.filter((recipient)=>recipient.status==='Ativo'&&recipient.consent==='Aceito');
    const sendRows=model.sends.map((send,index)=>`<tr><td><strong>${send.report}</strong></td><td>${send.recipient}</td><td>${send.channel}</td><td>${send.requestedAt}</td><td>${badge(send.status)}</td><td class="number">${send.attempts}</td><td>${send.status==='Falha'?button('Reenviar','resend-report',{small:true,id:String(index)}):send.status==='Pendente'?button('Simular envio','send-report',{small:true,id:String(index)}):'—'}</td></tr>`).join('');
    content=`<section class="report-send-panel"><article class="settings-card"><h2>Novo envio</h2><p>Somente destinatários ativos e com consentimento aceito aparecem para seleção.</p><div class="form-grid">${field('Versão aprovada','send-report-version',model.reports.map((report)=>report.id),model.reports[0]?.id)}${field('Destinatário','send-recipient',activeRecipients.map((recipient)=>`${recipient.name} · ${recipient.email}`),activeRecipients[0]?`${activeRecipients[0].name} · ${activeRecipients[0].email}`:'')}</div><div class="inline-actions" style="margin-top:1rem">${button('Registrar envio simulado','register-report-send',{primary:true,icon:'mail'})}</div></article>${tablePanel('Histórico de envios',[{label:'Relatório'},{label:'Destinatário'},{label:'Canal'},{label:'Solicitado em'},{label:'Status'},{label:'Tentativas',number:true},{label:'Ação'}],sendRows)}</section>`;
  }
  return `<section class="page-stack reports-page">${pageHeader('Relatórios mensais',`${button('Exportar histórico','export-reports',{icon:'download'})}${button('Novo relatório','new-report',{icon:'plus',primary:true})}`)}${tabs}${content}</section>`;
}

function renderExecutions() {
  const filters=state.executionFilters;
  const visible=model.executions.filter((item)=>(state.executionStatus==='Todos'||item.status===state.executionStatus)&&(filters.source==='Todas'||item.source===filters.source)&&(filters.trigger==='Todos'||item.trigger===filters.trigger));
  const lastCompleted=model.executions.find((item)=>item.status==='Concluído')||model.executions[0];
  const rows=visible.map((item)=>`<tr data-row-id="${item.id}" data-row-type="execution"><td><strong>${item.id}</strong><small class="cell-stack">${item.process}</small></td><td>${item.source}</td><td>${item.trigger||'Agendada'}</td><td>${item.start}</td><td>${item.end}</td><td>${item.duration}</td><td class="number">${formatNumber(item.received)}</td><td class="number">${formatNumber(item.valid)}</td><td class="number">${formatNumber(item.rejected)}</td><td>${badge(item.snapshotPublished||'Publicado')}</td><td>${badge(item.status)}</td><td>${item.actor||'hanaro-scheduler'}</td></tr>`).join('');
  const fields=field('Período','exec-period',['Hoje','Últimos 7 dias','Últimos 30 dias'],filters.period)+field('Status','exec-status',['Todos','Concluído','Parcial','Falha','Em andamento','Agendada'],state.executionStatus)+field('Origem','exec-source',['Todas','GERP','Contingência operacional'],filters.source)+field('Gatilho','exec-trigger',['Todos','Agendada','Manual'],filters.trigger);
  const failures=[{label:'Câmbio indisponível',value:12,display:'12 ocorrências'},{label:'Arquivo inválido',value:7,display:'7 ocorrências'},{label:'Duplicidade',value:5,display:'5 ocorrências'},{label:'Schema divergente',value:3,display:'3 ocorrências'}];
  return `<section class="page-stack executions-page">${pageHeader('Execuções e atualização',`${button('Atualizar lista','refresh-executions',{icon:'refresh'})}${button('Executar agora','manual-execution',{primary:true,icon:'play'})}`)}<section class="execution-cadence"><article><span>Fonte</span><strong>GERP</strong><small>Atualização aproximada a cada 5 minutos</small></article>${icon('chevronRight')}<article><span>Rotina Hanaro</span><strong>A cada 2 horas</strong><small>Consolida scrap, tabelas e relatórios</small></article>${icon('chevronRight')}<article><span>Última publicação</span><strong>${lastCompleted.id}</strong><small>${lastCompleted.end} · próxima às 12:00</small></article></section><section class="filter-panel"><div class="filters execution-filter-grid">${fields}<div class="field"><label>Execution ID</label><input class="control" placeholder="EXE-..."></div></div></section><section class="kpi-grid">${kpiCard('Execuções hoje',formatNumber(model.executions.length))}${kpiCard('Última duração',lastCompleted.duration,lastCompleted.id)}${kpiCard('Registros recebidos',formatNumber(visible.reduce((sum,item)=>sum+item.received,0)))}${kpiCard('Válidos',formatNumber(visible.reduce((sum,item)=>sum+item.valid,0)),'Após validações','success')}${kpiCard('Falhas / parciais',formatNumber(visible.filter((item)=>['Falha','Parcial'].includes(item.status)).length),'Reprocessamento disponível quando aplicável','danger')}</section>${tablePanel('Histórico de rotinas',[{label:'Execution ID / processo'},{label:'Origem'},{label:'Gatilho'},{label:'Início'},{label:'Fim'},{label:'Duração'},{label:'Recebidos',number:true},{label:'Válidos',number:true},{label:'Rejeitados',number:true},{label:'Snapshot'},{label:'Status'},{label:'Ator'}],rows)}<article class="panel"><header class="panel-header"><div><h2>Falhas por categoria — últimos 30 dias</h2><p class="panel-description">A contingência somente é liberada depois de uma tentativa de reprocessamento sem sucesso.</p></div></header>${dashboardChart({kind:'horizontal',labels:failures.map((item)=>item.label),values:failures.map((item)=>item.value),unit:'qty'},250)}</article><p class="prototype-note">No protótipo, “Executar agora” apenas simula a rotina e não realiza chamada ao GERP.</p></section>`;
}

function renderAudit() {
  const q=state.auditSearch.toLowerCase(),filters=state.auditFilters;
  const actors=[...new Set(model.audit.map((event)=>event.actor))];
  const entities=[...new Set(model.audit.map((event)=>event.entity).concat(['Component','Action','Target']))];
  const events=model.audit.filter((event)=>(state.auditEntity==='Todas'||event.entity===state.auditEntity)&&(filters.actor==='Todos'||event.actor===filters.actor)&&(filters.origin==='Todos'||event.origin===filters.origin)&&(filters.severity==='Todas'||event.severity===filters.severity)&&(!q||Object.values(event).some((value)=>String(value).toLowerCase().includes(q))));
  const rows=events.map((event)=>`<tr data-row-id="${event.id}" data-row-type="audit"><td>${event.timestamp}</td><td>${event.actor}</td><td>${event.origin}</td><td><strong>${event.action}</strong></td><td>${event.entity}</td><td>${event.identifier}</td><td>${event.before}</td><td>${badge(event.after)}</td><td>${event.correlation}</td><td>${badge(event.severity)}</td></tr>`).join('');
  const fields=field('Período','audit-period',['Hoje','Últimos 7 dias'],filters.period)+field('Ator','audit-actor',['Todos',...actors],filters.actor)+field('Origem','audit-origin',['Todos','Web','API'],filters.origin)+field('Entidade','audit-entity',['Todas',...entities],state.auditEntity)+field('Severidade','audit-severity',['Todas','Informativo','Crítico'],filters.severity);
  return `<section class="page-stack audit-page">${pageHeader('Auditoria',button('Exportar eventos','export-audit',{icon:'download'}))}<section class="filter-panel"><div class="search-wrap">${icon('search')}<input class="search-control" id="audit-search" value="${state.auditSearch}" placeholder="Buscar ação, ID, ator, entidade ou Correlation ID..."></div><div class="filters audit-filter-grid" style="margin-top:.8rem">${fields}</div></section><section class="kpi-grid">${kpiCard('Eventos no recorte',formatNumber(events.length))}${kpiCard('Ações humanas',formatNumber(events.filter((event)=>event.origin==='Web').length))}${kpiCard('Eventos automáticos',formatNumber(events.filter((event)=>event.origin==='API').length))}${kpiCard('Eventos críticos',formatNumber(events.filter((event)=>event.severity==='Crítico').length),'Exigem investigação','danger')}</section>${tablePanel('Eventos imutáveis',[{label:'Timestamp'},{label:'Ator'},{label:'Origem'},{label:'Ação'},{label:'Entidade'},{label:'Identificador'},{label:'Antes'},{label:'Depois'},{label:'Correlation ID'},{label:'Severidade'}],rows)}<p class="prototype-note">Os eventos de auditoria são imutáveis no protótipo e não podem ser excluídos.</p></section>`;
}

function renderSettings() {
  const tabLabels=[['negocio','Targets anuais'],['dados','Dados e fórmulas'],['rotina','Rotina'],['linhas','Linhas e mapa'],['emails','E-mails'],['notificacoes','Notificações'],['integracoes','Integrações'],['interface','Interface']];
  const tabs=`<div class="tabs settings-tabs">${tabLabels.map(([id,label])=>`<button class="tab ${state.settingsTab===id?'active':''}" data-action="settings-tab" data-id="${id}">${label}</button>`).join('')}</div>`;
  let content='';
  if(state.settingsTab==='negocio'){
    const months=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const actual=dashboardSpreadsheetSeries.actualUsd;
    const rows=months.map((month,index)=>`<tr><td><strong>${month}/2026</strong></td><td class="number">${formatCurrency(model.settings.monthlyTargets[index])}</td><td class="number">${actual[index]===null?'—':formatCurrency(actual[index])}</td><td class="number">${actual[index]===null?'—':`${(model.settings.monthlyTargets[index]/actual[index]*100).toLocaleString('pt-BR',{maximumFractionDigits:1})}%`}</td><td>${actual[index]===null?badge('Futuro','info'):badge('Fechado')}</td><td>${button('Editar target','edit-month-target',{small:true,id:String(index)})}</td></tr>`).join('');
    content=`<section class="settings-target-header"><div><span class="block-kicker">Ciclo anual</span><h2>Targets mensais de Material Scrap</h2><p>Planejamento fixado no início do ano, com versão e histórico de alterações.</p></div><div class="inline-actions">${field('Ano','target-year',['2026','2025'],'2026')}${button('Copiar ano anterior','copy-target-year')}${button('Criar novo ano','new-target-year',{primary:true,icon:'plus'})}</div></section><section class="kpi-grid">${kpiCard('Status',model.settings.targetStatus,model.settings.targetVersion,'success')}${kpiCard('Baseline',String(model.settings.baseline),'Ano de referência')}${kpiCard('Redução planejada',`${Math.abs(model.settings.target)}%`,'Objetivo anual')}${kpiCard('Target anual',formatCurrency(model.settings.monthlyTargets.reduce((sum,value)=>sum+value,0)),'Soma dos 12 meses')}</section>${tablePanel('Grade mensal — escopo Total',[{label:'Mês'},{label:'Target US$',number:true},{label:'Resultado',number:true},{label:'Achievement',number:true},{label:'Estado'},{label:'Ação'}],rows)}<article class="settings-card"><h2>Histórico de versões</h2><div class="version-timeline"><span><strong>v1.0</strong> Planejamento inicial · 05/01/2026</span><span><strong>v1.1</strong> Ajuste de escopo normalizado · 18/01/2026</span><span><strong>v1.2</strong> Publicado · 25/01/2026</span></div></article>`;
  }
  if(state.settingsTab==='dados'){
    const coverage=model.transactions.filter((row)=>row.exchangeRate).length/model.transactions.length*100;
    content=`<section class="settings-layout"><article class="settings-card formula-card"><span class="block-kicker">Fórmula confirmada</span><h2>QTY SCRAP</h2><code>QTY_SCRAP = |Issue Quantity|</code><p>O sinal original permanece no registro; o módulo é usado nos gráficos e rankings quantitativos.</p></article><article class="settings-card formula-card"><span class="block-kicker">Fórmula confirmada</span><h2>IF Cost em dólar</h2><code>IF_COST_USD = (Issue Price × QTY_SCRAP) ÷ Exchange Rate</code><p>Preço e quantidade formam o valor de emissão, convertido pela taxa aplicável.</p></article><article class="settings-card formula-card pending"><span class="block-kicker">Mock ativo · fonte real pendente</span><h2>Análise relativa</h2><code>Scrap Rate = Σ QTY_SCRAP ÷ Σ Production Quantity × 100</code><code>IF Cost relativo = Σ IF_COST_USD ÷ Σ Material Amount × 100</code><p>MOCK-DENOM-v1.0 alimenta o protótipo por mês, produto e linha; os números ainda não são resultados industriais homologados.</p></article></section><section class="content-grid equal"><article class="panel"><header class="panel-header"><h2>Cobertura de dados</h2></header>${barList([{label:'Câmbio localizado',value:coverage,display:`${coverage.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`},{label:'Produto / área',value:100,display:'100%'},{label:'Linha / posto',value:100,display:'100%'},{label:'Denominador relativo (mock)',value:100,display:'100% · simulado'},{label:'Denominador homologado',value:0.1,display:'0% · pendente'}])}</article><article class="panel"><header class="panel-header"><h2>Regras de normalização</h2></header><dl class="detail-list"><div><dt>Linhas</dt><dd>A05/a05 → A05</dd></div><div><dt>Valores vazios</dt><dd>Não informado</dd></div><div><dt>Componente</dt><dd>Catálogo + aliases preservados</dd></div><div><dt>Estorno</dt><dd>Pendente de homologação</dd></div><div><dt>Versão</dt><dd>DATA-RULES-v0.4</dd></div><div><dt>Atualizada em</dt><dd>15/08/2026</dd></div></dl></article></section>`;
  }
  if(state.settingsTab==='rotina')content=`<section class="execution-cadence"><article><span>GERP</span><strong>≈ 5 minutos</strong><small>Cadência informada da fonte</small></article>${icon('chevronRight')}<article><span>Hanaro</span><strong>A cada 2 horas</strong><small>Fuso America/Manaus</small></article>${icon('chevronRight')}<article><span>Agenda</span><strong>Próxima às 12:00</strong><small>Última concluída às 10:00</small></article></section><section class="settings-layout"><article class="settings-card"><h2>Política de execução</h2><dl class="detail-list"><div><dt>Frequência</dt><dd>2 horas</dd></div><div><dt>Concorrência</dt><dd>Uma rotina ativa por vez</dd></div><div><dt>Reprocessamento</dt><dd>Permitido após falha/parcial</dd></div><div><dt>Snapshot</dt><dd>Publicado após validação</dd></div></dl><div class="inline-actions" style="margin-top:1rem">${button('Ver execuções','go-executions')}${button('Executar agora','manual-execution',{primary:true,icon:'play'})}</div></article><article class="settings-card"><h2>Frescor atual</h2><p>Última atualização do dashboard: ${state.dashboardUpdatedAt}</p><div class="setting-row"><div><strong>Rotina de scrap</strong><p>EXE-20260815-0051</p></div>${badge('Concluído')}</div><div class="setting-row"><div><strong>Próxima janela</strong><p>15/08/2026 12:00</p></div>${badge('Agendada','info')}</div></article></section>`;
  if(state.settingsTab==='linhas'){
    const layouts=[['LAY-A01-v2','A01','01/01/2026','Ativo'],['LAY-A02-v2','A02','01/01/2026','Ativo'],['LAY-A04-v1','A04','01/03/2026','Ativo'],['LAY-A05-v2','A05','01/01/2026','Ativo'],['LAY-C02-v1','C02','01/06/2026','Em validação']];
    const rows=layouts.map((layout)=>`<tr><td><strong>${layout[0]}</strong></td><td>${layout[1]}</td><td>${model.transactions.filter((row)=>row.scrapLine===layout[1]).length} ocorrências</td><td>11 postos</td><td>${layout[2]}</td><td>${badge(layout[3])}</td><td>${button('Configurar mapa','configure-line-map',{small:true,id:layout[1]})}</td></tr>`).join('');
    content=`<section class="settings-target-header"><div><h2>Linhas e mapas de risco</h2><p>Layouts versionados preservam a leitura histórica de setor e posto.</p></div>${button('Novo layout','new-line-layout',{primary:true,icon:'plus'})}</section>${tablePanel('Layouts vigentes',[{label:'Layout ID'},{label:'Linha'},{label:'Ocorrências'},{label:'Postos'},{label:'Vigência'},{label:'Status'},{label:'Ação'}],rows)}<article class="settings-card"><h2>Faixas do heatmap</h2><div class="risk-legend"><span class="low">Baixo risco</span><span class="moderate">Risco moderado</span><span class="critical">Risco crítico</span></div><p>Os limites e coordenadas são versionados por layout. A imagem real da linha continua como ativo de referência do projeto.</p></article>`;
  }
  if(state.settingsTab==='emails'){
    const rows=model.recipients.map((recipient)=>`<tr><td><strong>${recipient.name}</strong><small class="cell-stack">${recipient.id}</small></td><td>${recipient.email}</td><td>${recipient.group}</td><td>${recipient.scope}</td><td>${recipient.categories}</td><td>${badge(recipient.consent)}</td><td>${badge(recipient.status)}</td><td>${button('Editar','edit-recipient',{small:true,id:recipient.id})}</td></tr>`).join('');
    content=`<section class="settings-target-header"><div><h2>Destinatários de e-mail</h2><p>Cadastro com consentimento e exclusão lógica para preservar o histórico de envios.</p></div>${button('Novo destinatário','new-recipient',{primary:true,icon:'plus'})}</section>${tablePanel('CRUD de destinatários',[{label:'Nome / ID'},{label:'E-mail'},{label:'Grupo'},{label:'Escopo'},{label:'Categorias'},{label:'Consentimento'},{label:'Status'},{label:'Ação'}],rows)}`;
  }
  if(state.settingsTab==='notificacoes')content=`<section class="settings-layout">${[['Spike de IF Cost / QTY','Crítico','E-mail e plataforma','Ativo'],['Concentração por componente','Alto','Plataforma','Ativo'],['Ação vencida','Alto','E-mail e plataforma','Ativo'],['Falha de execução','Crítico','E-mail e plataforma','Ativo'],['Ausência de mapeamento','Médio','Plataforma','Pausado']].map(([name,severity,channel,status])=>`<article class="settings-card"><div class="setting-row" style="border:0;padding:0"><div><strong>${name}</strong><p>${severity} · ${channel}</p></div>${badge(status)}</div><label class="checkbox-row"><input type="checkbox" ${status==='Ativo'?'checked':''}> Regra habilitada</label></article>`).join('')}</section>`;
  if(state.settingsTab==='integracoes')content=`<div class="settings-layout">${[['GERP','Operacional','15/08 10:00','1,2 s'],['Câmbio','Operacional','15/08 10:01','420 ms'],['Banco','Operacional','15/08 10:02','28 ms'],['E-mail','Operacional','15/08 09:58','610 ms'],['Gerador PPTX','Simulado','15/08 09:54','—']].map(([name,status,date,latency])=>`<article class="settings-card"><div class="setting-row" style="border:0;padding:0"><div><h2>${name}</h2><p>Última comunicação: ${date} · latência ${latency}</p></div>${badge(status)}</div><small class="panel-description">Nenhum segredo ou credencial é exposto no protótipo.</small></article>`).join('')}</div>`;
  if(state.settingsTab==='interface')content=`<div class="interface-settings-grid"><article class="settings-card"><h2>Tema</h2><p>Escolha a aparência da interface.</p><div class="theme-options">${[['light','Claro'],['dark','Escuro'],['system','Sistema']].map(([id,label])=>`<button class="theme-card ${document.documentElement.dataset.themePreference===id?'selected':''}" data-action="set-theme" data-id="${id}" data-theme-choice="${id}"><span class="theme-swatch"><i></i><i></i></span><strong>${label}</strong></button>`).join('')}</div></article><article class="settings-card"><h2>Idioma</h2><p>Idioma exibido na interface do sistema.</p><label class="language-select settings-language-select"><span class="language-select-icon">${icon('language')}</span><select id="settings-language"><option value="pt-BR" ${state.locale==='pt-BR'?'selected':''}>Português</option><option value="en" ${state.locale==='en'?'selected':''}>English</option><option value="ko" ${state.locale==='ko'?'selected':''}>한국어</option></select></label></article></div>`;
  return `<section class="page-stack settings-page">${pageHeader('Configurações',button('Salvar alterações','save-settings',{primary:true,icon:'check'}))}${tabs}${content}</section>`;
}

const renderers={dashboard:renderDashboard,scrap:renderScrap,componentes:renderComponents,acoes:renderActions,alertas:renderAlerts,relatorios:renderReports,execucoes:renderExecutions,auditoria:renderAudit,configuracoes:renderSettings};
function renderPage({preserveScroll=false}={}){const canvas=$('#main-canvas'),previousScroll=canvas?.scrollTop||0;state.route=renderers[state.route]?state.route:'dashboard';pendingCharts=[];renderShell();$('#page-content').innerHTML=renderers[state.route]();applyI18n(document);initCharts();const nextScroll=Number.isFinite(state.pendingScrollTop)?state.pendingScrollTop:preserveScroll?previousScroll:0;state.pendingScrollTop=null;$('#main-canvas').scrollTop=nextScroll;}
function navigateTo(route){location.hash=route;if(location.hash===`#${route}`){state.route=route;renderPage();}closeOverlay();closeMobileSidebar();}

function showToast(message,type='success'){
  const el=document.createElement('div');el.className=`toast ${type}`;el.innerHTML=`${icon(type==='error'?'alert':'check')}<div><strong>${type==='error'?'Ação não concluída':'Tudo certo'}</strong><div>${message}</div></div>`;$('#toast-region').append(el);applyI18n(el);setTimeout(()=>el.remove(),3500);
}
function openOverlay(html){const layer=$('#overlay-layer');layer.innerHTML=html;layer.style.display='flex';applyI18n(layer);const focusable=$('button,input,select,textarea',layer);focusable?.focus();}
function closeOverlay(){const layer=$('#overlay-layer');layer.innerHTML='';layer.style.display='';}
function modal(title,body,footer=''){return `<section class="modal" role="dialog" aria-modal="true" aria-label="${title}"><header class="modal-header"><h2>${title}</h2><button class="close-button" data-action="close-overlay" aria-label="Fechar">${icon('x')}</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section>`;}
function drawer(title,body,footer=''){return `<aside class="drawer" role="dialog" aria-modal="true" aria-label="${title}"><header class="drawer-header"><h2>${title}</h2><button class="close-button" data-action="close-overlay" aria-label="Fechar">${icon('x')}</button></header><div class="drawer-body">${body}</div>${footer?`<footer class="drawer-footer">${footer}</footer>`:''}</aside>`;}
function relatedScrapList(rows,{limit=5,empty='Nenhum scrap relacionado neste recorte.'}={}){
  if(!rows.length)return `<div class="related-empty">${empty}</div>`;
  const money=(value)=>state.dashboardMasked?'US$ •••••':formatCurrency(value);
  return `<div class="related-record-list">${rows.slice(0,limit).map((row)=>`<article><div><strong>${row.partNumber} · ${row.component}</strong><small>${row.id} · ${row.productArea} · ${row.scrapLine}/${row.stationCode}</small></div><span><b>${formatNumber(row.qty)} un.</b><small>${money(row.ifCost)}</small></span></article>`).join('')}${rows.length>limit?`<p>+ ${rows.length-limit} registros permanecem associados ao contexto.</p>`:''}</div>`;
}
function openReportReview(id){
  const row=model.transactions.find((item)=>item.id===id);if(!row)return;
  const review=row.review,money=state.dashboardMasked?'US$ •••••':formatCurrency(row.ifCost);
  const body=`<div class="inline-actions">${badge(review.status)}${badge(review.category||'Sem categoria')}${badge(review.risk)}</div><section class="detail-section"><h3>Ocorrência selecionada para o relatório</h3><dl class="detail-list"><div><dt>Registro</dt><dd>${row.id}</dd></div><div><dt>Part Number / componente</dt><dd>${row.partNumber} · ${row.component}</dd></div><div><dt>Produto / linha</dt><dd>${row.productArea} · ${row.scrapLine}/${row.stationCode}</dd></div><div><dt>QTY SCRAP</dt><dd>${formatNumber(row.qty)} un.</dd></div><div><dt>IF Cost</dt><dd>${money}</dd></div></dl></section><section class="detail-section"><h3>Justificativa e causa</h3><dl class="detail-list"><div><dt>Problema</dt><dd>${review.title||row.defect}</dd></div><div><dt>Justificativa</dt><dd>${review.reason||'Não informada'}</dd></div><div><dt>Causa raiz</dt><dd>${review.rootCause||'Não informada'}</dd></div><div><dt>Classificação 4M</dt><dd>${review.classification4m.join(', ')||'Não informada'}</dd></div></dl></section><section class="detail-section"><h3>Ação e narrativa</h3><dl class="detail-list"><div><dt>Ação corretiva</dt><dd>${review.corrective||'Não informada'}</dd></div><div><dt>Ação preventiva</dt><dd>${review.preventive||'Não informada'}</dd></div><div><dt>Destaque executivo</dt><dd>${review.executiveHighlight||'Pendente'}</dd></div><div><dt>Evidências</dt><dd>${review.evidence.length}</dd></div></dl></section>`;
  openOverlay(drawer(`Revisão · ${row.partNumber}`,body,button('Fechar','close-overlay',{primary:true})));
}

function openTransaction(id) {
  const t=model.transactions.find((item)=>item.id===id);if(!t)return;
  const money=(value)=>state.dashboardMasked?'US$ •••••':formatCurrency(value);
  const issueValue=t.exchangeRate?money(t.issuePrice):'—';
  const reviewDetail=t.review.status==='Justificado'?`<section class="detail-section"><h3>Revisão e ação</h3><dl class="detail-list"><div><dt>Categoria / risco</dt><dd>${t.review.category} · ${t.review.risk}</dd></div><div><dt>Justificativa</dt><dd>${t.review.reason}</dd></div><div><dt>Causa raiz</dt><dd>${t.review.rootCause||'Não informada'}</dd></div><div><dt>Responsável</dt><dd>${t.review.responsible} · ${t.review.responsibleDepartment}</dd></div><div><dt>Plano vinculado</dt><dd>${t.review.actionPlanId||'Ainda não vinculado'}</dd></div><div><dt>Relatório</dt><dd>${t.review.includeInReport?'Selecionado para inclusão':'Não incluído'}</dd></div></dl></section>`:'';
  const body=`<div class="inline-actions">${badge(t.movementType)}${badge(t.processingStatus)}${badge(t.review.status)}</div><section class="detail-section"><h3>Contexto industrial</h3><dl class="detail-list"><div><dt>Produto / modelo</dt><dd>${t.productArea} · ${t.modelCode}</dd></div><div><dt>Linha</dt><dd>${t.scrapLine}</dd></div><div><dt>Setor / posto</dt><dd>${t.sector} · ${t.stationCode}</dd></div><div><dt>Componente</dt><dd>${t.component}</dd></div><div><dt>Defeito observado</dt><dd>${t.defect}</dd></div><div><dt>Ocorrência</dt><dd>${t.occurrence}</dd></div></dl></section><section class="detail-section"><h3>Registro e fórmulas</h3><dl class="detail-list"><div><dt>Part Number</dt><dd>${t.partNumber}</dd></div><div><dt>Descrição</dt><dd>${t.itemDescription}</dd></div><div><dt>Issue Quantity recebido</dt><dd>${formatNumber(t.issueQuantitySigned)}</dd></div><div><dt>QTY SCRAP</dt><dd>|${formatNumber(t.issueQuantitySigned)}| = ${formatNumber(t.qty)} un.</dd></div><div><dt>Preço de emissão</dt><dd>${issueValue}</dd></div><div><dt>Valor de emissão</dt><dd>${money(t.issueAmount)}</dd></div><div><dt>Câmbio</dt><dd>${t.exchangeRate?t.exchangeRate.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:3}):'Não localizado'}</dd></div><div><dt>IF Cost</dt><dd><strong>${t.ifCost?money(t.ifCost):'—'}</strong></dd></div><div><dt>Conta / alias</dt><dd>${t.account} · ${t.accountAlias}</dd></div></dl><p class="formula-note"><strong>Conversão aplicada</strong><span>IF Cost = (preço de emissão × QTY SCRAP) ÷ taxa de câmbio.</span></p></section>${reviewDetail}<section class="detail-section"><h3>Rastreabilidade automática</h3><dl class="detail-list"><div><dt>Origem</dt><dd>${t.source}</dd></div><div><dt>Batch</dt><dd>${t.batch}</dd></div><div><dt>Execution ID</dt><dd>${t.executionId}</dd></div><div><dt>Processado em</dt><dd>${t.processedAt}</dd></div></dl></section>`;
  openOverlay(drawer(t.id,body,`${button('Filtrar por este Part Number','transaction-explore',{id:t.id})}${button(t.review.status==='Justificado'?'Ver revisão':'Revisar registro','review-one',{id:t.id,primary:true})}`));
}
function openComponent(id){
  const item=model.components.find((component)=>component.id===id);if(!item)return;
  const related=model.transactions.filter((row)=>row.partNumber===item.itemCode),qty=related.reduce((sum,row)=>sum+row.qty,0),cost=related.reduce((sum,row)=>sum+row.ifCost,0);
  const body=`<div class="inline-actions">${badge(item.status)}${badge(item.productArea)}${badge(item.division)}</div><section class="detail-section"><h3>Identidade normalizada</h3><dl class="detail-list"><div><dt>Component ID</dt><dd>${item.id}</dd></div><div><dt>Código original</dt><dd>${item.itemCode}</dd></div><div><dt>Nome normalizado</dt><dd>${item.normalizedName}</dd></div><div><dt>Componente</dt><dd>${item.component}</dd></div><div><dt>Tipo</dt><dd>${item.itemType}</dd></div><div><dt>Origem</dt><dd>${item.source}</dd></div></dl></section><section class="detail-section"><h3>Aliases preservados</h3><div class="alias-list">${item.aliases.map((alias)=>`<span>${alias}</span>`).join('')}</div><p class="panel-description">Consolidar cria um vínculo normalizado; os valores recebidos permanecem rastreáveis.</p></section><section class="detail-section"><h3>Ocorrências relacionadas</h3><dl class="detail-list"><div><dt>Registros</dt><dd>${formatNumber(related.length)}</dd></div><div><dt>QTY SCRAP</dt><dd>${formatNumber(qty)} un.</dd></div><div><dt>IF Cost</dt><dd>${state.dashboardMasked?'US$ •••••':formatCurrency(cost)}</dd></div><div><dt>Última ocorrência</dt><dd>${item.lastOccurrence}</dd></div></dl>${relatedScrapList(related)}</section><section class="detail-section"><h3>Histórico</h3><ol class="timeline"><li>Código recebido do GERP<small>Origem preservada</small></li><li>Descrição normalizada<small>${item.updatedAt}</small></li><li>Status atual: ${item.status}<small>Versão vigente</small></li></ol></section>`;
  openOverlay(drawer(`${item.itemCode} · ${item.normalizedName}`,body,button('Consolidar alias','consolidate-alias',{id:item.id,primary:true})));
}
function openAction(id){
  const item=model.actions.find((action)=>action.id===id);if(!item)return;
  const impact=state.dashboardMetric==='usd'?(state.dashboardMasked?'US$ •••••':formatCurrency(item.ifCost)):`${formatNumber(item.qty)} un.`;
  const related=model.transactions.filter((row)=>item.transactionIds.includes(row.id));
  const body=`<div class="inline-actions">${badge(item.status)}${badge(item.risk)}${badge(item.category4m)}</div><section class="detail-section"><h3>Escopo e problema</h3><p>${item.description}</p><dl class="detail-list"><div><dt>Produto / área</dt><dd>${item.productArea}</dd></div><div><dt>Linha / posto</dt><dd>${item.lineCode} · ${item.stationCode}</dd></div><div><dt>Responsável</dt><dd>${item.owner} · ${item.ownerArea}</dd></div><div><dt>Prazo</dt><dd class="${actionIsOverdue(item)?'negative':''}">${item.dueDate}${actionIsOverdue(item)?' · vencida':''}</dd></div></dl></section><section class="detail-section"><h3>Progresso e eficácia</h3><div class="action-progress"><i><b style="width:${item.progress}%"></b></i><strong>${item.progress}%</strong></div><dl class="detail-list"><div><dt>Impacto vinculado</dt><dd>${impact}</dd></div><div><dt>Scraps vinculados</dt><dd>${item.transactionIds.length}</dd></div><div><dt>Evidências</dt><dd>${item.evidenceCount}</dd></div><div><dt>Relatório</dt><dd>${item.reportIncluded?'Selecionada':'Não selecionada'}</dd></div></dl></section><section class="detail-section"><h3>Scraps vinculados</h3>${relatedScrapList(related,{empty:'Esta ação ainda não possui scraps vinculados.'})}</section>`;
  openOverlay(drawer(`${item.id} · ${item.title}`,body,`${button(item.reportIncluded?'Remover do relatório':'Adicionar ao relatório','toggle-action-report',{id:item.id})}${button('Avançar status','advance-action',{id:item.id,primary:true})}`));
}
function openAlert(id){
  const a=model.alerts.find((item)=>item.id===id);if(!a)return;
  const before=a.status;if(a.status==='Novo'){a.status='Lido';addAudit('Visualizou alerta','Alert',a.id,before,'Lido');renderPage({preserveScroll:true});}
  const impact=state.dashboardMasked?'US$ •••••':formatCurrency(a.impact);
  const related=model.transactions.filter((row)=>a.transactionIds.includes(row.id));
  const execution=model.executions.find((item)=>item.id===a.executionId);
  const executionSummary=execution?`<section class="detail-section"><h3>Execução de origem</h3><dl class="detail-list"><div><dt>Execution ID</dt><dd>${execution.id}</dd></div><div><dt>Processo</dt><dd>${execution.process}</dd></div><div><dt>Status</dt><dd>${execution.status}</dd></div><div><dt>Registros recebidos</dt><dd>${formatNumber(execution.received)}</dd></div></dl></section>`:'';
  const body=`<div class="inline-actions">${badge(a.severity)}${badge(a.status)}${badge(a.channel)}</div><section class="detail-section"><h3>Condição detectada</h3><p>${a.description}</p><dl class="detail-list"><div><dt>Alert ID</dt><dd>${a.id}</dd></div><div><dt>Produto / área</dt><dd>${a.productArea}</dd></div><div><dt>Linha</dt><dd>${a.lineCode}</dd></div><div><dt>Componente</dt><dd>${a.component}</dd></div><div><dt>Part Number</dt><dd>${a.partNumber}</dd></div><div><dt>Impacto estimado</dt><dd>${impact}</dd></div></dl></section><section class="detail-section"><h3>Registros relacionados</h3>${relatedScrapList(related,{empty:'Nenhum registro transacional disponível para este alerta.'})}</section>${executionSummary}<section class="detail-section"><h3>Histórico</h3><ol class="timeline"><li>Condição detectada<small>${a.dateTime}</small></li><li>Notificação enviada<small>${a.channel}</small></li><li>${a.status}<small>Estado atual</small></li></ol></section>`;
  openOverlay(drawer(a.type,body,`${button('Arquivar alerta','archive-alert',{id:a.id})}${button('Investigar na Base','alert-transactions',{id:a.id,primary:true})}`));
}
function openExecution(id){
  const e=model.executions.find(x=>x.id===id);if(!e)return;
  const steps=['Request automático iniciado','Arquivo localizado no GERP','Arquivo recebido','Validação estrutural','Normalização','Conversão','Persistência','Processamento concluído'];
  const failed=e.status==='Falha'||e.status==='Parcial';
  const related=model.transactions.filter((row)=>row.executionId===e.id);
  const footer=`${button('Consultar correlação na Auditoria','execution-audit',{id:e.id})}${failed?button('Reprocessar','reprocess',{id:e.id,primary:true,icon:'refresh'}):''}${e.contingencyAvailable?button('Usar contingência','open-contingency',{id:e.id,icon:'upload'}):''}`;
  const body=`<div class="inline-actions">${badge(e.status)}<span class="badge">${e.source}</span>${e.scheduled?badge('Agendada','info'):''}</div><section class="detail-section"><h3>Timeline automática</h3><ol class="timeline">${steps.map((s,i)=>`<li class="${failed&&i===5?'failed':''}">${s}<small>${i===5&&failed?'Taxa de câmbio não localizada':`Etapa ${i+1} registrada`}</small></li>`).join('')}</ol></section><section class="detail-section"><h3>Registros processados</h3><dl class="detail-list"><div><dt>Recebidos</dt><dd>${formatNumber(e.received)}</dd></div><div><dt>Válidos</dt><dd>${formatNumber(e.valid)}</dd></div><div><dt>Rejeitados</dt><dd>${formatNumber(e.rejected)}</dd></div><div><dt>Snapshot</dt><dd>${e.snapshotPublished||'Publicado'}</dd></div></dl>${relatedScrapList(related,{empty:'A massa navegável não possui registros individuais para esta execução histórica.'})}</section><section class="detail-section"><h3>Exceções</h3>${tablePanel('',[{label:'Tipo'},{label:'Registro'},{label:'Motivo'},{label:'Etapa'},{label:'Status'}],`<tr><td>Câmbio indisponível</td><td>TX-82194</td><td>Taxa não localizada</td><td>Conversão</td><td>${badge(e.status==='Concluído'?'Resolvido':'Pendente')}</td></tr><tr><td>Duplicidade</td><td>TX-82171</td><td>Registro já processado</td><td>Persistência</td><td>${badge('Ignorado')}</td></tr>`)}</section>${e.contingencyAvailable?`<section class="contingency-notice"><strong>Contingência liberada</strong><p>O reprocessamento falhou. Um arquivo operacional pode ser usado exclusivamente para recuperar esta execução.</p></section>`:''}`;
  openOverlay(drawer(e.id,body,footer));
}
function openAudit(id){const e=model.audit.find(x=>x.id===id);if(!e)return;openOverlay(drawer(e.action,`<section class="detail-section"><dl class="detail-list">${Object.entries(e).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></section><section class="detail-section"><h3>Integridade</h3><p class="panel-description">Eventos de auditoria são imutáveis e não podem ser excluídos pelo protótipo.</p></section>`));}

function addAudit(action,entity,identifier,before,after){model.audit.unshift({id:`AUD-${Date.now()}`,timestamp:new Date().toLocaleString('pt-BR'),actor:'analista.qualidade',origin:'Web',action,entity,identifier,before,after,correlation:`COR-${Math.floor(900000+Math.random()*99999)}`,severity:'Informativo'});}
function applyTheme(preference){localStorage.setItem('hanaro-theme',preference);document.documentElement.dataset.themePreference=preference;const dark=preference==='dark'||(preference==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';renderPage();}
function closeMobileSidebar(){$('#app-shell').classList.remove('sidebar-open');}

const tvPanels = [
  { title: 'Visão Executiva', eyebrow: 'Material Scrap / IF Cost' },
  { title: 'Principais ofensores do período', eyebrow: 'Onde estamos perdendo dinheiro' },
  { title: 'Ocorrências prioritárias', eyebrow: 'Problemas que exigem ação' },
  { title: '2026 × 2025', eyebrow: 'Comparativo e tendência' },
];
function tvKpi(label, value, detail = '', tone = '') {
  return `<article class="tv-kpi ${tone}"><span>${label}</span><strong>${value}</strong>${detail ? `<small>${detail}</small>` : ''}</article>`;
}
function tvHeader(panel) { return `<header class="tv-panel-header"><div><span class="tv-eyebrow">${state.dashboardMetric === 'qty' ? panel.eyebrow.replace('IF Cost','QTY SCRAP').replace('dinheiro','unidades') : panel.eyebrow}</span><h1>${panel.title}</h1></div><div class="tv-freshness"><strong>${state.dashboardUpdatedAt}</strong><span>${icon('check')} Dados atualizados</span></div></header>`; }
function tvPanelContent(index) {
  const panel = tvPanels[index];
  const metric = state.dashboardMetric, masked = state.dashboardMasked && metric === 'usd';
  const actualSeries = metric === 'usd' ? dashboardSpreadsheetSeries.actualUsd : dashboardSpreadsheetSeries.actualQty;
  const previousSeries = metric === 'usd' ? dashboardSpreadsheetSeries.previousUsd : dashboardSpreadsheetSeries.previousQty;
  const targetSeries = metric === 'usd' ? dashboardSpreadsheetSeries.targetUsd : [];
  const current = actualSeries.slice(0,8).reduce((sum,value)=>sum+(value||0),0);
  const previous = previousSeries.slice(0,8).reduce((sum,value)=>sum+(value||0),0);
  const variation = previous ? (current/previous-1)*100 : 0;
  const fullMetric = model.transactions.reduce((sum,row)=>sum+(metric==='usd'?row.ifCost:row.qty),0);
  const scale = fullMetric ? current/fullMetric : 0;
  const metricDisplay = (value, compact=false) => dashboardDisplay(value,metric,masked,compact);
  if (index === 0) {
    const offenders = dashboardAggregate(model.transactions,'component',metric,scale).slice(0,3);
    const target = targetSeries.slice(0,8).reduce((sum,value)=>sum+(value||0),0);
    const cards = metric === 'usd'
      ? `${tvKpi('IF Cost acumulado',metricDisplay(current),'Jan–Ago/2026')}${tvKpi('Mesmo período 2025',metricDisplay(previous),'Referência YoY')}${tvKpi('Variação vs 2025',formatPercentage(variation),'Menor é melhor',variation<=0?'success':'danger')}${tvKpi('Target acumulado',metricDisplay(target),'Planejado no início do ano')}`
      : `${tvKpi('QTY SCRAP acumulado',metricDisplay(current),'Jan–Ago/2026')}${tvKpi('Mesmo período 2025',metricDisplay(previous),'Referência YoY')}${tvKpi('Variação vs 2025',formatPercentage(variation),'Menor é melhor',variation<=0?'success':'danger')}${tvKpi('Ocorrências',formatNumber(model.transactions.length),'Registros navegáveis')}`;
    return `${tvHeader(panel)}<div class="tv-kpi-grid">${cards}</div><div class="tv-main-grid"><article class="tv-card tv-chart-card"><h2>Evolução de ${metric==='usd'?'IF Cost':'QTY SCRAP'} — 2026 × 2025${metric==='usd'?' × Target':''}</h2>${dashboardChart({kind:'monthly',labels:dashboardSpreadsheetSeries.months,actual:actualSeries,previous:previousSeries,target:targetSeries,actualLabel:'2026',previousLabel:'2025',unit:metric,masked},330)}</article><article class="tv-card"><h2>Top 3 componentes afetados</h2>${barList(offenders.map(item=>({...item,display:metricDisplay(item.value,true)})))}</article></div><div class="tv-summary-strip"><strong>${formatNumber(dashboardSpreadsheetSeries.actualQty.slice(0,8).reduce((sum,value)=>sum+(value||0),0))}</strong> unidades de scrap <i></i><strong>${formatNumber(model.transactions.length)}</strong> transações <i></i><strong class="negative">6</strong> alertas críticos</div>`;
  }
  if (index === 1) { const linesRank=dashboardAggregate(model.transactions,'scrapLine',metric,scale); const partsRank=dashboardAggregate(model.transactions,'partNumber',metric,scale); const defects=dashboardAggregate(model.transactions,'defect',metric,scale).slice(0,5); return `${tvHeader(panel)}<div class="tv-offender-grid"><article class="tv-card"><h2>Pareto de defeitos por ${metric==='usd'?'IF Cost':'QTY SCRAP'}</h2>${barList(defects.map(item=>({...item,display:metricDisplay(item.value,true)})))}</article><article class="tv-card"><h2>${metric==='usd'?'IF Cost':'QTY SCRAP'} por linha</h2>${barList(linesRank.map(item=>({...item,display:metricDisplay(item.value,true)})))}</article></div><div class="tv-highlight-grid"><article class="tv-highlight"><span>Part Number mais crítico</span><strong>${partsRank[0]?.label||'—'}</strong><b>${metricDisplay(partsRank[0]?.value||0)}</b><small class="negative">Maior impacto acumulado</small></article><article class="tv-highlight"><span>Defeito mais crítico</span><strong>${defects[0]?.label||'—'}</strong><b>${current&&defects[0]?(defects[0].value/current*100).toLocaleString('pt-BR',{maximumFractionDigits:1}):0}%</b><small>do impacto acumulado</small></article></div>`; }
  if (index === 2) { const priorities = model.alerts.filter(a => a.severity === 'Crítico' || a.severity === 'Alto').slice(0,3); const justified=model.transactions.filter(row=>row.review.status==='Justificado').length; return `${tvHeader(panel)}<div class="tv-priority-layout"><div class="tv-priority-list">${priorities.map((a,i)=>{const related=model.transactions.filter(row=>a.transactionIds.includes(row.id));const qty=related.reduce((sum,row)=>sum+row.qty,0);return `<article class="tv-priority ${i===0?'critical':''}"><div><span>${badge(a.severity)}</span><strong>${a.partNumber}</strong></div><h2>${a.component}</h2><b>${metric==='usd'?(masked?'US$ •••••':formatCurrency(a.impact)):`${formatNumber(qty)} un.`}</b><p>${a.description}</p></article>`;}).join('')}</div><aside class="tv-card tv-analysis-status"><h2>Situação das revisões</h2><div class="tv-analysis-counts"><div><strong>${model.transactions.length-justified}</strong><span>Pendentes</span></div><div><strong>${model.transactions.filter(row=>row.review.status==='Em revisão').length}</strong><span>Em revisão</span></div><div><strong>${justified}</strong><span>Justificadas</span></div></div><h2>Categorias predominantes</h2>${barList([{label:'Material',value:42,display:'42%'},{label:'Processo',value:27,display:'27%'},{label:'Máquina',value:19,display:'19%'},{label:'Outros',value:12,display:'12%'}])}</aside></div>`; }
  return `${tvHeader(panel)}<div class="tv-trend-layout"><article class="tv-card tv-chart-card"><h2>Evolução acumulada no ano</h2>${dashboardChart({kind:'monthly',labels:dashboardSpreadsheetSeries.months,actual:actualSeries,previous:previousSeries,target:targetSeries,actualLabel:'2026',previousLabel:'2025',unit:metric,masked},430)}</article><aside class="tv-results"><h2>Resultado acumulado</h2>${tvKpi('2025',metricDisplay(previous))}${tvKpi('2026',metricDisplay(current))}${tvKpi('Variação',formatPercentage(variation),'',variation<=0?'success':'danger')}${tvKpi(metric==='usd'?'Atingimento':'Registros',metric==='usd'?`${(targetSeries.slice(0,8).reduce((sum,value)=>sum+(value||0),0)/current*100).toLocaleString('pt-BR',{maximumFractionDigits:1})}%`:formatNumber(model.transactions.length))}</aside></div>`;
}
function renderTvMode(resetProgress = true) {
  const root = $('#tv-mode'); pendingCharts = [];
  root.innerHTML = `<div class="tv-stage"><div class="tv-panel" data-panel="${state.tvPanel}">${tvPanelContent(state.tvPanel)}</div><footer class="tv-footer"><span>HANARO · Material Scrap / ${state.dashboardMetric==='usd'?'IF Cost':'QTY SCRAP'}</span><span>Atualizado ${state.dashboardUpdatedAt} · rotina a cada 2 horas</span></footer><div class="tv-controls visible" aria-label="Controles do Modo TV"><button data-action="tv-prev" aria-label="Painel anterior">${icon('chevronLeft')}</button><button data-action="tv-pause" aria-label="${state.tvPaused?'Continuar':'Pausar'} rotação">${icon(state.tvPaused?'play':'pause')}<span>${state.tvPaused?'Continuar':'Pausar'}</span></button><button data-action="tv-next" aria-label="Próximo painel">${icon('chevronRight')}</button><button data-action="tv-toggle-rotation" class="tv-text-control">${state.tvRotation?'Rotação automática':'Visão única'}</button><label class="tv-duration-control"><span>Intervalo</span><select id="tv-duration"><option value="10" ${state.tvDuration===10?'selected':''}>10s</option><option value="15" ${state.tvDuration===15?'selected':''}>15s</option><option value="30" ${state.tvDuration===30?'selected':''}>30s</option><option value="60" ${state.tvDuration===60?'selected':''}>60s</option></select></label><button data-action="tv-fullscreen" aria-label="Tela cheia">${icon('fullscreen')}<span>Tela cheia</span></button><button data-action="exit-tv" aria-label="Sair do Modo TV">${icon('x')}<span>Sair</span></button></div><div class="tv-position"><span>${state.tvPanel + 1} / ${tvPanels.length}</span><div class="tv-dots">${tvPanels.map((_,i)=>`<i class="${i===state.tvPanel?'active':''}"></i>`).join('')}</div></div><div class="tv-progress ${state.tvPaused || !state.tvRotation ? 'paused' : ''}" style="--tv-duration:${state.tvDuration}s"><i></i></div></div>`;
  applyI18n(root);
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
  if(action==='notifications'){const alert=model.alerts.find((item)=>item.status==='Novo')||model.alerts[0];return alert?openAlert(alert.id):showToast('Nenhum alerta disponível.');}
  if(action==='go-reports'||action==='new-report'){state.reportTab='construir';return navigateTo('relatorios');}
  if(action.startsWith('export')||action==='generate-pptx'){el.classList.add('spinning');el.disabled=true;await delay(650);el.classList.remove('spinning');el.disabled=false;return showToast(action==='generate-pptx'?'PPTX simulado preparado a partir do template Rev04.':'Arquivo fictício preparado para demonstração.');}
  if(action==='dashboard-metric'){state.dashboardMetric=id;renderPage();return showToast(id==='usd'?'Dashboard alterado para valores em dólar.':'Dashboard alterado para QTY SCRAP.');}
  if(action==='dashboard-mask'){state.dashboardMasked=!state.dashboardMasked;renderPage();return showToast(state.dashboardMasked?'Valores monetários ocultados.':'Valores monetários exibidos.');}
  if(action==='dashboard-analysis'){state.dashboardAnalysis=id;renderPage();return;}
  if(action==='dashboard-remove-filter'){
    const defaults={product:'Todos',scrapLine:'Todas',component:'Todos',partNumber:'Todos'};
    if(Object.prototype.hasOwnProperty.call(defaults,el.dataset.key))state.dashboardFilters[el.dataset.key]=defaults[el.dataset.key];
    renderPage();return;
  }
  if(action==='dashboard-risk-explore'){setExplorationContext({scrapLine:id,sector:el.dataset.sector||null,stationCode:el.dataset.station||null,component:null,partNumber:null,transactionId:null},'Mapa de risco');state.scrapView='list';return navigateTo('scrap');}
  if(action==='dashboard-more-filters'){
    const filters=state.dashboardFilters;
    return openOverlay(modal('Mais filtros do Dashboard',`<p class="panel-description">Estes filtros refinam todos os indicadores e gráficos compatíveis.</p><div class="form-grid" style="margin-top:1rem">${field('Componente','modal-dashboard-component',['Todos',...components],filters.component)+field('Part Number','modal-dashboard-part-number',['Todos',...partNumbers],filters.partNumber)}</div>`,`${button('Cancelar','close-overlay')}${button('Aplicar filtros','dashboard-apply-more-filters',{primary:true})}`));
  }
  if(action==='dashboard-apply-more-filters'){
    state.dashboardFilters.component=$('#modal-dashboard-component')?.value||'Todos';
    state.dashboardFilters.partNumber=$('#modal-dashboard-part-number')?.value||'Todos';
    closeOverlay();renderPage();return showToast('Filtros adicionais aplicados.');
  }
  if(action==='refresh-dashboard'){el.classList.add('spinning');el.disabled=true;$('#sync-state').textContent='Atualizando...';await delay(600);const now=new Date(),time=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});state.dashboardUpdatedAt=`${now.toLocaleDateString('pt-BR')} ${time}`;el.disabled=false;el.classList.remove('spinning');$('#sync-state').textContent=`Atualizado às ${time}`;renderPage();return showToast('Dados atualizados.');}
  if(action==='clear-dashboard'){state.dashboardFactor=1;state.dashboardFilters={year:'2026',period:'Acumulado Jan–Ago',compare:'Mesmo período de 2025',product:'Todos',scrapLine:'Todas',component:'Todos',partNumber:'Todos'};renderPage();return showToast('Filtros limpos.');}
  if(action==='dashboard-explore'){setExplorationContext({component:id,partNumber:state.dashboardFilters.partNumber==='Todos'?null:state.dashboardFilters.partNumber,scrapLine:state.dashboardFilters.scrapLine==='Todas'?null:state.dashboardFilters.scrapLine,transactionId:null,alertId:null,executionId:null},'Dashboard');state.scrapView='list';return navigateTo('scrap');}
  if(action==='dashboard-row-explore'){const row=model.transactions.find(t=>t.id===id);if(!row)return;setExplorationContext({productArea:row.productArea,component:row.component,modelCode:row.modelCode,sector:row.sector,stationCode:row.stationCode,partNumber:row.partNumber,scrapLine:row.scrapLine,transactionId:row.id},'Dashboard');state.scrapView='list';return navigateTo('scrap');}
  if(action==='dashboard-row-review'){const row=model.transactions.find(t=>t.id===id);if(!row)return;state.selectedScrapIds=[row.id];state.activeReviewId=row.id;state.scrapView='review';setExplorationContext({component:row.component,partNumber:row.partNumber,scrapLine:row.scrapLine,transactionId:row.id},'Dashboard');navigateTo('scrap');history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(row.id)}`);return;}
  if(action==='page-prev'){state.scrapPage--;return renderPage();} if(action==='page-next'){state.scrapPage++;return renderPage();}
  if(action==='sort-scrap'){const key=el.dataset.key;state.scrapSort.direction=state.scrapSort.key===key&&state.scrapSort.direction==='asc'?'desc':'asc';state.scrapSort.key=key;state.scrapPage=1;return renderPage();}
  if(action==='open-component')return openComponent(id);
  if(action==='consolidate-alias'){const item=model.components.find((component)=>component.id===id);return openOverlay(modal('Consolidar alias',`<p class="panel-description">O alias será associado a ${item.itemCode}; o valor original continuará preservado na origem.</p><div class="field" style="margin-top:1rem"><label for="component-new-alias">Novo alias</label><input class="control" id="component-new-alias" placeholder="Código ou descrição alternativa"></div>`,`${button('Cancelar','close-overlay')}${button('Salvar vínculo','confirm-consolidate-alias',{id:item.id,primary:true,icon:'check'})}`));}
  if(action==='confirm-consolidate-alias'){const item=model.components.find((component)=>component.id===id),alias=$('#component-new-alias')?.value.trim();if(!alias)return showToast('Informe o alias a consolidar.','error');item.aliases.push(alias);item.updatedAt=new Date().toLocaleString('pt-BR');addAudit('Consolidou alias de componente','Component',item.id,'Sem vínculo',alias);closeOverlay();renderPage();return showToast('Alias vinculado sem alterar o valor original.');}
  if(action==='new-component')return openOverlay(modal('Novo componente',`<div class="form-grid"><div class="field"><label>Código</label><input class="control" id="new-component-code"></div><div class="field"><label>Nome normalizado</label><input class="control" id="new-component-name"></div>${field('Produto / área','new-component-product',productAreas,'TV')}${field('Tipo','new-component-type',['Painel','PCB','Estrutural','Fonte','Áudio'],'Painel')}</div>`,`${button('Cancelar','close-overlay')}${button('Cadastrar','confirm-new-component',{primary:true,icon:'check'})}`));
  if(action==='confirm-new-component'){const code=$('#new-component-code')?.value.trim(),name=$('#new-component-name')?.value.trim();if(!code||!name)return showToast('Informe código e nome normalizado.','error');model.components.unshift({id:`CMP-${String(742+model.components.length).padStart(6,'0')}`,itemCode:code,normalizedName:name,component:name,itemType:$('#new-component-type').value,productArea:$('#new-component-product').value,division:'MS',aliases:[],source:'Cadastro no protótipo',lastOccurrence:'—',status:'Em validação',updatedAt:new Date().toLocaleString('pt-BR')});closeOverlay();renderPage();return showToast('Componente cadastrado para validação.');}
  if(action==='action-view'){state.actionView=id;return renderPage();}
  if(action==='open-action')return openAction(id);
  if(action==='toggle-action-report'){const item=model.actions.find((entry)=>entry.id===id);item.reportIncluded=!item.reportIncluded;closeOverlay();renderPage();return showToast(item.reportIncluded?'Ação adicionada à curadoria do relatório.':'Ação removida da curadoria do relatório.');}
  if(action==='advance-action'){const item=model.actions.find((entry)=>entry.id===id),flow=['Planejada','Em andamento','Aguardando eficácia','Validada'],current=Math.max(0,flow.indexOf(item.status));item.status=flow[Math.min(flow.length-1,current+1)];item.progress=[10,55,90,100][flow.indexOf(item.status)];addAudit('Avançou status do plano de ação','Action',item.id,flow[current],item.status);closeOverlay();renderPage({preserveScroll:true});return showToast(`Plano atualizado para ${item.status}.`);}
  if(action==='new-action')return openOverlay(modal('Nova ação',`<div class="form-grid"><div class="field full"><label>Título</label><input class="control" id="new-action-title"></div>${field('Produto / área','new-action-product',productAreas,'TV')}${field('Linha','new-action-line',scrapLines,'A05')}<div class="field"><label>Responsável</label><input class="control" id="new-action-owner" value="Analista de Qualidade"></div><div class="field"><label>Prazo</label><input class="control" id="new-action-due" value="31/08/2026"></div>${field('Risco','new-action-risk',['Médio','Alto','Crítico'],'Médio')}${field('4M','new-action-4m',['Machine','Method','Material','Man'],'Method')}</div>`,`${button('Cancelar','close-overlay')}${button('Criar ação','confirm-new-action',{primary:true,icon:'check'})}`));
  if(action==='confirm-new-action'){const title=$('#new-action-title')?.value.trim();if(!title)return showToast('Informe o título da ação.','error');const next=model.actions.length+1;model.actions.unshift({id:`ACT-2026-${String(next).padStart(3,'0')}`,title,lineCode:$('#new-action-line').value,stationCode:'P01',productArea:$('#new-action-product').value,owner:$('#new-action-owner').value,ownerArea:'Qualidade',category4m:$('#new-action-4m').value,risk:$('#new-action-risk').value,dueDate:$('#new-action-due').value,status:'Planejada',progress:0,evidenceCount:0,transactionIds:[],ifCost:0,qty:0,reportIncluded:false,description:'Ação criada no protótipo para detalhamento posterior.'});closeOverlay();renderPage();return showToast('Plano de ação criado.');}
  if(action==='more-filters'){const f=state.scrapAdvancedFilters,stationCodes=[...new Set(model.transactions.map((row)=>row.stationCode))];return openOverlay(modal('Mais filtros da Base de Scrap',`<p class="panel-description">Refine dimensões industriais, origem contábil e curadoria do relatório.</p><div class="form-grid" style="margin-top:1rem">${field('Organização','modal-organization',['Todas',...organizationCodes],f.organizationCode)+field('Conta / alias','modal-account-alias',['Todos',...aliases],f.accountAlias)+field('Componente','modal-component',['Todos',...components],f.component)+field('Modelo','modal-model-code',['Todos',...modelCodes],f.modelCode)+field('Setor','modal-sector',['Todos',...sectors],f.sector)+field('Posto','modal-station-code',['Todos',...stationCodes],f.stationCode)+field('Grupo de subinventário','modal-subinventory-group',['Todos',...subinventoryGroups],f.subinventoryGroup)+field('Subinventário','modal-subinventory',['Todos',...subinventories],f.subinventory)+field('Mercado do armazém','modal-warehouse-market',['Todos',...warehouseMarkets],f.warehouseMarket)+field('Departamento de recebimento','modal-receipt-department',['Todos',...receiptDepartments],f.receiptDepartment)+field('Part Number','modal-part-number',['Todos',...partNumbers],f.partNumber)+field('Inclusão em relatório','modal-report-inclusion',['Todos','Incluído','Não incluído'],f.reportInclusion)}</div>`,`${button('Cancelar','close-overlay')}${button('Limpar filtros','clear-more-filters')}${button('Aplicar filtros','apply-more-filters',{primary:true})}`));}
  if(action==='apply-more-filters'){state.scrapAdvancedFilters={organizationCode:$('#modal-organization')?.value||'Todas',accountAlias:$('#modal-account-alias')?.value||'Todos',component:$('#modal-component')?.value||'Todos',modelCode:$('#modal-model-code')?.value||'Todos',sector:$('#modal-sector')?.value||'Todos',stationCode:$('#modal-station-code')?.value||'Todos',subinventoryGroup:$('#modal-subinventory-group')?.value||'Todos',subinventory:$('#modal-subinventory')?.value||'Todos',warehouseMarket:$('#modal-warehouse-market')?.value||'Todos',receiptDepartment:$('#modal-receipt-department')?.value||'Todos',partNumber:$('#modal-part-number')?.value||'Todos',reportInclusion:$('#modal-report-inclusion')?.value||'Todos'};closeOverlay();state.scrapPage=1;renderPage();return showToast('Filtros avançados aplicados.');}
  if(action==='clear-more-filters'){state.scrapAdvancedFilters={organizationCode:'Todas',accountAlias:'Todos',component:'Todos',modelCode:'Todos',sector:'Todos',stationCode:'Todos',subinventoryGroup:'Todos',subinventory:'Todos',warehouseMarket:'Todos',receiptDepartment:'Todos',partNumber:'Todos',reportInclusion:'Todos'};closeOverlay();state.scrapPage=1;renderPage();return showToast('Filtros limpos.');}
  if(action==='drill-part'){setExplorationContext({partNumber:id},state.context.source||'Explorador');renderPage();return showToast(`Exploração aprofundada em ${id}.`);}
  if(action==='clear-context'){state.context[el.dataset.key]=null;state.scrapPage=1;renderPage();return;}
  if(action==='clear-all-context'){state.context={source:null,productArea:null,component:null,modelCode:null,sector:null,stationCode:null,partNumber:null,scrapLine:null,transactionId:null,alertId:null,executionId:null};state.scrapPage=1;renderPage();return;}
  if(action==='toggle-scrap'){state.selectedScrapIds=state.selectedScrapIds.includes(id)?state.selectedScrapIds.filter(value=>value!==id):[...state.selectedScrapIds,id];return renderPage();}
  if(action==='select-visible-scrap'){const ids=filteredTransactions().slice((state.scrapPage-1)*state.scrapPageSize,state.scrapPage*state.scrapPageSize).map(row=>row.id);const allSelected=ids.every(value=>state.selectedScrapIds.includes(value));state.selectedScrapIds=allSelected?state.selectedScrapIds.filter(value=>!ids.includes(value)):[...new Set([...state.selectedScrapIds,...ids])];return renderPage();}
  if(action==='clear-scrap-selection'){state.selectedScrapIds=[];return renderPage();}
  if(action==='review-one'){closeOverlay();state.selectedScrapIds=[id];state.activeReviewId=id;if(state.route==='scrap'&&state.scrapView==='list')state.scrapListScroll=$('#main-canvas')?.scrollTop||0;state.scrapView='review';if(state.route!=='scrap')navigateTo('scrap');else renderPage();history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(id)}`);return;}
  if(action==='review-selected'){if(!state.selectedScrapIds.length)return showToast('Selecione ao menos um registro.','error');state.scrapListScroll=$('#main-canvas')?.scrollTop||0;state.activeReviewId=state.selectedScrapIds[0];state.scrapView='review';history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(state.activeReviewId)}`);return renderPage();}
  if(action==='back-scrap'){syncScrapReview();state.scrapView='list';state.pendingScrollTop=state.scrapListScroll;history.replaceState(null,'','#scrap');return renderPage();}
  if(action==='select-review-item'){syncScrapReview();state.activeReviewId=id;history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(id)}`);return renderPage();}
  if(action==='toggle-review-4m'){syncScrapReview();const row=model.transactions.find(item=>item.id===state.activeReviewId),value=el.dataset.value;if(!row)return;row.review.classification4m=row.review.classification4m.includes(value)?row.review.classification4m.filter(item=>item!==value):[...row.review.classification4m,value];return renderPage();}
  if(action==='save-scrap-review'){const row=model.transactions.find(item=>item.id===state.activeReviewId),before=row.review.status;syncScrapReview();row.review.status='Em revisão';addAudit('Salvou justificativa de scrap','Transaction',row.id,before,'Em revisão');renderPage();return showToast('Rascunho da revisão salvo.');}
  if(action==='conclude-scrap-review'){syncScrapReview();const source=model.transactions.find(item=>item.id===state.activeReviewId);const missing=[];if(!source.review.category||source.review.category==='Selecione...')missing.push('categoria');if(!source.review.reason.trim())missing.push('justificativa');if(!source.review.rootCause.trim())missing.push('causa raiz');if(!source.review.responsible.trim())missing.push('responsável');if(missing.length)return showToast(`Preencha antes de concluir: ${missing.join(', ')}.`,'error');const applyAll=$('#review-apply-all')?.checked??false;const targets=applyAll?model.transactions.filter(item=>state.selectedScrapIds.includes(item.id)):[source];const mixed=new Set(targets.map(item=>`${item.component}|${item.scrapLine}`)).size>1;if(targets.length>1&&!window.confirm(`Aplicar a mesma revisão a ${targets.length} registros${mixed?' de componentes ou linhas diferentes':''}?`))return;targets.forEach(item=>{const before=item.review.status;if(item!==source)item.review={...source.review,classification4m:[...source.review.classification4m],evidence:[...source.review.evidence]};item.review.status='Justificado';addAudit('Concluiu revisão e justificativa de scrap','Transaction',item.id,before,'Justificado');});const remaining=state.selectedScrapIds.filter(value=>!targets.some(item=>item.id===value));state.selectedScrapIds=remaining;if(remaining.length){state.activeReviewId=remaining[0];history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(state.activeReviewId)}`);renderPage();}else{state.scrapView='list';state.pendingScrollTop=state.scrapListScroll;history.replaceState(null,'','#scrap');renderPage();}return showToast(`${targets.length} registro${targets.length>1?'s':''} justificado${targets.length>1?'s':''} e ${targets.length>1?'disponíveis':'disponível'} para relatório.`);}
  if(action==='create-review-plan'){syncScrapReview();const row=model.transactions.find(item=>item.id===state.activeReviewId);return openOverlay(modal('Criar ou vincular plano de ação',`<p class="panel-description">O plano herda causa, responsável e origem da revisão ${row.id}.</p><div class="form-grid" style="margin-top:1rem"><div class="field full"><label>Título do plano</label><input class="control" id="review-plan-title" value="${row.review.title||row.defect}"></div><div class="field"><label>Responsável</label><input class="control" id="review-plan-owner" value="${row.review.responsible}"></div><div class="field"><label>Prazo</label><input class="control" id="review-plan-due" value="${row.review.dueDate}"></div></div>`,`${button('Cancelar','close-overlay')}${button('Criar plano vinculado','confirm-create-review-plan',{primary:true,icon:'check',id:row.id})}`));}
  if(action==='confirm-create-review-plan'){const row=model.transactions.find(item=>item.id===id),next=model.actions.length+1,planId=`ACT-2026-${String(next).padStart(3,'0')}`,title=$('#review-plan-title')?.value||row.review.title||row.defect,owner=$('#review-plan-owner')?.value||row.review.responsible,dueDate=$('#review-plan-due')?.value||row.review.dueDate;row.review.actionPlanId=planId;row.review.title=title;row.review.responsible=owner;row.review.dueDate=dueDate;model.actions.unshift({id:planId,title,lineCode:row.scrapLine,stationCode:row.stationCode,productArea:row.productArea,owner,ownerArea:row.review.responsibleDepartment||'Qualidade',category4m:row.review.classification4m[0]||'Method',risk:row.review.risk||'Médio',dueDate,status:'Planejada',progress:0,evidenceCount:row.review.evidence.length,transactionIds:[row.id],ifCost:row.ifCost,qty:row.qty,reportIncluded:false,description:row.review.preventive||row.review.corrective||row.occurrence});addAudit('Criou plano de ação a partir da revisão','Action',planId,'Inexistente','Planejada');closeOverlay();renderPage();return showToast(`Plano ${planId} criado e vinculado à revisão.`);}
  if(action==='add-review-evidence'){syncScrapReview();return openOverlay(modal('Adicionar evidência à revisão',`<div class="choice-group">${['Foto','Documento','Comentário','Referência GERP'].map(value=>`<button class="choice" data-action="choose-review-evidence" data-value="${value}">${value}</button>`).join('')}</div><p class="panel-description">A inclusão é simulada; nenhum arquivo real será enviado.</p>`));}
  if(action==='choose-review-evidence'){const row=model.transactions.find(item=>item.id===state.activeReviewId);row.review.evidence.push(`${el.dataset.value} fictício · ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`);closeOverlay();renderPage();return showToast('Evidência adicionada à revisão.');}
  if(action==='transaction-explore'){const row=model.transactions.find(t=>t.id===id);if(!row)return;closeOverlay();setExplorationContext({component:row.component,partNumber:row.partNumber,scrapLine:row.scrapLine,transactionId:null},'Transação');renderPage();return;}
  if(action==='validate-upload'){el.disabled=true;el.classList.add('spinning');await delay(700);return openUploadResult();}
  if(action==='confirm-upload'){model.executions.unshift({id:'EXE-20260812-0047',source:'Contingência operacional',process:'Recuperação de execução com falha',start:'12/08 10:02',end:'12/08 10:03',duration:'01m14s',received:827,valid:824,rejected:3,status:'Concluído',scheduled:false,retryCount:0,contingencyAvailable:false});addAudit('Executou contingência após falha de reprocessamento','Execution','EXE-20260812-0047','Arquivo validado','Concluído');closeOverlay();renderPage();return showToast('Contingência concluída e auditada.');}
  if(action==='read-alerts'){const targets=model.alerts.filter(a=>a.status==='Novo');targets.forEach(a=>{a.status='Lido';addAudit('Marcou alerta como lido','Alert',a.id,'Novo','Lido');});renderPage();return showToast(`${targets.length} alertas marcados como lidos.`);}
  if(action==='open-alert')return openAlert(id);
  if(action==='archive-alert'){const a=model.alerts.find(x=>x.id===id);if(a){const before=a.status;a.status='Arquivado';addAudit('Arquivou alerta','Alert',a.id,before,'Arquivado');}closeOverlay();renderPage({preserveScroll:true});return showToast('Alerta arquivado.');}
  if(action==='alert-transactions'){const a=model.alerts.find(x=>x.id===id);if(!a)return;const before=a.status;if(a.status==='Novo')a.status='Lido';setExplorationContext({component:a.component,partNumber:null,scrapLine:null,alertId:a.id,transactionId:null,executionId:null},'Alerta');state.selectedScrapIds=[];state.scrapView='list';if(before==='Novo')addAudit('Abriu registros a partir do alerta','Alert',a.id,'Novo','Lido');closeOverlay();return navigateTo('scrap');}
  if(action==='report-tab'){state.reportTab=id;return renderPage();}
  if(action==='report-preview'){state.reportTab='preview';return renderPage();}
  if(action==='report-build'){state.reportTab='construir';return renderPage();}
  if(action==='report-approve'){const reviewIds=model.transactions.filter(row=>row.review.status==='Justificado'&&row.review.includeInReport).map(row=>row.id),reportId=`REP-2026-08-v${String(model.reports.length+1).padStart(2,'0')}`;model.reports.unshift({id:reportId,version:`v1.${model.reports.length+1}`,type:'Mensal',period:'Ago/2026',snapshot:'EXE-20260815-0051',generatedAt:new Date().toLocaleString('pt-BR'),author:'Analista de Qualidade',approver:'Fluxo de aprovação simulado',ifCost:model.transactions.filter(row=>reviewIds.includes(row.id)).reduce((sum,row)=>sum+row.ifCost,0),slides:10+Math.min(3,reviewIds.length),format:'PPTX',status:'Aguardando aprovação',reviewIds});addAudit('Enviou relatório mensal para aprovação','Report',reportId,'Rascunho','Aguardando aprovação');state.reportTab='versoes';renderPage();return showToast(`${reportId} enviado para aprovação simulada.`);}
  if(action==='register-report-send'){const report=$('#send-report-version')?.value,recipient=$('#send-recipient')?.value;if(!report||!recipient)return showToast('Selecione versão e destinatário elegível.','error');model.sends.unshift({report,recipient,channel:'E-mail',requestedAt:new Date().toLocaleString('pt-BR'),status:'Pendente',attempts:0});renderPage();return showToast('Envio registrado para simulação.');}
  if(action==='toggle-report-review'){const row=model.transactions.find(item=>item.id===id);if(row){row.review.includeInReport=!row.review.includeInReport;renderPage();}return;}
  if(action==='open-report-review')return openReportReview(id);
  if(action==='resend-report'){const s=model.sends[Number(id)];s.status='Processando';renderPage();await delay(700);s.status='Enviado';s.attempts++;addAudit('Reenviou relatório','Report',s.report,'Falha','Enviado');renderPage();return showToast('Relatório reenviado com sucesso.');}
  if(action==='send-report'){const s=model.sends[Number(id)];s.status='Processando';renderPage();await delay(700);s.status='Enviado';s.attempts++;addAudit('Enviou relatório','Report',s.report,'Pendente','Enviado');renderPage();return showToast('Envio simulado com sucesso.');}
  if(action==='execution-audit'){closeOverlay();state.auditSearch=id;state.auditEntity='Execution';return navigateTo('auditoria');}
  if(action==='open-contingency'){const e=model.executions.find(x=>x.id===id);if(!e?.contingencyAvailable)return showToast('A contingência ainda não está disponível.','error');return openUploadModal(id);}
  if(action==='manual-execution')return openOverlay(modal('Executar rotina agora',`<section class="contingency-notice"><strong>Simulação do protótipo</strong><p>Nenhuma conexão real será feita com o GERP. A ação criará uma execução fictícia, atualizará estados e registrará auditoria.</p></section><dl class="detail-list"><div><dt>Fonte</dt><dd>GERP</dd></div><div><dt>Rotina</dt><dd>Scrap + atualização de tabelas</dd></div><div><dt>Gatilho</dt><dd>Manual</dd></div><div><dt>Fuso</dt><dd>America/Manaus</dd></div></dl>`,`${button('Cancelar','close-overlay')}${button('Confirmar simulação','confirm-manual-execution',{primary:true,icon:'play'})}`));
  if(action==='confirm-manual-execution'){const now=new Date(),execution={id:`EXE-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(52+model.executions.length).padStart(4,'0')}`,source:'GERP',process:'Scrap + atualização de tabelas',start:now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),end:'—',duration:'Em cálculo',received:0,valid:0,rejected:0,status:'Em andamento',scheduled:false,trigger:'Manual',actor:'Usuário do protótipo',snapshotPublished:'Pendente',retryCount:0,contingencyAvailable:false};model.executions.unshift(execution);addAudit('Disparou atualização manual simulada','Execution',execution.id,'Inexistente','Em andamento');closeOverlay();renderPage();showToast('Execução manual simulada iniciada.');await delay(900);execution.end=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});execution.duration='01m08s';execution.received=10824;execution.valid=10760;execution.rejected=64;execution.status='Concluído';execution.snapshotPublished='Publicado';addAudit('Concluiu atualização manual simulada','Execution',execution.id,'Em andamento','Concluído');renderPage();return showToast('Execução simulada concluída; nenhuma chamada real ao GERP foi feita.');}
  if(action==='reprocess'){const e=model.executions.find(x=>x.id===id),before=e.status;e.status='Processando';e.retryCount=(e.retryCount||0)+1;closeOverlay();renderPage();showToast('Reprocessamento iniciado.');await delay(900);if(before==='Falha'&&e.retryCount===1){e.status='Falha';e.contingencyAvailable=true;addAudit('Reprocessamento falhou; liberou contingência','Execution',e.id,before,'Falha');renderPage();setTimeout(()=>openExecution(e.id),80);return showToast('O reprocessamento falhou. A contingência foi liberada.','error');}e.status='Concluído';e.rejected=0;e.valid=e.received;e.contingencyAvailable=false;addAudit('Reprocessou execução','Execution',e.id,before,'Concluído');renderPage();return showToast('Execução reprocessada com sucesso.');}
  if(action==='settings-tab'){state.settingsTab=id;return renderPage();}
  if(action==='go-executions')return navigateTo('execucoes');
  if(action==='edit-month-target'){const index=Number(id),month=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][index];return openOverlay(modal(`Editar target · ${month}/2026`,`<section class="contingency-notice"><strong>Ciclo publicado</strong><p>A alteração será versionada e exige uma justificativa no produto final.</p></section><div class="form-grid"><div class="field"><label>Target (US$)</label><input class="control" id="month-target-value" type="number" value="${model.settings.monthlyTargets[index]}"></div><div class="field full"><label>Justificativa da alteração</label><textarea class="control" id="month-target-reason" placeholder="Motivo da revisão do planejamento..."></textarea></div></div>`,`${button('Cancelar','close-overlay')}${button('Salvar nova versão','confirm-month-target',{id,primary:true,icon:'check'})}`));}
  if(action==='confirm-month-target'){const value=Number($('#month-target-value')?.value),reason=$('#month-target-reason')?.value.trim();if(!value||!reason)return showToast('Informe um valor válido e a justificativa.','error');const before=model.settings.monthlyTargets[Number(id)];model.settings.monthlyTargets[Number(id)]=value;model.settings.targetVersion=`v1.${Number(model.settings.targetVersion.split('.')[1]||0)+1}`;addAudit('Alterou target mensal','Target',`TGT-2026-${String(Number(id)+1).padStart(2,'0')}`,formatCurrency(before),formatCurrency(value));closeOverlay();renderPage();return showToast(`Target atualizado na versão ${model.settings.targetVersion}.`);}
  if(action==='copy-target-year'||action==='new-target-year')return showToast(action==='copy-target-year'?'Targets de 2025 copiados para um novo rascunho de 2027.':'Novo ciclo anual criado como rascunho.');
  if(action==='configure-line-map')return openOverlay(modal(`Configurar mapa · Linha ${id}`,`<p class="panel-description">A edição visual é simulada. Setores, postos, coordenadas e faixas ficam associados à versão do layout.</p><div class="form-grid" style="margin-top:1rem"><div class="field"><label>Layout ID</label><input class="control" value="LAY-${id}-v2" readonly></div><div class="field"><label>Vigência</label><input class="control" value="01/01/2026"></div>${field('Faixa de risco','line-risk-rule',['Por QTY SCRAP','Por IF Cost'],'Por QTY SCRAP')}<div class="field"><label>Responsável padrão</label><input class="control" value="MFG"></div></div>`,`${button('Cancelar','close-overlay')}${button('Salvar versão simulada','close-overlay',{primary:true,icon:'check'})}`));
  if(action==='new-line-layout')return showToast('Rascunho de layout criado para configuração.');
  if(action==='new-recipient')return openOverlay(modal('Novo destinatário',`<div class="form-grid"><div class="field"><label>Nome</label><input class="control" id="recipient-name"></div><div class="field"><label>E-mail</label><input class="control" id="recipient-email" type="email"></div><div class="field"><label>Grupo</label><input class="control" id="recipient-group" value="Gestão"></div><div class="field"><label>Escopo</label><input class="control" id="recipient-scope" value="Todos"></div>${field('Consentimento','recipient-consent',['Pendente','Aceito'],'Pendente')}</div>`,`${button('Cancelar','close-overlay')}${button('Cadastrar','confirm-new-recipient',{primary:true,icon:'check'})}`));
  if(action==='edit-recipient'){const recipient=model.recipients.find((item)=>item.id===id);return openOverlay(modal(`Editar destinatário · ${recipient.id}`,`<div class="form-grid"><div class="field"><label>Nome</label><input class="control" id="recipient-name" value="${recipient.name}"></div><div class="field"><label>E-mail</label><input class="control" id="recipient-email" value="${recipient.email}"></div><div class="field"><label>Grupo</label><input class="control" id="recipient-group" value="${recipient.group}"></div><div class="field"><label>Escopo</label><input class="control" id="recipient-scope" value="${recipient.scope}"></div>${field('Consentimento','recipient-consent',['Pendente','Aceito','Revogado'],recipient.consent)}${field('Status','recipient-status',['Ativo','Inativo'],recipient.status)}</div>`,`${button('Cancelar','close-overlay')}${button('Salvar','confirm-edit-recipient',{id,primary:true,icon:'check'})}`));}
  if(action==='confirm-new-recipient'||action==='confirm-edit-recipient'){const name=$('#recipient-name')?.value.trim(),email=$('#recipient-email')?.value.trim();if(!name||!email||!email.includes('@'))return showToast('Informe nome e e-mail válido.','error');let recipient=model.recipients.find((item)=>item.id===id);if(!recipient){recipient={id:`REC-${String(18+model.recipients.length).padStart(4,'0')}`,categories:'Relatórios',status:'Ativo'};model.recipients.unshift(recipient)}Object.assign(recipient,{name,email,group:$('#recipient-group')?.value||'Gestão',scope:$('#recipient-scope')?.value||'Todos',consent:$('#recipient-consent')?.value||'Pendente',status:$('#recipient-status')?.value||recipient.status||'Ativo'});closeOverlay();renderPage();return showToast('Destinatário salvo no cadastro.');}
  if(action==='save-settings'){addAudit('Alterou configuração','Settings','CFG-HANARO','Anterior','Atualizado');return showToast('Alterações salvas durante esta sessão.');}
  if(action==='refresh-alerts'||action==='refresh-executions'){el.classList.add('spinning');await delay(600);el.classList.remove('spinning');return showToast('Dados atualizados.');}
}

function openUploadModal(executionId=''){openOverlay(modal('Contingência operacional',`<section class="contingency-notice"><strong>Uso excepcional liberado</strong><p>O arquivo só pode recuperar a execução ${executionId||'com falha'} após o reprocessamento malsucedido. A ação será registrada na Auditoria.</p></section><div class="form-grid"><div class="field full"><label for="upload-file">Arquivo de recuperação</label><input class="control" id="upload-file" type="text" value="scrap_contingencia_20260812.xlsx" readonly></div>${field('Tipo','upload-type',['XLSX','CSV','TXT'])}<div class="field"><label>Execução de origem</label><input class="control" value="${executionId}" readonly></div><div class="field full"><label>Justificativa obrigatória</label><textarea class="control" placeholder="Descreva por que a automação não pôde recuperar esta execução...">Falha de câmbio persistente após reprocessamento</textarea></div></div>`,`${button('Cancelar','close-overlay')}${button('Validar contingência','validate-upload',{primary:true,icon:'check'})}`));}
function openUploadResult(){openOverlay(modal('Contingência validada',`<div class="inline-actions">${badge('Validação concluída','success')}</div><dl class="detail-list" style="margin-top:1rem"><div><dt>Arquivo</dt><dd>scrap_contingencia_20260812.xlsx</dd></div><div><dt>Registros</dt><dd>827</dd></div><div><dt>Válidos</dt><dd class="positive">824</dd></div><div><dt>Rejeitados</dt><dd class="negative">3</dd></div></dl>`,`${button('Cancelar','close-overlay')}${button('Confirmar contingência','confirm-upload',{primary:true,icon:'upload'})}`));}

document.addEventListener('click',(event)=>{
  const actionEl=event.target.closest('[data-action]');if(actionEl){event.preventDefault();handleAction(actionEl.dataset.action,actionEl);return;}
  const row=event.target.closest('tr[data-row-id]');if(row){const {rowId,rowType}=row.dataset;if(rowType==='transaction')openTransaction(rowId);if(rowType==='component')openComponent(rowId);if(rowType==='action')openAction(rowId);if(rowType==='alert')openAlert(rowId);if(rowType==='execution')openExecution(rowId);if(rowType==='audit')openAudit(rowId);if(rowType==='dashboard')openTransaction(rowId);if(rowType==='report')showToast(`Detalhes da versão ${rowId} carregados.`);}
});
document.addEventListener('input',(event)=>{if(event.target.id==='scrap-search'){state.scrapSearch=event.target.value;state.scrapPage=1;renderPage();setTimeout(()=>{const input=$('#scrap-search');input?.focus();input?.setSelectionRange(input.value.length,input.value.length)},0)}if(event.target.id==='component-search'){state.componentSearch=event.target.value;renderPage();setTimeout(()=>{const input=$('#component-search');input?.focus();input?.setSelectionRange(input.value.length,input.value.length)},0)}if(event.target.id==='audit-search'){state.auditSearch=event.target.value;renderPage();setTimeout(()=>{const input=$('#audit-search');input?.focus();input?.setSelectionRange(input.value.length,input.value.length)},0)}});
document.addEventListener('change', (event) => {
  const target = event.target;
  if (target.id === 'global-language' || target.id === 'settings-language') {
    state.locale = target.value;
    localStorage.setItem('hanaro-locale', state.locale);
    renderPage();
    showToast(state.locale === 'pt-BR' ? 'Idioma alterado para Português.' : state.locale === 'en' ? 'Language changed to English.' : '언어가 한국어로 변경되었습니다.');
    return;
  }
  if (target.id === 'page-size') { state.scrapPageSize = Number(target.value); state.scrapPage = 1; renderPage(); }
  if (target.matches('[data-filter^="dash-"]')) {
    const dashboardKeys = { 'dash-year': 'year', 'dash-period': 'period', 'dash-product': 'product', 'dash-scrap-line': 'scrapLine', 'dash-component': 'component', 'dash-part-number': 'partNumber', 'dash-compare': 'compare' };
    const key = dashboardKeys[target.id];
    if (key) state.dashboardFilters[key] = target.value;
    renderPage();
    showToast(`${target.closest('.field')?.querySelector('label')?.textContent || 'Filtro'} atualizado para ${target.value}.`);
  }
  if (target.id === 'scrap-date') { state.scrapFilters.date = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-product-area') { state.scrapFilters.productArea = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-line') { state.scrapFilters.scrapLine = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-movement-type') { state.scrapFilters.movementType = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-processing-status') { state.scrapFilters.processingStatus = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-review-status') { state.scrapFilters.reviewStatus = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id.startsWith('component-')) { const keys={'component-product':'productArea','component-division':'division','component-type':'itemType','component-status':'status'};if(keys[target.id])state.componentFilters[keys[target.id]]=target.value;renderPage(); }
  if (target.id.startsWith('action-')) { const keys={'action-period':'period','action-product':'productArea','action-line':'scrapLine','action-owner':'owner','action-4m':'category4m','action-risk':'risk','action-status':'status','action-overdue':'overdue'};if(keys[target.id])state.actionFilters[keys[target.id]]=target.value;renderPage(); }
  if (target.id.startsWith('alert-')) { const alertKeys={'alert-period':'period','alert-severity':'severity','alert-type':'type','alert-product':'productArea','alert-line':'scrapLine','alert-status':'status','alert-channel':'channel'}; if(alertKeys[target.id])state.alertFilters[alertKeys[target.id]]=target.value; renderPage(); }
  if (target.id === 'exec-status') { state.executionStatus = target.value; renderPage(); }
  if (target.id === 'exec-period') { state.executionFilters.period = target.value; renderPage(); }
  if (target.id === 'exec-source') { state.executionFilters.source = target.value; renderPage(); }
  if (target.id === 'exec-trigger') { state.executionFilters.trigger = target.value; renderPage(); }
  if (target.id === 'audit-entity') { state.auditEntity = target.value; renderPage(); }
  if (target.id === 'audit-period') { state.auditFilters.period = target.value; renderPage(); }
  if (target.id === 'audit-actor') { state.auditFilters.actor = target.value; renderPage(); }
  if (target.id === 'audit-origin') { state.auditFilters.origin = target.value; renderPage(); }
  if (target.id === 'audit-severity') { state.auditFilters.severity = target.value; renderPage(); }
  if (target.id === 'review-requires-cause') { syncScrapReview(); renderPage(); }
  if (target.id === 'tv-duration') { state.tvDuration = Number(target.value); renderTvMode(); }
});
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
if (queryParams.get('tv') === '1' && state.route === 'dashboard') enterTvMode();
