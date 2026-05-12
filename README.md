# URL Shortener — Sprint 1

The first working slice of the URL Shortener REST API.

## Stories

- US-01: `POST /shorten` returns a short code for a long URL
- US-02: `GET /:code` redirects to the original URL
- US-03: rejects invalid URLs with HTTP 400

## Run

```bash
npm install
npm test       # runs Jest with coverage
npm start      # boots the API on http://localhost:3000
```

## Quick demo

```bash
curl -X POST http://localhost:3000/shorten \
	-H "Content-Type: application/json" \
	-d '{"url":"https://example.com"}'

curl -I http://localhost:3000/<shortCode>
```
