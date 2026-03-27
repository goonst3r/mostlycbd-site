# mostlyCBD.com — Tech Stack Reference
## Instructional Guidelines for Project Work

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
├── style.css               # Global stylesheet (structural/behavioral rules only)
├── Favicon.png             # Site favicon
├── logo_1.png              # Nav logo
├── ARTICLE_TEMPLATE.md     # Authoring guide for new articles
│
├── blog/                   # All Deep Dive articles
│   ├── hearst-anslinger.html
│   ├── ecs-system.html
│   ├── als-cannabis-deep-dive.html
│   ├── training-gap.html
│   ├── akathisia.html
│   ├── mentalhealth.html
│   └── [new-article-slug].html
│
└── images/                 # All image assets
    ├── bg_[article-slug].jpg   # Hero images (1200×630px min)
    └── narrativeVoice1.jpg     # Action page banner
```

**CSS Architecture Rule:** Structural and behavioral rules live in `style.css`. Per-instance values (e.g., card background images, article-specific color overrides) go **inline** or in a `<style>` block within the article file. This prevents shared-class bleed between components.

---

## DESIGN SYSTEM — CURRENT (use this)

### Typography Stack

| Role | Font | Usage |
|------|------|-------|
| Headings | **Bebas Neue** | h1, h2, h3, section numbers, stat numerals |
| Eyebrows / Labels / Meta | **DM Mono** | category tags, read time, datelines, UI labels |
| Pull Quotes | **DM Serif Display** | `.pull-quote`, block quotes |
| Body Copy | **Inter** | Paragraphs, lists, footnotes |

**Google Fonts import (current articles):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Color Palette

| Variable | Hex | Role |
|----------|-----|------|
| Background | `#F5F0E8` (cream) | Page background |
| Deep Green | `#344E41` | Primary brand, headers, CTA backgrounds |
| Sage | `#A3B18A` | Accent, `.accent` spans in headings, stat numbers |
| Rust | `#BC4749` | Warning callouts, alert borders |
| Gold | `#E9C46A` | Key takeaway borders, highlight accents |
| Text | `#2D2D2D` | Body copy |
| Muted Text | `rgba(45,45,45,0.6)` | Meta, secondary labels |

### CSS Custom Properties (inline `<style>` block in articles)

```css
:root {
  --bg: #F5F0E8;
  --text: #2D2D2D;
  --green: #344E41;
  --sage: #A3B18A;
  --rust: #BC4749;
  --gold: #E9C46A;
  --card-bg: #FFFFFF;
  --border: rgba(52,78,65,0.12);
}
```

> ⚠️ **Design system versioning note:** Earlier articles (hearst-anslinger, ecs-system) used **Space Mono + Georgia** with a green/bone palette. The current system uses the stack above. Always read the file you're editing before applying styles — never assume which system is in use.

---

## ARTICLE PAGE ANATOMY

Articles in `/blog/` follow this structure:

```
<head>
  ├── Standard meta (charset, viewport)
  ├── SEO meta (title, description)
  ├── Open Graph tags (og:title, og:description, og:url, og:image, og:site_name)
  ├── Twitter Card tags (twitter:card, twitter:site, twitter:image)
  ├── Google Fonts (current stack)
  ├── GoatCounter analytics script
  ├── <link rel="stylesheet" href="../style.css">
  ├── <link rel="icon" href="../Favicon.png">
  └── Inline <style> block (article-specific CSS variables + overrides)

<body>
  ├── <nav class="site-nav"> (hamburger menu, logo, links)
  ├── <div class="page">
  │   ├── <div class="hero"> (article hero banner)
  │   │   ├── Eyebrow (DM Mono category + deep dive number)
  │   │   ├── h1 (Bebas Neue, large)
  │   │   ├── Dek paragraph
  │   │   └── Meta row (category, read time, sources)
  │   │
  │   └── <div class="sections"> (article body)
  │       ├── .section (numbered, each major block)
  │       ├── .pull-quote (DM Serif Display, left-bordered)
  │       ├── .stat-row / .stat-block (Bebas Neue numerals)
  │       ├── .timeline (left-rule, Bebas year labels)
  │       ├── .callout (colored left border — green/rust/gold)
  │       ├── .data-table (DM Mono headers)
  │       ├── .bottom-line (dark card, sage label)
  │       ├── .share-strip (X share, copy link, back to index)
  │       ├── .next-article-card (link to next piece)
  │       └── .footnotes (consolidated references, ordered list)
  │
  ├── <footer> (social icons SVG, taglines)
  └── Scripts (back-to-top, copy link)
```

---

## NAVIGATION (current pattern)

**All CSS for `.site-nav` lives in `style.css` — never redeclare it inline.**

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
      <li><a href="action.html">Action</a></li>
      <li><a href="https://shop.mostlycbd.com">Shop</a></li>
    </ul>
  </div>
</nav>
```

**Path note:** Pages in `/blog/` use `../index.html`, `../guide.html` etc. Root-level pages use `index.html` directly.

**Canonical nav link inventory** — this is the authoritative list. Do not add, remove, or rename links without updating this table:

| Label | href | Notes |
|-------|------|-------|
| Home | `index.html` | |
| Guide | `guide.html` | |
| Deep Dives | `blog.html` | |
| Research | `research.html` | Previously `evidence.html` / "Evidence" — do not revert |
| Community | `https://www.reddit.com/r/mostlyCBD/` | `target="_blank" rel="noopener"` |
| Action | `action.html` | |
| Shop | `https://shop.mostlycbd.com` | |

Add `class="active"` to the link matching the current page.

**Class map (all defined in `style.css`):**

| Class | Role |
|-------|------|
| `.site-nav` | Sticky nav bar, cream/textured bg, dark text |
| `.site-nav__inner` | Max-width inner wrapper, flex row |
| `.site-nav__logo` | Brand text link, DM Mono |
| `.site-nav__links` | `<ul>` link list |
| `.hamburger` | Mobile toggle button (3 spans) |

> ⚠️ **Do not** use the old class names `.nav-logo-link`, `.nav-hamburger`, or `.nav-links` — these are legacy and will produce a broken dark-green nav with white text instead of the cream site-nav.

---

## FOOTER (current pattern)

**All CSS for `.site-footer` lives in `style.css` — never redeclare it inline.** The footer is bone-colored (`#EAE6DC`), not green. Any inline `background` override on `.site-footer` will break the design.

```html
<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__brand">
      <strong>mostlycbd.com</strong>
      Natural cannabis advocacy. No ads. No stigma.<br/>
      © 2026 mostlycbd.com
    </div>
    <div class="site-footer__taglines">
      <div>#ScrapTheScript<br/>Educate to Regulate.<br/>Focused. Functional. Fair.</div>
      <div class="site-footer__socials">
        <a href="https://twitter.com/scrapthescript" target="_blank" rel="noopener" aria-label="X (Twitter)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a href="https://www.tiktok.com/@mostlycbd/" target="_blank" rel="noopener" aria-label="TikTok">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
          </svg>
        </a>
        <a href="https://www.instagram.com/mostly.cbd/" target="_blank" rel="noopener" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
          </svg>
        </a>
        <a href="https://www.reddit.com/r/mostlyCBD/" target="_blank" rel="noopener" aria-label="Reddit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</footer>
```

**Class map (all defined in `style.css`):**

| Class | Role |
|-------|------|
| `.site-footer` | Bone bg `#EAE6DC`, top border `#C8C3B8`, padding |
| `.site-footer__inner` | Max-width `1020px`, flex row, space-between |
| `.site-footer__brand` | DM Mono, muted text, brand name + tagline |
| `.site-footer__taglines` | Right-aligned, DM Mono, flex column |
| `.site-footer__socials` | Icon row, flex, gap 18px |

**Required tagline order:** `#ScrapTheScript` → `Educate to Regulate.` → `Focused. Functional. Fair.`

> ⚠️ **Never add `background`, `color`, or padding overrides to `.site-footer` in an inline `<style>` block.** `style.css` owns all footer styling. Adding inline CSS here produced a green footer on research2.html — the canonical footer is bone-colored with dark text.

---

## COMPONENT CLASSES (current system)

| Component | Class | Notes |
|-----------|-------|-------|
| Page wrapper | `.page` | Max-width container |
| Hero banner | `.hero` | Dark green bg, white text |
| Eyebrow label | `.eyebrow` | DM Mono, small caps |
| Body section | `.section` | Numbered layout block |
| Pull quote | `.pull-quote` | DM Serif Display italic, green left border |
| Stat row | `.stat-row` / `.stat-block` | Bebas Neue numerals, label below |
| Timeline | `.timeline` | Left vertical rule, `.tl-item` children |
| Callout box | `.callout` | White card, colored left border |
| Data table | `.data-table` | DM Mono headers, site border style |
| Bottom line | `.bottom-line` | Dark card, sage "Bottom Line" label |
| Share strip | `.share-strip` | X share link, copy link button, back link |
| Next article | `.next-article-card` | Links to next piece |
| Footnotes | `.footnotes` | Ordered list, DM Mono, bottom of article |
| Accent span | `.accent` | Sage-colored word in headings |
| Green text | `.green` | Deep green inline accent |

---

## LINK SCOPING RULE

Do **not** use a blanket `a { }` rule that affects nav links. Scope article link styles to content only:

```css
/* CORRECT */
.section a, .footnotes a {
  color: var(--sage);
  border-bottom: 1px dotted var(--sage);
}

/* WRONG — bleeds into nav */
a { color: var(--sage); }
```

---

## SOCIAL / SEO META TAGS (required on every article)

```html
<!-- Basic SEO -->
<title>[Article Title] | mostlyCBD Deep Dives</title>
<meta name="description" content="[155 chars max]" />

<!-- Open Graph -->
<meta property="og:title" content="[Article Title]" />
<meta property="og:description" content="[Dek, 155 chars]" />
<meta property="og:url" content="https://mostlycbd.com/blog/[slug].html" />
<meta property="og:site_name" content="mostlyCBD" />
<meta property="og:image" content="https://mostlycbd.com/images/bg_[slug].jpg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@scrapthescript" />
<meta name="twitter:image" content="https://mostlycbd.com/images/bg_[slug].jpg" />
```

**Pre-publish validation:**
- `opengraph.xyz` — OG preview check
- X Card Validator — Twitter card check

---

## ANALYTICS

**GoatCounter** — paste this in `<head>` of every page, no modification needed:

```html
<script data-goatcounter="https://mostlycbd.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

---

## IMAGE ASSETS

| Asset type | Size | Format | Path |
|------------|------|--------|------|
| Article hero / OG image | 1200×630px min | JPG (~200–400KB) | `/images/bg_[slug].jpg` |
| Nav logo | — | PNG (transparent) | `/logo_1.png` |
| Favicon | 512×512px | PNG | `/Favicon.png` |

**Path note:** Articles live in `/blog/` — all asset references need `../` prefix:
- `../logo_1.png` ✓
- `../images/bg_[slug].jpg` ✓
- `logo_1.png` ✗

---

## BACK-TO-TOP + COPY LINK SCRIPTS

Include at bottom of every article `<body>`:

```html
<a href="#top" id="backToTop">↑ TOP</a>

<script>
  // Copy link
  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = 'Copy Link'; }, 2500);
    });
  }

  // Back to top visibility
  const topBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('visible', window.scrollY > 400);
  });
</script>
```

---

## BLOG.HTML CARD TYPES

Three distinct card treatments on the Deep Dives index:

| Card type | Class | Usage |
|-----------|-------|-------|
| Featured (top slot) | `.blog-card-featured` | Most recent published article |
| Grid card | `.blog-card` | Published articles in grid |
| Coming Soon | `.blog-card-soon` | Announced but unpublished |

When publishing a new article: promote it to the featured slot, move the previous featured card to the grid.

---

## CONTENT TAXONOMY

Three distinct content types — each gets different card treatment:

| Type | Description | Card treatment |
|------|-------------|----------------|
| Deep Dive | Long-form editorial (5,000–10,000 words) | Full card with dek |
| Data Report / One-Pager | Dense, citable, reference-grade | Compact card, "Data" tag |
| Advocacy Graphic | Fast, shareable infographic | Image-forward card, "Graphic" tag |

---

## SOURCES & REFERENCES — PROTOCOL

Every article ends with a `Sources & References` section. This is not a courtesy — it's authority infrastructure. Links to primary sources (government databases, peer-reviewed journals, institutional records) make claims auditable and signal that the site operates at a different standard than dispensary marketing content.

### HTML Structure

```html
<hr class="rule" />

<section class="footnotes section--tight">
  <div class="container">
    <div class="footnotes__heading">Sources &amp; References</div>
    <ol>
      <li>
        [Source description — Author/Organization, Date, Title or context.]
        <a href="https://[primary-source-url]" target="_blank" rel="noopener">→ domain.tld</a>
      </li>
      <!-- repeat for each source -->
    </ol>
  </div>
</section>
```

### CSS (include in article's inline `<style>` block)

```css
.section--tight { padding: 48px 0; }

.footnotes {
  padding: 32px 0;
  border-top: 1px solid #C8C3B8;
}

.footnotes__heading {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #5A5750;
  margin-bottom: 16px;
}

.footnotes ol { padding-left: 20px; }

.footnotes li {
  font-size: 13px;
  color: #5A5750;
  line-height: 1.55;
  margin-bottom: 8px;
}

.footnotes a {
  color: #5A5750;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
}
```

### Citation Format Rules

**Link format:** Plain source description followed by a `→ domain.tld` link. Arrow prefix (`→`) is the visual cue — short, scannable, consistent.

```
Pennsylvania Medical Marijuana Act, Act 16 of 2016 (35 P.S. § 10231.101 et seq.)
<a href="https://www.pa.gov/..." target="_blank" rel="noopener">→ pa.gov</a>
```

**Source hierarchy — link in this order of preference:**
1. Primary government source (`.gov`, legislation, official regulatory text)
2. Peer-reviewed journal / institutional report (PubMed, NIH, .edu)
3. Major news organization with dateline
4. No link if primary source is unavailable — cite fully in plain text, no fabricated URLs

**What to cite:**
- Every statistic used in the article
- Every named law, regulation, or code section
- Every clinical or research claim
- Named institutional programs or certifications

**What not to do:**
- No Wikipedia links
- No secondary aggregators when the primary source is accessible
- No dead links — verify before publishing
- No inline footnote numbers in article body (sources are end-of-article only, not superscript-linked)

### Authority Principle

The `→ domain.tld` shortform does deliberate work: `.gov` and `.edu` domains visible in the footnotes communicate source quality at a glance without requiring the reader to hover over a URL. Use `.gov` over any third-party summary of the same regulation. Use a journal DOI over a press release about the same study. The link itself is the credibility signal.

---

## PRE-PUBLISH CHECKLIST

- [ ] All internal links use `../` prefix correctly from `/blog/`
- [ ] Hero image exists at `/images/bg_[slug].jpg`
- [ ] GoatCounter script in `<head>`
- [ ] Favicon linked: `<link rel="icon" type="image/png" href="../Favicon.png">`
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
- [ ] Primary sources used over aggregators wherever accessible

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
*Sources & References protocol derived from: training-gap.html*  
*Compatible with: current style.css and article template pattern (training-gap, akathisia, mentalhealth)*
