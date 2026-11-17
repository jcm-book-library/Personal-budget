// Coin & Compass app tests. Run with: bash tests/run-all.sh
// Loads index.html in headless Chromium with a stubbed window.claude whose Google Sheets
// connector is a fake, in-memory sheet holding made-up figures (never real ones).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

// CommonJS require honours NODE_PATH, so a global Playwright install works too
const { chromium } = createRequire(import.meta.url)('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'file://' + path.join(root, 'index.html');
const NOW = new Date('2026-10-23T10:00:00+11:00'); // a Friday, one week into the pay of 16 Oct

// The fake sheet, laid out the way the real one reads back (displayed values)
const BUY_HEAD = ['ID','Item','Category','Subcategory','Room','Priority','Status','Buy window','Cost each','Qty','Total','Cost low','Cost premium','Final cost','Retailer','Pay method','Pay-in-4 eligible','Funded by','Date added','Link','Notes','Source','Bought on'];
const buy = (id, item, pri, status, win, cost, extra = {}) => BUY_HEAD.map(h => ({ ID: id, Item: item, Category: 'Home', Priority: String(pri), Status: status, 'Buy window': win, 'Cost each': cost, Qty: '1', Total: cost, ...extra })[h] ?? '');
const FIXTURE = {
  Settings: [['Key','Value'],['pay_anchor','16 Oct 2026'],['pay_cycle_days','14'],['pays_per_year','26'],['take_home_per_pay','$2,600.00'],
    ['gross_salary','$80,000.00'],['sg_rate','12.0%'],['savings_target_monthly','$1,040.00'],['buffer_floor','$300.00'],['move_date','29 Jan 2027'],
    ['up_live','FALSE'],['cooling_off_threshold','$150.00'],['cooling_off_days','30'],['invest_return','7.0%'],['inflation','2.5%'],['work_hours_per_week','38']],
  Accounts: [['ID','Name','Institution','Type','Role','Per pay','Budget lines per pay','Gap','Status'],
    ['EVERYDAY','Everyday account','Test Bank','Transaction','Everyday','','','','Active'],
    ['SAVINGS','Savings account','Test Bank','Savings','Save','$400.00','','','Active'],
    ['BILLS','Bills','Up','Saver','Bills','$800.00','$820.00','-$20.00','Planned'],
    ['SUPER-A','Test Super','Test Super','Super','Super','','','','Active']],
  Budget: [['ID','Item','Type','Category','Amount','Frequency','Due','Phase','Paid from'],
    ['L01','Rent','Bill','Housing','$300.00','Weekly','Monday','Until move','BILLS'],
    ['L02','Phone','Bill','Phone','$50.00','Monthly','20th','Ongoing','BILLS'],
    ['L03','Streaming','Subscription','Streaming','$20.00','Monthly','1st','Ongoing','BILLS'],
    ['L04','Groceries','Spending','Food','$150.00','Weekly','','Ongoing','EVERYDAY'],
    ['L05','Dentist','Irregular','Health','$260.00','Yearly','','Ongoing','BILLS'],
    ['L06','Gas','Bill','Utilities','$65.00','Monthly','','From move','BILLS']],
  Goals: [['ID','Goal','Target amount','Target date','Saver','Priority','Status'],['G01','Emergency fund','$5,000','30 Jun 2027','SAVINGS','1','Active']],
  Instalments: [['Date','BuyList ID','Item','Amount','Paid','Notes'],
    ['16 Oct 2026','B004','Headphones','$100.00','TRUE',''],['30 Oct 2026','B004','Headphones','$100.00','FALSE',''],
    ['13 Nov 2026','B004','Headphones','$100.00','FALSE',''],['27 Nov 2026','B004','Headphones','$100.00','FALSE','']],
  Balances: [['Date','Account ID','Balance','Note'],['16 Oct 2026','EVERYDAY','$900.00',''],['1 Oct 2026','SUPER-A','$50,000.00','']],
  BuyList: [BUY_HEAD,
    buy('B001','Desk',1,'Planned','Black Friday','$500.00'),
    buy('B002','Chair',2,'Waiting for sale','On sale','$300.00',{ 'Date added': '1 Oct 2026' }),
    buy('B003','Lamp',3,'Idea','','$40.00',{ 'Pay-in-4 eligible': 'Yes' }),
    buy('B004','Headphones',2,'Bought','','$400.00',{ 'Final cost': '$400.00', 'Pay method': 'Pay-in-4' }),
    buy('B007','Kettle',3,'Idea','','$80.00')],
  PriceLog: [['Date','BuyList ID','Item','Price','Retailer','Link','Notes']]
};

// Runs inside the page: a fake Google Sheets connector over window.__sheet
function installFake({ fixture, withClaude }) {
  localStorage.setItem('cc_config', JSON.stringify({ sheetId: 'TEST_SHEET' }));
  window.__sheet = JSON.parse(JSON.stringify(fixture));
  window.__writes = [];
  const col = s => [...s].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const letter = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  const parse = range => {
    const [tab, a1] = range.split('!'), [a, b = a] = a1.split(':');
    const p = x => { const m = x.match(/^([A-Z]+)(\d+)?$/); return { c: col(m[1]), r: m[2] ? +m[2] - 1 : null }; };
    return { tab: tab.replace(/^'|'$/g, ''), s: p(a), e: p(b) };
  };
  const fake = {
    async callTool(server, tool, input) {
      if (server !== 'Google Sheets') throw { code: 'server_not_connected' };
      const { tab, s, e } = parse(input.range), t = window.__sheet[tab];
      if (!t) throw { code: 'tool_error', message: 'Unable to parse range: ' + input.range };
      if (tool === 'get_values') {
        const rows = t.slice(s.r ?? 0, e.r === null ? undefined : e.r + 1).map(r => r.slice(s.c, e.c + 1));
        return { payload: { range: input.range, values: rows } };
      }
      window.__writes.push([tool, input.range, input.values]);
      if (tool === 'update_values') {
        input.values.forEach((vals, i) => vals.forEach((v, j) => { const r = s.r + i; t[r] = t[r] || []; t[r][s.c + j] = v; }));
        return { payload: { updatedRange: input.range } };
      }
      if (tool === 'append_values') {
        let last = 0; t.forEach((r, i) => { if (r.slice(s.c, e.c + 1).some(v => String(v ?? '') !== '')) last = i; });
        input.values.forEach((vals, i) => { const r = last + 1 + i; t[r] = t[r] || []; vals.forEach((v, j) => { t[r][s.c + j] = v; }); });
        const first = last + 2, end = last + 1 + input.values.length;
        return { payload: { updates: { updatedRange: `${tab}!${letter(s.c)}${first}:${letter(s.c + input.values[0].length - 1)}${end}` } } };
      }
      throw { code: 'not_in_manifest' };
    }
  };
  if (withClaude) window.claude = { use: async name => (name === 'mcp' ? fake : null) };
}

const results = [];
async function test(name, fn) {
  try { await fn(); results.push(['ok', name]); console.log('  ok   ' + name); }
  catch (e) { results.push(['FAIL', name, e]); console.log('  FAIL ' + name + '\n       ' + (e && e.message || e)); }
}

const browser = await chromium.launch().catch(() => chromium.launch({ executablePath: '/opt/pw-browsers/chromium/chrome-linux/chrome' }));
async function open(width, { withClaude = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'Australia/Melbourne', locale: 'en-AU' });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  await page.clock.setFixedTime(NOW);
  // Nothing leaves the machine: CDN scripts, fonts and Google sign-in are blocked (the app copes without them)
  await page.route(/^https?:/, r => r.abort());
  await page.addInitScript(installFake, { fixture: FIXTURE, withClaude });
  await page.goto(PAGE);
  if (withClaude) await page.waitForFunction(() => /^Live/.test(document.getElementById('statusText').textContent), null, { timeout: 10000 });
  return page;
}
const sheet = (page, tab) => page.evaluate(t => window.__sheet[t], tab);
const writes = page => page.evaluate(() => window.__writes);
const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
const settle = (page, ms = 150) => page.waitForTimeout(ms);

console.log('Coin & Compass tests');

await test('loads live from the sheet with no script errors', async () => {
  const page = await open(1280);
  assert.match(await page.textContent('#statusText'), /^Live/);
  assert.equal(await page.textContent('#sPay'), '30 Oct');
  assert.deepEqual(page.errors, []);
  await page.context().close();
});

await test('pay forecast: dated bills land in their pay, the rest is spread', async () => {
  const page = await open(1280);
  // Pay of 16 Oct: rent on 19 and 26 Oct (600), phone 20th (50), groceries 2 weeks (300), dentist 260/26 (10)
  // Pay of 30 Oct: rent 2 and 9 Nov (600), streaming 1 Nov (20), groceries (300), dentist (10), Pay-in-4 30 Oct (100)
  const left = await page.evaluate(() => forecast(state.D, 2).map(p => Math.round(p.left * 100) / 100));
  assert.deepEqual(left, [1640, 1570]);
  // After the move date, rent stops and gas starts
  const late = await page.evaluate(() => forecast(state.D, 10).find(p => p.start >= '2027-02-01').items.map(x => x.label));
  assert.ok(!late.includes('Rent') && late.includes('Gas'));
  await page.context().close();
});

for (const width of [390, 1280]) {
  await test(`no sideways scrolling on any tab at ${width}px`, async () => {
    const page = await open(width);
    for (const tab of ['dash', 'buy', 'forecast', 'checkin']) {
      await page.click('#tab-' + tab); await settle(page, 80);
      assert.ok(await noSideScroll(page), `${tab} scrolls sideways`);
    }
    await page.click('#tab-buy'); await page.click('.bi[data-id="B001"]'); await settle(page);
    assert.ok(await noSideScroll(page), 'item view scrolls sideways');
    assert.deepEqual(page.errors, []);
    await page.context().close();
  });
}

await test('check-in adds one row per filled balance to Balances', async () => {
  const page = await open(1280);
  await page.click('#tab-checkin');
  await page.fill('#bal-EVERYDAY', '1234.5');
  await page.click('#ciSave'); await settle(page, 300);
  const rows = await sheet(page, 'Balances');
  assert.deepEqual(rows[rows.length - 1], ['2026-10-23', 'EVERYDAY', 1234.5, '']);
  assert.equal(rows.length, 4);
  await page.context().close();
});

await test('plan for a payday finds the row by ID even after rows move', async () => {
  const page = await open(1280);
  // Someone inserts a row above B001 after the app loaded
  await page.evaluate(h => window.__sheet.BuyList.splice(1, 0, h.map((_, i) => (i === 0 ? 'B099' : i === 1 ? 'Inserted' : ''))), BUY_HEAD);
  await page.click('#tab-buy'); await page.click('.bi[data-id="B001"]'); await settle(page);
  await page.click('#itActions button[data-act="plan"]'); await settle(page, 300);
  const rows = await sheet(page, 'BuyList');
  const b001 = rows.find(r => r[0] === 'B001'), inserted = rows.find(r => r[0] === 'B099');
  assert.match(String(b001[7]), /^2026-1\d-\d\d$/, 'Buy window is now a date');
  assert.equal(b001[6], 'Planned');
  assert.equal(inserted[7], '', 'the row that moved into B001\'s old place is untouched');
  await page.context().close();
});

await test('mark bought with Pay-in-4 adds four payments and never writes the Total column', async () => {
  const page = await open(1280);
  await page.click('#tab-buy'); await page.click('.bi[data-id="B003"]'); await settle(page);
  await page.click('#itActions button[data-act="bought"]');
  await page.click('#itBody button[data-bmethod="Pay-in-4"]');
  await page.click('#itBody button[data-act="bought-save"]'); await settle(page, 300);
  const b003 = (await sheet(page, 'BuyList')).find(r => r[0] === 'B003');
  assert.equal(b003[6], 'Bought'); assert.equal(b003[13], 40); assert.equal(b003[22], '2026-10-23');
  const inst = (await sheet(page, 'Instalments')).filter(r => r[1] === 'B003');
  assert.deepEqual(inst.map(r => [r[0], r[3], r[4]]), [['2026-10-23', 10, true], ['2026-11-06', 10, false], ['2026-11-20', 10, false], ['2026-12-04', 10, false]]);
  assert.ok(!(await writes(page)).some(([, range]) => /^BuyList!K/.test(range)), 'wrote to the Total column');
  await page.context().close();
});

await test('log a price adds a PriceLog row', async () => {
  const page = await open(1280);
  await page.click('#tab-buy'); await page.click('.bi[data-id="B002"]'); await settle(page);
  await page.fill('#itPrice', '255');
  await page.click('#itBody button[data-act="price"]'); await settle(page, 300);
  const rows = await sheet(page, 'PriceLog');
  assert.deepEqual(rows[1].slice(0, 4), ['2026-10-23', 'B002', 'Chair', 255]);
  await page.context().close();
});

await test('add item takes the highest ID on the sheet + 1, read just before adding', async () => {
  const page = await open(1280);
  // Another device adds B009 after this page loaded
  await page.evaluate(h => window.__sheet.BuyList.push(h.map((_, i) => (i === 0 ? 'B009' : i === 1 ? 'From elsewhere' : ''))), BUY_HEAD);
  await page.click('#tab-buy'); await page.click('#bAdd');
  await page.fill('#addName', 'Toaster'); await page.fill('#addCost', '89'); await page.fill('#addLink', 'https://example.com/toaster');
  await page.click('#addSave'); await settle(page, 400);
  const row = (await sheet(page, 'BuyList')).find(r => r[1] === 'Toaster');
  assert.equal(row[0], 'B010');
  assert.equal(row[8], 89); assert.equal(row[18], '2026-10-23'); assert.equal(row[19], 'https://example.com/toaster');
  assert.ok(!(await writes(page)).some(([, range]) => /^BuyList!K/.test(range)), 'wrote to the Total column');
  await page.context().close();
});

await test('mark paid refuses when the payment has moved on the sheet', async () => {
  const page = await open(1280);
  await page.evaluate(() => window.__sheet.Instalments.splice(1, 0, ['1 Oct 2026', 'B001', 'Other', '$5.00', 'FALSE', '']));
  await page.click('#tab-checkin');
  await page.click('#instList button[data-paid]'); await settle(page, 300);
  assert.ok(!(await writes(page)).some(([t]) => t === 'update_values'), 'it wrote anyway');
  assert.match(await page.textContent('#notice'), /moved/);
  await page.context().close();
});

await test('without Claude or a sign-in it shows example figures, clearly labelled', async () => {
  const page = await open(390, { withClaude: false });
  await settle(page, 300);
  assert.match(await page.textContent('#notice'), /example figures/);
  assert.equal(await page.isDisabled('#ciSave'), true);
  assert.deepEqual(page.errors, []);
  await page.context().close();
});

await browser.close();
const failed = results.filter(r => r[0] === 'FAIL');
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
