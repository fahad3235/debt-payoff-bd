# TEST_RESULTS.md — debt-payoff-bd (run #83, 2026-10-18 10:00 slot)

## Unit tests — 46/46 passed (`node tests/unit.test.js`)

Hand-verified amortization, single debt 1,200 BDT @ 12% APR, min 200 BDT, extra 0:
7 months; total interest 4,385 paisa (43.85 BDT); total paid 124,385 paisa;
debt-free 2027-05; series [101200, ..., 0]. All asserted exactly.

Also verified: extra payment shortens term and cuts interest; 0% APR =
10 months / 0 interest; trap debt (100,000 BDT @ 60%, min 100) never pays
off and caps at 1200 months; two-debt comparison — avalanche interest <=
snowball, snowball pays Card B first, avalanche pays Loan A first,
recommended = avalanche, monthly budget 8,500.00 BDT; parseAmount handles
`1,500.50`, Bengali `১,৫০০.৫০`, rejects `abc` / empty / 3-decimal;
parseApr handles `12.5` and Bengali `১২`; fmtMoney EN `৳1,500.50` /
BN `৳১,৫০০.৫০`; roundPaisa rounds half away from zero (-62.5 -> -63);
validateDebt catches bad name / balance / APR / min; validateImport
rejects wrong app / version / duplicate ids / invalid debt / bad extra /
bad lang; export round-trips through validateImport.

## Headless-Chrome smoke — 31/31 desktop + 32/32 mobile (`node tests/smoke.js`)

0 console/page errors in both runs. Covered: initial empty states, invalid
debt inline error with no row added, add 2 debts, Plan tab budget 3,500.00,
numeric months both strategies, avalanche interest <= snowball, verdict
"Both strategies cost the same" with no extra (debts are independent when
budget = sum of minimums — no cross-debt money to redirect), chart paths
render, extra 5,000 -> budget 8,500.00 + fewer months + "Avalanche saves"
verdict + YYYY-MM debt-free date, edit pre-fill + rename, BN toggle
(Bengali title + Bengali digits), reload persistence, localStorage state
stored, typed-DELETE erase -> 0 debts, export -> erase -> import round-trip
restores 2, malformed import rejected with data intact, trap debt shows
"Never" + never-payoff hint, mobile 390px no horizontal overflow,
zero network requests.

## Repairs

- 1 real app fix: localStorage now stores the full export envelope
  ({app, version, debts, extraPaisa, lang}) so stored state validates
  through the same strict import path as files.
- 2 test-side fixes: no-extra verdict expectation corrected to
  "equal interest" (correct behaviour, see above); trap-debt test now
  writes the envelope format to localStorage.
- 1 app-hygiene fix: removed a stray placeholder line in parseAmount.

## Hygiene

All sources pure ASCII (Bengali as \uXXXX escapes in JS, numeric entities
in HTML); verified with `grep -P '[^\x00-\x7F]'` = 0 matches on
index.html, css/, js/, tests/.
