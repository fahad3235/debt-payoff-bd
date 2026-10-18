/* debt-payoff-bd - pure logic (no DOM). Usable from Node tests and the browser.
   Money is integer paisa (1 BDT = 100 paisa) to avoid float error.
   Interest accrues monthly: balance * APR% / 12, rounded half away from zero. */
'use strict';

const APP_ID = 'debt-payoff-bd';
const DATA_VERSION = 1;
const MAX_MONTHS = 1200; // 100 years: anything longer counts as "never pays off"

function roundPaisa(x) {
  return Math.sign(x) * Math.round(Math.abs(x));
}

function toPaisa(amount) {
  return roundPaisa(amount * 100);
}

const BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
function toBnDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/* Format integer paisa as "1,500.00" (Western grouping) or Bengali digits.
   Returns string WITHOUT the currency symbol; caller prepends \u09f3 (taka sign). */
function fmtAmount(paisa, lang) {
  const sign = paisa < 0 ? '-' : '';
  const abs = Math.abs(paisa);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const out = sign + grouped + '.' + frac;
  return lang === 'bn' ? toBnDigits(out) : out;
}

function fmtMoney(paisa, lang) {
  return '\u09f3' + fmtAmount(paisa, lang);
}

/* Parse a user-typed amount: strips \u09f3, commas, spaces; converts Bengali digits.
   Returns integer paisa, or null when unparseable. */
function parseAmount(str) {
  if (str === null || str === undefined) return null;
  let s = String(str).trim();
  if (!s) return null;
  const bnMap = { '\u09e6': '0', '\u09e7': '1', '\u09e8': '2', '\u09e9': '3', '\u09ea': '4', '\u09eb': '5', '\u09ec': '6', '\u09ed': '7', '\u09ee': '8', '\u09ef': '9' };
  s = s.split('').map((c) => (c in bnMap ? bnMap[c] : c)).join('');
  s = s.replace(/[\u09f3,\s]/g, '');

  if (!/^-?\d+(\.\d{1,2})?$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return roundPaisa(n * 100);
}

function parseApr(str) {
  if (str === null || str === undefined) return null;
  let s = String(str).trim();
  if (!s) return null;
  const bnMap = { '\u09e6': '0', '\u09e7': '1', '\u09e8': '2', '\u09e9': '3', '\u09ea': '4', '\u09eb': '5', '\u09ec': '6', '\u09ed': '7', '\u09ee': '8', '\u09ef': '9' };
  s = s.split('').map((c) => (c in bnMap ? bnMap[c] : c)).join('');
  s = s.replace(/[%\s,]/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function validateDebt(d) {
  const errors = [];
  if (!d || typeof d !== 'object') return ['invalid-debt'];
  if (!d.name || typeof d.name !== 'string' || !d.name.trim()) errors.push('name-required');
  else if (d.name.trim().length > 80) errors.push('name-too-long');
  if (!Number.isInteger(d.balancePaisa) || d.balancePaisa <= 0) errors.push('balance-positive');
  else if (d.balancePaisa > 100000000000) errors.push('balance-too-large'); // 1,000,000,000 BDT cap
  if (typeof d.apr !== 'number' || !Number.isFinite(d.apr) || d.apr < 0 || d.apr > 60) errors.push('apr-range');
  if (!Number.isInteger(d.minPaymentPaisa) || d.minPaymentPaisa <= 0) errors.push('min-positive');
  return errors;
}

/* Month-by-month payoff simulation for ONE strategy.
   debts: validated debt objects {id, name, balancePaisa, apr, minPaymentPaisa}
   extraPaisa: extra monthly payment (>= 0), applied to the current target debt.
   startDate: Date used to compute the debt-free date.
   Returns { paidOff, months, totalInterest, totalPaid, debtFreeDate (YYYY-MM or null),
             payoffOrder: [{id, name, month}], perDebt: [{id, name, interest, payoffMonth}],
             series: [total balance after each month, paisa] } */
function simulate(debts, extraPaisa, strategy, startDate) {
  const state = debts.map((d) => ({
    id: d.id, name: d.name, apr: d.apr, minPaymentPaisa: d.minPaymentPaisa,
    balance: d.balancePaisa, interest: 0, payoffMonth: null,
  }));
  const minSum = state.reduce((s, d) => s + d.minPaymentPaisa, 0);
  const budget = minSum + extraPaisa;
  let totalInterest = 0;
  let totalPaid = 0;
  const series = [];
  let months = 0;
  let paidOff = false;

  for (let m = 1; m <= MAX_MONTHS; m++) {
    // 1. Accrue interest on every open debt.
    for (const d of state) {
      if (d.balance <= 0) continue;
      const interest = roundPaisa((d.balance * d.apr) / 1200);
      d.balance += interest;
      d.interest += interest;
      totalInterest += interest;
    }
    // 2. Pay the minimum on every open debt.
    let spent = 0;
    for (const d of state) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.minPaymentPaisa, d.balance);
      d.balance -= pay;
      spent += pay;
      totalPaid += pay;
      if (d.balance === 0 && d.payoffMonth === null) d.payoffMonth = m;
    }
    // 3. Apply the remaining budget to the target debt(s) in strategy order.
    let remaining = budget - spent;
    const order = state.filter((d) => d.balance > 0).sort((a, b) => {
      if (strategy === 'avalanche') {
        if (b.apr !== a.apr) return b.apr - a.apr;
      } else {
        if (a.balance !== b.balance) return a.balance - b.balance;
      }
      return a.name.localeCompare(b.name);
    });
    for (const d of order) {
      if (remaining <= 0) break;
      const pay = Math.min(remaining, d.balance);
      d.balance -= pay;
      remaining -= pay;
      totalPaid += pay;
      if (d.balance === 0 && d.payoffMonth === null) d.payoffMonth = m;
    }
    months = m;
    series.push(state.reduce((s, d) => s + d.balance, 0));
    if (state.every((d) => d.balance === 0)) { paidOff = true; break; }
  }

  let debtFreeDate = null;
  if (paidOff && startDate) {
    const y = startDate.getFullYear();
    const mo = startDate.getMonth() + months;
    debtFreeDate = String(y + Math.floor(mo / 12)).padStart(4, '0') + '-' + String((mo % 12) + 1).padStart(2, '0');
  }
  return {
    paidOff, months, totalInterest, totalPaid, debtFreeDate,
    payoffOrder: state.filter((d) => d.payoffMonth !== null)
      .sort((a, b) => a.payoffMonth - b.payoffMonth)
      .map((d) => ({ id: d.id, name: d.name, month: d.payoffMonth })),
    perDebt: state.map((d) => ({ id: d.id, name: d.name, interest: d.interest, payoffMonth: d.payoffMonth })),
    series,
  };
}

function compareStrategies(debts, extraPaisa, startDate) {
  const snowball = simulate(debts, extraPaisa, 'snowball', startDate);
  const avalanche = simulate(debts, extraPaisa, 'avalanche', startDate);
  return {
    snowball, avalanche,
    interestSaved: snowball.totalInterest - avalanche.totalInterest,
    recommended: avalanche.totalInterest <= snowball.totalInterest ? 'avalanche' : 'snowball',
  };
}

function monthlyBudget(debts, extraPaisa) {
  return debts.reduce((s, d) => s + d.minPaymentPaisa, 0) + extraPaisa;
}

/* Strict import validation: returns { ok, data } or { ok:false, error }.
   Rejects wrong app/version, non-array debts, invalid debts, duplicate ids. */
function validateImport(obj) {
  if (!obj || typeof obj !== 'object') return { ok: false, error: 'not-an-object' };
  if (obj.app !== APP_ID) return { ok: false, error: 'wrong-app' };
  if (obj.version !== DATA_VERSION) return { ok: false, error: 'wrong-version' };
  if (!Array.isArray(obj.debts)) return { ok: false, error: 'debts-not-array' };
  const seen = new Set();
  for (const d of obj.debts) {
    if (validateDebt(d).length) return { ok: false, error: 'invalid-debt' };
    if (!d.id || typeof d.id !== 'string') return { ok: false, error: 'missing-id' };
    if (seen.has(d.id)) return { ok: false, error: 'duplicate-id' };
    seen.add(d.id);
  }
  if (!Number.isInteger(obj.extraPaisa) || obj.extraPaisa < 0) return { ok: false, error: 'bad-extra' };
  if (obj.lang !== 'en' && obj.lang !== 'bn') return { ok: false, error: 'bad-lang' };
  return { ok: true, data: obj };
}

function exportData(state) {
  return JSON.stringify({ app: APP_ID, version: DATA_VERSION, debts: state.debts, extraPaisa: state.extraPaisa, lang: state.lang }, null, 2);
}

function newId() {
  return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const EXPORTS = {
  APP_ID, DATA_VERSION, MAX_MONTHS, roundPaisa, toPaisa, toBnDigits, fmtAmount, fmtMoney,
  parseAmount, parseApr, validateDebt, simulate, compareStrategies, monthlyBudget,
  validateImport, exportData, newId,
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EXPORTS;
}
if (typeof window !== 'undefined') {
  window.DebtLogic = EXPORTS;
}
