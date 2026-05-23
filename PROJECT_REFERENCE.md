# Champlain Junk Removal — Project Reference

## Live URLs
- **Website:** https://champlainjunkremoval.com
- **Admin dashboard:** https://champlainjunkremoval.com/cjr-dashboard-2026.html
- **Admin password:** `champlain2024`
- **Vercel project:** gussiewilly-6307s-projects / champlain-junk-removal

## Contact
- **Business email:** help@champlainjunkremoval.com *(not yet created — set up this mailbox to activate all mailto: links)*

---

## File Structure

```
/
├── index.html              — Homepage
├── about.html              — About Us page
├── contact.html            — Quote request form (public-facing)
├── cjr-dashboard-2026.html — Admin dashboard (password protected)
├── serve.mjs               — Local dev server (port 3000)
├── test_cjr.mjs            — Full automated test suite (151 checks)
├── screenshot.mjs          — Puppeteer screenshot helper
├── vercel.json             — Vercel config: outputDirectory ".", cleanUrls false
├── CLAUDE.md               — Claude Code project rules
├── brand_assets/
│   ├── BRAND.md            — Color palette, typography, tone guide
│   └── Untitled design (1).png — Logo
└── temporary screenshots/  — Auto-saved Puppeteer screenshots
```

---

## Running Locally

```bash
# Start dev server
node serve.mjs
# → http://localhost:3000

# Run full test suite (server must be running)
node test_cjr.mjs

# Take a screenshot
node screenshot.mjs http://localhost:3000
node screenshot.mjs http://localhost:3000/contact.html label
# Saves to: ./temporary screenshots/screenshot-N[-label].png
```

## Deploying

```bash
npx vercel --prod
# Automatically aliases to https://champlainjunkremoval.com
```

---

## Admin Dashboard — Features

### Login
- Password stored in `localStorage` as `cjr_pw` (default: `champlain2024`)
- Auth state: `sessionStorage` key `cjr_auth`
- Change password via Settings tab

### Tabs

| Tab | What it does |
|---|---|
| **Calendar** | Block/unblock pickup dates; days blocked here show as unavailable in the contact form calendar; job badges show on days with scheduled pickups |
| **Fees** | Edit disposal fee items (name, unit, price); add/delete items; changes sync to contact form fee grid |
| **Pricing** | Set min/max price per service+size combo; enter your cost to see profit margin badges (✓ ≥20%, ⚠ <20%); changes sync to contact form estimator |
| **Jobs** | View all quote requests; enter distance/cost; Gmail button pre-fills a compose to each client; mark jobs done |
| **Reviews** | View, delete, or clear all customer reviews |
| **Settings** | Toggle available pickup days (Mon–Sat default); change admin password |

---

## Contact Form — Features

- **Estimator:** Shows price range as soon as service type + load size are selected; updates live when admin changes pricing
- **Special disposal fees:** Grid of add-on items (mattress, TV, fridge, etc.) with +/− qty; selected items added to estimate
- **Calendar:** Only shows days enabled in admin settings; booked/blocked dates shown with strikethrough
- **Time slots:** Morning / Afternoon / Late Afternoon — appears after selecting a date
- **Form submit:** Saves to `localStorage` key `cjr_jobs`; shows confirmation with customer's email

---

## Data Storage (localStorage keys)

| Key | Contents |
|---|---|
| `cjr_jobs` | Array of quote/job objects |
| `cjr_booked_dates` | Object map of blocked dates — format: `"YYYY-M-D": true` |
| `cjr_fee_items` | Array of disposal fee objects `{ name, unit, fee }` |
| `cjr_pricing` | Object map of prices per service+size `{ "outdoor-small": { min, max } }` |
| `cjr_costs` | Object map of estimated costs per service+size |
| `cjr_available_days` | Array of day numbers (0=Sun … 6=Sat) |
| `cjr_reviews` | Array of review objects `{ name, town, rating, message, date }` |
| `cjr_pw` | Admin password string |
| `cjr_auth` | Auth flag (sessionStorage) |

### Job object shape
```json
{
  "id": 1001,
  "submitted": "ISO date string",
  "name": "Alice Bergeron",
  "email": "alice@example.com",
  "town": "Burlington",
  "svc": "outdoor",
  "size": "small",
  "quotedLow": 95,
  "quotedHigh": 165,
  "preferredDate": "ISO date string or null",
  "preferredTime": "morning | afternoon | late | null",
  "description": "free text",
  "distance": "miles string",
  "cost": "dollar amount string",
  "done": false
}
```

### Service type values
| Value | Label |
|---|---|
| `outdoor` | Outdoor / Curbside |
| `indoor_ground` | Indoor – Ground Floor |
| `indoor_stairs` | Indoor – Stairs |
| `fullcleanout` | Full Cleanout |

### Load size values
`small` (1–3 cu yd) · `medium` (4–7 cu yd) · `large` (8–12 cu yd)

---

## Test Suite

`test_cjr.mjs` — 151 automated checks across 13 sections:

1. Contact form (estimator, fees, calendar, time slots, submit + save)
2. Admin login (wrong password, correct, auth persistence)
3. Calendar sync (block → shows booked in contact form, job badges, unblock, month nav)
4. Disposal fees (default render, edit, add, save, flows to contact form, delete)
5. Pricing (structure, margin badges, save, flows to contact estimator)
6. Jobs tab (6 seeded quotes, all details, Gmail buttons, distance/cost, margin, toggle done)
7. Reviews (render, delete, clear all)
8. Settings (day toggles, password mismatch, password update)
9. Logout & re-login
10. JS errors on all 4 pages
11. Mobile overflow at 390px (login + all 6 admin tabs + contact page)
12. Email & phone changes (no phone anywhere, help@ everywhere, about button text)
13. How Payment Works section (heading, Cash, Venmo/Zelle, copy, visible in DOM)

---

## Brand

- **Display font:** Playfair Display (headings)
- **Body font:** Inter
- **Primary green:** `#2D5016` (pine dark) / `#4A7C59` (sage)
- **Accent blue:** `#2E86AB` (lake)
- **Background:** `#F8F6F0` (snow) / `#1A2E1A` (pine dark, footer)
- **Logo:** `brand_assets/Untitled design (1).png`

---

## Payment Methods (displayed on contact page)
- **Cash** — simplest, no fees
- **Venmo or Zelle** — free, most customers have it
- Payment is due when the job is complete

## Service Area
Addison County & surrounding Vermont communities (Middlebury, Burlington, Shelburne, Ferrisburgh, Vergennes, Stowe — up to ~30 miles)
