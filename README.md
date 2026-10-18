# Debt Payoff BD

Offline bilingual (English / বাংলা) debt payoff planner for Bangladesh.
Enter every loan, credit card and due, then compare the two classic payoff
strategies — **Snowball** (smallest balance first) and **Avalanche**
(highest APR first) — and see your debt-free date, total interest and how
much the avalanche saves.

## Features

- **Debt list** — add / edit / delete debts: name, balance, APR % per year,
  minimum monthly payment. Inline validation; amounts accept `৳`, commas
  and Bengali digits.
- **Snowball vs Avalanche simulation** — month-by-month amortization for
  both strategies: months to debt-free, debt-free date (YYYY-MM), total
  interest, total paid, payoff order per strategy.
- **Extra payment** — add an extra monthly payment (with quick presets) and
  watch the debt-free date move closer and the interest shrink.
- **Balance-over-time chart** — SVG chart of total balance for both
  strategies, plus a per-debt payoff table (avalanche).
- **Never-payoff warning** — if your payments don't cover the monthly
  interest, the plan says so plainly instead of pretending you'll finish.
- **Bilingual UI** — EN / বাংলা toggle, persisted, with Bengali digits.
- **Data** — JSON export / import with strict validation, typed-DELETE
  erase-all. Everything stays in your browser (localStorage); zero network
  requests.

## Stack

Vanilla HTML / CSS / JavaScript. No build step, no dependencies, no server.

## Run locally

Open `index.html` in any modern browser, or serve the folder:

```sh
npx serve .
# or
python3 -m http.server 8000
```

For deterministic dates in tests, the app honours `?asof=YYYY-MM-DD`.

## Testing

```sh
node tests/unit.test.js        # 46 unit checks
node tests/smoke.js desktop    # 31 headless-Chrome checks (raw CDP)
node tests/smoke.js mobile     # 32 headless-Chrome checks, 390px viewport
```

Smoke tests use `/opt/meta-chromium/chrome` and Node's global WebSocket;
no npm packages needed.

## How the math works

- Money is integer paisa (1 BDT = 100 paisa) — no float rounding error.
- Each month: interest accrues on every open debt as
  `round_half_away_from_zero(balance × APR% / 12)`, then minimum payments
  are applied, then the remaining budget (minimums + extra) goes to the
  current target debt: lowest balance (snowball) or highest APR (avalanche).
- The monthly budget is the sum of all minimum payments plus the extra
  payment. Freed minimums from paid-off debts stay in the budget and roll
  into the next target — that is what makes both strategies accelerate.
- Simulation caps at 1200 months (100 years); anything longer is reported
  as "Never pays off".

## Limitations

- Educational estimate only — not financial advice.
- Interest is compounded monthly. Real lenders may use daily accrual,
  fees, late charges or different rounding, so real payoff dates may differ.
- No account sync: this is a personal planner, not connected to any bank
  or lender.

## Status

MVP, complete and tested (see `TEST_RESULTS.md`).
