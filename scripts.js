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

const partNumbers = ['EAJ65714501', 'EAY65769201', 'EAJ66284201', 'EBR85875402', 'EBR89032104', 'EAJ65987304', 'EAJ66124008', 'EAJ65871302', 'EBR88410211', 'EBR87941306', 'EAJ66310007', 'EBR90221003', 'EAJ66048109', 'EBR89273012', 'EAJ65600418', 'EBR87145021', 'EAJ66490005', 'EBR89916010'];
const components = ['Tela LCD', 'Placa principal PCB', 'Moldura frontal', 'Fonte de alimentação', 'Alto-falante'];
const organizationCodes = ['ORG-01', 'ORG-02', 'ORG-03'];
const accounts = ['541101', '541205', '541310', '541420', '541535', '541640'];
const accountDescriptions = ['Consumo de material', 'Ajuste de inventário', 'Requisição de retrabalho', 'Perda de processo', 'Scrap de qualidade', 'Ajuste de devolução'];
const subinventoryGroups = ['Produção', 'Qualidade', 'Retrabalho'];
const subinventories = ['SUB-PRD-01', 'SUB-QLT-01', 'SUB-RWK-01', 'SUB-PRD-02'];
const warehouseMarkets = ['Mercado A', 'Mercado B', 'Mercado C'];
const receiptDepartments = ['Recebimento 01', 'Recebimento 02', 'Recebimento 03'];
const scrapLines = ['Linha de Scrap 01', 'Linha de Scrap 02', 'Linha de Scrap 03', 'Linha de Scrap 04', 'Linha de Scrap 05'];
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
      partNumber: partNumbers[i % partNumbers.length], itemDescription: itemDescriptions[i % itemDescriptions.length], itemSpec: itemSpecs[i % itemSpecs.length],
      component: scenario.component,
      defect: scenario.defect, occurrence: scenario.occurrence, station: scenario.station,
      qty, issuePrice, issueAmount, exchangeRate: exchange, ifCost: exchange ? issueAmount / exchange : 0,
      source: 'GERP',
      executionId: i < 18 ? 'EXE-20260811-0042' : `EXE-202608${String(day).padStart(2, '0')}-${String(46 - (i % 15)).padStart(4, '0')}`,
      processingStatus: !exchange ? 'Pendente' : i % 17 === 6 ? 'Rejeitado' : 'Validado',
      batch: `BAT-202608-${String(Math.floor(i / 12) + 1).padStart(3, '0')}`,
      processedAt: `${String(day).padStart(2, '0')}/08/2026 05:${String((i * 3) % 60).padStart(2, '0')}`,
      review: {
        status: i > 0 && i % 13 === 0 && exchange ? 'Justificado' : 'Pendente de revisão',
        category: i > 0 && i % 13 === 0 && exchange ? scenario.category : '', reason: i > 0 && i % 13 === 0 && exchange ? scenario.occurrence : '',
        requiresCause: i > 0 && i % 26 === 0 && exchange, classification4m: i > 0 && i % 26 === 0 && exchange ? scenario.classification4m : [], rootCause: i > 0 && i % 26 === 0 && exchange ? scenario.rootCause : '',
        corrective: i > 0 && i % 13 === 0 && exchange ? scenario.corrective : '', preventive: i > 0 && i % 26 === 0 && exchange ? scenario.preventive : '', responsible: 'Analista de Qualidade', evidence: [], includeInReport: Boolean(i > 0 && i % 13 === 0 && exchange),
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
  rows.forEach((row) => { row.issueAmount = row.issuePrice * row.qty; row.ifCost = row.exchangeRate ? row.issueAmount / row.exchangeRate : 0; });
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
    type: types[i % types.length], component, partNumber,
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
    status: i === 0 ? 'Parcial' : i === 7 ? 'Falha' : 'Concluído', scheduled: true, retryCount: 0, contingencyAvailable: false,
  }));
}

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
  transactions: generateTransactions(), alerts: [], executions: generateExecutions(), audit: generateAudit(),
  reports: Array.from({ length: 8 }, (_, i) => ({ id: `REP-2026-W${String(33 - Math.floor(i / 2)).padStart(2, '0')}-v${8 - i}`, version: `v1.${8 - i}`, type: i % 3 === 0 ? 'Mensal' : 'Semanal', period: i % 3 === 0 ? 'Ago/2026' : '03–09 Ago', generatedAt: `${10 - (i % 4)}/08 08:${54 - i}`, author: 'Analista de Qualidade', ifCost: 47820 + i * 870, format: i % 2 ? 'XLSX' : 'PDF', status: i === 7 ? 'Rascunho' : 'Publicado', reviewIds: i < 3 ? ['TX-20260810-82168','TX-20260809-82155'] : [] })),
  sends: Array.from({ length: 6 }, (_, i) => ({ report: `v1.${8 - i}`, recipient: i % 2 ? 'qualidade@exemplo.local' : 'gestores@exemplo.local', channel: 'E-mail', requestedAt: `${10 - i}/08 09:10`, status: i === 2 ? 'Falha' : i === 4 ? 'Pendente' : 'Enviado', attempts: i === 2 ? 2 : 1 })),
  settings: { target: -15, baseline: 2025, year: 2026, upload: true, validation: true, reportFrequency: 'Semanal', notifyCritical: true },
};
model.alerts = generateAlerts();

const initialRouteParts = (location.hash.slice(1) || 'dashboard').split('?')[0].split('/');
const initialReviewId = initialRouteParts[0] === 'scrap' && initialRouteParts[1] === 'revisar' ? decodeURIComponent(initialRouteParts[2] || '') : null;
const supportedLocales = ['pt-BR', 'en', 'ko'];
const storedLocale = localStorage.getItem('hanaro-locale');
const queryLocale = new URLSearchParams(location.search).get('lang');
const state = {
  route: initialRouteParts[0] || 'dashboard', reportTab: 'gerar', settingsTab: 'negocio',
  locale: supportedLocales.includes(queryLocale) ? queryLocale : supportedLocales.includes(storedLocale) ? storedLocale : 'pt-BR',
  scrapPage: 1, scrapPageSize: 10, scrapSearch: '', scrapSort: { key: 'transactionDate', direction: 'desc' }, auditSearch: '', dashboardFactor: 1,
  dashboardFilters: { period: '01/08/2026 — 12/08/2026', view: 'Acumulado', item: 'Todos', partNumber: 'Todos', scrapLine: 'Todas' },
  scrapFilters: { date: 'Todas as datas', accountAlias: 'Todos', processingStatus: 'Todos', reviewStatus: 'Todos' },
  scrapAdvancedFilters: { organizationCode: 'Todas', subinventoryGroup: 'Todos', subinventory: 'Todos', warehouseMarket: 'Todos', receiptDepartment: 'Todos', partNumber: 'Todos' },
  alertFilters: { period: 'Últimos 7 dias', severity: 'Todas', type: 'Todos', item: 'Todos', status: 'Todos' },
  executionStatus: 'Todos', auditEntity: 'Todas', reportFactor: 1,
  scrapView: initialRouteParts[1] === 'revisar' ? 'review' : 'list', selectedScrapIds: initialReviewId ? [initialReviewId] : [], activeReviewId: initialReviewId,
  tvActive: false, tvPanel: 0, tvPaused: false, tvRotation: true, tvDuration: 15,
  context: { source: null, component: null, partNumber: null, scrapLine: null, transactionId: null, alertId: null, executionId: null },
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
  return ({ component: 'Componente', partNumber: 'Part Number', scrapLine: 'Linha do scrap', transactionId: 'Transação', alertId: 'Alerta', executionId: 'Execução', source: 'Origem' })[key] || key;
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
    if (data.target) series.push({ name: 'Meta', type: 'line', data: Array.isArray(data.target) ? data.target : Array(count).fill(data.target), symbol: 'none', lineStyle: { width: 1.5, type: 'dashed', color: muted }, itemStyle: { color: muted } });
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

function renderDashboard() {
  const filters = state.dashboardFilters;
  const dashboardRows = model.transactions.filter((row) =>
    (filters.period !== 'Últimos 7 dias' || Number(row.transactionDate.slice(0, 2)) >= 6) &&
    (filters.item === 'Todos' || row.component === filters.item) &&
    (filters.partNumber === 'Todos' || row.partNumber === filters.partNumber) &&
    (filters.scrapLine === 'Todas' || row.scrapLine === filters.scrapLine));
  const total = dashboardRows.reduce((sum, row) => sum + row.ifCost, 0);
  const fullTotal = model.transactions.reduce((sum, row) => sum + row.ifCost, 0);
  const factor = fullTotal ? total / fullTotal : 0;
  state.dashboardFactor = factor;
  const previousTotal = 212300 * factor;
  const targetTotal = previousTotal * (1 + model.settings.target / 100);
  const reduction = previousTotal ? (total / previousTotal - 1) * 100 : 0;
  const gapPp = reduction - model.settings.target;
  const gapCost = total - targetTotal;
  const gapDetail = `${formatCurrency(Math.abs(gapCost))} ${gapCost >= 0 ? 'acima' : 'abaixo'} da meta do período`;
  const totalQty = dashboardRows.reduce((sum, row) => sum + row.qty, 0);
  const offenders = aggregateTransactions(dashboardRows, 'component').slice(0, 3);
  const evolution = buildDashboardEvolution(dashboardRows, filters.view);
  const fields = field('Período', 'dash-period', ['01/08/2026 — 12/08/2026', 'Últimos 7 dias', 'Agosto/2026'], filters.period) + field('Visão', 'dash-view', ['Acumulado', 'Diário', 'Semanal', 'Mensal'], filters.view) + field('Item / Componente', 'dash-item', ['Todos', ...components], filters.item) + field('Part Number', 'dash-part-number', ['Todos', ...partNumbers], filters.partNumber) + field('Linha do scrap', 'dash-scrap-line', ['Todas', ...scrapLines], filters.scrapLine);
  const attention = dashboardRows.filter((row) => row.ifCost > 1800).sort((a, b) => b.ifCost - a.ifCost).slice(0, 5).map((row) => `<tr><td>${row.transactionDate.slice(0,5)}</td><td><strong>${row.partNumber}</strong><small class="cell-stack">${row.itemDescription}</small></td><td>${row.component}</td><td>${row.scrapLine}</td><td class="number">${row.qty}</td><td class="number"><strong>${formatCurrency(row.ifCost)}</strong></td><td>${badge(row.review.status)}</td><td><div class="table-actions">${button('Ver na Base','dashboard-row-explore',{small:true,id:row.id})}${button(row.review.status==='Justificado'?'Ver revisão':'Revisar','dashboard-row-review',{small:true,primary:true,id:row.id})}</div></td></tr>`).join('');
  const offenderCards = offenders.length ? offenders.map((item) => {
    const share = total ? item.value / total * 100 : 0;
    return `<article class="offender-row"><div class="offender-main"><div class="offender-copy"><strong>${item.label}</strong><small>${formatNumber(item.qty)} un. · ${item.count} registros</small></div><div class="offender-impact"><small>Impacto no período</small><b>${formatCurrency(item.value, true)}</b></div></div><div class="offender-meta"><span>${share.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% do IF Cost</span>${button('Ver na Base','dashboard-explore',{small:true,id:item.label,icon:'chevronRight'})}</div></article>`;
  }).join('') : '<div class="empty-state compact">Nenhum registro para os filtros selecionados.</div>';
  return `<section class="page-stack">${pageHeader('Dashboard de Scrap', `${button('Atualizar','refresh-dashboard',{icon:'refresh'})}${button('Exportar dados','export-dashboard',{icon:'download'})}${button('Gerar relatório','go-reports',{icon:'report'})}`)}<section class="automation-banner">${icon('refresh')}<div><strong>Fluxo automatizado ativo</strong><span>GERP → processamento Hanaro → indicadores → investigação → relatório</span></div><small>Última execução concluída às 05:08</small></section>${filtersPanel(fields, `<button class="link-button" data-action="clear-dashboard">Limpar filtros</button>`)}<section class="kpi-grid">${kpiCard('IF Cost acumulado', formatCurrency(total), filters.period)}${kpiCard('Mesmo período 2025', formatCurrency(previousTotal), 'Comparação com o ano anterior', '', 'PY significa Previous Year (ano anterior). Este valor representa o IF Cost do mesmo intervalo de datas de 2025 e serve como referência para calcular a redução de 2026.')}${kpiCard('Redução vs 2025', formatPercentage(reduction), `Meta do período: ${formatPercentage(model.settings.target)}`, 'success', 'Compara o IF Cost atual com o mesmo período de 2025. Quanto maior a redução do custo, melhor. A meta é reduzir 15%; o gap mostra quanto ainda falta em pontos percentuais.')}${kpiCard('Gap para meta', `${Math.abs(gapPp).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p.`, gapDetail, gapCost >= 0 ? 'danger' : 'success')}${kpiCard('Scrap registrado', `${formatNumber(totalQty)} un.`, `${dashboardRows.length} transações`)}</section><section class="content-grid"><article class="panel"><header class="panel-header"><div><h2>Evolução diária do IF Cost</h2><p class="panel-description">Comparativo automático 2026, 2025 e meta</p></div></header><div class="chart-legend"><span class="legend-key" style="--key:var(--chart-main)">2026</span><span class="legend-key" style="--key:var(--chart-secondary)">2025</span><span class="legend-key" style="--key:var(--app-text-muted)">Meta fixa</span></div>${lineChart(evolution.current,evolution.previous,evolution.target)}</article><article class="panel offender-panel"><header class="panel-header"><div><h2 class="metric-title">Top ofensores <span class="metric-help" tabindex="0" role="button" aria-label="Como o IF Cost é calculado"><b aria-hidden="true">!</b><span class="metric-tooltip" role="tooltip"><strong>O que é IF Cost?</strong> É o custo das perdas internas de produção. Cada registro considera o valor local do scrap convertido para USD pela taxa de câmbio aplicável. O ranking soma esse custo por componente e ordena do maior para o menor.</span></span> IF Cost</h2><p class="panel-description">Ponto de partida para investigação</p></div></header>${offenderCards}</article></section><section class="content-grid equal"><article class="panel"><header class="panel-header"><h2>Pareto de Part Numbers</h2></header>${barList(aggregateTransactions(dashboardRows,'partNumber').slice(0,5))}</article><article class="panel"><header class="panel-header"><h2>IF Cost por linha de scrap</h2></header>${barList(aggregateTransactions(dashboardRows,'scrapLine'))}</article></section>${tablePanel('Ocorrências que exigem atenção',[{label:'Data'},{label:'Part Number / Descrição'},{label:'Componente'},{label:'Linha do scrap'},{label:'QTY',number:true},{label:'IF Cost',number:true},{label:'Status da revisão'},{label:'Ações'}],attention)}</section>`;
}

function filteredTransactions() {
  const q = state.scrapSearch.toLowerCase();
  const contextualAlert = state.context.alertId ? model.alerts.find((alert) => alert.id === state.context.alertId) : null;
  let data = model.transactions.filter((t) =>
    (!q || [t.id,t.partNumber,t.itemDescription,t.component,t.accountAlias,t.executionId].some((v) => String(v).toLowerCase().includes(q))) &&
    (state.scrapFilters.date==='Todas as datas'||state.scrapFilters.date==='Agosto/2026'||(state.scrapFilters.date==='Hoje'&&t.transactionDate==='12/08/2026')||(state.scrapFilters.date==='Últimos 7 dias'&&Number(t.transactionDate.slice(0,2))>=6)) &&
    (state.scrapFilters.accountAlias==='Todos'||t.accountAlias===state.scrapFilters.accountAlias) &&
    (state.scrapFilters.processingStatus==='Todos'||t.processingStatus===state.scrapFilters.processingStatus) &&
    (state.scrapFilters.reviewStatus==='Todos'||t.review.status===state.scrapFilters.reviewStatus) &&
    (state.scrapAdvancedFilters.organizationCode==='Todas'||t.organizationCode===state.scrapAdvancedFilters.organizationCode) &&
    (state.scrapAdvancedFilters.subinventoryGroup==='Todos'||t.subinventoryGroup===state.scrapAdvancedFilters.subinventoryGroup) &&
    (state.scrapAdvancedFilters.subinventory==='Todos'||t.subinventory===state.scrapAdvancedFilters.subinventory) &&
    (state.scrapAdvancedFilters.warehouseMarket==='Todos'||t.warehouseMarket===state.scrapAdvancedFilters.warehouseMarket) &&
    (state.scrapAdvancedFilters.receiptDepartment==='Todos'||t.receiptDepartment===state.scrapAdvancedFilters.receiptDepartment) &&
    (state.scrapAdvancedFilters.partNumber==='Todos'||t.partNumber===state.scrapAdvancedFilters.partNumber) &&
    (!state.context.component || t.component === state.context.component) &&
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
  if(state.scrapView==='review') return renderScrapReview();
  const filtered = filteredTransactions(), start = (state.scrapPage-1)*state.scrapPageSize, data = filtered.slice(start,start+state.scrapPageSize);
  const rows = data.map((t) => `<tr data-row-id="${t.id}" data-row-type="transaction" class="${state.selectedScrapIds.includes(t.id)?'selected-row':''}" title="${t.occurrence}"><td><input type="checkbox" data-action="toggle-scrap" data-id="${t.id}" aria-label="Selecionar ${t.id}" ${state.selectedScrapIds.includes(t.id)?'checked':''}></td><td>${t.transactionDate}</td><td>${t.organizationCode}</td><td>${t.accountAlias}</td><td><strong>${t.partNumber}</strong><small class="cell-stack">${t.itemDescription}</small></td><td>${t.component}</td><td class="number">${t.qty}</td><td class="number"><strong>${t.ifCost ? formatCurrency(t.ifCost) : '—'}</strong></td><td>${badge(t.processingStatus)}</td><td>${badge(t.review.status)}</td><td>${button(t.review.status==='Justificado'?'Ver revisão':'Revisar','review-one',{small:true,id:t.id})}</td></tr>`).join('');
  const ifCost=filtered.reduce((sum,row)=>sum+row.ifCost,0),qty=filtered.reduce((sum,row)=>sum+row.qty,0),share=ifCost/model.transactions.reduce((sum,row)=>sum+row.ifCost,0)*100;
  const ranking=aggregateTransactions(filtered,'partNumber').slice(0,8);
  const selected=model.transactions.filter(row=>state.selectedScrapIds.includes(row.id));
  const sortLabel=(label,key)=>`<button class="sort-button" data-action="sort-scrap" data-key="${key}">${label}${state.scrapSort.key===key?(state.scrapSort.direction==='asc'?' ↑':' ↓'):''}</button>`;
  const selectionBar=selected.length?`<section class="selection-bar"><div><strong>${selected.length} registro${selected.length>1?'s':''} selecionado${selected.length>1?'s':''}</strong><span>${formatNumber(selected.reduce((sum,row)=>sum+row.qty,0))} un. · ${formatCurrency(selected.reduce((sum,row)=>sum+row.ifCost,0))}</span></div>${button('Limpar seleção','clear-scrap-selection')}${button('Justificar selecionados','review-selected',{primary:true,icon:'check'})}</section>`:'';
  return `<section class="page-stack">${pageHeader('Base de Scrap',button('Exportar dados','export-scrap',{icon:'download'}))}<section class="filter-panel context-panel scrap-filter-panel">${contextTrail()}<div class="scrap-search-row"><div class="search-wrap scrap-search">${icon('search')}<input class="search-control" id="scrap-search" value="${state.scrapSearch}" placeholder="Buscar Part Number, descrição ou ID..." aria-label="Buscar registros de scrap"></div><button class="btn" data-action="more-filters">${icon('filter')}Mais filtros</button></div><div class="scrap-filter-grid">${field('Data da transação','scrap-date',['Todas as datas','Hoje','Últimos 7 dias','Agosto/2026'],state.scrapFilters.date)}${field('Tipo de movimentação','scrap-account-alias',['Todos',...aliases],state.scrapFilters.accountAlias)}${field('Status do registro','scrap-processing-status',['Todos','Validado','Rejeitado','Pendente'],state.scrapFilters.processingStatus)}${field('Status da revisão','scrap-review-status',['Todos','Pendente de revisão','Em revisão','Justificado'],state.scrapFilters.reviewStatus)}</div></section>${selectionBar}<section class="kpi-grid">${kpiCard('IF Cost filtrado',formatCurrency(ifCost))}${kpiCard('QTY filtrada',formatNumber(qty))}${kpiCard('Participação no total',`${share.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`)}${kpiCard('Pendentes de revisão',formatNumber(filtered.filter(row=>row.review.status!=='Justificado').length))}${kpiCard('Justificados',formatNumber(filtered.filter(row=>row.review.status==='Justificado').length))}</section><section class="panel ranking-panel"><header class="panel-header"><div><h2>Ranking de Part Numbers</h2><p class="panel-description">Use o ranking para filtrar; selecione registros na tabela para justificá-los.</p></div></header><div class="ranking-grid">${ranking.map((item,index)=>`<button class="ranking-item" data-action="drill-part" data-id="${item.label}"><span>${index+1}</span><div><strong>${item.label}</strong><small>${item.count} registros · ${formatNumber(item.qty)} un.</small><i><b style="width:${item.value/ranking[0].value*100}%"></b></i></div><em>${formatCurrency(item.value)}</em>${icon('chevronRight')}</button>`).join('')||'<div class="empty-state">Nenhum Part Number no contexto atual.</div>'}</div></section>${tablePanel('Registros de scrap',[{label:`<input type="checkbox" data-action="select-visible-scrap" aria-label="Selecionar registros visíveis" ${data.length&&data.every(row=>state.selectedScrapIds.includes(row.id))?'checked':''}>`},{label:sortLabel('Data','transactionDate')},{label:'Organização'},{label:'Tipo de movimentação'},{label:sortLabel('Part Number / Descrição','partNumber')},{label:'Componente'},{label:sortLabel('QTY','qty'),number:true},{label:sortLabel('IF Cost','ifCost'),number:true},{label:'Status do registro'},{label:'Revisão'},{label:'Ação'}],rows,{pagination:pagination(filtered.length)})}</section>`;
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
  const list=selected.map((item,index)=>`<button class="review-list-item ${item.id===row.id?'active':''}" data-action="select-review-item" data-id="${item.id}"><span>${index+1}</span><div><strong>${item.partNumber}</strong><small>${item.itemDescription}</small><small>${item.id} · ${item.scrapLine}</small></div>${badge(item.review.status)}</button>`).join('');
  return `<section class="page-stack review-subpage">${pageHeader('Revisar registros de scrap',`${button('Voltar para a Base','back-scrap',{icon:'chevronLeft'})}${button('Salvar rascunho','save-scrap-review')}${button(`Concluir ${selected.length} revisão${selected.length>1?'ões':''}`,'conclude-scrap-review',{primary:true,icon:'check'})}`)}<div class="review-context"><span>Base de Scrap</span>${icon('chevronRight')}<strong>${selected.length} registro${selected.length>1?'s':''} selecionado${selected.length>1?'s':''}</strong></div><div class="review-layout"><aside class="review-list"><header><h2>Seleção</h2><p>A justificativa pode ser revisada item a item.</p></header>${list}<footer><strong>${formatCurrency(selected.reduce((sum,item)=>sum+item.ifCost,0))}</strong><span>${formatNumber(selected.reduce((sum,item)=>sum+item.qty,0))} unidades</span></footer></aside><article class="review-workspace"><section class="review-facts"><header><div><span class="block-kicker">Registro de scrap</span><h2>${row.partNumber} · ${row.itemDescription}</h2><p>${row.id}</p></div>${badge(review.status)}</header><div class="meta-grid">${[['Data',row.transactionDate],['Organização',row.organizationCode],['Linha do scrap',row.scrapLine],['Componente',row.component],['Subinventário',row.subinventory],['QTY',`${row.qty} un.`],['IF Cost',formatCurrency(row.ifCost)],['Origem',row.source],['Execução',row.executionId]].map(([label,value])=>`<div class="meta-item"><small>${label}</small><strong>${value}</strong></div>`).join('')}</div></section><section class="review-form"><header><div><span class="block-kicker">Revisão humana</span><h2>Justificativa do scrap</h2><p>Explique por que o item foi registrado como scrap. Os campos serão auditados.</p></div><label class="checkbox-row"><input id="review-include-report" type="checkbox" ${review.includeInReport?'checked':''}> Incluir no próximo relatório</label></header><div class="form-grid">${field('Categoria da justificativa','review-category',['Selecione...','Material','Processo','Máquina','Mão de obra','Engenharia','Fornecedor','Outro'],review.category)}<div class="field"><label for="review-responsible">Revisor responsável</label><input class="control" id="review-responsible" value="${review.responsible}"></div><div class="field full"><label for="review-reason">Justificativa obrigatória</label><textarea class="control" id="review-reason" placeholder="Descreva o motivo deste registro de scrap...">${review.reason}</textarea></div><div class="field full"><label class="checkbox-row cause-toggle"><input id="review-requires-cause" type="checkbox" ${review.requiresCause?'checked':''}> Este item exige análise de causa detalhada</label><p class="field-help">Ative somente quando a justificativa simples não for suficiente para explicar o scrap.</p></div>${review.requiresCause?`<div class="field full"><span class="field-label">Classificação 4M</span><div class="choice-group">${['Machine','Method','Material','Man'].map(value=>`<button class="choice ${review.classification4m.includes(value)?'selected':''}" data-action="toggle-review-4m" data-value="${value}">${value}</button>`).join('')}</div></div><div class="field full"><label for="review-root-cause">Causa identificada</label><textarea class="control" id="review-root-cause" placeholder="Registre a causa validada...">${review.rootCause}</textarea></div><div class="field"><label for="review-corrective">Ação corretiva</label><input class="control" id="review-corrective" value="${review.corrective}" placeholder="Ação imediata"></div><div class="field"><label for="review-preventive">Ação preventiva</label><input class="control" id="review-preventive" value="${review.preventive}" placeholder="Prevenção de recorrência"></div>`:''}</div><section class="review-evidence"><header><div><h3>Evidências (${review.evidence.length})</h3><p>Fotos, documentos ou comentários vinculados ao registro.</p></div>${button('Adicionar evidência','add-review-evidence',{small:true,icon:'plus'})}</header>${review.evidence.length?review.evidence.map(item=>`<span class="badge brand">${icon('file')}${item}</span>`).join(' '):'<div class="review-empty">Nenhuma evidência adicionada.</div>'}</section></section>${selected.length>1?`<label class="apply-all"><input id="review-apply-all" type="checkbox" checked><span><strong>Aplicar esta justificativa aos ${selected.length} registros selecionados</strong><small>Você ainda pode abrir cada item e ajustar dados individuais antes de concluir.</small></span></label>`:''}</article></div></section>`;
}

function renderAlerts() {
  const filters=state.alertFilters;
  const visible=model.alerts.filter(a=>{const day=Number(a.dateTime.slice(0,2));return (filters.period==='Últimos 30 dias'||(filters.period==='Últimos 7 dias'&&day>=6)||(filters.period==='Hoje'&&day===12))&&(filters.severity==='Todas'||a.severity===filters.severity)&&(filters.type==='Todos'||a.type===filters.type)&&(filters.item==='Todos'||a.component===filters.item||a.partNumber===filters.item)&&(filters.status==='Todos'||a.status===filters.status)});
  const rows=visible.map(a=>`<tr data-row-id="${a.id}" data-row-type="alert"><td>${badge(a.severity)}</td><td>${a.dateTime}</td><td><strong>${a.type}</strong><small class="cell-stack">${a.id}</small></td><td><strong>${a.partNumber}</strong><small class="cell-stack">${a.component}</small><small class="cell-stack">${a.transactionIds.length} registros</small></td><td class="number"><strong>${formatCurrency(a.impact)}</strong></td><td class="cell-ellipsis">${a.description}</td><td>${badge(a.status)}</td><td>${a.channel}</td><td>${button('Ver registros','alert-transactions',{small:true,primary:true,id:a.id})}</td></tr>`).join('');
  const alertTypes=[...new Set(model.alerts.map(alert=>alert.type))];
  const fields=field('Período','alert-period',['Últimos 7 dias','Hoje','Últimos 30 dias'],filters.period)+field('Severidade','alert-severity',['Todas','Crítico','Alto','Médio'],filters.severity)+field('Tipo','alert-type',['Todos',...alertTypes],filters.type)+field('Item / Componente','alert-item',['Todos',...components,...partNumbers],filters.item)+field('Status','alert-status',['Todos','Novo','Lido','Arquivado'],filters.status);
  const alertsByType=[...visible.reduce((map,alert)=>map.set(alert.type,(map.get(alert.type)||0)+1),new Map())].map(([label,value])=>({label,value,display:`${value} alertas`})).sort((a,b)=>b.value-a.value);
  return `<section class="page-stack">${pageHeader('Alertas',`${button('Atualizar','refresh-alerts',{icon:'refresh'})}${button('Exportar','export-alerts',{icon:'download'})}${button('Marcar novos como lidos','read-alerts',{primary:true})}`)}${filtersPanel(fields)}<section class="kpi-grid">${kpiCard('Novos',String(model.alerts.filter(a=>a.status==='Novo').length),'Notificações ainda não abertas','danger')}${kpiCard('Críticos','6','','danger')}${kpiCard('Lidos',String(model.alerts.filter(a=>a.status==='Lido').length))}${kpiCard('Enviados por e-mail',String(model.alerts.filter(a=>a.channel.includes('E-mail')).length))}</section><section class="content-grid equal"><article class="panel"><header class="panel-header"><h2>Alertas por dia</h2></header>${barList(['06/08','07/08','08/08','09/08','10/08','11/08','12/08'].map((d,i)=>({label:d,value:[3,6,4,8,5,7,10][i],display:`${[3,6,4,8,5,7,10][i]} alertas`})))}</article><article class="panel"><header class="panel-header"><div><h2>Alertas por tipo</h2><p class="panel-description">Alertas apenas comunicam eventos; a revisão ocorre na Base de Scrap.</p></div></header>${barList(alertsByType)}</article></section>${tablePanel('',[{label:'Severidade'},{label:'Data/Hora'},{label:'Evento'},{label:'Item / Componente'},{label:'Impacto',number:true},{label:'Descrição'},{label:'Leitura'},{label:'Canal'},{label:'Ação'}],rows)}</section>`;
}

function renderReports() {
  const tabs=`<div class="tabs" role="tablist">${[['gerar','Gerar relatório'],['versoes','Versões'],['envios','Envios']].map(([id,l])=>`<button class="tab ${state.reportTab===id?'active':''}" data-action="report-tab" data-id="${id}">${l}</button>`).join('')}</div>`;
  let content='';
  const reviewed=model.transactions.filter(row=>row.review.status==='Justificado');
  const included=reviewed.filter(row=>row.review.includeInReport);
  if(state.reportTab==='gerar') content=`<div class="report-builder"><section><div class="form-grid">${field('Tipo','report-type',['Semanal','Diário','Mensal'],'Semanal')}<div class="field"><label>Período</label><input class="control" id="report-period" value="Semana W33 · 10/08/2026 — 16/08/2026"></div>${field('Comparação','report-compare',['Acumulado 2026 vs 2025','Mesmo período 2025','Sem comparação'])}<div class="field full"><label for="report-observation">Observação do responsável</label><textarea class="control" id="report-observation" placeholder="Comentário opcional para contextualizar o período..."></textarea></div><div class="field full"><span class="field-label">Conteúdo consolidado</span>${['Indicadores e comparativo','Top ofensores','Scraps revisados e suas justificativas'].map(x=>`<label class="checkbox-row"><input type="checkbox" checked> ${x}</label>`).join('')}</div></div><section class="report-analysis-list"><header><div><h2>Registros justificados do período</h2><p>Somente scraps revisados podem compor o relatório.</p></div>${badge(`${included.length} incluídos`,'brand')}</header>${reviewed.map(row=>`<article><button class="report-check ${row.review.includeInReport?'selected':''}" data-action="toggle-report-review" data-id="${row.id}" aria-pressed="${row.review.includeInReport}">${icon('check')}</button><div><strong>${row.partNumber} · ${row.component}</strong><small>${row.review.category} · ${row.review.reason} · ${formatCurrency(row.ifCost)}</small></div>${button('Ver revisão','open-report-review',{small:true,id:row.id})}</article>`).join('')||'<div class="empty-state">Nenhum registro justificado no período.</div>'}</section></section><aside><div class="report-preview"><small class="block-kicker">Preview · W33</small><h2>Relatório de Material Scrap</h2><div class="preview-comparison"><div><small>IF COST REVISADO</small><div class="preview-value">${formatCurrency(included.reduce((sum,row)=>sum+row.ifCost,0)*state.reportFactor)}</div></div><div><small>${included.length} registros</small><div class="positive">Justificados</div></div></div>${lineChart([5,7,6,9,8,11].map(v=>v*state.reportFactor),[4,5,4.5,7,6,9],0,125)}<h3>Justificativas predominantes</h3>${barList(aggregateTransactions(included.length?included:reviewed,'component').slice(0,3))}<div class="preview-foot"><span>${included.length} scraps incluídos</span><span>Revisões rastreáveis</span></div></div><div class="inline-actions report-actions">${button('Gerar PDF','generate-pdf',{icon:'report'})}${button('Gerar Excel','generate-excel',{icon:'download'})}${button('Gerar e registrar versão','register-report',{primary:true,icon:'check'})}</div></aside></div>`;
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
  return `<section class="page-stack">${pageHeader('Auditoria',button('Exportar eventos','export-audit',{icon:'download'}))}<section class="filter-panel"><div class="search-wrap">${icon('search')}<input class="search-control" id="audit-search" value="${state.auditSearch}" placeholder="Buscar ID, usuário, entidade ou descrição..."></div><div class="filters">${field('Período','audit-period',['Hoje','Últimos 7 dias'])+field('Ator','audit-actor',['Todos','analista.qualidade','hanaro-backend'])+field('Tipo','audit-type',['Todos','Humano','Automático'])+field('Entidade','audit-entity',['Todas','Transaction','Execution','Alert','Report'],state.auditEntity)+field('Severidade','audit-severity',['Todas','Informativo','Crítico'])}</div></section><section class="kpi-grid">${kpiCard('Eventos hoje',formatNumber(284))}${kpiCard('Ações humanas','73')}${kpiCard('Eventos automáticos','211')}${kpiCard('Eventos críticos','3','','danger')}</section>${tablePanel('',[{label:'Timestamp'},{label:'Ator'},{label:'Origem'},{label:'Ação'},{label:'Entidade'},{label:'Identificador'},{label:'Estado anterior'},{label:'Estado posterior'},{label:'Correlation ID'}],rows)}</section>`;
}

function renderSettings() {
  const tabLabels=[['negocio','Negócio'],['dados','Dados'],['notificacoes','Notificações'],['acesso','Acesso'],['integracoes','Integrações'],['interface','Interface']];
  const tabs=`<div class="tabs">${tabLabels.map(([id,l])=>`<button class="tab ${state.settingsTab===id?'active':''}" data-action="settings-tab" data-id="${id}">${l}</button>`).join('')}</div>`;
  let content='';
  if(state.settingsTab==='negocio') content=`<article class="settings-card"><h2>Metas de Material Scrap</h2><p>Parâmetros usados nos comparativos de IF Cost.</p><div class="form-grid"><div class="field"><label>Baseline</label><input class="control" value="${model.settings.baseline}"></div><div class="field"><label>Meta de redução</label><input class="control" id="setting-target" value="${model.settings.target}%"></div><div class="field"><label>Ano</label><input class="control" value="${model.settings.year}"></div></div><div class="setting-row"><div><strong>Componentes prioritários</strong><p>1. Tela LCD · 2. Placa principal PCB · 3. Moldura frontal</p></div>${badge('Ativo')}</div></article>`;
  if(state.settingsTab==='dados') content=`<article class="settings-card"><h2>Regras de dados</h2><p>Parâmetros fictícios sujeitos à homologação.</p><div class="setting-row"><div><strong>Alias Codes</strong><p>${aliases.join(' · ')}</p></div>${badge('Sujeito à homologação','warning')}</div><div class="setting-row"><div><strong>Contingência pós-falha</strong><p>Liberada apenas por uma execução cujo reprocessamento também falhou.</p></div><button class="switch ${model.settings.upload?'on':''}" data-action="toggle-setting" data-key="upload" aria-label="Alternar contingência pós-falha"></button></div><div class="setting-row"><div><strong>Validação obrigatória</strong><p>Valida o arquivo antes da recuperação.</p></div><button class="switch ${model.settings.validation?'on':''}" data-action="toggle-setting" data-key="validation"></button></div></article>`;
  if(state.settingsTab==='notificacoes') content=tablePanel('',[{label:'Nome'},{label:'Grupo'},{label:'E-mail'},{label:'Tipo'},{label:'Status'}],[['Alertas críticos','Qualidade','qualidade@exemplo.local','Imediato','Ativo'],['Resumo semanal','Gestores','gestores@exemplo.local','Semanal','Ativo'],['Falhas de ingestão','Dados','dados@exemplo.local','Imediato','Pausado']].map(r=>`<tr>${r.map((v,i)=>`<td>${i===4?badge(v):v}</td>`).join('')}</tr>`).join(''));
  if(state.settingsTab==='acesso') content=tablePanel('',[{label:'Usuário'},{label:'Perfil'},{label:'Escopo'},{label:'Status'}],[['Usuário de demonstração','Analista','Revisão de scrap','Ativo'],['Gestor','Gestor','Indicadores e relatórios','Ativo'],['Consulta / Kiosk','Consulta / Kiosk','Visualização','Ativo'],['Administrador','Administrador','Configuração do protótipo','Inativo']].map(r=>`<tr>${r.map((v,i)=>`<td>${i===3?badge(v):v}</td>`).join('')}</tr>`).join(''));
  if(state.settingsTab==='integracoes') content=`<div class="settings-layout">${[['GERP','Configurado','12/08 05:00'],['Cotação','Operacional','12/08 00:05'],['Banco','Operacional','12/08 09:40'],['Relatórios','Operacional','12/08 08:54']].map(([n,s,d])=>`<article class="settings-card"><div class="setting-row" style="border:0;padding:0"><div><h2>${n}</h2><p>Última atualização: ${d}</p></div>${badge(s)}</div></article>`).join('')}</div>`;
  if(state.settingsTab==='interface') content=`<div class="interface-settings-grid"><article class="settings-card"><h2>Tema</h2><p>Escolha a aparência da interface.</p><div class="theme-options">${[['light','Claro'],['dark','Escuro'],['system','Sistema']].map(([id,l])=>`<button class="theme-card ${document.documentElement.dataset.themePreference===id?'selected':''}" data-action="set-theme" data-id="${id}" data-theme-choice="${id}"><span class="theme-swatch"><i></i><i></i></span><strong>${l}</strong></button>`).join('')}</div></article><article class="settings-card"><h2>Idioma</h2><p>Idioma exibido na interface do sistema.</p><label class="language-select settings-language-select"><span class="language-select-icon" aria-hidden="true">${icon('language')}</span><select id="settings-language" aria-label="Alterar idioma"><option value="pt-BR" ${state.locale==='pt-BR'?'selected':''}>Português</option><option value="en" ${state.locale==='en'?'selected':''}>English</option><option value="ko" ${state.locale==='ko'?'selected':''}>한국어</option></select></label></article></div>`;
  return `<section class="page-stack">${pageHeader('Configurações',button('Salvar alterações','save-settings',{primary:true,icon:'check'}))}${tabs}${content}</section>`;
}

function hydrateReviewProductionContext() {
  if (state.route !== 'scrap' || state.scrapView !== 'review') return;
  const row = model.transactions.find((item) => item.id === state.activeReviewId);
  const facts = $('.review-facts');
  if (!row || !facts) return;
  facts.insertAdjacentHTML('beforeend', `<article class="production-context"><div><span class="block-kicker">Ocorrência de produção</span><h3>${row.defect}</h3><p>${row.occurrence}</p></div><dl><div><dt>Componente afetado</dt><dd>${row.component}</dd></div><div><dt>Posto</dt><dd>${row.station}</dd></div></dl></article>`);
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

function hydrateDashboardView() {
  if (state.route !== 'dashboard') return;
  const preset = dashboardChartPresets[state.dashboardFilters.view] || dashboardChartPresets.Acumulado;
  const chartTitle = $('.content-grid .panel h2', $('#page-content'));
  if (chartTitle) chartTitle.textContent = preset.title;
}

const renderers={dashboard:renderDashboard,scrap:renderScrap,alertas:renderAlerts,relatorios:renderReports,execucoes:renderExecutions,auditoria:renderAudit,configuracoes:renderSettings};
function renderPage(){state.route=renderers[state.route]?state.route:'dashboard';pendingCharts=[];renderShell();$('#page-content').innerHTML=renderers[state.route]();hydrateReviewProductionContext();removeRedundantHelperCopy();hydrateDashboardView();$$('.automation-banner',$('#page-content')).forEach((card)=>card.remove());applyI18n(document);initCharts();$('#main-canvas').scrollTop=0;}
function navigateTo(route){location.hash=route;if(location.hash===`#${route}`){state.route=route;renderPage();}closeOverlay();closeMobileSidebar();}

function showToast(message,type='success'){
  const el=document.createElement('div');el.className=`toast ${type}`;el.innerHTML=`${icon(type==='error'?'alert':'check')}<div><strong>${type==='error'?'Ação não concluída':'Tudo certo'}</strong><div>${message}</div></div>`;$('#toast-region').append(el);applyI18n(el);setTimeout(()=>el.remove(),3500);
}
function openOverlay(html){const layer=$('#overlay-layer');layer.innerHTML=html;layer.style.display='flex';applyI18n(layer);const focusable=$('button,input,select,textarea',layer);focusable?.focus();}
function closeOverlay(){const layer=$('#overlay-layer');layer.innerHTML='';layer.style.display='';}
function modal(title,body,footer=''){return `<section class="modal" role="dialog" aria-modal="true" aria-label="${title}"><header class="modal-header"><h2>${title}</h2><button class="close-button" data-action="close-overlay" aria-label="Fechar">${icon('x')}</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section>`;}
function drawer(title,body,footer=''){return `<aside class="drawer" role="dialog" aria-modal="true" aria-label="${title}"><header class="drawer-header"><h2>${title}</h2><button class="close-button" data-action="close-overlay" aria-label="Fechar">${icon('x')}</button></header><div class="drawer-body">${body}</div>${footer?`<footer class="drawer-footer">${footer}</footer>`:''}</aside>`;}

function openTransaction(id) {
  const t = model.transactions.find((item) => item.id === id);
  if (!t) return;
  const scrapDetails = `<div class="inline-actions">${badge(t.review.status)}</div>
    <section class="detail-section"><h3>Defeito de produção</h3><dl class="detail-list">
      <div><dt>Componente afetado</dt><dd>${t.component}</dd></div><div><dt>Defeito observado</dt><dd>${t.defect}</dd></div>
      <div><dt>Posto</dt><dd>${t.station}</dd></div><div><dt>Ocorrência registrada</dt><dd>${t.occurrence}</dd></div>
    </dl></section>
    <section class="detail-section"><h3>Dados do scrap</h3><dl class="detail-list">
      <div><dt>Part Number</dt><dd>${t.partNumber}</dd></div><div><dt>Descrição do item</dt><dd>${t.itemDescription}</dd></div>
      <div><dt>Organização</dt><dd>${t.organizationCode}</dd></div><div><dt>Linha do scrap</dt><dd>${t.scrapLine}</dd></div><div><dt>Tipo de movimentação</dt><dd>${t.accountAlias}</dd></div><div><dt>QTY</dt><dd>${t.qty} un.</dd></div>
      <div><dt>IF Cost</dt><dd>${formatCurrency(t.ifCost)}</dd></div>
    </dl></section>
    ${t.review.status === 'Justificado' ? `<section class="detail-section"><h3>Justificativa registrada</h3><dl class="detail-list"><div><dt>Categoria</dt><dd>${t.review.category}</dd></div><div><dt>Justificativa</dt><dd>${t.review.reason}</dd></div><div><dt>Revisor</dt><dd>${t.review.responsible}</dd></div><div><dt>Relatório</dt><dd>${t.review.includeInReport ? 'Elegível para inclusão' : 'Não incluído'}</dd></div></dl></section>` : ''}
    <section class="detail-section"><h3>Rastreabilidade automática</h3><dl class="detail-list"><div><dt>Origem</dt><dd>${t.source}</dd></div><div><dt>Batch</dt><dd>${t.batch}</dd></div><div><dt>Execution ID</dt><dd>${t.executionId}</dd></div><div><dt>Processado em</dt><dd>${t.processedAt}</dd></div></dl></section>`;
  openOverlay(drawer(t.id, scrapDetails, `${button('Ver execução','open-related-execution',{id:t.executionId})}${button('Explorar Part Number','transaction-explore',{id:t.id})}${button(t.review.status==='Justificado'?'Ver revisão':'Revisar registro','review-one',{id:t.id,primary:true})}`));
}
function openAlert(id){const a=model.alerts.find(x=>x.id===id);if(!a)return;const before=a.status;if(a.status==='Novo'){a.status='Lido';addAudit('Visualizou alerta','Alert',a.id,before,'Lido');}openOverlay(drawer(a.type,`<div class="inline-actions">${badge(a.severity)}${badge(a.status)}</div><section class="detail-section"><h3>Evento notificado</h3><p>${a.description}</p><dl class="detail-list"><div><dt>Alerta</dt><dd>${a.id}</dd></div><div><dt>Impacto estimado</dt><dd>${formatCurrency(a.impact)}</dd></div><div><dt>Part Number</dt><dd>${a.partNumber}</dd></div><div><dt>Componente</dt><dd>${a.component}</dd></div><div><dt>Canal</dt><dd>${a.channel}</dd></div></dl></section><section class="detail-section"><h3>Registros relacionados</h3><p>${a.transactionIds.length?`${a.transactionIds.length} registros de scrap originaram esta notificação.`:'Nenhum registro diretamente vinculado.'}</p><p class="panel-description">A justificativa e a revisão são feitas na Base de Scrap.</p></section><section class="detail-section"><h3>Histórico da notificação</h3><ol class="timeline"><li>Condição detectada<small>${a.dateTime}</small></li><li>Notificação enviada<small>${a.channel}</small></li><li>Status: ${a.status}<small>Estado atual</small></li></ol></section>`,`${button('Arquivar alerta','archive-alert',{id:a.id})}${button('Ver registros de scrap','alert-transactions',{id:a.id,primary:true})}`));}
function openExecution(id){const e=model.executions.find(x=>x.id===id);if(!e)return;const steps=['Request automático iniciado','Arquivo localizado no GERP','Arquivo recebido','Validação estrutural','Normalização','Conversão','Persistência','Processamento concluído'];const failed=e.status==='Falha'||e.status==='Parcial';const footer=`${button('Ver registros processados','execution-records',{id:e.id})}${failed?button('Reprocessar','reprocess',{id:e.id,primary:true,icon:'refresh'}):''}${e.contingencyAvailable?button('Usar contingência','open-contingency',{id:e.id,icon:'upload'}):''}`;openOverlay(drawer(e.id,`<div class="inline-actions">${badge(e.status)}<span class="badge">${e.source}</span>${e.scheduled?badge('Agendada','info'):''}</div><section class="detail-section"><h3>Timeline automática</h3><ol class="timeline">${steps.map((s,i)=>`<li class="${failed&&i===5?'failed':''}">${s}<small>${i===5&&failed?'Taxa de câmbio não localizada':`Etapa ${i+1} registrada`}</small></li>`).join('')}</ol></section><section class="detail-section"><h3>Exceções</h3>${tablePanel('',[{label:'Tipo'},{label:'Registro'},{label:'Motivo'},{label:'Etapa'},{label:'Status'}],`<tr><td>Câmbio indisponível</td><td>TX-82194</td><td>Taxa não localizada</td><td>Conversão</td><td>${badge(e.status==='Concluído'?'Resolvido':'Pendente')}</td></tr><tr><td>Duplicidade</td><td>TX-82171</td><td>Registro já processado</td><td>Persistência</td><td>${badge('Ignorado')}</td></tr>`)}</section>${e.contingencyAvailable?`<section class="contingency-notice"><strong>Contingência liberada</strong><p>O reprocessamento falhou. Um arquivo operacional pode ser usado exclusivamente para recuperar esta execução.</p></section>`:''}`,footer));}
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
function tvHeader(panel) { return `<header class="tv-panel-header"><div><span class="tv-eyebrow">${panel.eyebrow}</span><h1>${panel.title}</h1></div><div class="tv-freshness"><strong>12 Ago 2026 · Atualizado às 14:32</strong><span>${icon('check')} Dados atualizados</span></div></header>`; }
function tvPanelContent(index) {
  const panel = tvPanels[index];
  if (index === 0) {
    const evolution = buildDashboardEvolution(model.transactions, 'Acumulado');
    const offenders = aggregateTransactions(model.transactions, 'component').slice(0, 3);
    return `${tvHeader(panel)}<div class="tv-kpi-grid">${tvKpi('IF Cost acumulado','US$ 184.260','Ago/2026')}${tvKpi('Redução vs 2025','-13,2%','US$ 28.040 abaixo','success')}${tvKpi('Meta 2026','-15,0%','Meta do período')}${tvKpi('Gap para meta','1,8 p.p.','US$ 3.805 acima da meta','danger')}</div><div class="tv-main-grid"><article class="tv-card tv-chart-card"><h2>Evolução do IF Cost — 2026 × 2025 × Meta fixa</h2>${lineChart(evolution.current,evolution.previous,evolution.target,330)}</article><article class="tv-card"><h2>Top 3 componentes afetados</h2>${barList(offenders)}</article></div><div class="tv-summary-strip"><strong>1.247</strong> unidades de scrap <i></i><strong>96</strong> transações <i></i><strong class="negative">6</strong> alertas críticos</div>`;
  }
  if (index === 1) { const linesRank=aggregateTransactions(model.transactions,'scrapLine'); const partsRank=aggregateTransactions(model.transactions,'partNumber'); return `${tvHeader(panel)}<div class="tv-offender-grid"><article class="tv-card"><h2>Pareto de defeitos por IF Cost</h2>${barList([{label:'Risco profundo no painel',value:38400},{label:'Falha no teste funcional',value:27600},{label:'Painel trincado por impacto',value:19100},{label:'Trinca no ponto de fixação',value:14800},{label:'Conector danificado',value:10700}])}</article><article class="tv-card"><h2>IF Cost por linha de scrap</h2>${barList(linesRank)}</article></div><div class="tv-highlight-grid"><article class="tv-highlight"><span>Part Number mais crítico</span><strong>${partsRank[0]?.label||'—'}</strong><b>${formatCurrency(partsRank[0]?.value||0)}</b><small class="negative">Maior impacto acumulado</small></article><article class="tv-highlight"><span>Defeito mais crítico</span><strong>Risco no painel</strong><b>39,3%</b><small>do IF Cost acumulado</small></article></div>`; }
  if (index === 2) { const priorities = model.alerts.filter(a => a.severity === 'Crítico' || a.severity === 'Alto').slice(0,3); const justified=model.transactions.filter(row=>row.review.status==='Justificado').length; return `${tvHeader(panel)}<div class="tv-priority-layout"><div class="tv-priority-list">${priorities.map((a,i)=>`<article class="tv-priority ${i===0?'critical':''}"><div><span>${badge(a.severity)}</span><strong>${a.partNumber}</strong></div><h2>${a.component}</h2><b>${formatCurrency(a.impact)}</b><p>${a.description}</p></article>`).join('')}</div><aside class="tv-card tv-analysis-status"><h2>Situação das revisões</h2><div class="tv-analysis-counts"><div><strong>${model.transactions.length-justified}</strong><span>Pendentes</span></div><div><strong>${model.transactions.filter(row=>row.review.status==='Em revisão').length}</strong><span>Em revisão</span></div><div><strong>${justified}</strong><span>Justificadas</span></div></div><h2>Categorias predominantes</h2>${barList([{label:'Material',value:42,display:'42%'},{label:'Processo',value:27,display:'27%'},{label:'Máquina',value:19,display:'19%'},{label:'Outros',value:12,display:'12%'}])}</aside></div>`; }
  return `${tvHeader(panel)}<div class="tv-trend-layout"><article class="tv-card tv-chart-card"><h2>Evolução acumulada no ano</h2>${lineChart([172,176,169,183,177,171,168,184],[188,201,194,211,205,198,216,212],181,430)}</article><aside class="tv-results"><h2>Resultado acumulado</h2>${tvKpi('2025','US$ 1,625M')}${tvKpi('2026','US$ 1,400M')}${tvKpi('Redução','-13,8%','','success')}${tvKpi('Restante para meta','1,2 p.p.','','danger')}</aside></div>`;
}
function renderTvMode(resetProgress = true) {
  const root = $('#tv-mode'); pendingCharts = [];
  root.innerHTML = `<div class="tv-stage"><div class="tv-panel" data-panel="${state.tvPanel}">${tvPanelContent(state.tvPanel)}</div><footer class="tv-footer"><span>HANARO · Material Scrap / IF Cost</span><span>Atualizado 12/08/2026 14:32 · Próxima atualização 15:00</span></footer><div class="tv-controls visible" aria-label="Controles do Modo TV"><button data-action="tv-prev" aria-label="Painel anterior">${icon('chevronLeft')}</button><button data-action="tv-pause" aria-label="${state.tvPaused?'Continuar':'Pausar'} rotação">${icon(state.tvPaused?'play':'pause')}<span>${state.tvPaused?'Continuar':'Pausar'}</span></button><button data-action="tv-next" aria-label="Próximo painel">${icon('chevronRight')}</button><button data-action="tv-toggle-rotation" class="tv-text-control">${state.tvRotation?'Rotação automática':'Visão única'}</button><label class="tv-duration-control"><span>Intervalo</span><select id="tv-duration"><option value="10" ${state.tvDuration===10?'selected':''}>10s</option><option value="15" ${state.tvDuration===15?'selected':''}>15s</option><option value="30" ${state.tvDuration===30?'selected':''}>30s</option><option value="60" ${state.tvDuration===60?'selected':''}>60s</option></select></label><button data-action="tv-fullscreen" aria-label="Tela cheia">${icon('fullscreen')}<span>Tela cheia</span></button><button data-action="exit-tv" aria-label="Sair do Modo TV">${icon('x')}<span>Sair</span></button></div><div class="tv-position"><span>${state.tvPanel + 1} / ${tvPanels.length}</span><div class="tv-dots">${tvPanels.map((_,i)=>`<i class="${i===state.tvPanel?'active':''}"></i>`).join('')}</div></div><div class="tv-progress ${state.tvPaused || !state.tvRotation ? 'paused' : ''}" style="--tv-duration:${state.tvDuration}s"><i></i></div></div>`;
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
  if(action==='notifications')return showToast('Você tem novos alertas. Abra a notificação para ver os registros relacionados.');
  if(action==='go-reports'||action==='new-report'){state.reportTab='gerar';return navigateTo('relatorios');}
  if(action.startsWith('export')||action==='generate-pdf'||action==='generate-excel'){el.classList.add('spinning');el.disabled=true;await delay(650);el.classList.remove('spinning');el.disabled=false;return showToast('Arquivo fictício preparado para demonstração.');}
  if(action==='refresh-dashboard'){el.classList.add('spinning');el.disabled=true;$('#sync-state').textContent='Atualizando...';await delay(600);el.disabled=false;el.classList.remove('spinning');$('#sync-state').textContent=`Atualizado às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`;renderPage();return showToast('Dados atualizados.');}
  if(action==='clear-dashboard'){state.dashboardFactor=1;state.dashboardFilters={period:'01/08/2026 — 12/08/2026',view:'Acumulado',item:'Todos',partNumber:'Todos',scrapLine:'Todas'};renderPage();return showToast('Filtros limpos.');}
  if(action==='dashboard-explore'){setExplorationContext({component:id,partNumber:state.dashboardFilters.partNumber==='Todos'?null:state.dashboardFilters.partNumber,scrapLine:state.dashboardFilters.scrapLine==='Todas'?null:state.dashboardFilters.scrapLine,transactionId:null,alertId:null,executionId:null},'Dashboard');state.scrapView='list';return navigateTo('scrap');}
  if(action==='dashboard-row-explore'){const row=model.transactions.find(t=>t.id===id);if(!row)return;setExplorationContext({component:row.component,partNumber:row.partNumber,scrapLine:row.scrapLine,transactionId:row.id},'Dashboard');state.scrapView='list';return navigateTo('scrap');}
  if(action==='dashboard-row-review'){const row=model.transactions.find(t=>t.id===id);if(!row)return;state.selectedScrapIds=[row.id];state.activeReviewId=row.id;state.scrapView='review';setExplorationContext({component:row.component,partNumber:row.partNumber,scrapLine:row.scrapLine,transactionId:row.id},'Dashboard');navigateTo('scrap');history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(row.id)}`);return;}
  if(action==='page-prev'){state.scrapPage--;return renderPage();} if(action==='page-next'){state.scrapPage++;return renderPage();}
  if(action==='sort-scrap'){const key=el.dataset.key;state.scrapSort.direction=state.scrapSort.key===key&&state.scrapSort.direction==='asc'?'desc':'asc';state.scrapSort.key=key;state.scrapPage=1;return renderPage();}
  if(action==='more-filters'){const f=state.scrapAdvancedFilters;return openOverlay(modal('Mais filtros',`<div class="form-grid">${field('Organização','modal-organization',['Todas',...organizationCodes],f.organizationCode)+field('Grupo de subinventário','modal-subinventory-group',['Todos',...subinventoryGroups],f.subinventoryGroup)+field('Subinventário','modal-subinventory',['Todos',...subinventories],f.subinventory)+field('Mercado do armazém','modal-warehouse-market',['Todos',...warehouseMarkets],f.warehouseMarket)+field('Departamento de recebimento','modal-receipt-department',['Todos',...receiptDepartments],f.receiptDepartment)+field('Part Number','modal-part-number',['Todos',...partNumbers],f.partNumber)}</div>`,`${button('Cancelar','close-overlay')}${button('Limpar filtros','clear-more-filters')}${button('Aplicar filtros','apply-more-filters',{primary:true})}`));}
  if(action==='apply-more-filters'){state.scrapAdvancedFilters={organizationCode:$('#modal-organization')?.value||'Todas',subinventoryGroup:$('#modal-subinventory-group')?.value||'Todos',subinventory:$('#modal-subinventory')?.value||'Todos',warehouseMarket:$('#modal-warehouse-market')?.value||'Todos',receiptDepartment:$('#modal-receipt-department')?.value||'Todos',partNumber:$('#modal-part-number')?.value||'Todos'};closeOverlay();state.scrapPage=1;renderPage();return showToast('Filtros avançados aplicados.');}
  if(action==='clear-more-filters'){state.scrapAdvancedFilters={organizationCode:'Todas',subinventoryGroup:'Todos',subinventory:'Todos',warehouseMarket:'Todos',receiptDepartment:'Todos',partNumber:'Todos'};closeOverlay();state.scrapPage=1;renderPage();return showToast('Filtros limpos.');}
  if(action==='drill-part'){setExplorationContext({partNumber:id},state.context.source||'Explorador');renderPage();return showToast(`Exploração aprofundada em ${id}.`);}
  if(action==='clear-context'){state.context[el.dataset.key]=null;state.scrapPage=1;renderPage();return;}
  if(action==='clear-all-context'){state.context={source:null,component:null,partNumber:null,scrapLine:null,transactionId:null,alertId:null,executionId:null};state.scrapPage=1;renderPage();return;}
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
  if(action==='transaction-explore'){const row=model.transactions.find(t=>t.id===id);if(!row)return;closeOverlay();setExplorationContext({component:row.component,partNumber:row.partNumber,scrapLine:row.scrapLine,transactionId:null},'Transação');renderPage();return;}
  if(action==='validate-upload'){el.disabled=true;el.classList.add('spinning');await delay(700);return openUploadResult();}
  if(action==='confirm-upload'){model.executions.unshift({id:'EXE-20260812-0047',source:'Contingência operacional',process:'Recuperação de execução com falha',start:'12/08 10:02',end:'12/08 10:03',duration:'01m14s',received:827,valid:824,rejected:3,status:'Concluído',scheduled:false,retryCount:0,contingencyAvailable:false});addAudit('Executou contingência após falha de reprocessamento','Execution','EXE-20260812-0047','Arquivo validado','Concluído');closeOverlay();renderPage();return showToast('Contingência concluída e auditada.');}
  if(action==='read-alerts'){const targets=model.alerts.filter(a=>a.status==='Novo');targets.forEach(a=>{a.status='Lido';addAudit('Marcou alerta como lido','Alert',a.id,'Novo','Lido');});renderPage();return showToast(`${targets.length} alertas marcados como lidos.`);}
  if(action==='archive-alert'){const a=model.alerts.find(x=>x.id===id);if(a){const before=a.status;a.status='Arquivado';addAudit('Arquivou alerta','Alert',a.id,before,'Arquivado');}closeOverlay();renderPage();return showToast('Alerta arquivado.');}
  if(action==='alert-transactions'){const a=model.alerts.find(x=>x.id===id);if(!a)return;const before=a.status;if(a.status==='Novo')a.status='Lido';setExplorationContext({component:a.component,partNumber:null,scrapLine:null,alertId:a.id,transactionId:null,executionId:null},'Alerta');state.selectedScrapIds=[];state.scrapView='list';if(before==='Novo')addAudit('Abriu registros a partir do alerta','Alert',a.id,'Novo','Lido');closeOverlay();return navigateTo('scrap');}
  if(action==='report-tab'){state.reportTab=id;return renderPage();}
  if(action==='toggle-report-review'){const row=model.transactions.find(item=>item.id===id);if(row){row.review.includeInReport=!row.review.includeInReport;renderPage();}return;}
  if(action==='open-report-review'){state.selectedScrapIds=[id];state.activeReviewId=id;state.scrapView='review';navigateTo('scrap');history.replaceState(null,'',`#scrap/revisar/${encodeURIComponent(id)}`);return;}
  if(action==='register-report'){const version=`v1.${model.reports.length+1}`,reportId=`REP-2026-W33-v${model.reports.length+1}`,reviewIds=model.transactions.filter(row=>row.review.status==='Justificado'&&row.review.includeInReport).map(row=>row.id),reportCost=model.transactions.filter(row=>reviewIds.includes(row.id)).reduce((sum,row)=>sum+row.ifCost,0);model.reports.unshift({id:reportId,version,type:$('#report-type')?.value||'Semanal',period:'W33 · 10–16 Ago',generatedAt:'12/08 10:14',author:'Analista de Qualidade',ifCost:reportCost,format:'PDF',status:'Publicado',reviewIds});model.sends.unshift({report:reportId,recipient:'gestores@exemplo.local',channel:'E-mail',requestedAt:'12/08 10:15',status:'Pendente',attempts:0});addAudit('Gerou relatório com scraps justificados','Report',reportId,'Rascunho','Publicado');state.reportTab='versoes';renderPage();return showToast(`Relatório ${reportId} registrado com ${reviewIds.length} scrap(s) revisado(s).`);}
  if(action==='resend-report'){const s=model.sends[Number(id)];s.status='Processando';renderPage();await delay(700);s.status='Enviado';s.attempts++;addAudit('Reenviou relatório','Report',s.report,'Falha','Enviado');renderPage();return showToast('Relatório reenviado com sucesso.');}
  if(action==='send-report'){const s=model.sends[Number(id)];s.status='Processando';renderPage();await delay(700);s.status='Enviado';s.attempts++;addAudit('Enviou relatório','Report',s.report,'Pendente','Enviado');renderPage();return showToast('Envio simulado com sucesso.');}
  if(action==='open-related-execution'){closeOverlay();navigateTo('execucoes');setTimeout(()=>openExecution(id),80);return;}
  if(action==='execution-records'){closeOverlay();setExplorationContext({executionId:id,component:null,partNumber:null,scrapLine:null,transactionId:null},'Execução');return navigateTo('scrap');}
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
    const dashboardKeys = { 'dash-period': 'period', 'dash-view': 'view', 'dash-item': 'item', 'dash-part-number': 'partNumber', 'dash-scrap-line': 'scrapLine' };
    const key = dashboardKeys[target.id];
    if (key) state.dashboardFilters[key] = target.value;
    renderPage();
    showToast(`${target.closest('.field')?.querySelector('label')?.textContent || 'Filtro'} atualizado para ${target.value}.`);
  }
  if (target.id === 'scrap-date') { state.scrapFilters.date = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-account-alias') { state.scrapFilters.accountAlias = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-processing-status') { state.scrapFilters.processingStatus = target.value; state.scrapPage = 1; renderPage(); }
  if (target.id === 'scrap-review-status') { state.scrapFilters.reviewStatus = target.value; state.scrapPage = 1; renderPage(); }
  if (target.matches('[data-filter^="alert-"]')) { const alertKeys={'alert-period':'period','alert-severity':'severity','alert-type':'type','alert-item':'item','alert-status':'status'}; if(alertKeys[target.id])state.alertFilters[alertKeys[target.id]]=target.value; renderPage(); }
  if (target.id === 'exec-status') { state.executionStatus = target.value; renderPage(); }
  if (target.id === 'audit-entity') { state.auditEntity = target.value; renderPage(); }
  if (target.id === 'report-type' || target.id === 'report-compare') { state.reportFactor = .9 + Math.random() * .2; renderPage(); showToast('Preview atualizado.'); }
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
