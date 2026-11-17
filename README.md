# Coin & Compass

My budget, buy list, savings goals, investments and super. The Google Sheet "Personal Budget" holds the data, and this app will read and write it, the same way Jackets & Manuscripts works with its sheet.

No figures live in this repo. Everything personal stays in the sheet, behind Google sign-in.

- **Live:** https://jcm-book-library.github.io/Personal-budget/ (and as a private claude.ai artifact)
- **Tabs:** Dashboard, Buy list, Pay forecast, Check-in

## Files
| File | What it is |
|---|---|
| `docs/data-model.md` | Every tab and column in the sheet, and the rules the app uses to read them. |
| `app.html` | The app source. Edit this. The same file is published as the claude.ai artifact. |
| `index.html` | Built from `app.html` for GitHub Pages. Rebuild it with `python3 tools/build-pages.py`. |
| `manifest.webmanifest`, `icons/` | Home-screen install and icons. `icons/cc-mark.svg` is the mark. |
| `tools/build-pages.py` | The control-room template, with this app's short name. |
| `tests/` | `run-all.sh` builds, then `app.test.mjs` runs the app in headless Chromium against a fake sheet. |
| `HANDOVER.md` | Where the work stands, for the next session. |

## Run and test
- `bash tests/run-all.sh` builds `index.html` and runs every test. It needs Python 3, Node and Playwright with Chromium.
- The tests stub `window.claude` with a fake Google Sheets connector holding made-up figures, fix the date to 23 Oct 2026 in Melbourne time, and block all network calls. They check the pay maths, no sideways scrolling at 390 and 1280 px, and every write: that it lands on the right row even if rows move, adds IDs correctly, and never touches a formula column.

## How it connects
- **Inside claude.ai:** through the Google Sheets connector.
- **On GitHub Pages:** through Google sign-in. It uses the same OAuth Client ID as Jackets & Manuscripts, and shares its sign-in, because both live on `jcm-book-library.github.io`.
- **The sheet link** is entered once under **Sheet** and saved in that browser (`cc_config`), never in the code. Until it's set, the app shows made-up example figures with a banner saying so.
- **What it writes:** new rows on Balances (check-ins), BuyList (new items), PriceLog (prices seen) and Instalments (Pay-in-4 when you mark something bought); the Paid tick on Instalments; and status, buy window, pay method, final cost and dates on one BuyList row at a time. Nothing else. Before each change it finds the row by its ID (or, on Instalments, checks the date and item still match) and stops if there isn't exactly one match.

## Plan
1. **Sheet** (done): old tabs consolidated into one Sheet with Settings, Accounts, Budget, Goals, BuyList, Instalments, Balances, Super, Trades, PriceLog, Coaching and a Review tab of open questions.
2. **Base app** (done): Dashboard, Pay forecast and Check-in.
3. **Buy list** (done): filters, sale calendar, cooling-off, purchase impact on each payday and on your goals, price log, plan for a payday, mark bought or dropped, add items.
4. **Investing:** trades, live prices, target mix, regular investing plan.
5. **Super and projections:** Super Guarantee check, contribution cap, fees, projection in today's dollars, and what-if sliders.
