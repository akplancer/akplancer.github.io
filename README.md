# Akanksha Pandey — Portfolio

Personal portfolio of **Akanksha Pandey, Product Designer** — live at **<https://akplancer.github.io/>**.

A static site built with [Astro](https://astro.build), coded from the Figma file *“portfolio projects”*
(Page 1). The desktop layout reproduces the Figma frames exactly; on phones and tablets the same
content re-flows into a mobile-friendly layout.

---

## Pages

Only these four frames on **Page 1** of the Figma file are part of the site — other pages and frames
in the file are working material and are not implemented.

| URL | What it is | Figma frame (exact name) | Node |
| --- | --- | --- | --- |
| `/` | Home — hero, about, *Projects* desktop, Procreate gallery, *Let’s connect* | `Portfolio- cover` | `562:1338` |
| `/work/referral/` | Case study: Refferal-Led growth | `refrreral case study` | `709:13811` |
| `/work/onboarding/` | Case study: Onboarding Case Study | `Onboarding case study` | `1016:1724` |
| `/work/filter-and-search/` | Case study: Filter & search case studies | `filter and search case study` | `1021:1988` |

Every page carries its frame in the markup (`data-figma-frame` / `data-figma-node`), and major
sections/images carry the Figma layer they come from (`data-figma="Frame 1814109461"` etc.), so any
element can be traced back to Figma from the browser's inspector.

**Copy is exactly as written in Figma**, including its spelling (e.g. “Refferal-Led growth”,
“A sneak peak into my procreate”). Where Figma applies *Case: Title case*, the source text is kept as
typed and the `.title-case` / `.cs-label` classes apply `text-transform: capitalize`.

On the home page, the **Projects** section is a Mac-style desktop: clicking an app in the dock
switches which case study the browser window previews, and clicking the window opens it.
Each case study’s **“← Back to desktop”** link returns to that section with the same case selected
(`/?case=<slug>#projects`).

---

## Quick start

Requires **Node.js 22.22+**.

```sh
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # production build into dist/
npm run preview   # serve dist/ locally to check the production build
```

---

## Project structure

```
.
├── .github/workflows/deploy.yml   # builds & deploys to GitHub Pages on every push to main
├── public/                        # copied as-is: favicon, social preview image, résumé PDF
├── scripts/build-assets.mjs       # regenerates src/assets from raw Figma exports (see below)
└── src/
    ├── assets/                    # all images (PNG sources; optimised at build time)
    │   ├── home/  referral/  onboarding/  filter/  case/
    ├── components/
    │   ├── Pic.astro              # responsive image placed at Figma coordinates (AVIF + WebP)
    │   ├── home/                  # HeroAbout, Projects, Procreate, Connect
    │   └── case/                  # CaseHero, Objective (starred chips), Scatter (art + labels),
    │                              # Shot (a phone screen with its italic caption)
    ├── data/
    │   ├── site.ts                # name, email, LinkedIn, résumé link
    │   └── cases.ts               # case-study titles, colours, hero art, dock icons
    ├── layouts/
    │   ├── Base.astro             # <head>, meta/SEO tags, fonts
    │   └── Case.astro             # shared case-study frame (back link, hero, footer nav)
    ├── pages/                     # one file per route (see table above)
    └── styles/
        ├── global.css             # tokens, reset, the stage layout system
        └── case.css               # shared case-study styles
```

---

## How the layout works

The design is a fixed 1280 px-wide Figma canvas, so the site uses a small **“stage”** system
(defined in `src/styles/global.css`):

- **Desktop (≥ 1024 px):** every section is a `.stage`. Its children carry the Figma position as CSS
  variables — `style="--x:485;--y:964;--w:616"` (design pixels) — and the `.p` class places them
  absolutely. A single unit, `--u = viewport width / 1280` (capped at 1920 px), scales all positions,
  sizes and font sizes, so the composition looks identical to Figma at any desktop width.
- **Mobile & tablet (< 1024 px):** the same markup drops the absolute positioning and falls back to a
  normal, mobile-first flow. Each component has its own `@media (max-width: 1023.98px)` block with
  phone-sized type, stacked sections, a menu button in the nav, two-column galleries, etc.

When adding something to a page, copy its X / Y / W from Figma’s properties panel into
`--x / --y / --w`, then give it a sensible mobile style.

---

## Common edits

| I want to… | Edit |
| --- | --- |
| Change the email, LinkedIn or résumé | `src/data/site.ts` (résumé file lives in `public/`) |
| Change a case study’s title, result line or colour | `src/data/cases.ts` |
| Edit case-study text | `src/pages/work/<case>.astro` |
| Edit a screen caption | the `lines={[…]}` of that `<Shot>` in `src/pages/work/<case>.astro` (one entry per Figma line) |
| Edit the home page sections | `src/components/home/*.astro` |
| Replace an image | overwrite the PNG in `src/assets/…` with the same name (export from Figma at 2×) |
| Add a new case study | add an entry to `src/data/cases.ts` (+ dock icon), then a page in `src/pages/work/` using the `Case` layout |

### Contact buttons

- **Gmail icon** → opens an email to the address in `site.ts`
- **LinkedIn** and **Resume** → open in a new tab
- **Let’s chat** (nav) → scrolls to the *Let’s connect* section

---

## Images & performance

- Source images are 2× PNG exports from Figma in `src/assets/`. At build time Astro converts them to
  **AVIF** (with **WebP** fallback) in several sizes, and the browser downloads only the size it needs.
- Everything below the first screen is lazy-loaded; the hero image loads with high priority and has a
  placeholder colour while it downloads.
- Typical transfer for the home page: **~0.35 MB** for the first screen on a phone, **~0.6 MB** on desktop.

## Testing

Layout was verified against fresh 1× exports of the four frames:
- **Desktop parity:** every page rendered at 1280 px wide in Chromium and WebKit, then pixel-diffed against
  Figma and every text line's position compared (all within 0–2 px).
- **Responsiveness:** 12 viewports from 320 px phones to 1920 px desktops (plus touch tablets) in
  Chromium and WebKit (Safari's engine), checking horizontal overflow, overlapping text, off-screen
  text, image loading and tap-target size.
- Fonts (Inter, Fasthand) are self-hosted via Fontsource — no external requests.

### Regenerating assets from Figma

`scripts/build-assets.mjs` crops and composes the images in `src/assets/` (hero illustrations, dock
icons, phone screens, …) from raw Figma exports. Those exports live in a local `_figma/` folder, which
is **not committed** because it is large. You only need this script when re-exporting from Figma;
for small changes just replace the individual PNG in `src/assets/`.

```sh
node scripts/build-assets.mjs   # needs _figma/ next to package.json
```

---

## Deployment

Hosted on **GitHub Pages** at <https://akplancer.github.io/>.

- `.github/workflows/deploy.yml` runs on every push to `main` (and can be run manually from the
  *Actions* tab): it builds the site with the official `withastro/action` and publishes it with
  `actions/deploy-pages`.
- Repository setting required (already done): **Settings → Pages → Source: GitHub Actions**.
- A deploy takes about 2–3 minutes; check progress in the repo’s **Actions** tab.

To publish a change:

```sh
git add -A
git commit -m "Describe the change"
git push
```

---

## Tech

[Astro 7](https://astro.build) · plain CSS (no framework) · `astro:assets` + sharp for images ·
Fontsource for fonts · GitHub Actions + GitHub Pages for hosting.
