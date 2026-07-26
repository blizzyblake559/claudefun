# Google Search Console — 30-minute data pull

Some answers only Google has. If Search Console isn't set up yet, that is
priority #1: https://search.google.com/search-console — verify the **Domain**
property for `vwmworks.com` (covers www, non-www, and blog subdomain in one
property; DNS TXT record verification).

Work through these in order and note what you find:

## 1. Indexing → Pages (10 min)

- **"Not indexed" reasons list.** Look specifically for:
  - `Page with redirect` and `Not found (404)` — old-site URLs like
    `/productlines/14`. 404s here mean the redesign dropped URLs without 301s
    and any link equity those pages earned since ~2010 is evaporating.
  - `Duplicate without user-selected canonical` / `Duplicate, Google chose
    different canonical` — the www vs non-www split showing up in live
    search results suggests you may see these.
  - `Crawled - currently not indexed` — often thin/near-duplicate Elementor
    pages Google decided not to keep.
- Export the full list of excluded URLs. Every legacy URL with real history
  gets a 301 to its closest new equivalent (see AUDIT-REPORT.md §2).

## 2. Performance → Search results (10 min)

- Date range: last 12 months. Export queries.
- Sort by **impressions** (not clicks): queries with high impressions +
  position 5–15 are your fastest wins — pages Google already half-trusts.
- Filter queries containing: `vibratory`, `conveyor`, `bin`, `almond`,
  `raisin`, `IQF`, `dumper` — this is your real keyword list, better than any
  paid tool for a niche this narrow.
- Compare branded (`vwm`, `valley welding`) vs non-branded traffic share.
  Non-branded is the growth lever.
- Check the **Pages** tab: which URLs earn impressions but few clicks →
  rewrite those titles/descriptions first.

## 3. Legacy property check (2 min)

- If an old GSC property exists for `www.vwmworks.com` from the previous
  site, open it — its Pages report lists all old URLs Google still remembers.
  That's your definitive 301-mapping list.

## 4. Sitemaps (3 min)

- Submit the sitemap URL (the crawler script prints it — typically
  `/sitemap.xml` for Yoast/RankMath or `/wp-sitemap.xml` stock WordPress).
- Confirm "Success" status and that discovered URL count ≈ your real page count.
- Also submit the Ghost blog sitemap: `https://blog.vwmworks.com/sitemap.xml`.

## 5. Removals & security (1 min)

- Confirm nothing weird: no manual actions (Security & Manual Actions menu),
  no unexpected removal requests.

## 6. Core Web Vitals (2 min)

- Indexing → Core Web Vitals (mobile). If it shows "Poor" or "Needs
  improvement" URL groups, the field data confirms what PageSpeed lab tests
  suggest and the Elementor performance work in AUDIT-REPORT.md §1 moves up
  the priority list.

## 7. Links report (2 min)

- Links → Top linked pages / Top linking sites. Export both.
- Any strong external links pointing at **old URLs** (`/productlines/...`)
  make the 301 work urgent — those links currently dead-end.

Bring the exports back to the next audit round and the action plan gets
re-prioritized against real query data.
