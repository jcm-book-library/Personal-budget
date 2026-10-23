# Data model

The Google Sheet "Personal Budget" is the only store. Each tab is a table: headers in row 1, one record per row from row 2, no totals or blank rows inside the table. The app reads tabs by name and columns by header text, so columns can be reordered but headers must not be renamed.

Blue text marks inputs. Yellow fill marks inputs still to fill in. Black text is a formula.

## Settings
Key/value pairs. Columns: `Key`, `Value`, `What it is`, `Source`.

| Key | Meaning |
|---|---|
| `pay_anchor` | Any known payday. Every payday is `pay_anchor + n × pay_cycle_days`. |
| `pay_cycle_days` | 14. |
| `pays_per_year` | 26. Converts yearly amounts to per pay. |
| `take_home_per_pay` | Net pay. |
| `gross_salary`, `sg_rate` | For the Super Guarantee check. |
| `savings_target_monthly` | Minimum saved per month. |
| `buffer_floor` | Lowest balance to keep after bills. |
| `move_date` | Switches Budget lines from `Until move` to `From move`. |
| `up_live` | `FALSE` until the Up accounts exist. While false, every line is paid from `EVERYDAY`. |
| `cooling_off_threshold`, `cooling_off_days` | Wants (priority 2 and lower) above the threshold wait this many days, counted from `Date added`. |
| `work_hours_per_week` | Turns a price into hours of work at your take-home hourly rate. |
| `invest_return`, `inflation` | Assumptions for future cost and today's-dollar projections. |
| `super_return_conservative`, `super_return_growth`, `super_target` | Super projection inputs. |
| `birth_year`, `retirement_age`, `preservation_age` | Ages for projections. |

## Accounts
`ID`, `Name`, `Institution`, `Type`, `Role`, `Per pay`, `Budget lines per pay` (formula), `Gap` (formula), `Status`, `Notes`.

- **Role:**
  - `Everyday`: where pay lands.
  - `Bills`: regular bills.
  - `Spend`: a spending envelope, used up each cycle.
  - `Sinking`: builds up for irregular costs.
  - `Save`: goal savings.
  - `Super`: a super fund.
- **Status:** `Active`, `Planned`, `Closed`.
- **Per pay:** the amount moved into the account each payday.
- **Gap:** `Per pay` minus the Budget lines it pays for (after the move). Negative means the account is short.

## Budget
`ID`, `Item`, `Type`, `Category`, `Amount`, `Frequency`, `Due`, `Phase`, `Paid from`, `Per pay`, `Per year`, `Source`, `Notes`.

- **Type:** `Bill`, `Subscription`, `Irregular`, `Spending`.
- **Frequency:** `Weekly` (52 a year), `Fortnightly` (26), `Monthly` (12), `Quarterly` (4), `Yearly` (1).
- **Phase:**
  - `Ongoing`: before and after the move.
  - `Until move`: stops at `move_date`.
  - `From move`: starts at `move_date`.
- **Paid from:** an Accounts `ID`.
- **Due:** free text: a weekday, a day of the month such as `12th`, `Payday`, or blank.

## Goals
`ID`, `Goal`, `Target amount`, `Target date`, `Saver`, `Priority`, `Status`, `Notes`, `Source`.
`Saver` is the Accounts `ID` the goal is saved in.

## BuyList
`ID`, `Item`, `Category`, `Subcategory`, `Room`, `Priority`, `Status`, `Buy window`, `Cost each`, `Qty`, `Total`, `Cost low`, `Cost premium`, `Final cost`, `Retailer`, `Pay method`, `Pay-in-4 eligible`, `Funded by`, `Date added`, `Link`, `Notes`, `Source`, `Bought on`.

- **Status:** `Idea`, `Planned`, `Waiting for sale`, `Bought`, `Dropped`.
- **Priority:** 1 (highest) to 3. Values in between such as 1.5 are allowed.
- **Buy window:** free text, for example `Pre-move`, `At move`, `Black Friday`, `Boxing Day`, `On sale`, `Q1 2027`, `Jan 2027`, `12-24 months`. A plain date means the item is planned for that payday, and the Pay forecast counts it (as four payments when `Pay method` is `Pay-in-4`).
- **Total:** one formula in the header cell fills the whole column: `Final cost` if set, otherwise `Cost each × Qty`. The app should write to `Cost each`, `Qty` and `Final cost`, never to `Total`.
- **Funded by:** an Accounts `ID`, or blank for everyday money. The Buy list uses it to say which goal a purchase delays.
- **Bought on:** the date it was marked bought in the app.

## Instalments
`Date`, `BuyList ID`, `Item` (formula), `Amount`, `Paid` (checkbox), `Notes`.
One row per Pay-in-4 payment. A new Pay-in-4 purchase adds four rows, 14 days apart, starting on the purchase date.

## Balances
`Date`, `Account ID`, `Balance`, `Note`. One row per account per check-in. Super balances go here too.

## Super
`Account ID`, `Fund`, `ABN`, `USI`, `Member number`, `Investment option`, `Insurance`, `Yearly fees`, `Adviser`, `Notes`.

## Trades
`Date`, `Ticker`, `Action` (`Buy`, `Sell`, `Dividend`, `DRP`), `Units`, `Price`, `Brokerage`, `Platform`, `Notes`.

## PriceLog
`Date`, `BuyList ID`, `Item`, `Price`, `Retailer`, `Link`, `Notes`. Prices seen while waiting for a sale.

## Coaching
`Date`, `Topic`, `Notes`, `Action`, `Status`. One row per topic per session.

## Review
Open questions from the migration. The app ignores this tab.

## Summary
Formulas only. The app ignores this tab and computes its own figures.

## Rules the app follows
- **Paydays** come from `pay_anchor` and `pay_cycle_days`, never from a typed calendar.
- **Forecast by pay:** for each payday, the forecast lists:
  - take-home pay,
  - Budget lines due in that cycle (by `Phase` and `move_date`),
  - unpaid Instalments dated in that cycle,
  - planned BuyList items assigned to that cycle.

  What's left is what goes to savings.
- **Writes:** the app only appends rows or edits input cells. It never rewrites a whole tab and never writes to formula columns. On BuyList it writes `Status`, `Buy window`, `Pay method`, `Final cost`, `Bought on` and `Date added` for one row at a time, and adds new rows in two parts so the `Total` formula column is never touched.
- **Sales:** only fixed-date sales are shown (Singles' Day 11 Nov, Black Friday to Cyber Monday, Boxing Day to 2 Jan, EOFY in June). Items marked `On sale` or `Waiting for sale` count towards the next one.
- **Purchase impact:** the forecast is run with and without the item on the chosen payday. Pay-in-4 is four equal payments 14 days apart, the first on the day you buy.
