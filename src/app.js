const express = require('express');
const shortener = require('./shortener');

const app = express();
app.use(express.json());

// US-01: shorten a URL
app.post('/shorten', (req, res) => {
  try {
    const { url } = req.body || {};

    if (typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const record = shortener.shorten(url);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return res.status(201).json({
      shortCode: record.shortCode,
      shortUrl: `${baseUrl}/${record.shortCode}`,
      longUrl: record.longUrl,
      createdAt: record.createdAt,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// US-02: redirect to original URL
app.get('/:code', (req, res) => {
  const r = shortener.resolve(req.params.code);
  if (!r) return res.status(404).json({ error: 'Short code not found' });
  return res.redirect(302, r.longUrl);
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
