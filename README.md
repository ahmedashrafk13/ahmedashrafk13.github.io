# Ahmed Ashraf portfolio

Static site (HTML, CSS, vanilla JS). No build step.

## Preview

```bash
python -m http.server 8000   # then open http://localhost:8000
```

Downloads need http, not `file://`.

## Deploy

- Netlify: drag this folder onto app.netlify.com/drop
- GitHub Pages: push the folder, then Settings > Pages > deploy from branch (root)

## Where to edit

| What | Where |
|---|---|
| Hero, about, experience, skills, contact | `index.html` |
| Headline numbers under the hero | `<dl class="kpis">` in `index.html` |
| Social links (hero, contact, footer) | `SOCIALS` at the top of `assets/js/main.js` |
| Lead generation tabs | `LEADGEN` in `assets/js/main.js` |
| Project cards and case studies | `PROJECTS` and `OSS` in `assets/js/main.js` |
| Workflow catalog | `tools/curated.json`, then run `python tools/build_assets.py` |
| Lead sheet screenshots | `tools/render_sheets.py` (masks personal names, emails and phones) |

## Contact form and downloads

The contact form and the workflow downloads post to FormSubmit (`FORM_ENDPOINT` in `assets/js/main.js`), which emails every submission to ahmedashrafk12@gmail.com.

- After the site is live, send one test message. FormSubmit emails you an "Activate Form" link. Click it once and every later message arrives in your inbox.
- Each workflow download asks for an email once, downloads instantly, and emails you who downloaded what.
- If FormSubmit is unreachable, the form offers a pre-filled email instead, so no message is lost.

The build strips credentials from every workflow and stops if a key is left.
