# URL Shortener — Agile & DevOps Capstone

This repository contains everything needed for the assessment, with a **single runnable codebase** (Sprint 2 = Sprint 1 + enhancements).

```
project/
├── .github/workflows/
│   └── main.yml                          ← CI pipeline (tests + build verification)
├── src/                                  ← Express app (Sprint 1 + Sprint 2)
├── tests/                                ← Jest + Supertest
├── documentation/
│   └── Agile-DevOps-Capstone-Report.pdf   ← All written deliverables in one PDF
├── prompts/
│   ├── sprint-1-prompt.md                 ← Paste into a coding agent for Sprint 1
│   └── sprint-2-prompt.md                 ← Paste into a coding agent for Sprint 2
└── README.md
```

## How to use it

### Option A — run the single codebase

```bash
npm install
npm test
npm start      
```

Quick demo:

```bash
# Sprint 1 behavior (auto-generated 7-char short codes)
curl -X POST http://localhost:3000/shorten \
	-H "Content-Type: application/json" \
	-d '{"url":"https://example.com"}'

# Sprint 2 behavior (custom codes)
curl -X POST http://localhost:3000/shorten \
	-H "Content-Type: application/json" \
	-d '{"url":"https://example.com","customCode":"my-link"}'

# Redirect + stats + health
curl -I http://localhost:3000/my-link
curl http://localhost:3000/stats/my-link
curl http://localhost:3000/health
```

### Option B — regenerate the code with a coding agent

Open Cursor / Claude Code / Copilot Workspace / aider in an empty folder and
paste `prompts/sprint-1-prompt.md`. After it finishes, paste
`prompts/sprint-2-prompt.md` to extend that code into the Sprint 2 increment.

The two prompts are written to be self-contained and explicit about acceptance
criteria, file layout, CI requirements, and commit order — so a competent
coding agent can rebuild the project from scratch.

### Option C — read the report

`documentation/Agile-DevOps-Capstone-Report.pdf` contains the product vision,
backlog, sprint plans, Definition of Done, sprint reviews, retrospectives,
and CI/CD + testing evidence.

## What goes into each sprint at a glance

| Sprint  | Stories                                        | New endpoints / capabilities             |
|---------|------------------------------------------------|------------------------------------------|
| Sprint 1| US-01, US-02, US-03                            | `POST /shorten`, `GET /:code`, validation|
| Sprint 2| US-04, US-05, US-06, US-07                     | custom codes, `/stats/:code`, `/health`, JSON logging |

## Endpoints implemented

- `POST /shorten` — `{ url, customCode? }` → 201 `{ shortCode, shortUrl, longUrl, createdAt }`
- `GET /:code` — 302 redirect (increments hit counter)
- `GET /stats/:code` — 200 `{ shortCode, longUrl, hits, createdAt }` (does not increment)
- `GET /health` — 200 `{ status: "ok", uptimeSec, timestamp, totalUrls }`
