const express = require('express');
const shortener = require('./shortener');
const storage = require('./storage');
const logger = require('./logger');

const app = express();
app.use(express.json());

// US-07: structured request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
});

// US-01: shorten a URL
app.post('/shorten', (req, res) => {
  try {
    const { url, customCode } = req.body || {};

    if (typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const record = shortener.shorten(url, customCode);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return res.status(201).json({
      shortCode: record.shortCode,
      shortUrl: `${baseUrl}/${record.shortCode}`,
      longUrl: record.longUrl,
      createdAt: record.createdAt,
    });
  } catch (err) {
    logger.warn('shorten failed', { error: err.message });
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// US-06: health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    totalUrls: storage.size(),
  });
});

// US-05: per-code statistics (must not increment hits)
app.get('/stats/:code', (req, res) => {
  const r = shortener.stats(req.params.code);
  if (!r) return res.status(404).json({ error: 'Short code not found' });
  return res.json({
    shortCode: req.params.code,
    longUrl: r.longUrl,
    hits: r.hits,
    createdAt: r.createdAt,
  });
});

// US-02: redirect to original URL
app.get('/:code', (req, res) => {
  const r = shortener.resolve(req.params.code);
  if (!r) return res.status(404).json({ error: 'Short code not found' });
  return res.redirect(302, r.longUrl);
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
