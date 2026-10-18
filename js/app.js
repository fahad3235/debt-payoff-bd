/* debt-payoff-bd - DOM controller. Depends on js/logic.js globals. */
'use strict';

const I18N = {
  en: {
    appTitle: 'Debt Payoff BD',
    subtitle: 'Snowball vs avalanche payoff planner \u2014 pay off every loan, card and due, fastest and cheapest.',
    tabDebts: 'Debts', tabPlan: 'Plan', tabData: 'Data',
    addDebt: 'Add debt', yourDebts: 'Your debts',
    debtName: 'Debt name', balance: 'Balance (\u09f3)', apr: 'APR % per year',
    minPayment: 'Minimum monthly payment (\u09f3)',
    extraTitle: 'Extra monthly payment', extra: 'Extra monthly payment (\u09f3)',
    monthlyBudget: 'Total monthly budget',
    snowball: 'Snowball \u2014 smallest balance first',
    avalanche: 'Avalanche \u2014 highest APR first',
    snowballShort: 'Snowball', avalancheShort: 'Avalanche',
    monthsWord: 'months', debtFreeDate: 'Debt-free date',
    totalInterest: 'Total interest', totalPaid: 'Total paid',
    payoffOrder: 'Payoff order', balanceChart: 'Total balance over time',
    perDebt: 'Per-debt payoff (avalanche)',
    thDebt: 'Debt', thMonth: 'Payoff month', thInterest: 'Interest paid',
    neverShort: 'Never', neverHint: 'Payments do not cover the monthly interest. Raise the minimum or extra payment.',
    noDebts: 'No debts yet. Add your first debt above.',
    noPlan: 'Add at least one debt to see your payoff plan.',
    edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel',
    dataTitle: 'Export / import / erase',
    dataHint: 'Your data lives only in this browser (localStorage). Export a backup, or import one to restore.',
    export: 'Export JSON', import: 'Import JSON',
    erase: 'Erase all data', typeDelete: 'Type DELETE to confirm',
    importOk: 'Import successful.', importBad: 'Import rejected: invalid file.',
    erased: 'All data erased.',
    errName: 'Enter a debt name.',
    errBalance: 'Balance must be more than 0.',
    errApr: 'APR must be between 0 and 60.',
    errMin: 'Minimum payment must be more than 0.',
    errExtra: 'Extra payment must be 0 or more.',
    disclaimer: 'Educational estimate only \u2014 not financial advice. Interest is compounded monthly; real lenders may use daily accrual, fees or different rounding.',
    verdictSaveA: 'Avalanche saves ', verdictSaveB: ' vs snowball.',
    verdictSooner: ' It also finishes {n} months sooner.',
    verdictSameMonths: ' Both finish in the same number of months.',
    verdictLonger: ' It takes {n} months longer, but costs less interest.',
    verdictEqual: 'Both strategies cost the same interest here.',
    monthN: 'Month {n}', aprLabel: 'APR', minLabel: 'min',
    neverPayoff: 'Never pays off',
  },
  bn: {
    appTitle: '\u098b\u09a3 \u09aa\u09b0\u09bf\u09b6\u09cb\u09a7 \u09ac\u09bf\u09a1\u09bf',
    subtitle: '\u09b8\u09cd\u09a8\u09cb\u09ac\u09b2 \u09ac\u09a8\u09be\u09ae \u0985\u09cd\u09af\u09be\u09ad\u09be\u09b2\u09be\u09a8\u09cd\u099a \u09aa\u09b0\u09bf\u09b6\u09cb\u09a7 \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u2014 \u09b8\u09ac \u098b\u09a3 \u09a6\u09cd\u09b0\u09c1\u09a4 \u0993 \u0995\u09ae \u09b8\u09c1\u09a6\u09c7 \u09b6\u09cb\u09a7 \u0995\u09b0\u09c1\u09a8\u0964',
    tabDebts: '\u098b\u09a3', tabPlan: '\u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be', tabData: '\u09a1\u09c7\u099f\u09be',
    addDebt: '\u098b\u09a3 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', yourDebts: '\u0986\u09aa\u09a8\u09be\u09b0 \u098b\u09a3\u0997\u09c1\u09b2\u09cb',
    debtName: '\u098b\u09a3\u09c7\u09b0 \u09a8\u09be\u09ae', balance: '\u09ac\u09cd\u09af\u09be\u09b2\u09c7\u09a8\u09cd\u09b8 (\u09f3)', apr: '\u09ac\u09be\u09b0\u09cd\u09b7\u09bf\u0995 \u09b8\u09c1\u09a6\u09c7\u09b0 \u09b9\u09be\u09b0 %',
    minPayment: '\u09a8\u09cd\u09af\u09c2\u09a8\u09a4\u09ae \u09ae\u09be\u09b8\u09bf\u0995 \u0995\u09bf\u09b8\u09cd\u09a4\u09bf (\u09f3)',
    extraTitle: '\u0985\u09a4\u09bf\u09b0\u09bf\u0995\u09cd\u09a4 \u09ae\u09be\u09b8\u09bf\u0995 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f', extra: '\u0985\u09a4\u09bf\u09b0\u09bf\u0995\u09cd\u09a4 \u09ae\u09be\u09b8\u09bf\u0995 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f (\u09f3)',
    monthlyBudget: '\u09ae\u09cb\u099f \u09ae\u09be\u09b8\u09bf\u0995 \u09ac\u09be\u099c\u09c7\u099f',
    snowball: '\u09b8\u09cd\u09a8\u09cb\u09ac\u09b2 \u2014 \u09b8\u09ac\u099a\u09c7\u09df\u09c7 \u0995\u09ae \u09ac\u09cd\u09af\u09be\u09b2\u09c7\u09a8\u09cd\u09b8 \u0986\u0997\u09c7',
    avalanche: '\u0985\u09cd\u09af\u09be\u09ad\u09be\u09b2\u09be\u09a8\u09cd\u099a \u2014 \u09b8\u09ac\u099a\u09c7\u09df\u09c7 \u09ac\u09c7\u09b6\u09bf \u09b8\u09c1\u09a6 \u0986\u0997\u09c7',
    snowballShort: '\u09b8\u09cd\u09a8\u09cb\u09ac\u09b2', avalancheShort: '\u0985\u09cd\u09af\u09be\u09ad\u09be\u09b2\u09be\u09a8\u09cd\u099a',
    monthsWord: '\u09ae\u09be\u09b8', debtFreeDate: '\u098b\u09a3\u09ae\u09c1\u0995\u09cd\u09a4\u09bf\u09b0 \u09a4\u09be\u09b0\u09bf\u0996',
    totalInterest: '\u09ae\u09cb\u099f \u09b8\u09c1\u09a6', totalPaid: '\u09ae\u09cb\u099f \u09aa\u09b0\u09bf\u09b6\u09cb\u09a7',
    payoffOrder: '\u09b6\u09cb\u09a7\u09c7\u09b0 \u0995\u09cd\u09b0\u09ae', balanceChart: '\u09b8\u09ae\u09df\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09ae\u09cb\u099f \u09ac\u09cd\u09af\u09be\u09b2\u09c7\u09a8\u09cd\u09b8',
    perDebt: '\u09aa\u09cd\u09b0\u09a4\u09bf \u098b\u09a3\u09c7\u09b0 \u09b6\u09cb\u09a7 (\u0985\u09cd\u09af\u09be\u09ad\u09be\u09b2\u09be\u09a8\u09cd\u099a)',
    thDebt: '\u098b\u09a3', thMonth: '\u09b6\u09cb\u09a7\u09c7\u09b0 \u09ae\u09be\u09b8', thInterest: '\u09aa\u09b0\u09bf\u09b6\u09cb\u09a7\u09bf\u09a4 \u09b8\u09c1\u09a6',
    neverShort: '\u0995\u0996\u09a8\u09cb \u09a8\u09be', neverHint: '\u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u09ae\u09be\u09b8\u09bf\u0995 \u09b8\u09c1\u09a6\u09c7\u09b0 \u099a\u09c7\u09df\u09c7 \u0995\u09ae\u0964 \u0995\u09bf\u09b8\u09cd\u09a4\u09bf \u09ac\u09be \u0985\u09a4\u09bf\u09b0\u09bf\u0995\u09cd\u09a4 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u09ac\u09be\u09dc\u09be\u09a8\u0964',
    noDebts: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u098b\u09a3 \u09a8\u09c7\u0987\u0964 \u0989\u09aa\u09b0\u09c7 \u09aa\u09cd\u09b0\u09a5\u09ae \u098b\u09a3\u099f\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964',
    noPlan: '\u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be \u09a6\u09c7\u0996\u09a4\u09c7 \u0985\u09a8\u09cd\u09a4\u09a4 \u098f\u0995\u099f\u09bf \u098b\u09a3 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964',
    edit: '\u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be', delete: '\u09ae\u09c1\u099b\u09c1\u09a8', save: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3', cancel: '\u09ac\u09be\u09a4\u09bf\u09b2',
    dataTitle: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f / \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f / \u09ae\u09c1\u099b\u09c1\u09a8',
    dataHint: '\u0986\u09aa\u09a8\u09be\u09b0 \u09a1\u09c7\u099f\u09be \u09b6\u09c1\u09a7\u09c1 \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 \u09a5\u09be\u0995\u09c7 (localStorage)\u0964 \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09c1\u09a8 \u09ac\u09be \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09c7 \u09aa\u09c1\u09a8\u09b0\u09c1\u09a6\u09cd\u09a7\u09be\u09b0 \u0995\u09b0\u09c1\u09a8\u0964',
    export: '\u099c\u09c7\u098f\u09b8\u0993\u09a8 \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', import: '\u099c\u09c7\u098f\u09b8\u0993\u09a8 \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
    erase: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c1\u09a8', typeDelete: 'DELETE \u09b2\u09bf\u0996\u09c7 \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8',
    importOk: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09df\u09c7\u099b\u09c7\u0964', importBad: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09be\u09a4\u09bf\u09b2: \u09ab\u09be\u0987\u09b2\u099f\u09bf \u09b8\u09a0\u09bf\u0995 \u09a8\u09df\u0964',
    erased: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964',
    errName: '\u098b\u09a3\u09c7\u09b0 \u09a8\u09be\u09ae \u09a6\u09bf\u09a8\u0964',
    errBalance: '\u09ac\u09cd\u09af\u09be\u09b2\u09c7\u09a8\u09cd\u09b8 \u09e6-\u098f\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
    errApr: '\u09b8\u09c1\u09a6\u09c7\u09b0 \u09b9\u09be\u09b0 \u09e6 \u09a5\u09c7\u0995\u09c7 \u09ec\u09e6-\u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
    errMin: '\u09a8\u09cd\u09af\u09c2\u09a8\u09a4\u09ae \u0995\u09bf\u09b8\u09cd\u09a4\u09bf \u09e6-\u098f\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
    errExtra: '\u0985\u09a4\u09bf\u09b0\u09bf\u0995\u09cd\u09a4 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u09e6 \u09ac\u09be \u09a4\u09be\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
    disclaimer: '\u09b6\u09c1\u09a7\u09c1 \u09b6\u09bf\u0995\u09cd\u09b7\u09be\u09ae\u09c2\u09b2\u0995 \u09b9\u09bf\u09b8\u09be\u09ac \u2014 \u0986\u09b0\u09cd\u09a5\u09bf\u0995 \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u09a8\u09df\u0964 \u09b8\u09c1\u09a6 \u09ae\u09be\u09b8\u09bf\u0995 \u099a\u0995\u09cd\u09b0\u09ac\u09c3\u09a6\u09cd\u09a7\u09bf \u09a7\u09b0\u09be \u09b9\u09df\u09c7\u099b\u09c7; \u09ac\u09be\u09b8\u09cd\u09a4\u09ac \u098b\u09a3\u09a6\u09be\u09a4\u09be \u09a6\u09c8\u09a8\u09bf\u0995 \u09b8\u09c1\u09a6, \u09ab\u09bf \u09ac\u09be \u09ad\u09bf\u09a8\u09cd\u09a8 \u09b0\u09be\u0989\u09a8\u09cd\u09a1\u09bf\u0982 \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u0964',
    verdictSaveA: '\u0985\u09cd\u09af\u09be\u09ad\u09be\u09b2\u09be\u09a8\u09cd\u099a\u09c7 \u09b8\u09be\u09b6\u09cd\u09b0\u09df ', verdictSaveB: ' \u09b8\u09cd\u09a8\u09cb\u09ac\u09b2\u09c7\u09b0 \u09a4\u09c1\u09b2\u09a8\u09be\u09df\u0964',
    verdictSooner: ' \u098f\u09ac\u0982 {n} \u09ae\u09be\u09b8 \u0986\u0997\u09c7 \u09b6\u09c7\u09b7 \u09b9\u09df\u0964',
    verdictSameMonths: ' \u0989\u09ad\u09df\u099f\u09bf \u098f\u0995\u0987 \u09ae\u09be\u09b8\u09c7 \u09b6\u09c7\u09b7 \u09b9\u09df\u0964',
    verdictLonger: ' \u098f\u099f\u09bf {n} \u09ae\u09be\u09b8 \u09ac\u09c7\u09b6\u09bf \u09b2\u09be\u0997\u09c7, \u0995\u09bf\u09a8\u09cd\u09a4\u09c1 \u09b8\u09c1\u09a6 \u0995\u09ae \u09b2\u09be\u0997\u09c7\u0964',
    verdictEqual: '\u098f\u0996\u09be\u09a8\u09c7 \u0989\u09ad\u09df \u0995\u09cc\u09b6\u09b2\u09c7\u0987 \u09b8\u09ae\u09be\u09a8 \u09b8\u09c1\u09a6 \u09b2\u09be\u0997\u09c7\u0964',
    monthN: '{n} \u09a8\u0982 \u09ae\u09be\u09b8', aprLabel: '\u09b8\u09c1\u09a6\u09c7\u09b0 \u09b9\u09be\u09b0', minLabel: '\u0995\u09bf\u09b8\u09cd\u09a4\u09bf',
    neverPayoff: '\u0995\u0996\u09a8\u09cb \u09b6\u09cb\u09a7 \u09b9\u09ac\u09c7 \u09a8\u09be',
  },
};

const LS_KEY = 'debt-payoff-bd:v1';
let state = { debts: [], extraPaisa: 0, lang: 'en' };
let editingId = null;

function t(key) { return (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key; }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function today() {
  const m = /[?&]asof=(\d{4}-\d{2}-\d{2})/.exec(location.search);
  if (m) { const d = new Date(m[1] + 'T00:00:00'); if (!isNaN(d)) return d; }
  return new Date();
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const res = validateImport(JSON.parse(raw));
      if (res.ok) {
        state = { debts: res.data.debts, extraPaisa: res.data.extraPaisa, lang: res.data.lang };
      }
    }
  } catch (e) { /* corrupted storage: start empty */ }
}
function save() { try { localStorage.setItem(LS_KEY, exportData(state)); } catch (e) {} }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.getElementById('langBtn').textContent = state.lang === 'en' ? '\u09ac\u09be\u0982\u09b2\u09be' : 'English';
  document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
}

function renderDebts() {
  const list = document.getElementById('debtList');
  document.getElementById('noDebts').hidden = state.debts.length > 0;
  list.innerHTML = state.debts.map((d) => (
    '<li data-id="' + esc(d.id) + '">' +
    '<div class="debt-main"><div class="debt-name">' + esc(d.name) + '</div>' +
    '<div class="debt-meta">' + esc(fmtMoney(d.balancePaisa, state.lang)) + ' &middot; ' +
    t('aprLabel') + ' ' + d.apr + '% &middot; ' + t('minLabel') + ' ' + esc(fmtMoney(d.minPaymentPaisa, state.lang)) + '</div></div>' +
    '<div class="debt-actions"><button class="btn" data-act="edit" type="button">' + t('edit') + '</button>' +
    '<button class="btn" data-act="del" type="button">' + t('delete') + '</button></div></li>'
  )).join('');
  list.querySelectorAll('li').forEach((li) => {
    li.querySelector('[data-act="edit"]').addEventListener('click', () => startEdit(li.dataset.id));
    li.querySelector('[data-act="del"]').addEventListener('click', () => {
      state.debts = state.debts.filter((d) => d.id !== li.dataset.id);
      if (editingId === li.dataset.id) cancelEdit();
      save(); renderAll();
    });
  });
}

function startEdit(id) {
  const d = state.debts.find((x) => x.id === id);
  if (!d) return;
  editingId = id;
  document.getElementById('fName').value = d.name;
  document.getElementById('fBalance').value = fmtAmount(d.balancePaisa, 'en');
  document.getElementById('fApr').value = String(d.apr);
  document.getElementById('fMin').value = fmtAmount(d.minPaymentPaisa, 'en');
  document.getElementById('saveDebtBtn').textContent = t('save');
  document.getElementById('cancelEditBtn').hidden = false;
  document.getElementById('debtForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function cancelEdit() {
  editingId = null;
  document.getElementById('debtForm').reset();
  document.getElementById('formError').hidden = true;
  document.getElementById('saveDebtBtn').textContent = t('addDebt');
  document.getElementById('cancelEditBtn').hidden = true;
}

function renderPresets() {
  const wrap = document.getElementById('presets');
  const values = [0, 100000, 500000, 1000000]; // paisa: 0, 1000, 5000, 10000 BDT
  wrap.innerHTML = values.map((v) => (
    '<button class="btn' + (state.extraPaisa === v ? ' primary' : '') + '" data-extra="' + v + '" type="button">' + esc(fmtMoney(v, state.lang)) + '</button>'
  )).join('');
  wrap.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    state.extraPaisa = Number(b.dataset.extra);
    document.getElementById('extraInput').value = fmtAmount(state.extraPaisa, 'en');
    save(); renderPlan();
  }));
}

function renderPlan() {
  const extraInput = document.getElementById('extraInput');
  extraInput.value = fmtAmount(state.extraPaisa, 'en');
  document.getElementById('budgetVal').textContent = fmtMoney(monthlyBudget(state.debts, state.extraPaisa), state.lang);
  renderPresets();
  const noPlan = document.getElementById('noPlan');
  const results = document.getElementById('planResults');
  if (!state.debts.length) { noPlan.hidden = false; results.hidden = true; return; }
  noPlan.hidden = true; results.hidden = false;

  const cmp = compareStrategies(state.debts, state.extraPaisa, today());
  const fill = (prefix, sim) => {
    document.getElementById(prefix + 'Months').textContent = sim.paidOff ? String(sim.months) : t('neverShort');
    document.getElementById(prefix + 'Date').textContent = sim.paidOff ? sim.debtFreeDate : '\u2014';
    document.getElementById(prefix + 'Interest').textContent = sim.paidOff ? fmtMoney(sim.totalInterest, state.lang) : '\u2014';
    document.getElementById(prefix + 'Paid').textContent = sim.paidOff ? fmtMoney(sim.totalPaid, state.lang) : '\u2014';
  };
  fill('snow', cmp.snowball);
  fill('aval', cmp.avalanche);
  const order = (id, sim) => {
    document.getElementById(id).innerHTML = sim.payoffOrder.map((o) => (
      '<li>' + esc(o.name) + ' \u2014 ' + esc(t('monthN').replace('{n}', String(o.month))) + '</li>'
    )).join('') || '<li>' + esc(t('neverPayoff')) + '</li>';
  };
  order('snowOrder', cmp.snowball);
  order('avalOrder', cmp.avalanche);

  const v = document.getElementById('verdictText');
  if (cmp.snowball.paidOff && cmp.avalanche.paidOff) {
    if (cmp.interestSaved > 0) {
      const diff = cmp.snowball.months - cmp.avalanche.months;
      v.textContent = t('verdictSaveA') + fmtMoney(cmp.interestSaved, state.lang) + t('verdictSaveB') +
        (diff > 0 ? t('verdictSooner').replace('{n}', String(diff))
          : diff === 0 ? t('verdictSameMonths')
          : t('verdictLonger').replace('{n}', String(-diff)));
    } else {
      v.textContent = t('verdictEqual');
    }
  } else {
    v.textContent = '';
  }
  document.getElementById('neverHint').hidden = cmp.snowball.paidOff && cmp.avalanche.paidOff;
  document.getElementById('neverHint').textContent = t('neverHint');

  document.getElementById('perDebtBody').innerHTML = cmp.avalanche.perDebt.map((d) => (
    '<tr><td>' + esc(d.name) + '</td><td>' + (d.payoffMonth === null ? t('neverShort') : d.payoffMonth) +
    '</td><td>' + esc(fmtMoney(d.interest, state.lang)) + '</td></tr>'
  )).join('');

  renderChart(cmp);
}

function renderChart(cmp) {
  const svg = document.getElementById('chart');
  const W = 600, H = 220, PL = 52, PB = 26, PT = 12, PR = 10;
  const initial = state.debts.reduce((s, d) => s + d.balancePaisa, 0);
  const yMax = Math.max(initial, cmp.snowball.series[0] || 0, cmp.avalanche.series[0] || 0, 1);
  const months = Math.max(cmp.snowball.series.length, cmp.avalanche.series.length, 1);
  const pathFor = (series, color) => {
    const pts = [];
    const n = series.length;
    const step = Math.max(1, Math.ceil(n / 120));
    const sampled = [];
    for (let i = 0; i < n; i += step) sampled.push(series[i]);
    if (sampled[sampled.length - 1] !== series[n - 1]) sampled.push(series[n - 1]);
    sampled.forEach((val, i) => {
      const x = PL + (i / Math.max(1, sampled.length - 1)) * (W - PL - PR);
      const y = PT + (1 - val / yMax) * (H - PT - PB);
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    });
    return '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2"/>';
  };
  const yLabel = (val) => '<text x="' + (PL - 6) + '" y="' + (PT + (1 - val / yMax) * (H - PT - PB) + 4) + '" text-anchor="end" font-size="11" fill="#5a6b7a">' + esc(fmtMoney(val, state.lang)) + '</text>';
  svg.innerHTML =
    '<line x1="' + PL + '" y1="' + PT + '" x2="' + PL + '" y2="' + (H - PB) + '" stroke="#dbe4ea"/>' +
    '<line x1="' + PL + '" y1="' + (H - PB) + '" x2="' + W + '" y2="' + (H - PB) + '" stroke="#dbe4ea"/>' +
    yLabel(yMax) + yLabel(Math.round(yMax / 2)) + yLabel(0) +
    '<text x="' + PL + '" y="' + (H - 6) + '" font-size="11" fill="#5a6b7a">0</text>' +
    '<text x="' + (W - PR) + '" y="' + (H - 6) + '" font-size="11" fill="#5a6b7a" text-anchor="end">' + months + ' ' + esc(t('monthsWord')) + '</text>' +
    pathFor(cmp.snowball.series, '#e67e22') + pathFor(cmp.avalanche.series, '#0e7c7b');
}

function renderAll() {
  applyLang();
  renderDebts();
  renderPlan();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.panel').forEach((p) => { p.hidden = p.id !== 'tab-' + name; });
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  renderAll();

  document.getElementById('langBtn').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'bn' : 'en';
    save(); renderAll();
  });
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  document.getElementById('debtForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const errEl = document.getElementById('formError');
    const name = document.getElementById('fName').value.trim();
    const balance = parseAmount(document.getElementById('fBalance').value);
    const apr = parseApr(document.getElementById('fApr').value);
    const min = parseAmount(document.getElementById('fMin').value);
    const cand = { id: editingId || newId(), name, balancePaisa: balance, apr, minPaymentPaisa: min };
    const errs = validateDebt(cand);
    if (errs.length) {
      const map = { 'name-required': 'errName', 'name-too-long': 'errName', 'balance-positive': 'errBalance', 'balance-too-large': 'errBalance', 'apr-range': 'errApr', 'min-positive': 'errMin' };
      errEl.textContent = t(map[errs[0]] || 'errName');
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;
    if (editingId) {
      const i = state.debts.findIndex((d) => d.id === editingId);
      if (i >= 0) state.debts[i] = cand;
    } else {
      state.debts.push(cand);
    }
    cancelEdit();
    save(); renderAll();
  });
  document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);

  document.getElementById('extraInput').addEventListener('change', (e) => {
    const v = parseAmount(e.target.value);
    if (v === null || v < 0) {
      e.target.value = fmtAmount(state.extraPaisa, 'en');
      return;
    }
    state.extraPaisa = v;
    save(); renderPlan();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([exportData(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'debt-payoff-bd.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const msg = document.getElementById('importMsg');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const res = validateImport(JSON.parse(String(reader.result)));
        if (!res.ok) throw new Error(res.error);
        state = { debts: res.data.debts, extraPaisa: res.data.extraPaisa, lang: res.data.lang };
        editingId = null;
        save(); renderAll();
        msg.textContent = t('importOk');
      } catch (err) {
        msg.textContent = t('importBad');
      }
      msg.hidden = false;
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('eraseBtn').addEventListener('click', () => {
    const msg = document.getElementById('eraseMsg');
    if (document.getElementById('eraseInput').value !== 'DELETE') {
      msg.textContent = t('typeDelete');
      msg.hidden = false;
      return;
    }
    state = { debts: [], extraPaisa: 0, lang: state.lang };
    editingId = null;
    document.getElementById('eraseInput').value = '';
    save(); renderAll();
    msg.textContent = t('erased');
    msg.hidden = false;
  });
});
