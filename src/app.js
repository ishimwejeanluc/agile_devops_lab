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

// US-06: health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    totalUrls: storage.size(),
  });
});

// US-01 + US-04: shorten (now with optional customCode)
app.post('/shorten', (req, res) => {
  try {
    const { url, customCode } = req.body || {};
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

// US-05: per-code statistics
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

// US-02: redirect
app.get('/:code', (req, res) => {
  const r = shortener.resolve(req.params.code);
  if (!r) return res.status(404).json({ error: 'Short code not found' });
  return res.redirect(302, r.longUrl);
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
