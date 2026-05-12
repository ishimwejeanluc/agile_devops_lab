# Sprint 2 — Coding Agent Prompt

> Paste this prompt into a coding agent **after Sprint 1 is complete and
> merged**. It extends the Sprint 1 codebase — do not delete or rewrite the
> Sprint 1 code; build on top of it.

---

## Role

You are a senior Node.js engineer. You are delivering **Sprint 2** of the URL
Shortener REST API. This sprint focuses on **operability** (health, logging)
and **user value** (custom codes, click stats). The Sprint 1 code (Express
app with `POST /shorten`, `GET /:code`, in-memory storage, Jest tests, and a
GitHub Actions CI workflow) already exists in the repo.

## Context — what is already there

```
.
├── package.json
├── .github/workflows/ci.yml
├── src/
│   ├── server.js
│   ├── app.js
│   ├── shortener.js
│   └── storage.js
└── tests/
    ├── shortener.test.js
    └── app.test.js
```

`storage.js` currently exposes `save / get / exists / size / clear`.
`shortener.js` exposes `isValidUrl / shorten / resolve`.

## Stories to deliver in Sprint 2

| ID    | Story (short)               | Acceptance criteria                                                                                                                                                                                            |
|-------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| US-04 | Custom short codes          | `POST /shorten` accepts optional `customCode`. Valid: 3–20 chars, `[A-Za-z0-9_-]`. Invalid format → **400**. Already taken → **409**. No `customCode` → behaviour unchanged from Sprint 1.                      |
| US-05 | Click stats per short code  | Each successful `GET /:code` increments a hit counter. `GET /stats/:code` returns `{ shortCode, longUrl, hits, createdAt }`. `GET /stats/:code` itself must **not** increment the counter. Unknown code → 404. |
| US-06 | Health endpoint             | `GET /health` returns 200 with `{ status: "ok", uptimeSec, timestamp, totalUrls }`. Always 200 for a healthy process. Should complete in under 20 ms.                                                          |
| US-07 | Structured request logging  | Every completed HTTP request emits one JSON line containing `ts, level, message, method, path, status, durationMs`. Silent in `NODE_ENV=test`. Honour a `LOG_LEVEL` env var (`debug / info / warn / error`).   |

## Process improvements from Sprint 1 retrospective (apply these!)

The Sprint 1 retro identified two specific improvements:

1. **Add a build-verification job to CI.** After the `test` job, run a second
   job that does `npm ci --omit=dev`, starts the server, and `curl --fail`s
   `/health`. This catches regressions that pure unit tests miss.
2. **Hide stdout in tests.** The new logger must not pollute test output.
   Gate emission on `process.env.NODE_ENV !== 'test'`.

These improvements are non-negotiable — they are part of the sprint scope.

## Implementation rules

1. **Storage**: add a `hits` field (initialised to 0) to every saved record,
   and add an `incrementHits(code)` method. Do not change the existing public
   contract.
2. **Custom code validation**: regex `^[a-zA-Z0-9_-]{3,20}$`. Throw `Error`
   with `statusCode = 400` for invalid format and `409` for collisions.
3. **New file `src/logger.js`**: implement the structured logger described
   above. Export `debug / info / warn / error`, each accepting `(message, meta)`.
   Use `console.log(JSON.stringify(...))` so logs are JSON-lines.
4. **Route order matters in Express**: `/health` and `/stats/:code` must be
   registered **before** the catch-all `/:code` redirect, otherwise the
   redirect handler will swallow them.
5. **Request-logging middleware** must use `res.on('finish')` so the status
   code and duration are correct.

## New tests to add

In `tests/shortener.test.js`:
- Custom code is accepted when valid.
- Invalid custom codes (too short, bad chars) throw with statusCode 400.
- Duplicate custom code throws with statusCode 409.
- `resolve` increments hits; `stats` does not.

In `tests/app.test.js`:
- `POST /shorten` with `customCode` returns 201 and uses that code.
- Reusing a custom code returns 409.
- `GET /stats/:code` returns the correct hit count after N redirects.
- `GET /stats/:code` for an unknown code returns 404.
- `GET /health` returns 200 with `status: "ok"` and shows `totalUrls`.

(Optional but recommended) Add `tests/logger.test.js` with at least:
- Logger is silent in `NODE_ENV=test`.
- Logger emits valid JSON with the expected fields when `NODE_ENV=development`.
- `LOG_LEVEL=warn` filters out debug and info messages.

## CI changes

Edit `.github/workflows/ci.yml` to add a second job:

```yaml
build:
  name: Build verification
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    - run: npm ci --omit=dev
    - name: Smoke test /health
      run: |
        node src/server.js &
        PID=$!
        sleep 2
        curl --fail http://localhost:3000/health
        kill $PID
```

Also add a coverage-artifact upload step to the test job (only on Node 20.x).

## Commit hygiene

Again, small conventional commits — suggested order:

1. `feat(storage): add hit counter to records`
2. `feat(shortener): support optional custom codes`
3. `feat(api): accept customCode on POST /shorten (US-04)`
4. `feat(api): GET /stats/:code endpoint (US-05)`
5. `feat(api): GET /health endpoint (US-06)`
6. `feat(logger): JSON-lines structured logger`
7. `feat(api): request-logging middleware (US-07)`
8. `test: cover custom codes and stats`
9. `test: cover /health endpoint`
10. `test: cover logger behaviour and LOG_LEVEL filtering`
11. `ci: add build-verification job (smoke test /health)`
12. `ci: upload coverage report as artifact`
13. `docs: update README with new endpoints`

## Definition of Done (carried over from Sprint 1)

- All acceptance criteria pass via automated test.
- CI is green: both `test` (matrix) and `build` jobs.
- Overall statement coverage ≥ 80%.
- README reflects the new endpoints with `curl` examples.
- No new endpoint silently breaks an existing one (route order check).

## Deliverable

A repo where:
- `npm test` passes with the original Sprint 1 tests **plus** the new ones.
- `npm start` boots the API with all seven endpoints/middleware wired up.
- `curl http://localhost:3000/health` returns JSON with `status: "ok"`.
- `curl -X POST .../shorten -d '{"url":"https://example.com","customCode":"my-link"}'`
  works and is rejected with 409 on the second attempt.
- A live request produces a JSON log line on stdout like:
  `{"ts":"…","level":"info","message":"request","method":"POST","path":"/shorten","status":201,"durationMs":3}`

Begin now. Open the existing repo, list the current files, then apply the
commits in the order above.
