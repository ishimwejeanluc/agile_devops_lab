const request = require('supertest');
const app = require('../src/app');
const storage = require('../src/storage');

beforeEach(() => storage.clear());

describe('POST /shorten', () => {
  test('201 for valid URL', async () => {
    const r = await request(app).post('/shorten').send({ url: 'https://example.com' });
    expect(r.status).toBe(201);
    expect(r.body.shortCode).toHaveLength(7);
    expect(r.body.longUrl).toBe('https://example.com');
  });

  test('400 for invalid URL', async () => {
    const r = await request(app).post('/shorten').send({ url: 'nope' });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('Invalid URL');
  });

  test('accepts customCode', async () => {
    const r = await request(app)
      .post('/shorten')
      .send({ url: 'https://example.com', customCode: 'gh-home' });
    expect(r.status).toBe(201);
    expect(r.body.shortCode).toBe('gh-home');
  });

  test('409 when custom code is taken', async () => {
    await request(app).post('/shorten').send({ url: 'https://a.com', customCode: 'taken' });
    const r = await request(app).post('/shorten').send({ url: 'https://b.com', customCode: 'taken' });
    expect(r.status).toBe(409);
  });
});

describe('GET /:code', () => {
  test('302 redirect to long URL', async () => {
    const created = await request(app).post('/shorten').send({ url: 'https://example.com' });
    const r = await request(app).get(`/${created.body.shortCode}`);
    expect(r.status).toBe(302);
    expect(r.headers.location).toBe('https://example.com');
  });

  test('404 for unknown code', async () => {
    const r = await request(app).get('/missing');
    expect(r.status).toBe(404);
    expect(r.body.error).toBe('Short code not found');
  });
});

describe('GET /stats/:code', () => {
  test('returns hits after redirects', async () => {
    const created = await request(app).post('/shorten').send({ url: 'https://example.com' });
    const code = created.body.shortCode;
    await request(app).get(`/${code}`);
    await request(app).get(`/${code}`);
    const r = await request(app).get(`/stats/${code}`);
    expect(r.status).toBe(200);
    expect(r.body.hits).toBe(2);
  });

  test('404 for unknown code', async () => {
    const r = await request(app).get('/stats/missing');
    expect(r.status).toBe(404);
  });
});
