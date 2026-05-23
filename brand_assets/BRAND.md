# Champlain Junk Removal — Brand Guidelines
> Drop this file in `brand_assets/`. Claude Code reads it automatically every session.

---

## Business Overview

- **Brand name:** Champlain Junk Removal
- **Location:** Statewide Vermont
- **Est.:** 2024
- **Pages to build:** Homepage, Services, Contact (3 pages)

### Services offered
1. Residential junk removal
2. Appliance removal
3. Furniture removal
4. Yard waste & brush removal
5. Estate cleanouts

### Priority messaging (in order — lead with these)
1. Upfront, transparent pricing — no surprise fees
2. Licensed & insured
3. Eco-responsible disposal (donate, recycle, then dispose)
4. Local Vermont roots — we know this state
5. Fast availability — flexible scheduling statewide

---

## Tone & Voice

**Overall feel:** Friendly and approachable — neighborly Vermont. Like your most reliable neighbor who happens to own a truck. Warm but never cutesy. Honest but never blunt.

### Writing rules
- Second person, active voice: "We haul it. You relax."
- Short sentences. One idea per sentence.
- Reference Vermont geography naturally: Green Mountains, Lake Champlain, Champlain Valley
- Always lead with price transparency — customers hate surprise fees, so mention upfront pricing early and often
- Trust signals to weave in: licensed, insured, eco-responsible, locally owned
- Avoid: corporate jargon, filler adjectives ("amazing", "incredible", "passionate"), generic CTAs

### Preferred CTAs (use these exactly)
- "Get Your Free Quote"
- "Book a Free Pickup"
- "See Upfront Pricing"
- "Schedule a Pickup"
- "Request a Quote"

### Sample headline patterns
- "Honest Pricing. Reliable Hauling. Vermont Proud."
- "No Hidden Fees. No Hassle. Just Gone."
- "We Haul It. You Relax."
- "Vermont's Friendly Junk Removal Team"
- "Serving All of Vermont — One Haul at a Time"

### Sample body copy patterns
- "We show up on time, give you an upfront price before we touch a thing, and haul it all away — furniture, appliances, yard waste, and more."
- "Locally owned and operated right here in Vermont. Licensed, insured, and committed to keeping as much out of the landfill as possible."
- "From Burlington to Brattleboro, we serve every corner of the Green Mountain State."

---

## Contact & Booking

- **Primary contact:** Email — use `hello@champlainjunkremoval.com` as placeholder until owner provides real address
- **Booking methods:** Online booking form, Quote request form
- **No phone number on site** (email + forms only)

### Quote request form fields
1. Name (required)
2. Email (required)
3. Town / City in Vermont (required)
4. Service type: dropdown — Residential Junk Removal, Appliance Removal, Furniture Removal, Yard Waste & Brush, Estate Cleanout
5. Brief description of items (textarea)
6. Preferred date (date picker)
7. Submit button: "Request My Free Quote"

### Booking form fields
1. Name (required)
2. Email (required)
3. Town / City (required)
4. Service type (same dropdown as above)
5. Items to remove (textarea)
6. Preferred date (date picker)
7. Submit button: "Book My Pickup"

### Form styling rules
- Input border at rest: `1.5px solid var(--color-lake-light)`
- Input border on focus: `1.5px solid var(--color-sage)` + focus shadow `var(--shadow-input)`
- Labels: DM Sans, 0.8rem, `--color-stone`, uppercase, letter-spacing: 0.12em
- Submit button: primary style (`--color-pine-dark` bg, `--color-snow` text)
- Error border: `#C0392B`
- Success message color: `--color-sage`

---

## Colors

Use these exact values. Never use default Tailwind palette as primary colors.

```css
:root {
  --color-pine-dark:   #1E3326; /* Primary brand — hero bg, nav, footer */
  --color-pine:        #2D4A35; /* Headings, CTA buttons */
  --color-pine-mid:    #3D6347; /* Hover states, secondary buttons */
  --color-sage:        #6B8F5E; /* Accents, labels, decorative rules, icons */
  --color-sage-light:  #8FAF7E; /* Eyebrow text on dark bg, tags */
  --color-lake:        #7A9FAF; /* Links, info accents, water motif */
  --color-lake-light:  #A8C4CF; /* Borders, dividers, form inputs */
  --color-mist:        #B8CDB5; /* Body text on dark backgrounds */
  --color-snow:        #E8EDE6; /* Light text on dark, subtle borders */
  --color-cream:       #F4F2EC; /* Card fills, alternate section bg */
  --color-warm-white:  #FAFAF7; /* Page background */
  --color-charcoal:    #1A1F1B; /* Body text on light — never use #000 */
  --color-stone:       #5C6B5F; /* Secondary / muted text on light */
}
```

### Color usage map
| Element | Color |
|---|---|
| Nav background | `--color-pine-dark` |
| Hero background | `--color-pine-dark` or nature photo with Pine Dark overlay |
| Page background | `--color-warm-white` |
| Alternate section bg | `--color-cream` |
| Footer background | `--color-pine-dark` |
| Primary CTA button | `--color-pine-dark` bg + `--color-snow` text |
| CTA hover | `--color-pine-mid` |
| Secondary button | transparent + `--color-pine-dark` border/text |
| Accent / icon color | `--color-sage` |
| Links | `--color-lake` |
| Body text | `--color-charcoal` |
| Muted / secondary text | `--color-stone` |
| Text on dark bg | `--color-snow` or `--color-mist` |
| Eyebrow labels on light | `--color-sage` |
| Eyebrow labels on dark | `--color-sage-light` |
| Dividers / borders | `--color-lake-light` |

### Never
- Use pure `#000000` or `#ffffff` as brand text or background
- Use Tailwind indigo, blue-600, or purple as primary colors
- Combine lake blue and pine green as co-equal primaries in the same section
- Use more than 3 brand colors in a single UI section

---

## Typography

### Font imports — add to every `<head>`
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

```css
:root {
  --font-display: 'Playfair Display', serif;
  --font-body:    'DM Sans', sans-serif;
}
```

### Type scale
| Role | Font | Size | Weight | Extra |
|---|---|---|---|---|
| Hero H1 | Playfair Display | 3.5–5rem | 700 | letter-spacing: -0.01em |
| Section H2 | Playfair Display | 2–2.5rem | 600 | |
| Card H3 | Playfair Display | 1.35rem | 500 | |
| Body | DM Sans | 1rem | 400 | line-height: 1.7 |
| Nav links | DM Sans | 0.9rem | 500 | |
| Button | DM Sans | 0.875rem | 500 | letter-spacing: 0.04em |
| Eyebrow label | DM Sans | 0.7rem | 600 | uppercase, letter-spacing: 0.25em |
| Form label | DM Sans | 0.8rem | 500 | uppercase, letter-spacing: 0.12em |
| Footer | DM Sans | 0.85rem | 400 | |

### Eyebrow label pattern (use above every H2 section heading)
```html
<span style="font-family: var(--font-body); font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.25em; text-transform: uppercase; color: var(--color-sage);">
  Our Services
</span>
```

---

## Logo

The primary logo SVG is at `brand_assets/logo-primary.svg`. Always load it from this path — never recreate or retype the logo in HTML/CSS.

### Logo placement per page
- **Nav:** left-aligned, snow/light version on Pine Dark nav, min-width 140px
- **Hero:** centered or left, snow version, min-width 280px
- **Footer:** centered, snow version on Pine Dark bg, min-width 160px

### Logo rules
- Approved backgrounds: Pine Dark (`#1E3326`), Cream (`#F4F2EC`), Warm White (`#FAFAF7`)
- Minimum width: 120px in nav · 280px in hero
- Clear space: equal to the pine tree height on all four sides
- Never: drop shadow, glow, outline, rotation, recolor, or stretch
- Never: separate the mountain mark from the wordmark
- Never: place directly on photography without a solid color backing panel

---

## Imagery

**Style:** Outdoor Vermont nature photography — Green Mountains, Lake Champlain, forests, open skies. Warm, inviting light. Lean toward golden hour and summer-to-fall palette. No stock photos with prominent faces as the hero image.

**Orientation:** Wide landscape (16:9 or wider) for hero and banners. 4:3 for service cards.

### Image treatment — always apply to every photo
```css
/* Hero overlay */
background: linear-gradient(to bottom, rgba(30,51,38,0.55), rgba(30,51,38,0.75));

/* Color treatment layer for brand cohesion */
mix-blend-mode: multiply;
background-color: rgba(45,74,53,0.25);
```

### Placehold.co values for development
- Hero / landscape: `https://placehold.co/1600x900/1E3326/E8EDE6`
- Service card: `https://placehold.co/600x400/3D6347/E8EDE6`
- Square / portrait: `https://placehold.co/400x400/6B8F5E/FAFAF7`

---

## Page Structure

### Homepage — sections in order
1. **Nav** — logo left, links right (Services, Contact), "Get a Free Quote" primary CTA button
2. **Hero** — nature photo bg with overlay, H1 headline, subhead, two CTAs ("Get Your Free Quote" primary + "See Our Services" outline)
3. **Trust bar** — 4 icons in a horizontal row: Upfront Pricing · Licensed & Insured · Eco-Responsible · Statewide Vermont
4. **Services overview** — grid of 5 service cards (icon + name + 1-line description + "Learn More" link)
5. **How it works** — 3 steps: Request a Quote → We Give You a Price → We Haul It Away
6. **Pricing transparency callout** — full-width Pine Dark bg, emphasizes no hidden fees, upfront quote before any work begins
7. **Eco commitment** — brief section: donate first, recycle second, dispose as last resort
8. **CTA banner** — "Ready to clear the clutter?" with "Get Your Free Quote" button
9. **Footer** — logo, nav links, email, "Locally owned in Vermont · Est. 2024", copyright

### Services page — sections in order
1. Nav
2. Page hero — smaller (40vh), nature photo, H1 "Our Services", short subhead
3. Services grid — 5 cards, each: icon, service name, 2–3 sentence description, "Get a Quote" button
4. Pricing transparency note — short callout block
5. CTA banner
6. Footer

### Contact page — sections in order
1. Nav
2. Page hero — minimal, Pine Dark bg, H1 "Let's Get Started", 1-line subhead
3. Two-column layout: Quote request form (left col) + what to expect / email info (right col)
4. Footer

---

## Buttons

```css
/* Primary CTA */
.btn-primary {
  background: var(--color-pine-dark);
  color: var(--color-snow);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 13px 30px;
  border-radius: 6px;
  border: none;
  transition: background 0.2s ease, transform 0.15s ease;
}
.btn-primary:hover       { background: var(--color-pine-mid); }
.btn-primary:active      { transform: scale(0.98); }
.btn-primary:focus-visible { box-shadow: 0 0 0 3px rgba(107,143,94,0.5); outline: none; }

/* Secondary / outline on light bg */
.btn-secondary {
  background: transparent;
  color: var(--color-pine-dark);
  border: 1.5px solid var(--color-pine-dark);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 12px 28px;
  border-radius: 6px;
}
.btn-secondary:hover { background: var(--color-snow); }

/* White outline — for use on dark/hero backgrounds */
.btn-outline-light {
  background: transparent;
  color: var(--color-snow);
  border: 1.5px solid var(--color-snow);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 12px 28px;
  border-radius: 6px;
}
.btn-outline-light:hover { background: rgba(232,237,230,0.1); }
```

---

## Icons

Use Tabler Icons — outline style only. Never use `-filled` suffix variants.

```html
<!-- Add to <head> -->
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
```

### Approved icon set
| Class | Use |
|---|---|
| `ti-truck` | Junk removal / hauling |
| `ti-recycle` | Eco-responsible disposal |
| `ti-home` | Residential services |
| `ti-armchair` | Furniture removal |
| `ti-washing-machine` | Appliance removal |
| `ti-plant` | Yard waste & brush |
| `ti-key` | Estate cleanouts |
| `ti-currency-dollar` | Upfront pricing |
| `ti-shield-check` | Licensed & insured |
| `ti-map-pin` | Statewide Vermont |
| `ti-calendar` | Scheduling / booking |
| `ti-leaf` | Eco / green |
| `ti-star` | Reviews |
| `ti-mail` | Email contact |
| `ti-circle-check` | How it works steps |
| `ti-clock` | Fast availability |

```css
.icon-brand     { font-size: 28px; color: var(--color-sage); line-height: 1; }
.icon-brand-sm  { font-size: 18px; color: var(--color-sage); }
.icon-trust     { font-size: 36px; color: var(--color-sage); }
```

---

## Spacing tokens

```css
:root {
  --space-xs:  0.5rem;   /*  8px */
  --space-sm:  0.75rem;  /* 12px */
  --space-md:  1rem;     /* 16px */
  --space-lg:  1.5rem;   /* 24px */
  --space-xl:  2rem;     /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 5rem;     /* 80px */
  --space-4xl: 8rem;     /* 128px */
}

.section      { padding: var(--space-3xl) 0; }
.section-hero { padding: var(--space-4xl) 0; }
.card         { padding: var(--space-lg) var(--space-xl); }
.container    { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-xl); }
```

---

## Shadows

```css
:root {
  --shadow-card:  0 1px 3px rgba(30,51,38,0.06), 0 4px 16px rgba(30,51,38,0.08);
  --shadow-float: 0 8px 32px rgba(30,51,38,0.12), 0 2px 8px rgba(30,51,38,0.06);
  --shadow-btn:   0 2px 8px rgba(30,51,38,0.25);
  --shadow-input: 0 0 0 3px rgba(107,143,94,0.35);
}
```

Never use flat Tailwind `shadow-md`. Always use the brand-tinted values above.

---

## Anti-generic checklist

Before marking any page done, verify every item:

- [ ] Logo loaded from `brand_assets/logo-primary.svg` — not recreated inline
- [ ] Playfair Display on all H1 / H2 — not DM Sans
- [ ] Eyebrow labels: uppercase + `--color-sage` + letter-spacing 0.25em
- [ ] Zero Tailwind indigo, blue-600, or purple anywhere on the page
- [ ] Hero uses nature photo with Pine Dark overlay — not a solid color alone
- [ ] Primary CTA reads "Get Your Free Quote" or "Book a Free Pickup"
- [ ] Pricing transparency mentioned in hero or within first two sections
- [ ] "Licensed & insured" visible as a trust signal on the homepage
- [ ] All icons are Tabler outline — zero filled variants
- [ ] All shadows use `--shadow-card` / `--shadow-float` / `--shadow-btn` — not shadow-md
- [ ] Forms include all specified fields in the correct order
- [ ] Contact email shows `hello@champlainjunkremoval.com` (or owner-provided)
- [ ] At least one Vermont geographic reference in hero copy
- [ ] Every button has hover, focus-visible, and active states defined
