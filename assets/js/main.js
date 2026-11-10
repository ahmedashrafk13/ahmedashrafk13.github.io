/* Ahmed Ashraf portfolio. Vanilla JS, no build step. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const EMAIL = "ahmedashrafk12@gmail.com";
  const GH = "https://github.com/ahmedashrafk13/";

  /* ---------------------------------------------------------
     EDIT HERE
     SOCIALS: your profiles (shown in the hero, contact and footer).
     FORM_ENDPOINT: FormSubmit delivers contact messages and download
     notifications to your inbox. The first submission sends you an
     activation email; click "Activate" once and it works from then on.
     --------------------------------------------------------- */
  const SOCIALS = [
    { name: "LinkedIn", icon: "linkedin.svg", href: "https://www.linkedin.com/in/ahmedashrafk12", label: "in/ahmedashrafk12" },
    { name: "GitHub", icon: "github-white.svg", href: "https://github.com/ahmedashrafk13", label: "ahmedashrafk13" },
    { name: "Email", icon: "gmail.svg", href: "mailto:" + EMAIL, label: EMAIL },
  ];
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/" + EMAIL;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { const o = $(".orb__lines"); if (o && o.pauseAnimations) o.pauseAnimations(); }

  /* ---------- socials ---------- */
  $$("[data-socials]").forEach((ul) => {
    const full = ul.hasAttribute("data-full");
    ul.innerHTML = SOCIALS.map((x) => `<li><a href="${x.href}"${x.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""} aria-label="${x.name}"${full ? "" : ` title="${x.name}"`}><img src="assets/img/logos/${x.icon}" alt="" width="22" height="22">${full ? `<span><b>${x.name}</b>${esc(x.label)}</span>` : ""}</a></li>`).join("");
  });

  /* ---------- menu ---------- */
  const menuBtn = $("#menuToggle"), menu = $("#mobileMenu");
  const setMenu = (open) => { menu.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.textContent = open ? "Close" : "Menu"; };
  menuBtn.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- active nav ---------- */
  const navLinks = $$(".nav__links a");
  const navObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + e.target.id)));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["about", "experience", "projects", "leadgen", "workflows", "skills"].forEach((id) => { const s = document.getElementById(id); if (s) navObs.observe(s); });

  /* ---------- platforms row ---------- */
  const LOGOS = [["n8n", "n8n"], ["make", "Make"], ["zapier", "Zapier"], ["claude", "Claude"], ["googlegemini", "Gemini"], ["supabase", "Supabase"], ["postgresql", "PostgreSQL"], ["airtable", "Airtable"], ["hubspot", "HubSpot"], ["whatsapp", "WhatsApp"], ["meta", "Meta"], ["elevenlabs-white", "ElevenLabs"], ["googlesheets", "Google Sheets"], ["python", "Python"], ["nodedotjs", "Node.js"]];
  $("#platforms").innerHTML = LOGOS.map(([f, n]) => `<span class="platform"><img src="assets/img/logos/${f}.svg" alt="" width="22" height="22" loading="lazy">${n}</span>`).join("");

  /* ---------- modal ---------- */
  const modal = $("#modal"), modalBody = $("#modalBody");
  let lastFocus = null;
  const openModal = (html, cls) => {
    lastFocus = document.activeElement;
    modal.className = "modal" + (cls ? " " + cls : "");
    modalBody.innerHTML = html;
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    const c = $("[data-close]", modal); if (c) c.focus();
  };
  const closeModal = () => { $$("video, audio", modal).forEach((m) => m.pause()); if (typeof modal.close === "function") modal.close(); else modal.removeAttribute("open"); };
  modal.addEventListener("close", () => { modalBody.innerHTML = ""; if (lastFocus) lastFocus.focus(); });
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-close]")) closeModal(); });
  const openImage = (src, caption) => openModal(`<figure style="margin:0"><img src="${src}" alt="${esc(caption || "")}"><figcaption id="modalTitle">${esc(caption || "")}</figcaption></figure>`, "modal--image");
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-lightbox]"); if (t) openImage(t.dataset.lightbox, t.dataset.caption); });

  /* =========================================================
     LEAD GENERATION
     ========================================================= */
  const LEADGEN = [
    { id: "maps", tab: "Google Maps", img: "assets/img/leads/no-website-leads.webp", title: "No-Website Lead Finder",
      desc: "Sweeps Google Maps and the Amex merchant map across 192 US cities and 120 niches, finds businesses with no real website and scores them for web-design outreach.",
      nums: [["19,813", "leads in one run"], ["40/min", "Maps businesses"], ["1,300/min", "Amex merchants"]],
      how: ["Playwright extraction from Maps listings", "Website classifier: none, social-only or builder page", "A, B and C scoring by reviews, rating and niche value", "De-duplication and export to CSV and Google Sheets"], stack: "Python, Playwright, SQLite, Google Sheets" },
    { id: "linkedin", tab: "LinkedIn", img: "assets/img/leads/linkedin-leads.webp", title: "LinkedIn Buyer-Intent Scraper",
      desc: "Finds founders and companies posting that they need a website or redesign, reads each profile's contact details and exports a de-duplicated lead sheet.",
      nums: [["32", "buyers in one run"], ["120", "posts per query cap"], ["Yes/No", "decision-maker flag"]],
      how: ["Real Chrome session with human pacing and scroll limits", "Buyer or seller intent rules on every post", "Contact-info extraction from each profile", "Every rejected post logged with a reason"], stack: "Python, Playwright, Google Sheets" },
    { id: "facebook", tab: "Facebook Groups", img: "assets/img/leads/facebook-leads.webp", title: "Facebook Group Lead Scraper",
      desc: "Monitors groups and search results for business owners asking for web help. Three extraction methods run together so posts are not missed.",
      nums: [["3", "extraction methods"], ["Groups", "and search coverage"], ["Buyer", "intent filter"]],
      how: ["Bootstrap JSON, GraphQL and page extraction merged", "Keyword and intent matching on every post", "Profile and post links captured for outreach", "Session based, no API keys needed"], stack: "Python, Pyppeteer, GraphQL" },
    { id: "threads", tab: "Threads", img: "assets/img/leads/threads-leads.webp", title: "Threads Lead Scraper",
      desc: "Captures Threads posts with web-design buying intent, then a rules engine scores each lead and records why it qualified.",
      nums: [["287", "posts scraped"], ["45", "leads qualified"], ["131", "junk posts removed"]],
      how: ["Stealth browser with GraphQL response capture", "Lead score with plain-language reasons", "Likes and replies kept as engagement signals", "Unit tests on the qualification filter"], stack: "Python, patchright, pytest" },
    { id: "meta", tab: "Meta Ad Library", img: "assets/img/leads/meta-ad-leads.webp", title: "Meta Ad Library Advertiser Finder",
      desc: "Finds businesses actively spending on ads in a niche, keeps only real service advertisers and ranks them by how long their ads run. Claude then writes the creative brief.",
      nums: [["1,180", "ads scored"], ["43", "advertiser leads"], ["17", "ad concepts written"]],
      how: ["GraphQL capture on the Ad Library", "Service-ad scoring removes about 85% of results", "Ad creatives downloaded and read with Cloud Vision", "Two Claude agents: per-ad review, then a combined brief"], stack: "Python, Playwright, n8n, Claude, Google Cloud Vision" },
    { id: "amex", tab: "Market Map", img: "assets/img/leads/automotive-leads.webp", title: "Automotive Market Map",
      desc: "Sweeps a coordinate grid over the Amex merchant map to list every automotive business in a market, then ranks each one against the client's ideal customer profile.",
      nums: [["5,344", "merchants mapped"], ["3,213", "priority leads"], ["100", "merchants per request"]],
      how: ["Coordinate-grid sweep with de-duplication", "Category taxonomy mapped to client segments", "Website presence and liveness check", "Fit score from 0 to 100 for each merchant"], stack: "Python, Playwright, Google Sheets" },
  ];
  const lgTabs = $("#lgTabs"), lgPanel = $("#lgPanel");
  lgTabs.innerHTML = LEADGEN.map((l, i) => `<button class="tab" role="tab" type="button" id="lgtab-${l.id}" aria-controls="lgPanel" aria-selected="${i === 0}" data-lg="${l.id}">${esc(l.tab)}</button>`).join("");
  const showLG = (id) => {
    const l = LEADGEN.find((x) => x.id === id) || LEADGEN[0];
    $$(".tab", lgTabs).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.lg === l.id)));
    lgPanel.setAttribute("aria-labelledby", "lgtab-" + l.id);
    lgPanel.innerHTML = `
      <button class="lg__shot" type="button" data-lightbox="${l.img}" data-caption="${esc(l.title)}. Real output, personal details masked." aria-label="Enlarge the ${esc(l.title)} lead sheet"><img src="${l.img}" alt="Lead sheet produced by the ${esc(l.title)}"></button>
      <div class="lg__info">
        <h3>${esc(l.title)}</h3>
        <p>${esc(l.desc)}</p>
        <dl class="lg__nums">${l.nums.map(([b, s]) => `<div><dt>${esc(s)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>
        <ul class="bullets">${l.how.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        <p class="stackline">${esc(l.stack)}</p>
      </div>`;
  };
  lgTabs.addEventListener("click", (e) => { const b = e.target.closest("[data-lg]"); if (b) showLG(b.dataset.lg); });
  lgTabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tabs = $$(".tab", lgTabs), i = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); showLG(n.dataset.lg);
  });
  showLG("maps");

  /* =========================================================
     PROJECTS
     ========================================================= */
  const PROJECTS = [
    { id: "rag", cat: "AI agents and RAG", title: "Agentic RAG Knowledge Assistant", img: "assets/media/agentic-rag-poster.jpg", video: "assets/media/agentic-rag.mp4",
      summary: "Replaces static documentation with an agent that answers from PDFs, spreadsheets and cloud files, choosing between vector search and SQL by itself.",
      metrics: [["768-d", "vector index"], ["3", "retrieval tools"], ["Per user", "chat memory"]],
      problem: "Teams searched PDFs, sheets and Drive folders to answer the same questions every week.",
      build: ["n8n agent with tools for semantic search, full-document lookup and SQL over spreadsheet rows", "Supabase pgvector with metadata, row, document and chat-history tables", "768-dimension embeddings with a cosine index", "Session memory in Postgres so follow-up questions keep context"],
      outcome: "Answers in seconds, grounded in the team's own files.", stack: "n8n, Supabase, pgvector, Postgres, OpenAI" },
    { id: "seo", cat: "Marketing automation", title: "AI SEO Operations Platform", img: "assets/img/work/seo-suite-dashboard.webp", repo: "seo-suite-hostinger",
      summary: "One command centre for an agency's SEO: Search Console, GA4 and PageSpeed sync, audits, 49 alert types and approval-gated tasks.",
      metrics: [["49", "alert types"], ["22", "test harnesses"], ["61", "pages covered"]],
      problem: "Agency SEO lived in five tools and a spreadsheet. Drops were noticed days late and fixes had no owner.",
      build: ["Scheduled Search Console, GA4 and PageSpeed sync per brand", "Technical and internal-link audits whose failing checks become tasks behind an approval step", "AI-search readiness checks for ChatGPT, Perplexity and Gemini: crawler access, llms.txt, citations and schema", "Branded PDF and email reports, plus Slack and webhook alerts"],
      outcome: "Every issue has an owner, a severity and a sign-off record.", gallery: ["assets/img/work/seo-suite-dashboard.webp", "assets/img/work/seo-suite-audit.webp"],
      note: "Screenshots use demo data, not client data.", stack: "Node.js, Express, SQLite, Azure OpenAI, Google APIs" },
    { id: "trading", cat: "Autonomous agents", title: "Autonomous Claude Trading Agent", img: "assets/img/work/trading-agent-dashboard.webp", repo: "trading-bot",
      summary: "Claude Code routines research, size and place trades every 6 hours through code-enforced risk limits, then write a journal. Runs on a demo account.",
      metrics: [["23/23", "positions with stops"], ["5x", "leverage limit"], ["1.25", "out-of-sample Sharpe"]],
      problem: "Can an LLM agent run a strategy end to end without ever being trusted with unlimited risk?",
      build: ["Scheduled routines that read memory, research news, plan, approve and execute", "Hard checks block any order without a stop, above 5x leverage or over budget", "Walk-forward out-of-sample Sharpe of 1.25 at 20% volatility", "A validation harness rejected five weaker strategies before launch"],
      outcome: "Runs unattended with every position protected. Demo account with a $200 budget.", gallery: ["assets/img/work/trading-agent-dashboard.webp", "assets/img/work/quant-verdict-sheet.webp"],
      stack: "Claude Code, Python, Bybit API, Perplexity" },
    { id: "tas", cat: "Lead generation", title: "Verified B2B Lead Engine", img: "assets/img/work/n8n-apollo-enricher.webp", pos: "center",
      summary: "Showed that a client's purchased list was only 20.6% valid, then rebuilt it as a verified pipeline with hiring, funding and anniversary signals.",
      metrics: [["20.6%", "valid in bought list"], ["$0.001", "cost per lead"], ["330+", "leads per week"]],
      problem: "The client's purchased list looked large, but most contacts would have bounced.",
      build: ["Apify actors for decision-makers and companies with LinkedIn hiring signals", "n8n Apollo enrichment with rate-limit waits, ranking and a verified-email check", "Email verification and de-duplication against every existing tab", "One sheet tab per source so the client can see what each channel produces"],
      outcome: "A clean, verified workbook and a pipeline that keeps it filled.", gallery: ["assets/img/work/n8n-apollo-enricher.webp"], stack: "n8n, Apollo.io, Apify, Python, Google Sheets" },
    { id: "sms", cat: "Sales automation", title: "AI SMS Outreach Engine", img: "assets/img/work/sms-outreach-extension.webp", fit: true, repo: "gv-sheet-automation",
      summary: "Turns a spreadsheet into hundreds of personalised text conversations a day. AI rewrites every message while sending hours, daily caps and a do-not-text list keep outreach compliant.",
      metrics: [["121", "automated tests"], ["7", "AI providers"], ["8am to 9pm", "sending window"]],
      problem: "Reps copied and pasted texts one by one with no record of who had already been contacted.",
      build: ["Chrome extension side panel that drives Google Voice", "Optional AI rewrite per contact with Gemini, Groq, OpenRouter, OpenAI, Claude, Mistral or DeepSeek", "Sending hours, daily limits, a do-not-text list and a never-text-twice history", "Human-like typing with randomised delays of at least 45 seconds"],
      outcome: "Personal outreach at volume, with full history and opt-outs respected.", gallery: ["assets/img/work/sms-outreach-extension.webp"], stack: "JavaScript, Chrome extension, LLM APIs, Playwright tests" },
    { id: "ads", cat: "AI agents", title: "AI Ad Creative Intelligence Agent", img: "assets/img/work/ad-creative-agent.webp",
      summary: "Two Claude agents study the longest-running competitor ads in a niche, then write a complete creative brief: market patterns, hooks, copy, visual direction and a test plan.",
      metrics: [["12", "ads analysed per brief"], ["2", "Claude agents"], ["43", "fields per concept"]],
      problem: "Agencies guessed at ad creative, or spent a day manually studying competitors before every campaign.",
      build: ["Meta Ad Library scraper keeps only real service ads and ranks them by how long they have run", "n8n pipeline sends every creative to Google Cloud Vision to read text, objects and layout", "A Claude teardown agent analyses each ad; a second Claude agent writes the market readout and concepts", "Each concept ships with hook variants, primary text, headline, CTA, colour palette, image prompt and compliance flags"],
      outcome: "A ready-to-test creative brief in one run instead of a day of research.", gallery: ["assets/img/work/ad-creative-agent.webp"],
      note: "Client name removed from the brief.", stack: "Python, Playwright, n8n, Claude, Google Cloud Vision" },
  ];
  const repoLink = (p) => (p.repo ? `<a href="${GH + p.repo}" target="_blank" rel="noopener">View on GitHub</a>` : "");
  $("#projectGrid").innerHTML = PROJECTS.map((p) => `<article class="proj">
      <button class="proj__img${p.fit ? " proj__img--fit" : ""}" type="button" data-case="${p.id}" aria-label="Open the ${esc(p.title)} case study"><img src="${p.img}" alt="" loading="lazy"${p.pos ? ` style="object-position:${p.pos}"` : ""}></button>
      <p class="proj__cat">${esc(p.cat)}</p>
      <h3>${esc(p.title)}</h3>
      <p class="proj__sum">${esc(p.summary)}</p>
      <div class="proj__metrics">${p.metrics.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
      <p class="proj__links"><button type="button" data-case="${p.id}">${p.video ? "Watch demo and case study" : "Read case study"}</button>${repoLink(p)}</p>
    </article>`).join("");

  const caseHTML = (p) => {
    let media = "";
    if (p.video) media = `<div class="cs__media"><video controls preload="metadata" poster="${p.img}"><source src="${p.video}" type="video/mp4"></video></div>`;
    else if (p.gallery) media = `<div class="cs__media">${p.gallery.map((g) => `<img src="${g}" alt="" loading="lazy">`).join("")}</div>`;
    return `<article class="cs">
      <p class="cs__cat">${esc(p.cat)}</p>
      <h2 id="modalTitle">${esc(p.title)}</h2>
      <p class="cs__lede">${esc(p.summary)}</p>
      <div class="cs__stats">${p.metrics.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div>
      <div class="cs__grid">
        <div><h3>Problem</h3><p>${esc(p.problem)}</p></div>
        <div><h3>Result</h3><p>${esc(p.outcome)}</p></div>
        <div class="cs__full"><h3>What I built</h3><ul class="bullets">${p.build.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>
      </div>
      ${media}
      <div class="cs__foot"><span>${esc(p.stack)}</span>${repoLink(p)}</div>
      ${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}
    </article>`;
  };
  const openCase = (id) => { const p = PROJECTS.find((x) => x.id === id); if (p) openModal(caseHTML(p)); };
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-case]"); if (c) { openCase(c.dataset.case); return; }
    const o = e.target.closest("[data-open-case]"); if (o) { e.preventDefault(); openCase(o.dataset.openCase); }
  });

  /* =========================================================
     WORKFLOW LIBRARY (compact list, email-gated instant download)
     ========================================================= */
  const WF = Array.isArray(window.WORKFLOWS) ? window.WORKFLOWS : [];
  const PAGE = 8;
  const CATS = ["All"].concat(Array.from(new Set(WF.map((w) => w.cat))).sort());
  const state = { q: "", cat: "All", sort: "complex", limit: PAGE };
  const catsEl = $("#vaultCats"), rows = $("#vaultRows"), countEl = $("#vaultCount"), moreBtn = $("#vaultMore");
  catsEl.innerHTML = CATS.map((c) => `<button class="tab" type="button" data-cat="${esc(c)}" aria-pressed="${c === "All"}">${esc(c)}<small>${c === "All" ? WF.length : WF.filter((w) => w.cat === c).length}</small></button>`).join("");
  const rank = (w) => w.nodes + w.agents * 6;
  const matches = (w) => {
    if (state.cat !== "All" && w.cat !== state.cat) return false;
    if (!state.q) return true;
    const hay = (w.title + " " + w.desc + " " + w.cat + " " + w.tools.join(" ")).toLowerCase();
    return state.q.split(/\s+/).every((t) => hay.includes(t));
  };
  function reset() { state.q = ""; state.cat = "All"; state.limit = PAGE; $("#vaultSearch").value = ""; $$(".tab", catsEl).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === "All"))); render(); }
  function render() {
    const list = WF.filter(matches).sort(state.sort === "name" ? (a, b) => a.title.localeCompare(b.title) : (a, b) => rank(b) - rank(a));
    const shown = list.slice(0, state.limit);
    countEl.textContent = list.length ? `Showing ${shown.length} of ${list.length}` : "";
    if (!list.length) {
      rows.innerHTML = `<div class="empty"><p>No workflow matches “${esc(state.q)}” in this category.</p><button class="btn btn--line btn--sm" type="button" id="vaultReset">Clear search and filters</button></div>`;
      $("#vaultReset").addEventListener("click", reset);
    } else {
      rows.innerHTML = shown.map((w) => `<div class="row" role="row">
        <div role="cell"><h4>${esc(w.title)}</h4><p>${esc(w.desc)}</p></div>
        <span class="row__cat" role="cell">${esc(w.cat)}</span>
        <span class="row__nodes" role="cell">${w.nodes} nodes</span>
        <span class="row__tools" role="cell">${esc(w.tools.slice(0, 3).join(", "))}</span>
        <span role="cell"><button class="dl" type="button" data-wf="${w.id}">Download</button></span>
      </div>`).join("");
    }
    moreBtn.hidden = list.length <= state.limit;
  }
  let qT;
  $("#vaultSearch").addEventListener("input", (e) => { clearTimeout(qT); qT = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); state.limit = PAGE; render(); }, 120); });
  catsEl.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (!b) return; state.cat = b.dataset.cat; state.limit = PAGE; $$(".tab", catsEl).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(); });
  $("#vaultSort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  moreBtn.addEventListener("click", () => { state.limit += PAGE; render(); });
  if (WF.length) render(); else rows.innerHTML = '<div class="empty"><p>The workflow list failed to load. Refresh the page to try again.</p></div>';

  /* send a submission to FormSubmit; resolves true on success */
  const sendForm = (data) => fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(Object.assign({ _template: "table", _captcha: "false" }, data)) })
    .then((r) => r.json().then((j) => r.ok && String(j.success) !== "false")).catch(() => false);
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };
  const startDownload = (w) => { const a = document.createElement("a"); a.href = w.file; a.download = w.file.split("/").pop(); document.body.appendChild(a); a.click(); a.remove(); };
  const notifyDownload = (w, name, email) => sendForm({ _subject: "Workflow downloaded: " + w.title, name, email, workflow: w.title, page: location.href });

  rows.addEventListener("click", (e) => {
    const b = e.target.closest("[data-wf]"); if (!b) return;
    const w = WF.find((x) => String(x.id) === b.dataset.wf); if (!w || !w.file) return;
    const saved = store.get("wf_email");
    if (saved) { startDownload(w); notifyDownload(w, store.get("wf_name") || "", saved); toast("Download started"); return; }
    openModal(`<form class="gate" id="gateForm" novalidate>
        <p class="cs__cat">Free download</p>
        <h2 id="modalTitle">${esc(w.title)}</h2>
        <p class="cs__lede">Enter your email and the workflow downloads instantly. I will only use it to follow up if you want help setting it up.</p>
        <div class="field"><label for="gName">Name</label><input id="gName" type="text" autocomplete="name"></div>
        <div class="field"><label for="gEmail">Email</label><input id="gEmail" type="email" autocomplete="email" required><p class="field__err" aria-live="polite"></p></div>
        <button class="btn btn--primary" type="submit">Download workflow</button>
      </form>`);
    $("#gateForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const email = $("#gEmail").value.trim(), name = $("#gName").value.trim(), field = $("#gEmail").closest(".field");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { field.classList.add("has-error"); $(".field__err", field).textContent = "Please enter a valid email address."; $("#gEmail").focus(); return; }
      store.set("wf_email", email); store.set("wf_name", name);
      startDownload(w); notifyDownload(w, name, email);
      closeModal(); toast("Download started");
    });
  });

  /* ---------- audio ---------- */
  const fmt = (s) => (isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00");
  const players = $$("[data-player]");
  players.forEach((p) => {
    const audio = $("audio", p), btn = $(".track__play", p), seek = $(".track__seek", p), time = $(".track__time", p);
    const label = btn.getAttribute("aria-label");
    const paint = () => { if (audio.duration) { seek.value = (audio.currentTime / audio.duration) * 100; time.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration); } };
    btn.addEventListener("click", () => {
      if (audio.paused) { players.forEach((o) => { if (o !== p) $("audio", o).pause(); }); audio.play().catch(() => toast("The browser blocked playback. Try again.")); }
      else audio.pause();
    });
    audio.addEventListener("play", () => { p.classList.add("is-playing"); btn.textContent = "Pause"; btn.setAttribute("aria-label", label.replace("Play", "Pause")); });
    audio.addEventListener("pause", () => { p.classList.remove("is-playing"); btn.textContent = "Play"; btn.setAttribute("aria-label", label); });
    audio.addEventListener("timeupdate", paint); audio.addEventListener("loadedmetadata", paint);
    audio.addEventListener("error", () => { time.textContent = "Unavailable"; });
    seek.addEventListener("input", () => { if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration; });
  });

  /* ---------- toast ---------- */
  const toastEl = $("#toast"); let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2400); }

  /* ---------- contact form ---------- */
  const form = $("#contactForm"), statusEl = $("#cfStatus"), submitBtn = $("#cfSubmit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.querySelector('[name="_honey"]').value) return;
    let ok = true;
    const check = (id, test, msg) => {
      const input = $("#" + id), field = input.closest(".field"), err = $(".field__err", field), bad = !test(input.value.trim());
      field.classList.toggle("has-error", bad); err.textContent = bad ? msg : ""; input.setAttribute("aria-invalid", String(bad));
      if (bad && ok) { input.focus(); ok = false; }
    };
    check("cfName", (v) => v.length > 1, "Please add your name.");
    check("cfEmail", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Please enter a valid email address.");
    check("cfMsg", (v) => v.length > 9, "Please describe the process in a sentence or two.");
    if (!ok) return;
    const f = (id) => $("#" + id).value.trim();
    submitBtn.disabled = true; submitBtn.textContent = "Sending..."; statusEl.className = "form__status"; statusEl.textContent = "";
    const sent = await sendForm({ _subject: "New enquiry from " + f("cfName") + (f("cfCompany") ? " (" + f("cfCompany") + ")" : ""), _replyto: f("cfEmail"), name: f("cfName"), email: f("cfEmail"), company: f("cfCompany") || "-", message: f("cfMsg") });
    submitBtn.disabled = false; submitBtn.textContent = "Send message";
    if (sent) { form.reset(); statusEl.className = "form__status is-ok"; statusEl.textContent = "Thanks, your message is in my inbox. I will get back to you shortly."; }
    else {
      const body = encodeURIComponent(`${f("cfMsg")}\n\n${f("cfName")}${f("cfCompany") ? ", " + f("cfCompany") : ""}\n${f("cfEmail")}`);
      statusEl.className = "form__status is-err";
      statusEl.innerHTML = `The message could not be sent from here. <a href="mailto:${EMAIL}?subject=${encodeURIComponent("Automation project")}&body=${body}">Send it by email instead</a>.`;
    }
  });
})();
