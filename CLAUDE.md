# CLAUDE.md — walkerpages repo

This file is the authoritative reference for how walkerops.com is built and hosted.
Read it before making any changes to this repo or advising on a hosting migration.

---

## Domain & registrar

- **Registrar:** Hostinger
- **Primary domain:** walkerops.com

---

## Hosting architecture

### walkerops.com — GitHub Pages

- Hosted on **GitHub Pages** via the `walkwalker28226/walkerpages` repo (this repo).
- The `CNAME` file at the repo root points GitHub Pages to `walkerops.com`.
- DNS is managed through Hostinger (the registrar); the A/CNAME records there point to GitHub Pages' servers.
- No build step — the site is **plain static HTML/CSS/JS**, committed directly. GitHub Pages serves the files as-is (`.nojekyll` is present to suppress Jekyll processing).
- All content lives under the repo root; there are no subdomains served from this repo.

### studio.walkerops.com — Hostinger

- Hosted directly on **Hostinger** (not GitHub Pages).
- This subdomain hosts **Canna-Chats artifacts and boards** — Claude-generated artifacts and shared boards for the Canna-Chats podcast.
- DNS for `studio.walkerops.com` is a separate record in Hostinger pointing to Hostinger's own hosting, not to GitHub.

---

## Repo file map

| Path | What it is |
|---|---|
| `index.html` | walkerops.com homepage — main marketing page, YouTube video section, contact |
| `call.html` | Booking / scheduling page |
| `law-and-professional-offices.html` | Industry-specific landing page |
| `restaurants-and-shops.html` | Industry-specific landing page |
| `robots.txt` / `sitemap.xml` | SEO files |
| `og-image.png` / `walkerops-favicon.svg` | Brand assets |
| `bill-walker-headshot.jpg` | Headshot used on the homepage |
| `video-1-job-nobody-hired-you-for.jpg` | Thumbnail asset for Video 1 |
| `CSM_You_Cant_Afford_to_Hire_captions.srt` | Caption file for the CSM YouTube video (English) |
| `CSM_You_Cant_Afford_to_Hire_captions_es.srt` | Caption file for the CSM YouTube video (Spanish) |
| `board-view/` | Standalone board-view page |
| `centerline/` | Centerline project pages (`index.html` + `guide/`) |
| `podcast-guest/` | Podcast guest display page — includes VDO.Ninja SDK and self-hosted fonts |
| `podcast-links/` | Podcast episode links page — includes `config.js` for per-episode data and self-hosted fonts |
| `podcast-rundown/` | Podcast rundown/show-notes page |
| `podcast-ticker/` | Podcast ticker/lower-third page |
| `CNAME` | Tells GitHub Pages to serve this repo at walkerops.com |
| `.nojekyll` | Disables Jekyll processing on GitHub Pages |
| `_config.yml` | Empty Jekyll config (placeholder) |

---

## YouTube video section (homepage)

The video section in `index.html` has two slots:

- **Latest video** — the most recently published Walker Ops YouTube video.
- **Earlier** — the video before it.

To rotate in a new video: update the `href`, `src` (thumbnail URL), `aria-label`, `alt`, title `<h2>`, and description `<p>` for both slots. YouTube thumbnail URL pattern:
- Large (1280×720): `https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg` (with `hqdefault.jpg` as the onerror fallback)
- Small (320×180): `https://i.ytimg.com/vi/VIDEO_ID/mqdefault.jpg`

---

## Hostinger migration notes

If migrating `walkerops.com` from GitHub Pages to Hostinger:

1. **What moves:** all files in this repo root get uploaded to Hostinger's web root (typically `public_html/`).
2. **What stays the same:** `studio.walkerops.com` is already on Hostinger — no change needed there.
3. **DNS change:** update the `walkerops.com` A record(s) in Hostinger DNS from GitHub Pages IPs (`185.199.108–111.153`) to the Hostinger server IP. Remove or repurpose the `CNAME` file (GitHub Pages uses it; Hostinger does not).
4. **No build step required:** the site is plain HTML — just upload the files and point the domain.
5. **Repo stays useful:** even after migrating, keeping this repo is worthwhile as version control and a deployment source. Hostinger supports deploy-from-GitHub via its Git panel.

---

## Key facts for Claude sessions

- This repo = walkerops.com only. `studio.walkerops.com` is not in this repo.
- No framework, no build pipeline, no package.json. Edit HTML directly.
- Fonts for podcast pages are self-hosted WOFF2 files inside each folder — no CDN dependency.
- The Walker Ops YouTube channel is `https://www.youtube.com/@WalkerOps`.
- Owner: Bill Walker (J. William Walker), Charlotte NC. Contact: BillWalker@outlook.com.
