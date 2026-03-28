# Before / After: blog-fomo.html

This shows exactly what changes when you migrate an article from
an inline `<style>` block to `global.css`.

---

## HEAD — BEFORE

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The FOMO Pipeline | mostlyCBD Deep Dives</title>
  <!-- ... meta tags ... -->
  <script data-goatcounter="..." async src="..."></script>
  <link rel="icon" type="image/png" href="Favicon.png">
  <link rel="stylesheet" href="style.css" />          ← OLD
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --cream: #F5F0E8;
    --dark: #1A1208;
    --rust: #b84a2e;
    --green: #2D5016;
    --sage: #6B8F4E;
    --gold: #D4B44A;
    --brown: #8B7355;
    --muted: #7A6E5F;
    --thc-red: #b84a2e;
    --olive: #5B6B4A;
    --cbd-blue: #3B6E8F;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  .site-nav { margin-left: 0; margin-right: 0; }

  body {
    background: var(--cream);
    font-family: 'Inter', sans-serif;
    color: var(--dark);
    line-height: 1.7;
    padding: 0;
  }

  .page { max-width: 860px; margin: 0 auto; padding: 0 24px 80px; }

  .hero { border-top: 8px solid var(--green); padding: 56px 0 40px; ... }
  .hero::before { ... }
  .eyebrow { font-family: 'DM Mono', monospace; font-size: 0.7rem; ... }
  h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.8rem, 6vw, 4.4rem); ... }
  .hero h1 { ... max-width: none; animation: none; text-align: left; }
  h1 .accent, .hero h1 .accent { color: var(--rust); }
  .hero-dek { ... }
  .subtitle { font-family: 'DM Serif Display', serif; ... }
  .hero-meta { ... }
  .section { padding: 48px 0; border-top: 1px solid rgba(26,18,8,0.1); }
  .section-num { ... }
  .section-tag { ... }
  h2 { font-family: 'Bebas Neue', sans-serif; ... }
  h2 .accent { color: var(--rust); }
  p { font-size: 1rem; line-height: 1.75; margin-bottom: 20px; max-width: 680px; }
  .pull-quote { font-family: 'DM Serif Display', serif; ... }
  .stat-row { ... }
  .stat-block { ... }
  .stat-num { ... }
  .stat-num.green { color: var(--green); }
  .stat-num.gold { color: var(--gold); }
  .stat-label { ... }
  .alert-box { background: rgba(184,74,46,0.06); border-left: 4px solid var(--rust); ... }
  .callout-box { background: rgba(45,80,22,0.06); border-left: 4px solid var(--green); ... }
  .data-row { ... }
  .data-card { ... }
  .compare-grid { ... }
  .compare-box { ... }
  .compare-box.good::before { background: var(--green); }
  .compare-box.bad::before  { background: var(--rust); }
  .compare-title { ... }
  .policy-list { ... }
  .policy-list li { ... }
  .policy-list li::before { font-family: 'Bebas Neue', sans-serif; color: var(--sage); ... }
  .bottom-line { background: var(--dark); color: white; ... }
  .bottom-line__label { ... }
  .bottom-line h3 { ... }
  .bottom-line p { ... }
  .share-strip { ... }
  .share-strip__label { ... }
  .share-strip a, .share-strip button { ... }
  .share-strip .back-link { ... }
  .next-article-card { ... }
  .next-article-card .next-label { ... }
  .next-article-card .next-title { ... }
  .next-article-card .next-dek { ... }
  .section--tight { padding: 48px 0; }
  .footnotes { padding: 32px 0; border-top: 1px solid #C8C3B8; }
  .footnotes__heading { ... }
  .footnotes ol { ... }
  .footnotes li { ... }
  .footnotes a { ... }
  .section a, .footnotes a { color: var(--sage); border-bottom: 1px dotted var(--sage); ... }
  .rule { border: none; border-top: 1px solid rgba(26,18,8,0.12); }
  #backToTop { position: fixed; ... }
  #backToTop.visible { opacity: 1; pointer-events: auto; }
  @media (max-width: 700px) { .stat-row { flex-direction: column; ... } ... }
  @media (max-width: 600px) { body { padding: 0; } }
</style>
</head>
```

**That entire 568-line `<style>` block is removed.**

---

## HEAD — AFTER

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The FOMO Pipeline | mostlyCBD Deep Dives</title>
  <meta name="description" content="The 2018 Farm Bill was supposed to legalize hemp. Instead it created the largest unregulated cannabinoid market in American history. Fear did the rest." />
  <meta property="og:title" content="The FOMO Pipeline | mostlyCBD" />
  <meta property="og:description" content="The 2018 Farm Bill was supposed to legalize hemp. Instead it created the largest unregulated cannabinoid market in American history. Fear did the rest." />
  <meta property="og:url" content="https://mostlycbd.com/blog-fomo.html" />
  <meta property="og:site_name" content="mostlyCBD" />
  <meta property="og:image" content="https://mostlycbd.com/images/bg_fomo.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@scrapthescript" />
  <meta name="twitter:image" content="https://mostlycbd.com/images/bg_fomo.jpg" />
  <script data-goatcounter="https://mostlycbd.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
  <link rel="icon" type="image/png" href="Favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="global.css" />          ← NEW — one line replaces 568
</head>
```

No `<style>` block. No `<link rel="stylesheet" href="style.css">`. Just `global.css`.

---

## BODY — No HTML changes required

The class names used in the HTML are identical in `global.css`.
Every element in the body works as-is. Example:

```html
<!-- HERO — no changes -->
<div class="hero">
  <div class="eyebrow">FOMO, The Farm Bill &amp; The Unregulated Market</div>
  <h1>THE <span class="accent">FOMO</span> PIPELINE</h1>
  <div class="hero-dek">HOW FEAR OF MISSING OUT MEETS AN UNREGULATED MARKET —<br><span class="muted">AND WHO PAYS THE PRICE</span></div>
  <div class="subtitle">The 2018 Farm Bill was supposed to legalize hemp...</div>
  <div class="hero-meta">March 2026 · Cannabis Policy · mostlycbd.com</div>
</div>

<!-- STAT ROW — remove the inline style="margin-top: 0;" if desired,
     or keep it — inline per-instance overrides are still valid -->
<div class="stat-row" style="margin-top: 0;">
  <div class="stat-block">
    <div class="stat-num">10,000+</div>
    <div class="stat-label">Delta-8 poison control<br>incidents, 2021–2025</div>
  </div>
  <div class="stat-block">
    <div class="stat-num green">$28B</div>
    ...
  </div>
</div>
```

The only inline style to clean up is the one-off `style="margin-top: 0;"` on the first stat-row.
That's a legitimate per-instance override and can stay or move to the article's own small `<style>` block.

---

## SAME PATTERN — ALL ARTICLES

Apply this to each article file:

| File | Action |
|---|---|
| `blog-fomo.html` | Remove `<style>` block, replace `style.css` link with `global.css` |
| `blog-mentalhealth.html` | Remove `<style>` block, replace `style.css` link with `global.css` |
| `blog-rfer-deep-dive.html` | Remove `<style>` block (includes nav+footer duplication), add `<link rel="stylesheet" href="global.css">` |
| `blog-training-gap.html` | Remove `<style>` block, replace `../style.css` link with `global.css` |
| `blog-akathisia.html` | Remove `style.css` + `style-blog.css` links, add `global.css` |
| `blog-als.html` | Remove `<style>` block, replace links with `global.css` |
| `blog-regulation-gap.html` | Remove `<style>` block, replace links with `global.css` |
| `blog-hearst-anslinger.html` | Remove `style.css` + `style-blog.css` links, add `global.css` |
| `blog-ecs-system.html` | Remove `style.css` + `style-blog.css` links, add `global.css` |
| `index.html` | Remove `<style>` block + `style.css` link, add `global.css` |
| `blog.html` | Remove `<style>` blocks + `style.css` link, add `global.css` |
| `guide.html` | Remove `<style>` block + `style.css` link, add `global.css` |
| `rfer.html` | Replace `style.css` link with `global.css` |
| `research.html` | Remove `<style>` block + `style.css` link, add `global.css` |
| `action.html` | Add `global.css` |
