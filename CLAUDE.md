# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for Axiom Gray (axiomgray.com), a Salesforce consulting firm. No build system — pure HTML files served directly. Deployed via GitHub Pages.

## Development

Serve locally with any static file server:
```
python3 -m http.server 3000
```

No build step, no package manager, no compilation. Edit HTML/CSS/JS files directly.

## Site structure

Every page is a self-contained HTML file with inline `<style>` blocks and all scripts referenced via CDN. There is no shared template or component system — changes to nav, footer, or theme must be applied to each file individually (use Python scripts for bulk edits).

| Path | Purpose |
|---|---|
| `index.html` | Homepage |
| `about/`, `approach/`, `services/`, `contact/`, `work/` | Main site sections |
| `blog/` | Individual blog posts + index; images live in `blog/images/` |
| `products/fieldwise/` | FieldWise Chrome extension product page + privacy policy |
| `articles/index.html` | Redirect stub → `/blog/` |
| `work/case-study-collections.html` | Redirect stub → `./` |
| `data/blog-posts.json` | Blog post metadata (title, date, slug, tags, read_time) |
| `css/theme.css` | Shared theme helper (minified) |
| `js/*.js` | Shared scripts: `axiom-os.js`, `command-palette.js`, `decipher.js`, `scan-reveal.js`, `theme.js` (all minified) |
| `assets/images/` | Salesforce Partner badge (PNG originals + WebP versions) |

## Design system

CSS variables defined in every page's inline `<style>`:
```css
--blueprint-bg: #050505   /* page background */
--navy: #1a1f2e           /* cards, nav */
--charcoal: #2d3142       /* secondary cards */
--gold: #c9a961           /* accent, CTA buttons */
--cream: #f8f6f1          /* body text */
--slate: #4f5d75          /* muted text, labels */
```

Typography: **Inter Tight** (headings/body) + **JetBrains Mono** (labels, `.axiom-label` class). Nav logo uses **Cormorant Garamond** + **DM Sans**. All loaded via Google Fonts with `preconnect` hints.

CDN dependencies (loaded in `<head>`):
- Tailwind CSS Play CDN — **must stay in `<head>` without `defer`** (deferring causes FOUC)
- GSAP + ScrollTrigger — use `defer`
- Lenis smooth scroll — use `defer` or `async`

## Navigation (canonical block)

All 15 HTML pages share an identical nav block using **root-relative paths** (`/approach/`, `/about/`, etc.) so the same HTML works at any directory depth. Nav order: **Home | Approach | About | Services | Work | Contact**.

When syncing nav or footer across all pages, use a Python script rather than editing files individually. The two redirect stubs (`articles/index.html`, `work/case-study-collections.html`) have no nav — skip them in bulk scripts.

## Footer Explore section

Matches the nav: **Approach | About | Services | Work | Contact** — root-relative paths, no Blogs link. Blog pages use different CSS classes (`text-zinc-400` instead of `color:var(--slate)`) and need a separate regex pass.

## Images

Badge images exist as both PNG (originals) and WebP (production). HTML files reference `.webp`. All non-hero images have `loading="lazy"`. Hero images (e.g., FieldWise icon in the product page hero) should not get `lazy`.

## Copy constraints

- **Never use "on time, on budget"** — these are lawsuit words. Use "without the noise" instead.
- Salesforce Partner badge images: `assets/images/salesforce-partner-badge-square.webp` (footer) and `salesforce-partner-badge-horizontal.webp` (about page differentiators).

## Adding a blog post

1. Copy `blog/template.html` → `blog/<slug>.html` and fill in content
2. Add entry to `data/blog-posts.json`
3. Add card to `blog/index.html` manually
4. Add any article images to `blog/images/`
