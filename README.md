# Coin & Compass

My budget, buy list, savings goals, investments and super. The Google Sheet "Personal Budget" holds the data, and this app will read and write it, the same way Jackets & Manuscripts works with its sheet.

No figures live in this repo. Everything personal stays in the sheet, behind Google sign-in.

## Files
| File | What it is |
|---|---|
| `docs/data-model.md` | Every tab and column in the sheet, and the rules the app uses to read them. |
| `app.html` | The app source. Edit this. The same file is published as the claude.ai artifact. |
| `index.html` | Built from `app.html` for GitHub Pages. Rebuild it with `python3 tools/build-pages.py`. |
| `manifest.webmanifest`, `icons/` | Home-screen install and icons. `icons/cc-mark.svg` is the mark. |

## How it connects
- **Inside claude.ai:** through the Google Sheets connector.
- **On GitHub Pages:** through Google sign-in. It uses the same OAuth Client ID as Jackets & Manuscripts, and shares its sign-in, because both live on `jcm-book-library.github.io`.
- **The sheet link** is entered once under **Sheet** and saved in that browser (`cc_config`), never in the code. Until it's set, the app shows made-up example figures with a banner saying so.
- **What it writes:** new rows on Balances (check-ins), and the Paid tick on Instalments. Nothing else.

## Plan
1. **Sheet** (done): old tabs consolidated into one Sheet with Settings, Accounts, Budget, Goals, BuyList, Instalments, Balances, Super, Trades, PriceLog, Coaching and a Review tab of open questions.
2. **Base app** (done): Dashboard, Pay forecast and Check-in.
3. **Buy List:** filters, cooling-off, purchase impact (what a purchase does to each payday and to each goal date), price log and sale windows.
4. **Investing:** trades, live prices, target mix, regular investing plan.
5. **Super and projections:** Super Guarantee check, contribution cap, fees, projection in today's dollars, and what-if sliders.
