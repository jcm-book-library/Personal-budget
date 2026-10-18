# Coin & Compass

My budget, buy list, savings goals, investments and super. The Google Sheet "Personal Budget" holds the data, and this app will read and write it, the same way Jackets & Manuscripts works with its sheet.

No figures live in this repo. Everything personal stays in the sheet, behind Google sign-in.

## Files
| File | What it is |
|---|---|
| `docs/data-model.md` | Every tab and column in the sheet, and the rules the app uses to read them. |
| `app.html` | The app source (not built yet). It will also be published as the claude.ai artifact. |
| `index.html` | Will be built from `app.html` for GitHub Pages by `tools/build-pages.py`, as in my-book-library. |

## How it will connect
- **Inside claude.ai:** through the Google Sheets connector.
- **On GitHub Pages:** through Google sign-in, with the OAuth Client ID and the sheet ID saved in the browser, not in the code.

## Plan
1. **Sheet** (done): old tabs consolidated into one Sheet with Settings, Accounts, Budget, Goals, BuyList, Instalments, Balances, Super, Trades, PriceLog, Coaching and a Review tab of open questions.
2. **Base app:** Dashboard, a forecast for each payday, and balance check-ins.
3. **Buy List:** filters, cooling-off, purchase impact (what a purchase does to each payday and to each goal date), price log and sale windows.
4. **Investing:** trades, live prices, target mix, regular investing plan.
5. **Super and projections:** Super Guarantee check, contribution cap, fees, projection in today's dollars, and what-if sliders.
