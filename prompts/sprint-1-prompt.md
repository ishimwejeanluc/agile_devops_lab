# Sprint 1 — Coding Agent Prompt

> Paste this whole prompt into a coding agent (Cursor / Claude Code / Copilot
> Workspace / Cline / aider, etc.) to regenerate the Sprint 1 increment from
> scratch in an empty folder.

---

## Role

You are a senior Node.js engineer. You are delivering **Sprint 1** of a small
URL Shortener REST API as part of an Agile + DevOps capstone. Sprint 1 is the
**Must-have** slice only — keep scope tight, do not implement Sprint 2 features.

## Context

- Runtime: **Node.js 18+**
- Framework: **Express 4**
- Tests: **Jest + Supertest**
- CI: **GitHub Actions** (must run on every push and PR)
- Storage: **in-memory `Map`** for now (hide it behind a small interface so it
  can be swapped later). No database.

## Stories to deliver in Sprint 1

| ID    | Story (short)              | Acceptance criteria                                                                                                                                                                                              |
|-------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| US-01 | Shorten a URL              | `POST /shorten` with `{ "url": "<long>" }` returns 201 + JSON `{ shortCode, shortUrl, longUrl, createdAt }`. Short code is 7 chars, URL-safe (`A-Z a-z 0-9 _ -`). Missing `url` → 400.                            |
| US-02 | Redirect to original URL   | `GET /:code` returns **HTTP 302** with `Location: <longUrl>` for a known code. Unknown code → 404 with JSON body `{ "error": "Short code not found" }`.                                                          |
| US-03 | Reject invalid URLs        | `POST /shorten` returns **400** with `{ "error": "Invalid URL" }` for: non-strings, empty/whitespace strings, malformed URLs, and non-web schemes (`ftp://`, `javascript:`). http/https with paths/queries OK.   |

**Out of scope for Sprint 1** (do NOT add these — they belong to Sprint 2):
custom short codes, `/stats/:code`, `/health`, structured logging.

## Required file layout

```
.
├── package.json
├── .gitignore
├── README.md
├── .github/workflows/ci.yml
├── src/
│   ├── server.js          # entry point — boots Express on PORT env (default 3000)
│   ├── app.js             # Express app + routes (export only, don't listen)
│   ├── shortener.js       # business logic: isValidUrl, shorten, resolve
│   └── storage.js         # singleton class wrapping a Map; methods: save, get, exists, size, clear
└── tests/
    ├── shortener.test.js  # unit tests for shortener.js
    └── app.test.js        # integration tests using supertest against app.js
```

## Implementation rules

1. **Validation**: use the `valid-url` package (`validUrl.isWebUri`) to gate
   http/https only. Reject anything that is not a non-empty string.
2. **Short code generation**: use `nanoid` at length 7. If a generated code
   collides with one already in storage, regenerate (give up after 5 attempts
   and throw).
3. **Error pattern**: business logic throws `Error` objects with a
   `statusCode` property; the route handler reads it and responds with that
   status code + `{ error: err.message }`.
4. **Storage** module exports a singleton instance so tests can `storage.clear()`
   in `beforeEach`.
5. **Do not** call `app.listen()` from `app.js` — only from `server.js` — so
   Supertest can attach to the app directly.

## Tests to write (Jest)

Cover at minimum:
- `isValidUrl` accepts http and https; rejects empty string, `null`, `'not a url'`, and `ftp://...`.
- `shorten` returns a 7-char code; throws "Invalid URL" for bad inputs.
- `resolve` returns the saved record; returns `null` for unknown codes.
- `POST /shorten` → 201 on valid URL, 400 on invalid URL, 400 on missing body.
- `GET /:code` → 302 with correct `Location` header; 404 for unknown codes.

Aim for at least **10 tests** and **>80% statement coverage**.

## CI pipeline requirements (`.github/workflows/ci.yml`)

- Trigger on push to `main`/`develop` and on PRs to `main`.
- Run on Ubuntu, matrix `node-version: [18.x, 20.x]`.
- Steps: `actions/checkout@v4` → `actions/setup-node@v4` with npm cache →
  `npm ci` → `npm test` with `NODE_ENV=test`.

## Commit hygiene

Make **small, conventional commits** as you build (do not big-bang the whole
thing in one commit). Suggested order:

1. `chore: scaffold package.json, .gitignore, README skeleton`
2. `feat(storage): add in-memory storage module`
3. `feat(shortener): add URL validation`
4. `feat(shortener): generate short codes`
5. `feat(api): POST /shorten endpoint (US-01)`
6. `feat(api): GET /:code redirect endpoint (US-02)`
7. `feat(api): reject invalid URLs with 400 (US-03)`
8. `test: unit tests for shortener`
9. `test: integration tests for routes`
10. `ci: GitHub Actions workflow for tests on Node 18 + 20`
11. `docs: README with quickstart and demo`

## Definition of Done for each story

- All acceptance criteria pass via automated test.
- CI is green on the branch before merging.
- README's Quick-demo section still works against the running server.

## Deliverable

A runnable repo where:
- `npm install && npm test` passes locally and in CI.
- `npm start` boots an Express server that satisfies all three stories.
- The README shows working `curl` examples.

Begin now. Print the final file tree before you start, then create files one
at a time in the order from the commit list above.
