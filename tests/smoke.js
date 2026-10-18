/* debt-payoff-bd - headless-Chrome smoke test via raw CDP.
   Run: node tests/smoke.js [desktop|mobile]
   Uses /opt/meta-chromium/chrome + Node global WebSocket. No deps. */
'use strict';
const { spawn, execSync } = require('child_process');
const path = require('path');

const MODE = process.argv[2] || 'desktop';
const WIDTH = MODE === 'mobile' ? 390 : 1280;
const PORT = MODE === 'mobile' ? 9228 : 9227;
const DIR = path.resolve(__dirname, '..');
const URL = 'file://' + DIR + '/index.html?asof=2026-10-18';

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.events = []; }
  async open() {
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && this.pending.has(d.id)) {
        const { resolve, reject } = this.pending.get(d.id);
        this.pending.delete(d.id);
        d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
      } else this.events.push(d);
    };
  }
  send(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  async evalExpr(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

(async () => {
  const userDir = '/tmp/dp-chrome-' + MODE;
  execSync('rm -rf ' + userDir);
  const chrome = spawn('/opt/meta-chromium/chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-proxy-server',
    '--window-size=' + WIDTH + ',900',
    '--remote-debugging-port=' + PORT, '--user-data-dir=' + userDir, 'about:blank'
  ], { stdio: 'ignore' });
  let cdp = null;
  try {
    let targets = null;
    for (let i = 0; i < 50 && !targets; i++) {
      await sleep(200);
      try {
        const res = await fetch('http://127.0.0.1:' + PORT + '/json/list');
        const list = await res.json();
        targets = list.filter(t => t.type === 'page');
      } catch (e) { /* not up yet */ }
    }
    if (!targets || !targets.length) throw new Error('no page target');
    cdp = new CDP(targets[0].webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Network.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: MODE === 'mobile' });
    await cdp.send('Page.navigate', { url: URL });
    await sleep(1500);

    const errors = cdp.events.filter(e =>
      (e.method === 'Log.entryAdded' && e.params && e.params.entry && e.params.entry.level === 'error') ||
      e.method === 'Runtime.exceptionThrown');
    check('0 console/page errors', errors.length === 0, JSON.stringify(errors.slice(0, 2)));

    // 1. Initial render
    let v = await cdp.evalExpr(`({h1: document.querySelector('h1').textContent, empty: document.getElementById('noDebts').textContent, noPlan: document.getElementById('noPlan').textContent})`);
    check('title renders', v.h1 === 'Debt Payoff BD', v.h1);
    check('empty debts state', v.empty.indexOf('No debts yet') === 0, v.empty);
    check('empty plan state', v.noPlan.indexOf('Add at least one debt') === 0, v.noPlan);

    // helper: add a debt via the form
    async function addDebt(name, balance, apr, min) {
      return cdp.evalExpr(`(function(){
        document.getElementById('fName').value = ${JSON.stringify(name)};
        document.getElementById('fBalance').value = ${JSON.stringify(balance)};
        document.getElementById('fApr').value = ${JSON.stringify(apr)};
        document.getElementById('fMin').value = ${JSON.stringify(min)};
        document.getElementById('debtForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
        return document.querySelectorAll('#debtList li').length;
      })()`);
    }

    // 2. Invalid debt rejected inline (empty name + bad numbers)
    let n = await addDebt('', 'abc', '99', '0');
    v = await cdp.evalExpr(`({err: document.getElementById('formError').textContent, rows: document.querySelectorAll('#debtList li').length})`);
    check('invalid debt inline error', v.err.length > 0, v.err);
    check('no row added on invalid', v.rows === 0, String(v.rows));

    // 3. Add the two hand-verified debts: A 50,000 @24% min 2,000 ; B 30,000 @12% min 1,500
    n = await addDebt('Loan A', '50000', '24', '2000');
    check('add debt A -> 1', n === 1, String(n));
    n = await addDebt('Card B', '30000', '12', '1500');
    check('add debt B -> 2', n === 2, String(n));

    // 4. Plan tab: budget = 3,500 with no extra; switch tab and read plan
    await cdp.evalExpr(`document.querySelector('[data-tab="plan"]').click()`);
    await sleep(300);
    v = await cdp.evalExpr(`({budget: document.getElementById('budgetVal').textContent, snowM: document.getElementById('snowMonths').textContent, avalM: document.getElementById('avalMonths').textContent, snowI: document.getElementById('snowInterest').textContent, avalI: document.getElementById('avalInterest').textContent, verdict: document.getElementById('verdictText').textContent, chart: document.getElementById('chart').innerHTML.length})`);
    check('budget 3,500', v.budget === '\u09f33,500.00', v.budget);
    check('snowball months numeric', /^\d+$/.test(v.snowM), v.snowM);
    check('avalanche months numeric', /^\d+$/.test(v.avalM), v.avalM);
    check('avalanche interest <= snowball interest', (() => {
      const num = (s) => Number(s.replace(/[^0-9.]/g, ''));
      return num(v.avalI) <= num(v.snowI);
    })(), v.avalI + ' vs ' + v.snowI);
    check('verdict: no extra -> equal interest', v.verdict === 'Both strategies cost the same interest here.', v.verdict);
    check('chart has paths', v.chart > 100, String(v.chart));

    // 5. Extra payment 5,000 -> budget 8,500, fewer months
    const beforeMonths = v.avalM;
    await cdp.evalExpr(`(function(){
      var el = document.getElementById('extraInput');
      el.value = '5000';
      el.dispatchEvent(new Event('change', {bubbles:true}));
    })()`);
    await sleep(300);
    v = await cdp.evalExpr(`({budget: document.getElementById('budgetVal').textContent, avalM: document.getElementById('avalMonths').textContent, avalDate: document.getElementById('avalDate').textContent, verdict: document.getElementById('verdictText').textContent})`);
    check('extra -> budget 8,500', v.budget === '\u09f38,500.00', v.budget);
    check('extra -> verdict avalanche saves', v.verdict.indexOf('Avalanche saves') === 0, v.verdict);
    check('extra -> fewer months', Number(v.avalM) < Number(beforeMonths), v.avalM + ' vs ' + beforeMonths);
    check('debt-free date YYYY-MM', /^\d{4}-\d{2}$/.test(v.avalDate), v.avalDate);

    // 6. Edit first debt: rename Loan A -> Loan A2
    await cdp.evalExpr(`document.querySelector('[data-tab="debts"]').click()`);
    await sleep(200);
    await cdp.evalExpr(`document.querySelector('#debtList li [data-act="edit"]').click()`);
    await sleep(200);
    v = await cdp.evalExpr(`document.getElementById('fName').value`);
    check('edit pre-fills name', v === 'Loan A', v);
    await cdp.evalExpr(`(function(){
      document.getElementById('fName').value = 'Loan A2';
      document.getElementById('debtForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
    })()`);
    await sleep(200);
    v = await cdp.evalExpr(`document.querySelector('#debtList li').textContent`);
    check('edit renames debt', v.indexOf('Loan A2') >= 0, v);

    // 7. BN toggle: title Bengali + Bengali digits in budget
    await cdp.evalExpr(`document.getElementById('langBtn').click()`);
    await sleep(300);
    v = await cdp.evalExpr(`({h1: document.querySelector('h1').textContent, budget: document.getElementById('budgetVal').textContent})`);
    check('BN title renders', v.h1.indexOf('\u098b\u09a3') >= 0, v.h1);
    check('BN digits in budget', /[\u09e6-\u09ef]/.test(v.budget), v.budget);
    await cdp.evalExpr(`document.getElementById('langBtn').click()`);
    await sleep(300);

    // 8. Reload persistence
    await cdp.send('Page.reload');
    await sleep(1500);
    v = await cdp.evalExpr(`document.querySelectorAll('#debtList li').length`);
    check('reload persists 2 debts', v === 2, String(v));

    // 9. Typed-DELETE erase -> 0 debts, then import round-trip restores
    const exported = await cdp.evalExpr(`localStorage.getItem('debt-payoff-bd:v1')`);
    check('export state stored', !!exported && exported.indexOf('Loan A2') >= 0, String(exported).slice(0, 60));
    await cdp.evalExpr(`document.querySelector('[data-tab="data"]').click()`);
    await sleep(200);
    await cdp.evalExpr(`(function(){ document.getElementById('eraseInput').value = 'DELETE'; document.getElementById('eraseBtn').click(); })()`);
    await sleep(300);
    v = await cdp.evalExpr(`document.querySelectorAll('#debtList li').length`);
    check('erase -> 0 debts', v === 0, String(v));
    const restored = await cdp.evalExpr(`(function(){
      var res = window.DebtLogic.validateImport(JSON.parse(${JSON.stringify(exported)}));
      if (res.ok) { localStorage.setItem('debt-payoff-bd:v1', ${JSON.stringify(exported)}); location.reload(); return 'ok'; }
      return 'bad';
    })()`);
    await sleep(1500);
    v = await cdp.evalExpr(`document.querySelectorAll('#debtList li').length`);
    check('import round-trip restores 2', restored === 'ok' && v === 2, restored + '/' + v);

    // 10. Malformed import rejected with data intact
    const badRes = await cdp.evalExpr(`window.DebtLogic.validateImport({app:'debt-payoff-bd',version:1,debts:[{id:'x',name:'Bad',balancePaisa:-5,apr:10,minPaymentPaisa:100}],extraPaisa:0,lang:'en'}).ok`);
    check('malformed import rejected', badRes === false);
    v = await cdp.evalExpr(`document.querySelectorAll('#debtList li').length`);
    check('data intact after bad import', v === 2, String(v));

    // 11. Never-payoff: replace with trap debt -> "Never" shown
    await cdp.evalExpr(`(function(){
      localStorage.setItem('debt-payoff-bd:v1', JSON.stringify({app:'debt-payoff-bd',version:1,debts:[{id:'t',name:'Trap',balancePaisa:10000000,apr:60,minPaymentPaisa:10000}],extraPaisa:0,lang:'en'}));
      location.reload();
    })()`);
    await sleep(1500);
    await cdp.evalExpr(`document.querySelector('[data-tab="plan"]').click()`);
    await sleep(300);
    v = await cdp.evalExpr(`({m: document.getElementById('snowMonths').textContent, hint: document.getElementById('neverHint').hidden})`);
    check('trap debt shows Never', v.m === 'Never', v.m);
    check('never hint visible', v.hint === false, String(v.hint));

    // 12. 390px overflow (mobile only)
    if (MODE === 'mobile') {
      const overflow = await cdp.evalExpr(`document.documentElement.scrollWidth <= 390`);
      check('390px no horizontal overflow', overflow === true, 'scrollWidth=' + await cdp.evalExpr(`document.documentElement.scrollWidth`));
    }

    // 13. Zero network requests (file:// only)
    const reqs = cdp.events.filter(e => e.method === 'Network.requestWillBeSent' && e.params && e.params.request && !e.params.request.url.startsWith('file://') && !e.params.request.url.startsWith('data:'));
    check('zero network requests', reqs.length === 0, JSON.stringify(reqs.slice(0, 2)));
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
  }
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
