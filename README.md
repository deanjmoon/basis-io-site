# [basis-io] — landing page

Static one-page site. No build step, no dependencies: open `index.html` in a browser
and it works.

```
index.html              the page — all copy lives here
assets/css/styles.css   all styles
assets/js/main.js        scroll reveal (progressive enhancement only)
robots.txt
sitemap.xml
CLAUDE.md               working instructions for Claude Code — read this first
```

## Local preview

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy to GitHub Pages

Free on a personal account, custom domain and HTTPS included.

1. Create a **public** repo, e.g. `basis-io-site`.
2. Push these files to the **root** of the default branch:

   ```bash
   git init
   git add .
   git commit -m "Initial landing page"
   git branch -M main
   git remote add origin git@github.com:USERNAME/basis-io-site.git
   git push -u origin main
   ```

3. **Settings → Pages → Source:** *Deploy from a branch* → `main` / `/ (root)`.
   The site is live at `https://USERNAME.github.io/basis-io-site/` within a minute or two.

## Custom domain

1. Add a file named `CNAME` at the repo root containing just the domain:

   ```
   basis-io.com.au
   ```

2. At your registrar, point the apex at GitHub:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `USERNAME.github.io` |

3. **Settings → Pages** → enter the domain, then tick **Enforce HTTPS** once the
   certificate issues (usually under an hour).

## Before going live

Find and replace across all files:

- `REPLACE-WITH-DOMAIN` → the live domain
- `REPLACE-BOOKING` → the booking URL
- `support@REPLACE-DOMAIN` → the real support address
- `REPLACE-COMPANY-PAGE` → the LinkedIn company page slug

Then resolve everything marked `TODO(copy)` or `TODO(asset)` in `index.html`.
`CLAUDE.md` lists them all.

## Working on it with Claude Code

```bash
cd basis-io-site
claude
```

Opening prompt:

> Read CLAUDE.md, then list every TODO in index.html grouped by what I need to supply.

`CLAUDE.md` carries the design-system rules, the layout contract, the colour tokens and the
heading hierarchy — it is what keeps changes on-brand.
