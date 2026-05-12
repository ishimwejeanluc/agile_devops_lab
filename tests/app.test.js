const request = require('supertest');
const app = require('../src/app');
const storage = require('../src/storage');
const shortener = require('../src/shortener');

beforeEach(() => storage.clear());

describe('POST /shorten', () => {
  test('201 for valid URL', async () => {
    const r = await request(app).post('/shorten').send({ url: 'https://example.com' });
    expect(r.status).toBe(201);
    expect(r.body.shortCode).toHaveLength(7);
  });
  test('400 for invalid URL', async () => {
    const r = await request(app).post('/shorten').send({ url: 'nope' });
    expect(r.status).toBe(400);

    const original = shortener.shorten;
    try {
      shortener.shorten = () => { throw new Error('boom'); };
      const r2 = await request(app).post('/shorten').send({ url: 'https://example.com' });
      expect(r2.status).toBe(500);
      expect(r2.body.error).toBe('boom');
    } finally {
      shortener.shorten = original;
    }
  });
  test('400 for missing url field', async () => {
    const r = await request(app).post('/shorten').send({});
    expect(r.status).toBe(400);
  });
  test('accepts customCode', async () => {
    const r = await request(app).post('/shorten')
      .send({ url: 'https://example.com', customCode: 'gh-home' });
    expect(r.status).toBe(201);
    expect(r.body.shortCode).toBe('gh-home');
  });
  test('400 for invalid customCode format', async () => {
    const r = await request(app).post('/shorten')
      .send({ url: 'https://example.com', customCode: 'ab' });
    expect(r.status).toBe(400);
  });
  test('409 when custom code is taken', async () => {
    await request(app).post('/shorten').send({ url: 'https://a.com', customCode: 'taken' });
    const r = await request(app).post('/shorten').send({ url: 'https://b.com', customCode: 'taken' });
    expect(r.status).toBe(409);
  });
});

describe('GET /:code', () => {
  test('302 redirect to long URL', async () => {
    const c = await request(app).post('/shorten').send({ url: 'https://example.com' });
    const r = await request(app).get(`/${c.body.shortCode}`);
    expect(r.status).toBe(302);
    expect(r.headers.location).toBe('https://example.com');
  });
  test('404 for unknown code', async () => {
    expect((await request(app).get('/missing')).status).toBe(404);

    const r2 = await request(app).get('/no/such/path');
    expect(r2.status).toBe(404);
    expect(r2.body.error).toBe('Not found');
  });
});

describe('GET /stats/:code', () => {
  test('returns hits after redirects', async () => {
    const c = await request(app).post('/shorten').send({ url: 'https://example.com' });
    await request(app).get(`/${c.body.shortCode}`);
    await request(app).get(`/${c.body.shortCode}`);
    const r = await request(app).get(`/stats/${c.body.shortCode}`);
    expect(r.status).toBe(200);
    expect(r.body.hits).toBe(2);
  });
  test('404 for unknown code', async () => {
    expect((await request(app).get('/stats/missing')).status).toBe(404);
  });
});

describe('GET /health', () => {
  test('returns ok and basic metrics', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
    expect(r.body).toHaveProperty('uptimeSec');
    expect(r.body).toHaveProperty('totalUrls');
  });
  test('totalUrls reflects storage state', async () => {
    await request(app).post('/shorten').send({ url: 'https://a.com' });
    await request(app).post('/shorten').send({ url: 'https://b.com' });
    expect((await request(app).get('/health')).body.totalUrls).toBe(2);
  });
});
