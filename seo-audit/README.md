# VWM Works SEO Audit Kit

This folder contains the full SEO audit for vwmworks.com + blog.vwmworks.com,
plus a runnable technical crawler.

| File | What it is |
|---|---|
| `AUDIT-REPORT.md` | The full audit: findings, competitor analysis, prioritized action plan, content strategy |
| `vwm_seo_audit.py` | Zero-dependency technical crawler — run it from your own machine |
| `GSC-CHECKLIST.md` | 30-minute Google Search Console walkthrough to pull the data only Google has |

## Running the technical crawler

The audit sandbox couldn't reach the live site directly (network policy), so
the hands-on technical checks are packaged as a script. Any computer with
Python 3.8+ works — no installs needed:

```bash
python3 vwm_seo_audit.py
```

It will:

1. Fetch and validate `robots.txt` (crawl blocks, sitemap directive)
2. Discover and parse your XML sitemap(s)
3. Crawl every sitemap URL and record: HTTP status, redirect hops, title +
   length, meta description + length, meta robots, canonical, H1 count/text,
   H2 count, word count (flags thin pages under 300 words), image alt-text
   coverage, and JSON-LD schema types
4. Test the www / non-www / http / https redirect matrix
5. Spot-check legacy URLs from the old site (`/productlines/14`, etc. — edit
   the `LEGACY_URLS` list at the top to add more from Search Console)
6. Check every internal link found on crawled pages for 404s
7. Optionally pull PageSpeed scores: `PSI_API_KEY=yourkey python3 vwm_seo_audit.py`
   (free key from https://developers.google.com/speed/docs/insights/v5/get-started),
   or just run https://pagespeed.web.dev/ by hand

Outputs land next to the script:

- `seo_audit_pages.csv` — every page with every extracted field (open in Excel)
- `seo_audit_report.md` — findings sorted critical-first

Run it for the blog too:

```bash
python3 vwm_seo_audit.py https://blog.vwmworks.com
```

Re-run after each batch of fixes to confirm the finding count drops.
