import json, os, re, sys
from collections import Counter
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
R = r"C:\Users\The Affinity Zone\Documents\Claude Code"
P = os.path.join(R, "ai-automation-portfolio")
N8N = r"C:\Users\The Affinity Zone\Documents\Education\AI Squad Learning\n8n"
SHOTS = os.path.join(HERE, "shots")
MEDIA = r"C:\Users\The Affinity Zone\Videos\portflo vde and screenshts"

# ---------- images ----------
def webp(src, dst, maxw=1800):
    im = Image.open(src).convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=82, method=6)
    return im.size

imgs = {
    "ghl-multichannel-workflow": os.path.join(MEDIA, "ghl woorkflow screenshot.png"),
    "ghl-receive-dms": os.path.join(MEDIA, "ghl screesnhot 2.png"),
    "ghl-pipeline-onboarding": os.path.join(MEDIA, "ghl pipeline.png"),
    "ghl-pipeline-webinar": os.path.join(MEDIA, "ghl pipein.png"),
    "n8n-whatsapp-agent": os.path.join(MEDIA, "whatsapp agent.png"),
    "n8n-text-engine": os.path.join(MEDIA, "text engine.png"),
    "n8n-apollo-enricher": os.path.join(MEDIA, "appollo email finder.png"),
    "seo-suite-dashboard": os.path.join(SHOTS, "seo-dashboard.png"),
    "seo-suite-audit": os.path.join(SHOTS, "seo-audit.png"),
    "trading-agent-dashboard": os.path.join(SHOTS, "trading-dashboard.png"),
    "quant-verdict-sheet": os.path.join(SHOTS, "crypto-verdict.png"),
    "multimodal-search": os.path.join(R, "multimodal-image-search", "docs", "screenshot.png"),
    "localfix-home": os.path.join(R, "localfix", "docs", "assignment2", "prototype_screens", "d01_home.png"),
}
sizes = {}
for k, src in imgs.items():
    if os.path.exists(src):
        sizes[k] = webp(src, os.path.join(P, "assets", "img", "work", k + ".webp"))
    else:
        print("missing", src)
json.dump(sizes, open(os.path.join(HERE, "img_sizes.json"), "w"), indent=1)
print("images:", sizes)

# ---------- workflow sanitizer ----------
SECRET_PATTERNS = [
    (re.compile(r"sk-[A-Za-z0-9_\-]{16,}"), "YOUR_API_KEY"),
    (re.compile(r"(?i)bearer\s+[A-Za-z0-9._\-]{12,}"), "Bearer YOUR_TOKEN"),
    (re.compile(r"pit-[a-f0-9\-]{20,}"), "YOUR_GHL_PRIVATE_TOKEN"),
    (re.compile(r"eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}"), "YOUR_JWT"),
    (re.compile(r"(?i)\b(api[_-]?key|apikey|access[_-]?token|secret|password|token)=([A-Za-z0-9._\-]{12,})"), r"\1=YOUR_KEY"),
    (re.compile(r"https://docs\.google\.com/spreadsheets/d/[A-Za-z0-9_\-]{20,}"), "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID"),
    (re.compile(r"https?://[a-z0-9\-]+\.app\.n8n\.cloud"), "https://YOUR-INSTANCE.app.n8n.cloud"),
    (re.compile(r"https?://[a-z0-9\-]+\.supabase\.co"), "https://YOUR-PROJECT.supabase.co"),
    (re.compile(r"https?://[a-z0-9\-]+\.share\.zrok\.io"), "https://YOUR-N8N-HOST"),
    (re.compile(r"https?://n8n[a-z0-9\-.]*\.(?:com|io|net|agency)"), "https://YOUR-N8N-HOST"),
    (re.compile(r"[A-Za-z0-9._%+\-]+@(?!example\.)[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}"), "you@example.com"),
    (re.compile(r"\+\d{10,14}\b"), "+10000000000"),
]
SECRET_KEYS = re.compile(r"(?i)^(authorization|x-api-key|api[_-]?key|apikey|token|access_token|password|secret|client_secret)$")


def scrub_str(s):
    for pat, rep in SECRET_PATTERNS:
        s = pat.sub(rep, s)
    return s


def scrub(o):
    if isinstance(o, dict):
        if isinstance(o.get("name"), str) and SECRET_KEYS.match(o["name"].strip()) and isinstance(o.get("value"), str) and o["value"].strip():
            o = dict(o, value="YOUR_" + re.sub(r"\W", "_", o["name"].strip().upper()))
        out = {}
        for k, v in o.items():
            if k in ("credentials", "pinData", "webhookId", "instanceId", "staticData"):
                continue
            if SECRET_KEYS.match(k) and isinstance(v, str) and v.strip() and not v.startswith("={{"):
                out[k] = "YOUR_" + re.sub(r"\W", "_", k.upper())
                continue
            out[k] = scrub(v)
        return out
    if isinstance(o, list):
        return [scrub(x) for x in o]
    if isinstance(o, str):
        return scrub_str(o)
    return o


def slug(s):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:60]


NICE = {"lmChatOpenAi": "OpenAI", "openAi": "OpenAI", "lmChatAnthropic": "Claude", "lmChatGoogleGemini": "Gemini", "embeddingsGoogleGemini": "Gemini",
        "lmChatGroq": "Groq", "lmChatOpenRouter": "OpenRouter", "lmChatDeepSeek": "DeepSeek", "lmChatOllama": "Ollama", "lmChatAzureOpenAi": "Azure OpenAI",
        "vectorStoreQdrant": "Qdrant", "vectorStorePinecone": "Pinecone", "vectorStoreSupabase": "Supabase", "supabase": "Supabase", "vectorStorePGVector": "pgvector",
        "postgres": "Postgres", "postgresTool": "Postgres", "memoryPostgresChat": "Postgres", "redis": "Redis", "mySql": "MySQL", "mySqlTool": "MySQL",
        "googleSheets": "Sheets", "googleSheetsTool": "Sheets", "googleSheetsTrigger": "Sheets", "gmail": "Gmail", "gmailTool": "Gmail", "gmailTrigger": "Gmail",
        "googleCalendar": "Calendar", "googleCalendarTool": "Calendar", "googleDrive": "Drive", "googleDriveTrigger": "Drive", "googleDocs": "Docs", "googleAnalytics": "GA4",
        "whatsApp": "WhatsApp", "whatsAppTrigger": "WhatsApp", "telegram": "Telegram", "telegramTrigger": "Telegram", "telegramTool": "Telegram", "slack": "Slack",
        "slackTrigger": "Slack", "twilio": "Twilio", "twilioTrigger": "Twilio", "facebookGraphApi": "Meta Graph", "facebookTrigger": "Messenger", "linkedIn": "LinkedIn", "twitter": "X",
        "airtable": "Airtable", "airtableTool": "Airtable", "airtableTrigger": "Airtable", "notion": "Notion", "notionTool": "Notion", "hubspot": "HubSpot",
        "hubspotTrigger": "HubSpot", "salesforce": "Salesforce", "jira": "Jira", "jiraTool": "Jira", "clickUp": "ClickUp", "zoom": "Zoom", "zendesk": "Zendesk",
        "odoo": "Odoo", "bambooHr": "BambooHR", "wordpress": "WordPress", "reddit": "Reddit", "lemlist": "lemlist", "dataForSeo": "DataForSEO", "nocoDb": "NocoDB",
        "microsoftOutlook": "Outlook", "microsoftOutlookTool": "Outlook", "rssFeedRead": "RSS", "emailReadImap": "IMAP", "mcpClientTool": "MCP", "mcpTrigger": "MCP",
        "toolSerpApi": "SerpAPI", "hdwLinkedin": "LinkedIn", "youTube": "YouTube", "discord": "Discord", "stripeTrigger": "Stripe", "phantombuster": "Phantombuster",
        "dropcontact": "Dropcontact", "executeCommand": "FFmpeg", "woocommerceTool": "WooCommerce", "instagramTrigger": "Instagram", "lmChatMistralCloud": "Mistral"}
URLHINT = [("leadconnectorhq", "GoHighLevel"), ("api.vapi.ai", "Vapi"), ("retellai", "Retell"), ("deepgram", "Deepgram"), ("elevenlabs", "ElevenLabs"),
           ("apify", "Apify"), ("tavily", "Tavily"), ("perplexity", "Perplexity"), ("firecrawl", "Firecrawl"), ("graph.instagram", "Instagram"),
           ("llamaindex", "LlamaParse"), ("anthropic.com/v1", "Claude")]

def kind_of(t):
    s = t.split(".")[-1]
    lo = s.lower()
    if "trigger" in lo or s in ("webhook", "formTrigger", "chatTrigger", "executeWorkflowTrigger"):
        return "trigger"
    if s == "agent":
        return "agent"
    if lo.startswith("lmchat") or lo.startswith("embeddings") or s == "openAi" and "langchain" in t:
        return "model"
    if lo.startswith("memory") or "vectorstore" in lo or s == "memoryManager":
        return "memory"
    if lo.startswith("tool") or lo.endswith("tool") or s in ("mcpClientTool", "toolWorkflow", "toolHttpRequest", "toolCode"):
        return "tool"
    if lo.startswith("outputparser") or lo.startswith("textsplitter") or s in ("documentDefaultDataLoader",):
        return "parser"
    if s in ("if", "switch", "filter", "merge", "splitInBatches", "wait", "noOp"):
        return "logic"
    if s in ("code", "set", "function", "dateTime", "crypto", "removeDuplicates", "splitOut", "aggregate", "limit", "markdown"):
        return "data"
    if s in ("httpRequest", "respondToWebhook"):
        return "http"
    return "app"


def graph_of(d, nodes):
    """Simplified n8n canvas (positions + connections) for the spotlight renderer."""
    pos = {}
    out_nodes = []
    for n in nodes:
        p = n.get("position") or [0, 0]
        app = NICE.get(str(n["type"]).split(".")[-1], "")
        pos[n["name"]] = len(out_nodes)
        out_nodes.append([round(p[0]), round(p[1]), kind_of(str(n["type"])), n["name"][:22], app])
    edges = []
    for src, conns in (d.get("connections") or {}).items():
        if src not in pos:
            continue
        for ctype, groups in conns.items():
            for g in groups or []:
                for c in g or []:
                    tgt = c.get("node")
                    if tgt in pos:
                        edges.append([pos[src], pos[tgt], 0 if ctype == "main" else 1])
    return {"n": out_nodes, "e": edges}


curated = json.load(open(os.path.join(HERE, "curated.json"), encoding="utf-8"))
SEL = os.path.join(N8N, "n8n Selfmade Workflows")
LIB = os.path.join(N8N, "n8n-workflows-main", "workflows")
wfdir = os.path.join(P, "assets", "workflows")
for f in os.listdir(wfdir):
    os.remove(os.path.join(wfdir, f))
out, total_nodes = [], 0
for i, c in enumerate(curated):
    src = os.path.join(SEL if c["own"] else LIB, c["file"])
    raw = open(src, encoding="utf-8").read()
    d = json.loads(raw)
    if isinstance(d, list):
        d = d[0]
    nodes = [n for n in d["nodes"] if not str(n.get("type", "")).endswith("stickyNote")]
    types = [str(n["type"]).split(".")[-1] for n in nodes]
    tools = []
    for h, nm in URLHINT:
        if h in raw.lower() and nm not in tools:
            tools.append(nm)
    for t in types:
        nm = NICE.get(t)
        if nm and nm not in tools:
            tools.append(nm)
    agents = sum(1 for t in types if t == "agent")
    entry = dict(id=i + 1, title=c["title"], cat=c["cat"], desc=c["desc"], own=c["own"], nodes=len(nodes), agents=agents,
                 tools=tools[:6], featured=c.get("featured", False), credit=c.get("credit"), download=c.get("download", True))
    if entry["download"]:
        clean = scrub(d)
        clean["name"] = c["title"]
        for k in ("id", "versionId", "tags", "meta", "active", "shared"):
            clean.pop(k, None)
        txt = json.dumps(clean, ensure_ascii=False, indent=1)
        bad = re.findall(r"sk-[A-Za-z0-9]{16,}|Bearer [A-Za-z0-9._\-]{20,}|pit-[a-f0-9\-]{20,}|eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}\.", txt)
        if bad:
            raise SystemExit(f"SECRET LEFT in {c['file']}: {bad[:2]}")
        fname = f"{i + 1:03d}-{slug(c['title'])}.json"
        open(os.path.join(wfdir, fname), "w", encoding="utf-8").write(txt)
        entry["file"] = "assets/workflows/" + fname
    total_nodes += len(nodes)
    if entry["featured"]:
        entry["graph"] = graph_of(d, nodes)
    out.append(entry)

open(os.path.join(P, "assets", "data", "workflows.js"), "w", encoding="utf-8").write(
    "/* Generated by build_assets.py. Curated n8n workflow catalog. */\nwindow.WORKFLOWS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "workflows |", sum(1 for o in out if o["own"]), "own |", total_nodes, "nodes |", sum(1 for o in out if o.get("file")), "downloadable")
print(Counter(o["cat"] for o in out))
print([o["title"] for o in out if o["featured"]])
