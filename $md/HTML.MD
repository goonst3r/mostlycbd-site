# mostlyCBD — Site Page Template
**Scope:** Root-level pages using `style.css` (e.g., `index.html`, `blog.html`, `guide.html`, `action.html`)
**Canonical reference:** `blog.html`
**Last updated:** 2026-03-19

> This document is separate from `ARTICLE-TEMP.MD`, which covers self-contained blog article pages.
> Site pages use an external `style.css` and require CSS overrides for brand consistency.
> Article pages are fully self-contained with no external stylesheet.

---

## LOCKED ELEMENTS
*Identical on every site page. Copy-paste. Do not modify.*

---

### FONTS

Three fonts. No others, ever.

| Font | Use |
|---|---|
| `Libre Baskerville` | Headlines, pull quotes |
| `DM Sans` | Body prose, card content |
| `DM Mono` | Nav, labels, meta, badges, footer |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Remove any `Space Mono` or `Georgia` references — those belong to the old system.

---

### COLOR TOKENS

These are the brand values. Reference them as hardcoded hex in site page `<style>` blocks
(style.css uses different variable names — do not mix them).

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#F4F1EB` | page background |
| `--bg-alt` | `#EAE6DC` | alternate sections, footer |
| `--ink` | `#1C1B18` | primary text |
| `--ink-muted` | `#5A5750` | labels, meta, secondary text |
| `--rule` | `#C8C3B8` | borders, dividers |
| `--green` | `#3B6E52` | primary brand color |
| `--green-pale` | `#D4E7DC` | green callout background |
| `--amber` | `#C4692A` | concern / warning / hover |
| `--amber-pale` | `#F5E4D5` | amber callout background |
| `--red` | `#9B3030` | risk / danger |
| `--red-pale` | `#F2DCDC` | red callout background |

---

### INLINE STYLE BLOCK (required on every site page)

Paste this `<style>` block into `<head>`, **after** `<link rel="stylesheet" href="style.css">`.
It resets style.css conflicts and provides nav + footer CSS.

```html
<style>
  /* ─── style.css conflict resets ──────────────────────────── */
  /* style.css sets body { padding: 2rem } which boxes the nav away from edges */
  body { padding: 0; }

  /* style.css targets bare `nav` element with position:fixed and padding —
     override with display:block and padding:0 so .site-nav__inner handles layout */
  .site-nav { display: block; padding: 0; }

  /* ─── site nav ───────────────────────────────────────────── */
  .site-nav {
    background-image: linear-gradient(rgba(218,215,205,0.85), rgba(218,215,205,0.80)), url('images/bg_header.jpeg');
    background-size: cover;
    background-position: center;
    border-bottom: 1px solid rgba(52,78,65,0.12);
    position: sticky; top: 0; z-index: 100;
  }
  .site-nav__inner {
    display: flex; align-items: center; justify-content: space-between;
    max-width: 1020px; margin: 0 auto; padding: 0 24px;
    height: 64px; position: relative;
  }
  .site-nav__logo {
    font-family: 'DM Mono', monospace;
    font-size: 14px; font-weight: 500; letter-spacing: .04em;
    color: #1C1B18; text-decoration: none;
  }
  .site-nav__logo span { color: #3B6E52; }
  .site-nav__logo:hover { color: #C4692A; }
  .site-nav__links {
    list-style: none; display: flex; gap: 28px;
    align-items: center; margin: 0; padding: 0;
  }
  .site-nav__links a {
    font-family: 'DM Mono', monospace;
    font-size: 11px; letter-spacing: .07em; text-transform: uppercase;
    color: #5A5750; text-decoration: none; transition: color .15s ease;
  }
  .site-nav__links a:hover { color: #C4692A; }
  .hamburger {
    display: none; flex-direction: column; justify-content: space-between;
    width: 24px; height: 16px; background: none; border: none;
    cursor: pointer; padding: 0;
  }
  .hamburger span {
    display: block; height: 2px; background: #5A5750;
    border-radius: 1px; transition: all .25s ease;
  }
  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  @media (max-width: 680px) {
    .hamburger { display: flex; }
    .site-nav__links {
      display: none; position: absolute; top: 64px; left: 0; right: 0;
      flex-direction: column; align-items: flex-start; gap: 18px;
      background-image: linear-gradient(rgba(218,215,205,0.96), rgba(218,215,205,0.97)), url('images/bg_header.jpeg');
      background-size: cover; border-bottom: 1px solid rgba(52,78,65,0.12);
      padding: 20px 24px 24px;
    }
    .site-nav__links.open { display: flex; }
  }

  /* ─── site footer ─────────────────────────────────────────── */
  .site-footer {
    border-top: 1px solid #C8C3B8;
    padding: 40px 0 32px;
    background: #EAE6DC;
  }
  .site-footer__inner {
    max-width: 1020px; margin: 0 auto; padding: 0 24px;
    display: flex; justify-content: space-between; align-items: flex-start;
    flex-wrap: wrap; gap: 24px;
  }
  .site-footer__brand {
    font-family: 'DM Mono', monospace; font-size: 12px; color: #5A5750;
  }
  .site-footer__brand strong {
    display: block; font-size: 14px; color: #1C1B18; margin-bottom: 4px;
  }
  .site-footer__taglines {
    font-family: 'DM Mono', monospace; font-size: 11px; color: #5A5750;
    letter-spacing: .06em; text-align: right; line-height: 1.8;
    display: flex; flex-direction: column; align-items: flex-end; gap: 14px;
  }
  .site-footer__socials { display: flex; gap: 18px; align-items: center; }
  .site-footer__socials a {
    display: flex; color: #5A5750; text-decoration: none; transition: color .15s ease;
  }
  .site-footer__socials a:hover { color: #3B6E52; }
  .site-footer__socials svg { display: block; }
</style>
```

**Note on paths:** The nav and footer CSS above uses root-level image paths (`url('images/bg_header.jpeg')`).
For pages in subdirectories, adjust to `url('../images/bg_header.jpeg')`. Article pages (self-contained) use CSS variables, not hardcoded hex — this block is for site pages only.

---

### NAV BAR (root-level paths)

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
      <li><a href="https://www.reddit.com/r/mostlyCBD/" target="_blank" rel="noopener">Community</a></li>
      <li><a href="action.html">Action</a></li>
      <li><a href="https://shop.mostlycbd.com">Shop</a></li>
    </ul>
  </div>
</nav>
```

**Logo hover rule:** "mostly" and ".com" shift to amber on hover. "cbd" span stays green always.
Never add a hover override for the `<span>` — the partial color shift is intentional brand behavior.

**Path note:** Article pages (in `/blog/`) use `../index.html`, `../guide.html`, etc.
Root-level site pages use bare filenames as shown above.

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

## PAGE STRUCTURE

```
<head>
  [standard meta]
  [font link — three fonts]
  [GoatCounter script]
  <link rel="stylesheet" href="style.css">     ← keep for page content
  <link rel="icon" ...>
  <style>                                        ← add AFTER style.css link
    [conflict resets]
    [nav CSS]
    [footer CSS]
    [any page-specific overrides]
  </style>
</head>
<body>
  [NAV]                    ← locked
  [PAGE CONTENT]           ← existing page structure, unchanged
  [FOOTER]                 ← locked
  [page scripts]
</body>
```

**The inline `<style>` block must come after `<link rel="stylesheet" href="style.css">` so it wins cascade conflicts at equal specificity.**

---

## KNOWN style.css CONFLICTS

These rules in `style.css` conflict with the new nav and must be reset in the inline `<style>` block on every site page that gets the new nav.

| style.css rule | Problem | Fix |
|---|---|---|
| `body { padding: 2rem; }` | Boxes nav away from viewport edges | `body { padding: 0; }` |
| `nav { position: fixed; }` | Fights sticky positioning | `.site-nav { display: block; padding: 0; }` |
| `nav { padding: 16px clamp(...); }` | Adds unwanted padding to nav element | same as above |
| `nav { display: flex; }` | Overrides block flow; fights `.site-nav__inner` flex layout | same as above |
| `.hamburger` in style.css | Different transform values and display:block vs flex | New `.hamburger` rules in `<style>` block win by cascade order |

If new conflicts surface on other pages, document them here.

---

## VOICE & BRAND RULES
*(consistent across site pages and articles)*

- Write for a smart non-specialist. No jargon without a plain-language follow.
- State positions directly. "This is." — not "This may be."
- Name concerns before a critic can. Don't bury caveats.
- Never write: "it's important to note" / "interestingly" / "it should be said that."
- No equivocation in position or mission statements.
- Taglines are locked: **"Educate to Regulate."** and **"Focused. Functional. Fair."**
- Brand copy in footer is locked: "Natural cannabis advocacy. Balanced profiles. Hand-coded. GitHub Pages. No ads. No agenda but the evidence."

---

## PRE-PUBLISH CHECKLIST

- [ ] Font link updated to three-font system — Space Mono removed
- [ ] GoatCounter script uses `https://` (not `//`)
- [ ] Inline `<style>` block present and placed after `style.css` link
- [ ] `body { padding: 0; }` reset included
- [ ] `.site-nav { display: block; padding: 0; }` reset included
- [ ] Nav copied verbatim with correct path depth (root = bare filenames, `/blog/` = `../` prefix)
- [ ] Footer copied verbatim — brand copy and social links unchanged
- [ ] No `logo_1.png` image references in nav (replaced by text logo)
- [ ] No `<nav id="nav">` or `.nav-links` markup remaining (old system)
- [ ] Page title follows pattern: `[Page Name] | mostlyCBD`
