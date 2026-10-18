/* debt-payoff-bd - node unit tests. Run: node tests/unit.test.js */
'use strict';
const L = require('../js/logic.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function eq(a, b) { return a === b; }

const START = new Date('2026-10-18T00:00:00');

// --- Hand-verified single-debt scenario ---
// 120,000 paisa (1,200 BDT) @ 12% APR, min 20,000 paisa, extra 0.
// M1: int 1200 -> pay 20000 -> 101200
// M2: int 1012 -> pay 20000 -> 82212
// M3: int 822.12 -> 822 -> pay 20000 -> 63034
// M4: int 630.34 -> 630 -> pay 20000 -> 43664
// M5: int 436.64 -> 437 -> pay 20000 -> 24101
// M6: int 241.01 -> 241 -> pay 20000 -> 4342
// M7: int 43.42 -> 43 -> pay 4385 -> 0
// Total interest = 1200+1012+822+630+437+241+43 = 4385; total paid = 124385.
const single = [{ id: 'a', name: 'Card', balancePaisa: 120000, apr: 12, minPaymentPaisa: 20000 }];
const s1 = L.simulate(single, 0, 'snowball', START);
check('single: paid off', s1.paidOff === true);
check('single: 7 months', s1.months === 7, 'got ' + s1.months);
check('single: total interest 4385 paisa', s1.totalInterest === 4385, 'got ' + s1.totalInterest);
check('single: total paid 124385 paisa', s1.totalPaid === 124385, 'got ' + s1.totalPaid);
check('single: debt-free 2027-05', s1.debtFreeDate === '2027-05', 'got ' + s1.debtFreeDate);
check('single: series length 7, ends 0', s1.series.length === 7 && s1.series[6] === 0, JSON.stringify(s1.series));
check('single: series M1 end 101200', s1.series[0] === 101200, 'got ' + s1.series[0]);
check('single: payoff order', s1.payoffOrder.length === 1 && s1.payoffOrder[0].month === 7);

// Extra payment shortens the same debt.
const s1x = L.simulate(single, 20000, 'snowball', START);
check('single+extra: fewer months', s1x.months < 7, 'got ' + s1x.months);
check('single+extra: less interest', s1x.totalInterest < 4385, 'got ' + s1x.totalInterest);

// Zero APR: 10,000 BDT @ 0%, min 1,000 -> exactly 10 months, 0 interest.
const zero = [{ id: 'z', name: 'Interest-free', balancePaisa: 1000000, apr: 0, minPaymentPaisa: 100000 }];
const sz = L.simulate(zero, 0, 'avalanche', START);
check('zero APR: 10 months, 0 interest', sz.paidOff && sz.months === 10 && sz.totalInterest === 0, JSON.stringify({ m: sz.months, i: sz.totalInterest }));

// Never pays off: 100,000 BDT @ 60%, min 100 BDT -> monthly interest 5,000 > min.
const never = [{ id: 'n', name: 'Trap', balancePaisa: 10000000, apr: 60, minPaymentPaisa: 10000 }];
const sn = L.simulate(never, 0, 'snowball', START);
check('never: not paid off', sn.paidOff === false);
check('never: capped at 1200 months', sn.months === 1200, 'got ' + sn.months);

// --- Two-debt strategy comparison ---
// A: 50,000 @ 24% min 2,000 ; B: 30,000 @ 12% min 1,500 ; extra 5,000 ; budget 8,500.
const two = [
  { id: 'a', name: 'Loan A', balancePaisa: 5000000, apr: 24, minPaymentPaisa: 200000 },
  { id: 'b', name: 'Card B', balancePaisa: 3000000, apr: 12, minPaymentPaisa: 150000 },
];
const cmp = L.compareStrategies(two, 500000, START);
check('two: both strategies pay off', cmp.snowball.paidOff && cmp.avalanche.paidOff);
check('two: avalanche interest <= snowball', cmp.avalanche.totalInterest <= cmp.snowball.totalInterest,
  'aval ' + cmp.avalanche.totalInterest + ' snow ' + cmp.snowball.totalInterest);
check('two: interest saved >= 0', cmp.interestSaved >= 0, 'got ' + cmp.interestSaved);
check('two: snowball pays B first', cmp.snowball.payoffOrder[0].id === 'b', JSON.stringify(cmp.snowball.payoffOrder));
check('two: avalanche pays A first', cmp.avalanche.payoffOrder[0].id === 'a', JSON.stringify(cmp.avalanche.payoffOrder));
check('two: recommended avalanche', cmp.recommended === 'avalanche');
check('two: budget 850000 paisa', L.monthlyBudget(two, 500000) === 850000);

// --- Parsing / formatting ---
check('parseAmount 1,500.50', L.parseAmount('1,500.50') === 150050);
check('parseAmount Bengali \u09f3\u09e7,\u09eb\u09e6\u09e6.\u09eb\u09e6', L.parseAmount('\u09f3\u09e7,\u09eb\u09e6\u09e6.\u09eb\u09e6') === 150050, 'got ' + L.parseAmount('\u09f3\u09e7,\u09eb\u09e6\u09e6.\u09eb\u09e6'));
check('parseAmount abc -> null', L.parseAmount('abc') === null);
check('parseAmount empty -> null', L.parseAmount('') === null);
check('parseAmount 3 decimals -> null', L.parseAmount('12.345') === null);
check('parseApr 12.5', L.parseApr('12.5') === 12.5);
check('parseApr Bengali \u09e7\u09e8', L.parseApr('\u09e7\u09e8') === 12);
check('parseApr abc -> null', L.parseApr('abc') === null);
check('fmtMoney en', L.fmtMoney(150050, 'en') === '\u09f31,500.50', 'got ' + L.fmtMoney(150050, 'en'));
check('fmtMoney bn', L.fmtMoney(150050, 'bn') === '\u09f3\u09e7,\u09eb\u09e6\u09e6.\u09eb\u09e6', 'got ' + L.fmtMoney(150050, 'bn'));
check('fmtAmount negative', L.fmtAmount(-150050, 'en') === '-1,500.50');
check('toBnDigits', L.toBnDigits('2026-10-18') === '\u09e8\u09e6\u09e8\u09ec-\u09e7\u09e6-\u09e7\u09ee');
check('roundPaisa half away from zero', L.roundPaisa(-62.5) === -63 && L.roundPaisa(62.5) === 63);

// --- Validation ---
check('validateDebt good', L.validateDebt(two[0]).length === 0);
check('validateDebt empty name', L.validateDebt({ ...two[0], name: '  ' }).includes('name-required'));
check('validateDebt zero balance', L.validateDebt({ ...two[0], balancePaisa: 0 }).includes('balance-positive'));
check('validateDebt apr 61', L.validateDebt({ ...two[0], apr: 61 }).includes('apr-range'));
check('validateDebt zero min', L.validateDebt({ ...two[0], minPaymentPaisa: 0 }).includes('min-positive'));

// --- Import validation ---
const goodExport = { app: 'debt-payoff-bd', version: 1, debts: two, extraPaisa: 500000, lang: 'en' };
check('import good', L.validateImport(goodExport).ok === true);
check('import wrong app', L.validateImport({ ...goodExport, app: 'other' }).ok === false);
check('import wrong version', L.validateImport({ ...goodExport, version: 2 }).ok === false);
check('import duplicate ids', L.validateImport({ ...goodExport, debts: [two[0], two[0]] }).ok === false);
check('import invalid debt', L.validateImport({ ...goodExport, debts: [{ ...two[0], apr: 99 }] }).ok === false);
check('import bad extra', L.validateImport({ ...goodExport, extraPaisa: -1 }).ok === false);
check('import bad lang', L.validateImport({ ...goodExport, lang: 'fr' }).ok === false);
check('export round-trip', (() => {
  const parsed = JSON.parse(L.exportData({ debts: two, extraPaisa: 500000, lang: 'en' }));
  return L.validateImport(parsed).ok === true;
})());

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
