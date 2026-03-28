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
├── research.html           # Research hub
├── rfer.html               # Reschedule. Fund Trials. Educate. Regulate.
├── style.css               # Global stylesheet (structural/behavioral rules only)
├── Favicon.png             # Site favicon
├── logo_1.png              # Nav logo
├── ARTICLE_TEMPLATE.md     # Authoring guide for new articles
├── TECH_STACK.md           # Tech stack reference
│
├── blog-hearst-anslinger.html    # Deep Dive articles (formerly in /blog/)
├── blog-ecs-system.html
├── blog-als.html
├── blog-fomo.html
├── blog-regulation-gap.html
├── blog-rfer-deep-dive.html
├── blog-training-gap.html
├── blog-akathisia.html
├── blog-mentalhealth.html
├── style-blog.css                # Stylesheet for blog articles
├── blog-[new-article-slug].html
│
├── images/                 # All image assets
│   ├── advocacy/
│       ├── [advocacy-visuals-slug].jpg  # Advocacy visuals images
│       ├── [advocacy-visuals-slug].png  # Advocacy visuals images
│   ├── bg_[article-slug].jpg   # Hero images (1200×630px min)
│   
├── infographics/           # All infographic assets
│   ├── [infographic-slug].jpg  # Infographic images
│   └── [infographic-slug].png  # Infographic images
```

**CSS Architecture Rule:** Structural and behavioral rules for root live in `style.css`. Structural and behavioral rules for blog live in `style-blog.css`. Per-instance values (e.g., card background images, article-specific color overrides) go **inline** or in a `<style>` block within the article file. This prevents shared-class bleed between components.

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

> ⚠️ **Design system versioning note:** Earlier articles (hearst-anslinger, ecs-system) used **Space Mono + Georgia** with a green/bone palette. The current system uses the stack above. Always read the file you're editing before applying styles — never assume which system is in use. Blog articles link to both `../style.css` (root globals) and `style-blog.css` (blog-specific rules) — check both before making changes.

---

## ARTICLE PAGE ANATOMY

Articles (prefixed with `blog-`) follow this structure:

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

## HERO ELEMENTS — PROTOCOL

The five elements that open every article. All are defined in the article's inline `<style>` block — not inherited from `style.css`. (Note: `style.css` does have a `.subtitle` rule, but it's a low-specificity legacy global. The article-level inline rule overrides it completely with the DM Serif Display treatment. Always include the inline override.)

### HTML Pattern

```html
<div class="hero">
  <div class="eyebrow">mostlycbd.com · [Article Short Title]</div>
  <h1>[HEADLINE WITH <span class="accent">KEY PHRASE</span>]</h1>
  <div class="subtitle">[One or two sentences. The dek. States the argument or sets the scene.]</div>
  <div class="hero-meta">[Month Year] · [Jurisdiction or Subject Area] · mostlycbd.com</div>
</div>
```

**Live example (training-gap.html):**
```html
<div class="hero">
  <div class="eyebrow">mostlycbd.com · The Training Gap</div>
  <h1>TWO HOURS TO <span class="accent">DISPENSE MEDICINE</span></h1>
  <div class="subtitle">In Pennsylvania, the person handing you a medical cannabis product has less required clinical training than your bartender has in responsible alcohol service. This is that story.</div>
  <div class="hero-meta">March 2026 · Pennsylvania Medical Marijuana Program · mostlycbd.com</div>
</div>
```

---

### Element-by-Element Reference

#### `.eyebrow`
Breadcrumb + article identity. DM Mono, small, uppercase, rust-colored. Always leads with `mostlycbd.com ·` followed by the article's short title or subject.

```css
.eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--rust);
  margin-bottom: 12px;
  text-align: left;
}
```

---

#### `h1` + `.hero h1`
Bebas Neue, large, tight leading. Two rules required: the bare `h1` rule plus `.hero h1` at higher specificity to override `style.css`'s root `.hero h1` rule (which sets `max-width`, `animation`, and centered alignment — all wrong for article pages).

```css
h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.8rem, 6vw, 4.4rem);
  line-height: 0.95;
  color: var(--dark);
  letter-spacing: 0.02em;
  margin-bottom: 12px;
}

/* Required override — kills root .hero h1 centering and animation */
.hero h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.8rem, 6vw, 4.4rem);
  font-weight: 700;
  line-height: 0.95;
  color: var(--dark);
  letter-spacing: 0.02em;
  margin-bottom: 12px;
  max-width: none;
  animation: none;
  text-align: left;
}
```

---

#### `.accent` (in headings)
A `<span class="accent">` wraps the key phrase inside `h1` (and `h2`). In training-gap the accent color is `var(--rust)`. Other articles may use `var(--sage)` depending on the piece's palette. Always define both selectors together:

```css
h1 .accent,
.hero h1 .accent { color: var(--rust); }

/* For h2 accents in article body: */
h2 .accent { color: var(--rust); }
```

**Usage:** Pick the phrase that carries the editorial weight. One accent per heading — not decorative, argumentative.

---

#### `.subtitle`
The dek. DM Serif Display italic, muted color, left-aligned. This rule must be in the inline `<style>` block to override the legacy `.subtitle` in `style.css`.

```css
.subtitle {
  font-family: 'DM Serif Display', serif;
  font-size: 1.15rem;
  color: var(--muted);
  font-style: italic;
  line-height: 1.5;
  max-width: 640px;
  margin-bottom: 8px;
  margin-left: 0;
  margin-right: 0;
  text-align: left;
}
```

**Writing note:** The subtitle is the one sentence that earns the click. It states the argument, not the topic. "This is that story." is a closer, not a summary.

---

#### `.hero-meta`
Dateline row. DM Mono, very small, muted. Format: `[Month Year] · [Subject/Jurisdiction] · mostlycbd.com`. The `·` separator is a mid-dot (`·`, `&middot;`), not a hyphen or pipe.

```css
.hero-meta {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-top: 20px;
}
```

---

### Source: Inline `<style>` Block
All five rules above live in the article's inline `<style>` block — **not** in `style.css`. This is intentional: article pages have their own color variables and need to override global hero rules. Do not move these to `style.css`.

---

## ARTICLE BODY COMPONENTS — PROTOCOL

All components below are defined in the article's inline `<style>` block. Reference file: `mentalhealth.html`. `style-blog.css` has its own `.pull-quote` with a different treatment — the inline block overrides it. Check both before editing.

---

### `.section` + `.section-num`

Every major content block is a `.section` div. The section number sits above `h2` as a small sage-colored label. Numbers are zero-padded: `01`, `02`, etc.

```html
<div class="section">
  <div class="section-num">01</div>
  <h2>THE <span class="accent">QUESTION</span> EVERYONE'S ASKING WRONG</h2>
  <p>...</p>
</div>
```

```css
.section {
  padding: 48px 0;
  border-top: 1px solid rgba(26,18,8,0.1);
}

.section-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  color: var(--sage);
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
```

---

### `h2` + `.accent`

Section headings. Bebas Neue, responsive via `clamp()`. The `border-bottom: none` and `padding-bottom: 0` overrides kill the default underline from `style.css`. One `.accent` span per heading wraps the argumentative key phrase.

```html
<h2>TEEN CANNABIS USE <span class="accent">WENT DOWN,</span> NOT UP</h2>
```

```css
h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1;
  color: var(--dark);
  letter-spacing: 0.02em;
  margin-bottom: 24px;
  border-bottom: none;
  padding-bottom: 0;
}

h2 .accent { color: var(--rust); }
```

**Note:** `var(--rust)` is the current default accent color. Define it explicitly in each article's inline `<style>` block — don't rely on inheritance.

---

### `h3`

A sub-section label within the article body. DM Mono, small, uppercase, green. Used to introduce named sub-arguments or data groupings within a section — not reserved for policy boxes. Sits between `p` elements; does not need a `.section-num`.

```html
<h3>What the data supports</h3>
<p>A 2024 JAMA Psychiatry study...</p>

<h3>What the data doesn't support</h3>
<p>The claim that legalization causes psychosis...</p>
```

```css
h3 {
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--green);
  margin: 32px 0 12px;
}
```

---

### `.pull-quote`

A standout statement — one sentence or short passage that earns its own visual weight. DM Serif Display italic, green text, left sage border. Rhetorical, not decorative. Used both for original editorial statements and for attributed research quotes.

> ⚠️ `style-blog.css` defines its own `.pull-quote` using top/bottom borders and BEM subclasses (`.pull-quote__text`, `.pull-quote__attr`). The inline `<style>` block overrides this entirely. Always include the inline rule — do not rely on `style-blog.css` for this treatment.

```html
<div class="pull-quote">The platform didn't know it was hurting teenagers. It just knew that hurt teenagers scroll longer.</div>
```

```css
/* Inline override — supersedes style-blog.css .pull-quote */
.pull-quote {
  font-family: 'DM Serif Display', serif;
  font-size: 1.35rem;
  line-height: 1.45;
  color: var(--green);
  font-style: italic;
  border-left: 4px solid var(--sage);
  padding: 20px 0 20px 28px;
  margin: 32px 0;
  max-width: 600px;
}
```

---

### `.timeline`

Chronological event list. Left border rule in sage with circular dot markers per item. Year labels in Bebas Neue green. Supports an `.alert` modifier on `.timeline-item` that switches both the dot and year label to rust — used to mark inflection points or harmful events.

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-year">Pre-2018</div>
    <div class="timeline-text">Only 15 total delta-8 adverse event cases in the entire FDA FAERS database.</div>
  </div>
  <div class="timeline-item alert">
    <div class="timeline-year">Dec 2018</div>
    <div class="timeline-text">Farm Bill passes. Hemp derivatives legalized federally. Unintended gateway for synthetic cannabinoids.</div>
  </div>
</div>
```

```css
.timeline {
  margin: 32px 0;
  border-left: 3px solid var(--sage);
  padding-left: 24px;
}

.timeline-item {
  margin-bottom: 20px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -30.5px;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--sage);
}

.timeline-item.alert::before { background: var(--rust); }

.timeline-year {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  color: var(--green);
  line-height: 1;
  margin-bottom: 4px;
}

.timeline-item.alert .timeline-year { color: var(--rust); }

.timeline-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--dark);
  max-width: 580px;
}
```

**`.alert` modifier:** Apply to `.timeline-item` to mark harmful or inflection-point entries — dot and year label both shift to rust.

---

### `.compare-grid`

Two variants — same outer `.compare-grid` class, different child structure. Choose based on content type. Both use soft tint backgrounds (green tint = positive, rust tint = negative).

---

#### Variant A — `.compare-box` (prose comparison)
Source: `mentalhealth.html`. Separated cards with gap. Body copy in `p` tags. Use for analytical comparisons explained in prose — two sides of an argument with supporting context.

```html
<div class="compare-grid">
  <div class="compare-box good">
    <div class="compare-title">Regulated Market (dispensary)</div>
    <p>Age verification at point of sale. Product testing. Labeled dosing. Trained staff.</p>
    <p class="highlight">Colorado and Washington: teen use down 35%+ since legalization.</p>
  </div>
  <div class="compare-box bad">
    <div class="compare-title">Unregulated Market (Farm Bill loophole)</div>
    <p>No age verification. No testing. No dosing standards. Gas station distribution.</p>
    <p class="alert-text">8,000+ poison control calls (2021–2023). 41% involving children.</p>
  </div>
</div>
```

```css
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 32px 0;
}

.compare-box {
  padding: 24px;
  border-radius: 6px;
}

.compare-box.good {
  background: rgba(45,80,22,0.06);
  border: 1px solid rgba(45,80,22,0.15);
}

.compare-box.bad {
  background: rgba(184,74,46,0.04);
  border: 1px solid rgba(184,74,46,0.12);
}

.compare-title {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.compare-box.good .compare-title { color: var(--green); }
.compare-box.bad  .compare-title { color: var(--rust); }

.compare-box p {
  font-size: 0.9rem;
  line-height: 1.65;
  margin-bottom: 8px;
  max-width: none;
}

.compare-box p:last-child { margin-bottom: 0; }

.highlight  { color: var(--green); font-weight: 600; }
.alert-text { color: var(--rust);  font-weight: 600; }

/* Mobile */
@media (max-width: 700px) {
  .compare-grid { grid-template-columns: 1fr; }
}
```

---

#### Variant B — `.compare-col` (list comparison)
Source: `rfer-deep-dive.html`. Flush columns, no gap, unified border. Content in `ul` lists with `✓` / `✗` prefixed items. Column titles use `h4`. Use for direct point-by-point policy arguments where the verdict is the point.

```html
<div class="compare-grid">
  <div class="compare-col left">
    <h4>What Evidence-Based Regulation Delivers</h4>
    <ul>
      <li>Mandatory potency testing and labeling</li>
      <li>Age verification at point of sale</li>
      <li>Clinical guidance at dispensaries</li>
    </ul>
  </div>
  <div class="compare-col right">
    <h4>What Prohibition Delivers</h4>
    <ul>
      <li>Untested products on gas station shelves</li>
      <li>Synthetics targeting adolescents</li>
      <li>A research blockade on the plant</li>
    </ul>
  </div>
</div>
```

```css
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 36px 0;
  border: 1px solid #E0DAD0;
  overflow: hidden;
}

.compare-col { padding: 28px; }

.compare-col.left {
  background: rgba(45,80,22,0.06);
  border-right: 1px solid #E0DAD0;
}

.compare-col.right {
  background: rgba(184,74,46,0.04);
}

.compare-col h4 {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.compare-col.left h4  { color: var(--sage); }
.compare-col.right h4 { color: var(--rust); }

.compare-col ul {
  list-style: none;
  font-size: 0.92rem;
  line-height: 2;
}

.compare-col.left ul li::before {
  content: '✓ ';
  color: var(--sage);
  font-weight: 600;
}

.compare-col.right ul li::before {
  content: '✗ ';
  color: var(--rust);
  font-weight: 600;
}

/* Mobile */
@media (max-width: 700px) {
  .compare-grid { grid-template-columns: 1fr; }
}
```

**Note:** The original rfer-deep-dive uses `background: white` / `background: #2A1A0A` for the columns. The soft tint treatment above replaces both — consistent with site palette, no dark panel.

---

**When to use which:**
| | Variant A `.compare-box` | Variant B `.compare-col` |
|-|--------------------------|--------------------------|
| Content | Prose paragraphs | Bullet lists |
| Layout | Separated cards | Flush unified block |
| Register | Analytical, contextual | Adversarial, verdict-style |
| Best for | Editorial comparisons | Policy argument, point-by-point |

---

### `.policy-box`

Light green-tinted card for policy asks. Contains an `h3` (Bebas Neue, green), a `.policy-box__subtitle` (DM Mono, muted), and `.policy-item` rows — one per RFER pillar. Each item has a `.policy-num` letter label with a color modifier (`.green`, `.gold`, `.brown`, `.rust`) and a `.pillar-word` sub-label beneath it.

```html
<div class="policy-box">
  <h3>RFER</h3>
  <p class="policy-box__subtitle">Reschedule · Fund Trials · Educate · Regulate</p>
  <div class="policy-item">
    <div class="policy-num green">R<span class="pillar-word">Reschedule</span></div>
    <div><strong>Reschedule cannabis federally.</strong> End the Schedule I classification that blocks research.</div>
  </div>
  <div class="policy-item">
    <div class="policy-num gold">F<span class="pillar-word">Fund Trials</span></div>
    <div><strong>Fund real clinical trials.</strong> Not observational studies — randomized controlled trials.</div>
  </div>
</div>
```

```css
.policy-box {
  background: rgba(45,80,22,0.06);
  border: 1px solid rgba(45,80,22,0.15);
  border-radius: 8px;
  padding: 32px;
  margin: 32px 0;
}

.policy-box h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 0.05em;
  color: var(--green);
  margin-top: 0;
  margin-bottom: 4px;
}

.policy-box__subtitle {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 0;
  margin-bottom: 24px;
}

.policy-item {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-bottom: 8px;
  font-size: 0.95rem;
  line-height: 1.6;
  border-radius: 6px;
  overflow: hidden;
}

.policy-item:last-child { margin-bottom: 0; }

.policy-item:has(.policy-num.green) { background: rgba(45,80,22,0.09); }
.policy-item:has(.policy-num.gold)  { background: rgba(212,180,74,0.14); }
.policy-item:has(.policy-num.brown) { background: rgba(139,115,85,0.11); }
.policy-item:has(.policy-num.rust)  { background: rgba(184,74,46,0.09); }

.policy-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  line-height: 1;
  flex: 0 0 72px;
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  text-align: center;
}

.policy-num.green { color: var(--green); }
.policy-num.gold  { color: var(--gold); }
.policy-num.brown { color: var(--brown); }
.policy-num.rust  { color: var(--rust); }

.policy-item > div:last-child { padding: 16px 16px 16px 14px; }

.pillar-word {
  font-family: 'DM Mono', monospace;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 4px;
  line-height: 1;
  color: var(--muted);
}
```

**Usage note:** The `.policy-box` in mentalhealth.html is a light-tinted card on cream — not a solid dark green block. The RFER pillar structure is specific to articles that align with the RFER framework. For single-ask policy boxes (e.g., a state-level regulation ask), a simpler structure with just `h3` + `p` is appropriate.

---

### Source Summary

| Component | Defined in | Reference file |
|-----------|------------|----------------|
| `.section`, `.section-num` | Article inline `<style>` block | `mentalhealth.html` |
| `h2`, `h2 .accent` | Article inline `<style>` block | `mentalhealth.html` |
| `h3` | Article inline `<style>` block | `mentalhealth.html` |
| `.pull-quote` | Article inline `<style>` block — overrides `style-blog.css` | `mentalhealth.html` |
| `.timeline`, `.timeline-item.alert` | Article inline `<style>` block | `mentalhealth.html` |
| `.compare-grid` + `.compare-box` (Variant A) | Article inline `<style>` block | `mentalhealth.html` |
| `.compare-grid` + `.compare-col` (Variant B) | Article inline `<style>` block | `rfer-deep-dive.html` |
| `.policy-box`, `.policy-item`, `.pillar-word` | Article inline `<style>` block | `mentalhealth.html` |
| `.ac-r1`, `.ac-f`, `.ac-e`, `.ac-r2` | Article inline `<style>` block | `rfer-deep-dive.html` |
| `.pillar-badge`, `.pillar-badge--*` | Article inline `<style>` block | `rfer-deep-dive.html` |
| `.policy-ask`, `.policy-ask--*` | Article inline `<style>` block | `rfer-deep-dive.html` |
| `h2` border reset | Inline block overrides `style.css` default `h2` underline | all articles |

---

## RFER COLOR SYSTEM — PROTOCOL

Source: `rfer-deep-dive.html`. The four RFER pillars each have a fixed color assignment. These colors are **not interchangeable** — always map pillar to color consistently wherever RFER appears: headings, badges, policy asks, nav items, stat blocks, letter cards.

### Pillar → Color mapping

| Pillar | Letter | Variable | Hex | Role |
|--------|--------|----------|-----|------|
| Reschedule | R (first) | `var(--green)` | `#2D5016` | Primary brand green |
| Fund Trials | F | `var(--gold)` | `#D4B44A` | Gold |
| Educate | E | `var(--brown)` | `#8B7355` | Brown |
| Regulate | R (second) | `var(--rust)` | `#b84a2e` | Rust red |

### `.ac-r1` / `.ac-f` / `.ac-e` / `.ac-r2` — heading letter classes

Used on `<span>` elements inside `h1` to color individual RFER letters. Apply to any heading that spells out RFER.

```html
<h1>
  <span class="rfer-line"><span class="ac-r1">R</span>eschedule.</span>
  <span class="rfer-line"><span class="ac-f">F</span>und Trials.</span>
  <span class="rfer-line"><span class="ac-e">E</span>ducate.</span>
  <span class="rfer-line"><span class="ac-r2">R</span>egulate.</span>
</h1>
```

```css
.hero h1 .ac-r1 { color: var(--green); }
.hero h1 .ac-f  { color: var(--gold); }
.hero h1 .ac-e  { color: var(--brown); }
.hero h1 .ac-r2 { color: var(--rust); }
```

The same color assignment applies to `.rfer-nav` letter spans in the nav item (`lr1` = green, `lf` = gold, `le` = brown, `lr2` = rust) and to `.policy-num` color modifiers in the mentalhealth.html policy box (`.green`, `.gold`, `.brown`, `.rust`).

---

### `.pillar-badge` + color variants

A small inline label used in `.section-eyebrow` to identify which RFER pillar a section belongs to. Base style is green background / white text. Color variants override to match the pillar.

```html
<!-- Reschedule — base (green) -->
<div class="section-eyebrow"><span class="pillar-badge">RFER PILLAR</span> R — Reschedule</div>

<!-- Fund Trials — gold variant -->
<div class="section-eyebrow"><span class="pillar-badge pillar-badge--gold">RFER PILLAR</span> F — Fund Trials</div>

<!-- Educate — brown variant -->
<div class="section-eyebrow"><span class="pillar-badge pillar-badge--brown">RFER PILLAR</span> E — Educate</div>

<!-- Regulate — rust variant -->
<div class="section-eyebrow"><span class="pillar-badge pillar-badge--rust">RFER PILLAR</span> R — Regulate</div>
```

```css
/* Base — always defined in article inline <style> block */
.section-eyebrow .pillar-badge {
  background: var(--green);
  color: white;
  padding: 2px 8px;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  font-family: 'DM Mono', monospace;
  text-transform: uppercase;
}

/* Color variants */
.pillar-badge--gold  { background: var(--gold)  !important; color: var(--dark) !important; }
.pillar-badge--brown { background: var(--brown) !important; }
.pillar-badge--rust  { background: var(--rust)  !important; }
```

**Note:** `--gold` on a badge uses `color: var(--dark)` (not white) for legibility. All other variants stay white text.

---

### `.policy-ask` + color variants

A solid color card for per-pillar policy asks. Base style is `var(--green)` background. Color variants match the pillar the ask belongs to. Contains an `h4` title (Bebas Neue, cream) and a `p` body (slightly transparent cream). Has a subtle radial glow `::before` in the top-right corner.

```html
<!-- Reschedule — base (green) -->
<div class="policy-ask">
  <h4>The Ask: Reschedule Cannabis Federally</h4>
  <p>Move cannabis out of Schedule I...</p>
</div>

<!-- Educate — brown variant -->
<div class="policy-ask policy-ask--brown">
  <h4>The Ask: Educate Healthcare Providers and the Public</h4>
  <p>Integrate cannabis pharmacology into medical school curricula...</p>
</div>

<!-- Regulate — rust variant -->
<div class="policy-ask policy-ask--rust">
  <h4>The Ask: Regulate by Evidence, Not Fear</h4>
  <p>Close the Farm Bill loophole completely...</p>
</div>
```

```css
.policy-ask {
  background: var(--green);
  color: var(--cream);
  padding: 32px 36px;
  margin: 36px 0;
  position: relative;
}

.policy-ask::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
  pointer-events: none;
}

.policy-ask h4 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
  color: var(--cream);
}

.policy-ask p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(245,240,232,0.88);
  max-width: 640px;
}

/* Color variants — pillar-matched */
.policy-ask--gold-top { border-top: 3px solid var(--gold); }
.policy-ask--brown    { background: var(--brown); }
.policy-ask--rust     { background: var(--rust); }
```

**Variant assignment:**
| Pillar | Class modifier |
|--------|---------------|
| Reschedule | *(base — no modifier)* |
| Fund Trials | `.policy-ask--gold-top` (green bg + gold top border) |
| Educate | `.policy-ask--brown` |
| Regulate | `.policy-ask--rust` |

**Distinction from `.policy-box`:** `.policy-ask` (from `rfer-deep-dive.html`) is a solid color full-bleed card with `h4` — used for per-pillar asks in RFER-structured articles. `.policy-box` (from `mentalhealth.html`) is a light-tinted card on cream with `h3` and RFER pillar item rows — used for summary policy blocks that enumerate all four pillars together. Use `.policy-ask` when writing per-pillar sections; use `.policy-box` when summarizing the full RFER framework.

---

## NAVIGATION (current pattern)

Source: `blog.html`. Path prefixes shown are for root-level pages. Articles in `/blog/` must use `../` prefixes on all internal links.

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

**For articles in `/blog/`**, prepend `../` to all internal hrefs:
```html
<a href="../index.html" class="site-nav__logo">mostly<span>cbd</span>.com</a>
<!-- and all internal li links: ../guide.html, ../blog.html, ../research.html, ../rfer.html -->
```

**RFER nav item** uses letter-span markup for the branded color treatment — copy exactly, do not simplify to plain text.

---

## FOOTER (current pattern)

Source: `blog.html`. Full social-icon footer with SVG icons for X, TikTok, Instagram, Reddit. Brand line + taglines left, socials right.

```html
<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__brand">
      <strong>mostlycbd.com</strong>
      Natural cannabis advocacy. No ads. No stigma.<br/>
      © 2026 mostlycbd.com
    </div>
    <div class="site-footer__taglines">
      <div>Educate to Regulate.<br/>Focused. Functional. Fair.</div>
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
| Advocacy visuals | — | JPG or PNG | `/images/advocacy/[slug].jpg` |
| Infographics | — | JPG or PNG | `/infographics/[slug].jpg` |
| Nav logo | — | PNG (transparent) | `/logo_1.png` |
| Favicon | 512×512px | PNG | `/Favicon.png` |

**Path note:** Articles live in `/blog/` — all asset references need `../` prefix:
- `../logo_1.png` ✓
- `../images/bg_[slug].jpg` ✓
- `../images/advocacy/[slug].jpg` ✓
- `../infographics/[slug].jpg` ✓
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

Two card treatments on the Deep Dives index:

| Card type | Class | Usage |
|-----------|-------|-------|
| Featured (top slot) | `.blog-card-featured` | Most recent published article |
| Grid card | `.blog-card` | Published articles in grid |

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