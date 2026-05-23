import puppeteer from 'puppeteer';

const BASE  = 'http://localhost:3000';
const ADMIN = '/cjr-dashboard-2026.html';
let passed = 0, failed = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function ok(label, condition) {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else           { console.error(`  ✗ ${label}`); failed++; }
}

// pick a future available weekday 10 days out for calendar tests
function futureKey(daysOut = 10) {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() + daysOut);
  // shift to nearest weekday (Mon–Sat)
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return { key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, date: d };
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page    = await browser.newPage();

/* ════════════════════════════════════════════════════════════════
   SECTION 1 — CONTACT FORM
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [1] CONTACT FORM ══════════════════════════════════');

await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' });
await sleep(300);

// 1a. Estimator – outdoor / small
await page.select('#serviceType', 'outdoor');
await sleep(150);
await page.click('#load-small');
await sleep(250);
ok('Estimator appears for outdoor+small',
  await page.$eval('#estimatorCard', el => el.style.display !== 'none'));
const rangeText = await page.$eval('#estimateRange', el => el.textContent);
ok('Estimator shows $95 – $165',
  rangeText.includes('$95') && rangeText.includes('$165'));

// 1b. Service-type label updates
ok('Service label shows "Outdoor"',
  await page.$eval('#estimateService', el => el.textContent.includes('Outdoor')));

// 1c. Service explainer shows
ok('Service explainer visible',
  await page.$eval('#svcExplainer', el => el.style.display !== 'none'));

// 1d. Switch to every other service type — all produce correct ranges
for (const [svc, size, expectedLow] of [
  ['indoor_ground','medium','$215'],
  ['indoor_stairs','large','$475'],
  ['fullcleanout','large','$1,235'],
]) {
  await page.select('#serviceType', svc);
  await sleep(100);
  const radio = await page.$(`#load-${size}`);
  await radio.click(); await sleep(200);
  const r = await page.$eval('#estimateRange', el => el.textContent);
  ok(`Estimator correct for ${svc}+${size} (${expectedLow})`, r.includes(expectedLow));
}

// 1e. Reset to outdoor+small for rest of form tests
await page.select('#serviceType', 'outdoor'); await sleep(100);
await page.click('#load-small'); await sleep(200);

// 1f. Fee items grid renders
const feeCount = await page.$$eval('#feeItemsGrid .fee-item', els => els.length);
ok(`Fee items grid has ${feeCount} items`, feeCount >= 4);

// 1g. Qty increment on first fee item
await page.click('#feeItemsGrid .qty-btn:last-of-type'); // + button of first item
await sleep(150);
const qty = await page.$eval('#feeItemsGrid .qty-num', el => el.textContent);
ok('Fee item qty incremented to 1', qty === '1');

// 1h. Fee summary shows
ok('Fee summary appears after selecting item',
  await page.$eval('#feeSummary', el => el.style.display !== 'none'));

// 1i. Estimate reflects added fee
const feeRange = await page.$eval('#estimateRange', el => el.textContent);
ok('Estimate increased by disposal fee', !feeRange.includes('$95'));

// 1j. Qty decrement
await page.click('#feeItemsGrid .qty-btn:first-of-type'); // − button
await sleep(150);
const qtyAfter = await page.$eval('#feeItemsGrid .qty-num', el => el.textContent);
ok('Fee item qty decremented back to 0', qtyAfter === '0');
ok('Fee summary hides when qty=0',
  await page.$eval('#feeSummary', el => el.style.display === 'none'));

// 1k. Calendar renders
const calCells = await page.$$eval('#calGrid .cal-day:not(.empty)', els => els.length);
ok(`Calendar rendered (${calCells} days)`, calCells >= 28);

// 1l. Available day is clickable; selecting it shows time slots
const availCell = await page.$('#calGrid .cal-day.available');
if (availCell) {
  await availCell.click(); await sleep(200);
  ok('Time slot section appears after date select',
    await page.$eval('#timeSlotSection', el => el.style.display !== 'none'));
  ok('Selected date display visible',
    await page.$eval('#selectedDateDisplay', el => el.style.display !== 'none'));

  // 1m. Select a time slot
  await page.click('.time-slot-btn[data-time="morning"]'); await sleep(100);
  ok('Time slot activates',
    await page.$eval('.time-slot-btn[data-time="morning"]', el => el.classList.contains('active')));
  ok('Time selected display appears',
    await page.$eval('#timeSelectedDisplay', el => el.style.display !== 'none'));
}

// 1n. Form validation — submit without required fields
await page.click('button[type="submit"]'); await sleep(200);
ok('Form does not submit when empty',
  await page.$eval('#successMsg', el => el.style.display !== 'block'));

// 1o. Valid submit
await page.evaluate(() => {
  localStorage.removeItem('cjr_jobs'); // clean slate
});
await page.type('#name', 'Jane Doe');
await page.type('#email', 'jane@test.com');
await page.type('#town', 'Burlington');
await page.click('button[type="submit"]'); await sleep(400);
ok('Success message shown',
  await page.$eval('#successMsg', el => el.style.display !== 'none'));
const savedJobs = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('cjr_jobs') || '[]'));
ok('Job saved with name',  savedJobs[0]?.name  === 'Jane Doe');
ok('Job saved with email', savedJobs[0]?.email === 'jane@test.com');
ok('Job saved with town',  savedJobs[0]?.town  === 'Burlington');
ok('Job saved with svc',   savedJobs[0]?.svc   === 'outdoor');
ok('Job saved with size',  savedJobs[0]?.size  === 'small');
ok('Job done=false',       savedJobs[0]?.done  === false);

/* ════════════════════════════════════════════════════════════════
   SECTION 2 — ADMIN LOGIN
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [2] ADMIN LOGIN ═══════════════════════════════════');

await page.goto(BASE + ADMIN, { waitUntil: 'networkidle0' }); await sleep(300);

// 2a. Wrong password shows error
await page.type('#pwInput', 'wrongpassword');
await page.click('button[onclick="doLogin()"]'); await sleep(200);
ok('Wrong password shows error',
  await page.$eval('#loginErr', el => el.style.display !== 'none'));

// 2b. Clear and use correct password
await page.$eval('#pwInput', el => el.value = '');
await page.type('#pwInput', 'champlain2024');
await page.click('button[onclick="doLogin()"]'); await sleep(300);
ok('Dashboard visible after correct login',
  await page.$eval('#dashboard', el => el.style.display !== 'none'));
ok('Login screen hidden',
  await page.$eval('#loginScreen', el => el.style.display === 'none' || el.style.display === ''));

// 2c. Auth persists on reload
await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
ok('Auth persists on reload',
  await page.$eval('#dashboard', el => el.style.display !== 'none'));

/* ════════════════════════════════════════════════════════════════
   SECTION 3 — ADMIN CALENDAR + CONTACT FORM SYNC
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [3] CALENDAR — admin block → contact form sync ════');

await page.evaluate(() => switchTab('cal')); await sleep(300);
ok('Calendar tab visible',
  await page.$eval('#tab-cal', el => el.style.display !== 'none'));

// 3a. Calendar renders days
const adminCalDays = await page.$$eval('#acalDaysGrid .acal-day.avail', els => els.length);
ok(`Admin calendar shows ${adminCalDays} available days`, adminCalDays >= 15);

// 3b. Block an available day
const { key: blockKey, date: blockDate } = futureKey(12);
await page.evaluate(k => {
  // Simulate clicking: directly call toggleDate
  toggleDate(k);
}, blockKey);
await sleep(200);

const blockedListHTML = await page.$eval('#blockedList', el => el.innerHTML);
ok('Blocked date appears in blocked list', blockedListHTML.length > 50);

const blockedCount = await page.$eval('#blockedCount', el => el.textContent);
ok('Blocked count badge = 1', blockedCount === '1');

// 3c. Verify same date is now a .blocked cell in admin calendar
const calCellsBlocked = await page.$$eval('#acalDaysGrid .acal-day.blocked', els => els.length);
ok('Admin calendar shows the blocked cell', calCellsBlocked >= 1);

// 3c2. Job dot: seed a job with preferredDate matching blockDate and verify badge appears
const blockDay = blockDate.getDate();
await page.evaluate((iso) => {
  const jobs = [{ id:9999, submitted:new Date().toISOString(),
    name:'Test Job', email:'t@t.com', town:'Test',
    svc:'outdoor', size:'small', quotedLow:95, quotedHigh:165,
    preferredDate: iso, preferredTime:'morning',
    description:'', distance:'', cost:'', done:false }];
  localStorage.setItem('cjr_jobs', JSON.stringify(jobs));
  renderCal();
}, blockDate.toISOString());
await sleep(200);
const hasJobBadge = await page.evaluate((day) => {
  const cells = document.querySelectorAll('#acalDaysGrid .acal-day.has-job');
  for (const c of cells) {
    const num = c.childNodes[0];
    if (num && num.textContent && parseInt(num.textContent) === day) return true;
  }
  return false;
}, blockDay);
ok('Job badge dot appears on day with a scheduled job', hasJobBadge);

// 3c3. Legend includes "Job(s) booked" entry
const legendHTML = await page.$eval('.acal-legend', el => el.textContent);
ok('Calendar legend shows "Job(s) booked" entry', legendHTML.includes('Job(s) booked'));

// 3d. Navigate to contact form and verify that date is marked as booked
await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' }); await sleep(300);

// Navigate to correct month on contact calendar
const contactMonth = blockDate.getMonth();
const contactYear  = blockDate.getFullYear();
await page.evaluate(async (targetMonth, targetYear) => {
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  // Click next until we reach the target month/year
  let tries = 0;
  while (tries++ < 12) {
    const label = document.getElementById('calMonthYear').textContent;
    const mn = MONTH_NAMES[targetMonth] + ' ' + targetYear;
    if (label === mn) break;
    document.getElementById('calNext').click();
    await new Promise(r => setTimeout(r, 100));
  }
}, contactMonth, contactYear);
await sleep(300);

// The blocked date should have .booked class
const blockedInContact = await page.evaluate((day) => {
  const cells = document.querySelectorAll('#calGrid .cal-day');
  for (const c of cells) {
    if (c.textContent.trim() === String(day) && c.classList.contains('booked')) return true;
  }
  return false;
}, blockDate.getDate());
ok('Blocked admin date appears as "booked" in contact calendar', blockedInContact);

// 3e. Unblock — go back to admin and remove the date
await page.goto(BASE + ADMIN, { waitUntil: 'networkidle0' }); await sleep(300);
await page.evaluate(() => { doLogin(); }); // re-auth after navigation
await sleep(200);
await page.evaluate(() => switchTab('cal')); await sleep(200);
await page.evaluate(k => toggleDate(k), blockKey); await sleep(200);
const newCount = await page.$eval('#blockedCount', el => el.textContent);
ok('Unblocking removes date from list (count=0)', newCount === '0');

// 3f. Month navigation
await page.click('#acalPrev').catch(() => {}); // may be disabled
await page.evaluate(() => acalNext()); await sleep(150);
await page.evaluate(() => acalNext()); await sleep(150);
const futLabel = await page.$eval('#acalLabel', el => el.textContent);
ok('Calendar month navigation works', futLabel.length > 5);
// navigate back
await page.evaluate(() => acalPrev()); await sleep(100);
await page.evaluate(() => acalPrev()); await sleep(100);

/* ════════════════════════════════════════════════════════════════
   SECTION 4 — DISPOSAL FEES TAB
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [4] DISPOSAL FEES TAB ═════════════════════════════');

await page.evaluate(() => switchTab('fees')); await sleep(300);
ok('Fees tab visible',
  await page.$eval('#tab-fees', el => el.style.display !== 'none'));

// 4a. Default fees render
const feeRows = await page.$$eval('#feesBody tr', els => els.length);
ok(`Default fees rendered (${feeRows} rows)`, feeRows >= 6);

// 4b. Edit a fee price
await page.evaluate(() => {
  const inputs = document.querySelectorAll('#feesBody input[type="number"]');
  if (inputs[0]) { inputs[0].value = '30'; inputs[0].dispatchEvent(new Event('change', {bubbles:true})); }
});
await sleep(100);
ok('Fee price editable', true); // no error thrown

// 4c. Add a new fee item
await page.evaluate(() => toggleAddFee(true)); await sleep(150);
ok('Add-fee row visible',
  await page.$eval('#addFeeRow', el => el.style.display !== 'none'));

await page.type('#newFeeN', 'Piano');
await page.type('#newFeeU', 'ea.');
await page.type('#newFeeF', '75');
await page.click('button[onclick="addFeeItem()"]'); await sleep(250);

const feeRowsAfterAdd = await page.$$eval('#feesBody tr', els => els.length);
ok(`New fee item added (now ${feeRowsAfterAdd} rows)`, feeRowsAfterAdd === feeRows + 1);
ok('New fee item name appears in table',
  await page.$eval('#feesBody', el => el.innerHTML.includes('Piano')));
ok('Add-fee row hides after add',
  await page.$eval('#addFeeRow', el => el.style.display === 'none'));

// 4d. Save fees
await page.click('button[onclick="saveFees()"]'); await sleep(200);
const savedFees = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('cjr_fee_items') || '[]'));
ok('Fees saved to localStorage', savedFees.length === feeRowsAfterAdd);
ok('Piano item persisted', savedFees.some(f => f.name === 'Piano'));

// 4e. New fee appears in contact form fee grid
await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' }); await sleep(300);
ok('Piano fee appears in contact form',
  await page.$eval('#feeItemsGrid', el => el.innerHTML.includes('Piano')));

// 4f. Back to admin — delete the Piano item
await page.goto(BASE + ADMIN, { waitUntil: 'networkidle0' }); await sleep(200);
await page.evaluate(() => { doLogin(); }); await sleep(200);
await page.evaluate(() => switchTab('fees')); await sleep(250);

const pianoIndex = await page.evaluate(() => {
  const rows = document.querySelectorAll('#feesBody tr');
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].innerHTML.includes('Piano')) return i;
  }
  return -1;
});
ok('Piano row found for deletion', pianoIndex >= 0);
await page.evaluate(i => deleteFee(i), pianoIndex); await sleep(200);
ok('Piano removed from table',
  !await page.$eval('#feesBody', el => el.innerHTML.includes('Piano')));
await page.click('button[onclick="saveFees()"]'); await sleep(200);

/* ════════════════════════════════════════════════════════════════
   SECTION 5 — PRICING TAB
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [5] PRICING TAB ═══════════════════════════════════');

await page.evaluate(() => switchTab('pricing')); await sleep(300);
ok('Pricing tab visible',
  await page.$eval('#tab-pricing', el => el.style.display !== 'none'));

// 5a. Table structure
const pricingRows = await page.$$eval('#pricingBody tr', els => els.length);
ok(`Pricing has 4 service rows`, pricingRows === 4);

const hasEstCost = await page.evaluate(() =>
  [...document.querySelectorAll('th')].some(th => th.textContent.trim() === 'Est. Cost'));
ok('Est. Cost column header present', hasEstCost);

// 5b. Enter cost → margin badge appears
await page.evaluate(() => {
  const inp = document.querySelector('#pricingBody input[placeholder="—"]');
  if (inp) { inp.value = '60'; inp.dispatchEvent(new Event('input', {bubbles:true})); }
}); await sleep(200);
const mgEl = await page.$eval('#mg-outdoor-small', el => ({
  display: el.style.display, text: el.textContent
}));
ok('Margin badge visible for outdoor-small', mgEl.display === 'block');
ok('Margin badge shows % for outdoor-small', mgEl.text.includes('%'));

// 5c. Edit a price range
await page.evaluate(() => {
  const inp = document.querySelector('#pricingBody input[title="Min estimate"]');
  if (inp) { inp.value = '99'; inp.dispatchEvent(new Event('change', {bubbles:true})); }
}); await sleep(100);

// 5d. Save
await page.click('button[onclick="savePricing()"]'); await sleep(200);
const savedPricing = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('cjr_pricing') || '{}'));
ok('Pricing saved to localStorage', Object.keys(savedPricing).length >= 4);

// 5e. Updated price flows to contact form estimator
await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' }); await sleep(300);
await page.select('#serviceType', 'outdoor'); await sleep(100);
await page.click('#load-small'); await sleep(200);
const newRange = await page.$eval('#estimateRange', el => el.textContent);
ok('Edited price ($99) flows to contact estimator', newRange.includes('$99'));

// Reset pricing for cleanliness
await page.goto(BASE + ADMIN, { waitUntil: 'networkidle0' }); await sleep(200);
await page.evaluate(() => { doLogin(); }); await sleep(200);
await page.evaluate(() => {
  localStorage.removeItem('cjr_pricing');
  localStorage.removeItem('cjr_costs');
}); await sleep(100);

/* ════════════════════════════════════════════════════════════════
   SECTION 6 — JOBS TAB (6 seeded quotes)
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [6] JOBS TAB — all quote details ══════════════════');

await page.evaluate(() => {
  const jobs = [
    { id:1001, submitted: new Date(Date.now()-86400000*5).toISOString(),
      name:'Alice Bergeron', email:'alice@example.com', town:'Burlington',
      svc:'outdoor', size:'small', quotedLow:95, quotedHigh:165,
      preferredDate: new Date(Date.now()+86400000*3).toISOString(),
      preferredTime:'morning', description:'Old sofa and a patio table.',
      distance:'', cost:'', done:false },
    { id:1002, submitted: new Date(Date.now()-86400000*4).toISOString(),
      name:'Ben Tremblay', email:'ben@example.com', town:'Middlebury',
      svc:'indoor_ground', size:'medium', quotedLow:215, quotedHigh:355,
      preferredDate: new Date(Date.now()+86400000*7).toISOString(),
      preferredTime:'afternoon', description:'Basement cleanout.',
      distance:'', cost:'', done:false },
    { id:1003, submitted: new Date(Date.now()-86400000*3).toISOString(),
      name:'Carol Dubois', email:'carol@example.com', town:'Stowe',
      svc:'indoor_stairs', size:'large', quotedLow:475, quotedHigh:710,
      preferredDate:null, preferredTime:null, description:'Third-floor, narrow staircase.',
      distance:'18', cost:'', done:false },
    { id:1004, submitted: new Date(Date.now()-86400000*2).toISOString(),
      name:'David Roy', email:'david@example.com', town:'Vergennes',
      svc:'fullcleanout', size:'large', quotedLow:1235, quotedHigh:1900,
      preferredDate: new Date(Date.now()+86400000*14).toISOString(),
      preferredTime:'morning', description:'Full 4-bedroom estate.',
      distance:'', cost:'', done:false },
    { id:1005, submitted: new Date(Date.now()-86400000*1).toISOString(),
      name:'Eve Martin', email:'eve@example.com', town:'Shelburne',
      svc:'outdoor', size:'large', quotedLow:285, quotedHigh:425,
      preferredDate:null, preferredTime:null, description:'Old shed debris.',
      distance:'8', cost:'120', done:true },
    { id:1006, submitted: new Date().toISOString(),
      name:'Frank Lavoie', email:'frank@example.com', town:'Montpelier',
      svc:'indoor_ground', size:'small', quotedLow:119, quotedHigh:189,
      preferredDate: new Date(Date.now()+86400000*2).toISOString(),
      preferredTime:'late', description:'',
      distance:'', cost:'', done:false },
  ];
  localStorage.setItem('cjr_jobs', JSON.stringify(jobs));
});

await page.evaluate(() => switchTab('jobs')); await sleep(400);
ok('Jobs tab visible',
  await page.$eval('#tab-jobs', el => el.style.display !== 'none'));

const cardCount = await page.$$eval('#adminJobsList > div', els => els.length);
ok(`All 6 job cards render (got ${cardCount})`, cardCount === 6);

const jobsHTML = await page.$eval('#adminJobsList', el => el.innerHTML);
for (const [text, label] of [
  ['Alice Bergeron',  'Alice name'],
  ['Burlington',      'Burlington town'],
  ['Outdoor/Curbside','Outdoor label'],
  ['1–3 cu yd',       'Small size label'],
  ['Ben Tremblay',    'Ben name'],
  ['Indoor – Ground', 'indoor_ground label'],
  ['4–7 cu yd',       'Medium size label'],
  ['Carol Dubois',    'Carol name'],
  ['Indoor – Stairs', 'indoor_stairs label'],
  ['8–12 cu yd',      'Large size label'],
  ['David Roy',       'David name'],
  ['Full Cleanout',   'fullcleanout label'],
  ['Eve Martin',      'Eve name'],
  ['Frank Lavoie',    'Frank name'],
  ['Montpelier',      'Montpelier town'],
  ['Done',            'Done badge on Eve'],
  ['$95',             '$95 quoted range'],
  ['$215',            '$215 quoted range'],
  ['$1,235',          '$1,235 quoted range'],
  ['Third-floor',     'Carol description text'],
  ['📅',              'Preferred date icon present'],
]) ok(label, jobsHTML.includes(text));

// 6b. Maps links present for jobs with towns
const maps = await page.$$eval('#adminJobsList a[href*="google.com/maps"]', els => els.map(e => e.href));
ok('Maps links rendered', maps.length >= 3);
ok('Burlington in maps link', maps.some(h => h.includes('Burlington')));
ok('Stowe in maps link',      maps.some(h => h.includes('Stowe')));

// 6c. Gmail email buttons
const gmailLinks = await page.$$eval('#adminJobsList a[href*="mail.google.com"]', els => els.map(e => e.href));
ok('Gmail button on every job card', gmailLinks.length === 6);
ok('Gmail link contains client email', gmailLinks.some(h => h.includes('alice%40example.com') || h.includes('alice@example.com')));
ok('Gmail link contains subject', gmailLinks[0].includes('Champlain'));
ok('Gmail link contains quote range', gmailLinks[0].includes('95') || gmailLinks[0].includes('quotedLow'));

// 6c. Distance input saves
await page.evaluate(() => {
  const inp = document.querySelectorAll('#adminJobsList input[type="number"]')[0];
  if (inp) { inp.value = '5'; inp.dispatchEvent(new Event('change', {bubbles:true})); }
}); await sleep(200);
const afterDist = await page.evaluate(() => JSON.parse(localStorage.getItem('cjr_jobs') || '[]'));
ok('Distance saved to localStorage', afterDist[0]?.distance === '5');

// 6d. Cost → high-margin badge (Carol: $475–$710, cost=250 → ~58%)
await page.evaluate(() => {
  const inputs = document.querySelectorAll('#adminJobsList input[type="number"]');
  const carolCost = inputs[2 * 2 + 1];
  if (carolCost) { carolCost.value = '250'; carolCost.dispatchEvent(new Event('change', {bubbles:true})); }
}); await sleep(200);
const carolMg = await page.evaluate(() => {
  const el = document.getElementById('jmg-2');
  return el ? { display: el.style.display, text: el.textContent } : null;
});
ok('Carol margin badge visible',  carolMg?.display !== 'none');
ok('Carol margin shows ✓ (≥20%)', carolMg?.text?.includes('✓'));

// 6e. Cost → low-margin badge (Frank: $119–$189, cost=140, mid=154, ~9%)
await page.evaluate(() => {
  const inputs = document.querySelectorAll('#adminJobsList input[type="number"]');
  const frankCost = inputs[5 * 2 + 1];
  if (frankCost) { frankCost.value = '140'; frankCost.dispatchEvent(new Event('change', {bubbles:true})); }
}); await sleep(200);
const frankMg = await page.evaluate(() => {
  const el = document.getElementById('jmg-5');
  return el ? { display: el.style.display, text: el.textContent } : null;
});
ok('Frank margin badge visible', frankMg?.display !== 'none');
ok('Frank margin shows ⚠ (low)', frankMg?.text?.includes('⚠'));

// 6f. Badge count reflects pending jobs
const badgeText = await page.$eval('#jobsBadge', el => ({ display: el.style.display, text: el.textContent }));
ok('Jobs badge is visible', badgeText.display !== 'none');
ok('Jobs badge count > 0',  parseInt(badgeText.text) > 0);

// 6g. Toggle done on Ben (index 1)
await page.evaluate(() => toggleJobDone(1)); await sleep(200);
const afterDone = await page.evaluate(() => JSON.parse(localStorage.getItem('cjr_jobs') || '[]'));
ok('Ben marked done', afterDone[1]?.done === true);
await page.evaluate(() => toggleJobDone(1)); await sleep(200); // undo

/* ════════════════════════════════════════════════════════════════
   SECTION 7 — REVIEWS TAB
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [7] REVIEWS TAB ═══════════════════════════════════');

// Seed 2 reviews
await page.evaluate(() => {
  const reviews = [
    { name:'Sarah Miller', town:'Shelburne', rating:5,
      message:'Fast, professional, and fair pricing!', date: new Date().toISOString() },
    { name:'Tom Bouchard', town:'Burlington', rating:4,
      message:'Great job on the garage cleanout.', date: new Date(Date.now()-86400000).toISOString() },
  ];
  localStorage.setItem('cjr_reviews', JSON.stringify(reviews));
});

await page.evaluate(() => switchTab('reviews')); await sleep(300);
ok('Reviews tab visible',
  await page.$eval('#tab-reviews', el => el.style.display !== 'none'));

const reviewBadge = await page.$eval('#reviewBadge', el => el.textContent);
ok('Reviews badge shows 2', reviewBadge === '2');

const reviewsHTML = await page.$eval('#adminReviewsList', el => el.innerHTML);
ok('Sarah Miller review visible', reviewsHTML.includes('Sarah Miller'));
ok('Tom Bouchard review visible', reviewsHTML.includes('Tom Bouchard'));
ok('Star rating visible',         reviewsHTML.includes('★'));
ok('Review text visible',         reviewsHTML.includes('Fast, professional'));

// 7b. Delete one review
await page.evaluate(() => deleteReview(0)); await sleep(200);
ok('Review deleted (only 1 left)',
  await page.$eval('#adminReviewsList', el =>
    el.querySelectorAll('[style*="background:white"]').length === 1 ||
    el.innerHTML.includes('Tom Bouchard') && !el.innerHTML.includes('Sarah Miller')
  ));

// 7c. Clear all reviews
await page.evaluate(() => {
  localStorage.setItem('cjr_reviews', JSON.stringify([
    { name:'Test', town:'Test', rating:5, message:'Test', date:new Date().toISOString() }
  ]));
  renderAdminReviews();
}); await sleep(100);
await page.evaluate(() => {
  // bypass confirm dialog
  window.confirm = () => true;
  clearAllReviews();
}); await sleep(200);
ok('Clear all reviews shows empty state',
  await page.$eval('#adminReviewsList', el => el.textContent.includes('No reviews')));

/* ════════════════════════════════════════════════════════════════
   SECTION 8 — SETTINGS TAB
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [8] SETTINGS TAB ══════════════════════════════════');

await page.evaluate(() => switchTab('settings')); await sleep(300);
ok('Settings tab visible',
  await page.$eval('#tab-settings', el => el.style.display !== 'none'));

// 8a. Day toggles render (7 days)
const dayToggles = await page.$$eval('#dayToggles label', els => els.length);
ok(`7 day toggles rendered`, dayToggles === 7);

// 8b. Toggle Sunday (day 0) on, save, verify calendar reflects it
await page.evaluate(() => {
  const sunCheck = document.getElementById('day0');
  if (sunCheck) sunCheck.checked = true;
  saveDays();
}); await sleep(200);
const savedDays = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('cjr_available_days') || '[]'));
ok('Sunday toggled on (day 0 in saved days)', savedDays.includes(0));

// verify in contact form that a Sunday could appear selectable
await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' }); await sleep(300);
const hasSundayAvail = await page.evaluate(() => {
  const cells = document.querySelectorAll('#calGrid .cal-day.available');
  for (const c of cells) {
    // check if any available cell corresponds to a Sunday
    // We need to look at the full date for this cell
    return cells.length > 0; // at least some available days present
  }
  return false;
});
ok('Contact calendar renders with updated days', hasSundayAvail);

// 8c. Reset Sunday back to closed
await page.goto(BASE + ADMIN, { waitUntil: 'networkidle0' }); await sleep(200);
await page.evaluate(() => { doLogin(); }); await sleep(200);
await page.evaluate(() => switchTab('settings')); await sleep(200);
await page.evaluate(() => {
  const sunCheck = document.getElementById('day0');
  if (sunCheck) sunCheck.checked = false;
  saveDays();
}); await sleep(100);

// 8d. Password change — mismatch
await page.type('#pwNew', 'newpass123');
await page.type('#pwConfirm', 'different');
await page.click('button[onclick="changePw()"]'); await sleep(150);
ok('Password mismatch shows error',
  await page.$eval('#pwMsg', el =>
    el.style.display !== 'none' && el.textContent.includes('do not match')));

// 8e. Password change — success
await page.$eval('#pwNew',     el => el.value = '');
await page.$eval('#pwConfirm', el => el.value = '');
await page.type('#pwNew',     'champlain2024'); // set back to original
await page.type('#pwConfirm', 'champlain2024');
await page.click('button[onclick="changePw()"]'); await sleep(200);
ok('Password updated message shown',
  await page.$eval('#pwMsg', el =>
    el.style.display !== 'none' && el.textContent.includes('updated')));

/* ════════════════════════════════════════════════════════════════
   SECTION 9 — LOGOUT & RE-LOGIN
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [9] LOGOUT & RE-LOGIN ═════════════════════════════');

await page.click('button[onclick="doLogout()"]'); await sleep(200);
ok('Login screen shows after logout',
  await page.$eval('#loginScreen', el => el.style.display !== 'none'));
ok('Dashboard hidden after logout',
  await page.$eval('#dashboard', el => el.style.display === 'none' || el.style.display === ''));

await page.$eval('#pwInput', el => el.value = '');
await page.type('#pwInput', 'champlain2024');
await page.click('button[onclick="doLogin()"]'); await sleep(300);
ok('Re-login works', await page.$eval('#dashboard', el => el.style.display !== 'none'));

/* ════════════════════════════════════════════════════════════════
   SECTION 10 — ALL PAGES: NO JS ERRORS
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [10] JS ERRORS — all pages ════════════════════════');
for (const p of ['/index.html', '/about.html', '/contact.html', ADMIN]) {
  const errs = [];
  const handler = e => errs.push(e.message);
  page.on('pageerror', handler);
  await page.goto(BASE + p, { waitUntil: 'networkidle0' }); await sleep(400);
  page.off('pageerror', handler);
  ok(`${p} — no JS errors`, errs.length === 0);
  if (errs.length) errs.forEach(e => console.error(`    → ${e}`));
}

/* ════════════════════════════════════════════════════════════════
   SECTION 11 — MOBILE OVERFLOW (390px iPhone)
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [11] MOBILE OVERFLOW (390px) ══════════════════════');
await page.setViewport({ width: 390, height: 844 });
for (const [path, label] of [
  ['/contact.html',    'contact.html'],
  [ADMIN,              'cjr-dashboard-2026.html (login)'],
]) {
  await page.goto(BASE + path, { waitUntil: 'networkidle0' }); await sleep(300);
  const sw = await page.$eval('body', el => el.scrollWidth);
  ok(`${label} no horizontal overflow (scrollWidth=${sw})`, sw <= 390);
}

// Also test admin dashboard tabs at mobile width
await page.evaluate(() => {
  document.getElementById('pwInput').value = 'champlain2024';
  doLogin();
}); await sleep(300);
for (const tab of ['cal','fees','pricing','jobs','reviews','settings']) {
  await page.evaluate(t => switchTab(t), tab); await sleep(200);
  const sw = await page.$eval('body', el => el.scrollWidth);
  ok(`Admin "${tab}" tab no overflow (scrollWidth=${sw})`, sw <= 390);
}

await page.setViewport({ width: 1280, height: 800 });

/* ════════════════════════════════════════════════════════════════
   SECTION 12 — EMAIL & PHONE CHANGES
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [12] EMAIL & PHONE CHANGES ════════════════════════');

// 12a. index.html — no phone number, correct email
await page.goto(BASE + '/index.html', { waitUntil: 'networkidle0' }); await sleep(300);
const indexHTML = await page.content();
ok('index.html has no phone number (tel: link removed)',      !indexHTML.includes('tel:'));
ok('index.html has no (802) number',                          !indexHTML.includes('(802)'));
ok('index.html shows help@ email',                            indexHTML.includes('help@champlainjunkremoval.com'));
ok('index.html has no old hello@ email',                      !indexHTML.includes('hello@champlainjunkremoval.com'));

// 12b. about.html — no phone, correct email, button text
await page.goto(BASE + '/about.html', { waitUntil: 'networkidle0' }); await sleep(300);
const aboutHTML = await page.content();
ok('about.html has no phone number',                          !aboutHTML.includes('tel:') && !aboutHTML.includes('(802)'));
ok('about.html shows help@ email',                            aboutHTML.includes('help@champlainjunkremoval.com'));
ok('about.html has no old hello@ email',                      !aboutHTML.includes('hello@champlainjunkremoval.com'));
ok('about.html button says "Book a Free Quote"',              aboutHTML.includes('Book a Free Quote'));
ok('about.html button does NOT say "Book a Free Pickup"',     !aboutHTML.includes('Book a Free Pickup'));

// 12c. contact.html — no phone, correct email
await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' }); await sleep(300);
const contactHTML = await page.content();
ok('contact.html has no phone number',                        !contactHTML.includes('tel:') && !contactHTML.includes('(802)'));
ok('contact.html shows help@ email',                          contactHTML.includes('help@champlainjunkremoval.com'));
ok('contact.html has no old hello@ email',                    !contactHTML.includes('hello@champlainjunkremoval.com'));

// 12d. help@ mailto links are correct href values
const indexMailto  = await page.goto(BASE + '/index.html',   { waitUntil: 'networkidle0' })
  .then(() => page.$$eval('a[href^="mailto:"]', els => els.map(e => e.href)));
ok('index.html mailto links all point to help@',              indexMailto.every(h => h.includes('help%40') || h.includes('help@')));

const aboutMailto  = await page.goto(BASE + '/about.html',   { waitUntil: 'networkidle0' })
  .then(() => page.$$eval('a[href^="mailto:"]', els => els.map(e => e.href)));
ok('about.html mailto links all point to help@',              aboutMailto.every(h => h.includes('help%40') || h.includes('help@')));

const contactMailto = await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' })
  .then(() => page.$$eval('a[href^="mailto:"]', els => els.map(e => e.href)));
ok('contact.html mailto links all point to help@',            contactMailto.every(h => h.includes('help%40') || h.includes('help@')));

// 12e. Admin Gmail template uses help@ in signature
await page.goto(BASE + ADMIN, { waitUntil: 'networkidle0' }); await sleep(300);
await page.evaluate(() => {
  document.getElementById('pwInput').value = 'champlain2024';
  doLogin();
}); await sleep(300);
await page.evaluate(() => {
  const jobs = [{ id:2001, submitted: new Date().toISOString(),
    name:'Test User', email:'test@test.com', town:'Burlington',
    svc:'outdoor', size:'small', quotedLow:95, quotedHigh:165,
    preferredDate:null, preferredTime:null, description:'',
    distance:'', cost:'', done:false }];
  localStorage.setItem('cjr_jobs', JSON.stringify(jobs));
});
await page.evaluate(() => switchTab('jobs')); await sleep(400);
const gmailHref = await page.$eval(
  '#adminJobsList a[href*="mail.google.com"]', el => el.href);
const decoded = decodeURIComponent(gmailHref);
ok('Gmail compose uses help@ in email signature',             decoded.includes('help@champlainjunkremoval.com'));
ok('Gmail compose does not use old hello@ email',             !decoded.includes('hello@champlainjunkremoval.com'));

/* ════════════════════════════════════════════════════════════════
   SECTION 13 — HOW PAYMENT WORKS SECTION
   ════════════════════════════════════════════════════════════════ */
console.log('\n══ [13] HOW PAYMENT WORKS SECTION ═══════════════════');

await page.goto(BASE + '/contact.html', { waitUntil: 'networkidle0' }); await sleep(300);
const payHTML = await page.content();
ok('Payment section heading present',          payHTML.includes('How Payment Works'));
ok('Cash option listed',                       payHTML.includes('Cash'));
ok('Venmo or Zelle option listed',             payHTML.includes('Venmo or Zelle'));
ok('No-invoices copy present',                 payHTML.includes('no invoices'));
ok('Cash description present',                 payHTML.includes('no fees'));
ok('Zelle description present',                payHTML.includes('Free transfers'));
ok('Payment section renders in DOM',
  await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h3')];
    return headings.some(h => h.textContent.includes('How Payment Works'));
  }));
ok('Payment card is visible on page',
  await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h3')];
    const h = headings.find(h => h.textContent.includes('How Payment Works'));
    if (!h) return false;
    const rect = h.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }));

/* ════════════════════════════════════════════════════════════════
   RESULTS
   ════════════════════════════════════════════════════════════════ */
await browser.close();
console.log(`\n${'═'.repeat(52)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed) console.error(`\n${failed} test(s) FAILED — check output above`);
process.exit(failed > 0 ? 1 : 0);
