"""Render real scraper outputs as professional lead-sheet screenshots (PII masked).

Run with the Playwright-enabled venv:
  internal-linking-agent/.venv/Scripts/python tools/render_sheets.py
"""
import csv, json, os, re, html, sys
from PIL import Image
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")
R = r"C:\Users\The Affinity Zone\Documents\Claude Code"
P = os.path.join(R, "ai-automation-portfolio")
OUT = os.path.join(P, "assets", "img", "leads")
TMP = os.path.join(P, "tools", "_sheets")
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)

E = html.escape
def rows(path):
    return list(csv.DictReader(open(path, encoding="utf-8-sig", newline="")))
def phone(p):
    p = (p or "").strip()
    return re.sub(r"\d{4}$", "••••", p) if p else ""
def email(e):
    e = (e or "").strip()
    if "@" not in e: return ""
    u, d = e.split("@", 1)
    return u[:1] + "•••@" + d
def person(n):
    parts = (n or "").split()
    if not parts: return ""
    return parts[0] + (" " + parts[-1][0] + "." if len(parts) > 1 else "")
def handle(u):
    u = (u or "").strip("@")
    return "@" + u[:3] + "•••" if u else ""
def clip(s, n):
    s = re.sub(r"\s+", " ", (s or "").replace("\u200f", "").replace("\u034f", "")).strip()
    s = re.sub(r"https?://\S+|www\.\S+", "[link]", s)
    s = re.sub(r"\+?\d[\d\s().\-]{7,}\d", "[phone hidden]", s)
    s = re.sub(r"[\w.+-]+@[\w-]+\.[\w.]+", "[email hidden]", s)
    s = re.sub(r"[^\w\s.,!?'’&@/:%+\-()#$\[\]]", "", s)
    return s if len(s) <= n else s[: n - 1].rstrip() + "…"
def pill(text, tone):
    return f'<span class="pill {tone}">{E(text)}</span>'
def score(v):
    try: v = int(float(v))
    except Exception: return E(str(v))
    tone = "g" if v >= 85 else "y" if v >= 60 else "r"
    return f'<span class="score {tone}">{v}</span>'

CSS = """
*{box-sizing:border-box}body{margin:0;font-family:Roboto,'Segoe UI',Arial,sans-serif;background:#f8fafd;color:#1f1f1f;width:1600px}
.top{display:flex;align-items:center;gap:14px;padding:12px 18px 6px;background:#f9fbfd}
.logo{width:34px;height:40px;border-radius:4px;background:#188038;position:relative}
.logo:after{content:"";position:absolute;inset:12px 8px 8px;border:2px solid #fff;border-radius:1px;background:linear-gradient(#fff,#fff) 50% 0/2px 100% no-repeat,linear-gradient(#fff,#fff) 0 50%/100% 2px no-repeat}
.title{font-size:18px}.menu{font-size:13.5px;color:#444;margin-top:2px;display:flex;gap:14px}
.share{margin-left:auto;background:#ece8df;color:#3d3829;border-radius:20px;padding:9px 20px;font-size:14px;font-weight:500}
.tool{height:40px;margin:4px 12px;border-radius:22px;background:#f1f0ec;display:flex;align-items:center;gap:18px;padding:0 18px;font-size:13px;color:#444}
.fx{display:flex;align-items:center;height:30px;border-top:1px solid #e1e3e1;border-bottom:1px solid #e1e3e1;background:#fff;font-size:13px}
.fx .ref{width:90px;padding-left:10px;border-right:1px solid #e1e3e1;color:#444}.fx .f{padding-left:12px;color:#5f6368}
table{border-collapse:collapse;table-layout:fixed;width:100%;background:#fff;font-size:13px}
th,td{border:1px solid #e1e3e1;padding:0 8px;height:30px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
thead tr.cols th{background:#f8f9fa;color:#5f6368;font-weight:400;font-size:12px;height:22px;text-align:center}
thead tr.hdr th{background:#2a2a2e;color:#fff;font-weight:600;text-align:left;height:34px}
td.n,th.n{width:44px;background:#f8f9fa;color:#5f6368;text-align:center;font-size:12px}
tbody tr:nth-child(even) td:not(.n){background:#f7f9fc}
.pill{display:inline-block;padding:2px 9px;border-radius:12px;font-size:12px;font-weight:500}
.pill.r{background:#fce8e6;color:#c5221f}.pill.g{background:#e6f4ea;color:#137333}.pill.b{background:#f1f0ec;color:#5c574f}.pill.y{background:#fef7e0;color:#9a6700}.pill.k{background:#f1f3f4;color:#3c4043}
.score{display:inline-block;min-width:34px;text-align:center;font-weight:700;border-radius:4px;padding:1px 6px}
.score.g{background:#ceead6;color:#0d652d}.score.y{background:#feefc3;color:#8a5a00}.score.r{background:#fad2cf;color:#a50e0e}
.tabs{display:flex;align-items:center;gap:4px;padding:6px 12px;background:#f9fbfd;border-top:1px solid #e1e3e1;font-size:13px;color:#444;position:fixed;bottom:0;left:0;right:0}
.tab{padding:7px 16px;border-radius:6px}.tab.on{background:#ece8df;color:#3d3829;font-weight:500}
.tab small{color:#5f6368;margin-left:6px}
"""

def sheet(slug, filename, menu_note, cols, widths, data, tabs, formula):
    letters = "ABCDEFGHIJKLMN"
    colgroup = '<col style="width:44px">' + "".join(f'<col style="width:{w}px">' for w in widths)
    head1 = '<tr class="cols"><th class="n"></th>' + "".join(f"<th>{letters[i]}</th>" for i in range(len(cols))) + "</tr>"
    head2 = '<tr class="hdr"><th class="n">1</th>' + "".join(f"<th>{E(c)}</th>" for c in cols) + "</tr>"
    body = "".join(f'<tr><td class="n">{i + 2}</td>' + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for i, r in enumerate(data))
    tabs_html = "".join(f'<span class="tab{" on" if i == 0 else ""}">{E(t)}<small>{E(c)}</small></span>' for i, (t, c) in enumerate(tabs))
    doc = f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="top"><div class="logo"></div><div><div class="title">{E(filename)}</div><div class="menu"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Data</span><span>Tools</span><span>Extensions</span><span style="color:#5f6368">{E(menu_note)}</span></div></div><div class="share">Share</div></div>
<div class="tool"><span>↶ ↷</span><span>100%</span><span>$ % .0 .00 123</span><span>Default</span><span>10</span><span><b>B</b> <i>I</i> <s>S</s></span><span>Filter views</span></div>
<div class="fx"><div class="ref">A1</div><div class="f">fx&nbsp;&nbsp;{E(formula)}</div></div>
<table><colgroup>{colgroup}</colgroup><thead>{head1}{head2}</thead><tbody>{body}</tbody></table>
<div class="tabs"><span style="padding:0 10px">＋ ☰</span>{tabs_html}</div></body></html>"""
    path = os.path.join(TMP, slug + ".html")
    open(path, "w", encoding="utf-8").write(doc)
    return path, max(420, 230 + 30 * len(data) + 48)

jobs = []

# 1. Google Maps no-website finder
r = rows(os.path.join(R, "no-website-leads", "output", "leads.csv"))
top = [x for x in r if x["site_class"] == "none"][:22]
jobs.append(("no-website-leads", sheet("no-website-leads", "No-Website Leads · 192 US cities x 120 niches", "Last edit: scraper run",
    ["Score", "Business", "Niche", "City", "State", "Phone", "Rating", "Reviews", "Website", "Source"],
    [70, 300, 170, 120, 60, 150, 70, 80, 120, 90],
    [[score(x["score"]), E(x["name"]), E(x["niche"]), E(x["city"]), E(x["state"]), E(phone(x["phone"])), E(x["rating"]), E(x["reviews"]), pill("No website", "r"), pill("Maps" if x["source"] == "maps" else x["source"].title(), "b")] for x in top],
    [("All leads", f"{len(r):,}"), ("Score A", f"{sum(1 for x in r if x.get('value') == 'A'):,}"), ("Unclaimed", f"{sum(1 for x in r if x.get('unclaimed') == '1'):,}")],
    "=SORT(FILTER(leads, site_class=\"none\"), score, FALSE)")))

# 2. Amex automotive priority
r = rows(os.path.join(R, "automotive-amex-leads", "output", "totalsync_priority_leads.csv"))
allauto = rows(os.path.join(R, "automotive-amex-leads", "output", "automotive.csv"))
jobs.append(("automotive-leads", sheet("automotive-leads", "Automotive Market Map · Texas", "Amex merchant grid sweep",
    ["Fit", "Business", "Segment", "City", "Phone", "Website", "Web presence", "Chain"],
    [70, 300, 190, 130, 150, 290, 140, 80],
    [[score(x["fit_score"]), E(x["name"]), pill(x["segment"].replace("_", " "), "b"), E(x["city"]), E(phone(x["phone"])), E((x["website"] or "")[:40]), pill(x["web_presence"].replace("_", " "), "g" if x["web_presence"] == "own_site" else "y"), "Yes" if x["is_chain"] else "No"] for x in r[:22]],
    [("Priority leads", f"{len(r):,}"), ("All merchants", f"{len(allauto):,}"), ("By segment", "")],
    "=QUERY(merchants, \"select * where fit_score >= 80 order by fit_score desc\")")))

# 3. LinkedIn buyer intent
r = [x for x in rows(os.path.join(R, "linkedin-leads-scraper", "output", "linkedin_project_leads.csv")) if not x["reject_reason"]]
def li_name(x):
    n = x["author_name"]
    return E(n) if "/company/" in x["profile_url"] else E(person(n))
jobs.append(("linkedin-leads", sheet("linkedin-leads", "LinkedIn Project Leads · buyer intent", "Qualified by intent rules",
    ["Author", "Intent", "Matched query", "Decision maker", "Post", "Email", "Site"],
    [210, 90, 210, 120, 560, 170, 140],
    [[li_name(x), pill("Buyer", "g"), E(x["source_query"] or x["keyword"]), pill("Yes", "g") if x["is_decision_maker"] == "True" else pill("Unknown", "k"), E(clip(x["post_text"], 95)), E(email(x["email"])), E(x["mentioned_website"])] for x in r[:22]],
    [("Qualified leads", str(len(r))), ("Rejected", "7"), ("Queries", "")],
    "=FILTER(posts, intent=\"buyer\", reject_reason=\"\")")))

# 4. Threads
t = [x for x in json.load(open(os.path.join(R, "threads lead generation scraper", "web_design_leads.json"), encoding="utf-8")) if str(x.get("is_lead")) == "True"]
t.sort(key=lambda x: -int(x.get("lead_score") or 0))
def reasons(v):
    v = v if isinstance(v, list) else re.findall(r"'([^']+)'", str(v))
    return "; ".join(v[:2])
jobs.append(("threads-leads", sheet("threads-leads", "Threads Web-Design Leads", "GraphQL capture + rules filter",
    ["Lead score", "Author", "Post", "Why it qualified", "Likes", "Replies"],
    [100, 150, 600, 470, 80, 90],
    [[score(int(x["lead_score"]) * 10), E(handle(x["author_username"])), E(clip(x["post_text"], 100)), E(clip(reasons(x["reasons"]), 80)), E(str(x["like_count"])), E(str(x["reply_count"]))] for x in t[:22]],
    [("Leads", str(len(t))), ("Rejected", "32"), ("Raw posts", "287")],
    "=FILTER(posts, is_lead=TRUE)")))

# 5. Facebook groups
f = rows(os.path.join(R, "fb_leads scraper", "facebook_leads.csv"))
f = [x for x in f if len(clip(x["post_content"], 200)) > 15 and not re.search(r"(\w ͏ ){5}", x["post_content"])]
jobs.append(("facebook-leads", sheet("facebook-leads", "Facebook Group Leads · website buyers", "Bootstrap JSON + GraphQL + DOM",
    ["Name", "Intent", "Matched keyword", "Post", "Source", "Extractor"],
    [170, 90, 170, 640, 330, 110],
    [[E(person(x["name"])), pill(x["intent"].title(), "g" if x["intent"] == "buyer" else "k"), E(x["matched_keyword"]), E(clip(x["post_content"], 105)), E(clip(x["source"], 50)), pill(x["extractor"], "b")] for x in f[:22]],
    [("Leads", str(len(f))), ("Groups", ""), ("Search", "")],
    "=UNIQUE(FILTER(posts, intent=\"buyer\"))")))

# 6. Meta Ad Library advertisers
m = rows(os.path.join(R, "facebook meta ads scraper", "out", "ai-automation", "leads.csv")) + rows(os.path.join(R, "facebook meta ads scraper", "out", "book-publishing", "leads.csv"))
m.sort(key=lambda x: -int(x["lead_score"] or 0))
jobs.append(("meta-ad-leads", sheet("meta-ad-leads", "Meta Ad Library · Advertiser Leads", "Service ads only",
    ["Score", "Advertiser", "Niche", "Services", "Longest run", "Active", "Platforms", "Best hook"],
    [70, 220, 140, 300, 110, 80, 250, 440],
    [[score(x["lead_score"]), E(x["advertiser"]), pill(x["niche"], "b"), E(clip(x["services"], 45)), E(x["longest_run_days"] + " days"), pill("Live", "g") if x["currently_active"] == "True" else pill("Ended", "k"), E(clip(x["platforms"].replace(";", ","), 40)), E(clip(x["best_ad_hook"], 70))] for x in m[:22]],
    [("Leads", str(len(m))), ("Qualified ads", "54"), ("Rejected ads", "1,126")],
    "=SORT(leads, lead_score, FALSE)")))

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1.25)
    for slug, (path, h) in jobs:
        pg.set_viewport_size({"width": 1600, "height": h})
        pg.goto("file:///" + path.replace("\\", "/")); pg.wait_for_timeout(200)
        png = os.path.join(TMP, slug + ".png")
        pg.screenshot(path=png)
        Image.open(png).convert("RGB").save(os.path.join(OUT, slug + ".webp"), "WEBP", quality=84, method=6)
        print("ok", slug)
    b.close()
