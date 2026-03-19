# mostlyCBD — Article Template
**Canonical reference:** `blog/akathisia.html`
**Last updated:** 2026-03-19

---

## LOCKED ELEMENTS
*Identical on every article. Copy-paste. Do not modify.*

---

### NAV BAR

```html
<nav class="site-nav" aria-label="Site navigation">
  <div class="site-nav__inner">
    <a href="../index.html" class="site-nav__logo">mostly<span>cbd</span>.com</a>
    <button type="button" class="hamburger" aria-label="Menu"
      onclick="this.classList.toggle('open');document.querySelector('.site-nav__links').classList.toggle('open')">
      <span></span><span></span><span></span>
    </button>
    <ul class="site-nav__links">
      <li><a href="../index.html">Home</a></li>
      <li><a href="../guide.html">Guide</a></li>
      <li><a href="../blog.html">Deep Dives</a></li>
      <li><a href="https://www.reddit.com/r/mostlyCBD/" target="_blank" rel="noopener">Community</a></li>
      <li><a href="../action.html">Action</a></li>
      <li><a href="https://shop.mostlycbd.com">Shop</a></li>
    </ul>
  </div>
</nav>
```

**Logo hover rule:** "mostly" and ".com" shift to amber on hover. "cbd" span stays green always.
Never add a hover override for the span — the partial color shift is intentional brand behavior.

---

### ADVOCACY SERIES BANNER

Only the category changes. "Advocacy Series" and the separator are locked.

```html
<div class="campaign-label">
  Advocacy Series &nbsp;·&nbsp; [CATEGORY]
</div>
```

**Category options:**
- `Endocannabinoid Science`
- `Functional Cannabis &amp; Neurology`
- `Cannabis Policy &amp; History`
- `Market &amp; Regulatory Reform`
- `Healthcare Access &amp; Equity`

---

### SOURCES & REFERENCES

Format, markup, and CSS are locked. Only content changes.

```html
<section class="footnotes section--tight">
  <div class="container">
    <div class="footnotes__heading">Sources &amp; References</div>
    <ol>
      <li>
        [Author Last], [First Initial], et al. "[Study Title in Title Case]."
        <em>[Journal Name]</em>, [Publisher if notable], [Year].
        <a href="[URL]" target="_blank" rel="noopener">→ [domain.com]</a>
      </li>
    </ol>
  </div>
</section>
```

**Citation rules:**
- Format: Author(s) → Title (quoted) → Journal (italicized) → Year → `→ domain` link
- All links point to primary sources: PubMed, journal DOI, National Academies, etc.
- Every factual claim in the article maps to a numbered footnote
- Minimum 5 sources. Always include at least one that names a concern or caveat — we show the full picture

---

### FOOTER

```html
<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__brand">
      <strong>mostlycbd.com</strong>
      Natural cannabis advocacy. Balanced profiles.<br/>
      Hand-coded. GitHub Pages. No ads. No agenda but the evidence.
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

### FONTS

Three fonts. No others, ever.

| Font | Use |
|---|---|
| `Libre Baskerville` | Headlines, section headings, pull quotes, position numbers |
| `DM Sans` | Body prose, position card content |
| `DM Mono` | Nav, kickers, section labels, meta, badges, footer, footnotes |

```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

---

### COLOR TOKENS

Copy verbatim into every article's `<style>` block. Never change values.

```css
:root {
  --bg:          #F4F1EB;   /* page background */
  --bg-alt:      #EAE6DC;   /* alternate sections, footer */
  --ink:         #1C1B18;   /* primary text */
  --ink-muted:   #5A5750;   /* labels, meta, secondary text */
  --rule:        #C8C3B8;   /* borders, dividers */
  --green:       #3B6E52;   /* primary brand color */
  --green-pale:  #D4E7DC;   /* green callout background */
  --amber:       #C4692A;   /* concern / warning */
  --amber-pale:  #F5E4D5;   /* amber callout background */
  --red:         #9B3030;   /* risk / danger */
  --red-pale:    #F2DCDC;   /* red callout background */
  --serif:       'Libre Baskerville', Georgia, serif;
  --sans:        'DM Sans', system-ui, sans-serif;
  --mono:        'DM Mono', monospace;
  --max:         760px;     /* article body width */
  --max-wide:    1020px;    /* nav / footer width */
}
```

---

## VARIABLE ELEMENTS
*These change per article.*

---

### `<head>` — Per-Article Meta

```html
<title>[Article Title] | mostlycbd.com</title>
<meta name="description" content="[1–2 sentences. Lead with topic. End with the takeaway or angle.]" />
<meta property="og:title" content="[Article Title] | mostlyCBD" />
<meta property="og:description" content="[One punchy sentence for social.]" />
<meta property="og:url" content="https://mostlycbd.com/blog/[slug].html" />
<meta property="og:site_name" content="mostlyCBD" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@scrapthescript" />
<meta property="og:image" content="https://mostlycbd.com/images/bg_[slug].jpg" />
<script data-goatcounter="https://mostlycbd.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
<link rel="icon" type="image/png" href="../Favicon.png">
```

---

### PAGE STRUCTURE (in order)

```
[NAV]                    ← locked
[CAMPAIGN LABEL]         ← category changes
[HERO]
[SECTION 1]  --bg        Starting point / definition
<hr class="rule" />
[SECTION 2]  --bg-alt    The architecture / pharmacology
<hr class="rule" />
[SECTION N]  --bg        Additional sections as content demands
<hr class="rule" />
...
[SECTION N]  --bg or --alt   Positions — always last content section
<hr class="rule" />
[SOURCES & REFERENCES]   ← locked format
[FOOTER]                 ← locked
```

Sections alternate `--bg` / `--bg-alt` strictly. Always divided by `<hr class="rule" />`.
Section count is flexible — add as many as the content requires. Alternation must stay clean regardless of count.

---

### HERO

```html
<header class="hero">
  <div class="container">
    <p class="hero__kicker">[2–6 words, lowercase — sets a scene, not a headline]</p>
    <h1 class="hero__headline">
      [Line 1: sharp, declarative, 4–7 words]<br/>
      <em>[Pivoting word or phrase — italic green]</em>
    </h1>
    <p class="hero__sub">
      [Sentence 1: define the problem plainly.]
      [Sentence 2: introduce the CBD angle or the structural gap.]
      [Sentence 3: what the reader gets from this piece.]
    </p>
    <div class="hero__meta">
      <div class="hero__meta-item"><strong>Topic</strong>[e.g. "Akathisia &amp; Cannabinoids"]</div>
      <div class="hero__meta-item"><strong>Sources</strong>[e.g. "PubMed · Springer · Frontiers"]</div>
      <div class="hero__meta-item"><strong>Position</strong>[e.g. "Educate to Regulate"]</div>
    </div>
  </div>
</header>
```

**Kicker:** A caption. Observational. Names a tension.
**Headline:** Sharp, specific, slightly provocative. `<em>` carries the argument.
**Sub:** Journalistic. Three sentences max. No filler.
**Meta:** Always Topic / Sources / Position — never fewer than three.

---

### SECTION WRAPPER

```html
<section class="section">               <!-- --bg (default) -->
<section class="section section--alt">  <!-- --bg-alt -->
  <div class="container">
    <p class="section__label">[2–4 word framing phrase]</p>
    <h2 class="section__heading">[Declarative — not a question]</h2>
    [content]
  </div>
</section>
```

Heading color modifiers (use when tone demands):
```html
<h2 class="section__heading section__heading--amber">  <!-- concern/warning -->
<h2 class="section__heading section__heading--red">    <!-- danger/risk -->
```

---

### CONTENT COMPONENTS

#### Definition Block — use once, Section 1 (science articles only)
Science and biology articles open Section 1 with a definition block. History/policy articles skip it — a stat grid or prose opener works better when there's no clinical term to define.

```html
<div class="definition">
  <div class="definition__term">[Term]</div>
  <div class="definition__phonetic">/ [phonetic] / &nbsp;·&nbsp; from [language]: [etymology]</div>
  <p>[What it is. What it is not. How it presents.]</p>
</div>
```

#### Stat Grid — 2 columns × N rows (use 3 or 4 cells)
Grid is always 2-column. 3 cells = one row with a gap; 4 cells = clean 2×2. Both work.

```html
<div class="stat-grid">
  <div class="stat-cell">
    <div class="stat-cell__num">[Number]</div>
    <div class="stat-cell__label">[What this means in plain terms]</div>
  </div>
  <div class="stat-cell">
    <div class="stat-cell__num">[Number]</div>
    <div class="stat-cell__label">[What this means in plain terms]</div>
  </div>
  <div class="stat-cell">
    <div class="stat-cell__num stat-cell__num--amber">[Number]</div>
    <div class="stat-cell__label">[Elevated concern]</div>
  </div>
  <div class="stat-cell">
    <div class="stat-cell__num stat-cell__num--red">[Number]</div>
    <div class="stat-cell__label">[Serious risk or failure]</div>
  </div>
</div>
```
Color logic: default green = baseline/favorable · amber = elevated concern · red = serious risk.
CSS: `grid-template-columns: 1fr 1fr;` (not auto-fit).

#### Mechanism Diagram — left = concern, right = favorable
```html
<div class="mechanism-wrap">
  <div class="mechanism-header">[Comparison title]</div>
  <div class="mechanism-body">
    <div class="mechanism-row">
      <div class="mechanism-cell mechanism-cell--left">
        <div class="mechanism-cell__label">[Left label]</div>
        [Explanation]
      </div>
      <div class="mechanism-arrow">⇄</div>
      <div class="mechanism-cell mechanism-cell--right">
        <div class="mechanism-cell__label">[Right label]</div>
        [Explanation]
      </div>
    </div>
    <div class="mechanism-vs">
      [One line naming what the comparison proves — <strong>key phrase bolded</strong>]
    </div>
  </div>
</div>
```

#### Pull Quote — one per article, place before the explanation not after
```html
<div class="pull-quote">
  <p class="pull-quote__text">"[Exact quote from peer-reviewed source. Most surprising sentence wins.]"</p>
  <p class="pull-quote__attr">— [Author] · [Journal], [Year] · [5–8 word study description]</p>
</div>
```

#### Callouts
Stoplight color system — green / amber / red. The icon label reinforces tone; color carries the signal.

```html
<!-- Amber: name the caveat — don't hide it -->
<div class="callout callout--amber">
  <div class="callout__icon">// NOTE</div>
  <div class="callout__heading">[Title that names the issue directly]</div>
  <p>[Explain and contextualize. This is where we show we've done the work.]</p>
</div>

<!-- Green: affirmative finding or brand position -->
<div class="callout callout--green">
  <div class="callout__icon">// FINDING</div>
  <div class="callout__heading">[Affirmative statement]</div>
  <p>[Supporting detail.]</p>
</div>

<!-- Red: serious risk, misdiagnosis, or harm -->
<div class="callout callout--red">
  <div class="callout__icon">// RISK</div>
  <div class="callout__heading">[Risk statement]</div>
  <p>[Plain-language explanation of the risk and its consequences.]</p>
</div>
```

Required CSS in article `<style>` block — scopes icon label style to non-green callouts only:
```css
.callout--amber .callout__icon,
.callout--green .callout__icon,
.callout--red .callout__icon {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.callout--amber .callout__icon { color: var(--amber); }
.callout--green .callout__icon { color: var(--green); }
.callout--red   .callout__icon { color: var(--red); }
```

#### Evidence Table
The table structure and CSS are locked. Column headers and badge labels adapt to the article type.

**Science/clinical articles** — columns: Finding / Signal / Context; badges: Favorable · Concern · Research gap
```html
<table class="evidence-table" aria-label="Evidence summary">
  <thead>
    <tr><th>Finding</th><th>Signal</th><th>Context</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>[What the study found — one plain sentence]</td>
      <td><span class="badge badge--green">Favorable</span></td>
      <td>[Journal, Year]</td>
    </tr>
    <tr>
      <td>[Concern finding]</td>
      <td><span class="badge badge--amber">Concern (context-specific)</span></td>
      <td>[Source + population/method caveat]</td>
    </tr>
    <tr>
      <td>[Gap]</td>
      <td><span class="badge badge--red">Research gap</span></td>
      <td>[Why the gap exists — usually Schedule I]</td>
    </tr>
  </tbody>
</table>
```
Always include at least one amber row and one red row. We don't cherry-pick.

**History/policy articles** — the same table can serve as a timeline or policy record. Adapt column headers and badge labels to match the content. Example columns: Year / What happened / Why it matters. Example badges: Documented · Active education gap · Active blockade. No Favorable badge needed when there's nothing favorable to report.
```html
<table class="evidence-table" aria-label="[Descriptive label]">
  <thead>
    <tr><th>Year</th><th>What happened</th><th>Why it matters</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>[Year]</strong></td>
      <td>[Event — one plain sentence]</td>
      <td>[Significance]</td>
    </tr>
    <!-- or with badges in col 2 for a policy record: -->
    <tr>
      <td>[Finding]</td>
      <td><span class="badge badge--red">Documented</span></td>
      <td>[Source, Year]</td>
    </tr>
  </tbody>
</table>
```

#### Nuance Grid — always 3 pairs
```html
<div class="nuance-grid">
  <div class="nuance-cell">
    <div class="nuance-cell__head nuance-cell__head--concern">What they say</div>
    <p>"[The claim as typically stated — in quotes.]"</p>
  </div>
  <div class="nuance-cell">
    <div class="nuance-cell__head nuance-cell__head--context">What the data shows</div>
    <p>[What the evidence actually shows. No quotes — this is our voice.]</p>
  </div>
  <!-- repeat for pairs 2 and 3 -->
</div>
```
Pairs: (1) stigma narrative vs. structural reality · (2) product narrative vs. pharmacological reality · (3) regulatory narrative vs. policy reality.

#### Position List — always last content section, count follows the content
```html
<section class="section">  <!-- or section--alt, depending on alternation -->
  <div class="container">
    <p class="section__label">Where we stand</p>
    <h2 class="section__heading">Positions. No hedging.</h2>
    <ul class="position-list">
      <li class="position-item">
        <span class="position-item__num">1</span>
        <div class="position-item__content">
          <strong>[Imperative verb + demand. e.g. "Reschedule cannabis federally."]</strong>
          <p>[2–3 sentences: what, why, what happens without it.]</p>
        </div>
      </li>
      <!-- remaining items -->
    </ul>
  </div>
</section>
```
**Heading is always "Positions. No hedging."** — no count in the heading. The number isn't the brand signal; the conviction is.

---

### VOICE RULES

- Write for a smart non-specialist. Define every clinical term.
- State positions directly. "This is." — not "This may be."
- Name concerns before a critic can. Amber callouts and red table rows exist for this.
- Never write: "it's important to note" / "interestingly" / "it should be said that."
- Pull quote = the most surprising sentence in the article. It leads — explanation follows.
- Position items open with an imperative verb: Reschedule. Fund. Mandate. Restrict. Regulate.
- No equivocation in position statements. "We believe" and "we think" don't appear here.

---

### PRE-PUBLISH CHECKLIST

- [ ] Nav copied verbatim, no modifications
- [ ] Campaign label has the correct category for this article's domain
- [ ] Hero: kicker + headline with `<em>` + 3-sentence sub + Topic / Sources / Position meta
- [ ] Sections alternate `--bg` / `--bg-alt` cleanly, each separated by `<hr class="rule" />`
- [ ] Evidence table has at least one amber and one red row
- [ ] Nuance grid has exactly 3 pairs
- [ ] Pull quote placed before its explanation
- [ ] Position list heading reads "Positions. No hedging." — no count in the heading
- [ ] Each position item opens with an imperative verb
- [ ] Every factual claim maps to a numbered footnote
- [ ] All footnote links use `→ domain` format and point to primary sources
- [ ] Footer copied verbatim, no modifications
- [ ] `bg_[slug].jpg` added to `images/`
- [ ] blog.html card added at top of Published list

---

### blog.html CARD
*Insert at the top of the Published list — newest article always first.*

```html
<a class="blog-card-featured" href="blog/[slug].html"
   style="background-image: linear-gradient(rgba(52,78,65,0.82), rgba(52,78,65,0.92)), url('images/bg_[slug].jpg');">
  <div class="blog-card-tag">[Category 1] &middot; [Category 2]</div>
  <h2>[Card headline]</h2>
  <p class="blog-card-desc">[2–3 sentence hook. Same voice as hero sub, slightly more forward-leaning.]</p>
  <div class="blog-card-meta">
    <span class="blog-meta-item">[Category 1] &middot; [Category 2]</span>
    <span class="blog-meta-item">~[N] min read</span>
    <span class="blog-read-btn">Read &rarr;</span>
  </div>
</a>
```
