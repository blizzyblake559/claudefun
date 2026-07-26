# VWM Works SEO Audit — vwmworks.com + blog.vwmworks.com

**Date:** July 26, 2026
**Business context:** Valley Welding & Machine Works (VWM Works), Fresno CA,
manufacturing food processing equipment since 1946. B2B, long sales cycle,
buyers are plant managers and engineers. Niche low-volume keywords where the
site already ranks; goal is to consolidate dominance, beat Key Technology and
GWI where it matters, and turn traffic into contact-form submissions.

**How this audit was produced:** the audit environment could not fetch the
live sites directly (network policy), so findings combine (a) what Google's
live index and SERPs actually show — which is ultimately what matters for
SEO — and (b) a runnable crawler (`vwm_seo_audit.py`) that completes the
hands-on technical checks from your own machine in ~2 minutes. Items marked
**[verify with script]** or **[verify in GSC]** are exactly that.

---

## Executive summary

**The good news:** the content foundation from your redesign is real, and you
already own the raisin/prune/peach cluster in Google — `/processing-lines/advanced-raisin/`
ranks ~#3 for "raisin processing machinery" and your prune page takes two
page-1 slots for "prune processing equipment," with only Urschel and Alibaba
noise above you.

**Three things are capping everything else:**

1. **The redesign never consolidated URLs.** Google currently indexes FOUR
   layers of duplicates: www vs non-www, old numeric `/productlines/14`-style
   URLs (which still outrank your new Vi-PRO page for "vibratory"), the same
   products under 2–3 different slugs (two peach pages, two elevator pages,
   three capper URLs...), and trailing-slash variants. Your link equity —
   the one thing a 1946 company has that competitors can't buy — is split
   across all of them.

2. **Title tags are brand-first, and it's costing you exactly the SERPs you
   should own.** "Home - Valley Welding and Machine Works" says nothing to
   Google. Meanwhile GWI — Ghazarian Welding Inc., a welding shop **three
   miles from you** that cloned your product line down to the names
   (their "Ultra-VAC" vs your Super Vac, their "G-FLEX" vs your VI-PRO) —
   outranks you on "food processing equipment Fresno," "vibratory elevator,"
   and air-separator queries using nothing but keyword-first templated
   titles. They have **zero** backlinks, zero press, zero associations.
   On-page fixes alone likely flip most of those SERPs.

3. **Almost no off-site footprint.** No ThomasNet, IQS Directory, or PMMI
   ProSource listings (directories that rank page-1 for your money
   keywords), duplicate/miscategorized Yelp, BBB, and ZoomInfo profiles, no
   trade-press mentions, and a blog where Google has indexed the author
   archive but almost none of the posts.

**One strategic alarm:** Duravant (Key Technology's parent) launched a
"Northern California Nut Processing Group" with a Sacramento demo center and
captured the "nut processing equipment California" SERP through coordinated
PR. That's a deliberate move into Central Valley territory, and VWM currently
has no SERP answer to it.

The prioritized plan is in §6. Rough shape: fix URL consolidation first
(week 1–2), rewrite titles and merge duplicate pages (week 2–4), claim the
free directory/profile layer (month 2), then run the content plays in §3–§5
where the SERPs are demonstrably soft.

---

## 1. Technical SEO

### 1.1 CONFIRMED: Legacy-site URLs still live in Google's index

Google's index currently contains **both** new-site URLs
(`https://vwmworks.com/contact/`, `https://vwmworks.com/`) **and old-site
URLs on the www subdomain**:

- `https://www.vwmworks.com/productlines/14` — "VWM VI-PRO® Vibratory Process"
- `https://www.vwmworks.com/productlines/15` — "VWM Raisin Processing"

This is the single most important technical finding. It means one or both of:

1. **Old URLs were never 301-redirected** when the redesign launched. If
   `/productlines/14` now 404s, every external link and 15 years of history
   pointing at those URLs is being thrown away — and for a 1946 company with
   a 15-year-old domain, that history *is* the moat.
2. **www vs non-www isn't consolidated.** If `www.` and bare-domain both
   resolve without a single 301 to one canonical host, Google splits signals
   between two copies of the site.

**Fix (do this first):**

- Pick one canonical host (recommend `https://vwmworks.com`, matching the new
  indexed pages) and 301 everything else to it — one hop, at the server/host
  level (hosting control panel or `.htaccess`), not via a WordPress plugin
  chain.
- Pull the full legacy URL list from the old GSC property / server logs, and
  map every old URL to its closest new page with a 301. Old
  `/productlines/N` pages → the matching new product page, never blanket-301
  to the homepage (Google treats mass home-redirects as soft-404s).
- The script tests this automatically (`LEGACY_URLS` list — add every URL
  you find in GSC).

### 1.2 Redirect matrix and chains **[verify with script]**

The script tests `http://`, `https://`, `www`, non-www — all four must land
on the canonical host in **one** hop. Elementor/WP sites frequently chain
`http://www → https://www → https://bare` (2 hops); collapse those.

### 1.3 robots.txt and XML sitemap **[verify with script]**

- robots.txt must exist, not block CSS/JS (old WP habit), and declare the
  sitemap.
- Confirm which SEO plugin generates the sitemap (Yoast/RankMath →
  `/sitemap_index.xml`) and that it contains only final, 200-status,
  indexable URLs. Submit in GSC (see `GSC-CHECKLIST.md`).
- Ghost generates `https://blog.vwmworks.com/sitemap.xml` automatically —
  submit that too (a Domain property in GSC covers the subdomain).

### 1.4 Site speed — the Elementor tax

PageSpeed couldn't be run from the sandbox (API quota), so run
https://pagespeed.web.dev/ on the homepage + one product page, mobile tab.
Elementor sites without tuning typically land 25–45 mobile performance. Your
buyers are engineers on desktop — so don't panic over mobile score itself —
but Google uses mobile Core Web Vitals as a (minor) ranking input and slow
LCP costs real visitors.

The Elementor playbook, in impact order:

1. **Hosting/caching layer:** a page cache + CDN (WP Rocket + Cloudflare,
   or hosting-level caching on Kinsta/WP Engine-class hosts). Biggest single
   lever.
2. **Images:** product photography is your proof-of-quality asset, so don't
   degrade it — serve WebP (ShortPixel/Imagify), explicit width/height
   (prevents CLS), lazy-load below the fold only. Hero image should be
   preloaded and NOT lazy-loaded (LCP).
3. **Elementor settings:** Elementor → Settings → Features: enable
   "Optimized Markup"/reduced DOM output and disable unused widgets/icon
   libraries (Font Awesome full set is a classic offender).
4. **Fonts:** host Google Fonts locally, max 2 families, `font-display: swap`.
5. **Plugins:** audit the plugin list; every builder addon pack loads CSS/JS
   sitewide. Remove what the redesign no longer uses.

Target: mobile LCP < 2.5s, CLS < 0.1. Desktop should be green.

### 1.5 Mobile responsiveness

Elementor handles breakpoints, but check by hand on a phone: tables of
equipment specs (classic overflow offender), oversized hero text, tap-target
spacing in the nav, and the contact form usability. Buyers may be on desktop,
but Google's crawler is mobile-only.

### 1.6 Schema markup **[verify with script — it lists JSON-LD per page]**

For a 79-year-old manufacturer, structured data is cheap credibility. The
stack that fits VWM:

- **Organization** (sitewide, via SEO plugin): name, alternateName "VWM
  Works", logo, foundingDate "1946", address, sameAs → LinkedIn, YouTube,
  GBP.
- **LocalBusiness** on the contact page: Fresno address, geo, phone, hours.
  You serve nationally but your Central-Valley identity is a differentiator —
  lean into it.
- **Product** schema on each equipment page (name, image, description,
  manufacturer, category). No prices needed — B2B; omit `offers` rather than
  faking it.
- **FAQPage** on pages where you add FAQ blocks (see content plan §5) —
  targets People-Also-Ask real estate.
- **BreadcrumbList** — usually free with Yoast/RankMach breadcrumbs enabled.
- **VideoObject** on pages embedding your YouTube equipment videos.

### 1.7 Indexability hygiene **[verify in GSC]**

Elementor redesigns commonly leave behind: indexable tag/category archives
with no content, attachment pages (`?attachment_id=`), old page revisions
published as drafts-turned-live, and `/elementor-###/` test pages. GSC →
Pages → "Not indexed" reasons will surface these; noindex or remove.

---

## 2. Indexation & on-page findings (from Google's live index)

### 2.1 What Google's index holds today (verified via live SERPs, July 26 2026)

**New-style URLs indexed** (non-www, trailing slash, "- Valley Welding and
Machine Works" suffix): homepage, /about/, /contact/, /services/,
/testimonials/, /products/ + 10 product pages (vi-pro-vibratory-conveyors,
dumpers, size-graders, elevators, de-clumpers, custom-solutions,
dehydration-systems, washing-systems, dewatering...), /processing-lines/ +
7 line pages (advanced-raisin, advanced-almond-and-nut,
prune-processing-machinery, two peach pages, pepper,
frozen-fruit-and-vegetable-processing).

**Legacy and duplicate URLs also indexed — the four duplication layers:**

| Layer | Evidence found in the live index |
|---|---|
| www vs non-www split | `www.vwmworks.com/productlines/14`, `/productlines/15`, `www.vwmworks.com/products/conveyors`, `/products/flavoring-coaters`, `/product/dry-capper-destemmer` coexist with non-www pages. Directories still cite `www.` as the official URL. |
| Old numeric URLs | `/productlines/14` ("VWM VI-PRO® Vibratory Process") and `/productlines/15` ("VWM Raisin Processing") appear in nearly every `site:` query — they're among Google's *strongest* URLs for your domain and outrank the new Vi-PRO page for "vibratory." Also `/productlines/21` and a Joomla-era `/about-us/accomplishments/17-vwm-advanced-processing-lines-...` URL. |
| Same product, 2–3 slugs | Capper: `/products/capper` + `/product/dry-capper-destemmer`. Scalping: `/scalping/` + `/product/scalping`. Elevators: `/products/elevators/` + `/products/elevators-for-food-processing/`. Almond: `/advanced-almond-and-nut/` + `/advanced-almond-and-nut-processing`. Peach: `/peach-processing-machinery/` + `/peach-processing-equipment-machinery/` + www `.../peach-processing-machinery-3` (which is titled **Prune** — a slug/title mismatch). Dehydration: `/products/dehydration-systems/` + `/productlines/21`. |
| Trailing-slash variants | `/products/metering-feeders`, `/products/capper` (no slash) indexed alongside slashed URLs. |

**What this means:** the old site's authority is still parked on URLs the new
site abandoned, and your new pages are competing against your own ghosts.
Until the 301/canonical work in §1.1 is done, every content improvement is
pouring water into a cracked bucket. This is also fixable in a week.

### 2.2 Title tags as Google shows them

- **The suffix eats the budget.** " - Valley Welding and Machine Works" is
  36 characters of a ~60-character display budget. Switch the suffix to
  " | VWM Works" (12 chars) sitewide and you triple the keyword space.
- **Generic titles on money pages:** "Home -...", "Contact -", "Services -",
  "Products -", "Dewatering -", "Elevators -". The homepage title contains
  neither "food processing equipment" nor "Fresno"/"California" — and the
  brand query "Valley Welding Machine Works Fresno" currently shows
  ChamberofCommerce, YellowPages, and Yelp **above** your own /about/ page.
- **Good ones to keep as the pattern:** "Vi-PRO Vibratory Conveyors -",
  "Peach Processing Equipment & Machinery -", "Advanced Almond and Nut
  Processing -".
- **Legacy pages have brandless one-word titles** ("Conveyors", "Flavoring
  Coaters", "Dry Capper Destemmer") — zero CTR value, and they're the
  duplicates that should be 301'd anyway.

### 2.3 Meta descriptions

Snippets appear scraped from body copy rather than written: the same "world
leader in design and manufacturing of Raisin Processing Machinery" sentence
surfaces across multiple URLs, and the contact page shows a generic
"wide variety of services nationwide" line. Write unique 140–160-char
descriptions per page (§ on-page rules below).

### 2.4 Blog (blog.vwmworks.com) — barely indexed

Across five targeted queries only three blog URLs surfaced: one post
("Custom Equipment Manufacturing Capability | VWM Works"), the /about/ page,
and — tellingly — the `/author/blake/` archive. A Vi-Pro Pistachio Sizer
post (Oct 2025) exists per snippet text but its URL never surfaced. Google is
indexing the author archive while skipping posts, which points to weak
internal linking / no submitted sitemap / low crawl priority on the
subdomain:

- Submit `https://blog.vwmworks.com/sitemap.xml` in GSC (Domain property).
- Noindex author/tag archive pages in Ghost (code injection:
  `<meta name="robots" content="noindex">` on `author`/`tag` contexts, or
  handle in theme).
- Link to new posts from the main site (footer "From the blog" block or a
  /resources/ page) so crawl paths exist from the strong domain.
- Unify the title separator (blog uses "| VWM Works", main site uses
  "- Valley Welding and Machine Works") — pick "| VWM Works" for both.
- Note: `vwmworks.beehiiv.com` (newsletter) also ranks on brand queries with
  a generic title — set its title/description properly and link it from the
  site so it reinforces rather than dilutes the brand SERP.

### 2.5 Brand SERP & local profile hygiene

Found on brand queries: LinkedIn (/company/vwmworks), Yelp (5.0★ but **two
duplicate listings**, one under "GARABEDIAN JOSEPH VALLEY WELDING & MA",
categorized as generic "Welder"), **two BBB profiles**, **two ZoomInfo
profiles**, ScrapMonster listing VWM as an **"Aluminum Company"**, Food
Processing Buyer's Guide listing under **"Peelers"**, Indeed 4.3★. NAP data
(2543 S Orange Ave, Fresno, (559) 268-5014) is at least consistent.
No YouTube channel and no ThomasNet/IQS/Kompass listings found at all.
Also note a name-collision risk: "Valley Welding & Machine Works LLC" in
Petersburg WV and "Valley Machine Works Inc" both appear on exact-name
queries — one more reason to consistently push the "VWM Works" brand +
Fresno entity signals (schema §1.6, GBP, consistent NAP).

### On-page rules to apply across the site

Once the script's CSV is in hand, apply these standards to every page:

- **Title:** `{Product} | {Category} — VWM Works` pattern, ≤60 chars,
  the product keyword first, brand last. One unique title per page.
  Homepage: not "Home —..." but something like
  "Food Processing Equipment Manufacturer Since 1946 | VWM Works".
- **Meta description:** 140–160 chars, written as a pitch to a plant
  engineer: what the machine does + proof ("manufactured in Fresno since
  1946") + soft CTA. Google rewrites weak ones; give it a strong default.
- **H1:** exactly one per page, containing the target phrase naturally.
  Elementor makes it easy to accidentally set multiple headings to H1 —
  the script counts them per page.
- **Heading hierarchy:** H2s for major sections (Specifications,
  Applications, Why VWM), H3s beneath. Don't pick heading levels for font
  size — set sizes in style, levels for structure.
- **Internal linking:** every product page should link sideways to related
  equipment (bin dumper page → vibratory conveyor page → the almond line
  page that uses both) and upward to its category. Blog posts must link to
  the relevant product page with descriptive anchor text ("vibratory
  conveyor for IQF lines", not "click here"). This is the cheapest ranking
  lever you control 100%.
- **Keyword density:** ignore it as a metric. Instead: the term appears in
  title, H1, first paragraph, one H2, image alt, and URL — then write for
  the engineer, not the crawler. In niches this small, Google leans heavily
  on entity/topic coverage, not repetition.

---

## 3. Keyword & SERP landscape

35 live SERPs were checked (July 2026). Positions are approximate organic
order.

### 3.1 Where VWM appears today

| Query | VWM position | Page ranking |
|---|---|---|
| raisin processing machinery | ~#3 | /processing-lines/advanced-raisin/ |
| raisin processing line | #3 | same |
| raisin processing equipment | ~#5 | same (GWI right behind at ~#6) |
| prune processing equipment | #3 **and** #5 | prune page + the mislabeled peach-slug page |
| peach processing equipment | #3, #7 | peach pages |
| frozen fruit processing equipment manufacturer | ~#6 | /processing-lines/frozen-fruit-and-vegetable-processing/ |
| almond processing line design | ~#8 | /processing-lines/advanced-almond-and-nut/ |

**Zero visibility on:** every vibratory conveyor query, every bin
dumper/tipper query, almond/walnut/pistachio *equipment* queries, all
IQF/frozen-vegetable queries, all California/Fresno geo queries, and custom
stainless queries. Given that vibratory conveyors and bin dumpers are core
products, this is the gap — and the SERPs (below) show most of it is soft.

### 3.2 Who wins the money SERPs

- **Key Technology holds #1–#3** on the category heads: food grade vibratory
  conveyor (#1), almond processing equipment (#1), dried fruit processing
  equipment (#1), frozen vegetable processing equipment (#2) — don't attack
  these head-on.
- **GWI ranks exactly where VWM should:** food processing equipment
  manufacturer California (~#5, the *only* manufacturer in a
  directory-filled SERP), food processing equipment Fresno (two slots),
  bin dumper food processing (~#6), vibratory elevator (#3), and their
  Ultra-VAC page is #1 for air-separator queries — a category your Super Vac
  created.
- **Directories (IQS, ThomasNet, ProSource, YellowPages) own huge chunks**
  of these SERPs — which is an opportunity twice over: get listed in them
  (a link + a presence inside a page-1 result), and recognize that a
  directory-heavy SERP means no strong manufacturer competes there yet.
- **Chinese exporters fill the nut/IQF SERPs** (pistachio, almond line,
  IQF fruit) — low-trust results a credible Fresno manufacturer can beat.
- **Proof it works at your scale:** Grossi Fabrication (a CA niche
  fabricator) holds 4 of the top 6 for "walnut processing equipment," and
  small manufacturers (KMG, MPD, Erie Technical) rank for "how does a
  vibratory conveyor work." The playbook exists.

### 3.3 Winnable target list

**Tier 1 — soft SERPs, buyer intent, product-page plays:**

1. `food processing equipment manufacturer California` — 4 of 7 results are
   directories; GWI proves a Fresno fabricator can rank
2. `food processing equipment Fresno` — nearly all YellowPages; your
   literal home turf and you're absent
3. `bin dumper food processing` / `bin tipper manufacturer` /
   `stainless steel bin dumper food grade` — Wikipedia, a distributor blog,
   and a **used-equipment dealer holding 6 of 10 slots**; no strong OEM
   anywhere
4. `pistachio processing equipment` — almost all Chinese exporters, for a
   California crop
5. `vibratory conveyor for nuts / almonds` — fragmented, no dominant US
   player, your exact sweet spot
6. `vibratory conveyor manufacturer California` — confused SERP (a
   parts-feeder company and used dealers)
7. Air separator / **Super Vac** queries — GWI's clone page is #1 while
   your existing page (`/products/vacuums-air-aspirators/`) omits "Super
   Vac" from its title, slug, and H1 and is invisible for the product's own
   name; retitle/optimize it and take the name back (see §4.2)
8. Raisin/prune/peach cluster — already ranking; on-page polish pushes to #1

**Tier 2 — need content + product page:** walnut processing equipment,
almond processing line, IQF-line *ancillary* equipment (freezer OEMs own the
freezer; nobody owns the infeed/dewatering/vibratory handling around it —
and your pages rank for "frozen fruit" phrasing but not "IQF" phrasing, so
add the term to titles/copy).

**Tier 3 — don't fight:** food grade vibratory conveyor, almond/dried-fruit
equipment heads (Key/TOMRA), optical sorting anything, used-equipment
queries (marketplaces own them).

### 3.4 Content gaps with proven demand (informational queries where
manufacturers your size already rank)

1. "How does a vibratory conveyor work" — snippet-format explainer
2. "Vibratory vs belt conveyor for food processing" — PFI ranks with
   exactly this; you have no comparison content
3. "The 4 types of bin dumpers" — a *distributor* (Solus) and CHL Systems
   rank with this; an OEM version with sanitary-design angle wins
4. Nut-line design guides (almond huller workings, pistachio line layout) —
   currently ranked by content from India and Ukraine, for California crops
5. Raisin cluster lock-in: "how raisins are processed," "raisin line
   capacity guide (4,000–70,000 lbs/hr)" — the #3 result today is a thin
   article
6. IQF ancillary: "preparing product for IQF freezing," "IQF freezer infeed
   and dewatering equipment" — nobody covers it
7. **Cost/pricing content:** "What does a vibratory conveyor cost?" — PFI's
   cost article ranks because enterprise vendors like Key structurally
   can't publish pricing. Neither can they talk lead times honestly. You
   can.
8. FAQ blocks for People-Also-Ask phrasings: "What is a food grade
   conveyor?", "What is a bin tipper used for?", "304 vs 316 stainless for
   food equipment?"

---

## 4. Competitor analysis

### 4.1 Key Technology (key.net)

**What they are in search:** a big, disciplined SEO machine. Every product
page title is keyword-templated ("Conveyor Line Tote Dumper & Food
Processing Bin Dumper", "Food Grade Vibratory Conveyors - Collection
Conveyor Manufacturer") with the brand name second. Their backlink engine is
a press-release pipeline: every product launch, tied to a trade show, gets
republished by Food Engineering, ProFood World, Powder & Bulk Solids, etc. —
5–10 authority links per release. Middle-funnel: white papers, case studies,
Vimeo application videos, and a "Service Advisor" maintenance blog aimed at
their install base and parts revenue. They repeat stat-anchored authority
claims everywhere ("30,000 vibratory conveyors installed", "80% of the top
20 food processors are customers").

**Where they're genuinely dominant (don't fight):** optical/digital sorting
(VERYX/COMPASS), potato/fries vertical, the category-head equipment terms in
§3.2, and anything Duravant cross-promotes.

**Their exploitable weaknesses:**

1. **No raisin/prune/dried-fruit line depth** — your strongest cluster is
   their blind spot. Deepen it before GWI does.
2. **Thin bin-dumper presence** — one tote-dumper page against a fragmented
   SERP.
3. **Structurally can't publish pricing or honest lead-time content** —
   enterprise vendor economics forbid it. PFI's cost article ranks because
   of this vacuum. This is your single most asymmetric content weapon.
4. **No Central Valley presence** — manufacturing in Walla Walla WA and
   Oregon; their "Northern California Nut Processing Group" (Key + PPM +
   WECO + Multiscan, Sacramento demo center) is a partnership webpage aimed
   at the Modesto-north nut belt, not boots on the ground in Fresno-south
   dried-fruit country. Counter it with a Central Valley positioning page —
   nobody serves your geography locally, and they know it's their gap.
5. **Video is Vimeo-only** — no YouTube presence at all. YouTube results
   for vibratory-conveyor queries are open territory, and you're already
   starting a channel.
6. **Their support pain is monetized, not solved** — their own blog runs
   spring-arm parts promos, and third-party aftermarket shops rank for
   "Iso-Flo replacement parts." There is search demand from frustrated Key
   owners: rebuild/retrofit/service content ("rebuilds for aging vibratory
   shakers, any brand, Central Valley response times") captures their
   install base at its unhappiest moment.

**What to copy from them:** keyword-templated titles; the press-release →
trade-press republish loop (it works at small scale too and those
publications republish vendor releases cheaply or free); application videos
per crop; stat-anchored claims (you have 80 years of installs — count
something and say it everywhere: machines built since 1946, lbs/hr in
service, years of average machine life).

### 4.2 GWI (gwi.global)

**Who they actually are:** Ghazarian Welding Inc. ("GW Innovations"/GWI),
2903 E Annadale Ave, Fresno 93725 — about three miles from your shop, same
zip code. Founded 1996 as a welding shop per BBB (so "30 years" counts the
welding shop, not 30 years of processing lines). No blog, no case studies,
no press, no YouTube, no association memberships found anywhere.

**The copycat evidence is documentable in their sitemap:** "Ultra-VAC" air
separator vs your Super Vac (same product concept, near-identical name, same
commodity list), "G-FLEX" vibratory conveyors vs your VI-PRO, a
"Complete Raisin Grading System" + "Complete Raisin Washing and Packing
System" split matching your line architecture at matching capacities
(2–25 t/hr ≈ your 4,000–55,000 lbs/hr), "cluster breakers" language
mirroring your De-Clumpers page. Their catalog mirrors yours nearly 1:1,
plus olive processing (which you don't emphasize — worth noting).

**How they beat you in SERPs despite all that:** pure templated on-page SEO.
Titles like "[Keyword] for Food Processing | GWI" and "...from California -
GWI" — keyword-first, location-injected, one page per commodity and
equipment type. That alone gets them: ~#5 for "food processing equipment
manufacturer California" (the only manufacturer in that SERP), two slots on
the Fresno query, #3 for vibratory elevators, #6 for bin dumpers, and **#1
for the air-separator category your Super Vac invented.** You beat them only
on raisin queries.

**Why they're beatable:** `"gwi.global" -site:gwi.global` returns
essentially nothing — zero earned mentions, zero backlinks, zero press.
Their entity is also fragmented (website says "GWI", every directory says
"Ghazarian Welding"). Their whole position is on-page SEO with no authority
behind it. Match their on-page discipline (which you should do anyway) and
add the authority layer they can't fake — real installs, real photos,
association links, trade press — and there's no contest a search engine can
see.

**Two urgent items specifically because of GWI:**
1. **Rebrand the existing Super Vac page for search.** The page exists —
   `/products/vacuums-air-aspirators/` — but its title ("Vacuums/Air
   Aspirators - Valley Welding and Machine Works"), slug, and (apparently)
   H1 never say "Super Vac," so Google barely associates the product name
   with it: even `site:vwmworks.com super vac` ranks it ~10th on your own
   domain, behind testimonials and legacy URLs. Meanwhile GWI's clone page
   is literally named "UVS/Ultra-VAC" in slug and title and ranks #1 for
   air-separator queries. Fix: retitle to something like "VWM Super Vac® —
   Air Separator / Pneumatic Aspirator for Food Processing | VWM Works",
   put Super Vac in the H1 and first paragraph, add Product schema with the
   name, consider a redirect-friendly slug like `/products/super-vac/`
   (301 the old slug), and add real photos/video of it running product.
   If Super Vac is trademarked, the ® in titles and schema helps entity
   disambiguation.
2. **Take the Fresno/Central Valley geo SERPs back** — a "Food Processing
   Equipment Manufacturer — Fresno, CA (Since 1946)" page plus GBP
   optimization. It is your origin story; right now it's their ranking.

### 4.3 Backlinks & authority (no-paid-tools view)

**Your current earned footprint:** American Pistachio Growers
associate-member page (a genuine association backlink GWI has no equivalent
of), PotatoPro profile, Food Processing Buyer's Guide (miscategorized under
"Peelers"), LinkedIn, Yelp, one FreshPlaza article. Plus auto-generated
scraper profiles (ZoomInfo ×2, Crunchbase, Explorium, ScrapMonster ×
miscategorized). **Absent entirely:** ThomasNet, IQS Directory, Kompass,
PMMI ProSource — i.e., the directories that literally rank page 1 for your
money keywords. No trade-press coverage found at all.

**Link/citation opportunities, prioritized (all free or membership-based —
no paid link buying):**

1. **ThomasNet** (free) — ranks for nearly every "[equipment] manufacturer"
   query; neither you nor GWI is listed; first mover wins
2. **IQS Directory** — its category pages rank page 1 for vibratory
   conveyors and bin dumpers
3. **PMMI ProSource** — ranked #2 in a vibratory conveyor SERP; requires
   PMMI membership
4. **WAPA** (Western Agricultural Processors Association) associate
   directory — regionally authoritative, exactly your buyers
5. **Almond Board / The Almond Conference exhibitor directory** + Grape,
   Nut & Tree Fruit Expo (Fresno fairgrounds) + World Ag Expo (Tulare)
   exhibitor pages — links plus literal buyer foot traffic
6. **Raisin/dried-fruit associations** — as the self-described world leader
   in raisin machinery, any RAC/dried-fruit supplier listing available
7. **Trade press PR pipeline** — Food Engineering, ProFood World,
   foodprocessing.com, National Nut Grower, PotatoPro (profile already
   exists — push news to it). They republish manufacturer releases; Key's
   entire link profile is built on this. One release per launch/install/
   trade show appearance.
8. **DirectIndustry, Making.com, vibratory-feeders.com** — niche
   directories observed ranking in your SERPs

**Profile hygiene (30 minutes each, do once):** merge the two Yelp listings
and fix the category (it's "Welder" with reviews about small welding jobs);
consolidate the two BBB profiles; merge the two ZoomInfo profiles; fix
ScrapMonster ("Aluminum Company") and Food Processing Buyer's Guide
("Peelers"); claim and complete the Google Business Profile with the food
processing equipment category, equipment photos, and posts.

---

## 5. Content strategy — blog, YouTube, LinkedIn

The strategic frame: **nobody impulse-buys a raisin processing line.** Search
traffic's job is (1) be findable at the exact moment an engineer is
speccing a project, and (2) be *already familiar* by then because they've
seen your content for months. Channels play different roles:

| Channel | Job | Cadence that's sustainable |
|---|---|---|
| Product pages | Convert: specs, photos, proof, RFQ form | Evergreen, improve quarterly |
| Ghost blog | Rank for problem/education queries; nurture | 1–2/month, deep not frequent |
| YouTube | Proof-of-build; the "boots on the ground" evidence GWI can't fake | 1–2/month, even rough |
| LinkedIn | Stay in front of known plant managers/engineers between projects | 2–3/week, lightweight |

### 5.1 The content moat GWI can't copy: the shop floor

Your stated edge over GWI is that they use renderings and you build real
iron. **Make the website structurally impossible to imitate with renders:**

- Every product page gets real fabrication/installation photos with
  descriptive alt text and captions naming the crop and process.
- A "Built by VWM" / projects section: one page per (anonymized if needed)
  install — crop, throughput, equipment list, photos. These become your
  long-tail landing pages ("almond hulling line installation") and your
  proof library for sales.
- YouTube: walkarounds of machines running product, weld-shop clips,
  before/after line rebuilds. Embed each video on the matching product page
  (VideoObject schema, §1.6). Video thumbnails of real equipment in SERPs
  are a differentiator renders can't match.

### 5.2 Blog (Ghost) — topic architecture

Write for the engineer's questions in the buying process, one pillar per
product family, each pillar linking to its product page:

- **Comparison/decision posts** (highest intent):
  "Vibratory vs. belt conveyors for food processing: where each wins",
  "What to spec in a bin dumper for almonds", "Sanitary design checklist for
  IQF fruit lines".
- **Process education** (tops of funnels, PAA targets): "How raisin
  processing lines work, stage by stage", "How does a vibratory conveyor
  move product?" — these also become YouTube scripts.
- **Buying-cycle content**: "Lead times, budgeting and planning a processing
  line retrofit", "Questions to ask any equipment manufacturer before you
  sign" (a quietly brutal post to write, since you win on support and
  proximity — set the evaluation criteria buyers use on your competitors).
- **Local/industry authority**: Central Valley crop-season notes, trade show
  recaps, customer-industry news commentary. Low search volume, high
  LinkedIn reuse value.

**Subdomain question:** `blog.vwmworks.com` on Ghost works, but a subdomain
shares authority with the main domain imperfectly. Given the main site is
WordPress anyway, the SEO-optimal setup is `vwmworks.com/blog/`. If moving
hosting is more friction than it's worth right now, keep Ghost but: (a)
cross-link aggressively both directions, (b) put the most commercially
valuable comparison content on the *main* domain as pages, and use the Ghost
blog for the educational/news layer, (c) revisit after the technical fixes
land. Don't let this question block publishing — content beats placement.

### 5.3 LinkedIn

Your buyers are literally named as an audience feature on LinkedIn (plant
managers, process engineers, food manufacturing). Repurpose, don't create:
every blog post → 3 posts (the hook, the checklist, the contrarian take);
every YouTube video → native-upload the best 60 seconds; every install →
photo post. Post from both the company page and a personal profile — the
personal one will outperform, and "family shop since 1946, our boots on your
floor" is a personal-voice story.

### 5.4 Conversion path (traffic → contact)

- RFQ/contact CTA on every product page, above the fold and at the bottom —
  "Talk to an engineer" converts better than "Contact us" for this audience.
- Contact page: name a human, show the Fresno shop, state response time.
  Plant engineers are evaluating whether you'll answer the phone in year 5;
  the contact page should feel like the opposite of Key's corporate funnel.
- Add a short-form option (phone + email + "what are you processing?") —
  long RFQ forms suppress first contact in long-cycle sales.
- Track form submissions and phone-link taps as conversions in GA4 so SEO
  work can eventually be judged in inquiries, not sessions.

---

## 6. Prioritized action plan

### Phase 0 — This week (technical foundation; highest ROI of anything here)

1. **Run `vwm_seo_audit.py`** from any normal computer; it verifies
   everything marked [verify with script] and gives you the per-page CSV.
2. **Set up the GSC Domain property** and work `GSC-CHECKLIST.md` — the
   legacy-URL list it produces feeds step 3.
3. **Consolidate hosts:** 301 `www.` → bare domain (single hop, at
   server/hosting level), confirm https enforced.
4. **301-map every legacy URL** found in §2.1 (all `/productlines/N`,
   `/product/...`, no-slash variants, Joomla-era paths) to its exact new
   equivalent. Never blanket-redirect to the homepage.
5. **Merge the duplicate pages:** pick one canonical URL each for
   capper, scalping, elevators, almond, peach, dehydration; 301 the others
   into it. Fix the peach-slug/prune-title mismatch page.
6. Submit both sitemaps (WordPress + Ghost) in GSC.

### Phase 1 — Weeks 2–4 (on-page)

7. **Sitewide title rewrite:** switch suffix to "| VWM Works", keyword-first
   patterns per §2.2. Homepage: "Food Processing Equipment Manufacturer —
   Fresno, CA | VWM Works" (or similar). Unique meta descriptions per page.
8. **One H1 per page**, heading hierarchy per the on-page rules (§2), fix
   image alt text (the script's CSV lists offenders per page).
9. **Schema rollout** per §1.6 (Organization + LocalBusiness + Product +
   Breadcrumb).
10. **Build the Super Vac® page** — real photos, video, spec table, FAQ.
11. **Build the Fresno/Central Valley page** ("...since 1946") targeting the
    geo SERPs GWI currently owns.
12. **Internal-link pass:** product ↔ related product ↔ processing line ↔
    blog posts, descriptive anchors.
13. Elementor performance work per §1.4; verify Core Web Vitals in GSC
    after 28 days.

### Phase 2 — Month 2 (authority layer)

14. Directory blitz per §4.3 (ThomasNet, IQS, ProSource, WAPA, expo
    directories) + profile hygiene fixes (Yelp/BBB/ZoomInfo duplicates,
    miscategorizations, GBP).
15. First press release (next install, trade show, or the pistachio sizer)
    → Food Engineering / ProFood World / National Nut Grower.
16. Fix Ghost blog indexing per §2.4 (sitemap, noindex archives, main-site
    cross-links).

### Phase 3 — Months 2–6 (content offensive, in order of SERP softness)

17. **Bin dumper cluster:** beef up /products/dumpers/ with keyword-first
    title + specs + FAQ; publish "The 4 types of bin dumpers for food
    processing" and "Stainless bin dumper buyer's guide."
18. **Vibratory cluster:** "How does a vibratory conveyor work" (snippet
    format), "Vibratory vs belt conveyors for food," "What does a vibratory
    conveyor cost?" — the cost article is the asymmetric weapon Key can't
    answer.
19. **Nut cluster:** pistachio processing equipment page (the SERP is
    Chinese exporters, for a CA crop), almond line design guide, walnut
    build-out.
20. **Raisin moat:** "How raisin processing works, stage by stage" +
    capacity guide, interlinked with the already-ranking line pages.
21. **IQF ancillary positioning:** add "IQF" phrasing to the frozen-fruit
    page titles/copy; publish "Equipment around the IQF freezer:
    infeed, dewatering, mixing."
22. **YouTube per §5.1** — machines running product; embed on matching
    pages; Key is Vimeo-only and GWI has renderings. This channel is
    uncontested.
23. **Aftermarket/service content** targeting aging competitor equipment
    owners: rebuilds, retrofits, Central Valley response times.

### Sequencing logic

Phase 0 stops the equity leak; nothing else compounds until it's done.
Phase 1 alone probably flips the GWI head-to-heads (their entire advantage
is on-page). Phase 2 adds the authority GWI can't match and Key won't
bother to contest at your scale. Phase 3 is rank acquisition in provably
soft SERPs, softest first.

---

## 7. Measurement

- **Weekly (5 min):** GSC Performance — impressions/clicks on non-branded
  queries; new contact submissions.
- **Monthly:** re-run `vwm_seo_audit.py`, findings count should trend to
  zero; GSC Pages report — legacy 404s should trend to zero as 301s land.
- **Quarterly:** rank spot-check the target keyword list (§3) manually in an
  incognito window + a rank tool if budget appears; review which blog posts
  earn impressions and double down.
- **The number that matters:** contact-form submissions attributable to
  organic, not traffic. In a niche this size, 30 extra visits that include
  two plant engineers beat 3,000 random visits.
