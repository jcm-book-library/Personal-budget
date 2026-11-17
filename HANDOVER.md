# Coin & Compass: handover

Last rewritten: 17 Nov 2026. **Rewrite this file at the end of each session; don't add to the bottom.** Keep it under 800 words. Columns and app rules: `docs/data-model.md`. Amounts live only in the sheet.

## Where things stand
- The Personal Budget Google Sheet holds everything (13 tabs, consolidated from the old 💰 sheet, which stays untouched as an archive).
- The app has four tabs:
  - **Dashboard**
  - **Buy list**
  - **Pay forecast**
  - **Check-in**
- It's published as a private claude.ai artifact, and on GitHub Pages from `main`.
- No app write has been tried on the real sheet yet; only the fake-sheet tests have run them.

## Done in the last stretch
- **Buy list tab:**
  - fixed-date sales
  - cooling-off for wants
  - cost as hours of work and as 10 years invested
  - what a purchase does to each payday (outright or Pay-in-4) and which goal it delays
  - price log, plan for a payday (then counted in the Pay forecast), mark bought (adds Pay-in-4 rows), drop, add item
- **Sheet safety:** every write finds its row by ID first, new IDs are read fresh, and Mark paid checks the row still matches.
- **Tests** in `tests/`: 11 checks on a fake sheet.
- **Build script:** now the control-room template, with one fix.
- **Charter:** gained `audience` and `standards`.
- **Sheet:** the owner's Review decisions applied on 23 Oct. The Review tab's Applied column records each change.
- This work ships in the pull request opened with this handover.

## Decisions the owner has made
- **New sheet** rather than editing 💰 (18 Oct).
- **Balance check-ins** each pay, not transaction tracking (18 Oct).
- **Up Savers** are the plan, with `up_live` FALSE until the accounts open. Merges and amounts are in Review #11 to #13.
- **Budget amounts:** confirmed in Review #1 to #10. Utilities stay estimates.
- **House:** aimed at the 2028/29 financial year with no rush, because it's being bought from family. Goal G03 is set to "Flexible".
- **Car and investing platform:** undecided.
- **Look:** Atkinson Hyperlegible + Figtree on the dark theme, until a rebuild or the rail (STANDARDS D1).

## Next steps (in order)
1. **Merge the PR.** Then, in the app:
   - save one check-in,
   - plan one item,
   - log one price.
   Then check the Balances, BuyList and PriceLog tabs to confirm each landed on the right row.
2. **When Up opens:** set `up_live` to TRUE and do a first check-in for the Savers.
3. **Super and projections:** Super Guarantee check, contribution cap, fees, projection in today's dollars. Needs no decisions.
4. **Investing:** trades, live ASX prices, target mix. Waits on the platform choice.
5. **Supabase move**, in control-room's `plans/SUPABASE.md` order. That's also when IDs and formula columns get fixed.

## Gotchas
- **The sheet predates two house rules:**
  - IDs are text (`B001`, `L01`), not numbers.
  - Formula columns: BuyList `Total` (one formula in K1), Budget `Per pay` and `Per year`, Accounts `Budget lines per pay` and `Gap`, Instalments `Item`.
  The app never writes formula columns and adds BuyList rows in two parts.
- **The connector returns displayed text** ("$1,234.50", "16 Oct 2026", "27/11/2026"). `num()` and `parseDate()` handle it.
- **An ISO date string written** through the connector becomes a real date.
- **Paydays are calculated** from `pay_anchor`, never typed. The 2027 three-pay months are April and October.
- **A plain date in `Buy window`** means "planned for that payday".
- **The control-room build template rejects any page with `<header>`**, because its `<head` check matches it. Fixed here with a regex.
- **The cloud sandbox blocks cdnjs and github.io.** The tests block the network, so the chart isn't tested, and the live site couldn't be checked from here.
- **Widen a tab before writing past its last column.**

## Open questions for the owner
- **Laptop:** were the Aug to Oct "Laptop" Pay-in-4 payments for a different laptop? They're now a separate bought row (B182), and the MacBook is back to Planned.
- **Bills Saver:** it's short of the bills it covers. That's on hold until bill prices are confirmed (Review #11).
- **Stamp duty:** discount or not (Review #18)?
- **Family name:** should it be "Finance" or "Money" (STANDARDS D2)?
- **Pages:** is GitHub Pages switched on for this repo?

## Files that matter
- `app.html`: the app. The Buy list code starts at `/* ---------- buy list ---------- */`.
- `docs/data-model.md`: tabs, columns, rules.
- `tests/app.test.mjs`: the fake sheet and checks.

## Start the next session with
> Repo: Personal-budget. Task: super and projections. Read CLAUDE.md and HANDOVER.md first.
