#!/usr/bin/env python3
"""
VWM Works technical SEO audit script.

Zero-dependency (Python 3.8+ stdlib only). Run from any machine with
normal internet access:

    python3 vwm_seo_audit.py                      # audits vwmworks.com
    python3 vwm_seo_audit.py https://example.com  # audit another site
    PSI_API_KEY=xxxx python3 vwm_seo_audit.py     # also run PageSpeed API

Checks: robots.txt, sitemap discovery, per-page status/redirects, title,
meta description, meta robots, canonical, H1 structure, image alt text,
word count (thin pages), JSON-LD schema types, internal broken links,
www/non-www/http/https redirect matrix, legacy-URL redirect spot checks.

Outputs:
    seo_audit_pages.csv    - one row per page with all extracted fields
    seo_audit_report.md    - human-readable findings summary
"""

import csv
import json
import os
import re
import ssl
import sys
import urllib.request
import urllib.parse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from xml.etree import ElementTree

SITE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://vwmworks.com"
HOST = urllib.parse.urlparse(SITE).netloc.removeprefix("www.")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 VWM-SEO-Audit")
THIN_PAGE_WORDS = 300
MAX_WORKERS = 8
CTX = ssl.create_default_context()

# Legacy URLs from the pre-redesign site that MUST 301 to new pages.
# Add any old URLs you know of (from Search Console coverage report).
LEGACY_URLS = [
    # numeric old-CMS paths still in Google's index (July 2026)
    "/productlines/14",
    "/productlines/15",
    "/productlines/21",
    "/productlines",
    "/about-us/accomplishments/17-vwm-advanced-processing-lines-achieve-300-line-speed-increase",
    # duplicate-slug variants that should 301 to one canonical page
    "/products/conveyors",
    "/products/flavoring-coaters",
    "/products/capper",
    "/product/dry-capper-destemmer",
    "/product/scalping",
    "/products/metering-feeders",
    "/products/elevators-for-food-processing/",
    "/processing-lines/advanced-almond-and-nut-processing",
    "/processing-lines/peach-processing-machinery-3",
]


def fetch(url, follow=True, timeout=25):
    """Return dict with status, final_url, chain, body (text) or error."""
    chain = []
    current = url
    for _ in range(8):
        req = urllib.request.Request(current, headers={"User-Agent": UA})
        try:
            resp = urllib.request.urlopen(req, timeout=timeout, context=CTX)
            body = resp.read(2_500_000)
            enc = resp.headers.get_content_charset() or "utf-8"
            return {"status": resp.status, "final_url": resp.url,
                    "chain": chain, "body": body.decode(enc, "replace"),
                    "error": None}
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308) and follow:
                loc = e.headers.get("Location")
                if not loc:
                    return {"status": e.code, "final_url": current,
                            "chain": chain, "body": "", "error": "redirect w/o Location"}
                chain.append((e.code, current))
                current = urllib.parse.urljoin(current, loc)
                continue
            return {"status": e.code, "final_url": current, "chain": chain,
                    "body": "", "error": f"HTTP {e.code}"}
        except Exception as e:
            return {"status": 0, "final_url": current, "chain": chain,
                    "body": "", "error": str(e)}
    return {"status": 0, "final_url": current, "chain": chain, "body": "",
            "error": "too many redirects"}


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.meta_description = ""
        self.meta_robots = ""
        self.canonical = ""
        self.h1 = []
        self.h2 = []
        self.links = []
        self.images_total = 0
        self.images_no_alt = 0
        self.jsonld_types = []
        self.og_title = ""
        self._stack = []
        self._in_jsonld = False
        self._jsonld_buf = ""
        self._text_parts = []
        self._skip_text = 0  # inside script/style

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"):
            self._skip_text += 1
            if tag == "script" and a.get("type", "").strip() == "application/ld+json":
                self._in_jsonld = True
                self._jsonld_buf = ""
        elif tag == "meta":
            name = (a.get("name") or a.get("property") or "").lower()
            content = a.get("content", "")
            if name == "description":
                self.meta_description = content
            elif name == "robots":
                self.meta_robots = content
            elif name == "og:title":
                self.og_title = content
        elif tag == "link" and a.get("rel", "").lower() == "canonical":
            self.canonical = a.get("href", "")
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "img":
            self.images_total += 1
            if not (a.get("alt") or "").strip():
                self.images_no_alt += 1
        if tag in ("title", "h1", "h2"):
            self._stack.append(tag)

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self._skip_text = max(0, self._skip_text - 1)
            if self._in_jsonld and tag == "script":
                self._in_jsonld = False
                try:
                    data = json.loads(self._jsonld_buf)
                    items = data if isinstance(data, list) else [data]
                    for it in items:
                        if isinstance(it, dict):
                            g = it.get("@graph", [it])
                            for node in (g if isinstance(g, list) else [g]):
                                t = node.get("@type")
                                if t:
                                    self.jsonld_types.extend(
                                        t if isinstance(t, list) else [t])
                except (json.JSONDecodeError, AttributeError):
                    pass
        if self._stack and self._stack[-1] == tag:
            self._stack.pop()

    def handle_data(self, data):
        if self._in_jsonld:
            self._jsonld_buf += data
            return
        if self._skip_text:
            return
        if self._stack:
            top = self._stack[-1]
            if top == "title":
                self.title += data
            elif top == "h1":
                if not self.h1 or self.h1[-1] is None:
                    self.h1.append(data.strip())
                else:
                    self.h1[-1] += data.strip()
            elif top == "h2":
                self.h2.append(data.strip())
        if data.strip():
            self._text_parts.append(data.strip())

    @property
    def word_count(self):
        return len(" ".join(self._text_parts).split())


def discover_sitemaps(robots_txt):
    maps = re.findall(r"(?im)^sitemap:\s*(\S+)", robots_txt or "")
    for guess in ("/sitemap.xml", "/sitemap_index.xml", "/wp-sitemap.xml",
                  "/sitemap-index.xml"):
        maps.append(SITE + guess)
    seen, out = set(), []
    for m in maps:
        if m not in seen:
            seen.add(m)
            out.append(m)
    return out


def parse_sitemap(url, depth=0):
    if depth > 3:
        return []
    r = fetch(url)
    if r["status"] != 200 or not r["body"].lstrip().startswith("<"):
        return []
    try:
        root = ElementTree.fromstring(r["body"].encode())
    except ElementTree.ParseError:
        return []
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    if root.tag.endswith("sitemapindex"):
        for loc in root.findall(".//s:sitemap/s:loc", ns):
            urls += parse_sitemap(loc.text.strip(), depth + 1)
    else:
        for loc in root.findall(".//s:url/s:loc", ns):
            urls.append(loc.text.strip())
    return urls


def is_internal(href, base):
    if href.startswith(("mailto:", "tel:", "javascript:", "#")):
        return False
    absu = urllib.parse.urljoin(base, href)
    return urllib.parse.urlparse(absu).netloc.removeprefix("www.") == HOST


def audit_page(url):
    r = fetch(url)
    row = {"url": url, "status": r["status"], "final_url": r["final_url"],
           "redirect_hops": len(r["chain"]), "error": r["error"] or ""}
    if r["status"] == 200 and r["body"]:
        p = PageParser()
        try:
            p.feed(r["body"])
        except Exception:
            pass
        row.update({
            "title": p.title.strip(),
            "title_len": len(p.title.strip()),
            "meta_description": p.meta_description.strip(),
            "meta_desc_len": len(p.meta_description.strip()),
            "meta_robots": p.meta_robots,
            "canonical": p.canonical,
            "h1_count": len([h for h in p.h1 if h]),
            "h1_text": " | ".join(h for h in p.h1 if h),
            "h2_count": len(p.h2),
            "word_count": p.word_count,
            "images": p.images_total,
            "images_missing_alt": p.images_no_alt,
            "schema_types": ",".join(sorted(set(p.jsonld_types))),
            "internal_links": [urllib.parse.urljoin(r["final_url"], h)
                               for h in p.links if is_internal(h, r["final_url"])],
        })
    return row


def main():
    print(f"Auditing {SITE} ...")
    findings = []

    # 1. robots.txt
    robots = fetch(SITE + "/robots.txt")
    print(f"robots.txt: HTTP {robots['status']}")
    if robots["status"] != 200:
        findings.append(f"CRITICAL: robots.txt returned {robots['status']}")
    elif re.search(r"(?im)^disallow:\s*/\s*$", robots["body"]):
        findings.append("CRITICAL: robots.txt contains 'Disallow: /' — site blocked from crawling")
    if robots["status"] == 200 and "sitemap" not in robots["body"].lower():
        findings.append("robots.txt has no Sitemap: directive — add one")

    # 2. redirect matrix
    print("Checking www/http redirect matrix ...")
    bare = SITE.replace("://www.", "://")
    www = bare.replace("://", "://www.")
    for variant in (bare.replace("https://", "http://"),
                    www.replace("https://", "http://"), www, bare):
        r = fetch(variant)
        hops = len(r["chain"])
        ok = r["final_url"].rstrip("/") in (bare, www) and r["status"] == 200
        print(f"  {variant} -> {r['final_url']} ({hops} hops, HTTP {r['status']})")
        if not ok:
            findings.append(f"Redirect problem: {variant} ends at {r['final_url']} HTTP {r['status']}")
        elif hops > 1:
            findings.append(f"Redirect chain ({hops} hops) from {variant} — collapse to a single 301")
    canonical_hosts = set()
    for variant in (www, bare):
        r = fetch(variant)
        canonical_hosts.add(urllib.parse.urlparse(r["final_url"]).netloc)
    if len(canonical_hosts) > 1:
        findings.append(f"CRITICAL: www and non-www resolve to different hosts {canonical_hosts} — pick one and 301 the other")

    # 3. legacy URL spot checks
    print("Checking legacy URLs ...")
    for path in LEGACY_URLS:
        for host in (bare, www):
            r = fetch(host + path)
            verdict = ("OK 301->new" if r["chain"] and r["status"] == 200 else
                       "404 (needs 301!)" if r["status"] == 404 else
                       f"HTTP {r['status']}")
            print(f"  {host}{path}: {verdict}")
            if r["status"] == 404:
                findings.append(f"Legacy URL {host}{path} returns 404 — add 301 redirect to the matching new page")
            elif r["status"] == 200 and not r["chain"]:
                findings.append(f"Legacy URL {host}{path} serves 200 without redirect — duplicate content risk")

    # 4. sitemap
    sitemap_urls = []
    for sm in discover_sitemaps(robots.get("body", "")):
        got = parse_sitemap(sm)
        if got:
            print(f"Sitemap {sm}: {len(got)} URLs")
            sitemap_urls = got
            break
    if not sitemap_urls:
        findings.append("CRITICAL: no XML sitemap found (tried robots.txt + common paths)")

    # 5. crawl pages
    pages = []
    if sitemap_urls:
        print(f"Crawling {len(sitemap_urls)} pages ...")
        with ThreadPoolExecutor(MAX_WORKERS) as ex:
            futs = {ex.submit(audit_page, u): u for u in sitemap_urls}
            for f in as_completed(futs):
                pages.append(f.result())
        pages.sort(key=lambda p: p["url"])

        titles = Counter(p.get("title", "") for p in pages if p.get("title"))
        descs = Counter(p.get("meta_description", "") for p in pages
                        if p.get("meta_description"))
        for p in pages:
            u = p["url"]
            if p["status"] != 200:
                findings.append(f"Sitemap URL not 200: {u} -> HTTP {p['status']}")
                continue
            if p["redirect_hops"]:
                findings.append(f"Sitemap lists redirecting URL: {u} ({p['redirect_hops']} hops) — sitemap should hold final URLs only")
            t = p.get("title", "")
            if not t:
                findings.append(f"Missing <title>: {u}")
            elif titles[t] > 1:
                findings.append(f"Duplicate title '{t[:60]}': {u}")
            elif p["title_len"] > 60:
                findings.append(f"Title too long ({p['title_len']} chars, truncates ~60): {u}")
            d = p.get("meta_description", "")
            if not d:
                findings.append(f"Missing meta description: {u}")
            elif descs[d] > 1:
                findings.append(f"Duplicate meta description: {u}")
            elif p["meta_desc_len"] > 160:
                findings.append(f"Meta description too long ({p['meta_desc_len']} chars): {u}")
            if p.get("h1_count", 0) == 0:
                findings.append(f"No H1: {u}")
            elif p.get("h1_count", 0) > 1:
                findings.append(f"Multiple H1s ({p['h1_count']}) — common Elementor issue, keep one: {u}")
            if "noindex" in p.get("meta_robots", "").lower():
                findings.append(f"NOINDEX page in sitemap: {u}")
            can = p.get("canonical", "")
            if can and can.rstrip("/") != p["final_url"].rstrip("/"):
                findings.append(f"Canonical mismatch: {u} -> canonical {can}")
            if p.get("word_count", 0) < THIN_PAGE_WORDS:
                findings.append(f"Thin page ({p.get('word_count', 0)} words): {u}")
            if p.get("images_missing_alt", 0) > 0:
                findings.append(f"{p['images_missing_alt']}/{p['images']} images missing alt text: {u}")
            if not p.get("schema_types"):
                findings.append(f"No JSON-LD schema: {u}")

        # 6. broken internal links
        print("Checking internal links ...")
        all_links = set()
        for p in pages:
            all_links.update(p.get("internal_links", []))
        all_links = {u.split("#")[0] for u in all_links} - {p["url"] for p in pages}
        broken = []
        with ThreadPoolExecutor(MAX_WORKERS) as ex:
            futs = {ex.submit(fetch, u, True): u for u in sorted(all_links)[:400]}
            for f in as_completed(futs):
                r = f.result()
                if r["status"] >= 400 or r["status"] == 0:
                    broken.append((futs[f], r["status"]))
        for u, s in sorted(broken):
            findings.append(f"Broken internal link (HTTP {s}): {u}")

    # 7. optional PageSpeed
    psi_key = os.environ.get("PSI_API_KEY")
    psi_summary = []
    if psi_key:
        for strategy in ("mobile", "desktop"):
            q = urllib.parse.urlencode({"url": SITE, "strategy": strategy,
                                        "key": psi_key, "category": "performance"})
            r = fetch(f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?{q}",
                      timeout=90)
            try:
                data = json.loads(r["body"])
                lr = data["lighthouseResult"]
                score = round(lr["categories"]["performance"]["score"] * 100)
                a = lr["audits"]
                psi_summary.append(
                    f"{strategy}: perf {score}/100, LCP {a['largest-contentful-paint']['displayValue']}, "
                    f"CLS {a['cumulative-layout-shift']['displayValue']}, "
                    f"TBT {a['total-blocking-time']['displayValue']}")
            except Exception as e:
                psi_summary.append(f"{strategy}: PSI failed ({e})")
    else:
        psi_summary.append("Set PSI_API_KEY env var for automated scores, or run "
                           "https://pagespeed.web.dev/ manually for mobile+desktop.")

    # write outputs
    if pages:
        cols = ["url", "status", "redirect_hops", "final_url", "title",
                "title_len", "meta_description", "meta_desc_len", "meta_robots",
                "canonical", "h1_count", "h1_text", "h2_count", "word_count",
                "images", "images_missing_alt", "schema_types", "error"]
        with open("seo_audit_pages.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
            w.writeheader()
            w.writerows(pages)

    sev = lambda s: 0 if s.startswith("CRITICAL") else 1
    findings.sort(key=sev)
    with open("seo_audit_report.md", "w", encoding="utf-8") as f:
        f.write(f"# Technical SEO audit — {SITE}\n\n")
        f.write(f"Pages crawled from sitemap: {len(pages)}\n\n")
        f.write("## PageSpeed\n\n" + "\n".join(f"- {s}" for s in psi_summary))
        f.write(f"\n\n## Findings ({len(findings)})\n\n")
        for x in findings:
            f.write(f"- {x}\n")
        if not findings:
            f.write("No issues detected by automated checks.\n")

    print(f"\nDone. {len(findings)} findings.")
    print("Wrote seo_audit_pages.csv and seo_audit_report.md")
    for x in findings[:25]:
        print(" -", x)
    if len(findings) > 25:
        print(f"   ... and {len(findings) - 25} more (see seo_audit_report.md)")


if __name__ == "__main__":
    main()
