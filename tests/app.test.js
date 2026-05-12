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
