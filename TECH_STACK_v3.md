# mostlyCBD.com — Tech Stack Reference v3
## Instructional Guidelines for Project Work

> **Updated:** March 2026 — CSS consolidated into `global.css`.
> `style.css` and `style-blog.css` are **retired**. All article
> inline `<style>` blocks are **removed**. See §CSS Architecture.

---

## OVERVIEW

**Site:** mostlyCBD.com  
**Repository:** GitHub Pages (static HTML/CSS, no build step)  
**Deployment:** Push to main → live at `mostlycbd.com`  
**Analytics:** GoatCounter (`https://mostlycbd.goatcounter.com/count`)  
**No ads. No trackers. No third-party cookies.**

---

## FILE STRUCTURE

```
/
├── index.html              # Homepage
├── blog.html               # Deep Dives index / card grid
├── guide.html              # Educational guide
├── action.html             # Advocacy hub
├── research.html           # Research hub
├── rfer.html               # Reschedule. Fund Trials. Educate. Regulate.
│
├── global.css              # ← THE ONLY STYLESHEET. Loads everywhere.
├── Favicon.png             # Site favicon
├── logo_1.png              # Nav logo
│
├── blog-[slug].html        # Deep Dive articles (all in root, no /blog/ subfolder)
│   ├── blog-fomo.html
│   ├── blog-mentalhealth.html
│   ├── blog-rfer-deep-dive.html
│   ├── blog-training-gap.html
│   ├── blog-akathisia.html
│   ├── blog-als.html
│   ├── blog-regulation-gap.html
│   ├── blog-hearst-anslinger.html
│   └── blog-ecs-system.html
│
├── images/                 # All image assets
│   ├── advocacy/
│   │   └── [slug].jpg / .png
│   └── bg_[slug].jpg       # Hero images (1200×630px min)
│
└── infographics/           # All infographic assets
    └── [slug].jpg / .png
```

**RETIRED FILES (do not use, do not link):**
- `style.css` — superseded by `global.css`
- `style-blog.css` — superseded by `global.css`

---

## CSS ARCHITECTURE

### One stylesheet. One rule.

Every page on the site loads exactly one stylesheet:

```html
<link rel="stylesheet" href="global.css">
```

No `<style>` blocks in article files. No per-page CSS variables.
No inline style attributes except for genuine one-off per-instance
values (e.g., `background-image` on a specific card).

### What global.css contains

`global.css` is organized in 25 numbered sections (see its table
of contents). Key sections:

| Section | Contents |
|---------|----------|
| 1 | Design tokens (`:root` custom properties) |
| 2 | Reset |
| 3 | Base typography |
| 4 | Site nav |
| 5 | Site footer |
| 6 | Layout utilities (`.container`, `.rule`) |
| 7 | Article layout (`.page`, `.hero`, `.eyebrow`, `.subtitle`) |
| 8 | Section structure |
| 9 | Prose & inline emphasis |
| 10–21 | Article components (pull quotes, stats, callouts, etc.) |
| 22–24 | Hub page components (cards, blog.html, rfer.html) |
| 25 | Responsive breakpoints |

### Per-instance inline styles (the only exception)

The CSS architecture rule from before still applies, narrowed:

> **Per-instance values** — card `background-image`, article-specific
> `margin-top` overrides, hero border-top color variations — go **inline**
> or in a small `<style>` block. This is only for values that differ
> *between instances of the same component*, not for component definitions.

If you find yourself writing a rule that would apply to every article,
it belongs in `global.css`, not inline.

---

## DESIGN SYSTEM — CURRENT (use this)

### Typography Stack

| Role | Font | Variable | Usage |
|------|------|----------|-------|
| Headings | **Bebas Neue** | `var(--font-display)` | h1, h2, stat numerals, section numbers |
| Eyebrows / Labels | **DM Mono** | `var(--font-mono)` | category tags, read time, datelines, UI labels |
| Pull Quotes / Subtitles | **DM Serif Display** | `var(--font-serif)` | `.subtitle`, `.pull-quote`, `.section-sub` |
| Body Copy | **Inter** | `var(--font-body)` | Paragraphs, lists, footnotes |

**Google Fonts import (every page):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Color Palette

| Token | Hex | Role |
|-------|-----|------|
| `--cream` | `#F5F0E8` | Page background |
| `--cream-alt` | `#EAE6DC` | Card backgrounds, alt sections |
| `--cream-rule` | `#C8C3B8` | Rules, table borders |
| `--ink` | `#1A1208` | Primary body text |
| `--ink-muted` | `#7A6E5F` | Secondary text, meta |
| `--ink-faint` | `#5A5750` | Footnotes, sub-labels |
| `--green` | `#2D5016` | Article accent, hero border, pull quotes |
| `--green-ui` | `#3B6E52` | Nav logo, footer hover, hub page CTA |
| `--sage` | `#6B8F4E` | Stat numbers, timeline dots, list markers |
| `--rust` | `#b84a2e` | Eyebrows, `.accent` spans, alert tone |
| `--gold` | `#D4B44A` | RFER F-pillar, key data callouts |
| `--brown` | `#8B7355` | RFER E-pillar, tertiary accent |
| `--cbd-blue` | `#3B6E8F` | CBD-specific stat variant |

> **Note on green:** Two green tokens exist intentionally.
> `--green` (#2D5016) is the deep forest green used in article content.
> `--green-ui` (#3B6E52) is the lighter green used in the nav, footer,
> and hub page interactive elements. Do not swap them.

---

## ARTICLE PAGE ANATOMY

Articles follow this structure:

```
<head>
  ├── Standard meta (charset, viewport)
  ├── SEO meta (title, description)
  ├── Open Graph tags
  ├── Twitter Card tags
  ├── GoatCounter analytics script
  ├── Google Fonts (current stack)
  ├── <link rel="icon" href="Favicon.png">
  └── <link rel="stylesheet" href="global.css">   ← NO <style> block

<body>
  ├── <nav class="site-nav"> (hamburger menu, logo, links)
  ├── <div class="page">
  │   ├── <div class="hero">
  │   │   ├── <div class="eyebrow">
  │   │   ├── <h1> ... <span class="accent">
  │   │   ├── <div class="subtitle">
  │   │   └── <div class="hero-meta">
  │   │
  │   └── Article body sections...
  │       ├── .section (with .section-num, h2, p)
  │       ├── .pull-quote
  │       ├── .stat-row / .stat-block / .stat-num
  │       ├── .alert-box / .callout-box
  │       ├── .compare-grid / .compare-box
  │       ├── .timeline / .timeline-item
  │       ├── .policy-list / .policy-box
  │       ├── .bottom-line
  │       ├── .share-strip
  │       ├── .next-article-card
  │       └── .footnotes
  │
  ├── <footer class="site-footer">
  └── Scripts (back-to-top, copy link)
```

---

## HERO ELEMENTS — PROTOCOL

### HTML Pattern

```html
<div class="hero">
  <div class="eyebrow">mostlycbd.com · [Article Short Title]</div>
  <h1>[HEADLINE WITH <span class="accent">KEY PHRASE</span>]</h1>
  <div class="subtitle">[One or two sentences. The dek.]</div>
  <div class="hero-meta">[Month Year] · [Subject Area] · mostlycbd.com</div>
</div>
```

All five hero elements are styled in `global.css` sections 7.
**No inline override needed** — `global.css` already handles the
`.hero h1` specificity battle against old root `.hero h1` rules
from `style.css` (which is now retired).

### `.accent` in headings

```html
<h1>THE <span class="accent">FOMO</span> PIPELINE</h1>
<h2>THE QUESTION <span class="accent">EVERYONE'S ASKING WRONG</span></h2>
```

`h1 .accent` and `.hero h1 .accent` default to `var(--rust)`.
`h2 .accent` also defaults to `var(--rust)`. These are defined
globally — no per-article override needed unless intentionally
changing the accent colour for a specific piece.

---

## ARTICLE BODY COMPONENTS

All components are defined in `global.css`. Use the class names
directly — no inline styles needed. Variants are handled by
modifier classes.

### Component Quick Reference

| Component | Base class | Modifier classes |
|-----------|-----------|-----------------|
| Stat row | `.stat-row` | — |
| Stat block (bare) | `.stat-block` | — |
| Stat card (bordered) | `.stat-box` | — |
| Stat number | `.stat-num` | `.green` `.gold` `.blue` |
| Pull quote | `.pull-quote` | — |
| Alert/warning | `.alert-box` | — |
| Info/green callout | `.callout-box` | — |
| Compare grid | `.compare-grid` | `.compare-grid--flush` |
| Compare card | `.compare-box` | `.good` `.bad` |
| Compare split panel | `.compare-col` | `.left` `.right` |
| Timeline | `.timeline` | `.timeline--rule` |
| Timeline item | `.timeline-item` | `.alert` |
| Policy list | `.policy-list` | — |
| Policy box | `.policy-box` | — |
| Policy numbered row | `.policy-item` + `.policy-num` | `.green` `.gold` `.brown` `.rust` |
| Policy CTA block | `.policy-ask` | `--gold-top` `--brown` `--rust` |
| Data card row | `.data-row` + `.data-card` | — |
| Bottom line | `.bottom-line` | — |
| Share strip | `.share-strip` | — |
| Next article card | `.next-article-card` | — |
| Footnotes | `.footnotes` + `.footnotes__heading` | — |
| Back to top | `#backToTop` (JS-toggled `.visible`) | — |

---

## SOURCES & REFERENCES — PROTOCOL

(Unchanged from v2 — full protocol documented there.)

### HTML Structure

```html
<hr class="rule" />

<section class="footnotes section--tight">
  <div class="container">
    <div class="footnotes__heading">Sources &amp; References</div>
    <ol>
      <li>
        [Source description]
        <a href="https://[url]" target="_blank" rel="noopener">→ domain.tld</a>
      </li>
    </ol>
  </div>
</section>
```

No CSS needed — `.footnotes`, `.section--tight`, `.container`, and
`.rule` are all defined in `global.css`.

---

## NAV & FOOTER

Both are fully defined in `global.css` sections 4 and 5.

### Nav HTML (identical for every page, only hrefs differ)

```html
<nav class="site-nav" aria-label="Site navigation">
  <div class="site-nav__inner">
    <a href="index.html" class="site-nav__logo">mostly<span>cbd</span>.com</a>
    <button type="button" class="hamburger" aria-label="Menu"
      onclick="this.classList.toggle('open');document.querySelector('.site-nav__links').classList.toggle('open')">
      <span></span><span></span><span></span>
    </button>
    <ul class="site-nav__links">
      <li><a href="index.html">Home</a></li>
      <li><a href="guide.html">Guide</a></li>
      <li><a href="blog.html">Deep Dives</a></li>
      <li><a href="research.html">Research</a></li>
      <li><a href="https://www.reddit.com/r/mostlyCBD/" target="_blank" rel="noopener">Community</a></li>
      <li><a href="rfer.html" class="rfer-nav"><span class="lr1">R</span><span class="lf">F</span><span class="le">E</span><span class="lr2">R</span></a></li>
      <li><a href="https://shop.mostlycbd.com">Shop</a></li>
    </ul>
  </div>
</nav>
```

> **Note:** `blog-rfer-deep-dive.html` previously duplicated the entire
> nav and footer CSS inline. That duplication is now eliminated —
> `global.css` handles both.

---

## BACK-TO-TOP + COPY LINK SCRIPTS

Include at bottom of every article `<body>`:

```html
<a href="#top" id="backToTop">↑ TOP</a>

<script>
  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = 'Copy Link'; }, 2500);
    });
  }

  const topBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('visible', window.scrollY > 400);
  });
</script>
```

---

## IMAGE ASSETS

| Asset type | Size | Format | Path |
|------------|------|--------|------|
| Article hero / OG image | 1200×630px min | JPG (~200–400KB) | `/images/bg_[slug].jpg` |
| Advocacy visuals | — | JPG or PNG | `/images/advocacy/[slug].jpg` |
| Infographics | — | JPG or PNG | `/infographics/[slug].jpg` |
| Nav logo | — | PNG (transparent) | `/logo_1.png` |
| Favicon | 512×512px | PNG | `/Favicon.png` |

**Path note:** All files are in root. Asset paths are **not** prefixed
with `../` — that was a `/blog/` subfolder convention that no longer
applies.

---

## ANALYTICS

GoatCounter — paste in `<head>` of every page:

```html
<script data-goatcounter="https://mostlycbd.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

---

## BLOG.HTML CARD TYPES

| Card type | Class | Usage |
|-----------|-------|-------|
| Featured (top slot) | `.blog-card-featured` | Most recent published article |
| Grid card | `.blog-card` | Published articles in grid |

When publishing a new article: promote it to the featured slot,
move the previous featured card to the grid.

---

## CONTENT TAXONOMY

| Type | Description | Card treatment |
|------|-------------|----------------|
| Deep Dive | Long-form editorial (5,000–10,000 words) | Full card with dek |
| Data Report / One-Pager | Dense, citable, reference-grade | Compact card, "Data" tag |
| Advocacy Graphic | Fast, shareable infographic | Image-forward card, "Graphic" tag |

---

## PRE-PUBLISH CHECKLIST

- [ ] Page links `<link rel="stylesheet" href="global.css">` (not style.css)
- [ ] No `<style>` block in the article `<head>` (unless genuinely per-instance)
- [ ] Hero image exists at `/images/bg_[slug].jpg`
- [ ] GoatCounter script in `<head>`
- [ ] Favicon linked: `<link rel="icon" type="image/png" href="Favicon.png">`
- [ ] OG + Twitter Card meta tags complete and accurate
- [ ] Validated at `opengraph.xyz`
- [ ] Validated at X Card Validator
- [ ] `blog.html` featured card updated
- [ ] Previous featured card moved to grid
- [ ] "Next article" link at bottom of article updated
- [ ] Mobile responsive (test at ~375px)
- [ ] No blanket `a { }` rules bleeding into nav
- [ ] Sources & References section present with `.footnotes` markup
- [ ] All linked sources verified live (no 404s)
- [ ] Every stat and cited claim has a corresponding footnote entry

---

## VOICE & EDITORIAL STANDARDS

- **No hype.** No stoner culture. No gimmicks.
- **Data precedes claims.** Never assert without a source.
- **Active voice.** "The industry bred out CBD" — not "CBD was bred out."
- **Specificity over generality.** "67-day wait times" — not "long wait times."
- **Bottom line is non-negotiable.** Reader must know exactly where you stand.
- **No moralizing.** Present evidence. Let the reader conclude.
- Lede: punchy, 1–2 sentences, states thesis immediately.
- Signature line: `// Educate to regulate. 🌿`
- Site taglines: `Focused. Functional. Fair.` / `#ScrapTheScript`

---

*Last updated: March 2026*  
*CSS architecture: global.css consolidation — replaces style.css + style-blog.css + all article inline style blocks*  
*Compatible with: all blog-*.html articles in root directory*
